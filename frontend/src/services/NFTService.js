import cachedNFTs from '../config/nft.json';
import cachedNFTsDisplay from '../config/nft-display.json';

export class NFTService {
    static get cachedNFTs () {
        return cachedNFTs.map(nft => ({
            ...nft, 
            ...cachedNFTsDisplay.find(display => display.id === nft.id)
        }));
    } 

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

        if (
            !id
            || !name
            || !description
            || !mosaicId
            || !price
            || isNaN(availableCount)
            || isNaN(totalCount)
            || !image
        ) {
            throw Error('Failed to create listed NFT Object');
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
            image
        } = rawData;

        if (
            !id
            || !name
            || !description
            || !mosaicId
            || isNaN(count)
            || isNaN(size)
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
            image
        };
    };
}
