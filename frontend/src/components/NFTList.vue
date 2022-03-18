<template>
    <div class="nft-list-wrapper">
        <div class="nft-list">
            <NFTCard
                v-for="(item, index) in nftList" :key="'nft' + index"
                :mosaicId="item.mosaicId"
                :name="item.name"
                :description="item.description"
                :price="item.price"
                :count="item.availableCount"
                :image="item.image"
            />
        </div>
    </div>
</template>

<script>
import NFTCard from './NFTCard.vue';

export default {
    components: {
        NFTCard
    },

    props: {
        nftList: {
            type: Array,
            requried: true,
            default: () => []
        }
    }
}
</script>

<style lang="scss" scoped>
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
</style>