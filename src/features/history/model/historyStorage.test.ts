import { describe, expect, it } from 'vitest';
import { appendHistory, loadHistory } from './historyStorage';
import type { HistoryRecord } from './historyTypes';

const KEY = 'manabinote.history.v1';

const makeHistory = (id: string, startedAt = '2026-07-30T09:00:00.000Z'): HistoryRecord => ({
  id,
  questionType: 'kana-to-picture',
  startedAt,
  score: 4,
  total: 5,
  answers: Array.from({ length: 5 }, (_, index) => ({
    questionType: 'kana-to-picture' as const,
    questionId: `${id}-question-${index}`,
    kana: ['あ', 'い', 'う', 'え', 'お'][index],
    selectedChoiceId: 'apple',
    correctChoiceId: 'apple',
    isCorrect: index !== 4,
  })),
});

const makeStorage = (initial: Record<string, string> = {}): Storage => {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  };
};

describe('historyStorage', () => {
  it('returns an empty list for empty storage', () => {
    expect(loadHistory(makeStorage())).toEqual([]);
  });

  it('stores and reloads records newest first', () => {
    const storage = makeStorage();
    const first = makeHistory('first', '2026-07-30T09:00:00.000Z');
    const second = makeHistory('second', '2026-07-30T10:00:00.000Z');

    expect(appendHistory(first, storage)).toEqual({ ok: true });
    expect(appendHistory(second, storage)).toEqual({ ok: true });
    expect(loadHistory(storage).map((record) => record.id)).toEqual(['second', 'first']);
  });

  it('keeps only the latest 50 records', () => {
    const storage = makeStorage();
    for (let index = 0; index < 51; index += 1) {
      expect(appendHistory(makeHistory(`record-${index}`), storage)).toEqual({ ok: true });
    }

    const history = loadHistory(storage);
    expect(history).toHaveLength(50);
    expect(history[0].id).toBe('record-50');
    expect(history.at(-1)?.id).toBe('record-1');
  });

  it.each([
    ['malformed JSON', '{broken'],
    ['non-array data', JSON.stringify({ id: 'not-an-array' })],
    ['malformed record shape', JSON.stringify([{ ...makeHistory('bad'), score: '4' }])],
    ['wrong question type', JSON.stringify([{ ...makeHistory('bad'), questionType: 'other' }])],
    ['malformed answer shape', JSON.stringify([{ ...makeHistory('bad'), answers: [{ ...makeHistory('bad').answers[0], isCorrect: 'yes' }] }])],
  ])('returns an empty list for %s', (_, saved) => {
    expect(loadHistory(makeStorage({ [KEY]: saved }))).toEqual([]);
  });

  it('returns unavailable when storage cannot be read', () => {
    const storage = makeStorage();
    storage.getItem = () => {
      throw new Error('blocked');
    };

    expect(loadHistory(storage)).toEqual([]);
  });

  it('returns unavailable when storage cannot be written', () => {
    const storage = makeStorage();
    storage.setItem = () => {
      throw new Error('blocked');
    };

    expect(appendHistory(makeHistory('blocked'), storage)).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('returns quota when storage is full', () => {
    const storage = makeStorage();
    storage.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };

    expect(appendHistory(makeHistory('full'), storage)).toEqual({ ok: false, reason: 'quota' });
  });
});
