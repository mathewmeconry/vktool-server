import CustomCompensation from "../entities/CustomCompensation"
import { Resolver, FieldResolver, Root, InputType, Field, Mutation, Arg, Ctx } from "type-graphql"
import { createResolver, resolveEntity } from "./helpers"
import Compensation from "../entities/Compensation"
import Contact from "../entities/Contact"
import User from "../entities/User"
import Payout from "../entities/Payout"
import { ApolloContext } from "../controllers/CliController"
import OrderCompensation from "../entities/OrderCompensation"

const baseResolver = createResolver('Compensation', Compensation)

@Resolver(of => Compensation)
export default class CompensationResolver extends baseResolver {
    @Mutation(type => Compensation)
    public async deleteCompensation(@Arg('id') id: number, @Ctx() ctx: ApolloContext): Promise<Compensation<any>> {
        let comp: Compensation<any>

        try {
            comp = await resolveEntity<CustomCompensation>('CustomCompensation', id)
        } catch (e) {
            comp = await resolveEntity<OrderCompensation>('OrderCompensation', id)
        }

        comp.deletedAt = new Date()
        comp.deletedBy = ctx.user
        return comp.save()
    }

    @Mutation(type => Compensation)
    public async approveCompensation(@Arg('id') id: number, @Ctx() ctx: ApolloContext): Promise<Compensation<any>> {
        let comp = await resolveEntity<CustomCompensation>('CustomCompensation', id)
        if (!comp) {
            comp = await resolveEntity<OrderCompensation>('OrderCompensation', id)
        }

        comp.approved = true
        comp.approvedBy = ctx.user
        return comp.save()
    }

    @FieldResolver()
    public async member(@Root() object: Compensation<any>): Promise<Contact> {
        return resolveEntity('Contact', object.memberId)
    }

    @FieldResolver()
    public async creator(@Root() object: Compensation<any>): Promise<User> {
        return resolveEntity('User', object.creatorId)
    }

    @FieldResolver({ nullable: true })
    public async approvedBy(@Root() object: Compensation<any>): Promise<User | null> {
        if (!object.approvedById) return null
        return resolveEntity('User', object.approvedById)
    }

    @FieldResolver({ nullable: true })
    public async payout(@Root() object: Compensation<any>): Promise<Payout | null> {
        if (!object.payoutId) return null
        return resolveEntity('Payout', object.payoutId)
    }

    @FieldResolver({ nullable: true })
    public async transferCompensation(@Root() object: Compensation<any>): Promise<Compensation<CustomCompensation> | null> {
        if (!object.transferCompensationId) return null
        return resolveEntity('transferCompensation', object.transferCompensationId)
    }

    @FieldResolver({ nullable: true })
    public async updatedBy(@Root() object: Compensation<any>): Promise<User | null> {
        if (!object.updatedById) return null
        return resolveEntity('User', object.updatedById)
    }

    @FieldResolver({ nullable: true })
    public async deletedBy(@Root() object: Compensation<any>): Promise<User | null> {
        if (!object.deletedById) return null
        return resolveEntity('User', object.deletedById)
    }
}