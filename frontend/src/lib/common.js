import React from 'react'
import jwtDecode from 'jwt-decode';
import {isAndroid, isIOS, isMobile, isMobileSafari} from "react-device-detect";
import {toast as toastComponent} from 'react-toastify';
import * as api from 'lib/api';
import {D_LINK_KEY, D_LINK_VALUE} from "../constants";
import {onClickCallLinkingOpenUrl} from "lib/OpenLinkUtils";

export const info = (message) => {
    if(message == null) return;
    api.appAlert(message);
}

export const error = (message) => {
    if(message == null) return;
    api.appAlert(message);
}

export const toast = (message) => {
    if(message == null) return;
    toastComponent.info(commonMessageTemplate(message));
}

const commonMessageTemplate = (message) => (
    <div>
        {
            message.split('\n').map((item, key) => {
                return <span key={key}>{item}<br/></span>
            })
        }
    </div>
)

export const getLinkInfo = (links) => {
    let linkInfo = {};
    links.forEach(e => {
        linkInfo = {...linkInfo, [e.rel] : e.href}
    });
    return linkInfo;
}

export const formatDate = (date) => {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

export const validateAccessTokenExp = (accessToken) => {
    if(accessToken) {
        try {
            const decodedToken = jwtDecode(accessToken);
            if(decodedToken.exp) {
                if(new Date().getTime() <= decodedToken.exp * 1000) {
                    return true;
                }
            }
        }catch(e) {
            return false;
        }
    }
    return false;
}

export const getContentIcon = (src) => {
    if(!src) return;
    src = src.toLowerCase();
    let icon = '';
    if(/\.(pdf)$/i.test(src)){
        icon = 'pdf';
    }else if(/\.(hwp)$/i.test(src)){
        icon = 'hwp';
    }else if(/\.(ppt|pptx)$/i.test(src)){
        icon = 'ppt';
    }else if(/\.(xls|xlsx)$/i.test(src)){
        icon = 'xls';
    }else if(/\.(zip)$/i.test(src)){
        icon = 'zip';
    }else if(/\.(swf)$/i.test(src)){
        icon = 'swf';
    }else if(/\.(mp4|avi)$/i.test(src)){
        icon = 'video';
    }else if(/\.(visang)$/i.test(src)){
        icon = 'visang';
    }
    return icon;
}

export const autoHypenPhone = (str) => {
    str = str.trim().replace(/[^0-9]/g, '');
    var tmp = '';
    if( str.length < 4){
        return str;
    }else if(str.length < 7){
        tmp += str.substr(0, 3) + '-' + str.substr(3);
        return tmp;
    }else if(str.length < 11){
        tmp += str.substr(0, 3) + '-' + str.substr(3, 3) + '-' + str.substr(6);
        return tmp;
    }else{
        tmp += str.substr(0, 3) + '-' + str.substr(3, 4) + '-' + str.substr(7);
        return tmp;
    }
}

export const getFileIconClass = (fileType, saveFileName, contentGubun) => {
    let iconClazz = '';
    if(fileType === 'FT201') {
        iconClazz = 'play';
    }else if(fileType === 'FT202') {
        iconClazz = 'audio';
    }else if(fileType === 'FT203') {
        iconClazz = 'img';
    }else if(fileType === 'FT204') {
        iconClazz = 'swf';
    }else if(saveFileName && (saveFileName.includes('.zip') || saveFileName.includes('.ZIP'))){
        iconClazz = 'zip';
    }else if(fileType === 'FT205') {
        iconClazz = getContentIcon(saveFileName);
    }else if(fileType === 'FT206') {
        iconClazz = 'link';
    }else if(fileType === 'FT207') {
        iconClazz = 'zip';
    }else if(fileType === 'FT212') {
        iconClazz = 'visang';
    }else if(contentGubun === 'CN070') {
        iconClazz = 'smart';
    }

    return iconClazz;
}

export const goAppDownload = () => {
    function gtag(){
        window.dataLayer.push(arguments);
    }
    gtag('event', '2024 모바일', {
        'parameter': '하단 메뉴 바',
        'parameter value' : '앱 다운로드'
    });
    if(isIOS) {
        document.location.href="itms-apps://itunes.apple.com/kr/app/apple-store/id1445530612";
    }else if(isAndroid) {
        document.location.href="market://details?id=com.visang.vivasam.mobile";
    }
}

export const linkTo = (history, url, type) => {
    if(!url || !history) return;
    if(type === 'NEW'){
        if(url.indexOf('http') === -1){
            url = 'http://'+ url;
        }
        const link = document.createElement('a');
        link.href = url;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }else{
        if(url.includes('m2.vivasam.com') && url.includes('#')){
            url = url.split('#').pop();
            history.push(url);
        }else{
            if(url.indexOf('http') === -1){
                history.push(url);
            }else {
                window.location.href = url;
            }
        }
    }
}

/**
 * installedAppVersionA (사용자 설치 버젼) < newPostAppVersionB (새로 개제된 버젼)
 * 현재의 상태이면 Update 가 필요한 상태로 간주 합니다.
 * @param installedAppVersionA 인터페이스를 통하여 Native App 에서 가져온 버젼 (해당 사용자가 단말에 설치하고 있는 버젼)
 * @param newPostAppVersionB 스토어에 개제된 최신 버젼
 */
export const isVersionUpdate = (installedAppVersionA, newPostAppVersionB) => {
    const regx =  /[^0-9]/g;
    const a = installedAppVersionA.replace(regx, '');
    const b = newPostAppVersionB.replace(regx, '');
    //console.log("Version Compare :: " + a +"||" + b);
    const numberA = Number(a);
    const numberB = Number(b);
    if(numberA < numberB){
        return true;
    }
    return false;
}

/**
 * Native App 에서 Webview (Container)쪽에 Setting 한 추가된 Custom Agent
 * 를 식별할 수 있는 함수 제작 생성 (현 함수는 공용)
 * 언제 어디서 사용하게될 줄 모르기에 공용으로 뺌
 * 주의 => 지우지 마시오
 * @param agentInfo => window (navigator.userAgent) 에서 전달받은 값 일체 혹은 비교하고자 하는 Agent 정보 문자열
 * @returns {boolean} => if true (From Native App) false (From Others)
 */
export const isCommonWVAppsMv = (agentInfo) => {

    let txt = String(agentInfo).trim();

    let newTxt = txt.split('[');

    for (let i = 1; i < newTxt.length; i++) {
        let res = newTxt[i].split(']')[0];
        // 중고등 (mv)
        if(res === 'app_aos_wv_vivasam_mv' || res === 'app_ios_wv_vivasam_mv'){
            //console.log(res);
            return true;
        }
    }
    return false;
}

export const isOnlyAOSWVMv = (agentInfo) => {

    let txt = String(agentInfo).trim();

    let newTxt = txt.split('[');

    for (let i = 1; i < newTxt.length; i++) {
        let res = newTxt[i].split(']')[0];
        // 초등 (me)
        if (res === 'app_aos_wv_vivasam_mv') {
            //console.log(res);
            return true;
        }
    }

    return false;
}

export const isOnlyIOSWVMv = (agentInfo) => {
    let txt = String(agentInfo).trim();

    let newTxt = txt.split('[');

    for (let i = 1; i < newTxt.length; i++) {
        let res = newTxt[i].split(']')[0];
        // 초등 (me)
        if (res === 'app_ios_wv_vivasam_mv') {
            //console.log(res);
            return true;
        }
    }

    return false;
}

/**
 * 비바샘 초등 / 중고등 Agent 모두 비교해서 하나라도 있으면 APP 에서 진입했다고 판단한다.
 * 주의 => 지우지 마시오
 * @param agentInfo
 * @returns {boolean}
 */
export const isCompareWVAppsAll = (agentInfo) => {
    let txt = String(agentInfo).trim();

    let newTxt = txt.split('[');

    for (let i = 1; i < newTxt.length; i++) {
        let res = newTxt[i].split(']')[0];
        // 초등 중고 모두 비교 (me / mv)
        if((res === 'app_aos_wv_vivasam_me' || res === 'app_ios_wv_vivasam_me')
            || (res === 'app_aos_wv_vivasam_mv' || res === 'app_ios_wv_vivasam_mv')){
            //console.log(res);
            return true;
        }
    }
    return false;
}

/**
 * 새 탭으로 외부 링크 열기 함수 (공용)
 * 주의 => 지우지 마시오
 * @param url
 * @param isUseBlank if true open external Browser load web tab (Common) or false open external Browser load web tab (Safari)
 */
export const openInNewTab = (url, isUseBlank) => {
    isUseBlank ? window.open(url, '_blank', 'noopener,noreferrer') : window.open(url, '_system');
}

/**
 * 문자열이 존재하면 True 아니면 False
 *
 * @param str received string data
 * @returns {false} if not exist string (false) the other hands true
 */
export const isStrExistCheck = (str) => {
    return str !== undefined && str !== null && str;
}

/**
 * BaseContainer 내부에서 App 에서 접근한건지 상태값 전달 전용으로 사용
 *
 * 기존에는 APP 에서의 접근여부가 불명확했지만 APP 에서의 판단할 수 있는 Agent 추가로
 *
 * 더이상 애매하게 처리 할 필요가 없다.
 *
 * @returns {{isWebView: boolean}}
 */
export const initAppStateForDetectFromApps = () => {
    let userAgentApp = window.navigator.userAgent.toLowerCase();
    let isApps = isCompareWVAppsAll(userAgentApp);
    //console.log('UserAgent Info / isApps :: ' + userAgentApp + '||' + isApps);
    return {
        isWebView: isApps
    }
}

/**
 * 다른데서 사용하고 있는 변수 => __isApp / isApp
 *
 * 기존에 사용되는 변수에 APP 일떄라는 조건을 설정해준다.
 *
 * @param BaseActions Redux Action Instance (Redux Module Create Action)
 * @param isAppsState APP 에서 접근했니 / 안했니 (window 안에 사용자 정의 객체 값 넣어서 해당 값을 여러군데서 돌려 사용하고 있다.)
 */
export const setStateActionForApps = (BaseActions, isAppsState) => {
    BaseActions.pushValues({type: "isApp", object: isAppsState});
    window.__isApp = isAppsState;
    if (window.__isApp) {
        document.querySelector('body').classList.add('in-app');
    }
}

/**
 * 하나의 History 객체를 받았을떄
 * 그 객채에 대한 일관성 유지로서
 * 하나의 함수로 history 정보를
 * 전달 받는다.
 *
 * @param history
 * @returns {{mPaths: *, mHost: *, mHistory}}
 */
export const historyInfo = (history) => {
    const host = history.location.hostname !== undefined && String(history.location.hostname).length > 0 ? history.location.hostname : window.location.hostname;
    const paths = history.location.pathname !== undefined && String(history.location.pathname).length > 0 ? history.location.pathname : window.location.pathname;
    const searchParam = history.location.search !== undefined && String(history.location.search).length > 0 ? history.location.search : window.location.search;
    //console.log(`historyInfo hostname (at First Mount) : ${host}`);
    //console.log(`historyInfo pathname (at First Mount) : ${paths}`);
    //console.log(`historyInfo searchParam (at First Search) : ${searchParam}`);
    let objs = {mHost: host , mPaths: paths, mHistory: history, searchParams: searchParam};
    return objs;
}

/**
 * Safari IOS Agent 가 기존대비 변경됨 (Apple 에서는 IOS 14 이상 버젼이라는데)
 * 확인된 사항으로는 IOS 단말 기준으로 최근 10 이상버젼에서는 그리 변경된것 같음
 * 변경된 IOS 대응 Agent 추가 식별
 * @returns {boolean}
 */
export const isNewIOSMobileAgent = () =>{
    const isMac = /Macintosh/i.test(window.navigator.userAgent);
    const isTouch = window.navigator.maxTouchPoints;
    return isMac && isTouch > 0;
}

/**
 * 문자열내 특수문자 삭제
 * @param originStr
 * @returns {*}
 */
export const deleteExtraOnLetter = (originStr) => {
    const reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    return originStr.replace(reg,'');
};

/**
 * delete All Whitespace in Text
 * @param str
 * @returns {*}
 */
export const deleteExtraAllWhiteSpace = (str) => {
    const reg = /(\s*)/g;
    return str.replace(reg,'');
};

/**
 * 호환 Trim
 * @param originStr
 * @returns {*}
 */
export const trimCompatible = (originStr) => {
    return originStr.replace(/^\s+|\s+$/g,"");
};

/**
 * if true is production target
 * @returns {boolean}
 */
export const isProdTargetUsingNode = () => {
    return process.env.NODE_ENV === 'production' ? true : false;
};

export const isDevTarget = () => {
    const host = trimCompatible(window.location.hostname).toLowerCase();
    if(String(host) === 'dev-mv.vivasam.com'){
        return true;
    }
    return false;
};

/**
 * isTest 가 True 일때는 LocalHost 일때
 * 현재의 Flag 는 개발 할때만 사용하는 Flag
 * 퍼블작업 할때나 기타 등등 ..
 *
 * Conditions For Find Section Cover Page
 * @param obj Host And Path
 * @param isTest true (Test) false (Not Test)
 * @returns {boolean} true (could show cover) false (could not show cover)
 */
export const isFindCoverHost = (obj, isTest) => {
    try {
        const strHost = trimCompatible(String(obj.mHost).toLowerCase());
        const strPath = trimCompatible(String(obj.mPaths).toLowerCase());
        // real domain
        const compareCommonDomain = ['mv.vivasam.com', 'dev-mv.vivasam.com'];
        const comparePath = ['/cover'];
        // test domain
        const compareTestDummyDomain = ['localhost', '127.0.0.1'];

        if(!isTest) {
            if ((strHost === compareCommonDomain[0] || strHost === compareCommonDomain[1])
                && strPath !== comparePath[0]) {
                //console.log('Cover Page Show');
                return true;
            } else {
                return false;
            }
        }else{
            if((strHost === compareTestDummyDomain[0] || strHost === compareTestDummyDomain[1])
                && strPath !== comparePath[0]){
                //console.log('Cover Page Show Dummy Test Domain');
                return true;
            }else{
                return false;
            }
        }
    } catch (e) {
        return false;
    }
    return false;
}

export const isEqualFindCover = (obj) => {
    try {
        const strHost = trimCompatible(String(obj.mHost).toLowerCase());
        const strPath = trimCompatible(String(obj.mPaths).toLowerCase());
        // real domain
        const compareCommonDomain = ['mv.vivasam.com', 'dev-mv.vivasam.com'];
        const comparePath = ['/cover'];
        // test domain
        const compareTestDummyDomain = ['localhost', '127.0.0.1'];

        if ((strHost === compareCommonDomain[0]
            || strHost === compareCommonDomain[1]
            || strHost === compareTestDummyDomain[0]
            || strHost === compareTestDummyDomain[1]
        ) && strPath === comparePath[0]) {
            //console.log('Cover Page Show');
            return true;
        } else {
            return false;
        }

    } catch (e) {
        return false;
    }
    return false;
}

export const isMobileDeviceBrowserDetection = () => {
    if(!isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())){
        if(isMobile && isAndroid){
            // Android
            return {
                type: 'AOS_BR',
                isMobileBR: true
            };
        }else{
            if(isIOS || isMobileSafari || isNewIOSMobileAgent()){
                // IOS (New / Old)
                return {
                    type: 'IOS_BR',
                    isMobileBR: true
                };
            }else{
                // PC
                return {
                    type: 'PC',
                    isMobileBR: false
                };
            }
        }
    }
}

