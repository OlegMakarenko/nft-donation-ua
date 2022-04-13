<template>
	<div class="root">
        <div class="background" />
        <div class="main-container-content">
            <div class="section-about content-center">
                <WidthLimiter class="margin-b">
                    <div class="text-row">
                        <div>
                            <div class="text-crop margin-b">
                                <h2 class="title-purple">
                                    What is Symbol
                                </h2>
                            </div>
                            <div class="text-crop margin-b text-width">
                                <p class="hero">
                                    Symbol is a blockchain protocol launched in March 2021. It allows simple and yet flexible exchange of digital tokens, laying the grounds for a more egalitarian and efficient market.
                                </p>
                                <p class="hero">
                                    Elaborate transactions involving multiple accounts are available out-of-the-box. No need to write custom contracts in complex programming languages or trust a third party to write them for you.
                                </p>
                                <p class="hero">
                                    The native currency of the Symbol blockchain is XYM.
                                </p>
                            </div>
                        </div>
                        <img class="image-xymcity" src="../assets/xymcity.png" />
                    </div>
                </WidthLimiter>
            </div>

            <div class="section-exchanges content-center">
                <WidthLimiter>
                    <div class="grid-gap text-row margin-b margin-t">
                        <img class="image-exchange" src="../assets/exchange.png" />
                        <div>
                            <div class="text-crop margin-b">
                                <h3 class="title-purple">
                                    How to get XYM
                                </h3>
                            </div>
                            <div class="text-crop margin-b text-width">
                                <p>
                                    You can buy XYM tokens at the following trusted exchanges.
                                </p>
                            </div>
                            <div class="grid grid-gap exchanges-list">
                                <a 
                                    v-for="(exchange, index) in exchanges"
                                    class="exchange-item"
                                    target="_blank"
                                    :href="exchange.url"
                                    :key="'exch' + index"
                                >
                                    <img :src="exchange.imageSrc" />
                                </a>
                            </div>
                        </div>
                    </div>
                </WidthLimiter>
            </div>

            <div class="section-wallets content-center">
                <WidthLimiter class="margin-b margin-t">
                    <div class="text-crop margin-b">
                        <h3 class="title-purple">
                            Wallets
                        </h3>
                    </div>
                    <div class="text-crop margin-b text-width">
                        <p>
                            Symbol wallets keep your private keys, that give you access to your cryptocurrency – safe and accessible, allowing you to send and receive XYM tokens. You can use any of Symbol wallets listed below to make a donation and receive an NFT.
                        </p>
                        <p>
                            Transfer XYM to your wallet to get started.
                        </p>
                    </div>

                    <hr class="margin-b">
                    <div class="wallet-list">
                        <div class="text-crop margin-b-sm">
                            <h4>
                                Desktop Wallet
                            </h4>
                        </div>
                        <img class="image-wallet-preview margin-b" src="../assets/desktop-wallet-logo.png" />
                        <div class="text-crop margin-b text-width">
                            <p>
                                Cross-platform client for Symbol to manage accounts, mosaics, namespaces, and issue transactions. Symbol Desktop Wallet is available for Linux, Mac, Windows, and as a web application.
                            </p>
                            <p>
                                Download the Symbol Desktop Wallet installer from the <a class="label" target="_blank" href="https://docs.symbol.dev/guides/account/creating-an-account.html">releases section</a>.
                            </p>
                            <p>
                                <a class="label" target="_blank" href="https://docs.symbol.dev/guides/account/creating-an-account.html">
                                    How to create an account
                                </a>
                            </p>
                            <p>
                                <a class="label" target="_blank" href="https://docs.symbol.dev/guides/transfer/sending-a-transfer-transaction.html">
                                    How to send XYM with a wallet
                                </a>
                            </p>
                        </div>
                        
                        <hr class="margin-b">
                        <div class="text-crop margin-b-sm">
                            <h4>
                                Mobile Wallet
                            </h4>
                        </div>
                        <img class="image-wallet-preview margin-b " src="../assets/mobile-wallet-logo.png" />
                        <div class="text-crop margin-b-sm text-width">
                            <p>
                                The official Symbol Mobile wallet from NEM
                            </p>
                        </div>
                        <div class="grid grid-gap-sm margin-b stores">
                            <a target="_blank" href='https://play.google.com/store/apps/details?id=nem.group.symbol.wallet&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img class="play-store" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/></a>
                            <a target="_blank" href='https://apps.apple.com/us/app/symbol-wallet/id1528741845'><img class="app-store" alt='Get it on App Store' src='../assets/app-store.svg'/></a>
                        </div>
                        <hr class="margin-b">
                        <div class="text-crop margin-b-sm">
                            <h4>
                                Arcana
                            </h4>
                        </div>
                        <img class="image-wallet-preview margin-b" src="../assets/arcana.png" />
                        <div class="text-crop margin-b-sm text-width">
                            <p>
                                Symbol Wallet made by community
                            </p>
                        </div>
                        <div class="grid grid-gap-sm margin-b stores">
                            <a target="_blank" href='https://play.google.com/store/apps/details?id=com.shu.software.symbol_arcana&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img class="play-store" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/></a>
                            <a target="_blank" href='https://apps.apple.com/us/app/id1603599435'><img class="app-store" alt='Get it on App Store' src='../assets/app-store.svg'/></a>
                        </div>
                    </div>
                </WidthLimiter>
            </div>
        </div>
	</div>
