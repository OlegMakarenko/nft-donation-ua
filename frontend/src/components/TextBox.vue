<template>
    <b-input v-model="model" class="text-box" :placeholder="placeholder" v-on:keyup.enter="onEnter" />
</template>

<script>
export default {
    props: {
        value: {
            type: [String, Number],
        },
        placeholder: {
            type: [String, Number],
        },
    },

    computed: {
        model: {
            get() {
                return this.value;
            },

            set(value) {
                this.$emit('input', value);
            },
        },
    },

    methods: {
        onEnter() {
            this.$emit('enter');
        }
    }
};
</script>

<style lang="scss" scoped>
.text-box {
    min-width: 128px;
    height: auto;
    padding: 11px 11px 12px;
    font: var(--font-web-large-body);
    text-decoration: none;
    background: var(--color-lightmode-bg-gray);
    border: 2px solid var(--color-lightmode-button-default-stroke);
    border-radius: 4px;
    box-shadow: var(--effect-button-default);
    cursor: pointer;
    transition: background-color 0.2s;
    user-select: text;
    &:hover {
        border-color: var(--color-lightmode-button-hover-bg);
    }
    &:focus {
        border-color: var(--color-darkmode-form-accent-light);
    }
    &:last-child {
        margin-bottom: 0;
    }
    &::placeholder {

    }
}

@media #{$screen-tablet-lg}, #{$screen-tablet-sm} {
    .text-box {
        font: var(--font-web-desktop-body);
    }
}

@media #{$screen-mobile} {
    .text-box {
        padding: 7px 14.65px;
        font: var(--font-web-mobile-body);
    }
}
</style>
