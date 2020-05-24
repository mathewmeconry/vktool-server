import { Resolver, Root, FieldResolver, InputType, Field, Mutation, Arg, Ctx } from "type-graphql"
import { createResolver, resolveEntity } from "./helpers"
import Logoff, { LogoffState } from "../entities/Logoff"
import { registerEnumType } from "type-graphql"
import Contact from "../entities/Contact"
import User from "../entities/User"
import { ApolloContext } from "../controllers/CliController"
import LogoffService from "../services/LogoffService"

const baseResolver = createResolver('Logoff', Logoff)

registerEnumType(LogoffState, {
    name: 'LogoffState',
    description: 'Possible states for logoffs'
})

@InputType()
class AddLogoff implements Partial<Logoff> {
    @Field()
    public contactId: number

    @Field()
    public from: Date

    @Field()
    public until: Date

    @Field()
    public state: LogoffState

    @Field({ nullable: true })
    public remarks?: string
}

@Resolver(of => Logoff)
export default class LogoffResolver extends baseResolver {
    @Mutation(type => Logoff)
    public async deleteLogoff(@Arg('id') id: number, @Arg('notify', { defaultValue: true }) notify: boolean = true, @Ctx() ctx: ApolloContext): Promise<Logoff> {
        const logoff = await resolveEntity<Logoff>('Logoff', id)
        logoff.deletedAt = new Date()
        logoff.deletedBy = ctx.user

        if (notify !== false) {
            LogoffService.sendChangeStateMail(logoff.contact, logoff)
        }

        return logoff.save()
    }

    @Mutation(type => Logoff)
    public async changeLogoffState(@Arg('id') id: number, @Arg('state') state: LogoffState, @Arg('notify', { defaultValue: true }) notify: boolean = true, @Ctx() ctx: ApolloContext): Promise<Logoff> {
        const logoff = await resolveEntity<Logoff>('Logoff', id)
        logoff.state = state
        logoff.changedStateBy = ctx.user

        if (notify !== false) {
            LogoffService.sendChangeStateMail(logoff.contact, logoff)
        }
        return logoff.save()
    }

    @Mutation(type => [Logoff])
    public async addLogoffs(@Arg('data', type => [AddLogoff]) data: AddLogoff[], @Arg('notify', { defaultValue: true }) notify: boolean = true, @Ctx() ctx: ApolloContext): Promise<Logoff[]> {
        const savePromises: Promise<Logoff>[] = []
        for (const add of data) {
            const contact = await resolveEntity<Contact>('Contact', add.contactId)
            const logoff = new Logoff(contact, add.from, add.until, add.state, add.remarks || '', ctx.user)
            savePromises.push(logoff.save())
        }

        if (notify !== false) {
            LogoffService.sendInformationMail(await resolveEntity<Contact>('Contact', data[0].contactId), await Promise.all(savePromises))
        }

        return Promise.all(savePromises)
    }

    @Mutation(type => Logoff)
    public async addLogoff(@Arg('data') data: AddLogoff, @Arg('notify', { defaultValue: true }) notify: boolean = true, @Ctx() ctx: ApolloContext): Promise<Logoff> {
        const contact = await resolveEntity<Contact>('Contact', data.contactId)
        const logoff = new Logoff(contact, data.from, data.until, data.state, data.remarks || '', ctx.user)

        if (notify !== false) {
            LogoffService.sendInformationMail(contact, [logoff])
        }

        return logoff.save()
    }

    @FieldResolver()
    public async contact(@Root() object: Logoff): Promise<Contact> {
        return resolveEntity('User', object.contactId)
    }

    @FieldResolver()
    public async createdBy(@Root() object: Logoff): Promise<User> {
        return resolveEntity('User', object.createdById)
    }

    @FieldResolver({ nullable: true })
    public async changedStateBy(@Root() object: Logoff): Promise<User | null> {
        if (!object.changedStateById) return null
        return resolveEntity('User', object.changedStateById)
    }

    @FieldResolver({ nullable: true })
    public async deletedBy(@Root() object: Logoff): Promise<User | null> {
        if (!object.deletedById) return null
        return resolveEntity('User', object.deletedById)
    }
}