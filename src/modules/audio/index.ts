'use client';

import * as Tone from 'tone';
import type { Chord } from '@/modules/music/types';
import { chordToNoteNames } from '@/modules/music/theory';
import {
  disposeAllInstruments,
  getInstrument,
  type InstrumentId,
} from './instruments';
import { scheduleDrumBar, ensureDrums, disposeDrums } from './drums';
import { scheduleBassBar, ensureBass, disposeBass } from './bass';
import type { ChordRhythm, SongSection, TrackConfig } from './types';

export type { InstrumentId } from './instruments';
export { INSTRUMENTS } from './instruments';
export type { ChordRhythm, DrumPatternId, TrackConfig, SongSection } from './types';
export {
  CHORD_RHYTHMS,
  DRUM_PATTERNS,
  DEFAULT_TRACK_CONFIG,
  buildSongSections,
} from './types';
export { exportProgressionToMidi } from './midi';

let started = false;
let currentInstrument: InstrumentId = 'piano';

export async function ensureAudioStart(): Promise<void> {
  if (!started) {
    await Tone.start();
    started = true;
  }
}

export function setInstrument(id: InstrumentId): void {
  currentInstrument = id;
  void getInstrument(id);
}

export async function playChord(chord: Chord, durationSec = 1.4): Promise<void> {
  await ensureAudioStart();
  const synth = await getInstrument(currentInstrument);
  const notes = chordToNoteNames(chord, 4);
  synth.triggerAttackRelease(notes, durationSec);
}

async function preloadForConfig(config: TrackConfig): Promise<void> {
  const preloads: Promise<unknown>[] = [];
  if (config.chord.enabled) preloads.push(getInstrument(config.chord.instrument));
  if (config.bass.enabled) preloads.push(ensureBass());
  if (config.drum.enabled) preloads.push(ensureDrums());
  if (preloads.length) await Promise.all(preloads);
}

export function songDurationSec(
  chordCount: number,
  bpm: number,
  sections: SongSection[],
): number {
  const totalBars = sections.reduce((sum, s) => sum + s.bars, 0);
  void chordCount;
  return totalBars * 4 * (60 / bpm);
}

export async function playSections(
  chords: Chord[],
  bpm: number,
  sections: SongSection[],
): Promise<void> {
  await ensureAudioStart();

  const allConfigs = sections.map((s) => s.config);
  await Promise.all(allConfigs.map(preloadForConfig));

  const secPerBeat = 60 / bpm;
  const barDur = 4 * secPerBeat;
  const start = Tone.now() + 0.15;

  let barIdx = 0;
  const tasks: Promise<void>[] = [];
  for (const section of sections) {
    for (let i = 0; i < section.bars; i++) {
      const chord = chords[i % chords.length];
      const barStart = start + barIdx * barDur;
      const cfg = section.config;
      if (cfg.chord.enabled) {
        const localInstrument = cfg.chord.instrument;
        tasks.push(
          (async () => {
            const synth = await getInstrument(localInstrument);
            const notes = chordToNoteNames(chord, 4);
            scheduleChordBarWith(synth, notes, cfg.chord.rhythm, barStart, secPerBeat);
          })(),
        );
      }
      if (cfg.bass.enabled) {
        tasks.push(scheduleBassBar(chord, barStart, secPerBeat));
      }
      if (cfg.drum.enabled) {
        tasks.push(
          scheduleDrumBar(
            cfg.drum.pattern,
            barStart,
            secPerBeat,
            cfg.drum.complexity,
            cfg.drum.volume,
          ),
        );
      }
      barIdx++;
    }
  }
  await Promise.all(tasks);
}

function scheduleChordBarWith(
  synth: Awaited<ReturnType<typeof getInstrument>>,
  notes: string[],
  rhythm: ChordRhythm,
  barStartTime: number,
  secPerBeat: number,
): void {
  const barDur = 4 * secPerBeat;
  if (rhythm === 'sustain') {
    synth.triggerAttackRelease(notes, barDur * 0.95, barStartTime);
    return;
  }
  if (rhythm === 'repeat') {
    for (let i = 0; i < 4; i++) {
      synth.triggerAttackRelease(notes, secPerBeat * 0.9, barStartTime + i * secPerBeat);
    }
    return;
  }
  if (rhythm === 'arpeggio') {
    for (let i = 0; i < 4; i++) {
      const note = notes[i % notes.length];
      synth.triggerAttackRelease(note, secPerBeat * 0.85, barStartTime + i * secPerBeat);
    }
    return;
  }
}

export async function playArrangement(
  chords: Chord[],
  bpm: number,
  config: TrackConfig,
): Promise<void> {
  await playSections(chords, bpm, [
    { name: 'main', config, bars: chords.length },
  ]);
}

export function stopAll(): void {
  disposeAllInstruments();
  disposeDrums();
  disposeBass();
}
