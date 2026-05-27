import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Utensils } from 'lucide-react';
import { getMenu, placeOrder } from '../services/api';
import { MenuCard } from '../components/MenuCard';
import { showToast } from '../components/ToastNotification';

export const Menu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queueToken = searchParams.get('token');

  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await getMenu();
      if (response.success) {
        setMenu(response.data);
      }
    } catch (error) {
      showToast.error('Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemove = (item) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id]--;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const categoryItems = Object.values(menu).flat();
    const item = categoryItems.find(i => i.id === parseInt(id));
    return { menuItemId: parseInt(id), quantity, item };
  }).filter(i => i.item);

  const totalAmount = cartItems.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!queueToken) {
      showToast.error('Please join the queue first to place an order');
      navigate('/queue/join');
      return;
    }

    if (cartItems.length === 0) {
      showToast.error('Please add items to your cart');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        queueToken,
        items: cartItems.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      };

      const response = await placeOrder(orderData);
      if (response.success) {
        showToast.success('Order placed successfully!');
        setCart({});
        navigate(`/queue/status/${queueToken}`);
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOrder = ['Starters', 'Mains', 'Desserts'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {cartItems.length > 0 && (
            <div className="flex items-center gap-4 bg-white rounded-full pl-4 pr-2 py-2 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">{cartItems.length} items</span>
                <span className="text-gray-500">|</span>
                <span className="font-bold text-amber-600">₹{totalAmount.toFixed(0)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Placing...' : 'Order Now'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 rounded-full p-2">
              <Utensils className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Our Menu</h1>
          </div>
          <p className="text-gray-500">Explore our authentic Indian dishes</p>
        </div>

        <div className="space-y-12">
          {categoryOrder.map(category => (
            menu[category] && menu[category].length > 0 && (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-amber-500">
                  {category}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menu[category].map(item => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                      quantity={cart[item.id] || 0}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Fixed Cart Summary for Mobile */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{cartItems.length} items</p>
                <p className="text-lg font-bold text-amber-600">₹{totalAmount.toFixed(0)}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
