import * as Express from 'express'
import Order from "../entities/Order";
import Position from "../entities/Position";
import Contact from '../entities/Contact';
import OrderModel from '../models/OrderModel';

export default class OrdersController {
    public static async getOrders(req: Express.Request, res: Express.Response): Promise<void> {
        /*         let contacts = await Order.aggregate(
                    [
                        {
                            "$lookup": {
                                "from": Position.collection.name,
                                "localField": "positions",
                                "foreignField": "_id",
                                "as": "positions"
                            }
                        },
                        {
                            "$lookup": {
                                "from": Contact.collection.name,
                                "localField": "user",
                                "foreignField": "_id",
                                "as": "user"
                            }
                        },
                        {
                            "$lookup": {
                                "from": Contact.collection.name,
                                "localField": "contact",
                                "foreignField": "_id",
                                "as": "contact"
                            }
                        },
                        { "$unwind": "$user" },
                        { "$unwind": "$contact" }
                    ]) */

        let orders: Array<OrderModel> = []
        Order.find({}, { timeout: false })
            .populate('positions')
            .populate('user')
            .populate('contact')
            .cursor()
            .on('data', (data: Array<OrderModel>) => {
                orders = orders.concat(data)
            })
            .on('end', () => {
                res.send(orders)
            })
    }
}