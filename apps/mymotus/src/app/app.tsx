import { Button, Card } from '@wiowa-tech-studio/ui';
import { useEffect, useState } from 'react';
import '../styles.css';

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

type Letter = {
  char: string;
  state: LetterState;
};

type Difficulty = 5 | 6 | 7 | 8;

// French words for the game (8 letters - classic Motus)
const WORDS_8: string[] = [
  'ABSOLUTE',
  'ACCEPTER',
  'ACCIDENT',
  'ACCORDON',
  'ACHARNEE',
  'ACTIVITE',
  'ADOPTER',
  'AFFAIRES',
  'AFFICHER',
  'AFRICAIN',
  'AGREMENT',
  'AGRESSIF',
  'AGRICOLE',
  'AIMERAIT',
  'AILLEURS',
  'ANNONCEE',
  'ANTENNES',
  'APPARENT',
  'APPAREIL',
  'APPELER',
];

const WORDS_7: string[] = [
  'ABSOLUE',
  'ACCORDE',
  'ACHETER',
  'ACTRICE',
  'ADAPTER',
  'ADRESSE',
  'AFFAIRE',
  'AFRIQUE',
  'ALCOOLS',
  'ALLUMER',
  'AMATEUR',
  'AMELIOR',
  'AMITIER',
  'ANGLAIS',
  'ANNONCE',
];

const WORDS_6: string[] = [
  'ABSOLU',
  'ACCENT',
  'ACCORD',
  'ACHETE',
  'ACTEUR',
  'ACTION',
  'ADMIRE',
  'ADOPTE',
  'ADORER',
  'AFFAME',
  'AIGUES',
  'AIMENT',
  'AMENER',
  'ANCIEN',
  'ANIMAL',
];

const WORDS_5: string[] = [
  'ABORD',
  'ABUSE',
  'ACHAT',
  'ACIER',
  'ACTIF',
  'ADIEU',
  'AIDER',
  'AIGLE',
  'AIMER',
  'ALBUM',
  'ALLER',
  'APPEL',
  'ARBRE',
  'ARGENT',
  'ARMER',
];

