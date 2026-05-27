import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, MapPin, Phone, ChevronRight, Sparkles } from 'lucide-react';
import { getRestaurantInfo } from '../services/api';
import { WaitEstimateCard } from '../components/QueueCard';
import { showToast } from '../components/ToastNotification';

export const Home = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantInfo();
  }, []);

  const fetchRestaurantInfo = async () => {
    try {
      const response = await getRestaurantInfo();
      if (response.success) {
        setRestaurant(response.data);
      }
    } catch (error) {
      showToast.error('Failed to load restaurant information');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5577049/pexels-photo-5577049.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center mix-blend-overlay opacity-30"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className={`w-2 h-2 rounded-full ${restaurant?.is_open ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
            <span className="text-white text-sm font-medium">
              {restaurant?.is_open ? 'Open Now' : 'Closed'}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {restaurant?.name || 'Spice Garden'}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {restaurant?.description || 'Authentic Indian cuisine with rich flavors and aromatic spices'}
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{restaurant?.open_time || '11:00 AM'} - {restaurant?.close_time || '11:00 PM'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{restaurant?.total_tables || 10} Tables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Info Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Current Queue Status */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Queue</h2>

            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-600">
                  {restaurant?.queueLength || 0}
                </div>
                <p className="text-gray-500 text-sm mt-1">People Waiting</p>
              </div>

              <div className="flex-1 h-px bg-gray-200"></div>

              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-600">
                  {restaurant?.total_tables || 10}
                </div>
                <p className="text-gray-500 text-sm mt-1">Tables Available</p>
              </div>
            </div>

            {restaurant?.prediction && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <WaitEstimateCard prediction={restaurant.prediction} />
              </div>
            )}

            <button
              onClick={() => navigate('/queue/join')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Join the Queue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/queue/check')}>
              <h3 className="font-semibold text-gray-800 mb-2">Check Your Queue Status</h3>
              <p className="text-sm text-gray-500">Enter your token to see your position and wait time</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/menu')}>
              <h3 className="font-semibold text-gray-800 mb-2">View Our Menu</h3>
              <p className="text-sm text-gray-500">Explore our authentic Indian dishes</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 rounded-full p-3">
                  <Phone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Contact Us</h3>
                  <p className="text-sm text-gray-500">+91 98765 43210</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 rounded-full p-3">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Location</h3>
                  <p className="text-sm text-gray-500">123 Food Street, Downtown</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
