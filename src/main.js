
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify'; // Assuming you have a vuetify plugin file
import { loadFonts } from './plugins/webfontloader'; 
// Assuming you have a web font loader plugin
// Load fonts using your custom plugin
loadFonts();

// Import Vuetify with French locale support


// Create Vue application instance
const app = createApp(App);

// Use Vue Router and Vuex store
app.use(router).use(store);

// Configure Vuetify with French locale
app.use(vuetify, {

});

// Mount the app to #app element in the DOM
app.mount('#app');