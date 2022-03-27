import cachedNFTs from '../config/nft.json';
import cachedNFTsDisplay from '../config/nft-display.json';
import { StorageService } from 'garush-storage';
import { KeyGenerator, MetadataType, MosaicId, TransactionHttp, TransactionGroup, RepositoryFactoryHttp } from 'symbol-sdk';

const PARSER = 'ZSU';
const VERSION = 1;
const METADATA_KEY = 'ZSUNFT';

export class NFTService {
    static get cachedNFTs () {
        return cachedNFTs.map(nft => ({
            ...nft, 
            ...cachedNFTsDisplay.find(display => display.id === nft.id)
        }));
    }

    static async getNFTUsingGarushParser(networkConfig, sourceAddress, mosaicId) {
        const repositoryFactory = new RepositoryFactoryHttp(networkConfig.nodeUrl, {
            websocketUrl: `${networkConfig.nodeUrl.replace('http', 'ws')}/ws`,
            networkType: networkConfig.networkType
        });
        const storage = new StorageService(repositoryFactory);
        const metadataEntries = await new RepositoryFactoryHttp(networkConfig.nodeUrl)
            .createMetadataRepository()
            .search({
                targetId: mosaicId,
                metadataType: MetadataType.Mosaic,
            })
            .toPromise();

        const metadataUInt64Key = KeyGenerator.generateUInt64Key(METADATA_KEY);
        const metadata = metadataEntries.data.find((entry) => {
            return entry.metadataEntry.scopedMetadataKey.equals(metadataUInt64Key)
                && entry.metadataEntry.sourceAddress.equals(sourceAddress);
        });

        if (!metadata) {
            throw Error(`Mosaic doesn't have NFT metadata.`);
        }

        const metadataValue = JSON.parse(metadata.metadataEntry.value);

        if (metadataValue.version !== VERSION) {
            throw Error(`Mosaic metadata has wrong version.`);
        }

        const hash = metadataValue.info.rootTransactionHash;
        const file = await storage.loadImageFromHash(hash);

        const base64 = 'data:image/png;base64,' + new Buffer.from(file.content).toString('base64');

        return {
            name: metadataValue.info.name,
            mosaicId: mosaicId.toHex(),
            image: base64
        };
    }

    static async getNFT(networkConfig, sourceAddress, mosaicId) {
        const metadataEntries = await new RepositoryFactoryHttp(networkConfig.nodeUrl)
            .createMetadataRepository()
            .search({
                targetId: mosaicId,
                metadataType: MetadataType.Mosaic,
            })
            .toPromise();

        const metadataUInt64Key = KeyGenerator.generateUInt64Key(METADATA_KEY);
        const metadata = metadataEntries.data.find((entry) => {
            return entry.metadataEntry.scopedMetadataKey.equals(metadataUInt64Key)
                && entry.metadataEntry.sourceAddress.equals(sourceAddress);
        });

        if (!metadata) {
            throw Error(`Mosaic doesn't have NFT metadata.`);
        }

        const metadataValue = JSON.parse(metadata.metadataEntry.value);

        if (metadataValue.version !== VERSION) {
            throw Error(`Mosaic metadata has wrong version.`);
        }

        let nextTransactionHash = metadataValue.hash;
        let aggregateIndex = 0;
        const innerTransactions = [];

        while(nextTransactionHash) {
            const aggregatetransaction = await new TransactionHttp(networkConfig.nodeUrl)
                .getTransaction(nextTransactionHash, TransactionGroup.Confirmed)
                .toPromise();
            
            const headerTransaction = aggregatetransaction.innerTransactions.shift();
            const header = JSON.parse(headerTransaction.message.payload)

            if (header.parser !== PARSER || header.version !== VERSION) {
                throw Error(`Validation transaction header index "${aggregateIndex}". Parser unsupported`);
            }

            if (header.info.index !== aggregateIndex) {
                throw Error(`Validation transaction header index "${aggregateIndex}". Wrong index`);
            }

            if (header.info.mosaicId !== mosaicId.toHex()) {
                throw Error(`Validation transaction header index "${aggregateIndex}". Wrong mosaicId "${header.info.mosaicId}, expected "${mosaicId.toHex()}"`);
            }

            innerTransactions.push(...aggregatetransaction.innerTransactions);
            nextTransactionHash = header.info.nextHash;
            aggregateIndex++;
        }


        const base64 = 'data:image/png;base64' + innerTransactions.reduce((base64, transfer) => base64 + transfer.message.payload, '');

        return {
            name: metadataValue.info.name,
            mosaicId: mosaicId.toHex(),
            image: base64
        };
    };

    static createListedNFTInfo(rawData) {
        const { 
            id,
            name,
            description,
            mosaicId,
            price,
            availableCount,
            totalCount,
            image
        } = rawData;

        if (!id) {
            throw Error(`Failed to create listed NFT Object. Wrong id "${id}"`);
        }
        if (!name) {
            throw Error(`Failed to create listed NFT Object. Wrong name "${name}"`);
        }
        if (!description) {
            throw Error(`Failed to create listed NFT Object. Wrong description "${description}"`);
        }
        if (!mosaicId) {
            throw Error(`Failed to create listed NFT Object. Wrong mosaicId "${mosaicId}"`);
        }
        if (!price) {
            throw Error(`Failed to create listed NFT Object. Wrong price "${price}"`);
        }
        if (isNaN(availableCount)) {
            throw Error(`Failed to create listed NFT Object. Wrong availableCount "${availableCount}"`);
        }
        if (isNaN(totalCount)) {
            throw Error(`Failed to create listed NFT Object. Wrong totalCount "${totalCount}"`);
        }
        if (!image) {
            throw Error(`Failed to create listed NFT Object. Wrong image "${image}"`);
        }

        return {
            id,
            name,
            description,
            mosaicId,
            price,
            availableCount,
            totalCount,
            image
        };
    };

    static createOwnedNFTInfo(rawData) {
        const { 
            id,
            name,
            description,
            mosaicId,
            count,
            position,
            size,
            price,
            image
        } = rawData;

        if (
            !id
            || !name
            || !description
            || !mosaicId
            || isNaN(count)
            || isNaN(size)
            || isNaN(price)
            || !image
        ) {
            throw Error('Failed to create owned NFT Object');
        }

        return {
            id,
            name,
            description,
            mosaicId,
            count,
            position,
            size,
            price,
            image
        };
    };
}
