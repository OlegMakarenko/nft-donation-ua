<template>
	<div class="details">
		<WidthLimiter v-if="!isError">
			<div class="section-nft">
				<div class="card nft-image-container" :class="{'bg-loading': isLoading || isCacheLoading}">
					<img :src="image" />
				</div>
				<div class="padding card nft-details" :class="{'bg-loading': isLoading || isCacheLoading}">
					<div class="margin-b-sm text-crop title-nft-name">
						<h2 class="title-yellow inline">{{ name }}</h2>
					</div>
					
					<div class="margin-b text-crop">
						<span class="item-value">#{{ id }}</span> <a class="mosaic-id" :href="mosaicExplorerURL"  target="_blank">Mosaic: {{ mosaicId }}</a>
					</div>
				
					<div class="row-purchase">
						<div>
							<div class="label item-title">Price:</div>
							<div class="col-price-value">{{ price }} XYM</div>
						</div>
						<div>
							<div class="label item-title">Available:</div>
							<div class="">
								<span class="col-availability-value">{{ availableCountText }}</span> / 
								<span>{{ totalCount }}</span>
							</div>
						</div>
					</div>
					<hr class="separastor" />
					<div>{{ description }}</div>
				</div>
			</div>

			<div v-if="availableCount > 0" class="padding card section-payment margin-b">
				<div class="margin-b text-crop">
					<h3>How to get NFT</h3>
				</div>
				
				<div v-if="!isUserWarned" class="margin-b text-crop">
					<p>
					Caution! This is donation service and NFTs are not refundable. Please note that NFT will not be send to your account if transferred XYM ammount is less then it's price, message contains wrong number or NFT is out of stock. Transferred funds cannot be returned back to your account.
					</p>
				</div>

				<div class="fullweight content-center">
					<Button v-if="!isUserWarned" @click="() => isUserWarned = true">
						I read the caution above and understand it
					</Button>
				</div>

				<div v-if="isUserWarned">
					<div class="label item-title">Select a number of NFTs:</div>
					<CountSelector
						class="margin-b"
						:value="requestedCount"
						:maxValue="availableCount" 
						@change="_ => requestedCount = _"
					/>

					<div class="margin-b text-crop">
						<p>
						To receive NFT to your account you should send transfer of <code>{{ amount }} XYM</code> to this address: <code>{{ address }}</code> with following message: <code>{{ id }}</code>. Please DO  NOT encrypt the message, otherwise transfer will not be processed. It may take up to 5 minutes to receive the NFT.
						</p>
						<p>Fill the transfer transaction with the data below or scan the QR code with the wallet's scanner.</p>
					</div>

					<hr class="separastor" />
					
					<div class="text-crop margin-b-sm">
						<h4>Transaction</h4>
					</div>

					<div class="grid-gap-sm margin-b send-form">
						<div class="text-crop text-red fullwidth">
							<p>
								<div>1. To / Recipient Address:</div> 
								<div class="copy-box bg-copy-icon pointer" @click="copy(address)">{{ address }}</div>
							</p>
							<p>
								<div>2. Mosaic:</div>
								<div class="copy-box">symbol.xym</div>
							</p>
							<p>
								<div>3. Amount:</div>
								<div class="copy-box bg-copy-icon pointer" @click="copy(amount)">{{ amount }}</div>
							</p>
			
							<div>4. Message:</div>
							<div class="copy-box bg-copy-icon pointer" @click="copy(id)">{{ id }}</div>
						
						</div>
						<p class="qr-wrapper">
							<QRCode :address="address" :amount="amount" :message="id" />
						</p>
					</div>

					<hr class="separastor" />

					<div class="text-crop margin-b">
						<h4>Mobile Wallet</h4>
					</div>
					<div class="margin-b text-crop">
						<div class="guide-mobile content-center">
							<img src="../assets/mobile-wallet.png" />
						</div>
					</div>

					<hr class="separastor" />

					<div class="text-crop margin-b">
						<h4>Desktop Wallet</h4>
					</div>
					<div class="margin-b text-crop">
						<div class="guide-mobile content-center">
							<img src="../assets/desktop-wallet.png" />
						</div>
					</div>
				</div>
			</div>

			<div v-else-if="!isLoading" class="padding card section-payment margin-b">
				<div class="margin-b text-crop">
					<h3>How to get NFT</h3>
				</div>
				<div class="content-center">
					<h4 class="inline">This NFT is out of stock</h4>
				</div>
			</div>

			<div style="height: 1px;" />
		</WidthLimiter>
		<WidthLimiter v-else-if="isError">
			<div class="content-center">
				<h3 class="text-center"> {{ errorMessage }} </h3>
			</div>
		</WidthLimiter>
		<LoadingSpinner v-if="isCacheLoading || isLoading" />
	</div>
