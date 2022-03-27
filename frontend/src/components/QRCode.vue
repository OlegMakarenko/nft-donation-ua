<template>
    <div class="qr-code-container padding pointer" :class="extraClasses" @click="scale">
        <img :src="image" class="qr-code-image" />
        <h4 class="text-crop qr-code-name">
            Transaction
        </h4>
        <a :href="image" :download="message + '.png'">
            Download
        </a>
    </div>
</template>

<script>
import { TransactionQR } from 'symbol-qr-library';
import { Address, Deadline, Mosaic, PlainMessage, PublicAccount, TransferTransaction, UInt64 } from 'symbol-sdk';

export default {
    props: {
        address: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        message: {
            type: Number,
            required: true
        }
    },

    data() {
        return {
            image: '',
            extraClasses: ''
        }
    },

    mounted() {
        this.load();
    },

    methods: {
        async load() {
            this.image = '';
            const { 
                epochAdjustment, 
                generationHash, 
                nativeMosaicId, 
                networkType 
            } = this.$store.getters['api/networkConfig'];
            const address = Address.createFromRawAddress(this.address);
            const mosaic = new Mosaic(nativeMosaicId, UInt64.fromUint(this.amount * Math.pow(10, 6)));
            const message = PlainMessage.create('' + this.message);

            const deadline = Deadline.create(epochAdjustment, 2);
            const maxFee = UInt64.fromUint(1000000);
            
            const transferTransaction = TransferTransaction.create(
                deadline,
                address,
                [mosaic],
                message,
                networkType,
                maxFee
            );

            const txQR = new TransactionQR(transferTransaction, networkType, generationHash);
            this.image = await txQR.toBase64().toPromise();
        },

        scale() {
            this.extraClasses = this.extraClasses ? '' : 'scaled-up'
        }
    },

    watch: {
        amount() {
            this.load();
        }
    }
}
</script>

<style lang="scss" scoped>
.qr-code-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-radius: $border-radius;

    .qr-code-image {
        width: 100%;
    }

    .qr-code-name {
        text-align: center;
        color: var(--color-darkmode-form-accent);
    }

    a {
        display: none;
    }
}

.scaled-up {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000d;
    z-index: 10;

    .qr-code-image {
        object-fit: contain;
        width: unset;
        width: 100%;
        height: 80%;
    }

    .qr-code-name {
        display: none;
    }

    a {
        display: unset;
    }
}
</style>