import { Button } from '@wiowa-tech-studio/ui';
import { useEffect, useState } from 'react';
import '../styles.css';
import { useMatchLogic } from '../hooks/useMatchLogic';
import type { MatchConfig, Player as MatchPlayer, RoundResult } from '../types/match';
import { MatchConfigScreen } from '../components/MatchConfigScreen';
import { GameStartScreen } from '../components/GameStartScreen';
import { MatchScoreboard } from '../components/MatchScoreboard';
import { BetweenRoundsScreen } from '../components/BetweenRoundsScreen';
import { MatchCompleteModal } from '../components/MatchCompleteModal';
import { useCardSize } from '../hooks/useCardSize';

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

// Métadonnées de difficulté par grille (couleur, libellé, niveau) — design Figma
const DIFFICULTY: Record<
  GridSize,
  { label: string; sub: string; color: string; level: 1 | 2 | 3 }
> = {
  '4x4': { label: 'Easy', sub: '4 x 4 (8 pairs)', color: '#64A18A', level: 1 },
  '6x6': { label: 'Medium', sub: '6 x 6 (18 pairs)', color: '#A88550', level: 2 },
  '8x8': { label: 'Hard', sub: '8 x 8 (32 pairs)', color: '#9B3A14', level: 3 },
};

/** Indicateur de niveau (3 barres croissantes, `level` allumées). */
function DifficultyBars({ level }: { level: 1 | 2 | 3 }) {
  const heights = [5, 10, 15];
  return (
    <div className="flex items-end gap-[4px]" style={{ height: 15 }}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[4px] rounded-full bg-white"
          style={{ height: h, opacity: i < level ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
}

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

  // Rejouer la même partie (même mode / même grille)
  const handleTryAgain = () => {
    if (gameMode === 'two-player-match') {
      handleRematch();
    } else if (gameMode) {
      initializeGame(gameMode, gridSize);
    }
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
    <div className="min-h-screen max-h-screen bg-background py-8 px-4 overflow-x-hidden">
      {/*<InstallPWA />*/}
      <div className="container mx-auto max-w-5xl">
        {/* Mode Selection (design Figma) */}
        {!gameMode && (
          <GameStartScreen
            initialGridSize={gridSize}
            onStart={(mode, grid) => initializeGame(mode, grid)}
            onStartMatch={(grid) => {
              setGridSize(grid);
              setGameMode('two-player-match');
            }}
          />
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
            {/* Écran de jeu (design Figma) */}
            <div
              className="mx-auto w-fit max-w-full rounded-[40px] px-6 py-8 shadow-2xl"
              style={{ backgroundColor: '#D1D2BF', fontFamily: 'Akshar, sans-serif' }}
            >
              <div className="flex flex-col items-center gap-6">
                {/* Logo MindGym */}
                <div className="flex flex-col items-center gap-1">
                  <img
                    src="/assets/game/mindgym-logo.svg"
                    alt="MindGym"
                    className="h-auto w-[80px]"
                  />
                  <span
                    className="leading-none text-black"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20 }}
                  >
                    MindGym
                  </span>
                  <span
                    className="uppercase text-black"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      fontSize: 8,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Train your brain
                  </span>
                </div>

                {/* Stats : Moves / Matches / Difficulté */}
                <div className="flex flex-wrap items-stretch justify-center gap-3">
                  <div
                    className="flex min-w-[100px] flex-col items-center justify-center rounded-lg px-4 py-3"
                    style={{ backgroundColor: '#3A413A' }}
                  >
                    <span
                      style={{
                        fontFamily: 'Akshar, sans-serif',
                        fontWeight: 600,
                        fontSize: 28,
                        letterSpacing: '0.1em',
                        color: '#F2F2F2',
                        lineHeight: 1,
                      }}
                    >
                      {moves}
                    </span>
                    <span
                      className="uppercase"
                      style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 400, fontSize: 10, color: '#F2F2F2' }}
                    >
                      Moves
                    </span>
                  </div>
                  <div
                    className="flex min-w-[100px] flex-col items-center justify-center rounded-lg px-4 py-3"
                    style={{ backgroundColor: 'rgba(30, 71, 30, 0.61)' }}
                  >
                    <span style={{ color: '#F2F2F2', lineHeight: 1 }}>
                      <span
                        style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 600, fontSize: 28, letterSpacing: '0.1em' }}
                      >
                        {matches}
                      </span>
                      <span
                        style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 400, fontSize: 15, letterSpacing: '0.1em' }}
                      >
                        /{GRID_CONFIGS[gridSize].pairCount}
                      </span>
                    </span>
                    <span
                      className="uppercase"
                      style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 400, fontSize: 10, color: '#F2F2F2' }}
                    >
                      Matches
                    </span>
                  </div>
                  <div
                    className="flex min-w-[100px] items-center gap-2 rounded-lg px-4 py-3"
                    style={{ backgroundColor: DIFFICULTY[gridSize].color }}
                  >
                    <DifficultyBars level={DIFFICULTY[gridSize].level} />
                    <div className="flex flex-col">
                      <span
                        className="uppercase leading-tight text-white"
                        style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em' }}
                      >
                        {DIFFICULTY[gridSize].label}
                      </span>
                      <span
                        className="uppercase leading-tight text-white"
                        style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 300, fontSize: 10, letterSpacing: '-0.03em' }}
                      >
                        {DIFFICULTY[gridSize].sub}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scoreboard mode match */}
                {gameMode === 'two-player-match' && matchState && (
                  <MatchScoreboard
                    matchState={matchState}
                    currentRoundScores={[players[0].score, players[1].score] as [number, number]}
                    currentPlayer={currentPlayer}
                  />
                )}

                {/* Scores mode 2 joueurs */}
                {(gameMode === 'two-player' || gameMode === 'two-player-match') && (
                  <div className="flex items-center justify-center gap-4">
                    {players.map((player, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg px-4 py-2 text-center transition-all ${
                          idx === currentPlayer ? 'scale-105 ring-2 ring-black' : 'opacity-70'
                        }`}
                        style={{ backgroundColor: '#EFEFEE' }}
                      >
                        <div className="text-xl font-bold" style={{ color: '#434C41' }}>
                          {player.score}
                        </div>
                        <div className="text-xs uppercase" style={{ color: '#434C41' }}>
                          {player.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-transform hover:scale-[1.03]"
                    style={{ backgroundColor: '#EFEFEE' }}
                  >
                    <img src="/assets/game/icon-back.svg" alt="" className="h-5 w-5" />
                    <span
                      className="uppercase"
                      style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em', color: '#434C41' }}
                    >
                      Change mode
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-transform hover:scale-[1.03]"
                    style={{ backgroundColor: '#EFEFEE' }}
                  >
                    <img src="/assets/game/icon-retry.svg" alt="" className="h-[18px] w-[18px]" />
                    <span
                      className="uppercase"
                      style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em', color: '#434C41' }}
                    >
                      Try again
                    </span>
                  </button>
                </div>

                {/* Consigne / tour */}
                <p
                  className="text-center uppercase text-black"
                  style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 500, fontSize: 16, letterSpacing: '0.05em' }}
                >
                  {gameMode === 'two-player' || gameMode === 'two-player-match'
                    ? `${players[currentPlayer].name}'s turn`
                    : `Match all ${GRID_CONFIGS[gridSize].pairCount} pairs to win`}
                </p>

                {/* Plateau */}
                <div className={`flex items-center justify-center ${isVibrating ? 'vibrate' : ''}`}>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${GRID_CONFIGS[gridSize].columns}, ${cardSize}px)`,
                      gap: isMobile ? '0.25rem' : '0.4rem',
                      maxWidth: '100%',
                    }}
                  >
                    {cards.map((card) => {
                      const revealed = card.isFlipped || card.isMatched;
                      return (
                        <div
                          key={card.id}
                          onClick={() => handleCardClick(card.id)}
                          className="aspect-square cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-95"
                        >
                          {revealed ? (
                            <div
                              className={`flex h-full w-full items-center justify-center rounded-[5px] font-bold ${
                                card.isMatched ? 'opacity-80' : ''
                              } ${
                                gridSize === '8x8'
                                  ? 'text-2xl'
                                  : gridSize === '6x6'
                                  ? 'text-4xl'
                                  : 'text-5xl'
                              }`}
                              style={{
                                backgroundColor: '#F1F9FF',
                                boxShadow: '0.64px 0.64px 0px rgba(230, 237, 242, 1)',
                              }}
                            >
                              {card.symbol}
                            </div>
                          ) : (
                            <img
                              src="/assets/game/card-back.svg"
                              alt=""
                              className="h-full w-full"
                              draggable={false}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
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
