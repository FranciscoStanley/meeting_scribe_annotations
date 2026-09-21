import { describe, expect, it } from 'vitest';
import {
  meetingCanCapture,
  meetingCanModify,
  meetingRowActions,
} from './index';

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

describe('meetingCanCapture', () => {
  it('true enquanto a sessão ainda pode gravar', () => {
    expect(meetingCanCapture('SCHEDULED')).toBe(true);
    expect(meetingCanCapture('AWAITING_JOIN')).toBe(true);
    expect(meetingCanCapture('LIVE')).toBe(true);
  });

  it('false para concluídas ou canceladas', () => {
    expect(meetingCanCapture('COMPLETED')).toBe(false);
    expect(meetingCanCapture('CANCELLED')).toBe(false);
  });
});

describe('meetingRowActions', () => {
  it('agendada: editar, excluir e abrir (secundário)', () => {
    expect(meetingRowActions('SCHEDULED')).toEqual({
      actions: ['edit', 'delete', 'open'],
      openVariant: 'secondary',
    });
    expect(meetingRowActions('AWAITING_JOIN')).toEqual({
      actions: ['edit', 'delete', 'open'],
      openVariant: 'secondary',
    });
  });

  it('ao vivo ou concluída: só abrir como primário', () => {
    expect(meetingRowActions('LIVE')).toEqual({
      actions: ['open'],
      openVariant: 'primary',
    });
    expect(meetingRowActions('COMPLETED')).toEqual({
      actions: ['open'],
      openVariant: 'primary',
    });
  });

  it('cancelada: só abrir secundário', () => {
    expect(meetingRowActions('CANCELLED')).toEqual({
      actions: ['open'],
      openVariant: 'secondary',
    });
  });
});
