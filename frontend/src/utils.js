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