/**
 * Extract the best-guess client IPv4 address from a Next.js Request.
 *
 * This looks at typical proxy headers in order:
 * - x-forwarded-for: first value in the list
 * - x-real-ip
 * - request.ip (for self-hosted deployments where available)
 */
export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first === "::1" ? "127.0.0.1" : first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim().length > 0) {
    const trimmed = realIp.trim();
    return trimmed === "::1" ? "127.0.0.1" : trimmed;
  }

  const anyReq = request as unknown as { ip?: string | undefined };
  if (anyReq.ip && anyReq.ip.trim().length > 0) {
    const trimmed = anyReq.ip.trim();
    return trimmed === "::1" ? "127.0.0.1" : trimmed;
  }

  return null;
}

