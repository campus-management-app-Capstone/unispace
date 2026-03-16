/**
 * Read campus WiFi IPv4 CIDR ranges from environment.
 *
 * Example:
 *   CAMPUS_IP_RANGES=10.10.0.0/16,192.168.50.0/24
 *
 * For local development you can use:
 *   CAMPUS_IP_RANGES=127.0.0.1/32
 */
export function getCampusCidrs(): string[] {
  const raw = process.env.CAMPUS_IP_RANGES;
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

