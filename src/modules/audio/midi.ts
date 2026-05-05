'use client';

import { Midi } from '@tonejs/midi';
import type { Chord } from '@/modules/music/types';
import { chordToNoteNames } from '@/modules/music/theory';
import type { ChordRhythm, TrackConfig } from './types';

const PROGRAM = {
  piano: 0,
  organ: 19,
  guitar: 24,
  pad: 88,
};

function chordRhythmEvents(
  notes: string[],
  rhythm: ChordRhythm,
  barStartSec: number,
  barDurSec: number,
): { name: string; time: number; duration: number; velocity: number }[] {
  const events: { name: string; time: number; duration: number; velocity: number }[] = [];
  if (rhythm === 'sustain') {
    for (const n of notes) {
      events.push({
        name: n,
        time: barStartSec,
        duration: barDurSec * 0.95,
        velocity: 0.75,
      });
    }
  } else if (rhythm === 'repeat') {
    const beatDur = barDurSec / 4;
    for (let i = 0; i < 4; i++) {
      for (const n of notes) {
        events.push({
          name: n,
          time: barStartSec + i * beatDur,
          duration: beatDur * 0.9,
          velocity: 0.7,
        });
      }
    }
  } else {
    const beatDur = barDurSec / 4;
    for (let i = 0; i < 4; i++) {
      const n = notes[i % notes.length];
      events.push({
        name: n,
        time: barStartSec + i * beatDur,
        duration: beatDur * 0.85,
        velocity: 0.7,
      });
    }
  }
  return events;
}

export function exportProgressionToMidi(
  chords: Chord[],
  bpm: number,
  config: TrackConfig,
): Uint8Array {
  const midi = new Midi();
  midi.header.setTempo(bpm);
  midi.header.timeSignatures.push({ ticks: 0, timeSignature: [4, 4] });

  const secPerBeat = 60 / bpm;
  const barDur = 4 * secPerBeat;

  if (config.chord.enabled) {
    const chordTrack = midi.addTrack();
    chordTrack.name = '코드';
    chordTrack.instrument.number = PROGRAM[config.chord.instrument];
    chords.forEach((chord, i) => {
      const notes = chordToNoteNames(chord, 4);
      const events = chordRhythmEvents(
        notes,
        config.chord.rhythm,
        i * barDur,
        barDur,
      );
      for (const e of events) {
        chordTrack.addNote({
          name: e.name,
          time: e.time,
          duration: e.duration,
          velocity: e.velocity,
        });
      }
    });
  }

  if (config.bass.enabled) {
    const bassTrack = midi.addTrack();
    bassTrack.name = '베이스';
    bassTrack.instrument.number = 33;
    chords.forEach((chord, i) => {
      const note = `${chord.root}2`;
      bassTrack.addNote({
        name: note,
        time: i * barDur,
        duration: secPerBeat * 1.9,
        velocity: 0.85,
      });
      bassTrack.addNote({
        name: note,
        time: i * barDur + 2 * secPerBeat,
        duration: secPerBeat * 1.9,
        velocity: 0.8,
      });
    });
  }

  if (config.drum.enabled) {
    const drumTrack = midi.addTrack();
    drumTrack.name = '드럼';
    drumTrack.channel = 9;
    const threshold = 1 - config.drum.complexity;
    const volScale = 0.3 + config.drum.volume * 0.9;
    chords.forEach((_, i) => {
      const barStart = i * barDur;
      const eighthDur = secPerBeat / 2;
      const pattern = drumPatternEvents(config.drum.pattern);
      for (const h of pattern) {
        if (h.velocity < threshold) continue;
        drumTrack.addNote({
          midi: h.instrument === 'kick' ? 36 : h.instrument === 'snare' ? 38 : 42,
          time: barStart + h.beat * eighthDur,
          duration: eighthDur,
          velocity: Math.min(1, h.velocity * volScale),
        });
      }
    });
  }

  return midi.toArray();
}

