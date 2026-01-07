# Match-Based Mode Specification
## Memory Game (mymemory) - Two-Player Match Mode Feature

**Status**: Ready for Implementation
**Type**: Feature Enhancement
**Scope**: Local Multiplayer Match System
**Date**: 2025-11-24

---

## 1. Overview

### Feature Summary
Add a match-based mode for local 2-player games where players compete in a best-of series (first to win 2, 3, or 4 rounds wins the overall match). This enhances the existing local two-player mode with structured match progression, persistent statistics, and improved competitive gameplay.

### Goals
- Provide structured competitive play for 2 players
- Track match progression and history
- Enable flexible difficulty adjustment between rounds
- Persist match data and player statistics
- Maintain simplicity of current local-only architecture

### Non-Goals
- Online/remote multiplayer (out of scope)
- Tournament bracket systems (future enhancement)
- AI opponents (out of scope)
- Real-time matchmaking (out of scope)

---

## 2. Requirements

### 2.1 Functional Requirements

#### FR-1: Match Configuration
- **FR-1.1**: After selecting "Two Player" mode, display match configuration screen
- **FR-1.2**: Allow players to select "rounds to win": 2, 3, or 4
- **FR-1.3**: Initial grid size selection remains at match start
- **FR-1.4**: Player names entered once at match start (carry through all rounds)

#### FR-2: Match Progression
- **FR-2.1**: Match consists of multiple rounds played sequentially
- **FR-2.2**: First player to win target number of rounds wins the match
- **FR-2.3**: Match ends early if a player clinches (e.g., in best-of-5, first to 3 wins)
- **FR-2.4**: Round victory condition: Most pairs matched when board is cleared (keep current logic)

#### FR-3: Between-Round Experience
- **FR-3.1**: After each round, display between-rounds screen showing:
  - Round winner announcement
  - Current match score (rounds won by each player)
  - Round statistics (pairs matched, moves taken)
  - Round history indicators
- **FR-3.2**: Provide "Next Round" button to continue match
- **FR-3.3**: Allow grid size adjustment before next round starts
- **FR-3.4**: Rounds-to-win cannot be changed mid-match

#### FR-4: In-Game Match Display
During active gameplay, display:
- **FR-4.1**: Round counter (e.g., "Round 2 | First to 3")
- **FR-4.2**: Match score (e.g., "Alice: 2 | Bob: 1" - rounds won)
- **FR-4.3**: Current round score (existing pairs matched display)
- **FR-4.4**: Round history indicators (visual showing who won each completed round)

#### FR-5: Match Completion
- **FR-5.1**: Display match winner announcement with celebration
- **FR-5.2**: Show comprehensive match statistics:
  - Total rounds played
  - Individual round results with scores
  - Total pairs matched per player
  - Average moves per round
- **FR-5.3**: Provide "Rematch" button (same players, same configuration)
- **FR-5.4**: Provide "New Match" button (return to mode selection)

#### FR-6: Data Persistence
- **FR-6.1**: Save current match state to local storage (resume on refresh)
- **FR-6.2**: Save completed match history to local storage
- **FR-6.3**: Track player statistics across all matches:
  - Total matches played
  - Match wins/losses
  - Total rounds won
  - Average score per round
- **FR-6.4**: Provide "Resume Match" option if unfinished match exists

### 2.2 Non-Functional Requirements

#### NFR-1: Performance
- Match state updates must be instant (< 100ms)
- Local storage operations must not block UI
- Game board rendering must maintain current performance

#### NFR-2: Usability
- Match configuration must be intuitive and take < 10 seconds
- Between-round transitions must be smooth with clear calls-to-action
- Match statistics must be easy to scan and understand

#### NFR-3: Maintainability
- Code should be modular and testable
- State management should be clear and predictable
- Components should follow existing UI library patterns

#### NFR-4: Compatibility
- Must work with existing theme system (light/dark mode)
- Must maintain responsive design for mobile/tablet/desktop
- Must work with existing PWA service worker

---

## 3. User Flow

### 3.1 Complete User Journey

