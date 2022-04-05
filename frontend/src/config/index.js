import configMainnet from './config.json';
import configTestnet from './config-testnet.json';
import nftMainnet from './nft.json';
import nftTestnet from './nft-testnet.json';
export {default as nftDisplay} from './nft-display.json';

export const config = process.env.NODE_ENV === 'testnet' ? configTestnet : configMainnet;
export const nft = process.env.NODE_ENV === 'testnet' ? nftTestnet : nftMainnet;
