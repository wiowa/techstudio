/**
 * MatchConfigScreen Component
 * Écran de configuration d'un match (tournoi 2 joueurs) — design Figma.
 */

import { useState } from 'react';
import type { MatchConfig, Player } from '../types/match';
import type { GridSize } from '../app/app';

interface MatchConfigScreenProps {
  onStartMatch: (config: MatchConfig, players: [Player, Player]) => void;
  onCancel: () => void;
  initialGridSize?: GridSize;
}

interface GridOption {
  key: GridSize;
  label: string;
  sub: string;
  color: string;
  level: 1 | 2 | 3;
}

const GRID_OPTIONS: GridOption[] = [
  { key: '4x4', label: 'Easy', sub: '4 x 4 (8 pairs)', color: '#64A18A', level: 1 },
  { key: '6x6', label: 'Medium', sub: '6 x 6 (18 pairs)', color: '#A88550', level: 2 },
  { key: '8x8', label: 'Hard', sub: '8 x 8 (32 pairs)', color: '#9B3A14', level: 3 },
];

/** Indicateur de niveau : 3 barres croissantes, `level` allumées. */
function SignalBars({ level }: { level: 1 | 2 | 3 }) {
  const heights = [8, 16, 24];
  return (
    <div className="flex items-end gap-[6px]" style={{ height: 24 }}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[5px] rounded-full bg-white"
          style={{ height: h, opacity: i < level ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
}

export function MatchConfigScreen({
  onStartMatch,
  onCancel,
  initialGridSize = '6x6',
}: MatchConfigScreenProps) {
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [gridSize, setGridSize] = useState<GridSize>(initialGridSize);
  const [roundsToWin, setRoundsToWin] = useState<2 | 3 | 4>(3);

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

  const headingStyle = {
    fontFamily: 'Akshar, sans-serif',
    fontWeight: 600 as const,
    fontSize: 20,
    color: '#000000',
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div
        className="relative w-full max-w-[440px] overflow-hidden rounded-[40px] px-8 py-10 shadow-2xl"
        style={{ backgroundColor: '#D1D2BF', fontFamily: 'Akshar, sans-serif' }}
      >
        <div className="flex flex-col items-center gap-8">
          {/* Titre */}
          <div className="flex flex-col items-center">
            <span
              className="leading-none"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 32, color: '#2D2D2D' }}
            >
              Match
            </span>
            <span
              className="uppercase"
              style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 400, fontSize: 12, letterSpacing: '0.05em', color: '#000000' }}
            >
              Best of tournament
            </span>
          </div>

          {/* Noms des joueurs */}
          <section className="flex w-full flex-col items-center gap-3">
            <h2 className="text-center uppercase" style={headingStyle}>
              Players :
            </h2>
            <div className="flex w-full max-w-[280px] flex-col gap-3">
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                maxLength={20}
                className="w-full rounded-lg px-4 py-3 uppercase focus:outline-none focus:ring-2 focus:ring-white"
                style={{ backgroundColor: '#EFEFEE', color: '#434C41', fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em' }}
              />
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                maxLength={20}
                className="w-full rounded-lg px-4 py-3 uppercase focus:outline-none focus:ring-2 focus:ring-white"
                style={{ backgroundColor: '#EFEFEE', color: '#434C41', fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em' }}
              />
            </div>
          </section>

          {/* Sélection de la grille */}
          <section className="flex w-full flex-col items-center gap-3">
            <h2 className="text-center uppercase" style={headingStyle}>
              Select grid :
            </h2>
            <div className="flex w-full flex-col items-center gap-3">
              {GRID_OPTIONS.map((opt) => {
                const isSelected = gridSize === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setGridSize(opt.key)}
                    className={`flex w-full max-w-[280px] items-center gap-3 rounded-lg px-6 py-3 text-left transition-all duration-200 ${
                      isSelected ? 'scale-[1.03] ring-2 ring-white' : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: opt.color }}
                  >
                    <SignalBars level={opt.level} />
                    <span className="flex flex-col">
                      <span
                        className="uppercase leading-tight text-white"
                        style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.03em' }}
                      >
                        {opt.label}
                      </span>
                      <span className="uppercase leading-tight text-white" style={{ fontWeight: 300, fontSize: 12 }}>
                        {opt.sub}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Manches à gagner */}
          <section className="flex w-full flex-col items-center gap-3">
            <h2 className="text-center uppercase" style={headingStyle}>
              Rounds to win :
            </h2>
            <div className="flex justify-center gap-4">
              {[2, 3, 4].map((rounds) => {
                const isSelected = roundsToWin === rounds;
                return (
                  <button
                    key={rounds}
                    type="button"
                    onClick={() => setRoundsToWin(rounds as 2 | 3 | 4)}
                    className={`flex h-14 w-14 items-center justify-center rounded-lg transition-all duration-200 ${
                      isSelected ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: isSelected ? '#434C41' : '#EFEFEE',
                      color: isSelected ? '#FFFFFF' : '#434C41',
                      fontFamily: 'Akshar, sans-serif',
                      fontWeight: 600,
                      fontSize: 22,
                    }}
                  >
                    {rounds}
                  </button>
                );
              })}
            </div>
            <p
              className="text-center uppercase"
              style={{ fontFamily: 'Akshar, sans-serif', fontWeight: 300, fontSize: 11, letterSpacing: '-0.02em', color: '#000000' }}
            >
              First to win {roundsToWin} rounds wins the match
            </p>
          </section>

          {/* Actions */}
          <div className="flex w-full max-w-[280px] flex-col gap-3">
            <button
              type="button"
              onClick={handleStartMatch}
              disabled={!isValid}
              className="w-full rounded-lg px-6 py-3 uppercase transition-transform duration-200 enabled:hover:scale-[1.03] disabled:opacity-50"
              style={{ backgroundColor: '#9B3A14', color: '#FFFFFF', fontWeight: 600, fontSize: 14, letterSpacing: '-0.03em' }}
            >
              Start match
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-lg px-6 py-3 uppercase transition-transform duration-200 hover:scale-[1.03]"
              style={{ backgroundColor: '#EFEFEE', color: '#434C41', fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
