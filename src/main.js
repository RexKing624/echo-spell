import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('EchoSpell offline cache could not start.', error);
    });
  });
}
