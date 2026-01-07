import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RoundHistoryIndicator } from './RoundHistoryIndicator';
import type { RoundResult, Player } from '../../types/match';

describe('RoundHistoryIndicator', () => {
  const mockPlayers: [Player, Player] = [
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
  ];

  const mockRoundHistory: RoundResult[] = [
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
  ];

  it('should render successfully', () => {
    const { baseElement } = render(
      <RoundHistoryIndicator
        roundHistory={[]}
        players={mockPlayers}
        currentRound={1}
        roundsToWin={3}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render correct number of indicator pairs based on roundsToWin', () => {
    const { container } = render(
      <RoundHistoryIndicator
        roundHistory={[]}
        players={mockPlayers}
        currentRound={1}
        roundsToWin={3}
      />
    );

    // Each round has 2 indicators (one per player), so 3 rounds = 6 indicators
    const indicators = container.querySelectorAll('.rounded-full');
    expect(indicators.length).toBe(6);
  });

  it('should show completed rounds with correct winner styling', () => {
    const { container } = render(
      <RoundHistoryIndicator
        roundHistory={mockRoundHistory}
        players={mockPlayers}
        currentRound={3}
        roundsToWin={3}
      />
    );

    // Check for primary color (player 1 win) and secondary color (player 2 win)
    const primaryIndicators = container.querySelectorAll('.bg-primary');
    const secondaryIndicators = container.querySelectorAll('.bg-secondary');

    expect(primaryIndicators.length).toBe(1); // Round 1 won by player 1
    expect(secondaryIndicators.length).toBe(1); // Round 2 won by player 2
  });

  it('should show empty indicators for rounds not yet played', () => {
    const { container } = render(
      <RoundHistoryIndicator
        roundHistory={[]}
        players={mockPlayers}
        currentRound={1}
        roundsToWin={2}
      />
    );

    // All indicators should be muted (not played yet)
    const mutedIndicators = container.querySelectorAll('.bg-muted');
    expect(mutedIndicators.length).toBe(4); // 2 rounds * 2 players
  });

  it('should have correct title for completed rounds', () => {
    render(
      <RoundHistoryIndicator
        roundHistory={mockRoundHistory}
        players={mockPlayers}
        currentRound={3}
        roundsToWin={3}
      />
    );

    // Check for title attributes on the wrapper divs
    expect(screen.getByTitle('Round 1: Player 1 won')).toBeTruthy();
    expect(screen.getByTitle('Round 2: Player 2 won')).toBeTruthy();
  });

  it('should have correct title for pending rounds', () => {
    render(
      <RoundHistoryIndicator
        roundHistory={[]}
        players={mockPlayers}
        currentRound={1}
        roundsToWin={2}
      />
    );

    expect(screen.getByTitle('Round 1: Not played yet')).toBeTruthy();
    expect(screen.getByTitle('Round 2: Not played yet')).toBeTruthy();
  });
});
