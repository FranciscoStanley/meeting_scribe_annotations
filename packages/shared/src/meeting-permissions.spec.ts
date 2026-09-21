import { describe, expect, it } from 'vitest';
import { meetingCanModify } from './index';

describe('meetingCanModify', () => {
  it('true para agendas não iniciadas', () => {
    expect(meetingCanModify('SCHEDULED')).toBe(true);
    expect(meetingCanModify('AWAITING_JOIN')).toBe(true);
  });

  it('false para ao vivo, concluídas ou canceladas', () => {
    expect(meetingCanModify('LIVE')).toBe(false);
    expect(meetingCanModify('COMPLETED')).toBe(false);
    expect(meetingCanModify('CANCELLED')).toBe(false);
  });
});
