'use client';

import * as Tone from 'tone';
import type { Chord } from '@/modules/music/types';

let bass: Tone.MonoSynth | null = null;

export async function ensureBass(): Promise<Tone.MonoSynth> {
  if (!bass) {
    bass = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.55, release: 0.4 },
      filter: { Q: 2, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.001,
        decay: 0.5,
        sustain: 0.3,
        release: 1.0,
        baseFrequency: 180,
        octaves: 2.6,
      },
    }).toDestination();
    bass.volume.value = -10;
  }
  return bass;
}

export function bassNoteForChord(chord: Chord, octave = 2): string {
  return `${chord.root}${octave}`;
}

export async function scheduleBassBar(
  chord: Chord,
  barStartTime: number,
  secPerBeat: number,
): Promise<void> {
  const b = await ensureBass();
  const note = bassNoteForChord(chord, 2);
  b.triggerAttackRelease(note, secPerBeat * 1.9, barStartTime, 0.85);
  b.triggerAttackRelease(
    note,
    secPerBeat * 1.9,
    barStartTime + 2 * secPerBeat,
    0.8,
  );
}

export function disposeBass(): void {
  bass?.dispose();
  bass = null;
}
