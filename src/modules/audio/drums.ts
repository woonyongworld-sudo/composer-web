'use client';

import * as Tone from 'tone';
import type { DrumPatternId } from './types';

type Hit = {
  instrument: 'kick' | 'snare' | 'hihat';
  beat: number;
  velocity: number;
};

const POP: Hit[] = [
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

const ROCK: Hit[] = [
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

const BALLAD: Hit[] = [
  { instrument: 'kick', beat: 0, velocity: 0.9 },
  { instrument: 'snare', beat: 4, velocity: 0.75 },
  { instrument: 'hihat', beat: 0, velocity: 0.45 },
  { instrument: 'hihat', beat: 2, velocity: 0.4 },
  { instrument: 'hihat', beat: 4, velocity: 0.45 },
  { instrument: 'hihat', beat: 6, velocity: 0.4 },
];

const FOLK: Hit[] = [
  { instrument: 'kick', beat: 0, velocity: 0.75 },
  { instrument: 'hihat', beat: 0, velocity: 0.35 },
  { instrument: 'hihat', beat: 2, velocity: 0.35 },
  { instrument: 'hihat', beat: 4, velocity: 0.35 },
  { instrument: 'hihat', beat: 6, velocity: 0.35 },
];

const JAZZ: Hit[] = [
  { instrument: 'kick', beat: 0, velocity: 0.55 },
  { instrument: 'snare', beat: 6, velocity: 0.45 },
  { instrument: 'hihat', beat: 0, velocity: 0.55 },
  { instrument: 'hihat', beat: 2, velocity: 0.5 },
  { instrument: 'hihat', beat: 3, velocity: 0.4 },
  { instrument: 'hihat', beat: 4, velocity: 0.55 },
  { instrument: 'hihat', beat: 6, velocity: 0.5 },
  { instrument: 'hihat', beat: 7, velocity: 0.4 },
];

const PATTERNS: Record<DrumPatternId, Hit[]> = {
  pop: POP,
  rock: ROCK,
  ballad: BALLAD,
  folk: FOLK,
  jazz: JAZZ,
};

type DrumKit = {
  kick: Tone.Player;
  snare: Tone.Player;
  kickVolume: Tone.Volume;
  snareVolume: Tone.Volume;
  hihat: Tone.MetalSynth;
};

let kit: DrumKit | null = null;
let kitReady: Promise<DrumKit> | null = null;

export function ensureDrums(): Promise<DrumKit> {
  if (!kitReady) {
    kitReady = (async () => {
      const kickVolume = new Tone.Volume(-4).toDestination();
      const snareVolume = new Tone.Volume(-6).toDestination();

      const loadPlayer = (url: string) =>
        new Promise<Tone.Player>((resolve) => {
          const p = new Tone.Player({
            url,
            onload: () => resolve(p),
          });
        });

      const [kickPlayer, snarePlayer] = await Promise.all([
        loadPlayer(
          'https://tonejs.github.io/audio/drum-samples/acoustic-kit/kick.mp3',
        ),
        loadPlayer(
          'https://tonejs.github.io/audio/drum-samples/acoustic-kit/snare.mp3',
        ),
      ]);
      kickPlayer.connect(kickVolume);
      snarePlayer.connect(snareVolume);

      const hihat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.06, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).toDestination();
      hihat.volume.value = -22;

      kit = { kick: kickPlayer, snare: snarePlayer, kickVolume, snareVolume, hihat };
      return kit;
    })();
  }
  return kitReady;
}

function velocityToDb(velocity: number): number {
  return 20 * Math.log10(Math.max(0.01, velocity));
}

function filterHitsByComplexity(hits: Hit[], complexity: number): Hit[] {
  const threshold = 1 - complexity;
  return hits.filter((h) => h.velocity >= threshold);
}

export async function scheduleDrumBar(
  pattern: DrumPatternId,
  barStartTime: number,
  secPerBeat: number,
  complexity = 0.6,
  volume = 0.7,
): Promise<void> {
  const k = await ensureDrums();
  const baseHits = PATTERNS[pattern];
  const hits = filterHitsByComplexity(baseHits, complexity);
  const volScale = 0.3 + volume * 0.9;

  for (const h of hits) {
    const time = barStartTime + h.beat * 0.5 * secPerBeat;
    const vel = Math.min(1, h.velocity * volScale);
    if (h.instrument === 'kick') {
      k.kickVolume.volume.setValueAtTime(-4 + velocityToDb(vel), time);
      k.kick.start(time);
    } else if (h.instrument === 'snare') {
      k.snareVolume.volume.setValueAtTime(-6 + velocityToDb(vel), time);
      k.snare.start(time);
    } else {
      k.hihat.triggerAttackRelease('C5', '32n', time, vel);
    }
  }
}

export function disposeDrums(): void {
  if (kit) {
    kit.kick.dispose();
    kit.snare.dispose();
    kit.kickVolume.dispose();
    kit.snareVolume.dispose();
    kit.hihat.dispose();
    kit = null;
  }
  kitReady = null;
}
