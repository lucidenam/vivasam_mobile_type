import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';
import InfoText from "../../components/login/InfoText";
import * as api from "../../lib/api";
import {accessSnsLoginForMyInfoEdit} from "../../lib/VersionUtils";
import * as joinActions from "../../store/modules/join";
import {validateResultCodeHash} from "../../lib/StringUtils";

class LeaveContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            resultMessage: '',
            resultClassName: '',
            loginType: 'LOGIN',
            isLoginType: 'A'
        };
    }

    componentDidMount = async () => {
        this._isMounted = true;
        const {info, logged, history, JoinActions} = this.props;
        //로그인 정보 없을시 return
        if (!logged) {
            history.push('/');
        }
        //패스워드 재입력하게함
        info.password = '';
        JoinActions.pushValues({type: "info", object: info});
        await this.setLoginType();

        // SNS 직접 적용
        // this.setState({
        //     loginType: 'WHALESPACE',
        //     isLoginType: 'C'
        // });
    }

    setLoginType = async () => {
        const loginType = await api.getLoginType();
        if (loginType != null) {
            if (loginType.data != 'LOGIN') {
                this.setState({
                    loginType: loginType.data,
                    isLoginType: 'C'
                })
            } else {
                this.setState({
                    isLoginType: 'B'
                })
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
        const {info, JoinActions} = this.props;
        info[e.target.name] = e.target.value;
        JoinActions.pushValues({type: "info", object: info});
    }

    handleClick = async (e) => {
        e.preventDefault();
        const {info, history} = this.props;
        let clazz = 'point_red';
        let obj = {result: false, message: ''}
        if (!info.password) {
            obj.message = '비밀번호를 입력해주세요.';
        } else {
            obj.result = true;
        }
        if (this._isMounted) {
            this.setState({
                resultMessage: obj.message,
                resultClassName: clazz
            });
        }

        if (obj.result) {
            this.checkPassword();
        }
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            this.handleClick(e);
        }
    }
    checkPassword = async () => {
        const {info, history, loginInfo, JoinActions} = this.props;
        const response = await api.checkPassword(loginInfo.memberId, info.password);
        let message = '';
        let clazz = 'point_red';
        if (response.data.code) {
            if (!validateResultCodeHash(response.data.code, response.data.hash)) {
                message = '유효하지 않은 입력입니다. 다시 시도해 주세요.'
            } else if (response.data.code === "0") {
                info.passwordModify = true;
                JoinActions.pushValues({type: "info", object: info});
                history.push('/leave/complete');
            } else if (response.data.code === "1" || response.data.code === "2") {
                message = '입력값을 다시 확인해주세요.'
            } else if (response.data.code === "3") {
                message = '비밀번호를 잘못 입력하셨습니다. 다시 확인해 주세요.'
            }
        }
        if (this._isMounted) {
            this.setState({
                resultMessage: message,
                resultClassName: clazz
            });
        }
    }

    appleLogin = (e) => {
        if (e) e.preventDefault();
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

    naverLogin = (e) => {
        if (e) e.preventDefault();
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

    kakaoLogin = (e) => {
        if (e) e.preventDefault();
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

    facebookLogin = (e) => {
        if (e) e.preventDefault();
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

    googleLogin = (e) => {
        if (e) e.preventDefault();
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
        if (e) e.preventDefault();
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

    afterEvent = async (retVal) => {
        const {info, history, JoinActions, BaseActions} = this.props;
        //세션 스토리지 삭제
        sessionStorage.removeItem('snsObject');

        const object = {
            type: retVal.type,
            leaveCheck: true,
            accessToken: retVal.accesstoken,
            id: retVal.userId,
            idToken: retVal.idtoken,
            clientsecret: retVal.clientsecret,
            code: retVal.code
        }
        try {
            const response = await api.loginSns(object);
            if (response.data.code != null && response.data.code == "sns_goLogin") {
                info.passwordModify = true;
                JoinActions.pushValues({type: "info", object: info});
                history.push(response.data.redirectURL);
            } else {
                alert(response.data.msg);
            }
        } catch (e) {
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    render() {
        const {info} = this.props;
        const {resultMessage, resultClassName, isLoginType, loginType} = this.state;

        return (
            <Fragment>
                <section className="leave">
                    <div className="leave_wrap">
                        <div className="leave_info">
                            <div className="leave_info_inner">
                                <h3 className="leave_info_title">회원 탈퇴 전 안내 사항을 꼭 확인해 주세요.</h3>
                                <div className="leave_info_txt">
                                    <span>회원님께서 비바샘 회원탈퇴를 하시게 되면</span>
                                    <ul>
                                        <li>로그인이 필요한 비바샘의 <span>각종 서비스 이용이 제한됩니다.</span></li>
                                        <li>회원님의 개인정보와 서비스 이용정보(비바샘 원격교육연수원의 이수 및 결제내역 포함) 등 모든 이력이 삭제됩니다.</li>
                                        <li>재가입하실 경우, 탈퇴 시 <span>삭제되었던 정보는 복구되지 않습니다.</span></li>
                                        <li><span>비바샘 패밀리 사이트(비바샘 교수지원서비스, 비바샘 원격교육연수원)에 가입되어 계신 경우, 모두 탈퇴처리</span>됩니다.</li>
                                        <li>비바샘 교수지원서비스의 마일리지 및 원격교육연수원의 포인트와 쿠폰을 보유한 경우, 삭제되며 삭제된 데이터는 복구되지 않습니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {isLoginType == 'B' &&
                        <div className="persnal_cont">
                            <h3>
                                회원 확인을 위해 <strong>비밀번호</strong>를 입력해 주세요.
                            </h3>
                            <input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                className="input_sm mb15"
                                name="password"
                                onChange={this.handleChange}
                                onKeyPress={this.handleKeyPress}
                                value={info.password}
                                id="ipt_password"/>
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
                        }
                        {isLoginType == 'C' &&
                        <div className="persnal_cont sns_cont">
                            <h3>
                                회원 확인을 위해 SNS 계정으로 한번 더 로그인 인증해 주세요.
                            </h3>
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
                        }
                    </div>
                </section>
                <a href="" className="btn_top"/>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        info: state.join.get('info').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        JoinActions: bindActionCreators(joinActions, dispatch)
    })
)(withRouter(LeaveContainer));