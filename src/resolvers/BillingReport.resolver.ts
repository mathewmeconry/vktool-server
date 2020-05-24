import { Resolver, FieldResolver, Root, Args, Arg, registerEnumType, Mutation, Ctx, InputType, Field } from "type-graphql"
import BillingReport, { BillingReportState } from "../entities/BillingReport"
import { createResolver, resolveEntity, resolveEntityArray } from "./helpers"
import User from "../entities/User"
import Order from "../entities/Order"
import OrderCompensation from "../entities/OrderCompensation"
import Contact from "../entities/Contact"
import { getConnection, getManager } from "typeorm"
import { ApolloContext } from "../controllers/CliController"

const baseResolver = createResolver('BillingReport', BillingReport)

registerEnumType(BillingReportState, {
    name: 'BillingReportState',
    description: 'Possilbe states for billingReports'
})

@InputType()
class AddBillingReportInput implements Partial<BillingReport> {
    @Field()
    public orderId: number

    @Field()
    public date: Date

    @Field(type => [Number])
    public elIds: number[]

    @Field(type => [Number])
    public driverIds: number[]

    @Field()
    public food: boolean

    @Field({ nullable: true })
    public remarks?: string
}

@InputType()
class EditBillingReportInput implements Partial<BillingReport> {
    @Field()
    public id: number

    @Field({ nullable: true })
    public orderId?: number

    @Field({ nullable: true })
    public date?: Date

    @Field(type => [Number], { nullable: true })
    public elIds?: number[]

    @Field(type => [Number], { nullable: true })
    public driverIds?: number[]

    @Field({ nullable: true })
    public food?: boolean

    @Field({ nullable: true })
    public remarks?: string
}

@Resolver(of => BillingReport)
export default class BillingReportResolver extends baseResolver {
    @Mutation(type => BillingReport)
    public async editBillingReport(@Arg('data') data: EditBillingReportInput, @Ctx() ctx: ApolloContext): Promise<BillingReport> {
        const br = await resolveEntity<BillingReport>('BillingReport', data.id)

        if (data.orderId) {
            const order = await resolveEntity<Order>('Order', data.orderId)
            br.order = order
        }

        if (data.elIds) {
            const els = await resolveEntityArray<Contact>('Contact', data.elIds)
            br.els = els
        }

        if (data.driverIds) {
            const drivers = await resolveEntityArray<Contact>('Contact', data.driverIds)
            br.drivers = drivers
        }

        for (const key of Object.keys(data)) {
            // @ts-ignore
            br[key] = data[key]
        }
        br.updatedBy = ctx.user

        return br.save()
    }

    @Mutation(type => BillingReport)
    public async addBillingReport(@Arg('data') data: AddBillingReportInput, @Ctx() ctx: ApolloContext): Promise<BillingReport> {
        const order = await resolveEntity<Order>('Order', data.orderId)
        const els = await resolveEntityArray<Contact>('Contact', data.elIds)
        const drivers = await resolveEntityArray<Contact>('Contact', data.driverIds)

        // @ts-ignore
        const br = new BillingReport({ id: 1 }, order, data.date, [], els, drivers, data.food, data.remarks || '', BillingReportState.PENDING)

        return br.save()
    }

    @Mutation(type => BillingReport)
    public async changeBillingReportState(@Arg('id') id: number, @Arg('state') state: BillingReportState, @Ctx() ctx: ApolloContext): Promise<BillingReport> {
        const br = await getManager()
            .getRepository(BillingReport)
            .createQueryBuilder('billingReport')
            .leftJoinAndSelect('billingReport.creator', 'user')
            .leftJoinAndSelect('billingReport.order', 'order')
            .leftJoinAndSelect('billingReport.compensations', 'compensations', 'compensations.deletedAt IS NULL')
            .leftJoinAndSelect('compensations.member', 'member')
            .leftJoinAndSelect('billingReport.els', 'els')
            .leftJoinAndSelect('billingReport.drivers', 'drivers')
            .where('billingReport.id = :id', { id })
            .getOne()

        if (!br) throw new Error('BillingReport not found')

        await getManager().createQueryBuilder()
            .update(OrderCompensation)
            .set({ approved: state === BillingReportState.APPROVED, updatedBy: ctx.user })
            .where('billingReport = :id', { id: br.id })
            .andWhere('deletedAt IS NULL')
            .execute()

        if (state === BillingReportState.APPROVED) {
            br.approvedBy = ctx.user
        } else {
            br.approvedBy = undefined
        }
        br.state = state
        br.updatedBy = ctx.user

        return br.save()
    }

    @FieldResolver()
    public async creator(@Root() object: BillingReport): Promise<User> {
        return resolveEntity('User', object.creatorId)
    }

    @FieldResolver()
    public async order(@Root() object: BillingReport): Promise<Order> {
        return resolveEntity('Order', object.orderId)
    }

    @FieldResolver()
    public async compensations(@Root() object: BillingReport): Promise<OrderCompensation[]> {
        return resolveEntityArray('OrderCompensation', object.compensationIds)
    }

    @FieldResolver()
    public async els(@Root() object: BillingReport): Promise<Contact[]> {
        return resolveEntityArray('Contact', object.elIds)
    }

    @FieldResolver()
    public async drivers(@Root() object: BillingReport): Promise<Contact[]> {
        return resolveEntityArray('Contact', object.driverIds)
    }

    @FieldResolver({ nullable: true })
    public async approvedBy(@Root() object: BillingReport): Promise<User | null> {
        if (object.approvedById) {
            return resolveEntity('User', object.approvedById)
        }
        return null
    }

    @FieldResolver()
    public async updatedBy(@Root() object: BillingReport): Promise<User> {
        return resolveEntity('User', object.updatedById)
    }
}