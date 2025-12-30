import { ref, computed } from 'vue';
import { LocalStorage } from 'quasar';
import type { Despesa, ConfigFinanceira, ResumoFinanceiro } from '../types/financas';

const STORAGE_KEY_CONFIG = 'financas-config';
const STORAGE_KEY_DESPESAS = 'financas-despesas';

export function useFinancas() {
  // Estado
  const config = ref<ConfigFinanceira>(
    LocalStorage.getItem(STORAGE_KEY_CONFIG) || { rendaLiquida: 0 }
  );

  const despesas = ref<Despesa[]>(
    LocalStorage.getItem(STORAGE_KEY_DESPESAS) || []
  );

  // Salvar no LocalStorage
  const salvarConfig = () => {
    LocalStorage.set(STORAGE_KEY_CONFIG, config.value);
  };

  const salvarDespesas = () => {
    LocalStorage.set(STORAGE_KEY_DESPESAS, despesas.value);
  };

  // Configuração de renda
  const atualizarRenda = (novaRenda: number) => {
    config.value.rendaLiquida = novaRenda;
    salvarConfig();
  };

  // Gerenciamento de despesas
  const adicionarDespesa = (despesa: Omit<Despesa, 'id'>) => {
    const novaDespesa: Despesa = {
      ...despesa,
      id: Date.now().toString(),
    };
    despesas.value.push(novaDespesa);
    salvarDespesas();
  };

  const removerDespesa = (id: string) => {
    despesas.value = despesas.value.filter((d) => d.id !== id);
    salvarDespesas();
  };

  const editarDespesa = (id: string, despesaAtualizada: Omit<Despesa, 'id'>) => {
    const index = despesas.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      despesas.value[index] = { ...despesaAtualizada, id };
      salvarDespesas();
    }
  };

  // Cálculos
  const resumo = computed<ResumoFinanceiro>(() => {
    const rendaLiquida = config.value.rendaLiquida;

    const gastoNecessidades = despesas.value
      .filter((d) => d.categoria === 'necessidades')
      .reduce((sum, d) => sum + d.valor, 0);

    const gastoDesejos = despesas.value
      .filter((d) => d.categoria === 'desejos')
      .reduce((sum, d) => sum + d.valor, 0);

    const gastoFuturo = despesas.value
      .filter((d) => d.categoria === 'futuro')
      .reduce((sum, d) => sum + d.valor, 0);

    const totalGasto = gastoNecessidades + gastoDesejos + gastoFuturo;

    const orcadoNecessidades = rendaLiquida * 0.5;
    const orcadoDesejos = rendaLiquida * 0.3;
    const orcadoFuturo = rendaLiquida * 0.2;

    return {
      rendaLiquida,
      necessidades: {
        orcado: orcadoNecessidades,
        gasto: gastoNecessidades,
        restante: orcadoNecessidades - gastoNecessidades,
        percentual: rendaLiquida > 0 ? (gastoNecessidades / rendaLiquida) * 100 : 0,
      },
      desejos: {
        orcado: orcadoDesejos,
        gasto: gastoDesejos,
        restante: orcadoDesejos - gastoDesejos,
        percentual: rendaLiquida > 0 ? (gastoDesejos / rendaLiquida) * 100 : 0,
      },
      futuro: {
        orcado: orcadoFuturo,
        gasto: gastoFuturo,
        restante: orcadoFuturo - gastoFuturo,
        percentual: rendaLiquida > 0 ? (gastoFuturo / rendaLiquida) * 100 : 0,
      },
      totalGasto,
      saldoTotal: rendaLiquida - totalGasto,
    };
  });

  return {
    config,
    despesas,
    resumo,
    atualizarRenda,
    adicionarDespesa,
    removerDespesa,
    editarDespesa,
  };
}
