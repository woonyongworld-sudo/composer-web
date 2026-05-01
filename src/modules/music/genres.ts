import type { DiatonicDegree, Mood } from './types';

export type Genre = 'ballad' | 'kpop' | 'jazz' | 'rock' | 'folk';

export const ALL_GENRES: Genre[] = ['ballad', 'kpop', 'jazz', 'rock', 'folk'];

export const GENRE_NAMES: Record<Genre, string> = {
  ballad: '발라드',
  kpop: 'K-pop',
  jazz: '재즈',
  rock: '록',
  folk: '포크',
};

type DegreeMap = Partial<Record<DiatonicDegree, number>>;
type GenreTable = Record<DiatonicDegree, DegreeMap>;

const BALLAD: GenreTable = {
  1: { 5: 92, 6: 90, 4: 88, 2: 70, 3: 55, 7: 40 },
  2: { 5: 90, 1: 60, 4: 55, 7: 50 },
  3: { 6: 85, 4: 70, 1: 50 },
  4: { 5: 92, 1: 88, 2: 70, 6: 75, 7: 50 },
  5: { 1: 95, 6: 82, 4: 60, 2: 50 },
  6: { 4: 92, 5: 80, 2: 78, 1: 70, 3: 55 },
  7: { 1: 88, 3: 50 },
};

const KPOP: GenreTable = {
  1: { 5: 90, 6: 92, 4: 88, 2: 75, 3: 60, 7: 35 },
  2: { 5: 88, 1: 70, 7: 60, 4: 65 },
  3: { 6: 88, 4: 78, 1: 55 },
  4: { 1: 92, 5: 90, 2: 78, 6: 80, 7: 50 },
  5: { 1: 92, 6: 88, 4: 70, 2: 55 },
  6: { 4: 95, 5: 78, 2: 80, 1: 75, 3: 60 },
  7: { 1: 85, 3: 60 },
};

const JAZZ: GenreTable = {
  1: { 4: 80, 6: 88, 2: 90, 3: 70 },
  2: { 5: 98, 1: 60, 7: 50 },
  3: { 6: 92, 4: 70, 2: 60 },
  4: { 5: 80, 7: 70, 2: 75, 6: 70, 3: 60 },
  5: { 1: 95, 3: 75, 6: 75 },
  6: { 2: 92, 5: 80, 4: 70, 3: 65 },
  7: { 3: 88, 1: 80 },
};

const ROCK: GenreTable = {
  1: { 4: 95, 5: 92, 6: 80, 7: 70 },
  2: { 5: 75, 1: 60, 4: 65 },
  3: { 4: 78, 6: 75, 1: 60 },
  4: { 5: 92, 1: 90, 7: 75, 6: 70 },
  5: { 1: 92, 4: 88, 6: 70, 7: 70 },
  6: { 4: 88, 5: 80, 1: 75, 7: 65 },
  7: { 1: 88, 4: 70 },
};

const FOLK: GenreTable = {
  1: { 5: 95, 4: 92, 6: 80, 2: 65 },
  2: { 5: 80, 1: 70, 4: 65 },
  3: { 6: 75, 4: 65 },
  4: { 1: 92, 5: 90, 2: 65, 6: 60 },
  5: { 1: 95, 4: 78, 6: 70 },
  6: { 4: 85, 1: 75, 5: 70 },
  7: { 1: 80 },
};

export const GENRE_TRANSITIONS: Record<Genre, GenreTable> = {
  ballad: BALLAD,
  kpop: KPOP,
  jazz: JAZZ,
  rock: ROCK,
  folk: FOLK,
};

export function genreMoodAffinity(genre: Genre, mood: Mood): number {
  const { brightness, energy, tension } = mood;
  switch (genre) {
    case 'ballad':
      return 0.4 + (1 - energy) * 0.5 + (1 - brightness) * 0.2 + (1 - tension) * 0.1;
    case 'kpop':
      return 0.4 + brightness * 0.4 + energy * 0.3 + (1 - tension) * 0.1;
    case 'jazz':
      return 0.4 + tension * 0.4 + (1 - energy) * 0.2 + (1 - brightness) * 0.1;
    case 'rock':
      return 0.4 + energy * 0.5 + tension * 0.2 + brightness * 0.1;
    case 'folk':
      return 0.4 + (1 - tension) * 0.4 + (1 - energy) * 0.3 + brightness * 0.1;
  }
}

export function genreTransitionScore(
  genre: Genre,
  from: DiatonicDegree,
  to: DiatonicDegree,
): number {
  return GENRE_TRANSITIONS[genre][from]?.[to] ?? 30;
}
