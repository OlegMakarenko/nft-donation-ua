<template>
    <div class="header-container">
        <WidthLimiter>
            <div class="header-inner">
                <router-link class="header-nav-link" to="/" :active="$route.name === 'home'">
                    <img class="image-flag" :src="imgFlag" />
                </router-link>
                <div class="header-nav">
                    <router-link class="header-nav-link" to="/" :active="$route.name === 'home'">
                        Home
                    </router-link>
                    <div class="header-nav-separator" />
                    <router-link class="header-nav-link" to="/account/" :active="$route.name === 'account'">
                        My NFTs
                    </router-link>
                </div>
            </div>
        </WidthLimiter>
    </div>
</template>

<script>
import WidthLimiter from '../components/WidthLimiter.vue';
import imgFlag from '../assets/flag.svg';

export default {
    components: {
		WidthLimiter,
	},

    data() {
        return {
            imgFlag
        };
    }
}
</script>

<style lang="scss" scoped>
.header-container {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    background: var(--color-darkmode-bg-navbar);
}

.header-inner {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
}

.image-flag {
    height: 25px;
}

.header-nav {
    display: flex;
    align-items: center;
}

.header-nav-separator {
    width: 2px;
    height: 12px;
    background: transparent;
    margin: 0 10px;
}

.header-nav-link {
    color: var( --color-darkmode-text-footer);
    text-transform: uppercase;

    &[active=true] {
        color: var(--color-darkmode-text-body);
    }
}
</style>