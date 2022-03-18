<template>
	<div id="app">
		<TheHeader />
        <div class="page-wrapper margin-t">
            <transition name="view">
                <router-view v-if="!isLoading && !isError" :key="$route.fullPath"/>
            </transition>
        </div>
	</div>
</template>

<script>
import TheHeader from './components/TheHeader.vue';
export default {
    components: {
		TheHeader,
	},

    computed: {
        isLoading() {
            return this.$store.getters['api/isLoading'];
        },

        isError() {
            return this.$store.getters['api/isError'];
        }
    },

	created () {
		this.$store.dispatch('initialize');
	}
};
</script>

<style lang="scss">
html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

#app {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.page-wrapper {
    padding-top: 60px;
    height: 100%;
}

.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    outline: 0;
}

.pointer {
    cursor: pointer;
}

.view-leave-active {
    transition: opacity 0.15s ease-in-out, transform 0.15s ease;
}

.view-enter-active {
    transition: opacity 0.15s ease-in-out, transform 0.15s ease;
    transition-delay: 0.15s;
}

.view-enter, .view-leave-to {
    opacity: 0;
}

.view-enter-to, .view-leave {
    opacity: 1;
}
</style>
