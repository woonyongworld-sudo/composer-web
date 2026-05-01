import type {
  Chord,
  ChordQuality,
  DiatonicDegree,
  Key,
  Mood,
  Note,
} from './types';

const NOTES: Note[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

const NOTE_TO_SEMITONE: Record<Note, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
};

const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10];

const MAJOR_QUALITIES: ChordQuality[] = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
];

const MINOR_QUALITIES: ChordQuality[] = [
  'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major',
];

const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  dom7: [0, 4, 7, 10],
};

function transpose(note: Note, semitones: number): Note {
  const idx = NOTES.indexOf(note);
  const next = ((idx + semitones) % 12 + 12) % 12;
  return NOTES[next];
}

export function diatonicChord(key: Key, degree: DiatonicDegree): Chord {
  const scale = key.mode === 'major' ? MAJOR_SCALE_STEPS : NATURAL_MINOR_STEPS;
  const qualities = key.mode === 'major' ? MAJOR_QUALITIES : MINOR_QUALITIES;
  const i = degree - 1;
  return {
    root: transpose(key.tonic, scale[i]),
    quality: qualities[i],
  };
}

export function chordToDegree(chord: Chord, key: Key): DiatonicDegree | null {
  for (let d = 1 as DiatonicDegree; d <= 7; d = (d + 1) as DiatonicDegree) {
    const dc = diatonicChord(key, d);
    if (dc.root === chord.root && dc.quality === chord.quality) return d;
    if (dc.root === chord.root && chord.quality === 'dom7' && dc.quality === 'major') {
      return d;
    }
  }
  return null;
}

export function chordName(chord: Chord): string {
  const suffix: Record<ChordQuality, string> = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    dom7: '7',
  };
  return `${chord.root}${suffix[chord.quality]}`;
}

export function keyDisplay(key: Key): string {
  return key.mode === 'major' ? `${key.tonic}장조` : `${key.tonic}단조`;
}

export function chordToNoteNames(chord: Chord, baseOctave = 4): string[] {
  const rootSemi = NOTE_TO_SEMITONE[chord.root];
  return QUALITY_INTERVALS[chord.quality].map((iv) => {
    const total = rootSemi + iv;
    const octave = baseOctave + Math.floor(total / 12);
    const idx = ((total % 12) + 12) % 12;
    return `${NOTES[idx]}${octave}`;
  });
}

export function suggestKeyFromMood(mood: Mood): Key {
  return {
    tonic: 'C',
    mode: mood.brightness >= 0.5 ? 'major' : 'minor',
  };
}

export function bpmFromMood(mood: Mood): number {
  return Math.round(60 + mood.energy * 80);
}

export const ALL_KEYS: Key[] = (() => {
  const keys: Key[] = [];
  for (const tonic of NOTES) {
    keys.push({ tonic, mode: 'major' });
    keys.push({ tonic, mode: 'minor' });
  }
  return keys;
})();
