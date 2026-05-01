'use client';

import {
  CHORD_RHYTHMS,
  DRUM_PATTERNS,
  INSTRUMENTS,
  type ChordRhythm,
  type DrumPatternId,
  type InstrumentId,
  type TrackConfig,
} from '@/modules/audio';

type Props = {
  config: TrackConfig;
  onChange: (next: TrackConfig) => void;
};

export default function TrackPanel({ config, onChange }: Props) {
  const update = (patch: Partial<TrackConfig>) => onChange({ ...config, ...patch });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-sm font-semibold text-slate-700">트랙</div>
        <div className="text-xs text-slate-400">
          켜진 트랙들이 함께 재생돼요
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TrackRow
          icon="🎹"
          name="코드"
          enabled={config.chord.enabled}
          onToggle={() =>
            update({ chord: { ...config.chord, enabled: !config.chord.enabled } })
          }
        >
          <select
            value={config.chord.instrument}
            onChange={(e) =>
              update({
                chord: { ...config.chord, instrument: e.target.value as InstrumentId },
              })
            }
            disabled={!config.chord.enabled}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-50"
            title={INSTRUMENTS.find((i) => i.id === config.chord.instrument)?.description}
          >
            {INSTRUMENTS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select
            value={config.chord.rhythm}
            onChange={(e) =>
              update({
                chord: { ...config.chord, rhythm: e.target.value as ChordRhythm },
              })
            }
            disabled={!config.chord.enabled}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-50"
            title={CHORD_RHYTHMS.find((r) => r.id === config.chord.rhythm)?.description}
          >
            {CHORD_RHYTHMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </TrackRow>

        <TrackRow
          icon="🎸"
          name="베이스"
          enabled={config.bass.enabled}
          onToggle={() =>
            update({ bass: { enabled: !config.bass.enabled } })
          }
        >
          <span className="text-xs text-slate-500">루트음 1·3박</span>
        </TrackRow>

        <TrackRow
          icon="🥁"
          name="드럼"
          enabled={config.drum.enabled}
          onToggle={() =>
            update({ drum: { ...config.drum, enabled: !config.drum.enabled } })
          }
        >
          <select
            value={config.drum.pattern}
            onChange={(e) =>
              update({
                drum: { ...config.drum, pattern: e.target.value as DrumPatternId },
              })
            }
            disabled={!config.drum.enabled}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-50"
            title={DRUM_PATTERNS.find((p) => p.id === config.drum.pattern)?.description}
          >
            {DRUM_PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </TrackRow>

        <TrackRow icon="🎵" name="멜로디" enabled={false} disabled>
          <span className="text-xs italic text-slate-400">준비 중</span>
        </TrackRow>
      </div>
    </section>
  );
}

function TrackRow({
  icon,
  name,
  enabled,
  disabled,
  onToggle,
  children,
}: {
  icon: string;
  name: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        disabled
          ? 'border-slate-200 bg-slate-50 opacity-70'
          : enabled
            ? 'border-indigo-200 bg-indigo-50'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-800">{name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">{children}</div>
      </div>
      {!disabled && onToggle && (
        <button
          onClick={onToggle}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            enabled
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      )}
    </div>
  );
}
