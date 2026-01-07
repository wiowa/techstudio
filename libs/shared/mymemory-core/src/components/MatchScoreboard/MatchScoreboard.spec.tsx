import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MatchScoreboard } from './MatchScoreboard';
import type { MatchState } from '../../types/match';

// Mock the UI library
vi.mock('@wiowa-tech-studio/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

describe('MatchScoreboard', () => {
  const mockMatchState: MatchState = {
    config: {
      roundsToWin: 3,
      initialGridSize: '4x4',
    },
    players: [
      { name: 'Alice', score: 0 },
      { name: 'Bob', score: 0 },
    ],
    currentRound: 2,
    matchScore: [1, 0],
    roundHistory: [
      {
        roundNumber: 1,
        winner: 0,
        scores: [5, 3],
        gridSize: '4x4',
        moves: 16,
        duration: 60000,
      },
    ],
    matchPhase: 'playing',
    startTime: Date.now(),
    currentRoundStartTime: Date.now(),
  };

  it('should render successfully', () => {
    const { baseElement } = render(
      <MatchScoreboard
        matchState={mockMatchState}
        currentRoundScores={[2, 1]}
        currentPlayer={0}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should display player names', () => {
    render(
      <MatchScoreboard
        matchState={mockMatchState}
        currentRoundScores={[2, 1]}
        currentPlayer={0}
      />
    );

    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('should display match scores', () => {
    render(
      <MatchScoreboard
        matchState={mockMatchState}
        currentRoundScores={[2, 1]}
        currentPlayer={0}
      />
    );

    // Match scores: Alice has 1, Bob has 0
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('should display current round info', () => {
    render(
      <MatchScoreboard
        matchState={mockMatchState}
        currentRoundScores={[2, 1]}
        currentPlayer={0}
      />
    );

    expect(screen.getByText('Round 2 | First to 3')).toBeTruthy();
  });

  it('should display current round scores', () => {
    render(
      <MatchScoreboard
        matchState={mockMatchState}
        currentRoundScores={[3, 2]}
        currentPlayer={0}
      />
    );

    expect(screen.getByText('Alice: 3 pairs')).toBeTruthy();
    expect(screen.getByText('Bob: 2 pairs')).toBeTruthy();
  });

  it('should highlight current player', () => {
    const { container } = render(
      <MatchScoreboard
        matchState={mockMatchState}
        currentRoundScores={[2, 1]}
        currentPlayer={0}
      />
    );

    // Player 1 (Alice) should be scaled up
    const scaledElements = container.querySelectorAll('.scale-110');
    expect(scaledElements.length).toBeGreaterThan(0);
  });

  it('should dim non-active player', () => {
    const { container } = render(
      <MatchScoreboard
        matchState={mockMatchState}
        currentRoundScores={[2, 1]}
        currentPlayer={0}
      />
    );

    // Player 2 (Bob) should have reduced opacity
    const dimmedElements = container.querySelectorAll('.opacity-70');
    expect(dimmedElements.length).toBeGreaterThan(0);
  });
});
