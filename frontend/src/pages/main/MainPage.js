import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {MainTemplate} from 'components/main'
import {FooterCopyright} from 'components/page'
import {connect} from 'react-redux';
import * as api from 'lib/api';
import {bindActionCreators} from "redux";
import * as baseActions from 'store/modules/base';
import {
    EventBannerContainer,
    EventSlideContainer,
    MainSearchContainer,
    MyTextBookInfoContainer,
    NoticeListContainer,
    PromoteContainer,
    SsoEventContainer
} from 'containers/main';
import Onboarding from "containers/page/Onboarding";
import EventNoticePopupContainer from "../../containers/main/EventNoticePopupContainer";
import ElOpenPopupContainer from "../../containers/main/ElOpenPopupContainer";
import {callTrackingTag, isProd} from "../../lib/TargetingUtils";
import {check} from "../../lib/VersionUtils";
import {Cookies} from 'react-cookie';

class MainPage extends Component{
    state = {
        isOnboarding: false,
        ipinCheck : false
    }

    constructor(props) {
        super(props);
        this.goConversion();
        this.checkLoginMileage();
    }

    handleLogin = (e) => {

        e.preventDefault();

        const {BaseActions, logged, history} = this.props;
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if (logged) {
            gtag('event', '2025 개편', {
                'parameter': '메인',
                'parameter_value': '로그아웃',
                'parameter_url': window.location.origin
            });
            //로그아웃처리
            BaseActions.logout();
            history.push("/");
        } else {
            //로그인 화면으로 이동
            history.push("/login");
        }
    }

    handleOnboarding = () => {
        this.setState({
            isOnboarding: false
        });
        localStorage.setItem("onboarding", "N");
    }

    static getDerivedStateFromProps(props, state) {
        if(props.isApp) {
            const onboarding = localStorage.getItem("onboarding");
            if(!onboarding) {
                localStorage.setItem("onboarding", "Y");
                state.isOnboarding = true;
                return state;
            } else if (onboarding === 'Y') {
                state.isOnboarding = true;
                return state;
            }
        }

        return state;
    }

    componentDidMount() {
        window.scrollTo(0, 0);

        //타겟팅게이츠 스크립트
        if(isProd()){
            callTrackingTag('Home');
        }

    }


    componentDidUpdate = async (prevProps, prevState, snapshot) => {
        //let mIsApp = this.props.isApp;
        //let mPreProps = this.props.isApp;
        //console.log('Main Page IsApp :: ' + mIsApp +"||" + mPreProps);
        // BaseContainer 로딩후 앱에서 호출된것이라고 판단되면 1회만 호출하기 위해서
        if(!prevProps.isApp && this.props.isApp) {
            check();
        }
    }

    goConversion = async () => {
        const response = await api.checkAuthIPIN();
        if(response.data.IPIN_CHECK === 'NotAllowAuth'){
        }else{
            this.setState({
                ipinCheck : true
            });
        }
    };

    checkLoginMileage = async () => {
        const {logged} = this.props;
        if(logged) {
            const response = await api.checkLoginMileage();
        }
    }

    render () {
        function gtag(){
            window.dataLayer.push(arguments);
        }
        const { isApp, logged, loginInfo, isFirst } = this.props;
        const { isOnboarding } = this.state;

        if(isApp === null) return null;

        // let visibleConversionEventPop = false;
        // if(logged) {
        //     const cookies = new Cookies();
        //     if(!cookies.get("stopSsoGuide") && !cookies.get("stopSsoGuideForOnce") && loginInfo.ssoMemberYN == null && this.state.ipinCheck == true) {
        //         visibleConversionEventPop = true;
        //     }
        //
        // }

        // 신학기 연구용 자료 팝업
        let visibleNoticeEventPop = false;
        if((logged && loginInfo.schoolLvlCd == 'ES') || (logged && loginInfo.schoolLvlCd == 'MS') || (logged && loginInfo.schoolLvlCd == 'HS')) {
            const cookies = new Cookies();

            // 운영 날짜 : 25.03.17 ~ 03.28 까지 노출
            const start = new Date(2025,2, 12);
            const end = new Date(2025, 2, 27);

            const today = new Date();

            if(!cookies.get("2024popDataAsk") && (start <= today && today < end)){
                visibleNoticeEventPop = true;
            }
        }

        return (
            <Fragment>
                {
                    isOnboarding ? (
                        <Onboarding handleOnboarding={this.handleOnboarding}/>
                    ) : (
                        <Fragment>
                            <MainTemplate>
                                {/* 검색영역 */}
                                <MainSearchContainer/>
                                <div id="container">
                                    <div id="content">

                                        {/* 이벤트 슬라이드 */}
                                        <EventSlideContainer/>

                                        {/* 바로가기 메뉴 */}
                                        <h2 className="blind">
                                            바로가기 메뉴
                                        </h2>
                                        <div className="shortLink">
                                            {/*<Link to={logged ? "/educourse" : '/login'}*/}
                                            <Link to={"/educourse"}
                                                onClick={()=>{
                                                    gtag('event', '2025 개편', {
                                                        'parameter': '메인',
                                                        'parameter_value' : '교과서 자료',
                                                        'parameter_url': window.location.origin + "/#/educourse"
                                                    });
                                                }}
                                                className="shortLink_item">
                                                {/* <span className="y22">22 개정</span> */}교과서 자료<span className="blind">NEW</span>
                                            </Link>
                                            <Link to="/liveLesson/aidtNewcurriculum"
                                                onClick={()=>{
                                                    gtag('event', '2025 개편', {
                                                        'parameter': '메인',
                                                        'parameter_value' : '살아있는 수업',
                                                        'parameter_url': window.location.origin + "/#/liveLesson/aidtNewcurriculum"
                                                    });
                                                }}
                                                className="shortLink_item shortLink_item-center">
                                                창체·수업연구
                                            </Link>
                                            <Link to="/saemteo/event"
                                                onClick={()=>{
                                                    gtag('event', '2025 개편', {
                                                        'parameter': '메인',
                                                        'parameter_value' : '비바샘터',
                                                        'parameter_url': window.location.origin + "/#/saemteo/event"
                                                    });
                                                }}
                                                className="shortLink_item">
                                                비바샘터
                                            </Link>
                                        </div>

                                        {/* 내 교과서 바로가기 */}
                                        <MyTextBookInfoContainer/>

                                        {/* 설문조사 */}
                                        <PromoteContainer/>

                                        {/* 공지사항 */}
                                        <NoticeListContainer/>

                                        {/* 이벤트 배너 */}
                                        <EventBannerContainer/>

                                    </div>
                                </div>

                                <FooterCopyright handleLogin={this.handleLogin}/>
                                <ElOpenPopupContainer isApp={this.props.isApp}/>
                            </MainTemplate>

                            {/* 통합회원 전환 안내 팝업 */}
                            {/*{visibleConversionEventPop && (*/}
                            {/*    <SsoEventContainer/>*/}
                            {/*)}*/}

                            {/* 신학기 패키지 안내 팝업 */}
                            {visibleNoticeEventPop && (
                                <EventNoticePopupContainer/>
                            )}
                        </Fragment>
                    )
                }
            </Fragment>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        isApp: state.base.get('isApp'),
        isFirst: state.base.get('isFirst')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(MainPage));
