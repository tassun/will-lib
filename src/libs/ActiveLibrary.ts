import { v4 as uuid } from 'uuid';
import { DBConnector, KnSQL } from 'will-sql';
import { AD_URL, AD_DN, AD_DOMAIN } from "./EnvironmentVariable";
import { ActiveAuthen, ActiveUser } from './auth/ActiveAuthen';
import { HTTP } from "./HTTP";
import { AuthenError } from "./AuthenError";
import { ActiveConfig } from "./ActiveConfig";

export class ActiveLibrary {
    
    public static getDefaultConfigure() : ActiveConfig {
        return new ActiveConfig(AD_URL, AD_DN, AD_DOMAIN);
    }
    
    public static createConfigure(row: any) : ActiveConfig {
        return new ActiveConfig(row.tenanturl, row.basedn, row.domainname);
    }

    public static async getActiveConfig(conn?: DBConnector, domain?: string) : Promise<ActiveConfig | undefined> {
        let config = undefined;
        if(conn && (domain && domain.trim().length>0)) {
            let sql = new KnSQL("select * from tdirectory where domainname = ?domainname and inactive = '0' and systemtype = 'W' ");
            sql.set("domainname",domain);
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                let row = rs.rows[0];
                config = ActiveLibrary.createConfigure(row);
            }
        }
        return Promise.resolve(config);
    }

    public async authenticate(username: string, password: string, config?: ActiveConfig, conn?: DBConnector) : Promise<ActiveUser> {
        let ad : ActiveAuthen = new ActiveAuthen();
        if(!config) config = await ActiveLibrary.getActiveConfig(conn, ActiveAuthen.getAccountDomain(username).domainName);
        if(!config) return Promise.reject(new AuthenError(HTTP.NOT_FOUND,"Configuration not found"));
        if(!config.hasConfigure()) {
            return Promise.reject(new AuthenError(HTTP.NOT_FOUND,"Configuration not defined"));
        }
        return await ad.authenticate(username, password, config);
    }

    public async updateUserInfo(conn: DBConnector, user: ActiveUser) : Promise<number> {
        let result = 0;
        let now = new Date();
        let sql = new KnSQL("update tuserinfo set editdate = ?editdate , edittime = ?edittime where userid = ?userid ");
        sql.set("editdate",now);
        sql.set("edittime",now);
        sql.set("userid",user.accountName);
        let rs = await sql.executeUpdate(conn);
        result = rs.rows.affectedRows;
        return Promise.resolve(result);
    }

    public async createUserInfo(conn: DBConnector, user: ActiveUser, site: string) : Promise<number> {
        let result = 0;
        let sql = new KnSQL("insert into tuserinfo (site, employeeid, userid, cardid, usertname, ");
        sql.append("usertsurname, userename, useresurname, displayname, activeflag, email) ");
        sql.append("values(?site,?employeeid,?userid,?cardid,?usertname,?usertsurname,?userename,?useresurname,?displayname,'1',?email) ");
        sql.set("site",site);
        sql.set("employeeid",user.accountName);
        sql.set("userid",user.accountName);
        sql.set("cardid",uuid());
        sql.set("usertname",user.firstName);
        sql.set("usertsurname",user.lastName);
        sql.set("userename",user.firstName);
        sql.set("useresurname",user.lastName);
        sql.set("displayname",user.displayName);
        sql.set("email",user.principalName);
        let rs = await sql.executeUpdate(conn);
        result = rs.rows.affectedRows;
        return Promise.resolve(result);
    }

    public async saveUserInfo(conn: DBConnector, user: ActiveUser, site: string = "FWS") {
        let record = await this.updateUserInfo(conn, user);
        if(record<=0) {
            await this.createUserInfo(conn, user, site);
        }
    }

}
