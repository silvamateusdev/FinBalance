<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div class="row items-center">
            <q-icon name="account_balance_wallet" size="sm" class="q-mr-sm" />
            <span>Finanças 50/30/20</span>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-white text-primary">
      <q-tabs
        v-model="tab"
        dense
        active-color="primary"
        indicator-color="primary"
        class="text-grey"
      >
        <q-tab
          name="home"
          icon="home"
          label="Início"
          @click="$router.push('/')"
        />
        <q-tab
          name="despesas"
          icon="receipt_long"
          label="Despesas"
          @click="$router.push('/despesas')"
        />
        <q-tab
          name="relatorio"
          icon="bar_chart"
          label="Relatório"
          @click="$router.push('/relatorio')"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const tab = ref('home');

watch(
  () => route.name,
  (newRoute) => {
    tab.value = (newRoute as string) || 'home';
  },
  { immediate: true }
);
</script>
