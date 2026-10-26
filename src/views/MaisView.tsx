import React, { useRef, useState } from 'react';
import {
  Sprout,
  Download,
  Upload,
  Info,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Wifi,
  MessageCircle,
  Calculator,
} from 'lucide-react';
import { Safra } from '../types';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface MaisViewProps {
  safraAtiva: Safra | null;
  onOpenSafras: () => void;
  onExportarBackup: () => void;
  onImportarBackup: (jsonContent: string) => { success: boolean; message: string };
  onApagarTodosDados: () => void;
  onAbrirOnboarding: () => void;
  onAbrirRelatorioWhatsapp: () => void;
  onAbrirCalculadoraLucros: () => void;
}

export const MaisView: React.FC<MaisViewProps> = ({
  safraAtiva,
  onOpenSafras,
  onExportarBackup,
  onImportarBackup,
  onApagarTodosDados,
  onAbrirOnboarding,
  onAbrirRelatorioWhatsapp,
  onAbrirCalculadoraLucros,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [modalConfirmarApagar, setModalConfirmarApagar] = useState(false);
  const [modalSobre, setModalSobre] = useState(false);

  const handleArquivoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const resultado = onImportarBackup(content);
        if (resultado.success) {
          setFeedback({ tipo: 'sucesso', texto: resultado.message });
        } else {
          setFeedback({ tipo: 'erro', texto: resultado.message });
        }
        setTimeout(() => setFeedback(null), 4000);
      }
    };
    reader.readAsText(file);
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se quiser
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-[#20382A] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#354A37] text-[#F5F0E6]">
        <h2 className="text-2xl font-bold text-[#F5F0E6]">
          Ajustes & Dados
        </h2>
        <p className="text-sm sm:text-base text-[#D8CEB8] mt-1 font-medium">
          Gerencie suas safras, faça cópias de segurança (backup) ou restaure dados.
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm sm:text-base animate-in fade-in ${
            feedback.tipo === 'sucesso'
              ? 'bg-[#20382A] text-[#4ADE80] border-2 border-[#22C55E]/60'
              : 'bg-[#20382A] text-[#EF4444] border-2 border-[#DC4C4C]/60'
          }`}
        >
          {feedback.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-6 h-6 text-[#22C55E] shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-[#EF4444] shrink-0" />
          )}
          <span>{feedback.texto}</span>
        </div>
      )}

      {/* PWA Install Card inside Settings */}
      <PWAInstallButton variant="card" />

      {/* Menu Options Group */}
      <div className="bg-[#20382A] rounded-3xl p-2.5 shadow-sm border border-[#354A37] divide-y divide-[#354A37] text-[#F5F0E6]">
        {/* Minhas Safras */}
        <button
          id="btn-menu-minhas-safras"
          onClick={onOpenSafras}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center text-2xl shrink-0">
              <Sprout className="w-6 h-6 text-[#D9AD5B]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E6] text-base">
                Minhas Safras
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Safra atual: <strong className="text-[#D9AD5B]">{safraAtiva?.nome || 'Principal'}</strong>
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#D8CEB8]" />
        </button>

        {/* Relatórios no WhatsApp */}
        <button
          id="btn-menu-relatorio-whatsapp"
          onClick={onAbrirRelatorioWhatsapp}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#22C55E]/50 text-[#22C55E] flex items-center justify-center text-2xl shrink-0">
              <MessageCircle className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E6] text-base">
                Relatórios no WhatsApp
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Enviar resumo financeiro ou proposta de venda
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-[#14251C] border border-[#22C55E]/50 text-[#4ADE80] text-sm font-bold rounded-xl">
            Enviar
          </span>
        </button>

        {/* Calculadora de Lucros */}
        <button
          id="btn-menu-calculadora-lucros"
          onClick={onAbrirCalculadoraLucros}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#D9AD5B]/50 text-[#D9AD5B] flex items-center justify-center text-2xl shrink-0">
              <Calculator className="w-6 h-6 text-[#D9AD5B]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E6] text-base">
                Calculadora de Lucros
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Simular preços, margem e ponto de equilíbrio
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-[#14251C] border border-[#354A37] text-[#D9AD5B] text-sm font-bold rounded-xl">
            Simular
          </span>
        </button>

        {/* Exportar Backup */}
        <button
          id="btn-menu-exportar-backup"
          onClick={onExportarBackup}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center text-2xl shrink-0">
              <Download className="w-6 h-6 text-[#D9AD5B]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E6] text-base">
                Salvar Cópia dos Dados (Backup)
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Baixar arquivo com todos os seus gastos e vendas
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-[#14251C] border border-[#354A37] text-[#D9AD5B] text-sm font-bold rounded-xl">
            Salvar
          </span>
        </button>

        {/* Importar Backup */}
        <button
          id="btn-menu-importar-backup"
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D8CEB8] flex items-center justify-center text-2xl shrink-0">
              <Upload className="w-6 h-6 text-[#D8CEB8]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E6] text-base">
                Restaurar Dados (Importar)
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Recuperar dados a partir de um arquivo salvo
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-[#14251C] border border-[#354A37] text-[#D8CEB8] text-sm font-bold rounded-xl">
            Abrir
          </span>
        </button>

        {/* Input file invisível */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleArquivoUpload}
          className="hidden"
        />

        {/* Como usar / Guia Rápido */}
        <button
          id="btn-menu-onboarding"
          onClick={onAbrirOnboarding}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center text-2xl shrink-0">
              <FileText className="w-6 h-6 text-[#D9AD5B]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E6] text-base">
                Como usar o Minha Safra
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Ver passo a passo de funcionamento simples
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#D8CEB8]" />
        </button>

        {/* Sobre o Minha Safra */}
        <button
          id="btn-menu-sobre"
          onClick={() => setModalSobre(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D8CEB8] flex items-center justify-center text-2xl shrink-0">
              <Info className="w-6 h-6 text-[#D8CEB8]" />
            </div>
            <div>
              <p className="font-bold text-[#F5F0E6] text-base">
                Sobre o Minha Safra
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Sua produção. Seus números. Seu resultado.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#D8CEB8]" />
        </button>

        {/* Apagar meus dados */}
        <button
          id="btn-menu-apagar-dados"
          onClick={() => setModalConfirmarApagar(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-[#14251C]/60 transition rounded-2xl text-left min-h-[64px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#DC4C4C]/50 text-[#EF4444] flex items-center justify-center text-2xl shrink-0">
              <Trash2 className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div>
              <p className="font-bold text-[#EF4444] text-base">
                Apagar todos os dados
              </p>
              <p className="text-sm text-[#D8CEB8]">
                Limpar todos os registros e recomeçar do zero
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#EF4444]" />
        </button>
      </div>

      {/* Security & Offline Guarantee Note (Requirement 11) */}
      <div className="p-4 sm:p-5 bg-[#14251C] rounded-3xl border border-[#354A37] text-sm text-[#D8CEB8] space-y-2">
        <div className="flex items-center gap-2 text-[#D9AD5B] font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-[#D9AD5B]" />
          <span>Armazenamento no Aparelho</span>
        </div>
        <p className="text-base leading-relaxed text-[#F5F0E6] font-medium">
          Seus dados ficam salvos neste aparelho. Para não perder nada, faça cópias de segurança periodicamente.
        </p>
        <p className="text-xs text-[#D8CEB8]">
          O aplicativo funciona normalmente mesmo sem sinal de internet no campo.
        </p>
      </div>

      {/* Modal Sobre */}
      {modalSobre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#20382A] rounded-3xl p-6 shadow-2xl border border-[#354A37] space-y-4 text-[#F5F0E6]">
            <div className="flex items-center gap-3 pb-3 border-b border-[#354A37]">
              <div className="w-12 h-12 rounded-2xl bg-[#14251C] border border-[#354A37] text-[#D9AD5B] flex items-center justify-center text-2xl">
                🌱
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">
                  Minha Safra
                </h3>
                <p className="text-sm text-[#D9AD5B] font-bold">
                  Sua produção. Seus números. Seu resultado.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#D8CEB8] leading-relaxed">
              <p>
                O <strong className="text-[#F5F0E6]">Minha Safra</strong> foi desenvolvido sob medida para pequenos e médios produtores rurais que buscam clareza financeira sem complicações.
              </p>
              <div className="p-3.5 bg-[#14251C] rounded-xl border border-[#354A37] space-y-1.5 font-medium text-[#F5F0E6]">
                <p>✓ Funciona sem internet (offline)</p>
                <p>✓ Sem cadastro ou senhas complicadas</p>
                <p>✓ Cálculo automático de custo e lucro</p>
                <p>✓ Cotação e relatório fácil para WhatsApp</p>
              </div>
              <p className="text-xs text-[#D8CEB8]">
                Versão 1.0 (PWA Mobile-First) • Feito para o agricultor brasileiro 🇧🇷
              </p>
            </div>

            <button
              id="btn-fechar-modal-sobre"
              onClick={() => setModalSobre(false)}
              className="w-full py-3.5 bg-[#C86F42] hover:bg-[#C86F42]/90 text-[#F5F0E6] rounded-xl font-bold text-base transition shadow-sm min-h-[52px]"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmar Apagar */}
      {modalConfirmarApagar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#20382A] rounded-3xl p-6 shadow-2xl border-2 border-[#DC4C4C]/60 text-center space-y-4 text-[#F5F0E6]">
            <div className="w-16 h-16 rounded-2xl bg-[#14251C] border-2 border-[#DC4C4C]/60 text-[#EF4444] flex items-center justify-center mx-auto shadow-inner text-3xl">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F0E6]">
                Apagar todos os dados?
              </h3>
              <p className="text-sm text-[#D8CEB8] mt-2 leading-relaxed">
                Tem certeza? Todos os gastos, vendas, produções e safras cadastradas neste aparelho serão excluídos permanentemente.
              </p>
              <p className="text-sm text-[#D9AD5B] font-bold bg-[#14251C] p-3 rounded-xl border border-[#354A37] mt-3">
                💡 Dica: Se quiser guardar uma cópia antes, clique em Cancelar e use "Salvar Cópia dos Dados (Backup)".
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-cancelar-apagar-todos"
                onClick={() => setModalConfirmarApagar(false)}
                className="py-3.5 bg-[#14251C] text-[#F5F0E6] border border-[#354A37] rounded-xl font-bold text-base hover:bg-[#354A37] transition min-h-[52px]"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-apagar-todos"
                onClick={() => {
                  onApagarTodosDados();
                  setModalConfirmarApagar(false);
                }}
                className="py-3.5 bg-[#DC4C4C] hover:bg-[#DC4C4C]/90 text-white rounded-xl font-bold text-base shadow-md transition min-h-[52px] flex items-center justify-center gap-1.5"
              >
                <span>🗑️</span>
                <span>Sim, apagar tudo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
