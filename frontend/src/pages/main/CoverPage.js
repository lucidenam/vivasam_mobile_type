import React, {Component, Fragment} from "react";
import {
    isCompareWVAppsAll,
    isMobileDeviceBrowserDetection,
    isFindSearchParamForD,
    historyInfoBase,
    checkXmlReq,
    historyCleanOptionWithHref, deleteExtraAllWhiteSpace

} from "../../lib/common";
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withRouter} from "react-router-dom";
import * as baseActions from "../../store/modules/base";
import {
    SIDE_MV,
    MOVE_TO_APP_ME,
    MOVE_TO_APP_MV,
    AOS_BR_TYPE,
    IOS_BR_TYPE,
    IS_DOUBLE_BUTTON_USE_ON_HS_COVER, MS_HS_APP_STORE_URL, ES_APP_STORE_URL
} from "../../constants";

import {
    needCookieAllowInHost
} from "../../lib/CookieControlUtil";
import 'css/Cover.css';
import * as dTypeActions from '../../store/modules/dinfo';
import {
    setTypeDConfig,
    appStoreMoveForTarget,
    reqDBody,
    isUrlsTypeCorrect,
    reqDApiAction,
    isExtraFilterFromSearchParams, isFilterBadHtmlAfterRender, isFindWrongPathCheckDone
} from '../../lib/CoverUtils';
import {accessDirectlyFrom, moveMobileWebRoutine} from '../../lib/CMovingUtils'
import {isIOS} from "react-device-detect";

/**
 * MV Cover Page Section
 *
 * Cover Page 사용분류
 *
 * 유형은 2 개
 *
 * Default Cover / Bridge
 *
 */
class CoverPage extends Component {

    constructor(props) {
        super(props);
        this.handleLoaded = this.handleLoaded.bind(this);
        this.state = {
            data: ``,
            type: `MV`,
            path: `/`,
            searchP: ``,
            isAppsState: false,
            description: ``,
            isTwoButtonActive: false
        }
    }

    componentDidMount() {
        //console.log(`..........componentDidMount.........`);
        this.handleLoaded();
        this.mRef = React.createRef();
    }

    componentWillUnmount() {
        //console.log(`..........componentWillUnmount.........`);
    }

    /**
     * When Loaded node On Dom
     * From createRef => type of instances is HTMLDivElement
     *
     */
    runAfterRender = () => {
        // console.log(`..........runAfterRender.........`);
        let domObj = this.mRef.current;
        if(domObj){
            // domObj Elements
            if(document.getElementById('bwpR')) {
                // console.log(`Dom node loaded complete All Done`);
                isFilterBadHtmlAfterRender('div.coverWrap');
                needCookieAllowInHost();
            }
        }
    }

    /**
     * 모바일웹으로 이동
     * */

    moveMvMobileMain = () => {
        this.props.history.push("/");
    }

