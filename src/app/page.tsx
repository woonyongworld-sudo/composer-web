'use client';

import { useEffect, useMemo, useState } from 'react';
import MoodSlider from '@/components/MoodSlider';
import ChordCandidate from '@/components/ChordCandidate';
import TrackPanel from '@/components/TrackPanel';
import { ADVISOR_PANEL, getCandidates } from '@/modules/advisors';
import {
  ALL_KEYS,
  bpmFromMood,
  chordName,
  diatonicChord,
  keyDisplay,
  suggestKeyFromMood,
} from '@/modules/music/theory';
import type {
  Chord,
  Difficulty,
  Key,
  Mood,
  Note,
  SetupState,
} from '@/modules/music/types';
import {
  DEFAULT_TRACK_CONFIG,
  buildSongSections,
  playArrangement,
  playChord,
  playSections,
  setInstrument,
  songDurationSec,
  type TrackConfig,
} from '@/modules/audio';

type Phase = 'landing' | 'setup' | 'compose';

const DEFAULT_MOOD: Mood = { brightness: 0.6, energy: 0.3, tension: 0.3 };

export default function Home() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [setup, setSetup] = useState<SetupState | null>(null);

  if (phase === 'landing') {
    return <Landing onStart={() => setPhase('setup')} />;
  }
  if (phase === 'setup' || !setup) {
    return (
      <Setup
        initial={setup}
        onComplete={(s) => {
          setSetup(s);
          setPhase('compose');
        }}
      />
    );
  }
  return (
    <Compose
      setup={setup}
      onChangeMood={() => setPhase('setup')}
      onUpdateDifficulty={(d) => setSetup({ ...setup, difficulty: d })}
    />
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center">
        <div className="mb-6 text-6xl">🎵</div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
          작곡 도우미
        </h1>
        <p className="mb-2 text-lg text-slate-600">
          코드 진행에서 시작하는 쉬운 작곡
        </p>
        <p className="mb-12 text-base text-slate-500">
          4명의 음악 전문위원이 매 순간 당신의 선택을 함께 고민해드립니다.
        </p>
        <button
          onClick={onStart}
          className="rounded-xl bg-indigo-600 px-10 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700"
        >
          시작하기
        </button>
        <div className="mt-12 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
          {ADVISOR_PANEL.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-3 ${
                a.active
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div
                className={`text-sm font-semibold ${
                  a.active ? 'text-indigo-700' : 'text-slate-500'
                }`}
              >
                {a.name}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {a.active ? '활성' : '준비 중'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Setup({
  initial,
  onComplete,
}: {
  initial: SetupState | null;
  onComplete: (s: SetupState) => void;
}) {
  const [mood, setMood] = useState<Mood>(initial?.mood ?? DEFAULT_MOOD);
  const [keyMode, setKeyMode] = useState<'auto' | 'manual'>(
    initial?.keyChosenByUser ? 'manual' : 'auto',
  );
  const [manualKey, setManualKey] = useState<Key>(
    initial?.keyChosenByUser ? initial.key : { tonic: 'C', mode: 'major' },
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? 'easy',
  );

  const submit = () => {
    const finalKey: Key =
      keyMode === 'auto' ? suggestKeyFromMood(mood) : manualKey;
    onComplete({
      mood,
      key: finalKey,
      difficulty,
      keyChosenByUser: keyMode === 'manual',
    });
  };

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-slate-900">
          어떤 느낌의 곡을 만들고 싶으세요?
        </h2>
        <p className="mb-8 text-sm text-slate-500">
          슬라이더를 조정해서 분위기를 알려주세요. 위원들이 이 느낌에 맞춰 코드를 추천해줘요.
        </p>

        <div className="space-y-6">
          <MoodSlider
            label="밝기"
            leftLabel="어두움"
            rightLabel="밝음"
            value={mood.brightness}
            onChange={(v) => setMood({ ...mood, brightness: v })}
          />
          <MoodSlider
            label="에너지"
            leftLabel="차분함"
            rightLabel="격렬함"
            value={mood.energy}
            onChange={(v) => setMood({ ...mood, energy: v })}
          />
          <MoodSlider
            label="긴장감"
            leftLabel="편안함"
            rightLabel="긴장됨"
            value={mood.tension}
            onChange={(v) => setMood({ ...mood, tension: v })}
          />
        </div>

        <div className="mt-8 space-y-3">
          <div className="text-base font-semibold text-slate-800">◆ 키(조성)</div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
            <input
              type="radio"
              checked={keyMode === 'auto'}
              onChange={() => setKeyMode('auto')}
              className="h-4 w-4 accent-indigo-600"
            />
            <div>
              <div className="text-sm font-medium text-slate-800">추천해주세요</div>
              <div className="text-xs text-slate-500">
                슬라이더 분위기에 맞춰 자동으로 골라드려요 (현재 추천:{' '}
                <span className="font-semibold text-indigo-700">
                  {keyDisplay(suggestKeyFromMood(mood))}
                </span>
                )
              </div>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
            <input
              type="radio"
              checked={keyMode === 'manual'}
              onChange={() => setKeyMode('manual')}
              className="h-4 w-4 accent-indigo-600"
            />
            <div className="flex flex-1 items-center gap-3">
              <span className="text-sm font-medium text-slate-800">내가 고를게요</span>
              <select
                value={`${manualKey.tonic}|${manualKey.mode}`}
                onChange={(e) => {
                  const [tonic, mode] = e.target.value.split('|') as [
                    Note,
                    'major' | 'minor',
                  ];
                  setManualKey({ tonic, mode });
                  setKeyMode('manual');
                }}
                disabled={keyMode !== 'manual'}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
              >
                {ALL_KEYS.map((k) => (
                  <option key={`${k.tonic}|${k.mode}`} value={`${k.tonic}|${k.mode}`}>
                    {keyDisplay(k)}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <div className="mt-8 space-y-3">
          <div className="text-base font-semibold text-slate-800">◆ 난이도</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDifficulty('easy')}
              className={`rounded-lg border p-3 text-left transition ${
                difficulty === 'easy'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-semibold">쉬움</div>
              <div className="mt-1 text-xs text-slate-500">
                위원 코멘트가 평이한 말로 나와요
              </div>
            </button>
            <button
              onClick={() => setDifficulty('normal')}
              className={`rounded-lg border p-3 text-left transition ${
                difficulty === 'normal'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-semibold">보통</div>
              <div className="mt-1 text-xs text-slate-500">
                음악 용어를 그대로 사용해요
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-10 w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          시작하기
        </button>
      </div>
    </main>
  );
}

function Compose({
  setup,
  onChangeMood,
  onUpdateDifficulty,
}: {
  setup: SetupState;
  onChangeMood: () => void;
  onUpdateDifficulty: (d: Difficulty) => void;
}) {
  const initial = useMemo(() => [diatonicChord(setup.key, 1)], [setup.key]);
  const [progression, setProgression] = useState<Chord[]>(initial);
  const [maxLength, setMaxLength] = useState(4);
  const [trackConfig, setTrackConfig] = useState<TrackConfig>(DEFAULT_TRACK_CONFIG);
  const [busy, setBusy] = useState<null | 'loading' | 'playing'>(null);

  useEffect(() => {
    setInstrument(trackConfig.chord.instrument);
  }, [trackConfig.chord.instrument]);

  const isComplete = progression.length >= maxLength;
  const bpm = bpmFromMood(setup.mood);

  const candidates = useMemo(() => {
    if (isComplete) return [];
    return getCandidates({
      progression,
      key: setup.key,
      mood: setup.mood,
      difficulty: setup.difficulty,
    });
  }, [progression, setup, isComplete]);

  const pickChord = (chord: Chord) => {
    setProgression((p) => [...p, chord]);
  };

  const undo = () => {
    setProgression((p) => (p.length > 1 ? p.slice(0, -1) : p));
  };

  const reset = () => {
    setProgression(initial);
  };

  const extend = () => setMaxLength(8);

  const runWithIndicator = async (
    play: () => Promise<void>,
    estimatedSec: number,
  ) => {
    if (busy) return;
    setBusy('loading');
    try {
      await play();
      setBusy('playing');
      window.setTimeout(() => {
        setBusy((b) => (b === 'playing' ? null : b));
      }, estimatedSec * 1000);
    } catch (e) {
      console.error(e);
      setBusy(null);
    }
  };

  const playFull = () =>
    runWithIndicator(
      () => playArrangement(progression, bpm, trackConfig),
      progression.length * 4 * (60 / bpm),
    );

  const playWithCandidate = (cand: Chord) => {
    const chords = [...progression, cand];
    return runWithIndicator(
      () => playArrangement(chords, bpm, trackConfig),
      chords.length * 4 * (60 / bpm),
    );
  };

  const playSong = () => {
    const sections = buildSongSections(progression.length, trackConfig);
    return runWithIndicator(
      () => playSections(progression, bpm, sections),
      songDurationSec(progression.length, bpm, sections),
    );
  };

  const download = () => {
    const text = progressionToText(progression, setup);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progression-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            작곡 도우미
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-xl font-bold text-slate-900">
              {keyDisplay(setup.key)}
            </span>
            <span className="text-sm text-slate-500">
              {bpm} BPM · 진행 {progression.length} / {maxLength}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={setup.difficulty}
            onChange={(e) => onUpdateDifficulty(e.target.value as Difficulty)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="easy">난이도: 쉬움</option>
            <option value="normal">난이도: 보통</option>
          </select>
          <button
            onClick={onChangeMood}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            분위기 수정
          </button>
        </div>
      </header>

      <TrackPanel config={trackConfig} onChange={setTrackConfig} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-slate-700">진행</div>
        <div className="flex flex-wrap items-center gap-3">
          {progression.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => playChord(c)}
                className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-indigo-200 bg-indigo-50 text-2xl font-bold text-indigo-900 transition hover:border-indigo-400 hover:bg-indigo-100"
                title="이 코드만 들어보기"
              >
                {chordName(c)}
              </button>
              {i < progression.length - 1 && (
                <span className="text-slate-300">→</span>
              )}
            </div>
          ))}
          {!isComplete && (
            <>
              <span className="text-slate-300">→</span>
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-2xl text-slate-300">
                ?
              </div>
            </>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={playFull}
            disabled={busy !== null}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'loading'
              ? '⏳ 준비 중…'
              : busy === 'playing'
                ? '🎵 재생 중…'
                : '▶ 전체 들어보기'}
          </button>
          <button
            onClick={playSong}
            disabled={busy !== null || progression.length < 2}
            title="인트로–벌스–코러스–아웃트로 구조로 약 1분 길이로 들려줘요"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ▶ 곡으로 듣기 (~1분)
          </button>
          <button
            onClick={undo}
            disabled={progression.length <= 1 || busy !== null}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            ◀ 되돌리기
          </button>
          <button
            onClick={reset}
            disabled={busy !== null}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            처음부터
          </button>
          {busy === 'loading' && (
            <span className="text-xs text-slate-500">
              샘플 불러오는 중… 처음 한 번만 기다려주세요.
            </span>
          )}
        </div>
      </section>

      {!isComplete && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              다음 코드를 골라주세요
            </h3>
            <span className="text-xs text-slate-500">
              위원들이 추천한 후보 {candidates.length}개
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {candidates.map((c, i) => (
              <ChordCandidate
                key={`${c.degree}-${i}`}
                chord={c.chord}
                perAdvisor={c.perAdvisor}
                onPreview={() => playWithCandidate(c.chord)}
                onPick={() => pickChord(c.chord)}
              />
            ))}
          </div>
        </section>
      )}

      {isComplete && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-900">
            🎉 {maxLength}코드 진행이 완성됐어요!
          </h3>
          <p className="mt-1 text-sm text-emerald-800">
            ▶ 전체 들어보기로 들어보시고, 마음에 들면 다운로드하세요.
          </p>
        </section>
      )}

      <section className="flex flex-wrap gap-3">
        {!isComplete && maxLength === 4 && (
          <button
            onClick={extend}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            8코드로 늘리기
          </button>
        )}
        <button
          onClick={download}
          disabled={progression.length < 2}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          진행 다운로드
        </button>
      </section>
    </main>
  );
}

function progressionToText(progression: Chord[], setup: SetupState): string {
  const lines = [
    '# 작곡 도우미 - 진행',
    '',
    `키: ${keyDisplay(setup.key)}`,
    `BPM: ${bpmFromMood(setup.mood)}`,
    `분위기: 밝기 ${Math.round(setup.mood.brightness * 100)}% · 에너지 ${Math.round(setup.mood.energy * 100)}% · 긴장감 ${Math.round(setup.mood.tension * 100)}%`,
    '',
    `진행: ${progression.map(chordName).join(' - ')}`,
  ];
  return lines.join('\n');
}