/**
 *
 * @returns {boolean}
 */
export const isNotLocal = () => {
    const host = trimCompatible(window.location.hostname).toLowerCase();
    const isTargetReal = process.env.NODE_ENV === 'production' ? true : false;
    // console.log(`Host Check : ${host} ${isTargetReal}`);
    if((host === 'mv.vivasam.com'
        || host === 'dev-mv.vivasam.com') && isTargetReal){
        return true;
    }else{
        return false;
    }
};

// /**
//  * Objs Null Check
//  * @param objs dictionary
//  * @returns {boolean} if true is Object exist or not
//  */
// export const isObjectExist = (objs) => {
//     let cv = JSON.stringify(objs);
//     return (cv !== undefined && Object.keys(cv).length !== 0 && cv.constructor !== Object) ? true : false;
// }

/**
 * In-App Browser
 *
 * 판별함수
 *
 * 국내 표준 기준 kakao / naver
 *
 * @type {function(*): boolean}
 */
export const isInAppBrowser = ((agents) => {
    // let needInAppBrowserKinds = ['kakaotalk', 'ie', 'naver', 'edg'];  1 개이상에 In-App Browser Agent 판별 필요하다면
    let needInAppBrowserKinds = ['kakaotalk', 'naver'];
    try {
        //console.log(`${agents}`);
        let result = false;
        for(let i = 0 ; i < needInAppBrowserKinds.length ; i++){
            if(agents.indexOf(needInAppBrowserKinds[i]) != -1){
                result = true;
                break;
            }
        }
        return result;
    }catch (e) {
        if(!e) {
            //console.log(`${e}`);
        }
        return false;
    }
    return false;
});