```
1. Main Menu
   └─> Click "Two Player" button
        └─> [NEW] Match Configuration Screen
             ├─> Enter Player 1 Name (existing)
             ├─> Enter Player 2 Name (existing)
             ├─> Select Grid Size (existing)
             └─> [NEW] Select "Rounds to Win": [2] [3] [4]
                  └─> Click "Start Match" button
                       └─> Round 1 Begins
                            ├─> [NEW] Display: "Round 1 | First to 3"
                            ├─> [NEW] Display: "Alice: 0 | Bob: 0"
                            ├─> Display: Current round scores (existing)
                            └─> Play round until all pairs matched
                                 └─> [NEW] Between-Rounds Screen
                                      ├─> Show: "Alice wins Round 1!"
                                      ├─> Show: Match Score: "Alice: 1 | Bob: 0"
                                      ├─> Show: Round stats (pairs, moves)
                                      ├─> Show: Round history (visual indicators)
                                      ├─> [NEW] Grid size selector (optional change)
                                      └─> Click "Next Round" button
                                           └─> Round 2 Begins
                                                └─> ... (repeat until match winner)
                                                     └─> [NEW] Match Complete Screen
                                                          ├─> "Alice Wins the Match! 🎉"
                                                          ├─> Show comprehensive match statistics
                                                          ├─> [NEW] "Rematch" button
                                                          └─> "New Match" button
```

### 3.2 Edge Cases & Special Flows

#### Resume Match on Page Refresh
```
Page Load
└─> Check local storage for unfinished match
     ├─> If exists:
     │    └─> Show "Resume Match" modal
     │         ├─> "Resume" button → Continue match from saved state
     │         └─> "New Game" button → Discard and start fresh
     └─> If not exists:
          └─> Show normal mode selection screen
```

#### Early Match Clinch
```
Example: Best of 5 (First to 3)
- After Round 4: Alice has 3 wins, Bob has 1 win
- Match ends immediately (no need to play Round 5)
- Display: "Alice wins the match 3-1!"
```

---

## 4. Technical Architecture

### 4.1 State Management

#### Match State Structure
```typescript
interface MatchConfig {
  roundsToWin: 2 | 3 | 4;
  initialGridSize: GridSize;
}

interface MatchState {
  config: MatchConfig;
  players: [Player, Player]; // Existing Player type
  currentRound: number;
  matchScore: [number, number]; // Rounds won by [player1, player2]
  roundHistory: RoundResult[];
  matchPhase: 'config' | 'playing' | 'between-rounds' | 'complete';
  startTime: number;
}

interface RoundResult {
  roundNumber: number;
  winner: 0 | 1; // Index of winning player
  scores: [number, number]; // Pairs matched by [player1, player2]
  gridSize: GridSize;
  moves: number; // Total moves in round (for single-player style tracking)
  duration: number; // milliseconds
}

interface MatchRecord {
  id: string;
  timestamp: number;
  config: MatchConfig;
  players: [string, string]; // Player names
  finalScore: [number, number]; // Final match score
  rounds: RoundResult[];
  winner: 0 | 1;
  duration: number;
}

interface PlayerStats {
  name: string;
  matchesPlayed: number;
  matchWins: number;
  totalRoundsPlayed: number;
  totalRoundsWon: number;
  totalPairsMatched: number;
  averageScorePerRound: number;
  lastPlayed: number;
}
```

#### State Transitions
```
'config' → (User completes configuration) → 'playing'
'playing' → (Round ends) → 'between-rounds'
'between-rounds' → (User clicks "Next Round") → 'playing'
'between-rounds' → (Match winner determined) → 'complete'
'complete' → (User clicks "Rematch") → 'config'
'complete' → (User clicks "New Match") → 'config'
```

### 4.2 Component Architecture

#### New Components to Create

