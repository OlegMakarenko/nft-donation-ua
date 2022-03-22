import { StorageService, StoreFileParams, NFTService } from 'garush-storage';
import * as fs from 'fs';
import { 
    Account,
    AggregateTransaction,
    AggregateTransactionCosignature,
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
    RepositoryFactory, 
    RepositoryFactoryHttp,
    TransactionService,
    UInt64
} from 'symbol-sdk';

const config = {
    nodeUrl: "https://201-joey-dual.symboltest.net:3001",
    websocketUrl: 'wss://sym-test-01.opening-line.jp:3001/ws',
    networkType: NetworkType.TEST_NET,
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
    {id: 1000, fileName: 'flower', name: 'Flower',                          price: 8, supply: 500, mosaic: getMosaic()},
    {id: 1001, fileName: 'ukrainian-national-flag', name: 'Ukrainian Flag', price: 10, supply: 500, mosaic: getMosaic()},
    {id: 1002, fileName: 'ukrainian-national-symbol', name: 'Tryzub',       price: 10, supply: 500, mosaic: getMosaic()},
    {id: 1003, fileName: 'kyiv-s-ghost-2', name: 'Kyiv\'s Ghost',           price: 10, supply: 500, mosaic: getMosaic()},
    {id: 1004, fileName: 'medicals', name: 'Medicals',                      price: 15, supply: 500, mosaic: getMosaic()},
    {id: 1005, fileName: 'supply', name: 'Supply',                          price: 22, supply: 500, mosaic: getMosaic()},
    {id: 1006, fileName: 'ambulance', name: 'Ambulance',                    price: 36, supply: 500, mosaic: getMosaic()},
    {id: 1007, fileName: 'mriya', name: 'Mriya',                            price: 72, supply: 500, mosaic: getMosaic()},
    {id: 1008, fileName: 'body-armour', name: 'Body Armour',                price: 72, supply: 500, mosaic: getMosaic()},
    {id: 1009, fileName: 'helmet', name: 'Helmet',                          price: 72, supply: 500, mosaic: getMosaic()},
    {id: 1010, fileName: 'nutrition', name: 'Nutrition',                    price: 72, supply: 500, mosaic: getMosaic()},
    {id: 1011, fileName: 'petrolium', name: 'Petrolium',                    price: 72, supply: 500, mosaic: getMosaic()},
    {id: 1012, fileName: 'tank', name: 'Ukrainian Tank',                    price: 358, supply: 200, mosaic: getMosaic()},
    {id: 1013, fileName: 'javelin', name: 'Javelin',                        price: 715, supply: 100, mosaic: getMosaic()},
    {id: 1014, fileName: 'bayraktar', name: 'Bayraktar',                    price: 1429, supply: 50, mosaic: getMosaic()},
    {id: 1015, fileName: 'mig-29', name: 'Mig 29',                          price: 2858, supply: 25, mosaic: getMosaic()},
    {id: 1016, fileName: 'tank-captured-2', name: 'Captured Tank',          price: 3572, supply: 20, mosaic: getMosaic()},
    {id: 1017, fileName: 'zelenskyi', name: 'Zelenskyi',                    price: 7143, supply: 5, mosaic: getMosaic()},
    {id: 1018, fileName: 'russian-nazzies', name: 'russian-nazzies',        price: 14286, supply: 2, mosaic: getMosaic()},
    {id: 1019, fileName: 'huilo', name: 'Huilo',                            price: 35715, supply: 1, mosaic: getMosaic()},
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

async function writeFile(hash: string, fileName: string) {
    const repositoryFactory = new RepositoryFactoryHttp(config.nodeUrl, {
        websocketUrl: config.websocketUrl,
        networkType: config.networkType
    });
    
    //@ts-ignore
    const storage = new StorageService(repositoryFactory);

    const file = await storage.loadImageFromHash(hash);

    fs.writeFileSync(`./scripts/images/${fileName}-result.png`, file.content);
}

async function main() {
    console.log('[Main] Started');
    const nftList = NFTList;

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

    console.log('[Main] Raedy');
    console.log(JSON.stringify(nftList.map(nft => ({
        id: nft.id,
        name: nft.name,
        description: 'Lorem ipsum ipsum lorem',
        mosaicId: nft.mosaic.mosaicId.toHex(),
        price: nft.price
    }))));
}

main();
// writeFile('0CB4F1B936909851057E4DCFB7CD77A804C690034A75A345BFDA5C8C4D875969', 'test');