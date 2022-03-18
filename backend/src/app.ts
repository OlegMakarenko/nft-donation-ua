import 'module-alias/register';
import * as express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cors from 'cors';
import * as winston from 'winston';
import * as config from './config';
import { Routes } from './routes';
import { Logger } from './infrastructure';
import { DepositService } from './services/DepositService';
import * as utils from '@src/utils';

const logger: winston.Logger = Logger.getLogger(utils.basename(__filename));

class App {
    static start = async () => {
        /**
         * -------------- Initialize App --------------
         */
        config.verifyConfig(config);
        const app = express();

        /**
         * -------------- Middleware --------------
         */
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cors());

        /**
         * -------------- Start services --------------
         */
        await Routes.register(app);
        new DepositService(config.appConfig.DEPOSIT_LISTEN_INTERVAL).start();
        /**
         * -------------- Server listen --------------
         */
        app.listen(config.appConfig.PORT, () => {
            logger.info(`Server is running on port: ${config.appConfig.PORT}`);
        });
    };
}

App.start();
