import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { getTeams } from '@/services/api';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [teamName, setTeamName] = useState('Loading...');
  const location = useLocation();

  useEffect(() => {
    const fetchTeam = async () => {
      const data = await getTeams();
      setTeamName(data.team_name);
    };
    fetchTeam();
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/strategy', label: 'Strategy' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 animate-pulse-glow">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                AI Hedge Fund Challenge
              </h1>
              <p className="text-xs text-muted-foreground">
                Futures & HFT Edition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="px-4 py-2 rounded-lg bg-secondary border border-border">
              <span className="text-xs text-muted-foreground">Team:</span>
              <span className="ml-2 text-sm font-semibold text-primary">
                {teamName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
