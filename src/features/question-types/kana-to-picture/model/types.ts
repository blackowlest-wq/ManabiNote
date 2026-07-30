import type { BaseQuestion } from '../../types';
import type { PictureImageRef } from './imageAtlas';

export type PictureChoice = {
  id: string;
  label: string;
  reading: string;
  image: PictureImageRef;
};

export type KanaToPictureQuestion = BaseQuestion & {
  kana: string;
  reading: string;
  choices: PictureChoice[];
  correctChoiceId: string;
  audioSrc?: string | null;
};
