import { desktopCapturer, DesktopCapturerSource } from 'electron';

const TEAMS_WINDOW =
  /microsoft teams|teams\s*-\s*|^\s*.*\|\s*.*microsoft teams/i;

const MEETING_HINT = /reunião|meeting|call|\|\s*.+\s*\|/i;

export async function listTeamsWindows(): Promise<DesktopCapturerSource[]> {
  const sources = await desktopCapturer.getSources({
    types: ['window'],
    fetchWindowIcons: false,
    thumbnailSize: { width: 1, height: 1 },
  });
  return sources.filter((source) => TEAMS_WINDOW.test(source.name));
}

export function pickBestTeamsMeetingWindow(
  sources: DesktopCapturerSource[],
): DesktopCapturerSource | null {
  if (!sources.length) return null;

  const ranked = sources
    .map((source) => {
      let score = 0;
      if (MEETING_HINT.test(source.name)) score += 3;
      if (source.name.includes('|')) score += 2;
      if (/chat|mensagens|activity/i.test(source.name)) score -= 2;
      return { source, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score > 0 ? ranked[0].source : ranked[0]?.source ?? null;
}

export async function detectActiveTeamsMeetingWindow(): Promise<{
  source: DesktopCapturerSource;
  isLikelyInCall: boolean;
} | null> {
  const teamsWindows = await listTeamsWindows();
  const best = pickBestTeamsMeetingWindow(teamsWindows);
  if (!best) return null;
  return {
    source: best,
    isLikelyInCall: MEETING_HINT.test(best.name),
  };
}
