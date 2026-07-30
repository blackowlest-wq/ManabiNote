import { describe, expect, it } from 'vitest';
import { QuestionDataError, validateKanaToPictureQuestions } from './validator';

const validQuestion = {
  type: 'kana-to-picture',
  id: 'hiragana-a',
  kana: 'あ',
  reading: 'あり',
  choices: [
    { id: 'apple', label: 'りんご', imageSrc: '/images/apple.svg' },
    { id: 'ant', label: 'あり', imageSrc: '/images/ant.svg' },
    { id: 'umbrella', label: 'かさ', imageSrc: '/images/umbrella.svg' },
  ],
  correctChoiceId: 'ant',
  audioSrc: null,
};

describe('validateKanaToPictureQuestions', () => {
  it('returns typed questions for valid data', () => {
    const result = validateKanaToPictureQuestions([validQuestion]);

    expect(result[0].type).toBe('kana-to-picture');
    expect(result[0].choices).toHaveLength(3);
  });

  it.each([
    ['fewer than three choices', validQuestion.choices.slice(0, 2)],
    ['more than three choices', [...validQuestion.choices, { id: 'extra', label: '追加', imageSrc: '/images/extra.svg' }]],
  ])('rejects %s', (_, choices) => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, choices }])).toThrow(QuestionDataError);
  });

  it('rejects duplicate question IDs', () => {
    expect(() => validateKanaToPictureQuestions([validQuestion, { ...validQuestion, kana: 'い' }])).toThrow(QuestionDataError);
  });

  it('rejects duplicate choice IDs', () => {
    const choices = validQuestion.choices.map((choice, index) => ({ ...choice, id: index === 1 ? 'apple' : choice.id }));

    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, choices }])).toThrow(QuestionDataError);
  });

  it('rejects a missing correct choice', () => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, correctChoiceId: 'missing' }])).toThrow(QuestionDataError);
  });

  it('rejects a reading that does not start with the displayed kana', () => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, reading: 'りんご' }])).toThrow(QuestionDataError);
  });

  it('allows a display label to differ from its phonetic reading', () => {
    const choices = validQuestion.choices.map((choice) =>
      choice.id === 'ant' ? { ...choice, label: '蟻' } : choice,
    );

    const result = validateKanaToPictureQuestions([{ ...validQuestion, choices }]);

    expect(result[0].reading).toBe('あり');
  });

  it('rejects an unsupported question type', () => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, type: 'other' }])).toThrow(QuestionDataError);
  });

  it.each([
    ['non-array input', {}],
    ['non-object item', [null]],
    ['missing kana', [{ ...validQuestion, kana: '' }]],
    ['missing reading', [{ ...validQuestion, reading: '' }]],
    ['missing choice label', [{ ...validQuestion, choices: validQuestion.choices.map((choice, index) => index === 0 ? { ...choice, label: '' } : choice) }]],
    ['missing choice image', [{ ...validQuestion, choices: validQuestion.choices.map((choice, index) => index === 0 ? { ...choice, imageSrc: '' } : choice) }]],
  ])('rejects %s', (_, raw) => {
    expect(() => validateKanaToPictureQuestions(raw)).toThrow(QuestionDataError);
  });

  it('exposes a user-safe message and machine-readable code', () => {
    try {
      validateKanaToPictureQuestions('invalid');
      throw new Error('expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(QuestionDataError);
      expect((error as QuestionDataError).message).toBe('問題データを読み込めませんでした。');
      expect((error as QuestionDataError).code).toBe('INVALID_QUESTION_DATA');
    }
  });
});
