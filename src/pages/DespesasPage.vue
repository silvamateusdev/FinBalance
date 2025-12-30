<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-btn
          label="Nova Despesa"
          color="primary"
          icon="add"
          class="full-width"
          @click="abrirDialog()"
        />
      </div>

      <!-- Lista de Despesas -->
      <div class="col-12">
        <q-card v-if="despesas.length > 0">
          <q-list separator>
            <q-item v-for="despesa in despesasOrdenadas" :key="despesa.id">
              <q-item-section avatar>
                <q-avatar
                  :color="getCorCategoria(despesa.categoria)"
                  text-color="white"
                  :icon="getIconeCategoria(despesa.categoria)"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ despesa.descricao }}</q-item-label>
                <q-item-label caption>
                  {{ getLabelCategoria(despesa.categoria) }} •
                  {{ formatarData(despesa.data) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-subtitle1 text-weight-bold">
                  R$ {{ formatarValor(despesa.valor) }}
                </div>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    color="primary"
                    size="sm"
                    @click="abrirDialog(despesa)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="confirmarRemocao(despesa.id)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card v-else class="bg-grey-2">
          <q-card-section class="text-center">
            <q-icon name="receipt_long" size="xl" color="grey-6" class="q-mb-md" />
            <div class="text-body1 text-grey-7">
              Nenhuma despesa cadastrada
            </div>
            <div class="text-caption text-grey-6">
              Clique em "Nova Despesa" para adicionar
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog de Despesa -->
    <q-dialog v-model="dialogAberto" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ despesaEditando ? 'Editar Despesa' : 'Nova Despesa' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="formDespesa.descricao"
            label="Descrição"
            outlined
            dense
            class="q-mb-md"
            :rules="[(val) => !!val || 'Campo obrigatório']"
          />

          <q-input
            v-model.number="formDespesa.valor"
            type="number"
            label="Valor"
            prefix="R$"
            outlined
            dense
            class="q-mb-md"
            :rules="[(val) => val > 0 || 'Informe um valor válido']"
          />

          <q-select
            v-model="formDespesa.categoria"
            :options="opcoesCategoria"
            label="Categoria"
            outlined
            dense
            class="q-mb-md"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Selecione uma categoria']"
          />

          <q-input
            v-model="formDespesa.data"
            label="Data"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo obrigatório']"
          />

          <q-checkbox
            v-model="formDespesa.possuiTermino"
            label="Possui término?"
            class="q-mt-md"
          />

          <q-input
            v-if="formDespesa.possuiTermino"
            v-model="formDespesa.dataTermino"
            label="Data de Término"
            type="date"
            outlined
            dense
            class="q-mt-md"
            :rules="[
              (val) =>
                !formDespesa.possuiTermino ||
                !!val ||
                'Campo obrigatório quando possui término',
            ]"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="fecharDialog" />
          <q-btn
            flat
            label="Salvar"
            color="primary"
            @click="salvarDespesa"
            :disable="!formularioValido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useFinancas } from '../composables/useFinancas';
import type { Despesa } from '../types/financas';

const $q = useQuasar();
const { despesas, adicionarDespesa, removerDespesa, editarDespesa } =
  useFinancas();

const dialogAberto = ref(false);
const despesaEditando = ref<Despesa | null>(null);

const formDespesa = ref({
  descricao: '',
  valor: 0,
  categoria: '' as 'necessidades' | 'desejos' | 'futuro' | '',
  data: new Date().toISOString().split('T')[0],
  possuiTermino: false,
  dataTermino: '',
});

const opcoesCategoria = [
  { label: '50% Necessidades', value: 'necessidades' },
  { label: '30% Desejos', value: 'desejos' },
  { label: '20% Futuro/Dívidas', value: 'futuro' },
];

const despesasOrdenadas = computed(() => {
  return [...despesas.value].sort((a, b) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });
});

const formularioValido = computed(() => {
  return (
    formDespesa.value.descricao &&
    formDespesa.value.valor > 0 &&
    formDespesa.value.categoria &&
    formDespesa.value.data
  );
});

const formatarValor = (valor: number) => {
  return valor.toFixed(2).replace('.', ',');
};

const formatarData = (data: string) => {
  const date = new Date(data + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

const getCorCategoria = (categoria: string) => {
  const cores: Record<string, string> = {
    necessidades: 'red',
    desejos: 'orange',
    futuro: 'green',
  };
  return cores[categoria] || 'grey';
};

const getIconeCategoria = (categoria: string) => {
  const icones: Record<string, string> = {
    necessidades: 'home',
    desejos: 'favorite',
    futuro: 'savings',
  };
  return icones[categoria] || 'receipt';
};

const getLabelCategoria = (categoria: string) => {
  const labels: Record<string, string> = {
    necessidades: 'Necessidades',
    desejos: 'Desejos',
    futuro: 'Futuro/Dívidas',
  };
  return labels[categoria] || categoria;
};

const abrirDialog = (despesa?: Despesa) => {
  if (despesa) {
    despesaEditando.value = despesa;
    formDespesa.value = {
      descricao: despesa.descricao,
      valor: despesa.valor,
      categoria: despesa.categoria,
      data: despesa.data,
      possuiTermino: despesa.possuiTermino || false,
      dataTermino: despesa.dataTermino || '',
    };
  } else {
    despesaEditando.value = null;
    formDespesa.value = {
      descricao: '',
      valor: 0,
      categoria: '',
      data: new Date().toISOString().split('T')[0],
      possuiTermino: false,
      dataTermino: '',
    };
  }
  dialogAberto.value = true;
};

const fecharDialog = () => {
  dialogAberto.value = false;
  despesaEditando.value = null;
};

const salvarDespesa = () => {
  if (!formularioValido.value) return;

  if (despesaEditando.value) {
    editarDespesa(despesaEditando.value.id, {
      descricao: formDespesa.value.descricao,
      valor: formDespesa.value.valor,
      categoria: formDespesa.value.categoria as
        | 'necessidades'
        | 'desejos'
        | 'futuro',
      data: formDespesa.value.data,
      possuiTermino: formDespesa.value.possuiTermino,
      dataTermino: formDespesa.value.possuiTermino ? formDespesa.value.dataTermino : undefined,
    });
    $q.notify({
      type: 'positive',
      message: 'Despesa atualizada!',
      position: 'top',
    });
  } else {
    adicionarDespesa({
      descricao: formDespesa.value.descricao,
      valor: formDespesa.value.valor,
      categoria: formDespesa.value.categoria as
        | 'necessidades'
        | 'desejos'
        | 'futuro',
      data: formDespesa.value.data,
      possuiTermino: formDespesa.value.possuiTermino,
      dataTermino: formDespesa.value.possuiTermino ? formDespesa.value.dataTermino : undefined,
    });
    $q.notify({
      type: 'positive',
      message: 'Despesa adicionada!',
      position: 'top',
    });
  }

  fecharDialog();
};

const confirmarRemocao = (id: string) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Deseja realmente remover esta despesa?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    removerDespesa(id);
    $q.notify({
      type: 'positive',
      message: 'Despesa removida!',
      position: 'top',
    });
  });
};
</script>
