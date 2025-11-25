export interface Verb {
  id: string;
  base: string; // Present / Infinitive
  past: string; // Past Simple
  participle: string; // Past Participle
  meaning: string; // Korean translation
  example: string; // English example sentence
  isIrregular: boolean;
}

export interface QuizState {
  currentVerbIndex: number;
  score: number;
  totalQuestions: number;
  isFinished: boolean;
  answers: {
    verbId: string;
    userPast: string;
    userParticiple: string;
    isCorrect: boolean;
  }[];
}

export enum AppView {
  HOME = 'HOME',
  LEARN = 'LEARN',
  QUIZ = 'QUIZ',
  GENERATOR = 'GENERATOR'
}

export type QuizModeType = 'mix' | 'irregular' | 'regular';