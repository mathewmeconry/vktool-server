import * as Express from 'express'
import Order from "../entities/Order";
import { getManager } from 'typeorm';

export default class OrdersController {
    public static async getOrders(req: Express.Request, res: Express.Response): Promise<void> {
        res.send(await getManager().getRepository(Order).find())
    }
}