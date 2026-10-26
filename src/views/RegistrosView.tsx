import React from 'react';
import { Safra } from '../types';

interface RegistrosViewProps {
  safraAtiva: Safra | null;
  onOpenGastei: () => void;
  onOpenVendi: () => void;
  onOpenProduzi: () => void;
}

export const RegistrosView: React.FC<RegistrosViewProps> = ({
  safraAtiva,
  onOpenGastei,
  onOpenVendi,
  onOpenProduzi,
}) => {
  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div className="bg-[#20382A] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#354A37] text-[#F5F0E6]">
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#F5F0E6]">
          Novo Registro
        </h2>
        <p className="text-sm sm:text-base text-[#D8CEB8] mt-1 font-medium">
          Safra atual: <strong className="text-[#D9AD5B]">{safraAtiva?.nome || 'Nenhuma selecionada'}</strong>
        </p>
        <p className="text-sm text-[#D8CEB8] mt-0.5">
          O que você deseja registrar agora no caderno da safra?
        </p>
      </div>

      {/* 3 Huge full-width Action Cards */}
      <div className="space-y-3.5">
        {/* Registrar Venda */}
        <button
          id="btn-registros-vendi"
          onClick={onOpenVendi}
          className="w-full p-5 bg-[#20382A] hover:bg-[#354A37]/80 active:scale-[0.99] border-2 border-[#D9AD5B] rounded-3xl shadow-sm flex items-center justify-between text-left transition group text-[#F5F0E6] min-h-[90px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#14251C] border border-[#D9AD5B] text-[#D9AD5B] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition shrink-0">
              💰
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-[#D9AD5B] uppercase tracking-wider block">
                Comercialização
              </span>
              <h3 className="text-xl font-bold text-[#F5F0E6] leading-tight">
                Registrar Venda
              </h3>
              <p className="text-sm text-[#D8CEB8] mt-0.5">
                Quantidade vendida, preço por kg/caixa e comprador
              </p>
            </div>
          </div>
          <span className="w-11 h-11 rounded-full bg-[#14251C] border border-[#D9AD5B] flex items-center justify-center text-[#D9AD5B] font-bold text-2xl group-hover:bg-[#D9AD5B] group-hover:text-[#14251C] transition shrink-0 ml-2">
            +
          </span>
        </button>

        {/* Registrar Gasto */}
        <button
          id="btn-registros-gastei"
          onClick={onOpenGastei}
          className="w-full p-5 bg-[#20382A] hover:bg-[#354A37]/80 active:scale-[0.99] border-2 border-[#C86F42] rounded-3xl shadow-sm flex items-center justify-between text-left transition group text-[#F5F0E6] min-h-[90px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#14251C] border border-[#C86F42] text-[#C86F42] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition shrink-0">
              💸
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-[#C86F42] uppercase tracking-wider block">
                Despesa
              </span>
              <h3 className="text-xl font-bold text-[#F5F0E6] leading-tight">
                Registrar Gasto
              </h3>
              <p className="text-sm text-[#D8CEB8] mt-0.5">
                Adubo, defensivos, diárias, combustível, energia...
              </p>
            </div>
          </div>
          <span className="w-11 h-11 rounded-full bg-[#14251C] border border-[#C86F42] flex items-center justify-center text-[#C86F42] font-bold text-2xl group-hover:bg-[#C86F42] group-hover:text-[#14251C] transition shrink-0 ml-2">
            +
          </span>
        </button>

        {/* Registrar Produção */}
        <button
          id="btn-registros-produzi"
          onClick={onOpenProduzi}
          className="w-full p-5 bg-[#20382A] hover:bg-[#354A37]/80 active:scale-[0.99] border-2 border-[#354A37] hover:border-[#D8CEB8] rounded-3xl shadow-sm flex items-center justify-between text-left transition group text-[#F5F0E6] min-h-[90px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D8CEB8] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition shrink-0">
              📦
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-[#D8CEB8] uppercase tracking-wider block">
                Campo
              </span>
              <h3 className="text-xl font-bold text-[#F5F0E6] leading-tight">
                Registrar Produção / Colheita
              </h3>
              <p className="text-sm text-[#D8CEB8] mt-0.5">
                Volume colhido no campo em sacas, kg, caixas ou unidades
              </p>
            </div>
          </div>
          <span className="w-11 h-11 rounded-full bg-[#14251C] border border-[#354A37] flex items-center justify-center text-[#D8CEB8] font-bold text-2xl group-hover:bg-[#354A37] group-hover:text-white transition shrink-0 ml-2">
            +
          </span>
        </button>
      </div>

      {/* Helpful advice card */}
      <div className="p-4 sm:p-5 bg-[#14251C] border border-[#354A37] rounded-2xl text-sm sm:text-base text-[#D8CEB8]">
        <p className="font-bold flex items-center gap-2 mb-1.5 text-[#D9AD5B] text-base">
          <span>💡</span>
          <span>Dica do Minha Safra:</span>
        </p>
        <p className="text-[#D8CEB8] leading-relaxed">
          Anote as despesas e vendas no mesmo dia em que elas acontecerem para não esquecer nenhum detalhe. Assim você descobre o lucro real da sua terra.
        </p>
      </div>
    </div>
  );
};
