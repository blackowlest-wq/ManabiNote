import questionsJson from '../data/questions.json';
import { validateKanaToPictureQuestions } from './validator';
import type { KanaToPictureQuestion } from './types';

const questions = validateKanaToPictureQuestions(questionsJson);

export const loadKanaToPictureQuestions = (): KanaToPictureQuestion[] => questions;
