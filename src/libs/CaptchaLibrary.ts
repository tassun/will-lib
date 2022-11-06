import { v4 as uuid } from 'uuid';
import { DBConnector, KnSQL } from 'will-sql';
import { Utilities } from "will-util";
import { captchar, CaptcharInfo } from "./Captchar";
import { CAPTCHA_EXPIRE_TIMES } from "./EnvironmentVariable";

export class CaptchaLibrary {

    public async createCaptcha(conn: DBConnector, capid?: string, mathing: string = "+") : Promise<CaptcharInfo> {
        let cap = await captchar({math: mathing});
        cap.id = capid;
        await this.deleteCaptcha(conn, capid);
        cap.id = await this.insertCaptcha(conn, cap);
        return Promise.resolve(cap);
    }

    public async insertCaptcha(conn: DBConnector,cap: CaptcharInfo) : Promise<string> {
        let now = new Date();
        let expiretimes : number = now.getTime() + CAPTCHA_EXPIRE_TIMES;
        let expdate : Date = new Date(expiretimes);
        let capid = uuid();
        if(cap.id) capid = cap.id;
        let sql = new KnSQL("insert into tcaptcha(capid,captext,capanswer,createdate,createtime,createmillis,expiretimes,expiredate,expiretime) ");
        sql.append("values(?capid,?captext,?capanswer,?createdate,?createtime,?createmillis,?expiretimes,?expiredate,?expiretime) ");
        sql.set("capid",capid);
        sql.set("captext",cap.text);
        sql.set("capanswer",cap.code);
        sql.set("createdate",now);
        sql.set("createtime",now);
        sql.set("createmillis",Utilities.currentTimeMillis(now));
        sql.set("expiretimes",expiretimes);
        sql.set("expiredate",expdate);
        sql.set("expiretime",expdate);
        let rs = await sql.executeUpdate(conn);
        console.log("affected "+rs.rows.affectedRows+" rows.");
        return Promise.resolve(capid);
    }

    public async verifyCaptcha(conn: DBConnector,capid: string, answer: string, now?: Date) : Promise<boolean> {
        let result = false;
        if(!now) now = new Date();
        let sql = new KnSQL("select capanswer from tcaptcha where capid = ?capid and expiretimes >= ?expiretimes ");
        sql.set("capid",capid);
        sql.set("expiretimes",now.getTime());
        let rs = await sql.executeQuery(conn);
        if(rs.rows && rs.rows.length>0) {
            let row = rs.rows[0];
            let capanswer = row.capanswer;
            if(capanswer==answer) {
                result = true;
            }
        }
        if(result) {
            this.deleteCaptcha(conn, capid);
        }
        return Promise.resolve(result);
    }

    public async deleteCaptcha(conn: DBConnector, capid?: string) : Promise<number> {
        if(!capid || capid.trim().length==0) return Promise.resolve(0);
        let result = 0;
        let sql = new KnSQL("delete from tcaptcha where capid = ?capid ");
        sql.set("capid",capid);
        let rs = await sql.executeQuery(conn);
        result = rs.rows.affectedRows;
        return Promise.resolve(result);
    }

}
