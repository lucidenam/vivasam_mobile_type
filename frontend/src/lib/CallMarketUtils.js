import {ES_APP_STORE_URL, MS_HS_APP_STORE_URL} from "../constants";
import {isAndroid, isIOS, isMobile} from "react-device-detect";
import {isCompareWVAppsAll} from "./common";

function gtag(){
    window.dataLayer.push(arguments);
}

/**
 * PC 브라우저일 경우 https://me.vivasam.com 이동
 * 모바일 브라우저 일 경우 : 앱설치시 실행, 앱 없을 경우 마켓이동
 */
export const onClickCallEsApp = (e) => {
    // App 에서 왔던 단말내 모바일 브라우져에서 왔던 모바일에서 실행했을경우 (기존 히스토리 그대로 이행)
    if (isMobile) {
        // IOS (Bridge 함수 사용)
        if (isIOS) {
            gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': '초등', 'parameter_url': ES_APP_STORE_URL.IOS});
            let data = {value: ES_APP_STORE_URL.IOS};

            // 1. as-is 구현. 클릭시 모바일브라우저로 실행
            e.preventDefault();
            return new Promise(function (resolve, reject) {
                window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                    resolve(retVal);
                }, (err) => {
                    reject(err);
                });
            });
        }

        // Android (Native Intent 로 Wake 하기 떄문에 IOS 와는 다른방식으로 진행)
        if(isAndroid){
            gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': '초등', 'parameter_url': "https://play.google.com/store/apps/details?id=com.visang.vivasam.esmobile&hl=ko"});
            document.location.href = ES_APP_STORE_URL.ANDROID_INTENT;
        }

    } else {
        gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': '초등', 'parameter_url': 'https://me.vivasam.com'});
        window.location.href = 'https://me.vivasam.com';
    }
}

/**
 * 최초 비교 조건은 AOS / IOS Agent (비바샘 초중고) 값 모두로 비교 (확실히 APP 으로 진입하지 않았다는 체크)
 *
 * 그리고 비바샘 앱 초등이동 (단말내에 설치가 되어 있으면 해당 초등 APP 으로 이동 아니면 APP Store / Google Store 로 이동)
 *
 * 추후 사용 가능성이 있어 새로 작성함
 *
 * @param e
 */
export const onClickGoEntryEsApp = (e) => {
    let userAgentInfoFromWVApp = window.navigator.userAgent; // from user-agent-info (웹뷰에서 삽입한 커스텀 agent 정보 확인)
    console.log('Info From App (User Agent) :: ' + userAgentInfoFromWVApp);
    // 무엇이 되었던 일단 모바일 단말에서 시작했고 APP 으로 진입한것이 아니면
    if(isMobile && !isCompareWVAppsAll(userAgentInfoFromWVApp)){
        if (isIOS) {
            // 설치가 되어 있으면 해당 초등 APP 으로 갈거고 없으면 App Store 로 이동
            let data = {value: ES_APP_STORE_URL.IOS};
            // 1. as-is 구현. 클릭시 모바일브라우저로 실행
            e.preventDefault();
            return new Promise(function (resolve, reject) {
                window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                    resolve(retVal);
                }, (err) => {
                    reject(err);
                });
            });

        } else {
            // 설치가 되어 있으면 해당 초등 APP 으로 갈거고 없으면 Google Store 로 이동
            document.location.href = ES_APP_STORE_URL.ANDROID_INTENT;
        }
    }else{
        // PC 브라우져
        window.location.href = 'https://me.vivasam.com';
    }
}

/**
 * 최초 비교 조건은 AOS / IOS Agent (비바샘 초중고) 값 모두로 비교 (확실히 APP 으로 진입하지 않았다는 체크)
 *
 * 그리고 비바샘 앱 중고등 이동 (단말내에 설치가 되어 있으면 해당 중고등 APP 으로 이동 아니면 APP Store / Google Store 로 이동)
 *
 * 추후 사용 가능성이 있어 새로 작성함
 *
 * @param e
 */
export const onClickGoEntryHsApp = (e) => {
    let userAgentInfoFromWVApp = window.navigator.userAgent; // from user-agent-info (웹뷰에서 삽입한 커스텀 agent 정보 확인)
    console.log('Info From App (User Agent) :: ' + userAgentInfoFromWVApp);
    // 무엇이 되었던 일단 모바일 단말에서 시작했고 APP 으로 진입한것이 아니면
    if(isMobile && !isCompareWVAppsAll(userAgentInfoFromWVApp)){
        if (isIOS) {
            // 설치가 되어 있으면 해당 초등 APP 으로 갈거고 없으면 App Store 로 이동
            let data = {value: MS_HS_APP_STORE_URL.IOS};
            // 1. as-is 구현. 클릭시 모바일브라우저로 실행
            e.preventDefault();
            return new Promise(function (resolve, reject) {
                window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                    resolve(retVal);
                }, (err) => {
                    reject(err);
                });
            });

        } else {
            // 설치가 되어 있으면 해당 초등 APP 으로 갈거고 없으면 Google Store 로 이동
            document.location.href = MS_HS_APP_STORE_URL.ANDROID_INTENT;
        }
    }else{
        // PC 브라우져
        window.location.href = 'https://mv.vivasam.com';
    }
}