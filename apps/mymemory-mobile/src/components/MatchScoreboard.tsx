/**
 * MatchScoreboard Component
 * Displays match progress during gameplay
 */

import { Card } from '@wiowa-tech-studio/ui';
import type { MatchState } from '../types/match';
import { RoundHistoryIndicator } from './RoundHistoryIndicator';

interface MatchScoreboardProps {
  matchState: MatchState;
  currentRoundScores: [number, number];
  currentPlayer: 0 | 1;
}

export function MatchScoreboard({
  matchState,
  currentRoundScores,
  currentPlayer,
}: MatchScoreboardProps) {
  const { players, currentRound, matchScore, roundHistory, config } =
    matchState;

  return (
    <Card className="bg-card text-card-foreground border-b backdrop-blur-sm rounded-lg mb-6 p-4">
      <div className="flex flex-col gap-3">
        {/* Round Counter */}
        <div className="text-center">
          <span className="text-sm font-medium text-muted-foreground">
            Round {currentRound} | First to {config.roundsToWin}
          </span>
        </div>

        {/* Match Score and Round History */}
        <div className="flex items-center justify-center gap-6">
          {/* Player 1 */}
          <div className="flex items-center gap-3">
            <div
              className={`text-right transition-all duration-300 ${
                currentPlayer === 0 ? 'scale-110' : 'opacity-70'
              }`}
            >
              <div className="text-lg font-bold text-foreground">
                {players[0].name}
              </div>
              <div className="text-2xl font-bold text-primary">
                {matchScore[0]}
              </div>
            </div>
          </div>

          {/* Round History Indicators */}
          <RoundHistoryIndicator
            roundHistory={roundHistory}
            players={players}
            currentRound={currentRound}
            roundsToWin={config.roundsToWin}
          />

          {/* Player 2 */}
          <div className="flex items-center gap-3">
            <div
              className={`text-left transition-all duration-300 ${
                currentPlayer === 1 ? 'scale-110' : 'opacity-70'
              }`}
            >
              <div className="text-lg font-bold text-foreground">
                {players[1].name}
              </div>
              <div className="text-2xl font-bold text-secondary">
                {matchScore[1]}
              </div>
            </div>
          </div>
        </div>

        {/* Current Round Scores */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>
            {players[0].name}: {currentRoundScores[0]} pairs
          </span>
          <span>|</span>
          <span>
            {players[1].name}: {currentRoundScores[1]} pairs
          </span>
        </div>
      </div>
    </Card>
  );
}