export const historyInfoBase = (history) => {
    const host = history.location.hostname !== undefined && String(history.location.hostname).length > 0 ? history.location.hostname : window.location.hostname;
    //console.log(`historyInfo hostname : ${host}`);
    //console.log(`historyInfo pathname (at First Mount) : ${paths}`);
    //console.log(`historyInfo searchParam (at First Search) : ${searchParam}`);
    let objs = {mHost: host , mHistory: history};
    return objs;
}

/**
 * Type d check
 * @param searchParam
 * @returns {boolean}
 */
export const isFindSearchParamForD = (searchParam) => {
    try{
        //console.log(`isFindSearchParamForD Params :: ${searchParam}`);
        if (searchParam !== undefined && String(searchParam).length > 0) {
            let decodeURL = decodeURIComponent(searchParam);
            let lastResult = deleteExtraAllWhiteSpace(decodeURL);
            try{
                let value = new URLSearchParams(String(lastResult).toLowerCase()).get(D_LINK_KEY);
                if(value !== null){
                    let outsFilter = deleteExtraOnLetter(value);
                    let lastOut = String(trimCompatible(outsFilter));
                    //console.log(`Value Out:: ${value} ${outsFilter} ${lastOut}`);
                    if(lastOut === D_LINK_VALUE){
                        return true;
                    }else {
                        return false;
                    }
                }else{
                    return false;
                }
            }catch (e) {
                //console.log(`isFindSearchParamForD Params Exception :: ${e}`);
                return false;
            }
        }else{
            return false;
        }
    }catch (e) {
        //console.log(`isFindSearchParamForD Params Exception :: ${e}`);
        return false;
    }
};