</template>

<script>
import WidthLimiter from '../components/WidthLimiter.vue';
import { exchanges } from '../config';

export default {
	name: 'About',
    
	components: {
		WidthLimiter,
	},

    data() {
        return {
            exchanges,
            imageState: {}
        }
    },

	mounted () {
        this.load();
	},

	methods: {
        load() {
           
        },

        onImageLoad() {

        },

		translate(key) {
			return this.$store.getters['ui/translate'](key);
		}
	}
};
</script>

<style lang="scss" scoped>
.root {
	position: relative;
	width: 100%;
	height: 100%;
}

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(to top, rgb(24, 26, 69) 0%, rgb(24, 14, 47) 100%);
}

.main-container-content {
    position: relative;
}

.section-exchanges {
    background-color: #0B0118;
    min-height: 600px;
}

.section-wallets {
    position: relative;
    background-color: #251B34;
}

.section-more {
    background-color: #1B0A29;
    min-height: 600px;
}

.text-width {
    max-width: 650px;
}

.text-row {
    display: grid;
    grid-template-columns: auto auto;
}

.exchanges-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.exchange-item {
    img {
        width: 100%;
    }
}

.image-xymcity {
    margin: auto;
    max-width: 80%;
}

.image-exchange {
    margin: auto 0;
}

.wallet-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

hr {
    width: 100%;
    height: 0px;
    border-radius: 1px;
    background-color: #b9b9d7;
}

.label {
    text-transform: uppercase;
    color: var(--color-darkmode-text-learn-more);
}

.stores {
    display: flex;
    flex-direction: row;
}

.app-store {
    margin-top: 10px;
    margin-right: 10px;
    height: 44px;
}

.play-store {
    height: 64px;
}

.image-wallet-preview {
    max-width: 100%;
    max-height: 500px;
}

.image-wallet-spacer {
    position: static !important;
    opacity: 0;
}

.image-wallet {
    position: absolute;
    right: 0;
    bottom: 0;
    max-width: 50%;
    max-height: 80%;
}

@media #{$screen-tablet-lg} {
    .image-xymcity {
        max-width: 100%;
    }

	.exchanges-list {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

@media #{$screen-tablet-sm} {
    .image-xymcity {
        max-width: 100%;
    }
    
	.text-row {
        grid-template-columns: auto;
    }

    .image-exchange {
        width: 50%;
        margin: 0 auto;
        order: 2;
    }

    .image-wallet {
        height: unset;
        max-width: 80%;
        bottom: 0;
    }
}

@media #{$screen-mobile} {
    .image-xymcity {
        max-width: 100%;
    }
    
	.text-row {
        grid-template-columns: auto;
    }

    .exchanges-list {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .image-exchange {
        width: 50%;
        margin: 0 auto;
        order: 2;
    }

    .image-wallet {
        height: unset;
        max-width: 100%;
        bottom: 0;
    }
}
</style>
