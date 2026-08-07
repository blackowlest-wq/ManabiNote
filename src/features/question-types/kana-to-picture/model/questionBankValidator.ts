import { QuestionDataError } from './validator';
import type { KanaToPictureQuestion } from './types';

const REQUIRED_KANA = Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ');
const THREE_QUESTION_KANA = new Set(Array.from('あいうおかきこさたなはま'));
const REQUIRED_QUESTION_COUNT = 100;

const invalidData = (): never => {
  throw new QuestionDataError();
};

export const validateKanaToPictureQuestionBank = (
  questions: KanaToPictureQuestion[],
): KanaToPictureQuestion[] => {
  if (questions.length !== REQUIRED_QUESTION_COUNT) {
    return invalidData();
  }

  const kanaCounts = new Map(REQUIRED_KANA.map((kana) => [kana, 0]));
  for (const question of questions) {
    const currentCount = kanaCounts.get(question.kana);
    if (currentCount === undefined) {
      return invalidData();
    }
    kanaCounts.set(question.kana, currentCount + 1);
  }

  if (
    REQUIRED_KANA.some(
      (kana) => kanaCounts.get(kana) !== (THREE_QUESTION_KANA.has(kana) ? 3 : 2),
    )
  ) {
    return invalidData();
  }

  const correctReadings = questions.map((question) => question.reading);
  if (new Set(correctReadings).size !== correctReadings.length) {
    return invalidData();
  }

  const correctPositionCounts = [0, 0, 0, 0];
  for (const question of questions) {
    const correctPosition = question.choices.findIndex((choice) => choice.id === question.correctChoiceId);
    if (correctPosition < 0) {
      return invalidData();
    }
    correctPositionCounts[correctPosition] += 1;
  }
  if (Math.max(...correctPositionCounts) > questions.length * 0.4) {
    return invalidData();
  }

  return questions;
};
