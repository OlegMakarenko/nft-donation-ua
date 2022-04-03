<template>
	<div v-if="!isError" class="root">
		<div class="bg-peace" />
		<div class="main-container">
			<div class="content-center fixed">
				<WidthLimiter>
					<div class="section-about">
						<div class="content-about">
							<div class="text-crop margin-b">
								<h2 class="title">Stand with Ukraine <br> the Donation Platform</h2>
							</div>
							<div class="text-crop">
								<p class="hero">
									Ukraine holds the defense against russian occupying army attacks. The russian army, led by the cynical lies of their leader, behaves ruthlessly, sparing neither children nor the elderly. Entire cities with people's houses, factories and schools are being destroyed. You can stand with us and help Ukraine by making XYM donation to this address: <a :href="explorerURL" target="_blank">{{ mainAccountAddress }}</a>. Tokens will be sold and transferred to the account of the Ukrainian army and humanitarian aid funds. You also have the opportunity to get an NFT sticker, which you can find below.
								</p>
							</div>
						</div>
						<img class="image-symbol" :src="imgSymbol" />
					</div>
				</WidthLimiter>
			</div>
			<img class="image-rockets image-desktop" src="../assets/bg-rockets.png" />
			<img class="image-rockets image-mobile" src="../assets/bg-rockets-mobile.png" />
			<div class="nft-content content-center">
				<WidthLimiter class="margin-b">
					<div class="nft-list-wrapper">
						<div class="nft-list grid-gap">
							<NFTCard
								v-for="(item, index) in NFTList" :key="'nft' + index"
								:mosaicId="item.mosaicId"
								:name="item.name"
								:description="item.description"
								:price="item.price"
								:count="item.availableCount"
								:image="item.image"
								:isLoading="isLoading"
							/>
						</div>
					</div>
				</WidthLimiter>
			</div>
			<TheFooter />
		</div>
	</div>
</template>

<script>
import TheFooter from '../components/TheFooter.vue';
import WidthLimiter from '../components/WidthLimiter.vue';
import NFTCard from '../components/NFTCard.vue';
import imgSymbol from '../assets/symbol.png';
import * as config from '../config/config.json';

export default {
	name: 'Home',
	components: {
		TheFooter,
		WidthLimiter,
		NFTCard
	},

	data() {
		return {
			imgSymbol
		}
	},

	computed: {
		mainAccountAddress() {
			return this.$store.getters['api/mainAccountAddress'];
		},
		explorerURL() {
			const networkType = this.$store.getters['api/networkConfig'].networkType
			const explorerURLs = config.EXPLORER_URL;

			return explorerURLs[`${networkType}`] + `/accounts/${this.mainAccountAddress}`;
		},
		cachedNFTs() {
			return this.$store.getters['nft/cachedNFTs'];
		},
		loadedNFTs() {
			return this.$store.getters['nft/listedNFTs'];
		},
		NFTList() {
			return this.loadedNFTs.length ? this.loadedNFTs : this.cachedNFTs;
		},
		isLoading() {
			return this.$store.getters['nft/isListedNFTsLoading']
		},
		isError() {
			return this.$store.getters['nft/isListedNFTsError']
		}
	},

	mounted () {
		this.$store.dispatch('nft/loadListedNFTs')
			.catch(e => this.$bvToast.toast('Failed to load. ' + e.message, {
				variant: 'danger',
				solid: true,
			}));
	}
};
</script>

<style lang="scss" scoped>
.root {
	position: relative;
	width: 100%;
	height: 100%;

	a {
		color: var(--color-flag-blue);
	}
}

.image-desktop {
	display: unset;
}

.image-mobile {
	display: none;
}

.bg-peace {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 120vh;
	background: url('../assets/bg-peace.jpg');
    background-repeat: no-repeat;
    background-size: cover;
}

.main-container {
	position: relative;
}

.section-about {
	padding-top: $margin-base;
	display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;

	.content-about {
		max-width: 900px;

		p {
			color: var(--color-lightmode-text-body)
		}
	}

	.image-symbol {
		height: 300px;
	}
}

.image-rockets {
	z-index: 2;
	position: relative;
	margin-top: 550px;
	margin-bottom: -10%;
	width: 100%;
}

.nft-content {
	padding-top: 10%;
	z-index: 1;
	position: relative;
	width: 100%;
	background-color: #999;
	background-image: url('../assets/bg-war.jpg');
	background-repeat: no-repeat;
    background-size: cover;
	background-position: 50% 0%;

	.nft-list-wrapper {
		display: flex;
		justify-content: center;
	}

	.nft-list {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));;
		flex-wrap: wrap;
		margin: 0 auto;
	}
}

@media #{$screen-tablet-lg} {
	.content-about {
		max-width: 520px !important;
	}

	.image-symbol {
		height: 200px !important;
	}

	.image-rockets {
		margin-top: 420px;
	}

	.nft-content {
		.nft-list {
			grid-template-columns: repeat(3, minmax(0, 1fr));;
		}
	}
}

@media #{$screen-tablet-sm}, #{$screen-mobile} {
	.image-rockets {
		margin-top: 400px;
	}

	.image-desktop {
		display: none;
	}

	.image-mobile {
		display: unset;
	}

    .section-about {
		padding-top: unset;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;

		.content-about {
			max-width: 100%;
			order: 2;
		}

		.image-symbol {
			height: unset;
			width: 25%;
			order: 1;
			margin-bottom: $margin-mobile-base;
		}
	}

	.nft-content {
		.nft-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));;
		}
	}
}

@media #{$screen-mobile} {
	.nft-content {
		.nft-list {
			grid-template-columns: repeat(1, minmax(0, 1fr));;
		}
	}
}
</style>