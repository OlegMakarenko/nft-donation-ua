<template>
	<div class="account account-backgroud">
		<div class="background-filler account-backgroud" />
		<div class="content-center margin-b">
			<WidthLimiter>
				<div class="row-address-input grid-gap-sm">
					<TextBox v-model="rawAddress" placeholder="Please enter your address to see owned NFTs" @enter="loadAccountNFTs" />
					<Button @click="onButtonClick">
						View
					</Button>
				</div>
			</WidthLimiter>
		</div>
		LLL{{ ownedNFTs.length + 0 }}
		<div class="content-center margin-b account-backgroud">
			<div class="map-wrapper">
				<div v-for="(nft, nftIndex) in ownedNFTs" :key="'block' + nftIndex">
					<img 
						v-for="(priece, prieceIndex) in getPieces(nft)"
						class="nft-map-image"
						:style="priece"
						:src="nft.image"
						:key="'block' + nftIndex +'nft' + prieceIndex" 
					/>
				</div>
				<img class="map-image" src="../assets/ukraine-main.png" />
			</div>
		</div>
	</div>
</template>

<script>
import { verifyAddress } from '../utils';
import Button from '../components/Button.vue';
import TextBox from '../components/TextBox.vue';
import WidthLimiter from '../components/WidthLimiter.vue';

export default {
	name: 'Details',

	components: {
		Button,
		TextBox,
		WidthLimiter
	},

	data() {
		return {
			isLoading: true,
			rawAddress: '',
			ownedNFTs: []
		};
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
				const position = (nft.position && nft.position[index])
					|| ({x: Math.trunc(Math.random() * (100 - nft.size)), y: Math.trunc(Math.random() * (100 - nft.size))});

				return `
					top: ${position.y}%;
					left: ${position.x}%;
					height: ${nft.size}%;
					width: ${nft.size}%;
				`;
			});
		},
		onButtonClick() {
			if (verifyAddress(this.rawAddress)) {
				this.$router.push('/account/' + this.rawAddress);
			}
			else {
				this.showInvalidAddressMessage();
				this.rawAddress = '';
			}
		},
		loadAccountNFTs() {
			this.$store.dispatch('nft/loadAccountNFTs', this.rawAddress)
				.then((ownedNFTs => this.ownedNFTs = ownedNFTs))
				.catch(e => this.$bvToast.toast('Failed to load account NFTs. ' + e.message, {
				variant: 'danger',
				solid: true,
			}));
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

.account-backgroud {
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

@media #{$screen-tablet-lg} {
	.row-address-input {
		grid-template-columns: auto 256px;
	}
}

@media #{$screen-tablet-sm} {
	.row-address-input {
		grid-template-columns: auto 200px;
	}
}

@media #{$screen-mobile} {
	.row-address-input {
		grid-template-columns: 100%;
	}
}

</style>