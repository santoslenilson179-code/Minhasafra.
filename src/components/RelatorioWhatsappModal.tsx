import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Edit3,
} from 'lucide-react';
import { Safra, Gasto, Venda } from '../types';
import { ResumoProducao } from '../utils/calculations';
import {
  TipoRelatorioWhatsApp,
  SituacaoOferta,
  gerarTextoRelatorioWhatsApp,
  abrirWhatsApp,
  copiarTexto,
} from '../utils/whatsappReports';
import { parseValorMoeda } from '../utils/formatters';

interface RelatorioWhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  safraAtiva: Safra | null;
  totalVendas: number;
  totalGastos: number;
  resultado: number;
  resumoProducao: ResumoProducao;
  gastos: Gasto[];
  vendas: Venda[];
}

export const RelatorioWhatsappModal: React.FC<RelatorioWhatsappModalProps> = ({
  isOpen,
  onClose,
  safraAtiva,
  totalVendas,
  totalGastos,
  resultado,
  resumoProducao,
  gastos,
  vendas,
}) => {
  const [tipo, setTipo] = useState<TipoRelatorioWhatsApp>('resumo');
  const [incluirDetalhamentoGastos, setIncluirDetalhamentoGastos] = useState(true);
  const [incluirUltimasVendas, setIncluirUltimasVendas] = useState(true);
  const [telefone, setTelefone] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Campos para criação de oferta (sem valores fictícios pré-selecionados)
  const [produtoOferta, setProdutoOferta] = useState(safraAtiva?.produtoPrincipal || '');
  const [quantidadeOferta, setQuantidadeOferta] = useState('');
  const [unidadeOferta, setUnidadeOferta] = useState(resumoProducao.unidadePredominante || 'kg');
  const [precoOferta, setPrecoOferta] = useState('');
  const [localOferta, setLocalOferta] = useState('');
  const [situacaoOferta, setSituacaoOferta] = useState<SituacaoOferta | ''>('');
  const [observacaoOferta, setObservacaoOferta] = useState('');

  // Texto editável da mensagem
  const [textoMensagem, setTextoMensagem] = useState('');

  // Re-gera a mensagem base sempre que os parâmetros mudarem
  useEffect(() => {
    const qtdNum = parseValorMoeda(quantidadeOferta);
    const precoNum = parseValorMoeda(precoOferta);

    const base = gerarTextoRelatorioWhatsApp(
      safraAtiva,
      totalVendas,
      totalGastos,
      resultado,
      resumoProducao,
      gastos,
      vendas,
      {
        tipo,
        incluirDetalhamentoGastos,
        incluirUltimasVendas,
        telefone,
        produtoOferta,
        quantidadeOferta: qtdNum > 0 ? qtdNum : undefined,
        unidadeOferta,
        precoOferta: precoNum > 0 ? precoNum : undefined,
        localOferta: localOferta.trim() || undefined,
        situacaoOferta: situacaoOferta || undefined,
        observacaoOferta: observacaoOferta.trim() || undefined,
      }
    );
    setTextoMensagem(base);
  }, [
    safraAtiva,
    totalVendas,
    totalGastos,
    resultado,
    resumoProducao,
    gastos,
    vendas,
    tipo,
    incluirDetalhamentoGastos,
    incluirUltimasVendas,
    telefone,
    produtoOferta,
    quantidadeOferta,
    unidadeOferta,
    precoOferta,
    localOferta,
    situacaoOferta,
    observacaoOferta,
  ]);

  if (!isOpen) return null;

  const handleEnviarWhatsApp = () => {
    abrirWhatsApp(textoMensagem, telefone);
  };

  const handleCopiar = async () => {
    const ok = await copiarTexto(textoMensagem);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const handleCompartilharNativo = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: `Minha Safra - ${safraAtiva?.nome || 'Safra'}`,
          text: textoMensagem,
        });
      } catch {
        // Cancelado
      }
    } else {
      handleCopiar();
    }
  };

  const podeCompartilharNativo = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#20382A] text-[#F5F0E6] rounded-t-3xl sm:rounded-3xl border-2 border-[#354A37] shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#354A37] flex items-center justify-between bg-[#14251C]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#20382A] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center text-2xl shadow-inner">
              📲
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F0E6]">
                WhatsApp da Safra
              </h2>
              <p className="text-sm text-[#D8CEB8]">
                Prepare o texto, revise e envie em 1 toque
              </p>
            </div>
          </div>

          <button
            id="btn-fechar-modal-whatsapp"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 text-[#D8CEB8] hover:text-[#F5F0E6] bg-[#20382A] hover:bg-[#354A37] rounded-xl border border-[#354A37] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Formato do relatório */}
          <div>
            <label className="block text-sm font-bold text-[#D8CEB8] uppercase tracking-wider mb-2">
              O que você quer enviar?
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#14251C] border-2 border-[#354A37] rounded-2xl">
              <button
                type="button"
                id="tab-whatsapp-resumo"
                onClick={() => setTipo('resumo')}
                className={`min-h-[46px] py-2 px-2 rounded-xl text-sm font-bold transition text-center ${
                  tipo === 'resumo'
                    ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                    : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
                }`}
              >
                📊 Resumo
              </button>
              <button
                type="button"
                id="tab-whatsapp-detalhado"
                onClick={() => setTipo('detalhado')}
                className={`min-h-[46px] py-2 px-2 rounded-xl text-sm font-bold transition text-center ${
                  tipo === 'detalhado'
                    ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                    : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
                }`}
              >
                📑 Detalhado
              </button>
              <button
                type="button"
                id="tab-whatsapp-oferta"
                onClick={() => setTipo('oferta')}
                className={`min-h-[46px] py-2 px-2 rounded-xl text-sm font-bold transition text-center ${
                  tipo === 'oferta' || tipo === 'cotacao'
                    ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                    : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
                }`}
              >
                📦 Criar Oferta
              </button>
            </div>
          </div>

          {/* Opções para Criar Oferta (Sem invenção de dados) */}
          {(tipo === 'oferta' || tipo === 'cotacao') && (
            <div className="p-4 bg-[#14251C] rounded-2xl border-2 border-[#354A37] space-y-4 text-sm">
              <div className="border-b border-[#354A37] pb-2">
                <h3 className="font-bold text-base text-[#F5F0E6]">
                  O que você quer oferecer?
                </h3>
                <p className="text-xs text-[#D8CEB8] mt-0.5">
                  Preencha apenas o que você deseja informar ao comprador.
                </p>
              </div>

              {/* Produto */}
              <div>
                <label htmlFor="input-oferta-produto" className="block font-bold text-[#F5F0E6] mb-1.5">
                  Produto *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Manga Rosa', 'Soja', 'Manga Palmer', 'Manga Tommy', 'Café', 'Milho'].map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setProdutoOferta(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        produtoOferta === p
                          ? 'bg-[#D9AD5B] text-[#14251C] border-[#D9AD5B] font-bold'
                          : 'bg-[#20382A] text-[#D8CEB8] border-[#354A37] hover:text-[#F5F0E6]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  id="input-oferta-produto"
                  type="text"
                  value={produtoOferta}
                  onChange={e => setProdutoOferta(e.target.value)}
                  placeholder="Nome do produto (ex: Manga Palmer, Soja...)"
                  className="w-full px-3.5 py-3 bg-[#20382A] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-base focus:outline-none"
                />
              </div>

              {/* Quantidade e Unidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-oferta-quantidade" className="block font-bold text-[#F5F0E6] mb-1.5">
                    Quantidade:
                  </label>
                  <input
                    id="input-oferta-quantidade"
                    type="text"
                    inputMode="decimal"
                    value={quantidadeOferta}
                    onChange={e => setQuantidadeOferta(e.target.value)}
                    placeholder="Ex: 800"
                    className="w-full px-3.5 py-3 bg-[#20382A] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-base focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="select-oferta-unidade" className="block font-bold text-[#F5F0E6] mb-1.5">
                    Unidade:
                  </label>
                  <select
                    id="select-oferta-unidade"
                    value={unidadeOferta}
                    onChange={e => setUnidadeOferta(e.target.value)}
                    className="w-full px-3 py-3 bg-[#20382A] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-base focus:outline-none min-h-[52px]"
                  >
                    <option value="kg">kg</option>
                    <option value="caixa">caixa</option>
                    <option value="saca">saca</option>
                    <option value="tonelada">tonelada</option>
                    <option value="unidade">unidade</option>
                  </select>
                </div>
              </div>

              {/* Preço (Opcional) */}
              <div>
                <label htmlFor="input-oferta-preco" className="block font-bold text-[#F5F0E6] mb-1.5">
                  Preço por {unidadeOferta} (R$) <span className="text-[#D8CEB8] font-normal text-xs">(opcional)</span>:
                </label>
                <input
                  id="input-oferta-preco"
                  type="text"
                  inputMode="decimal"
                  value={precoOferta}
                  onChange={e => setPrecoOferta(e.target.value)}
                  placeholder="Ex: 2,50 (ou deixe em branco)"
                  className="w-full px-3.5 py-3 bg-[#20382A] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#D9AD5B] font-bold text-base focus:outline-none"
                />
              </div>

              {/* Local (Opcional) */}
              <div>
                <label htmlFor="input-oferta-local" className="block font-bold text-[#F5F0E6] mb-1.5">
                  Local / Fazenda / Cidade <span className="text-[#D8CEB8] font-normal text-xs">(opcional)</span>:
                </label>
                <input
                  id="input-oferta-local"
                  type="text"
                  value={localOferta}
                  onChange={e => setLocalOferta(e.target.value)}
                  placeholder="Ex: Livramento - BA"
                  className="w-full px-3.5 py-3 bg-[#20382A] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-medium text-base focus:outline-none"
                />
              </div>

              {/* Situação (Sem seleção automática) */}
              <div>
                <label className="block font-bold text-[#F5F0E6] mb-1.5">
                  Situação do produto <span className="text-[#D8CEB8] font-normal text-xs">(opcional)</span>:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'disponivel_agora', label: 'Disponível agora' },
                    { id: 'colhido_em_breve', label: 'Será colhido em breve' },
                    { id: 'sob_consulta', label: 'Sob consulta' },
                  ].map(sit => {
                    const isSelected = situacaoOferta === sit.id;
                    return (
                      <button
                        type="button"
                        key={sit.id}
                        onClick={() => setSituacaoOferta(isSelected ? '' : (sit.id as SituacaoOferta))}
                        className={`p-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition text-center min-h-[46px] ${
                          isSelected
                            ? 'bg-[#C86F42] text-[#F5F0E6] border-[#C86F42] font-bold shadow-xs'
                            : 'bg-[#20382A] text-[#D8CEB8] border-[#354A37] hover:text-[#F5F0E6]'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {sit.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Observação (Opcional) */}
              <div>
                <label htmlFor="input-oferta-observacao" className="block font-bold text-[#F5F0E6] mb-1.5">
                  Observação adicional <span className="text-[#D8CEB8] font-normal text-xs">(opcional)</span>:
                </label>
                <input
                  id="input-oferta-observacao"
                  type="text"
                  value={observacaoOferta}
                  onChange={e => setObservacaoOferta(e.target.value)}
                  placeholder="Ex: Carregamento no local, frete a combinar..."
                  className="w-full px-3.5 py-3 bg-[#20382A] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-medium text-base focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Opções para Resumo / Detalhado */}
          {tipo !== 'oferta' && tipo !== 'cotacao' && (
            <div className="flex items-center gap-6 text-sm font-semibold text-[#D8CEB8]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={incluirDetalhamentoGastos}
                  onChange={e => setIncluirDetalhamentoGastos(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#C86F42] bg-[#14251C] border-[#354A37]"
                />
                <span>Divisão por gastos</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={incluirUltimasVendas}
                  onChange={e => setIncluirUltimasVendas(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#C86F42] bg-[#14251C] border-[#354A37]"
                />
                <span>Últimas vendas</span>
              </label>
            </div>
          )}

          {/* Campo de Telefone Opcional */}
          <div>
            <label htmlFor="input-telefone-whatsapp" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
              Enviar para um número específico <span className="text-[#D8CEB8] font-normal text-xs">(opcional)</span>:
            </label>
            <div className="relative">
              <input
                id="input-telefone-whatsapp"
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="Ex: 11999998888 ou deixe em branco"
                className="w-full pl-3.5 pr-10 py-3 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-base font-semibold text-[#F5F0E6] placeholder-[#D8CEB8]/40 focus:outline-none"
              />
              <span className="absolute right-3 top-3.5 text-sm text-[#D8CEB8]">
                🇧🇷
              </span>
            </div>
            <p className="text-xs text-[#D8CEB8] mt-1.5">
              💡 Dica: Se deixar vazio, o WhatsApp abre para você escolher qualquer contato ou grupo da família e fazenda.
            </p>
          </div>

          {/* Card Prévia Editável do WhatsApp (Requisito 8: Mostrar prévia e permitir edição) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="textarea-previa-whatsapp" className="text-sm font-bold text-[#D9AD5B] uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" />
                <span>Prévia editável da mensagem:</span>
              </label>
              <button
                onClick={handleCopiar}
                className="text-sm font-bold text-[#D8CEB8] hover:text-[#F5F0E6] flex items-center gap-1.5 transition"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 text-[#D9AD5B]" />
                    <span className="text-[#D9AD5B]">✓ Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="textarea-previa-whatsapp"
              rows={8}
              value={textoMensagem}
              onChange={e => setTextoMensagem(e.target.value)}
              className="w-full p-4 bg-[#14251C] rounded-2xl border-2 border-[#354A37] focus:border-[#D9AD5B] text-sm font-mono text-[#F5F0E6] leading-relaxed shadow-inner focus:outline-none resize-y"
              aria-label="Prévia editável da mensagem do WhatsApp"
            />
            <p className="text-xs text-[#D8CEB8] mt-1">
              ✏️ Você pode alterar qualquer palavra acima antes de enviar.
            </p>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-[#354A37] bg-[#14251C] flex flex-col sm:flex-row gap-3">
          {/* Botão Principal: ABRIR NO WHATSAPP */}
          <button
            id="btn-confirmar-enviar-whatsapp"
            onClick={handleEnviarWhatsApp}
            className="flex-1 min-h-[56px] py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 active:scale-[0.99]"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span>ABRIR NO WHATSAPP</span>
          </button>

          {/* Botão Copiar */}
          <button
            id="btn-copiar-relatorio"
            onClick={handleCopiar}
            className="min-h-[56px] py-3.5 px-5 bg-[#20382A] hover:bg-[#354A37] text-[#F5F0E6] border-2 border-[#354A37] font-bold text-base rounded-2xl transition flex items-center justify-center gap-2"
          >
            {copiado ? <Check className="w-5 h-5 text-[#D9AD5B]" /> : <Copy className="w-5 h-5" />}
            <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
          </button>

          {/* Botão Compartilhar */}
          {podeCompartilharNativo && (
            <button
              onClick={handleCompartilharNativo}
              className="min-h-[56px] py-3.5 px-4 bg-[#20382A] hover:bg-[#354A37] text-[#D8CEB8] border-2 border-[#354A37] font-bold text-base rounded-2xl transition flex items-center justify-center"
              title="Mais opções de envio"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
