import {deleteExtraAllWhiteSpace, isDevTarget, isInAppBrowser, isProdTargetUsingNode} from "./common";
import {
    AOS_BR_TYPE, D_LINK_KEY, D_LINK_VALUE,
    ES_APP_STORE_URL,
    IOS_BR_TYPE, IOS_CHOOSE_SCREEN_UP,
    MOVE_TO_APP_ME,
    MOVE_TO_APP_MV,
    MS_HS_APP_STORE_URL
} from "../constants";
import {getDLinkConverter} from "./api";
import {
    isUrlTypePattern,
    isFindRegxExtraLetter,
    isFindHangul,
    isFindScriptTag,
    isFindPathRegx,
    isFindClearURLPathDetail
} from "./RegxUtil";

/**
 * DTypeActions 이란 redux 본체 안에 module 안에
 * 선언된 Action 이다.
 * store/modules 하위에 해당되는 객체이다.
 * 사용할때는 반드시
 * 클래스 컴포넌트 하위에 export default connect
 * 안에 state / dispatch
 * 선언하고 사용한다.
 *
 * @param DTypeActions store/modules/dinfo
 * @param infoD
 * @param recvDataObj
 */
export const setTypeDConfig = (DTypeActions, infoD, recvDataObj) => {
    try {
        //console.log(`Recv DType Config :: ${JSON.stringify(recvDataObj)}`);
        infoD.type = recvDataObj.targets;
        infoD.path = recvDataObj.paths;
        infoD.searchP = recvDataObj.search;
        infoD.ptype = recvDataObj.type;
        infoD.isDType = true;
        infoD.isInAppBRState = isInAppBrowser(window.navigator.userAgent.toLowerCase());
        DTypeActions.push_svd_obj({type: 'infoD', object: infoD});
    }catch (e) {
        //console.log(`Exception :: ${e}`);
    }
};

// /**
//  * Use GetIn Object From Redux Action Return
//  * @param DTypeActions
//  */
// export const getTypeVD = (DTypeActions) => {
//     try {
//         const result = DTypeActions.pop_vd_obj();
//         console.log(`Pop VD State Object : ${JSON.stringify(result)}`);
//     }catch (e) {
//         console.log(`${e}`);
//     }
// };

// /**
//  * Use GetIn Object From Redux Action Return
//  * @param DTypActions
//  */
// export const isGetSVDCheck = (DTypActions, infoD) => {
//     try {
//         const results = DTypActions.get_svd_obj();
//         console.log(`Result Trigger Complete : ${JSON.stringify(results)} `);
//         if(infoD.isDType && (infoD.type || infoD.searchP || infoD.ptype)){
//             console.log(`Result Extract ALL : ${JSON.stringify(infoD)}`);
//             console.log(`Result Extract (By Key) : ${JSON.stringify(infoD.type)}`);
//             return true;
//         }
//         return false;
//     }catch (e) {
//         console.log(`${e}`);
//         return false;
//     }
// };

// /**
//  * Get Saved Action Data From Redux
//  * @param DTypActions
//  * @returns {*|boolean}
//  */
// export const getSavedSVD = (DTypActions) => {
//     try {
//         if(DTypActions) {
//             return DTypActions.get_svd_obj();
//         }
//     }catch (e) {
//         return false;
//     }
//     return false;
// };

/**
 * DEV / PROD
 */
export const isProdTarget = () => {
    try {
        // hostTarget 기준
        //let hosts = window.location.hostname === undefined ? refHistory.hostname : window.location.hostname;
        if (isProdTargetUsingNode() && !isDevTarget()) {
            return true;
        } else {
            return false;
        }
    }catch (e) {
        //console.log(`${e}`);
        return false;
    }
};

/**
 * FB Domain FB 지정 설정 도메인
 * @param target
 */
