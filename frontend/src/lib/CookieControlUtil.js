import moment from "moment";
import {isNotLocal} from "../lib/common";
import {
    COMMON_COOKIE_DOMAIN,
    COVER_MVCV,
    COVER_EXPIRED_DATE, EX_DAYS_END
} from "../constants";
import {numberIsNan} from "./CoverUtils";

/**
 * cookies => Cookie Instance
 * key => Cookie key
 * value => Cookie Value
 * options => {}
 * isUseDomainSelf => if True On Current Domain or Not Global Domain
 * @type {setDateAndTimeIntoCommonDomain}
 */
export const setDateAndTimeIntoCommonDomain = (cookies, key, value, options = {}, domainNm, isUseDomainSelf) => {
    try {
        if (cookies !== undefined) {
            if (!isUseDomainSelf) {
                // 특정 도메인으로 Cookie Save
                if (isNotLocal()) {
                    //console.log('Target Non Assign ......');
                    // 상세 Target 필요없는 경우 (현재의 사항으로 사용)
                    // sameSite: 'none'
                    let exDays = setDaysAndSelect(EX_DAYS_END);
                    //console.log(`ExDays :: ${exDays}`);
                    cookies.set(key, value, {domain: domainNm, secure: false, path: '/', expires: exDays});
                } else {
                    //console.log('Target Assign Local......');
                    // domain 에 localhost 라고 지정해도 되는 경우가 있을거고
                    // .localhost 혹은 null 대략 이런 경우에 사항이 있을것이다. 그건 상황에 맞게
                    let exDays = setDaysAndSelect(EX_DAYS_END);
                    //console.log(`ExDays :: ${exDays}`);
                    cookies.set(key, value, {domain: 'localhost', secure: false, path: '/', expires: exDays});
                }
            } else {
                // 현재 도메인내에 Cookie Save
                cookies.set(key, value);
            }
        }
    } catch (e) {
        //console.log(`Cookie Exception While Set Cookie: ${e.toString()}`);
    }
};

/**
 * Default one year what if don't exist setting times
 * @param exDays
 * @returns {Date}
 */
export const setDaysAndSelect = (exDays) => {
    // Default at 365 days.
    exDays = exDays || EX_DAYS_END;
    let NOW = new Date();
    let Future = new Date(NOW.setDate(NOW.getDate() + exDays));
    //console.log(`setDaysAndSelect After (GMT) !!!!!!!!! :: ${Future} ${exDays}`);
    return Future;
};

/**
 * 저장할떄는 String
 * 값을 빼내서 연산할때는 숫자
 * 현재의 시간 값을 쿠키로 올릴때는 encoding 이 따로
 * 는 필요없다고 판단하지만 크롬에서는 자동으로 인코딩이 되지만
 * 각 브라우져마다 상황이 다를것을 대비해서
 * 기본적으로 encode 는 걸어준다.
 * @param moments
 * @param saveTimeAsMillie
 */
export const saveTimeAsFormatStr = () => {
    try {
        let timeFormCurrents = moment().format('YYYY-MM-DD HH:mm:ss');
        //console.log(`Currents Time As Millie : ${timeFormCurrents}`);
        return encodeURIComponent(timeFormCurrents);
    } catch (e) {
        //console.log(`Exception : ${e.toString()}`);
        return "";
    }
};

/**
 * 공용 도메인 (.vivasam.com)에 저장된 쿠키 값을 가져온다.
 * 도메인 쪽에서 끌어서 가져올 수 경우는
 * 실 도메인으로 외부로 나가 있는 경우
 * <me, m, dev-me>
 * @type {getCookieOtherDomain}
 */
export const getCookieOtherDomain = (cookies, key, isUseDomainSelf) => {
    let resultJustGet = "";
    try {
        if (!isUseDomainSelf) {
            if (isNotLocal()) {
                // option 상에서는 따로 Domain 을 지정하는 Option 은 없다
                resultJustGet = cookies.get(key);
                //console.log(`GetCookieFromOtherDomain (JUST GET WITH DOMAIN) : ${JSON.stringify(resultJustGet)}`);
            } else {
                // option 상에서는 따로 Domain 을 지정하는 Option 은 없다
                // local
                resultJustGet = cookies.get(key);
                //console.log(`GetCookieFromOtherDomain (JUST GET) : ${JSON.stringify(resultJustGet)}`);
            }
            return resultJustGet === undefined ? "" : resultJustGet;
        } else {
            resultJustGet = cookies.get(key);
            //console.log(`GetCookieFromOtherDomain (JUST GET) : ${JSON.stringify(resultJustGet)}`);
            return resultJustGet === undefined ? "" : resultJustGet;
        }
    } catch (e) {
        //console.log(`Cookie Exception : ${e.toString()}`);
        return resultJustGet;
    }
};