```typescript
// 1. Match Configuration Screen
interface MatchConfigScreenProps {
  onStartMatch: (config: MatchConfig, players: [Player, Player]) => void;
  onCancel: () => void;
}
// Location: apps/mymemory/src/components/MatchConfigScreen.tsx

// 2. Match Scoreboard (In-Game Display)
interface MatchScoreboardProps {
  matchState: MatchState;
  currentRoundScores: [number, number];
  currentPlayer: 0 | 1;
}
// Location: apps/mymemory/src/components/MatchScoreboard.tsx

// 3. Round History Indicator
interface RoundHistoryIndicatorProps {
  roundHistory: RoundResult[];
  players: [Player, Player];
  currentRound: number;
}
// Location: apps/mymemory/src/components/RoundHistoryIndicator.tsx

// 4. Between Rounds Screen
interface BetweenRoundsScreenProps {
  roundResult: RoundResult;
  matchState: MatchState;
  onNextRound: (newGridSize?: GridSize) => void;
}
// Location: apps/mymemory/src/components/BetweenRoundsScreen.tsx

// 5. Match Complete Modal
interface MatchCompleteModalProps {
  matchRecord: MatchRecord;
  onRematch: () => void;
  onNewMatch: () => void;
}
// Location: apps/mymemory/src/components/MatchCompleteModal.tsx
```

#### Component Hierarchy
```
App
├─> Mode Selection Screen (existing)
│    └─> "Two Player" button → Navigate to Match Config
├─> [NEW] MatchConfigScreen
│    └─> Start Match → Begin Round 1
├─> Game Screen (enhanced)
│    ├─> [NEW] MatchScoreboard (top of screen)
│    │    ├─> Round counter
│    │    ├─> Match score
│    │    └─> [NEW] RoundHistoryIndicator
│    ├─> Current Player Display (existing, enhanced)
│    ├─> Game Board (existing)
│    └─> Stats Cards (existing - shows current round score)
├─> [NEW] BetweenRoundsScreen (modal/overlay)
│    ├─> Round winner announcement
│    ├─> Round statistics
│    ├─> Grid size selector
│    └─> "Next Round" button
└─> [NEW] MatchCompleteModal
     ├─> Winner announcement
     ├─> Match statistics table
     ├─> "Rematch" button
     └─> "New Match" button
```

### 4.3 Custom Hooks

#### useMatchLogic Hook
```typescript
// apps/mymemory/src/hooks/useMatchLogic.ts

interface UseMatchLogicReturn {
  matchState: MatchState | null;
  startMatch: (config: MatchConfig, players: [Player, Player]) => void;
  endRound: (roundResult: RoundResult) => void;
  startNextRound: (newGridSize?: GridSize) => void;
  rematch: () => void;
  endMatch: () => void;
  isMatchComplete: boolean;
  matchWinner: 0 | 1 | null;
}

function useMatchLogic(): UseMatchLogicReturn {
  // Manages match state lifecycle
  // Handles round progression
  // Determines match winner
  // Integrates with local storage
}
```

#### useLocalStorageMatch Hook
```typescript
// apps/mymemory/src/hooks/useLocalStorageMatch.ts

interface UseLocalStorageMatchReturn {
  currentMatch: MatchState | null;
  matchHistory: MatchRecord[];
  playerStats: Record<string, PlayerStats>;
  saveMatchState: (match: MatchState) => void;
  completeMatch: (matchRecord: MatchRecord) => void;
  clearCurrentMatch: () => void;
  getPlayerStats: (playerName: string) => PlayerStats | null;
}

function useLocalStorageMatch(): UseLocalStorageMatchReturn {
  // Manages local storage operations
  // Persists current match state
  // Saves completed matches
  // Tracks player statistics
}
```

### 4.4 Local Storage Schema

```typescript
// Key: 'mymemory:currentMatch'
{
  version: '1.0',
  match: MatchState | null
}

// Key: 'mymemory:matchHistory'
{
  version: '1.0',
  matches: MatchRecord[] // Last 50 matches
}

// Key: 'mymemory:playerStats'
{
  version: '1.0',
  stats: Record<string, PlayerStats>
}
```

---

## 5. UI/UX Specifications

### 5.1 Match Configuration Screen

