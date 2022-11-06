import Jwt from "jsonwebtoken";
import { SECRET_KEY, AUTH_TOKEN_EXPIRE_IN } from "./EnvironmentVariable";

export interface AuthenTokenData {
    identifier: string; 
    accessToken?: string;
}

export class AuthenToken {
    public static createAuthenToken(identifier: string, accessToken?: string) : string {
	    return Jwt.sign({ identifier, accessToken }, SECRET_KEY, { expiresIn: AUTH_TOKEN_EXPIRE_IN });
    }

    public static verifyAuthenToken(token: string, ignoreExpiration: boolean = false): AuthenTokenData {
        try {
            return Jwt.verify(token, SECRET_KEY, { ignoreExpiration }) as AuthenTokenData;
        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            } else {
                throw e;
            }
        }
    }
}
