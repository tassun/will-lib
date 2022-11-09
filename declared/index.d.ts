export declare class ActiveConfig {
    url: string;
    baseDN: string;
    domain: string | undefined;
    constructor(url: string, baseDN: string, domain?: string);
    hasConfigure(): boolean;
}

export declare class ActiveLibrary {
    static getDefaultConfigure(): ActiveConfig;
    static createConfigure(row: any): ActiveConfig;
    static getActiveConfig(conn?: DBConnector, domain?: string): Promise<ActiveConfig | undefined>;
    authenticate(username: string, password: string, config?: ActiveConfig, conn?: DBConnector): Promise<ActiveUser>;
    updateUserInfo(conn: DBConnector, user: ActiveUser): Promise<number>;
    createUserInfo(conn: DBConnector, user: ActiveUser, site: string): Promise<number>;
    saveUserInfo(conn: DBConnector, user: ActiveUser, site?: string): Promise<void>;
}

export declare class AuthenError extends Error {
    readonly code: number;
    readonly errno: number | undefined;
    readonly throwable: any;
    constructor(message: string, code: number, errno?: number, throwable?: any);
}

export declare class AuthenLibrary {
    static getDefaultResponse(): ResponseInfo;
    static getDefaultConfigure(site?: string): PromptConfig;
    static createConfigure(row: any): PromptConfig;
    authenticate(username: string, password: string, config?: PromptConfig, conn?: DBConnector): Promise<PromptUser>;
    updateUserInfo(conn: DBConnector, user: PromptUser): Promise<number>;
    createUserInfo(conn: DBConnector, user: PromptUser, site: string): Promise<void>;
    saveUserInfo(conn: DBConnector, user: PromptUser, site?: string): Promise<void>;
}

export interface AuthenTokenData {
    identifier: string;
    accessToken?: string;
}
export declare class AuthenToken {
    static createAuthenToken(identifier: string, accessToken?: string): string;
    static verifyAuthenToken(token: string, ignoreExpiration?: boolean): AuthenTokenData;
}

export declare class CaptchaLibrary {
    createCaptcha(conn: DBConnector, capid?: string, mathing?: string): Promise<CaptcharInfo>;
    insertCaptcha(conn: DBConnector, cap: CaptcharInfo): Promise<string>;
    verifyCaptcha(conn: DBConnector, capid: string, answer: string, now?: Date): Promise<boolean>;
    deleteCaptcha(conn: DBConnector, capid?: string): Promise<number>;
}

export interface CaptcharInfo {
    src: string;
    code: string;
    text: string;
    id?: string;
}
declare function captchar(options?: any): Promise<CaptcharInfo>;
export { captchar };

export declare class HTTP {
    static readonly BAD_REQUEST = 400;
    static readonly UNAUTHORIZED = 401;
    static readonly PAYMENT_REQUIRED = 402;
    static readonly FORBIDDEN = 403;
    static readonly NOT_FOUND = 404;
    static readonly NOT_ALLOWED = 405;
    static readonly NOT_ACCEPTABLE = 406;
    static readonly REGISTER_REQUIRED = 407;
    static readonly REQUEST_TIMEOUT = 408;
    static readonly CONFLICT = 409;
    static readonly GONE = 410;
    static readonly INTERNAL_SERVER_ERROR = 500;
    static readonly NOT_IMPLEMENTED = 501;
    static readonly BAD_GATEWAY = 502;
    static readonly SERVICE_UNAVAILABLE = 503;
    static readonly GATEWAY_TIMEOUT = 504;
    static readonly DISCONNECTED = 505;
}

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
export declare class MailLibrary {
    static getMailConfig(conn?: DBConnector, category?: string): Promise<MailConfig>;
    static sendMail(info: MailInfo, conn?: DBConnector, config?: MailConfig, category?: string): Promise<any>;
}

