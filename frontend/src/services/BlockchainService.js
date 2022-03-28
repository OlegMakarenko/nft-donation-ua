import {
    Account,
    Address,
    Deadline,
    Mosaic,
    MosaicId,
    MosaicService,
    NetworkConfiguration,
    NetworkHttp,
    NetworkType,
    Order,
    PlainMessage,
    PublicAccount,
    RepositoryFactoryHttp,
    TransactionGroup,
    TransactionHttp,
    TransactionService,
    TransactionType,
    TransferTransaction,
    UInt64,
} from 'symbol-sdk';
import { timeout } from 'rxjs/operators';
import * as config from '../config/config.json';

const REQUEST_TIMEOUT = 5000;

// interface SearchCriteria {
//     pageNumber: number;
//     pageSize: number;
//     order: Order;
//     type: TransactionType[];
//     group: TransactionGroup;
//     signerPublicKey?: string;
//     recipientAddress?: Address;
//     address?: Address;
// }

// export interface NetworkConfig {
//     nodeUrl: string;
//     networkType: NetworkType;
//     nativeMosaicId: MosaicId;
//     epochAdjustment: number;
//     generationHash: string;
// }

export class BlockchainService {
    // Try to connect to node from provided node list. Return node URL and its network config
    static connectToNode = async (nodes, networkType) => {
        console.log(`[connectToNode] Connecting to node`);
        let selectedNode = null;
        let networkConfiguration = null;

        for (const nodeUrl of nodes) {
            console.log(`[connectToNode] Trying "${nodeUrl}"`);
            try {
                const nodeNetworkType = await BlockchainService.getNetworkType(nodeUrl);

                networkConfiguration = await BlockchainService.getNetworkConfiguration(nodeUrl);
                if (!networkConfiguration.network.generationHashSeed || !networkConfiguration.network.epochAdjustment) {
                    throw Error('Node returned corrupted network config. "generationHash" and/or "epochAdjustment" is empty');
                }

                if (nodeNetworkType === networkType) {
                    selectedNode = nodeUrl;
                    break;
                } else {
                    throw Error(`Node returned wrong network type "${nodeNetworkType}".`);
                }
            } catch (e) {
                console.error(`[connectToNode] failed to connect. \tError: ${e.message}.`);
            }
        }

        if (!selectedNode || !networkConfiguration) {
            console.error(`[connectToNode] failed to connect to any of provided nodes.`);
            throw Error('Failed to connect to any of provided nodes.');
        }

        const nativeMosaicId = await BlockchainService.getNetworkCurrency(selectedNode);
        const generationHash = networkConfiguration.network.generationHashSeed;
        const epochAdjustment = parseInt(networkConfiguration.network.epochAdjustment);

        return {
            nodeUrl: selectedNode,
            networkType,
            nativeMosaicId,
            epochAdjustment,
            generationHash
        };
    };

    static getNetworkType = (nodeUrl) => {
        try {
            return new NetworkHttp(nodeUrl).getNetworkType().pipe(timeout(REQUEST_TIMEOUT)).toPromise();
        } catch (e) {
            console.error(`[getNetworkType] failed to network type. \tError: ${e.message}.`);
            throw e;
        }
    };

    static getNetworkCurrency = async (nodeUrl) => {
        try {
            const networkCurrency = await new RepositoryFactoryHttp(nodeUrl).getCurrencies().toPromise();
            const mosaicId = networkCurrency.currency.mosaicId;

            if (!mosaicId) {
                throw Error('Node returned emty currency id');
            }

            return mosaicId;
        } catch (e) {
            console.error(`[getNetworkCurrency] failed to fetch network currency. \tError: ${e.message}.`);
            throw e;
        }
    };

    static getNetworkConfiguration = (nodeUrl) => {
        try {
            return new NetworkHttp(nodeUrl).getNetworkProperties().pipe(timeout(REQUEST_TIMEOUT)).toPromise();
        } catch (e) {
            console.error(`[getNetworkConfiguration] failed to fetch network configuration. \tError: ${e.message}.`);
            throw e;
        }
    };

    static getTransactions = async (
        networkConfig,
        account,
        directionFilter,
        pageNumber = 1,
        pageSize = 100,
        transactionTypes = [TransactionType.TRANSFER]
    ) => {
        console.log(`[getTransactions] Getting transactions`);
        const transactionHttp = new TransactionHttp(networkConfig.nodeUrl);
        const searchCriteria = {
            pageNumber,
            pageSize,
            order: Order.Asc,
            type: transactionTypes,
            group: TransactionGroup.Confirmed,
        };

        switch (directionFilter) {
            case 'sent':
                searchCriteria.signerPublicKey = account.publicKey;
                break;
            case 'received':
                searchCriteria.recipientAddress = account.address;
                break;
            default:
            case 'all':
                searchCriteria.address = account.address;
        }

        try {
            const transactionsPage = await transactionHttp.search(searchCriteria).toPromise();

            return transactionsPage.data;
        } catch (e) {
            console.error(`[getTransactions] failed to fetch transactions. \tError: ${e.message}.`);
            throw e;
        }
    };

    static getAccountInfo = (
        networkConfig, 
        address,
    ) => {
        const repositoryFactoryHttp = new RepositoryFactoryHttp(networkConfig.nodeUrl, {
            networkType: networkConfig.networkType,
            generationHash: networkConfig.generationHash
        });

        return repositoryFactoryHttp
            .createAccountRepository()
            .getAccountInfo(Address.createFromRawAddress(address))
			.toPromise();
    };

    static getAccountMosaics = (
        networkConfig, 
        address,
    ) => {
        const repositoryFactoryHttp = new RepositoryFactoryHttp(networkConfig.nodeUrl, {
            networkType: networkConfig.networkType,
            generationHash: networkConfig.generationHash
        });
        const accountRepository = repositoryFactoryHttp.createAccountRepository();
        const mosaicRepository = repositoryFactoryHttp.createMosaicRepository();
        
        return new MosaicService(accountRepository, mosaicRepository)
            .mosaicsAmountViewFromAddress(address)
            .toPromise();
    };

    static getAccountMosaicBalance = async (
        networkConfig, 
        account, 
        mosaicId
    ) => {
        const mosaicAmountViews = await BlockchainService.getAccountMosaics(networkConfig, account);
        const mosaic = mosaicAmountViews.find(mosaicAmountView => mosaicAmountView.mosaicInfo.id.equals(mosaicId));

        if (!mosaic) {
            return UInt64.fromUint(0);
        }

        return mosaic.amount;
    };

    static getMosaicInfos = async (
        networkConfig,  
        mosaicIds
    ) => {
        const repositoryFactoryHttp = new RepositoryFactoryHttp(networkConfig.nodeUrl, {
            networkType: networkConfig.networkType,
            generationHash: networkConfig.generationHash
        });
        const mosaicInfos = await repositoryFactoryHttp.createMosaicRepository()
            .getMosaics(mosaicIds)
            .toPromise();

        return mosaicInfos;
    };

    static getChainHeight = async (
        networkConfig
    ) => {
        const repositoryFactoryHttp = new RepositoryFactoryHttp(networkConfig.nodeUrl, {
            networkType: networkConfig.networkType,
            generationHash: networkConfig.generationHash
        });
        const chainRepository = repositoryFactoryHttp.createChainRepository()
        const chainInfo = await chainRepository.getChainInfo().toPromise();

        return chainInfo.height;
    };
}
