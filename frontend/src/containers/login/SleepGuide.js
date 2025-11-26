import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as common from 'lib/common';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import {WakeUpPopup} from 'components/login';
import * as api from "../../lib/api";
import {initializeGtag} from "../../store/modules/gtag";

class SleepGuide extends Component {
    state = {
        password: '',
        isPwdExit: false,
        cellphone: '',
        msgText: '',
        authCode: '',
        randomNumber: '',
    }

    wakeUp = async (e) => {
        e.preventDefault();
        const username = this.props.sleepId;
        const password = this.state.password;
        const {PopupActions, BaseActions} = this.props;

        if (username === null || username === '') {
            common.error('아이디를 입력하세요.');
            return;
        }
        if (password === null || password === '') {
            common.error('비밀번호를 입력하세요.');
            return;
        }

        try {
            const response = await BaseActions.awake(username, password);

            if (response.data === '0000') {
                PopupActions.openPopup({title: "휴면상태 해제 안내", componet: <WakeUpPopup sleepId={username}/>});
            } else if (response.data === 'nomember') {
                common.error('비밀번호가 일치하지 않습니다.');
            } else {
                common.error('휴면상태 해제에 실패하였습니다.');
            }
        } catch (e) {
            common.error('휴면상태 해제에 실패하였습니다.');
            console.log(e);
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            this.wakeUp(e);
        }
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/sleep/reset',
            'page_title': '휴면회원 해제｜비바샘'
        });
        if (this.props.sleepId === null || this.props.sleepId === '') {
            this.props.history.replace("/login");
        }
        this.setPwdExit();
    }

    setPwdExit = async () => {
        const {sleepId} = this.props;
        const loginType = await api.getPwdExit(sleepId);
        if (loginType != null) {
            if (loginType.data.success != true) {
                this.setState({
                    cellphone: loginType.data.msg,
                    isPwdExit: true
                });
            }
        }
    }

    componentDidUpdate() {
        if (this.props.sleepId === null || this.props.sleepId === '') {
            this.props.history.replace("/login");
        }
    }

    sendMsg = async (e) => {
        e.target.disabled = true;
        const {cellphone} = this.state;
        const response = await api.sendMsg(cellphone);
        if (response.data.code == 'success') {
            this.setState({
                randomNumber: response.data.msg,
                msgText: '인증번호를 발송했습니다.'
            });
        } else {
            alert('문자전송중 오류가 발생하였습니다. 다시한번 시도해주세요.');
            e.target.disabled = false;
        }
    }

    snsSleepWakeUp = async (e) => {
        const {authCode, randomNumber} = this.state;
        const {PopupActions, BaseActions} = this.props;
        const username = this.props.sleepId;

        if (authCode == '') {
            alert('인증번호를 입력해 주세요.');
        } else if (authCode == randomNumber) {
            const response = await BaseActions.awake(username, 'LOGINTYPE');

            if (response.data === '0000') {
                PopupActions.openPopup({title: "휴면상태 해제 안내", component: <WakeUpPopup sleepId={username}/>});
            }
        } else {
            alert('인증번호가 일치하지 않습니다. 인증번호를 다시 확인해 주세요.');
        }
    }

    handleNumberChange = (e) => {
        const {value} = e.target;
        const onlyNumber = value.replace(/[^0-9]/g, '');
        if (onlyNumber == '') return;
        this.setState({
            [e.target.name]: onlyNumber
        });
    }

    render () {
        const { sleepId } = this.props;
        const {isPwdExit, cellphone, msgText, authCode} = this.state;
        return (
            <section className="login dormant">
                <h2 className="blind">휴면회원 안내</h2>

                <div className="find_id">
                    <div className="notice_box">
                        <p><em className="notice_box_marker1">{sleepId}</em> 아이디는 1년 이상 로그인 기록이 없어<br/>
                            <em className="notice_box_marker2">휴면상태로 전환</em>된 상태입니다.</p>
                    </div>

                    <div className="find_info">
                        <p className="mb25">휴면상태를 해제하시려면 아래 인증절차를 진행해 주세요.</p>
                        {!isPwdExit &&
                        <Fragment>
                            <h2 className="info_tit">아이디</h2>
                            <input type="text" className="mb25" placeholder={sleepId} disabled/>

                            <h2 className="info_tit">비밀번호</h2>
                            <input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                className="mb30"
                                name="password"
                                onChange={this.handleChange}
                                onKeyPress={this.handleKeyPress}
                            />

                            <div>
                                <a onClick={this.wakeUp} className="btn_round_on mb10">휴면상태 해제</a>
                                <Link to="/find/pw" className="btn_round_off">비밀번호 찾기</Link>
                            </div>
                        </Fragment>
                        }

                        {isPwdExit &&
                        <Fragment>
                            <h2 className="info_tit">휴대전화번호</h2>
                            <div className="phone_val">
                                <input type="text"
                                       className="mb25"
                                       value={cellphone}
                                       disabled/>
                                <button
                                    type="button"
                                    className="input_in_btn btn_gray"
                                    onClick={this.sendMsg}>
                                    인증번호발송
                                </button>
                            </div>

                            <p>{msgText}</p>
                            <h2 className="info_tit">인증번호</h2>
                            <input type="text"
                                   className="mb25"
                                   maxlength="6"
                                   name="authCode"
                                   value={authCode}
                                   onChange={this.handleNumberChange}/>

                            <div>
                                <a onClick={this.snsSleepWakeUp} className="btn_round_on mb10">휴면회원 해제</a>
                            </div>
                        </Fragment>
                        }
                    </div>

                    <div className="guideline"></div>

                    <div className="guide_box">
                        <p className="guide_box_tel">회원정보가 기억나지 않으실 경우,<br/>
                            선생님전용 고객센터 <em className="guide_box_marker">1544-7714</em>로 연락 주시면
                            본인 확인 후 안내해 드리고 있습니다.</p>
                        <a href="tel:1544-7714" className="ico_tel"><span className="blind">전화걸기</span></a>
                    </div>
                </div>
            </section>
        )
    }
}

export default connect(
    (state) => ({
      sleepId: state.base.get('sleepId')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
  )(withRouter(SleepGuide));
