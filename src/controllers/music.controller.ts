import { Response } from 'express';
import { AuthenticatedRequest, successResponse } from '../types';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  /** Duration in seconds */
  duration: number;
  coverUrl: string;
}

/**
 * Static seeded trending tracks.
 * TODO: Replace with a real music provider integration (e.g. TikTok Sound API,
 * Spotify Charts API, or a dedicated music licensing service).
 */
const TRENDING_TRACKS: MusicTrack[] = [
  {
    id: 'trending-1',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    duration: 175,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e0c7e6413adb1e0dde9e9f5d',
  },
  {
    id: 'trending-2',
    title: 'Beautiful Things',
    artist: 'Benson Boone',
    duration: 218,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2731c13a89dc48dbfca0fd8b553',
  },
  {
    id: 'trending-3',
    title: 'Paint The Town Red',
    artist: 'Doja Cat',
    duration: 234,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2736ca52c24b8f7b36e1fede0fc',
  },
  {
    id: 'trending-4',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    duration: 200,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273f429549123dbe8552764ba1d',
  },
  {
    id: 'trending-5',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    duration: 178,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647',
  },
  {
    id: 'trending-6',
    title: 'As It Was',
    artist: 'Harry Styles',
    duration: 167,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14',
  },
  {
    id: 'trending-7',
    title: 'Unholy',
    artist: 'Sam Smith ft. Kim Petras',
    duration: 156,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273a0c8c4f6c9a5b8e8d0e62d84',
  },
  {
    id: 'trending-8',
    title: 'Levitating',
    artist: 'Dua Lipa',
    duration: 203,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2730b1df5e6fc7a3d8dde3c4a5e',
  },
];

/**
 * Static seeded favorites list.
 * TODO: Persist per-user favorites in the database when music provider is integrated.
 */
const FAVORITES_TRACKS: MusicTrack[] = [
  {
    id: 'fav-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: 200,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
  },
  {
    id: 'fav-2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    duration: 234,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
  },
  {
    id: 'fav-3',
    title: 'Stay',
    artist: 'Justin Bieber & The Kid LAROI',
    duration: 141,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2737f89b43c3ab1dba7d09e5e47',
  },
  {
    id: 'fav-4',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    duration: 174,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f',
  },
  {
    id: 'fav-5',
    title: 'Peaches',
    artist: 'Justin Bieber',
    duration: 198,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
  },
];

/**
 * GET /api/music/trending
 * Returns a static list of trending music tracks.
 * TODO: Replace with live data from a music provider API.
 */
export async function getTrendingMusic(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json(successResponse({ tracks: TRENDING_TRACKS }));
}

/**
 * GET /api/music/favorites
 * Returns a static list of favorite music tracks.
 * TODO: Query per-user favorites from the database once music provider is integrated.
 */
export async function getFavoritesMusic(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json(successResponse({ tracks: FAVORITES_TRACKS }));
}
