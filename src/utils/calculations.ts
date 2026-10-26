import { Gasto, Venda, Producao } from '../types';

/**
 * Funções financeiras e operacionais centralizadas para a safra.
 */

export function calcularTotalGastos(gastos: Gasto[]): number {
  if (!Array.isArray(gastos)) return 0;
  const total = gastos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  return Math.round(total * 100) / 100;
}

export function calcularTotalVendas(vendas: Venda[]): number {
  if (!Array.isArray(vendas)) return 0;
  const total = vendas.reduce((acc, curr) => acc + (Number(curr.valorTotal) || 0), 0);
  return Math.round(total * 100) / 100;
}

export function calcularResultado(totalVendas: number, totalGastos: number): number {
  const res = (totalVendas || 0) - (totalGastos || 0);
  return Math.round(res * 100) / 100;
}

export interface ResumoProducao {
  totalGeral: number;
  porUnidade: Record<string, number>;
  resumoTexto: string;
  unidadePredominante: string;
  quantidadePredominante: number;
}

export function calcularTotalProducao(producoes: Producao[]): ResumoProducao {
  if (!Array.isArray(producoes) || producoes.length === 0) {
    return {
      totalGeral: 0,
      porUnidade: {},
      resumoTexto: '0 kg',
      unidadePredominante: 'kg',
      quantidadePredominante: 0,
    };
  }

  const porUnidade: Record<string, number> = {};
  let totalSoma = 0;

  for (const p of producoes) {
    const qtd = Number(p.quantidade) || 0;
    const unit = p.unidade || 'kg';
    porUnidade[unit] = (porUnidade[unit] || 0) + qtd;
    totalSoma += qtd;
  }

  // Find predominant unit
  let maxQtd = 0;
  let topUnit = 'kg';
  for (const [unit, qtd] of Object.entries(porUnidade)) {
    if (qtd > maxQtd) {
      maxQtd = qtd;
      topUnit = unit;
    }
  }

  // Format friendly text
  const parts = Object.entries(porUnidade)
    .filter(([_, qtd]) => qtd > 0)
    .map(([unit, qtd]) => {
      const formattedQtd = new Intl.NumberFormat('pt-BR', {
        maximumFractionDigits: 1,
      }).format(qtd);
      return `${formattedQtd} ${unit}`;
    });

  return {
    totalGeral: totalSoma,
    porUnidade,
    resumoTexto: parts.join(' + ') || '0 kg',
    unidadePredominante: topUnit,
    quantidadePredominante: maxQtd,
  };
}

/**
 * Custo Médio Unitário = Gastos Totais / Quantidade Produzida
 * Retorna null se não houver gastos (>0) ou produção (>0), evitando valores inventados.
 */
export function calcularCustoMedio(totalGastos: number, quantidadeProduzida: number): number | null {
  if (
    typeof totalGastos !== 'number' ||
    typeof quantidadeProduzida !== 'number' ||
    isNaN(totalGastos) ||
    isNaN(quantidadeProduzida) ||
    totalGastos <= 0 ||
    quantidadeProduzida <= 0
  ) {
    return null;
  }
  const custo = totalGastos / quantidadeProduzida;
  return Math.round(custo * 100) / 100;
}

export interface SimulacaoResultado {
  precoUnitarioSugerido: number;
  faturamentoTotal: number;
  lucroTotal: number;
  custoTotalCalculado: number;
  percentualAcrescimo: number;
}

/**
 * Simula o preço de venda adicionando um percentual de acréscimo sobre o custo unitário real.
 * Fórmula: Preço = Custo * (1 + percentualAcrescimo / 100)
 * Retorna null se custo unitário ou quantidade não forem válidos (> 0).
 */
export function calcularSimulacaoVenda(
  custoUnitario: number | null | undefined,
  quantidadePretendida: number,
  percentualAcrescimo: number
): SimulacaoResultado | null {
  if (
    custoUnitario === null ||
    custoUnitario === undefined ||
    typeof custoUnitario !== 'number' ||
    isNaN(custoUnitario) ||
    custoUnitario <= 0 ||
    quantidadePretendida <= 0 ||
    percentualAcrescimo < 0
  ) {
    return null;
  }

  const fator = 1 + (percentualAcrescimo / 100);
  const precoUnitarioSugerido = Math.round(custoUnitario * fator * 100) / 100;
  const faturamentoTotal = Math.round(precoUnitarioSugerido * quantidadePretendida * 100) / 100;
  const custoTotalCalculado = Math.round(custoUnitario * quantidadePretendida * 100) / 100;
  const lucroTotal = Math.round((faturamentoTotal - custoTotalCalculado) * 100) / 100;

  return {
    precoUnitarioSugerido,
    faturamentoTotal,
    lucroTotal,
    custoTotalCalculado,
    percentualAcrescimo,
  };
}

/**
 * Ponto de equilíbrio: estimativa de quanto precisa vender para cobrir os custos considerados.
 * Fórmula: Quantidade = Custos Totais / Preço Unitário
 */
export function calcularPontoEquilibrio(custosTotais: number, precoUnitario: number): number | null {
  if (custosTotais <= 0 || precoUnitario <= 0) return null;
  return Math.ceil((custosTotais / precoUnitario) * 100) / 100;
}
