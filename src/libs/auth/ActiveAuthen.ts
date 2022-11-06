import { AuthenError } from "../AuthenError";
import { ActiveConfig } from "../ActiveConfig";
import { HTTP } from "../HTTP";
let ActiveDirectory = require('activedirectory');

export interface ActiveAccountDomain {
    accountName: string;
    domainName: string | undefined;
}

export interface ActiveAccount {
    firstName: string;
    lastName: string;
    displayName: string;
}

export interface ActiveUser extends ActiveAccount {
    accountName: string;
    principalName: string;
    commonName: string;
}

export class ActiveAuthen {

    public static getAccountDomain(username: string) : ActiveAccountDomain {
        let idx = username.indexOf("@");
        if(idx && idx>0) {
            let domain = username.substring(idx+1);
            username = username.substring(0,idx);
            return { accountName: username, domainName: domain };
        }
        return { accountName: username, domainName: undefined };
    }

    private getUserName(username: string, config: ActiveConfig) : string {
        let idx = username.indexOf("@");
        if(idx && idx<0) {
          username = username+"@"+config.domain;
        }
        return username;
    }
    
    private static getActiveAccount(username: string) : ActiveAccount {
        let names = username.split(" ");
        if(names.length>1) {
            let name = names[0];
            let surname = names[1];
            let displaysurname = surname;
            if(displaysurname.length>3) {
                displaysurname = displaysurname.substring(0,3);
            }
            return { firstName: name, lastName: surname, displayName: name+"_"+displaysurname };
        }
        return { firstName: username, lastName: "", displayName: username };
    }

    public async isAuthenticate(username: string, password: string, config: ActiveConfig) : Promise<boolean> {
        let ad = new ActiveDirectory(config);
        username = this.getUserName(username, config);
        return new Promise<boolean>((resolve, reject) => {
            ad.authenticate(username, password, function(aerr : any, auth: any) {
                if (aerr) {
                    reject(new AuthenError(HTTP.UNAUTHORIZED,"Unauthorized",401,aerr));
                    return;
                }
                console.log("isAuthenticate",JSON.stringify(auth));
                if (auth) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    public async getActiveUser(username: string, password: string, config: ActiveConfig) : Promise<ActiveUser> {
        let account = ActiveAuthen.getAccountDomain(username);
        let sAMAccountName = account.accountName;
        username = this.getUserName(username, config);
        let findcfg = {
            url: config?.url,
            baseDN: config?.baseDN,
            username: username,
            password: password
        };
        console.log("getActiveUser",sAMAccountName);
        let ad = new ActiveDirectory(findcfg);
        return new Promise<ActiveUser>((resolve, reject) => {
            ad.findUser(sAMAccountName, function(ferr: any, user: any) {
                if(ferr) {
                    reject(new AuthenError(HTTP.NOT_FOUND,"User not found",404,ferr));
                    return;
                }
                if(user) {
                    console.log("getActiveUser",JSON.stringify(user));
                    let ac = ActiveAuthen.getActiveAccount(user.cn?user.cn:user.displayName);
                    resolve({
                        accountName: sAMAccountName,
                        principalName: user.userPrincipalName, 
                        commonName: user.cn?user.cn:user.displayName, 
                        displayName: ac.displayName,
                        firstName: ac.firstName,
                        lastName: ac.lastName
                    });
                } else {
                    reject(new AuthenError(HTTP.NOT_FOUND,"User not found"));
                }
            });
        });
    }

    public async authenticate(username: string, password: string, config: ActiveConfig) : Promise<ActiveUser> {
        let valid = await this.isAuthenticate(username, password, config);
        if(valid) {
            return await this.getActiveUser(username, password, config);
        }
        return Promise.reject(new AuthenError(HTTP.UNAUTHORIZED,"Invalid user or password",-3004));
    }

}
