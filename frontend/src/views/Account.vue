<template>
	<div v-if="!isLoading" class="account account-background">
		<div class="background-filler account-background" />
		<div class="content-center margin-b">
			<WidthLimiter>
				<div class="row-address-input grid-gap-sm">
					<TextBox v-model="rawAddress" placeholder="Please enter your address to see owned NFTs" @enter="onButtonClick" />
					<Button @click="onButtonClick">
						Show
					</Button>
				</div>
			</WidthLimiter>
		</div>
		<div v-if="ownedNFTs.length" class="content-center account-background">
			<WidthLimiter class="margin-b">
				<div class="text-crop margin-b">
					<h2 class="title">Owned NFTs</h2>
				</div>
				<div class="grid-gap nft-list">
					<div v-for="(nft, nftIndex) in ownedNFTs" class="nft-list-item" :key="'block' + nftIndex">
						<router-link :to="'/nft/' + nft.mosaicId">
							<img 
								:src="nft.image"
								:key="'nft-list' + nftIndex" 
							/>
						</router-link>
						<div class="nft-item-count padding">
							<h3 class="title-purple normal">
								x{{ nft.count }}
							</h3>
							<h4 class="title-purple hover">
								Count: {{ nft.count }}
							</h4>
						</div>
						<div class="name-container">
							<h3 class="title-yellow inline">{{nft.name }}</h3>
						</div>
					</div>
				</div>
			</WidthLimiter>
		</div>
		<div class="content-center account-background">
			<div class="map-wrapper margin-b">
				<div v-for="(nft, nftIndex) in ownedNFTs" :key="'block' + nftIndex">
					<img 
						v-for="(piece, pieceIndex) in getPieces(nft)"
						class="nft-map-image"
						:style="piece"
						:src="nft.image"
						:key="'block' + nftIndex +'nft' + pieceIndex" 
					/>
				</div>
				<img class="map-image" src="../assets/ukraine-main.png" />
			</div>
		</div>

		<div v-if="ownedNFTs.length && totalXYM" class="content-center account-background">
			<div class="text-crop margin-b">
				<h3 class="title-purple text-center">
					This account owns NFTs for a total of {{totalXYM}} XYM.
				</h3>
			</div>
		</div>
	</div>
	<LoadingSpinner v-else />
</template>

<script>
import { verifyAddress, getNFTImageMapStyle } from '../utils';
import Button from '../components/Button.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import TextBox from '../components/TextBox.vue';
import WidthLimiter from '../components/WidthLimiter.vue';

