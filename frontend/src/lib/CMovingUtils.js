import {
    deleteExtraAllWhiteSpace,
    historyInfo,
    isCompareWVAppsAll,
    isDevTarget, isEqualFindCover,
    isFindCoverHost, isInAppBrowser,
    isNotLocal,
    isProdTargetUsingNode, trimCompatible
} from "./common";
import {
    COMMON_COOKIE_DOMAIN,
    COMMON_COOKIE_KEY_MV,
    COVER_MVCV,
    isActivateCoverShield,
    isHookWhenCoverShow,
    SIDE_MV
} from "../constants";
import {
    disableShowingCoverPageUsingCookie,
    getCookieFromCommonDomainAsDecode,
    isExpireDateCheckUpASType, saveTimeAsFormatStr,
    setDateAndTimeIntoCommonDomain
} from "./CookieControlUtil";
import {Cookies} from "react-cookie";
import {deleteCookieAll, deleteCookieCommon, deleteCookieCover} from "./TestUtilCover";
import {
    isExtraFilterFromSearchParams,
    isFindWrongPathCheckDone,
    replaceFromSplitFromSearchQuery
} from "./CoverUtils";
import {isWVAppsMv} from "./OpenLinkUtils";
import moment from "moment";

const cookies = new Cookies();

/**
 * 현재의 호스트내에서 최초 화면 로드되어질때 Cover Page 로
 * 위치 사용처 BaseContainer
 * @param objs
 * @param searchParam
 */
export const coverPageHolderAtLoadFirst = (objs, searchParam) => {
    try {
        if (searchParam !== undefined && String(searchParam).length > 0) {
            //console.log(`coverPageHolderAtLoadFirst SearchParam Not Undefined :: ${searchParam} ${JSON.stringify(objs)}`);
            let isDetectInAppBrowser = isInAppBrowser(window.navigator.userAgent.toLowerCase());
            //console.log(`coverPageHolderAtLoadFirst isDetectInAppBrowser :: ${isDetectInAppBrowser}`);
            if(isDetectInAppBrowser) {
                showCoverPageAtFirst(objs, searchParam);
            }else{
                showCoverPageAtFirst(objs, searchParam);
            }
        } else {
            //console.log(`coverPageHolderAtLoadFirst SearchParam Not Exists`);
            showCoverPageAtFirst(objs, '');
        }
    }catch (e) {
        //console.log(`coverPageHolderAtLoadFirst Exception ${e}`);
        showCoverPageAtFirst(objs, '');
    }
};

/**
 * 현재의 호스트내에서 최초 화면 로드되어질때 Cover Page 로
 * 이동되어지는 로직
 * 위치 사용처 BaseContainer
 *
 * @param obj
 * @param params
 */
export const showCoverPageAtFirst = (obj, params) => {
    let isApps = isWVAppsMv(window.navigator.userAgent);
    if (!isApps) {
        // 250826 비바샘터 이동하지 않도록
        // 250915 본인인증 이동하지 않도록
        if (window.location.href.indexOf("saemteo") < 0 && window.location.href.indexOf("verifyResult") < 0) {
            obj.mHistory.replace('/coverPage');
        }
    }

    if (!isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())) {
        if (isActivateCoverShield) {
            let isCoverReveal = isExpireDateCheckUpASType(cookies, COVER_MVCV);
            if (isCoverReveal) {
                // Cover Page 노출되어 질때
                if (isProdTargetUsingNode() && !isDevTarget()) {
                    // mv.vivasam.com
                    if (isFindCoverHost(obj, false)) {
                        //console.log(`showCoverPageAtFirst mv`);
                        moveToDirectionCover(obj, params);
                    }
                } else {
                    if (isDevTarget()) {
                        // dev-mv.vivasam.com
                        //console.log(`showCoverPageAtFirst dev-mv`);
                        if (isFindCoverHost(obj, false)) {
                            moveToDirectionCover(obj, params);
                        }
                    }

                    if (!isNotLocal()) {
                        // local
                        //console.log(`showCoverPageAtFirst Local`);
                        if (isFindCoverHost(obj, true)) {
                            moveToDirectionCover(obj, params);
                        }
                    }
                }
            }else{
                // 여기는 건들지 않는걸로 (By Pass 구역)
                // 단 예외인 페이지는 /cover 이다 cover 는 출력이 되면 안됨으로 바로 메인으로 돌린다.
                recalledPrevent(obj);
            }
        }else{
            // Cover Page 를 활성화 하지 않았을떄 Reset
            deleteCookieReset();
            recalledPrevent(obj);
        }
    }

    if(isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())){
        recalledPrevent(obj);
    }
};

