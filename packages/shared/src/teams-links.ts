/**
 * Abre reuniões Teams preferindo o app desktop (msteams://) no Windows/macOS.
 */
export function toTeamsDesktopJoinUrl(joinUrl: string): string {
  if (/^https:\/\/(teams\.microsoft\.com|.*\.teams\.microsoft\.com|teams\.live\.com)/i.test(joinUrl)) {
    return joinUrl.replace(/^https:/i, 'msteams:');
  }
  return joinUrl;
}

export function isTeamsJoinUrl(joinUrl: string): boolean {
  return /teams\.microsoft\.com|teams\.live\.com/i.test(joinUrl);
}
