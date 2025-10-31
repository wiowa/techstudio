import { useState, useEffect } from 'react';
import { Button, Card, CardContent } from '@wiowa-tech-studio/ui';
import '../styles.css';

type GameCard = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameMode = 'single' | 'two-player';

type Player = {
  name: string;
  score: number;
};

const SYMBOLS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🎲', '🎰', '🎳', '🎾', '⚽', '🏀', '🏈', '⚾', '🎱', '🏐'];

export function App() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 }
  ]);
  const [isVibrating, setIsVibrating] = useState(false);

  // Initialize game
  const initializeGame = (mode?: GameMode) => {
    const gameSymbols = SYMBOLS.slice(0, 18); // 18 pairs for 6x6 grid
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
    setPlayers([
      { name: 'Player 1', score: 0 },
      { name: 'Player 2', score: 0 }
    ]);
    setIsVibrating(false);
    if (mode) {
      setGameMode(mode);
    }
  };

  const startNewGame = () => {
    setGameMode(null);
    setCards([]);
  };

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches(prev => prev + 1);
          setFlippedCards([]);

          // Update score for 2-player mode
          if (gameMode === 'two-player') {
            setPlayers(prev => prev.map((player, idx) =>
              idx === currentPlayer
                ? { ...player, score: player.score + 1 }
                : player
            ));
          }
        }, 600);
      } else {
        // No match - trigger vibrate animation
        setIsVibrating(true);
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsVibrating(false);

          // Switch player in 2-player mode
          if (gameMode === 'two-player') {
            setCurrentPlayer(prev => prev === 0 ? 1 : 0);
          }
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards, gameMode, currentPlayer]);

  // Check if game is complete
  useEffect(() => {
    if (matches === 18 && cards.length > 0) {
      setIsGameComplete(true);
    }
  }, [matches, cards]);

  const handleCardClick = (id: number) => {
    const card = cards.find(c => c.id === id);

    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return;
    }

    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards(prev => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Mode Selection */}
        {!gameMode && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center">
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Memory Game
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Select Game Mode
              </p>
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  onClick={() => initializeGame('single')}
                  className="bg-white text-purple-600 hover:bg-gray-100 min-w-[200px]"
                >
                  Single Player
                </Button>
                <Button
                  size="lg"
                  onClick={() => initializeGame('two-player')}
                  className="bg-white text-purple-600 hover:bg-gray-100 min-w-[200px]"
                >
                  2 Players
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {gameMode && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Memory Game
              </h1>
              <p className="text-xl text-white/90 mb-6">
                {gameMode === 'two-player'
                  ? `${players[currentPlayer].name}'s Turn`
                  : 'Match all 18 pairs to win!'}
              </p>

              {/* Stats */}
              {gameMode === 'single' && (
                <div className="flex justify-center gap-8 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                    <div className="text-2xl font-bold">{moves}</div>
                    <div className="text-sm">Moves</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                    <div className="text-2xl font-bold">{matches}/18</div>
                    <div className="text-sm">Matches</div>
                  </div>
                </div>
              )}

              {/* Player Stats for 2-player mode */}
              {gameMode === 'two-player' && (
                <div className="flex justify-center gap-8 mb-6">
                  {players.map((player, idx) => (
                    <div
                      key={idx}
                      className={`
                        bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white
                        transition-all duration-300
                        ${idx === currentPlayer ? 'ring-4 ring-white scale-105' : 'opacity-70'}
                      `}
                    >
                      <div className="text-2xl font-bold">{player.score}</div>
                      <div className="text-sm">{player.name}</div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                size="lg"
                onClick={startNewGame}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                New Game
              </Button>
            </div>

            {/* Game Board */}
            <div className={`bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 ${isVibrating ? 'vibrate' : ''}`}>
              <div className="grid grid-cols-6 gap-3">
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`
                      aspect-square cursor-pointer
                      transition-all duration-300 transform
                      ${
                        card.isFlipped || card.isMatched
                          ? 'bg-white scale-105 shadow-lg'
                          : 'bg-gradient-to-br from-purple-600 to-pink-600 hover:scale-105 hover:shadow-lg'
                      }
                      ${card.isMatched ? 'opacity-70' : ''}
                      ${card.isFlipped || card.isMatched ? '' : 'cursor-pointer'}
                      active:scale-95
                    `}
                  >
                    <CardContent className="flex items-center justify-center h-full p-0 text-4xl font-bold">
                      {card.isFlipped || card.isMatched ? card.symbol : '?'}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Victory Modal */}
            {isGameComplete && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {gameMode === 'two-player' ? 'Game Over!' : 'Congratulations!'}
                  </h2>
                  {gameMode === 'single' && (
                    <p className="text-gray-600 mb-6">
                      You completed the game in <span className="font-bold text-purple-600">{moves}</span> moves!
                    </p>
                  )}
                  {gameMode === 'two-player' && (
                    <>
                      <div className="mb-6">
                        {players[0].score > players[1].score ? (
                          <p className="text-gray-600">
                            <span className="font-bold text-purple-600">{players[0].name}</span> wins with{' '}
                            <span className="font-bold">{players[0].score}</span> matches!
                          </p>
                        ) : players[1].score > players[0].score ? (
                          <p className="text-gray-600">
                            <span className="font-bold text-purple-600">{players[1].name}</span> wins with{' '}
                            <span className="font-bold">{players[1].score}</span> matches!
                          </p>
                        ) : (
                          <p className="text-gray-600">
                            It's a tie! Both players scored{' '}
                            <span className="font-bold text-purple-600">{players[0].score}</span> matches!
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {players.map((player, idx) => (
                          <div key={idx} className="bg-purple-50 rounded-lg p-4">
                            <div className="text-lg font-semibold text-gray-800">{player.name}</div>
                            <div className="text-2xl font-bold text-purple-600">{player.score}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <Button
                    size="lg"
                    onClick={startNewGame}
                    className="w-full"
                  >
                    New Game
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
