import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Safra } from '../types';
import { ResumoProducao, calcularCustoMedio } from '../utils/calculations';
import { formatarMoeda, formatarNumero, parseValorMoeda } from '../utils/formatters';

interface CalculadoraLucroModalProps {
  isOpen: boolean;
  onClose: () => void;
  safraAtiva: Safra | null;
  totalGastos: number;
  totalVendas: number;
  resumoProducao: ResumoProducao;
  onAbrirWhatsappCotacao?: (dados: {
    produto: string;
    quantidade: number;
    precoUnitario: number;
  }) => void;
  onNavegarRegistros?: () => void;
}

type ModoCalculadora = 'sugerirPreco' | 'analisarProposta' | 'pontoEquilibrio';

export const CalculadoraLucroModal: React.FC<CalculadoraLucroModalProps> = ({
  isOpen,
  onClose,
  safraAtiva,
  totalGastos,
  resumoProducao,
  onAbrirWhatsappCotacao,
  onNavegarRegistros,
}) => {
  const [modo, setModo] = useState<ModoCalculadora>('sugerirPreco');

  // Custo médio real calculado estritamente quando há gastos e produção
  const custoMedioSafra = calcularCustoMedio(
    totalGastos,
    resumoProducao.quantidadePredominante
  );

  const temDadosSuficientes = custoMedioSafra !== null && custoMedioSafra > 0;
  const unidade = resumoProducao.unidadePredominante || 'kg';

  // --- ESTADOS DO MODO 1: ACRÉSCIMO SOBRE O CUSTO (Sem valores fictícios) ---
  const [qtdVenda1, setQtdVenda1] = useState(
    resumoProducao.quantidadePredominante > 0
      ? String(resumoProducao.quantidadePredominante)
      : ''
  );
  const [custoUnitario1, setCustoUnitario1] = useState(
    custoMedioSafra !== null && custoMedioSafra > 0 ? String(custoMedioSafra) : ''
  );
  const [acrescimoPretendido, setAcrescimoPretendido] = useState<'10' | '20' | '30' | 'custom'>('20');
  const [acrescimoCustomTexto, setAcrescimoCustomTexto] = useState('25');
  const [custoAdicionalFrete1, setCustoAdicionalFrete1] = useState('0');

  // --- ESTADOS DO MODO 2: ANALISAR PROPOSTA DO COMPRADOR ---
  const [precoOferecido2, setPrecoOferecido2] = useState('');
  const [qtdNegociada2, setQtdNegociada2] = useState(
    resumoProducao.quantidadePredominante > 0
      ? String(resumoProducao.quantidadePredominante)
      : ''
  );
  const [custoUnitario2, setCustoUnitario2] = useState(
    custoMedioSafra !== null && custoMedioSafra > 0 ? String(custoMedioSafra) : ''
  );
  const [freteTotal2, setFreteTotal2] = useState('0');

  // --- ESTADOS DO MODO 3: PONTO DE EQUILÍBRIO & META ---
  const [precoPraticado3, setPrecoPraticado3] = useState('');
  const [custosTotais3, setCustosTotais3] = useState(
    totalGastos > 0 ? String(totalGastos) : ''
  );
  const [metaLucroDesejado3, setMetaLucroDesejado3] = useState('');

  // Sincroniza quando os dados da safra mudarem
  useEffect(() => {
    if (custoMedioSafra !== null && custoMedioSafra > 0) {
      if (!custoUnitario1) setCustoUnitario1(String(custoMedioSafra));
      if (!custoUnitario2) setCustoUnitario2(String(custoMedioSafra));
    }
    if (totalGastos > 0 && !custosTotais3) {
      setCustosTotais3(String(totalGastos));
    }
    if (resumoProducao.quantidadePredominante > 0) {
      if (!qtdVenda1) setQtdVenda1(String(resumoProducao.quantidadePredominante));
      if (!qtdNegociada2) setQtdNegociada2(String(resumoProducao.quantidadePredominante));
    }
  }, [custoMedioSafra, totalGastos, resumoProducao.quantidadePredominante]);

  // CÁLCULOS DO MODO 1: Acréscimo sobre o custo (Requisito 3)
  const calcModo1 = useMemo(() => {
    const qtd = parseValorMoeda(qtdVenda1) || 0;
    const custoBase = parseValorMoeda(custoUnitario1) || 0;
    const custoExtra = parseValorMoeda(custoAdicionalFrete1) || 0;
    const custoTotalUnit = custoBase + custoExtra;

    const acrescimoPerc =
      acrescimoPretendido === 'custom'
        ? parseValorMoeda(acrescimoCustomTexto) || 0
        : parseFloat(acrescimoPretendido) || 0;

    if (custoTotalUnit <= 0 || qtd <= 0) {
      return null;
    }

    // Fórmula: preco = custo * (1 + percentual / 100)
    const precoSugerido = Math.round(custoTotalUnit * (1 + acrescimoPerc / 100) * 100) / 100;
    const faturamentoPrevisto = Math.round(precoSugerido * qtd * 100) / 100;
    const custoTotalPrevisto = Math.round(custoTotalUnit * qtd * 100) / 100;
    const lucroLiquidoPrevisto = Math.round((faturamentoPrevisto - custoTotalPrevisto) * 100) / 100;

    return {
      custoTotalUnit,
      precoSugerido,
      faturamentoPrevisto,
      custoTotalPrevisto,
      lucroLiquidoPrevisto,
      acrescimoPerc,
      qtd,
    };
  }, [qtdVenda1, custoUnitario1, custoAdicionalFrete1, acrescimoPretendido, acrescimoCustomTexto]);

  // CÁLCULOS DO MODO 2: Analisar proposta do comprador
  const calcModo2 = useMemo(() => {
    const preco = parseValorMoeda(precoOferecido2) || 0;
    const qtd = parseValorMoeda(qtdNegociada2) || 0;
    const custoUnit = parseValorMoeda(custoUnitario2) || 0;
    const frete = parseValorMoeda(freteTotal2) || 0;

    if (preco <= 0 || qtd <= 0 || custoUnit <= 0) {
      return null;
    }

    const faturamentoBruto = Math.round(preco * qtd * 100) / 100;
    const custoProducaoTotal = Math.round(custoUnit * qtd * 100) / 100;
    const custosTotaisOperacao = custoProducaoTotal + frete;
    const lucroLiquido = Math.round((faturamentoBruto - custosTotaisOperacao) * 100) / 100;
    const lucroPorUnidade = qtd > 0 ? Math.round((lucroLiquido / qtd) * 100) / 100 : 0;
    const percentualSobreVenda = faturamentoBruto > 0 ? Math.round((lucroLiquido / faturamentoBruto) * 1000) / 10 : 0;

    let status: 'excelente' | 'moderado' | 'baixo' | 'prejuizo' = 'moderado';
    let mensagemStatus = '';

    if (lucroLiquido < 0) {
      status = 'prejuizo';
      mensagemStatus = `Prejuízo de ${formatarMoeda(Math.abs(lucroLiquido))}. O valor oferecido de ${formatarMoeda(preco)} não cobre seu custo de ${formatarMoeda(custoUnit)}/${unidade}.`;
    } else if (percentualSobreVenda >= 25) {
      status = 'excelente';
      mensagemStatus = `Resultado positivo! Sobra estimada de ${percentualSobreVenda}% sobre a venda (${formatarMoeda(lucroPorUnidade)} por ${unidade}).`;
    } else if (percentualSobreVenda >= 10) {
      status = 'moderado';
      mensagemStatus = `Resultado saudável de ${percentualSobreVenda}% sobre a venda, cobrindo todos os custos informados.`;
    } else {
      status = 'baixo';
      mensagemStatus = `Resultado apertado (${percentualSobreVenda}% sobre a venda). O valor restante é pequeno, avalie o risco ou tente negociar mais.`;
    }

    return {
      preco,
      qtd,
      custoUnit,
      faturamentoBruto,
      custosTotaisOperacao,
      lucroLiquido,
      lucroPorUnidade,
      percentualSobreVenda,
      status,
      mensagemStatus,
    };
  }, [precoOferecido2, qtdNegociada2, custoUnitario2, freteTotal2, unidade]);

  // CÁLCULOS DO MODO 3: Ponto de equilíbrio (Requisito 5)
  const calcModo3 = useMemo(() => {
    const preco = parseValorMoeda(precoPraticado3) || 0;
    const custosTotais = parseValorMoeda(custosTotais3) || 0;
    const metaLucro = parseValorMoeda(metaLucroDesejado3) || 0;

    if (preco <= 0 || custosTotais <= 0) {
      return null;
    }

    // Ponto de equilíbrio simples (unidades necessárias para faturamento = custos totais)
    const qtdEquilibrio = Math.ceil(custosTotais / preco);
    const faturamentoEquilibrio = qtdEquilibrio * preco;

    // Quantidade para bater a meta de lucro (se informada)
    const qtdParaMeta = metaLucro > 0 ? Math.ceil((custosTotais + metaLucro) / preco) : null;
    const faturamentoMeta = qtdParaMeta ? qtdParaMeta * preco : null;

    return {
      qtdEquilibrio,
      faturamentoEquilibrio,
      qtdParaMeta,
      faturamentoMeta,
      preco,
      custosTotais,
      metaLucro,
    };
  }, [precoPraticado3, custosTotais3, metaLucroDesejado3]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#20382A] text-[#F5F0E6] rounded-t-3xl sm:rounded-3xl border-2 border-[#354A37] shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#354A37] flex items-center justify-between bg-[#14251C]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#20382A] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center text-xl shadow-inner">
              🧮
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5F0E6]">
                Calculadora de Preço e Custos
              </h2>
              <p className="text-xs sm:text-sm text-[#D8CEB8]">
                Simule acréscimo sobre custo, propostas e ponto de equilíbrio
              </p>
            </div>
          </div>

          <button
            id="btn-fechar-calculadora"
            onClick={onClose}
            className="p-2.5 text-[#D8CEB8] hover:text-[#F5F0E6] hover:bg-[#20382A] rounded-xl transition"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs (3 Modos) */}
        <div className="p-3 bg-[#14251C] border-b border-[#354A37]">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#20382A] border border-[#354A37] rounded-2xl">
            <button
              onClick={() => setModo('sugerirPreco')}
              className={`py-2.5 px-1.5 text-xs sm:text-sm font-bold rounded-xl transition text-center min-h-[44px] ${
                modo === 'sugerirPreco'
                  ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                  : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
              }`}
            >
              🏷️ Formar Preço
            </button>
            <button
              onClick={() => setModo('analisarProposta')}
              className={`py-2.5 px-1.5 text-xs sm:text-sm font-bold rounded-xl transition text-center min-h-[44px] ${
                modo === 'analisarProposta'
                  ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                  : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
              }`}
            >
              🤝 Analisar Proposta
            </button>
            <button
              onClick={() => setModo('pontoEquilibrio')}
              className={`py-2.5 px-1.5 text-xs sm:text-sm font-bold rounded-xl transition text-center min-h-[44px] ${
                modo === 'pontoEquilibrio'
                  ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                  : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
              }`}
            >
              ⚖️ Equilíbrio
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* MODO 1: FORMAR PREÇO / ACRÉSCIMO SOBRE O CUSTO (Requisitos 1, 2, 3, 4) */}
          {modo === 'sugerirPreco' && (
            <div className="space-y-4">
              {/* Bloqueio se não houver dados suficientes da safra (Requisito 2) */}
              {!temDadosSuficientes ? (
                <div className="p-5 bg-[#14251C] rounded-2xl border-2 border-[#354A37] space-y-3.5 text-center">
                  <p className="text-base sm:text-lg font-bold text-[#F5F0E6] leading-snug">
                    Para fazer esta simulação, primeiro registre seus gastos e sua produção.
                  </p>
                  <p className="text-sm text-[#D8CEB8]">
                    O cálculo do custo médio precisa de gastos registrados e quantidade colhida.
                  </p>
                  {onNavegarRegistros && (
                    <button
                      id="btn-calculadora-modo1-registrar-dados"
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavegarRegistros();
                      }}
                      className="w-full min-h-[54px] py-3.5 px-6 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] font-bold text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2.5"
                    >
                      <span>✍️</span>
                      <span>REGISTRAR DADOS</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#14251C] rounded-2xl border border-[#354A37] text-xs sm:text-sm text-[#D8CEB8] flex items-center justify-between">
                    <span>Custo médio real apurado:</span>
                    <span className="font-extrabold text-[#D9AD5B] text-base">
                      {custoMedioSafra !== null ? `${formatarMoeda(custoMedioSafra)}/${unidade}` : '—'}
                    </span>
                  </div>

                  {/* Quantidade */}
                  <div>
                    <label htmlFor="input-calc-qtd1" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
                      Quantidade que pretende vender ({unidade}):
                    </label>
                    <input
                      id="input-calc-qtd1"
                      type="text"
                      inputMode="decimal"
                      value={qtdVenda1}
                      onChange={e => setQtdVenda1(e.target.value)}
                      placeholder="Ex: 500"
                      className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-base focus:outline-none placeholder-[#D8CEB8]/40"
                    />
                  </div>

                  {/* Custo unitário com botão de restaurar safra */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="input-calc-custo1" className="text-sm font-bold text-[#F5F0E6]">
                        Seu custo por {unidade} (R$):
                      </label>
                      {custoMedioSafra !== null && custoMedioSafra > 0 && (
                        <button
                          type="button"
                          onClick={() => setCustoUnitario1(String(custoMedioSafra))}
                          className="text-xs font-bold text-[#D9AD5B] hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Usar custo da safra ({formatarMoeda(custoMedioSafra)})</span>
                        </button>
                      )}
                    </div>
                    <input
                      id="input-calc-custo1"
                      type="text"
                      inputMode="decimal"
                      value={custoUnitario1}
                      onChange={e => setCustoUnitario1(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#D9AD5B] font-bold text-base focus:outline-none"
                    />
                  </div>

                  {/* Custos adicionais por unidade */}
                  <div>
                    <label htmlFor="input-calc-frete1" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
                      Custos adicionais por {unidade} (frete, embalagem, etc.):
                    </label>
                    <input
                      id="input-calc-frete1"
                      type="text"
                      inputMode="decimal"
                      value={custoAdicionalFrete1}
                      onChange={e => setCustoAdicionalFrete1(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-4 py-3 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-sm focus:outline-none placeholder-[#D8CEB8]/40"
                    />
                  </div>

                  {/* Seletor: Quanto você quer acrescentar ao custo? (Requisito 3) */}
                  <div>
                    <label className="block text-sm font-bold text-[#F5F0E6] mb-2">
                      Quanto você quer acrescentar ao custo?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['10', '20', '30'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setAcrescimoPretendido(m)}
                          className={`py-3 rounded-xl text-sm font-bold transition border min-h-[48px] ${
                            acrescimoPretendido === m
                              ? 'bg-[#C86F42] text-[#F5F0E6] border-[#C86F42] shadow-sm'
                              : 'bg-[#14251C] text-[#D8CEB8] border-[#354A37] hover:bg-[#354A37]/50'
                          }`}
                        >
                          {m}%
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAcrescimoPretendido('custom')}
                        className={`py-3 rounded-xl text-sm font-bold transition border min-h-[48px] ${
                          acrescimoPretendido === 'custom'
                            ? 'bg-[#C86F42] text-[#F5F0E6] border-[#C86F42] shadow-sm'
                            : 'bg-[#14251C] text-[#D8CEB8] border-[#354A37] hover:bg-[#354A37]/50'
                        }`}
                      >
                        Personalizado
                      </button>
                    </div>

                    {acrescimoPretendido === 'custom' && (
                      <div className="mt-3">
                        <label htmlFor="input-calc-acrescimo-custom" className="block text-xs font-semibold text-[#D8CEB8] mb-1">
                          Porcentagem personalizada de acréscimo (%):
                        </label>
                        <input
                          id="input-calc-acrescimo-custom"
                          type="text"
                          inputMode="decimal"
                          value={acrescimoCustomTexto}
                          onChange={e => setAcrescimoCustomTexto(e.target.value)}
                          placeholder="Ex: 25"
                          className="w-full px-4 py-3 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-sm font-bold text-[#F5F0E6] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* CARD DE RESULTADO DO MODO 1 */}
                  {calcModo1 ? (
                    <div className="p-4 sm:p-5 bg-[#14251C] rounded-2xl border-2 border-[#D9AD5B]/60 space-y-3.5 shadow-md">
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#354A37]">
                        <div>
                          <p className="text-xs font-semibold text-[#D8CEB8]">
                            Preço com acréscimo de {calcModo1.acrescimoPerc}%:
                          </p>
                          <p className="text-2xl sm:text-3xl font-black text-[#D9AD5B]">
                            {formatarMoeda(calcModo1.precoSugerido)}
                            <span className="text-sm font-normal text-[#D8CEB8] ml-1">
                              /{unidade}
                            </span>
                          </p>
                        </div>
                        <span className="px-3 py-1.5 bg-[#20382A] text-[#D9AD5B] border border-[#354A37] rounded-full text-xs font-bold">
                          +{calcModo1.acrescimoPerc}% sobre custo
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div className="p-3 bg-[#20382A] rounded-xl border border-[#354A37]">
                          <p className="text-[#D8CEB8] text-xs">Faturamento previsto</p>
                          <p className="font-bold text-base text-[#F5F0E6] mt-0.5">
                            {formatarMoeda(calcModo1.faturamentoPrevisto)}
                          </p>
                        </div>

                        <div className="p-3 bg-[#20382A] rounded-xl border border-[#354A37]">
                          <p className="text-[#D8CEB8] text-xs">Acréscimo sobre o custo</p>
                          <p className="font-bold text-base text-[#D9AD5B] mt-0.5">
                            +{formatarMoeda(calcModo1.lucroLiquidoPrevisto)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#D8CEB8] leading-relaxed">
                        Vendendo {formatarNumero(calcModo1.qtd)} {unidade} a{' '}
                        <strong className="text-[#F5F0E6]">{formatarMoeda(calcModo1.precoSugerido)}</strong>, você cobre os custos considerados de {formatarMoeda(calcModo1.custoTotalPrevisto)} e obtém um acréscimo estimado de{' '}
                        <strong className="text-[#D9AD5B]">{formatarMoeda(calcModo1.lucroLiquidoPrevisto)}</strong>.
                      </p>

                      {onAbrirWhatsappCotacao && (
                        <button
                          type="button"
                          onClick={() => {
                            onAbrirWhatsappCotacao({
                              produto: safraAtiva?.produtoPrincipal || 'Produção',
                              quantidade: calcModo1.qtd,
                              precoUnitario: calcModo1.precoSugerido,
                            });
                            onClose();
                          }}
                          className="w-full min-h-[52px] py-3.5 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] font-bold text-sm sm:text-base rounded-xl shadow-md transition flex items-center justify-center gap-2"
                        >
                          <span>📲 OFERECER NO WHATSAPP</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#14251C] rounded-xl border border-[#354A37] text-xs sm:text-sm text-[#D8CEB8]">
                      Preencha a quantidade e o custo para calcular a simulação.
                    </div>
                  )}

                  {/* Aviso do Simulador (Requisito 4) */}
                  <div className="flex items-start gap-2 p-3 bg-[#14251C] rounded-xl border border-[#354A37] text-xs text-[#D8CEB8] leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#D9AD5B]" />
                    <span>
                      Esta é apenas uma simulação baseada nos dados registrados. O preço real de venda depende da negociação, do mercado e de outros custos.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODO 2: ANALISAR PROPOSTA DE COMPRADOR */}
          {modo === 'analisarProposta' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#14251C] rounded-2xl border border-[#354A37] text-xs sm:text-sm text-[#D8CEB8]">
                Descubra rapidamente se o preço oferecido por um comprador cobre seus custos apurados.
              </div>

              {/* Preço Oferecido */}
              <div>
                <label htmlFor="input-calc-preco2" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
                  Preço oferecido pelo comprador por {unidade} (R$):
                </label>
                <input
                  id="input-calc-preco2"
                  type="text"
                  inputMode="decimal"
                  value={precoOferecido2}
                  onChange={e => setPrecoOferecido2(e.target.value)}
                  placeholder="Ex: 45,00"
                  className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-lg focus:outline-none placeholder-[#D8CEB8]/40"
                />
              </div>

              {/* Quantidade a vender */}
              <div>
                <label htmlFor="input-calc-qtd2" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
                  Quantidade a entregar ({unidade}):
                </label>
                <input
                  id="input-calc-qtd2"
                  type="text"
                  inputMode="decimal"
                  value={qtdNegociada2}
                  onChange={e => setQtdNegociada2(e.target.value)}
                  placeholder="Ex: 500"
                  className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-base focus:outline-none placeholder-[#D8CEB8]/40"
                />
              </div>

              {/* Custo de produção */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-calc-custo2" className="text-sm font-bold text-[#F5F0E6]">
                    Seu custo de produção por {unidade} (R$):
                  </label>
                  {custoMedioSafra !== null && custoMedioSafra > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustoUnitario2(String(custoMedioSafra))}
                      className="text-xs font-bold text-[#D9AD5B] hover:underline"
                    >
                      Puxar safra ({formatarMoeda(custoMedioSafra)})
                    </button>
                  )}
                </div>
                <input
                  id="input-calc-custo2"
                  type="text"
                  inputMode="decimal"
                  value={custoUnitario2}
                  onChange={e => setCustoUnitario2(e.target.value)}
                  className="w-full px-4 py-3 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#D9AD5B] font-bold text-base focus:outline-none"
                />
              </div>

              {/* Frete ou comissão total */}
              <div>
                <label htmlFor="input-calc-frete2" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
                  Despesa com frete / transporte desta carga (R$):
                </label>
                <input
                  id="input-calc-frete2"
                  type="text"
                  inputMode="decimal"
                  value={freteTotal2}
                  onChange={e => setFreteTotal2(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-sm focus:outline-none placeholder-[#D8CEB8]/40"
                />
              </div>

              {/* RESULTADO DA ANÁLISE */}
              {calcModo2 ? (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 space-y-3.5 shadow-md bg-[#14251C] ${
                    calcModo2.status === 'prejuizo'
                      ? 'border-[#E05345]'
                      : calcModo2.status === 'excelente'
                      ? 'border-[#D9AD5B]'
                      : 'border-[#354A37]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#354A37]">
                    <div>
                      <p className="text-xs font-semibold text-[#D8CEB8]">
                        Resultado desta proposta:
                      </p>
                      <p
                        className={`text-2xl sm:text-3xl font-black ${
                          calcModo2.lucroLiquido >= 0 ? 'text-[#D9AD5B]' : 'text-[#E05345]'
                        }`}
                      >
                        {calcModo2.lucroLiquido >= 0 ? '+' : ''}
                        {formatarMoeda(calcModo2.lucroLiquido)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        calcModo2.status === 'prejuizo'
                          ? 'bg-[#E05345]/20 text-[#E05345] border border-[#E05345]'
                          : 'bg-[#20382A] text-[#D9AD5B] border border-[#D9AD5B]/50'
                      }`}
                    >
                      {calcModo2.percentualSobreVenda}% sobre a venda
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="p-3 bg-[#20382A] rounded-xl border border-[#354A37]">
                      <p className="text-[#D8CEB8] text-xs">Entrada bruta prevista</p>
                      <p className="font-bold text-[#F5F0E6] text-sm sm:text-base mt-0.5">
                        {formatarMoeda(calcModo2.faturamentoBruto)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#20382A] rounded-xl border border-[#354A37]">
                      <p className="text-[#D8CEB8] text-xs">Resultado por {unidade}</p>
                      <p
                        className={`font-bold text-sm sm:text-base mt-0.5 ${
                          calcModo2.lucroPorUnidade >= 0 ? 'text-[#D9AD5B]' : 'text-[#E05345]'
                        }`}
                      >
                        {formatarMoeda(calcModo2.lucroPorUnidade)}/{unidade}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium leading-relaxed border ${
                      calcModo2.status === 'prejuizo'
                        ? 'bg-[#E05345]/15 text-[#F5F0E6] border-[#E05345]/40'
                        : 'bg-[#20382A] text-[#F5F0E6] border-[#354A37]'
                    }`}
                  >
                    <p>{calcModo2.mensagemStatus}</p>
                  </div>

                  {/* Aviso do Simulador (Requisito 4) */}
                  <div className="flex items-start gap-2 p-3 bg-[#14251C] rounded-xl border border-[#354A37] text-xs text-[#D8CEB8] leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#D9AD5B]" />
                    <span>
                      Esta é apenas uma simulação baseada nos dados registrados. O preço real de venda depende da negociação, do mercado e de outros custos.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#14251C] rounded-xl border border-[#354A37] text-xs sm:text-sm text-[#D8CEB8]">
                  Informe o preço oferecido, a quantidade e o custo unitário para analisar a proposta.
                </div>
              )}
            </div>
          )}

          {/* MODO 3: PONTO DE EQUILÍBRIO & METAS (Requisito 5) */}
          {modo === 'pontoEquilibrio' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#14251C] rounded-2xl border border-[#354A37] text-xs sm:text-sm text-[#D8CEB8] leading-relaxed">
                Ponto de equilíbrio é uma estimativa de quanto você precisa vender para cobrir os custos considerados neste cálculo. Outros gastos e custos variáveis podem alterar esse resultado.
              </div>

              {/* Preço de venda planejado */}
              <div>
                <label htmlFor="input-calc-preco3" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
                  Preço de venda planejado por {unidade} (R$):
                </label>
                <input
                  id="input-calc-preco3"
                  type="text"
                  inputMode="decimal"
                  value={precoPraticado3}
                  onChange={e => setPrecoPraticado3(e.target.value)}
                  placeholder="Ex: 40,00"
                  className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#D9AD5B] font-bold text-lg focus:outline-none placeholder-[#D8CEB8]/40"
                />
              </div>

              {/* Custos totais a cobrir */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-calc-custos3" className="text-sm font-bold text-[#F5F0E6]">
                    Custos totais da safra a cobrir (R$):
                  </label>
                  {totalGastos > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustosTotais3(String(totalGastos))}
                      className="text-xs font-bold text-[#D9AD5B] hover:underline"
                    >
                      Usar gastos reais ({formatarMoeda(totalGastos)})
                    </button>
                  )}
                </div>
                <input
                  id="input-calc-custos3"
                  type="text"
                  inputMode="decimal"
                  value={custosTotais3}
                  onChange={e => setCustosTotais3(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#14251C] border border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-base focus:outline-none"
                />
              </div>

              {/* Meta de Lucro no Bolso */}
              <div>
                <label htmlFor="input-calc-meta3" className="block text-sm font-bold text-[#F5F0E6] mb-1.5">
                  Quanto você quer que sobre de resultado líquido (R$) [opcional]:
                </label>
                <input
                  id="input-calc-meta3"
                  type="text"
                  inputMode="decimal"
                  value={metaLucroDesejado3}
                  onChange={e => setMetaLucroDesejado3(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#D9AD5B] font-bold text-base focus:outline-none placeholder-[#D8CEB8]/40"
                />
              </div>

              {/* RESULTADOS DO PONTO DE EQUILÍBRIO (Sem frases ou números fictícios) */}
              {calcModo3 ? (
                <div className="space-y-3">
                  {/* Estimativa para cobrir custos */}
                  <div className="p-4 sm:p-5 bg-[#14251C] rounded-2xl border-2 border-[#354A37] space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D8CEB8]">
                      Estimativa para cobrir custos considerados:
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">
                      {formatarNumero(calcModo3.qtdEquilibrio)}{' '}
                      <span className="text-sm font-normal text-[#D8CEB8]">
                        {unidade}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-[#D8CEB8] leading-relaxed">
                      Você precisa vender aproximadamente{' '}
                      <strong className="text-[#F5F0E6]">
                        {formatarNumero(calcModo3.qtdEquilibrio)} {unidade}
                      </strong>{' '}
                      a {formatarMoeda(calcModo3.preco)} para cobrir os custos informados de{' '}
                      {formatarMoeda(calcModo3.custosTotais)}.
                    </p>
                  </div>

                  {/* Para atingir a meta (se informada) */}
                  {calcModo3.qtdParaMeta !== null && calcModo3.faturamentoMeta !== null && (
                    <div className="p-4 sm:p-5 bg-[#14251C] rounded-2xl border-2 border-[#D9AD5B]/70 space-y-2 shadow-md">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D9AD5B]">
                        Para atingir o resultado pretendido de {formatarMoeda(calcModo3.metaLucro)}:
                      </span>
                      <p className="text-2xl sm:text-3xl font-black text-[#D9AD5B]">
                        {formatarNumero(calcModo3.qtdParaMeta)}{' '}
                        <span className="text-sm font-normal text-[#D8CEB8]">
                          {unidade}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm text-[#D8CEB8] leading-relaxed">
                        Vendendo{' '}
                        <strong className="text-[#F5F0E6]">
                          {formatarNumero(calcModo3.qtdParaMeta)} {unidade}
                        </strong>{' '}
                        você alcança o faturamento total de{' '}
                        <strong className="text-[#D9AD5B]">
                          {formatarMoeda(calcModo3.faturamentoMeta)}
                        </strong>
                        , cobrindo os custos informados e atingindo o valor desejado.
                      </p>
                    </div>
                  )}

                  {/* Aviso Obrigatório (Requisito 4 e 5) */}
                  <p className="text-xs sm:text-sm text-[#D8CEB8] bg-[#14251C] p-3.5 rounded-xl border border-[#354A37] leading-relaxed">
                    <strong className="text-[#F5F0E6]">Importante:</strong> Ponto de equilíbrio é uma estimativa de quanto você precisa vender para cobrir os custos considerados neste cálculo. Outros gastos e custos variáveis podem alterar esse resultado.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-[#14251C] rounded-xl border border-[#354A37] text-xs sm:text-sm text-[#D8CEB8]">
                  Informe o preço de venda pretendido e o custo total para calcular a estimativa de equilíbrio.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#354A37] bg-[#14251C]">
          <button
            onClick={onClose}
            className="w-full min-h-[54px] py-3.5 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] font-bold text-base rounded-2xl shadow-md transition"
          >
            Fechar Calculadora
          </button>
        </div>
      </div>
    </div>
  );
};
