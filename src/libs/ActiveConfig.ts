export class ActiveConfig {    
    public url: string;
    public baseDN: string;
    public domain: string | undefined;
    
    constructor(url: string, baseDN: string, domain?: string) {
        this.url = url;
        this.baseDN = baseDN;
        this.domain = domain;
    }
    
    public hasConfigure() : boolean {
        if((this.url && this.url.trim().length>0) 
            && (this.baseDN && this.baseDN.trim().length>0)
            && (this.domain && this.domain.trim().length>0)) {
            return true;
        }
        return false;
    }
}
