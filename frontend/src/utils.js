import { Address, Convert, Base32 } from "symbol-sdk";

export const copyToClipboard = (text) => {
    return new Promise((resolve, reject) => {
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (!success) {
                    throw Error();
                }

                resolve();
            }
            catch(e) {
                reject(Error('ERROR: failed to copy text to clipboard. Command "document.execCommand()" failed', e));
            }
        }
        navigator.clipboard.writeText(text).then(
            () => resolve(), 
            (err) => reject(Error('ERROR: failed to copy text to clipboard. Command "dnavigator.clipboard.writeText()" failed', err))
        );
    });
};

export const verifyAddress = (rawAaddres) => {
    try {
        return Address.isValidRawAddress(rawAaddres);
    }
    catch {
        return false;
    }
};

export const getNFTImageMapStyle = (nft, index, _rawAddress) => {
    const rawAddress = ([
        'TDD3UFP2TRDC4IAB45SJ476R5RAN2MF3UMXO3CA',
        'TANTQ5V5UGMW6BWMJYLQOMU6DXOHNF445GQQNXQ',
        'TCOAB5LM6XDC5R6YW57IFCDPMEXJBHJT5SJ563I',
        'TAJTGLKSN7FBR3PYTHRPFXAVQMRFFOZOPLCOM4I',
        'TDJ3NT5NCPVDTYSM6R6KWY6HP5MIVHZUNOT2FTI',
        'TD2B2CUN7YAUIZDU4DYTEXO7RDN7R7QUTTF54WQ',
        'TA3D3KVGKZSCYSCI2337PBKHT7JJJLSZRL73PQY',
        'TB6SCDCBIDOWTNLL2VMXYESWRV5PJHEJZV6QRGY',
        'TBCVSZORGYRYPA6373WB5Z2JREVJKZOENZA3VIY',
        'TBMXA34JC23JN5K45CXH7ZICAJC5VMW2KRYUIMA',
        'TBMXA34JC23JN5K45CXH7ZICAJC5VMW2KRYUIMA'
    ])[0]; // 10

    let position;
    const definedPosition = nft.position && nft.position[index];

    if (!definedPosition) {
        const uint8Array = Address.createFromRawAddress(rawAddress).encodeUnresolvedAddress();
        const test = btoa(btoa(btoa(btoa(btoa(btoa(btoa(rawAddress)))))));
        const xPositions = uint8Array.slice(0, 12);
        const ypositions = uint8Array.slice(12, 24);
        const sourceString = (rawAddress).toUpperCase();
       
    }

};

export const stringToCoordArray = (str) => {
    const encodeItertions = 1;
    let encodedStr = str;

    for (let i = 0; i < encodeItertions; ++i) {
        encodedStr = btoa(encodedStr);
    }

    encodedStr = str + str;

    const charset = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

    const formattedEncodedStr = encodedStr.replace(/=/g, '');

    console.log(formattedEncodedStr.slice(0, 20))

    const min = 10;
    const max = 90;

    const singleCoords = formattedEncodedStr
        .split('')
        .map(addressChar => Math.round(
            (charset.indexOf(addressChar.toLowerCase()) * (max - min)  / charset.length) + min
        ));

    console.log(singleCoords.slice(0, 20))

    const coords = [];

    for (let i = 0; i < singleCoords.length; ++i) {
        coords.push([singleCoords[i], singleCoords[singleCoords.length - 1 - i]]);
    }

    return coords;
}

export const base64ToUint8Array = (base64) => {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}