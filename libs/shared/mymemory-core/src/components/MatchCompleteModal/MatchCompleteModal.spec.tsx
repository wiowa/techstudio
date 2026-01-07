import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MatchCompleteModal } from './MatchCompleteModal';
import type { MatchRecord } from '../../types/match';

// Mock the UI library
vi.mock('@wiowa-tech-studio/ui', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    size?: string;
  }) => (
    <button data-testid="button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

describe('MatchCompleteModal', () => {
  const mockMatchRecord: MatchRecord = {
    id: 'match-123',
    timestamp: Date.now(),
    config: {
      roundsToWin: 2,
      initialGridSize: '4x4',
    },
    players: ['Alice', 'Bob'],
    finalScore: [2, 1],
    rounds: [
      {
        roundNumber: 1,
        winner: 0,
        scores: [5, 3],
        gridSize: '4x4',
        moves: 16,
        duration: 60000,
      },
      {
        roundNumber: 2,
        winner: 1,
        scores: [4, 5],
        gridSize: '4x4',
        moves: 18,
        duration: 75000,
      },
      {
        roundNumber: 3,
        winner: 0,
        scores: [6, 2],
        gridSize: '4x4',
        moves: 16,
        duration: 55000,
      },
    ],
    winner: 0,
    duration: 190000, // 3:10
  };

  it('should render successfully', () => {
    const { baseElement } = render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should display Match Complete message', () => {
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    expect(screen.getByText('Match Complete!')).toBeTruthy();
  });

  it('should display winner name and score', () => {
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    expect(screen.getByText('Alice Wins the Match 2-1!')).toBeTruthy();
  });

  it('should display all rounds in the statistics table', () => {
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    // Check round numbers
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('should display round winners in table', () => {
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    // Alice won rounds 1 and 3, Bob won round 2
    const aliceElements = screen.getAllByText('Alice');
    const bobElements = screen.getAllByText('Bob');

    expect(aliceElements.length).toBeGreaterThan(0);
    expect(bobElements.length).toBeGreaterThan(0);
  });

  it('should display total duration', () => {
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    expect(screen.getByText('3:10')).toBeTruthy();
  });

  it('should display player statistics', () => {
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    // Alice: 5+4+6 = 15 pairs, avg = 5.0
    // Bob: 3+5+2 = 10 pairs, avg = 3.3
    expect(screen.getByText(/15 pairs/)).toBeTruthy();
    expect(screen.getByText(/10 pairs/)).toBeTruthy();
  });

  it('should call onRematch when Rematch button is clicked', () => {
    const onRematch = vi.fn();
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={onRematch}
        onNewMatch={vi.fn()}
      />
    );

    const rematchButton = screen.getByText('Rematch');
    fireEvent.click(rematchButton);

    expect(onRematch).toHaveBeenCalledTimes(1);
  });

  it('should call onNewMatch when New Match button is clicked', () => {
    const onNewMatch = vi.fn();
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={onNewMatch}
      />
    );

    const newMatchButton = screen.getByText('New Match');
    fireEvent.click(newMatchButton);

    expect(onNewMatch).toHaveBeenCalledTimes(1);
  });

  it('should display trophy emoji', () => {
    render(
      <MatchCompleteModal
        matchRecord={mockMatchRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    expect(screen.getByText('🏆')).toBeTruthy();
  });

  it('should handle player 2 as winner', () => {
    const player2WinsRecord: MatchRecord = {
      ...mockMatchRecord,
      finalScore: [1, 2],
      winner: 1,
    };

    render(
      <MatchCompleteModal
        matchRecord={player2WinsRecord}
        onRematch={vi.fn()}
        onNewMatch={vi.fn()}
      />
    );

    expect(screen.getByText('Bob Wins the Match 2-1!')).toBeTruthy();
  });
});
