import { describe, expect, it } from 'vitest';
import { selectUniqueQuestions } from './questionSelection';

describe('selectUniqueQuestions', () => {
  const questions = Array.from({ length: 6 }, (_, index) => ({ id: `q-${index}` }));

  it('returns exactly the requested number of unique questions', () => {
    const selected = selectUniqueQuestions(questions, 5, () => 0.1);

    expect(selected).toHaveLength(5);
    expect(new Set(selected.map((question) => question.id)).size).toBe(5);
  });

  it('does not mutate the input questions', () => {
    const input = [...questions];

    selectUniqueQuestions(input, 5, () => 0.5);

    expect(input).toEqual(questions);
  });

  it.each([0, -1])('rejects a count of %s', (count) => {
    expect(() => selectUniqueQuestions(questions, count)).toThrow();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 1.5])(
    'rejects a non-finite or fractional count (%s)',
    (count) => {
      expect(() => selectUniqueQuestions(questions, count)).toThrow();
    },
  );

  it('rejects insufficient input with the requested count', () => {
    expect(() => selectUniqueQuestions([{ id: 'q-1' }], 5)).toThrow('5問');
  });
});
