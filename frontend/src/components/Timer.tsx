import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const Timer = () => {
  const ROUND_DURATION = 3 * 60; // 3 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return ROUND_DURATION; // Reset to 3 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Pulse animation when time is running out (last 30 seconds)
    if (timeLeft <= 30) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / ROUND_DURATION) * 100;

  const getColorClass = () => {
    if (timeLeft <= 30) return 'text-danger';
    if (timeLeft <= 60) return 'text-warning';
    return 'text-primary';
  };

  return (
    <div className="flex items-center gap-4 px-6 py-3 rounded-lg bg-card border border-border">
      <Clock className={`w-5 h-5 ${getColorClass()} ${isPulsing ? 'animate-pulse-glow' : ''}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Round Timer</span>
          <span className={`text-lg font-mono font-bold ${getColorClass()}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 30
                ? 'bg-danger'
                : timeLeft <= 60
                ? 'bg-warning'
                : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timer;
