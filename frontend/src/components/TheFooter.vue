<template>
    <div class="footer-container">
        <WidthLimiter>
            <div class="footer-inner">
                <img src="../assets/logo.png" class="logo margin-t-sm margin-b-sm" />
                <div class="text-crop text-center margin-b-sm">
                    <p class="label symbol-contributors">Symbol Contributors</p>
                    <p><a href="https://twitter.com/oleh_mk" target="_blank">Oleg Makarenko</a><br>
                    <a href="https://twitter.com/ArtemOslamovsky" target="_blank">Artem Oslamovskyi</a><br>
                    <a href="https://twitter.com/AndryMykhailiuk" target="_blank">Andrew Mykhailiuk</a></p>
                    <a href="https://discord.gg/xymcity">
                        <img src="../assets/discord.png" class="social" />
                    </a>
                    <a href="https://twitter.com/NEMofficial">
                        <img src="../assets/twitter.png" class="social" />
                    </a>
                </div>
            </div>
        </WidthLimiter>
    </div>
</template>

<script>
import WidthLimiter from '../components/WidthLimiter.vue';

export default {
    components: {
		WidthLimiter,
	}
}
</script>

<style lang="scss" scoped>
.footer-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--color-darkmode-bg-navbar);
    color: #fff;
}

.footer-inner {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.symbol-contributors {
    opacity: 0.6;
    text-transform: uppercase;
}

.logo {
    height: 128px;
}

.social {
    height: 64px;
    margin: 0 5px;
    filter: saturate(0.3);
}

@media #{$screen-tablet-lg} {
    .social {
        height: 45px;
    }
}

@media #{$screen-tablet-sm}, #{$screen-mobile} {
    .social {
        height: 32px;
    }
}
</style>