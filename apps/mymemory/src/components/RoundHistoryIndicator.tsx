/**
 * RoundHistoryIndicator Component
 * Indicateur visuel des manches gagnées (design harmonisé).
 */

import type { RoundResult, Player } from '../types/match';

interface RoundHistoryIndicatorProps {
  roundHistory: RoundResult[];
  players: [Player, Player];
  currentRound: number;
  roundsToWin: number;
}

// Accents par joueur (cohérents avec les écrans du mode match)
const PLAYER_COLORS = ['#64A18A', '#A88550'];

export function RoundHistoryIndicator({
  roundHistory,
  players,
  roundsToWin,
}: RoundHistoryIndicatorProps) {
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
          {/* Indicateur joueur 1 */}
          <span
            className="h-3 w-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                hasResult && winner === 0 ? PLAYER_COLORS[0] : 'rgba(67, 76, 65, 0.15)',
              transform: hasResult && winner === 0 ? 'scale(1.1)' : 'none',
            }}
          />
          {/* Indicateur joueur 2 */}
          <span
            className="h-3 w-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                hasResult && winner === 1 ? PLAYER_COLORS[1] : 'rgba(67, 76, 65, 0.15)',
              transform: hasResult && winner === 1 ? 'scale(1.1)' : 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}
