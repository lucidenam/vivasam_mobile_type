import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as myclassActions from 'store/modules/myclass';
import * as common from 'lib/common';
import {isCommonWVAppsMv} from 'lib/common';
import isEmpty from 'lodash/isEmpty';
import {MarketingAgreeInfoPopup, MarketingAgreeSelectPopup} from 'containers/login';
import moment from 'moment';
import {Cookies} from 'react-cookie';
import * as api from 'lib/api';
import {setPushAlarms} from 'lib/api';
import {NeedUpdateMemberInfoPopup} from '.';
import {isAndroid, isIOS} from "react-device-detect";
import * as joinActions from "../../store/modules/join";
import {MS_HS_APP_STORE_URL} from '../../constants';
import {checkOSVersionOnMountForIOS, checkPlatformVersion, checkVersionForUI} from '../../lib/VersionUtils';
import crypto from 'crypto';
import PasswordPopupContainer from "./PasswordPopupContainer";
import PasswordChangePopupContainer from "./PasswordChangePopupContainer";
import $ from "jquery";
import {isProd} from "../../lib/TargetingUtils";

const cookies = new Cookies();
class LoginForm extends Component {

    state = {
        username: '',
        password: '',
        idSaveCheck: false,
        logging: false,
        isAppleLogin : false,
        isValid : true,
        isShowWhale: false,
        hash : '',
        changeCnt: 1,
        pwLength: 0,
        passStatus: 'PASS',
        retCnt: 0
    }

    constructor(props) {
        super(props);
        const {logged, history, JoinActions} = this.props;
        if(logged)   {
            JoinActions.defaultStore();
            history.push('/');
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleChecked = (e) => {
        if(e.target.name === 'autoLogin') {
            localStorage.setItem("autoLogin", e.target.checked ? "Y" : "N");

            const {BaseActions} = this.props;
            BaseActions.autoLogin(e.target.checked);
        }else {
            if(this._isMounted) {
                this.setState({
                    [e.target.name]: e.target.checked
                });
            }
        }
    }

    handleClick = (e) => {
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '클릭 로그인 버튼', {
            'parameter': '사용자'
        });
        if(e) e.preventDefault();
        const {username, password, hash} = this.state;

        if(username === null || username === '') {
            common.error('아이디를 입력하세요.');
            return;
        }
        if(password === null || password === '') {
            common.error('비밀번호를 입력하세요.');
            return;
        }

        // 일반로그인일때 sns세션 삭제
        sessionStorage.removeItem('snsObject');

        // 구글 reCAPTCHA 인증 후 로그인 로직
        this.reCapt(username,password);
//        this.handleLogin(username, password);
    }

    reCapt = async (username, password) => {
        const handleLogin = this.handleLogin;
        let response = await api.checkRetCnt(username,password);

        if (response.data.code === 'SUCCESS' && response.data.retCnt < 5) {
            if (isProd()) {
                $.getScript("https://www.google.com/recaptcha/api.js?render=6Ldh3EUrAAAAAJ3A62QdUy5nEgmnKQ8IjqFvXAZv").done(function () {
                    return new Promise((resolve, reject) => {
                        window.grecaptcha.ready(function() {
                            window.grecaptcha.execute('6Ldh3EUrAAAAAJ3A62QdUy5nEgmnKQ8IjqFvXAZv', {action: 'submit'}).then(function(token) {
                                api.verifyRecaptcha(token).then(function (response) {
                                    if (Number(response.data) > 0.5) {
                                        handleLogin(username,password);
                                    } else {
                                        alert('비정상적인 로그인 시도가 감지되었습니다. 로봇이 아닌 경우 비바샘 고객센터로 문의해주세요.')
                                        return false;
                                    }
                                })
                            });
                        }, (err) => {
                            console.log(err)
                            alert('비정상적인 로그인 시도가 감지되었습니다. 로봇이 아닌 경우 비바샘 고객센터로 문의해주세요.')
                            return false;
                        });
                    });
                })
            } else {
                $.getScript("https://www.google.com/recaptcha/api.js?render=6LfW0IQrAAAAAIfRaLoTT6LqVxYXfdRPNii6qmPE").done(function () {
                    return new Promise((resolve, reject) => {
                        window.grecaptcha.ready(function() {
                            window.grecaptcha.execute('6LfW0IQrAAAAAIfRaLoTT6LqVxYXfdRPNii6qmPE', {action: 'submit'}).then(function(token) {
                                api.verifyRecaptcha(token).then(function (response) {
                                    if (Number(response.data) > 0.5) {
                                        handleLogin(username,password);
                                    } else {
                                        alert('비정상적인 로그인 시도가 감지되었습니다. 로봇이 아닌 경우 비바샘 고객센터로 문의해주세요.')
                                        return false;
                                    }
                                })
                            });
                        }, (err) => {
                            alert('비정상적인 로그인 시도가 감지되었습니다. 로봇이 아닌 경우 비바샘 고객센터로 문의해주세요.')
                            console.log(err)
                            return false;
                        });
                    });
                })
            }

        } else if (response.data.code === 'SUCCESS' && response.data.retCnt > 4) {
            return new Promise((resolve, reject) => {
                handleLogin(username, password);
            });
        } else {
            return new Promise((resolve, reject) => {
                handleLogin(username,password);
            });
        }
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            this.handleClick(e);
        }
    }

