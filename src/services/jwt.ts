import JWT from 'jsonwebtoken'
import { User } from '@prisma/client';
import { JWTUser } from '../interfaces';
const JWT_SECRET = "$agam@1234"

class JWTService {
    public static genertateToken(user: User) {
            
        
        const payload: JWTUser = {
            id: user?.id,
            email: user?.email
        };
        const token = JWT.sign(payload, JWT_SECRET)
        return token;
    }
    public static decodeToken(token: string){
        try {
            return JWT.verify(token, JWT_SECRET) as JWTUser

        } catch (error) {
            return null;
            
        }
    }
}

export default JWTService