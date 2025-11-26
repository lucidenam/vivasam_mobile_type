import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as api from 'lib/api';
import {findPwd, findPwdIpin} from 'lib/api';
import * as common from 'lib/common';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from 'redux';
import {FindPwdEmailPopup} from 'components/login';
import {isEmpty, trim} from 'lodash';
import queryString from 'query-string';
import moment from "moment";
import {Cookies} from "react-cookie";

const cookies = new Cookies();
let tmpIntervalForCountdown; //휴대전화 인증번호 카운트다운용 변수
class SendTempPassword extends Component {
    state = {
        certifyMethod: 'P',
        memberName: '',
        memberId: '',
        emailId: '',
        emailDomain: '',
        cellPhone: '',
        cellPhone1: '',
        cellPhone2: '',
        cellPhone3: '',
        isValid: true,
        isOtherDomain: false,
        otherDomain: '',
        sEncData : '',
        query : {},
        result : {},
        loading: true,
        uuidForCertifiNum: '',
        certifiNum: '',
        countMinutes : 3,
        countSeconds : 0,
        cellphoneReValid : true,
        isChecked: false
    }

    componentDidMount = () => {
        const { location } = this.props;
        let query = queryString.parse(location.search);
        this.setState({
            query : query
        });

        if(!query.uuid || typeof query.uuid === 'undefined') {
        } else {
            this.getIdentificationData(query.uuid);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    //핸드폰번호 체크
    phonecheck = (e) => {
//        e.target.value = common.autoHypenPhone(e.target.value);
        this.handleChange(e);
    }

    handleChange = (e) => {
        let { isOtherDomain } = this.state;
        if(e.target.name === 'emailDomain'){
            if(e.target.value === 'otherDomain'){
                isOtherDomain = true
            }else{
                isOtherDomain = false
            }
        }
        if (e.target.name === 'sendPwAgree') {
            this.setState({
                isChecked: e.target.checked
            })
        }

        this.setState({
            [e.target.name]: e.target.value,
            isValid: true,
            isOtherDomain
        });
    }

    handleTabClick = (certifyMethod) => {
        this.setState({
            certifyMethod,
            emailId: '',
            emailDomain: '',
            cellPhone: ''
        });
    }

    countdown = async () => {
        const {countMinutes, countSeconds} = this.state;

        if (parseInt(countSeconds) > 0) {
            this.setState({
                countSeconds : parseInt(countSeconds) - 1
            });
        }
        if (parseInt(countSeconds) === 0 && parseInt(countMinutes) > 0) {
            this.setState({
                countMinutes : parseInt(countMinutes) - 1,
                countSeconds : 59
            });
        }
    }

    handleFindPw = async (e) => {
        const { BaseActions } = this.props;
        const { memberName, memberId } = this.state;
        let memberEmail = '';
        let { cellPhone1,cellPhone2,cellPhone3 }  = this.state;
        let cellPhone = cellPhone1 + cellPhone2 + cellPhone3;

        try {
            if(isEmpty(trim(memberName))) {
                common.error("성명을 입력해주세요.");
                return false;
            }

            const regExpName = /[\uac00-\ud7a3]{2,4}/;
            if(!regExpName.test(memberName)) {
                common.error("올바른 성명 형식이 아닙니다.");
                return false;
            }
            if ( !memberId || memberId.length < 4) {
                common.error("아이디를 입력해 주세요.");
                return false;
            }

            if(isEmpty(trim(cellPhone))) {
                common.error("휴대전화번호를 입력해주세요.");
                return false;
            }

            let regExpPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
            if(!regExpPhone.test(cellPhone)) {
                common.error("올바른 휴대전화번호 형식이 아닙니다.");
                return false;
            }
            cellPhone = cellPhone.trim().replace(/[^0-9]/g, '');
            memberEmail = '';

            BaseActions.openLoading({loadingType:"2"});
            const response = await findPwd(memberName, memberId, memberEmail, cellPhone);

            if (response.data != '' && response.data.result == 0) {
                if (response.data.snsYn == 'Y') {
                    alert('해당 계정은 SNS 연동로 가입된 회원입니다.\n' +
                        '로그인 페이지에서 SNS 버튼을 통해 로그인해주세요.\n인증번호 : ' + response.data.randomNumber);
                    this.setState({
                        cellphoneReValid : false,
                        countMinutes : 3,
                        countSeconds : 0,
                    })
                    tmpIntervalForCountdown = setInterval(() => {
                        this.countdown();
                        if(this.state.countMinutes <= 0 && this.state.countSeconds <= 0) {
                            this.setState({
                                cellphoneReValid : true,
                            });
                            clearInterval(tmpIntervalForCountdown);
                        }
                    }, 1000);
                } else {
                    alert("인증번호가 발송되었습니다.");
                    this.setState({
                        cellphoneReValid : false,
                        countMinutes : 3,
                        countSeconds : 0,
                    })
                    tmpIntervalForCountdown = setInterval(() => {
                        this.countdown();
                        if(this.state.countMinutes <= 0 && this.state.countSeconds <= 0) {
                            this.setState({
                                cellphoneReValid : true,
                            });
                            clearInterval(tmpIntervalForCountdown);
                        }
                    }, 1000);
                }
            } else if(response.data != '' && response.data.code == 'success') {
                //sns일때
                alert(response.data.msg);
                return;
            } else {
                alert("죄송합니다.\n\n" + "현재 시스템 안정화 작업 중이며\n" + "빠른 작업으로 서비스 이용에 차질 없도록 하겠습니다.\n" + "감사합니다.");
                return;
            }

            if((response.data.memberEmail || response.data.cellPhone) && response.data.uuidForCertifiNum) {
                this.setState({
                    uuidForCertifiNum: response.data.uuidForCertifiNum
                });
            }else {
                this.setState({
                    isValid: false
                });
            }

        } catch (e) {
            if (e.response.data && e.response.data.code === '9001') {
                common.error(e.response.data.message);
                return;
            }

            if(e.response.data && e.response.data.code === '2001') {
                this.setState({
                    isValid: false
                });
            }else {
                //다른 메세지를 노출해야할지 결정, 일단 기본메세지
                this.setState({
                    isValid: false
                });
            }

        } finally {
            BaseActions.closeLoading();
        }
    }

    getIdentificationData = async (uuid) => {
        const { PopupActions, BaseActions } = this.props;

        try {
            const result = await api.getIdentificationData(uuid);
            this.setState({result : result.data.result});

            var memberName, memberId, memberEmail, cellPhone, memberIpin;
            memberName = result.data.sName;
            memberId = result.data.existId;
            memberEmail = '';
            cellPhone = '';
            memberIpin = result.data.sCoInfo1;

            if(this.state.result) {
                BaseActions.openLoading({loadingType:"2"});
                const response = await findPwdIpin(memberName, memberId, memberEmail, cellPhone, memberIpin);
                PopupActions.openPopup({title:"비밀번호 안내", componet:<FindPwdEmailPopup memberEmail={response.data.memberEmail}/>, closeButtonHidden: true});
            } else {
                this.handleTabClick('I');
                this.setState({isValid: false});
            }
        } catch(e) {
            console.log(e);
            BaseActions.closeLoading();
            this.handleTabClick('I');
            this.setState({isValid: false});
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 700);
        }
    }

    checkCertifiNum = async () => {
        const {isValid, memberId, certifiNum, uuidForCertifiNum, memberName, cellphoneReValid, isChecked, cellPhone1, cellPhone2, cellPhone3} = this.state;

        if (cookies.get("tempPwRecent_"+memberId)) {
            alert('최근에 이미 임시 비밀번호를 발급하셨습니다. 3분 후 다시 시도해 주세요.');
            return;
        }

        if (cookies.get("tempPw_"+memberId) != undefined && Number(cookies.get("tempPw_"+memberId)) > 10) {
            alert('1일 임시비번 횟수를 모두 소진하셨습니다. 바로 이용을 원하신다면 고객센터로 전화문의 부탁드립니다.');
            return;
        }

        if (!isChecked) {
            alert('임시 비밀번호 발급에 동의해주세요.');
            return;
        }

        if(cellphoneReValid) {
            alert('인증번호 유효시간이 만료되었습니다. 다시 요청해 주세요.');
            return;
        }

        if(isValid && memberId !== '' && certifiNum !== ''  && certifiNum.length === 6 && uuidForCertifiNum !== '') {
            //서버에서 인증번호 확인
            const response = await api.checkCertifiNumResetPwd(certifiNum, uuidForCertifiNum, memberId);
            if(response.data.code === '0') {
                let cellPhone = cellPhone1 + cellPhone2 + cellPhone3;
                let phone = cellPhone.trim().replace(/[^0-9]/g, '');
                const result = await api.sendTempPwd(memberName,memberId, phone);
                if (result.data != '' && result.data.result == 0) {
                    alert("임시 비밀번호가 발송되었습니다.");

                    let min = new Date();
                    min.setTime(min.getTime() + 3*60*1000); // 3분
                    cookies.set("tempPwRecent_"+memberId, true, {expires: min});

                    if (cookies.get("tempPw_"+memberId) != undefined) {
                        cookies.set("tempPw_"+memberId, Number(cookies.get("tempPw_"+memberId))+1, {expires: moment().add(24, 'hours').toDate()});
                    } else {
                        cookies.set("tempPw_"+memberId, 1, {expires: moment().add(24, 'hours').toDate()});
                    }

                    window.document.location.href="/#/login";
                } else {
                    alert(result.data.msg);
                    return;
                }
            } else if(response.data.code === '1') {
                common.error("인증번호를 확인해주세요.");
            } else if(response.data.code === '3') {
                common.error("인증번호가 일치하지 않습니다.");
            } else {
                common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
            }
        } else {
            common.error("인증번호를 확인해주세요.");
        }
    }


    render() {
        const { certifyMethod, isValid, sEncData } = this.state;
        const certifyName = '휴대전화번호';
        return (
            <Fragment>
                <section className="tempPwd">
                    <h2 className="blind">임시 비밀번호 발급</h2>

                    <div className="tempPwdWrap">
                        <ul className="temp_info">
                            <li>선생님의 회원가입시 정보를 입력하여 본인 확인을 진행해 주세요.</li>
                            <li>임시 비밀번호는 최초 1회 로그인 시에만 사용 가능하며, 로그인 후 반드시 새 비밀번호로 변경해야 합니다.</li>
                        </ul>

                        <div className="temp_form">
                            <dl>
                                <dt><h2 className="info_tit">성명</h2></dt>
                                <dd>
                                    <input
                                        type="text"
                                        name="memberName"
                                        // placeholder="성명을 입력하세요"
                                        onChange={this.handleChange}
                                        value={this.state.memberName}
                                        className=""
                                        autoCapitalize="off"
                                    />
                                </dd>
                            </dl>

                            <dl>
                                <dt><h2 className="info_tit">아이디</h2></dt>
                                <dd>
                                    <input
                                        type="text"
                                        name="memberId"
                                        // placeholder="아이디를 입력하세요"
                                        onChange={this.handleChange}
                                        value={this.state.memberId}
                                        className=""
                                        autoCapitalize="off"
                                    />
                                </dd>
                            </dl>

                            <dl>
                                <dt><h2 className="info_tit">휴대전화번호</h2></dt>

                                <dd>
                                    <div className="inputBox phone">
                                        <input
                                            type="tel"
                                            name="cellPhone1"
                                            onChange={this.phonecheck}
                                            value={this.state.cellPhone1}
                                            maxLength="4"
                                        />
                                        <input
                                            type="tel"
                                            name="cellPhone2"
                                            onChange={this.phonecheck}
                                            value={this.state.cellPhone2}
                                            maxLength="4"
                                        />
                                        <input
                                            type="tel"
                                            name="cellPhone3"
                                            onChange={this.phonecheck}
                                            value={this.state.cellPhone3}
                                            maxLength="4"
                                        />
                                    </div>

                                    <div className="find_validate" hidden={isValid}>
                                        <p className="find_validate_txt">
                                            입력하신 정보와 일치하는 회원이 없습니다.<br/>다시 확인해 주세요
                                        </p>
                                    </div>
                                </dd>
                            </dl>

                            <dl>
                                <dt><h2 className="info_tit">인증번호 입력</h2></dt>
                                <dd>
                                    <div className="inputBox temp">
                                        <div className="inputBox">
                                            <input
                                                type="number"
                                                name="certifiNum"
                                                // placeholder="인증번호를 입력하세요"
                                                onChange={this.handleChange}
                                                value={this.state.certifiNum}
                                                maxLength="13"
                                                className="ico_at mb5"
                                            />
                                            <a
                                                onClick={this.handleFindPw}
                                                className="btn"
                                            >발송</a>
                                        </div>
                                        <p className="msgTime">({this.state.countMinutes}:{this.state.countSeconds < 10 ? `0${this.state.countSeconds}` : this.state.countSeconds})</p>
                                    </div>
                                </dd>
                            </dl>
                        </div>

                        <div className="temp_agreeBox">
                            <input
                                type="checkbox"
                                id="sendPwAgree"
                                name="sendPwAgree"
                                onChange={this.handleChange}
                                checked={this.state.isChecked}
                            />
                            <label className="label_type2" htmlFor="sendPwAgree">임시 비밀번호 발급에 동의합니다.</label>
                        </div>

                        <div className="btn_wrap">
                            <a
                                onClick={this.checkCertifiNum}
                                className="btn_full_on"
                            >임시 비밀번호 발급 받기</a>
                        </div>
                    </div>
                </section>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        type: state.join.get('type').toJS(),
        agree: state.join.get('agree').toJS(),
        check: state.join.get('check').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(SendTempPassword));