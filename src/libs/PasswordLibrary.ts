import { v4 as uuid } from 'uuid';
import { DBConnector, KnSQL } from 'will-sql';
import { Utilities } from "will-util";
import { INITIAL_PASSWORD, DYNAMIC_INITIAL_PASSWORD } from "./EnvironmentVariable";
const bcrypt = require('bcrypt');

interface PasswordVerify {
    result : boolean;
    msg : string | null | undefined;
    errno : number;
    args : string | null | undefined;
}

interface PasswordTemporary {
    trxid : string | undefined;
    userpassword : string | undefined;
    passwordexpiredate : Date | undefined;
}

interface UserTokenInfo {
    useruuid: string;
    userid?: string;
    code?: string;
    state?: string;
    nonce?: string;
}

class PasswordLibrary {
    private ht: Map<string,string> | undefined;
    private logondate : Date | undefined;

    public static parseInt(value?: string) : number {
        if(!value) return 0;
        try {
            return parseInt(value);
        } catch(ex) { }
        return 0;
    }

    public static randomPassword() : string {
        let now : Date = new Date();
        let time : string = now.getTime().toString(16);
        time = time.substring(time.length-4);
        let l : number = Math.floor(Math.random() * 100000) + 1000;
        let code = l.toString(16);
        code = code.substring(0,4);
        return time+code;
    }

    public static getAlphabets(text?: string) : number {
        if(!text || text.trim().length==0) return 0;
        let count = 0;
        for(let i=0,isz=text.length;i<isz;i++) {
            if(this.isLetter(text.charAt(i))) {
                count++;
            }
        }
        return count;
    }

    public static getDigits(text?: string) : number {
        if(!text || text.trim().length==0) return 0;
        return (text.match(/\d/g) || []).length
    }

    public static isDigit(c: string) : boolean {
        return c >= '0' && c <= '9';
    }

    public static isLetter(c: string) : boolean {
        return /[a-zA-Z]/.test(c);
    }

    public static isLowerCase(c: string) : boolean {
        return c == c.toLowerCase();
    }

    public static isUpperCase(c: string) : boolean {
        return c == c.toUpperCase();
    }

    public static indexOfAlphabets(text?: string) : number {
        if(!text || text.trim().length==0) return -1;
        for(let i=0,isz=text.length;i<isz;i++) {
            if(this.isLetter(text.charAt(i))) {
                return i;
            }
        }
        return -1;
    }

    public static createNewPassword() : string {
        let text = this.randomPassword();
        let digits = this.getDigits(text);
        let letters = this.getAlphabets(text);
        while(digits==0 || letters <= 1) {
            text = this.randomPassword();
            digits = this.getDigits(text);
            letters = this.getAlphabets(text);
        }
        let idx = this.indexOfAlphabets(text);
        if(idx >= 0) {
            let ch = text.charAt(idx);
            ch = ch.toUpperCase();
            return text.substring(0,idx)+ch+text.substring(idx+1);
        }
        return text;
    }

    public static checkNumberOnly(text?: string) : boolean {
        if(!text || text.trim().length==0) return false;
        return /^[0-9]*$/.test(text);
    }

    public createPassword() : string {
        let pass : string = "password";
        let initpwd = INITIAL_PASSWORD;
        if(initpwd!=null && initpwd.trim().length>0) {
            pass = initpwd;
        }
        let dynapwd = DYNAMIC_INITIAL_PASSWORD;
        if(!(dynapwd!=null && "false"==dynapwd)) {
            pass = PasswordLibrary.createNewPassword();
        }
        return pass;
    }

    public encrypt(pwd?: string,salt?: string) : string {
        if(!pwd || pwd.trim().length==0) return "";
        if(!salt || salt.trim().length==0) {
            salt = bcrypt.genSaltSync(10);
        }
        return bcrypt.hashSync(pwd,salt);
    }

    public encryptPassword(pwd?: string) : string {
        return this.encrypt(pwd);
    }

    private getPolicy(key:string) : string | undefined {
        return this.ht?.get(key);
    }

