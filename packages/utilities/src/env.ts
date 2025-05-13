export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export function isTest() {
  return process.env.NODE_ENV === "test";
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