/**
 * get Cookies As Decode URI
 * Decode 된 값을 전달 받습니다.
 *
 * @param cookies
 * @param key
 * @param isUseDomainSelf
 * @returns {string}
 */
export const getCookieFromCommonDomainAsDecode = (cookies, key, isUseDomainSelf) => {
    let cookVal = '';
    try {
        cookVal = decodeURIComponent(String(getCookieOtherDomain(cookies, key, isUseDomainSelf)));
        return cookVal;
    } catch (e) {
        //console.log(`Exception : ${e.toString()}`);
        return cookVal;
    }
};

/**
 * Cookie Delete
 *
 * @param cookies
 * @param key
 * @param isUseDomainSelf
 */
export const deleteCookie = (cookies, key, isUseDomainSelf) => {
    try {
        if (!isUseDomainSelf) {
            if (isNotLocal()) {
                cookies.remove(key, {path: "/", domain: COMMON_COOKIE_DOMAIN});
            } else {
                // Local
                cookies.remove(key);
            }
        } else {
            cookies.remove(key);
        }
    } catch (e) {
        //console.log(`Cookie Delete Exception : ${e.toString()}`);
    }
};

/**
 * Stand For 24 hours
 * @param cookies
 * @param key
 * @param value
 * @param options
 * @param domainNm
 * @param isUseDomainSelf
 */
export const setCookieForExpirePeriod = (cookies, exday, key, value, options = {}, domainNm, isUseDomainSelf) => {
    try {
        if (cookies !== undefined) {
            if (!isUseDomainSelf) {
                // 특정 도메인으로 Cookie Save
                // console.log(`Options : ${JSON.stringify(optionsObjs)}`);
                if (isNotLocal()) {
                    //console.log('Target Non Assign ......');
                    // 상세 Target 필요없는 경우 (현재의 사항으로 사용)
                    let days = setDaysAndSelect(exday);
                    cookies.set(key, value, {domain: domainNm, secure: false, path: '/', expires: days});
                } else {
                    //console.log('Target Assign Local......');
                    // domain 에 localhost 라고 지정해도 되는 경우가 있을거고
                    // .localhost 혹은 null 대략 이런 경우에 사항이 있을것이다. 그건 상황에 맞게
                    let days = setDaysAndSelect(exday);
                    cookies.set(key, value, {domain: 'localhost', secure: false, path: '/', expires: days});
                }
            } else {
                // 현재 도메인내에 Cookie Save
                cookies.set(key, value);
            }
        }
    } catch (e) {
        //console.log(`Cookie Exception While Set Cookie: ${e.toString()}`);
    }
};

/**
 * 사용자가 모바일 웹 보기 선택시 Cookie 설정
 *
 * @param callAct
 */
export const disableShowingCoverPageUsingCookie = (cookies, callAct) => {
    try {
        // cookies, COMMON_COOKIE_KEY_ME, saveTimeAsFormatStr(), {}, COMMON_COOKIE_DOMAIN, false
        // Value 는 Days 1 일 (현재는 1일 기준)
        const expiry = new Date()
        // +1일 계산 (calender date after 1 day)
        // Value For Cookies
        const expiryDate = expiry.getDate() + COVER_EXPIRED_DATE;
        setCookieForExpirePeriod(cookies, COVER_EXPIRED_DATE, COVER_MVCV, expiryDate, {}, COMMON_COOKIE_DOMAIN, false);
        callAct('Y');
    } catch (e) {
        callAct('N');
        //console.log(`Cookie Exception While Set Cookie: ${e.toString()}`);
    }
};

/**
 * Cover Page 가 노출되는 조건
 * @param cookies
 */
