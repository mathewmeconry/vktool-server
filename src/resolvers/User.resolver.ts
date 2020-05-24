import { Resolver, Root, FieldResolver, Query, Ctx } from "type-graphql"
import { createResolver, resolveEntity } from "./helpers"
import User from "../entities/User"
import Contact from "../entities/Contact"
import { ApolloContext } from "../controllers/CliController"

const baseResolver = createResolver('User', User)


@Resolver(of => User)
export default class UserResolver extends baseResolver {
    @Query()
    public me(@Ctx() ctx: ApolloContext): User {
        return ctx.user
    }

    @FieldResolver({ nullable: true })
    public async bexioContact(@Root() object: User): Promise<Contact | null> {
        if (!object.bexioContactId) return null
        return resolveEntity('Contact', object.bexioContactId)
    }
}