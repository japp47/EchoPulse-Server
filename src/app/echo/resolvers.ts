import { Echo } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

interface CreateEchoPayload {
    content: string;
    imageURL?: string;
}

const queries = {
    getAllEchoes: () => prismaClient.echo.findMany({orderBy: {createdAt: 'desc'}})
}
const mutations= {
    createEcho: async(
        parent: any, 
        {payload}:{payload: CreateEchoPayload}, 
        ctx: GraphqlContext) =>
        {
            if(!ctx.user) throw new Error("You are not authenticted");
            const echo = await prismaClient.echo.create({
                data: {
                    content: payload.content,
                    imageURL: payload.imageURL,
                    author: {connect : {id: ctx.user.id}}
                },
            });
        return echo;
    }
}

const extraResolvers = {
    Echo: {
        author: (parent: Echo) => 
        prismaClient.user.findUnique({
            where: {
                id: parent.authorId
            }
        }) 
    }
}

export const resolvers = {mutations, extraResolvers,queries}