export const makeFBPrefixDomain = (type, isProd) => {
    let fbPrefixDM = '';
    try {
        //console.log(`makeFBPrefixDomain (type / isProd) :: ${type} ${isProd}`);
        if (isProd) {
            let hostFBP = ["https://prodvivae.page.link", "https://prodvivav.page.link"]
            // Prod
            // Target 분류 ES / HS
            if (type === MOVE_TO_APP_ME) {
                fbPrefixDM = hostFBP[0];
            }

            if (type === MOVE_TO_APP_MV) {
                fbPrefixDM = hostFBP[1];
            }
        } else {
            // Dev
            // Target 분류 ES / HS
            let hostFBPT = ["https://testvivae.page.link", "https://testvivav.page.link"];
            if (type === MOVE_TO_APP_ME) {
                fbPrefixDM = hostFBPT[0];
            }

            if (type === MOVE_TO_APP_MV) {
                fbPrefixDM = hostFBPT[1];
            }
        }
        return fbPrefixDM;
    }catch (e) {
        //console.log(`makeFBPrefixDomain :: ${e}`);
        return fbPrefixDM;
    }
};

/**
 * <DLink Host + path + Search Params>
 */
export const makeDLinkPathAndSearch = (type, path, searchParam) => {
    //console.log(`makeDLinkPathAndSearch :: ${type} ${isProd()} ${path} ${searchParam}`);
    //console.log(`makeDLinkPathAndSearch (searchParam Encoding) :: ${encodeURI(searchParam)}`);
    let dLinkUrlAssembled = '';
    try {
        path = String(path).trim();
        searchParam = String(searchParam).toLowerCase().trim();
        let sp = deleteExtraAllWhiteSpace(decodeURIComponent(searchParam));
        let pa = deleteExtraAllWhiteSpace(decodeURIComponent(path));
        if (isProdTarget()) {
            // Prod
            // Target 분류 ES / HS
            let hostP = ["https://me.vivasam.com", "https://mv.vivasam.com"];

            if (type === MOVE_TO_APP_ME) {
                dLinkUrlAssembled = hostP[0]+"/#"+`${pa}`+`${sp}`;
            }

            if (type === MOVE_TO_APP_MV) {
                dLinkUrlAssembled = hostP[1]+"/#"+`${pa}`+`${sp}`;
            }
        }else{
            // Dev
            // Target 분류 ES / HS
            let hostD = ["https://dev-me.vivasam.com", "https://dev-mv.vivasam.com"];

            if (type === MOVE_TO_APP_ME) {
                dLinkUrlAssembled = hostD[0]+"/#"+`${pa}`+`${sp}`;
            }

            if (type === MOVE_TO_APP_MV) {
                dLinkUrlAssembled = hostD[1]+"/#"+`${pa}`+`${sp}`;
            }
        }
        return dLinkUrlAssembled;
    }catch (e) {
        //console.log(`makeDLinkPathAndSearch :: ${e}`);
        return dLinkUrlAssembled;
    }
};

/**
 * AOS Fallback Store URL For API
 */
export const aosFallbackTargetForAOS = (type) => {
  let AOS_HS = MS_HS_APP_STORE_URL.ANDROID_INTENT;
  let AOS_ES = ES_APP_STORE_URL.ANDROID_INTENT;
  let outFallback = '';
  if(isProdTarget()){
      if (type === MOVE_TO_APP_ME) {
          // AOS
          outFallback = AOS_ES;
      }

      if (type === MOVE_TO_APP_MV) {
          // AOS
          outFallback = AOS_HS;
      }
  }else{
      if (type === MOVE_TO_APP_ME) {
          // AOS
          outFallback = AOS_ES;
      }

      if (type === MOVE_TO_APP_MV) {
          // AOS
          outFallback = AOS_HS;
      }
  } 
  return outFallback;
};

/**
 * AOS / IOS 각 스토어 이동 혹은 앱으로 이동
 * 이거 하나로 한번에 처리한다.
 * @param type
 * @param targetP 플렛폼 타겟
 */
