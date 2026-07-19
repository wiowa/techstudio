/**
 * MatchCompleteModal Component
 * Affiché à la fin d'un match (design harmonisé).
 */

import type { MatchRecord } from '../types/match';

interface MatchCompleteModalProps {
  matchRecord: MatchRecord;
  onRematch: () => void;
  onNewMatch: () => void;
}

const PLAYER_COLORS = ['#64A18A', '#A88550'];

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

  const totalPairsPlayer1 = matchRecord.rounds.reduce((sum, round) => sum + round.scores[0], 0);
  const totalPairsPlayer2 = matchRecord.rounds.reduce((sum, round) => sum + round.scores[1], 0);
  const avgPairsPlayer1 = (totalPairsPlayer1 / matchRecord.rounds.length).toFixed(1);
  const avgPairsPlayer2 = (totalPairsPlayer2 / matchRecord.rounds.length).toFixed(1);

  const labelStyle = {
    fontFamily: 'Akshar, sans-serif',
    fontWeight: 400 as const,
    fontSize: 12,
    letterSpacing: '0.05em',
    color: '#434C41',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-[40px] px-8 py-8 shadow-2xl"
        style={{ backgroundColor: '#D1D2BF', fontFamily: 'Akshar, sans-serif' }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Vainqueur */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-5xl">🏆</div>
            <span
              className="leading-none"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 28, color: '#2D2D2D' }}
            >
              Match complete
            </span>
            <span className="uppercase" style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', color: '#000000' }}>
              {winnerName} wins {winnerScore}-{loserScore}
            </span>
          </div>

          {/* Tableau des manches */}
          <div className="w-full">
            <p className="mb-2 text-center uppercase" style={labelStyle}>
              Match statistics
            </p>
            <div className="overflow-x-auto rounded-lg" style={{ backgroundColor: '#EFEFEE' }}>
              <table className="w-full" style={{ fontFamily: 'Akshar, sans-serif', fontSize: 12, color: '#434C41' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(67,76,65,0.2)' }}>
                    <th className="px-3 py-2 text-left uppercase" style={{ fontWeight: 600 }}>Round</th>
                    <th className="px-3 py-2 text-left uppercase" style={{ fontWeight: 600 }}>Winner</th>
                    <th className="px-3 py-2 text-center uppercase" style={{ fontWeight: 600 }}>Score</th>
                    <th className="px-3 py-2 text-center uppercase" style={{ fontWeight: 600 }}>Grid</th>
                    <th className="px-3 py-2 text-center uppercase" style={{ fontWeight: 600 }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {matchRecord.rounds.map((round, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(67,76,65,0.1)' }}>
                      <td className="px-3 py-2">{round.roundNumber}</td>
                      <td className="px-3 py-2" style={{ fontWeight: 600 }}>
                        {matchRecord.players[round.winner]}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {round.scores[0]}-{round.scores[1]}
                      </td>
                      <td className="px-3 py-2 text-center uppercase">{round.gridSize}</td>
                      <td className="px-3 py-2 text-center">{formatDuration(round.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistiques globales */}
          <div className="w-full">
            <p className="mb-2 text-center uppercase" style={labelStyle}>
              Overall stats
            </p>
            <div
              className="grid grid-cols-3 gap-3 rounded-lg px-4 py-3 text-center"
              style={{ backgroundColor: '#EFEFEE' }}
            >
              <div>
                <div className="uppercase" style={{ fontWeight: 300, fontSize: 10, color: '#434C41' }}>Duration</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#434C41' }}>
                  {formatDuration(matchRecord.duration)}
                </div>
              </div>
              <div>
                <div className="uppercase" style={{ fontWeight: 300, fontSize: 10, color: '#434C41' }}>
                  {matchRecord.players[0]}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16, color: PLAYER_COLORS[0] }}>
                  {totalPairsPlayer1} · {avgPairsPlayer1}
                </div>
              </div>
              <div>
                <div className="uppercase" style={{ fontWeight: 300, fontSize: 10, color: '#434C41' }}>
                  {matchRecord.players[1]}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16, color: PLAYER_COLORS[1] }}>
                  {totalPairsPlayer2} · {avgPairsPlayer2}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full max-w-[320px] flex-col gap-3">
            <button
              type="button"
              onClick={onRematch}
              className="w-full rounded-lg px-6 py-3 uppercase transition-transform duration-200 hover:scale-[1.03]"
              style={{ backgroundColor: '#9B3A14', color: '#FFFFFF', fontWeight: 600, fontSize: 14, letterSpacing: '-0.03em' }}
            >
              Rematch
            </button>
            <button
              type="button"
              onClick={onNewMatch}
              className="w-full rounded-lg px-6 py-3 uppercase transition-transform duration-200 hover:scale-[1.03]"
              style={{ backgroundColor: '#EFEFEE', color: '#434C41', fontWeight: 600, fontSize: 13, letterSpacing: '-0.03em' }}
            >
              New match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
