import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BetweenRoundsScreen } from './BetweenRoundsScreen';
import type { MatchState, RoundResult } from '../../types/match';

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
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

describe('BetweenRoundsScreen', () => {
  const mockRoundResult: RoundResult = {
    roundNumber: 1,
    winner: 0,
    scores: [5, 3],
    gridSize: '4x4',
    moves: 16,
    duration: 65000, // 1:05
  };

  const mockMatchState: MatchState = {
    config: {
      roundsToWin: 3,
      initialGridSize: '4x4',
    },
    players: [
      { name: 'Alice', score: 0 },
      { name: 'Bob', score: 0 },
    ],
    currentRound: 1,
    matchScore: [1, 0],
    roundHistory: [mockRoundResult],
    matchPhase: 'between-rounds',
    startTime: Date.now(),
    currentRoundStartTime: Date.now(),
  };

  it('should render successfully', () => {
    const { baseElement } = render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={vi.fn()}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should display round complete message', () => {
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={vi.fn()}
      />
    );

    expect(screen.getByText('Round 1 Complete!')).toBeTruthy();
  });

  it('should display winner name', () => {
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={vi.fn()}
      />
    );

    expect(screen.getByText('Alice Wins This Round!')).toBeTruthy();
  });

  it('should display match scores', () => {
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={vi.fn()}
      />
    );

    expect(screen.getByText('1')).toBeTruthy(); // Alice's match score
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('should display round statistics', () => {
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={vi.fn()}
      />
    );

    expect(screen.getByText(/5 pairs/)).toBeTruthy();
    expect(screen.getByText(/3 pairs/)).toBeTruthy();
    expect(screen.getByText(/Duration: 1:05/)).toBeTruthy();
    expect(screen.getByText(/Total Moves: 16/)).toBeTruthy();
  });

  it('should display grid size options', () => {
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={vi.fn()}
      />
    );

    expect(screen.getByText('4x4')).toBeTruthy();
    expect(screen.getByText('6x6')).toBeTruthy();
    expect(screen.getByText('8x8')).toBeTruthy();
  });

  it('should call onNextRound when Next Round button is clicked', () => {
    const onNextRound = vi.fn();
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={onNextRound}
      />
    );

    const nextRoundButton = screen.getByText('Next Round');
    fireEvent.click(nextRoundButton);

    expect(onNextRound).toHaveBeenCalledTimes(1);
  });

  it('should call onNextRound with undefined when grid size unchanged', () => {
    const onNextRound = vi.fn();
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={onNextRound}
      />
    );

    const nextRoundButton = screen.getByText('Next Round');
    fireEvent.click(nextRoundButton);

    expect(onNextRound).toHaveBeenCalledWith(undefined);
  });

  it('should call onNextRound with new grid size when changed', () => {
    const onNextRound = vi.fn();
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={onNextRound}
      />
    );

    // Click 6x6 button
    const gridButton = screen.getByText('6x6');
    fireEvent.click(gridButton);

    // Click Next Round
    const nextRoundButton = screen.getByText('Next Round');
    fireEvent.click(nextRoundButton);

    expect(onNextRound).toHaveBeenCalledWith('6x6');
  });

  it('should show message when grid size is changed', () => {
    render(
      <BetweenRoundsScreen
        roundResult={mockRoundResult}
        matchState={mockMatchState}
        onNextRound={vi.fn()}
      />
    );

    // Click 6x6 button
    const gridButton = screen.getByText('6x6');
    fireEvent.click(gridButton);

    expect(screen.getByText('Changed from 4x4 to 6x6')).toBeTruthy();
  });
});
