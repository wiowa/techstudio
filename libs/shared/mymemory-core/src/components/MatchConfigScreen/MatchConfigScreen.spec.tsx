import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchConfigScreen } from './MatchConfigScreen';

// Mock the UI library
vi.mock('@wiowa-tech-studio/ui', () => ({
  Button: ({
    children,
    onClick,
    className,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

// Mock useCardSize hook
vi.mock('../../hooks/useCardSize', () => ({
  getRecommendedGridSize: () => ({
    recommended: '6x6',
    warning: undefined,
  }),
}));

describe('MatchConfigScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should display Match Configuration title', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Match Configuration')).toBeTruthy();
  });

  it('should display player name inputs with default values', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    const player1Input = screen.getByPlaceholderText('Player 1') as HTMLInputElement;
    const player2Input = screen.getByPlaceholderText('Player 2') as HTMLInputElement;

    expect(player1Input.value).toBe('Player 1');
    expect(player2Input.value).toBe('Player 2');
  });

  it('should display grid size options', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('4x4 (8 pairs)')).toBeTruthy();
    expect(screen.getByText('6x6 (18 pairs)')).toBeTruthy();
    expect(screen.getByText('8x8 (32 pairs)')).toBeTruthy();
  });

  it('should display rounds to win options', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('should update player names when typing', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    const player1Input = screen.getByPlaceholderText('Player 1') as HTMLInputElement;
    const player2Input = screen.getByPlaceholderText('Player 2') as HTMLInputElement;

    fireEvent.change(player1Input, { target: { value: 'Alice' } });
    fireEvent.change(player2Input, { target: { value: 'Bob' } });

    expect(player1Input.value).toBe('Alice');
    expect(player2Input.value).toBe('Bob');
  });

  it('should call onStartMatch with correct config when Start Match is clicked', () => {
    const onStartMatch = vi.fn();
    render(<MatchConfigScreen onStartMatch={onStartMatch} onCancel={vi.fn()} />);

    const player1Input = screen.getByPlaceholderText('Player 1');
    const player2Input = screen.getByPlaceholderText('Player 2');

    fireEvent.change(player1Input, { target: { value: 'Alice' } });
    fireEvent.change(player2Input, { target: { value: 'Bob' } });

    const startButton = screen.getByText('Start Match');
    fireEvent.click(startButton);

    expect(onStartMatch).toHaveBeenCalledTimes(1);
    expect(onStartMatch).toHaveBeenCalledWith(
      {
        roundsToWin: 3,
        initialGridSize: '6x6',
      },
      [
        { name: 'Alice', score: 0 },
        { name: 'Bob', score: 0 },
      ]
    );
  });

  it('should call onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should allow changing grid size', () => {
    const onStartMatch = vi.fn();
    render(<MatchConfigScreen onStartMatch={onStartMatch} onCancel={vi.fn()} />);

    const gridButton = screen.getByText('8x8 (32 pairs)');
    fireEvent.click(gridButton);

    const startButton = screen.getByText('Start Match');
    fireEvent.click(startButton);

    expect(onStartMatch).toHaveBeenCalledWith(
      expect.objectContaining({
        initialGridSize: '8x8',
      }),
      expect.any(Array)
    );
  });

  it('should allow changing rounds to win', () => {
    const onStartMatch = vi.fn();
    render(<MatchConfigScreen onStartMatch={onStartMatch} onCancel={vi.fn()} />);

    const roundsButton = screen.getByText('4');
    fireEvent.click(roundsButton);

    const startButton = screen.getByText('Start Match');
    fireEvent.click(startButton);

    expect(onStartMatch).toHaveBeenCalledWith(
      expect.objectContaining({
        roundsToWin: 4,
      }),
      expect.any(Array)
    );
  });

  it('should display rounds to win explanation', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByText('First player to win 3 rounds wins the match!')
    ).toBeTruthy();
  });

  it('should update explanation when rounds to win changes', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    const roundsButton = screen.getByText('2');
    fireEvent.click(roundsButton);

    expect(
      screen.getByText('First player to win 2 rounds wins the match!')
    ).toBeTruthy();
  });

  it('should use initialGridSize prop when provided', () => {
    const onStartMatch = vi.fn();
    render(
      <MatchConfigScreen
        onStartMatch={onStartMatch}
        onCancel={vi.fn()}
        initialGridSize="4x4"
      />
    );

    const startButton = screen.getByText('Start Match');
    fireEvent.click(startButton);

    expect(onStartMatch).toHaveBeenCalledWith(
      expect.objectContaining({
        initialGridSize: '4x4',
      }),
      expect.any(Array)
    );
  });

  it('should disable Start Match button when inputs are empty', () => {
    render(<MatchConfigScreen onStartMatch={vi.fn()} onCancel={vi.fn()} />);

    const player1Input = screen.getByPlaceholderText('Player 1');
    const player2Input = screen.getByPlaceholderText('Player 2');

    fireEvent.change(player1Input, { target: { value: '   ' } });
    fireEvent.change(player2Input, { target: { value: '' } });

    const startButton = screen.getByText('Start Match') as HTMLButtonElement;
    expect(startButton.disabled).toBe(true);
  });

  it('should trim player names when starting match', () => {
    const onStartMatch = vi.fn();
    render(<MatchConfigScreen onStartMatch={onStartMatch} onCancel={vi.fn()} />);

    const player1Input = screen.getByPlaceholderText('Player 1');
    const player2Input = screen.getByPlaceholderText('Player 2');

    fireEvent.change(player1Input, { target: { value: '  Alice  ' } });
    fireEvent.change(player2Input, { target: { value: '  Bob  ' } });

    const startButton = screen.getByText('Start Match');
    fireEvent.click(startButton);

    expect(onStartMatch).toHaveBeenCalledWith(
      expect.any(Object),
      [
        { name: 'Alice', score: 0 },
        { name: 'Bob', score: 0 },
      ]
    );
  });
});
