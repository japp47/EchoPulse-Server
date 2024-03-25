import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors'
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from "@apollo/server/express4";
import { prismaClient } from "../clients/db";

import { User } from './user'
import { Echo } from './echo'
import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";

export async function initServer() {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    
    const graphqlServer = new ApolloServer<GraphqlContext>({
        typeDefs: `
        ${User.types}
        ${Echo.types}
            type Query {
                ${User.queries}
                ${Echo.queries}
            }    
            
            type Mutation {
                ${Echo.mutations}
            }
        `,
        resolvers: {
            Query: {
                ...User.resolvers.queries,
                ...Echo.resolvers.queries
            },
            Mutation: {
                ...Echo.resolvers.mutations,
            },
            ...Echo.resolvers.extraResolvers,
            ...User.resolvers.extraResolvers
            
        },
    });
    await graphqlServer.start();
    app.use('/graphql', expressMiddleware(graphqlServer, { context: async({ req, res }) => {
        return {
            user: req.headers.authorization
                ? JWTService.decodeToken(req.headers.authorization.split('Bearer ')[1])
                : undefined 
        }
    }}));

    return app;
}
