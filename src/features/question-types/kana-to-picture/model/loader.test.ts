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

  it('loads unique question IDs and unique correct readings with exactly four choices', () => {
    const questions = loadKanaToPictureQuestions();
    const correctReadings = questions.map((question) => question.reading);

    expect(new Set(questions.map((question) => question.id)).size).toBe(100);
    expect(new Set(correctReadings).size).toBe(100);

    for (const question of questions) {
      const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);

      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices.map((choice) => choice.id)).size).toBe(4);
      expect(correctChoice?.reading).toBe(question.reading);
    }
  });

  it('keeps every correct choice position at or below 40 percent', () => {
    const questions = loadKanaToPictureQuestions();
    const positions = questions.map((question) =>
      question.choices.findIndex((choice) => choice.id === question.correctChoiceId) + 1,
    );
    const counts = new Map([1, 2, 3, 4].map((position) => [position, 0]));

    for (const position of positions) {
      counts.set(position, (counts.get(position) ?? 0) + 1);
    }

    expect(Math.max(...counts.values())).toBeLessThanOrEqual(Math.floor(questions.length * 0.4));
  });

  it('uses every generated atlas symbol in at least one choice', () => {
    const questions = loadKanaToPictureQuestions();
    const manifest = loadImageAtlasManifest();

    for (const atlas of manifest.atlases) {
      const usedSymbols = new Set(
        questions.flatMap((question) =>
          question.choices
            .filter((choice) => choice.image.atlasId === atlas.id)
            .map((choice) => choice.image.symbolId),
        ),
      );

      expect(usedSymbols, atlas.id).toEqual(new Set(atlas.symbols));
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

  it('does not repeat a choice image, reading, or first character within one question', () => {
    const questions = loadKanaToPictureQuestions();

    for (const question of questions) {
      const imageReferences = question.choices.map(
        (choice) => `${choice.image.atlasId}/${choice.image.symbolId}`,
      );
      const heads = question.choices.map((choice) => choice.reading[0]);

      expect(new Set(imageReferences).size, question.id).toBe(question.choices.length);
      expect(new Set(heads).size, question.id).toBe(heads.length);
      expect(new Set(question.choices.map((choice) => choice.reading)).size, question.id).toBe(
        question.choices.length,
      );
    }
  });

  it('maps each image symbol to exactly one displayed name and reading', () => {
    const questions = loadKanaToPictureQuestions();
    const namesByImage = new Map<string, Set<string>>();

    for (const question of questions) {
      for (const choice of question.choices) {
        const imageReference = `${choice.image.atlasId}/${choice.image.symbolId}`;
        const names = namesByImage.get(imageReference) ?? new Set<string>();
        names.add(`${choice.label}/${choice.reading}`);
        namesByImage.set(imageReference, names);
      }
    }

    expect([...namesByImage.values()].every((names) => names.size === 1)).toBe(true);
  });

  it('uses the reviewed single-name mappings', () => {
    const questions = loadKanaToPictureQuestions();
    const choices = questions.flatMap((question) => question.choices);
    const readingBySymbol = new Map(choices.map((choice) => [choice.image.symbolId, choice.reading]));

    expect(readingBySymbol.get('ant')).toBe('あり');
    expect(readingBySymbol.get('octopus')).toBe('たこ');
    expect(readingBySymbol.get('bird')).toBe('とり');
    expect(readingBySymbol.get('pig')).toBe('ぶた');
    expect(readingBySymbol.get('bread')).toBe('ぱん');
    expect(readingBySymbol.get('broccoli')).toBe('ぶろっこりー');
    expect(readingBySymbol.get('donut')).toBe('どーなつ');
    expect(readingBySymbol.get('grape')).toBe('ぶどう');
    expect(readingBySymbol.get('rice')).toBe('ごはん');
    expect(readingBySymbol.get('ball')).toBe('ぼーる');
    expect(readingBySymbol.get('lamp')).toBe('らいと');
    expect(readingBySymbol.get('phone')).toBe('すまーとふぉん');
    expect(readingBySymbol.get('train')).toBe('きしゃ');
    expect(readingBySymbol.get('sun')).toBe('たいよう');
    expect(readingBySymbol.get('backpack')).toBe('りっくさっく');
    expect(readingBySymbol.get('book')).toBe('ほん');
    expect(readingBySymbol.get('apron')).toBe('えぷろん');
    expect(readingBySymbol.get('miso-soup')).toBe('みそしる');
  });

  it('keeps distractor choices balanced across the question bank', () => {
    const questions = loadKanaToPictureQuestions();
    const distractorCounts = new Map<string, number>();

    for (const question of questions) {
      for (const choice of question.choices) {
        if (choice.id !== question.correctChoiceId) {
          const key = `${choice.image.atlasId}/${choice.image.symbolId}`;
          distractorCounts.set(key, (distractorCounts.get(key) ?? 0) + 1);
        }
      }
    }

    expect(Math.max(...distractorCounts.values())).toBeLessThanOrEqual(4);
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
