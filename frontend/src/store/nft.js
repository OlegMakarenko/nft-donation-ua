import { Address, MosaicId, PublicAccount, TransactionType } from 'symbol-sdk';
import * as config from '../config/config.json';
import { BlockchainService } from '../services/BlockchainService';
import { NFTService } from '../services/NFTService';
import { stringToCoordArray } from '../utils';

export default {
	namespaced: true,

	state: {
		isListedNFTsLoading: false,
		isListedNFTsError: false,
		listedNFTs: []
	},

	getters: {
		cachedNFTs: () => NFTService.cachedNFTs,
		listedNFTs: state => state.listedNFTs,
		isListedNFTsLoading: state => state.isListedNFTsLoading,
		isListedNFTsError: state => state.isListedNFTsError
	},

	mutations: {
		isListedNFTsLoading: (state, value) => {
			state.isListedNFTsLoading = value;
		},
		isListedNFTsError: (state, value) => {
			state.isListedNFTsError = value;
		},
		listedNFTs: (state, value) => {
			state.listedNFTs = value;
		},
	},

	actions: {
		loadNFTDetailsByMosaicId: async ({ state, rootGetters }, rawMosaicId) => {
			console.log(`[api/loadByMosaicId] Fetching NFT by mosaicId = ${rawMosaicId}`);
			const mosaicId = new MosaicId(rawMosaicId);
			const networkConfig = rootGetters['api/networkConfig'];
			const cachedNFTs = rootGetters['nft/cachedNFTs'];
			const cachedNFT = cachedNFTs.find(NFT => new MosaicId(NFT.mosaicId).equals(mosaicId));
			
			if(!cachedNFT) {
				throw Error(`NFT does not exist`)
			}

			const publicKey = config.MAIN_ACCOUNT_PUBLIC_KEY;
			const mainAccount = PublicAccount.createFromPublicKey(publicKey, networkConfig.networkType);
			const mainAccountMosiacs = await BlockchainService.getAccountMosaics(networkConfig, mainAccount.address);
			const mosaic = mainAccountMosiacs.find(mosaic => mosaic.mosaicInfo.id.equals(mosaicId));

			const loadedNFT = await NFTService.getNFTUsingGarushParser(networkConfig, mainAccount.address, mosaicId);
            
			let availableCount = 0;
			let totalCount = 0;
			
			if (mosaic) {
				availableCount = mosaic.amount.compact();
				totalCount = mosaic.mosaicInfo.supply.compact();
			} else {
				const mosaicInfo = await BlockchainService.getMosaicInfos(networkConfig, [mosaicId]);
				totalCount = mosaicInfo[0] ? mosaicInfo[0].supply.compact() : 0;
			}

			return NFTService.createListedNFTInfo({
				...cachedNFT,
				...loadedNFT,
				totalCount,
				availableCount
			})
			
		},

		getCachedNFTDetailsByMosaicId: ({ rootGetters }, rawMosaicId) => {
			console.log(`[api/getCachedNFTDetailsByMosaicId] getting by mosaicId = ${rawMosaicId}`);
			const mosaicId = new MosaicId(rawMosaicId);
			const cachedNFTs = rootGetters['nft/cachedNFTs'];
			const cachedNFT = cachedNFTs.find(NFT => new MosaicId(NFT.mosaicId).equals(mosaicId));
			
			if(!cachedNFT) {
				throw Error(`NFT does not exist`)
			}
            
			const availableCount = 0;
			const totalCount = 0;

			return NFTService.createListedNFTInfo({
				...cachedNFT,
				totalCount,
				availableCount
			});
		},

		loadListedNFTs: async ({ commit, rootGetters }) => {
			console.log(`[api/loadListedNFTs] Fetching NFT availability`);

			try {
				commit('isListedNFTsLoading', true);
				commit('isListedNFTsError', false);

				const networkConfig = rootGetters['api/networkConfig'];
				const cachedNFTs = rootGetters['nft/cachedNFTs'];
				const publicKey = config.MAIN_ACCOUNT_PUBLIC_KEY;
				const mainAccount = PublicAccount.createFromPublicKey(publicKey, networkConfig.networkType);
				const mainAccountMosiacs = await BlockchainService.getAccountMosaics(networkConfig, mainAccount.address);
				
				const mainAccountMosaicsMap = {};
				for (const mosaic of mainAccountMosiacs) {
					mainAccountMosaicsMap[mosaic.mosaicInfo.id.toHex()] = mosaic;
				}
	
				const listedNFTs = [];
				for (const cachedNFT of cachedNFTs) {
					const mosaic = mainAccountMosaicsMap[cachedNFT.mosaicId];
					let availableCount = 0;
					let totalCount = 0;
					
					if (mosaic) {
						availableCount = mosaic.amount.compact();
						totalCount = mosaic.mosaicInfo.supply.compact();
					} else {
						const mosaicId = new MosaicId(cachedNFT.mosaicId);
						const mosaicInfo = await BlockchainService.getMosaicInfos(networkConfig, [mosaicId]);
						totalCount = mosaicInfo[0] ? mosaicInfo[0].supply.compact() : 0;
					}
	
					listedNFTs.push(NFTService.createListedNFTInfo({
						...cachedNFT,
						totalCount,
						availableCount
					}));
				}
	
				commit('listedNFTs', listedNFTs);
				commit('isListedNFTsLoading', false);
				commit('isListedNFTsError', false);
			} catch (e) {
				console.error(`[api/loadListedNFTs] Error: failed to fetch listed NFTs`, e);
	
				commit('isListedNFTsLoading', false);
				commit('isListedNFTsError', true);
			}
		},

		loadAccountNFTMapCoords: async ({rootGetters}, rawAddress) => {
			console.log(`[api/loadAccountNFTMapCoords] Load NFTs by address = ${rawAddress}`);
			const networkConfig = rootGetters['api/networkConfig'];

			const address = Address.createFromRawAddress(rawAddress);
			const accountInfo = await BlockchainService.getAccountInfo(networkConfig, rawAddress);
			const publicKey = accountInfo.publicKey;

			const accountTransactions = await BlockchainService.getTransactions(
				networkConfig, 
				{ address },
				'all',
				1,
				15,
				[],
			);

			let coordString = accountTransactions.reduce(
				(accumulator, tx) => accumulator + tx.transactionInfo.hash, 
				address.encoded()
			);

			if (publicKey !== '0000000000000000000000000000000000000000000000000000000000000000') {
				coordString = publicKey + coordString + publicKey;
			}

			coordString = coordString + address.encoded();
			
			return stringToCoordArray(coordString);
		},

		loadAccountNFTs: async ({ state, rootGetters }, rawAddress) => {
			console.log(`[api/loadAccountNFTs] Load NFTs by address = ${rawAddress}`);
			const networkConfig = rootGetters['api/networkConfig'];
			const cachedNFTs = rootGetters['nft/cachedNFTs'];
			const publicKey = config.MAIN_ACCOUNT_PUBLIC_KEY;
			const mainAccount = PublicAccount.createFromPublicKey(publicKey, networkConfig.networkType);
			const userAddress = Address.createFromRawAddress(rawAddress);

			const cachedNFTsMap = {};
			for (const cachedNFT of cachedNFTs) {
				cachedNFTsMap[cachedNFT.mosaicId] = cachedNFT;
			}

			const userMosaics = await BlockchainService.getAccountMosaics(networkConfig, userAddress)

			const ownedNFTInfos = userMosaics
				.filter(mosaic => mosaic.mosaicInfo.ownerAddress.equals(mainAccount.address) && !!cachedNFTsMap[mosaic.mosaicInfo.id.toHex()])
				.map(mosaic => NFTService.createOwnedNFTInfo({
					...cachedNFTsMap[mosaic.mosaicInfo.id.toHex()],
					count: mosaic.amount.compact()
				}));

			return ownedNFTInfos.sort((a, b) => b.size - a.size);
		},
	}
};
