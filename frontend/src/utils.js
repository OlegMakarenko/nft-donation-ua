import { Address } from "symbol-sdk";

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
}