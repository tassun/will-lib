# will-lib

Library classes

## Installation

    npm install will-lib

### Configuration

This module require configuration ([config](https://www.npmjs.com/package/config)) setting by config/default.json under project and [will-sql](https://www.npmjs.com/package/will-sql), [will-util](https://www.npmjs.com/package/will-util)

    npm install config

config/default.json

```json
{
    "MYSQL" : { "alias": "mysql", "dialect": "mysql", "url": "mysql://user:password@localhost:3306/testdb?charset=utf8&connectionLimit=10", "user": "user", "password": "password" },
    "ODBC" : { "alias": "odbc", "dialect": "mysql", "url": "DRIVER={MySQL ODBC 5.3 Unicode Driver};SERVER=localhost;DATABASE=testdb;HOST=localhost;PORT=3306;UID=user;PWD=password;", "user": "user", "password": "password" },
    "MSSQL": { "alias": "mssql", "dialect": "mssql", "url": "Server=localhost,1433;Database=testdb;User Id=user;Password=password;Encrypt=false;Trusted_Connection=Yes;", "user": "user", "password": "password" },
    "ORACLE": { "alias": "oracle", "dialect": "oracle", "url": "localhost:1521/ORCLCDB.localdomain", "user": "user", "password": "password" },
    "POSTGRES": { "alias": "postgres", "dialect": "postgres", "url": "postgresql://user:password@localhost:5432/testdb", "user": "user", "password": "password" },
    "INFORMIX": { "alias": "odbc", "dialect": "informix", "url": "DRIVER={IBM INFORMIX ODBC DRIVER (64-bit)};SERVER=online_localhost;DATABASE=refdb;HOST=localhost;SERVICE=9088;UID=user;PWD=password;CLIENT_LOCALE=th_th.thai620;DB_LOCALE=th_th.thai620;", "user": "user", "password":"password" }
}
```

    npm install will-sql
    npm install will-util

#### PasswordLibrary
PasswordLibrary handle for user password maintainance 

#### Usage

```typescript
import { PasswordLibrary } from "will-lib";
import { DBConnections } from "will-sql";
import { Arguments } from "will-util";

let args = process.argv.slice(2);
console.log("args = "+args);
let section = Arguments.getString(args,"MYSQL","-ms");

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

async function doCheckPassword() {
    try {
        let plib : PasswordLibrary = new PasswordLibrary();
        let conn = DBConnections.getDBConnector(section);
        let valid = await plib.verifyPassword(conn,site,userid,pwd);
        console.log("verifyPassword",valid);
    } catch(ex) {
        console.error(ex);
    }
}

async function doChangePassword() {
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

```

#### MailLibrary

MailLibrary handle for send mail with custom configuration from database table `tconfig` with schema
    
    CREATE TABLE tconfig (
	    category VARCHAR(50) NOT NULL,
	    colname VARCHAR(50) NOT NULL,
	    colvalue VARCHAR(250) NULL DEFAULT NULL,
	    seqno INT NULL DEFAULT '0',
	    remarks TEXT NULL,
	    PRIMARY KEY (category, colname)
    )

configuration table data 

| category | colname | colvalue | remarks |
| -------- | ---- | ------- | ----------- |
| CONFIGMAIL | MAIL_FROM | **required** | Sender email |
| CONFIGMAIL | MAIL_USER | **required** | Sender user |
| CONFIGMAIL | MAIL_PASSWORD | **required** | Sender password |
| CONFIGMAIL | MAIL_SERVER | **required** | Mail server address |
| CONFIGMAIL | MAIL_PORT | **required** | Mail server port |
| CONFIGMAIL | MAIL_TITLE | optional | Mail title |


```typescript
import { Arguments } from "will-util";
import { DBConnections } from "will-sql";
import { MailInfo, MailLibrary } from "will-lib";

let args = process.argv.slice(2);
console.log("args = "+args);
let section = Arguments.getString(args,"MYSQL","-ms");
let mail_to = Arguments.getString(args,'email@mail.com','-t');
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
```

#### BasicLibrary

BasicLibrary handle for basic authentication and basic authenticate with RSA from table `ttenant` setting with schema

    CREATE TABLE `ttenant` (
        `tenantid` VARCHAR(50) NOT NULL,
        `tenantname` VARCHAR(100) NOT NULL,
        `applicationid` VARCHAR(50) NOT NULL,
        `inactive` VARCHAR(1) NOT NULL DEFAULT '0' COMMENT '1=Inactive',
        `privatekeys` TEXT NOT NULL,
        `publickeys` TEXT NOT NULL,
        PRIMARY KEY (`tenantid`),
        INDEX `applicationid` (`applicationid`)
    )

```typescript
import { Arguments } from "will-util";
import { DBConnections } from "will-sql";
import { BasicLibrary } from "will-lib";

let args = process.argv.slice(2);
console.log("args = "+args);
let section = Arguments.getString(args,"MYSQL","-ms");
let clientid = Arguments.getString(args,"","-cid","-client");
let plaintext = Arguments.getString(args,"","-txt");
let ciphertext = Arguments.getString(args,"","-ctxt");

async function doBasic() {
    try {
        let conn = DBConnections.getDBConnector(section);
        try {
            let blib : BasicLibrary = new BasicLibrary();
            if(clientid) {
                let info = await blib.getTenantInfo(conn,clientid as string);
                console.log("tenant",info);    
                if(plaintext) {
                    let txt = await blib.encrypt(plaintext, clientid, conn);
                    console.log("encrypt",txt);
                }
                if(ciphertext) {
                    let txt = await blib.decrypt(ciphertext, clientid, conn);
                    console.log("decrypt",txt);
                }
            } else {
                if(plaintext) {
                    let txt = await blib.encrypt(plaintext);
                    console.log("encrypt",txt);
                }
                if(ciphertext) {
                    let txt = await blib.decrypt(ciphertext);
                    console.log("decrypt",txt);
                }
            }
        } catch(er) {
            console.error(er);
        }
    } catch(ex) {
        console.error(ex);
    }
}

testBasic();
```
