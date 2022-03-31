import { StorageService } from 'garush-storage';
import * as fs from 'fs';
import { 
    Account,
    AggregateTransaction,
    Deadline,
    KeyGenerator,
    MetadataTransactionService,
    MosaicNonce, 
    MosaicDefinitionTransaction,
    MosaicFlags,
    MosaicSupplyChangeAction,
    MosaicSupplyChangeTransaction,
    MosaicId, 
    NetworkType,  
    RepositoryFactoryHttp,
    TransactionService,
    UInt64
} from 'symbol-sdk';

const config = {
    nodeUrl: "https://xym244.allnodes.me:3001",
    websocketUrl: 'wss://xym244.allnodes.me:3001/ws',
    networkType: NetworkType.MAIN_NET,
    privateKey: '',
    parser: 'ZSU',
    version: 1,
    metadataKey: 'ZSUNFT'
};

interface MosaicDefinitionData {
    mosaicId: MosaicId;
    nonce: MosaicNonce;
}

interface NFT {
    fileName: string;
    name: string;
    supply: number;
    mosaic: MosaicDefinitionData;
};

const NFTList = [
    {id: 1000, fileName: 'flower', name: 'Ukrainian Sunflower',                          price: 8, supply: 200, mosaic: getMosaic()},
    {id: 1001, fileName: 'ukrainian-national-flag', name: 'The Flag of Ukraine', price: 10, supply: 500, mosaic: getMosaic()},
    {id: 1002, fileName: 'ukrainian-national-symbol', name: 'Tryzub',       price: 10, supply: 500, mosaic: getMosaic()},
    {id: 1003, fileName: 'medicals', name: 'First Aid Kit',                      price: 50, supply: 500, mosaic: getMosaic()},
    {id: 1004, fileName: 'nutrition', name: 'Nutrition Pack',                    price: 50, supply: 500, mosaic: getMosaic()},
    {id: 1005, fileName: 'supply', name: 'Humanitarian Supply',                          price: 50, supply: 500, mosaic: getMosaic()},
    {id: 1006, fileName: 'ambulance', name: 'Ambulance',                    price: 50, supply: 500, mosaic: getMosaic()},
    {id: 1007, fileName: 'mriya', name: 'Mriya',                            price: 100, supply: 500, mosaic: getMosaic()},
    {id: 1008, fileName: 'petrolium', name: 'Fuel',                    price: 100, supply: 500, mosaic: getMosaic()},
    {id: 1009, fileName: 'helmet', name: 'Helmet',                          price: 100, supply: 500, mosaic: getMosaic()},
    {id: 1010, fileName: 'body-armour', name: 'Body Armour',                price: 100, supply: 500, mosaic: getMosaic()},
    {id: 1011, fileName: 'molotov', name: 'Ukrainian Smoothie',                        price: 100, supply: 500, mosaic: getMosaic()},
    {id: 1012, fileName: 'tank', name: 'Ukrainian Tank',                    price: 200, supply: 100, mosaic: getMosaic()},
    {id: 1013, fileName: 'javelin', name: 'Javelin',                        price: 200, supply: 100, mosaic: getMosaic()},
    {id: 1014, fileName: 'bayraktar', name: 'Bayraktar',                    price: 500, supply: 50, mosaic: getMosaic()},
    {id: 1015, fileName: 'mig-29', name: 'MIG 29',                          price: 500, supply: 50, mosaic: getMosaic()},
    {id: 1016, fileName: 'tank-captured-2', name: 'Ukrainian Farmers',          price: 5000, supply: 30, mosaic: getMosaic()},
    {id: 1017, fileName: 'warship', name: 'Russian Warship',                price: 7000, supply: 10, mosaic: getMosaic()},
    {id: 1018, fileName: 'zelenskyi', name: 'Zelensky',                    price: 20000, supply: 5, mosaic: getMosaic()},
    {id: 1019, fileName: 'russian-nazzies', name: 'Kick the Nazis',        price: 20000, supply: 5, mosaic: getMosaic()},
    {id: 1020, fileName: 'huilo', name: 'Huilo',                            price: 35000, supply: 1, mosaic: getMosaic()},
];

function getMosaic(): MosaicDefinitionData {
    const account = Account.createFromPrivateKey(config.privateKey, config.networkType);
    const nonce = MosaicNonce.createRandom();

    return {
        mosaicId: MosaicId.createFromNonce(nonce, account.address),
        nonce
    };
}

