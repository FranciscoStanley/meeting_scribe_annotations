import { describe, expect, it } from 'vitest';
import {
  isTeamsJoinUrl,
  toTeamsDesktopJoinUrl,
} from '@meeting-scribe/shared';

describe('teams-links', () => {
  it('converte link HTTPS Teams para msteams://', () => {
    const https =
      'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc';
    expect(toTeamsDesktopJoinUrl(https)).toBe(
      'msteams://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
    );
  });

  it('detecta URL do Teams', () => {
    expect(
      isTeamsJoinUrl('https://teams.microsoft.com/l/meetup-join/x'),
    ).toBe(true);
    expect(isTeamsJoinUrl('https://meet.google.com/abc')).toBe(false);
  });

  it('não altera URL que não é Teams', () => {
    const meet = 'https://meet.google.com/abc-defg-hij';
    expect(toTeamsDesktopJoinUrl(meet)).toBe(meet);
  });
});
