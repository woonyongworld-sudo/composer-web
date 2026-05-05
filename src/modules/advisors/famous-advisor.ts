import type { Chord } from '@/modules/music/types';
import { chordToDegree } from '@/modules/music/theory';
import { findSongsMatching, FAMOUS_SONGS } from './famous-songs';
import type {
  Advisor,
  Recommendation,
  RecommendationContext,
} from './types';

const SECTION_KOR: Record<string, string> = {
  intro: '인트로',
  verse: '벌스',
  'pre-chorus': '프리코러스',
  chorus: '후렴',
  bridge: '브릿지',
};

function evaluateChord(
  chord: Chord,
  ctx: RecommendationContext,
): Recommendation | null {
  const last = ctx.progression[ctx.progression.length - 1];
  if (!last) return null;
  const from = chordToDegree(last, ctx.key);
  const to = chordToDegree(chord, ctx.key);
  if (from == null || to == null) return null;

  const matches = findSongsMatching(from, to, ctx.key.mode);
  const total = FAMOUS_SONGS.filter((s) => s.mode === ctx.key.mode).length;

  if (matches.length === 0) {
    return {
      chord,
      degree: to,
      score: 35,
      comment:
        ctx.difficulty === 'easy'
          ? '아는 명곡에서는 잘 안 보이는 진행이에요'
          : '명곡 DB 매칭 없음 — 신선한 선택',
    };
  }

  const top = matches.slice(0, 2);
  const score = Math.min(95, 45 + Math.round((matches.length / total) * 100));

  const songList = top
    .map((m) => `${m.song.artist} '${m.song.title}'`)
    .join(', ');
  const sectionHint =
    matches.length === 1
      ? ` (${SECTION_KOR[matches[0].song.section]})`
      : '';

  const comment =
    ctx.difficulty === 'easy'
      ? `${songList}${sectionHint}에서 들어본 흐름이에요`
      : `${songList}${sectionHint}에 등장 (총 ${matches.length}곡)`;

  return {
    chord,
    degree: to,
    score,
    comment,
    badges: top.map((m) => ({
      label: m.song.title,
      score:
        m.song.section === 'chorus'
          ? 90
          : m.song.section === 'verse'
            ? 70
            : 60,
    })),
  };
}

export const famousAdvisor: Advisor = {
  meta: {
    id: 'famous',
    name: '명곡위원',
    shortName: '명곡',
    active: true,
  },
  recommend(ctx) {
    return [];
  },
  evaluate(chord, ctx) {
    return evaluateChord(chord, ctx);
  },
};
