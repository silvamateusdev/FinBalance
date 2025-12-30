<template>
  <q-page class="q-pa-md">
    <!-- Configuração de Renda -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="attach_money" color="primary" />
          Configurar Renda Líquida
        </div>
        <p class="text-caption text-grey-7 q-mb-md">
          Informe o valor que realmente cai na sua conta após os descontos.
        </p>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-8">
            <q-input
              v-model.number="novaRenda"
              type="number"
              label="Renda Líquida Mensal"
              prefix="R$"
              outlined
              dense
              :rules="[(val) => val > 0 || 'Informe um valor válido']"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-btn
              label="Salvar"
              color="primary"
              icon="save"
              class="full-width"
              @click="salvarRenda"
              :disable="!novaRenda || novaRenda <= 0"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumo do Método 50/30/20 -->
    <q-card v-if="resumo.rendaLiquida > 0">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="pie_chart" color="primary" />
          Método 50/30/20
        </div>

        <!-- Necessidades (50%) -->
        <div class="q-mb-lg">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-subtitle2">
              <q-chip color="red" text-color="white" dense>
                50% Necessidades
              </q-chip>
            </div>
            <div class="text-body2 text-weight-bold">
              R$ {{ formatarValor(resumo.necessidades.orcado) }}
            </div>
          </div>
          <q-linear-progress
            :value="resumo.necessidades.percentual / 50"
            size="20px"
            :color="resumo.necessidades.percentual > 50 ? 'negative' : 'red'"
            class="q-mb-xs"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                text-color="black"
                :label="`${resumo.necessidades.percentual.toFixed(1)}%`"
              />
            </div>
          </q-linear-progress>
          <div class="row justify-between text-caption">
            <span>Gasto: R$ {{ formatarValor(resumo.necessidades.gasto) }}</span>
            <span
              :class="
                resumo.necessidades.restante < 0 ? 'text-negative' : 'text-positive'
              "
            >
              Restante: R$ {{ formatarValor(resumo.necessidades.restante) }}
            </span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Aluguel, contas, supermercado, transporte, saúde
          </div>
        </div>

        <!-- Desejos (30%) -->
        <div class="q-mb-lg">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-subtitle2">
              <q-chip color="orange" text-color="white" dense>
                30% Desejos
              </q-chip>
            </div>
            <div class="text-body2 text-weight-bold">
              R$ {{ formatarValor(resumo.desejos.orcado) }}
            </div>
          </div>
          <q-linear-progress
            :value="resumo.desejos.percentual / 30"
            size="20px"
            :color="resumo.desejos.percentual > 30 ? 'negative' : 'orange'"
            class="q-mb-xs"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                text-color="black"
                :label="`${resumo.desejos.percentual.toFixed(1)}%`"
              />
            </div>
          </q-linear-progress>
          <div class="row justify-between text-caption">
            <span>Gasto: R$ {{ formatarValor(resumo.desejos.gasto) }}</span>
            <span
              :class="
                resumo.desejos.restante < 0 ? 'text-negative' : 'text-positive'
              "
            >
              Restante: R$ {{ formatarValor(resumo.desejos.restante) }}
            </span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Restaurantes, streaming, viagens, hobbies, presentes
          </div>
        </div>

        <!-- Futuro (20%) -->
        <div class="q-mb-md">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-subtitle2">
              <q-chip color="green" text-color="white" dense>
                20% Futuro/Dívidas
              </q-chip>
            </div>
            <div class="text-body2 text-weight-bold">
              R$ {{ formatarValor(resumo.futuro.orcado) }}
            </div>
          </div>
          <q-linear-progress
            :value="resumo.futuro.percentual / 20"
            size="20px"
            :color="resumo.futuro.percentual > 20 ? 'negative' : 'green'"
            class="q-mb-xs"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                text-color="black"
                :label="`${resumo.futuro.percentual.toFixed(1)}%`"
              />
            </div>
          </q-linear-progress>
          <div class="row justify-between text-caption">
            <span>Gasto: R$ {{ formatarValor(resumo.futuro.gasto) }}</span>
            <span
              :class="
                resumo.futuro.restante < 0 ? 'text-negative' : 'text-positive'
              "
            >
              Restante: R$ {{ formatarValor(resumo.futuro.restante) }}
            </span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Reserva de emergência, investimentos, quitação de dívidas
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Resumo Total -->
        <div class="row justify-between items-center">
          <div>
            <div class="text-caption text-grey-7">Total Gasto</div>
            <div class="text-h6">R$ {{ formatarValor(resumo.totalGasto) }}</div>
          </div>
          <div class="text-right">
            <div class="text-caption text-grey-7">Saldo</div>
            <div
              class="text-h6"
              :class="
                resumo.saldoTotal < 0 ? 'text-negative' : 'text-positive'
              "
            >
              R$ {{ formatarValor(resumo.saldoTotal) }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Mensagem inicial -->
    <q-card v-else class="bg-grey-2">
      <q-card-section class="text-center">
        <q-icon name="info" size="xl" color="grey-6" class="q-mb-md" />
        <div class="text-body1 text-grey-7">
          Configure sua renda líquida mensal para começar a usar o método
          50/30/20
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useFinancas } from '../composables/useFinancas';

const $q = useQuasar();
const { config, resumo, atualizarRenda } = useFinancas();

const novaRenda = ref(config.value.rendaLiquida);

const formatarValor = (valor: number) => {
  return valor.toFixed(2).replace('.', ',');
};

const salvarRenda = () => {
  atualizarRenda(novaRenda.value);
  $q.notify({
    type: 'positive',
    message: 'Renda atualizada com sucesso!',
    position: 'top',
  });
};
</script>
