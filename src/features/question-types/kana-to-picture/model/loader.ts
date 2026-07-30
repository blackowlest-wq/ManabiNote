import questionsJson from '../data/questions.json';
import { loadImageAtlasManifest } from './imageAtlas';
import { validateKanaToPictureQuestions } from './validator';
import type { KanaToPictureQuestion } from './types';

export const loadKanaToPictureQuestions = (): KanaToPictureQuestion[] => {
  const manifest = loadImageAtlasManifest();
  return validateKanaToPictureQuestions(questionsJson, manifest);
};
