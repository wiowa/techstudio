/**
 * useLocalStorageMatch Hook
 * Manages local storage operations for match data persistence
 */

import { useCallback, useEffect, useState } from 'react';
import type {
  MatchState,
  MatchRecord,
  PlayerStats,
  StoredMatchState,
  StoredMatchHistory,
  StoredPlayerStats,
} from '../types/match';
import {
  STORAGE_KEYS,
  STORAGE_VERSION,
  MAX_MATCH_HISTORY,
} from '../types/match';

export interface UseLocalStorageMatchReturn {
  currentMatch: MatchState | null;
  matchHistory: MatchRecord[];
  playerStats: Record<string, PlayerStats>;
  saveMatchState: (match: MatchState) => void;
  completeMatch: (matchRecord: MatchRecord) => void;
  clearCurrentMatch: () => void;
  getPlayerStats: (playerName: string) => PlayerStats | null;
}

/**
 * Hook for managing match data in local storage
 */
export function useLocalStorageMatch(): UseLocalStorageMatchReturn {
  const [currentMatch, setCurrentMatch] = useState<MatchState | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>(
    {}
  );

  // Load data from local storage on mount
  useEffect(() => {
    loadCurrentMatch();
    loadMatchHistory();
    loadPlayerStats();
  }, []);

  /**
   * Load current match from local storage
   */
  const loadCurrentMatch = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH);
      if (stored) {
        const data: StoredMatchState = JSON.parse(stored);
        if (data.version === STORAGE_VERSION && data.match) {
          setCurrentMatch(data.match);
        }
      }
    } catch (error) {
      console.error('Error loading current match:', error);
    }
  }, []);

  /**
   * Load match history from local storage
   */
  const loadMatchHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      if (stored) {
        const data: StoredMatchHistory = JSON.parse(stored);
        if (data.version === STORAGE_VERSION) {
          setMatchHistory(data.matches);
        }
      }
    } catch (error) {
      console.error('Error loading match history:', error);
    }
  }, []);

  /**
   * Load player statistics from local storage
   */
  const loadPlayerStats = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
      if (stored) {
        const data: StoredPlayerStats = JSON.parse(stored);
        if (data.version === STORAGE_VERSION) {
          setPlayerStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  }, []);

  /**
   * Save current match state to local storage
   */
  const saveMatchState = useCallback((match: MatchState) => {
    try {
      const data: StoredMatchState = {
        version: STORAGE_VERSION,
        match,
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(data));
      setCurrentMatch(match);
    } catch (error) {
      console.error('Error saving match state:', error);
      // Handle storage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Clearing old match history.');
        clearOldMatchHistory();
      }
    }
  }, []);

  /**
   * Clear current match from local storage
   */
  const clearCurrentMatch = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MATCH);
      setCurrentMatch(null);
    } catch (error) {
      console.error('Error clearing current match:', error);
    }
  }, []);

  /**
   * Complete a match and update history and player stats
   */
  const completeMatch = useCallback(
    (matchRecord: MatchRecord) => {
      try {
        // Update match history
        const updatedHistory = [matchRecord, ...matchHistory].slice(
          0,
          MAX_MATCH_HISTORY
        );
        const historyData: StoredMatchHistory = {
          version: STORAGE_VERSION,
          matches: updatedHistory,
        };
        localStorage.setItem(
          STORAGE_KEYS.MATCH_HISTORY,
          JSON.stringify(historyData)
        );
        setMatchHistory(updatedHistory);

        // Update player statistics
        const updatedStats = { ...playerStats };

        matchRecord.players.forEach((playerName, idx) => {
          const isWinner = idx === matchRecord.winner;
          const roundsWon = matchRecord.finalScore[idx];
          const totalPairs = matchRecord.rounds.reduce(
            (sum, round) => sum + round.scores[idx],
            0
          );

          if (!updatedStats[playerName]) {
            updatedStats[playerName] = {
              name: playerName,
              matchesPlayed: 0,
              matchWins: 0,
              totalRoundsPlayed: 0,
              totalRoundsWon: 0,
              totalPairsMatched: 0,
              averageScorePerRound: 0,
              lastPlayed: 0,
            };
          }

          const stats = updatedStats[playerName];
          stats.matchesPlayed += 1;
          stats.matchWins += isWinner ? 1 : 0;
          stats.totalRoundsPlayed += matchRecord.rounds.length;
          stats.totalRoundsWon += roundsWon;
          stats.totalPairsMatched += totalPairs;
          stats.averageScorePerRound =
            stats.totalPairsMatched / stats.totalRoundsPlayed;
          stats.lastPlayed = matchRecord.timestamp;
        });

        const statsData: StoredPlayerStats = {
          version: STORAGE_VERSION,
          stats: updatedStats,
        };
        localStorage.setItem(
          STORAGE_KEYS.PLAYER_STATS,
          JSON.stringify(statsData)
        );
        setPlayerStats(updatedStats);

        // Clear current match
        clearCurrentMatch();
      } catch (error) {
        console.error('Error completing match:', error);
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('Storage quota exceeded. Clearing old match history.');
          clearOldMatchHistory();
        }
      }
    },
    [matchHistory, playerStats, clearCurrentMatch]
  );

  /**
   * Get statistics for a specific player
   */
  const getPlayerStats = useCallback(
    (playerName: string): PlayerStats | null => {
      return playerStats[playerName] || null;
    },
    [playerStats]
  );

  /**
   * Clear old match history to free up storage space
   */
  const clearOldMatchHistory = useCallback(() => {
    try {
      const reducedHistory = matchHistory.slice(0, Math.floor(MAX_MATCH_HISTORY / 2));
      const historyData: StoredMatchHistory = {
        version: STORAGE_VERSION,
        matches: reducedHistory,
      };
      localStorage.setItem(
        STORAGE_KEYS.MATCH_HISTORY,
        JSON.stringify(historyData)
      );
      setMatchHistory(reducedHistory);
    } catch (error) {
      console.error('Error clearing old match history:', error);
    }
  }, [matchHistory]);

  return {
    currentMatch,
    matchHistory,
    playerStats,
    saveMatchState,
    completeMatch,
    clearCurrentMatch,
    getPlayerStats,
  };
}
