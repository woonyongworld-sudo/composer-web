import type { Chord, DiatonicDegree } from '@/modules/music/types';
import type {
  Advisor,
  AdvisorId,
  AdvisorMeta,
  Recommendation,
  RecommendationContext,
} from './types';
import { theoryAdvisor } from './theory-advisor';
import { genreAdvisor } from './genre-advisor';
import { famousAdvisor } from './famous-advisor';

export type { Advisor, AdvisorMeta, AdvisorId, Recommendation, RecommendationContext, Badge } from './types';

export const ADVISORS: Advisor[] = [theoryAdvisor, genreAdvisor, famousAdvisor];

export const ADVISOR_PANEL: AdvisorMeta[] = [
  theoryAdvisor.meta,
  genreAdvisor.meta,
  famousAdvisor.meta,
  { id: 'emotion', name: '감정위원', shortName: '감정', active: false },
];

export type Candidate = {
  chord: Chord;
  degree: DiatonicDegree;
  perAdvisor: Partial<Record<AdvisorId, Recommendation>>;
};

export function getCandidates(ctx: RecommendationContext): Candidate[] {
  const anchor = theoryAdvisor.recommend(ctx);
  return anchor.map((theoryRec) => {
    const perAdvisor: Partial<Record<AdvisorId, Recommendation>> = {
      theory: theoryRec,
    };
    for (const advisor of ADVISORS) {
      if (advisor.meta.id === 'theory') continue;
      if (!advisor.meta.active) continue;
      if (advisor.evaluate) {
        const rec = advisor.evaluate(theoryRec.chord, ctx);
        if (rec) perAdvisor[advisor.meta.id] = rec;
      }
    }
    return {
      chord: theoryRec.chord,
      degree: theoryRec.degree,
      perAdvisor,
    };
  });
}
