<template>
    <div class="loading-container" :class="{'loading-small': small}">
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        <h3 v-if="!small"> {{translate('message_please_wait')}} </h3>
    </div>
</template>

<script>
export default {
    props: {
        small: {
            type: Boolean
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
.loading-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #0009;
    z-index: 101;
}

.loading-small {
    position: absolute !important;
    width: 100% !important;
    height: 100% !important;
}

.lds-ring {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
}

.lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 4px;
    border: 4px solid #fff;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
}

.lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
}

.lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
}

.lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
}

@keyframes lds-ring {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>