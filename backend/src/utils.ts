import * as path from 'path';
import * as humanizeDuration from 'humanize-duration';
import { Mosaic, MosaicId } from 'symbol-sdk';

export const stringToArray = (str: string | undefined): Array<any> => {
    let result = null;

    try {
        if (typeof str === 'string') result = JSON.parse(str);
    } catch (e) {}
    return result;
};

export const sleep = (ms: number): Promise<any> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const basename = (filename: string) => {
    return path.basename(filename, '.js');
};

export const parseArray = (array: any): Array<any> | null => {
    if (Array.isArray(array)) return array;

    if (typeof array === 'string') {
        try {
            const json = JSON.parse(array);

            if (Array.isArray(json)) return json;
        } catch (e) {
            return null;
        }
    }

    return null;
};

export const splitArray = (array: Array<any>, chunks: number): Array<any> =>
    array.reduce((all, one, i) => {
        const ch = Math.floor(i / chunks);

        all[ch] = [].concat(all[ch] || [], one);
        return all;
    }, []);

export const showDuration = (durationMs: number): string => {
    return humanizeDuration(durationMs);
};

export const getMosaicRelativeAmount = (mosaic: Mosaic, divisibility: number): number => {
    return Number(mosaic.amount.toString()) / Math.pow(10, divisibility);
};

export const getNativeMosaicAmount = (mosaics: Mosaic[], nativeMosaicId: MosaicId): number => {
    const nativeMosaic = mosaics.find((mosaic) => mosaic.id.equals(nativeMosaicId));

    if (!nativeMosaic) {
        return 0;
    }
    return getMosaicRelativeAmount(nativeMosaic, 6);
};

export const depositMosaicSpamFilter = (mosaics: Mosaic[], nativeMosaicId: MosaicId): boolean => {
    const nativeMosaicAmount = getNativeMosaicAmount(mosaics, nativeMosaicId);

    return nativeMosaicAmount >= 8;
};
