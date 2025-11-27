import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getEvents } from '@/services/api';

const MarketSentiment = () => {
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [sentimentScore, setSentimentScore] = useState(0);

  useEffect(() => {
    const fetchSentiment = async () => {
      const events = await getEvents();
      
      // Calculate overall sentiment from events
      const totalImpact = events.reduce((sum: number, event: any) => {
        const multiplier = event.sentiment === 'positive' ? 1 : event.sentiment === 'negative' ? -1 : 0;
        return sum + (event.impact * multiplier);
      }, 0);

      const avgImpact = totalImpact / (events.length || 1);
      setSentimentScore(avgImpact);

      if (avgImpact > 0.02) {
        setSentiment('positive');
      } else if (avgImpact < -0.02) {
        setSentiment('negative');
      } else {
        setSentiment('neutral');
      }
    };

    fetchSentiment();
    const interval = setInterval(fetchSentiment, 10000);

    return () => clearInterval(interval);
  }, []);

  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: TrendingUp,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/30',
          label: 'Bullish',
          description: 'Market conditions favorable',
        };
      case 'negative':
        return {
          icon: TrendingDown,
          color: 'text-danger',
          bgColor: 'bg-danger/10',
          borderColor: 'border-danger/30',
          label: 'Bearish',
          description: 'Market conditions unfavorable',
        };
      default:
        return {
          icon: Minus,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
          borderColor: 'border-muted',
          label: 'Neutral',
          description: 'Market conditions stable',
        };
    }
  };

  const config = getSentimentConfig();
  const Icon = config.icon;

  return (
    <div
      className={`p-6 rounded-lg border ${config.bgColor} ${config.borderColor} animate-fade-in`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${config.bgColor} ${config.color}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm text-muted-foreground mb-1">Market Sentiment</h3>
          <div className="flex items-baseline gap-3">
            <span className={`text-2xl font-bold ${config.color}`}>
              {config.label}
            </span>
            <span className="text-sm text-muted-foreground">
              {(sentimentScore * 100).toFixed(1)}% impact
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketSentiment;
