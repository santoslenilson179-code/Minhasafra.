import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#C86F42] text-[#F5F0E6] px-4 py-2.5 rounded-full text-sm font-bold shadow-xl border border-[#D9AD5B] max-w-[92vw]"
    >
      <WifiOff className="w-5 h-5 shrink-0 text-[#F5F0E6]" />
      <span>Modo sem internet — seus dados continuam salvos no celular</span>
    </div>
  );
};