**Layout:**
```
┌──────────────────────────────────────────────┐
│         🎮 Match Configuration                │
│                                               │
│  Player Names                                 │
│  ┌─────────────────────┐                     │
│  │ Player 1: [Alice  ] │                     │
│  │ Player 2: [Bob    ] │                     │
│  └─────────────────────┘                     │
│                                               │
│  Grid Size                                    │
│  [ 4x4 ]  [ 6x6 ]  [ 8x8 ]                   │
│    ^selected                                  │
│                                               │
│  Rounds to Win                                │
│  ┌─────────────────────┐                     │
│  │  [ 2 ]  [ 3 ]  [ 4 ]│  ← Radio buttons    │
│  │         ^selected    │                     │
│  └─────────────────────┘                     │
│                                               │
│  First player to win 3 rounds wins the match!│
│                                               │
│        [Cancel]    [Start Match]              │
└──────────────────────────────────────────────┘
```

**Styling:**
- Use existing Card component with blur backdrop
- Primary button for "Start Match"
- Secondary button for "Cancel"
- Radio buttons for rounds selection with hover/focus states
- Descriptive text below rounds selector

### 5.2 In-Game Match Scoreboard

**Layout (Top of Game Screen):**
```
┌──────────────────────────────────────────────────────────────┐
│  Match Progress                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Round 2 | First to 3       Alice: 1  ●○○  vs  ○●○  Bob: 1││
│  │                                ↑ Round history indicators  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Round History Indicators:**
- Filled circle (●) = Won this round
- Empty circle (○) = Lost this round
- Use player's theme color for filled circles
- Display max 5 rounds (for best-of-9 support in future)

**Styling:**
- Compact bar at top of game screen
- Uses bg-card with border-b
- Text size: sm-md for legibility
- Match score in bold, larger font

### 5.3 Between Rounds Screen

**Layout (Modal Overlay):**
```
┌──────────────────────────────────────────┐
│        🎉 Round 2 Complete!              │
│                                          │
│          Alice Wins This Round!          │
│                                          │
│  Match Score                             │
│  ┌──────────────────────────────────┐  │
│  │  Alice: 2  ●●○  vs  ○○●  Bob: 1 │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Round 2 Statistics                      │
│  ┌──────────────────────────────────┐  │
│  │  Alice: 7 pairs | 14 moves       │  │
│  │  Bob:   5 pairs | 16 moves       │  │
│  │  Duration: 2:34                   │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Grid Size for Next Round                │
│  [ 4x4 ]  [ 6x6 ]  [ 8x8 ]              │
│            ^current                      │
│                                          │
│              [Next Round]                 │
└──────────────────────────────────────────┘
```

**Styling:**
- Full-screen modal with backdrop blur
- Winner announcement with celebration animation
- Match score with visual indicators (same as scoreboard)
- Stats table with subtle borders
- Grid size selector (optional change)
- Large primary button for "Next Round"

### 5.4 Match Complete Modal

**Layout:**
```
┌──────────────────────────────────────────────┐
│           🏆 Match Complete!                  │
│                                               │
│        Alice Wins the Match 3-1!              │
│                                               │
│  Match Statistics                             │
│  ┌─────────────────────────────────────────┐ │
│  │ Round │ Winner │ Score  │ Grid │ Time  │ │
│  ├─────────────────────────────────────────┤ │
│  │   1   │ Alice  │ 8-4    │ 4x4  │ 1:45  │ │
│  │   2   │ Bob    │ 10-8   │ 6x6  │ 3:12  │ │
│  │   3   │ Alice  │ 12-6   │ 6x6  │ 2:58  │ │
│  │   4   │ Alice  │ 9-7    │ 4x4  │ 2:20  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Overall Stats                                │
│  ┌─────────────────────────────────────────┐ │
│  │ Total Duration: 10:15                   │ │
│  │ Alice: 39 pairs | Avg 9.8 per round    │ │
│  │ Bob:   25 pairs | Avg 6.3 per round    │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│         [Rematch]      [New Match]            │
└──────────────────────────────────────────────┘
```

**Styling:**
- Full-screen modal with celebration confetti animation
- Trophy emoji or icon for winner
- Data table with alternating row colors
- Summary stats in cards
- Two action buttons: Primary (Rematch) + Secondary (New Match)

---

## 6. Implementation Plan

### Phase 1: Core Match State Management (Day 1)
**Tasks:**
- [ ] Create `MatchState` and related TypeScript interfaces
- [ ] Implement `useMatchLogic` hook with core match flow
- [ ] Implement `useLocalStorageMatch` hook with persistence
- [ ] Write unit tests for match logic
- [ ] Test state transitions and edge cases

**Files to Create:**
- `apps/mymemory/src/types/match.ts`
- `apps/mymemory/src/hooks/useMatchLogic.ts`
- `apps/mymemory/src/hooks/useLocalStorageMatch.ts`
- `apps/mymemory/src/hooks/__tests__/useMatchLogic.test.ts`

### Phase 2: Match Configuration Screen (Day 2)
**Tasks:**
- [ ] Create `MatchConfigScreen` component
- [ ] Add rounds-to-win selector with radio buttons
- [ ] Integrate with existing player name and grid size inputs
- [ ] Add validation and error handling
- [ ] Connect to `useMatchLogic` hook
- [ ] Test component in isolation

**Files to Create:**
- `apps/mymemory/src/components/MatchConfigScreen.tsx`
- `apps/mymemory/src/components/__tests__/MatchConfigScreen.test.tsx`

### Phase 3: In-Game Match Display (Day 2-3)
**Tasks:**
- [ ] Create `MatchScoreboard` component
- [ ] Create `RoundHistoryIndicator` component
- [ ] Integrate scoreboard into main game screen
- [ ] Update existing player display to show round scores
- [ ] Test responsive layout
- [ ] Ensure dark mode compatibility

**Files to Create:**
- `apps/mymemory/src/components/MatchScoreboard.tsx`
- `apps/mymemory/src/components/RoundHistoryIndicator.tsx`

### Phase 4: Between Rounds Experience (Day 3)
**Tasks:**
- [ ] Create `BetweenRoundsScreen` component
- [ ] Implement round winner announcement
- [ ] Display round statistics
- [ ] Add grid size selector for next round
- [ ] Implement smooth transitions
- [ ] Connect to match state hooks

**Files to Create:**
- `apps/mymemory/src/components/BetweenRoundsScreen.tsx`

### Phase 5: Match Completion (Day 4)
**Tasks:**
- [ ] Create `MatchCompleteModal` component
- [ ] Implement match statistics table
- [ ] Add celebration animations
- [ ] Implement rematch functionality
- [ ] Save completed match to local storage
- [ ] Update player statistics

**Files to Create:**
- `apps/mymemory/src/components/MatchCompleteModal.tsx`

### Phase 6: Integration & Refactoring (Day 4-5)
**Tasks:**
- [ ] Refactor `App.tsx` to integrate match mode
- [ ] Add routing/state for match vs. single-game mode
- [ ] Implement resume match functionality
- [ ] Connect all components to match state
- [ ] Test complete user flow end-to-end
- [ ] Fix any UI/UX issues

**Files to Modify:**
- `apps/mymemory/src/app/app.tsx`

### Phase 7: Polish & Testing (Day 5)
**Tasks:**
- [ ] Add loading states and transitions
- [ ] Implement accessibility improvements (ARIA labels, keyboard nav)
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Write E2E tests
- [ ] Update documentation

**Testing Scenarios:**
- Complete match flow (best of 3, 5, 7)
- Early match clinch
- Grid size changes between rounds
- Page refresh during match (resume)
- Rematch functionality
- Local storage persistence
- Mobile touch interactions
- Dark mode compatibility

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Match Logic (`useMatchLogic.test.ts`):**
```typescript
describe('useMatchLogic', () => {
  test('initializes match with correct config', () => {});
  test('tracks round winners correctly', () => {});
  test('determines match winner at correct time', () => {});
  test('handles early match clinch', () => {});
  test('allows grid size change between rounds', () => {});
  test('prevents rounds-to-win change mid-match', () => {});
  test('calculates match statistics correctly', () => {});
});
```

**Local Storage (`useLocalStorageMatch.test.ts`):**
```typescript
describe('useLocalStorageMatch', () => {
  test('saves match state to local storage', () => {});
  test('loads match state on mount', () => {});
  test('completes match and updates history', () => {});
  test('updates player statistics correctly', () => {});
  test('handles storage quota errors gracefully', () => {});
  test('migrates old data format if needed', () => {});
});
```

### 7.2 Component Tests

**Test each component in isolation:**
- Props rendering
- User interactions (clicks, inputs)
- Conditional rendering
- Accessibility (keyboard navigation, ARIA)

### 7.3 Integration Tests

**Test complete user flows:**
```typescript
describe('Match Mode Integration', () => {
  test('complete best-of-3 match flow', () => {
    // 1. Select Two Player mode
    // 2. Configure match (rounds to win: 2)
    // 3. Play Round 1 - Player 1 wins
    // 4. See between-rounds screen
    // 5. Start Round 2 - Player 2 wins
    // 6. Start Round 3 - Player 1 wins
    // 7. See match complete modal
    // 8. Verify match statistics
    // 9. Click rematch
    // 10. Verify new match starts
  });

  test('match resume after page refresh', () => {
    // 1. Start match, play one round
    // 2. Simulate page refresh
    // 3. Verify "Resume Match" prompt appears
    // 4. Resume match
    // 5. Verify state is restored correctly
  });

  test('grid size change between rounds', () => {
    // 1. Start match with 4x4 grid
    // 2. Complete round
    // 3. Change to 6x6 in between-rounds screen
    // 4. Verify Round 2 uses 6x6 grid
  });
});
```

### 7.4 E2E Tests (Playwright/Cypress)

```typescript
// apps/mymemory-e2e/src/e2e/match-mode.cy.ts

