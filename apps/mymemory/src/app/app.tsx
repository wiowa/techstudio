import { Button, Card, CardContent } from '@wiowa-tech-studio/ui';
import { useEffect, useState } from 'react';
import '../styles.css';
import { useMatchLogic } from '../hooks/useMatchLogic';
import type { MatchConfig, Player as MatchPlayer, RoundResult } from '../types/match';
import { MatchConfigScreen } from '../components/MatchConfigScreen';
import { MatchScoreboard } from '../components/MatchScoreboard';
import { BetweenRoundsScreen } from '../components/BetweenRoundsScreen';
import { MatchCompleteModal } from '../components/MatchCompleteModal';
import { useCardSize, getRecommendedGridSize } from '../hooks/useCardSize';

type GameCard = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameMode = 'single' | 'two-player' | 'two-player-match';

export type GridSize = '4x4' | '6x6' | '8x8';

type GridConfig = {
  size: GridSize;
  columns: number;
  pairCount: number;
};

type Player = {
  name: string;
  score: number;
};

const SYMBOLS = [
  '🎮',
  '🎯',
  '🎨',
  '🎭',
  '🎪',
  '🎸',
  '🎺',
  '🎻',
  '🎲',
  '🎰',
  '🎳',
  '🎾',
  '⚽',
  '🏀',
  '🏈',
  '⚾',
  '🎱',
  '🏐',
  '🎬',
  '🎤',
  '🎧',
  '🎼',
  '🎹',
  '🥁',
  '🎷',
  '🎵',
  '🎶',
  '🃏',
  '🎴',
  '🀄',
  '🧩',
  '🪀',
  '🪁',
  '♟️',
  '🕹️',
  '🖼️',
  '🪕',
  '🪘',
  '🎙️',
  '📻',
  '📺',
  '📷',
  '📹',
  '🎥',
  '📽️',
  '🎞️',
  '📸',
  '📱',
  '💻',
  '⌨️',
  '🖱️',
  '🖨️',
  '💾',
  '💿',
  '📀',
  '🎬',
  '🎭',
  '🎪',
  '🎨',
  '🎯',
  '🎱',
  '🎳',
  '🎮',
  '🎰',
  '🎲',
  '🧸',
  '🪆',
  '🎻',
  '🥁',
  '🎺',
  '🎸',
  '🎹',
];

const GRID_CONFIGS: Record<GridSize, GridConfig> = {
  '4x4': { size: '4x4', columns: 4, pairCount: 8 },
  '6x6': { size: '6x6', columns: 6, pairCount: 18 },
  '8x8': { size: '8x8', columns: 8, pairCount: 32 },
};

