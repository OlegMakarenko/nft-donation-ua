import cachedNFTsDisplay from '../config/nft-display.json';
import ImageBgPeace from '../assets/bg-peace.jpg';
import ImageBgRocketsMobile from '../assets/bg-rockets-mobile.png';
import ImageBgRockets from '../assets/bg-rockets.png';
import ImageBgWar from '../assets/bg-war.jpg';
import ImageBgCopy from '../assets/copy.png';
import ImageDesktopWallet from '../assets/desktop-wallet.png';
import ImageMobileWallet from '../assets/mobile-wallet.png';
import ImageMosaic from '../assets/mosaic.png';
import ImageSymbol from '../assets/symbol.png';
import ImageUkraine from '../assets/ukraine-main.png';

export class ResourceService {
    static get imageUrls() {
        return [
            ...cachedNFTsDisplay.map(nft => nft.image),
            ImageBgPeace,
            ImageBgRocketsMobile,
            ImageBgRockets,
            ImageBgWar,
            ImageBgCopy,
            ImageDesktopWallet,
            ImageMobileWallet,
            ImageMosaic,
            ImageSymbol,
            ImageUkraine
        ];
    }

    static preload() {
        return new Promise((resolve) => {
            const TIMEOUT = 5000;
            let loaded = 0;

            const images = ResourceService.imageUrls;
    
    
            images.forEach(imageUrl => {
                const image = new Image();
                
                image.addEventListener('load', () => {           
                    ++loaded;

                    if (loaded === images.length) {
                        resolve();
                    }
                });

                image.src = imageUrl;
            });

            setTimeout(() => resolve(), TIMEOUT);
        });
    }
}