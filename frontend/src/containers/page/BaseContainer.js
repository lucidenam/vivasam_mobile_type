import React, {Component, Fragment} from 'react';
import {
    ACCESS_TOKEN, IS_ALL_DL_LETTERS_CONVERT_AS_LOWER,
    SESSION_LOGGED_KEY,
} from '../../constants';
import {Prompt} from 'react-router'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import isEmpty from 'lodash/isEmpty';
import * as common from 'lib/common';
import BaseLoading from 'components/common/BaseLoading';
import {Cookies} from 'react-cookie';
import moment from "moment";
import {debounce} from 'lodash';
import {
    historyInfo,
    initAppStateForDetectFromApps,
    isCompareWVAppsAll,
    setStateActionForApps
} from "../../lib/common";
import {withRouter} from "react-router-dom";
import {isAndroid, isIOS} from "react-device-detect";
import {dLinkEnableVersionForAOS, dLinkEnableVersionForIOS} from "../../lib/VersionUtils";
import {resetDLink, sendDLink} from "../../lib/DLinkUtil";
import {loadWithoutForWaiting, coverPageHolderAtLoadFirst} from "../../lib/CMovingUtils";
import {deleteExtraAllWhiteSpace} from "lib/common";

const cookies = new Cookies();

class BaseContainer extends Component {

    constructor(props) {
        const {BaseActions, MyclassActions} = props;

        //자동로그인 여부 세팅
        BaseActions.autoLogin(localStorage.getItem("autoLogin") === 'Y');

        //로그인 유지
        if (sessionStorage.getItem(SESSION_LOGGED_KEY) === "true" && !isEmpty(sessionStorage.getItem(ACCESS_TOKEN))) {
            if (common.validateAccessTokenExp(sessionStorage.getItem(ACCESS_TOKEN))) {
                BaseActions.tempLogin({
                    [ACCESS_TOKEN]: sessionStorage.getItem(ACCESS_TOKEN)
                });
                MyclassActions.myClassInfo();
            } else {
                BaseActions.logout();
            }
        }
        //로컬storage에 로그인 토큰이 있을 경우
        else if (!isEmpty(localStorage.getItem(ACCESS_TOKEN))) {
            if (common.validateAccessTokenExp(localStorage.getItem(ACCESS_TOKEN))) {
                BaseActions.tempLogin({
                    [ACCESS_TOKEN]: localStorage.getItem(ACCESS_TOKEN)
                });
                MyclassActions.myClassInfo();
            } else {
                BaseActions.logout();
            }
        }

        if (sessionStorage.getItem(SESSION_LOGGED_KEY) === "true") {
            BaseActions.checkLogin();
        }

        //데이터 네트워크 기본값 세팅
        const checkPmsDataNetwork = localStorage.getItem("checkPmsDataNetwork");
        if (!checkPmsDataNetwork) {
            localStorage.setItem("checkPmsDataNetwork", "false");
        }

        super(props);
        this.state = {
            isWebView: null,
            appGuideVisible: false
        };
        this.loadAfter = this.loadAfter.bind(this);
    }

    handleCloseAppGuide = e => {
        e.preventDefault();
        //만료시간 30분 쿠키 생성
        cookies.set("stopAppGuide", true, {
            expires: moment().add(30, 'minutes').toDate()
        });

        this.setState({
            appGuideVisible: false
        });
        document.body.classList.remove("fix");
    }

    handleSkipApp = e => {
        e.preventDefault();
        localStorage.setItem("skipApp", "Y");
        this.setState({
            appGuideVisible: false
        });
        document.body.classList.remove("fix");
    }


    checkAppGuide = () => {
        const {appGuideVisible} = this.state;
        //if(!appGuideVisible) {
        if (false) {
            const skipApp = localStorage.getItem("skipApp");
            const stopAppGuide = cookies.get("stopAppGuide");

            // 20190828 비공개 이벤트에 모바일 웹 -> 앱 전환 뱃지 이미지 안보이게 임시조치
            // 20191025 263,264 추가
            // 추후 수정 필요함
            if ((window.location.href === "https://mdev.vivasam.com/#/saemteo/event/view/258") ||
                (window.location.href === "https://m.vivasam.com/#/saemteo/event/view/258") ||
                (window.location.href === "https://mdev.vivasam.com/#/saemteo/event/view/263") ||
                (window.location.href === "https://m.vivasam.com/#/saemteo/event/view/263") ||
                (window.location.href === "https://mdev.vivasam.com/#/saemteo/event/view/264") ||
                (window.location.href === "https://m.vivasam.com/#/saemteo/event/view/264")
            ) {
                return true;
            }

            if (skipApp !== 'Y' && !stopAppGuide) {
                this.setState({
                    appGuideVisible: true,
                });

                return false;
            }
        }

        return true;
    }