    public checkAlphainpwd(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("alphainpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let count = 0;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            if(PasswordLibrary.isLetter(pwd.charAt(i))) {
                count++;
            }
        }
        if(count < num) return true;
        return false;
    }
    
    public checkDigitinpwd(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("digitinpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let count = 0;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            if(PasswordLibrary.isDigit(pwd.charAt(i))) {
                count++;
            }
        }
        if(count < num) return true;
        return false;
    }

    public checkLowerinpwd(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("lowerinpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let count = 0;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            if(PasswordLibrary.isLowerCase(pwd.charAt(i))) {
                count++;
            }
        }
        if(count < num) return true;
        return false;
    }

    public checkUpperinpwd(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("upperinpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let count = 0;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            if(PasswordLibrary.isUpperCase(pwd.charAt(i))) {
                count++;
            }
        }
        if(count < num) return true;
        return false;
    }

    public passwordValidation(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let pattern = "(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}";
        let found = pwd.match(pattern);
        if(found && found.length>0) return true;
        return false;
    }

    public checkMatchPattern(pwd?: string) : boolean {
        let val = this.getPolicy("upperinpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return true;
        return this.passwordValidation(pwd);
    }

    public checkMaxarrangechar(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("maxarrangechar");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let max = 1;
        let guess = 0;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            let c = pwd.charCodeAt(i);
            if(c == guess) {
                max++;
                guess = c + 1;
                if(max > num) {
                    return true;
                }
            } else {
                guess = c + 1;
                max = 1;
            }
        }
        max = 1;
        guess = 0;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            let c = pwd.charCodeAt(i);
            if(c == guess) {
                max++;
                guess = c - 1;
                if(max > num) {
                    return true;
                }
            } else {
                guess = c - 1;
                max = 1;
            }
        }
        return false;
    }

    public checkMaxpwdlength(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("maxpwdlength");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let pwdlen = pwd.length;
        if(pwdlen > num) return true;
        return false;
    }

    public checkMaxsamechar(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("maxsamechar");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            let c = pwd.charAt(i);
            let same = 0;
            for(let j=0,jsz=pwd.length;j<jsz;j++) {
                if(c==pwd.charAt(j)) {
                    same++;
                }
            }
            if(same > num) return true;
        }
        return false;
    }

    public checkMindiffchar(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("mindiffchar");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let v : Array<string> = new Array();
        for(let i=0,isz=pwd.length;i<isz;i++) {
            let c = pwd.charAt(i);
            let notfound = true;
            for(let j=0,jsz=v.length; j<jsz && notfound; j++) {
                let ch = v[j];
                if(c == ch) {
                    notfound = false;
                }
            }
            if(notfound) {
                v.push(c);
            }
        }
        let diff = v.length;
        if(diff >= num) return false;
        return true;
    }

    public checkMinpwdlength(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("minpwdlength");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let pwdlen = pwd.length;
        if(pwdlen < num) return true;
        return false;
    }

    public checkOtherinpwd(pwd?: string) : boolean {
        if(!pwd || pwd.trim().length==0) return false;
        let val = this.getPolicy("otherinpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return false;
        let other = 0;
        for(let i=0,isz=pwd.length;i<isz;i++) {
            let c = pwd.charAt(i);
            if(!(PasswordLibrary.isLetter(c) || PasswordLibrary.isDigit(c))) {
                other++;
            }
        }
        if(other < num) return true;
        return false;
    }

    public getHashtable() : Map<string,string> | undefined {
        return this.ht;
    }

    public comparePassword(pwd: string, storedpwd: string) : boolean {
        return bcrypt.compareSync(pwd, storedpwd);
    }

    public async checkMatchNumber(conn: DBConnector, pwd?: string) : Promise<boolean> {
        if(!pwd || pwd.trim().length==0) return Promise.resolve(false);
        let val = this.getPolicy("otherinpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return Promise.resolve(false);
        let result = false;
        let sql = new KnSQL("select reservenum from tnpwd");
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                for(let i=0,isz=rs.rows.length;i<isz;i++) {
                    let row = rs.rows[i];
                    let found = pwd.includes(row.reservenum);
                    if(found) {
                        result = true;
                    }
                }
            }
        } catch(err) {
            console.error("error",err);
        }
        return Promise.resolve(result);
    }

    public async verifyPassword(conn: DBConnector, site?: string, userid?: string, pwd?: string) : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        if(!pwd || pwd.trim().length==0) return Promise.resolve(false);
        let result = false;
        let sql = new KnSQL("select userpassword from tuser where userid = ?userid ");
        sql.set("userid",userid);
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                for(let i=0,isz=rs.rows.length;i<isz;i++) {
                    let row = rs.rows[i];
                    let dbpwd = row.userpassword;
                    if(dbpwd && dbpwd.trim().length>0) {
                        if(dbpwd==pwd || this.comparePassword(pwd,dbpwd)) {
                            result = true;
                        }
                    } else {
                        result = true;
                    }
                }
            }
        } catch(err) {
            console.error("error",err);
        }
        return Promise.resolve(result);
    }

    public async checkUser(conn: DBConnector, site?: string, userid?: string) : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        let result = false;
        let sql = new KnSQL("select userid from tuser where userid = ?userid ");
        sql.set("userid",userid);
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                result = true;
            }
        } catch(err) {
            console.error("error",err);
        }
        return Promise.resolve(result);
    }

    public async checkNotchgpwduntilday(conn: DBConnector, userid?: string) : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        let val = this.getPolicy("notchgpwduntilday");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return Promise.resolve(false);
        let result = false;
        let systemdate = null;
        let sql = new KnSQL("select max(systemdate) systemdate from tupwd where userid = ?userid ");
        sql.set("userid",userid);
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                let row = rs.rows[0];
                systemdate = row.systemdate;
            }
        } catch(err) {
            console.error("error",err);
        }
        if(systemdate == null) {
            return Promise.resolve(false);
        }
        if(this.logondate == null) {
            this.logondate = new Date();
        }
        let chgdate = Utilities.addDays(num,systemdate);
        if(Utilities.compareDate(chgdate,this.logondate) < 0) {
            return Promise.resolve(true);
        }
        return Promise.resolve(result);
    }

    public async checkPersonalInfo(conn: DBConnector, userid?: string, pwd?: string) : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        if(!pwd || pwd.trim().length==0) return Promise.resolve(false);
        let val = this.getPolicy("notchgpwduntilday");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return Promise.resolve(false);
        let result = false;
        let sql = new KnSQL("select * from tcpwd where userid = ?userid ");
        sql.set("userid",userid);
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                for(let i=0,isz=rs.rows.length;i<isz;i++) {
                    let row = rs.rows[i];
                    let contents = row.contents;
                    if(contents && contents.trim().length>0) {
                        if(Utilities.compareString(pwd,contents) == 0) {
                            result = true; 
                        }
                        if(pwd.includes(contents)) {
                            result = true;
                        }
                    }
                }
            }
        } catch(err) {
            console.error("error",err);
        }
        return Promise.resolve(result);
    }

    public async checkReserveword(conn: DBConnector, pwd?: string) : Promise<boolean> {
        if(!pwd || pwd.trim().length==0) return Promise.resolve(false);
        let val = this.getPolicy("checkreservepwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return Promise.resolve(false);
        let result = false;
        let sql = new KnSQL("select * from trpwd where reservepwd = ?reservepwd ");
        sql.set("reservepwd",pwd);
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                result = true;
            }
        } catch(err) {
            console.error("error",err);
        }
        return Promise.resolve(result);
    }

    public async checkTimenotusedoldpwd(conn: DBConnector, userid?: string, pwd?: string) : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        if(!pwd || pwd.trim().length==0) return Promise.resolve(false);
        let val = this.getPolicy("timenotusedoldpwd");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) return Promise.resolve(false);
        let result = false;
        let duplicate = false;
        let time = 0;
        let encpwd = this.encryptPassword(pwd);
        let sql = new KnSQL("select * from tupwd where userid = ?userid order by serverdatetime desc ");
        sql.set("userid",userid);
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                for(let i=0,isz=rs.rows.length;i<isz;i++) {
                    let row = rs.rows[i];
                    let dbpwd = row.userpassword;
                    if(dbpwd && dbpwd.trim().length>0) {
                        if(encpwd = dbpwd) {
                            duplicate = true;
                        } else {
                            time++;
                        }
                    }
                }
            }
        } catch(err) {
            console.error("error",err);
        }
        if(duplicate && (time < num)) {
            result = true;
        }
        return Promise.resolve(result);
    }

    public async getUserPolicy(conn: DBConnector, userid?: string) : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        let result = false;
        this.ht = new Map();
        let sql = new KnSQL("select * from tppwd where userid = ?userid ");
        sql.set("userid",userid);
        try {
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                result = true;
                for(let i=0,isz=rs.rows.length;i<isz;i++) {
                    let row = rs.rows[i];
                    this.ht?.set("checkreservepwd",""+row.checkreservepwd);
                    this.ht?.set("checkpersonal",""+row.checkpersonal);
                    this.ht?.set("checkmatchpattern",""+row.checkmatchpattern);
                    this.ht?.set("checkmatchnumber",""+row.checkmatchnumber);
                    this.ht?.set("timenotusedoldpwd",""+row.timenotusedoldpwd);
                    this.ht?.set("notchgpwduntilday",""+row.notchgpwduntilday);
                    this.ht?.set("minpwdlength",""+row.minpwdlength);
                    this.ht?.set("maxpwdlength",""+row.maxpwdlength);
                    this.ht?.set("alphainpwd",""+row.alphainpwd);
                    this.ht?.set("digitinpwd",""+row.digitinpwd);
                    this.ht?.set("otherinpwd",""+row.otherinpwd);
                    this.ht?.set("maxsamechar",""+row.maxsamechar);
                    this.ht?.set("mindiffchar",""+row.mindiffchar);
                    this.ht?.set("maxarrangechar",""+row.maxarrangechar);
                    this.ht?.set("pwdexpireday",""+row.pwdexpireday);
                    this.ht?.set("upperinpwd",""+row.upperinpwd);
                    this.ht?.set("lowerinpwd",""+row.lowerinpwd);
                }
            }
        } catch(err) {
            console.error("error",err);
        }
        if(!result) {
            sql.clear();
            sql.append("select * from tppwd where userid = 'DEFAULT' ");
            try {
                let rs = await sql.executeQuery(conn);
                if(rs.rows && rs.rows.length>0) {
                    result = true;
                    for(let i=0,isz=rs.rows.length;i<isz;i++) {
                        let row = rs.rows[i];
                        this.ht?.set("checkreservepwd",""+row.checkreservepwd);
                        this.ht?.set("checkpersonal",""+row.checkpersonal);
                        this.ht?.set("checkmatchpattern",""+row.checkmatchpattern);
                        this.ht?.set("checkmatchnumber",""+row.checkmatchnumber);
                        this.ht?.set("timenotusedoldpwd",""+row.timenotusedoldpwd);
                        this.ht?.set("notchgpwduntilday",""+row.notchgpwduntilday);
                        this.ht?.set("minpwdlength",""+row.minpwdlength);
                        this.ht?.set("maxpwdlength",""+row.maxpwdlength);
                        this.ht?.set("alphainpwd",""+row.alphainpwd);
                        this.ht?.set("digitinpwd",""+row.digitinpwd);
                        this.ht?.set("otherinpwd",""+row.otherinpwd);
                        this.ht?.set("maxsamechar",""+row.maxsamechar);
                        this.ht?.set("mindiffchar",""+row.mindiffchar);
                        this.ht?.set("maxarrangechar",""+row.maxarrangechar);
                        this.ht?.set("pwdexpireday",""+row.pwdexpireday);
                        this.ht?.set("upperinpwd",""+row.upperinpwd);
                        this.ht?.set("lowerinpwd",""+row.lowerinpwd);
                    }
                }
            } catch(err) {
                console.error("error",err);
            }
        }
        return Promise.resolve(result);
    }

    public async getUserExpireDate(conn: DBConnector, userid?: string, expiredate?: Date) : Promise<Date> {
        if(this.ht==null || this.ht.size==0) {
            await this.getUserPolicy(conn,userid);
        }
        let systemdate = expiredate;
        if(!systemdate) {
            systemdate = new Date();
        }
        let val = this.getPolicy("pwdexpireday");
        let num = PasswordLibrary.parseInt(val);
        if(num==0) num = 120;
        let result = Utilities.addDays(num, systemdate);
        return Promise.resolve(result);
    }

    public async getUserTemporaryExpireDate(conn: DBConnector, userid: string, site?: string ) : Promise<Date> {
        if(!site || site.trim().length==0) {
            let sql = new KnSQL("select site from tuser where userid = ?userid ");
            sql.set("userid",userid);
            try {
                let rs = await sql.executeQuery(conn);
                if(rs.rows && rs.rows.length>0) {
                    site = rs.rows[0].site;
                }
            } catch(ex) {
                console.error("error",ex);
            }            
        }
        let days = 0;
        if(site && site.trim().length>0) {
            let colvalue = "";
            let sql = new KnSQL("select colvalue from tconfig where category='TEMPORARY_EXPIRE_DAY' and colname=?colname ");
            sql.set("colname",site);
            try {
                let rs = await sql.executeQuery(conn);
                if(rs.rows && rs.rows.length>0) {
                    colvalue = rs.rows[0].colvalue;
                }
            } catch(ex) {
                console.error("error",ex);
            }
            days = PasswordLibrary.parseInt(colvalue);
        }
        if(days==0) days = 1;
        let result = Utilities.addDays(days,new Date());
        return Promise.resolve(result);
    }

    public async insertHistory(conn: DBConnector, userid?: string, pwd?: string, serverdate?: Date, systemdate?: Date, editor?: string) : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        if(!serverdate) serverdate = new Date();
        if(!systemdate) systemdate = new Date();
        let sql = new KnSQL("insert into tupwd (serverdatetime,systemdate,userid,userpassword,edituserid) ");
        sql.append("values(?serverdatetime,?systemdate,?userid,?userpassword,?edituserid) ");
        sql.set("serverdatetime",serverdate);
        sql.set("systemdate",systemdate);
        sql.set("userid",userid);
        sql.set("userpassword",pwd);
        sql.set("edituserid",editor);
        await sql.executeUpdate(conn);
        return Promise.resolve(true);
    }

    public async moveTemporaryPassword(conn: DBConnector, userid?: string, moveflag: boolean = false) : Promise<number> {
        if(!userid || userid.trim().length==0) return Promise.resolve(0);
        let hisid = uuid();
        let hisno = new Date().getTime();
        let sql = new KnSQL("insert into tuserpwdhistory ");
        sql.append("select *,'"+hisid+"',"+hisno+",'"+(moveflag?"1":"0")+"' from tuserpwd ");
        sql.append("where userid = ?userid ");
        sql.set("userid",userid);
        await sql.executeUpdate(conn);

        let result = 0;
        sql.clear();
        sql.append("delete from tuserpwd where userid = ?userid ");
        sql.set("userid",userid);
        let rs = await sql.executeUpdate(conn);
        if(rs.rows) {
            result = rs.rows.affectedRows;
        }
        return Promise.resolve(result);
    }

    public async moveTemporaryPasswordExpired(conn: DBConnector, userid?: string, expiredate?: Date) : Promise<number> {
        if(!userid || userid.trim().length==0) return Promise.resolve(0);
        if(!expiredate) expiredate = new Date();
        let hisid = uuid();
        let hisno = new Date().getTime();
        let sql = new KnSQL("insert into tuserpwdhistory ");
        sql.append("select *,'"+hisid+"',"+hisno+",'0' from tuserpwd ");
        sql.append("where userid = ?userid and expiredate <= ?expiredate ");
        sql.set("userid",userid);
        sql.set("expiredate",expiredate);
        await sql.executeUpdate(conn);
        let result = 0;
        sql.clear();
        sql.append("delete from tuserpwd where userid = ?userid and expiredate <= ?expiredate ");
        sql.set("userid",userid);
        sql.set("expiredate",expiredate);
        let rs = await sql.executeUpdate(conn);
        if(rs.rows) {
            result = rs.rows.affectedRows;
        }
        return Promise.resolve(result);
    }

    public async updatePassword(conn: DBConnector, site?: string, userid?: string, pwd?: string, expiredate?: Date, history: boolean = true, changeflag: string = "1") : Promise<boolean> {
        if(!userid || userid.trim().length==0) return Promise.resolve(false);
        if(!pwd || pwd.trim().length==0) return Promise.resolve(false);
        let systemdate = expiredate;
        if(!systemdate) systemdate = new Date();
        let expdate = await this.getUserExpireDate(conn,userid,expiredate);
        let encpwd = this.encryptPassword(pwd);
        let now = new Date();
        let sql = new KnSQL("update tuser set userpassword = ?userpassword, passwordexpiredate = ?passwordexpiredate, ");
        sql.append("passwordchangedate = ?passwordchangedate, passwordchangetime = ?passwordchangetime, changeflag = ?changeflag ");
        sql.append("where userid = ?userid ");
        sql.set("userpassword",encpwd);
        sql.set("passwordexpiredate",expdate);
        sql.set("passwordchangedate",now);
        sql.set("passwordchangetime",now);
        sql.set("changeflag",changeflag);
        sql.set("userid",userid);
        await sql.executeUpdate(conn);
        if(!history) return Promise.resolve(true);
        return await this.insertHistory(conn,userid,encpwd,new Date(),systemdate,userid);
    }

    public async updatePasswordFromTemporary(conn: DBConnector, trxid?: string, userid?: string, changeflag: string = "1", history: boolean = true) : Promise<number> {
        if(!trxid || trxid.trim().length==0) return Promise.resolve(0);
        if(!userid || userid.trim().length==0) return Promise.resolve(0);
        let result = 0;
        let encpwd = null;
        let expdate = null;
        let chgdate = null;
        let chgtime = null;
        let sql = new KnSQL("select * from tuserpwd where trxid = ?trxid ");
        sql.set("trxid",trxid);
        let rs = await sql.executeQuery(conn);
        if(rs.rows && rs.rows.length>0) {
            result++;
            let row = rs.rows[0];
            encpwd = row.userpassword;
            expdate = row.passwordexpiredate;
            chgdate = row.passwordchangedate;
            chgtime = row.passwordchangetime;
        }
        if(result>0) {
            sql.clear();
            sql.append("update tuser set userpassword = ?userpassword, passwordexpiredate = ?passwordexpiredate, ");
            sql.append("passwordchangedate = ?passwordchangedate, passwordchangetime = ?passwordchangetime, changeflag = ?changeflag ");
            sql.append("where userid = ?userid ");
            sql.set("userpassword",encpwd);
            sql.set("passwordexpiredate",expdate);
            sql.set("passwordchangedate",chgdate);
            sql.set("passwordchangetime",chgtime);
            sql.set("changeflag",changeflag);
            sql.set("userid",userid);
            await sql.executeUpdate(conn);
        }
        if(history) {
            await this.moveTemporaryPassword(conn,userid,true);
        }
        return Promise.resolve(result);
    }

    public async updateTemporaryPassword(conn: DBConnector, userid?: string, pwd?: string, site?: string, expiredate?: Date) : Promise<number> {
        if(!userid || userid.trim().length==0) return Promise.resolve(0);
        if(!pwd || pwd.trim().length==0) return Promise.resolve(0);
        let result = 0;
        let systemdate = expiredate;
        if(!systemdate) systemdate = new Date();
        let pwdexpdate = await this.getUserExpireDate(conn,userid,expiredate);
        let tmpexpdate = await this.getUserTemporaryExpireDate(conn,userid,site);
        let encpwd = this.encryptPassword(pwd);
        let sql = new KnSQL("update tuserpwd set expireflag = '1' where userid = ?userid ");
        sql.set("userid",userid);
        await sql.executeUpdate(conn);
        let now = new Date();
        sql.clear();
        sql.append("insert into tuserpwd(trxid,userid,userpassword,expiredate,transtime,passwordexpiredate,");
        sql.append("passwordchangedate,passwordchangetime,expireflag,editdate,edittime) ");
        sql.append("values(?trxid,?userid,?userpassword,?expiredate,?transtime,?passwordexpiredate,");
        sql.append("?passwordchangedate,?passwordchangetime,'0',?editdate,?edittime) ");
        sql.set("trxid",uuid());
        sql.set("userid",userid);
        sql.set("userpassword",encpwd);
        sql.set("expiredate",tmpexpdate);
        sql.set("transtime",now.getTime());
        sql.set("passwordexpiredate",pwdexpdate);
        sql.set("passwordchangedate",now);
        sql.set("passwordchangetime",now);
        sql.set("editdate",now);
        sql.set("edittime",now);
        await sql.executeUpdate(conn);
        return Promise.resolve(result);
    }
    
    public async checkPassword(conn: DBConnector, site?: string, userid?: string, oldpwd?: string, logon?: Date) : Promise<PasswordVerify> {
        let result : PasswordVerify = { result: false, msg: null, errno: 0, args: null };
        try {
            let valid = await this.checkUser(conn,site,userid);
            if(!valid) {
                result.result = false;
                result.errno = -3001;
                result.msg = "Invalid user or password";
                return Promise.resolve(result);
            }
            valid = await this.verifyPassword(conn, site, userid, oldpwd);
            if(!valid) {
                result.result = false;
                result.errno = -3002;
                result.msg = "Invalid user or password";
                return Promise.resolve(result);
            }
            valid = await this.getUserPolicy(conn, userid);
            if(!valid) {
                result.result = false;
                result.errno = -3003;
                result.msg = "Password policy configurations not found. Please contact administrator.";
                return Promise.resolve(result);
            }
            result.result = true;
        } catch(ex : any) {            
            result.result = false;
            result.errno = -3000;
            if(ex.errno) result.errno = ex.errno;
            if (typeof ex === "string") {
                result.msg = ex;
            } else {
                result.msg = ex.message;
            }
        }
        return Promise.resolve(result);
    }

    public async changePassword(conn: DBConnector, site?: string, userid?: string, oldpwd?: string, newpwd?: string, logdate?: Date, changeflag: string = "1",history: boolean = true) : Promise<PasswordVerify> {
        let result : PasswordVerify = { result: false, msg: null, errno: 0, args: null };
        this.logondate = logdate;
        try {
            let valid = await this.checkUser(conn, site, userid);
            if(!valid) {
                result.result = false;
                result.errno = -3001;
                result.msg = "Invalid user or password";
                return Promise.resolve(result);
            }
            valid = await this.verifyPassword(conn, site, userid, oldpwd);
            if(!valid) {
                result.result = false;
                result.errno = -3002;
                result.msg = "Invalid user or password";
                return Promise.resolve(result);
            }
            valid = await this.getUserPolicy(conn, userid);
            if(!valid) {
                result.result = false;
                result.errno = -3003;
                result.msg = "Password policy configurations not found. Please contact administrator.";
                return Promise.resolve(result);
            }
            if(this.checkMinpwdlength(newpwd)) {
                result.args = this.getPolicy("minpwdlength");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3005;
                result.msg = "Password entry length at least " + result.args + " characters.";
                return Promise.resolve(result);
            }
            if(this.checkAlphainpwd(newpwd)) {
                result.args = this.getPolicy("alphainpwd");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3006;
                result.msg = "Password input character at least " + result.args + " characters.";
                return Promise.resolve(result);
            }
            if(this.checkOtherinpwd(newpwd)) {
                result.args = this.getPolicy("otherinpwd");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3007;
                result.msg = "Password input special character at least " + result.args + " characters.";
                return Promise.resolve(result);
            }
            if(this.checkMaxsamechar(newpwd)) {
                result.args = this.getPolicy("maxsamechar");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3008;
                result.msg = "Password input the same character not more than " + result.args + " characters.";
                return Promise.resolve(result);
            }
            if(this.checkMindiffchar(newpwd)) {
                result.args = this.getPolicy("mindiffchar");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3009;
                result.msg = "Password input different character at least " + result.args + " characters.";
                return Promise.resolve(result);
            }
            if(this.checkMaxarrangechar(newpwd)) {
                result.args = this.getPolicy("maxarrangechar");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3010;
                result.msg = "Password input sequential character at least " + result.args + " characters.";
                return Promise.resolve(result);
            }
            valid = await this.checkReserveword(conn, newpwd);
            if(valid) {
                result.result = false;
                result.errno = -3011;
                result.msg = "Password cannot be reserved words. Please change new password";
                return Promise.resolve(result);
            }
            valid = await this.checkTimenotusedoldpwd(conn, userid, newpwd);
            if(valid) {
                result.args = this.getPolicy("timenotusedoldpwd");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3012;
                result.msg = "New Password cannot be the same as Old Password for "+ result.args;
                return Promise.resolve(result);
            }   
            if(!this.checkMatchPattern(newpwd)) {
                result.result = false;
                result.errno = -3013;
                result.msg = "Password mismatch error, it should compose of alphabet, digit ,upper, lower and special character.";
                return Promise.resolve(result);
            }         
            if(this.checkMaxpwdlength(newpwd)) {
                result.args = this.getPolicy("maxpwdlength");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3014;
                result.msg = "Password entry length not over " + result.args + " characters.";
                return Promise.resolve(result);
            }
            if(this.checkDigitinpwd(newpwd)) {
                result.args = this.getPolicy("digitinpwd");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3015;
                result.msg = "Password input digit at least " + result.args + " digits.";
                return Promise.resolve(result);
            }
            valid = await this.checkPersonalInfo(conn, userid, newpwd);
            if(valid) {
                result.result = false;
                result.errno = -3016;
                result.msg = "Password cannot be personal informations. Please change new password";
                return Promise.resolve(result);
            }
            if(this.checkUpperinpwd(newpwd)) {
                result.args = this.getPolicy("upperinpwd");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3017;
                result.msg = "Password input character at least " + result.args + " upper case characters.";
                return Promise.resolve(result);
            }
            if(this.checkLowerinpwd(newpwd)) {
                result.args = this.getPolicy("lowerinpwd");
                if(!result.args) result.args = "";
                result.result = false;
                result.errno = -3018;
                result.msg = "Password input character at least " + result.args + " lower case characters.";
                return Promise.resolve(result);
            }
            valid = await this.checkMatchNumber(conn, newpwd);
            if(valid) {
                result.result = false;
                result.errno = -3019;
                result.msg = "Password cannot contain reserved number. Please change new password";
                return Promise.resolve(result);
            }
            if(PasswordLibrary.checkNumberOnly(newpwd)) {
                result.result = false;
                result.errno = -3020;
                result.msg = "Password cannot be number only. Please change new password";
                return Promise.resolve(result);
            }
            await this.updatePassword(conn, site, userid, newpwd, this.logondate, history, changeflag);
            result.result = true;
        } catch(ex: any) {
            result.result = false;
            result.errno = -3000;
            if(ex.errno) result.errno = ex.errno;
            if (typeof ex === "string") {
                result.msg = ex;
            } else {
                result.msg = ex.message;
            }
        }
        return Promise.resolve(result);
    }

    public async getUserTemporaryPassword(conn: DBConnector,userid: string) : Promise<PasswordTemporary> {
        let result : PasswordTemporary = { trxid: undefined, userpassword : undefined, passwordexpiredate : undefined };
        let now = new Date();
        let sql = new KnSQL("select trxid,userpassword,passwordexpiredate from tuserpwd ");
        sql.append("where userid = ?userid and expiredate >= ?expiredate and expireflag = '0' ");
        sql.set("userid",userid);
        sql.set("expiredate",now);
        let rs = await sql.executeQuery(conn);
        if(rs.rows && rs.rows.length>0) {
            let row = rs.rows[0];
            result.trxid = row.trxid;
            result.userpassword = row.userpassword;
            result.passwordexpiredate = row.passwordexpiredate;
        }
        return Promise.resolve(result);
    }

    public async getPasswordPolicy(conn: DBConnector) : Promise<string[]> {
        let policy : string[] = [];
        let sql = new KnSQL("select * from tppwd where userid = 'DEFAULT' ");
        let rs = await sql.executeQuery(conn);
        console.log("getPasswordPolicy","effected "+rs.rows.length+" rows");
        if(rs.rows && rs.rows.length>0) {
            let row = rs.rows[0];
            policy.push("Password requirements : ");
            policy.push("Your password is case sensitive.");
            let minflag = PasswordLibrary.parseInt(row.minpwdlength) > 0;
            let maxflag = PasswordLibrary.parseInt(row.maxpwdlength) > 0;
            if(minflag && maxflag) {
                policy.push("Your password MUST be between "+row.minpwdlength+" and "+row.maxpwdlength+" characters in length.");
            } else {
                if(minflag) {
                    policy.push("Your password MUST have at least "+row.minpwdlength+" characters in length.")
                }
                if(maxflag) {
                    policy.push("Your password MUST have not over "+row.maxpwdlength+" characters in length.");
                }
            }
            let valid = PasswordLibrary.parseInt(row.upperinpwd) > 0;
            if(valid) policy.push("Your password MUST have at least "+row.upperinpwd+" UPPERCASE character.");
            valid = PasswordLibrary.parseInt(row.lowerinpwd) > 0;
            if(valid) policy.push("Your password MUST have at least "+row.lowerinpwd+" LOWERCASE character.");
            valid = PasswordLibrary.parseInt(row.alphainpwd) > 0;
            if(valid) policy.push("Your password MUST have at least "+row.alphainpwd+" alphabet.");
            valid = PasswordLibrary.parseInt(row.digitinpwd) > 0;
            if(valid) policy.push("Your password MUST have at least "+row.digitinpwd+" number.");
            valid = PasswordLibrary.parseInt(row.otherinpwd) > 0;
            if(valid) policy.push("Your password MUST have at least "+row.otherinpwd+" Special (Non-Alphanumeric) character (eg. ! @ # $ % ^ & *).");
        }
        return Promise.resolve(policy);
    }

    public async getUserTokenInfo(conn: DBConnector, useruuid: string) : Promise<UserTokenInfo> {
        let result : UserTokenInfo = { useruuid: useruuid };
        let sql = new KnSQL("select * from tusertoken where useruuid = ?useruuid ");
        sql.set("useruuid",useruuid);
        let rs = await sql.executeQuery(conn);
        if(rs.rows && rs.rows.length>0) {
            let row = rs.rows[0];
            result.userid = row.userid;
            result.code = row.code;
            result.state = row.state;
            result.nonce = row.nonce;
        }
        return Promise.resolve(result);
    }

}

export {
    PasswordLibrary,
    PasswordVerify,
    PasswordTemporary,
    UserTokenInfo
}
