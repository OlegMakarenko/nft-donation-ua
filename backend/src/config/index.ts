import * as config from './config.json';
import * as utils from '@src/utils';
import { NetworkType } from 'symbol-sdk';

interface AppConfig {
    PORT: number;
    DEPOSIT_LISTEN_INTERVAL: number;
    DEPOSIT_MIN_CONFIRMATIONS: number;
    PARSER: string;
    PARSER_VERSION: number;
    MOSAIC_METADATA_KEY: string;
}

interface Symbol {
    MAIN_ACCOUNT_PRIVATE_KEY: string;
    NODES: Array<string>;
    NETWORK_TYPE: number;
    NATIVE_MOSAIC_ID: string;
    EPOCH_ADJUSTMENT: number;
    GENERATION_HASH: string;
    MAX_FEE: number;
}

export interface Config {
    appConfig: AppConfig;
    symbol: Symbol;
}

export const appConfig: AppConfig = {
    PORT: Number(process.env.PORT) || config.PORT,
    DEPOSIT_LISTEN_INTERVAL: Number(process.env.DEPOSIT_LISTEN_INTERVAL) || config.DEPOSIT_LISTEN_INTERVAL,
    DEPOSIT_MIN_CONFIRMATIONS: Number(process.env.DEPOSIT_MIN_CONFIRMATIONS) || config.DEPOSIT_MIN_CONFIRMATIONS,
    PARSER: process.env.PARSER || config.PARSER,
    PARSER_VERSION: Number(process.env.PARSER_VERSION) || config.PARSER_VERSION,
    MOSAIC_METADATA_KEY: process.env.MOSAIC_METADATA_KEY || config.MOSAIC_METADATA_KEY,
};

export const symbol: Symbol = {
    NODES: utils.stringToArray(process.env.NODES) || config.NODES,
    NETWORK_TYPE: Number(process.env.NETWORK_TYPE) || config.NETWORK_TYPE,
    MAIN_ACCOUNT_PRIVATE_KEY: process.env.MAIN_ACCOUNT_PRIVATE_KEY || config.MAIN_ACCOUNT_PRIVATE_KEY,
    NATIVE_MOSAIC_ID: process.env.NATIVE_MOSAIC_ID || config.NATIVE_MOSAIC_ID,
    EPOCH_ADJUSTMENT: Number(process.env.EPOCH_ADJUSTMENT) || config.EPOCH_ADJUSTMENT,
    GENERATION_HASH: process.env.GENERATION_HASH || config.GENERATION_HASH,
    MAX_FEE: Number(process.env.MAX_FEE) || config.MAX_FEE,
};

export const verifyConfig = (cfg: Config): boolean => {
    const errorMessage = 'Invalid config. ';

    if (isNaN(cfg.appConfig.PORT) || cfg.appConfig.PORT <= 0 || cfg.appConfig.PORT >= 10000) {
        throw Error(errorMessage + 'Invalid "PORT"');
    }
    if (isNaN(cfg.appConfig.DEPOSIT_LISTEN_INTERVAL) || cfg.appConfig.DEPOSIT_LISTEN_INTERVAL <= 0) {
        throw Error(errorMessage + 'Invalid "DEPOSIT_LISTEN_INTERVAL"');
    }
    if (isNaN(cfg.appConfig.DEPOSIT_MIN_CONFIRMATIONS) || cfg.appConfig.DEPOSIT_MIN_CONFIRMATIONS <= 0) {
        throw Error(errorMessage + 'Invalid "DEPOSIT_MIN_CONFIRMATIONS"');
    }
    if (cfg.appConfig.PARSER?.length === 0) {
        throw Error(errorMessage + 'Invalid "PARSER"');
    }
    if (isNaN(cfg.appConfig.PARSER_VERSION) || cfg.appConfig.PARSER_VERSION <= 0) {
        throw Error(errorMessage + 'Invalid "PARSER_VERSION"');
    }
    if (cfg.appConfig.MOSAIC_METADATA_KEY?.length === 0) {
        throw Error(errorMessage + 'Invalid "MOSAIC_METADATA_KEY"');
    }
    if (cfg.symbol.NODES.length === 0) {
        throw Error(errorMessage + 'Invalid "NODES"');
    }
    if (cfg.symbol.NETWORK_TYPE !== NetworkType.TEST_NET && cfg.symbol.NETWORK_TYPE !== NetworkType.MAIN_NET) {
        throw Error(errorMessage + 'NETWORK_TYPE');
    }
    if (cfg.symbol.NATIVE_MOSAIC_ID?.length !== 16) {
        throw Error(errorMessage + 'Invalid "NATIVE_MOSAIC_ID"');
    }
    if (isNaN(cfg.symbol.EPOCH_ADJUSTMENT)) {
        throw Error(errorMessage + 'Invalid "EPOCH_ADJUSTMENT"');
    }
    if (cfg.symbol.GENERATION_HASH?.length !== 64) {
        throw Error(errorMessage + 'Invalid "GENERATION_HASH"');
    }
    if (isNaN(cfg.symbol.MAX_FEE)) {
        throw Error(errorMessage + 'Invalid "MAX_FEE"');
    }
    try {
        cfg.symbol.NODES.forEach((nodeUrl) => new URL(nodeUrl));
    } catch (e) {
        throw Error(errorMessage + 'Invalid "NODES"');
    }
    if (cfg.symbol.MAIN_ACCOUNT_PRIVATE_KEY?.length !== 64) {
        throw Error(errorMessage + 'Invalid "MAIN_ACCOUNT_PRIVATE_KEY"');
    }

    return true;
};
