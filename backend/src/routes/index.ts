import { Express, Request, Response } from 'express';
import { NFTService } from '@src/services/NFTService';

// Test routes.
// TODO: remove.
export class Routes {
    static register = async (app: Express) => {
        app.get('/nfts/id/:id', async (req: Request, res: Response) => {
            const id = Number(req.params.id);

            try {
                const base64 = await NFTService.getNFTImageBase64(id);
                res.setHeader('content-type', 'text/html');
                res.send(`<img src="data:image/png;base64${base64}" />`);
            } catch (e) {
                res.status(502).send((e as Error).message);
            }
        });
    };
}
