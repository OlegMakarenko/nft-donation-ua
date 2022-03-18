<template>
    <div class="count-selector">
        <span class="count-selector-button pointer" @click="decrease">
            -
        </span>
        <div class="count-selector-value pointer" @click="input">
            {{ value }}
        </div>
        <span class="count-selector-button pointer" @click="increase">
            +
        </span>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            required: true
        },
        maxValue: {
            type: Number
        }
    },
    methods: {
        increase() {
            if (this.value < this.maxValue) {
                this.onChange(this.value + 1);
            }
        },
        decrease() {
            if (this.value > 1) {
                this.onChange(this.value - 1);
            }
        },
        input() {
            const rawValue = prompt(`Please enter the number from ${1} to ${this.maxValue}`);
            const value = Number(rawValue);

            if (isNaN(value)) {
                return;
            }

            if (0 < value && value <= this.maxValue) {
                this.onChange(Math.trunc(value));
            } 
            else if (value > this.maxValue) {
                this.onChange(this.maxValue);
            }
        },
        onChange(newValue) {
            this.$emit('change', newValue);
        }
    },
};
</script>

<style lang="scss" scoped>
.count-selector {
    width: 300px;
    display: inline-flex;
    justify-content: space-between;
    align-items: stretch;
    border-radius: 4px;
    box-shadow: var(--effect-button-default);
    
    &:hover {
        box-shadow: var(--effect-button-hover);
    }
}

.count-selector-button {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 60px;
    padding: 12px 12px 10px;
    color: var(--color-lightmode-button-default-text);
    font: var(--font-web-large-button-medium);
    letter-spacing: var(--typography-web-large-button-medium-letter-spacing);
    text-align: center;
    text-transform: var(--typography-web-large-button-medium-text-case);
    text-decoration: none;
    border: 2px solid var(--color-lightmode-button-default-stroke);
    background: var(--color-lightmode-button-default-bg);
    box-shadow: var(--effect-button-default);
    cursor: pointer;
    transition: background-color 0.2s;
    user-select: none;

    &:hover {
        background: var(--color-lightmode-button-hover-bg);
        color: var(--color-lightmode-button-hover-text);
    }

    &:first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }

    &:last-child {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }
}

.count-selector-value {
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    border-top: 2px solid var(--color-lightmode-button-default-stroke);
    border-bottom: 2px solid var(--color-lightmode-button-default-stroke);
    user-select: none;
    background: #000;
    
}

@media #{$screen-tablet-lg}, #{$screen-tablet-sm} {
    .count-selector {
        width: 250px;
    }
    .count-selector-button {
        font: var(--font-web-desktop-button-medium);
        letter-spacing: var(--typography-web-desktop-button-medium-letter-spacing);
        text-transform: var(--typography-web-desktop-button-medium-text-case);
    }
}
@media #{$screen-mobile} {
    .count-selector {
        width: 200px;
    }
    .count-selector-button {
        padding: 8.9px 8.9px 7.5px;
        font: var(--font-web-mobile-button-medium);
        letter-spacing: var(--typography-web-mobile-button-medium-letter-spacing);
        text-transform: var(--typography-web-mobile-button-medium-text-case);
    }
}
</style>