</template>

<script>
import Button from '../components/Button.vue';
import CountSelector from '../components/CountSelector.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import WidthLimiter from '../components/WidthLimiter.vue';
import QRCode from '../components/QRCode.vue';
import { copyToClipboard } from '../utils'
import * as config from '../config/config.json';

export default {
	name: 'Details',

	components: {
		Button,
		CountSelector,
		LoadingSpinner,
		WidthLimiter,
		QRCode
	},

	data() {
		return {
			isCacheLoading: true,
			isLoading: true,
			isError: false,
			id: null,
			mosaicId: null,
			price: null,
			name: '',
			description: '',
			image: '',
			availableCount: 0,
			totalCount: 0,
			requestedCount: 1,
			isUserWarned: false,
			errorMessage: ''
		};
	},

	computed: {
		explorerURL() {
			const networkType = this.$store.getters['api/networkConfig'].networkType
			const explorerURLs = config.EXPLORER_URL;

			return explorerURLs[`${networkType}`];
		},
		mosaicExplorerURL() {
			return `${this.explorerURL}/mosaics/${this.mosaicId}`;
		},
		address() {
			return this.$store.getters['api/mainAccountAddress'];
		},
		amount() {
			return this.price * this.requestedCount;
		},
		availableCountText() {
			if (this.isLoading) {
				return '-';
			}
			else {
				return this.availableCount;
			}
		}
	},

	mounted() {
		this.load();
	},

	methods: {
		async load() {
			this.isLoading = true;
			this.isCacheLoading = true;
			this.isError = false;
			const requestedMosaicId = this.$route.params.id;
			
			try {
				const nft = await this.$store.dispatch('nft/getCachedNFTDetailsByMosaicId', requestedMosaicId);
				this.id = nft.id;
				this.mosaicId = nft.mosaicId;
				this.price = nft.price;
				this.name = nft.name;
				this.description = nft.description;
				this.image = nft.image;
			}
			catch(e) {
				console.error(`Failed to get cached NFT by mosaic id "${requestedMosaicId}"`, e);
				this.errorMessage = e.message;
			}
			this.isCacheLoading = false;
			
			this.$store.dispatch('nft/loadNFTDetailsByMosaicId', requestedMosaicId)
				.then(nft => {
					this.id = nft.id;
					this.mosaicId = nft.mosaicId;
					this.price = nft.price;
					this.name = nft.name;
					this.description = nft.description;
					this.image = nft.image;
					this.availableCount = nft.availableCount;
					this.totalCount = nft.totalCount;
					this.isLoading = false;
				})
				.catch(e => {
					console.error('Failed to load NFT details', e)
					this.isLoading = false;
					this.isError = true;
					this.errorMessage = e.message;
				});	
		},

		async copy(text) {
			try {
				await copyToClipboard(text);
				this.$bvToast.toast('Copied', {
					variant: 'success',
					solid: true,
					noCloseButton: true
				});
			}
			catch(e) {
				console.error(e);
				this.$bvToast.toast('Failed to copy. ' + e.message, {
					variant: 'danger',
					solid: true,
					noCloseButton: true
				});
			}
		},
	}
};
</script>

