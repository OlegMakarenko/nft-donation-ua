import BootstrapVue from 'bootstrap-vue';
import 'vue-material-design-icons/styles.css';
import '@mdi/font/css/materialdesignicons.css';
import './styles/fonts.scss';
import './styles/main.scss';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';


window.Vue = Vue;
Vue.config.productionTip = false;
Vue.use(BootstrapVue);

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');

window.onload = function() {
    const root = document.getElementById('app');

    if (root) {
        root.classList.add('visible');
    }
};
