import React from 'react';
import { Home, BarChart3, History, Settings } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'resultado', label: 'Resultado', icon: BarChart3 },
    { id: 'mais', label: 'Ajustes', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#20382A] border-t border-[#354A37] shadow-[0_-4px_24px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all select-none min-h-[52px] ${
                isActive
                  ? 'text-[#D9AD5B]'
                  : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
              }`}
            >
              <div
                className={`px-3 py-1 rounded-xl transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-[#14251C] text-[#D9AD5B] border border-[#354A37]'
                    : 'text-[#D8CEB8]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              </div>
              <span className={`text-[13px] leading-tight mt-0.5 ${isActive ? 'font-bold text-[#D9AD5B]' : 'font-medium text-[#D8CEB8]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
