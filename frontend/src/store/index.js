import Vue from 'vue';
import Vuex from 'vuex';
import api from './api';
import nft from './nft';
import ui from './ui';


Vue.use(Vuex);

export default new Vuex.Store({
	// Disable use-strict mode because it fails with the SDK listener.
	strict: false,
	modules: {
		api,
		nft,
		ui,
	},
	actions: {
		async initialize({ dispatch }, route) {
			await dispatch('api/initialize', null, { root: true });
		}
	}
});
