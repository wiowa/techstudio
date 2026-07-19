/**
 * BetweenRoundsScreen Component
 * Écran affiché entre deux manches (design harmonisé).
 */

import { useState } from 'react';
import type { RoundResult, MatchState } from '../types/match';
import type { GridSize } from '../app/app';
import { RoundHistoryIndicator } from './RoundHistoryIndicator';

interface BetweenRoundsScreenProps {
  roundResult: RoundResult;
  matchState: MatchState;
  onNextRound: (newGridSize?: GridSize) => void;
}

const GRID_META: Record<GridSize, { label: string; color: string }> = {
  '4x4': { label: 'Easy', color: '#64A18A' },
  '6x6': { label: 'Medium', color: '#A88550' },
  '8x8': { label: 'Hard', color: '#9B3A14' },
};

const PLAYER_COLORS = ['#64A18A', '#A88550'];

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function BetweenRoundsScreen({
  roundResult,
  matchState,
  onNextRound,
}: BetweenRoundsScreenProps) {
  const [selectedGridSize, setSelectedGridSize] = useState<GridSize>(roundResult.gridSize);

  const winner = matchState.players[roundResult.winner];

  const handleNextRound = () => {
    const gridSizeChanged = selectedGridSize !== roundResult.gridSize;
    onNextRound(gridSizeChanged ? selectedGridSize : undefined);
  };

  const labelStyle = {
    fontFamily: 'Akshar, sans-serif',
    fontWeight: 400 as const,
    fontSize: 12,
    letterSpacing: '0.05em',
    color: '#434C41',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-[40px] px-8 py-8 shadow-2xl"
        style={{ backgroundColor: '#D1D2BF', fontFamily: 'Akshar, sans-serif' }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* En-tête */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-4xl">🎉</div>
            <span
              className="leading-none"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 26, color: '#2D2D2D' }}
            >
              Round {roundResult.roundNumber} complete
            </span>
            <span className="uppercase" style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', color: '#000000' }}>
              {winner.name} wins this round
            </span>
          </div>

          {/* Score du match */}
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-center uppercase" style={labelStyle}>
              Match score
            </p>
            <div className="flex items-center justify-center gap-5">
              <div className="text-center">
                <div style={{ fontWeight: 600, fontSize: 26, lineHeight: 1, color: PLAYER_COLORS[0] }}>
                  {matchState.matchScore[0]}
                </div>
                <div className="uppercase" style={{ fontWeight: 400, fontSize: 11, color: '#434C41' }}>
                  {matchState.players[0].name}
                </div>
              </div>
              <RoundHistoryIndicator
                roundHistory={matchState.roundHistory}
                players={matchState.players}
                currentRound={matchState.currentRound}
                roundsToWin={matchState.config.roundsToWin}
              />
              <div className="text-center">
                <div style={{ fontWeight: 600, fontSize: 26, lineHeight: 1, color: PLAYER_COLORS[1] }}>
                  {matchState.matchScore[1]}
                </div>
                <div className="uppercase" style={{ fontWeight: 400, fontSize: 11, color: '#434C41' }}>
                  {matchState.players[1].name}
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques de la manche */}
          <div className="w-full max-w-[300px]">
            <div
              className="flex flex-col gap-1 rounded-lg px-4 py-3 text-center uppercase"
              style={{ backgroundColor: '#EFEFEE', fontWeight: 300, fontSize: 11, letterSpacing: '-0.02em', color: '#434C41' }}
            >
              <span>
                {matchState.players[0].name}: {roundResult.scores[0]} pairs · {matchState.players[1].name}: {roundResult.scores[1]} pairs
              </span>
              <span>
                Duration {formatDuration(roundResult.duration)} · Moves {roundResult.moves}
              </span>
            </div>
          </div>

          {/* Grille pour la prochaine manche */}
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-center uppercase" style={labelStyle}>
              Grid for next round
            </p>
            <div className="flex justify-center gap-2">
              {(['4x4', '6x6', '8x8'] as GridSize[]).map((size) => {
                const isSelected = selectedGridSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedGridSize(size)}
                    className={`rounded-lg px-4 py-2 uppercase transition-all duration-200 ${
                      isSelected ? 'scale-105 ring-2 ring-white' : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: GRID_META[size].color, color: '#FFFFFF', fontWeight: 600, fontSize: 12, letterSpacing: '-0.03em' }}
                  >
                    {GRID_META[size].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bouton manche suivante */}
          <button
            type="button"
            onClick={handleNextRound}
            className="w-full max-w-[300px] rounded-lg px-6 py-3 uppercase transition-transform duration-200 hover:scale-[1.03]"
            style={{ backgroundColor: '#9B3A14', color: '#FFFFFF', fontWeight: 600, fontSize: 14, letterSpacing: '-0.03em' }}
          >
            Next round
          </button>
        </div>
      </div>
    </div>
  );
}
