import Lock from './lock';
import { BlockchainService } from '../services/BlockchainService';
import { config } from '../config';
import { PublicAccount } from 'symbol-sdk';

const LOCK = Lock.create();

export default {
	namespaced: true,

	state: {
		initialized: false,
		networkConfig: {
			epochAdjustment: config.EPOCH_ADJUSTMENT,
			networkType: config.NETWORK_TYPE,
			generationHash: config.GENERATION_HASH,
			nodeUrl: ''
		},
		mainAccountAddress: '',
		isLoading: true,
		isError: false,
	},

	getters: {
		getInitialized: state => state.initialized,
		networkConfig: state => state.networkConfig,
		mainAccountAddress: state => state.mainAccountAddress,
		isLoading: state => state.isLoading,
		isError: state => state.isError
	},

	mutations: {
		setInitialized: (state, initialized) => {
			state.initialized = initialized;
		},
		networkConfig: (state, value) => {
			state.networkConfig = value;
		},
		mainAccountAddress: (state, value) => {
			state.mainAccountAddress = value;
		},
		isLoading: (state, value) => {
			state.isLoading = value;
		},
		isError: (state, value) => {
			state.isError = value;
		},
	},

	actions: {
		async initialize({ commit, dispatch, getters }) {
			const callback = async () => {
				try {
					const nodes = config.NODES;
					const networkType = config.NETWORK_TYPE;
					const publicKey = config.MAIN_ACCOUNT_PUBLIC_KEY;

					console.log(`[api/initialize] Fetching Network Config. Network type = ${networkType}`);

					const networkConfig = await BlockchainService.connectToNode(nodes, networkType);
					const mainAccount = PublicAccount.createFromPublicKey(publicKey, networkConfig.networkType);
					const mainAccountAddress = mainAccount.address.plain();
					console.log('[api/initialize] Network Config Loaded.', networkConfig);
					console.log('[api/initialize] Main  account address:', mainAccountAddress);
					
					commit('mainAccountAddress', mainAccountAddress);
					commit('networkConfig', networkConfig);
					commit('isLoading', false);
				}
				catch(e) {
					console.log('[api/initialize] Error', e);

					commit('isError', true);
					commit('isLoading', false);
				}
			};

			await LOCK.initialize(callback, commit, dispatch, getters);
		},
	}
};
