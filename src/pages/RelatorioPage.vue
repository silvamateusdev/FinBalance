<template>
  <q-page class="q-pa-md">
    <q-card v-if="resumo.rendaLiquida > 0">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">
            <q-icon name="assessment" color="primary" />
            Relatório Financeiro
          </div>
          <q-space />
          <q-btn-dropdown
            color="primary"
            icon="download"
            label="Exportar"
            flat
            dense
          >
            <q-list>
              <q-item clickable v-close-popup @click="exportarCSV">
                <q-item-section avatar>
                  <q-icon name="table_chart" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exportar CSV</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="exportarPDF">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exportar PDF</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <!-- Resumo Geral -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-6 col-sm-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">Renda Líquida</div>
                <div class="text-h6 text-primary">
                  R$ {{ formatarValor(resumo.rendaLiquida) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">Total Gasto</div>
                <div class="text-h6">
                  R$ {{ formatarValor(resumo.totalGasto) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">Saldo</div>
                <div
                  class="text-h6"
                  :class="
                    resumo.saldoTotal < 0 ? 'text-negative' : 'text-positive'
                  "
                >
                  R$ {{ formatarValor(resumo.saldoTotal) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-caption text-grey-7">Despesas</div>
                <div class="text-h6">{{ despesas.length }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Detalhamento por Categoria -->
        <div class="text-subtitle1 q-mb-md">Distribuição por Categoria</div>

        <!-- Necessidades -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-chip color="red" text-color="white" dense>
                <q-avatar icon="home" />
                Necessidades (50%)
              </q-chip>
              <q-space />
              <div class="text-body2">
                <span class="text-weight-bold">
                  R$ {{ formatarValor(resumo.necessidades.gasto) }}
                </span>
                / R$ {{ formatarValor(resumo.necessidades.orcado) }}
              </div>
            </div>
            <q-linear-progress
              :value="resumo.necessidades.percentual / 50"
              size="15px"
              :color="
                resumo.necessidades.percentual > 50 ? 'negative' : 'red'
              "
              class="q-mb-sm"
            />
            <div class="row justify-between text-caption">
              <span>{{ resumo.necessidades.percentual.toFixed(1) }}% da renda</span>
              <span
                :class="
                  resumo.necessidades.restante < 0
                    ? 'text-negative'
                    : 'text-positive'
                "
              >
                {{
                  resumo.necessidades.restante < 0 ? 'Excedeu' : 'Disponível'
                }}:
                R$ {{ formatarValor(Math.abs(resumo.necessidades.restante)) }}
              </span>
            </div>
            <div class="q-mt-sm">
              <div
                v-for="despesa in despesasPorCategoria.necessidades"
                :key="despesa.id"
                class="row justify-between text-caption q-py-xs"
              >
                <div class="col">
                  <span>{{ despesa.descricao }}</span>
                  <span
                    v-if="despesa.possuiTermino && despesa.dataTermino"
                    class="text-grey-6 q-ml-xs"
                  >
                    (Término: {{ formatarData(despesa.dataTermino) }})
                  </span>
                </div>
                <span class="q-ml-md">R$ {{ formatarValor(despesa.valor) }}</span>
              </div>
              <div
                v-if="despesasPorCategoria.necessidades.length === 0"
                class="text-caption text-grey-6 text-center q-py-sm"
              >
                Nenhuma despesa nesta categoria
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Desejos -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-chip color="orange" text-color="white" dense>
                <q-avatar icon="favorite" />
                Desejos (30%)
              </q-chip>
              <q-space />
              <div class="text-body2">
                <span class="text-weight-bold">
                  R$ {{ formatarValor(resumo.desejos.gasto) }}
                </span>
                / R$ {{ formatarValor(resumo.desejos.orcado) }}
              </div>
            </div>
            <q-linear-progress
              :value="resumo.desejos.percentual / 30"
              size="15px"
              :color="resumo.desejos.percentual > 30 ? 'negative' : 'orange'"
              class="q-mb-sm"
            />
            <div class="row justify-between text-caption">
              <span>{{ resumo.desejos.percentual.toFixed(1) }}% da renda</span>
              <span
                :class="
                  resumo.desejos.restante < 0 ? 'text-negative' : 'text-positive'
                "
              >
                {{ resumo.desejos.restante < 0 ? 'Excedeu' : 'Disponível' }}: R$
                {{ formatarValor(Math.abs(resumo.desejos.restante)) }}
              </span>
            </div>
            <div class="q-mt-sm">
              <div
                v-for="despesa in despesasPorCategoria.desejos"
                :key="despesa.id"
                class="row justify-between text-caption q-py-xs"
              >
                <div class="col">
                  <span>{{ despesa.descricao }}</span>
                  <span
                    v-if="despesa.possuiTermino && despesa.dataTermino"
                    class="text-grey-6 q-ml-xs"
                  >
                    (Término: {{ formatarData(despesa.dataTermino) }})
                  </span>
                </div>
                <span class="q-ml-md">R$ {{ formatarValor(despesa.valor) }}</span>
              </div>
              <div
                v-if="despesasPorCategoria.desejos.length === 0"
                class="text-caption text-grey-6 text-center q-py-sm"
              >
                Nenhuma despesa nesta categoria
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Futuro -->
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-chip color="green" text-color="white" dense>
                <q-avatar icon="savings" />
                Futuro/Dívidas (20%)
              </q-chip>
              <q-space />
              <div class="text-body2">
                <span class="text-weight-bold">
                  R$ {{ formatarValor(resumo.futuro.gasto) }}
                </span>
                / R$ {{ formatarValor(resumo.futuro.orcado) }}
              </div>
            </div>
            <q-linear-progress
              :value="resumo.futuro.percentual / 20"
              size="15px"
              :color="resumo.futuro.percentual > 20 ? 'negative' : 'green'"
              class="q-mb-sm"
            />
            <div class="row justify-between text-caption">
              <span>{{ resumo.futuro.percentual.toFixed(1) }}% da renda</span>
              <span
                :class="
                  resumo.futuro.restante < 0 ? 'text-negative' : 'text-positive'
                "
              >
                {{ resumo.futuro.restante < 0 ? 'Excedeu' : 'Disponível' }}: R$
                {{ formatarValor(Math.abs(resumo.futuro.restante)) }}
              </span>
            </div>
            <div class="q-mt-sm">
              <div
                v-for="despesa in despesasPorCategoria.futuro"
                :key="despesa.id"
                class="row justify-between text-caption q-py-xs"
              >
                <div class="col">
                  <span>{{ despesa.descricao }}</span>
                  <span
                    v-if="despesa.possuiTermino && despesa.dataTermino"
                    class="text-grey-6 q-ml-xs"
                  >
                    (Término: {{ formatarData(despesa.dataTermino) }})
                  </span>
                </div>
                <span class="q-ml-md">R$ {{ formatarValor(despesa.valor) }}</span>
              </div>
              <div
                v-if="despesasPorCategoria.futuro.length === 0"
                class="text-caption text-grey-6 text-center q-py-sm"
              >
                Nenhuma despesa nesta categoria
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-separator class="q-my-md" />

        <!-- Alertas e Recomendações -->
        <div class="text-subtitle1 q-mb-md">Alertas e Recomendações</div>
        <div class="q-gutter-sm">
          <q-banner
            v-if="resumo.necessidades.percentual > 50"
            class="bg-negative text-white"
            rounded
          >
            <template #avatar>
              <q-icon name="warning" />
            </template>
            Seus gastos com necessidades ultrapassam 50%. Revise onde pode
            economizar.
          </q-banner>

          <q-banner
            v-if="resumo.desejos.percentual > 30"
            class="bg-warning text-white"
            rounded
          >
            <template #avatar>
              <q-icon name="warning" />
            </template>
            Seus gastos com desejos ultrapassam 30%. Controle esses gastos para
            não comprometer outras áreas.
          </q-banner>

          <q-banner
            v-if="resumo.futuro.percentual < 20 && resumo.futuro.percentual > 0"
            class="bg-info text-white"
            rounded
          >
            <template #avatar>
              <q-icon name="info" />
            </template>
            Você ainda não atingiu os 20% recomendados para poupar/investir. Tente
            aumentar esse valor.
          </q-banner>

          <q-banner
            v-if="resumo.futuro.gasto === 0"
            class="bg-negative text-white"
            rounded
          >
            <template #avatar>
              <q-icon name="priority_high" />
            </template>
            Você não está poupando nada! Pague-se primeiro guardando 20% assim que
            receber.
          </q-banner>

          <q-banner
            v-if="
              resumo.necessidades.percentual <= 50 &&
              resumo.desejos.percentual <= 30 &&
              resumo.futuro.percentual >= 20
            "
            class="bg-positive text-white"
            rounded
          >
            <template #avatar>
              <q-icon name="check_circle" />
            </template>
            Parabéns! Você está seguindo o método 50/30/20 corretamente.
          </q-banner>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-else class="bg-grey-2">
      <q-card-section class="text-center">
        <q-icon name="bar_chart" size="xl" color="grey-6" class="q-mb-md" />
        <div class="text-body1 text-grey-7">
          Configure sua renda na página inicial para visualizar o relatório
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useFinancas } from '../composables/useFinancas';

const $q = useQuasar();
const { despesas, resumo } = useFinancas();

const despesasPorCategoria = computed(() => {
  return {
    necessidades: despesas.value.filter((d) => d.categoria === 'necessidades'),
    desejos: despesas.value.filter((d) => d.categoria === 'desejos'),
    futuro: despesas.value.filter((d) => d.categoria === 'futuro'),
  };
});

const formatarValor = (valor: number) => {
  return valor.toFixed(2).replace('.', ',');
};

const formatarData = (data: string) => {
  const date = new Date(data + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

const getCategoriaLabel = (categoria: string) => {
  const labels: Record<string, string> = {
    necessidades: 'Necessidades',
    desejos: 'Desejos',
    futuro: 'Futuro/Dívidas',
  };
  return labels[categoria] || categoria;
};

const exportarCSV = () => {
  try {
    // Cabeçalho do CSV
    let csv = 'Descrição,Categoria,Valor,Data,Possui Término,Data de Término\n';

    // Adicionar cada despesa
    despesas.value.forEach((despesa) => {
      const linha = [
        `"${despesa.descricao}"`,
        getCategoriaLabel(despesa.categoria),
        despesa.valor.toFixed(2),
        formatarData(despesa.data),
        despesa.possuiTermino ? 'Sim' : 'Não',
        despesa.possuiTermino && despesa.dataTermino
          ? formatarData(despesa.dataTermino)
          : '-',
      ].join(',');
      csv += linha + '\n';
    });

    // Adicionar resumo
    csv += '\n\nResumo Financeiro\n';
    csv += `Renda Líquida,${resumo.value.rendaLiquida.toFixed(2)}\n`;
    csv += `Total Gasto,${resumo.value.totalGasto.toFixed(2)}\n`;
    csv += `Saldo Total,${resumo.value.saldoTotal.toFixed(2)}\n`;
    csv += '\n';
    csv += `Categoria,Orçado,Gasto,Restante,Percentual\n`;
    csv += `Necessidades,${resumo.value.necessidades.orcado.toFixed(2)},${resumo.value.necessidades.gasto.toFixed(2)},${resumo.value.necessidades.restante.toFixed(2)},${resumo.value.necessidades.percentual.toFixed(1)}%\n`;
    csv += `Desejos,${resumo.value.desejos.orcado.toFixed(2)},${resumo.value.desejos.gasto.toFixed(2)},${resumo.value.desejos.restante.toFixed(2)},${resumo.value.desejos.percentual.toFixed(1)}%\n`;
    csv += `Futuro/Dívidas,${resumo.value.futuro.orcado.toFixed(2)},${resumo.value.futuro.gasto.toFixed(2)},${resumo.value.futuro.restante.toFixed(2)},${resumo.value.futuro.percentual.toFixed(1)}%\n`;

    // Criar e baixar o arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    $q.notify({
      type: 'positive',
      message: 'Relatório CSV exportado com sucesso!',
      position: 'top',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar CSV',
      position: 'top',
    });
  }
};

const exportarPDF = () => {
  try {
    // Criar conteúdo HTML para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Bloqueador de pop-ups ativo');
    }

    // Função auxiliar para gerar linhas de tabela
    const gerarLinhasDespesas = (despesasCategoria: typeof despesas.value) => {
      if (despesasCategoria.length === 0) {
        return '<tr><td colspan="4" style="text-align: center;">Nenhuma despesa</td></tr>';
      }
      return despesasCategoria
        .map((d) => {
          const dataTermino = d.possuiTermino && d.dataTermino 
            ? formatarData(d.dataTermino) 
            : '-';
          return '<tr>' +
            '<td>' + d.descricao + '</td>' +
            '<td>R$ ' + d.valor.toFixed(2).replace('.', ',') + '</td>' +
            '<td>' + formatarData(d.data) + '</td>' +
            '<td>' + dataTermino + '</td>' +
            '</tr>';
        })
        .join('');
    };

    const saldoClass = resumo.value.saldoTotal < 0 ? 'negativo' : 'positivo';
    
    const html = '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      '<meta charset="UTF-8">' +
      '<title>Relatório Financeiro - Finanças 50/30/20</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; margin: 40px; color: #333; }' +
      'h1 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }' +
      'h2 { color: #555; margin-top: 30px; }' +
      'table { width: 100%; border-collapse: collapse; margin: 20px 0; }' +
      'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }' +
      'th { background-color: #1976d2; color: white; }' +
      'tr:nth-child(even) { background-color: #f9f9f9; }' +
      '.resumo { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }' +
      '.resumo-item { display: flex; justify-content: space-between; margin: 10px 0; }' +
      '.categoria { margin: 20px 0; padding: 15px; border-left: 4px solid #1976d2; background-color: #f5f5f5; }' +
      '.positivo { color: #4caf50; font-weight: bold; }' +
      '.negativo { color: #f44336; font-weight: bold; }' +
      '@media print { body { margin: 20px; } }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<h1>📊 Relatório Financeiro - Método 50/30/20</h1>' +
      '<p><strong>Data:</strong> ' + new Date().toLocaleDateString('pt-BR') + '</p>' +
      '<div class="resumo">' +
      '<h2>Resumo Geral</h2>' +
      '<div class="resumo-item">' +
      '<span>Renda Líquida:</span>' +
      '<strong>R$ ' + resumo.value.rendaLiquida.toFixed(2).replace('.', ',') + '</strong>' +
      '</div>' +
      '<div class="resumo-item">' +
      '<span>Total Gasto:</span>' +
      '<strong>R$ ' + resumo.value.totalGasto.toFixed(2).replace('.', ',') + '</strong>' +
      '</div>' +
      '<div class="resumo-item">' +
      '<span>Saldo Total:</span>' +
      '<strong class="' + saldoClass + '">R$ ' + resumo.value.saldoTotal.toFixed(2).replace('.', ',') + '</strong>' +
      '</div>' +
      '</div>' +
      '<h2>Despesas por Categoria</h2>' +
      '<div class="categoria">' +
      '<h3>🏠 Necessidades (50%)</h3>' +
      '<p><strong>Gasto:</strong> R$ ' + resumo.value.necessidades.gasto.toFixed(2).replace('.', ',') +
      ' / R$ ' + resumo.value.necessidades.orcado.toFixed(2).replace('.', ',') +
      ' (' + resumo.value.necessidades.percentual.toFixed(1) + '%)</p>' +
      '<table><thead><tr>' +
      '<th>Descrição</th><th>Valor</th><th>Data</th><th>Data Término</th>' +
      '</tr></thead><tbody>' +
      gerarLinhasDespesas(despesasPorCategoria.value.necessidades) +
      '</tbody></table></div>' +
      '<div class="categoria">' +
      '<h3>❤️ Desejos (30%)</h3>' +
      '<p><strong>Gasto:</strong> R$ ' + resumo.value.desejos.gasto.toFixed(2).replace('.', ',') +
      ' / R$ ' + resumo.value.desejos.orcado.toFixed(2).replace('.', ',') +
      ' (' + resumo.value.desejos.percentual.toFixed(1) + '%)</p>' +
      '<table><thead><tr>' +
      '<th>Descrição</th><th>Valor</th><th>Data</th><th>Data Término</th>' +
      '</tr></thead><tbody>' +
      gerarLinhasDespesas(despesasPorCategoria.value.desejos) +
      '</tbody></table></div>' +
      '<div class="categoria">' +
      '<h3>💰 Futuro/Dívidas (20%)</h3>' +
      '<p><strong>Gasto:</strong> R$ ' + resumo.value.futuro.gasto.toFixed(2).replace('.', ',') +
      ' / R$ ' + resumo.value.futuro.orcado.toFixed(2).replace('.', ',') +
      ' (' + resumo.value.futuro.percentual.toFixed(1) + '%)</p>' +
      '<table><thead><tr>' +
      '<th>Descrição</th><th>Valor</th><th>Data</th><th>Data Término</th>' +
      '</tr></thead><tbody>' +
      gerarLinhasDespesas(despesasPorCategoria.value.futuro) +
      '</tbody></table></div>' +
      '<' + 'script>' +
      'window.onload = function() { window.print(); };' +
      '<' + '/script>' +
      '</body>' +
      '</html>';

    printWindow.document.write(html);
    printWindow.document.close();

    $q.notify({
      type: 'positive',
      message: 'Preparando PDF para impressão...',
      position: 'top',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar PDF. Verifique se pop-ups estão habilitados.',
      position: 'top',
    });
  }
};
</script>
