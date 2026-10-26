import React, { useState } from 'react';
import { X, Plus, Check, Trash2, Calendar, Sprout, AlertTriangle } from 'lucide-react';
import { Safra } from '../types';
import { formatarData, obterDataHojeISO } from '../utils/formatters';

interface SafrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  safras: Safra[];
  safraAtivaId: string | null;
  onSelectSafra: (id: string) => void;
  onCreateSafra: (safra: Omit<Safra, 'id' | 'createdAt' | 'ativa'>) => void;
  onDeleteSafra: (id: string) => void;
}

export const SafrasModal: React.FC<SafrasModalProps> = ({
  isOpen,
  onClose,
  safras,
  safraAtivaId,
  onSelectSafra,
  onCreateSafra,
  onDeleteSafra,
}) => {
  const [modoCriacao, setModoCriacao] = useState(false);
  const [nome, setNome] = useState('');
  const [produtoPrincipal, setProdutoPrincipal] = useState('Manga Palmer');
  const [dataInicio, setDataInicio] = useState(obterDataHojeISO());
  const [safraParaExcluir, setSafraParaExcluir] = useState<Safra | null>(null);
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleSalvarNova = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Por favor, dê um nome para a safra.');
      return;
    }

    onCreateSafra({
      nome: nome.trim(),
      produtoPrincipal: produtoPrincipal.trim() || 'Geral',
      dataInicio,
    });

    setNome('');
    setModoCriacao(false);
    setErro('');
  };

  const handleConfirmarExcluir = () => {
    if (safraParaExcluir) {
      onDeleteSafra(safraParaExcluir.id);
      setSafraParaExcluir(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#20382A] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] border-2 border-[#354A37] overflow-hidden animate-in slide-in-from-bottom duration-200 text-[#F5F0E6]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#14251C] text-[#F5F0E6] border-b border-[#354A37]">
          <div className="flex items-center gap-2.5">
            <Sprout className="w-6 h-6 text-[#D9AD5B]" />
            <h2 className="text-2xl font-bold text-[#F5F0E6]">Minhas Safras</h2>
          </div>
          <button
            onClick={onClose}
            id="btn-close-modal-safras"
            aria-label="Fechar"
            className="p-2.5 text-[#D8CEB8] hover:text-[#F5F0E6] rounded-xl bg-[#20382A] hover:bg-[#354A37] transition border border-[#354A37]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!modoCriacao ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-[#D8CEB8] font-medium">
                  Toque na safra para gerenciar:
                </p>
                <button
                  id="btn-abrir-nova-safra"
                  onClick={() => setModoCriacao(true)}
                  className="min-h-[46px] flex items-center gap-2 px-4 py-2 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] rounded-xl text-sm font-bold transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nova Safra</span>
                </button>
              </div>

              {/* Safras List */}
              <div className="space-y-3">
                {safras.map(safra => {
                  const isAtiva = safra.id === safraAtivaId;
                  return (
                    <div
                      key={safra.id}
                      className={`p-4 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                        isAtiva
                          ? 'bg-[#14251C] border-[#D9AD5B] shadow-md ring-1 ring-[#D9AD5B]/30'
                          : 'bg-[#14251C] border-[#354A37] hover:border-[#D9AD5B]/60'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectSafra(safra.id);
                          onClose();
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#F5F0E6] text-lg">
                            {safra.nome}
                          </span>
                          {isAtiva && (
                            <span className="px-2.5 py-0.5 bg-[#C86F42] text-[#F5F0E6] text-xs font-bold rounded-full">
                              ✓ Safra Atual
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[#D8CEB8] mt-1.5 flex-wrap">
                          <span className="font-semibold text-[#D9AD5B]">🌱 {safra.produtoPrincipal}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#D9AD5B]" />
                            Início: {formatarData(safra.dataInicio)}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {isAtiva ? (
                          <div className="w-9 h-9 rounded-full bg-[#D9AD5B] text-[#14251C] flex items-center justify-center font-black">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectSafra(safra.id);
                              onClose();
                            }}
                            className="px-3.5 py-2 bg-[#354A37] hover:bg-[#354A37]/80 text-[#F5F0E6] text-sm font-bold rounded-xl transition border border-[#354A37]"
                          >
                            Ativar
                          </button>
                        )}

                        {safras.length > 1 && (
                          <button
                            onClick={() => setSafraParaExcluir(safra)}
                            className="p-2.5 text-[#E05345] hover:text-[#ff6b5d] rounded-xl hover:bg-[#E05345]/15 transition border border-transparent hover:border-[#E05345]/30 ml-1"
                            title="Excluir safra"
                            aria-label="Excluir safra"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* New Safra Form */
            <form onSubmit={handleSalvarNova} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#354A37]">
                <h3 className="font-bold text-[#F5F0E6] text-lg">Cadastrar nova safra</h3>
                <button
                  type="button"
                  onClick={() => setModoCriacao(false)}
                  className="text-sm text-[#D8CEB8] hover:text-[#F5F0E6] font-semibold underline"
                >
                  Voltar
                </button>
              </div>

              {erro && (
                <div className="p-3 bg-[#C86F42]/20 text-[#F5F0E6] text-sm font-semibold rounded-xl border border-[#C86F42]">
                  {erro}
                </div>
              )}

              <div>
                <label className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                  Nome da safra *
                </label>
                <input
                  id="input-nome-safra"
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Safra de Manga 2026, Café 2025/26"
                  className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] placeholder-[#D8CEB8]/50 text-base focus:outline-none transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                  Produto principal *
                </label>
                {/* Sugestões rápidas de culturas */}
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {[
                    { nome: 'Manga Rosa', icone: '🥭' },
                    { nome: 'Soja', icone: '🌱' },
                    { nome: 'Manga Palmer', icone: '🥭' },
                    { nome: 'Manga Tommy', icone: '🥭' },
                    { nome: 'Café', icone: '☕' },
                    { nome: 'Milho', icone: '🌽' },
                  ].map(c => {
                    const isSelected = produtoPrincipal === c.nome;
                    return (
                      <button
                        type="button"
                        key={c.nome}
                        onClick={() => {
                          setProdutoPrincipal(c.nome);
                          if (!nome.trim() || nome.startsWith('Safra')) {
                            const anoAtual = new Date().getFullYear();
                            setNome(`Safra ${c.nome} ${anoAtual}`);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#D9AD5B] text-[#14251C] border-[#D9AD5B] font-bold'
                            : 'bg-[#14251C] text-[#D8CEB8] border-[#354A37] hover:text-[#F5F0E6] hover:border-[#D9AD5B]/60'
                        }`}
                      >
                        <span>{c.icone}</span>
                        <span>{c.nome}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  id="input-produto-safra"
                  type="text"
                  value={produtoPrincipal}
                  onChange={e => setProdutoPrincipal(e.target.value)}
                  placeholder="Ex: Manga Rosa, Soja, Manga Palmer, Café..."
                  className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] placeholder-[#D8CEB8]/50 text-base focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                  Data de início
                </label>
                <input
                  id="input-data-inicio-safra"
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] text-base focus:outline-none transition"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModoCriacao(false)}
                  className="flex-1 min-h-[54px] py-3.5 bg-[#14251C] text-[#D8CEB8] border-2 border-[#354A37] rounded-2xl font-bold text-base hover:text-[#F5F0E6] transition"
                >
                  Cancelar
                </button>
                <button
                  id="btn-salvar-nova-safra"
                  type="submit"
                  className="flex-1 min-h-[54px] py-3.5 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] rounded-2xl font-bold text-base shadow-md transition border border-[#C86F42]"
                >
                  Criar Safra
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {safraParaExcluir && (
          <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-20">
            <div className="bg-[#20382A] border-2 border-[#E05345] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#E05345]/20 text-[#E05345] flex items-center justify-center mx-auto border border-[#E05345]/50">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-[#F5F0E6] text-xl">Excluir safra?</h4>
              <p className="text-base text-[#D8CEB8]">
                Tem certeza que deseja excluir <strong>{safraParaExcluir.nome}</strong>? Todos os gastos, vendas e produções desta safra serão apagados.
              </p>
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  id="btn-confirmar-excluir-safra"
                  onClick={handleConfirmarExcluir}
                  className="w-full min-h-[52px] py-3 bg-[#E05345] hover:bg-[#cc4234] text-[#F5F0E6] rounded-2xl font-bold text-base shadow-md transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>SIM, EXCLUIR SAFRA</span>
                </button>
                <button
                  onClick={() => setSafraParaExcluir(null)}
                  className="w-full min-h-[48px] py-2.5 bg-[#14251C] border border-[#354A37] text-[#D8CEB8] rounded-2xl font-bold text-base hover:text-[#F5F0E6]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
