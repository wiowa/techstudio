/**
 * useMatchLogic Hook
 * Manages match state lifecycle, round progression, and winner determination
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MatchConfig,
  MatchState,
  MatchRecord,
  RoundResult,
  Player,
} from '../types/match';
import type { GridSize } from '../types/game';
import { useLocalStorageMatch } from './useLocalStorageMatch';

export interface UseMatchLogicReturn {
  matchState: MatchState | null;
  startMatch: (config: MatchConfig, players: [Player, Player]) => void;
  endRound: (roundResult: RoundResult) => void;
  startNextRound: (newGridSize?: GridSize) => void;
  rematch: () => void;
  endMatch: () => void;
  resumeMatch: (match: MatchState) => void;
  isMatchComplete: boolean;
  matchWinner: 0 | 1 | null;
  hasMatchInProgress: boolean;
}

/**
 * Hook for managing match logic and state
 */
export function useMatchLogic(): UseMatchLogicReturn {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const {
    currentMatch,
    saveMatchState,
    completeMatch: saveCompletedMatch,
    clearCurrentMatch,
  } = useLocalStorageMatch();

  /**
   * Initialize match state from local storage on mount
   */
  useEffect(() => {
    if (currentMatch && !matchState) {
      setMatchState(currentMatch);
    }
  }, [currentMatch]);

  /**
   * Check if match is complete
   */
  const isMatchComplete = useMemo(() => {
    if (!matchState) return false;
    return matchState.matchPhase === 'complete';
  }, [matchState]);

  /**
   * Determine match winner
   */
  const matchWinner = useMemo((): 0 | 1 | null => {
    if (!matchState || !isMatchComplete) return null;

    const [score1, score2] = matchState.matchScore;
    if (score1 > score2) return 0;
    if (score2 > score1) return 1;
    return null; // Tie (shouldn't happen in best-of format)
  }, [matchState, isMatchComplete]);

  /**
   * Check if there's a match in progress
   */
  const hasMatchInProgress = useMemo(() => {
    return matchState !== null && !isMatchComplete;
  }, [matchState, isMatchComplete]);

  /**
   * Start a new match
   */
  const startMatch = useCallback(
    (config: MatchConfig, players: [Player, Player]) => {
      const now = Date.now();
      const newMatchState: MatchState = {
        config,
        players,
        currentRound: 1,
        matchScore: [0, 0],
        roundHistory: [],
        matchPhase: 'playing',
        startTime: now,
        currentRoundStartTime: now,
      };

      setMatchState(newMatchState);
      saveMatchState(newMatchState);
    },
    [saveMatchState]
  );

  /**
   * Resume an existing match
   */
  const resumeMatch = useCallback((match: MatchState) => {
    setMatchState(match);
  }, []);

  /**
   * End current round and update match state
   */
  const endRound = useCallback(
    (roundResult: RoundResult) => {
      if (!matchState || matchState.matchPhase !== 'playing') {
        console.warn('Cannot end round: No active match or wrong phase');
        return;
      }

      // Update match score
      const newMatchScore: [number, number] = [...matchState.matchScore];
      newMatchScore[roundResult.winner] += 1;

      // Add round to history
      const newRoundHistory = [...matchState.roundHistory, roundResult];

      // Check if match is complete
      const roundsToWin = matchState.config.roundsToWin;
      const isComplete =
        newMatchScore[0] >= roundsToWin || newMatchScore[1] >= roundsToWin;

      const updatedMatchState: MatchState = {
        ...matchState,
        matchScore: newMatchScore,
        roundHistory: newRoundHistory,
        matchPhase: isComplete ? 'complete' : 'between-rounds',
      };

      setMatchState(updatedMatchState);
      saveMatchState(updatedMatchState);

      // If match is complete, save the match record
      if (isComplete) {
        const winner: 0 | 1 =
          newMatchScore[0] >= roundsToWin
            ? 0
            : 1;

        const matchRecord: MatchRecord = {
          id: `match-${matchState.startTime}`,
          timestamp: matchState.startTime,
          config: matchState.config,
          players: [matchState.players[0].name, matchState.players[1].name],
          finalScore: newMatchScore,
          rounds: newRoundHistory,
          winner,
          duration: Date.now() - matchState.startTime,
        };

        saveCompletedMatch(matchRecord);
      }
    },
    [matchState, saveMatchState, saveCompletedMatch]
  );

  /**
   * Start next round in the match
   */
  const startNextRound = useCallback(
    (newGridSize?: GridSize) => {
      if (!matchState || matchState.matchPhase !== 'between-rounds') {
        console.warn('Cannot start next round: No match or wrong phase');
        return;
      }

      const updatedMatchState: MatchState = {
        ...matchState,
        currentRound: matchState.currentRound + 1,
        matchPhase: 'playing',
        currentRoundStartTime: Date.now(),
        // Update grid size if provided
        ...(newGridSize && {
          config: {
            ...matchState.config,
            initialGridSize: newGridSize,
          },
        }),
      };

      setMatchState(updatedMatchState);
      saveMatchState(updatedMatchState);
    },
    [matchState, saveMatchState]
  );

  /**
   * Start a rematch with same configuration
   */
  const rematch = useCallback(() => {
    if (!matchState) {
      console.warn('Cannot rematch: No match state');
      return;
    }

    startMatch(matchState.config, matchState.players);
  }, [matchState, startMatch]);

  /**
   * End match and clear state
   */
  const endMatch = useCallback(() => {
    setMatchState(null);
    clearCurrentMatch();
  }, [clearCurrentMatch]);

  return {
    matchState,
    startMatch,
    endRound,
    startNextRound,
    rematch,
    endMatch,
    resumeMatch,
    isMatchComplete,
    matchWinner,
    hasMatchInProgress,
  };
}
