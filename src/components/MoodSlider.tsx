'use client';

type Props = {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
};

export default function MoodSlider({ label, leftLabel, rightLabel, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-slate-800">◆ {label}</span>
        <span className="text-xs text-slate-500">{Math.round(value * 100)}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-right text-sm text-slate-500">{leftLabel}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(value * 100)}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
        />
        <span className="w-16 shrink-0 text-sm text-slate-500">{rightLabel}</span>
      </div>
    </div>
  );
}