async function uploadFile(nft: NFT) {
    console.log(`[Upload file] "${nft.fileName}"`)
    const file = fs.readFileSync(`./scripts/images/${nft.fileName}.png`);

    const repositoryFactory = new RepositoryFactoryHttp(config.nodeUrl, {
        websocketUrl: config.websocketUrl,
        networkType: config.networkType
    });
    
    //@ts-ignore
    const storage = new StorageService(repositoryFactory);
    const signerPrivateAccount = Account.createFromPrivateKey(config.privateKey, config.networkType);
    const content = file;
    const name = nft.name;
    const mime = 'image/png';
    const feeMultiplier = 100;
    const userData = { mosaicId: nft.mosaic.mosaicId.toHex() };

    try {
        return storage.storeFile({
            // @ts-ignore
            signerPrivateAccount,
            // @ts-ignore
            recipientPublicAccount: signerPrivateAccount.publicAccount,
            content,
            name,
            mime,
            feeMultiplier,
            userData,
            cosignerAccounts: [],
            extraTransactions: [],
            logger: console,
        });
    } catch (e) {
        console.error(e);
    }
}

async function defineMosaic(nft: NFT, rootTransactionHash: string) {
    console.log(`[Define Mosaic] "${nft.fileName}"`)
    const repositoryFactory = new RepositoryFactoryHttp(config.nodeUrl, {
        websocketUrl: config.websocketUrl,
        networkType: config.networkType
    });
    const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
    const generationHash = await repositoryFactory.getGenerationHash().toPromise();
    const deadline = Deadline.create(epochAdjustment);
    const account = Account.createFromPrivateKey(config.privateKey, config.networkType);
    const mosaicFlags = MosaicFlags.create(false, true, false);
    const maxMosaicDuration = UInt64.fromUint(0);
    const maxFee = UInt64.fromUint(1000000);

    const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
        deadline,
        nft.mosaic.nonce,
        nft.mosaic.mosaicId,
        mosaicFlags,
        0,
        maxMosaicDuration,
        config.networkType,
    ).toAggregate(account.publicAccount);

    const mosaicSupplyTransaction = MosaicSupplyChangeTransaction.create(
        deadline,
        nft.mosaic.mosaicId,
        MosaicSupplyChangeAction.Increase,
        UInt64.fromUint(nft.supply),
        config.networkType,
    ).toAggregate(account.publicAccount);

    const metadataRepository = repositoryFactory.createMetadataRepository();
    const metadataTransactionService = new MetadataTransactionService(metadataRepository);
    const metadataUInt64Key = KeyGenerator.generateUInt64Key(config.metadataKey);
    const value = JSON.stringify({
        parser: config.parser,
        version: config.version,
        info: {
            rootTransactionHash,
            name: nft.name
        }
    });
    const metadataTransaction = (await metadataTransactionService.createMosaicMetadataTransaction(
        deadline,
        config.networkType,
        account.address,
        nft.mosaic.mosaicId,
        metadataUInt64Key,
        value,
        account.address,
        maxFee,
    ).toPromise()).toAggregate(account.publicAccount);

    const aggregateTransaction = AggregateTransaction.createComplete(
        deadline,
        [mosaicDefinitionTransaction, mosaicSupplyTransaction, metadataTransaction],
        config.networkType,
        [],
        maxFee,
    );

    const signedTransaction = account.sign(aggregateTransaction, generationHash);
    console.log('[Define Mosaic] Aggregate Transaction Hash:', signedTransaction.hash);

    const listener = repositoryFactory.createListener();
    const receiptHttp = repositoryFactory.createReceiptRepository();
    const transactionHttp = repositoryFactory.createTransactionRepository();
    const transactionService = new TransactionService(transactionHttp, receiptHttp);

    await listener.open().then(() => new Promise((resolve, reject) => {
        transactionService
            .announce(
                signedTransaction,
                listener,
            )
            .subscribe(
                (x) => {
                    console.log('[Define Mosaic] Confirmed');
                    resolve(x);
                },
                (err) => {
                    console.log('[Define Mosaic] Error', err.message);
                    reject(err)
                },
                () => listener.close(),
            );
    }));
}

async function main(nftList: typeof NFTList) {
    console.log('[Main] Task started');
    //const nftList = NFTList;

    for (const nft of nftList) {
        const result = await uploadFile(nft);

        if (result) {
            await defineMosaic(nft, result.rootTransactionHash);
        }
        else {
            console.error(`[Main] Operation failed for file "${nft.fileName}"`);
            break;
        }
    }

    console.log('[Main] Task finished');
    console.log(JSON.stringify(nftList.map(nft => ({
        id: nft.id,
        name: nft.name,
        description: '',
        mosaicId: nft.mosaic.mosaicId.toHex(),
        price: nft.price
    }))));
}

main(NFTList);