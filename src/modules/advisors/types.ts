import type { Chord, DiatonicDegree, Difficulty, Key, Mood } from '@/modules/music/types';

export type AdvisorId = 'theory' | 'genre' | 'emotion' | 'famous';

export type AdvisorMeta = {
  id: AdvisorId;
  name: string;
  shortName: string;
  active: boolean;
};

export type Badge = {
  label: string;
  score: number;
};

export type Recommendation = {
  chord: Chord;
  degree: DiatonicDegree;
  score: number;
  comment: string;
  badges?: Badge[];
};

export type RecommendationContext = {
  progression: Chord[];
  key: Key;
  mood: Mood;
  difficulty: Difficulty;
};

export type Advisor = {
  meta: AdvisorMeta;
  recommend(ctx: RecommendationContext): Recommendation[];
  evaluate?(chord: Chord, ctx: RecommendationContext): Recommendation | null;
};
