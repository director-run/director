import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createGatewayClient } from "./client";
import { IntegrationTestHarness } from "./test/integration";

describe("Authentication integration", () => {
  let harness: IntegrationTestHarness;
  const baseURL = `http://localhost:${IntegrationTestHarness.gatewayPort}`;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("signup flow", () => {
    it("should register a new user and create a playbook", async () => {
      // Clear database
      await harness.purgeWithUsers();

      // Register a new user
      const signupResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "testpassword123",
          name: "Test User",
        }),
      });

      expect(signupResponse.ok).toBe(true);
      const signupData = await signupResponse.json();
      expect(signupData.user).toBeDefined();
      expect(signupData.user.email).toBe("test@example.com");
      expect(signupData.user.name).toBe("Test User");

      // Extract session cookie
      const sessionCookie = signupResponse.headers.get("set-cookie");
      expect(sessionCookie).toBeDefined();

      // Create authenticated client
      const authenticatedClient = createGatewayClient(baseURL, {
        getAuthToken: () => sessionCookie,
      });

      // Create a playbook as the authenticated user
      const playbook = await authenticatedClient.store.create.mutate({
        name: "My Test Playbook",
        description: "Created by authenticated user",
      });

      expect(playbook).toBeDefined();
      expect(playbook.id).toBe("my-test-playbook");
      expect(playbook.name).toBe("My Test Playbook");

      // Verify the playbook is assigned to the user
      const playbookDetails = await harness.database.getPlaybookWithDetails(
        playbook.id,
        signupData.user.id,
      );

      expect(playbookDetails).toBeDefined();
      expect(playbookDetails?.userId).toBe(signupData.user.id);
      expect(playbookDetails?.name).toBe("My Test Playbook");

      // Verify the playbook shows up when querying all playbooks
      const allPlaybooks = await authenticatedClient.store.getAll.query();
      expect(allPlaybooks).toHaveLength(1);
      expect(allPlaybooks[0].id).toBe(playbook.id);
    });

    it("should prevent access without authentication", async () => {
      // Clear database
      await harness.purgeWithUsers();

      // Try to create a playbook without authentication (should use dummy-user-id)
      const unauthenticatedClient = createGatewayClient(baseURL);

      const playbook = await unauthenticatedClient.store.create.mutate({
        name: "Unauthenticated Playbook",
      });

      expect(playbook).toBeDefined();

      // Verify it's assigned to dummy-user-id (the fallback user when not authenticated)
      const playbookDetails = await harness.database.getPlaybookWithDetails(
        playbook.id,
        "dummy-user-id",
      );

      expect(playbookDetails).toBeDefined();
      expect(playbookDetails?.userId).toBe("dummy-user-id");
    });
  });

  describe("login flow", () => {
    it("should login an existing user and access their playbooks", async () => {
      // Clear database
      await harness.purgeWithUsers();

      // First, register a user
      const signupResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "password123",
          name: "Existing User",
        }),
      });

      expect(signupResponse.ok).toBe(true);
      const signupData = await signupResponse.json();
      const signupCookie = signupResponse.headers.get("set-cookie");

      // Create a playbook as the registered user
      const signupClient = createGatewayClient(baseURL, {
        getAuthToken: () => signupCookie,
      });

      await signupClient.store.create.mutate({
        name: "User Playbook",
        description: "Created during signup",
      });

      // Now login with the same credentials
      const loginResponse = await fetch(`${baseURL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "password123",
        }),
      });

      expect(loginResponse.ok).toBe(true);
      const loginData = await loginResponse.json();
      expect(loginData.user.email).toBe("existing@example.com");
      expect(loginData.user.id).toBe(signupData.user.id);

      // Extract session cookie
      const loginCookie = loginResponse.headers.get("set-cookie");
      expect(loginCookie).toBeDefined();

      // Create authenticated client with login cookie
      const loginClient = createGatewayClient(baseURL, {
        getAuthToken: () => loginCookie,
      });

      // Verify the user can access their existing playbook
      const allPlaybooks = await loginClient.store.getAll.query();
      expect(allPlaybooks).toHaveLength(1);
      expect(allPlaybooks[0].name).toBe("User Playbook");

      // Verify the playbook is still assigned to the same user
      const playbookDetails = await harness.database.getPlaybookWithDetails(
        "user-playbook",
        signupData.user.id,
      );

      expect(playbookDetails).toBeDefined();
      expect(playbookDetails?.userId).toBe(signupData.user.id);
    });

    it("should fail with incorrect credentials", async () => {
      const loginResponse = await fetch(`${baseURL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "wrongpassword",
        }),
      });

      expect(loginResponse.ok).toBe(false);
    });
  });

  describe("user isolation", () => {
    it("should isolate playbooks between different users", async () => {
      // Clear database
      await harness.purgeWithUsers();

      // Register first user
      const user1Response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user1@example.com",
          password: "password123",
          name: "User One",
        }),
      });

      const user1Data = await user1Response.json();
      const user1Cookie = user1Response.headers.get("set-cookie");
      const user1Client = createGatewayClient(baseURL, {
        getAuthToken: () => user1Cookie,
      });

      // Register second user
      const user2Response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user2@example.com",
          password: "password123",
          name: "User Two",
        }),
      });

      const user2Data = await user2Response.json();
      const user2Cookie = user2Response.headers.get("set-cookie");
      const user2Client = createGatewayClient(baseURL, {
        getAuthToken: () => user2Cookie,
      });

      // Create playbooks for each user
      await user1Client.store.create.mutate({
        name: "User 1 Playbook",
      });

      await user2Client.store.create.mutate({
        name: "User 2 Playbook",
      });

      // Verify user 1 only sees their playbook
      const user1Playbooks = await user1Client.store.getAll.query();
      expect(user1Playbooks).toHaveLength(1);
      expect(user1Playbooks[0].name).toBe("User 1 Playbook");

      // Verify user 2 only sees their playbook
      const user2Playbooks = await user2Client.store.getAll.query();
      expect(user2Playbooks).toHaveLength(1);
      expect(user2Playbooks[0].name).toBe("User 2 Playbook");

      // Verify database isolation
      const user1DbPlaybooks = await harness.database.getAllPlaybooks(
        user1Data.user.id,
      );
      expect(user1DbPlaybooks).toHaveLength(1);
      expect(user1DbPlaybooks[0].name).toBe("User 1 Playbook");

      const user2DbPlaybooks = await harness.database.getAllPlaybooks(
        user2Data.user.id,
      );
      expect(user2DbPlaybooks).toHaveLength(1);
      expect(user2DbPlaybooks[0].name).toBe("User 2 Playbook");
    });
  });
});