export const isCoverShowAsDatesUsingCookie = (cookies, type) => {
    try {
        const visited_expire_date = getCookieOtherDomain(cookies, type, false);
        // console.log(`Cookie Value :: ${visited_expire_date}`);
        // 현재 날짜 (비어있을 일은 거의 없음 특이한 경우 아닌경우)
        const visited_now_date = new Date().getDate();
        if (visited_expire_date !== undefined && visited_expire_date !== null && visited_expire_date.length > 0) {
            let ext = Number(visited_expire_date);
            let stands = Number(visited_now_date);
            let daysCompare = Number(ext - stands);
            //console.log(`Cookie Value (expire date From Cookie / daysCompare ) :: ${ext} ${daysCompare} `);
            if ((ext === stands || daysCompare > COVER_EXPIRED_DATE || daysCompare < (COVER_EXPIRED_DATE - COVER_EXPIRED_DATE) || numberIsNan(daysCompare))) {
                // 만료날짜와 현재의 날짜가 같다 (Cover Page 노출)
                // 쿠키에 저장된 일자 기준과 현재의 일자
                // 만료날짜 도래시 혹은 지정한 일 1 일을 경과하거나 반대로 미만일경우 (-1, -2...)
                return true;
            }else{
                // Cover Page 비노출
                return false;
            }
        } else {
            // Cookie 가 없을경우 (즉 날짜가 도래하여 Cookie 사라진 경우) (Cover Page 노출)
            // 혹은 아에 진짜로 없는 경우
            return true;
        }
    } catch (e) {
        // (Cover Page 노출)
        return true;
    }
};

/**
 *
 * @type {function(*): boolean}
 */
export const isExpireDateCheckUpASType = (cookies, type) => {
    // let isCoverReveal = false;
    // if (!isMobileWebSettingForCookie) {
    //     isCoverReveal = isCheckExpireCoverDates();
    //     //console.log(`isCheckExpireCoverDates : ${isCoverReveal}`);
    // }
    // if (isMobileWebSettingForCookie) {
    //     isCoverReveal = isCoverShowAsDatesUsingCookie(cookies, type);
    //     //console.log(`isCoverShowAsDatesUsingCookie : ${isCoverReveal}`);
    // }
    return isCoverShowAsDatesUsingCookie(cookies, type);
};

/**
 * get Cookie Setting State for already being on Browser from user
 */
export const isCookieAllowedState = () => {
    let cookieAllowedState = false;
    try {
        cookieAllowedState = navigator.cookieEnabled;
        //console.log(`cookieAllowed State : ${cookieAllowedState}`);
        return cookieAllowedState;
    }catch (e) {
        //console.log(`cookieAllowedState (Exception) : ${e}`);
        return cookieAllowedState;
    }
};

/**
 * When need cookie allow from User
 */
export const needCookieAllowInHost = () => {
    if(!isCookieAllowedState()) {
        setTimeout(() => {
            alert('해당 브라우저 설정내에서 쿠키 허용이 차단되어 있습니다.\n해당 브라우저 설정내에서 현재 사용자를 통한 직접 쿠키 허용 설정이 필요합니다.')
        }, 2000);
    }
};

// /**
//  * Get Navigator Info All
//  */
// export const getNavigatorInfo = () => {
//     let info = navigator.onLine +"\n"+ navigator.userAgent;
//     console.log(`Navigator Info : ${info}`);
// };

// export const ckAssignRule = () => {
//     // let optionsObjs = Object.keys(options).length !== 0 && options.constructor !== Object ? options : {domain: domainNm};
//     // console.log(`Options : ${JSON.stringify(optionsObjs)}`);
//     // if (isUseAssignTarget) {
//     //     console.log('Target Assign ......');
//     //     // 상세 Target 필요한 경우 (만약에라는 사항 때문에 기재하며 만약 사용한다고 하면)
//     //     // 내부에 Path 정보 기타 등등.. 정해진 정책에 맞게 값을 설정하여 사용하여함 설정된 값은 그냥 예시이다.
//     //     cookies.set(key, value, Object.assign({
//     //         path: '/',
//     //         maxAge: 604800,
//     //         secure: 'None'
//     //     }), optionsObjs);
//     // } else {
// };