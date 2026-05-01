import type { Chord, DiatonicDegree } from '@/modules/music/types';
import { chordToDegree, diatonicChord } from '@/modules/music/theory';
import {
  ALL_GENRES,
  GENRE_NAMES,
  genreMoodAffinity,
  genreTransitionScore,
  type Genre,
} from '@/modules/music/genres';
import type {
  Advisor,
  Recommendation,
  RecommendationContext,
} from './types';

const EASY_TOP_GENRE_COMMENTS: Record<Genre, string> = {
  ballad: '발라드에서 자주 들리는 따뜻한 흐름',
  kpop: 'K-pop에서 흔한 산뜻한 진행',
  jazz: '재즈 느낌의 어른스러운 색깔',
  rock: '록 특유의 단단한 추진력',
  folk: '포크의 단순하고 진솔한 색깔',
};

const NORMAL_TOP_GENRE_COMMENTS: Record<Genre, string> = {
  ballad: '발라드의 전형적 진행',
  kpop: 'K-pop에서 자주 쓰이는 패턴',
  jazz: '재즈 어휘에 가까운 흐름',
  rock: '록/팝록의 전형적 움직임',
  folk: '포크/싱어송라이터 진행',
};

type SignatureKey = `${Genre}-${DiatonicDegree}-${DiatonicDegree}`;
const NORMAL_SIGNATURES: Partial<Record<SignatureKey, string>> = {
  'ballad-1-5': '발라드: I→V 정통 진행',
  'ballad-6-4': 'vi→IV, 발라드 후렴 클리셰',
  'ballad-4-5': 'IV→V, 발라드 종지 직전',
  'kpop-6-4': 'vi→IV→I→V "4-chord" 패턴 일부',
  'kpop-1-5': 'K-pop 후렴 시작 패턴',
  'kpop-4-1': 'K-pop 훅의 따뜻한 귀환',
  'jazz-2-5': 'ii→V, 재즈의 핵심 카덴자',
  'jazz-5-1': 'V→I, ii-V-I 종지',
  'jazz-3-6': 'iii→vi, 5도 하행',
  'rock-5-4': 'V→IV, mixolydian-like rock',
  'rock-1-4': 'I→IV, 록 정통 시작',
  'rock-4-5': 'IV→V→I 직전 추진',
  'folk-1-5': 'I→V, 포크의 기본',
  'folk-5-1': 'V→I, 포크 종지',
  'folk-1-4': 'I→IV, 포크 코드 베이스',
};

const EASY_SIGNATURES: Partial<Record<SignatureKey, string>> = {
  'ballad-6-4': '발라드 후렴에서 자주 나오는 흐름',
  'kpop-6-4': 'K-pop 훅에서 거의 공식인 진행',
  'jazz-2-5': '재즈에서 가장 중요한 진행 중 하나',
  'rock-5-4': '록에서 자주 들리는 거친 흐름',
  'folk-1-4': '포크 어쿠스틱 기타에 잘 어울리는 진행',
};

function buildComment(
  topGenre: Genre,
  from: DiatonicDegree,
  to: DiatonicDegree,
  difficulty: 'easy' | 'normal',
): string {
  const sigKey = `${topGenre}-${from}-${to}` as SignatureKey;
  if (difficulty === 'easy') {
    return EASY_SIGNATURES[sigKey] ?? EASY_TOP_GENRE_COMMENTS[topGenre];
  }
  return NORMAL_SIGNATURES[sigKey] ?? NORMAL_TOP_GENRE_COMMENTS[topGenre];
}

function scoreGenres(
  from: DiatonicDegree,
  to: DiatonicDegree,
  ctx: RecommendationContext,
): { genre: Genre; score: number }[] {
  return ALL_GENRES.map((genre) => {
    const base = genreTransitionScore(genre, from, to);
    const moodWeight = genreMoodAffinity(genre, ctx.mood);
    const score = Math.round(base * (0.7 + 0.3 * moodWeight));
    return { genre, score: Math.max(15, Math.min(99, score)) };
  }).sort((a, b) => b.score - a.score);
}

function evaluateChord(
  chord: Chord,
  ctx: RecommendationContext,
): Recommendation | null {
  const last = ctx.progression[ctx.progression.length - 1];
  if (!last) return null;

  const from = chordToDegree(last, ctx.key);
  const to = chordToDegree(chord, ctx.key);
  if (from == null || to == null) return null;

  const ranked = scoreGenres(from, to, ctx);
  const top2 = ranked.slice(0, 2);
  const top = top2[0];
  const comment = buildComment(top.genre, from, to, ctx.difficulty);

  return {
    chord,
    degree: to,
    score: top.score,
    comment,
    badges: top2.map((g) => ({
      label: GENRE_NAMES[g.genre],
      score: g.score,
    })),
  };
}

function recommendFromAllDiatonic(
  ctx: RecommendationContext,
): Recommendation[] {
  const candidates: Recommendation[] = [];
  for (let d = 1; d <= 7; d++) {
    const chord = diatonicChord(ctx.key, d as DiatonicDegree);
    const rec = evaluateChord(chord, ctx);
    if (rec) candidates.push(rec);
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 3);
}

export const genreAdvisor: Advisor = {
  meta: {
    id: 'genre',
    name: '장르위원',
    shortName: '장르',
    active: true,
  },
  recommend(ctx) {
    return recommendFromAllDiatonic(ctx);
  },
  evaluate(chord, ctx) {
    return evaluateChord(chord, ctx);
  },
};
