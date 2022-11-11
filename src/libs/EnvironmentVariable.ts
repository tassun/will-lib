import os from "os";
import config from "will-util";
export const INITIAL_PASSWORD = config.env("INITIAL_PASSWORD","");
export const DYNAMIC_INITIAL_PASSWORD = config.env("DYNAMIC_INITIAL_PASSWORD","true");
export const MAIL_HOST = config.env("MAIL_HOST","smtp.gmail.com");
export const MAIL_PORT = parseInt(config.env("MAIL_PORT","465")) || 465;
export const MAIL_USER = config.env("MAIL_USER","");
export const MAIL_PASSWORD = config.env("MAIL_PASSWORD","");
export const MAIL_FROM = config.env("MAIL_FROM",'');
export const EXPIRE_TIMES = parseInt(config.env("EXPIRE_TIMES","64800000")) || 18*60*60*1000; //18 hours expired
export const EXPIRE_DATES = parseInt(config.env("EXPIRE_DATES","120")) || 120; //120 days expired
export const SECRET_KEY = config.env("SECRET_KEY","THECODINGMACHINE_SECRET_KEY");
export const AUTH_TOKEN_EXPIRE_IN = config.env("AUTH_TOKEN_EXPIRE_IN","18h"); //18 hours expired
export const CAPTCHA_EXPIRE_TIMES = parseInt(config.env("CAPTCHA_EXPIRE_TIMES","1800000")) || 30*60*1000; //30 mins expired
export const AD_URL = config.env("AD_URL","");
export const AD_DN = config.env("AD_DN","");
export const AD_DOMAIN = config.env("AD_DOMAIN","");
export const AD_AUTHEN: boolean = config.env("AD_AUTHEN") === "true";
export const FRONT_RESOURCES_PATH = config.env("FRONT_RESOURCES_PATH") || os.tmpdir();
export const WOW_AUTHEN_URL = config.env("WOW_AUTHEN_URL","");
export const WOW_AUTHEN_API_KEY = config.env("WOW_AUTHEN_API_KEY","");
export const NEWS_AUTHEN_URL = config.env("NEWS_AUTHEN_URL","");
export const NEWS_AUTHEN_API_KEY = config.env("NEWS_AUTHEN_API_KEY","");
export const NEWS_URL = config.env("NEWS_URL","");
export const NEWS_AUTHEN_TYPE = config.env("NEWS_AUTHEN_TYPE","WOW"); //NEWS or WOW
export const NEWS_OPEN_TAB: boolean = config.env("NEWS_OPEN_TAB","true");
export const NEWS_URL_ALWAYS_OPEN: boolean = config.env("NEWS_URL_ALWAYS_OPEN") === "true";
export const AUTHEN_BY_VERIFY_DOMAIN: boolean = config.env("AUTHEN_BY_VERIFY_DOMAIN") === "true";
export const VALIDATE_TOKEN: boolean = config.env("VALIDATE_TOKEN") === "true";
