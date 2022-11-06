import { DBConnector, KnSQL } from 'will-sql';
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM } from "./EnvironmentVariable";
var mailer = require("nodemailer");

export interface MailInfo {
    email: string;
    subject: string;
    message: string;
    cc?: string;
    bcc?: string;
    attachments?: any[];
}

export interface MailConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
}

export class MailLibrary {

    public static async getMailConfig(conn?: DBConnector, category: string = "CONFIGMAIL") : Promise<MailConfig> {
        let config : MailConfig = { host: MAIL_HOST, port: MAIL_PORT, user: MAIL_USER, pass: MAIL_PASSWORD, from: MAIL_FROM };
        if(conn) {
            let sql = new KnSQL("select colname,colvalue from tconfig where category = ?category ");            
            sql.set("category",category);
            console.info(sql);
            let rs = await sql.executeQuery(conn);
            if(rs.rows && rs.rows.length>0) {
                let title = undefined;
                let from = undefined;
                for(let i=0,isz=rs.rows.length; i<isz; i++) {
                    let row = rs.rows[i];
                    if(row.colname=="MAIL_SERVER") {
                        config.host = row.colvalue;
                    } else if(row.colname=="MAIL_PORT") {
                        config.port = parseInt(row.colvalue);                            
                    } else if(row.colname=="MAIL_USER") {
                        config.user = row.colvalue;
                    } else if(row.colname=="MAIL_PASSWORD") {
                        config.pass = row.colvalue;
                    } else if(row.colname=="MAIL_FROM") {
                        config.from = row.colvalue;
                        from = row.colvalue;
                    } else if(row.colname=="MAIL_TITLE") {
                        title = row.colvalue;
                    }
                }  
                if(title && from) {
                    config.from = '"'+title+'" <'+from+'>';
                }  
            }
        }
        return Promise.resolve(config);
    }

    public static async sendMail(info: MailInfo, conn?: DBConnector, config?: MailConfig, category: string = "CONFIGMAIL") : Promise<any> {
        console.log("send mail to : ",info.email);
        if(!config) config = await this.getMailConfig(conn, category);
        let smtp = {
            host: config.host,
            port: config.port,
            secure: true,
            auth: {
                user: config.user,
                pass: config.pass
            }
        };
        let transport = mailer.createTransport(smtp);
        let mail = {
            from: config.from,
            to: info.email,
            subject: info.subject,
            html: info.message,
            cc: info.cc,
            bcc: info.bcc,
            attachments: info.attachments
        };
        return new Promise<any>((resolve, reject) => {
            transport.sendMail(mail, function(err: any, res: any){
                if(err) {
                    console.error("send mail error",err);
                    reject(err);            
                } else {
                    console.log("send mail success",JSON.stringify(res));
                    resolve(res);
                }
            });
        });
    }
    
}
