export class HTTP {
    public static readonly OK = 200;
    public static readonly BAD_REQUEST = 400;
    public static readonly UNAUTHORIZED = 401;
    public static readonly PAYMENT_REQUIRED = 402;
    public static readonly FORBIDDEN = 403;
    public static readonly NOT_FOUND = 404;
    public static readonly NOT_ALLOWED = 405;
    public static readonly NOT_ACCEPTABLE = 406;
    public static readonly REGISTER_REQUIRED = 407;
    public static readonly REQUEST_TIMEOUT = 408;
    public static readonly CONFLICT = 409;
    public static readonly GONE = 410;

    public static readonly INTERNAL_SERVER_ERROR = 500;
    public static readonly NOT_IMPLEMENTED = 501;
    public static readonly BAD_GATEWAY = 502;
    public static readonly SERVICE_UNAVAILABLE = 503;
    public static readonly GATEWAY_TIMEOUT = 504;
    public static readonly DISCONNECTED = 505;
}
