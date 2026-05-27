import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Clock, Users, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { joinQueue, getQueueStatus } from '../services/api';
import { QueueCard, WaitEstimateCard } from '../components/QueueCard';
import { showToast } from '../components/ToastNotification';
import { useSocket } from '../hooks/useSocket';

export const JoinQueue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', partySize: 2 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await joinQueue(formData);
      if (response.success) {
        showToast.success('Successfully joined the queue!');
        navigate(`/queue/status/${response.data.customer.queueToken}`);
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to join queue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Join the Queue</h1>
          <p className="text-gray-500 mb-8">Enter your details to join Spice Garden's virtual queue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors outline-none"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Party Size</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, partySize: Math.max(1, formData.partySize - 1) })}
                  className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-800 w-12 text-center">
                  {formData.partySize}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, partySize: Math.min(20, formData.partySize + 1) })}
                  className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Joining...' : 'Join Queue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const QueueStatus = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { joinCustomerRoom, onTableReady, onQueueUpdate, off, isConnected } = useSocket();

  const [customer, setCustomer] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [token]);

  useEffect(() => {
    if (isConnected && token) {
      joinCustomerRoom(token);
    }
  }, [isConnected, token]);

  useEffect(() => {
    const handleQueueUpdate = (data) => {
      fetchStatus();
    };

    const handleTableReady = (data) => {
      showToast.success(data.message);
      fetchStatus();
    };

    onQueueUpdate(handleQueueUpdate);
    onTableReady(handleTableReady);

    return () => {
      off('queue-updated', handleQueueUpdate);
      off('table-ready', handleTableReady);
    };
  }, [token]);

  const fetchStatus = async () => {
    try {
      const response = await getQueueStatus(token);
      if (response.success) {
        setCustomer(response.data.customer);
        setPrediction(response.data.prediction);
      }
    } catch (error) {
      showToast.error('Invalid or expired queue token');
      navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="space-y-6">
          <QueueCard customer={customer} prediction={prediction} />

          {customer?.status === 'WAITING' && prediction && (
            <WaitEstimateCard prediction={prediction} />
          )}

          {customer?.status === 'WAITING' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Pre-order Food</h3>
              <p className="text-sm text-gray-500 mb-4">
                Save time by ordering while you wait. Your food will be ready when you're seated.
              </p>
              <button
                onClick={() => navigate(`/menu?token=${token}`)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Browse Menu
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {customer?.orders && customer.orders.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Your Pre-Orders</h3>
              <div className="space-y-3">
                {customer.orders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Order #{order.id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CheckQueue = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await getQueueStatus(token.toUpperCase());
      if (response.success) {
        navigate(`/queue/status/${token.toUpperCase()}`);
      }
    } catch (error) {
      showToast.error('Invalid token. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Queue Status</h1>
          <p className="text-gray-500 mb-8">Enter your queue token to see your position</p>

          <form onSubmit={handleCheck} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Queue Token</label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors outline-none font-mono text-lg text-center uppercase"
                placeholder="SG-XXX"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Check Status'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
