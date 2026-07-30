import type { KanaToPictureQuestion, PictureChoice } from './types';

export type QuestionDataErrorCode = 'INVALID_QUESTION_DATA';

export class QuestionDataError extends Error {
  readonly code: QuestionDataErrorCode;

  constructor(message = '問題データを読み込めませんでした。', code: QuestionDataErrorCode = 'INVALID_QUESTION_DATA') {
    super(message);
    this.name = 'QuestionDataError';
    this.code = code;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const startsWithKana = (reading: string, kana: string): boolean => {
  const escapedKana = kana.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedKana}`).test(reading);
};

const invalidData = (): never => {
  throw new QuestionDataError();
};

const validateChoice = (raw: unknown): PictureChoice => {
  if (
    !isRecord(raw) ||
    !isNonEmptyString(raw.id) ||
    !isNonEmptyString(raw.label) ||
    !isNonEmptyString(raw.reading) ||
    !isNonEmptyString(raw.imageSrc)
  ) {
    return invalidData();
  }

  return {
    id: raw.id,
    label: raw.label,
    reading: raw.reading,
    imageSrc: raw.imageSrc,
  };
};

const validateQuestion = (raw: unknown): KanaToPictureQuestion => {
  if (
    !isRecord(raw) ||
    raw.type !== 'kana-to-picture' ||
    !isNonEmptyString(raw.id) ||
    !isNonEmptyString(raw.kana) ||
    !isNonEmptyString(raw.reading)
  ) {
    return invalidData();
  }

  if (!Array.isArray(raw.choices) || raw.choices.length !== 3 || !isNonEmptyString(raw.correctChoiceId)) {
    return invalidData();
  }

  const kana = raw.kana;
  const reading = raw.reading;
  const choices = raw.choices.map(validateChoice);
  const choiceIds = choices.map((choice) => choice.id);
  if (new Set(choiceIds).size !== choiceIds.length || !choiceIds.includes(raw.correctChoiceId)) {
    return invalidData();
  }

  const correctChoice = choices.find((choice) => choice.id === raw.correctChoiceId);
  const incorrectChoices = choices.filter((choice) => choice.id !== raw.correctChoiceId);
  if (
    !correctChoice ||
    correctChoice.reading !== reading ||
    !startsWithKana(reading, kana) ||
    incorrectChoices.some((choice) => startsWithKana(choice.reading, kana))
  ) {
    return invalidData();
  }

  let audioSrc: string | null | undefined;
  if (raw.audioSrc === null) {
    audioSrc = null;
  } else if (typeof raw.audioSrc === 'string') {
    audioSrc = raw.audioSrc;
  } else if (raw.audioSrc !== undefined) {
    return invalidData();
  }

  return {
    type: 'kana-to-picture',
    id: raw.id,
    kana,
    reading,
    choices,
    correctChoiceId: raw.correctChoiceId,
    ...(audioSrc === undefined ? {} : { audioSrc }),
  };
};

export const validateKanaToPictureQuestions = (raw: unknown): KanaToPictureQuestion[] => {
  if (!Array.isArray(raw)) {
    return invalidData();
  }

  const questions = raw.map(validateQuestion);
  const questionIds = questions.map((question) => question.id);
  if (new Set(questionIds).size !== questionIds.length) {
    return invalidData();
  }

  return questions;
};
