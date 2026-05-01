export type Note =
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F'
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'dom7';

export type Chord = {
  root: Note;
  quality: ChordQuality;
};

export type Mode = 'major' | 'minor';

export type Key = {
  tonic: Note;
  mode: Mode;
};

export type DiatonicDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Mood = {
  brightness: number;
  energy: number;
  tension: number;
};

export type Difficulty = 'easy' | 'normal';

export type SetupState = {
  mood: Mood;
  key: Key;
  difficulty: Difficulty;
  keyChosenByUser: boolean;
};
