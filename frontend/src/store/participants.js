import { PublicAccount, TransactionType } from 'symbol-sdk';
import { config } from '../config';
import { BlockchainService } from '../services/BlockchainService';
import { sleep } from '../utils';

export default {
	namespaced: true,

	state: {
		accounts: [],
		isError: false,
		isLoading: true,
		percent: 10,
		total: 0,
		stop: false
	},

	getters: {
		accounts: state => state.accounts,
		isError: state => state.isError,
		isLoading: state => state.isLoading,
		percent: state => state.percent,
		total: state => state.total,
		stop: state => state.stop
	},

	mutations: {
		accounts: (state, value) => {
			state.accounts = value;
		},
		isLoading: (state, value) => {
			state.isLoading = value;
		},
		percent: (state, value) => {
			state.percent = value;
		},
		total: (state, value) => {
			state.total = value;
		},
		stop: (state, value) => {
			state.stop = value;
		},
	},

	actions: {
		load: async ({ state, rootGetters, commit }) => {
			console.log(`[participants/load]`);
			const networkConfig = rootGetters['api/networkConfig'];
			const publicKey = config.MAIN_ACCOUNT_PUBLIC_KEY;
			const mainAccount = PublicAccount.createFromPublicKey(publicKey, networkConfig.networkType);
			const participantMap = {};
			let pageNumber = 1;
			let endOFRecords = false;

			commit('total', 0);
			commit('stop', false);
	
			while(true) {
				commit('percent', state.percent += 10);
				console.log('[participants/load] Fetching transaction page #', pageNumber);
				await sleep(100);
				const transactions = await BlockchainService.getTransactions(
					networkConfig, 
					mainAccount,
					'received',
					pageNumber,
					100
				);

				transactions.forEach(tx => {
					const address = tx.signer.address.plain();
					const nativeMosaic = tx.mosaics.find(mos => mos.id.equals(networkConfig.nativeMosaicId));

					if (nativeMosaic) {
						const amount = nativeMosaic.amount / Math.pow(10, 6);

						commit('total', state.total += amount);
						participantMap[address] 
							? participantMap[address].amount += amount
							: participantMap[address] = { address, amount: amount };
					}

					if (tx.recipientAddress && tx.signer.address.equals(mainAccount.address)) {
						endOFRecords = true;
					}
				})
				
				pageNumber ++;

				if (transactions.length === 0 || state.stop || endOFRecords)
					break;
			}

			const participants = Object.values(participantMap);

			commit('accounts', participants.sort((a, b) => b.amount - a.amount));
			commit('isLoading', false);
		},

		stop: async ({ commit }) => {
			console.log(`[participants/stop]`);
			commit('stop', true);
		},
	}
};