/**
 * cover page 가 비활성화된 상태혹은 모바일 웹으로 보기를
 * 사용자 클릭 했을때 path 가 cover 인 상태로 진입시
 * cover 를 노출하지 않고 바로 메인으로 돌린다.
 * 추가로 인앱 웹뷰 상태에서는 노출이 되지 않게 한다.
 *
 * @param obj
 */
export const recalledPrevent = (obj) => {
    // Path 를 체크했을때 /cover 가 있다.
    // 근데 이부분은 cover page 가 나오지 말아야 하는 구간임을 명시
    if(isEqualFindCover(obj)){
        // 일단 무조건 mv 메인 call
        obj.mHistory.replace('/');
    }
};

/**
 * Cookie Key 값에 따른 Reset 삭제
 */
export const deleteCookieReset = () => {
    try {
        // 비상시에 내렸다가 올릴떄 누적된 저장된 쿠키 Reset
        const cookieMV = getCookieFromCommonDomainAsDecode(cookies, COMMON_COOKIE_KEY_MV, false);
        const cookieMVCV = getCookieFromCommonDomainAsDecode(cookies, COVER_MVCV, false);
        // console.log(`Cookie Check All :: ${cookieMV} ${cookieMVCV}`);
        if (cookieMV.length > 0 && cookieMVCV.length > 0) {
            deleteCookieAll();
        }else{
            if(cookieMV.length > 0){
                deleteCookieCommon();
            }

            if(cookieMVCV.length > 0){
                deleteCookieCover();
            }
        }
    }catch (e) {

    }
};

/**
 * Cover Page 로 이동 하되
 *
 * @param obj
 * @param params
 */
export const moveToDirectionCover = (obj, params) => {
    if (cookies !== undefined || cookies !== null) {
        // console.log(`moveToDirectionCover Cookie Not Undefined :: ${params} ${obj.mPaths}`);
        try {
            // Cookie Setting
            setDateAndTimeIntoCommonDomain(cookies
                , COMMON_COOKIE_KEY_MV
                , saveTimeAsFormatStr()
                , {}
                , COMMON_COOKIE_DOMAIN
                , false);

            obj.mHistory.replace({pathname: '/cover', state: {type: SIDE_MV, path: obj.mPaths, searchP: params}});

        } catch (e) {
            //console.log(`moveToDirectionCover Exception : ${e}`);
            obj.mHistory.replace({pathname: '/cover', state: {type: SIDE_MV, path: obj.mPaths, searchP: params}});
        }
    }else{
        //console.log(`moveToDirectionCover Cookie Undefined :: ${obj} ${params}`);
        obj.mHistory.replace({pathname: '/cover', state: {type: SIDE_MV, path: obj.mPaths, searchP: params}});
    }
};

/**
 * 현재 Host 내에서 최초 URL 로드 이후부터
 * 변경되는 URL 에 대하여 모든 변화 감지하는 구간내에서
 * 활용되는 함수
 * 주 기능
 * - 모바일 단말 브라우져내에서 현재의 Host URL 이 변경될때
 * - 최초 URL 로드되는 시점 제외이다. (반드시 필수 숙지)
 * - 위치 사용처 BaseContainer
 * @param history
 */
