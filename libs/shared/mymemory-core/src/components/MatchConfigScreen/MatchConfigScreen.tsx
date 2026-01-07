/**
 * MatchConfigScreen Component
 * Configuration screen for setting up a match-based game
 */

import { Button, Card } from '@wiowa-tech-studio/ui';
import { useState, useEffect } from 'react';
import type { MatchConfig, Player } from '../../types/match';
import type { GridSize } from '../../types/game';
import { getRecommendedGridSize } from '../../hooks/useCardSize';

interface MatchConfigScreenProps {
  onStartMatch: (config: MatchConfig, players: [Player, Player]) => void;
  onCancel: () => void;
  initialGridSize?: GridSize;
}

const GRID_CONFIGS: Record<GridSize, { pairCount: number }> = {
  '4x4': { pairCount: 8 },
  '6x6': { pairCount: 18 },
  '8x8': { pairCount: 32 },
};

export function MatchConfigScreen({
  onStartMatch,
  onCancel,
  initialGridSize = '6x6',
}: MatchConfigScreenProps) {
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [gridSize, setGridSize] = useState<GridSize>(initialGridSize);
  const [roundsToWin, setRoundsToWin] = useState<2 | 3 | 4>(3);
  const [recommendation, setRecommendation] = useState<{
    recommended: GridSize;
    warning?: string;
  }>(getRecommendedGridSize());

  // Update recommendation on window resize
  useEffect(() => {
    const handleResize = () => {
      setRecommendation(getRecommendedGridSize());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleStartMatch = () => {
    const config: MatchConfig = {
      roundsToWin,
      initialGridSize: gridSize,
    };

    const players: [Player, Player] = [
      { name: player1Name.trim() || 'Player 1', score: 0 },
      { name: player2Name.trim() || 'Player 2', score: 0 },
    ];

    onStartMatch(config, players);
  };

  const isValid = player1Name.trim() !== '' && player2Name.trim() !== '';

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="bg-card text-card-foreground backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-primary mb-8 drop-shadow-lg">
          Match Configuration
        </h1>

        {/* Player Names */}
        <div className="mb-8">
          <p className="text-xl text-secondary-foreground mb-4">Player Names</p>
          <div className="space-y-3">
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Player 1"
              maxLength={20}
              className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Player 2"
              maxLength={20}
              className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Grid Size Selection */}
        <div className="mb-8">
          <p className="text-xl text-secondary-foreground mb-4">Grid Size</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {(['4x4', '6x6', '8x8'] as GridSize[]).map((size) => {
              const isRecommended = size === recommendation.recommended;
              return (
                <div key={size} className="relative">
                  <Button
                    onClick={() => setGridSize(size)}
                    className={`
                      text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm h-9 px-4 py-2
                      ${
                        gridSize === size
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-background hover:bg-accent hover:text-accent-foreground'
                      }
                      ${isRecommended ? 'ring-2 ring-green-500' : ''}
                    `}
                  >
                    {size} ({GRID_CONFIGS[size].pairCount} pairs)
                  </Button>
                  {isRecommended && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Warning message */}
          {recommendation.warning && gridSize !== recommendation.recommended && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ {recommendation.warning}
              </p>
            </div>
          )}
        </div>

        {/* Rounds to Win Selection */}
        <div className="mb-8">
          <p className="text-xl text-secondary-foreground mb-4">
            Rounds to Win
          </p>
          <div className="flex justify-center gap-4">
            {[2, 3, 4].map((rounds) => (
              <button
                key={rounds}
                onClick={() => setRoundsToWin(rounds as 2 | 3 | 4)}
                className={`
                  w-16 h-16 rounded-lg border-2 font-bold text-xl
                  transition-all duration-200
                  ${
                    roundsToWin === rounds
                      ? 'bg-primary text-primary-foreground border-primary scale-110'
                      : 'bg-background text-foreground border-input hover:border-primary hover:scale-105'
                  }
                `}
              >
                {rounds}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            First player to win {roundsToWin} rounds wins the match!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={onCancel}
            className="text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartMatch}
            disabled={!isValid}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2 min-w-[120px]"
          >
            Start Match
          </Button>
        </div>
      </Card>
    </div>
  );
}
