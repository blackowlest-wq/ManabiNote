import { describe, expect, it } from 'vitest';
import { QuestionDataError, validateKanaToPictureQuestions } from './validator';

const validManifest = {
  atlases: [
    { id: 'animals', src: '/images/animals.svg', symbols: ['ant'] },
    { id: 'objects', src: '/images/objects.svg', symbols: ['apple', 'umbrella'] },
  ],
};

const validQuestion = {
  type: 'kana-to-picture',
  id: 'hiragana-a',
  kana: 'あ',
  reading: 'あり',
  choices: [
    { id: 'apple', label: 'りんご', reading: 'りんご', image: { atlasId: 'objects', symbolId: 'apple' } },
    { id: 'ant', label: 'あり', reading: 'あり', image: { atlasId: 'animals', symbolId: 'ant' } },
    { id: 'umbrella', label: 'かさ', reading: 'かさ', image: { atlasId: 'objects', symbolId: 'umbrella' } },
  ],
  correctChoiceId: 'ant',
  audioSrc: null,
};

describe('validateKanaToPictureQuestions', () => {
  it('returns typed questions for valid data', () => {
    const result = validateKanaToPictureQuestions([validQuestion], validManifest);

    expect(result[0].type).toBe('kana-to-picture');
    expect(result[0].choices).toHaveLength(3);
  });

  it.each([
    ['fewer than three choices', validQuestion.choices.slice(0, 2)],
    [
      'more than three choices',
      [
        ...validQuestion.choices,
        {
          id: 'extra',
          label: '追加',
          reading: '追加',
          image: { atlasId: 'objects', symbolId: 'apple' },
        },
      ],
    ],
  ])('rejects %s', (_, choices) => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, choices }], validManifest)).toThrow(QuestionDataError);
  });

  it('rejects duplicate question IDs', () => {
    expect(() => validateKanaToPictureQuestions([validQuestion, { ...validQuestion, kana: 'い' }], validManifest)).toThrow(
      QuestionDataError,
    );
  });

  it('rejects duplicate choice IDs', () => {
    const choices = validQuestion.choices.map((choice, index) => ({ ...choice, id: index === 1 ? 'apple' : choice.id }));

    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, choices }], validManifest)).toThrow(QuestionDataError);
  });

  it('rejects a missing correct choice', () => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, correctChoiceId: 'missing' }], validManifest)).toThrow(
      QuestionDataError,
    );
  });

  it('rejects a reading that does not start with the displayed kana', () => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, reading: 'りんご' }], validManifest)).toThrow(
      QuestionDataError,
    );
  });

  it('rejects a correct choice whose reading differs from the question reading', () => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, reading: 'あめ' }], validManifest)).toThrow(
      QuestionDataError,
    );
  });

  it('rejects an incorrect choice whose reading starts with the displayed kana', () => {
    const choices = validQuestion.choices.map((choice) =>
      choice.id === 'umbrella' ? { ...choice, reading: 'あめ' } : choice,
    );

    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, choices }], validManifest)).toThrow(QuestionDataError);
  });

  it('rejects a choice image that references an unknown atlas', () => {
    const choices = validQuestion.choices.map((choice) =>
      choice.id === 'ant' ? { ...choice, image: { atlasId: 'missing', symbolId: 'ant' } } : choice,
    );

    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, choices }], validManifest)).toThrow(QuestionDataError);
  });

  it('rejects a choice image that references an unknown symbol', () => {
    const choices = validQuestion.choices.map((choice) =>
      choice.id === 'ant' ? { ...choice, image: { atlasId: 'animals', symbolId: 'missing' } } : choice,
    );

    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, choices }], validManifest)).toThrow(QuestionDataError);
  });

  it('allows a display label to differ from its phonetic reading', () => {
    const choices = validQuestion.choices.map((choice) =>
      choice.id === 'ant' ? { ...choice, label: '蟻' } : choice,
    );

    const result = validateKanaToPictureQuestions([{ ...validQuestion, choices }], validManifest);

    expect(result[0].reading).toBe('あり');
  });

  it('rejects an unsupported question type', () => {
    expect(() => validateKanaToPictureQuestions([{ ...validQuestion, type: 'other' }], validManifest)).toThrow(
      QuestionDataError,
    );
  });

  it.each([
    ['non-array input', {}],
    ['non-object item', [null]],
    ['missing kana', [{ ...validQuestion, kana: '' }]],
    ['missing reading', [{ ...validQuestion, reading: '' }]],
    [
      'missing choice reading',
      [{ ...validQuestion, choices: validQuestion.choices.map((choice, index) => (index === 0 ? { ...choice, reading: '' } : choice)) }],
    ],
    [
      'missing choice label',
      [{ ...validQuestion, choices: validQuestion.choices.map((choice, index) => (index === 0 ? { ...choice, label: '' } : choice)) }],
    ],
    [
      'missing choice image reference',
      [{ ...validQuestion, choices: validQuestion.choices.map((choice, index) => (index === 0 ? { ...choice, image: '' } : choice)) }],
    ],
  ])('rejects %s', (_, raw) => {
    expect(() => validateKanaToPictureQuestions(raw, validManifest)).toThrow(QuestionDataError);
  });

  it('exposes a user-safe message and machine-readable code', () => {
    try {
      validateKanaToPictureQuestions('invalid', validManifest);
      throw new Error('expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(QuestionDataError);
      expect((error as QuestionDataError).message).toBe('問題データを読み込めませんでした。');
      expect((error as QuestionDataError).code).toBe('INVALID_QUESTION_DATA');
    }
  });
});
