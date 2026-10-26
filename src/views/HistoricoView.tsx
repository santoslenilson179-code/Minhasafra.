import React, { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, Filter, Calendar, Clock } from 'lucide-react';
import { Gasto, Venda, Producao, Safra } from '../types';
import {
  formatarMoeda,
  formatarDataAbreviada,
  formatarNumero,
  formatarData,
  formatarHora,
  formatarDiaSemana,
  obterLabelCabecalhoData,
} from '../utils/formatters';

interface HistoricoViewProps {
  safraAtiva: Safra | null;
  gastos: Gasto[];
  vendas: Venda[];
  producoes: Producao[];
  onEditarGasto: (gasto: Gasto) => void;
  onExcluirGasto: (id: string) => void;
  onEditarVenda: (venda: Venda) => void;
  onExcluirVenda: (id: string) => void;
  onEditarProducao: (producao: Producao) => void;
  onExcluirProducao: (id: string) => void;
}

type FiltroHistorico = 'todos' | 'gastos' | 'vendas' | 'producao';

interface ItemHistoricoUnificado {
  id: string;
  tipo: 'gasto' | 'venda' | 'producao';
  data: string;
  hora?: string;
  createdAt: string;
  item: Gasto | Venda | Producao;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  safraAtiva,
  gastos,
  vendas,
  producoes,
  onEditarGasto,
  onExcluirGasto,
  onEditarVenda,
  onExcluirVenda,
  onEditarProducao,
  onExcluirProducao,
}) => {
  const [filtro, setFiltro] = useState<FiltroHistorico>('todos');
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    id: string;
    tipo: 'gasto' | 'venda' | 'producao';
    descricao: string;
  } | null>(null);

  // Unifica todos os lançamentos
  const todosItens: ItemHistoricoUnificado[] = [
    ...gastos.map(g => ({
      id: g.id,
      tipo: 'gasto' as const,
      data: g.data,
      hora: g.hora,
      createdAt: g.createdAt,
      item: g,
    })),
    ...vendas.map(v => ({
      id: v.id,
      tipo: 'venda' as const,
      data: v.data,
      hora: v.hora,
      createdAt: v.createdAt,
      item: v,
    })),
    ...producoes.map(p => ({
      id: p.id,
      tipo: 'producao' as const,
      data: p.data,
      hora: p.hora,
      createdAt: p.createdAt,
      item: p,
    })),
  ];

  // Ordena por data decrescente e hora decrescente (mais recente primeiro)
  todosItens.sort((a, b) => {
    if (a.data === b.data) {
      const horaA = a.hora || formatarHora(undefined, a.createdAt);
      const horaB = b.hora || formatarHora(undefined, b.createdAt);
      if (horaA !== horaB) {
        return horaB.localeCompare(horaA);
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }
    return b.data.localeCompare(a.data);
  });

  // Filtra de acordo com a aba selecionada
  const itensFiltrados = todosItens.filter(item => {
    if (filtro === 'gastos') return item.tipo === 'gasto';
    if (filtro === 'vendas') return item.tipo === 'venda';
    if (filtro === 'producao') return item.tipo === 'producao';
    return true;
  });

  // Agrupa por data com metadados de Dia da Semana e Formato Completo
  interface GrupoHistorico {
    data: string;
    diaSemana: string;
    diaSemanaCurto: string;
    dataFormatada: string;
    ehHoje: boolean;
    ehOntem: boolean;
    rotuloCompleto: string;
    itens: ItemHistoricoUnificado[];
  }

  const gruposPorData: GrupoHistorico[] = [];
  for (const item of itensFiltrados) {
    const ultimoGrupo = gruposPorData[gruposPorData.length - 1];
    if (ultimoGrupo && ultimoGrupo.data === item.data) {
      ultimoGrupo.itens.push(item);
    } else {
      const cabecalho = obterLabelCabecalhoData(item.data);
      gruposPorData.push({
        data: item.data,
        ...cabecalho,
        itens: [item],
      });
    }
  }

  const handleConfirmarExclusao = () => {
    if (!itemParaExcluir) return;
    if (itemParaExcluir.tipo === 'gasto') {
      onExcluirGasto(itemParaExcluir.id);
    } else if (itemParaExcluir.tipo === 'venda') {
      onExcluirVenda(itemParaExcluir.id);
    } else if (itemParaExcluir.tipo === 'producao') {
      onExcluirProducao(itemParaExcluir.id);
    }
    setItemParaExcluir(null);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-[#20382A] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#354A37] text-[#F5F0E6]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F0E6]">
              Histórico da Safra
            </h2>
            <p className="text-sm text-[#D8CEB8] mt-1 font-medium">
              Safra: <strong className="text-[#D9AD5B]">{safraAtiva?.nome || 'Principal'}</strong>
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-[#14251C] text-[#F5F0E6] border border-[#354A37] text-sm font-bold rounded-xl">
            {itensFiltrados.length} {itensFiltrados.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-[#14251C] border border-[#354A37] rounded-2xl mt-4">
          <button
            id="tab-filtro-todos"
            onClick={() => setFiltro('todos')}
            className={`py-2.5 rounded-xl text-sm font-bold transition min-h-[44px] ${
              filtro === 'todos'
                ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
            }`}
          >
            Todos
          </button>
          <button
            id="tab-filtro-gastos"
            onClick={() => setFiltro('gastos')}
            className={`py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1 min-h-[44px] ${
              filtro === 'gastos'
                ? 'bg-[#C86F42] text-[#F5F0E6] shadow-sm'
                : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
            }`}
          >
            <span>💸</span> Gastos
          </button>
          <button
            id="tab-filtro-vendas"
            onClick={() => setFiltro('vendas')}
            className={`py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1 min-h-[44px] ${
              filtro === 'vendas'
                ? 'bg-[#D9AD5B] text-[#14251C] shadow-sm'
                : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
            }`}
          >
            <span>💰</span> Vendas
          </button>
          <button
            id="tab-filtro-producao"
            onClick={() => setFiltro('producao')}
            className={`py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1 min-h-[44px] ${
              filtro === 'producao'
                ? 'bg-[#354A37] text-[#F5F0E6] shadow-sm'
                : 'text-[#D8CEB8] hover:text-[#F5F0E6]'
            }`}
          >
            <span>📦</span> Colheita
          </button>
        </div>
      </div>

      {/* Empty State */}
      {itensFiltrados.length === 0 && (
        <div className="text-center py-12 px-6 bg-[#20382A] rounded-3xl border border-[#354A37] text-[#F5F0E6]">
          <div className="w-16 h-16 bg-[#14251C] border border-[#354A37] rounded-2xl flex items-center justify-center mx-auto text-3xl mb-3 text-[#D9AD5B]">
            📑
          </div>
          <h3 className="font-bold text-[#F5F0E6] text-lg">Nenhum registro encontrado</h3>
          <p className="text-sm text-[#D8CEB8] mt-1.5 max-w-xs mx-auto">
            {filtro === 'todos'
              ? 'Você ainda não registrou nenhum gasto, venda ou colheita nesta safra.'
              : `Não há nenhum registro no filtro ${filtro}.`}
          </p>
        </div>
      )}

      {/* Grouped List by Date */}
      <div className="space-y-6">
        {gruposPorData.map(grupo => (
          <div key={grupo.data} className="space-y-3">
            {/* Date Header Badge com Dia da semana e Data Completa */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#14251C] border border-[#354A37] text-sm font-bold text-[#D9AD5B] shadow-xs">
                  <Calendar className="w-4 h-4 text-[#D9AD5B]" />
                  <span className="capitalize">{grupo.diaSemana}</span>
                  <span className="text-[#D8CEB8]/50">•</span>
                  <span className="text-[#F5F0E6]">{grupo.dataFormatada}</span>
                </span>

                {grupo.ehHoje && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/60 text-xs font-bold text-[#4ADE80] uppercase tracking-wide">
                    Hoje
                  </span>
                )}
                {grupo.ehOntem && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#D9AD5B]/20 border border-[#D9AD5B]/60 text-xs font-bold text-[#D9AD5B] uppercase tracking-wide">
                    Ontem
                  </span>
                )}
              </div>

              <span className="text-xs text-[#D8CEB8] font-bold bg-[#14251C] px-2.5 py-1 rounded-lg border border-[#354A37]">
                {grupo.itens.length} {grupo.itens.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {/* Item Cards */}
            <div className="space-y-3">
              {grupo.itens.map(entry => {
                if (entry.tipo === 'gasto') {
                  const gasto = entry.item as Gasto;
                  const horaFormatada = formatarHora(gasto.hora, gasto.createdAt);
                  const diaSemana = formatarDiaSemana(gasto.data);
                  const dataFormatada = formatarData(gasto.data);

                  return (
                    <div
                      key={gasto.id}
                      className="p-4 sm:p-5 bg-[#20382A] rounded-2xl border border-[#354A37] shadow-sm hover:border-[#C86F42]/60 transition text-[#F5F0E6] space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#C86F42]/50 text-[#C86F42] flex items-center justify-center text-2xl shrink-0 mt-0.5 shadow-xs">
                            💸
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-[#F5F0E6] text-base">
                                {gasto.categoria}
                              </p>
                              <span className="px-2 py-0.5 bg-[#14251C] border border-[#C86F42]/50 text-[#C86F42] text-xs font-bold rounded-md uppercase tracking-wider">
                                Despesa
                              </span>
                            </div>
                            <p className="text-sm text-[#D8CEB8] mt-1">
                              {gasto.descricao || 'Despesa registrada'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-[#F5F0E6] text-lg sm:text-xl">
                            -{formatarMoeda(gasto.valor)}
                          </span>

                          <div className="flex items-center gap-1 border-l border-[#354A37] pl-2">
                            <button
                              id={`btn-editar-gasto-${gasto.id}`}
                              onClick={() => onEditarGasto(gasto)}
                              className="w-10 h-10 flex items-center justify-center text-[#D8CEB8] hover:text-[#F5F0E6] hover:bg-[#14251C] rounded-xl transition"
                              title="Editar gasto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-excluir-gasto-${gasto.id}`}
                              onClick={() =>
                                setItemParaExcluir({
                                  id: gasto.id,
                                  tipo: 'gasto',
                                  descricao: `${gasto.categoria} (${formatarMoeda(gasto.valor)}) • ${diaSemana}, ${dataFormatada} às ${horaFormatada}`,
                                })
                              }
                              className="w-10 h-10 flex items-center justify-center text-[#D8CEB8] hover:text-[#EF4444] hover:bg-[#14251C] rounded-xl transition"
                              title="Excluir gasto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* DIA, DATA E HORA DA COMPRA NO SITE */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#354A37] text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D9AD5B] font-semibold">
                          <Calendar className="w-4 h-4 text-[#D9AD5B]" />
                          <span>Dia: <strong className="font-bold text-[#F5F0E6]">{diaSemana}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D8CEB8] font-medium">
                          <span>Data: <strong className="font-bold text-[#F5F0E6]">{dataFormatada}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D8CEB8] font-bold">
                          <Clock className="w-4 h-4 text-[#D8CEB8]" />
                          <span>Hora: <strong className="font-bold text-[#F5F0E6]">{horaFormatada}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (entry.tipo === 'venda') {
                  const venda = entry.item as Venda;
                  const horaFormatada = formatarHora(venda.hora, venda.createdAt);
                  const diaSemana = formatarDiaSemana(venda.data);
                  const dataFormatada = formatarData(venda.data);

                  return (
                    <div
                      key={venda.id}
                      className="p-4 sm:p-5 bg-[#20382A] rounded-2xl border border-[#354A37] shadow-sm hover:border-[#D9AD5B]/60 transition text-[#F5F0E6] space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#D9AD5B]/50 text-[#D9AD5B] flex items-center justify-center text-2xl shrink-0 mt-0.5 shadow-xs">
                            💰
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-[#F5F0E6] text-base">
                                Venda: {venda.produto}
                              </p>
                              <span className="px-2 py-0.5 bg-[#14251C] border border-[#D9AD5B]/50 text-[#D9AD5B] text-xs font-bold rounded-md uppercase tracking-wider">
                                Venda
                              </span>
                            </div>
                            <p className="text-sm text-[#D8CEB8] mt-1">
                              {formatarNumero(venda.quantidade)} {venda.unidade} a {formatarMoeda(venda.precoUnitario)}/{venda.unidade}
                              {venda.comprador ? ` • ${venda.comprador}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-[#D9AD5B] text-lg sm:text-xl">
                            +{formatarMoeda(venda.valorTotal)}
                          </span>

                          <div className="flex items-center gap-1 border-l border-[#354A37] pl-2">
                            <button
                              id={`btn-editar-venda-${venda.id}`}
                              onClick={() => onEditarVenda(venda)}
                              className="w-10 h-10 flex items-center justify-center text-[#D8CEB8] hover:text-[#F5F0E6] hover:bg-[#14251C] rounded-xl transition"
                              title="Editar venda"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-excluir-venda-${venda.id}`}
                              onClick={() =>
                                setItemParaExcluir({
                                  id: venda.id,
                                  tipo: 'venda',
                                  descricao: `Venda de ${venda.produto} (${formatarMoeda(venda.valorTotal)}) • ${diaSemana}, ${dataFormatada} às ${horaFormatada}`,
                                })
                              }
                              className="w-10 h-10 flex items-center justify-center text-[#D8CEB8] hover:text-[#EF4444] hover:bg-[#14251C] rounded-xl transition"
                              title="Excluir venda"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* DIA, DATA E HORA DA VENDA */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#354A37] text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D9AD5B] font-semibold">
                          <Calendar className="w-4 h-4 text-[#D9AD5B]" />
                          <span>Dia: <strong className="font-bold text-[#F5F0E6]">{diaSemana}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D8CEB8] font-medium">
                          <span>Data: <strong className="font-bold text-[#F5F0E6]">{dataFormatada}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D9AD5B] font-bold">
                          <Clock className="w-4 h-4 text-[#D9AD5B]" />
                          <span>Hora da venda: <strong className="font-bold text-[#F5F0E6]">{horaFormatada}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Produção
                const prod = entry.item as Producao;
                const horaFormatada = formatarHora(prod.hora, prod.createdAt);
                const diaSemana = formatarDiaSemana(prod.data);
                const dataFormatada = formatarData(prod.data);

                return (
                  <div
                    key={prod.id}
                    className="p-4 sm:p-5 bg-[#20382A] rounded-2xl border border-[#354A37] shadow-sm hover:border-[#D8CEB8]/50 transition text-[#F5F0E6] space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D8CEB8] flex items-center justify-center text-2xl shrink-0 mt-0.5 shadow-xs">
                          📦
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[#F5F0E6] text-base">
                              Colheita: {prod.produto}
                            </p>
                            <span className="px-2 py-0.5 bg-[#14251C] border border-[#354A37] text-[#D8CEB8] text-xs font-bold rounded-md uppercase tracking-wider">
                              Colheita
                            </span>
                          </div>
                          <p className="text-sm text-[#D8CEB8] mt-1">
                            Volume colhido na safra
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-[#F5F0E6] text-lg sm:text-xl">
                          {formatarNumero(prod.quantidade)} {prod.unidade}
                        </span>

                        <div className="flex items-center gap-1 border-l border-[#354A37] pl-2">
                          <button
                            id={`btn-editar-producao-${prod.id}`}
                            onClick={() => onEditarProducao(prod)}
                            className="w-10 h-10 flex items-center justify-center text-[#D8CEB8] hover:text-[#F5F0E6] hover:bg-[#14251C] rounded-xl transition"
                            title="Editar colheita"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-excluir-producao-${prod.id}`}
                            onClick={() =>
                              setItemParaExcluir({
                                id: prod.id,
                                tipo: 'producao',
                                descricao: `Colheita: ${prod.produto} (${prod.quantidade} ${prod.unidade}) • ${diaSemana}, ${dataFormatada} às ${horaFormatada}`,
                              })
                            }
                            className="w-10 h-10 flex items-center justify-center text-[#D8CEB8] hover:text-[#EF4444] hover:bg-[#14251C] rounded-xl transition"
                            title="Excluir colheita"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DIA, DATA E HORA DA COLHEITA */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#354A37] text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D9AD5B] font-semibold">
                        <Calendar className="w-4 h-4 text-[#D9AD5B]" />
                        <span>Dia: <strong className="font-bold text-[#F5F0E6]">{diaSemana}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D8CEB8] font-medium">
                        <span>Data: <strong className="font-bold text-[#F5F0E6]">{dataFormatada}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14251C] border border-[#354A37] text-[#D8CEB8] font-bold">
                        <Clock className="w-4 h-4 text-[#D8CEB8]" />
                        <span>Hora: <strong className="font-bold text-[#F5F0E6]">{horaFormatada}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal for Delete (Section 6 & 11) */}
      {itemParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#20382A] rounded-3xl p-6 shadow-2xl border-2 border-[#DC4C4C]/60 text-center space-y-4 text-[#F5F0E6]">
            <div className="w-16 h-16 rounded-2xl bg-[#14251C] border-2 border-[#DC4C4C]/60 text-[#EF4444] flex items-center justify-center mx-auto shadow-inner text-3xl">
              🗑️
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F0E6]">
                Excluir este registro?
              </h3>
              <p className="text-sm text-[#D8CEB8] mt-2 font-medium">
                Esta ação é definitiva e removerá este lançamento do saldo da safra.
              </p>
              <p className="text-sm text-[#F5F0E6] font-bold bg-[#14251C] border border-[#354A37] p-3 rounded-xl mt-3 leading-relaxed">
                {itemParaExcluir.descricao}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-cancelar-exclusao"
                onClick={() => setItemParaExcluir(null)}
                className="py-3.5 bg-[#14251C] text-[#F5F0E6] border border-[#354A37] rounded-xl font-bold text-base hover:bg-[#354A37] transition min-h-[52px]"
              >
                CANCELAR
              </button>
              <button
                id="btn-confirmar-exclusao"
                onClick={handleConfirmarExclusao}
                className="py-3.5 bg-[#DC4C4C] hover:bg-[#DC4C4C]/90 text-white rounded-xl font-bold text-base shadow-md transition flex items-center justify-center gap-1.5 min-h-[52px]"
              >
                <span>🗑️</span>
                <span>EXCLUIR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
