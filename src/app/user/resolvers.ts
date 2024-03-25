import axios from 'axios'
import { prismaClient } from '../../clients/db';
import JWTService from '../../services/jwt';
import { GraphqlContext } from '../../interfaces';
import { User } from '@prisma/client';
interface GoogleTokenResult {
    
        iss?: string;
        azp?: string;
        aud?: string;
        sub?: string;
        email: string;
        email_verified: string;
        nbf?: string;
        name?:string;
        picture?: string;
        given_name: string;
        family_name?: string;
        iat?: string;
        exp?: string;
        jti?: string;
        alg?: string;
        kid?: string;
        typ?: string;
       
}

const queries = {
    verifyGoogleToken: async (parent: any, {token}:{token: string})=>{
        const googleToken = token;
        const googleOuthURL = new URL('https://oauth2.googleapis.com/tokeninfo')
        googleOuthURL.searchParams.set('id_token',googleToken);

        const {data} = await axios.get(googleOuthURL.toString(), {
            responseType: 'json'
        })

        const user = await prismaClient.user.findUnique({
            where: {email: data.email },
        });
        if(!user) {
            await prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImageURL: data.picture
                }
            });
        }

        const userDb = await prismaClient.user.findUnique(
            {where: 
                {email: data.email}
            }
        )
        if(!userDb) throw new Error('User not found')
        const userToken = JWTService.genertateToken(userDb)
        return userToken;
    },

    getCurrentUser: async(parent: any, args: any, ctx: GraphqlContext) => {
        const id = ctx.user?.id
        if(!id)  return null;

        const user = await prismaClient.user.findUnique({where : {id}})
        return user;
    }
};
const extraResolvers = {
    User: {
        echoes: (parent: User) => prismaClient.echo.findMany({
            where: {
                author: {id:parent.id}
            }
        })
    }
}
export const resolvers = {queries, extraResolvers};