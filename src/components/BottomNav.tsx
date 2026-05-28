import { useNavigate, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, Heart, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/recipes', icon: UtensilsCrossed, label: 'Recipes' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart' },
  { path: '/wishlist', icon: Heart, label: 'Wishlist' },
  { path: '/summary', icon: BarChart2, label: 'Summary' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCartItems, wishlist } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d180d]/95 backdrop-blur-md border-t border-white/5">
      <div className="flex items-center max-w-lg mx-auto">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path ||
            (tab.path === '/recipes' && location.pathname.startsWith('/recipe'));
          const Icon = tab.icon;
          const badge = tab.path === '/cart' ? totalCartItems
            : tab.path === '/wishlist' ? wishlist.length
            : 0;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ${
                isActive ? 'text-[#4CAF50]' : 'text-[#3a5a38]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF8C42] rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#4CAF50] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
