import {
    Account,
    Mosaic,
    MosaicId,
    TransferTransaction,
    UInt64,
} from 'symbol-sdk';
import * as winston from 'winston';
import * as config from '@src/config';
import { BlockchainService, NetworkConfig } from '@src/services/BlockchainService';
import { Logger } from '@src/infrastructure';
import { basename, showDuration, sleep, depositMosaicSpamFilter, getNativeMosaicAmount } from '@src/utils';
import { NFTService } from './NFTService';

const MESSAGE_TEXT = 'Donation received, thank you! Order: ';
const MESSAGE_TEXT_WRONG_ID =
    'Donation received, thank you! Sorry, we cannot send you the NFT. The number you provided in the message is wrong. Order: ';
const MESSAGE_TEXT_NOT_ENOUGH =
    'Donation received, thank you! Sorry, we cannot send you the NFT. The amount you transferred is less than NFT price. Order: ';
const MESSAGE_TEXT_NO_MORE =
    'Donation received, thank you! Sorry, we cannot send you the NFT. This NFT is out of stock. Order: ';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class DepositService {
    private isRunning: boolean;
    private interval: number;
    private networkConfig: NetworkConfig = {
        nativeMosaicId: new MosaicId(config.symbol.NATIVE_MOSAIC_ID),
        epochAdjustment: config.symbol.EPOCH_ADJUSTMENT,
        networkType: config.symbol.NETWORK_TYPE,
        generationHash: config.symbol.GENERATION_HASH,
        nodeUrl: ''
    }

    constructor(_interval: number) {
        this.isRunning = false;
        this.interval = _interval;
    }

    public start = async () => {
        logger.info(`[Start] Starting task. Timeout: ${this.interval}`);
        const startTime = new Date().getTime();

        try {
            this.isRunning = true;

            if (this.isRunning) {
                await this.loadNetworkConfig();
                const processedHashes = await this.getProcessedHashes();
                const deposits = await this.getDeposits(processedHashes);
                for (const deposit of deposits) {
                    await this.processDesposit(deposit);
                }

                // Repeat the task
                setTimeout(() => this.start(), this.interval);
            }
            logger.info(`[Start] Task finished. \tTime elapsed: ${showDuration(startTime - new Date().getTime())}`);
        } catch (e) {
            logger.error(
                `[Start] Task failed. \tError: ${(e as Error).message}. \tTime elapsed: ${showDuration(
                    startTime - new Date().getTime(),
                )}. \tRestarting task...`,
            );

            // If error - wait a bit and restart the task
            await sleep(1000);
            this.stop();
            this.start();
        }
    };

    public stop = () => {
        logger.info(`[Stop] Stopping task`);
        this.isRunning = false;
    };

    // Load node URL and other stuff from the list of nodes
    private loadNetworkConfig = async () => {
        logger.info(`[loadNetworkConfig] loading network properties`);
        const nodes = config.symbol.NODES;
        const networkType = config.symbol.NETWORK_TYPE;
        this.networkConfig = await BlockchainService.connectToNode(nodes, networkType);
    };

    // Fetch incoming transactions to main account. Filter them by minimum amount of 10 XYM. Fetch page by page until find tx with hash in the list of processedHashes.
    private getDeposits = async (processedHashes: string[]): Promise<TransferTransaction[]> => {
        logger.info(`[getDeposits] Fetching deposits`);
        const account = Account.createFromPrivateKey(config.symbol.MAIN_ACCOUNT_PRIVATE_KEY, this.networkConfig.networkType);
        const allDeposits = [];

        let pageNumber = 1;
        while (true) {
            // Fetch main account incoming transactions by pageNumber
            const transactions = await BlockchainService.getTransactions(this.networkConfig, account.publicAccount, 'received', pageNumber);

            // If we reach the last page - stop the loop
            if (transactions.length === 0) {
                break;
            }

            // Filter transactions. Transaction should 10 XYM or more
            const deposits = transactions.filter((tx) => depositMosaicSpamFilter(tx.mosaics, this.networkConfig.nativeMosaicId));

            // Filter transactions. Do not include transactions which hashes are already in the processedHashes list
            const unprocessedDeposits = deposits.filter((tx) => !processedHashes.includes(tx.transactionInfo?.hash as string));
            allDeposits.push(...unprocessedDeposits);

            // If we reach the page which has already processed deposits - stop the loop
            if (unprocessedDeposits.length !== deposits.length) {
                break;
            }

            ++pageNumber;
        }

        logger.info(`[getDeposits] Fetched deposits: ${allDeposits.length}`);

        return allDeposits;
    };

    // Process deposits. If deposit has correct nftId and amount - send the NFT to deposit signer account
    private processDesposit = async (deposit: TransferTransaction) => {
        logger.info(`[processDesposit] Processing deposit`);
        const privateKey = config.symbol.MAIN_ACCOUNT_PRIVATE_KEY;
        const account = Account.createFromPrivateKey(privateKey, this.networkConfig.networkType);
        const recipientAddress = deposit.signer!.address;
        const amount = getNativeMosaicAmount(deposit.mosaics, this.networkConfig.nativeMosaicId);
        const message = deposit.message.payload.replace(/\D/g, '');
        const nftId = Number(message);
        let nft;

        try {
            // Try to find NFT by id from deposit's message
            nft = NFTService.getNFTById(nftId);
        } catch (e) {
            // If we failed to find NFT - send thank you transaction
            logger.error(`[processDesposit] failed to get NFT. ${(e as Error).message}`);
            BlockchainService.sendTransfer(
                this.networkConfig,
                privateKey, 
                recipientAddress, 
                MESSAGE_TEXT_WRONG_ID + deposit.transactionInfo!.hash, 
                []
            );

            return;
        }

        const mosaics: Mosaic[] = [];
        const requestedCount = Math.floor(amount / nft.price);

        // If we find the NFT but transferred amound is not enough - send thank you transaction
        if (requestedCount === 0) {
            BlockchainService.sendTransfer(
                this.networkConfig,
                privateKey,
                recipientAddress, 
                MESSAGE_TEXT_NOT_ENOUGH + deposit.transactionInfo!.hash, 
                mosaics
            );

            return;
        }

        const availableBalance = await BlockchainService.getAccountMosaicBalance(
            this.networkConfig, 
            account.publicAccount, 
            new MosaicId(nft.mosaicId)
        );
        const availableCount = availableBalance.compact();
        
        // If requested NFT is out of stock - send thank you transaction
        if (availableCount === 0) {
            BlockchainService.sendTransfer(
                this.networkConfig,
                privateKey, 
                recipientAddress, 
                MESSAGE_TEXT_NO_MORE + deposit.transactionInfo!.hash, 
                mosaics
            );

            return;
        }

        const count = requestedCount <= availableCount ? requestedCount : availableCount;
        mosaics.push(new Mosaic(new MosaicId(nft.mosaicId), UInt64.fromUint(count)));
        
        // Send NFT(s)
        BlockchainService.sendTransfer(
            this.networkConfig,
            privateKey, 
            recipientAddress, 
            MESSAGE_TEXT + deposit.transactionInfo!.hash, 
            mosaics
        );
    };

    // Get the list of hashes of deposits which are already processed
    private getProcessedHashes = async () => {
        logger.info(`[getProcessedHashes] Getting processed hashes`);
        const account = Account.createFromPrivateKey(config.symbol.MAIN_ACCOUNT_PRIVATE_KEY, this.networkConfig.networkType);

        // Fetch outgoing transactions
        const transactions = await BlockchainService.getTransactions(this.networkConfig, account.publicAccount, 'sent', 1, true);
        
        // Extract hash from transaction message
        const processedHashes = transactions
            .map((transaction) => transaction.message.payload.substring(transaction.message.payload.length - 64))
            .filter((messgae) => messgae.length === 64);

        logger.info(`[getProcessedHashes] Total processed hashes from the page: ${processedHashes.length}/100`);

        return processedHashes;
    };
}
