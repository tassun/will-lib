
 export class PromptConfig {
    public authtype: string;
    public url: string;
    public site?: string;
    public domain?: string;

    constructor(authtype: string, url: string, site?: string, domain?: string) {
        this.authtype = authtype;
        this.url = url;
        this.site = site;
        this.domain = domain;
    }
    
    public hasConfigure() : boolean {
        if((this.url && this.url.trim().length>0) 
            && (this.authtype && this.authtype.trim().length>0)) {
            return true;
        }
        return false;
    }
 }