    /**
     * Return JSX Html Node Type
     * @param htmType
     * @returns {string}
     */
    renderBeforeJSXHtml = (htmType = 'cover') => {
        let container = '';
        // isShowButtonOnlyHS true 이면 중고등 버튼만 출력 isShowButtonOnlyHS false 이면 두버튼 두개다 출력
        let isShowButtonOnlyHS = IS_DOUBLE_BUTTON_USE_ON_HS_COVER;
        let buttonContainer;
        if(isShowButtonOnlyHS) {
            buttonContainer = <div id="bwpR" className="btnWrap"><button className="btnAppV" onClick={this.btMoveHSAppStore}><span className="blind">중고등 APP 으로 이동</span></button>
                <button className="btnAppE" onClick={this.btMoveElAppStore}><span className="blind">초등 APP 으로 이동</span></button></div>;
        }else{
            buttonContainer = <div id="bwpR" className="btnWrap"><button className="btnAppV" onClick={this.btMoveHSAppStore}><span className="blind">중고등 APP 으로 이동</span></button></div>;
        }
        // let testC = 'default';

        switch (htmType) {
            case "test":
                // 작성된 함수들 테스트 구간 (TestUtilCover 참조)
                container = <div>
                    {/*<div>중고등 Cover Page</div>*/}
                    {/*<button onClick={this.btMoveHSAppStore}>중고등 APP 으로 이동</button>*/}
                    {/*<div></div>*/}
                    {/*<button onClick={this.btMoveElAppStore}>초등 APP 으로 이동</button>*/}
                    {/*<div></div>*/}
                    {/*<button onClick={this.btJustMobileWeb}>모바일 웹으로 보기 (유예기간 하루)</button>*/}
                    {/*<div></div>*/}
                    {/*<button onClick={this.btDeleteCookieAll}>중고등 Cover 관련 쿠키 모두 삭제 (임의 테스트 함수)</button>*/}
                    {/*<div></div>*/}
                    {/*<button onClick={this.btDeleteCookieTime}>중고등 Cover 관련 최근 접근 시간 기록 쿠키 삭제 (임의 테스트 함수)</button>*/}
                    {/*<div></div>*/}
                    {/*<button onClick={this.btDeleteCookieMobileWebSee}>중고등 Cover 관련 모바일 웹으로 관련 쿠키 삭제 (임의 테스트 함수)</button>*/}
                    {/*<div></div>*/}
                    {/*<a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://e.vivasam.com/problem/list')}>초등 문제은행 (참조*/}
                    {/*    견본 OUT)</a>*/}
                </div>;
                break;
            case 'cover':
                // 퍼블이 필요한 경우 현재의 루틴에서 작업
                container =
                    <div className="coverWrap">
                        <div className="coverTop">
                            <span className="label">비상교육 교과서 교수지원서비스</span>
                            <h1><img src='/images/common/logo_vivasam2_401x56.png' alt="비바샘"/></h1>
                            <p className="txt"><strong className="point_color_blue">비바샘 모바일 앱을 다운로드하여<br/>더 편리하게 이용하세요!</strong><br/><br/>이미
                                사용 중이시라면? 앱으로 연결됩니다.</p>
                            { buttonContainer }
                            <p className="txt2">비바샘 모바일은 앱에 최적화 되어 있어,<br/>모바일웹에서는 불편함이 발생할 수 있습니다.</p>
                            <div className="btnWrap">
                            <a className="btnPcE"
                                   onClick={this.moveMvMobileMain}>모바일웹으로 계속하기</a>
                            </div>
                        </div>
                    </div>;
                break;
            case 'bridge':
                // Bridge 화면? or direct 요청
                // 여기로 왔을때 History Replace 를 한다.
                // Bridge 화면은 특별한 일이 없지 않는한 사용하지 않는다.
                break;
        }
        return container;
    };

    render() {
       let container = this.renderBeforeJSXHtml();
        return (
            <div id="divCoRoot" ref={this.mRef} onLoad={this.runAfterRender}>
                {container}
            </div>
        );
    }

    /**
     * 중고등이 좌측으로
     *
     * @param e
     */
    btMoveHSAppStore = (e) => {
        //console.log('======btMoveHSAppStore click=====');
        e.preventDefault();
        try {
            // 버튼 클릭시 intent URL 연결
            if (isIOS) {
                //window.location.href = MS_HS_APP_STORE_URL.IOS;
                //window.location.href = MS_HS_APP_STORE_URL.IOS;
                var b = new Date();
                setTimeout(function () {
                    if (new Date() - b < 2000) {
                        if(window.confirm('앱 설치후 이용이 가능합니다. 앱스토어로 이동하시겠습니까?')) {
                            window.location.href = MS_HS_APP_STORE_URL.IOS;
                        }
                    }
                }, 1500);
                document.location.href = "vivasammobile://intro";
            } else {
                window.location.href = MS_HS_APP_STORE_URL.ANDROID_INTENT;
            }
            /*const {DTypeActions, infoD} = this.declarePropsState();

            let isAPPState = this.state.isAppsState;
            const isApps = isCompareWVAppsAll(window.navigator.userAgent.toLowerCase());

            if (!isAPPState || !isApps) {
                let res = isMobileDeviceBrowserDetection();
                let paths = this.state.path;
                let search = this.state.searchP;
                let targets = MOVE_TO_APP_MV;
                //console.log(`isApp State :: ${isAPPState} ${res.isMobileBR} ${res.type} ${paths} ${search} ${targets}`);
                if (res.isMobileBR) {
                    let objs = historyInfoBase(this.props.history);
                    let hosts = objs.mHost;
                    //console.log(`btMoveHSAppStore : ${JSON.stringify(objs)}`);
                    // search Param (SearchP) 기준으로 type d <Deep Link Url 인지 판별>
                    if(isFindSearchParamForD(search)) {
                        if(paths !== undefined && paths !== null && paths.length > 0) {
                            this.actionRequestDByButtonEvent(search, targets, paths, res, infoD, DTypeActions);
                        }else{
                            appStoreMoveForTarget(targets, res.type);
                        }
                    }else{
                        // Deep Link 아니고 그냥 일반 URL
                        // console.log(`isMobile Browser`);
                        appStoreMoveForTarget(targets, res.type);
                    }
                } else {
                    // console.log(`isPC Browser`);
                    // PC 브라우져상에서 접근 공통으로 멘트 노출 OS 상관없이
                    // PC 상에서는 APP 에 접근할 일이 없다.
                    alert("모바일 단말내 브라우져에서 사용이 가능합니다.");
                }
            }*/
        } catch (e) {

        }
    };

