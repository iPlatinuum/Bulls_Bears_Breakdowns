import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Activity, Target } from 'lucide-react';
import { getLeaderboard } from '../services/api';
import Navbar from '../components/Navbar';

interface LeaderboardEntry {
  team_name: string;
  pnl: number;
  sharpe_ratio: number;
  adaptability_score: number;
  rank: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'pnl' | 'sharpe_ratio' | 'adaptability_score'>('pnl');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);

    return () => clearInterval(interval);
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-warning';
    if (rank === 2) return 'text-muted-foreground';
    if (rank === 3) return 'text-warning/70';
    return 'text-muted-foreground';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`w-6 h-6 ${getRankColor(rank)}`} />;
    }
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Live rankings updated every 10 seconds
          </p>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setSortBy('pnl')}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === 'pnl'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            P&L
          </button>
          <button
            onClick={() => setSortBy('sharpe_ratio')}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === 'sharpe_ratio'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Sharpe Ratio
          </button>
          <button
            onClick={() => setSortBy('adaptability_score')}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === 'adaptability_score'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Adaptability
          </button>
        </div>

        <div className="rounded-lg bg-card border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Team
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    P&L
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Sharpe Ratio
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Adaptability
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((entry, index) => (
                  <tr
                    key={entry.team_name}
                    className={`border-b border-border transition-colors hover:bg-secondary/30 ${
                      entry.team_name === 'Demo Team' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {entry.team_name}
                        </span>
                        {entry.team_name === 'Demo Team' && (
                          <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary border border-primary/30">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-semibold ${
                          entry.pnl >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {entry.pnl >= 0 ? '+' : ''}$
                        {entry.pnl.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-foreground">
                        {entry.sharpe_ratio.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${entry.adaptability_score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-foreground w-8">
                          {entry.adaptability_score}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="text-sm text-muted-foreground">Top P&L</h3>
            </div>
            <p className="text-2xl font-bold text-success">
              ${sortedLeaderboard[0]?.pnl.toLocaleString() || '0'}
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-sm text-muted-foreground">Best Sharpe</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.max(...sortedLeaderboard.map((e) => e.sharpe_ratio)).toFixed(2)}
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <h3 className="text-sm text-muted-foreground">Highest Adapt</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.max(...sortedLeaderboard.map((e) => e.adaptability_score))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