type DrumHit = { instrument: 'kick' | 'snare' | 'hihat'; beat: number; velocity: number };

function drumPatternEvents(pattern: string): DrumHit[] {
  const POP: DrumHit[] = [
    { instrument: 'kick', beat: 0, velocity: 1 },
    { instrument: 'kick', beat: 4, velocity: 1 },
    { instrument: 'snare', beat: 2, velocity: 0.95 },
    { instrument: 'snare', beat: 6, velocity: 0.95 },
    { instrument: 'hihat', beat: 0, velocity: 0.5 },
    { instrument: 'hihat', beat: 1, velocity: 0.4 },
    { instrument: 'hihat', beat: 2, velocity: 0.5 },
    { instrument: 'hihat', beat: 3, velocity: 0.4 },
    { instrument: 'hihat', beat: 4, velocity: 0.5 },
    { instrument: 'hihat', beat: 5, velocity: 0.4 },
    { instrument: 'hihat', beat: 6, velocity: 0.5 },
    { instrument: 'hihat', beat: 7, velocity: 0.4 },
  ];
  const ROCK: DrumHit[] = [
    { instrument: 'kick', beat: 0, velocity: 1 },
    { instrument: 'kick', beat: 3, velocity: 0.7 },
    { instrument: 'kick', beat: 4, velocity: 1 },
    { instrument: 'snare', beat: 2, velocity: 1 },
    { instrument: 'snare', beat: 6, velocity: 1 },
    { instrument: 'hihat', beat: 0, velocity: 0.6 },
    { instrument: 'hihat', beat: 1, velocity: 0.5 },
    { instrument: 'hihat', beat: 2, velocity: 0.6 },
    { instrument: 'hihat', beat: 3, velocity: 0.5 },
    { instrument: 'hihat', beat: 4, velocity: 0.6 },
    { instrument: 'hihat', beat: 5, velocity: 0.5 },
    { instrument: 'hihat', beat: 6, velocity: 0.6 },
    { instrument: 'hihat', beat: 7, velocity: 0.5 },
  ];
  const BALLAD: DrumHit[] = [
    { instrument: 'kick', beat: 0, velocity: 0.9 },
    { instrument: 'snare', beat: 4, velocity: 0.75 },
    { instrument: 'hihat', beat: 0, velocity: 0.45 },
    { instrument: 'hihat', beat: 2, velocity: 0.4 },
    { instrument: 'hihat', beat: 4, velocity: 0.45 },
    { instrument: 'hihat', beat: 6, velocity: 0.4 },
  ];
  const FOLK: DrumHit[] = [
    { instrument: 'kick', beat: 0, velocity: 0.75 },
    { instrument: 'hihat', beat: 0, velocity: 0.35 },
    { instrument: 'hihat', beat: 2, velocity: 0.35 },
    { instrument: 'hihat', beat: 4, velocity: 0.35 },
    { instrument: 'hihat', beat: 6, velocity: 0.35 },
  ];
  const JAZZ: DrumHit[] = [
    { instrument: 'kick', beat: 0, velocity: 0.55 },
    { instrument: 'snare', beat: 6, velocity: 0.45 },
    { instrument: 'hihat', beat: 0, velocity: 0.55 },
    { instrument: 'hihat', beat: 2, velocity: 0.5 },
    { instrument: 'hihat', beat: 3, velocity: 0.4 },
    { instrument: 'hihat', beat: 4, velocity: 0.55 },
    { instrument: 'hihat', beat: 6, velocity: 0.5 },
    { instrument: 'hihat', beat: 7, velocity: 0.4 },
  ];
  const map: Record<string, DrumHit[]> = {
    pop: POP,
    rock: ROCK,
    ballad: BALLAD,
    folk: FOLK,
    jazz: JAZZ,
  };
  return map[pattern] ?? POP;
}
