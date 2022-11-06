import { PromptConfig } from "../PromptConfig";
import { ResponseInfo } from "./BaseAuthentication";
import { NewsAuthentication } from "./NewsAuthentication";
import { WowAuthentication } from "./WowAuthentication";

export interface PromptAccount {
    username: string;
    usersurname: string;
    displayname: string;
}

export interface PromptUser extends PromptAccount {
    email: string;
    userid?: string;
    userProfile?: any;
}

export class PromptAuthen {

    private getPromptAccount(username: string, usersurname: string) : PromptAccount {
        let displaysurname = usersurname;
        if(usersurname.length>3) {
            displaysurname = displaysurname.substring(0,3);
            return { username: username, usersurname: usersurname, displayname: username+"_"+displaysurname };
        }
        return { username: username,usersurname: usersurname, displayname: username+"_"+usersurname };
    }

    public async authenticate(username: string, password: string, config: PromptConfig) : Promise<PromptUser> {
        let res : ResponseInfo;
        if("NEWS"==config.authtype) {
            let alib : NewsAuthentication = new NewsAuthentication(config.url);
            res = await alib.login(username, password, config.site);
        } else {
            let alib : WowAuthentication = new WowAuthentication(config.url);
            res = await alib.login(username, password, config.site);
        }
        let pac = this.getPromptAccount(res.userProfile.username,res.userProfile.usersurname);
        let result = {
            ...res,
            ...pac,
            email: res.userProfile.employEmail,
            userid: res.userProfile.userid,
            userProfile: res.userProfile
        }
        return Promise.resolve(result);
    }
    
}
