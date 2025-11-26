import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';
import {bindActionCreators} from "redux";
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import TermsServicePopupSwitch from "../login/TermsServicePopupSwitch";
import TermsPrivacyPopup from "../login/TermsPrivacyPopup";
import {AccessGpsPopup} from "../login";
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";
import {onClickCallEsApp} from "../../lib/CallMarketUtils";

class FooterCopyright extends Component {


    handlePopup = (type) => {
        const {PopupActions} = this.props;
        let container;
        let title;
        switch (type) {
            case 'service':
                container = <TermsServicePopupSwitch/>;
                title= '서비스 이용약관';
                break;
            case 'privacy':
                container = <TermsPrivacyPopup/>;
                title= '개인정보 처리방침';
                break;
            case 'gps':
                container = <AccessGpsPopup/>;
                title= '위치정보 수집이용 약관';
                break;
            default:
                break;
        }
        PopupActions.openPopup({title:title, componet:container});
    }

    render() {
        function gtag(){
            window.dataLayer.push(arguments);
        }
        return (
            <footer id="footer">
                <div className="logo_visang"><span className="blind">비상</span></div>
                <div className="version">
                    {
                        this.props.logged ?
                            <a href="javascript:void(0);"
                               className="bold"
                               onClick={(e) => this.props.handleLogin(e)}>로그아웃</a>
                            :
                            <a href="javascript:void(0);"
                               className="bold"
                               onClick={(e) => this.props.handleLogin(e)}>로그인</a>
                    }
                    <a className="ch_kakao bold"
                       onClick={() => {
                           gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': '카카오채널', 'parameter_url': "https://pf.kakao.com/_JUlsK"});
                           onClickCallLinkingOpenUrl(`https://pf.kakao.com/_JUlsK`);
                        }}>카카오채널<span/></a>
                    {/*<a className="bold"
                       onClick={() => {
                           gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': 'PC 버전', 'parameter_url': "https://v.vivasam.com/main.do?deviceMode=pc"});
                           onClickCallLinkingOpenUrl( `https://v.vivasam.com/main.do?deviceMode=pc`);
                       }}>PC버전</a>*/}
                </div>
                <div className="foot_info">
                    <Link to={"/terms/service"}>이용약관</Link>
                    <Link to={"/terms/privacy"}>개인정보처리방침</Link>
                    <a href="javascript:void(0)"
                       onClick={() => {
                           gtag('event', '위치정보 수집이용 약관', {
                               'parameter': '메인',
                               'parameter value': '약관'
                           });
                           this.handlePopup('gps');
                       }}>위치기반수집이용</a>
                </div>
                <div className="gate">
                    <a href="javascript:void(0);" onClick={onClickCallEsApp} target="_blank">초등</a>
                    <a href="javascript:void(0);" onClick={(e) => {
                        e.preventDefault();
                        gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': '중고등', 'parameter_url': window.location.href});
                    }} className="on" target="_blank">중고등</a>
                </div>
                <p className="copyright">(주)비상교육 | 대표자명 : 양태회<br/> 사업자등록번호 : 211-87-07735<br/>
                    주소 : 경기 과천시 과천대로2길 54 그라운드브이 14층<br/> TEL : 1544-7714(선생님 전용 고객센터),<br/> 1661-0777(AIDT 교육자료 공동 고객센터)<br/>
                    COPYRIGHT(C) (주)비상교육 ALL RIGHTS RESERVED.</p>
            </footer>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        isApp: state.base.get('isApp')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(FooterCopyright));
