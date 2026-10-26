import React from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { Safra, Gasto, Venda, Producao } from '../types';
import { formatarMoeda, formatarData, formatarHora, formatarDiaSemanaCurto } from '../utils/formatters';
import { ResumoProducao } from '../utils/calculations';

interface HomeViewProps {
  safraAtiva: Safra | null;
  totalVendas: number;
  totalGastos: number;
  resultado: number;
  resumoProducao: ResumoProducao;
  ultimosGastos: Gasto[];
  ultimasVendas: Venda[];
  ultimasProducoes: Producao[];
  onOpenGastei: () => void;
  onOpenVendi: () => void;
  onOpenProduzi: () => void;
  onGoToResultado: () => void;
  onGoToHistorico: () => void;
  onOpenSafras: () => void;
  onOpenRelatorioWhatsapp: () => void;
  onOpenCalculadoraLucros: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  safraAtiva,
  totalVendas,
  totalGastos,
  resultado,
  resumoProducao,
  ultimosGastos,
  ultimasVendas,
  ultimasProducoes,
  onOpenGastei,
  onOpenVendi,
  onOpenProduzi,
  onGoToResultado,
  onGoToHistorico,
  onOpenSafras,
  onOpenRelatorioWhatsapp,
  onOpenCalculadoraLucros,
}) => {
  const isPositivo = resultado > 0;
  const isNegativo = resultado < 0;

  // Unificar lançamentos recentes em uma única lista cronológica
  const lancamentosRecentes = React.useMemo(() => {
    type ItemRecente = {
      id: string;
      tipo: 'venda' | 'gasto' | 'producao';
      titulo: string;
      detalhe: string;
      valorTexto: string;
      valorClasse: string;
      icone: string;
      data: string;
      hora: string;
      createdAt: string;
    };

    const lista: ItemRecente[] = [];

        ultimasVendas.forEach(v => {
      lista.push({
        id: v.id,
        tipo: 'venda',
        titulo: `Venda: ${v.produto}`,
        detalhe: `${v.quantidade} ${v.unidade}`,
        valorTexto: `+${formatarMoeda(v.valorTotal)}`,
        valorClasse: 'text-[#D9AD5B]',
        icone: '💰',
        data: v.data,
        hora: formatarHora(v.hora, v.createdAt),
        createdAt: v.createdAt || v.data,
      });
    });

    ultimosGastos.forEach(g => {
      lista.push({
        id: g.id,
        tipo: 'gasto',
        titulo: g.categoria,
        detalhe: g.descricao || 'Compra / Despesa',
        valorTexto: `-${formatarMoeda(g.valor)}`,
        valorClasse: 'text-[#F5F0E6]',
        icone: '💸',
        data: g.data,
        hora: formatarHora(g.hora, g.createdAt),
        createdAt: g.createdAt || g.data,
      });
    });

    ultimasProducoes.forEach(p => {
      lista.push({
        id: p.id,
        tipo: 'producao',
        titulo: `Colheita: ${p.produto}`,
        detalhe: 'Produção colhida',
        valorTexto: `${p.quantidade} ${p.unidade}`,
        valorClasse: 'text-[#D8CEB8]',
        icone: '📦',
        data: p.data,
        hora: formatarHora(p.hora, p.createdAt),
        createdAt: p.createdAt || p.data,
      });
    });

    // Ordena do mais recente para o mais antigo
    return lista.sort((a, b) => {
      const cmpData = b.data.localeCompare(a.data);
      if (cmpData !== 0) return cmpData;
      const cmpHora = (b.hora || '').localeCompare(a.hora || '');
      if (cmpHora !== 0) return cmpHora;
      return b.createdAt.localeCompare(a.createdAt);
    }).slice(0, 4);
  }, [ultimasVendas, ultimosGastos, ultimasProducoes]);

  return (
    <div className="space-y-4 pb-6">
      {/* CARD PRINCIPAL DO DINHEIRO / LUCRO DA SAFRA */}
      <div className="bg-[#20382A] text-[#F5F0E6] p-5 sm:p-6 rounded-3xl shadow-md border-2 border-[#354A37]">
        {/* Safra ativa e indicador */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={onOpenSafras}
            className="text-sm bg-[#14251C] hover:bg-[#354A37] text-[#D9AD5B] border border-[#354A37] px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 font-bold"
          >
            <span>🌾 {safraAtiva?.nome || 'Safra Atual'}</span>
            <ChevronRight className="w-4 h-4 text-[#D8CEB8]" />
          </button>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold ${
              isPositivo
                ? 'bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/40'
                : isNegativo
                ? 'bg-[#DC4C4C]/20 text-[#EF4444] border border-[#DC4C4C]/40'
                : 'bg-[#14251C] text-[#D8CEB8] border border-[#354A37]'
            }`}
          >
            {isPositivo ? (
              <>
                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                <span>✓ Lucro positivo</span>
              </>
            ) : isNegativo ? (
              <>
                <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                <span>⚠️ Prejuízo</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-[#D8CEB8]" />
                <span>Zerado</span>
              </>
            )}
          </div>
        </div>

        {/* Lucro ou Saldo em destaque grande */}
        <div className="text-center py-3">
          <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#D8CEB8]">
            {isPositivo ? 'Lucro no Bolso' : isNegativo ? 'Prejuízo na Safra' : 'Saldo Atual'}
          </p>
          <h2
            className={`text-3xl sm:text-4xl font-bold tracking-tight mt-1.5 ${
              isPositivo
                ? 'text-[#D9AD5B]'
                : isNegativo
                ? 'text-[#EF4444]'
                : 'text-[#F5F0E6]'
            }`}
          >
            {formatarMoeda(resultado)}
          </h2>
        </div>

        {/* Entrou vs Saiu - 2 Caixas simples */}
        <div className="grid grid-cols-2 gap-3 mt-3 pt-4 border-t border-[#354A37]">
          <div className="bg-[#14251C] p-3.5 rounded-2xl border border-[#354A37] text-center">
            <span className="text-xs sm:text-sm font-bold text-[#D8CEB8] block mb-0.5">
              💰 VENDAS (ENTROU)
            </span>
            <span className="text-lg sm:text-xl font-bold text-[#D9AD5B]">
              {formatarMoeda(totalVendas)}
            </span>
          </div>

          <div className="bg-[#14251C] p-3.5 rounded-2xl border border-[#354A37] text-center">
            <span className="text-xs sm:text-sm font-bold text-[#D8CEB8] block mb-0.5">
              💸 GASTOS (SAIU)
            </span>
            <span className="text-lg sm:text-xl font-bold text-[#F5F0E6]">
              {formatarMoeda(totalGastos)}
            </span>
          </div>
        </div>
      </div>

      {/* OS DOIS BOTÕES PRINCIPAIS DE LANÇAMENTO (SIMPLES, GRANDES E DIRETOS) */}
      <div className="grid grid-cols-2 gap-3">
        {/* BOTAO VENDI */}
        <button
          id="btn-home-vendi"
          onClick={onOpenVendi}
          className="flex flex-col items-center justify-center p-4 bg-[#20382A] border-2 border-[#D9AD5B] hover:bg-[#354A37]/70 active:scale-[0.98] rounded-3xl shadow-sm transition group min-h-[104px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#D9AD5B] text-[#D9AD5B] flex items-center justify-center text-2xl mb-1.5 group-hover:scale-105 transition shadow-inner">
            💰
          </div>
          <span className="font-bold text-[#D9AD5B] text-lg leading-tight">
            + VENDI
          </span>
          <span className="text-sm font-medium text-[#D8CEB8] mt-0.5">
            Entrou dinheiro
          </span>
        </button>

        {/* BOTAO GASTEI */}
        <button
          id="btn-home-gastei"
          onClick={onOpenGastei}
          className="flex flex-col items-center justify-center p-4 bg-[#20382A] border-2 border-[#C86F42] hover:bg-[#354A37]/70 active:scale-[0.98] rounded-3xl shadow-sm transition group min-h-[104px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#C86F42] text-[#C86F42] flex items-center justify-center text-2xl mb-1.5 group-hover:scale-105 transition shadow-inner">
            💸
          </div>
          <span className="font-bold text-[#C86F42] text-lg leading-tight">
            - GASTEI
          </span>
          <span className="text-sm font-medium text-[#D8CEB8] mt-0.5">
            Comprei / Despesa
          </span>
        </button>
      </div>

      {/* FERRAMENTAS RÁPIDAS (WHATSAPP, CALCULADORA E COLHEITA) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* WhatsApp */}
        <button
          id="btn-home-relatorio-whatsapp"
          onClick={onOpenRelatorioWhatsapp}
          className="flex flex-col items-center justify-center p-3 bg-[#20382A] border border-[#354A37] hover:border-[#22C55E] rounded-2xl transition active:scale-[0.98] min-h-[72px]"
        >
          <span className="text-2xl mb-1">📲</span>
          <span className="font-bold text-[#F5F0E6] text-sm leading-tight">WhatsApp</span>
          <span className="text-xs text-[#22C55E] font-bold mt-0.5">Relatório</span>
        </button>

        {/* Calculadora */}
        <button
          id="btn-home-calculadora-lucros"
          onClick={onOpenCalculadoraLucros}
          className="flex flex-col items-center justify-center p-3 bg-[#20382A] border border-[#354A37] hover:border-[#D9AD5B] rounded-2xl transition active:scale-[0.98] min-h-[72px]"
        >
          <span className="text-2xl mb-1">🧮</span>
          <span className="font-bold text-[#F5F0E6] text-sm leading-tight">Calculadora</span>
          <span className="text-xs text-[#D9AD5B] font-bold mt-0.5">Simular lucro</span>
        </button>

        {/* Produção / Colheita */}
        <button
          id="btn-home-produzi"
          onClick={onOpenProduzi}
          className="flex flex-col items-center justify-center p-3 bg-[#20382A] border border-[#354A37] hover:border-[#D8CEB8] rounded-2xl transition active:scale-[0.98] min-h-[72px]"
        >
          <span className="text-2xl mb-1">📦</span>
          <span className="font-bold text-[#F5F0E6] text-sm leading-tight">Colheita</span>
          <span className="text-xs text-[#D8CEB8] font-medium mt-0.5 truncate max-w-[90px]">
            {resumoProducao.quantidadePredominante > 0 ? `${resumoProducao.quantidadePredominante} ${resumoProducao.unidadePredominante}` : 'Registrar'}
          </span>
        </button>
      </div>

      {/* ÚLTIMOS LANÇAMENTOS COM DIA, DATA E HORA */}
      <div className="bg-[#20382A] rounded-3xl p-5 shadow-sm border border-[#354A37] space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-lg font-bold text-[#F5F0E6]">
            Últimos Lançamentos
          </h3>
          <button
            onClick={onGoToHistorico}
            className="text-sm text-[#D9AD5B] font-bold hover:underline flex items-center gap-1"
          >
            <span>Ver tudo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {lancamentosRecentes.length === 0 ? (
          <div className="text-center py-7 px-4 bg-[#14251C] rounded-2xl border border-dashed border-[#354A37]">
            <p className="text-[#F5F0E6] text-base font-semibold">
              Nenhum lançamento nesta safra ainda.
            </p>
            <p className="text-sm text-[#D8CEB8] mt-1.5">
              Toque em <strong className="text-[#D9AD5B]">+ VENDI</strong> ou <strong className="text-[#C86F42]">- GASTEI</strong> acima para começar!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lancamentosRecentes.map(item => {
              const dia = formatarDiaSemanaCurto(item.data);
              const dataFmt = formatarData(item.data);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14251C] border border-[#354A37] text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#20382A] border border-[#354A37] flex items-center justify-center text-lg shrink-0">
                      {item.icone}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#F5F0E6] text-base truncate">
                        {item.titulo}
                      </p>
                      <p className="text-xs sm:text-sm text-[#D8CEB8] truncate">
                        {dia}, {dataFmt} às <strong className="text-[#F5F0E6] font-semibold">{item.hora}</strong>
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-base sm:text-lg shrink-0 pl-3 ${item.valorClasse}`}>
                    {item.valorTexto}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