    /**
     * 초등이 우측으로
     * @param e
     */
    btMoveElAppStore = (e) => {
        //console.log('=====btMoveElAppStore====');
        e.preventDefault();
        //const {DTypeActions, infoD} = this.declarePropsState();
        try {
            // 버튼 클릭시 intent URL 연결
            if (isIOS) {
                //window.location.href = ES_APP_STORE_URL.IOS;
                var b = new Date();
                setTimeout(function () {
                    if (new Date() - b < 2000) {
                        if(window.confirm('앱 설치후 이용이 가능합니다. 앱스토어로 이동하시겠습니까?')) {
                            window.location.href = ES_APP_STORE_URL.IOS;
                        }
                    }
                }, 1500);
                document.location.href = "mevivasammobile://intro";
            } else {
                window.location.href = ES_APP_STORE_URL.ANDROID_INTENT;
            }
            /*let isAPPState = this.state.isAppsState;
            //console.log(`${JSON.stringify(this.state)}`);
            const isApps = isCompareWVAppsAll(window.navigator.userAgent.toLowerCase());

            if (!isAPPState || !isApps) {
                let res = isMobileDeviceBrowserDetection();
                let paths = this.state.path;
                let search = this.state.searchP;
                let targets = MOVE_TO_APP_ME;
                //console.log(`isApp State :: ${isAPPState} ${res.isMobileBR} ${res.type} ${paths} ${search} ${targets}`);
                if (res.isMobileBR) {
                    let objs = historyInfoBase(this.props.history);
                    let hosts = objs.mHost;
                    //console.log(`${JSON.stringify(objs)}`);
                    if(isFindSearchParamForD(search)){
                        if(paths !== undefined && paths !== null && paths.length > 0) {
                            //console.log(`isMobile Deep Link On CoverPage Click ME`);
                            this.actionRequestDByButtonEvent(search, targets, paths, res, infoD, DTypeActions);
                        }else{
                            appStoreMoveForTarget(targets, res.type);
                        }
                    }else {
                        //console.log(`isMobile Browser`);
                        appStoreMoveForTarget(targets, res.type);
                    }
                } else {
                    //console.log(`isPC Browser`);
                    // PC 브라우져상에서 접근 공통으로 멘트 노출 OS 상관없이
                    // PC 상에서는 APP 에 접근할 일이 없다.
                    alert("모바일 단말내 브라우져에서 사용이 가능합니다.");
                }
            }*/
        } catch (e) {
            //console.log(`ES Exception :: ${e}`);
        }
    };