export const appStoreMoveForTarget = (targetGrade ,targetP) => {
    //console.log(`appStoreMoveForTarget :: ${targetGrade} ${targetP}`);
    let AOS_HS = MS_HS_APP_STORE_URL.ANDROID_INTENT;
    let IOS_HS = MS_HS_APP_STORE_URL.IOS;
    let AOS_ES = ES_APP_STORE_URL.ANDROID_INTENT;
    let IOS_ES = ES_APP_STORE_URL.IOS;

    if(targetGrade === MOVE_TO_APP_MV) {
        if (targetP === AOS_BR_TYPE) {
            if (window.confirm("비바샘 앱에서만 이용 가능합니다. 앱으로 이동합니다.\n설치가 되어있지 않은경우 스토어로 이동합니다.")) {
                document.location.href = AOS_HS;
            }
        }

        if (targetP === IOS_BR_TYPE) {
            let b = new Date();
            setTimeout(function () {
                if (new Date() - b < 2000) {
                    if (window.confirm('앱 설치후 이용이 가능합니다. 앱스토어로 이동하시겠습니까?\n설치가 되어있지 않은경우 스토어로 이동합니다.')) {
                        document.location.href = IOS_HS;
                    }
                }
            }, 1500);
            document.location.href = "mvvivasammobile://";
        }
    }

    if(targetGrade === MOVE_TO_APP_ME){
        if (targetP === AOS_BR_TYPE) {
            if (window.confirm("비바샘 앱에서만 이용 가능합니다. 앱으로 이동합니다.\n설치가 되어있지 않은경우 스토어로 이동합니다.")) {
                document.location.href = AOS_ES;
            }
        }

        if (targetP === IOS_BR_TYPE) {
            let b = new Date();
            setTimeout(function () {
                if (new Date() - b < 2000) {
                    if (window.confirm('앱 설치후 이용이 가능합니다. 앱스토어로 이동하시겠습니까?\n설치가 되어있지 않은경우 스토어로 이동합니다.')) {
                        document.location.href = IOS_ES;
                    }
                }
            }, 1500);
            document.location.href = "mevivasammobile://";
        }
    }
};

/**
 * URL Protocol
 * script:// 빈 프로토콜 허용 안함
 *
 * @param dangerousURL
 */
