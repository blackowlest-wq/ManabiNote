import { describe, expect, it } from 'vitest';
import { loadKanaToPictureQuestions } from './loader';

describe('loadKanaToPictureQuestions', () => {
  it('loads at least five validated questions with three choices each', () => {
    const questions = loadKanaToPictureQuestions();

    expect(questions.length).toBeGreaterThanOrEqual(5);
    expect(questions.map((question) => question.kana)).toEqual(expect.arrayContaining(['あ', 'い', 'う', 'え', 'お']));
    expect(questions.every((question) => question.choices.length === 3)).toBe(true);
  });

  it('loads readings that start with the displayed kana', () => {
    const questions = loadKanaToPictureQuestions();

    for (const question of questions) {
      expect(question.reading.startsWith(question.kana)).toBe(true);
    }
  });
});
