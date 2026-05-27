import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, ChefHat, Sparkles, LogOut, RefreshCw, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { getFullQueue, seatCustomer, removeCustomer, getOrders, updateOrderStatus, getWaitPrediction } from '../../services/api';
import { AdminTable } from '../../components/AdminTable';
import { showToast } from '../../components/ToastNotification';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { joinAdminRoom, onQueueUpdate, off, isConnected } = useSocket();

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isConnected) {
      joinAdminRoom();
    }
  }, [isConnected]);

  useEffect(() => {
    const handleQueueUpdate = () => {
      fetchData();
    };

    onQueueUpdate(handleQueueUpdate);

    return () => {
      off('queue-updated', handleQueueUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [queueRes, ordersRes, predRes] = await Promise.all([
        getFullQueue(),
        getOrders(),
        getWaitPrediction(),
      ]);

      if (queueRes.success) setCustomers(queueRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (predRes.success) setPrediction(predRes.data);
    } catch (error) {
      showToast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeat = async (id) => {
    try {
      const response = await seatCustomer(id);
      if (response.success) {
        showToast.success('Customer seated successfully');
        fetchData();
      }
    } catch (error) {
      showToast.error('Failed to seat customer');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this customer from the queue?')) return;

    try {
      const response = await removeCustomer(id);
      if (response.success) {
        showToast.success('Customer removed from queue');
        fetchData();
      }
    } catch (error) {
      showToast.error('Failed to remove customer');
    }
  };

  const handleOrderStatusUpdate = async (id, status) => {
    try {
      const response = await updateOrderStatus(id, status);
      if (response.success) {
        showToast.success('Order status updated');
        fetchData();
      }
    } catch (error) {
      showToast.error('Failed to update order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 rounded-lg p-2">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Spice Garden</h1>
                <p className="text-gray-400 text-sm">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm hidden sm:block">
                {admin?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Queue</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{customers.length}</p>
              </div>
              <div className="bg-amber-100 rounded-full p-3">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">AI Wait Estimate</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {prediction?.estimatedWaitMinutes || 0} min
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            {prediction?.peakHourWarning && (
              <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                Peak Hours
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{orders.length}</p>
              </div>
              <div className="bg-emerald-100 rounded-full p-3">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tables Available</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {Math.max(0, 10 - customers.filter(c => c.status === 'SEATED').length)}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'queue'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Queue Management
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Content */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === 'queue' ? 'Current Queue' : 'Pre-Orders'}
          </h2>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Refresh</span>
          </button>
        </div>

        {activeTab === 'queue' ? (
          <AdminTable
            customers={customers}
            onSeat={handleSeat}
            onRemove={handleRemove}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No orders yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm">#{order.id}</td>
                          <td className="px-6 py-4">{order.customer?.name || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {order.items?.length || 0} items
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-800">
                            ₹{order.totalAmount}
                          </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">
                          ₹{order.total_amount}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {order.status === 'PENDING' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'PREPARING')}
                                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors"
                              >
                                Start Preparing
                              </button>
                            )}
                            {order.status === 'PREPARING' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'READY')}
                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm transition-colors"
                              >
                                Mark Ready
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
