import * as Express from 'express'
import { getManager } from "typeorm";
import CollectionPoint from "../entities/CollectionPoint";

export default class CollectionPointsController {
    public static async getCollectionPoints(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(CollectionPoint).find({}))
    }

    public static async addCollectionPoint(req: Express.Request, res: Express.Response): Promise<void> {
        let collectionPoint = new CollectionPoint(req.body.name, req.body.address, req.body.postcode, req.body.city)
        await getManager().getRepository(CollectionPoint).save(collectionPoint)
        res.send(collectionPoint)
    }
}