    handleLogin = async (username, password) => {
        const {BaseActions, PopupActions, history, location, returnUrl, isApp} = this.props;
        const { idSaveCheck } = this.state;
        let snsLoginParameter = JSON.parse(sessionStorage.getItem("snsObject"));

        try {
            BaseActions.openLoading({loadingType:"1"});
            if(this._isMounted) {
                this.setState({
                    logging: true
                });
            }

            if (snsLoginParameter == null) {
                let res = await api.loginPasswordCheck(username, password);
                $('#FAIL').hide();
                $('#INVALID').hide();
                if (res.data.status === 'INVALID' && Number(res.data.retCnt) < 5) {
                    if (Number(res.data.retCnt) < 1) {
                        $('#FAIL').show();
                        $('.pop_password').show();
                    } else {
                        $('#INVALID').show();
                        $('.pop_password').show();
                        document.getElementById('retLoginCnt').innerText = res.data.retCnt;
                    }
                    return;
                } else if (res.data.status === 'PASS' && Number(res.data.retCnt) < 1) {
                    $('#FAIL').show();
                    $('.pop_password').show();
                    return;
                } else {
                    this.setState({
                        passStatus: 'PASS'
                    })
                }
            }

            const response = snsLoginParameter == null ?
                await BaseActions.login(username, password) :
                await BaseActions.snsLogin(username, 'LOGINSNS', snsLoginParameter);
            this.setLoginSuccessCookie(username);
            let myClassInfo = await this.getMyClassInfo();
            let schoolName = myClassInfo.schoolName;

            // 고등기본수학 이벤트 셋팅
            let schoolLvlCd = myClassInfo.schoolLvlCd;
            let mainSubjectName = myClassInfo.mainSubjectName;
            const cookies = new Cookies();
            const popHighSchoolEvt = cookies.get("popHighSchoolEvt");

            //앱 최초 로그인시 온보딩에서 선택한 푸쉬설정정보로 DB저장
            const acceptAllPushs = localStorage.getItem("acceptAllPushs");
            if(isApp && acceptAllPushs) {
                setPushAlarms(acceptAllPushs, acceptAllPushs, acceptAllPushs, acceptAllPushs);
                localStorage.removeItem("acceptAllPushs");
            }

            if(idSaveCheck) {
                localStorage.setItem("savedId", username);
            }else {
                localStorage.removeItem("savedId");
            }

            if(this._isMounted) {
                this.setState({
                    username: '',
                    password: ''
                });
            }

            let redirectUrl = "/";
            if(location.state && location.state.prevPath) {
                redirectUrl = location.state.prevPath;
            } else if(returnUrl) {
                //초기화
                BaseActions.pushValues({type:"returnUrl", object:''});
                redirectUrl = returnUrl;
            }

            // 브이북용 모바일 세션 검증용 토큰 저장
            localStorage.setItem("exSsToken", response.data.token);

            if(response.data.first) {
                BaseActions.pushValues({type:"isFirst", object:response.data.first});
                PopupActions.openPopup({title:"마케팅 및 광고 활용 동의", componet:<MarketingAgreeInfoPopup handleClose={()=> {history.push(redirectUrl);}}/>, templateClassName: 'float_box'});
            }
            else if(!response.data.marketingAgree){
                // 마케팅 및 광고 활용 동의 기록이 없는 회원
                PopupActions.openPopup({title:"마케팅 활용 동의안내", componet:<MarketingAgreeSelectPopup handleClose={()=> {history.push(redirectUrl);}}/>, templateClassName: 'float_box'});
            }
            //통합회원 필수 정보 확인
            /*
            * 요청사항 [RMS-9282] :[개발] 회원 필수정보 입력 안내 팝업창 노출 로직 변경
            * SSO 인증여부와 상관없이 로그인시 팝업 처리 하도록 수정
            * 2022-02-28 김인수
            * memberRequiredChk 필수체크 N 일경우 팝업
            */
            else if (response.data.ssoMemberYN != "Y") {

                // 통합회원 전환 팝업
                const response = await api.checkAuthIPIN();
                if(response.data.IPIN_CHECK != 'NotAllowAuth'){
                    // 통합회원 팝업 중단으로 인하여 redirectUrl로 바로 이동하게 변경
                    // if(cookies.get("stopSsoGuideForOnce")) {
                    // 	cookies.remove("stopSsoGuideForOnce");
                    // }
                    history.push(redirectUrl);
                } else {
                    PopupActions.openPopup({
                        title: "회원정보 업데이트 안내",
                        componet: <NeedUpdateMemberInfoPopup handleClose={() => {
                            history.push(redirectUrl);
                        }}/>,
                        templateClassName: 'float_box'
                    });
                }
            }
            //교사 미인증
            else if (response.data.validYN != 'Y') {
                history.push("/login/require");
            }
            //교사 인증 만료
            else if (response.data.teacherCertifiedYN != 'Y') {
                history.push("/login/expired");
            }
            else {
                history.push(redirectUrl);
                //인증서 만료일 30일 이전이면
                if(moment().add(30, "days").isAfter(moment(response.data.valEndDate, "YYYY-MM-DD"))) {
                    history.push("/login/renew");
                }
                else if(response.data.memberPasswordModifyChk) {
                    // else if(true) {
                    history.push("/login/update");
                }
            }

        } catch (e) {
            if(e.response.data && e.response.data.code === 'L002') {
                //휴면계정
                history.push("/login/sleep");
            }else if(e.response.data && e.response.data.code === 'L005') {
                //본인인증안내화면으로 이동
                alert('본인인증이 되어 있지 않아 본인인증 페이지로 이동 됩니다.');
                history.push({pathname:"/verification/main", state:{memberId:username}});
            }else if(e.response.data && e.response.data.code === 'L003') {
                //교사인증안내화면으로 이동
                history.push("/login/require");
            }else if(e.response.data && e.response.data.code === 'L004') {
                //교사인증만료화면으로 이동
                history.push("/login/expired");
            }
        } finally {
            if(this._isMounted) {
                this.setState({
                    logging: false
                });
            }
            BaseActions.closeLoading();
        }
    }

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;

