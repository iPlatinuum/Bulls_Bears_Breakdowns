import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { getEvents } from '@/services/api';

interface Event {
  id: number;
  title: string;
  sentiment: string;
  impact: number;
  timestamp: string;
}

const EventBanner = () => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const events = await getEvents();
      if (events && events.length > 0) {
        // Show the most recent/impactful event
        const sortedEvents = events.sort((a: Event, b: Event) => 
          Math.abs(b.impact) - Math.abs(a.impact)
        );
        setCurrentEvent(sortedEvents[0]);
        setIsVisible(true);
      }
    };

    fetchEvent();
    const interval = setInterval(fetchEvent, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  if (!currentEvent || !isVisible) return null;

  const getBannerColor = () => {
    switch (currentEvent.sentiment) {
      case 'positive':
        return 'bg-success/10 border-success/30 text-success';
      case 'negative':
        return 'bg-danger/10 border-danger/30 text-danger';
      default:
        return 'bg-warning/10 border-warning/30 text-warning';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border ${getBannerColor()} animate-slide-up relative`}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 rounded hover:bg-background/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3 pr-8">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground">Breaking AI Event</h4>
          <p className="text-sm text-foreground/90 mt-1">
            {currentEvent.title}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span>
              Impact: <span className="font-semibold">{(Math.abs(currentEvent.impact) * 100).toFixed(1)}%</span>
            </span>
            <span>•</span>
            <span>{new Date(currentEvent.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBanner;
