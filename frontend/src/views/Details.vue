<template>
	<div class="details">
		<WidthLimiter v-if="!isLoading && !isError">
			<div class="section-nft">
				<div class="card nft-image-container">
					<img :src="image" />
				</div>
				<div class="padding card nft-details">
					<div class="margin-b-sm text-crop title-nft-name">
						<h2 class="title-yellow inline">{{ name }}</h2>
					</div>
					
					<div class="margin-b text-crop">
						<span class="item-value">#{{ id }}</span> <a class="mosaic-id" :href="mosaicExplorerURL"><img :src="imgMosaic" />Mosaic: {{ mosaicId }}</a>
					</div>
				
					<div class="row-purchase">
						<div>
							<div class="label item-title">Price:</div>
							<div class="col-price-value">{{ price }} XYM</div>
						</div>
						<div>
							<div class="label item-title">Available:</div>
							<div class="">
								<span class="col-availability-value">{{ availableCount }}</span> / 
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
				
				<div class="margin-b text-crop">
					<p>
					Caution! This is donation service and NFTs are not refundable. Please note that NFT will not be send to your account if transferred XYM ammount is less then it's price, message contains wrong number or NFT is out of stock. Transferred funds cannot be returned back to your account.
					</p>
				</div>

				<Button v-if="!isUserWarned" @click="() => isUserWarned = true">
					I read the caution above and understand it
				</Button>

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
						To receive NFT to your account you must send transfer of <code>{{ amount }} XYM</code> to this address: <code>{{ address }}</code> with following message: <code>{{ id }}</code>. Please DO  NOT encrypt the message, otherwise transfer will not be processed.
						</p>
					</div>

					<div class="margin-b text-crop text-red">
						<p>
							<div>1. To / Recipient Address:</div> 
							<div class="copy-box bg-copy-icon pointer" @click="copy(address)">{{ address }}</div>
						</p>
						<p>
							<div>2. Mosaic:</div>
							<div class="copy-box">symbol.xym</div>
						<p>
						<p>
							<div>3. Amount:</div>
							<div class="copy-box bg-copy-icon pointer" @click="copy(amount)">{{ amount }}</div>
						</p>
						<p>
							<div>4. Message:</div>
							<div class="copy-box bg-copy-icon pointer" @click="copy(id)">{{ id }}</div>
						</p>
					</div>

					<div class="margin-b text-crop">
						<div class="guide-mobile content-center">
							<img src="../assets/mobile-wallet.png" />
						</div>
					</div>
					<div class="margin-b text-crop">
						<div class="guide-mobile content-center">
							<img src="../assets/desktop-wallet.png" />
						</div>
					</div>
				</div>
			</div>

			<div v-else class="padding card section-payment margin-b">
				<div class="margin-b text-crop">
					<h3>How to get NFT</h3>
				</div>
				<div class="content-center">
					<h4 class="inline">This NFT is out of stock</h4>
				</div>
			</div>

			<div style="height: 1px;" />
		</WidthLimiter>
		<WidthLimiter v-else-if="isLoading">
			<div class="content-center">
				<h3> Please wait </h3>
			</div>
		</WidthLimiter>
		<WidthLimiter v-else-if="isError">
			<div class="content-center">
				<h3> No connection </h3>
			</div>
		</WidthLimiter>
	</div>
</template>

<script>
import Button from '../components/Button.vue';
import CountSelector from '../components/CountSelector.vue';
import WidthLimiter from '../components/WidthLimiter.vue';
import { copyToClipboard } from '../utils'
import * as config from '../config/config.json';

export default {
	name: 'Details',

	components: {
		Button,
		CountSelector,
		WidthLimiter
	},

	data() {
		return {
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
			isUserWarned: false
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
		}
	},

	mounted() {
		this.isLoading = true;
		this.isError = false;
		const requestedMosaicId = this.$route.params.id;
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
				this.isError = false;
			})
			.catch(e => {
				console.error('Failed to load NFT details', e)
				this.isLoading = false;
				this.isError = true;
			});	
	},

	methods: {
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
    background: var(--color-darkmode-bg-main);
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

.nft-details {

}

.section-payment {
	margin-top: $margin-base;
	
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