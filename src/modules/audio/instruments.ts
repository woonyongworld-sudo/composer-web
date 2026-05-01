'use client';

import * as Tone from 'tone';

export type InstrumentId = 'piano' | 'organ' | 'pad' | 'guitar';

export type InstrumentMeta = {
  id: InstrumentId;
  name: string;
  description: string;
};

export const INSTRUMENTS: InstrumentMeta[] = [
  { id: 'piano', name: '피아노', description: '실제 그랜드 피아노 샘플' },
  { id: 'organ', name: '오르간', description: '두텁게 지속되는 오르간 샘플' },
  { id: 'guitar', name: '어쿠스틱 기타', description: '나일론 어쿠스틱 기타 샘플' },
  { id: 'pad', name: '신스 패드', description: '부드럽게 깔리는 신스 (합성)' },
];

type ChordPlayer = Tone.Sampler | Tone.PolySynth;

const cache = new Map<InstrumentId, Promise<ChordPlayer>>();

function buildSampler(
  urls: Record<string, string>,
  baseUrl: string,
  release: number,
  volume: number,
): Promise<Tone.Sampler> {
  return new Promise((resolve) => {
    const s = new Tone.Sampler({
      urls,
      release,
      baseUrl,
      onload: () => resolve(s),
    }).toDestination();
    s.volume.value = volume;
  });
}

function buildInstrument(id: InstrumentId): Promise<ChordPlayer> {
  switch (id) {
    case 'piano':
      return buildSampler(
        {
          C3: 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          A3: 'A3.mp3',
          C4: 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
          C5: 'C5.mp3',
          'D#5': 'Ds5.mp3',
          C6: 'C6.mp3',
        },
        'https://tonejs.github.io/audio/salamander/',
        1.5,
        -6,
      );
    case 'organ':
      return buildSampler(
        { C3: 'C3.mp3', C4: 'C4.mp3', C5: 'C5.mp3' },
        'https://nbrosowsky.github.io/tonejs-instruments/samples/organ/',
        0.4,
        -10,
      );
    case 'guitar':
      return buildSampler(
        {
          C3: 'C3.mp3',
          'F#3': 'Fs3.mp3',
          C4: 'C4.mp3',
          'F#4': 'Fs4.mp3',
          C5: 'C5.mp3',
        },
        'https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/',
        0.8,
        -6,
      );
    case 'pad': {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.6, decay: 0.3, sustain: 0.7, release: 2.5 },
      }).toDestination();
      synth.volume.value = -10;
      return Promise.resolve(synth);
    }
  }
}

export function getInstrument(id: InstrumentId): Promise<ChordPlayer> {
  const cached = cache.get(id);
  if (cached) return cached;
  const ready = buildInstrument(id);
  cache.set(id, ready);
  return ready;
}

export function disposeAllInstruments(): void {
  for (const promise of cache.values()) {
    promise.then((inst) => {
      inst.releaseAll?.();
      inst.dispose();
    });
  }
  cache.clear();
}

export type { ChordPlayer };
