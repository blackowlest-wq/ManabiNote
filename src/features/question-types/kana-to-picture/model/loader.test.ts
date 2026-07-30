import { describe, expect, it } from 'vitest';
import { loadImageAtlasManifest, resolveImageAtlas } from './imageAtlas';
import { loadKanaToPictureQuestions } from './loader';

const allowedKana = Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ');
const thirdQuestionKana = Array.from('あいうおかきこさたなはま');
const hiraganaReading = /^[ぁ-ゖー]+$/;

describe('loadKanaToPictureQuestions', () => {
  it('loads exactly 100 questions with the required 44-kana distribution', () => {
    const questions = loadKanaToPictureQuestions();
    const counts = new Map(allowedKana.map((kana) => [kana, 0]));

    for (const question of questions) {
      expect(allowedKana).toContain(question.kana);
      counts.set(question.kana, (counts.get(question.kana) ?? 0) + 1);
    }

    expect(questions).toHaveLength(100);
    expect(new Set(questions.map((question) => question.kana))).toEqual(new Set(allowedKana));
    expect(
      [...counts.entries()]
        .filter(([, count]) => count === 3)
        .map(([kana]) => kana),
    ).toEqual(thirdQuestionKana);
    expect([...counts.entries()].filter(([, count]) => count === 2).map(([kana]) => kana)).toEqual(
      allowedKana.filter((kana) => !thirdQuestionKana.includes(kana)),
    );
  });

  it('loads unique question IDs and unique correct readings with exactly three choices', () => {
    const questions = loadKanaToPictureQuestions();
    const correctReadings = questions.map((question) => question.reading);

    expect(new Set(questions.map((question) => question.id)).size).toBe(100);
    expect(new Set(correctReadings).size).toBe(100);

    for (const question of questions) {
      const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);

      expect(question.choices).toHaveLength(3);
      expect(new Set(question.choices.map((choice) => choice.id)).size).toBe(3);
      expect(correctChoice?.reading).toBe(question.reading);
    }
  });

  it('loads natural hiragana readings with no distractor sharing the question prefix', () => {
    const questions = loadKanaToPictureQuestions();

    for (const question of questions) {
      const escapedKana = question.kana.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const startsWithQuestionKana = new RegExp(`^${escapedKana}`);

      expect(question.reading).toMatch(hiraganaReading);
      expect(question.reading).toMatch(startsWithQuestionKana);

      for (const choice of question.choices) {
        expect(choice.reading).toMatch(hiraganaReading);
        if (choice.id !== question.correctChoiceId) {
          expect(choice.reading).not.toMatch(startsWithQuestionKana);
        }
      }
    }
  });

  it('rejects the reviewed unnatural placeholder readings', () => {
    const readings = loadKanaToPictureQuestions().map((question) => question.reading);

    for (const reading of ['しろくろぱんだ', 'るすばんでんわ', 'るりいろのとり']) {
      expect(readings).not.toContain(reading);
    }
  });

  it('loads only image references resolvable by the current atlas manifest', () => {
    const manifest = loadImageAtlasManifest();
    const questions = loadKanaToPictureQuestions();

    for (const question of questions) {
      for (const choice of question.choices) {
        expect(() => resolveImageAtlas(choice.image, manifest)).not.toThrow();
      }
    }
  });
});
