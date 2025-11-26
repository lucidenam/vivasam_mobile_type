import {Cookies} from "react-cookie";

import {
    deleteCookie
} from "../lib/CookieControlUtil";

import {
    COMMON_COOKIE_KEY_MV,
    COVER_MVCV
} from "../constants";

const cookies = new Cookies();

/**
 * 중고등 Cover Page 관련 모든 Cookie 삭제
 * Test 용
 * @param e
 */
export const btDeleteCookieAll = (e) => {
    e.preventDefault();
    deleteCookie(cookies, COMMON_COOKIE_KEY_MV, false);
    deleteCookie(cookies, COVER_MVCV, false);
}

/**
 * 중고등 Cover Page 최근 접근 시간 기록 Cookie 삭제
 * Test 용
 * @param e
 */
export const btDeleteCookieTime = (e) => {
    e.preventDefault();
    deleteCookie(cookies, COMMON_COOKIE_KEY_MV, false);
}

/**
 * 중고등 Cover Page 모바일 웹보기 관련 Cookie 삭제
 * Test 용
 * @param e
 */
export const btDeleteCookieMobileWebSee = (e) => {
    e.preventDefault();
    deleteCookie(cookies, COVER_MVCV, false);
}

/**
 * Reset Delete Cookie All
 */
export const deleteCookieAll = () => {
    try {
        deleteCookie(cookies, COMMON_COOKIE_KEY_MV, false);
        deleteCookie(cookies, COVER_MVCV, false);
    }catch (e) {
        
    }
}

export const deleteCookieCommon = () => {
    try {
        deleteCookie(cookies, COMMON_COOKIE_KEY_MV, false);
    }catch (e) {

    }
}

export const deleteCookieCover = () => {
    try {
        deleteCookie(cookies, COVER_MVCV, false);
    }catch (e) {

    }
}