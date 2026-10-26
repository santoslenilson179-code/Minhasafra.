import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Calculator,
  Info,
  HelpCircle,
} from 'lucide-react';
import { Safra } from '../types';
import { formatarMoeda, formatarNumero, parseValorMoeda } from '../utils/formatters';
import { ResumoProducao, calcularCustoMedio, calcularSimulacaoVenda } from '../utils/calculations';

interface ResultadoViewProps {
  safraAtiva: Safra | null;
  totalVendas: number;
  totalGastos: number;
  resultado: number;
  resumoProducao: ResumoProducao;
  onAbrirRelatorioWhatsapp: () => void;
  onAbrirCalculadoraLucros: () => void;
  onNavegarRegistros?: () => void;
}

export const ResultadoView: React.FC<ResultadoViewProps> = ({
  safraAtiva,
  totalVendas,
  totalGastos,
  resultado,
  resumoProducao,
  onAbrirRelatorioWhatsapp,
  onAbrirCalculadoraLucros,
  onNavegarRegistros,
}) => {
  const isPositivo = resultado > 0;
  const isNegativo = resultado < 0;
  const isNeutro = resultado === 0 && totalVendas === 0 && totalGastos === 0;

  // Custo médio por unidade predominante (ex: kg). Retorna null se não houver dados suficientes.
  const custoMedioUnitario = calcularCustoMedio(
    totalGastos,
    resumoProducao.quantidadePredominante
  );

  const temDadosSuficientes = custoMedioUnitario !== null && custoMedioUnitario > 0;

  // Estados do Simulador "Quanto acrescentar ao custo?"
  const [qtdSimuladaTexto, setQtdSimuladaTexto] = useState(
    resumoProducao.quantidadePredominante > 0
      ? resumoProducao.quantidadePredominante.toString()
      : ''
  );
  const [acrescimoOpcao, setAcrescimoOpcao] = useState<'10' | '20' | '30' | 'personalizado'>('20');
  const [acrescimoPersonalizadoTexto, setAcrescimoPersonalizadoTexto] = useState('25');

  const percentualAcrescimo =
    acrescimoOpcao === 'personalizado'
      ? parseValorMoeda(acrescimoPersonalizadoTexto)
      : parseFloat(acrescimoOpcao);

  const qtdSimuladaNum = parseValorMoeda(qtdSimuladaTexto);

  // Simulação somente calculada se houver custo médio real e quantidade válida
  const simulacao = temDadosSuficientes && qtdSimuladaNum > 0
    ? calcularSimulacaoVenda(custoMedioUnitario, qtdSimuladaNum, percentualAcrescimo)
    : null;

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-[#20382A] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#354A37] text-[#F5F0E6]">
        <span className="text-sm font-bold text-[#D9AD5B] uppercase tracking-wider block mb-1">
          Safra: {safraAtiva?.nome || 'Principal'}
        </span>
        <h2 className="text-2xl sm:text-[28px] font-bold text-[#F5F0E6] leading-tight">
          Resultado da Safra
        </h2>
        <p className="text-sm sm:text-base text-[#D8CEB8] mt-1.5 font-medium leading-relaxed">
          Acompanhe seu faturamento, despesas e descubra se sua safra deu lucro ou prejuízo.
        </p>
      </div>

      {/* 2 BOTÕES PRINCIPAIS: RELATÓRIO WHATSAPP & CALCULADORA DE LUCRO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Enviar no WhatsApp */}
        <button
          id="btn-resultado-relatorio-whatsapp"
          onClick={onAbrirRelatorioWhatsapp}
          className="p-4 bg-[#20382A] border-2 border-[#354A37] hover:border-[#22C55E] rounded-2xl text-left transition flex items-center gap-3.5 group active:scale-[0.98] shadow-xs min-h-[56px]"
        >
          <div className="w-12 h-12 rounded-xl bg-[#14251C] border border-[#22C55E]/50 text-[#22C55E] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition">
            📲
          </div>
          <div>
            <p className="font-bold text-[#F5F0E6] text-base leading-tight">
              Relatório WhatsApp
            </p>
            <p className="text-sm text-[#D8CEB8] mt-0.5">
              Enviar resumo pronto no WhatsApp
            </p>
          </div>
        </button>

        {/* Calculadora de Lucros */}
        <button
          id="btn-resultado-calculadora-lucros"
          onClick={onAbrirCalculadoraLucros}
          className="p-4 bg-[#20382A] border-2 border-[#354A37] hover:border-[#D9AD5B] rounded-2xl text-left transition flex items-center gap-3.5 group active:scale-[0.98] shadow-xs min-h-[56px]"
        >
          <div className="w-12 h-12 rounded-xl bg-[#14251C] border border-[#D9AD5B]/50 text-[#D9AD5B] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition">
            🧮
          </div>
          <div>
            <p className="font-bold text-[#F5F0E6] text-base leading-tight">
              Calculadora de Lucro
            </p>
            <p className="text-sm text-[#D8CEB8] mt-0.5">
              Simular preços, sacas & margens
            </p>
          </div>
        </button>
      </div>

      {/* Big 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Vendido */}
        <div className="p-4 sm:p-5 bg-[#20382A] rounded-3xl border-2 border-[#354A37] shadow-xs text-[#F5F0E6]">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D8CEB8] mb-1">
            <span>💰</span>
            <span>Total vendido</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#D9AD5B] truncate">
            {formatarMoeda(totalVendas)}
          </p>
          <p className="text-xs sm:text-sm text-[#D8CEB8] mt-1 font-medium">
            Entrada de dinheiro
          </p>
        </div>

        {/* Total Gasto */}
        <div className="p-4 sm:p-5 bg-[#20382A] rounded-3xl border-2 border-[#354A37] shadow-xs text-[#F5F0E6]">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D8CEB8] mb-1">
            <span>💸</span>
            <span>Total gasto</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#F5F0E6] truncate">
            {formatarMoeda(totalGastos)}
          </p>
          <p className="text-xs sm:text-sm text-[#D8CEB8] mt-1 font-medium">
            Saída de despesas
          </p>
        </div>

        {/* Produção Registrada */}
        <div className="p-4 sm:p-5 bg-[#20382A] rounded-3xl border-2 border-[#354A37] shadow-xs text-[#F5F0E6]">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D8CEB8] mb-1">
            <span>📦</span>
            <span>Colheita registrada</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#F5F0E6] truncate">
            {resumoProducao.resumoTexto}
          </p>
          <p className="text-xs sm:text-sm text-[#D8CEB8] mt-1 font-medium">
            Volume no campo
          </p>
        </div>

        {/* Resultado Final Card */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border-2 shadow-xs bg-[#20382A] text-[#F5F0E6] ${
            isPositivo
              ? 'border-[#D9AD5B]'
              : isNegativo
              ? 'border-[#DC4C4C]'
              : 'border-[#354A37]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D8CEB8] mb-1">
            <span>💵</span>
            <span>Saldo Líquido</span>
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold truncate ${
              isPositivo
                ? 'text-[#D9AD5B]'
                : isNegativo
                ? 'text-[#EF4444]'
                : 'text-[#F5F0E6]'
            }`}
          >
            {formatarMoeda(resultado)}
          </p>
          <p className="text-xs sm:text-sm text-[#D8CEB8] mt-1 font-medium">
            Vendas menos Gastos
          </p>
        </div>
      </div>

      {/* Main Conclusion Banner */}
      <div
        className={`p-5 rounded-3xl border-2 flex items-start gap-4 shadow-sm bg-[#14251C] text-[#F5F0E6] ${
          isPositivo
            ? 'border-[#22C55E]/60'
            : isNegativo
            ? 'border-[#DC4C4C]/60'
            : 'border-[#354A37]'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl font-bold shadow-xs ${
            isPositivo
              ? 'bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#4ADE80]'
              : isNegativo
              ? 'bg-[#DC4C4C]/20 border border-[#DC4C4C]/40 text-[#EF4444]'
              : 'bg-[#20382A] border border-[#354A37] text-[#D8CEB8]'
          }`}
        >
          {isPositivo ? '✓' : isNegativo ? '⚠️' : '⚪'}
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#F5F0E6]">
            {isPositivo && `✓ Você está com lucro de ${formatarMoeda(resultado)}`}
            {isNegativo && `Atenção: você está com prejuízo de ${formatarMoeda(Math.abs(resultado))}`}
            {isNeutro && 'Sem movimentação suficiente para apurar o resultado'}
          </h3>
          <p className="text-sm text-[#D8CEB8] mt-1.5 leading-relaxed">
            {isPositivo &&
              'Suas vendas já cobriram todos os gastos registrados até o momento e sobrou dinheiro no seu bolso.'}
            {isNegativo &&
              'Seus gastos registrados estão maiores do que o valor total de vendas realizadas até agora.'}
            {isNeutro &&
              'Cadastre seus primeiros gastos e vendas para acompanhar o saldo da sua safra.'}
          </p>
        </div>
      </div>

      {/* SECTION 9: CUSTO DE PRODUÇÃO */}
      <div className="bg-[#20382A] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#354A37] space-y-4 text-[#F5F0E6]">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#354A37]">
          <div className="w-9 h-9 rounded-xl bg-[#14251C] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#F5F0E6]">
              Quanto está custando minha produção?
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CEB8] font-medium">
              Custo médio = gastos totais ÷ quantidade colhida
            </p>
          </div>
        </div>

        {temDadosSuficientes ? (
          <div className="space-y-3">
            <div className="p-4 bg-[#14251C] rounded-2xl border border-[#354A37] flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#D8CEB8]">Seu custo médio calculado</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#D9AD5B] mt-1">
                  {formatarMoeda(custoMedioUnitario)}
                  <span className="text-base font-bold text-[#D8CEB8]">
                    /{resumoProducao.unidadePredominante}
                  </span>
                </p>
              </div>
              <div className="text-right text-xs sm:text-sm text-[#D8CEB8] space-y-0.5">
                <p>Gastos: <strong className="text-[#F5F0E6]">{formatarMoeda(totalGastos)}</strong></p>
                <p>Produção: <strong className="text-[#F5F0E6]">{formatarNumero(resumoProducao.quantidadePredominante)} {resumoProducao.unidadePredominante}</strong></p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#F5F0E6] bg-[#14251C] p-3.5 rounded-xl border border-[#354A37] leading-relaxed font-medium">
              Considerando seus gastos anotados, cada{' '}
              <strong className="text-[#D9AD5B]">{resumoProducao.unidadePredominante}</strong> produzido custou aproximadamente{' '}
              <strong className="text-[#D9AD5B]">{formatarMoeda(custoMedioUnitario)}</strong>.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-[#14251C] rounded-2xl border border-[#354A37] space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#354A37]">
              <span className="text-sm font-bold text-[#D8CEB8]">Custo médio:</span>
              <span className="text-2xl font-bold text-[#D8CEB8]">—</span>
            </div>
            <p className="text-base font-bold text-[#F5F0E6]">
              Ainda não há dados suficientes.
            </p>
            <p className="text-sm text-[#D8CEB8] leading-relaxed">
              Registre seus gastos e sua produção para calcular o custo.
            </p>
          </div>
        )}

        <div className="flex items-start gap-2.5 p-3.5 bg-[#14251C] rounded-xl border border-[#354A37] text-xs sm:text-sm text-[#D8CEB8] leading-relaxed">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#D9AD5B]" />
          <span>
            Este cálculo é uma estimativa gerencial com base estritamente nos seus lançamentos.
          </span>
        </div>
      </div>

      {/* SECTION 10: SIMULADOR COM ACRÉSCIMO SOBRE O CUSTO */}
      <div className="bg-[#20382A] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#354A37] space-y-4 text-[#F5F0E6]">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#354A37]">
          <div className="w-9 h-9 rounded-xl bg-[#14251C] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#F5F0E6]">
              Simular acréscimo sobre o custo
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CEB8] font-medium">
              Calcule quanto acrescentar ao seu custo real para negociar
            </p>
          </div>
        </div>

        {!temDadosSuficientes ? (
          /* Bloqueio da simulação quando não há dados reais (Requisito 2) */
          <div className="p-5 bg-[#14251C] rounded-2xl border-2 border-[#354A37] space-y-3.5 text-center">
            <p className="text-base sm:text-lg font-bold text-[#F5F0E6] leading-snug">
              Para fazer esta simulação, primeiro registre seus gastos e sua produção.
            </p>
            <p className="text-sm text-[#D8CEB8]">
              O simulador utiliza seu custo médio real e não inventa valores de exemplo.
            </p>
            {onNavegarRegistros && (
              <button
                id="btn-simulador-registrar-dados"
                type="button"
                onClick={onNavegarRegistros}
                className="w-full min-h-[54px] py-3.5 px-6 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] font-bold text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2.5"
              >
                <span>✍️</span>
                <span>REGISTRAR DADOS</span>
              </button>
            )}
          </div>
        ) : (
          /* Simulação liberada com dados reais */
          <div className="space-y-4">
            {/* Quantidade a vender */}
            <div>
              <label htmlFor="input-simulador-quantidade" className="block text-base font-bold text-[#F5F0E6] mb-1.5">
                Quantidade que pretende vender ({resumoProducao.unidadePredominante}):
              </label>
              <input
                id="input-simulador-quantidade"
                type="text"
                inputMode="decimal"
                value={qtdSimuladaTexto}
                onChange={e => setQtdSimuladaTexto(e.target.value)}
                placeholder="Informe a quantidade..."
                className="w-full px-4 py-3.5 bg-[#14251C] border-2 border-[#354A37] focus:border-[#D9AD5B] rounded-xl text-[#F5F0E6] font-bold text-lg focus:outline-none transition placeholder-[#D8CEB8]/40"
              />
            </div>

            {/* Custo Médio Real Indicator */}
            <div className="p-3.5 bg-[#14251C] rounded-xl border border-[#354A37] text-sm text-[#D8CEB8] flex items-center justify-between">
              <span>Seu custo médio real:</span>
              <span className="font-bold text-[#D9AD5B] text-base">
                {formatarMoeda(custoMedioUnitario)}/{resumoProducao.unidadePredominante}
              </span>
            </div>

            {/* Seleção de Acréscimo sobre o custo (Requisito 3) */}
            <div>
              <label className="block text-base font-bold text-[#F5F0E6] mb-2">
                Quanto você quer acrescentar ao custo?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['10', '20', '30'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAcrescimoOpcao(m)}
                    className={`py-3 rounded-xl font-bold text-sm sm:text-base transition border min-h-[48px] ${
                      acrescimoOpcao === m
                        ? 'bg-[#C86F42] text-[#F5F0E6] border-[#C86F42] shadow-sm'
                        : 'bg-[#14251C] text-[#D8CEB8] border-[#354A37] hover:bg-[#354A37]/50 hover:text-[#F5F0E6]'
                    }`}
                  >
                    {m}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAcrescimoOpcao('personalizado')}
                  className={`py-3 rounded-xl font-bold text-sm sm:text-base transition border min-h-[48px] ${
                    acrescimoOpcao === 'personalizado'
                      ? 'bg-[#C86F42] text-[#F5F0E6] border-[#C86F42] shadow-sm'
                      : 'bg-[#14251C] text-[#D8CEB8] border-[#354A37] hover:bg-[#354A37]/50 hover:text-[#F5F0E6]'
                  }`}
                >
                  Outro %
                </button>
              </div>

              {acrescimoOpcao === 'personalizado' && (
                <div className="mt-3">
                  <label htmlFor="input-acrescimo-personalizado" className="block text-sm font-semibold text-[#D8CEB8] mb-1">
                    Digite a porcentagem desejada (%):
                  </label>
                  <input
                    id="input-acrescimo-personalizado"
                    type="text"
                    inputMode="decimal"
                    value={acrescimoPersonalizadoTexto}
                    onChange={e => setAcrescimoPersonalizadoTexto(e.target.value)}
                    placeholder="Ex: 25"
                    className="w-full px-4 py-3 bg-[#14251C] border-2 border-[#354A37] rounded-xl text-base font-bold text-[#F5F0E6] focus:outline-none focus:border-[#D9AD5B]"
                  />
                </div>
              )}
            </div>

            {/* Resultado da Simulação (se houver quantidade informada) */}
            {simulacao ? (
              <div className="p-5 bg-[#14251C] text-[#F5F0E6] rounded-2xl space-y-3.5 shadow-md border-2 border-[#D9AD5B]/60">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#354A37]">
                  <div>
                    <span className="text-sm text-[#D8CEB8] font-semibold block">
                      Preço com acréscimo de {percentualAcrescimo}%:
                    </span>
                    <span className="text-xs text-[#D8CEB8]">
                      Custo {formatarMoeda(custoMedioUnitario)} + {percentualAcrescimo}%
                    </span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-[#D9AD5B]">
                    {formatarMoeda(simulacao.precoUnitarioSugerido)}
                    <span className="text-sm text-[#D8CEB8] font-normal ml-1">
                      /{resumoProducao.unidadePredominante}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-sm">
                  <div className="bg-[#20382A] p-3 rounded-xl border border-[#354A37]">
                    <p className="text-[#D8CEB8] text-xs font-medium">Faturamento previsto</p>
                    <p className="font-bold text-base sm:text-lg text-[#F5F0E6] mt-0.5">
                      {formatarMoeda(simulacao.faturamentoTotal)}
                    </p>
                  </div>
                  <div className="bg-[#20382A] p-3 rounded-xl border border-[#354A37]">
                    <p className="text-[#D8CEB8] text-xs font-medium">Acréscimo sobre o custo</p>
                    <p className="font-bold text-base sm:text-lg text-[#D9AD5B] mt-0.5">
                      +{formatarMoeda(simulacao.lucroTotal)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    id="btn-enviar-cotacao-whatsapp"
                    type="button"
                    onClick={onAbrirRelatorioWhatsapp}
                    className="flex-1 py-3.5 px-4 bg-[#C86F42] hover:bg-[#b86134] text-[#F5F0E6] font-bold text-base rounded-xl shadow-sm transition flex items-center justify-center gap-2 active:scale-[0.98] min-h-[52px]"
                  >
                    <span>📲 OFERECER NO WHATSAPP</span>
                  </button>
                  <button
                    id="btn-abrir-calculadora-completa"
                    type="button"
                    onClick={onAbrirCalculadoraLucros}
                    className="py-3.5 px-4 bg-[#20382A] hover:bg-[#354A37] text-[#D9AD5B] border border-[#354A37] font-bold text-sm sm:text-base rounded-xl transition flex items-center justify-center gap-1.5 min-h-[52px]"
                  >
                    <span>🧮 Simular Outros Valores</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#14251C] rounded-xl border border-[#354A37] text-sm text-[#D8CEB8]">
                Digite a quantidade acima para calcular a estimativa de faturamento com acréscimo.
              </div>
            )}

            {/* Aviso Obrigatório do Simulador (Requisito 4) */}
            <p className="text-xs sm:text-sm text-[#D8CEB8] bg-[#14251C] p-3.5 rounded-xl border border-[#354A37] leading-relaxed">
              <strong className="text-[#F5F0E6]">Nota:</strong> Esta é apenas uma simulação baseada nos dados registrados. O preço real de venda depende da negociação, do mercado e de outros custos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