<style lang="scss" scoped>
.details {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	color: var( --color-darkmode-text-footer);
}

code {
	color: var(--color-darkmode-form-accent-light);
}

.title-nft-name {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}

.item-title {
	color: #fff;
}

.item-value {
	color: #fff;
}

.mosaic-id {
	padding: 0 5px;
	color: #000;
	background: var(--color-flag-blue-lighter);
	border-radius: $border-radius;

	img {
		height: 100%;
	}
}

.row-purchase {
	display: grid;
	grid-template-columns: 60% 40%;
}

.col-price-value {
	font-size: var(--typography-web-large-h3-font-size);
	line-height: 75%;
	color: var(--color-flag-blue-lighter);
}

.col-availability-value {
	font-size: var(--typography-web-large-h3-font-size);
	line-height: 75%;
	color: var(--color-flag-blue-lighter);
}

.card {
	border: 3px solid #000;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    background-color: var(--color-darkmode-bg-main);
}

.separastor {
	background: var(--color-darkmode-text-footer);
}

.section-nft {
	display: grid;
	grid-template-columns: 512px auto;
	grid-gap: $margin-base;
}

.nft-image-container {
	width: 100%;
	height: 100%;
	
	img {
		margin: auto;
		width: 100%;
	}
}

.section-payment {
	margin-top: $margin-base;

	.send-form {
		display: grid;
		grid-template-columns: auto 282px;

		.qr-wrapper {
			height: 100%;
			display: flex;
			align-items: flex-end;
		}
	}
	
	.text-red {
		color: #f00;
	}

	.copy-box {
		padding: 5px 30px 5px 10px;
		background: #fff;
		color: #000;
		width: 100%;
		border-radius: $border-radius;
	}

	.bg-copy-icon {
		background-image: url('../assets/copy.png');
		background-position: calc(100% - 10px) 50%;
		background-size: 16px 16px;
		background-repeat: no-repeat;
	}

	.guide-mobile {
		img {
			max-width: 100%;
			max-height: 100vh;
		}
	}
}

.section-terms {
	margin-top: $margin-base;
}

@media #{$screen-tablet-lg} {
    .section-nft {
		grid-template-columns: 350px auto;
	}

	.col-price-value {
		font-size: var(--typography-web-desktop-h3-font-size);
	}

	.col-availability-value {
		font-size: var(--typography-web-desktop-h3-font-size);
	}

	.section-payment {
		.send-form {
			grid-template-columns: auto 230px;
		}
	}
}

@media #{$screen-tablet-sm} {
    .section-nft {
		grid-template-columns: auto;
		grid-template-rows: auto auto;
		grid-gap: $margin-mobile-base;
	}

	.section-payment {
		margin-top: $margin-mobile-base;
	}

	.section-terms {
		margin-top: $margin-mobile-base;
	}

	.col-price-value {
		font-size: var(--typography-web-desktop-h3-font-size);
	}

	.col-availability-value {
		font-size: var(--typography-web-desktop-h3-font-size);
	}

	.section-payment {
		.send-form {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			.qr-wrapper {
				display: block;
				width: 256px;
			}
		}
	}
}

@media #{$screen-mobile} {
    .section-nft {
		grid-template-columns: auto;
		grid-template-rows: auto auto;
		grid-gap: $margin-mobile-base;
	}

	.title-nft-name {
		flex-direction: column;
	}

	.row-purchase {
		grid-gap: $margin-mobile-base;
	}

	.section-payment {
		margin-top: $margin-mobile-base;

		.send-form {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			.qr-wrapper {
				display: block;
				width: 100%;
			}
		}
	}

	.section-terms {
		margin-top: $margin-mobile-base;
	}

	.col-price-value {
		font-size: var(--typography-web-mobile-h2-font-size);
	}

	.col-availability-value {
		font-size: var(--typography-web-mobile-h2-font-size);
	}
}

</style>