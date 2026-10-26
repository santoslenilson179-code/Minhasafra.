import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Calendar, Clock } from 'lucide-react';
import { CategoriaGasto, Gasto } from '../types';
import { obterDataHojeISO, obterHoraAtual, formatarHora, parseValorMoeda, formatarMoeda } from '../utils/formatters';

interface RegistroGastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  safraId: string;
  safraNome: string;
  onSave: (gasto: Omit<Gasto, 'id' | 'createdAt'>, idParaEditar?: string) => void;
  gastoParaEditar?: Gasto | null;
}

const CATEGORIAS: CategoriaGasto[] = [
  'Funcionários / Diárias',
  'Adubo',
  'Defensivos',
  'Combustível',
  'Irrigação',
  'Energia',
  'Transporte',
  'Embalagens',
  'Manutenção',
  'Máquinas',
  'Outros',
];

export const RegistroGastoModal: React.FC<RegistroGastoModalProps> = ({
  isOpen,
  onClose,
  safraId,
  safraNome,
  onSave,
  gastoParaEditar,
}) => {
  const [categoria, setCategoria] = useState<CategoriaGasto>('Adubo');
  const [descricao, setDescricao] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [data, setData] = useState(obterDataHojeISO());
  const [hora, setHora] = useState(obterHoraAtual());
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (gastoParaEditar) {
      setCategoria(gastoParaEditar.categoria);
      setDescricao(gastoParaEditar.descricao || '');
      setValorTexto(gastoParaEditar.valor.toString().replace('.', ','));
      setData(gastoParaEditar.data);
      setHora(gastoParaEditar.hora || formatarHora(undefined, gastoParaEditar.createdAt) || obterHoraAtual());
    } else {
      setCategoria('Adubo');
      setDescricao('');
      setValorTexto('');
      setData(obterDataHojeISO());
      setHora(obterHoraAtual());
    }
    setErro('');
    setSucesso(false);
  }, [gastoParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const valorNumerico = parseValorMoeda(valorTexto);

    if (!valorNumerico || valorNumerico <= 0) {
      setErro('Informe o valor do gasto maior que zero.');
      return;
    }

    if (!data) {
      setErro('Informe a data do gasto.');
      return;
    }

    onSave(
      {
        safraId,
        categoria,
        descricao: descricao.trim() || undefined,
        valor: valorNumerico,
        data,
        hora: hora || obterHoraAtual(),
      },
      gastoParaEditar?.id
    );

    setSucesso(true);
    setTimeout(() => {
      setSucesso(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="w-full max-w-md bg-[#20382A] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] border border-[#354A37] overflow-hidden animate-in slide-in-from-bottom duration-200 text-[#F5F0E6]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#14251C] text-[#F5F0E6] border-b border-[#354A37]">
          <div>
            <span className="text-sm font-bold tracking-wider text-[#D9AD5B] uppercase block">
              Despesas da Safra
            </span>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[#F5F0E6] mt-0.5">
              <span>💸</span> {gastoParaEditar ? 'Editar gasto' : 'Registrar gasto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            id="btn-close-modal-gasto"
            className="w-10 h-10 flex items-center justify-center text-[#D8CEB8] hover:text-[#F5F0E6] rounded-xl bg-[#20382A] hover:bg-[#354A37] transition border border-[#354A37]"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safra Indicator */}
        <div className="bg-[#14251C] px-5 py-2.5 border-b border-[#354A37] flex items-center justify-between text-sm text-[#D8CEB8]">
          <span>Safra ativa:</span>
          <span className="font-bold text-[#D9AD5B] text-base">{safraNome}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSalvar} className="p-5 overflow-y-auto space-y-4">
          {/* Feedback Messages */}
          {erro && (
            <div className="p-4 bg-[#DC4C4C]/20 border border-[#DC4C4C] rounded-2xl flex items-center gap-3 text-[#EF4444] text-base font-bold">
              <AlertCircle className="w-6 h-6 shrink-0 text-[#EF4444]" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-4 bg-[#22C55E]/20 border-2 border-[#22C55E] rounded-2xl flex items-center gap-3 text-[#4ADE80] font-bold animate-in fade-in shadow-md">
              <CheckCircle2 className="w-7 h-7 text-[#22C55E] shrink-0" />
              <div>
                <p className="text-lg text-[#4ADE80]">✓ Pronto! Gasto registrado com sucesso</p>
                <p className="text-sm font-medium text-[#D8CEB8]">Saldo da safra atualizado.</p>
              </div>
            </div>
          )}

          {/* Valor Field - Big touch target */}
          <div>
            <label htmlFor="input-valor-gasto" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
              Valor do gasto (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8CEB8] font-bold text-2xl">
                R$
              </span>
              <input
                id="input-valor-gasto"
                type="text"
                inputMode="decimal"
                value={valorTexto}
                onChange={e => setValorTexto(e.target.value)}
                placeholder="0,00"
                className="w-full pl-16 pr-4 py-4 bg-[#14251C] border-2 border-[#354A37] focus:border-[#C86F42] rounded-2xl text-2xl sm:text-3xl font-bold text-[#F5F0E6] placeholder-[#D8CEB8]/40 focus:outline-none transition shadow-inner min-h-[56px]"
                autoFocus
              />
            </div>
            {valorTexto && !isNaN(parseValorMoeda(valorTexto)) && parseValorMoeda(valorTexto) > 0 && (
              <p className="text-sm text-[#D9AD5B] mt-1.5 pl-1 font-bold">
                Valor informado: {formatarMoeda(parseValorMoeda(valorTexto))}
              </p>
            )}
          </div>

          {/* Categoria Grid / Selector */}
          <div>
            <label className="block text-base font-bold text-[#F5F0E6] mb-1.5">
              Categoria do gasto *
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-2 bg-[#14251C] border border-[#354A37] rounded-2xl">
              {CATEGORIAS.map(cat => {
                const isSelected = categoria === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`py-3 px-3.5 rounded-xl text-sm font-bold text-left transition flex items-center justify-between border min-h-[46px] ${
                      isSelected
                        ? 'bg-[#C86F42] text-[#F5F0E6] border-[#C86F42] shadow-sm'
                        : 'bg-[#20382A] text-[#D8CEB8] border-[#354A37] hover:bg-[#354A37]/50 hover:text-[#F5F0E6]'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {isSelected && <span className="text-sm text-[#F5F0E6] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição Field */}
          <div>
            <label htmlFor="input-descricao-gasto" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
              Descrição detalhada <span className="text-sm font-normal text-[#D8CEB8]">(Opcional)</span>
            </label>
            <input
              id="input-descricao-gasto"
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: 5 sacos de adubo, diária de colheita..."
              className="w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#C86F42] rounded-xl text-[#F5F0E6] placeholder-[#D8CEB8]/40 text-base focus:outline-none transition min-h-[50px]"
            />
          </div>

          {/* Data e Hora da Compra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-data-gasto" className="block text-sm sm:text-base font-bold text-[#F5F0E6] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D9AD5B]" />
                <span>Data do gasto *</span>
              </label>
              <input
                id="input-data-gasto"
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#C86F42] rounded-xl text-[#F5F0E6] text-base focus:outline-none transition min-h-[50px]"
              />
            </div>

            <div>
              <label htmlFor="input-hora-gasto" className="block text-sm sm:text-base font-bold text-[#F5F0E6] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D9AD5B]" />
                <span>Hora do gasto *</span>
              </label>
              <input
                id="input-hora-gasto"
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#C86F42] rounded-xl text-[#F5F0E6] text-base focus:outline-none transition min-h-[50px]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-salvar-gasto"
              type="submit"
              disabled={sucesso}
              className="w-full py-4 px-4 bg-[#C86F42] hover:bg-[#C86F42]/90 active:scale-[0.99] text-[#F5F0E6] rounded-2xl font-bold text-lg shadow-md flex items-center justify-center gap-2.5 transition min-h-[56px]"
            >
              <span className="text-xl">💾</span>
              <span>{gastoParaEditar ? 'SALVAR ALTERAÇÕES' : 'SALVAR GASTO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
