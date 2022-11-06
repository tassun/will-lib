export class AuthenError extends Error {
    public readonly code : number;
    public readonly errno : number | undefined;
    public readonly throwable : any;
    constructor(code: number, message: string, errno?: number, throwable?: any) {
        super(message);
        this.code = code;
        this.errno = errno;
        this.throwable = throwable;
        Object.setPrototypeOf(this, AuthenError.prototype);
    }
}
