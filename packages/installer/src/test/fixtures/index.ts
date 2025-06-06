import { faker } from "@faker-js/faker";

export function createInstallable(): { url: string; name: string } {
  return {
    url: faker.internet.url(),
    name: faker.hacker.noun(),
  };
}