        try {
            let result = await MyclassActions.myClassInfo();
            return result.data;
        } catch (e) {
            console.log(e);
        }
    }
    setCancelUpdateCookie = () => {
        cookies.set("cookieCancelUpdate", true, {
            expires: moment().add(6, 'months').toDate()
        });
    }

    setLoginSuccessCookie = (memberId) => {
        cookies.set("vivauserid", memberId);
    }

    componentDidMount() {
        this._isMounted = true;
        const {info,school} = this.props;
        if(!isEmpty(localStorage.getItem("savedId"))) {
            this.setState({
                username: localStorage.getItem("savedId"),
                idSaveCheck: true
            });
        }

        let target = this;
        if(isCommonWVAppsMv(window.navigator.userAgent.toLowerCase())) {
            checkOSVersionOnMountForIOS(() => {
                console.log('Mount Check For IOS Using OS Version');
                target.setState({
                    isAppleLogin: true
                })
            });
        }
        // Check
        if(isCommonWVAppsMv(window.navigator.userAgent.toLowerCase())) {
            checkVersionForUI(() => {
                console.log("Call Not Show");
                target.setState({
                    isShowWhale: false
                })
            }, () => {
                console.log("Call Show");
                target.setState({
                    isShowWhale: true
                });
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    appleLogin = (e) =>{
        if(e) e.preventDefault();
        const {isApp} = this.props;
        const type = 'APPLE';
        const infoCheck = false;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            checkPlatformVersion(object, false, (retVal) => {
                this.afterEvent(retVal);
            }, () => {
                this.alertUpdateMsg();
            });
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    naverLogin = (e) =>{
        if(e) e.preventDefault();
        const {isApp} = this.props;

        const type = 'NAVER';
        const infoCheck = false;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            checkPlatformVersion(object, true, (retVal) => {
                this.afterEvent(retVal);
            }, () => {
                this.alertUpdateMsg();
            });
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    kakaoLogin = (e) =>{
        if(e) e.preventDefault();
        const type = 'KAKAO';
        const infoCheck = false;
        const {isApp} = this.props;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            checkPlatformVersion(object, true, (retVal) => {
                this.afterEvent(retVal);
            }, () => {
                this.alertUpdateMsg();
            });
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    facebookLogin = (e) =>{
        //페이스북 임시 조치 코드입니다. 조치 완료후 삭제 요망.
        alert("페이스북 로그인은 현재 점검 중입니다. 다른 SNS 간편 로그인을 이용 부탁드립니다.\n이용에 불편을 드려 대단히 죄송합니다.");
        return;

        if(e) e.preventDefault();
        const type = 'FACEBOOK';
        const infoCheck = false;
        const {isApp} = this.props;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            checkPlatformVersion(object, true, (retVal) => {
                this.afterEvent(retVal);
            }, () => {
                this.alertUpdateMsg();
            });
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    googleLogin = (e) =>{
        if(e) e.preventDefault();
        const type = 'GOOGLE';
        const infoCheck = false;
        const {isApp} = this.props;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            checkPlatformVersion(object, true, (retVal) => {
                this.afterEvent(retVal);
            }, () => {
                this.alertUpdateMsg();
            });
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    whaleLogin = (e) => {
        if(e) e.preventDefault();
        const type = 'WHALESPACE';
        const infoCheck = false;
        const {isApp} = this.props;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            checkPlatformVersion(object, true, (retVal) => {
                this.afterEvent(retVal);
            }, () => {
                this.alertUpdateMsg();
            });
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    goMsHsAppStoreOrPlayStore = () => {
        if (isAndroid) {
            if (window.confirm("SNS 로그인은 비바샘 앱에서만 이용 가능합니다. 앱으로 이동하시겠습니까?")) {
                document.location.href = MS_HS_APP_STORE_URL.ANDROID_INTENT;
            }
        } else {
            var b = new Date();
            setTimeout(function () {
                if (new Date() - b < 2000) {
                    if(window.confirm('앱 설치후 이용이 가능합니다. 앱스토어로 이동하시겠습니까?')) {
                        window.location.href = MS_HS_APP_STORE_URL.IOS;
                    }
                }
            }, 1500);
            document.location.href = "mvvivasammobile://";
        }
    }

    afterEvent = async (retVal) => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        //세션 스토리지 삭제
        sessionStorage.removeItem('snsObject');
        const object = {
            type : retVal.type,
            infoCheck : retVal.infoCheck,
            accessToken : retVal.accesstoken,
            id : retVal.userId,
            apiId : retVal.apiId,
            idToken : retVal.idtoken,
            clientsecret : retVal.clientsecret,
            code : retVal.code
        }

        const response = await api.loginSns(object);
        if (response.data.code != null && response.data.code == "sns_goLogin") {
            sessionStorage.setItem("snsObject", JSON.stringify(response.data.object));
            this.handleLogin(response.data.object.memberId, '');
        }
        else if (response.data.code != null && response.data.code == "sns_join") {
            sessionStorage.setItem("snsObject", JSON.stringify(response.data.object));
            window.location.href = '/#/sns/join/agree';
        }
        else if (response.data.code != null && response.data.code == "sns_success_mapping") {
            sessionStorage.setItem("snsObject", JSON.stringify(response.data.object));
            if (response.data.object.phoneNumber != null) {
                window.location.href = '/#/sns/linkage/link';
            }
        }
        else if (response.data.code != null && response.data.code == "sns_success_identification") {
            sessionStorage.setItem("snsObject", JSON.stringify(response.data.object));
            window.location.href = '/#/sns/join/verify';
        }
        else if (response.data.code != null && response.data.code == "sns_success_identification_mapping") {
            sessionStorage.setItem("snsObject", JSON.stringify(response.data.object));
            window.location.href = '/#/sns/linkage/link';
        }
        else if (response.data.code != null && response.data.code == "sns_fail") {
            alert("SNS 간편 로그인이 정상적으로 완료되지 않아 취소되었습니다.");
        }
        setTimeout(()=>{
            BaseActions.closeLoading();
        }, 1000);//의도적 지연.
    }

    alertUpdateMsg = () => {
        if (window.confirm('SNS로그인을 사용하시려면 업데이트가 필요합니다.\n\n지금 업데이트 하시겠습니까?')) {
            if (isIOS) {
                let data = {value: MS_HS_APP_STORE_URL.IOS};
                return new Promise(function (resolve, reject) {
                    window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                        resolve(retVal);
                    }, (err) => {
                        reject(err);
                    });
                });
            } else if (isAndroid) {
                document.location.href = MS_HS_APP_STORE_URL.ANDROID;
            }
        } else {
            // 취소를 누른 경우, 강제 업데이트 일경우는 앱 종료
        }
    }

    render() {
        const { autoLogin, isApp, history, info, school, agree} = this.props;
        const { logging, retCnt } = this.state;
        if(this.props.logged) history.replace('/');

        // 로그인 화면에서만 캡챠 로고 노출
        let gb = document.getElementsByClassName("grecaptcha-badge");
        if (gb.length > 0) {
            gb[0].style.display = 'block';
            gb[0].style.bottom = '84px';
        }

        return (
            <form>
                <div className="login_box">
                    <div className="login_box_in">
                        <label htmlFor="inpId" className="login_box_title">ID</label>
                        <input
                            type="text"
                            className="mb10 idWrite"
                            id="inpId"
                            name="username"
                            placeholder="아이디를 입력하세요"
                            autoCapitalize="none"
                            onChange={this.handleChange}
                            value={this.state.username}
                        />
                    </div>
                    <div className="login_box_in pb20">
                        <label htmlFor="inpPw" className="login_box_title">PW</label>
                        <input
                            type="password"
                            className="pwWrite"
                            id="inpPw"
                            name="password"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            placeholder="비밀번호를 입력하세요"
                            onChange={this.handleChange}
                            onKeyPress={this.handleKeyPress}
                            value={this.state.password}
                        />
                    </div>
                    <div className="login_info mb30">
                        { isApp && (
                            <Fragment>
                                <input
                                    type="checkbox"
                                    id="loginCheck"
                                    name="autoLogin"
                                    className="checkbox"
                                    checked={autoLogin}
                                    onChange={this.handleChecked} />
                                <label htmlFor="loginCheck" className="mr10"><span>자동로그인</span></label>
                            </Fragment>
                        )}
                        <div className="btn_floating_right">
                            <input
                                type="checkbox"
                                id="IDS"
                                name="idSaveCheck"
                                className="checkbox"
                                checked={this.state.idSaveCheck}
                                onChange={this.handleChecked} />
                            <label htmlFor="IDS"><span>ID저장</span></label>
                        </div>
                    </div>

                <div className="login_find_info">
                    <Link
                        to="/find/id"
                        className="login_find_info_id">
                        아이디 찾기
                    </Link>
                    <Link
                        to="/find/pw"
                        className="login_find_info_pw">
                        비밀번호 찾기
                    </Link>
                </div>

                <div>
                    <button onClick={this.handleClick} className="btn_round_on mb10" disabled={logging}>로그인</button>
                    <Link
                        to="/join/select"
                        className="btn_round_off">
                        회원가입
                    </Link>
                </div>
                    <div className={this.state.isShowWhale || this.state.isShowApple ? "m_sns_wrap" : "m_sns_wrap col4"}  >
                        <button
                            onClick={this.naverLogin}
                            className="">
                            <img src="../images/member/logo_naver.png" alt="네이버 회원가입"/>
                        </button>
                        <button
                            onClick={this.kakaoLogin}
                            className="">
                            <img src="../images/member/logo_kakao.png" alt="카카오 회원가입"/>
                        </button>
                        <button
                            onClick={this.googleLogin}
                            className="">
                            <img src="../images/member/logo_google.png" alt="구글 회원가입"/>
                        </button>
                        {this.state.isShowWhale &&
                        <button
                            onClick={this.whaleLogin}
                            className="">
                            <img src="../images/member/logo_whale.png" alt="웨일 스페이스 회원가입"/>
                        </button>
                        }
                        {this.state.isAppleLogin &&
                        <button
                            onClick={this.appleLogin}
                            className="">
                            <img src="../images/member/logo_apple.png" alt="애플 회원가입"/>
                        </button>
                        }
                    </div>
                </div>
                <div id="INVALID" style={{display: 'none'}}>
                    <PasswordPopupContainer retCnt={retCnt}/>
                </div>
                <div id="FAIL" style={{display: 'none'}}>
                    <PasswordChangePopupContainer/>
                </div>

            </form>
        );
    }
}
export default connect(
    (state) => ({
        logged: state.base.get("logged"),
        autoLogin: state.base.get('autoLogin'),
        returnUrl: state.base.get('returnUrl'),
        isApp: state.base.get('isApp'),
        isFirst: state.base.get('isFirst'),
        info: state.join.get('info').toJS(),
        school: state.join.get('school').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch),
        JoinActions: bindActionCreators(joinActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(LoginForm));
