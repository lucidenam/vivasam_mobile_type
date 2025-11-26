import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import * as joinActions from 'store/modules/join';
import InfoText from 'components/login/InfoText';
import {accessSnsLoginForMyInfoEdit} from "../../lib/VersionUtils";
import {validateResultCodeHash} from "../../lib/StringUtils";

class MyInfoEditContainer extends Component {

    state = {
        resultMessage: '',
        resultClassName: '',
        loginType : 'LOGIN',
        isLoginType : 'A'
    }

    componentDidMount() {
        this._isMounted = true;
        const { info, logged, history, JoinActions } = this.props;
        //로그인 정보 없을시 return
        if(!logged){
            history.push('/');
        }
        //패스워드 재입력하게함
        info.password = '';
        JoinActions.pushValues({type:"info", object:info});
        this.setLoginType();

    }
    setLoginType = async () => {
        const loginType = await api.getLoginType();
        if (loginType != null) {
            if (loginType.data != 'LOGIN') {
                this.setState({
                    loginType : loginType.data,
                    isLoginType : 'C'
                })
            }
            else {
                this.setState({
                    isLoginType : 'B'
                })
            }
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
        const { info, JoinActions } = this.props;
        info[e.target.name] = e.target.value;
        JoinActions.pushValues({type:"info", object:info});
    }

    handleClick = async(e) => {
        e.preventDefault();
        const { info, history } = this.props;
        let clazz = 'point_red';
        let obj = { result : false , message : ''}
        if(!info.password){
            obj.message = '비밀번호를 입력해주세요.';
        }else{
            obj.result = true;
        }
        if(this._isMounted){
            this.setState({
              resultMessage: obj.message,
              resultClassName: clazz
            });
        }

        if(obj.result){
            this.checkPassword();
        }
    }
    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            this.handleClick(e);
        }
    }
    checkPassword = async() => {
        const { info, history, loginInfo, JoinActions } = this.props;
        const response = await api.checkPassword(loginInfo.memberId, info.password);
        let message='';
        let clazz = 'point_red';
        if (response.data.code) {
            if (!validateResultCodeHash(response.data.code, response.data.hash)) {
                message = '유효하지 않은 입력입니다. 다시 시도해 주세요.';
            } else if (response.data.code === '0') {
                info.passwordModify = true;
                JoinActions.pushValues({type:"info", object:info});
                history.replace('/myInfo/modify');
            } else if (response.data.code === '1' || response.data.code === '2') {
                message = '입력값을 다시 확인해주세요.'
            } else if (response.data.code === '3') {
                message = '비밀번호를 잘못 입력하셨습니다. 비밀번호를 다시 확인해 주세요.'
            }
        }
        if(this._isMounted){
            this.setState({
              resultMessage: message,
              resultClassName: clazz
            });
        }
    }

    kakaoLogin = (e) =>{
        if(e) e.preventDefault();
        const type = 'KAKAO';
        const infoCheck = true;
        var object = {
            type,
            infoCheck
        };
        accessSnsLoginForMyInfoEdit(object, true, (retVal) => {
            this.afterEvent(retVal);
        });
    }

    facebookLogin = (e) =>{
        if(e) e.preventDefault();
        const type = 'FACEBOOK';
        const infoCheck = true;
        var object = {
            type,
            infoCheck
        };
        accessSnsLoginForMyInfoEdit(object, true, (retVal) => {
            this.afterEvent(retVal);
        });
    }

    naverLogin = (e) =>{
        if(e) e.preventDefault();
        const type = 'NAVER';
        const infoCheck = true;
        var object = {
            type,
            infoCheck
        };

        accessSnsLoginForMyInfoEdit(object, true, (retVal) => {
            this.afterEvent(retVal);
        });
    }

    appleLogin = (e) =>{
        if(e) e.preventDefault();
        const type = 'APPLE';
        const infoCheck = true;
        var object = {
            type,
            infoCheck
        };
        accessSnsLoginForMyInfoEdit(object, false, (retVal) => {
            this.afterEvent(retVal);
        });
    }

    googleLogin = (e) =>{
        if(e) e.preventDefault();
        const type = 'GOOGLE';
        const infoCheck = true;
        var object = {
            type,
            infoCheck
        };
        accessSnsLoginForMyInfoEdit(object, true, (retVal) => {
            this.afterEvent(retVal);
        });
    }

    whaleLogin = (e) => {
        if(e) e.preventDefault();
        const type = 'WHALESPACE';
        const infoCheck = true;
        var object = {
            type,
            infoCheck
        };
        accessSnsLoginForMyInfoEdit(object, true, (retVal) => {
            this.afterEvent(retVal);
        });
    }


    afterEvent = async (retVal) =>{
        const {info, history, JoinActions} = this.props;
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
            info.passwordModify = true;
            info.accessToken = object.accessToken;
            info.apiId = object.id;
            info.idToken = object.idToken;
            JoinActions.pushValues({type: "info", object: info});
            history.replace(response.data.redirectURL);
        }
        else {
            alert(response.data.msg);
        }
    }

    render() {
        const { info } = this.props;
        const { resultMessage, resultClassName, isLoginType, loginType} = this.state;
        return (
            <Fragment>
                {isLoginType == 'B' &&
                    <section className="persnal_info">
                        <h2 className="blind">
                            회원정보 수정
                        </h2>
                        <div className="guideline" />
                        <div className="persnal_cont">
                            <p className="dft_txt">
                                회원정보 수정 전 <em className="alert_em">비밀번호를 한번 더 입력</em>해 주세요.
                            </p>
                            <h2 className="info_tit mt30">
                                <label htmlFor="ipt_password">비밀번호</label>
                            </h2>
                            <input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                className="input_sm mb30"
                                name="password"
                                onChange={this.handleChange}
                                onKeyPress={this.handleKeyPress}
                                value={info.password}
                                id="ipt_password" />
                            <a
                                href=""
                                onClick={this.handleClick}
                                className="btn_round_on">
                                확인
                            </a>
                            <div className="find_validate">
                                <InfoText message={resultMessage} className={resultClassName}/>
                            </div>
                        </div>
                    </section>
                }
                {isLoginType == 'C' &&
                <section className="persnal_info">
                    <h2 className="blind">
                        회원정보 수정
                    </h2>
                    <div className="persnal_cont sns_cont">
                        <p className="dft_txt dft_txt2">
                            회원정보 수정 전 <em className="alert_em2">SNS 계정으로 한번 더 로그인 인증</em>해 주세요.
                        </p>
                        <div className="sns_info_wrap">
                            {loginType == 'NAVER' &&
                            <div
                                onClick={this.naverLogin}
                                className="sns_info info_naver m_sns_login_btn naver on">
                                네이버 로그인
                            </div>
                            }
                            {loginType == 'KAKAO' &&
                            <div
                                onClick={this.kakaoLogin}
                                className="sns_info info_kakao m_sns_login_btn kakao on">
                                카카오 로그인
                            </div>
                            }
                            {loginType == 'FACEBOOK' &&
                            <div
                                onClick={this.facebookLogin}
                                className="sns_info info_facebook m_sns_login_btn facebook on">
                                페이스북 로그인
                            </div>
                            }
                            {loginType == 'GOOGLE' &&
                            <div
                                onClick={this.googleLogin}
                                className="sns_info info_google m_sns_login_btn google on">
                                구글 로그인
                            </div>
                            }
                            {loginType == 'WHALESPACE' &&
                            <div
                                onClick={this.whaleLogin}
                                className="sns_info info_google m_sns_login_btn whale on">
                                웨일 스페이스 로그인
                            </div>
                            }
                            {loginType == 'APPLE' &&
                            <div
                                onClick={this.appleLogin}
                                className="sns_info info_apple m_sns_login_btn apple on">
                                <img src="../images/member/apple_login.png" alt="애플 로그인"/>
                            </div>
                            }
                        </div>
                    </div>
                </section>
                }
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        info : state.join.get('info').toJS()
    }),
    (dispatch) => ({
        JoinActions: bindActionCreators(joinActions, dispatch)
    })
)(withRouter(MyInfoEditContainer));