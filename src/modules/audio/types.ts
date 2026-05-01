import type { InstrumentId } from './instruments';

export type ChordRhythm = 'sustain' | 'repeat' | 'arpeggio';

export type DrumPatternId = 'pop' | 'rock' | 'ballad' | 'folk' | 'jazz';

export type TrackConfig = {
  chord: { enabled: boolean; instrument: InstrumentId; rhythm: ChordRhythm };
  bass: { enabled: boolean };
  drum: { enabled: boolean; pattern: DrumPatternId };
};

export const DEFAULT_TRACK_CONFIG: TrackConfig = {
  chord: { enabled: true, instrument: 'piano', rhythm: 'sustain' },
  bass: { enabled: true },
  drum: { enabled: true, pattern: 'pop' },
};

export const CHORD_RHYTHMS: { id: ChordRhythm; name: string; description: string }[] = [
  { id: 'sustain', name: '유지', description: '한 번만 띵— 길게 끄는 느낌' },
  { id: 'repeat', name: '반복', description: '매 박자마다 코드를 다시 침' },
  { id: 'arpeggio', name: '아르페지오', description: '코드 음을 하나씩 차례로' },
];

export const DRUM_PATTERNS: { id: DrumPatternId; name: string; description: string }[] = [
  { id: 'pop', name: '팝', description: '4/4 백비트, 가장 흔한 느낌' },
  { id: 'rock', name: '록', description: '강한 킥과 스네어' },
  { id: 'ballad', name: '발라드', description: '느리고 부드러운 비트' },
  { id: 'folk', name: '포크', description: '단순하고 가벼운 비트' },
  { id: 'jazz', name: '재즈(간이)', description: '하이햇 위주의 가벼운 박자' },
];

export type SongSection = {
  name: string;
  config: TrackConfig;
  bars: number;
};

export function buildSongSections(
  chordCount: number,
  base: TrackConfig,
): SongSection[] {
  const baseBars = Math.max(2, chordCount);

  const intro: TrackConfig = {
    chord: { ...base.chord, rhythm: 'sustain' },
    bass: { ...base.bass },
    drum: { ...base.drum, enabled: false },
  };

  const verse: TrackConfig = {
    chord: { ...base.chord, rhythm: 'sustain' },
    bass: { ...base.bass },
    drum: { ...base.drum, pattern: 'folk' },
  };

  const chorus: TrackConfig = base;

  const outro: TrackConfig = {
    chord: { ...base.chord, rhythm: 'sustain' },
    bass: { ...base.bass, enabled: false },
    drum: { ...base.drum, enabled: false },
  };

  return [
    { name: '인트로', config: intro, bars: 2 },
    { name: '벌스 1', config: verse, bars: baseBars },
    { name: '코러스 1', config: chorus, bars: baseBars },
    { name: '벌스 2', config: verse, bars: baseBars },
    { name: '코러스 2', config: chorus, bars: baseBars },
    { name: '아웃트로', config: outro, bars: 2 },
  ];
}
