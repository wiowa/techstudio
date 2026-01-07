/**
 * MatchCompleteModal Component
 * Displayed when a match is complete with statistics and rematch options
 */

import { Button } from '@wiowa-tech-studio/ui';
import type { MatchRecord } from '../../types/match';

interface MatchCompleteModalProps {
  matchRecord: MatchRecord;
  onRematch: () => void;
  onNewMatch: () => void;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MatchCompleteModal({
  matchRecord,
  onRematch,
  onNewMatch,
}: MatchCompleteModalProps) {
  const winnerName = matchRecord.players[matchRecord.winner];
  const winnerScore = matchRecord.finalScore[matchRecord.winner];
  const loserScore = matchRecord.finalScore[matchRecord.winner === 0 ? 1 : 0];

  // Calculate overall stats
  const totalPairsPlayer1 = matchRecord.rounds.reduce(
    (sum, round) => sum + round.scores[0],
    0
  );
  const totalPairsPlayer2 = matchRecord.rounds.reduce(
    (sum, round) => sum + round.scores[1],
    0
  );
  const avgPairsPlayer1 = (totalPairsPlayer1 / matchRecord.rounds.length).toFixed(1);
  const avgPairsPlayer2 = (totalPairsPlayer2 / matchRecord.rounds.length).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Winner Announcement */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-2">
            Match Complete!
          </h2>
          <p className="text-2xl font-bold text-purple-600 dark:text-primary">
            {winnerName} Wins the Match {winnerScore}-{loserScore}!
          </p>
        </div>

        {/* Match Statistics Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-3 text-center">
            Match Statistics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-muted">
                  <th className="py-2 px-3 text-left text-gray-700 dark:text-muted-foreground">
                    Round
                  </th>
                  <th className="py-2 px-3 text-left text-gray-700 dark:text-muted-foreground">
                    Winner
                  </th>
                  <th className="py-2 px-3 text-center text-gray-700 dark:text-muted-foreground">
                    Score
                  </th>
                  <th className="py-2 px-3 text-center text-gray-700 dark:text-muted-foreground">
                    Grid
                  </th>
                  <th className="py-2 px-3 text-center text-gray-700 dark:text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchRecord.rounds.map((round, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-muted/50 hover:bg-gray-50 dark:hover:bg-muted/30"
                  >
                    <td className="py-2 px-3 text-gray-900 dark:text-foreground">
                      {round.roundNumber}
                    </td>
                    <td className="py-2 px-3 text-gray-900 dark:text-foreground font-semibold">
                      {matchRecord.players[round.winner]}
                    </td>
                    <td className="py-2 px-3 text-center text-gray-700 dark:text-muted-foreground">
                      {round.scores[0]}-{round.scores[1]}
                    </td>
                    <td className="py-2 px-3 text-center text-gray-700 dark:text-muted-foreground">
                      {round.gridSize}
                    </td>
                    <td className="py-2 px-3 text-center text-gray-700 dark:text-muted-foreground">
                      {formatDuration(round.duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-3 text-center">
            Overall Stats
          </h3>
          <div className="bg-purple-50 dark:bg-muted/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="text-gray-700 dark:text-muted-foreground">
                  Total Duration
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-foreground">
                  {formatDuration(matchRecord.duration)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-700 dark:text-muted-foreground">
                  {matchRecord.players[0]}
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-primary">
                  {totalPairsPlayer1} pairs | Avg {avgPairsPlayer1}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-700 dark:text-muted-foreground">
                  {matchRecord.players[1]}
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-secondary">
                  {totalPairsPlayer2} pairs | Avg {avgPairsPlayer2}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={onRematch}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
          >
            Rematch
          </Button>
          <Button
            size="lg"
            onClick={onNewMatch}
            className="text-secondary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 min-w-[140px]"
          >
            New Match
          </Button>
        </div>
      </div>
    </div>
  );
}
