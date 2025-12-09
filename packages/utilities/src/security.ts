import { AppError, ErrorCode } from "./error";

/**
 * Validates that a URL is secure for server-side requests.
 *
 * This function helps prevent SSRF (Server-Side Request Forgery) attacks by:
 * 1. Requiring HTTPS protocol
 * 2. Blocking IP addresses (both IPv4 and IPv6)
 *
 * @param url - The URL string to validate
 * @throws AppError with BAD_REQUEST code if the URL is not secure
 */
export function assertSecureURL(url: string): void {
  const parsedUrl = new URL(url);

  // Require HTTPS
  if (parsedUrl.protocol !== "https:") {
    throw new AppError(
      ErrorCode.BAD_REQUEST,
      "Only HTTPS URLs are allowed for security reasons.",
    );
  }

  // Block IP addresses (IPv4 and IPv6)
  const hostname = parsedUrl.hostname;
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^\[?([0-9a-fA-F:]+)\]?$/;

  if (ipv4Regex.test(hostname) || ipv6Regex.test(hostname)) {
    throw new AppError(
      ErrorCode.BAD_REQUEST,
      "IP addresses are not allowed for security reasons. Please use a hostname instead.",
    );
  }
}
