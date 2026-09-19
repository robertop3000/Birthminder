/**
 * Returns a safe in-app path from a `next` route parameter.
 *
 * Used after login/sign-up to send the user back to where they started
 * (for example a shared birthday page). Only relative in-app paths are
 * accepted, so a crafted link cannot redirect to another site.
 */
export function getSafeNextPath(
  next: string | string[] | undefined,
  fallback = '/(tabs)'
): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || typeof value !== 'string') return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.includes('://') || value.includes('\\')) return fallback;
  return value;
}
