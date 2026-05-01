import type { Chord, DiatonicDegree } from '@/modules/music/types';
import { chordToDegree, diatonicChord } from '@/modules/music/theory';
import type {
  Advisor,
  Recommendation,
  RecommendationContext,
} from './types';

const TRANSITION_BASE: Record<DiatonicDegree, Partial<Record<DiatonicDegree, number>>> = {
  1: { 4: 90, 5: 88, 6: 85, 2: 72, 3: 60, 7: 40 },
  2: { 5: 92, 7: 75, 1: 65, 4: 60 },
  3: { 6: 90, 4: 78, 1: 55 },
  4: { 5: 92, 1: 85, 2: 75, 6: 70, 7: 50 },
  5: { 1: 95, 6: 80, 4: 60, 2: 50 },
  6: { 4: 88, 2: 80, 5: 78, 1: 70, 3: 55 },
  7: { 1: 95, 3: 60 },
};

const EASY_COMMENTS: Record<string, string> = {
  '1-4': '편안하고 따뜻하게 풀어주는 흐름',
  '1-5': '곡에 추진력을 주는 가장 흔한 전개',
  '1-6': '밝음에서 차분함으로 자연스럽게 내려가는 전환',
  '1-2': '잔잔한 출발, 다음 코드로 이어주는 다리 역할',
  '1-3': '살짝 분위기를 바꾸는 신선한 선택',
  '2-5': '다음 화음을 강하게 끌어당기는 전형적 흐름',
  '3-6': '부드러우면서도 살짝 어두워지는 변화',
  '4-5': '곧 마무리될 듯한 강한 추진력',
  '4-1': '안정감 있는 귀환, 편안한 종지',
  '4-2': '잔잔하게 색깔이 바뀌는 흐름',
  '5-1': '강하게 마무리되는 종지의 정석',
  '5-6': '예상을 살짝 비껴가는 부드러운 반전',
  '5-4': '잠시 추진력을 늦추는 여유로운 흐름',
  '6-4': '차분함이 이어지는 부드러운 진행',
  '6-2': '잔잔하지만 새로운 색깔이 들어옴',
  '6-5': '긴장감이 살짝 도는 변화',
  '6-1': '차분함에서 다시 밝게 돌아오는 흐름',
  '7-1': '강하게 풀리는 마무리',
};

const NORMAL_COMMENTS: Record<string, string> = {
  '1-4': 'I→IV, 가장 기본적인 진행',
  '1-5': 'I→V, 토닉에서 도미넌트로의 전형적 이동',
  '1-6': 'I→vi, 평행 단조로의 부드러운 전환',
  '1-2': 'I→ii, 약한 진행으로 다음 도미넌트를 준비',
  '1-3': 'I→iii, 중간음으로의 변형 진행',
  '2-5': 'ii→V, 종지를 준비하는 강한 진행',
  '3-6': 'iii→vi, 5도 하행 진행',
  '4-5': 'IV→V, 종지 직전 도미넌트로의 강한 추진',
  '4-1': 'IV→I, 플라갈 종지(Plagal Cadence)',
  '4-2': 'IV→ii, 동기능 코드 간의 순환',
  '5-1': 'V→I, 가장 강력한 종지(Authentic Cadence)',
  '5-6': 'V→vi, 거짓 종지(Deceptive Cadence)',
  '5-4': 'V→IV, 도미넌트의 완화',
  '6-4': 'vi→IV, 팝 진행의 흔한 패턴',
  '6-2': 'vi→ii, 5도 하행 진행',
  '6-5': 'vi→V, 평행 단조에서 도미넌트로',
  '6-1': 'vi→I, 부드러운 귀환',
  '7-1': 'vii°→I, 도미넌트 기능의 강한 해결',
};

function fallbackComment(from: number, to: number, isMajor: boolean, easy: boolean): string {
  if (easy) {
    return isMajor ? '밝고 자연스러운 선택' : '차분한 색깔의 선택';
  }
  return `${from}→${to} 진행`;
}

function buildComment(
  from: DiatonicDegree,
  to: DiatonicDegree,
  chord: Chord,
  difficulty: 'easy' | 'normal',
): string {
  const key = `${from}-${to}`;
  const lookup = difficulty === 'easy' ? EASY_COMMENTS : NORMAL_COMMENTS;
  if (lookup[key]) return lookup[key];
  return fallbackComment(from, to, chord.quality === 'major', difficulty === 'easy');
}

function applyMoodAdjustments(
  baseScore: number,
  chord: Chord,
  degree: DiatonicDegree,
  ctx: RecommendationContext,
): { chord: Chord; score: number } {
  let score = baseScore;
  let adjustedChord = chord;

  if (chord.quality === 'major') {
    score += (ctx.mood.brightness - 0.5) * 24;
  } else if (chord.quality === 'minor') {
    score -= (ctx.mood.brightness - 0.5) * 24;
  }

  if (degree === 5 && ctx.mood.tension > 0.6) {
    adjustedChord = { ...chord, quality: 'dom7' };
    score += (ctx.mood.tension - 0.5) * 18;
  }

  if (chord.quality === 'diminished') {
    if (ctx.mood.tension < 0.4) score -= 35;
    else score += (ctx.mood.tension - 0.5) * 20;
  }

  if (degree === 7 && ctx.mood.tension < 0.4) {
    score -= 20;
  }

  score = Math.max(20, Math.min(99, Math.round(score)));
  return { chord: adjustedChord, score };
}

function defaultStartRecommendations(ctx: RecommendationContext): Recommendation[] {
  const c1 = diatonicChord(ctx.key, 1);
  const c4 = diatonicChord(ctx.key, 4);
  const c5 = diatonicChord(ctx.key, 5);
  const c6 = diatonicChord(ctx.key, 6);
  return [
    { chord: c1, degree: 1, score: 88, comment: ctx.difficulty === 'easy' ? '곡의 중심이 되는 으뜸화음' : 'I, 토닉' },
    { chord: c4, degree: 4, score: 80, comment: ctx.difficulty === 'easy' ? '편안하고 안정적인 출발' : 'IV, 서브도미넌트' },
    { chord: c6, degree: 6, score: 75, comment: ctx.difficulty === 'easy' ? '차분하게 시작하는 느낌' : 'vi, 평행 단조' },
  ];
}

export const theoryAdvisor: Advisor = {
  meta: {
    id: 'theory',
    name: '이론위원',
    shortName: '이론',
    active: true,
  },
  recommend(ctx) {
    if (ctx.progression.length === 0) {
      return defaultStartRecommendations(ctx);
    }

    const last = ctx.progression[ctx.progression.length - 1];
    const lastDegree = chordToDegree(last, ctx.key);
    if (lastDegree == null) {
      return defaultStartRecommendations(ctx);
    }

    const transitions = TRANSITION_BASE[lastDegree];
    const candidates: Recommendation[] = [];

    for (const [degreeStr, base] of Object.entries(transitions)) {
      const degree = Number(degreeStr) as DiatonicDegree;
      const baseChord = diatonicChord(ctx.key, degree);
      const { chord, score } = applyMoodAdjustments(base!, baseChord, degree, ctx);
      const comment = buildComment(lastDegree, degree, chord, ctx.difficulty);
      candidates.push({ chord, degree, score, comment });
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, 3);
  },
};
