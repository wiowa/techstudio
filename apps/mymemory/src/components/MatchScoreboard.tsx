/**
 * MatchScoreboard Component
 * Progression du match pendant la partie (design harmonisé).
 */

import type { MatchState } from '../types/match';
import { RoundHistoryIndicator } from './RoundHistoryIndicator';

interface MatchScoreboardProps {
  matchState: MatchState;
  currentRoundScores: [number, number];
  currentPlayer: 0 | 1;
}

const PLAYER_COLORS = ['#64A18A', '#A88550'];

export function MatchScoreboard({
  matchState,
  currentRoundScores,
  currentPlayer,
}: MatchScoreboardProps) {
  const { players, currentRound, matchScore, roundHistory, config } = matchState;

  return (
    <div
      className="flex w-full max-w-[320px] flex-col gap-3 rounded-2xl px-5 py-4"
      style={{ backgroundColor: '#EFEFEE', fontFamily: 'Akshar, sans-serif' }}
    >
      {/* Compteur de manche */}
      <p
        className="text-center uppercase"
        style={{ fontWeight: 400, fontSize: 12, letterSpacing: '0.05em', color: '#434C41' }}
      >
        Round {currentRound} | First to {config.roundsToWin}
      </p>

      {/* Score du match + historique */}
      <div className="flex items-center justify-between gap-3">
        {/* Joueur 1 */}
        <div
          className="flex flex-1 flex-col items-end text-right transition-all duration-300"
          style={{ opacity: currentPlayer === 0 ? 1 : 0.6 }}
        >
          <span
            className="uppercase leading-none"
            style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em', color: '#434C41' }}
          >
            {players[0].name}
          </span>
          <span style={{ fontWeight: 600, fontSize: 26, lineHeight: 1, color: PLAYER_COLORS[0] }}>
            {matchScore[0]}
          </span>
        </div>

        <RoundHistoryIndicator
          roundHistory={roundHistory}
          players={players}
          currentRound={currentRound}
          roundsToWin={config.roundsToWin}
        />

        {/* Joueur 2 */}
        <div
          className="flex flex-1 flex-col items-start text-left transition-all duration-300"
          style={{ opacity: currentPlayer === 1 ? 1 : 0.6 }}
        >
          <span
            className="uppercase leading-none"
            style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em', color: '#434C41' }}
          >
            {players[1].name}
          </span>
          <span style={{ fontWeight: 600, fontSize: 26, lineHeight: 1, color: PLAYER_COLORS[1] }}>
            {matchScore[1]}
          </span>
        </div>
      </div>

      {/* Scores de la manche en cours */}
      <div
        className="flex items-center justify-center gap-3 uppercase"
        style={{ fontWeight: 300, fontSize: 11, letterSpacing: '-0.02em', color: '#434C41' }}
      >
        <span>
          {players[0].name}: {currentRoundScores[0]} pairs
        </span>
        <span>|</span>
        <span>
          {players[1].name}: {currentRoundScores[1]} pairs
        </span>
      </div>
    </div>
  );
}
