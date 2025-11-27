import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import PriceChart from '../components/PriceChart';
import MarketSentiment from '../components/MarketSentiment';
import EventBanner from '../components/EventBanner';
import NewsFeed from '../components/NewsFeed';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Timer />
              <MarketSentiment />
            </div>

            <EventBanner />

            <div className="p-6 rounded-lg bg-card border border-border shadow-card">
              <PriceChart />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border shadow-card sticky top-24">
              <NewsFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
