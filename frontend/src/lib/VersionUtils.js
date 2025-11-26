import {isAndroid, isIOS} from "react-device-detect";
import * as api from 'lib/api';
import * as common from 'lib/common';
import {
    MS_HS_APP_STORE_URL,
    IOS_VERSION_CURRENT,
    ANDROID_VERSION_CURRENT,
    IOS_OS_TARGET_VERSION,
    IOS_INSPECTOR_VERSION,
    ANDROID_INSPECTOR_VERSION,
    ANDROID_MV_FB_DYN_LINKS_ENABLE_VERSION, IOS_FB_DYN_LINKS_ENABLE_VERSION
} from "../constants";

/**
 * 조건 구분을 플렛폼 별로 나누었다. 안그러면 헷갈린다.
 * MainPage 에서 Version Check
 */
export const check = () => {
    window.webViewBridge.send('getVersion', '', function (res) {
        // 설치버전이 크거나 같으면 무시 IOS 이든 Android 이든 하나만 조건 성립해도 걸림
        // 어차피 한번에 하나의 플렛폼만 인식할것임으로
        // IOS 일떄
        if (isIOS) {
            //console.log('=====IOS=====');
            if (common.isVersionUpdate(res.value, IOS_VERSION_CURRENT)) {
                //console.log('=====IOS Need Update Yes=====');
                if (window.confirm('새로운 버전이 업데이트되었어요!\n\n\n\n지금 업데이트하고\n\n편리해진 비바샘을 만나보세요.')) {
                    let data = {value: MS_HS_APP_STORE_URL.IOS};
                    return new Promise(function (resolve, reject) {
                        window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                            resolve(retVal);
                        }, (err) => {
                            reject(err);
                        });
                    });
                } else {
                    // 취소를 누른 경우, 강제 업데이트 일경우는 앱 종료
                }
            } else {
                // Do Nothing
            }
        }

        // Android 일때
        if (isAndroid) {
            //console.log('=====Android=====');
            if (common.isVersionUpdate(res.value, ANDROID_VERSION_CURRENT)) {
                //console.log('=====Android Need Update Yes=====');
                if (window.confirm('새로운 버전이 업데이트되었어요!\n\n\n\n지금 업데이트하고\n\n편리해진 비바샘을 만나보세요.')) {
                    document.location.href = MS_HS_APP_STORE_URL.ANDROID_INTENT;
                } else {
                    // 취소를 누른 경우, 강제 업데이트 일경우는 앱 종료
                }
            } else {
                // Do Nothing
            }
        }

    }, function (err) {
        //console.log(err);
    });
}

/**
 * API 서버쪽으로 요청해서 버젼 정보를 JSON 으로 전달받음
 * @returns {Promise<null|*>}
 */
export const getLatestAppVersion = async () => {
    if (isIOS) {
        const response = await api.getLatestAppVersion('IOS')
        return response.data;
    } else if (isAndroid) {
        const response = await api.getLatestAppVersion('ANDROID');
        return response.data;
    }
    return null;
}

/**
 * LoginForm / JoinSelect 에서 Version Check
 *
 * @param object JSON 정보를 만들기 위한 JSON Dictionary Object
 * @param isCommon isCommon => true (Android / IOS 공통 분기) false (IOS 만)
 * @param callbackSuccess Version 업 공지가 따로 필요 없고 그대로 SNS 로그인 프로세스를 진행할때 CallBack
 * @param callbackAlert Version 업 공지 필요할 경우 CallBack
 */