export default {
	name: 'Details',

	components: {
		Button,
		LoadingSpinner,
		TextBox,
		WidthLimiter
	},

	data() {
		return {
			isLoading: false,
			rawAddress: '',
			ownedNFTs: [],
			coordArray: [],
		};
	},

	computed: {
		totalXYM() {
			let total = 0;

			this.ownedNFTs.forEach(nft => total += nft.count * nft.price);

			return total;
		},
	},

	mounted() {
		const address = this.$route.params.address;
		
		if (verifyAddress(address)) {
			this.rawAddress = address;
			this.loadAccountNFTs();		
		}
		else {
			address && this.showInvalidAddressMessage();
			this.rawAddress = '';
		}
	},

	methods: {
		getPieces(nft) {
			return new Array(nft.count).fill(0).map((_, index) => {
				let position;
				if (nft.position) {
					position = nft.position[index] ? nft.position[index] : null;
				} 
				else if (this.coordArray[index]) {
					position = {
						x: this.coordArray[index][0], 
						y: this.coordArray[index][1]
					};
				}
				else {
					position = {
						x: 0, 
						y: 0
					};
				}

				getNFTImageMapStyle(nft, index, this.rawAddress)

				if (position) {
					return `
						top: ${position.y}%;
						left: ${position.x}%;
						height: ${nft.size}%;
						transform: translate(-50%, -50%);
					`;
				}

				return `display: none;`;
			});
		},
		onButtonClick() {
			if (verifyAddress(this.rawAddress)) {
				const sameLocation = this.rawAddress === this.$route.params.address;
				sameLocation 
					? location.reload()
				 	: this.$router.push('/account/' + this.rawAddress);

			}
			else {
				this.showInvalidAddressMessage();
				this.rawAddress = '';
			}
		},
		async loadAccountNFTs() {
			this.isLoading = true;
			try {
				this.coordArray = await this.$store.dispatch('nft/loadAccountNFTMapCoords', this.rawAddress);
			}
			catch(e) {
				this.isLoading = false;
				this.$bvToast.toast('Failed to load account info. ' + e.message, {
					variant: 'danger',
					solid: true,
				});

				return;
			}

			try {
				this.ownedNFTs = await this.$store.dispatch('nft/loadAccountNFTs', this.rawAddress);
				let counter = 0;
				this.ownedNFTs.forEach(nft => {
					while(nft.position.length < nft.count) {
						if(this.coordArray[counter]) {
							nft.position.push({x: this.coordArray[counter][0], y: this.coordArray[counter][1]});
							++counter;
						}
						else {
							break;
						}
					}
				});
				this.$set(this, 'ownedNFTs', [...this.ownedNFTs]);
				console.log(this.ownedNFTs)
			}
			catch(e) {
				this.isLoading = false;
				this.$bvToast.toast('Failed to load account NFTs. ' + e.message, {
					variant: 'danger',
					solid: true,
				});
			}

			this.isLoading = false;
		},
		showInvalidAddressMessage() {
			this.$bvToast.toast('Incorrect Address', {
				variant: 'danger',
				solid: true,
				noCloseButton: true
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.account {
	position: relative;
	height: 100%;
}

.account-background {
	background-color: var(--color-lightmode-bg-main);//var(--color-flag-yellow);
}

.background-filler {
	position: absolute;
	width: 100%;
	height: 100px;
	top: -95px;
	left: 0;
}

.row-address-input {
	width: 100%;
	padding: 5px 0;
	display: grid;
	grid-template-columns: auto 300px;
}

.map-wrapper {
	overflow: hidden;
	position: relative;
	background: #999;
}

.nft-map-image {
	position: absolute;
}

.map-image {
	position: relative;
	max-width: 100%;
	max-height: 90vh;
}

.nft-list {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
}

.nft-list-item {
	position: relative;
	min-height: 128px;
	background: var(--color-lightmode-bg-gray);
	border-radius: $border-radius;
	overflow: hidden;
	transition: .5s ease;

	img {
		width: 100%;
	}

	.nft-item-count {
		position: absolute;
		background: var(--color-lightmode-bg-gray);
		opacity: 0.9;
		border-radius: $border-radius;
		top: 0;
		right: 0;
	}

	.name-container {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		max-height: 0;
		padding-left: 5px;
		background: var(--color-darkmode-button-disabled-bg);
		transition: inherit;
	}

	.normal {
		display: unset;
	}

	.hover {
		display: none;
	}

	&:hover {
		background: var(--color-lightmode-bg-footer);

		.name-container {
			max-height: 20%;
		}

		.normal {
			display: none;
		}

		.hover {
			display: unset;
		}
	}
}

@media #{$screen-tablet-lg} {
	.row-address-input {
		grid-template-columns: auto 256px;
	}

	.nft-list {
		grid-template-columns: 1fr 1fr 1fr;
	}
}

@media #{$screen-tablet-sm} {
	.row-address-input {
		grid-template-columns: auto 200px;
	}

	.nft-list {
		grid-template-columns: 1fr 1fr;
	}
}

@media #{$screen-mobile} {
	.row-address-input {
		grid-template-columns: 100%;
	}

	.nft-list {
		grid-template-columns: 100%;
	}
}

</style>