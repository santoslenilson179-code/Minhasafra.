export type CategoriaGasto =
  | 'Funcionários / Diárias'
  | 'Adubo'
  | 'Defensivos'
  | 'Combustível'
  | 'Irrigação'
  | 'Energia'
  | 'Transporte'
  | 'Embalagens'
  | 'Manutenção'
  | 'Máquinas'
  | 'Outros';

export type UnidadeMedida = 'kg' | 'caixa' | 'saca' | 'tonelada' | 'unidade';

export interface Safra {
  id: string;
  nome: string;
  produtoPrincipal: string;
  dataInicio: string; // YYYY-MM-DD
  ativa: boolean;
  createdAt: string;
}

export interface Gasto {
  id: string;
  safraId: string;
  categoria: CategoriaGasto;
  descricao?: string;
  valor: number;
  data: string; // YYYY-MM-DD
  hora?: string; // HH:mm
  createdAt: string;
}

export interface Venda {
  id: string;
  safraId: string;
  produto: string;
  quantidade: number;
  unidade: UnidadeMedida;
  precoUnitario: number;
  valorTotal: number;
  comprador?: string;
  data: string; // YYYY-MM-DD
  hora?: string; // HH:mm
  createdAt: string;
}

export interface Producao {
  id: string;
  safraId: string;
  produto: string;
  quantidade: number;
  unidade: UnidadeMedida;
  data: string; // YYYY-MM-DD
  hora?: string; // HH:mm
  createdAt: string;
}

export interface AppDataBackup {
  version: number;
  exportedAt: string;
  safras: Safra[];
  gastos: Gasto[];
  vendas: Venda[];
  producoes: Producao[];
  safraAtivaId: string | null;
}

export type TabType = 'inicio' | 'registros' | 'resultado' | 'historico' | 'mais';
export type TipoRegistro = 'gasto' | 'venda' | 'producao';
