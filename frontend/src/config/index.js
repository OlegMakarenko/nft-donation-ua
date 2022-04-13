import configMainnet from './config.json';
import configTestnet from './config-testnet.json';
import nftMainnet from './nft.json';
import nftTestnet from './nft-testnet.json';
export {default as nftDisplay} from './nft-display.json';
export {default as exchanges} from './exchanges.json';

export const config = process.env.NETWORK === 'testnet' ? configTestnet : configMainnet;
export const nft = process.env.NETWORK === 'testnet' ? nftTestnet : nftMainnet;
