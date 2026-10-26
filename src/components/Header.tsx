import React from 'react';
import { ChevronDown, Sprout } from 'lucide-react';
import { Safra } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  safraAtiva: Safra | null;
  onOpenSafras: () => void;
}

export const Header: React.FC<HeaderProps> = ({ safraAtiva, onOpenSafras }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#20382A] text-[#F5F0E6] border-b border-[#354A37] shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#14251C] border border-[#354A37] flex items-center justify-center text-[#D9AD5B] shadow-inner shrink-0">
            <Sprout className="w-6 h-6 text-[#D9AD5B]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#F5F0E6] leading-tight">
                Minha Safra
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#D8CEB8] font-medium leading-none mt-0.5">
              Controle simples do produtor
            </p>
          </div>
        </div>

        {/* Right action & Safra selector */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton variant="header" />

          <button
            id="btn-switch-safra-header"
            onClick={onOpenSafras}
            className="flex items-center gap-1.5 bg-[#14251C] hover:bg-[#354A37] active:scale-[0.98] text-[#F5F0E6] text-sm font-bold px-3 py-2 rounded-xl border border-[#354A37] shadow-xs max-w-[150px] min-h-[42px] transition"
            title="Trocar ou gerenciar safra"
          >
            <span className="truncate text-[#D9AD5B] font-bold">
              {safraAtiva ? safraAtiva.nome : 'Trocar Safra'}
            </span>
            <ChevronDown className="w-4 h-4 shrink-0 text-[#D8CEB8]" />
          </button>
        </div>
      </div>
    </header>
  );
};
