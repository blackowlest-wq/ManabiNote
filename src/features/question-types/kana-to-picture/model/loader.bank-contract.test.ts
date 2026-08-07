import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionDataError } from './validator';

const { bankQuestions, makeValidBank } = vi.hoisted(() => {
  const requiredKana = Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ');
  const threeQuestionKana = new Set(Array.from('あいうおかきこさたなはま'));

  const makeValidBank = () => {
    let questionNumber = 0;

    return requiredKana.flatMap((kana) => {
      const count = threeQuestionKana.has(kana) ? 3 : 2;

      return Array.from({ length: count }, (_, index) => {
        questionNumber += 1;
        const id = `bank-question-${questionNumber}`;
        const reading = `${kana}${['あ', 'い', 'う'][index]}`;
        const distractors = [
          { reading: 'りんご', atlasId: 'food-01', symbolId: 'apple' },
          { reading: 'さかな', atlasId: 'animals-01', symbolId: 'fish' },
          { reading: 'ねこ', atlasId: 'animals-01', symbolId: 'cat' },
          { reading: 'みかん', atlasId: 'food-01', symbolId: 'orange' },
        ]
          .filter((choice) => !choice.reading.startsWith(kana))
          .slice(0, 3);

        const correctChoice = {
          id: `${id}-correct`,
          label: reading,
          reading,
          image: { atlasId: 'animals-01', symbolId: 'ant' },
        };
        const baseChoices = [
          correctChoice,
          ...distractors.map((choice) => ({
            label: choice.reading,
            reading: choice.reading,
            image: { atlasId: choice.atlasId, symbolId: choice.symbolId },
          })),
        ];
        const correctPosition = (questionNumber - 1) % 4;
        let distractorIndex = 1;
        const choices = Array.from({ length: 4 }, (_, choiceIndex) => {
          const choice = choiceIndex === correctPosition ? baseChoices[0] : baseChoices[distractorIndex++];
          return {
            ...choice,
            id: `${id}-choice-${choiceIndex + 1}`,
          };
        });

        return {
          type: 'kana-to-picture',
          id,
          kana,
          reading,
          choices,
          correctChoiceId: choices[correctPosition].id,
          audioSrc: null,
        };
      });
    });
  };

  return {
    bankQuestions: makeValidBank(),
    makeValidBank,
  };
});

vi.mock('../data/questions.json', () => ({
  default: bankQuestions,
}));

import { loadKanaToPictureQuestions } from './loader';

describe('loadKanaToPictureQuestions question-bank contract', () => {
  beforeEach(() => {
    bankQuestions.splice(0, bankQuestions.length, ...makeValidBank());
  });

  it('rejects a bank with anything other than exactly 100 questions', () => {
    bankQuestions.pop();

    expect(() => loadKanaToPictureQuestions()).toThrow(QuestionDataError);
  });

  it('rejects a bank with the wrong required kana distribution', () => {
    const question = bankQuestions.find((candidate) => candidate.kana === 'え');
    if (!question) {
      throw new Error('expected an え question in the valid test bank');
    }

    question.kana = 'あ';
    question.reading = 'あお';
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);
    if (!correctChoice) {
      throw new Error('expected a correct choice');
    }
    correctChoice.label = 'あお';
    correctChoice.reading = 'あお';

    expect(() => loadKanaToPictureQuestions()).toThrow(QuestionDataError);
  });

  it('rejects duplicate correct readings', () => {
    const questions = bankQuestions.filter((question) => question.kana === 'え');
    if (questions.length !== 2) {
      throw new Error('expected two え questions in the valid test bank');
    }

    questions[1].reading = questions[0].reading;
    const correctChoice = questions[1].choices.find((choice) => choice.id === questions[1].correctChoiceId);
    if (!correctChoice) {
      throw new Error('expected a correct choice');
    }
    correctChoice.label = questions[0].reading;
    correctChoice.reading = questions[0].reading;

    expect(() => loadKanaToPictureQuestions()).toThrow(QuestionDataError);
  });

  it('rejects a bank with correct answers concentrated in the first position', () => {
    for (const question of bankQuestions) {
      const correctIndex = question.choices.findIndex((choice) => choice.id === question.correctChoiceId);
      [question.choices[0], question.choices[correctIndex]] = [
        question.choices[correctIndex],
        question.choices[0],
      ];
      question.correctChoiceId = question.choices[0].id;
    }

    expect(() => loadKanaToPictureQuestions()).toThrow(QuestionDataError);
  });
});
