/**
 * Brazilian formatters for currency, dates, and numbers
 */

export function formatarMoeda(valor: number): string {
  if (isNaN(valor) || valor === null || valor === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatarNumero(valor: number, decimais: number = 2): string {
  if (isNaN(valor) || valor === null || valor === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: Number.isInteger(valor) ? 0 : Math.min(decimais, 2),
    maximumFractionDigits: decimais,
  }).format(valor);
}

export function formatarData(dataStr: string): string {
  if (!dataStr) return '';
  try {
    // Expected YYYY-MM-DD
    const parts = dataStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dataStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
  } catch {
    // fallback
  }
  return dataStr;
}

export function formatarDataAbreviada(dataStr: string): string {
  if (!dataStr) return '';
  const meses = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
  ];
  try {
    const parts = dataStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${meses[monthIdx]}`;
      }
    }
  } catch {
    // fallback
  }
  return dataStr;
}

export function obterDataHojeISO(): string {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, '0');
  const d = String(hoje.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function obterHoraAtual(): string {
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, '0');
  const m = String(agora.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatarHora(hora?: string, createdAt?: string): string {
  if (hora && typeof hora === 'string' && hora.trim().length >= 4) {
    return hora.trim().substring(0, 5);
  }
  if (createdAt) {
    try {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
      }
    } catch {
      // fallback
    }
  }
  return '12:00';
}

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const DIAS_SEMANA_CURTOS = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
];

function parseDataLocal(dataStr: string): Date | null {
  if (!dataStr) return null;
  const parts = dataStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d, 12, 0, 0);
    }
  }
  const d = new Date(dataStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatarDiaSemana(dataStr: string): string {
  const d = parseDataLocal(dataStr);
  if (!d) return '';
  return DIAS_SEMANA[d.getDay()] || '';
}

export function formatarDiaSemanaCurto(dataStr: string): string {
  const d = parseDataLocal(dataStr);
  if (!d) return '';
  return DIAS_SEMANA_CURTOS[d.getDay()] || '';
}

export function obterLabelCabecalhoData(dataStr: string): {
  diaSemana: string;
  diaSemanaCurto: string;
  dataFormatada: string;
  ehHoje: boolean;
  ehOntem: boolean;
  rotuloCompleto: string;
} {
  const dataFormatada = formatarData(dataStr);
  const diaSemana = formatarDiaSemana(dataStr);
  const diaSemanaCurto = formatarDiaSemanaCurto(dataStr);

  const hojeISO = obterDataHojeISO();
  const ehHoje = dataStr === hojeISO;

  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const y = ontem.getFullYear();
  const m = String(ontem.getMonth() + 1).padStart(2, '0');
  const d = String(ontem.getDate()).padStart(2, '0');
  const ontemISO = `${y}-${m}-${d}`;
  const ehOntem = dataStr === ontemISO;

  let rotuloCompleto = `${diaSemana}, ${dataFormatada}`;
  if (ehHoje) {
    rotuloCompleto = `Hoje • ${diaSemana}, ${dataFormatada}`;
  } else if (ehOntem) {
    rotuloCompleto = `Ontem • ${diaSemana}, ${dataFormatada}`;
  }

  return {
    diaSemana,
    diaSemanaCurto,
    dataFormatada,
    ehHoje,
    ehOntem,
    rotuloCompleto,
  };
}

export function parseValorMoeda(str: string): number {
  if (!str) return 0;
  // Cleans formatting, handles both "1250,50" and "1.250,50"
  const limpo = str.replace(/[^\d.,]/g, '').trim();
  if (!limpo) return 0;

  // If both . and , exist, . is thousands and , is decimal
  if (limpo.includes('.') && limpo.includes(',')) {
    return parseFloat(limpo.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // If only comma exists
  if (limpo.includes(',')) {
    return parseFloat(limpo.replace(',', '.')) || 0;
  }
  // Standard float
  return parseFloat(limpo) || 0;
}
