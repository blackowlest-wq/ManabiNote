import type { QuestionType } from '../../question-types/types';

export type HistoryAnswer = {
  questionType: QuestionType;
  questionId: string;
  kana: string;
  selectedChoiceId: string;
  correctChoiceId: string;
  isCorrect: boolean;
};

export type HistoryRecord = {
  id: string;
  questionType: QuestionType;
  startedAt: string;
  score: number;
  total: number;
  answers: HistoryAnswer[];
};
