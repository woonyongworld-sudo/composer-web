import type { DiatonicDegree, Mode } from '@/modules/music/types';

export type FamousSong = {
  title: string;
  artist: string;
  mode: Mode;
  section: 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'intro';
  progression: DiatonicDegree[];
};

export const FAMOUS_SONGS: FamousSong[] = [
  { title: '좋은 날', artist: 'IU', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: '밤편지', artist: 'IU', mode: 'major', section: 'verse', progression: [1, 6, 4, 5] },
  { title: '봄날', artist: 'BTS', mode: 'major', section: 'chorus', progression: [6, 4, 1, 5] },
  { title: '사건의 지평선', artist: '윤하', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: '걱정말아요 그대', artist: '이적', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: '야생화', artist: '박효신', mode: 'minor', section: 'chorus', progression: [1, 6, 4, 5] },
  { title: '거리에서', artist: '김광석', mode: 'minor', section: 'verse', progression: [1, 6, 4, 5] },
  { title: 'Lonely Night', artist: '부활', mode: 'minor', section: 'chorus', progression: [6, 4, 5, 1] },
  { title: '너의 모든 순간', artist: '성시경', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: '잊혀진 계절', artist: '이용', mode: 'minor', section: 'verse', progression: [6, 2, 5, 1] },
  { title: 'Through the Night', artist: 'IU', mode: 'major', section: 'verse', progression: [4, 5, 3, 6] },
  { title: '드라마', artist: '아이유', mode: 'major', section: 'chorus', progression: [1, 4, 5, 1] },
  { title: 'Cheer Up', artist: 'TWICE', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: 'Dynamite', artist: 'BTS', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: 'How You Like That', artist: 'BLACKPINK', mode: 'minor', section: 'chorus', progression: [1, 6, 7, 6] },
  { title: '벚꽃엔딩', artist: '버스커버스커', mode: 'major', section: 'chorus', progression: [4, 5, 3, 6] },
  { title: '소녀', artist: '이문세', mode: 'major', section: 'verse', progression: [1, 6, 2, 5] },
  { title: '광화문연가', artist: '이문세', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: '말리꽃', artist: '이승철', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: '서른 즈음에', artist: '김광석', mode: 'minor', section: 'verse', progression: [1, 4, 5, 1] },
  { title: 'Let It Be', artist: 'The Beatles', mode: 'major', section: 'verse', progression: [1, 5, 6, 4] },
  { title: 'Don\'t Stop Believin\'', artist: 'Journey', mode: 'major', section: 'verse', progression: [1, 5, 6, 4] },
  { title: 'No Woman No Cry', artist: 'Bob Marley', mode: 'major', section: 'verse', progression: [1, 5, 6, 4] },
  { title: 'Someone Like You', artist: 'Adele', mode: 'major', section: 'chorus', progression: [1, 3, 6, 4] },
  { title: 'Stand By Me', artist: 'Ben E. King', mode: 'major', section: 'verse', progression: [1, 6, 4, 5] },
  { title: 'Autumn Leaves', artist: 'Jazz Standard', mode: 'minor', section: 'verse', progression: [2, 5, 1, 4] },
  { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', mode: 'minor', section: 'verse', progression: [6, 2, 5, 1] },
  { title: 'Hey Jude', artist: 'The Beatles', mode: 'major', section: 'verse', progression: [1, 5, 4, 1] },
  { title: 'Wonderwall', artist: 'Oasis', mode: 'major', section: 'verse', progression: [1, 5, 4, 1] },
  { title: 'Take On Me', artist: 'a-ha', mode: 'major', section: 'chorus', progression: [4, 5, 3, 6] },
  { title: 'Baby', artist: 'Justin Bieber', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
  { title: 'Despacito', artist: 'Luis Fonsi', mode: 'minor', section: 'chorus', progression: [6, 4, 1, 5] },
  { title: 'Perfect', artist: 'Ed Sheeran', mode: 'major', section: 'chorus', progression: [1, 5, 6, 4] },
];

export type Match = {
  song: FamousSong;
  matchedFrom: DiatonicDegree;
  matchedTo: DiatonicDegree;
};

export function findSongsMatching(
  fromDegree: DiatonicDegree,
  toDegree: DiatonicDegree,
  mode: Mode,
): Match[] {
  const matches: Match[] = [];
  for (const song of FAMOUS_SONGS) {
    if (song.mode !== mode) continue;
    for (let i = 0; i < song.progression.length - 1; i++) {
      if (
        song.progression[i] === fromDegree &&
        song.progression[i + 1] === toDegree
      ) {
        matches.push({ song, matchedFrom: fromDegree, matchedTo: toDegree });
        break;
      }
    }
  }
  return matches;
}
