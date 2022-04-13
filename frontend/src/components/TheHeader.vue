<template>
    <div class="header-container">
        <WidthLimiter>
            <div class="header-inner">
                <router-link class="header-nav-link" to="/" :active="$route.name === 'home'">
                    <img class="image-flag" :src="imgFlag" />
                </router-link>
                <div class="header-nav">
                    <router-link class="header-nav-link" to="/" :active="$route.name === 'home'">
                        {{translate('menu_home')}}
                    </router-link>
                    <div class="header-nav-separator" />
                    <router-link class="header-nav-link" to="/account" :active="$route.name === 'account'">
                        {{translate('menu_nfts')}}
                    </router-link>
                    <div class="header-nav-separator" />
                    <router-link class="header-nav-link" to="/raised" :active="$route.name === 'raised'">
                        {{translate('menu_raised')}}
                    </router-link>
                    <div class="header-nav-separator" />
                    <div class="header-nav-link language pointer" @click="langDialog = true">
                        {{languageSelector}}
                    </div>
                </div>
            </div>
        </WidthLimiter>
        <div v-if="langDialog || !lang" class="dialog-wrapper">
            <dialog open class="padding">
                <div class="text-crop margin-b">
                    <h3>{{translate('select_language_title')}}</h3>
                </div>
                <Button 
                    v-for="(lang) in langs" :key="'l' + lang"
                    class="margin-b-sm"
                    @click="changeLang(lang)">
                    {{lang}}
                </Button>
            </dialog>
        </div>
    </div>
</template>

<script>
import Button from '../components/Button.vue';
import WidthLimiter from '../components/WidthLimiter.vue';
import imgFlag from '../assets/flag.svg';

export default {
    components: {
        Button,
		WidthLimiter,
	},

    data() {
        return {
            imgFlag,
            langDialog: false
        };
    },

    computed: {
        lang() {
			return this.$store.getters['ui/currentLanguage'];
		},
        langs() {
			return this.$store.getters['ui/languages'];
		},
        languageSelector() {
            return this.translate('langName').substring(0, 3);
        }
    },

    methods: {
        changeLang(lang) {
            this.$store.dispatch('ui/changeLanguage', lang);
        },
        translate(key) {
			return this.$store.getters['ui/translate'](key);
		}
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

.language {
    border-radius: $border-radius;
    color: var(--color-darkmode-bg-navbar);
    background: var( --color-darkmode-text-footer);
    padding: 0 5px;
}

.dialog-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    background-color: #0009;
    backdrop-filter: blur(10px);

    dialog {
        border-radius: $border-radius;
        background-color: var(--color-darkmode-bg-main);

        button {
            width: 100%;
        }
    }
}
</style>