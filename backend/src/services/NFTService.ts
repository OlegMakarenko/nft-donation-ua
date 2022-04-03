import * as NFTListMainnet from '@src/assets/nfts.json';
import * as NFTListTestnet from '@src/assets/nfts-testnet.json';
const NFTList = process.env.network === 'testnet' ? NFTListTestnet : NFTListMainnet;

interface NFT {
    id: number;
    name: string;
    description: string;
    mosaicId: string;
    price: number;
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
}