    /**
     * 그냥 모바일 웹으로 볼게요....
     * 상황별 케이스로 분기하는 이유는
     * 각 상황에 대하여 대비하기 위함
     * @param e
     */
    btJustMobileWeb = (e) => {
        e.preventDefault();
        try {
            // get saved Data when Init
            let isAPPState = this.state.isAppsState;
            let type = this.state.type;
            let path = this.state.path;
            let search = this.state.searchP;
            //console.log(`Saved Data :: ${isAPPState} ${type} ${path} ${search}`);
            let res = isMobileDeviceBrowserDetection();
            //console.log(`isApp State :: ${isAPPState} ${res.isMobileBR} ${res.type} `);
            const isApps = isCompareWVAppsAll(window.navigator.userAgent.toLowerCase());
            if (!isAPPState || !isApps) {
                if (res.isMobileBR) {
                    // Mobile Browser
                    //console.log(`Mobile Browser :: ${isAPPState} ${res.isMobileBR} ${res.type}`);
                    if (res.type === AOS_BR_TYPE) {
                        // AOS => alert 을 띄우고 confirm check
                        //console.log(`Mobile Browser (AOS) :: ${isAPPState} ${type} ${path}`);
                        if (window.confirm("웹에서 사용시 일부 동작이 제한됩니다.")) {
                            moveMobileWebRoutine(path, search ,this.props.history);
                        }
                    }

                    if (res.type === IOS_BR_TYPE) {
                        // IOS => alert 을 띄우고 confirm check
                        //console.log(`Mobile Browser (IOS) :: ${isAPPState} ${type} ${path}`);
                        if (window.confirm("웹에서 사용시 일부 동작이 제한됩니다.")) {
                            moveMobileWebRoutine(path, search, this.props.history);
                        }
                    }
                } else {
                    // PC => alert 을 띄우고 confirm check
                    //console.log(`PC Browser :: ${isAPPState} ${res.isMobileBR} ${res.type}`);
                    if (window.confirm("웹에서 사용시 일부 동작이 제한됩니다.")) {
                        moveMobileWebRoutine(path, search ,this.props.history);
                    }
                }
            }
        } catch (e) {

        }
    }

    handleLoaded = (() => {
        try {
            const {location} = this.props;
            this.setTargetLocation(location, true);
        } catch (e) {
            //console.log(`Cover Target Exception MV (directly using cover path) : ${e}`);
            const {location} = this.props;
            this.setTargetLocation(location, false);
        }
    });

    /**
     * Location 상황에 따라 설정값 상이함 <참조>
     * @param location
     * @param isUseState
     */
    setTargetLocation = (location, isUseState) => {
        // 전달된 전체 데이터
        //console.log(`setTargetLocation : ${JSON.stringify(location)}`)
        const isApps = isCompareWVAppsAll(window.navigator.userAgent.toLowerCase());
        if(isUseState) {
            let targets = location.state;
            // 최초 모바일 브라우저로 접근시 (기본 접근)
            let typeNM = !targets.type ? "MV" : targets.type;
            let pathNM = !targets.path ? "/" : targets.path;
            let searchNM = !targets.searchP ? "" : targets.searchP;
            //console.log(`Handle Loaded on CoverPage Normal : ${typeNM} ${pathNM} ${searchNM}`);
            this.setState({isAppsState: isApps, type: typeNM, path: pathNM, searchP: searchNM});
            let stateObj = {isAPPState: this.state.isAppsState, type: this.state.type, path: this.state.path};
            accessDirectlyFrom(false, typeNM, this.props.history, stateObj);
        }else{
            // Cover 가 이미 떠있는 상태에서 URL 임의 강제로 변경하고 들어올때 / 혹은 직접 접근하여 건너뛸때
            let pathNM = !location.pathname || location.pathname === '/cover' ? '/' : location.pathname;
            let searchNM = !location.search ? '' : location.search;
            //console.log(`Handle Loaded on CoverPage Catch Exp : ${pathNM} ${searchNM}`);
            this.setState({isAppsState: isApps, type: SIDE_MV, path: pathNM, searchP: searchNM});
            let stateObj = {isAPPState: this.state.isAppsState, type: this.state.type, path: this.state.path};
            accessDirectlyFrom(true, SIDE_MV, this.props.history, stateObj);
        }
    }

