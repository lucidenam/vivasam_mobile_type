import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import {isAndroid, isIOS} from "react-device-detect";
import {MS_HS_APP_STORE_URL} from "../../constants";
import * as api from "../../lib/api";
import {setPushAlarms} from "../../lib/api";
import {Cookies} from "react-cookie";

import {
    MarketingAgreeInfoPopup,
    MarketingAgreeSelectPopup,
    NeedUpdateMemberInfoPopup,
    NeedUpdateMemberInfoPopup2
} from "./index";
import moment from "moment";
import * as myclassActions from "../../store/modules/myclass";
import {initializeGtag} from "store/modules/gtag";
import {checkOSVersionOnMountForIOS, checkPlatformVersion, checkVersionForUI} from '../../lib/VersionUtils';
import {isCommonWVAppsMv} from "../../lib/common";
import queryString from "query-string";

const cookies = new Cookies();
class JoinSelect extends Component {
    state = {
        username: '',
        password: '',
        idSaveCheck: false,
        logging: false,
        isAppleLogin : false,
        isValid : true,
        isShowWhale: false
    }

    constructor(props) {
      super(props);
      // Debounce
      this.nextButtonClick = debounce(this.nextButtonClick, 300);
      this.isSelected = React.createRef();
      this.ssoMember = React.createRef();
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/join/select',
            'page_title': '회원 가입 유형 선택 | 회원가입｜비바샘'
        });
        const { JoinActions } = this.props;
        JoinActions.defaultStore();

        let target = this;
        if(isCommonWVAppsMv(window.navigator.userAgent.toLowerCase())) {
            checkOSVersionOnMountForIOS(() => {
                console.log('Mount Check For IOS Using OS Version');
                target.setState({
                    isAppleLogin: true
                })
            });
        }
        //타겟팅게이츠 스크립트
        let wptg_tagscript_vars = wptg_tagscript_vars || [];
        wptg_tagscript_vars.push(
            (function() {
                return {
                    wp_hcuid:"",   /*고객넘버 등 Unique ID (ex. 로그인  ID, 고객넘버 등 )를 암호화하여 대입.
			                	*주의 : 로그인 하지 않은 사용자는 어떠한 값도 대입하지 않습니다.*/
                    ti:"52428",	/*광고주 코드 */
                    ty:"join",	/*트래킹태그 타입 */
                    device:"mobile"	/*디바이스 종류  (web 또는  mobile)*/
                };
            })
        );
        if(isCommonWVAppsMv(window.navigator.userAgent.toLowerCase())) {
            // Check
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

        let recoJoinInfo;
        if (this.props.location.search) {
            let qs = queryString.parse(this.props.location.search);
            recoJoinInfo = {
                via: qs.via,
                reco: qs.reco
            }
        } else {
            recoJoinInfo = {
                via: '',
                reco: ''
            }
        }
        // JoinActions.pushValues({type: "recoJoinInfo", object: recoJoinInfo});
        localStorage.setItem("recoJoinInfo", JSON.stringify(recoJoinInfo));
    }

    handleChange = (e) => {
      const { type, JoinActions } = this.props;
      type['ssoMember'] = e.target.checked;
      JoinActions.pushValues({type:"type", object:type});
    }

    nextButtonClickSafe = (e) => {
      this.nextButtonClick(e.target);
    }

    nextButtonClick = (target) => {
        const { BaseActions, JoinActions, history, type, ssoLoginMode } = this.props;
        try {
            target.disabled = true;

            type['isSelected'] = true;
            JoinActions.pushValues({type:"type", object:type});

            if (type.ssoMember && !ssoLoginMode) {
                alert("죄송합니다.\n\n" + "현재 시스템 안정화 작업 중이며\n" + "빠른 작업으로 서비스 이용에 차질 없도록 하겠습니다.\n" + "감사합니다.");
            } else {
                BaseActions.openLoading();
                history.push('/join/agree');
            }

        }catch(e) {
            target.disabled = false;
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
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

    handleLogin = async (username, password) => {
        const {BaseActions, PopupActions, history, location, returnUrl, isApp, isFirst} = this.props;
        const { idSaveCheck } = this.state;
        let snsLoginParameter = JSON.parse(sessionStorage.getItem("snsObject"));

        try {
            BaseActions.openLoading({loadingType:"1"});
            if(this._isMounted) {
                this.setState({
                    logging: true
                });
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
            if(response.data.first) {
                BaseActions.pushValues({type:"isFirst", object:response.data.first});
                PopupActions.openPopup({title:"마케팅 및 광고 활용 동의", componet:<MarketingAgreeInfoPopup handleClose={()=> {history.push(redirectUrl);}}/>, templateClassName: 'float_box'});
            }
            else if(!response.data.marketingAgree){
                // 마케팅 및 광고 활용 동의 기록이 없는 회원
                PopupActions.openPopup({title:"마케팅 활용 동의안내", componet:<MarketingAgreeSelectPopup handleClose={()=> {history.push(redirectUrl);}}/>, templateClassName: 'float_box'});
            }
            // 학교정보를 입력하지 않은 회원
            else if(schoolName == null || schoolName === ''){
                PopupActions.openPopup({title:"회원정보 업데이트 안내", componet:<NeedUpdateMemberInfoPopup2 handleClose={()=> {history.push(redirectUrl);}}/>, templateClassName: 'float_box'});
            }
            // 통합회원 진행
            else if (response.data.ssoMemberYN == null) {
                //메인에 통합회원 안내 팝업 띄울꺼임. 교사인증으로 넘어가면 안되니 이대로 둠.
                history.push(redirectUrl);
            }
            //통합회원 필수 정보 확인
            else if (response.data.ssoMemberYN === 'Y' && response.data.ssoMemChkYn != 'Y') {
                PopupActions.openPopup({title:"회원정보 업데이트 안내", componet:<NeedUpdateMemberInfoPopup handleClose={()=> {history.push(redirectUrl);}}/>, templateClassName: 'float_box'});
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
                else if(response.data.MemberPasswordModifyChk) {
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

    setLoginSuccessCookie = (memberId) => {
        cookies.set("vivauserid", memberId);
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
      const { type } = this.props;
        return (
            <Fragment>
                <div className="integrated_wrap renew07">
                    <section className="integrated_cont">
                        <div className="join_select">
                            <img src="/images/member/join_select_txt3.png" alt="비상교육 선생님 통합회원으로 가입하세요." className="join_select_txt"/>
                            {/*<div className="join_v">*/}
                            {/*    <div className="check_join">*/}
                            {/*        <input type="checkbox" id="joinV" checked="checked" readOnly />*/}
                            {/*        <label htmlFor="joinV"><span className="blind">비바샘</span></label>*/}
                            {/*    </div>*/}
                            {/*    <p className="blind">학교 선생님들을 위한 비상교과서 교수지원 서비스로 30만개 이상의 수업자료 등 다양한 혜택을 이용하실 수 있습니다.</p>*/}
                            {/*</div>*/}
                            {/*<div className="join_t">*/}
                            {/*    <div className="check_join">*/}
                            {/*        <input type="checkbox" id="joinT" checked="checked"*/}
                            {/*          checked={type.ssoMember}*/}
                            {/*          onChange={this.handleChange} />*/}
                            {/*        <label htmlFor="joinT"><span className="blind">티스쿨원격교육연수원</span></label>*/}
                            {/*    </div>*/}
                            {/*    <p className="blind">학교 선생님들을 위한 다양한 직무연수를 제공하는 원격교육연수원입니다.</p>*/}
                            {/*</div>*/}
                            <div className="blind">
                                <h1>
                                    <span>비상교육 선생님</span>
                                    통합 회원가입
                                </h1>

                                <p>
                                    비바샘, 비바샘 원격교육연수원 선생님들께<br />
                                    다양한 통합회원 혜택을 드립니다.
                                </p>
                            </div>

                            <div className="btn_join">
                                <a onClick={this.nextButtonClickSafe}><img src="/images/member/btn_join4.png" alt="회원가입" /></a>
                            </div>
                        </div>

                        <div className="info_box_dash">
                            <img src="/images/member/join_select_txt4.png" alt="sns회원가입" className="join_select_txt2"/>
                            <div className="blind">
                                <h2 className="join_sns_tit">SNS로 가입하기</h2>
                                <p>SNS로 가입 시 ‘비바샘’에서만 이용이 가능합니다.</p>
                            </div>
                            <div className="join_sns_link">
                                <ul>
                                    <li>
                                        <span id="naver_id_login" onClick={this.naverLogin}>
                                            <img src="/images/member/logo_naver2.png" alt="네이버 회원가입"/>
                                        </span>
                                    </li>

                                    <li>
                                        <a onClick={this.kakaoLogin}>
                                            <img src="/images/member/logo_kakao2.png" alt="카카오 회원가입"/>
                                        </a>
                                    </li>

                                    <li id="GgCustomLogin" className="c_pointer" onClick={this.googleLogin}>
                                        <img src="/images/member/logo_google2.png" alt="구글 회원가입"/>
                                    </li>
                                    {this.state.isShowWhale &&
                                        <li id="GgCustomLogin" className="c_pointer" onClick={this.whaleLogin}>
                                            <img src="/images/member/logo_whale3.png" alt="웨일 스페이스 회원가입"/>
                                        </li>
                                    }
                                    {this.state.isAppleLogin &&
                                        <li id="GgCustomLogin" className="c_pointer" onClick={this.appleLogin}>
                                            <img src="/images/member/logo_apple2.png" alt="애플 회원가입"/>
                                        </li>
                                    }
                                </ul>
                            </div>
                        </div>
                        <div className="info_box_dash join_bottom">
                            <ul>
                                <li>
                                    비바샘 교수지원서비스에서 지급되는 마일리지와<br/>
                                    비바샘 원격교육연수원에서 지급되는 포인트는 해당 사이트에서만<br/>
                                    사용하실 수 있습니다.
                                </li>
                                <li>
                                    비바샘 교수지원서비스는 선생님 인증 (EPKI/GPKI, 공직자 메일 인증,<br/>
                                    서류인증) 이 완료되지 않은 경우, 비바샘 자료 이용이 일부 제한됩니다.
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
      type : state.join.get('type').toJS(),
      recoJoinInfo: state.join.get('recoJoinInfo').toJS(),
      isApp: state.base.get('isApp'),
      ssoLoginMode : state.base.get('ssoLoginMode')
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        JoinActions: bindActionCreators(joinActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(JoinSelect));
