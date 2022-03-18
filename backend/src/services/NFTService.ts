import {
    AggregateTransaction,
    KeyGenerator,
    Metadata,
    MetadataType,
    MosaicId,
    RepositoryFactoryHttp,
    TransactionGroup,
    TransactionHttp,
    TransactionType,
    TransferTransaction,
} from 'symbol-sdk';
import * as winston from 'winston';
import * as config from '@src/config';
import { BlockchainService } from '@src/services/BlockchainService';
import { Logger } from '@src/infrastructure';
import { basename } from '@src/utils';
import * as NFTList from '@src/assets/nfts.json';

const { PARSER, PARSER_VERSION, MOSAIC_METADATA_KEY } = config.appConfig;

const logger: winston.Logger = Logger.getLogger(basename(__filename));

interface NFT {
    id: number;
    name: string;
    description: string;
    mosaicId: string;
    price: number;
    author: string;
}

interface NFTFileTransactionHeader {
    parser: string;
    version: number;
    info: NFTFileTransactionInfo;
}

interface NFTFileTransactionInfo {
    author: string;
    format: string;
    index: number;
    mosaicId: string;
    nextHash: string;
}
export class NFTService {
    public static getNFTList(): NFT[] {
        return NFTList;
    }

    public static getNFTById(nftId: number): NFT {
        const nft = NFTList.find((nft) => nftId === nft.id);

        if (!nft) {
            throw Error(`Failed to get NFT with ${nftId}. Not found`);
        }

        return nft;
    }

    public static async getNFTImageBase64(nftId: number): Promise<string> {
        const nft = this.getNFTById(nftId);
        const nodes = config.symbol.NODES;
        const networkType = config.symbol.NETWORK_TYPE;
        const networkConfig = await BlockchainService.connectToNode(nodes, networkType);

        // get mosaic metadata
        const metadataEntries = await new RepositoryFactoryHttp(networkConfig.nodeUrl)
            .createMetadataRepository()
            .search({
                targetId: new MosaicId(nft.mosaicId),
                metadataType: MetadataType.Mosaic,
            })
            .toPromise();

        const mosaicMetadataUInt64Key = KeyGenerator.generateUInt64Key(MOSAIC_METADATA_KEY);
        const metadata = metadataEntries.data.find((entry: Metadata) => {
            return entry.metadataEntry.scopedMetadataKey.equals(mosaicMetadataUInt64Key);
        });

        if (!metadata) {
            logger.error(`[getNFTImageBase64] mosaic doesn't have NFT metadata.`);
            throw Error(`Failed to get NFT image. Mosaic doesn't have NFT metadata.`);
        }

        const metadataValue = JSON.parse(metadata.metadataEntry.value);

        if (metadataValue.version !== PARSER_VERSION) {
            logger.error(`[getNFTImageBase64] mosaic metadata has wrong version.`);
            throw Error(`Failed to get NFT image. Mosaic metadata has wrong version.`);
        }

        const rootTransactionHash = metadataValue.hash;

        const aggregateTransaction1 = ((await new TransactionHttp(networkConfig.nodeUrl)
            .getTransaction(rootTransactionHash, TransactionGroup.Confirmed)
            .toPromise()) as unknown) as AggregateTransaction;

        if (aggregateTransaction1.type !== TransactionType.AGGREGATE_COMPLETE) {
            logger.error(`[getNFTImageBase64] fetched tx type is not Aggregate.`);
            throw Error('Failed to get NFT image. Fetched tx type is not aggregate.');
        }

        const innerTransactions = [...aggregateTransaction1.innerTransactions] as TransferTransaction[];
        const rootTransferTransaction = innerTransactions.shift();

        if (!rootTransferTransaction) {
            logger.error(`[getNFTImageBase64] fetched aggregate has not root transfer.`);
            throw Error('Failed to get NFT image. Fetched aggregate has not root transfer.');
        }

        const rawHeader = rootTransferTransaction.message.payload;
        const header = JSON.parse(rawHeader) as NFTFileTransactionHeader;

        if (header.parser !== PARSER || header.version !== PARSER_VERSION) {
            logger.error(`[getNFTImageBase64] fetched aggregate has wrong header.`);
            throw Error('Failed to get NFT image. Fetched aggregate has wrong header.');
        }

        if (header.info.mosaicId !== nft.mosaicId) {
            logger.error(`[getNFTImageBase64] mosaicId is not verified.`);
            throw Error('Failed to get NFT image. MosaicId is not verified.');
        }

        if (header.info.index !== 0) {
            logger.error(`[getNFTImageBase64] fetched aggregate has wrong index.`);
            throw Error('Failed to get NFT image. Fetched aggregate has wrong index.');
        }

        const nextHash = header.info.nextHash;

        if (nextHash) {
            const aggregateTransaction2 = ((await new TransactionHttp(networkConfig.nodeUrl)
                .getTransaction(nextHash, TransactionGroup.Confirmed)
                .toPromise()) as unknown) as AggregateTransaction;

            if (aggregateTransaction2.type !== TransactionType.AGGREGATE_COMPLETE) {
                logger.error(`[getNFTImageBase64] fetched tx 2 type is not Aggregate.`);
                throw Error('Failed to get NFT image. Fetched tx 2 type is not aggregate.');
            }

            const innerTransactions2 = [...aggregateTransaction2.innerTransactions] as TransferTransaction[];
            innerTransactions2.shift();

            innerTransactions.push(...innerTransactions2);
        }

        let base64 = '';

        innerTransactions.forEach((transfer) => (base64 += transfer.message.payload));

        return base64;
    }
}