export const loadWithoutForWaiting = (history) => {
    if (!isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())) {
        if (isHookWhenCoverShow) {
            let isCoverReveal = isExpireDateCheckUpASType(cookies, COVER_MVCV);
            //console.log(`loadWithoutForWaiting Cover Page Show State :: ${isCoverReveal}`);
            if (isCoverReveal) {
                // CoverPage 가 노출되어질때
                let objs = historyInfo(history);
                let searchParams = objs.searchParams; // 현위치에 Param
                try {
                    //console.log(`loadWithoutForWaiting Search Params Check : ${searchParams} ${objs.mPaths}`);

                    if (searchParams !== undefined && String(searchParams).length > 0) {
                        //console.log(`loadWithoutForWaiting Search Params Exists : ${searchParams} ${objs.mPaths}`);
                        let isDetectInAppBrowser = isInAppBrowser(window.navigator.userAgent.toLowerCase());
                        //console.log(`loadWithoutForWaiting isDetectInAppBrowser :: ${isDetectInAppBrowser}`);
                        if (isDetectInAppBrowser) {
                            loadAfterShowCover(objs, searchParams);
                        } else {
                            loadAfterShowCover(objs, searchParams);
                        }
                    } else {
                        //console.log(`loadWithoutForWaiting : ${JSON.stringify(objs)}`);
                        loadAfterShowCover(objs, '');
                    }
                } catch (e) {
                    loadAfterShowCover(objs, '');
                }
            } else {
                //console.log(`loadWithoutForWaiting Cover Page Show OFF :: ${isCoverReveal}`);
                // 여기는 건들지 않는걸로
                // 단 예외인 페이지는 /cover 이다 cover 는 출력이 되면 안됨으로 바로 메인으로 돌린다.
                let objs = historyInfo(history);
                recalledPrevent(objs);
            }

        } else {
            // Cover Page 를 활성화 하지 않았을떄 Reset
            deleteCookieReset();
            let objs = historyInfo(history);
            recalledPrevent(objs);
        }
    }

    if(isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())){
        let objs = historyInfo(history);
        recalledPrevent(objs);
    }
};

/**
 * 최초 화면이 출력됐고 이후에
 * 이후에 현재 호스트 내에서 URL 변경되었을때
 * 처리 로직
 * @param obj
 * @param params
 */
export const loadAfterShowCover = (obj, params) => {
    if (!isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())) {
        if (isActivateCoverShield) {
            //console.log(`loadAfterShowCover Active Shields`);
            if (isProdTargetUsingNode() && !isDevTarget()) {
                // mv.vivasam.com
                if (isFindCoverHost(obj, false)) {
                    //console.log(`loadAfterShowCover mv`);
                    moveToDirectionCover(obj, params);
                }
            } else {
                if (isDevTarget()) {
                    // dev-mv.vivasam.com
                    //console.log(`loadAfterShowCover dev-mv`);
                    if (isFindCoverHost(obj, false)) {
                        moveToDirectionCover(obj, params);
                    }
                }

                if (!isNotLocal()) {
                    // local
                    //console.log(`loadAfterShowCover Local`);
                    if (isFindCoverHost(obj, true)) {
                        moveToDirectionCover(obj, params);
                    }
                }
            }
        }
    }
};

/**
 * 외부에서 cover page 직접접근시 처리
 * @param isDirect if true Direct Access when false is not
 * @param target default MV
 * @param propsInstance props history instance
 * @param stateObj props object (isAppState, type, path)
 */