export function App() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<Letter[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(6);

  const getWordList = (diff: Difficulty): string[] => {
    switch (diff) {
      case 5:
        return WORDS_5;
      case 6:
        return WORDS_6;
      case 7:
        return WORDS_7;
      case 8:
        return WORDS_8;
    }
  };

  const initializeGame = (diff: Difficulty) => {
    const wordList = getWordList(diff);
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    setTargetWord(word);
    setDifficulty(diff);
    setGuesses([]);
    setCurrentGuess(word[0]); // First letter is given in Motus
    setGameOver(false);
    setGameWon(false);
    setMaxAttempts(6);
  };

  const startNewGame = () => {
    setDifficulty(null);
    setTargetWord('');
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
  };

  const checkGuess = (guess: string): Letter[] => {
    const result: Letter[] = [];
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');

    // First pass: mark correct positions
    const remainingTarget: string[] = [];
    const remainingGuess: { char: string; index: number }[] = [];

    guessLetters.forEach((char, i) => {
      if (char === targetLetters[i]) {
        result[i] = { char, state: 'correct' };
      } else {
        result[i] = { char, state: 'absent' };
        remainingTarget.push(targetLetters[i]);
        remainingGuess.push({ char, index: i });
      }
    });

    // Second pass: mark present letters
    remainingGuess.forEach(({ char, index }) => {
      const targetIndex = remainingTarget.indexOf(char);
      if (targetIndex !== -1) {
        result[index] = { char, state: 'present' };
        remainingTarget.splice(targetIndex, 1);
      }
    });

    return result;
  };

  const handleSubmit = () => {
    if (!difficulty || currentGuess.length !== difficulty) return;

    const result = checkGuess(currentGuess);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);

    if (currentGuess === targetWord) {
      setGameWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= maxAttempts) {
      setGameOver(true);
    } else {
      setCurrentGuess(targetWord[0]); // Reset with first letter
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameOver || !difficulty) return;

    if (key === 'ENTER') {
      handleSubmit();
    } else if (key === 'BACKSPACE') {
      if (currentGuess.length > 1) {
        // Keep the first letter
        setCurrentGuess(currentGuess.slice(0, -1));
      }
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < difficulty) {
      setCurrentGuess(currentGuess + key);
    }
  };

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameOver, difficulty]);

  const getLetterBgColor = (state: LetterState) => {
    switch (state) {
      case 'correct':
        return 'bg-green-500 text-white';
      case 'present':
        return 'bg-yellow-500 text-white';
      case 'absent':
        return 'bg-gray-400 text-white';
      case 'empty':
        return 'bg-white border-2 border-gray-300 text-black';
    }
  };

  const keyboard = [
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['W', 'X', 'C', 'V', 'B', 'N', 'BACKSPACE'],
    ['ENTER'],
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Difficulty Selection */}
        {!difficulty && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Card className="bg-card text-card-foreground backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center">
              <h1 className="text-5xl font-bold text-primary mb-4 drop-shadow-lg">
                Motus
              </h1>
              <p className="text-xl text-secondary-foreground mb-8">
                Choisissez la difficulté
              </p>
              <div className="flex flex-col gap-4">
                {[5, 6, 7, 8].map((len) => (
                  <Button
                    key={len}
                    size="lg"
                    onClick={() => initializeGame(len as Difficulty)}
                    className="text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 min-w-[200px]"
                  >
                    {len} lettres {len === 8 && '(Classique)'}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Game Screen */}
        {difficulty && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-primary mb-4 drop-shadow-lg">
                Motus
              </h1>
              <p className="text-xl text-secondary-foreground mb-6">
                {difficulty} lettres - Trouvez le mot !
              </p>

              <div className="flex justify-center gap-8 mb-6">
                <Card className="bg-card text-card-foreground backdrop-blur-sm rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold">
                    {guesses.length}/{maxAttempts}
                  </div>
                  <div className="text-sm">Tentatives</div>
                </Card>
              </div>

              <Button
                size="lg"
                onClick={startNewGame}
                className="bg-secondary-foreground text-secondary"
              >
                Nouveau Jeu
              </Button>
            </div>

            {/* Game Board */}
            <div className="bg-card backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8">
              <div className="space-y-2">
                {/* Previous guesses */}
                {guesses.map((guess, i) => (
                  <div key={i} className="flex justify-center gap-2">
                    {guess.map((letter, j) => (
                      <div
                        key={j}
                        className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded ${getLetterBgColor(
                          letter.state
                        )}`}
                      >
                        {letter.char}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Current guess (only if game not over) */}
                {!gameOver && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: difficulty }).map((_, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 flex items-center justify-center text-2xl font-bold rounded bg-white border-2 border-primary text-black"
                      >
                        {currentGuess[i] || ''}
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty rows */}
                {Array.from({
                  length: maxAttempts - guesses.length - (gameOver ? 0 : 1),
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex justify-center gap-2">
                    {Array.from({ length: difficulty }).map((_, j) => (
                      <div
                        key={j}
                        className="w-14 h-14 flex items-center justify-center text-2xl font-bold rounded bg-white/20 border-2 border-gray-600"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Keyboard */}
            {!gameOver && (
              <div className="space-y-2">
                {keyboard.map((row, i) => (
                  <div key={i} className="flex justify-center gap-1">
                    {row.map((key) => (
                      <Button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className={`${
                          key === 'ENTER' || key === 'BACKSPACE'
                            ? 'px-6'
                            : 'w-10 h-12'
                        } bg-card text-card-foreground border border-input hover:bg-accent`}
                        disabled={
                          key === 'ENTER' && currentGuess.length !== difficulty
                        }
                      >
                        {key === 'BACKSPACE' ? '⌫' : key}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Victory/Defeat Modal */}
            {gameOver && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                  <div className="text-6xl mb-4">
                    {gameWon ? '🎉' : '😢'}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {gameWon ? 'Bravo !' : 'Perdu !'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {gameWon
                      ? `Vous avez trouvé le mot en ${guesses.length} tentative${
                          guesses.length > 1 ? 's' : ''
                        } !`
                      : `Le mot était : ${targetWord}`}
                  </p>
                  <Button size="lg" onClick={startNewGame} className="w-full">
                    Nouveau Jeu
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
