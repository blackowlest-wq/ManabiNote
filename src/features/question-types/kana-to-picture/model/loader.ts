import questionsJson from '../data/questions.json';
import { loadImageAtlasManifest } from './imageAtlas';
import { validateKanaToPictureQuestions } from './validator';
import type { KanaToPictureQuestion } from './types';

const manifest = loadImageAtlasManifest();
const questions = validateKanaToPictureQuestions(questionsJson, manifest);

export const loadKanaToPictureQuestions = (): KanaToPictureQuestion[] => questions;
