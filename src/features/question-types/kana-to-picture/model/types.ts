import type { BaseQuestion } from '../../types';

export type PictureChoice = {
  id: string;
  label: string;
  reading: string;
  imageSrc: string;
};

export type KanaToPictureQuestion = BaseQuestion & {
  kana: string;
  reading: string;
  choices: PictureChoice[];
  correctChoiceId: string;
  audioSrc?: string | null;
};
