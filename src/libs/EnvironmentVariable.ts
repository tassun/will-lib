import os from "os";
export const INITIAL_PASSWORD = process.env.INITIAL_PASSWORD || "";
export const DYNAMIC_INITIAL_PASSWORD = process.env.DYNAMIC_INITIAL_PASSWORD || "true";
export const MAIL_HOST = process.env.MAIL_HOST || "smtp.gmail.com";
export const MAIL_PORT = parseInt(process.env.MAIL_PORT || "465") || 465;
export const MAIL_USER = process.env.MAIL_USER || "";
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD || "";
export const MAIL_FROM = process.env.MAIL_FROM || '';
export const EXPIRE_TIMES = parseInt(process.env.EXPIRE_TIMES || "64800000") || 18*60*60*1000; //18 hours expired
export const EXPIRE_DATES = parseInt(process.env.EXPIRE_DATES || "120") || 120; //120 days expired
export const SECRET_KEY = process.env.SECRET_KEY || "THECODINGMACHINE_SECRET_KEY";
export const AUTH_TOKEN_EXPIRE_IN = process.env.AUTH_TOKEN_EXPIRE_IN || "18h"; //18 hours expired
export const CAPTCHA_EXPIRE_TIMES = parseInt(process.env.CAPTCHA_EXPIRE_TIMES || "1800000") || 30*60*1000; //30 mins expired
export const AD_URL = process.env.AD_URL || "";
export const AD_DN = process.env.AD_DN || "";
export const AD_DOMAIN = process.env.AD_DOMAIN || "";
export const AD_AUTHEN: boolean = process.env.AD_AUTHEN === "true";
export const FRONT_RESOURCES_PATH = process.env.FRONT_RESOURCES_PATH || os.tmpdir();
export const WOW_AUTHEN_URL = process.env.WOW_AUTHEN_URL || "";
export const WOW_AUTHEN_API_KEY = process.env.WOW_AUTHEN_API_KEY || "";
export const NEWS_AUTHEN_URL = process.env.NEWS_AUTHEN_URL || "";
export const NEWS_AUTHEN_API_KEY = process.env.NEWS_AUTHEN_API_KEY || "";
export const NEWS_URL = process.env.NEWS_URL || "";
export const NEWS_AUTHEN_TYPE = process.env.NEWS_AUTHEN_TYPE || "WOW"; //NEWS or WOW
export const NEWS_OPEN_TAB: boolean = process.env.NEWS_OPEN_TAB === "true";
export const NEWS_URL_ALWAYS_OPEN: boolean = process.env.NEWS_URL_ALWAYS_OPEN === "true";
export const AUTHEN_BY_VERIFY_DOMAIN: boolean = process.env.AUTHEN_BY_VERIFY_DOMAIN === "true";
export const VALIDATE_TOKEN: boolean = process.env.VALIDATE_TOKEN === "true";