    componentDidMount() {
        const {BaseActions, history} = this.props;
        // isWebView , isApp 값을 설정 (기존에 처리되던 부분 전면 새로 제작)
        // AOS / IOS Native App 에서 설정하는 비바샘 고유 User Agent 값을 기준으로 처리합니다.
        let isAppsState = initAppStateForDetectFromApps().isWebView;
        this.handleState(isAppsState).then(r => {
            // success catch
            // console.log(`Result (Success) :: ${r} ${isAppsState}`);
            if (r) {
                setStateActionForApps(BaseActions, isAppsState);
            }
        }).catch(error => {
            // console.log(`Result (Fail) :: ${error}`);
            this.setState({isWebView: isAppsState});
            setStateActionForApps(BaseActions, isAppsState);
        });

        //앱 UI 확인 용도
        //this.setState({isWebView: true});
        //BaseActions.pushValues({type:"isApp", object: true});
        //window.__isApp = true;
        this.checkWhenMountAtFirstForDynamicLinks(history);
        this.setAsyncHashChangeListen(BaseActions);
        this.setNonAsyncHistoryChangeListen(true, history);
        this.loadAfter();
        // window.addEventListener('load', this.loadAfter)
        window.document.addEventListener('appStateChanged', this.addListenerDetectFromApp, false);
    }

    componentWillUnmount() {
        try {
            this.reqResetDynamicUrl();
            // this.loadAfter = this.loadAfter.unbind(this);
            window.document.removeEventListener('appStateChanged', this.addListenerDetectFromApp, false);
            // window.removeEventListener('load', this.loadAfter)
        } catch (e) {

        }
    }

    /**
     * 좀더 확실한 값 설정을 위해서 async await promise 사용
     * @param data
     * @returns {Promise<unknown>}
     */
    handleState = async (data) => {
        return await this.updateState(data);
    };

    updateState = (payload) => {
        return new Promise((resolve, reject) => {
            this.setState({
                isWebView: payload
            }, () => {
                // console.log(`isPromiseCallBack : ${this.state.isWebView}`);
                // true 혹은 false 를 반환할때 Updated 되었다고 간주한다.
                if (this.state.isWebView || !this.state.isWebView) {
                    resolve('Updated');
                } else {
                    reject();
                }
            });
        });
    };

