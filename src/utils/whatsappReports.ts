import { Safra, Gasto, Venda, Producao } from '../types';
import { formatarMoeda, formatarNumero, formatarDataAbreviada } from './formatters';
import { ResumoProducao, calcularCustoMedio } from './calculations';

export type TipoRelatorioWhatsApp = 'resumo' | 'detalhado' | 'cotacao' | 'oferta';

export type SituacaoOferta = 'disponivel_agora' | 'colhido_em_breve' | 'sob_consulta';

export interface OpcoesRelatorioWhatsApp {
  tipo: TipoRelatorioWhatsApp;
  incluirDetalhamentoGastos?: boolean;
  incluirUltimasVendas?: boolean;
  telefone?: string;
  // Campos da oferta estritamente preenchidos pelo usuário:
  produtoOferta?: string;
  quantidadeOferta?: number;
  unidadeOferta?: string;
  precoOferta?: number;
  localOferta?: string;
  situacaoOferta?: SituacaoOferta;
  observacaoOferta?: string;
  // Legado para compatibilidade:
  quantidadeCotacao?: number;
  precoUnitarioCotacao?: number;
  produtoCotacao?: string;
  compradorCotacao?: string;
}

function obterEmojiProduto(produto: string): string {
  const p = produto.toLowerCase();
  if (p.includes('manga')) return '🥭';
  if (p.includes('soja')) return '🌱';
  if (p.includes('café') || p.includes('cafe')) return '☕';
  if (p.includes('milho')) return '🌽';
  if (p.includes('banana')) return '🍌';
  if (p.includes('tomate')) return '🍅';
  if (p.includes('uva')) return '🍇';
  if (p.includes('maracujá') || p.includes('maracuja')) return '🍈';
  if (p.includes('feijão') || p.includes('feijao')) return '🫘';
  return '🌾';
}

/**
 * Gera o texto de uma oferta exclusivamente a partir dos dados informados pelo usuário.
 * Não inventa quantidade, preço, local, qualidade ou disponibilidade.
 */
export function gerarTextoOfertaWhatsApp(opcoes: {
  produto?: string;
  quantidade?: number;
  unidade?: string;
  preco?: number;
  local?: string;
  situacao?: SituacaoOferta;
  observacao?: string;
}): string {
  const produto = (opcoes.produto || '').trim();
  if (!produto) {
    return 'Selecione ou informe o produto que você quer oferecer.';
  }

  const emoji = obterEmojiProduto(produto);
  const linhas: string[] = [];

  linhas.push(`${emoji} *${produto}*`);
  linhas.push('');

  // Quantidade (apenas se informada e maior que zero)
  if (typeof opcoes.quantidade === 'number' && opcoes.quantidade > 0) {
    const un = (opcoes.unidade || 'kg').trim();
    linhas.push(`📦 *Quantidade:* ${formatarNumero(opcoes.quantidade)} ${un}`);
  }

  // Preço (apenas se informado e maior que zero)
  if (typeof opcoes.preco === 'number' && opcoes.preco > 0) {
    const un = (opcoes.unidade || 'kg').trim();
    linhas.push(`💰 *Valor:* ${formatarMoeda(opcoes.preco)}/${un}`);
  }

  // Local (apenas se informado)
  if (opcoes.local && opcoes.local.trim()) {
    linhas.push(`📍 *Local:* ${opcoes.local.trim()}`);
  }

  // Situação (apenas se selecionada pelo usuário)
  if (opcoes.situacao === 'disponivel_agora') {
    linhas.push(`⏳ *Situação:* Disponível agora`);
  } else if (opcoes.situacao === 'colhido_em_breve') {
    linhas.push(`⏳ *Situação:* Será colhido em breve`);
  } else if (opcoes.situacao === 'sob_consulta') {
    linhas.push(`⏳ *Situação:* Sob consulta`);
  }

  // Observação (apenas se informada)
  if (opcoes.observacao && opcoes.observacao.trim()) {
    linhas.push(`📝 *Observação:* ${opcoes.observacao.trim()}`);
  }

  linhas.push('');
  linhas.push('Entre em contato para mais informações.');
  linhas.push('');
  linhas.push('_Enviado via Minha Safra 🌱_');

  return linhas.join('\n');
}

/**
 * Gera o texto formatado para envio no WhatsApp com formatação nativa (*negrito*, quebras e emojis).
 */
