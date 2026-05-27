import { Plus, Minus } from 'lucide-react';

export const MenuCard = ({ item, onAdd, onRemove, quantity = 0 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <span className="text-lg font-bold text-amber-600">
            ₹{item.price}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              item.category === 'Starters'
                ? 'bg-amber-100 text-amber-700'
                : item.category === 'Mains'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-pink-100 text-pink-700'
            }`}
          >
            {item.category}
          </span>

          {!item.isAvailable ? (
            <span className="text-sm text-red-500 font-medium">Unavailable</span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(item)}
                disabled={quantity === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-8 text-center font-semibold text-gray-800">
                {quantity}
              </span>
              <button
                onClick={() => onAdd(item)}
                className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
