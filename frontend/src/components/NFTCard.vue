<template>
    <router-link class="nft-card" :class="{'bg-loading': isLoading}" :to="link" target="_blank">
        <div class="nft-image-container" :title="name">
            <img class="nft-image" :class="{'nft-unavailable': soldOut}" :src="image" :alt="name" />
        </div>
        <div class="nft-card-desc">
            <h4 class="title" :title="name">
                {{ translate('nft_name_' + name) }}
            </h4>
            <div>
                <div class="nft-count">
                    {{translate('home_page_nft_card_available')}} {{ count }}
                </div>
                <div class="nft-price">
                    {{ price }} XYM
                </div>
            </div>
        </div>
        <h3 v-if="soldOut" class="nft-sold-out">
            {{translate('home_page_nft_card_sold_out')}}
        </h3>
        <LoadingSpinner small v-if="isLoading" />
    </router-link>
</template>

<script>
import LoadingSpinner from '../components/LoadingSpinner.vue';
export default {
    components: {
        LoadingSpinner
    },

    props: {
        mosaicId: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        },
        isLoading: {
            type: Boolean,
            required: true
        },
    },

    computed: {
        link() {
            return '/nft/' + this.mosaicId;
        },
        soldOut() {
            return this.count === 0 && !this.isLoading;
        }
    },

    methods: {
        translate(key) {
			return this.$store.getters['ui/translate'](key);
		}
    }
}
</script>

<style lang="scss" scoped>
.nft-card {
    z-index: 3;
	position: relative;
    width: 100%;
    display: inline-block;
    border: 3px solid #000;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    background: var(--color-darkmode-bg-main);
    cursor: pointer;
    transition: all .2s ease-in-out;

    &:hover {
        text-decoration: none;
        transform: scale(1.01);
    }
}

.nft-image-container {
    animation: bg-loading
        1.5s
        ease-out
        0s
        alternate
        infinite
        none
        running;
    min-height: 128px;
}

.nft-image {
    width: 100%;
}

.nft-card-desc {
    border-top: 3px solid #000;
    background: var(--color-darkmode-form-bg);
    padding: 5px 5px;
    color: var(--color-darkmode-text-subtitle);

    .title {
        width: 90%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .nft-count {
        position: absolute;
    }

    .nft-price {
        color: var(--color-flag-blue-lighter);
        text-align: right;
        width: 100%;
        opacity: 1;
    }
}

.nft-unavailable {
    opacity: 0.5;
    filter: saturate(0.3);
}

.nft-sold-out {
    position: absolute;
    top: 40%;
    left: 20%;
    transform: rotate(-45deg);
    white-space: nowrap;
    color: var(--color-darkmode-form-text);
    border: 5px solid var(--color-darkmode-form-text);
}

@media #{$screen-mobile} {

}
</style>