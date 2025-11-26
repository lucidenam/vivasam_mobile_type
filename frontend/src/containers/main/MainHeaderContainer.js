import React, { Component } from 'react';
import { MainHeader } from 'components/main';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TermsServicePopupSwitch from 'components/login/TermsServicePopupSwitch';
import TermsPrivacyPopup from 'components/login/TermsPrivacyPopup';
import { AccessGpsPopup } from 'components/login';
import {isIOS} from "react-device-detect";
import {onClickCallLinkingOpenUrl} from '../../lib/OpenLinkUtils';

class MainHeaderContainer extends Component {
    state = {
        open: false
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleMenuClick = () => {
        const {open} = this.state;
        if(this._isMounted){
            this.setState({
                open : !open
            });
        }

        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '2025 개편', {'parameter': '메인', 'parameter_value': '설정', 'parameter_url': window.location.href});
    }

    handleMenuCloseClick = () => {
        const {open} = this.state;
        if(this._isMounted){
            this.setState({
                open : !open
            });
        }
    }

    handleMenuOnchange = (open) => {
        if(this._isMounted){
            this.setState({
                open : open
            });
        }
        document.getElementsByClassName("navi_cont")[0].scrollTop = 1;
    }

    handleLogin = () => {
        const {BaseActions, logged, history} = this.props;
        if(logged) {
            //로그아웃처리
            BaseActions.logout();
        }else {
            //로그인 화면으로 이동
            history.push("/login");
        }
    }

    handlePopup = (type) => {
        const {PopupActions, logged, history} = this.props;
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
        this.handleMenuCloseClick();
    }

    render() {
        const { logged, loginInfo, initHidden, myClassInfo} = this.props;
        const { open } = this.state;
        return (
            <MainHeader
              logged={logged}
              loginInfo={loginInfo}
              open={open}
              initHidden={initHidden}
              schoolName={myClassInfo.schoolName}
              mainSubjectName={myClassInfo.mainSubjectName}
              secondSubjectName={myClassInfo.secondSubjectName}
              handleMenuClick={this.handleMenuClick}
              handleMenuCloseClick={this.handleMenuCloseClick}
              handleMenuOnchange={this.handleMenuOnchange}
              handleLogin={this.handleLogin}
              handlePopup={this.handlePopup}
              schoolLvlCd={myClassInfo.schoolLvlCd}
              onClickCallLinkingOpenUrl={onClickCallLinkingOpenUrl.bind(this, `https://v.vivasam.com/main.do?deviceMode=pc`)}
            />
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(MainHeaderContainer));
