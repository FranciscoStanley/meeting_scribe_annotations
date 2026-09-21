import { describe, expect, it } from 'vitest';
import { PlatformDetectorService } from './platform-detector.service';

describe('PlatformDetectorService', () => {
  const detector = new PlatformDetectorService();

  it('detecta Google Meet pelo link', () => {
    expect(
      detector.detect('Daily', 'https://meet.google.com/abc-defg-hij'),
    ).toBe('MEET');
  });

  it('detecta Microsoft Teams pelo link', () => {
    expect(
      detector.detect(
        'Sync',
        'https://teams.microsoft.com/l/meetup-join/19%3ameeting',
      ),
    ).toBe('TEAMS');
  });
});
