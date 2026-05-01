'use client';

import type { AdvisorId, Recommendation } from '@/modules/advisors';
import { ADVISOR_PANEL } from '@/modules/advisors';
import { chordName } from '@/modules/music/theory';
import type { Chord } from '@/modules/music/types';

type Props = {
  chord: Chord;
  perAdvisor: Partial<Record<AdvisorId, Recommendation>>;
  onPreview: () => void;
  onPick: () => void;
};

export default function ChordCandidate({ chord, perAdvisor, onPreview, onPick }: Props) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white py-6">
        <span className="text-4xl font-bold tracking-tight text-slate-900">
          {chordName(chord)}
        </span>
      </div>
      <div className="flex-1 space-y-3 p-4 text-sm">
        {ADVISOR_PANEL.map((advisor) => {
          const rec = perAdvisor[advisor.id];
          const active = advisor.active;
          return (
            <div key={advisor.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    active ? 'text-indigo-700' : 'text-slate-400'
                  }`}
                >
                  {advisor.name}
                </span>
                {active && rec && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    {rec.score}%
                  </span>
                )}
              </div>
              {active && rec?.badges && rec.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rec.badges.map((b) => (
                    <span
                      key={b.label}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {b.label} <span className="text-slate-500">{b.score}%</span>
                    </span>
                  ))}
                </div>
              )}
              <p
                className={`text-sm leading-relaxed ${
                  active && rec ? 'text-slate-700' : 'text-slate-300 italic'
                }`}
              >
                {active && rec ? `"${rec.comment}"` : '준비 중'}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 border-t border-slate-100 p-3">
        <button
          onClick={onPreview}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ▶ 미리듣기
        </button>
        <button
          onClick={onPick}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          이걸로
        </button>
      </div>
    </div>
  );
}
