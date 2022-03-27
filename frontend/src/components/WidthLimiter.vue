<template>
    <div class="width-limiter">
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.width-limiter {
    width: 100%;
    max-width: 1800px;
    padding: 0 130px;
}

@media #{$screen-tablet-lg} {
    .width-limiter {
        max-width: 1434px;
        padding: 0 130px;
    }
}

@media #{$screen-tablet-sm} {
    .width-limiter {
        max-width: 738px;
        padding: 0 50px;
    }
}

@media #{$screen-mobile} {
    .width-limiter {
        max-width: 400px;
        padding: 0 22px;
    }
}
</style>