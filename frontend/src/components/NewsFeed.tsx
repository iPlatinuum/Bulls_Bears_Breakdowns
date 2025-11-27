import { useEffect, useState } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getEvents } from '@/services/api';

interface Event {
  id: number;
  title: string;
  sentiment: string;
  impact: number;
  timestamp: string;
}

const NewsFeed = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      setEvents(data.slice(0, 3)); // Show only 3 most recent
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-danger" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-success bg-success/5';
      case 'negative':
        return 'border-l-danger bg-danger/5';
      default:
        return 'border-l-muted bg-muted/20';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">AI News Feed</h3>
      </div>

      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`p-3 rounded-lg border-l-4 ${getSentimentColor(
              event.sentiment
            )} border border-border animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-2">
              {getSentimentIcon(event.sentiment)}
              <div className="flex-1">
                <p className="text-sm text-foreground leading-tight">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Impact: {(event.impact * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