export function gerarTextoRelatorioWhatsApp(
  safra: Safra | null,
  totalVendas: number,
  totalGastos: number,
  resultado: number,
  resumoProducao: ResumoProducao,
  gastos: Gasto[],
  vendas: Venda[],
  opcoes: OpcoesRelatorioWhatsApp
): string {
  const nomeSafra = safra?.nome || 'Safra Principal';
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const horaAgora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const custoMedio = calcularCustoMedio(totalGastos, resumoProducao.quantidadePredominante);

  // 1. Caso Oferta / Cotação Comercial
  if (opcoes.tipo === 'cotacao' || opcoes.tipo === 'oferta') {
    return gerarTextoOfertaWhatsApp({
      produto: opcoes.produtoOferta || opcoes.produtoCotacao,
      quantidade: opcoes.quantidadeOferta || opcoes.quantidadeCotacao,
      unidade: opcoes.unidadeOferta || resumoProducao.unidadePredominante,
      preco: opcoes.precoOferta || opcoes.precoUnitarioCotacao,
      local: opcoes.localOferta,
      situacao: opcoes.situacaoOferta,
      observacao: opcoes.observacaoOferta,
    });
  }

  // 2. Relatório de Desempenho (Resumo ou Detalhado)
  const isLucro = resultado > 0;
  const isPrejuizo = resultado < 0;
  const statusEmoji = isLucro ? '🟢' : isPrejuizo ? '🔴' : '⚪';
  const statusTexto = isLucro
    ? `LUCRO de ${formatarMoeda(resultado)}`
    : isPrejuizo
    ? `PREJUÍZO de ${formatarMoeda(Math.abs(resultado))}`
    : `SALDO ZERADO (${formatarMoeda(0)})`;

  const linhas: string[] = [
    `🌾 *MINHA SAFRA - RELATÓRIO DO CAMPO* 🌾`,
    `📍 *Safra:* ${nomeSafra}`,
    `📅 *Fechamento:* ${dataHoje} às ${horaAgora}`,
    `----------------------------------------`,
    `💰 *Total Vendido:* ${formatarMoeda(totalVendas)}`,
    `💸 *Total Gasto:* ${formatarMoeda(totalGastos)}`,
    `📊 *Resultado:* ${statusEmoji} *${statusTexto}*`,
  ];

  if (totalVendas > 0 && totalGastos > 0) {
    const percentualSobreVendas = Math.round((resultado / totalVendas) * 1000) / 10;
    linhas.push(`📈 *Resultado sobre vendas:* ${percentualSobreVendas >= 0 ? '+' : ''}${percentualSobreVendas}%`);
  }

  linhas.push(`----------------------------------------`);
  if (resumoProducao.quantidadePredominante > 0) {
    linhas.push(`📦 *Produção Registrada:* ${resumoProducao.resumoTexto}`);
  } else {
    linhas.push(`📦 *Produção Registrada:* Nenhuma colheita registrada.`);
  }

  if (custoMedio !== null && custoMedio > 0) {
    linhas.push(
      `⚖️ *Custo Médio:* ${formatarMoeda(custoMedio)} por ${resumoProducao.unidadePredominante}`
    );
  }

  // Detalhamento de Custos por Categoria (se detalhado ou habilitado)
  if (opcoes.tipo === 'detalhado' || opcoes.incluirDetalhamentoGastos) {
    linhas.push(`----------------------------------------`);
    linhas.push(`📋 *DISTRIBUIÇÃO DOS GASTOS:*`);

    if (gastos.length === 0) {
      linhas.push(`• Nenhum gasto registrado.`);
    } else {
      const somaPorCategoria: Record<string, number> = {};
      for (const g of gastos) {
        somaPorCategoria[g.categoria] = (somaPorCategoria[g.categoria] || 0) + g.valor;
      }

      const ordenados = Object.entries(somaPorCategoria).sort((a, b) => b[1] - a[1]);

      for (const [cat, val] of ordenados) {
        const perc = totalGastos > 0 ? Math.round((val / totalGastos) * 100) : 0;
        linhas.push(`• ${cat}: ${formatarMoeda(val)} (${perc}%)`);
      }
    }
  }

  // Últimas Vendas
  if ((opcoes.tipo === 'detalhado' || opcoes.incluirUltimasVendas) && vendas.length > 0) {
    linhas.push(`----------------------------------------`);
    linhas.push(`💰 *ÚLTIMAS VENDAS:*`);
    const ultimas = [...vendas]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 3);

    for (const v of ultimas) {
      const comp = v.comprador ? ` (${v.comprador})` : '';
      linhas.push(
        `• ${formatarDataAbreviada(v.data)}: ${v.quantidade} ${v.unidade} de ${v.produto} = ${formatarMoeda(v.valorTotal)}${comp}`
      );
    }
  }

  linhas.push(`----------------------------------------`);
  linhas.push(`🌱 _Minha Safra — Do campo à venda, tudo mais simples._`);

  return linhas.join('\n');
}

/**
 * Dispara a abertura do WhatsApp com o texto pronto.
 */
export function abrirWhatsApp(texto: string, telefone?: string): void {
  const textoCodificado = encodeURIComponent(texto);
  const telLimpo = telefone ? telefone.replace(/\D/g, '') : '';

  let url = '';
  if (telLimpo.length >= 10) {
    const comDdi = telLimpo.startsWith('55') ? telLimpo : `55${telLimpo}`;
    url = `https://api.whatsapp.com/send?phone=${comDdi}&text=${textoCodificado}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${textoCodificado}`;
  }

  try {
    const w = window.open(url, '_blank');
    if (!w || w.closed || typeof w.closed === 'undefined') {
      window.location.href = url;
    }
  } catch {
    window.location.href = url;
  }
}

/**
 * Copia o texto para a área de transferência com fallback
 */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    // Fallback
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copiado = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copiado;
  } catch {
    return false;
  }
}