export const isSafeProtocol = (dangerousURL) => {
    try {
        // protocol 유형 체크 check Allow Only Https
        const url = new URL(dangerousURL);
        //console.log(`isSafeProtocol :: ${url.protocol} ${url.protocol === 'https:'}`);
        if (isProdTarget()) {
            if (url !== null) {
                if (url.protocol === 'https:') {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            if (url !== null) {
                if (url.protocol === 'https:' || url.protocol === 'http:') {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }catch (e) {
        // called at here when came up invalidate url
        //console.log(`${e}`);
        return false;
    }
};

/**
 * URL Pattern check
 */
export const urlTypeFilter = (url) => {
    try {
        if(isProdTarget()) {
            return isUrlTypePattern(url);
        }else{
            return isUrlTypePattern(url);
        }
    }catch (e) {
        //console.log(`urlTypeFilter :: ${e}`);
        return false;
    }
};

/**
 * dAPi Param Body 정보 조합
 * Create Req Body
 * @param infoD
 * @param histroy
 * @returns {{versionAos: (string), prefix: string, aosFallbackUrl: string, pkgName: (string), link: string, iosSerialId: (string), fdk: *}}
 */
export const reqDBody = (infoD, path ,history) => {
    // D Link Object
    let prefixForDomain = makeFBPrefixDomain(infoD.type, isProdTarget());
    let linkURL = makeDLinkPathAndSearch(infoD.type, path, infoD.searchP);
    let fallbackURL = aosFallbackTargetForAOS(infoD.type);
    let pkgName = infoD.type === MOVE_TO_APP_ME ? "com.visang.vivasam.esmobile" : "com.visang.vivasam.mobile";
    let versionAos = infoD.type === MOVE_TO_APP_ME ? "1211" : "1239";
    let iosSerialIds = infoD.type === MOVE_TO_APP_ME ? "1569142311" : "1445530612";
    let iosScreenUp = IOS_CHOOSE_SCREEN_UP === true ? 0 : 1;
    // create info tdLink
    let tdLinkObject = {
        prefix : prefixForDomain, // FB 생성된 Prefix Domain
        link : linkURL, // form 형식 <domain/path/searchQuery>
        pkgName : pkgName,
        versionAos : versionAos, // 중고 "1239" 초등
        iosSerialId : iosSerialIds,
        fdk : process.env.REACT_APP_FBS_KEY, // FDK
        aosFallbackUrl : fallbackURL, // AOS Fallback
        iosScreenUp: iosScreenUp
    };
    return tdLinkObject;
};

/**
 * API 본 Action 본체
 * @param tdObject
 * @param callOK
 * @param callFail
 * @returns {Promise<void>}
 */
export const reqDApiAction = async(tdObject , callOK, callFail) => {
    await getDLinkConverter(tdObject).then((r) => {
        let links = r.data.shortLink;
        //console.log(`Success ................. ${JSON.stringify(r.data)} ${links}`);
        callOK(links)
    }).catch((e) => {
        //console.log(`Success ................. ${JSON.stringify(e)}`);
        callFail();
    }).finally(() => {
        //console.log(`Activate on finally`);
        //callFail();
    });
};

/**
 * https / http 기본 패턴 검사식
 *
 * Product 일때는 https 만 허용한다.
 * Dev Local 일때는 http / https 모두 허용
 *
 * URL Pattern Check
 * @param url
 * @returns {boolean}
 */
export const isUrlsTypeCorrect = (url) => {
    return (isSafeProtocol(url) && urlTypeFilter(url));
};

/**
 * search Param 안에 이상한 변수 특수문자 검색후
 * 검출된 사항이 있으면 true 없으면 false
 * @param searchParams 전달된 Parameter
 * @returns {boolean}
 */
export const isExtraFilterFromSearchParams = (searchParams) => {
    try {
        //console.log(`isExtraFilterFromSearchParams (Total Parameter) :: ${searchParams}`);
        let urls = new URLSearchParams(searchParams);
        let valuesURL = [];
        let values = [];
        let keys = [];

        for (let [key, value] of urls.entries()) {
            //console.log(`isExtraFilterFromSearchParams (추출 Key / Value) :: ${key} ${value}`);
            if(isContainURLFormat(value) || isFindPathRegx(value)){
                valuesURL.push(value);
            }else{
                values.push(value);
            }
            keys.push(key);
        }

        // URL 분리 check
        let urlCheck = valuesURL.some((val) => {
            if (isFindScriptTag(val)
                || isFindHangul(val)
                || isNotRegularInnerSearchParams(val)) {
                //console.log(`isExtraFilterFromSearchParams URL Check :: ${val}`);
                return true
            }
            return false;
        });

        // 평문 분리 check
        let commonLetter = values.some((val) => {
            if (isFindScriptTag(val)
                || isFindHangul(val)
                || isFindRegxExtraLetter(false, val)) {
                //console.log(`isExtraFilterFromSearchParams Common Letter Check :: ${val}`);
                return true
            }
            return false;
        });

        // 각 Key 들 check
        let keysCheck = keys.some((val) => {
            if (isFindScriptTag(val)
                || isFindHangul(val)
                || isFindRegxExtraLetter(false, val)) {
                //console.log(`isExtraFilterFromSearchParams Keys Letter Check :: ${val}`);
                return true
            }
            return false;
        });

        //console.log(`isExtraFilterFromSearchParams check result :: ${urlCheck} ${commonLetter} ${keysCheck}`);
        let result =  (urlCheck || commonLetter || keysCheck) === true ? true : false;
        return result;

    }catch (e) {
        //console.log(`isExtraFilterFromSearchParams (예외발생) :: ${e}`);
        return false;
    }
};

/**
 * URL 로부터 정제된 Parameter 을 기준으로
 * 이상한 불법적인 문자열을 한번 더 체크한다.
 * @param valParam
 */
export const isNotRegularInnerSearchParams = (valParam) => {
    try {
        // 쿼리 스트링 기준으로 split
        let urlsSplit = valParam ? valParam.split('?')[1] : valParam;
        let urls = new URLSearchParams(urlsSplit);
        //console.log(`urlSearchTotal : ${urls}`);
        let result = false;
        for (let [key, value] of urls.entries()) {
            //console.log(`isNotRegularInnerSearchParams (추출 Key / Value) :: ${key} ${value}`);
            if (isFindRegxExtraLetter(false, value) || isFindScriptTag(value)
            ) {
                result = true;
                break;
            }
        }
        return result;
    }catch (e) {
        //console.log(`${e}`);
        return false;
    }
};

/**
 * 정규식으로 정상적인 URL Format 만 걸러낸다.
 * @param val
 * @returns {boolean}
 */
export const isContainURLFormat = (val) => {
    return urlTypeFilter(val);
};

// /**
//  * URL 안에 Path 안에 # 에 대한 부분
//  * Replace 예비함수
//  * 받은 값들중에 %23 이 있으면
//  * 어디까지나 예비일뿐
//  */
// export const sharpReplaceInUrl = (val) => {
//     let result = val && val.indexOf('%23') > -1 ? val.replace('%23', '#') : val;
//     console.log(`sharpReplaceInUrl :: ${result}`);
//     return result;
// };

// /**
//  * Script Start Tag and End Tag
//  * even check Script Tag Contents
//  * Case Condition
//  * html 변조 방지 filter
//  * 변조된 사항이 있으면 검출
//  * 가상 dom out 전
//  * Ref Dom 객체에 걸어놓은 상태에서
//  * 가져온다.
//  */
// export const isFilterBadHtmlBeforeRender = (propsInstance) => {
//     try {
//         // console.log(propsInstance);
//         let getParsedConvertHtmlStringObject = propsInstance._self.mRef.current.innerHTML;
//         console.log(`isFilterBadHtmlBeforeRender :: ${getParsedConvertHtmlStringObject}`);
//         if(getParsedConvertHtmlStringObject && isFindScriptTag(getParsedConvertHtmlStringObject)){
//             alert('잘못된 접근으로 페이지 로드 할 수 없습니다.');
//             return;
//         }
//         return propsInstance;
//     }catch (e) {
//         console.log(`isFilterBadHtmlBeforeRender exception : ${e}`);
//         return propsInstance;
//     }
// };

/**
 * 가상 dom out 후
 * Dom Node 정보 모두 가져와서
 * 해당 객체내에 값 전수 검사
 * 위변조 Node 검출 검색
 * get dom By Selectors
 */
export const isFilterBadHtmlAfterRender = (selectors) => {
    try {
        const outs = document.querySelectorAll(selectors);
        const stringInnerHtml = outs[0].innerHTML;
        //console.log(`isFilterBadHtmlAfterRender :: ${stringInnerHtml}`);
        if (stringInnerHtml && isFindScriptTag(stringInnerHtml)) {
            //console.log(stringInnerHtml);
            alert('잘못된 접근으로 페이지 로드 할 수 없습니다.')
            return;
        }
    }catch (e) {
        //console.log(`isFilterBadHtmlAfterRender exceptions :: ${e}`);
    }
};

/**
 * Number is Nan
 */
export const numberIsNan = (compareLetter) => {
    return Number.isNaN(compareLetter);
};

/**
 * URLSearchParams 으로부터 디코딩 처리된 사항의 검색 쿼리를 전달받는다.
 * 해당 가져온 값에서 type=d 의 값을 제거한후 재조립된 Search Query 를
 * 리턴한다. 물음표 포함
 */
export const replaceFromSplitFromSearchQuery = (searchP) => {
    try {
        if (searchP) {
            searchP = deleteExtraAllWhiteSpace(decodeURIComponent(String(searchP).toLowerCase()));
            let searchString = new URLSearchParams(searchP);
            let countAndOperation = searchString.size;
            let count = 1;
            let originStr = '';
            for (let [key, value] of searchString.entries()) {
                //console.log(`check All .. ${key} ${value} ${countAndOperation} ${count}`);
                key = key.trim();
                value = value.trim();
                if(count < countAndOperation && !isTypeDRight(key, value)){
                    originStr += `${key}=${value}&`;
                }else{
                    if(!isTypeDRight(key, value)) {
                        //console.log(`check 1.............`);
                        originStr += `${key}=${value}`;
                    }else{
                        //console.log(`check 2.............`);
                        if(isTypeDRight(key, value)){
                            originStr += '';
                        }
                    }
                }
                count++;
            }
            return `?${getLastLettersAndFindAfterRemove(originStr)}`;
        } else {
            // search query 가 없다.
            // console.log(`Search Query is None`);
            return '';
        }
    }catch (e) {
        //console.log(`replaceFromSplitFromSearchQuery : ${e}`);
        return '';
    }
};

// /**
//  * 순수 Query String 으로부터 전달받은 사항을 기준으로
//  * split 분리 했을때의 처리 => 예비
//  * @param searchP
//  */
// export const pureSearchStringSplit = (searchP) => {
//     if(searchP) {
//         let paramsObj = {};
//         let searchString = new String(searchP);
//         searchString.slice(1).split('&').forEach((item) => {
//             // divide from <key=value>
//             console.log(`Slice search Query split First After (pureSearchStringSplit) :: ${item}`);
//             let keyValues = item.split('=');
//             paramsObj[keyValues[0]] = keyValues[1];
//         });
//         console.log(`Make Dictionary From Search Query (pureSearchStringSplit) :: ${JSON.stringify(paramsObj)}`);
//     }else{
//         // search query 가 없다.
//         console.log(`Search Query is None (pureSearchStringSplit)`);
//     }
// };

/**
 * 정상 Path 인지 check
 * @param paths
 * @returns {boolean}
 */
export const isFindWrongPathCheckDone = (paths) => {
    try {
        if(paths !== '/') {
            if (isFindClearURLPathDetail(paths)) {
                let result = paths.split('/').slice(1).some((item) => {
                    //console.log(`isFindWrongPathCheckDone : ${item}`);
                    // 여기에서 추출한 문자열이 이상한 문자가 들어있거나 하면 false
                    if (isFindRegxExtraLetter(false, item) || isFindHangul(item)) {
                        return true;
                    }
                    return false;
                });
                return result === true ? true : false;
            } else {
                return true;
            }
        }else{
            return false;
        }
    }catch (e) {
        //console.log(`${e}`);
        return false;
    }
};

/**
 * 전체 문자열에서 마지막 문자가 & 일 경우 삭제합니다.
 * @param str
 * @returns {*}
 */
export const getLastLettersAndFindAfterRemove = (str) => {
    if(getLastWordFromStrByIndex(str) === '&'){
        return str.slice(0, -1);
    }
    return str;
};

/**
 * 전체 문자열에서 index 로 마지막 문자가져옵니다.
 * @param str
 * @returns {*}
 */
export const getLastWordFromStrByIndex = (str) => {
    return str[str.length - 1];
};

/**
 * 전체 문자열에서 charAt 로 마지막 문자가져옵니다.
 * @param str
 * @returns {string}
 */
export const getLastWordFromStrByChar = (str) => {
    return str.charAt(str.length - 1);
};

/**
 * key 와 Value 가 모두 true 이면 true 아니면 false
 * @param key
 * @param value
 * @returns {boolean}
 */
export const isTypeDRight = (key, value) => {
    return key === D_LINK_KEY && value === D_LINK_VALUE;
};

