import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Producao, UnidadeMedida } from '../types';
import { obterDataHojeISO, obterHoraAtual, formatarHora, parseValorMoeda } from '../utils/formatters';

interface RegistroProducaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  safraId: string;
  safraNome: string;
  onSave: (producao: Omit<Producao, 'id' | 'createdAt'>, idParaEditar?: string) => void;
  producaoParaEditar?: Producao | null;
}

const PRODUTOS_PREDEFINIDOS = [
  'Manga Rosa',
  'Soja',
  'Manga Palmer',
  'Manga Tommy',
  'Café',
  'Milho',
  'Banana',
  'Maracujá',
  'Tomate',
  'Outro',
];

const UNIDADES: UnidadeMedida[] = ['kg', 'caixa', 'saca', 'tonelada', 'unidade'];

export const RegistroProducaoModal: React.FC<RegistroProducaoModalProps> = ({
  isOpen,
  onClose,
  safraId,
  safraNome,
  onSave,
  producaoParaEditar,
}) => {
  const [produtoSelecionado, setProdutoSelecionado] = useState('Manga Palmer');
  const [outroProduto, setOutroProduto] = useState('');
  const [quantidadeTexto, setQuantidadeTexto] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedida>('kg');
  const [data, setData] = useState(obterDataHojeISO());
  const [hora, setHora] = useState(obterHoraAtual());
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (producaoParaEditar) {
      if (PRODUTOS_PREDEFINIDOS.includes(producaoParaEditar.produto)) {
        setProdutoSelecionado(producaoParaEditar.produto);
        setOutroProduto('');
      } else {
        setProdutoSelecionado('Outro');
        setOutroProduto(producaoParaEditar.produto);
      }
      setQuantidadeTexto(producaoParaEditar.quantidade.toString().replace('.', ','));
      setUnidade(producaoParaEditar.unidade);
      setData(producaoParaEditar.data);
      setHora(producaoParaEditar.hora || formatarHora(undefined, producaoParaEditar.createdAt) || obterHoraAtual());
    } else {
      setProdutoSelecionado('Manga Palmer');
      setOutroProduto('');
      setQuantidadeTexto('');
      setUnidade('kg');
      setData(obterDataHojeISO());
      setHora(obterHoraAtual());
    }
    setErro('');
    setSucesso(false);
  }, [producaoParaEditar, isOpen]);

  if (!isOpen) return null;

  const produtoFinal = produtoSelecionado === 'Outro' ? outroProduto.trim() : produtoSelecionado;
  const quantidadeNum = parseValorMoeda(quantidadeTexto);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!produtoFinal) {
      setErro('Informe o nome do produto colhido/produzido.');
      return;
    }

    if (!quantidadeNum || quantidadeNum <= 0) {
      setErro('Informe a quantidade produzida maior que zero.');
      return;
    }

    if (!data) {
      setErro('Informe a data da produção.');
      return;
    }

    onSave(
      {
        safraId,
        produto: produtoFinal,
        quantidade: quantidadeNum,
        unidade,
        data,
        hora: hora || obterHoraAtual(),
      },
      producaoParaEditar?.id
    );

    setSucesso(true);
    setTimeout(() => {
      setSucesso(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="w-full max-w-md bg-[#20382A] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] border-2 border-[#354A37] overflow-hidden animate-in slide-in-from-bottom duration-200 text-[#F5F0E6]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#14251C] text-[#F5F0E6] border-b border-[#354A37]">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#D9AD5B] uppercase">
              Colheita & Campo
            </span>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[#F5F0E6]">
              <span>📦</span> {producaoParaEditar ? 'Editar produção' : 'Registrar produção'}
            </h2>
          </div>
          <button
            onClick={onClose}
            id="btn-close-modal-producao"
            aria-label="Fechar"
            className="p-2.5 text-[#D8CEB8] hover:text-[#F5F0E6] rounded-xl bg-[#20382A] hover:bg-[#354A37] transition border border-[#354A37]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Safra Indicator */}
        <div className="bg-[#14251C]/90 px-5 py-2.5 border-b border-[#354A37] flex items-center justify-between text-sm text-[#D8CEB8]">
          <span>Safra vinculada:</span>
          <span className="font-bold text-[#D9AD5B]">{safraNome}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSalvar} className="p-5 overflow-y-auto space-y-4">
          {erro && (
            <div className="p-3.5 bg-[#C86F42]/20 border border-[#C86F42] rounded-xl flex items-center gap-3 text-[#F5F0E6] text-base font-semibold">
              <AlertCircle className="w-6 h-6 shrink-0 text-[#C86F42]" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-4 bg-[#14251C] border-2 border-emerald-500 rounded-xl flex items-center gap-3 text-[#F5F0E6] font-bold shadow-md">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <p className="text-lg text-emerald-300">✓ Pronto! Produção registrada com sucesso</p>
                <p className="text-sm font-normal text-[#D8CEB8]">Volume atualizado no resumo da safra.</p>
              </div>
            </div>
          )}

          {/* Produto */}
          <div>
            <label className="block text-base font-bold text-[#F5F0E6] mb-2">
              Produto colhido *
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#14251C] border border-[#354A37] rounded-2xl">
              {PRODUTOS_PREDEFINIDOS.map(prod => {
                const isSelected = produtoSelecionado === prod;
                return (
                  <button
                    type="button"
                    key={prod}
                    onClick={() => setProdutoSelecionado(prod)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold text-left transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-[#354A37] text-[#F5F0E6] border-[#D9AD5B] shadow-xs'
                        : 'bg-[#20382A] text-[#D8CEB8] border-[#354A37] hover:bg-[#354A37]/50 hover:text-[#F5F0E6]'
                    }`}
                  >
                    <span className="truncate">{prod}</span>
                    {isSelected && <span className="text-xs text-[#D9AD5B] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            {produtoSelecionado === 'Outro' && (
              <input
                id="input-outro-produto-producao"
                type="text"
                value={outroProduto}
                onChange={e => setOutroProduto(e.target.value)}
                placeholder="Digite o nome do produto..."
                className="mt-2 w-full px-4 py-3 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] placeholder-[#D8CEB8]/50 text-base focus:outline-none transition"
                autoFocus
              />
            )}
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-quantidade-producao" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                Quantidade *
              </label>
              <input
                id="input-quantidade-producao"
                type="text"
                inputMode="decimal"
                value={quantidadeTexto}
                onChange={e => setQuantidadeTexto(e.target.value)}
                placeholder="Ex: 1200"
                className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-xl font-bold text-[#F5F0E6] placeholder-[#D8CEB8]/40 focus:outline-none transition min-h-[56px]"
              />
            </div>
            <div>
              <label htmlFor="select-unidade-producao" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                Unidade *
              </label>
              <select
                id="select-unidade-producao"
                value={unidade}
                onChange={e => setUnidade(e.target.value as UnidadeMedida)}
                className="w-full px-3 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-semibold text-base focus:outline-none transition min-h-[56px]"
              >
                {UNIDADES.map(u => (
                  <option key={u} value={u} className="bg-[#14251C] text-[#F5F0E6]">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data e Hora da Produção */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-data-producao" className="block text-base font-bold text-[#F5F0E6] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-[#D9AD5B]" />
                <span>Data da colheita *</span>
              </label>
              <input
                id="input-data-producao"
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] text-base focus:outline-none transition min-h-[50px]"
              />
            </div>

            <div>
              <label htmlFor="input-hora-producao" className="block text-base font-bold text-[#F5F0E6] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-[#D9AD5B]" />
                <span>Hora da colheita *</span>
              </label>
              <input
                id="input-hora-producao"
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] text-base focus:outline-none transition min-h-[50px]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              id="btn-salvar-producao"
              type="submit"
              disabled={sucesso}
              className="w-full min-h-[56px] py-4 bg-[#C86F42] hover:bg-[#b86134] active:scale-[0.99] text-[#F5F0E6] rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2.5 transition border border-[#C86F42]"
            >
              <span className="text-xl">💾</span>
              <span>{producaoParaEditar ? 'SALVAR ALTERAÇÕES' : 'SALVAR PRODUÇÃO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