    /**
     * DynamicLinks 를 실행하기 위함
     *
     * 외부에서 전달된 URL SearchParam (type=d 를 인식함)
     *
     * @type {function(*=): void}
     */
    checkWhenMountAtFirstForDynamicLinks = ((history) => {
        if (!isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())) {
            let objs = historyInfo(history);
            coverPageHolderAtLoadFirst(objs, objs.searchParams);
        }
    });

    /**
     * Load 된 이후
     */
    loadAfter = (() => {
        //console.log('Load After Handle');
        this.reqDynamicLinksDirectionToApp();
    });

    /**
     * 비동기로 URL 변경 발생했을떄 Session Storage 값을 가지고 로그인
     *
     * 상태 여부 체크하는 부분 => (기존 히스토리 그대로 유지)
     *
     * @type {function(*): void}
     */
    setAsyncHashChangeListen = ((BaseActions) => {
        window.addEventListener("hashchange", debounce(async () => {
            if (sessionStorage.getItem(SESSION_LOGGED_KEY) === "true" && !window.__isApp) {
                //console.log("Checking Login Valid.....");
                await BaseActions.checkLogin();
            }
        }, 1000));
    });

    /**
     * 동기 실행이기 때문에 반드시 실행됩니다. (필수적으로 체크합니다.)
     * Url 이 변경되는 순간을 리슨해서 동작한다. 더 정확히 애기하면 Route 변경되는 순간
     *
     * @type {function(*=, *): void}
     */
    setNonAsyncHistoryChangeListen = ((isActivate, history) => {
        if (isActivate) {
            /**
             * Non Async (delay 없이 바로 출력해야 한다.)
             */
            history.listen((location, action) => {
                const host = location.hostname !== undefined && String(location.hostname).length > 0 ? location.hostname : window.location.hostname;
                const paths = location.pathname !== undefined && String(location.pathname).length > 0 ? location.pathname : window.location.pathname;
                // 로그인 => true 로그아웃 => null
                if (sessionStorage.getItem(SESSION_LOGGED_KEY) === "true" && !isEmpty(sessionStorage.getItem(ACCESS_TOKEN))) {
                    // 로그인
                    //console.log('---login---');
                    if (paths === '/login') {
                        // 기존에 history => Login 이 되었음에도 불구하고
                        // 로그인이 되어 지지 않는 화면으로 역으로 history 돌아왔을때
                        // 처리가 되어 지지 않아 로그인 화면으로 그대로 넘어가는 문제 동시 해결
                        history.replace('/');
                    }

                    if (paths === '/') {
                        this.reqDynamicLinksDirectionToApp();
                    }
                } else {
                    // 로그아웃시에도 메인으로 복귀
                    //console.log('---logout---');
                    if (paths === '/') {
                        this.reqDynamicLinksDirectionToApp();
                    }
                }
                //console.log(`hostname (Listen non async) : ${host}`);
                //console.log(`pathname (Listen non async) : ${paths}`);
                //console.log(`action (Listen non async) : ${action}`);
                loadWithoutForWaiting(history);
            });
        }
    });

    /**
     * 호출되는 시점
     *
     * 1. Dynamic URL 을 통해서 AOS / IOS 앱 에서 Open 될때
     * 즉 최초 load 될때
     *
     * 2. 로그인 상황에 따라 추가되는 처리
     *
     * WEB => Native APP
     *
     * @type {function(): void}
     */
    reqDynamicLinksDirectionToApp = (() => {
        // 최초 조건은 APP 에서 접근 했으면 (절대조건이다.)
        if (isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())) {
            if (isAndroid && common.isOnlyAOSWVMv(window.navigator.userAgent.toLowerCase())) {
                //console.log('Call Success Just For Android');
                dLinkEnableVersionForAOS().then(sendDLink).then(result => {
                    if(IS_ALL_DL_LETTERS_CONVERT_AS_LOWER) {
                        let evtPath = deleteExtraAllWhiteSpace(String(result).toLowerCase().trim());
                        //console.log(`Promise sendDynamicUrl called (URL EVT) (AOS) :: ${evtPath}`);
                        this.props.history.push(evtPath);
                    }else{
                        let evtPath = deleteExtraAllWhiteSpace(String(result).trim());
                        //console.log(`Promise sendDynamicUrl called (URL EVT) (AOS) :: ${evtPath}`);
                        this.props.history.push(evtPath);
                    }
                }).then(resetDLink).then(finalResult => {
                    //console.log('Promise reset Result :: ' + finalResult);
                }).catch(err => {
                    //console.log('Promise Err');
                });
            }

            if (isIOS && common.isOnlyIOSWVMv(window.navigator.userAgent.toLowerCase())) {
                dLinkEnableVersionForIOS().then(sendDLink).then(result => {
                    if(IS_ALL_DL_LETTERS_CONVERT_AS_LOWER) {
                        let evtPath = deleteExtraAllWhiteSpace(String(result).toLowerCase().trim());
                        //console.log(`Promise sendDynamicUrl called (URL EVT) (IOS) :: ${evtPath}`);
                        this.props.history.push(evtPath);
                    }else{
                        let evtPath = deleteExtraAllWhiteSpace(String(result).trim());
                        //console.log(`Promise sendDynamicUrl called (URL EVT) (IOS) :: ${evtPath}`);
                        this.props.history.push(evtPath);
                    }
                }).then(resetDLink).then(finalResult => {
                    //console.log('Promise reset Result (IOS) :: ' + finalResult);
                }).catch(err => {
                    //console.log('Promise Err (IOS)');
                });
            }
        }
    })

    /**
     * Native App 에서 호출할 Event 를 Web 에서 Listen 함
     *
     * App 에서만 동작함
     *
     * @type {function()}
     */
    addListenerDetectFromApp = ((e) => {
        try {
            if (isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())) {
                if (isAndroid && common.isOnlyAOSWVMv(window.navigator.userAgent.toLowerCase())) {
                    dLinkEnableVersionForAOS().then(() => {
                        return new Promise((resolve, reject) => {
                            if (e.detail.event === 'AppDUrl') {
                                //let obj = JSON.stringify(e.detail);
                                //let argsObj = JSON.stringify(e.detail.args);
                                //console.log(`Detect From Event Check ${obj} ${argsObj}`);
                                if (e.detail) {
                                    let urlsPath = e.detail.args.DynamicUrl;
                                    //console.log(`URLS Path (Before) :: ${urlsPath}`);
                                    if (urlsPath) {
                                        //console.log(`URLS Path (After) :: ${urlsPath}`);
                                        this.props.history.push(urlsPath);
                                        resolve(urlsPath);
                                    } else {
                                        reject();
                                    }
                                }
                            } else {
                                reject();
                            }
                        });
                    }).then(resetDLink).then(finalResult => {
                        //console.log('Promise reset Result :: ' + finalResult);
                    }).catch(err => {
                        //console.log('Promise Exception');
                    })
                }
            }
        } catch (e) {
            //console.log(`Exception ${e.message.toString()}`);
        }
    });

    /**
     * APP 내에서만 동작
     *
     * DynamicURL 을 reset 하는 시점
     *
     * @type {function(): void}
     */
    reqResetDynamicUrl = (() => {
        if (isCompareWVAppsAll(window.navigator.userAgent.toLowerCase())) {
            if (isAndroid && common.isOnlyAOSWVMv(window.navigator.userAgent.toLowerCase())) {
                dLinkEnableVersionForAOS().then(resetDLink).then((res) => {
                    if (res) {
                        console.log('reqResetDynamicUrl DLink Success (AOS) :: ' + res);
                    }
                }).catch(err => {
                    console.log(`reqResetDynamicUrl Error While calling`);
                });
            }

            if (isIOS && common.isOnlyIOSWVMv(window.navigator.userAgent.toLowerCase())) {
                dLinkEnableVersionForIOS().then(resetDLink).then((res) => {
                    if (res) {
                        console.log('reqResetDynamicUrl DLink Success (IOS) :: ' + res);
                    }
                }).catch(err => {
                    console.log(`reqResetDynamicUrl Error While calling`);
                });
            }
        }
    });

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.isWebView === false) {
            return this.checkAppGuide(nextState);
        }
        return true;
    }

    componentDidUpdate() {
        const {appGuideVisible} = this.state;
        if (appGuideVisible) {
            document.body.classList.add("fix");
        } else {
            document.body.classList.remove("fix");
        }
    }

    render() {
        if (this.state.isWebView === null) {
            return (
                <Fragment>
                </Fragment>
            )
        } else {
            const {popupVisible, viwerVisible, returnUrl, isLoading, loadingType, BaseActions} = this.props;
            const {isWebView, appGuideVisible} = this.state;
            let url = returnUrl ? "|returnUrl=true" : '';
            if (sessionStorage.getItem(SESSION_LOGGED_KEY) === "true") {
                BaseActions.checkLogin();
            }

            return (

                <div>
                    {/* 전역적으로 사용되는 컴포넌트들이 있다면 여기서 렌더링합니다. */}
                    {/* 팝업 뷰어의 닫기 제어 */}
                    <Prompt
                        message={window.location.hash + "|popup=" + popupVisible.toString() + "|viewer=" + viwerVisible.toString() + url + "|scrollY=" + window.pageYOffset}
                    />
                    {/* 로딩 제어 */}
                    <BaseLoading isLoading={isLoading} loadingType={loadingType}/>
                    {/*앱 다운로드 안내 페이지*/}
                    {
                        appGuideVisible && (
                            <div className="app_guide" id="appGuide">
                                <div className="app_guide_box">
                                    <div className="app_guide_in">
                                        <h3 className="app_guide_tit">
                                            비바샘 앱으로 접속시<br/>
                                            <em>자료 업데이트와 이벤트 소식</em>을<br/>
                                            알림으로 받아볼 수 있어요!
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={common.goAppDownload}
                                            className="btn_view_app icon_appdown2">앱으로 편하게 보기
                                        </button>
                                        <button
                                            type="button"
                                            onClick={this.handleSkipApp}
                                            className="btn_view_web">그냥 모바일 웹에서 볼래요
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={this.handleCloseAppGuide}
                                        className="btn_close_type2">닫기
                                    </button>
                                </div>
                            </div>
                        )
                    }
                    {/*//앱 다운로드 안내 페이지*/}
                </div>
            )
        }
    }
}

export default connect(
    (state) => ({
        popupVisible: state.popup.get('visible'),
        viwerVisible: state.viewer.get('visible'),
        returnUrl: state.base.get('returnUrl'),
        loginInfo: state.base.get('loginInfo').toJS(),
        isLoading: state.base.get('isLoading'),
        loadingType: state.base.get('loadingType')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(BaseContainer));
