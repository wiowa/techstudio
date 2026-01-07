/**
 * Match Mode Types
 * Type definitions for the match-based multiplayer system
 */

import type { GridSize } from './game';

/**
 * Player type (re-exported from main app for consistency)
 */
export type Player = {
  name: string;
  score: number;
};

/**
 * Match configuration settings
 */
export interface MatchConfig {
  roundsToWin: 2 | 3 | 4;
  initialGridSize: GridSize;
}

/**
 * Phase of the match lifecycle
 */
export type MatchPhase = 'config' | 'playing' | 'between-rounds' | 'complete';

/**
 * Result of a completed round
 */
export interface RoundResult {
  roundNumber: number;
  winner: 0 | 1; // Index of winning player
  scores: [number, number]; // Pairs matched by [player1, player2]
  gridSize: GridSize;
  moves: number; // Total moves in round
  duration: number; // Duration in milliseconds
}

/**
 * Current state of an ongoing match
 */
export interface MatchState {
  config: MatchConfig;
  players: [Player, Player];
  currentRound: number;
  matchScore: [number, number]; // Rounds won by [player1, player2]
  roundHistory: RoundResult[];
  matchPhase: MatchPhase;
  startTime: number; // Match start timestamp
  currentRoundStartTime: number; // Current round start timestamp
}

/**
 * Complete record of a finished match
 */
export interface MatchRecord {
  id: string;
  timestamp: number;
  config: MatchConfig;
  players: [string, string]; // Player names
  finalScore: [number, number]; // Final match score (rounds won)
  rounds: RoundResult[];
  winner: 0 | 1;
  duration: number; // Total match duration in milliseconds
}

/**
 * Aggregated statistics for a player across all matches
 */
export interface PlayerStats {
  name: string;
  matchesPlayed: number;
  matchWins: number;
  totalRoundsPlayed: number;
  totalRoundsWon: number;
  totalPairsMatched: number;
  averageScorePerRound: number;
  lastPlayed: number; // Timestamp of last match
}

/**
 * Local storage structure for current match
 */
export interface StoredMatchState {
  version: string;
  match: MatchState | null;
}

/**
 * Local storage structure for match history
 */
export interface StoredMatchHistory {
  version: string;
  matches: MatchRecord[];
}

/**
 * Local storage structure for player statistics
 */
export interface StoredPlayerStats {
  version: string;
  stats: Record<string, PlayerStats>;
}

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  CURRENT_MATCH: 'mymemory:currentMatch',
  MATCH_HISTORY: 'mymemory:matchHistory',
  PLAYER_STATS: 'mymemory:playerStats',
} as const;

/**
 * Version for local storage schema
 */
export const STORAGE_VERSION = '1.0';

/**
 * Maximum number of matches to keep in history
 */
export const MAX_MATCH_HISTORY = 50;
