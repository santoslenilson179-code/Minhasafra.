import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'card' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, don't show
  if (isInstalled) {
    return null;
  }

  // Android / Chromium / Desktop
  if (isInstallable) {
    if (variant === 'card') {
      return (
        <button
          id="btn-install-app-card"
          onClick={install}
          className="w-full flex items-center justify-between p-4 bg-[#20382A] text-[#F5F0E6] rounded-2xl border-2 border-[#354A37] hover:border-[#D9AD5B] shadow-sm transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#14251C] border border-[#354A37] flex items-center justify-center text-[#D9AD5B]">
              <Download className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-base text-[#F5F0E6]">Instalar aplicativo</p>
              <p className="text-sm text-[#D8CEB8]">Use na roça mesmo sem internet</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] font-bold text-sm rounded-xl shadow-xs">
            Instalar
          </span>
        </button>
      );
    }

    return (
      <button
        id="btn-install-app-header"
        onClick={install}
        className="flex items-center gap-1.5 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#C86F42] transition shadow-xs"
        title="Instalar aplicativo"
      >
        <Download className="w-4 h-4" />
        <span>Instalar</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'card' ? (
          <button
            id="btn-install-ios-card"
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-between p-4 bg-[#20382A] text-[#F5F0E6] rounded-2xl border-2 border-[#354A37] hover:border-[#D9AD5B] shadow-sm transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#14251C] border border-[#354A37] flex items-center justify-center text-[#D9AD5B]">
                <Share className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base text-[#F5F0E6]">Adicionar à tela inicial</p>
                <p className="text-sm text-[#D8CEB8]">Instale no iPhone ou iPad</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] font-bold text-sm rounded-xl shadow-xs">
              Como fazer
            </span>
          </button>
        ) : (
          <button
            id="btn-install-ios-header"
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#C86F42] transition shadow-xs"
          >
            <Share className="w-4 h-4" />
            <span>Instalar</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-[#20382A] p-6 shadow-2xl text-[#F5F0E6] border-2 border-[#354A37]">
              <div className="flex items-center justify-between pb-3 border-b border-[#354A37]">
                <h3 className="text-xl font-bold text-[#F5F0E6]">Instalar no iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-2 text-[#D8CEB8] hover:text-[#F5F0E6] rounded-xl hover:bg-[#14251C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3.5 text-base text-[#D8CEB8]">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#14251C] text-[#D9AD5B] border border-[#354A37] font-bold flex items-center justify-center shrink-0 text-sm">
                    1
                  </span>
                  <p>
                    No Safari, toque no botão <strong className="text-[#F5F0E6]">Compartilhar</strong> (ícone de quadrado com seta para cima).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#14251C] text-[#D9AD5B] border border-[#354A37] font-bold flex items-center justify-center shrink-0 text-sm">
                    2
                  </span>
                  <p>
                    Role as opções e toque em <strong className="text-[#F5F0E6]">"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#14251C] text-[#D9AD5B] border border-[#354A37] font-bold flex items-center justify-center shrink-0 text-sm">
                    3
                  </span>
                  <p>
                    Confirme tocando em <strong className="text-[#F5F0E6]">Adicionar</strong> no canto superior direito.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-ios-guide"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[52px] py-3.5 rounded-2xl bg-[#C86F42] font-bold text-[#F5F0E6] text-base hover:bg-[#b86134] transition border border-[#C86F42]"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
