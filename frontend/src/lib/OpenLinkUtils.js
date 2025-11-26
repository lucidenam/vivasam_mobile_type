import {isIOS, isAndroid, isSafari, isMobileSafari, isMobile} from "react-device-detect";
import {isNewIOSMobileAgent} from './common';

/**
 * App 에서 Webview 쪽에 Setting 한 추가된 Custom Agent
 * 를 식별할 수 있는 함수 제작 생성
 *
 * AOS / IOS 각 식별값 추가 (추후에 APP AOS 진입 APP IOS 진입 추가 조건 붙을시를 대비해 Agent 별도 구분값 추가)
 * 
 * @param agentInfo
 * @returns {boolean}
 */
export const isWVAppsMv = (agentInfo) => {

    let txt = String(agentInfo).trim();

    let newTxt = txt.split('[');

    for (let i = 1; i < newTxt.length; i++) {
        let res = newTxt[i].split(']')[0];
        // 중고등 (mv)
        if(res === 'app_aos_wv_vivasam_mv' || res === 'app_ios_wv_vivasam_mv'){
            console.log(res);
            return true;
        }
    }
    return false;
}

/**
 * 새 탭으로 외부 링크 열기 함수
 * @param url
 * @param isUseBlank if true open external Browser load web tab (Common) or false open external Browser load web tab (Safari)
 */
const openInNewTab = (url, isUseBlank) => {
    isUseBlank ? window.open(url, '_blank', 'noopener,noreferrer') : window.open(url, 'system');
}

/**
 * 신규 링크 열기 =>  IOS A link 이슈 관련
 * (교사문화 프로그램 a 태그 IOS 에서는 현재의 callLinkingOpenUrl 를 사용하고 있단다.)
 * 그래서 React 쪽에 해당 부분 업체측으로부터 추가 요청 받았으며 이에 실행함 (생성 원인 일체)
 *
 *
 * 현재의 이슈로 인하여 IOS Native 소스에서 인터페이스 함수명 callLinkingOpenUrl 명칭으로 검색하여 IOS 정상동작 확인을 위한 디버깅 환경 구성
 * 그리고 현재의 Util 이 생김 발췌는 ChannelContainer.js 권고 받은대로
 * Android Native 는 기존 구버젼(기 구글스토어에 올라가있는 버젼)에서 해당 함수명으로 선언만 되어있고 따로 특별한 처리 로직은 없음 (옛날히스토리)
 * 현재는 현 함수를 사용하여 새로운 외부창을 띄울떄 IOS/AOS 현재의 함수를 사용 (최근 히스토리)
 *
 * 기존에 각 컴포넌트에 때마다 Copy and Paste 로 다 떄려 들어가있던 사항 전부 현재의 함수로 정리
 *
 * 1. App 에서 접근시 (App 에서 정의한 Agent Setting 기준 Agent 명 [app_aos_wv_vivasam_mv] [app_ios_wv_vivasam_mv]) => callLinkingOpenUrl
 *
 * 2. 모바일 단말 브라우져 (Safari , Chrome , SamsungBrowser)에서 접근시 (해당 브라우져내 새탭 호출)
 *
 * @param targetUrl
 * @param category
 * @param action
 * @param e
 * @returns {Promise<unknown>}
 */
export const onClickCallLinkingOpenUrl = (targetUrl, e) => {
    // URL 파라미터 가공 (vbook 포함 시 skin 추가)
    try {
        if (targetUrl.includes('vbook')) {
            let url = new URL(targetUrl, window.location.origin);
            if (!url.searchParams.has('skin')) {
                url.searchParams.append('skin', 'vivasam_t_01');
            }
            // token 파라미터 없으면 추가
            if (!url.searchParams.has('token')) {
                url.searchParams.append('token', localStorage.getItem('exSsToken'));
            }
            targetUrl = url.toString();
            console.log('Modified targetUrl with skin param:', targetUrl);
        }
    } catch (err) {
        console.error('Error parsing URL:', err);
    }

    let data = {value: targetUrl};
    let userAgentInfoFromWVApp = window.navigator.userAgent; // from user-agent-info (웹뷰에서 삽입한 커스텀 agent 정보 확인)
    console.log('Info From App (User Agent) :: ' + userAgentInfoFromWVApp);
    let isApps = isWVAppsMv(userAgentInfoFromWVApp);
    console.log('Info Detection From App (Custom User Agent For WV) :: ' + isApps +'||' + isMobile);

    if (isMobile && isApps) {
        // APP 에서 접근할때
        if (isIOS || isAndroid) {
            console.log('Info From Where :: ' + isIOS + '||' + isAndroid +'||' + data.value);
            // App 으로 진입했을떄는 웹뷰 인터페이스 함수로 React 와 상호 동작한다.
            if (e !== undefined) e.preventDefault();
            return new Promise(function (resolve, reject) {
                window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                    console.log('called callLinkingOpenUrl' + retVal);
                    resolve(retVal);
                }, (err) => {
                    reject(err);
                });
            });
        } else {
            console.log("Step2 (onClickCallLinkingOpenUrl) :: ");
            // 현재의 부분은 만약을 위한 조건 IOS / AOS 가 아닌 경우에
            // 하지만 우리가 정한 에이전트 식별자는 IOS / AOS 경우에만 넣어주기에
            // AOS / IOS 제외한 다른 플렛폼은 조건에서 제외된다. ex) 라즈베리 머머 등등
            openInNewTab(targetUrl, true);
        }
    } else {
        // Browser 에서 접근할떄
        console.log("Step3 (onClickCallLinkingOpenUrl) Browser :: ");
        // Load (Go to another webpage)
        // Safari 는 이슈상 일단 별개 취급한다. 추후 Safari 정책에 따라 어떻게 될지 모름으로 사용하는쪽이 따라가야한다는점...
        if(isSafari || isMobileSafari || isNewIOSMobileAgent()) {
            console.log('Safari Correct');
            // Safari (IOS Mobile, IOS MAC) 새창
            openInNewTab(targetUrl, true);
        }else{
            console.log('Safari InCorrect');
            // Safari 브라우져 제외 나머지 새창
            openInNewTab(targetUrl, true);
        }
    }
}
