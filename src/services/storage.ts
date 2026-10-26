import { Safra, Gasto, Venda, Producao, AppDataBackup } from '../types';
import { obterDataHojeISO } from '../utils/formatters';

const STORAGE_KEYS = {
  SAFRAS: 'minha_safra_safras_v1',
  SAFRA_ATIVA: 'minha_safra_ativa_id_v1',
  GASTOS: 'minha_safra_gastos_v1',
  VENDAS: 'minha_safra_vendas_v1',
  PRODUCOES: 'minha_safra_producoes_v1',
  ONBOARDING: 'minha_safra_onboarding_v1',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Camada de persistência local abstrata.
 * Facilita a migração para Supabase ou outra API na nuvem no futuro.
 */
export const StorageService = {
  // --- SAFRAS ---
  getSafras(): Safra[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAFRAS);
      if (!data) {
        // Inicializa com a primeira safra padrão, sem nenhum gasto/venda/produção fictício.
        const safraPadrao: Safra = {
          id: 'safra-inicial-1',
          nome: 'Safra Principal 2026',
          produtoPrincipal: 'Manga Palmer',
          dataInicio: obterDataHojeISO(),
          ativa: true,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.SAFRAS, JSON.stringify([safraPadrao]));
        localStorage.setItem(STORAGE_KEYS.SAFRA_ATIVA, safraPadrao.id);
        return [safraPadrao];
      }
      return JSON.parse(data) as Safra[];
    } catch (e) {
      console.error('Erro ao ler safras:', e);
      return [];
    }
  },

  getSafraAtivaId(): string | null {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.SAFRA_ATIVA);
      if (id) return id;
      const safras = this.getSafras();
      return safras[0]?.id || null;
    } catch {
      return null;
    }
  },

  setSafraAtivaId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAFRA_ATIVA, id);
      // Atualiza flag ativa nas safras
      const safras = this.getSafras();
      const updated = safras.map(s => ({
        ...s,
        ativa: s.id === id,
      }));
      localStorage.setItem(STORAGE_KEYS.SAFRAS, JSON.stringify(updated));
    } catch (e) {
      console.error('Erro ao definir safra ativa:', e);
    }
  },

  criarSafra(dados: Omit<Safra, 'id' | 'createdAt' | 'ativa'>): Safra {
    const novaSafra: Safra = {
      id: generateId(),
      ...dados,
      ativa: true,
      createdAt: new Date().toISOString(),
    };
    const safras = this.getSafras().map(s => ({ ...s, ativa: false }));
    const listaAtualizada = [novaSafra, ...safras];
    localStorage.setItem(STORAGE_KEYS.SAFRAS, JSON.stringify(listaAtualizada));
    localStorage.setItem(STORAGE_KEYS.SAFRA_ATIVA, novaSafra.id);
    return novaSafra;
  },

  atualizarSafra(id: string, updates: Partial<Safra>): Safra | null {
    const safras = this.getSafras();
    const index = safras.findIndex(s => s.id === id);
    if (index === -1) return null;

    safras[index] = { ...safras[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SAFRAS, JSON.stringify(safras));
    return safras[index];
  },

  excluirSafra(id: string): void {
    let safras = this.getSafras();
    safras = safras.filter(s => s.id !== id);

    // Também limpa registros vinculados
    const gastos = this.getGastos().filter(g => g.safraId !== id);
    const vendas = this.getVendas().filter(v => v.safraId !== id);
    const producoes = this.getProducoes().filter(p => p.safraId !== id);

    localStorage.setItem(STORAGE_KEYS.SAFRAS, JSON.stringify(safras));
    localStorage.setItem(STORAGE_KEYS.GASTOS, JSON.stringify(gastos));
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendas));
    localStorage.setItem(STORAGE_KEYS.PRODUCOES, JSON.stringify(producoes));

    // Se a safra ativa foi excluída, ativa a primeira que sobrou
    const safraAtivaId = this.getSafraAtivaId();
    if (safraAtivaId === id) {
      if (safras.length > 0) {
        this.setSafraAtivaId(safras[0].id);
      } else {
        // Cria uma nova se apagou todas
        this.criarSafra({
          nome: 'Nova Safra',
          produtoPrincipal: 'Manga Palmer',
          dataInicio: obterDataHojeISO(),
        });
      }
    }
  },

  // --- GASTOS ---
  getGastos(safraId?: string): Gasto[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GASTOS);
      const todos = data ? (JSON.parse(data) as Gasto[]) : [];
      if (!safraId) return todos;
      return todos.filter(g => g.safraId === safraId);
    } catch {
      return [];
    }
  },

  adicionarGasto(dados: Omit<Gasto, 'id' | 'createdAt'>): Gasto {
    const novoGasto: Gasto = {
      id: generateId(),
      ...dados,
      createdAt: new Date().toISOString(),
    };
    const lista = this.getGastos();
    const atualizada = [novoGasto, ...lista];
    localStorage.setItem(STORAGE_KEYS.GASTOS, JSON.stringify(atualizada));
    return novoGasto;
  },

  atualizarGasto(id: string, updates: Partial<Gasto>): Gasto | null {
    const lista = this.getGastos();
    const idx = lista.findIndex(g => g.id === id);
    if (idx === -1) return null;
    lista[idx] = { ...lista[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.GASTOS, JSON.stringify(lista));
    return lista[idx];
  },

  excluirGasto(id: string): void {
    const lista = this.getGastos().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GASTOS, JSON.stringify(lista));
  },

  // --- VENDAS ---
  getVendas(safraId?: string): Venda[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VENDAS);
      const todas = data ? (JSON.parse(data) as Venda[]) : [];
      if (!safraId) return todas;
      return todas.filter(v => v.safraId === safraId);
    } catch {
      return [];
    }
  },

  adicionarVenda(dados: Omit<Venda, 'id' | 'createdAt'>): Venda {
    const novaVenda: Venda = {
      id: generateId(),
      ...dados,
      createdAt: new Date().toISOString(),
    };
    const lista = this.getVendas();
    const atualizada = [novaVenda, ...lista];
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(atualizada));
    return novaVenda;
  },

  atualizarVenda(id: string, updates: Partial<Venda>): Venda | null {
    const lista = this.getVendas();
    const idx = lista.findIndex(v => v.id === id);
    if (idx === -1) return null;
    lista[idx] = { ...lista[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(lista));
    return lista[idx];
  },

  excluirVenda(id: string): void {
    const lista = this.getVendas().filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(lista));
  },

  // --- PRODUÇÃO ---
  getProducoes(safraId?: string): Producao[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCOES);
      const todas = data ? (JSON.parse(data) as Producao[]) : [];
      if (!safraId) return todas;
      return todas.filter(p => p.safraId === safraId);
    } catch {
      return [];
    }
  },

  adicionarProducao(dados: Omit<Producao, 'id' | 'createdAt'>): Producao {
    const novaProducao: Producao = {
      id: generateId(),
      ...dados,
      createdAt: new Date().toISOString(),
    };
    const lista = this.getProducoes();
    const atualizada = [novaProducao, ...lista];
    localStorage.setItem(STORAGE_KEYS.PRODUCOES, JSON.stringify(atualizada));
    return novaProducao;
  },

  atualizarProducao(id: string, updates: Partial<Producao>): Producao | null {
    const lista = this.getProducoes();
    const idx = lista.findIndex(p => p.id === id);
    if (idx === -1) return null;
    lista[idx] = { ...lista[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.PRODUCOES, JSON.stringify(lista));
    return lista[idx];
  },

  excluirProducao(id: string): void {
    const lista = this.getProducoes().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCOES, JSON.stringify(lista));
  },

  // --- BACKUP & RESTORE ---
  exportarBackup(): string {
    const backup: AppDataBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      safras: this.getSafras(),
      safraAtivaId: this.getSafraAtivaId(),
      gastos: this.getGastos(),
      vendas: this.getVendas(),
      producoes: this.getProducoes(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importarBackup(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr) as AppDataBackup;
      if (!parsed || !Array.isArray(parsed.safras)) {
        return { success: false, message: 'Arquivo de backup inválido ou corrompido.' };
      }

      localStorage.setItem(STORAGE_KEYS.SAFRAS, JSON.stringify(parsed.safras || []));
      localStorage.setItem(STORAGE_KEYS.GASTOS, JSON.stringify(parsed.gastos || []));
      localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(parsed.vendas || []));
      localStorage.setItem(STORAGE_KEYS.PRODUCOES, JSON.stringify(parsed.producoes || []));
      if (parsed.safraAtivaId) {
        localStorage.setItem(STORAGE_KEYS.SAFRA_ATIVA, parsed.safraAtivaId);
      } else if (parsed.safras.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SAFRA_ATIVA, parsed.safras[0].id);
      }

      return { success: true, message: 'Backup restaurado com sucesso!' };
    } catch (e) {
      return { success: false, message: 'Erro ao processar arquivo de backup.' };
    }
  },

  apagarTodosOsDados(): void {
    localStorage.removeItem(STORAGE_KEYS.SAFRAS);
    localStorage.removeItem(STORAGE_KEYS.SAFRA_ATIVA);
    localStorage.removeItem(STORAGE_KEYS.GASTOS);
    localStorage.removeItem(STORAGE_KEYS.VENDAS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCOES);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
  },

  getOnboardingConcluido(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
  },

  setOnboardingConcluido(concluido: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, concluido ? 'true' : 'false');
  },
};
