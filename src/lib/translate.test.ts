import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { translateText } from './translate.ts';

type Language = 'ko' | 'en' | 'ja' | 'zh';

describe('translateText', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // We don't need to restore originalFetch here as we override it in specific tests
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('returns the same text if text is empty', async () => {
    const result = await translateText('', 'ko' as Language);
    assert.strictEqual(result, '');
  });

  test('returns the same text if target language is English', async () => {
    const text = 'Hello';
    const result = await translateText(text, 'en' as Language);
    assert.strictEqual(result, text);
  });

  test('calls Google Translate API and returns translated text', async () => {
    const text = 'Hello ' + Math.random();
    const expectedTranslation = '안녕하세요';
    const targetLang: Language = 'ko';

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      return {
        ok: true,
        json: async () => [[[expectedTranslation]]]
      } as Response;
    }) as typeof fetch;

    const result = await translateText(text, targetLang);
    assert.strictEqual(result, expectedTranslation);
  });

  test('uses cache for subsequent calls with same text and language', async () => {
    const text = 'Unique Text ' + Math.random();
    const firstTranslation = 'Translation 1';
    let callCount = 0;

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      callCount++;
      return {
        ok: true,
        json: async () => [[[firstTranslation]]]
      } as Response;
    }) as typeof fetch;

    const result1 = await translateText(text, 'ja' as Language);
    const result2 = await translateText(text, 'ja' as Language);

    assert.strictEqual(result1, firstTranslation);
    assert.strictEqual(result2, firstTranslation);
    assert.strictEqual(callCount, 1);
  });

  test('returns original text if API response is not ok', async () => {
    const text = 'Error Case ' + Math.random();

    globalThis.fetch = (async () => {
      return {
        ok: false,
        status: 500
      } as Response;
    }) as typeof fetch;

    const result = await translateText(text, 'zh' as Language);
    assert.strictEqual(result, text);
  });

  test('returns original text if API throws an error', async () => {
    const text = 'Network Error ' + Math.random();

    globalThis.fetch = (async () => {
      throw new Error('Network failed');
    }) as typeof fetch;

    const result = await translateText(text, 'ko' as Language);
    assert.strictEqual(result, text);
  });

  test('returns original text if API returns invalid JSON structure', async () => {
    const text = 'Invalid JSON ' + Math.random();

    globalThis.fetch = (async () => {
      return {
        ok: true,
        json: async () => ({}) // Not the expected array structure
      } as Response;
    }) as typeof fetch;

    const result = await translateText(text, 'ja' as Language);
    assert.strictEqual(result, text);
  });
});