export const checkPlatformVersion = (object, isCommon, callbackSuccess, callbackAlert) => {
    window.webViewBridge.send('getVersion', '', function (res) {
        if (isCommon) {
            if (isIOS) {
                if (!common.isVersionUpdate(res.value, IOS_VERSION_CURRENT)) {
                    window.webViewBridge.send('snsLogin', object, (retVal) => {
                        callbackSuccess(retVal);
                    }, (err) => {
                        alert("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
                    });
                } else {
                    callbackAlert();
                }
            }

            if (isAndroid) {
                if (!common.isVersionUpdate(res.value, ANDROID_VERSION_CURRENT)) {
                    window.webViewBridge.send('snsLogin', object, (retVal) => {
                        callbackSuccess(retVal);
                    }, (err) => {
                        alert("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
                    });
                } else {
                    callbackAlert();
                }
            }

        } else {
            // 설치버전이 크거나 같으면 무시
            if (isIOS && !common.isVersionUpdate(res.value, IOS_VERSION_CURRENT)) {
                window.webViewBridge.send('snsLogin', object, (retVal) => {
                    callbackSuccess(retVal);
                }, (err) => {
                    alert("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
                });
            } else {
                callbackAlert();
            }
        }
    }, function (err) {
        //console.log(err);
    });
}

/**
 * IOS 기존 애플 로그인 긴급건이라는데 여하튼
 *
 * @param callbackAppleLoginState
 */
export const checkOSVersionOnMountForIOS = (callbackAppleLoginState) => {
    if (isIOS) {
        window.webViewBridge.send('getVersion', '', function (res) {
            // 설치버전이 크거나 같으면 무시
            if (isIOS && !common.isVersionUpdate(res.value, IOS_VERSION_CURRENT)) {
                window.webViewBridge.send('getOSVersion', null, (retVal) => {
                    if (retVal.value >= IOS_OS_TARGET_VERSION) {
                        callbackAppleLoginState();
                    }
                }, (err) => {
                });
            }
        });
    }
}

/**
 * 나의 정보 수정을 위한 SNS 로그인 접속
 * @param object
 * @param isCommon
 */
export const accessSnsLoginForMyInfoEdit = (object, isCommon, callbackSuccess) => {
    if (isCommon) {
        if (isIOS || isAndroid) {
            window.webViewBridge.send('snsLogin', object, (retVal) => {
                callbackSuccess(retVal);
            }, (err) => {
                alert("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            });
        } else {
            alert('SNS 로그인은 비상앱에서만 가능합니다.')
        }
    } else {
        if (isIOS) {
            window.webViewBridge.send('snsLogin', object, (retVal) => {
                callbackSuccess(retVal);
            }, (err) => {
                alert("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
            });
        } else {
            alert('SNS 로그인은 비상앱에서만 가능합니다.')
        }
    }
}

/**
 * IOS 심사떄문에 기존에 옛날 버젼은 그대로 유지하면서
 *
 * 앱이 최신 버젼일 경우 여기서 최신 버젼이란 앞으로 나갈 아직 배포되지 않은 버젼을 언급한다.
 *
 * IOS 심사시에는 최신 버젼을 가지고 심사하기에 이런 아주 번거로운 작업을 발생시켰다.
 *
 * 현재 함수로 UI 노출 / 비노출에 대상은 웨일 로그인 이미지가 노출되는 곳 + 나의 정보 수정 SNS 링크 연동 일체
 *
 * 회원가입 => SNS 로 가입하기 하단 이미지
 *
 * 로그인 기본 창 => SNS 하단 이미지
 *
 * 개인 정보 수정 => SNS 연동 링크
 *
 *
 * @param callNotShow 안보인다.
 * @param callShow 보인다.
 */
export const checkVersionForUI = (callNotShow, callShow) => {
    // 실제 적용될 버젼 => 실제 단말상에서 버젼을 체크하는 경우
    window.webViewBridge.send('getVersion', '', function (res) {
        if (isIOS) {
            if (!common.isVersionUpdate(res.value, IOS_INSPECTOR_VERSION)) {
                callShow();
            } else {
                callNotShow();
            }
        }

        if (isAndroid) {
            if (!common.isVersionUpdate(res.value, ANDROID_INSPECTOR_VERSION)) {
                callShow();
            } else {
                callNotShow();
            }
        }
    }, function (err) {
        // 에러가 발생시 일단은 비노출
        callNotShow();
    });
}

export const checkOnlyAOS = (isUseAOS, callY) => {
    if(isUseAOS) {
        window.webViewBridge.send('getVersion', '',  (res) => {
            if (!common.isVersionUpdate(res.value, ANDROID_MV_FB_DYN_LINKS_ENABLE_VERSION)) {
                callY();
            }
        }, (err) => {
            //console.log(err);
            //console.log('--- get Version AOS Exception ---');
        });
    }
}

/**
 * Promise 처리 방식
 * @returns {Promise<unknown>}
 */
export const dLinkEnableVersionForAOS = () => {
    return new Promise((resolve, reject) => {
        window.webViewBridge.send('getVersion', '', (res) => {
            if (!common.isVersionUpdate(res.value, ANDROID_MV_FB_DYN_LINKS_ENABLE_VERSION)) {
                resolve();
            }else{
                reject();
            }
        }, (err) => {
            // console.log(err);
            // console.log('--- get Version AOS Exception ---');
            reject();
        });
    });
}

export const dLinkEnableVersionForIOS = () => {
    return new Promise((resolve, reject) => {
        window.webViewBridge.send('getVersion', '', (res) => {
            if (!common.isVersionUpdate(res.value, IOS_FB_DYN_LINKS_ENABLE_VERSION)) {
                resolve();
            }else{
                reject();
            }
        }, (err) => {
            // console.log(err);
            // console.log('--- get Version AOS Exception ---');
            reject();
        });
    });
}