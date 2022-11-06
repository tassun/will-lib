import { NEWS_URL, NEWS_OPEN_TAB } from "../EnvironmentVariable";

export interface ResponseInfo {
    newsUrl: string;
    openTab: boolean;
    auth_token?: string;
    userProfile?: any;
}

export class BaseAuthentication {
    
    public getResponseInfo() : ResponseInfo {
        return {
            newsUrl: NEWS_URL,
            openTab: NEWS_OPEN_TAB
        };
    }

}
