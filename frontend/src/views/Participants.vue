<template>
	<div v-if="!isError" class="root">
		<div class="bg-peace" />
		<div class="main-container">
			<div class="main-container-content content-center">
				<WidthLimiter class="margin-b">
                    <div class="content-center fullwidth margin-b image">
                        <img class="image" src="../assets/coins.png" />
                    </div>
                    <div class="text-crop margin-b-sm">
                        <h2 class="title text-center">
                            {{ totalFormatted }} XYM
                            <br>
                            {{translate('raised_page_title')}}
                        </h2>
                    </div>
                    <div class="text-crop margin-b">
                        <p class="title hero text-center" style="white-space: pre-line">
                            {{translate('raised_page_desc')}}
                        </p>
                    </div>
                    <div class="account-list">
                        <router-link 
                            v-for="(account, index) in accounts" 
                            class="item-placeholder margin-b-sm account-card padding" 
                            :to="'/account/' + account.address"
                            :key="'account' + index"
                        >
                            <img class="strip" src="../assets/vyshyvanka.png" />
                            <div v-if="accountsLoaded">
                                <div class="text-crop margin-b-sm2">
                                    <h4 class="address">{{ account.address }}</h4>
                                </div>
                                <div class="f-row space-between">
                                    <div class="text-crop"><p class="label index">#{{ index + 1 }}</p></div>
                                    <div class="text-crop"><p class="label amount">{{ Math.trunc(account.amount) }} XYM</p></div>
                                </div>
                            </div>
                            <div v-else>
                                <div class="text-crop margin-b-sm2">
                                    <h4 class="address empty">.</h4>
                                </div>
                                <div class="f-row space-between">
                                    <div class="text-crop"><p class="label index empty">.</p></div>
                                </div>
                            </div>
                        </router-link>
                    </div>
				</WidthLimiter>
			</div>
		</div>
        <LoadingSpinner v-if="isLoading" :progress="true" :percent="percent"/>
	</div>
</template>

<script>
import TheFooter from '../components/TheFooter.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import WidthLimiter from '../components/WidthLimiter.vue';
import NFTCard from '../components/NFTCard.vue';

export default {
	name: 'Home',
	components: {
		TheFooter,
		WidthLimiter,
		NFTCard,
        LoadingSpinner
	},

	computed: {
		totalFormatted() {
            const total = this.$store.getters['participants/total'];
            return Math.trunc(total).toLocaleString('en').split(',').join(' ') || '...';
        },
        accountsLoaded() {
            const accounts = this.$store.getters['participants/accounts'];
            return !!(accounts && accounts.length);
        },
        placeholderAccounts() {
            return new Array(Math.round(this.percent / 10)).fill({});
        },
        accounts() {
            const accounts = this.$store.getters['participants/accounts'];
            return this.accountsLoaded
                ? accounts
                : this.placeholderAccounts;
        },
        isLoading() {
            return this.$store.getters['participants/isLoading'];
        },
        isError() {
            return this.$store.getters['participants/isError'];
        },
        percent() {
            return this.$store.getters['participants/percent'];
        }
	},

	mounted () {
        this.load();
	},

    beforeUnmount () {
        this.$store.dispatch('participants/stop');
    },

	methods: {
        async load() {
            try {
                await this.$store.dispatch('participants/load');
            }
            catch (e) {
                console.error(e);
            }
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
    min-height: 100vh;

	a {
		color: var(--color-flag-blue);
	}
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
    height: 100%;
    color: #000;
}

.main-container-content {
    min-height: 100%;
}

.image {
    height: 50vh;
    max-height: 512px;
}

.account-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.item-placeholder {
    animation: fadein 1s;
}

.account-card {
    position: relative;
    transition: all .2s ease-in-out;
    border-radius: $border-radius;
    background: var(--color-lightmode-bg-main);
    width: 100%;
    max-width: 650px;
    overflow: hidden;
    filter: drop-shadow(0 0 4px #0003);

    .strip {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        transform: translateX(-50%);
    }

    p {
        text-align: right;
    }
    
    .address {
        color: var(--color-lightmode-text-title);
    }

    .index {
        color: var(--color-lightmode-text-body);
    }

    .amount {
        color: var(--color-lightmode-text-learn-more);
        text-align: right;
    }

    &:hover {
        text-decoration: unset;
        transform: scale(1.01);
        filter: drop-shadow(0 0 6px #0002);
    }
}

@media #{$screen-mobile} {
	.image {
        height: 25vh;
        max-height: 256px;
    }
}
</style>
