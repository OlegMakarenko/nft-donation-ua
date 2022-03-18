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
import * as winston from 'winston';
import * as config from '@src/config';
import { Logger } from '@src/infrastructure';
import { basename } from '@src/utils';

const REQUEST_TIMEOUT = 5000;
const logger: winston.Logger = Logger.getLogger(basename(__filename));

interface SearchCriteria {
    pageNumber: number;
    pageSize: number;
    order: Order;
    type: TransactionType[];
    group: TransactionGroup;
    signerPublicKey?: string;
    recipientAddress?: Address;
    address?: Address;
}

export interface NetworkConfig {
    nodeUrl: string;
    networkType: NetworkType;
    nativeMosaicId: MosaicId;
    epochAdjustment: number;
    generationHash: string;
}

export class BlockchainService {
    // Try to connect to node from provided node list. Return node URL and its network config
    public static connectToNode = async (nodes: string[], networkType: NetworkType): Promise<NetworkConfig> => {
        logger.info(`[connectToNode] Connecting to node`);
        let selectedNode: string | null = null;
        let networkConfiguration: NetworkConfiguration | null = null;

        for (const nodeUrl of nodes) {
            logger.info(`[connectToNode] Trying "${nodeUrl}"`);
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
                logger.error(`[connectToNode] failed to connect. \tError: ${(e as Error).message}.`);
            }
        }

        if (!selectedNode || !networkConfiguration) {
            logger.error(`[connectToNode] failed to connect to any of provided nodes.`);
            throw Error('Failed to connect to any of provided nodes.');
        }

        const nativeMosaicId = await BlockchainService.getNetworkCurrency(selectedNode);
        const generationHash = networkConfiguration.network.generationHashSeed as string;
        const epochAdjustment = parseInt(networkConfiguration.network.epochAdjustment as string);

        return {
            nodeUrl: selectedNode,
            networkType,
            nativeMosaicId,
            epochAdjustment,
            generationHash
        };
    };

    public static getNetworkType = (nodeUrl: string): Promise<NetworkType> => {
        try {
            return new NetworkHttp(nodeUrl).getNetworkType().pipe(timeout(REQUEST_TIMEOUT)).toPromise();
        } catch (e) {
            logger.error(`[getNetworkType] failed to network type. \tError: ${(e as Error).message}.`);
            throw e;
        }
    };

    public static getNetworkCurrency = async (nodeUrl: string): Promise<MosaicId> => {
        try {
            const networkCurrency = await new RepositoryFactoryHttp(nodeUrl).getCurrencies().toPromise();
            const mosaicId = networkCurrency.currency.mosaicId;

            if (!mosaicId) {
                throw Error('Node returned emty currency id');
            }

            return mosaicId;
        } catch (e) {
            logger.error(`[getNetworkCurrency] failed to fetch network currency. \tError: ${(e as Error).message}.`);
            throw e;
        }
    };

    public static getNetworkConfiguration = (nodeUrl: string): Promise<NetworkConfiguration> => {
        try {
            return new NetworkHttp(nodeUrl).getNetworkProperties().pipe(timeout(REQUEST_TIMEOUT)).toPromise();
        } catch (e) {
            logger.error(`[getNetworkConfiguration] failed to fetch network configuration. \tError: ${(e as Error).message}.`);
            throw e;
        }
    };

    public static getTransactions = async (
        networkConfig: NetworkConfig,
        account: PublicAccount,
        directionFilter: 'sent' | 'received' | 'all',
        pageNumber = 0,
        unconfirmed = false,
    ): Promise<TransferTransaction[]> => {
        logger.info(`[getTransactions] Getting transactions`);
        const transactionHttp = new TransactionHttp(networkConfig.nodeUrl);
        const searchCriteria: SearchCriteria = {
            pageNumber,
            pageSize: 100,
            order: Order.Desc,
            type: [TransactionType.TRANSFER],
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
            if (!unconfirmed || pageNumber !== 1) {
                return transactionsPage.data as TransferTransaction[];
            }
            const transactionsUnconfirmedPage = await transactionHttp.search(searchCriteria).toPromise();

            return [...transactionsUnconfirmedPage.data, ...transactionsPage.data] as TransferTransaction[];
        } catch (e) {
            logger.error(`[getTransactions] failed to fetch transactions. \tError: ${(e as Error).message}.`);
            throw e;
        }
    };

    public static sendTransfer = async (
        networkConfig: NetworkConfig,
        privateKey: string,
        recipientAddress: Address, 
        message: string, 
        mosaics: Mosaic[],

    ) => {
        logger.info(`[sendTransfer] Sending transfer to ${recipientAddress.pretty()}`);
        const {        
            nodeUrl,
            networkType,
            epochAdjustment,
            generationHash
        } = networkConfig;
        const deadline = Deadline.create(epochAdjustment);
        const maxfee = UInt64.fromUint(config.symbol.MAX_FEE);

        const currentAccount = Account.createFromPrivateKey(privateKey, networkType);
        const transferTransaction = TransferTransaction.create(
            deadline,
            recipientAddress,
            mosaics,
            PlainMessage.create(message),
            networkType,
            maxfee,
        );

        const signedTransaction = currentAccount.sign(transferTransaction, generationHash);
        const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
        const listener = repositoryFactory.createListener();
        const receiptHttp = repositoryFactory.createReceiptRepository();
        const transactionHttp = repositoryFactory.createTransactionRepository();
        const transactionService = new TransactionService(transactionHttp, receiptHttp);

        listener.open().then(() => {
            transactionService.announce(signedTransaction, listener).subscribe(
                (transaction) =>
                    logger.info(
                        `[sendTransfer] Announced transfer to ${recipientAddress.pretty()}. Hash: ${transaction.transactionInfo?.hash}`,
                    ),
                (err) => logger.error(`[sendTransfer] failed to send Transfer Transaction. ${(err as Error).message}`),
                () => listener.close(),
            );
        });
    };

    public static getAccountMosaicBalance = async (
        networkConfig: NetworkConfig, 
        account: PublicAccount, 
        mosaicId: MosaicId
    ): Promise<UInt64> => {
        const repositoryFactoryHttp = new RepositoryFactoryHttp(networkConfig.nodeUrl, {
            networkType: networkConfig.networkType,
            generationHash: networkConfig.generationHash
        });
        const accountRepository = repositoryFactoryHttp.createAccountRepository();
        const mosaicRepository = repositoryFactoryHttp.createMosaicRepository();
        const mosaicAmountViews = await new MosaicService(accountRepository, mosaicRepository)
            .mosaicsAmountViewFromAddress(account.address)
            .toPromise();
        const mosaic = mosaicAmountViews.find(mosaicAmountView => mosaicAmountView.mosaicInfo.id.equals(mosaicId));

        if (!mosaic) {
            return UInt64.fromUint(0);
        }

        return mosaic.amount;
    };
}
