import { DBConnector, KnSQL } from 'will-sql';
import { HTTP } from "./HTTP";
import { AuthenError } from "./AuthenError";
const crypto = require("crypto");

export interface TenantInfo {
    tenantid: string;
    tenantname: string;
    applicationid: string;
    publickeys: string;
    privatekeys: string;
}

export interface BasicInfo {
    username: string;
    password: string;
}

export class BasicLibrary {
    public plainText?: string;

    public static getAuthorization(authorization?: string) : string | undefined {
        if(authorization && authorization.length>0) {
            let idx = authorization.indexOf(' ');
            if(idx>0) {
                let auth = authorization.substring(0,idx);
                if("basic"==auth.toLowerCase()) {
                    return authorization.substring(idx+1);
                }
            }
        }
        return authorization;
    }

    public getBasicInfo(basic?: string) : BasicInfo | undefined {
        if(basic) {
            let idx = basic.indexOf(':');
            if(idx>0) {
                let usr = basic.substring(0,idx);
                let pwd = basic.substring(idx+1);
                return {username: usr, password: pwd };
            }
        }
        return undefined;
    }

    public decodeBase64(base64: string) : BasicInfo | undefined {
        let buf = Buffer.from(base64, "base64");
        let texts = buf.toString("utf8");
        this.plainText = texts;
        return this.getBasicInfo(texts);
    }

    public decodeWithKey(cipherText: string, privatekeys: string) : BasicInfo | undefined {
        if(!privatekeys.includes("BEGIN PRIVATE KEY") && !privatekeys.includes("BEGIN RSA PRIVATE KEY")) {
            privatekeys = "-----BEGIN PRIVATE KEY-----\n"+privatekeys+"\n-----END PRIVATE KEY-----\n";
        }
        const decryptedData = crypto.privateDecrypt({
            key: privatekeys,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
          },
          Buffer.from(cipherText,"base64")
        );
        let texts = decryptedData.toString("utf8");
        this.plainText = texts;
        return this.getBasicInfo(texts);
    }

    public async decrypt(authorization: string, client?: string, conn?: DBConnector) : Promise<BasicInfo | undefined> {
        let info : BasicInfo | undefined = undefined;
        let authorizeText = BasicLibrary.getAuthorization(authorization);
        if(authorizeText) {
            if(client && conn) {
                let tenant = await this.getTenantInfo(conn, client);
                if(!tenant) {
                    return Promise.reject(new AuthenError("Client not found",HTTP.NOT_FOUND));
                }
                return this.decodeWithKey(authorizeText, tenant.privatekeys);
            }
            return this.decodeBase64(authorizeText);
        }
        return Promise.resolve(info);
    }

    public encodeWithKey(plainText: string, publickeys: string) : string {
        if(!publickeys.includes("BEGIN PUBLIC KEY") && !publickeys.includes("BEGIN RSA PUBLIC KEY")) {
            publickeys = "-----BEGIN PUBLIC KEY-----\n"+publickeys+"\n-----END PUBLIC KEY-----\n";
        }
        const encryptedData = crypto.publicEncrypt({
            key: publickeys,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
            },
            Buffer.from(plainText)
        );
        return encryptedData.toString("base64");
    }

    public async encrypt(plainText: string, client?: string, conn?: DBConnector) : Promise<string> {
        if(client && conn) {
            let tenant = await this.getTenantInfo(conn, client);
            if(!tenant) {
                return Promise.reject(new AuthenError("Client not found",HTTP.NOT_FOUND));
            }        
            return this.encodeWithKey(plainText, tenant.publickeys);
        }
        let buf = Buffer.from(plainText);
        return buf.toString("base64");
    }

    public async getTenantInfo(conn: DBConnector, client: string) : Promise<TenantInfo | undefined> {
        let info : TenantInfo | undefined = undefined;
        let sql = new KnSQL("select * from ttenant where tenantid = ?tenantid and inactive = '0' ");
        sql.set("tenantid",client);
        let rs = await sql.executeQuery(conn);
        if(rs.rows && rs.rows.length>0) {
            let row = rs.rows[0];
            info = {
                tenantid: row.tenantid, 
                tenantname: row.tenantname,
                applicationid: row.applicationid,
                privatekeys: row.privatekeys, 
                publickeys: row.publickeys,
            };
        }
        return Promise.resolve(info);
    }

}