export const accessDirectlyFrom = (isDirect, target, propsInstance, stateObj) => {
    const isApps = isCompareWVAppsAll(window.navigator.userAgent.toLowerCase());
    let isCoverRevealHsAsSelectMobileWebWatch = isExpireDateCheckUpASType(cookies, COVER_MVCV);
    //console.log(`accessDirectlyFrom : ${isDirect} ${isCoverRevealHsAsSelectMobileWebWatch} ${JSON.stringify(stateObj)}`);
    if (isDirect) {
        //console.log(`Cover Page (HS Direct From Cover Path) :: ${isCoverRevealHsAsSelectMobileWebWatch}`);
        // cover 페이지 경로로 직접 들어온 경우 or reload on current position
        if (!isApps) {
            if (isCoverRevealHsAsSelectMobileWebWatch) {
                // Cookie 세팅 + 중고등 Cover Page 출력
                setDateAndTimeIntoCommonDomain(cookies
                    , COMMON_COOKIE_KEY_MV
                    , saveTimeAsFormatStr()
                    , {}
                    , COMMON_COOKIE_DOMAIN
                    , false);
            } else {
                // Cover 비노출 (Main ByPass)
                propsInstance.replace("/");
            }
        }
    } else {
        //console.log(`Cover Page (HS Non Direct From Cover Path) :: ${isCoverRevealHsAsSelectMobileWebWatch}`);
        if (!isApps) {
            if (isCoverRevealHsAsSelectMobileWebWatch) {
                // 쿠키 설정
                setDateAndTimeIntoCommonDomain(cookies
                    , COMMON_COOKIE_KEY_MV
                    , saveTimeAsFormatStr()
                    , {}
                    , COMMON_COOKIE_DOMAIN
                    , false);
            } else {
                try {
                    // By Pass
                    // 여기서는 Path 를 알 수 있다. Path 가 있다면
                    // let isAPPState = stateObj.isAppsState;
                    // let type = stateObj.type;
                    let path = stateObj.path;
                    if (path !== undefined && path.length > 0) {
                        //console.log(`accessDirectlyFrom Info :: ${type} ${path}`);
                        propsInstance.replace(path);
                    } else {
                        propsInstance.replace("/");
                    }
                } catch (e) {
                    propsInstance.replace("/");
                }
            }
        }
    }
};

/**
 *
 * @type {function(*, *): void}
 */
export const moveMobileWebRoutine = (path, searchP ,propsInstance) => {
    const isApps = isCompareWVAppsAll(window.navigator.userAgent.toLowerCase());
    if(!isApps) {
        if(path !== undefined && path !== null && path.length > 0){
            path = deleteExtraAllWhiteSpace(decodeURIComponent(String(path)));
            // path 가 있을경우
            if(!isFindWrongPathCheckDone(path)) {
                if (searchP !== undefined && searchP !== null && searchP.length > 0) {
                    // query string 있는 경우
                    if (!isExtraFilterFromSearchParams(searchP)) {
                        let all = decodeURIComponent(path + replaceFromSplitFromSearchQuery(searchP));
                        disableShowingCoverPageUsingCookie(cookies, (msg) => {
                            if (msg === 'Y') {
                                propsInstance.replace(all);
                            }
                        });
                    } else {
                        alert(`잘못된 주소 입니다.\n확인 후 다시 이용 바랍니다.\n감사합니다.`);
                    }
                } else {
                    // query string 없는 경우
                    disableShowingCoverPageUsingCookie(cookies, (msg) => {
                        if (msg === 'Y') {
                            // Default Handle
                            //console.log(`disableShowingCoverPageUsingCookie (Default Handle)`);
                            let all = path.trim();
                            propsInstance.replace(all);
                        }
                    });
                }
            }else{
                alert(`잘못된 주소 입니다.\n확인 후 다시 이용 바랍니다.\n감사합니다.`);
            }
        }else{
            // path 가 없을경우
            disableShowingCoverPageUsingCookie(cookies, (msg) => {
                if(msg === 'Y'){
                    moveReplace();
                }
            });
        }
    }
};

/**
 * path 없고 쿼리 스트링 없는 경우
 */
export const moveReplace = () => {
    if (!isNotLocal()) {
        // Local
        let host = trimCompatible(window.location.hostname).toLowerCase();
        let all = `http://${host}:${window.location.port}/#/`
        //console.log(all);
        document.location.replace(all);
    } else {
        // mv , dev
        let host = trimCompatible(window.location.hostname).toLowerCase();
        let all = `https://${host}/#/`
        //console.log(all);
        document.location.replace(all);
    }
};

