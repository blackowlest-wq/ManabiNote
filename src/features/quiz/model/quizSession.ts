import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types';
import { selectUniqueQuestions } from './questionSelection';

export type QuizAnswer = {
  questionType: KanaToPictureQuestion['type'];
  questionId: string;
  kana: string;
  selectedChoiceId: string;
  correctChoiceId: string;
  isCorrect: boolean;
};

export type QuizSession = {
  id: string;
  questionType: KanaToPictureQuestion['type'];
  questions: readonly KanaToPictureQuestion[];
  currentIndex: number;
  answers: readonly QuizAnswer[];
  startedAt: string;
};

export function createQuizSession(
  questions: readonly KanaToPictureQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): QuizSession {
  const startedAt = now();
  const selectedQuestions = selectUniqueQuestions(questions, 5, random);
  const startedAtIso = startedAt.toISOString();
  const id = `quiz-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`;

  return {
    id,
    questionType: 'kana-to-picture',
    questions: selectedQuestions,
    currentIndex: 0,
    answers: [],
    startedAt: startedAtIso,
  };
}

export function recordAnswer(session: QuizSession, selectedChoiceId: string): QuizSession {
  if (isSessionComplete(session)) {
    throw new Error('完了したセッションには回答できません');
  }
  if (!selectedChoiceId) {
    throw new Error('選択肢を指定してください');
  }

  const currentQuestion = session.questions[session.currentIndex];
  if (!currentQuestion) {
    throw new Error('現在の問題が見つかりません');
  }
  if (session.answers.some((answer) => answer.questionId === currentQuestion.id)) {
    throw new Error('この問題にはすでに回答しています');
  }
  if (!currentQuestion.choices.some((choice) => choice.id === selectedChoiceId)) {
    throw new Error('無効な選択肢です');
  }

  const answer: QuizAnswer = {
    questionType: currentQuestion.type,
    questionId: currentQuestion.id,
    kana: currentQuestion.kana,
    selectedChoiceId,
    correctChoiceId: currentQuestion.correctChoiceId,
    isCorrect: selectedChoiceId === currentQuestion.correctChoiceId,
  };

  return {
    ...session,
    currentIndex: session.currentIndex + 1,
    answers: [...session.answers, answer],
  };
}

export function isSessionComplete(session: QuizSession): boolean {
  return session.currentIndex >= session.questions.length;
}
