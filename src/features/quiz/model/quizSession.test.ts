import { describe, expect, it } from 'vitest';
import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types';
import {
  createQuizSession,
  isSessionComplete,
  recordAnswer,
} from './quizSession';

const makeQuestion = (index: number): KanaToPictureQuestion => ({
  type: 'kana-to-picture',
  id: `q-${index}`,
  kana: `か${index}`,
  reading: `か${index}`,
  choices: [
    { id: 'apple', label: 'りんご', imageSrc: '/apple.png' },
    { id: 'cat', label: 'ねこ', imageSrc: '/cat.png' },
    { id: 'dog', label: 'いぬ', imageSrc: '/dog.png' },
  ],
  correctChoiceId: 'apple',
});

const questions = Array.from({ length: 6 }, (_, index) => makeQuestion(index));
const fixedNow = () => new Date('2026-07-30T10:00:00.000Z');

describe('quiz session', () => {
  it('creates a five-question session with an ISO start time and discriminator', () => {
    const session = createQuizSession(questions, fixedNow, () => 0.999);

    expect(session.questions).toHaveLength(5);
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5);
    expect(session.startedAt).toBe('2026-07-30T10:00:00.000Z');
    expect(session.questionType).toBe('kana-to-picture');
    expect(session.currentIndex).toBe(0);
    expect(session.answers).toEqual([]);
  });

  it('records a correct answer and advances the current index immutably', () => {
    const session = createQuizSession(questions, fixedNow, () => 0.999);
    const answered = recordAnswer(session, 'apple');

    expect(answered).not.toBe(session);
    expect(session.answers).toEqual([]);
    expect(answered.currentIndex).toBe(1);
    expect(answered.answers[0]).toEqual({
      questionType: 'kana-to-picture',
      questionId: 'q-0',
      kana: 'か0',
      selectedChoiceId: 'apple',
      correctChoiceId: 'apple',
      isCorrect: true,
    });
  });

  it('records an incorrect answer', () => {
    const session = createQuizSession(questions, fixedNow, () => 0.999);

    expect(recordAnswer(session, 'cat').answers[0].isCorrect).toBe(false);
  });

  it('completes after five answers', () => {
    let session = createQuizSession(questions, fixedNow, () => 0.999);

    for (let index = 0; index < 5; index += 1) {
      session = recordAnswer(session, 'apple');
    }

    expect(session.answers).toHaveLength(5);
    expect(session.currentIndex).toBe(5);
    expect(isSessionComplete(session)).toBe(true);
    expect(() => recordAnswer(session, 'apple')).toThrow();
  });

  it('rejects an invalid choice and a second answer for the current question', () => {
    const session = createQuizSession(questions, fixedNow, () => 0.999);

    expect(() => recordAnswer(session, 'unknown')).toThrow();
    const answered = recordAnswer(session, 'apple');
    expect(() => recordAnswer({ ...answered, currentIndex: 0 }, 'cat')).toThrow();
  });
});
