import { DBConnections } from "will-sql";
import { Arguments } from "will-util";
import { PasswordLibrary } from "../libs/PasswordLibrary";
import { WowAuthentication } from "../libs/auth/WowAuthentication";
import { NewsAuthentication } from "../libs/auth/NewsAuthentication";
import os from "os";

let args = process.argv.slice(2);
console.log("args = "+args);
let section = Arguments.getString(args,"MYSQL","-ms");
let site = Arguments.getString(args,"","-site");
let userid = Arguments.getString(args,"tso","-usr");
let pwd = Arguments.getString(args,"password","-pwd");
let newpwd = Arguments.getString(args,"P@ssw0rd","-new");
let opt = Arguments.getString(args,"test","-opt");
let date = Arguments.getDate(args,new Date(),"-date");
let useruuid = Arguments.getString(args,"","-uuid");
console.log("date",date);

function doTest() {
    console.log("working directory : "+__dirname);
	console.log("temp directory : "+os.tmpdir());
}

function doExamine() {
    let plib : PasswordLibrary = new PasswordLibrary();
    let ranpwd = PasswordLibrary.randomPassword();
    console.log(ranpwd);
    console.log("alphabets",PasswordLibrary.getAlphabets(ranpwd));
    console.log("digits",PasswordLibrary.getDigits(ranpwd));
    console.log("indexOfAlphabet",PasswordLibrary.indexOfAlphabets(ranpwd));
    console.log("newpwd",PasswordLibrary.createNewPassword());
    let newpwd = plib.createPassword();
    console.log("pass",newpwd);
    let epwd = plib.encryptPassword(newpwd);
    console.log("encpwd",epwd);
    console.log(ranpwd,PasswordLibrary.checkNumberOnly(ranpwd));
    let num = "12345678";
    console.log(num,PasswordLibrary.checkNumberOnly(num));
    console.log("checkAlphainpwd",plib.checkAlphainpwd(ranpwd));
}

async function doCheck() {
    try {
        let plib : PasswordLibrary = new PasswordLibrary();
        let conn = DBConnections.getDBConnector(section);
        let valid = await plib.verifyPassword(conn,site,userid,pwd);
        console.log("verifyPassword",valid);
    } catch(ex) {
        console.error(ex);
    }
}

function doCreate() {
    try {
        let plib : PasswordLibrary = new PasswordLibrary();
        if(pwd) {
            let encpwd = plib.encryptPassword(pwd);
            console.log(pwd,encpwd);
        } else if(newpwd) {
            let encpwd = plib.encryptPassword(newpwd);
            console.log(pwd,encpwd);
        }
    } catch(ex) {
        console.error(ex);
    }
}

async function doVerify() {
    try {
        let plib : PasswordLibrary = new PasswordLibrary();
        let valid = plib.comparePassword(pwd as string,newpwd as string);
        console.log("verify",valid);
    } catch(ex) {
        console.error(ex);
    }
}

async function doChange() {
    try {
        let conn = DBConnections.getDBConnector(section);
        await conn.beginWork();
        try {
            let plib : PasswordLibrary = new PasswordLibrary();
            let verify = await plib.changePassword(conn,site,userid,pwd,newpwd,date);
            console.log("verify",verify);
            await conn.commitWork();    
        } catch(er) {
            console.error(er);
            conn.rollbackWork();
            console.log("roll back work");
        }
    } catch(ex) {
        console.error(ex);
    }
}

async function doToken() {
    try {
        let conn = DBConnections.getDBConnector(section);
        try {
            let plib : PasswordLibrary = new PasswordLibrary();
            let token = await plib.getUserTokenInfo(conn,useruuid as string);
            console.log("token",token);
        } catch(er) {
            console.error(er);
        }
    } catch(ex) {
        console.error(ex);
    }
}

async function doLoginWow() {
    try {
        let alib = WowAuthentication.getInstance();
        let res = await alib.login(userid as string, pwd as string, site);
        console.log("authen response",JSON.stringify(res));
    } catch(ex) {
        console.error(ex);
    }
}

async function doLoginNews() {
    try {
        let alib = NewsAuthentication.getInstance();
        let res = await alib.login(userid as string, pwd as string, site);
        console.log("authen response",JSON.stringify(res));
    } catch(ex) {
        console.error(ex);
    }
}

if(opt=="test") {
    doTest();
} else if(opt=="exam") {
    doExamine();
} else if(opt=="check") {
    doCheck();
} else if(opt=="create") {
    doCreate();
} else if(opt=="verify") {
    doVerify();
} else if(opt=="change") {
    doChange();
} else if(opt=="loginwow") {
    doLoginWow();
} else if(opt=="loginnews") {
    doLoginNews();
} else if(opt=="token") {
    doToken();
}