describe('Match Mode E2E', () => {
  it('plays complete match and saves history', () => {
    cy.visit('/');
    cy.contains('Two Player').click();
    cy.get('input[name="player1"]').type('Alice');
    cy.get('input[name="player2"]').type('Bob');
    cy.get('[data-testid="rounds-to-win-3"]').click();
    cy.contains('Start Match').click();
    // ... play through match
    cy.contains('Alice Wins the Match!').should('be.visible');
  });
});
```

---

## 8. Future Enhancements

### 8.1 Near-Term (Post-MVP)
- **Player Profiles UI**: View match history and statistics per player
- **Leaderboard**: Top players by match wins, average score
- **Match Settings**: Add time limits per round, bonus points
- **Themes**: Custom themes/colors per player
- **Sound Effects**: Round win/loss sounds, match complete fanfare

### 8.2 Medium-Term
- **Best-of-N Higher Values**: Support best-of-7, best-of-9
- **Tournament Mode**: Bracket-style tournaments with 4+ players
- **Game Variants**: Different matching rules (triple match, time attack)
- **Achievements/Badges**: Unlock achievements for milestones
- **Export Stats**: Download match history as JSON/CSV

### 8.3 Long-Term
- **Online Multiplayer**: Remote play with WebSocket backend
- **Spectator Mode**: Watch live matches
- **Replay System**: Save and replay match recordings
- **AI Opponent**: Single-player vs. computer
- **Mobile App**: Native iOS/Android versions

---

## 9. Technical Debt & Refactoring Opportunities

### 9.1 Current Code Issues to Address
- **Monolithic App.tsx**: Extract game logic into hooks before adding match mode
- **No State Management Library**: Consider Zustand for complex match state
- **Limited Component Reusability**: Create more granular components
- **Missing TypeScript Strict Mode**: Enable for better type safety

### 9.2 Recommended Refactoring (Optional)
```
Before Match Mode Implementation:
1. Extract game logic from App.tsx into useGameLogic hook
2. Split App.tsx into smaller components:
   - ModeSelection.tsx
   - GameBoard.tsx
   - VictoryModal.tsx
