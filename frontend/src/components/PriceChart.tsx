import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getMarketTick } from '@/services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceData {
  price: number;
  timestamp: string;
  volume: number;
  change: number;
}

const PriceChart = () => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const maxDataPoints = 30;

  useEffect(() => {
    const fetchPrice = async () => {
      const data = await getMarketTick();
      
      setCurrentPrice(data.price);
      setPriceChange(data.change);
      
      setPriceHistory((prev) => {
        const newHistory = [...prev, data];
        if (newHistory.length > maxDataPoints) {
          return newHistory.slice(-maxDataPoints);
        }
        return newHistory;
      });
    };

    fetchPrice(); // Initial fetch
    const interval = setInterval(fetchPrice, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: priceHistory.map((d) =>
      new Date(d.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit' 
      })
    ),
    datasets: [
      {
        label: 'Corn Futures Price',
        data: priceHistory.map((d) => d.price),
        borderColor: 'hsl(190 95% 50%)',
        backgroundColor: 'hsl(190 95% 50% / 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'hsl(190 95% 50%)',
        pointHoverBorderColor: 'hsl(190 95% 60%)',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(220 18% 10%)',
        titleColor: 'hsl(0 0% 98%)',
        bodyColor: 'hsl(0 0% 98%)',
        borderColor: 'hsl(190 95% 50%)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'hsl(220 10% 25% / 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(220 10% 60%)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: 'hsl(220 10% 25% / 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(220 10% 60%)',
          callback: function (value: any) {
            return '$' + value.toFixed(0);
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-muted-foreground">Corn Futures (ZC)</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              ${currentPrice.toFixed(2)}
            </span>
            <span
              className={`text-lg font-semibold ${
                priceChange >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {priceChange >= 0 ? '+' : ''}
              {priceChange.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-xs text-muted-foreground">Live</span>
          <div className="w-2 h-2 rounded-full bg-primary inline-block ml-2 animate-pulse-glow" />
        </div>
      </div>

      <div className="h-[400px] rounded-lg bg-card/50 border border-border p-4">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceChart;
