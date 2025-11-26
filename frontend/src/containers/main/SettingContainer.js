import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import PushAlarmContainer from 'containers/main/PushAlarmContainer';
import {AccessGpsPopup} from 'components/login';
import {ACCESS_TOKEN} from "../../constants";
import {isAndroid, isIOS} from 'react-device-detect';
import {goAppDownload} from 'lib/common'

/**
 * 권한 정보응답 값
 * authorized   - User has authorized this permission
 * denied	    - User has denied this permission at least once. On iOS this means that the user will not be prompted again. Android users can be prompted multiple times until they select 'Never ask me again'
 * restricted   - iOS - this means user is not able to grant this permission, either because it's not supported by the device or because it has been blocked by parental controls. Android - this means that the user has selected 'Never ask me again' while denying permission
 * undetermined	- User has not yet been prompted with a permission dialog
 *
 */
class SettingContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            version: '',
            checkPmsDataNetwork: false,
        };
        /*checkPmsCamera: false,
        checkPmsPhoto: false,
        checkPmsGPS: false,
        checkPmsPush: false,*/
    }

    componentDidMount = () => {
        var _rn = this;
        const { isApp } = this.props;

        if (isApp) {
            window.webViewBridge.send('getVersion', '', function(res){ //Browser 에서는 동작하지 않습니다. WebView 에서만.
                if (res.value) {
                    _rn.setState({version: res.value});
                }
            }, function(err){
                console.log(err);//TODO 뭘 해야 하나?
            });

            const checkPmsDataNetwork = localStorage.getItem("checkPmsDataNetwork");
            this.setState({
                checkPmsDataNetwork: checkPmsDataNetwork === "true"
            });

            /*window.webViewBridge.send('checkPmsDataNetwork', '', function(res){
                _rn.setState({checkPmsDataNetwork: (res.value === true)});
            }, function(err){
                console.log(err);//TODO 뭘 해야 하나?
            });
            window.webViewBridge.send('checkPmsCamera', '', function(res){
                _rn.setState({checkPmsCamera: (res.value === true)});
            }, function(err){
                console.log(err);//TODO 뭘 해야 하나?
            });
            window.webViewBridge.send('checkPmsPhoto', '', function(res){
                _rn.setState({checkPmsPhoto: (res.value === true)});
            }, function(err){
                console.log(err);//TODO 뭘 해야 하나?
            });
            window.webViewBridge.send('checkPmsGPS', '', function(res){
                _rn.setState({checkPmsGPS: (res.value === true)});
            }, function(err){
                console.log(err);//TODO 뭘 해야 하나?
            });

            window.webViewBridge.send('checkPmsPush', '', function(res){
                _rn.setState({checkPmsPush: (res.value === 'true')});
            }, function(err){
                console.log(err);//TODO 뭘 해야 하나?
            });*/
        }
        else {
            console.log('This app container is not webview.');
        }
    }

    openPushAlarm = (e) => {
        e.preventDefault();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '푸시 알림 설정 메뉴 터치', {
            'parameter': '설정'
        });
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:"알림 수신 설정", componet:<PushAlarmContainer/>});
    }

    /*toggleCameraPermission() {
        console.log('reqeust camera permission value...');
        window.webViewBridge.send('checkPmsCamera', '{"value": "camera"}', function(res){
            if (res.value != 'authorized') {
                window.webViewBridge.send('reqPermission', '{"value": "camera"}', function(res2){}, function(err2){});
            }
            else {
                window.webViewBridge.send('reqPermission', '{"value": "camera"}', function(res2){}, function(err2){});
            }
        }, function(err){
            console.log(err);//TODO 뭘 해야 하나?
        });
    }*/

    handleLogin = (e) => {
        e.preventDefault();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '로그아웃', {
            'parameter': '설정'
        });
        const {BaseActions, logged, history} = this.props;
        if(logged) {
            //로그아웃처리
            BaseActions.logout();
            sessionStorage.removeItem('snsObject');
            history.push("/");
        }else {
            //로그인 화면으로 이동
            history.push("/login");
        }
    }

    handleAutoLogin = (e) => {
        localStorage.setItem("autoLogin", e.target.checked ? "Y" : "N");

        const {BaseActions} = this.props;
        BaseActions.autoLogin(e.target.checked);
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(e.target.checked) {
            gtag('event', '자동로그인 On', {
                'parameter': '설정'
            });
            localStorage.setItem(ACCESS_TOKEN, sessionStorage.getItem(ACCESS_TOKEN));
        }else {
            gtag('event', '자동로그인 Off', {
                'parameter': '설정'
            });
            localStorage.removeItem(ACCESS_TOKEN);
        }
    }

    handleChecked = e => {
        const checked = e.target.checked;
        const name = e.target.name;
        console.log("앱 브릿지 호출 : ", name,  checked);
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(name === 'checkPmsDataNetwork') {
            if (checked) {
                gtag('event', '데이터 네트워크 사용 On', {
                    'parameter': '설정'
                });
            }
            else {
                gtag('event', '데이터 네트워크 사용 Off', {
                    'parameter': '설정'
                });
            }
            localStorage.setItem("checkPmsDataNetwork", checked ? "true" : "false");
        }

        this.setState({
            [name]: checked
        });
        /*api.setAppPermission(name, checked).then((res) => {
            this.setState({
                [name]: checked
            });
        }).catch(function (err) {
            //TODO Toggle 해제
        });*/
    }

    handleAppUpdate = e => {
        let isRequire = false;
        if(isIOS) {
            //현재 버전, 최신 버전 비교 후
            isRequire = true;
            if(isRequire) {
                goAppDownload();
            }
        }else if(isAndroid) {
            //현재 버전, 최신 버전 비교 후
            isRequire = true;
            if(isRequire) {
                goAppDownload();
            }
        }
    }

    handleOpenAccessGps = e => {
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:"위치정보 이용약관", componet:<AccessGpsPopup/>});
    }

    goLeavePage = (e) => {
        this.props.history.push('/leave');
    }

    render() {
        const { isApp, autoLogin } = this.props;
        let { version, checkPmsDataNetwork, checkPmsCamera, checkPmsPhoto, checkPmsGPS } = this.state;
        return (
            <div className="popup_contet_case2">
                <div className="pop_setting_wrap">
                    {
                        isApp && (<Fragment>
                            <div className="pop_setting_list">
                                <div className="pop_setting_txt">
                                    <strong className="pop_setting_tit">버전정보</strong>
                                    <span className="pop_setting_sub_tit">
                                최신버전/Ver {version}
                            </span>
                                </div>
                                {/*<div className="pop_setting_btn">
                                    <a
                                        onClick={this.handleAppUpdate}
                                        className="pop_setting_link">
                                        업데이트
                                    </a>
                                </div>*/}
                            </div>
                            <div className="pop_setting_list">
                                <div className="pop_setting_txt">
                                    <strong className="pop_setting_tit">
                                        자동로그인 설정
                                    </strong>
                                </div>
                                <div className="pop_setting_btn">
                                    <div className="popup_chk_btn">
                                        <input
                                            type="checkbox"
                                            id="chk_onoff01"
                                            name="autoLogin"
                                            checked={autoLogin}
                                            onChange={this.handleAutoLogin}
                                            className="checkbox_round"/>
                                        <label htmlFor="chk_onoff01" />
                                    </div>
                                </div>
                            </div>
                            <a
                                onClick={this.openPushAlarm}
                                className="pop_setting_list pop_setting_link_full">
                                <strong className="pop_setting_tit">
                                    PUSH 알림 설정
                                </strong>
                            </a>
                            <div className="pop_setting_list">
                                <div className="pop_setting_txt">
                                    <strong className="pop_setting_tit">
                                        데이터 네트워크 사용
                                    </strong>
                                </div>
                                <div className="pop_setting_btn">
                                    <div className="popup_chk_btn">
                                        <input
                                            type="checkbox"
                                            id="chk_onoff02"
                                            className="checkbox_round"
                                            name={"checkPmsDataNetwork"}
                                            checked={checkPmsDataNetwork}
                                            onChange={this.handleChecked}
                                        />
                                        <label htmlFor="chk_onoff02" />
                                    </div>
                                </div>
                            </div>
                        </Fragment>)
                    }
                </div>
                <div className="guideline"></div>
                <div className="pop_setting_wrap">
                    <a
                        href=""
                        onClick={this.handleLogin}
                        className="pop_setting_list pop_setting_link_full">
                        <strong className="pop_setting_tit">로그아웃</strong>
                    </a>
                </div>
                <div className="pop_setting_wrap">
                    <a onClick={this.goLeavePage}
                       className="pop_setting_list pop_setting_link_full">
                        <strong className="pop_setting_tit">회원탈퇴</strong>
                    </a>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        isApp: state.base.get('isApp'),
        autoLogin: state.base.get('autoLogin'),
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(SettingContainer));
