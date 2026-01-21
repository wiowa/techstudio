/**
 * BetweenRoundsScreen Component
 * Displayed between rounds with statistics and next round options
 */

import { Button, Card } from '@wiowa-tech-studio/ui';
import { useState } from 'react';
import type { RoundResult, MatchState, GridSize } from '../types/match';
import { RoundHistoryIndicator } from './RoundHistoryIndicator';

interface BetweenRoundsScreenProps {
  roundResult: RoundResult;
  matchState: MatchState;
  onNextRound: (newGridSize?: GridSize) => void;
}

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
  const [selectedGridSize, setSelectedGridSize] = useState<GridSize>(
    roundResult.gridSize
  );

  const winner = matchState.players[roundResult.winner];

  const handleNextRound = () => {
    const gridSizeChanged = selectedGridSize !== roundResult.gridSize;
    onNextRound(gridSizeChanged ? selectedGridSize : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-card text-card-foreground rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        {/* Round Complete Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-primary mb-1">
            Round {roundResult.roundNumber} Complete!
          </h2>
          <p className="text-xl font-bold text-foreground">
            {winner.name} Wins This Round!
          </p>
        </div>

        {/* Match Score */}
        <div className="mb-4">
          <p className="text-center text-xs text-muted-foreground mb-2">
            Match Score
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">
                {matchState.matchScore[0]}
              </div>
              <div className="text-xs text-muted-foreground">
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
              <div className="text-xl font-bold text-secondary">
                {matchState.matchScore[1]}
              </div>
              <div className="text-xs text-muted-foreground">
                {matchState.players[1].name}
              </div>
            </div>
          </div>
        </div>

        {/* Round Statistics */}
        <div className="mb-4">
          <p className="text-center text-xs text-muted-foreground mb-2">
            Round {roundResult.roundNumber} Statistics
          </p>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">
                  {matchState.players[0].name}:
                </span>{' '}
                {roundResult.scores[0]} pairs
              </div>
              <div>
                <span className="font-semibold">
                  {matchState.players[1].name}:
                </span>{' '}
                {roundResult.scores[1]} pairs
              </div>
              <div className="col-span-2 text-center text-muted-foreground text-xs">
                Duration: {formatDuration(roundResult.duration)} | Moves:{' '}
                {roundResult.moves}
              </div>
            </div>
          </div>
        </div>

        {/* Grid Size Selection for Next Round */}
        <div className="mb-4">
          <p className="text-center text-xs text-muted-foreground mb-2">
            Grid Size for Next Round
          </p>
          <div className="flex justify-center gap-2">
            {(['4x4', '6x6', '8x8'] as GridSize[]).map((size) => (
              <Button
                key={size}
                onClick={() => setSelectedGridSize(size)}
                className={`
                  text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm h-9 px-3 py-2
                  ${
                    selectedGridSize === size
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-background hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                {size}
              </Button>
            ))}
          </div>
          {selectedGridSize !== roundResult.gridSize && (
            <p className="text-center text-xs text-muted-foreground mt-1">
              Changed from {roundResult.gridSize} to {selectedGridSize}
            </p>
          )}
        </div>

        {/* Next Round Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleNextRound}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px]"
          >
            Next Round
          </Button>
        </div>
      </Card>
    </div>
  );
}