    /**
     * Dynamic Link API 요청 부 분리
     * @param search
     * @param targets
     * @param paths
     * @param res
     * @param infoD
     * @param DTypeActions
     */
    actionRequestDByButtonEvent = (search, targets, paths, res, infoD, DTypeActions) => {
        //console.log(`actionRequestDByButtonEvent :: ${search}\n${targets}\n${paths}\n${JSON.stringify(res)}\n${JSON.stringify(infoD)}`);
        if(res.type === AOS_BR_TYPE){

            setTypeDConfig(DTypeActions, infoD, {targets : targets
                , paths: paths
                , search: search
                , type: res.type
                , pathCurrent: '/cover'
                , fromWhere: 'AOS_WBR'
            });

            if(window.confirm('앱으로 이동하시겠습니까?\n선택이후 잠시후 앱으로 이동됩니다.')) {
                //console.log(`activeDL : ${targets} ' | ' ${paths}`);
                this.reqAsyncDApiConverter(paths);
            }
        }

        if(res.type === IOS_BR_TYPE){
            setTypeDConfig(DTypeActions, infoD, {targets : targets
                , paths: paths
                , search: search
                , type: res.type
                , pathCurrent: '/cover'
                , fromWhere: 'IOS_WBR'
            });

            if(window.confirm('앱으로 이동하시겠습니까?\n선택이후 잠시후 앱 이동 선택화면으로 이동됩니다.')) {
                //console.log(`activeDL : ${targets} ' | ' ${paths}`);
                this.reqAsyncDApiConverter(paths);
            }
        }
    };

    /**
     * API 요청 전 Info 생성 각 정보 데이터 검사 이후 최종 요청
     * 응답값 기준으로 load
     *
     * @param type
     * @param BaseActions
     * @returns {Promise<void>}
     */
    reqAsyncDApiConverter = (path) => {
        const {infoD, BaseActions} = this.declarePropsState(); // Target 방향
        try {
            let refHistory = this.props.history;
            //console.log(`reqAsyncDApiConverter :: ${JSON.stringify(infoD)} ${isProd(refHistory)}`);
            path = deleteExtraAllWhiteSpace(decodeURIComponent(path));
            if(!isFindWrongPathCheckDone(path)) {
                // infoD 안에 있는 SearchParam 모두 확인해서 들어가지 말아야 할 사항들 모두 체크하여
                // 그 조건언에 하나라도 있으면 False 로 처리한다. 여기서 막아야 한다.
                let tdLinkObject = reqDBody(infoD, path, refHistory);
                //console.log(`reqAsyncDApiConverter (요청 전 Body Info 확인) :: ${JSON.stringify(tdLinkObject)}}`);
                if (isUrlsTypeCorrect(tdLinkObject.link)) {
                    //console.log(`URL Pattern Check PASS .................`);
                    let isCheck = isExtraFilterFromSearchParams(infoD.searchP);
                    //console.log(`isExtraFilterFromSearchParams Last Result : ${isCheck}`);
                    if (isCheck) {
                        BaseActions.closeLoading();
                        alert(`잘못된 주소 입니다.\n확인 후 다시 이용 바랍니다.\n감사합니다.`);
                    } else {
                        BaseActions.openLoading();
                        reqDApiAction(tdLinkObject, (links) => {
                            checkXmlReq(links, () => {
                                //console.log(`urls is Check Success you may do act Next :: ${links}`);
                                historyCleanOptionWithHref(links, true);
                                BaseActions.closeLoading();
                            });
                        }, () => {
                            BaseActions.closeLoading();
                        });
                    }
                } else {
                    BaseActions.closeLoading();
                    //console.log(`URL Pattern Check NOT PASS .................`);
                    alert(`잘못된 주소 입니다.\n확인 후 다시 이용 바랍니다.감사합니다.`);
                }
            }else{
                alert(`잘못된 주소 입니다.\n확인 후 다시 이용 바랍니다.감사합니다.`);
            }
        }catch (e) {
            //console.log(`${e}`);
            BaseActions.closeLoading();
        }
    };

    /**
     * Props For Read Only at current point
     * @returns {Readonly<{children?: React.ReactNode}> & Readonly<P>}
     */
    declarePropsState = () => {
        //console.log(`CoverPage (State) :: `);
        return this.props;
    };
}

export default connect(
    (state) => ({
        infoD: state.dinfo.get('infoD').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        DTypeActions: bindActionCreators(dTypeActions, dispatch)
    })
)((withRouter(CoverPage)));