import axios from 'axios';
import { AuthenError } from '../AuthenError';
import { HTTP } from '../HTTP';
import { WOW_AUTHEN_URL, WOW_AUTHEN_API_KEY } from "../EnvironmentVariable";
import { ResponseInfo, BaseAuthentication } from './BaseAuthentication';

export interface PlatformInfo {
    os : string;
    osVersion: string;
    appVersion: string;
}

export interface WowRequestInfo {
    platform: string;
    platformInfo: PlatformInfo;
    languageId: string;
    countryId: string;
    timezoneId: string;
    companyCode: string;
    username: string;
    password: string;
}

export interface WowResponseInfo extends ResponseInfo {
    accessToken: string;
    appServerUrl: string;
}

export class WowAuthentication extends BaseAuthentication {
    public url: string = WOW_AUTHEN_URL;

    constructor(url: string) {
        super();
        this.url = url;
    }

    public static getInstance() : WowAuthentication {
        return new WowAuthentication(WOW_AUTHEN_URL);
    }

    public getRequestUserInfo() : WowRequestInfo {
        return { 
            platform: "mobile",
            platformInfo: {
                os: "iOS",
                osVersion: "10",
                appVersion: "0.0.1"
            },
            languageId: "en",
            countryId: "UK",
            timezoneId: "Asia/Bangkok",
            companyCode: "FWG",
            username: "",
            password: ""
        };
    }

    public getHeaderConfig() : any {
        return { 
            headers: {
                'Content-Type': 'application/json',
                'api-key': WOW_AUTHEN_API_KEY
            }
        };
    }

    public async login(user: string, pwd: string, site?: string) : Promise<WowResponseInfo> {
        let data = this.getRequestUserInfo();
        data.username = user;
        data.password = pwd;
        if(site && site.trim().length>0) data.companyCode = site;
        let config = this.getHeaderConfig();
        let resinfo = this.getResponseInfo();
        let result = await axios.post(this.url, data, config).then((res: any) => {            
            console.log("response data",JSON.stringify(res.data));
            if(res.data.head) {
                if(res.data.head.status!="success") {
                    let errmsg = res.data.head.statusmessage?res.data.head.statusmessage:"Authen fail";
                    return Promise.reject(new AuthenError(HTTP.UNAUTHORIZED,errmsg));
                }
                if(res.data.body) {
                    let auth_token = {
                        accessToken: res.data.body.accessToken,
                        appServerUrl: res.data.body.appServerUrl,
                    };                    
                    let auth_token_text = encodeURIComponent(JSON.stringify(auth_token));
                    return {
                        ...resinfo,
                        accessToken: res.data.body.accessToken,
                        appServerUrl: res.data.body.appServerUrl,
                        auth_token: auth_token_text,
                        userProfile: res.data.body.userProfile
                    };
                }
            }
            return Promise.reject(new AuthenError(HTTP.UNAUTHORIZED,"Authen fail"));
        }).catch(function (error: any) {
            return Promise.reject(error);
        });
        return Promise.resolve(result);
    }
    
}
