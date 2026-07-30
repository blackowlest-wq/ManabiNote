import questionsJson from '../data/questions.json';
import { loadImageAtlasManifest } from './imageAtlas';
import { validateKanaToPictureQuestionBank } from './questionBankValidator';
import { validateKanaToPictureQuestions } from './validator';
import type { KanaToPictureQuestion } from './types';

export const loadKanaToPictureQuestions = (): KanaToPictureQuestion[] => {
  const manifest = loadImageAtlasManifest();
  const questions = validateKanaToPictureQuestions(questionsJson, manifest);
  return validateKanaToPictureQuestionBank(questions);
};
