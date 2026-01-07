/**
 * RoundHistoryIndicator Component
 * Visual indicator showing who won each completed round
 */

import type { RoundResult, Player } from '../../types/match';

interface RoundHistoryIndicatorProps {
  roundHistory: RoundResult[];
  players: [Player, Player];
  currentRound: number;
  roundsToWin: number;
}

export function RoundHistoryIndicator({
  roundHistory,
  players,
  currentRound,
  roundsToWin,
}: RoundHistoryIndicatorProps) {
  // Create array of indicators (filled for won, empty for remaining)
  const indicators = Array.from({ length: roundsToWin }, (_, index) => {
    const round = roundHistory[index];
    return {
      index,
      winner: round?.winner,
      hasResult: Boolean(round),
    };
  });

  return (
    <div className="flex items-center gap-2">
      {indicators.map(({ index, winner, hasResult }) => (
        <div
          key={index}
          className="flex items-center gap-1"
          title={
            hasResult
              ? `Round ${index + 1}: ${players[winner!].name} won`
              : `Round ${index + 1}: Not played yet`
          }
        >
          {/* Player 1 indicator */}
          <div
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${
                hasResult && winner === 0
                  ? 'bg-primary scale-110'
                  : 'bg-muted border border-muted-foreground/30'
              }
            `}
          />

          {/* Player 2 indicator */}
          <div
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${
                hasResult && winner === 1
                  ? 'bg-secondary scale-110'
                  : 'bg-muted border border-muted-foreground/30'
              }
            `}
          />
        </div>
      ))}
    </div>
  );
}
