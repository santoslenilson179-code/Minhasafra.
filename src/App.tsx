/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TabType, Safra, Gasto, Venda, Producao } from './types';
import { StorageService } from './services/storage';
import {
  calcularTotalGastos,
  calcularTotalVendas,
  calcularResultado,
  calcularTotalProducao,
} from './utils/calculations';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RegistroGastoModal } from './components/RegistroGastoModal';
import { RegistroVendaModal } from './components/RegistroVendaModal';
import { RegistroProducaoModal } from './components/RegistroProducaoModal';
import { SafrasModal } from './components/SafrasModal';
import { OnboardingModal } from './components/OnboardingModal';
import { RelatorioWhatsappModal } from './components/RelatorioWhatsappModal';
import { CalculadoraLucroModal } from './components/CalculadoraLucroModal';
import { HomeView } from './views/HomeView';
import { RegistrosView } from './views/RegistrosView';
import { ResultadoView } from './views/ResultadoView';
import { HistoricoView } from './views/HistoricoView';
import { MaisView } from './views/MaisView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [safras, setSafras] = useState<Safra[]>([]);
  const [safraAtivaId, setSafraAtivaId] = useState<string | null>(null);

  // Dados brutos de todos os lançamentos
  const [todosGastos, setTodosGastos] = useState<Gasto[]>([]);
  const [todasVendas, setTodasVendas] = useState<Venda[]>([]);
  const [todasProducoes, setTodasProducoes] = useState<Producao[]>([]);

  // Estados dos Modais
  const [modalGastoAberto, setModalGastoAberto] = useState(false);
  const [gastoParaEditar, setGastoParaEditar] = useState<Gasto | null>(null);

  const [modalVendaAberto, setModalVendaAberto] = useState(false);
  const [vendaParaEditar, setVendaParaEditar] = useState<Venda | null>(null);

  const [modalProducaoAberto, setModalProducaoAberto] = useState(false);
  const [producaoParaEditar, setProducaoParaEditar] = useState<Producao | null>(null);

  const [modalSafrasAberto, setModalSafrasAberto] = useState(false);
  const [modalOnboardingAberto, setModalOnboardingAberto] = useState(false);
  const [modalWhatsappAberto, setModalWhatsappAberto] = useState(false);
  const [modalCalculadoraAberto, setModalCalculadoraAberto] = useState(false);

  // Carregar dados iniciais do Storage
  const carregarDados = useCallback(() => {
    const s = StorageService.getSafras();
    const ativaId = StorageService.getSafraAtivaId();
    setSafras(s);
    setSafraAtivaId(ativaId);

    setTodosGastos(StorageService.getGastos());
    setTodasVendas(StorageService.getVendas());
    setTodasProducoes(StorageService.getProducoes());

    // Verifica se é primeiro acesso para onboarding
    const onboardingFeito = StorageService.getOnboardingConcluido();
    if (!onboardingFeito) {
      setModalOnboardingAberto(true);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Safra ativa atual
  const safraAtiva = useMemo(() => {
    return safras.find(s => s.id === safraAtivaId) || safras[0] || null;
  }, [safras, safraAtivaId]);

  // Registros vinculados à safra ativa atual
  const gastosSafra = useMemo(() => {
    if (!safraAtiva) return [];
    return todosGastos.filter(g => g.safraId === safraAtiva.id);
  }, [todosGastos, safraAtiva]);

  const vendasSafra = useMemo(() => {
    if (!safraAtiva) return [];
    return todasVendas.filter(v => v.safraId === safraAtiva.id);
  }, [todasVendas, safraAtiva]);

  const producoesSafra = useMemo(() => {
    if (!safraAtiva) return [];
    return todasProducoes.filter(p => p.safraId === safraAtiva.id);
  }, [todasProducoes, safraAtiva]);

  // Cálculos financeiros centralizados
  const totalGastos = useMemo(() => calcularTotalGastos(gastosSafra), [gastosSafra]);
  const totalVendas = useMemo(() => calcularTotalVendas(vendasSafra), [vendasSafra]);
  const resultado = useMemo(
    () => calcularResultado(totalVendas, totalGastos),
    [totalVendas, totalGastos]
  );
  const resumoProducao = useMemo(
    () => calcularTotalProducao(producoesSafra),
    [producoesSafra]
  );

  // --- HANDLERS: GASTOS ---
  const handleSalvarGasto = (dados: Omit<Gasto, 'id' | 'createdAt'>, idParaEditar?: string) => {
    if (idParaEditar) {
      StorageService.atualizarGasto(idParaEditar, dados);
    } else {
      StorageService.adicionarGasto(dados);
    }
    setTodosGastos(StorageService.getGastos());
  };

  const handleExcluirGasto = (id: string) => {
    StorageService.excluirGasto(id);
    setTodosGastos(StorageService.getGastos());
  };

  const handleAbrirEditarGasto = (gasto: Gasto) => {
    setGastoParaEditar(gasto);
    setModalGastoAberto(true);
  };

  // --- HANDLERS: VENDAS ---
  const handleSalvarVenda = (dados: Omit<Venda, 'id' | 'createdAt'>, idParaEditar?: string) => {
    if (idParaEditar) {
      StorageService.atualizarVenda(idParaEditar, dados);
    } else {
      StorageService.adicionarVenda(dados);
    }
    setTodasVendas(StorageService.getVendas());
  };

  const handleExcluirVenda = (id: string) => {
    StorageService.excluirVenda(id);
    setTodasVendas(StorageService.getVendas());
  };

  const handleAbrirEditarVenda = (venda: Venda) => {
    setVendaParaEditar(venda);
    setModalVendaAberto(true);
  };

  // --- HANDLERS: PRODUÇÃO ---
  const handleSalvarProducao = (dados: Omit<Producao, 'id' | 'createdAt'>, idParaEditar?: string) => {
    if (idParaEditar) {
      StorageService.atualizarProducao(idParaEditar, dados);
    } else {
      StorageService.adicionarProducao(dados);
    }
    setTodasProducoes(StorageService.getProducoes());
  };

  const handleExcluirProducao = (id: string) => {
    StorageService.excluirProducao(id);
    setTodasProducoes(StorageService.getProducoes());
  };

  const handleAbrirEditarProducao = (producao: Producao) => {
    setProducaoParaEditar(producao);
    setModalProducaoAberto(true);
  };

  // --- HANDLERS: SAFRAS ---
  const handleSelecionarSafra = (id: string) => {
    StorageService.setSafraAtivaId(id);
    setSafraAtivaId(id);
    setSafras(StorageService.getSafras());
  };

  const handleCriarSafra = (dados: Omit<Safra, 'id' | 'createdAt' | 'ativa'>) => {
    const nova = StorageService.criarSafra(dados);
    setSafraAtivaId(nova.id);
    setSafras(StorageService.getSafras());
  };

  const handleExcluirSafra = (id: string) => {
    StorageService.excluirSafra(id);
    carregarDados();
  };

  // --- BACKUP & APAGAR ---
  const handleExportarBackup = () => {
    const jsonStr = StorageService.exportarBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dataHoje = new Date().toISOString().split('T')[0];
    a.download = `minha-safra-backup-${dataHoje}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportarBackup = (jsonContent: string) => {
    const resultado = StorageService.importarBackup(jsonContent);
    if (resultado.success) {
      carregarDados();
    }
    return resultado;
  };

  const handleApagarTodosDados = () => {
    StorageService.apagarTodosOsDados();
    carregarDados();
    setCurrentTab('inicio');
  };

  const handleFecharOnboarding = () => {
    StorageService.setOnboardingConcluido(true);
    setModalOnboardingAberto(false);
  };

  return (
    <div className="min-h-screen bg-[#14251C] text-[#F5F0E6] flex flex-col font-sans antialiased selection:bg-[#C86F42]/40">
      {/* Offline Alert Bar */}
      <OfflineIndicator />

      {/* Top Header */}
      <Header
        safraAtiva={safraAtiva}
        onOpenSafras={() => setModalSafrasAberto(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
        {currentTab === 'inicio' && (
          <HomeView
            safraAtiva={safraAtiva}
            totalVendas={totalVendas}
            totalGastos={totalGastos}
            resultado={resultado}
            resumoProducao={resumoProducao}
            ultimosGastos={gastosSafra}
            ultimasVendas={vendasSafra}
            ultimasProducoes={producoesSafra}
            onOpenGastei={() => {
              setGastoParaEditar(null);
              setModalGastoAberto(true);
            }}
            onOpenVendi={() => {
              setVendaParaEditar(null);
              setModalVendaAberto(true);
            }}
            onOpenProduzi={() => {
              setProducaoParaEditar(null);
              setModalProducaoAberto(true);
            }}
            onGoToResultado={() => setCurrentTab('resultado')}
            onGoToHistorico={() => setCurrentTab('historico')}
            onOpenSafras={() => setModalSafrasAberto(true)}
            onOpenRelatorioWhatsapp={() => setModalWhatsappAberto(true)}
            onOpenCalculadoraLucros={() => setModalCalculadoraAberto(true)}
          />
        )}

        {currentTab === 'registros' && (
          <RegistrosView
            safraAtiva={safraAtiva}
            onOpenGastei={() => {
              setGastoParaEditar(null);
              setModalGastoAberto(true);
            }}
            onOpenVendi={() => {
              setVendaParaEditar(null);
              setModalVendaAberto(true);
            }}
            onOpenProduzi={() => {
              setProducaoParaEditar(null);
              setModalProducaoAberto(true);
            }}
          />
        )}

        {currentTab === 'resultado' && (
          <ResultadoView
            safraAtiva={safraAtiva}
            totalVendas={totalVendas}
            totalGastos={totalGastos}
            resultado={resultado}
            resumoProducao={resumoProducao}
            onAbrirRelatorioWhatsapp={() => setModalWhatsappAberto(true)}
            onAbrirCalculadoraLucros={() => setModalCalculadoraAberto(true)}
          />
        )}

        {currentTab === 'historico' && (
          <HistoricoView
            safraAtiva={safraAtiva}
            gastos={gastosSafra}
            vendas={vendasSafra}
            producoes={producoesSafra}
            onEditarGasto={handleAbrirEditarGasto}
            onExcluirGasto={handleExcluirGasto}
            onEditarVenda={handleAbrirEditarVenda}
            onExcluirVenda={handleExcluirVenda}
            onEditarProducao={handleAbrirEditarProducao}
            onExcluirProducao={handleExcluirProducao}
          />
        )}

        {currentTab === 'mais' && (
          <MaisView
            safraAtiva={safraAtiva}
            onOpenSafras={() => setModalSafrasAberto(true)}
            onExportarBackup={handleExportarBackup}
            onImportarBackup={handleImportarBackup}
            onApagarTodosDados={handleApagarTodosDados}
            onAbrirOnboarding={() => setModalOnboardingAberto(true)}
            onAbrirRelatorioWhatsapp={() => setModalWhatsappAberto(true)}
            onAbrirCalculadoraLucros={() => setModalCalculadoraAberto(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Modal Registrar Gasto */}
      {safraAtiva && (
        <RegistroGastoModal
          isOpen={modalGastoAberto}
          onClose={() => {
            setModalGastoAberto(false);
            setGastoParaEditar(null);
          }}
          safraId={safraAtiva.id}
          safraNome={safraAtiva.nome}
          onSave={handleSalvarGasto}
          gastoParaEditar={gastoParaEditar}
        />
      )}

      {/* Modal Registrar Venda */}
      {safraAtiva && (
        <RegistroVendaModal
          isOpen={modalVendaAberto}
          onClose={() => {
            setModalVendaAberto(false);
            setVendaParaEditar(null);
          }}
          safraId={safraAtiva.id}
          safraNome={safraAtiva.nome}
          onSave={handleSalvarVenda}
          vendaParaEditar={vendaParaEditar}
        />
      )}

      {/* Modal Registrar Produção */}
      {safraAtiva && (
        <RegistroProducaoModal
          isOpen={modalProducaoAberto}
          onClose={() => {
            setModalProducaoAberto(false);
            setProducaoParaEditar(null);
          }}
          safraId={safraAtiva.id}
          safraNome={safraAtiva.nome}
          onSave={handleSalvarProducao}
          producaoParaEditar={producaoParaEditar}
        />
      )}

      {/* Modal Gerenciar Safras */}
      <SafrasModal
        isOpen={modalSafrasAberto}
        onClose={() => setModalSafrasAberto(false)}
        safras={safras}
        safraAtivaId={safraAtivaId}
        onSelectSafra={handleSelecionarSafra}
        onCreateSafra={handleCriarSafra}
        onDeleteSafra={handleExcluirSafra}
      />

      {/* Modal Primeiro Acesso / Onboarding */}
      <OnboardingModal
        isOpen={modalOnboardingAberto}
        onClose={handleFecharOnboarding}
      />

      {/* Modal Relatório WhatsApp */}
      {safraAtiva && (
        <RelatorioWhatsappModal
          isOpen={modalWhatsappAberto}
          onClose={() => setModalWhatsappAberto(false)}
          safraAtiva={safraAtiva}
          gastos={gastosSafra}
          vendas={vendasSafra}
          totalVendas={totalVendas}
          totalGastos={totalGastos}
          resultado={resultado}
          resumoProducao={resumoProducao}
        />
      )}

      {/* Modal Calculadora de Lucros */}
      {safraAtiva && (
        <CalculadoraLucroModal
          isOpen={modalCalculadoraAberto}
          onClose={() => setModalCalculadoraAberto(false)}
          safraAtiva={safraAtiva}
          totalGastos={totalGastos}
          totalVendas={totalVendas}
          resumoProducao={resumoProducao}
          onAbrirWhatsappCotacao={() => {
            setModalCalculadoraAberto(false);
            setModalWhatsappAberto(true);
          }}
        />
      )}
    </div>
  );
}
