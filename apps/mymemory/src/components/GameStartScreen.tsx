/**
 * GameStartScreen Component
 * Écran d'accueil du jeu Memory (design Figma "Game").
 * Permet de sélectionner la difficulté (grille) puis le mode de jeu.
 */

import { useState } from 'react';
import type { GridSize } from '../app/app';

type GameMode = 'single' | 'two-player';

interface GameStartScreenProps {
  onStart: (mode: GameMode, grid: GridSize) => void;
  onStartMatch: (grid: GridSize) => void;
  initialGridSize?: GridSize;
}

/** Icône trophée (mode match), monochrome pour rester cohérent avec les autres icônes. */
function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4h12v3a6 6 0 0 1-12 0V4Zm0 1H3v2a3 3 0 0 0 3 3m12-5h3v2a3 3 0 0 1-3 3M9 14h6M10 14v3m4-3v3M8 20h8M9 20l1-3m5 3-1-3"
        stroke="#434C41"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

/** Indicateur de niveau : 3 barres croissantes, `level` d'entre elles allumées. */
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

export function GameStartScreen({
  onStart,
  onStartMatch,
  initialGridSize = '6x6',
}: GameStartScreenProps) {
  const [selectedGrid, setSelectedGrid] = useState<GridSize>(initialGridSize);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div
        className="relative w-full max-w-[440px] overflow-hidden rounded-[40px] px-8 py-12 shadow-2xl"
        style={{
          backgroundColor: '#D1D2BF',
          fontFamily: 'Akshar, sans-serif',
        }}
      >
        <div className="flex flex-col items-center gap-12">
          {/* Logo + titre */}
          <div className="flex flex-col items-center gap-2">
            <img
              src="/assets/game/memory-logo.svg"
              alt="Memory logo"
              className="h-auto w-[180px]"
            />
            <div className="flex flex-col items-center">
              <span
                className="leading-none"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: 40,
                  color: '#2D2D2D',
                }}
              >
                Memory
              </span>
              <span
                className="uppercase"
                style={{
                  fontFamily: 'Akshar, sans-serif',
                  fontWeight: 400,
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  color: '#000000',
                }}
              >
                Train your brain
              </span>
            </div>
          </div>

          {/* Sélection de la grille */}
          <section className="flex w-full flex-col items-center gap-3">
            <h2
              className="text-center uppercase"
              style={{ fontWeight: 600, fontSize: 20, color: '#000000' }}
            >
              Select grid :
            </h2>
            <div className="flex w-full flex-col items-center gap-3">
              {GRID_OPTIONS.map((opt) => {
                const isSelected = selectedGrid === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedGrid(opt.key)}
                    className={`flex w-full max-w-[280px] items-center gap-3 rounded-lg px-6 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'scale-[1.03] ring-2 ring-white ring-offset-2 ring-offset-transparent'
                        : 'opacity-90 hover:opacity-100'
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
                      <span
                        className="uppercase leading-tight text-white"
                        style={{ fontWeight: 300, fontSize: 12 }}
                      >
                        {opt.sub}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sélection du mode de jeu */}
          <section className="flex w-full flex-col items-center gap-3">
            <h2
              className="text-center uppercase"
              style={{ fontWeight: 600, fontSize: 20, color: '#000000' }}
            >
              Select game mode :
            </h2>
            <div className="flex w-full flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => onStart('single', selectedGrid)}
                className="flex w-full max-w-[280px] items-center justify-center gap-3 rounded-lg px-6 py-3 transition-all duration-200 hover:scale-[1.03]"
                style={{ backgroundColor: '#EFEFEE' }}
              >
                <img src="/assets/game/icon-single.svg" alt="" className="h-[18px] w-[18px]" />
                <span
                  className="uppercase"
                  style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em', color: '#434C41' }}
                >
                  Single player
                </span>
              </button>
              <button
                type="button"
                onClick={() => onStart('two-player', selectedGrid)}
                className="flex w-full max-w-[280px] items-center justify-center gap-3 rounded-lg px-6 py-3 transition-all duration-200 hover:scale-[1.03]"
                style={{ backgroundColor: '#EFEFEE' }}
              >
                <img src="/assets/game/icon-multi.svg" alt="" className="h-[20px] w-[20px]" />
                <span
                  className="uppercase"
                  style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em', color: '#434C41' }}
                >
                  2 players
                </span>
              </button>
              <button
                type="button"
                onClick={() => onStartMatch(selectedGrid)}
                className="flex w-full max-w-[280px] items-center justify-center gap-3 rounded-lg px-6 py-3 transition-all duration-200 hover:scale-[1.03]"
                style={{ backgroundColor: '#EFEFEE' }}
              >
                <TrophyIcon />
                <span
                  className="uppercase"
                  style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em', color: '#434C41' }}
                >
                  Match (2 players)
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default GameStartScreen;
