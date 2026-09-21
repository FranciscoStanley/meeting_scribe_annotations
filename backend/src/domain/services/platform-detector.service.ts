import { MeetingPlatform } from '@meeting-scribe/shared';

export class PlatformDetectorService {
  detect(title: string, joinUrl?: string): MeetingPlatform {
    const haystack = `${title} ${joinUrl ?? ''}`.toLowerCase();
    if (
      haystack.includes('teams.microsoft.com') ||
      haystack.includes('teams.live.com') ||
      haystack.includes('microsoft teams')
    ) {
      return 'TEAMS';
    }
    if (
      haystack.includes('meet.google.com') ||
      haystack.includes('google meet')
    ) {
      return 'MEET';
    }
    if (haystack.includes('zoom.us')) {
      return 'ZOOM';
    }
    return 'OTHER';
  }
}
