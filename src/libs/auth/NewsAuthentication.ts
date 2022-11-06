import axios from 'axios';
import { AuthenError } from '../AuthenError';
import { HTTP } from '../HTTP';
import { NEWS_AUTHEN_URL, NEWS_AUTHEN_API_KEY } from "../EnvironmentVariable";
import { ResponseInfo, BaseAuthentication } from './BaseAuthentication';

export interface NewsRequestInfo {
    user: string;
    password: string;
    company: string;
}

export interface NewsResponseInfo extends ResponseInfo {
    accessToken: string;
    appServerUrl: string;
}

export class NewsAuthentication extends BaseAuthentication {
    public url: string = NEWS_AUTHEN_URL;

    constructor(url: string) {
        super();
        this.url = url;
    }

    public static getInstance() : NewsAuthentication {
        return new NewsAuthentication(NEWS_AUTHEN_URL);
    }

    public getRequestUserInfo() : NewsRequestInfo {
        return { 
            user: "",
            password: "",
            company: "FWG"
        };
    }

    public getHeaderConfig() : any {
        return { 
            headers: {
                'Content-Type': 'application/json',
                'api-key': NEWS_AUTHEN_API_KEY
            }
        };
    }

    public async login(user: string, pwd: string, site?: string) : Promise<NewsResponseInfo> {
        let data = this.getRequestUserInfo();
        data.user = user;
        data.password = pwd;
        if(site && site.trim().length>0) data.company = site;
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
                    return {
                        ...resinfo,
                        accessToken: res.data.body.accessToken,
                        appServerUrl: res.data.body.appServerUrl,
                        auth_token: res.data.body.auth_token,
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
