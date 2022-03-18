<template>
	<div v-if="!isError" class="root">
		<div class="bg-peace" />
		<div class="main-container">
			<div class="content-center fixed">
				<WidthLimiter>
					<div class="section-about">
						<div class="content-about">
							<div class="text-crop margin-b">
								<h2 class="title">Save Ukraine from Russian invasion</h2>
							</div>
							<div class="text-crop">
								<p class="hero">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.
								</p>
								<p>
									<router-link to="/account/">
										View your NFTs
									</router-link>
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
				<WidthLimiter>
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
		</div>
	</div>
</template>

<script>
import WidthLimiter from '../components/WidthLimiter.vue';
import NFTCard from '../components/NFTCard.vue';
import imgSymbol from '../assets/symbol.png';

export default {
	name: 'Home',
	components: {
		WidthLimiter,
		NFTCard
	},

	data() {
		return {
			imgSymbol
		}
	},

	computed: {
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
		this.$store.dispatch('nft/loadListedNFTs');
	}
};
</script>

<style lang="scss" scoped>
.root {
	position: relative;
	width: 100%;
	height: 100%;
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
	height: 100vh;
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
		max-width: 700px;

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
	margin-top: 400px;
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
	background-position: 0% 0%;

	.nft-list-wrapper {
		display: flex;
		justify-content: center;
	}

	.nft-list {
		display: inline-flex;
		flex-grow: 0;
		flex-shrink: 1;
		flex-direction: row;
		justify-content: center;
		flex-wrap: wrap;
		margin: 0 auto;
	}
}

@media #{$screen-tablet-lg} {
	.content-about {
		max-width: 500px !important;
	}

	.image-symbol {
		height: 200px !important;
	}
}

@media #{$screen-tablet-sm}, #{$screen-mobile} {
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
}
</style>