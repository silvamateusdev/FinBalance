import { createApp } from 'vue';
import { Quasar, Notify, Dialog, LocalStorage } from 'quasar';

import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    LocalStorage,
  },
  config: {
    notify: {},
  },
  lang: {
    isoName: 'pt-BR',
  },
});

app.use(router);

app.mount('#q-app');
