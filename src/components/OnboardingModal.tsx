import React from 'react';
import { Sprout, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-[#20382A] rounded-3xl shadow-2xl p-6 text-[#F5F0E6] border-2 border-[#354A37] animate-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Sprout className="w-9 h-9 text-[#D9AD5B]" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F0E6]">
            Bem-vindo ao Minha Safra 🌱
          </h2>
          <p className="text-base text-[#D8CEB8] mt-2">
            Controle os gastos, a produção e as vendas da sua safra de forma muito fácil.
          </p>
        </div>

        {/* 4 Steps */}
        <div className="space-y-3.5 mb-6 bg-[#14251C] p-4 rounded-2xl border border-[#354A37]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#C86F42]/20 text-[#C86F42] border border-[#C86F42]/40 text-sm font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <p className="text-base font-semibold text-[#F5F0E6]">
              💸 Registre gastos <span className="text-[#D8CEB8] font-normal text-sm">(adubo, veneno, diárias)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#D9AD5B]/20 text-[#D9AD5B] border border-[#D9AD5B]/40 text-sm font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <p className="text-base font-semibold text-[#F5F0E6]">
              📦 Registre colheita <span className="text-[#D8CEB8] font-normal text-sm">(quantidade colhida)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-sm font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <p className="text-base font-semibold text-[#F5F0E6]">
              💰 Registre vendas <span className="text-[#D8CEB8] font-normal text-sm">(dinheiro recebido)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#D9AD5B]/20 text-[#D9AD5B] border border-[#D9AD5B]/40 text-sm font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <p className="text-base font-semibold text-[#F5F0E6]">
              🌾 Veja seu lucro <span className="text-[#D8CEB8] font-normal text-sm">(resultado da safra)</span>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-onboarding-comecar"
          onClick={onClose}
          className="w-full min-h-[56px] py-4 bg-[#C86F42] hover:bg-[#b86134] active:scale-[0.99] text-[#F5F0E6] rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2.5 transition border border-[#C86F42]"
        >
          <span>COMEÇAR AGORA</span>
          <ArrowRight className="w-5 h-5 text-[#F5F0E6]" />
        </button>
      </div>
    </div>
  );
};
