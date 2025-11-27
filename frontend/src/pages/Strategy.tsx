import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { useToast } from '../hooks/use-toast';
import { deployStrategy } from '../services/api';
import Navbar from '../components/Navbar';
import { Zap, Shield, Target, TrendingUp } from 'lucide-react';

const Strategy = () => {
  const { toast } = useToast();
  const [strategy, setStrategy] = useState('momentum');
  const [riskLevel, setRiskLevel] = useState([5]);
  const [threshold, setThreshold] = useState([2]);
  const [stopLoss, setStopLoss] = useState([5]);
  const [tradeFrequency, setTradeFrequency] = useState([10]);
  const [isDeploying, setIsDeploying] = useState(false);

  const strategies = [
    {
      value: 'momentum',
      label: 'Momentum',
      icon: TrendingUp,
      description: 'Follows strong price trends and rides the wave',
    },
    {
      value: 'mean_reversion',
      label: 'Mean Reversion',
      icon: Target,
      description: 'Bets on prices returning to historical averages',
    },
    {
      value: 'news_follower',
      label: 'News Follower',
      icon: Zap,
      description: 'Reacts to AI-generated news and sentiment',
    },
    {
      value: 'hedger',
      label: 'Hedger',
      icon: Shield,
      description: 'Protects portfolio with counter-positions',
    },
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    const config = {
      strategy,
      risk_level: riskLevel[0],
      threshold: threshold[0],
      stop_loss: stopLoss[0],
      trade_frequency: tradeFrequency[0],
    };

    try {
      await deployStrategy(config);
      
      toast({
        title: '✓ Strategy Deployed Successfully',
        description: `${strategy} strategy is now active with ${riskLevel[0]}/10 risk level`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Deployment Failed',
        description: 'Unable to deploy strategy. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const selectedStrategyInfo = strategies.find((s) => s.value === strategy);
  const StrategyIcon = selectedStrategyInfo?.icon || TrendingUp;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Strategy Configuration
          </h1>
          <p className="text-muted-foreground">
            Deploy your trading algorithm with custom parameters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border shadow-card">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Select Strategy
              </h2>

              <div className="space-y-2 mb-6">
                <Label className="text-sm text-muted-foreground">
                  Trading Algorithm
                </Label>
                <Select value={strategy} onValueChange={setStrategy}>
                  <SelectTrigger className="w-full bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {strategies.map((strat) => {
                      const Icon = strat.icon;
                      return (
                        <SelectItem key={strat.value} value={strat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span>{strat.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Risk Level
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {riskLevel[0]}/10
                    </span>
                  </div>
                  <Slider
                    value={riskLevel}
                    onValueChange={setRiskLevel}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher risk = larger position sizes and potential returns
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Threshold %
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {threshold[0]}%
                    </span>
                  </div>
                  <Slider
                    value={threshold}
                    onValueChange={setThreshold}
                    min={0.5}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum price movement to trigger a trade
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Stop Loss %
                    </Label>
                    <span className="text-sm font-semibold text-danger">
                      {stopLoss[0]}%
                    </span>
                  </div>
                  <Slider
                    value={stopLoss}
                    onValueChange={setStopLoss}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum loss before auto-exit position
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Trade Frequency (per minute)
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {tradeFrequency[0]}x
                    </span>
                  </div>
                  <Slider
                    value={tradeFrequency}
                    onValueChange={setTradeFrequency}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    How often the algorithm executes trades
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                size="lg"
              >
                {isDeploying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Deploying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Deploy Strategy
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border shadow-card sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <StrategyIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedStrategyInfo?.label}
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                {selectedStrategyInfo?.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground">
                  Current Configuration
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="font-semibold text-foreground">
                      {riskLevel[0]}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Threshold:</span>
                    <span className="font-semibold text-foreground">
                      {threshold[0]}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stop Loss:</span>
                    <span className="font-semibold text-danger">
                      {stopLoss[0]}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-semibold text-foreground">
                      {tradeFrequency[0]}x/min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strategy;
