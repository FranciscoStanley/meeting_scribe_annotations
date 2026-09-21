import { describe, expect, it } from 'vitest';
import { extractApiToken, tokensMatch } from './api-access.guard';

describe('extractApiToken', () => {
  it('lê Bearer Authorization', () => {
    expect(
      extractApiToken({
        headers: { authorization: 'Bearer secret-token' },
      }),
    ).toBe('secret-token');
  });

  it('lê X-API-Key', () => {
    expect(
      extractApiToken({
        headers: { 'x-api-key': 'key-123' },
      }),
    ).toBe('key-123');
  });

  it('lê handshake Socket.IO', () => {
    expect(
      extractApiToken({
        handshake: { auth: { token: 'ws-token' } },
      }),
    ).toBe('ws-token');
  });

  it('lê query apiKey (SSE / EventSource)', () => {
    expect(
      extractApiToken({
        headers: {},
        query: { apiKey: 'sse-token' },
      }),
    ).toBe('sse-token');
  });

  it('retorna undefined sem credencial', () => {
    expect(extractApiToken({ headers: {} })).toBeUndefined();
  });
});

describe('tokensMatch', () => {
  it('aceita tokens iguais', () => {
    expect(tokensMatch('abc', 'abc')).toBe(true);
  });

  it('rejeita tokens diferentes ou tamanhos distintos', () => {
    expect(tokensMatch('abc', 'abd')).toBe(false);
    expect(tokensMatch('abc', 'ab')).toBe(false);
  });
});
