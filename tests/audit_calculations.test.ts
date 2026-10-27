import {
  calcularCustoMedio,
  calcularSimulacaoVenda,
  calcularPontoEquilibrio,
  calcularTotalGastos,
  calcularTotalVendas,
  calcularResultado,
  calcularTotalProducao,
} from '../src/utils/calculations';
import {
  gerarTextoOfertaWhatsApp,
} from '../src/utils/whatsappReports';
import { parseValorMoeda, formatarMoeda } from '../src/utils/formatters';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    process.exit(1);
  }
  console.log(`✓ SUCESSO: ${message}`);
}

console.log('--- INICIANDO TESTES DE AUDITORIA MINHA SAFRA ---\n');

// 1. Custo Médio Sem Dados
console.log('1. Teste Custo Médio:');
assert(calcularCustoMedio(0, 0) === null, 'Sem gastos e sem produção deve retornar null');
assert(calcularCustoMedio(1000, 0) === null, 'Sem produção deve retornar null');
assert(calcularCustoMedio(0, 500) === null, 'Sem gastos deve retornar null');
assert(calcularCustoMedio(-50, 100) === null, 'Gastos negativos deve retornar null');
assert(calcularCustoMedio(5000, 2500) === 2.0, 'R$5000 / 2500kg deve ser exatamente R$2,00/kg');

// 2. Simulador de Venda e Acréscimo sobre o Custo
console.log('\n2. Teste Simulador de Venda:');
assert(calcularSimulacaoVenda(null, 100, 20) === null, 'Custo nulo bloqueia simulação');
assert(calcularSimulacaoVenda(0, 100, 20) === null, 'Custo zero bloqueia simulação');
assert(calcularSimulacaoVenda(2.0, 0, 20) === null, 'Quantidade zero bloqueia simulação');

const sim = calcularSimulacaoVenda(2.0, 1000, 20);
assert(sim !== null, 'Simulação válida com dados reais deve retornar resultado');
if (sim) {
  assert(sim.precoUnitarioSugerido === 2.4, 'Custo R$2,00 + 20% acréscimo deve resultar em R$2,40');
  assert(sim.faturamentoTotal === 2400.0, '1000kg x R$2,40 deve faturar R$2.400,00');
  assert(sim.custoTotalCalculado === 2000.0, '1000kg x R$2,00 deve custar R$2.000,00');
  assert(sim.lucroTotal === 400.0, 'Acréscimo no bolso deve ser R$400,00');
}

// 3. Ponto de Equilíbrio
console.log('\n3. Teste Ponto de Equilíbrio:');
assert(calcularPontoEquilibrio(0, 2.5) === null, 'Sem custos não calcula equilíbrio');
assert(calcularPontoEquilibrio(10000, 0) === null, 'Sem preço não calcula equilíbrio');
assert(calcularPontoEquilibrio(10000, 2.5) === 4000, 'R$10.000 a R$2,50/kg necessita 4000 kg para cobrir custos');

// 4. Texto de Oferta WhatsApp sem dados fictícios
console.log('\n4. Teste Geração de Oferta WhatsApp:');
const textoApenasProduto = gerarTextoOfertaWhatsApp({
  produto: 'Manga Palmer',
});
assert(textoApenasProduto.includes('🥭 *Manga Palmer*'), 'Contém produto e emoji correto');
assert(!textoApenasProduto.includes('Quantidade:'), 'Não inventa quantidade quando não informada');
assert(!textoApenasProduto.includes('Valor:'), 'Não inventa valor quando não informado');
assert(!textoApenasProduto.includes('R$ 0,00'), 'Nunca exibe R$ 0,00 como preço');
assert(!textoApenasProduto.includes('Local:'), 'Não inventa local quando não informado');
assert(!textoApenasProduto.includes('Disponível agora'), 'Não seleciona situação automaticamente');

const textoCompleto = gerarTextoOfertaWhatsApp({
  produto: 'Manga Palmer',
  quantidade: 800,
  unidade: 'kg',
  preco: 2.5,
  local: 'Livramento - BA',
  situacao: 'colhido_em_breve',
});
assert(textoCompleto.includes('📦 *Quantidade:* 800 kg'), 'Exibe quantidade e unidade informadas');
assert(textoCompleto.includes('💰 *Valor:* R$ 2,50/kg') || textoCompleto.includes('R$ 2,50/kg') || textoCompleto.includes('2,50'), 'Exibe preço informado');
assert(textoCompleto.includes('📍 *Local:* Livramento - BA'), 'Exibe local informado');
assert(textoCompleto.includes('Será colhido em breve'), 'Exibe situação selecionada pelo usuário');

// 5. Estado Inicial Zerado (Sem registros do usuário)
console.log('\n5. Teste Estado Inicial Zerado:');
assert(calcularTotalGastos([]) === 0, 'Total gastos deve ser estritamente 0 quando vazio');
assert(calcularTotalVendas([]) === 0, 'Total vendas deve ser estritamente 0 quando vazio');
assert(calcularResultado(0, 0) === 0, 'Meu Resultado deve ser estritamente 0 quando vazio');
const prodZero = calcularTotalProducao([]);
assert(prodZero.totalGeral === 0, 'Total de produção deve ser 0 quando vazio');
assert(prodZero.quantidadePredominante === 0, 'Quantidade predominante deve ser 0 quando vazio');
assert(prodZero.resumoTexto === '0', 'Resumo de produção deve exibir "0" quando vazio');
assert(calcularCustoMedio(0, 0) === null, 'Custo médio sem gastos ou produção deve ser null');

console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO!');

