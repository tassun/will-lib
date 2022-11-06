import { v4 as uuid } from 'uuid';
import { DBConnector, KnSQL } from 'will-sql';
import { PromptConfig } from "./PromptConfig";
import { PromptAuthen, PromptUser } from './auth/PromptAuthen';
import { WOW_AUTHEN_URL, NEWS_AUTHEN_URL, NEWS_AUTHEN_TYPE } from "./EnvironmentVariable";
import { HTTP } from "./HTTP";
import { AuthenError } from "./AuthenError";
import { BaseAuthentication, ResponseInfo } from "./auth/BaseAuthentication";

export class AuthenLibrary {

    public static getDefaultResponse() : ResponseInfo {
        return new BaseAuthentication().getResponseInfo();        
    }

    public static getDefaultConfigure(site?: string) : PromptConfig {
        if("NEWS"==NEWS_AUTHEN_TYPE) {
            return new PromptConfig("NEWS", NEWS_AUTHEN_URL, site);
        }
        return new PromptConfig("WOW", WOW_AUTHEN_URL, site);
    }

    public static createConfigure(row: any) : PromptConfig {
        return new PromptConfig(row.authtype, row.tenanturl, undefined, row.domainname);
    }

    public async authenticate(username: string, password: string, config?: PromptConfig, conn?: DBConnector) : Promise<PromptUser> {
        let pa : PromptAuthen = new PromptAuthen();
        if(!config) config = AuthenLibrary.getDefaultConfigure();
        if(!config.hasConfigure()) {
            return Promise.reject(new AuthenError(HTTP.NOT_FOUND,"Configuration not defined"));
        }
        return await pa.authenticate(username, password, config);
    }

    public async updateUserInfo(conn: DBConnector, user: PromptUser) : Promise<number> {
        let result = 0;
        let now = new Date();
        let sql = new KnSQL("update tuserinfo set editdate = ?editdate , edittime = ?edittime where userid = ?userid ");
        sql.set("editdate",now);
        sql.set("edittime",now);
        sql.set("userid",user.userid);
        let rs = await sql.executeUpdate(conn);
        result = rs.rows.affectedRows;
        return Promise.resolve(result);
    }

    public async createUserInfo(conn: DBConnector, user: PromptUser, site: string) {
        let sql = new KnSQL("insert into tuserinfo (site, employeeid, userid, cardid, usertname, ");
        sql.append("usertsurname, userename, useresurname, displayname, activeflag, email) ");
        sql.append("values(?site,?employeeid,?userid,?cardid,?usertname,?usertsurname,?userename,?useresurname,?displayname,'1',?email) ");
        sql.set("site",site);
        sql.set("employeeid",user.userid);
        sql.set("userid",user.userid);
        sql.set("cardid",uuid());
        sql.set("usertname",user.username);
        sql.set("usertsurname",user.usersurname);
        sql.set("userename",user.username);
        sql.set("useresurname",user.usersurname);
        sql.set("displayname",user.displayname);
        sql.set("email",user.email);
        await sql.executeUpdate(conn);
    }

    public async saveUserInfo(conn: DBConnector, user: PromptUser, site: string = "FWS") {
        let record = await this.updateUserInfo(conn, user);
        if(record<=0) {
            await this.createUserInfo(conn, user, site);
        }
    }

}
