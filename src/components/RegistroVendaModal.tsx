import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Calculator, Calendar, Clock } from 'lucide-react';
import { Venda, UnidadeMedida } from '../types';
import { obterDataHojeISO, obterHoraAtual, formatarHora, parseValorMoeda, formatarMoeda, formatarNumero } from '../utils/formatters';

interface RegistroVendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  safraId: string;
  safraNome: string;
  onSave: (venda: Omit<Venda, 'id' | 'createdAt'>, idParaEditar?: string) => void;
  vendaParaEditar?: Venda | null;
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

export const RegistroVendaModal: React.FC<RegistroVendaModalProps> = ({
  isOpen,
  onClose,
  safraId,
  safraNome,
  onSave,
  vendaParaEditar,
}) => {
  const [produtoSelecionado, setProdutoSelecionado] = useState('Manga Palmer');
  const [outroProduto, setOutroProduto] = useState('');
  const [quantidadeTexto, setQuantidadeTexto] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedida>('kg');
  const [precoUnitarioTexto, setPrecoUnitarioTexto] = useState('');
  const [comprador, setComprador] = useState('');
  const [data, setData] = useState(obterDataHojeISO());
  const [hora, setHora] = useState(obterHoraAtual());
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (vendaParaEditar) {
      if (PRODUTOS_PREDEFINIDOS.includes(vendaParaEditar.produto)) {
        setProdutoSelecionado(vendaParaEditar.produto);
        setOutroProduto('');
      } else {
        setProdutoSelecionado('Outro');
        setOutroProduto(vendaParaEditar.produto);
      }
      setQuantidadeTexto(vendaParaEditar.quantidade.toString().replace('.', ','));
      setUnidade(vendaParaEditar.unidade);
      setPrecoUnitarioTexto(vendaParaEditar.precoUnitario.toString().replace('.', ','));
      setComprador(vendaParaEditar.comprador || '');
      setData(vendaParaEditar.data);
      setHora(vendaParaEditar.hora || formatarHora(undefined, vendaParaEditar.createdAt) || obterHoraAtual());
    } else {
      setProdutoSelecionado('Manga Palmer');
      setOutroProduto('');
      setQuantidadeTexto('');
      setUnidade('kg');
      setPrecoUnitarioTexto('');
      setComprador('');
      setData(obterDataHojeISO());
      setHora(obterHoraAtual());
    }
    setErro('');
    setSucesso(false);
  }, [vendaParaEditar, isOpen]);

  if (!isOpen) return null;

  const produtoFinal = produtoSelecionado === 'Outro' ? outroProduto.trim() : produtoSelecionado;
  const quantidadeNum = parseValorMoeda(quantidadeTexto);
  const precoUnitarioNum = parseValorMoeda(precoUnitarioTexto);
  const totalCalculado = Math.round((quantidadeNum * precoUnitarioNum) * 100) / 100;

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!produtoFinal) {
      setErro('Informe o nome do produto vendido.');
      return;
    }

    if (!quantidadeNum || quantidadeNum <= 0) {
      setErro('Informe a quantidade vendida maior que zero.');
      return;
    }

    if (!precoUnitarioNum || precoUnitarioNum <= 0) {
      setErro('Informe o preço por unidade maior que zero.');
      return;
    }

    if (!data) {
      setErro('Informe a data da venda.');
      return;
    }

    onSave(
      {
        safraId,
        produto: produtoFinal,
        quantidade: quantidadeNum,
        unidade,
        precoUnitario: precoUnitarioNum,
        valorTotal: totalCalculado,
        comprador: comprador.trim() || undefined,
        data,
        hora: hora || obterHoraAtual(),
      },
      vendaParaEditar?.id
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
              Comercialização
            </span>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[#F5F0E6] mt-0.5">
              <span>💰</span> {vendaParaEditar ? 'Editar venda' : 'Registrar venda'}
            </h2>
          </div>
          <button
            onClick={onClose}
            id="btn-close-modal-venda"
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
                <p className="text-lg text-[#4ADE80]">✓ Pronto! Venda registrada com sucesso</p>
                <p className="text-sm font-medium text-[#D8CEB8]">Valor somado ao resultado da safra.</p>
              </div>
            </div>
          )}

          {/* Produto */}
          <div>
            <label className="block text-base font-bold text-[#F5F0E6] mb-1.5">
              Produto vendido *
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#14251C] border border-[#354A37] rounded-2xl">
              {PRODUTOS_PREDEFINIDOS.map(prod => {
                const isSelected = produtoSelecionado === prod;
                return (
                  <button
                    type="button"
                    key={prod}
                    onClick={() => setProdutoSelecionado(prod)}
                    className={`py-3 px-3.5 rounded-xl text-sm font-bold text-left transition flex items-center justify-between border min-h-[46px] ${
                      isSelected
                        ? 'bg-[#C86F42] text-[#F5F0E6] border-[#C86F42] shadow-sm'
                        : 'bg-[#20382A] text-[#D8CEB8] border-[#354A37] hover:bg-[#354A37]/50 hover:text-[#F5F0E6]'
                    }`}
                  >
                    <span className="truncate">{prod}</span>
                    {isSelected && <span className="text-sm text-[#F5F0E6] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            {produtoSelecionado === 'Outro' && (
              <input
                id="input-outro-produto-venda"
                type="text"
                value={outroProduto}
                onChange={e => setOutroProduto(e.target.value)}
                placeholder="Digite o nome do produto..."
                className="mt-2.5 w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] placeholder-[#D8CEB8]/40 text-base focus:outline-none transition min-h-[50px]"
                autoFocus
              />
            )}
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-quantidade-venda" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                Quantidade *
              </label>
              <input
                id="input-quantidade-venda"
                type="text"
                inputMode="decimal"
                value={quantidadeTexto}
                onChange={e => setQuantidadeTexto(e.target.value)}
                placeholder="Ex: 800"
                className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-xl font-bold text-[#F5F0E6] placeholder-[#D8CEB8]/40 focus:outline-none transition min-h-[56px]"
              />
            </div>
            <div>
              <label htmlFor="select-unidade-venda" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                Unidade *
              </label>
              <select
                id="select-unidade-venda"
                value={unidade}
                onChange={e => setUnidade(e.target.value as UnidadeMedida)}
                className="w-full px-3.5 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-base focus:outline-none transition min-h-[56px]"
              >
                {UNIDADES.map(u => (
                  <option key={u} value={u} className="bg-[#14251C] text-[#F5F0E6]">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preço por Unidade */}
          <div>
            <label htmlFor="input-preco-unitario-venda" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
              Preço por {unidade} (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8CEB8] font-bold text-xl">
                R$
              </span>
              <input
                id="input-preco-unitario-venda"
                type="text"
                inputMode="decimal"
                value={precoUnitarioTexto}
                onChange={e => setPrecoUnitarioTexto(e.target.value)}
                placeholder="Ex: 2,50"
                className="w-full pl-14 pr-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-xl font-bold text-[#F5F0E6] placeholder-[#D8CEB8]/40 focus:outline-none transition min-h-[56px]"
              />
            </div>
          </div>

          {/* Automatic Live Calculation Box */}
          <div className="p-4 bg-[#14251C] border-2 border-[#D9AD5B]/60 rounded-2xl flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5 text-[#F5F0E6]">
              <Calculator className="w-6 h-6 text-[#D9AD5B]" />
              <div>
                <p className="text-sm font-bold text-[#D9AD5B]">
                  {quantidadeNum > 0 && precoUnitarioNum > 0
                    ? `${formatarNumero(quantidadeNum)} ${unidade} × ${formatarMoeda(precoUnitarioNum)}`
                    : 'Cálculo automático da venda'}
                </p>
                <p className="text-xs text-[#D8CEB8]">Total apurado</p>
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-[#D9AD5B]">
              {formatarMoeda(totalCalculado)}
            </span>
          </div>

          {/* Comprador Field */}
          <div>
            <label htmlFor="input-comprador-venda" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
              Comprador <span className="text-sm font-normal text-[#D8CEB8]">(Opcional)</span>
            </label>
            <input
              id="input-comprador-venda"
              type="text"
              value={comprador}
              onChange={e => setComprador(e.target.value)}
              placeholder="Ex: Ceasa, Supermercado, Zé do Frete..."
              className="w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] placeholder-[#D8CEB8]/40 text-base focus:outline-none transition min-h-[50px]"
            />
          </div>

          {/* Data e Hora da Venda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-data-venda" className="block text-sm sm:text-base font-bold text-[#F5F0E6] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D9AD5B]" />
                <span>Data da venda *</span>
              </label>
              <input
                id="input-data-venda"
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] text-base focus:outline-none transition min-h-[50px]"
              />
            </div>

            <div>
              <label htmlFor="input-hora-venda" className="block text-sm sm:text-base font-bold text-[#F5F0E6] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D9AD5B]" />
                <span>Hora da venda *</span>
              </label>
              <input
                id="input-hora-venda"
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] text-base focus:outline-none transition min-h-[50px]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-salvar-venda"
              type="submit"
              disabled={sucesso}
              className="w-full py-4 px-4 bg-[#C86F42] hover:bg-[#C86F42]/90 active:scale-[0.99] text-[#F5F0E6] rounded-2xl font-bold text-lg shadow-md flex items-center justify-center gap-2.5 transition min-h-[56px]"
            >
              <span className="text-xl">💾</span>
              <span>{vendaParaEditar ? 'SALVAR ALTERAÇÕES' : 'SALVAR VENDA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