export function App() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>('6x6');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
  ]);
  const [isVibrating, setIsVibrating] = useState(false);

  // Match mode state
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const {
    matchState,
    startMatch,
    endRound,
    startNextRound,
    rematch,
    endMatch,
    isMatchComplete,
    matchWinner,
  } = useMatchLogic();

  // Dynamic card sizing based on viewport
  const { cardSize, isMobile } = useCardSize(gridSize);

  // Grid size recommendation
  const [gridRecommendation, setGridRecommendation] = useState(getRecommendedGridSize());

  // Update grid recommendation on resize
  useEffect(() => {
    const handleResize = () => {
      setGridRecommendation(getRecommendedGridSize());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Initialize game
  const initializeGame = (mode?: GameMode, size?: GridSize, matchPlayers?: [Player, Player]) => {
    const selectedSize = size || gridSize;
    const config = GRID_CONFIGS[selectedSize];
    const gameSymbols = SYMBOLS.slice(0, config.pairCount);
    const shuffledCards = [...gameSymbols, ...gameSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsGameComplete(false);
    setCurrentPlayer(0);

    // Use match players if provided, otherwise default players
    if (matchPlayers) {
      setPlayers(matchPlayers);
    } else {
      setPlayers([
        { name: 'Player 1', score: 0 },
        { name: 'Player 2', score: 0 },
      ]);
    }

    setIsVibrating(false);
    setRoundStartTime(Date.now());

    if (mode) {
      setGameMode(mode);
    }
    if (size) {
      setGridSize(size);
    }
  };

  const startNewGame = () => {
    setGameMode(null);
    setCards([]);
    endMatch();
  };

  // Match mode handlers
  const handleStartMatch = (config: MatchConfig, matchPlayers: [MatchPlayer, MatchPlayer]) => {
    startMatch(config, matchPlayers);
    initializeGame('two-player-match', config.initialGridSize, matchPlayers);
  };

  const handleRoundComplete = () => {
    if (!matchState || gameMode !== 'two-player-match') return;

    const roundResult: RoundResult = {
      roundNumber: matchState.currentRound,
      winner: players[0].score > players[1].score ? 0 : 1,
      scores: [players[0].score, players[1].score] as [number, number],
      gridSize,
      moves,
      duration: Date.now() - roundStartTime,
    };

    endRound(roundResult);
  };

  const handleNextRound = (newGridSize?: GridSize) => {
    if (!matchState) return;

    startNextRound(newGridSize);

    // Reset scores for next round
    const resetPlayers: [Player, Player] = [
      { ...matchState.players[0], score: 0 },
      { ...matchState.players[1], score: 0 },
    ];

    initializeGame('two-player-match', newGridSize || gridSize, resetPlayers);
  };

  const handleRematch = () => {
    if (!matchState) return;
    rematch();
    initializeGame('two-player-match', matchState.config.initialGridSize, matchState.players);
  };

  const handleCancelMatchConfig = () => {
    setGameMode(null);
  };

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);

          // Update score for 2-player mode
          if (gameMode === 'two-player' || gameMode === 'two-player-match') {
            setPlayers((prev) =>
              prev.map((player, idx) =>
                idx === currentPlayer
                  ? { ...player, score: player.score + 1 }
                  : player
              )
            );
          }
        }, 600);
      } else {
        // No match - trigger vibrate animation
        setIsVibrating(true);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsVibrating(false);

          // Switch player in 2-player mode
          if (gameMode === 'two-player' || gameMode === 'two-player-match') {
            setCurrentPlayer((prev) => (prev === 0 ? 1 : 0));
          }
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards, cards, gameMode, currentPlayer]);

  // Check if game is complete
  useEffect(() => {
    const config = GRID_CONFIGS[gridSize];
    if (matches === config.pairCount && cards.length > 0) {
      setIsGameComplete(true);

      // Handle match round completion
      if (gameMode === 'two-player-match') {
        handleRoundComplete();
      }
    }
  }, [matches, cards, gridSize]);

  const handleCardClick = (id: number) => {
    const card = cards.find((c) => c.id === id);

    if (
      !card ||
      card.isFlipped ||
      card.isMatched ||
      flippedCards.length === 2
    ) {
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, id]);
  };

  return (
    <div className="min-h-screen max-h-screen bg-background py-8 px-4">
      {/*<InstallPWA />*/}
      <div className="container mx-auto max-w-5xl">
        {/* Mode Selection */}
        {!gameMode && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Card className="bg-card text-card-foreground backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center max-w-2xl">
              <h1 className="text-5xl font-bold text-primary mb-4 drop-shadow-lg">
                Memory Game
              </h1>

              {/* Grid Size Selection */}
              <div className="mb-8">
                <p className="text-xl text-secondary-foreground mb-4">
                  Select Grid Size
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {(['4x4', '6x6', '8x8'] as GridSize[]).map((size) => {
                    const isRecommended = size === gridRecommendation.recommended;
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
                {gridRecommendation.warning && gridSize !== gridRecommendation.recommended && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ {gridRecommendation.warning}
                    </p>
                  </div>
                )}
              </div>

              {/* Game Mode Selection */}
              <p className="text-xl text-secondary-foreground mb-4">
                Select Game Mode
              </p>
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  onClick={() => initializeGame('single')}
                  className="text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 min-w-[200px]"
                >
                  Single Player
                </Button>
                <Button
                  size="lg"
                  onClick={() => initializeGame('two-player')}
                  className="text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 min-w-[200px]"
                >
                  2 Players
                </Button>
                <Button
                  size="lg"
                  onClick={() => setGameMode('two-player-match')}
                  className="text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 min-w-[200px]"
                >
                  Match Mode (2 Players)
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Match Configuration Screen */}
        {gameMode === 'two-player-match' && cards.length === 0 && (
          <MatchConfigScreen
            onStartMatch={handleStartMatch}
            onCancel={handleCancelMatchConfig}
            initialGridSize={gridSize}
          />
        )}

        {/* Game Screen */}
        {gameMode && cards.length > 0 && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-primary mb-4 drop-shadow-lg">
                Memory Game
              </h1>

              {/* Match Scoreboard for Match Mode */}
              {gameMode === 'two-player-match' && matchState && (
                <MatchScoreboard
                  matchState={matchState}
                  currentRoundScores={[players[0].score, players[1].score] as [number, number]}
                  currentPlayer={currentPlayer}
                />
              )}

              <p className="text-xl text-secondary-foreground mb-6">
                {gameMode === 'two-player' || gameMode === 'two-player-match'
                  ? `${players[currentPlayer].name}'s Turn`
                  : `Match all ${GRID_CONFIGS[gridSize].pairCount} pairs to win!`}
              </p>

              {/* Stats */}
              {gameMode === 'single' && (
                <div className="flex justify-center gap-8 mb-6">
                  <Card className="bg-card text-card-foreground  backdrop-blur-sm rounded-lg px-6 py-3">
                    <div className=" text-2xl font-bold">{moves}</div>
                    <div className="text-sm">Moves</div>
                  </Card>
                  <Card className="bg-card backdrop-blur-sm rounded-lg px-6 py-3">
                    <div className="text-2xl font-bold">
                      {matches}/{GRID_CONFIGS[gridSize].pairCount}
                    </div>
                    <div className="text-sm">Matches</div>
                  </Card>
                </div>
              )}

              {/* Player Stats for 2-player mode */}
              {(gameMode === 'two-player' || gameMode === 'two-player-match') && (
                <div className="flex justify-center gap-8 mb-6">
                  {players.map((player, idx) => (
                    <Card
                      key={idx}
                      className={`
                       bg-card text-card-foreground backdrop-blur-sm rounded-lg px-6 py-3
                        transition-all duration-300
                        ${
                          idx === currentPlayer
                            ? 'ring-4 ring-secondary scale-105'
                            : 'opacity-70'
                        }
                      `}
                    >
                      <div className="text-2xl font-bold">{player.score}</div>
                      <div className="text-sm">{player.name}</div>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                size="lg"
                onClick={startNewGame}
                className="bg-secondary-foreground text-secondary"
              >
                New Game
              </Button>
            </div>

            {/* Game Board */}
            <div
              className={`bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center ${
                isVibrating ? 'vibrate' : ''
              }`}
              style={{
                padding: isMobile ? '0.75rem' : '2rem',
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${GRID_CONFIGS[gridSize].columns}, ${cardSize}px)`,
                  gap: isMobile ? '0.25rem' : '0.75rem',
                  maxWidth: '100%',
                }}
              >
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`
                      aspect-square cursor-pointer
                      transition-all duration-300 transform
                      ${
                        card.isFlipped || card.isMatched
                          ? 'bg-card scale-105 shadow-lg'
                          : 'bg-gradient-to-br from-secondary to-primary hover:scale-105 hover:shadow-lg'
                      }
                      ${card.isMatched ? 'opacity-70' : ''}
                      ${
                        card.isFlipped || card.isMatched ? '' : 'cursor-pointer'
                      }
                      active:scale-95
                    `}
                  >
                    <CardContent
                      className={`flex items-center justify-center h-full p-0 font-bold ${
                        gridSize === '8x8'
                          ? 'text-2xl'
                          : gridSize === '6x6'
                          ? 'text-4xl'
                          : 'text-5xl'
                      }`}
                    >
                      {card.isFlipped || card.isMatched ? card.symbol : '?'}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Victory Modal - Only for single and two-player modes */}
            {isGameComplete && gameMode !== 'two-player-match' && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {gameMode === 'two-player'
                      ? 'Game Over!'
                      : 'Congratulations!'}
                  </h2>
                  {gameMode === 'single' && (
                    <p className="text-gray-600 mb-6">
                      You completed the game in{' '}
                      <span className="font-bold text-purple-600">{moves}</span>{' '}
                      moves!
                    </p>
                  )}
                  {gameMode === 'two-player' && (
                    <>
                      <div className="mb-6">
                        {players[0].score > players[1].score ? (
                          <p className="text-gray-600">
                            <span className="font-bold text-purple-600">
                              {players[0].name}
                            </span>{' '}
                            wins with{' '}
                            <span className="font-bold">
                              {players[0].score}
                            </span>{' '}
                            matches!
                          </p>
                        ) : players[1].score > players[0].score ? (
                          <p className="text-gray-600">
                            <span className="font-bold text-purple-600">
                              {players[1].name}
                            </span>{' '}
                            wins with{' '}
                            <span className="font-bold">
                              {players[1].score}
                            </span>{' '}
                            matches!
                          </p>
                        ) : (
                          <p className="text-gray-600">
                            It's a tie! Both players scored{' '}
                            <span className="font-bold text-purple-600">
                              {players[0].score}
                            </span>{' '}
                            matches!
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {players.map((player, idx) => (
                          <div
                            key={idx}
                            className="bg-purple-50 rounded-lg p-4"
                          >
                            <div className="text-lg font-semibold text-gray-800">
                              {player.name}
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {player.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <Button size="lg" onClick={startNewGame} className="w-full">
                    New Game
                  </Button>
                </div>
              </div>
            )}

            {/* Between Rounds Screen for Match Mode */}
            {gameMode === 'two-player-match' &&
              matchState &&
              matchState.matchPhase === 'between-rounds' &&
              matchState.roundHistory.length > 0 && (
                <BetweenRoundsScreen
                  roundResult={matchState.roundHistory[matchState.roundHistory.length - 1]}
                  matchState={matchState}
                  onNextRound={handleNextRound}
                />
              )}

            {/* Match Complete Modal */}
            {gameMode === 'two-player-match' &&
              matchState &&
              isMatchComplete &&
              matchState.matchPhase === 'complete' &&
              matchWinner !== null && (
                <MatchCompleteModal
                  matchRecord={{
                    id: `match-${matchState.startTime}`,
                    timestamp: matchState.startTime,
                    config: matchState.config,
                    players: [matchState.players[0].name, matchState.players[1].name] as [string, string],
                    finalScore: matchState.matchScore,
                    rounds: matchState.roundHistory,
                    winner: matchWinner,
                    duration: Date.now() - matchState.startTime,
                  }}
                  onRematch={handleRematch}
                  onNewMatch={startNewGame}
                />
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