3. Create shared types file (types/game.ts)
4. Add PropTypes or Zod validation for component props
```

**Trade-off:** Refactoring adds 1-2 days but makes match mode implementation cleaner and more maintainable.

---

## 10. Implementation Checklist

### Pre-Implementation
- [ ] Review and approve specification
- [ ] Decide on optional refactoring approach
- [ ] Set up feature branch: `feature/match-mode`
- [ ] Create project board/issues for tasks

### Development Phases
- [ ] Phase 1: Core match state management
- [ ] Phase 2: Match configuration screen
- [ ] Phase 3: In-game match display
- [ ] Phase 4: Between rounds experience
- [ ] Phase 5: Match completion
- [ ] Phase 6: Integration & refactoring
- [ ] Phase 7: Polish & testing

### Quality Assurance
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Dark mode testing
- [ ] Accessibility audit (WCAG 2.1 AA)

### Deployment
- [ ] Code review completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Merge to develop branch
- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 11. Appendix

### A. Key Files Reference

**Existing Files to Modify:**
- `apps/mymemory/src/app/app.tsx` (main game component)
- `apps/mymemory/src/types.d.ts` (add match types)

**New Files to Create:**
- `apps/mymemory/src/types/match.ts`
- `apps/mymemory/src/hooks/useMatchLogic.ts`
- `apps/mymemory/src/hooks/useLocalStorageMatch.ts`
- `apps/mymemory/src/components/MatchConfigScreen.tsx`
- `apps/mymemory/src/components/MatchScoreboard.tsx`
- `apps/mymemory/src/components/RoundHistoryIndicator.tsx`
- `apps/mymemory/src/components/BetweenRoundsScreen.tsx`
- `apps/mymemory/src/components/MatchCompleteModal.tsx`

### B. Dependencies

**No New External Dependencies Required!**

All features can be implemented with:
- Existing React 19 hooks
- Existing UI library components (`@wiowa-tech-studio/ui`)
- Existing Tailwind CSS styling
- Browser local storage API

### C. Design Assets Needed

- Celebration animation/confetti effect (for match winner)
- Trophy icon/emoji (match winner announcement)
- Round indicator icons (filled/empty circles or custom)
- Optional: Victory sound effects (match complete)

### D. Glossary

- **Match**: A complete series of rounds between two players (e.g., best-of-3)
- **Round**: A single game where players match all pairs on the board
- **Rounds to Win**: Target number of round victories needed to win the match
- **Match Score**: Count of rounds won by each player (e.g., Alice: 2, Bob: 1)
- **Round Score**: Pairs matched by each player within a single round
- **Clinch**: Early match victory when opponent can't catch up in remaining rounds

---

## 12. Questions & Decisions Log

| Question | Decision | Rationale | Date |
|----------|----------|-----------|------|
| Local or online multiplayer? | Local only (same device) | Simpler implementation, no backend needed | 2025-11-24 |
| Match format? | Best-of-N (first to win 2, 3, or 4 rounds) | Flexible, familiar format, early clinch possible | 2025-11-24 |
| Round victory condition? | Keep current (most pairs matched) | Maintains existing game mechanics | 2025-11-24 |
| Where to configure match? | After selecting "Two Player" mode | Logical flow, doesn't clutter initial menu | 2025-11-24 |
| Can grid size change mid-match? | Yes, between rounds only | Adds strategy, keeps rounds fair | 2025-11-24 |
| Data persistence? | Local storage (persistent) | Enables match history, stats, resume | 2025-11-24 |
| Display match progress? | Round counter, match score, history indicators | Full visibility, competitive feel | 2025-11-24 |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-24
**Status**: ✅ Ready for Implementation
**Estimated Effort**: 4-5 days focused development

---

## Next Steps

1. **Review this specification** - Confirm all requirements match expectations
2. **Prioritize features** - Identify must-haves vs. nice-to-haves for MVP
3. **Create implementation branch** - `git checkout -b feature/match-mode`
4. **Begin Phase 1** - Start with core match state management
5. **Iterative development** - Build and test phase by phase

Ready to start building! 🚀
