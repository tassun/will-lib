import { Arguments } from "will-util";
import { DBConnections } from "will-sql";
import { MailInfo, MailLibrary } from "../libs/MailLibrary";

let args = process.argv.slice(2);
console.log("args = "+args);
let section = Arguments.getString(args,"MYSQL","-ms");
let mail_to = Arguments.getString(args,'tassun_oro@hotmail.com','-t');
let mail_subject = Arguments.getString(args,'Testing','-s');
let mail_message = Arguments.getString(args,'Hello Test','-m');

async function testMail() {
    let info : MailInfo = {
        email: mail_to as string,
        subject: mail_subject as string,
        message: mail_message as string
    };
    console.log("send mail",info);
    let conn = DBConnections.getDBConnector(section);
    let res = await MailLibrary.sendMail(info, conn);
}

testMail();