/**
 * window location replace || href on directly
 *
 * @type {historyCleanOptionWithHref}
 */
export const historyCleanOptionWithHref = (dUrl, isUseClear) => {
    try {
        if (isUseClear) {
            // users click the back button will not be able to return to the current page
            // means overwriting it with a new entry
            document.location.replace(dUrl);
        } else {
            // add an item to the history list
            // can return to the current page
            window.location.href = dUrl;
        }
    }catch (e) {
        //console.log(`historyCleanOptionWithHref : ${e}`);
    }
};

/**
 * connection check before request location urls
 * alike ping
 * @param urlReq
 * @param callT
 */
export const checkXmlReq = (urlReq, callT) => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (){
        if(xhr.readyState === XMLHttpRequest.DONE) {
            // HttpRequest (Ping Ready Done)
            //console.log('xhr state success :: ' + xhr.status);
            if(xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) {
                // All Permitting Done
                let txInfo = xhr.readyState + "||" + xhr.status + "||" + xhr.responseText;
                //console.log('xhr state success :: ' + txInfo);
                callT();
            }else{
                if(xhr.status === 403){
                    alert('사용자 접근이 잘못되었습니다. 감사합니다.');
                }else {
                    alert('접속자가 많아 이후에 다시 실행바랍니다. 감사합니다.');
                }
            }
        } else if(xhr.readyState === XMLHttpRequest.LOADING) {
            //console.log('xhr state loading :: ' + xhr.status);
        } else if(xhr.readyState === XMLHttpRequest.OPENED){
            //console.log('xhr state opened :: ' + xhr.status);
        } else{
            //console.log('xhr state other :: ' + xhr.status);
        }
    }
    xhr.open('head', urlReq, true);
    xhr.withCredentials = true;
    xhr.send(null);
};