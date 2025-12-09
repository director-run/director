import { describe, expect, test } from "vitest";
import { AppError, ErrorCode } from "./error";
import { assertSecureURL } from "./security";

describe("security", () => {
  describe("assertSecureURL", () => {
    test("should allow valid HTTPS URLs with hostnames", () => {
      expect(() => assertSecureURL("https://example.com")).not.toThrow();
      expect(() => assertSecureURL("https://api.example.com/v1")).not.toThrow();
      expect(() =>
        assertSecureURL("https://example.com:8443/path"),
      ).not.toThrow();
      expect(() =>
        assertSecureURL("https://sub.domain.example.com"),
      ).not.toThrow();
    });

    test("should reject HTTP URLs", () => {
      expect(() => assertSecureURL("http://example.com")).toThrow(AppError);
      expect(() => assertSecureURL("http://example.com")).toThrow(
        "Only HTTPS URLs are allowed for security reasons.",
      );
    });

    test("should reject other protocols", () => {
      expect(() => assertSecureURL("ftp://example.com")).toThrow(AppError);
      expect(() => assertSecureURL("file:///etc/passwd")).toThrow(AppError);
    });

    test("should reject IPv4 addresses", () => {
      expect(() => assertSecureURL("https://192.168.1.1")).toThrow(AppError);
      expect(() => assertSecureURL("https://192.168.1.1")).toThrow(
        "IP addresses are not allowed for security reasons.",
      );
      expect(() => assertSecureURL("https://10.0.0.1")).toThrow(AppError);
      expect(() => assertSecureURL("https://127.0.0.1")).toThrow(AppError);
      expect(() => assertSecureURL("https://0.0.0.0")).toThrow(AppError);
    });

    test("should reject IPv6 addresses", () => {
      expect(() => assertSecureURL("https://[::1]")).toThrow(AppError);
      expect(() => assertSecureURL("https://[::1]")).toThrow(
        "IP addresses are not allowed for security reasons.",
      );
      expect(() => assertSecureURL("https://[2001:db8::1]")).toThrow(AppError);
      expect(() => assertSecureURL("https://[fe80::1]")).toThrow(AppError);
    });

    test("should throw AppError with BAD_REQUEST code", () => {
      try {
        assertSecureURL("http://example.com");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.BAD_REQUEST);
      }
    });

    test("should throw for invalid URLs", () => {
      expect(() => assertSecureURL("not-a-url")).toThrow();
      expect(() => assertSecureURL("")).toThrow();
    });

    test("should allow localhost-like hostnames (not IPs)", () => {
      // These are hostnames, not IP addresses, so they should be allowed
      // The DNS resolution would happen server-side, but the URL validation passes
      expect(() => assertSecureURL("https://localhost")).not.toThrow();
      expect(() =>
        assertSecureURL("https://my-local-server.local"),
      ).not.toThrow();
    });
  });
});
