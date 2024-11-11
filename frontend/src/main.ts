import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Qui from '@qvant/qui-max';

const app = createApp(App);

app.use(Qui);

app.use(router);

app.mount('#app');
