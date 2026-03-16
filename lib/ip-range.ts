import { getCampusCidrs } from "./config";
import { getClientIp } from "./request-ip";

/**
 * Convert an IPv4 address (e.g. "192.168.0.1") into a 32-bit integer.
 * Returns null for invalid input or non-IPv4 values.
 */
export function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;

  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = (value << 8) + n;
  }

  return value >>> 0;
}

/**
 * Parse a CIDR string such as "192.168.0.0/16" into base + mask.
 */
export function parseCidr(
  cidr: string
): { base: number; mask: number } | null {
  const [ip, prefixRaw] = cidr.split("/");
  if (!ip || !prefixRaw) return null;

  const base = ipv4ToInt(ip.trim());
  if (base == null) return null;

  const prefix = Number(prefixRaw);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return { base, mask };
}

/**
 * Return true if the given IPv4 address is within at least one of the
 * provided CIDR ranges.
 */
export function isIpInCidrs(ip: string, cidrs: string[]): boolean {
  const ipInt = ipv4ToInt(ip);
  if (ipInt == null) return false;

  for (const cidr of cidrs) {
    const parsed = parseCidr(cidr);
    if (!parsed) continue;
    const { base, mask } = parsed;
    if ((ipInt & mask) === (base & mask)) {
      return true;
    }
  }

  return false;
}

export type CampusIpCheckResult =
  | { ok: true; ip: string }
  | { ok: false; reason: string };

/**
 * Ensure that a request originates from within the configured campus IP ranges.
 * Uses getClientIp() to resolve the caller's IPv4 address, then validates it
 * against CAMPUS_IP_RANGES CIDR blocks.
 */
export function ensureCampusIp(request: Request): CampusIpCheckResult {
  const ip = getClientIp(request);
  if (!ip) {
    return { ok: false, reason: "Unable to determine client IP address." };
  }

  const cidrs = getCampusCidrs();
  if (cidrs.length === 0) {
    return {
      ok: false,
      reason:
        "Campus IP ranges are not configured. Please contact the system administrator.",
    };
  }

  const allowed = isIpInCidrs(ip, cidrs);
  if (!allowed) {
    return {
      ok: false,
      reason:
        "You must be connected to the campus WiFi network to sign in attendance.",
    };
  }

  return { ok: true, ip };
}