interface PasswordVerify {
    result: boolean;
    msg: string | null | undefined;
    errno: number;
    args: string | null | undefined;
}
interface PasswordTemporary {
    trxid: string | undefined;
    userpassword: string | undefined;
    passwordexpiredate: Date | undefined;
}
interface UserTokenInfo {
    useruuid: string;
    userid?: string;
    code?: string;
    state?: string;
    nonce?: string;
}
declare class PasswordLibrary {
    private ht;
    private logondate;
    static parseInt(value?: string): number;
    static randomPassword(): string;
    static getAlphabets(text?: string): number;
    static getDigits(text?: string): number;
    static isDigit(c: string): boolean;
    static isLetter(c: string): boolean;
    static isLowerCase(c: string): boolean;
    static isUpperCase(c: string): boolean;
    static indexOfAlphabets(text?: string): number;
    static createNewPassword(): string;
    static checkNumberOnly(text?: string): boolean;
    createPassword(): string;
    encrypt(pwd?: string, salt?: string): string;
    encryptPassword(pwd?: string): string;
    private getPolicy;
    checkAlphainpwd(pwd?: string): boolean;
    checkDigitinpwd(pwd?: string): boolean;
    checkLowerinpwd(pwd?: string): boolean;
    checkUpperinpwd(pwd?: string): boolean;
    passwordValidation(pwd?: string): boolean;
    checkMatchPattern(pwd?: string): boolean;
    checkMaxarrangechar(pwd?: string): boolean;
    checkMaxpwdlength(pwd?: string): boolean;
    checkMaxsamechar(pwd?: string): boolean;
    checkMindiffchar(pwd?: string): boolean;
    checkMinpwdlength(pwd?: string): boolean;
    checkOtherinpwd(pwd?: string): boolean;
    getHashtable(): Map<string, string> | undefined;
    comparePassword(pwd: string, storedpwd: string): boolean;
    checkMatchNumber(conn: DBConnector, pwd?: string): Promise<boolean>;
    verifyPassword(conn: DBConnector, site?: string, userid?: string, pwd?: string): Promise<boolean>;
    checkUser(conn: DBConnector, site?: string, userid?: string): Promise<boolean>;
    checkNotchgpwduntilday(conn: DBConnector, userid?: string): Promise<boolean>;
    checkPersonalInfo(conn: DBConnector, userid?: string, pwd?: string): Promise<boolean>;
    checkReserveword(conn: DBConnector, pwd?: string): Promise<boolean>;
    checkTimenotusedoldpwd(conn: DBConnector, userid?: string, pwd?: string): Promise<boolean>;
    getUserPolicy(conn: DBConnector, userid?: string): Promise<boolean>;
    getUserExpireDate(conn: DBConnector, userid?: string, expiredate?: Date): Promise<Date>;
    getUserTemporaryExpireDate(conn: DBConnector, userid: string, site?: string): Promise<Date>;
    insertHistory(conn: DBConnector, userid?: string, pwd?: string, serverdate?: Date, systemdate?: Date, editor?: string): Promise<boolean>;
    moveTemporaryPassword(conn: DBConnector, userid?: string, moveflag?: boolean): Promise<number>;
    moveTemporaryPasswordExpired(conn: DBConnector, userid?: string, expiredate?: Date): Promise<number>;
    updatePassword(conn: DBConnector, site?: string, userid?: string, pwd?: string, expiredate?: Date, history?: boolean, changeflag?: string): Promise<boolean>;
    updatePasswordFromTemporary(conn: DBConnector, trxid?: string, userid?: string, changeflag?: string, history?: boolean): Promise<number>;
    updateTemporaryPassword(conn: DBConnector, userid?: string, pwd?: string, site?: string, expiredate?: Date): Promise<number>;
    checkPassword(conn: DBConnector, site?: string, userid?: string, oldpwd?: string, logon?: Date): Promise<PasswordVerify>;
    changePassword(conn: DBConnector, site?: string, userid?: string, oldpwd?: string, newpwd?: string, logdate?: Date, changeflag?: string, history?: boolean): Promise<PasswordVerify>;
    getUserTemporaryPassword(conn: DBConnector, userid: string): Promise<PasswordTemporary>;
    getPasswordPolicy(conn: DBConnector): Promise<string[]>;
    getUserTokenInfo(conn: DBConnector, useruuid: string): Promise<UserTokenInfo>;
}
export { PasswordLibrary, PasswordVerify, PasswordTemporary, UserTokenInfo };

export declare class PromptConfig {
    authtype: string;
    url: string;
    site?: string;
    domain?: string;
    constructor(authtype: string, url: string, site?: string, domain?: string);
    hasConfigure(): boolean;
}

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
export declare class ActiveAuthen {
    static getAccountDomain(username: string): ActiveAccountDomain;
    private getUserName;
    private static getActiveAccount;
    isAuthenticate(username: string, password: string, config: ActiveConfig): Promise<boolean>;
    getActiveUser(username: string, password: string, config: ActiveConfig): Promise<ActiveUser>;
    authenticate(username: string, password: string, config: ActiveConfig): Promise<ActiveUser>;
}

export interface ResponseInfo {
    newsUrl: string;
    openTab: boolean;
    auth_token?: string;
    userProfile?: any;
}
export declare class BaseAuthentication {
    getResponseInfo(): ResponseInfo;
}

export interface NewsRequestInfo {
    user: string;
    password: string;
    company: string;
}
export interface NewsResponseInfo extends ResponseInfo {
    accessToken: string;
    appServerUrl: string;
}
export declare class NewsAuthentication extends BaseAuthentication {
    url: string;
    constructor(url: string);
    static getInstance(): NewsAuthentication;
    getRequestUserInfo(): NewsRequestInfo;
    getHeaderConfig(): any;
    login(user: string, pwd: string, site?: string): Promise<NewsResponseInfo>;
}

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
export declare class PromptAuthen {
    private getPromptAccount;
    authenticate(username: string, password: string, config: PromptConfig): Promise<PromptUser>;
}

export interface PlatformInfo {
    os: string;
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
export declare class WowAuthentication extends BaseAuthentication {
    url: string;
    constructor(url: string);
    static getInstance(): WowAuthentication;
    getRequestUserInfo(): WowRequestInfo;
    getHeaderConfig(): any;
    login(user: string, pwd: string, site?: string): Promise<WowResponseInfo>;
}

