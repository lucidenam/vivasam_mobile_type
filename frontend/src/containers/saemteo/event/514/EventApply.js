import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import InfoText from 'components/login/InfoText';
import FindAddress from 'containers/login/FindAddress';
import EventFindSchool from "containers/saemteo/EventFindSchool";
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';

import './Event.css';

class EventApply extends Component {

    constructor(props) {
        super(props);
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
        this.withPeopleNumberRef = React.createRef();
        this.state = {
            initialSchName: '',
            initialSchZipCd: '',
            initialSchAddr: '',
            eventInfo: '',
            phoneCheckMessage: '',
            phoneCheckClassName: '',
            telephoneCheck: false,
            studentCnt: '',
            eMailDomain: '', // Email Domain ( email ID )
            anotherEmailDomain: '', // Email Back Domain ( gmail.com / naver.com ... )
            isAnotherEmailDomain: '', // ( 0 : 직접입력 X / 1 : 직접 입력 )
            firstAnotherEmailDomain: '', //회원의 기본 이메일 주소 도메인 저장

            companion: '',
            companionSchool: '',
        };
    }


    componentDidMount() {
        const {eventId, history, event, SaemteoActions} = this.props;

        if (!eventId) {
            history.push('/saemteo/event');
        } else {
            this.getEventInfo(eventId);
        }

        event.email = "";
        event.emailId = "";
        event.emailDomain = "";
        event.isCompanion = "N";
        event.agree = false;
        event.agree2 = false;
        SaemteoActions.pushValues({type: "event", object: event});
    }

    getEventInfo = async (eventId) => {
        const {history, event, SaemteoActions} = this.props;
        const {isAnotherEmailDomain, anotherEmailDomain} = this.state;
        const response = await api.eventInfo(eventId);

        if (response.data.code && response.data.code === "0") {
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId, name, schCode, schName, schZipCd, schAddr, cellphone, email} = response.data.memberInfo;

            // 학교코드가 99999, 99998, 99997일 경우 학교가 설정되지 않은 것으로 간주하여 정보불러오기에서 사용하는 정보를 공백처리한다.
            if (!schCode || schCode === 99999 || schCode === 99998 || schCode === 99997) {
                schName = '';
                schZipCd = '';
                schAddr = '';
            }

            event.memberId = memberId;
            event.userName = name;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.addressDetail = schName;
            event.inputType = '개인정보 불러오기';
            event.userInfo = 'Y';
            event.cellphone = cellphone;
            event.email = email;
            event.agree = false;
            event.receive = '교실';

            if (email != null && email != '') {
                let splitEmail = email.split('@');
                event["emailId"] = splitEmail[0];
                event["emailDomain"] = splitEmail[1];
                SaemteoActions.pushValues({type: "event", object: event});
                this.setState({
                    eMailDomain: event.emailId,
                    anotherEmailDomain: event.emailDomain,
                    firstAnotherEmailDomain: event.emailDomain
                });
            }
            this.phoneCheckByUserInfoCellphone(cellphone);
            SaemteoActions.pushValues({type: "event", object: event});

            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr,
                userCellphone: cellphone
            });
        } else if (response.data.code && response.data.code === "3") {
            common.info("이미 신청하셨습니다.");
            history.replace(history.location.pathname.replace('apply', 'view'));
        } else {
            history.push('/saemteo/index');
        }
    };

    // 키 입력시 숫자만 입력
    inputOnlyNumber = (e) => {
        this.checkMaxLength(e);
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
        this.checkMaxNumber(e);
    }

    // 0~10까지만 입력하도록 함
    checkMaxNumber = (e) => {
        if (e.target.value > 3) {
            e.target.value = 3;
            common.info("동반 선생님은 최대 3명입니다.");
        } else if (e.target.value > 0) {
            e.target.value = parseInt(e.target.value);
        } else if (e.target.value === '00') {
            e.target.value = 0;
        }
    }

    handleChange = (e) => {
        const {event, SaemteoActions} = this.props;

        if (e.target.name === 'agree' || e.target.name === 'agree2') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        let withPeopleNumber = event.withPeopleNumber;

        if (e.target.name === 'isCompanion') {
            if (e.target.value === 'N') {
                withPeopleNumber = "0";
                this.withPeopleNumberRef.current.value = "0";
            } else if (e.target.value === 'Y') {
                if (this.withPeopleNumberRef.current) {
                    this.withPeopleNumberRef.current.value = '';
                }
            }

            this.setState({
                companyYn: e.target.value,
                withPeopleNumber: withPeopleNumber
            });

        }

        SaemteoActions.pushValues({type: "event", object: event});
    };

    handleUserInfo = (e) => {
        const {event, SaemteoActions} = this.props;
        const {initialSchName, initialSchZipCd, initialSchAddr, userCellphone} = this.state;

        if (e.target.value === 'Y') {
            event.inputType = '개인정보 불러오기';
            event.schName = initialSchName;
            event.schZipCd = initialSchZipCd;
            event.schAddr = initialSchAddr;
            event.addressDetail = initialSchName;
        } else {
            event.inputType = '직접입력';
            event.schName = '';
            event.schZipCd = '';
            event.schAddr = '';
            event.addressDetail = '';
        }

        event.cellphone = userCellphone;
        SaemteoActions.pushValues({type: "event", object: event});
        this.handleChange(e);
        this.phoneCheckByUserInfoCellphone(event.cellphone);
    };

    // 사용자의 핸드폰정보 조회시 유효성 체크
    phoneCheckByUserInfoCellphone = (cellphone) => {
        let text = '';
        let checkFlag = false;
        let clazz = 'point_red ml15';
        if (cellphone === '') {
            text = "";
        } else if (!this.checkPhoneNum(cellphone)) {
            text = "휴대폰 번호가 유효하지 않습니다.";
        } else {
            clazz = 'point_color_blue ml15';
            text = "등록가능한 휴대폰 번호입니다.";
            checkFlag = true;
        }
        this.setState({
            phoneCheckClassName: clazz,
            phoneCheckMessage: text,
            telephoneCheck: checkFlag
        });
    }

    //핸드폰번호 체크
    phoneCheck = (e) => {
        e.target.value = common.autoHypenPhone(e.target.value);
        let tel = e.target.value;
        let text = '';
        let checkFlag = false;
        let clazz = 'point_red ml15';

        if (tel === '') {
            text = "";
        } else if (!this.checkPhoneNum(tel)) {
            text = "휴대폰 번호가 유효하지 않습니다.";
        } else {
            clazz = 'point_color_blue ml15';
            text = "등록가능한 휴대폰 번호입니다.";
            checkFlag = true;
        }

        this.setState({
            phoneCheckClassName: clazz,
            phoneCheckMessage: text,
            telephoneCheck: checkFlag
        });

        this.handleChange(e);
    };

    checkPhoneNum = (value) => {
        if (!value) return false;

        if (value === '' || value.length === 0) {
            return false;
        } else if (value.indexOf("01") !== 0) {
            return false;
        } else if (value.length !== 13) {
            return false;
        }

        return true;
    };

    //우편번호 검색 팝업
    openPopupAddress = () => {
        const {PopupActions} = this.props;
        PopupActions.openPopup({title: "우편번호 검색", componet: <FindAddress handleSetAddress={this.handleSetAddress}/>});
    };

    //도로명주소 입력 후 callback
    handleSetAddress = (zipNo, roadAddr) => {
        const {event, PopupActions, SaemteoActions} = this.props;
        event.inputType = '직접입력';
        event.userInfo = 'N';
        event.schZipCd = zipNo;
        event.schAddr = roadAddr;
        SaemteoActions.pushValues({type: "event", object: event});
        PopupActions.closePopup();
    };

    openPopupSchool = (e) => {
        const {PopupActions} = this.props;

        e.preventDefault();
        PopupActions.openPopup({title: "학교 검색", componet: <EventFindSchool handleSetSchool={this.handleSetSchool}/>});
    }

    // 학교검색 선택후 callback
    handleSetSchool = (obj) => {
        const {event, SaemteoActions, PopupActions} = this.props;
        const {schoolName, schoolCode, zip, addr} = obj;

        event.schCode = schoolCode;
        event.schName = schoolName;
        event.schZipCd = zip;
        event.schAddr = addr;
        event.addressDetail = schoolName;

        SaemteoActions.pushValues({type: "event", object: event});
        PopupActions.closePopup();
    }

    //값 입력 확인
    validateInfo = () => {
        const {event} = this.props;
        const {telephoneCheck} = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        let obj = {result: false, message: ''};

        if (!event.userName) {
            obj.message = '성명을 입력해주세요.';
        } else if (!reg_name.test(event.userName)) {
            obj.message = '올바른 성명 형식이 아닙니다.';
        } else if ((this.state.eMailDomain === "") || (this.state.anotherEmailDomain === "")) {
            obj.message = '이메일을 입력해 주세요.';
        } else if (event.telephone === "") {
            obj.message = '휴대전화번호를 입력해주세요.';
        } else if (!telephoneCheck) {
            obj.message = '휴대전화번호를 입력해주세요.';
        } else if (!event.isCompanion) {
            obj.message = '동반 선생님 유무를 선택해 주세요.';
        // } else if (event.isCompanion === "Y" && (!this.state.withPeopleNumber || this.state.withPeopleNumber === "0" || this.state.withPeopleNumber === 0)) {
        } else if (event.isCompanion === "Y" && (!event.withPeopleNumber || event.withPeopleNumber <= 0)) {
            obj.message = '동반 선생님 인원을 입력하시거나, 없을 경우 없음에 체크해 주세요.';
        } else if (!event.agree || !event.agree2) {
            obj.message = '모든 필수 동의 선택 후 이벤트 신청을 완료해주세요.';
        } else {
            obj.result = true;
        }

        return obj;
    };

    applyButtonClickSafe = (e) => {
        this.applyButtonClick(e.target);
    };

    applyButtonClick = (target) => {
        target.disabled = true;
        const {event, SaemteoActions, eventAnswer, eventId} = this.props;

        let obj = this.validateInfo();
        if (!obj.result) {
            common.error(obj.message);
            target.disabled = false;
            return false;
        }

        let receive = event.receive;
        if (event.receive === "기타") {
            receive = event.receiveEtc;
        } else if (event.receive === "교실") {
            receive = event.receiveGrade + '학년 ' + event.receiveClass + '반';
        }

        let receiveInfo = this.state.eMailDomain + '@' + this.state.anotherEmailDomain + '/' + event.cellphone;

        let companionInfo = "";
        if (event.isCompanion === "Y") {
            companionInfo += " 동반 선생님 있음" + "^||^" + event.withPeopleNumber + "명";
        } else {
            companionInfo += "동반 선생님 없음" + "^||^" + "0명";
        }

        try {
            event.eventId = eventId;
            event.eventAnswerDesc = receiveInfo;
            event.eventAnswerDesc2 = companionInfo;
            SaemteoActions.pushValues({type: "event", object: event});
            // 신청 처리
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    };

    handleClose = async (e) => {
        if (e != undefined) {
            e.preventDefault();
        }
        const {eventId, PopupActions, history} = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/' + eventId);
    };

    //신청
    insertApplyForm = async () => {
        const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;

        try {
            BaseActions.openLoading();

            var params = {
                eventId: eventId,
                eventAnswerDesc: event.eventAnswerDesc,
                eventAnswerDesc2: event.eventAnswerDesc2,
                cellphone: event.cellphone,
                userInfo: event.userInfo,
                schCode: event.schCode,
            };

            let response = await SaemteoActions.insertEventApply(params);

            if (response.data.code === '1') {
                common.error("이미 신청 하셨습니다.");
            } else if (response.data.code === '0') {
                PopupActions.openPopup({title: "신청완료",
                    componet: <EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList}
                                                 handleClose={this.handleClose}/>
                });
                // 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
                if (event.schCode && event.schCode !== this.state.initialSchCode) {
                    MyclassActions.myClassInfo();
                }
            } else if (response.data.code === '5') {
                common.error("마일리지의 잔액이 모자랍니다. 다시 확인해주세요.");
            } else if (response.data.code === '6') {
                common.error("마일리지 적립/차감에 실패하였습니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            } else {
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }

        } catch (e) {
            console.log(e);
            common.info(e.message);
            history.push('/saemteo/event/view/' + eventId);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    // maxLength 강제 적용
    checkMaxLength = (e) => {
        if (e.target.value.length > e.target.maxLength) {
            e.target.value = e.target.value.slice(0, e.target.maxLength);
        }
    };

    setEmailDomain = (e) => {
        this.setState({
            eMailDomain: e.target.value
        });
    };

    // 직접 입력일 경우 입력창이 뜨도록 설정
    setAnotherEmailDomain = (e) => {
        const {firstAnotherEmailDomain} = this.state;

        if (e.target.name === 'emailDomain') {
            if (e.target.value === 'otherDomain') {
                this.setState({
                    isOtherDomain: 1,
                    anotherEmailDomain: ''
                });
            } else if (e.target.value === 'firstDomain') {
                this.setState({
                    isOtherDomain: 1,
                    anotherEmailDomain: firstAnotherEmailDomain,
                })
            } else {
                this.setState({
                    isOtherDomain: 0,
                    anotherEmailDomain: e.target.value
                })
            }
        }
    };

    // 직접 이메일 입력시 값 입력
    setHandsAnotherEmailDomain = (e) => {
        this.setState({
            anotherEmailDomain: e.target.value
        });
    };

    render() {
        const {eventInfo, eMailDomain, anotherEmailDomain} = this.state;
        if (eventInfo === '') return <RenderLoading/>;
        const {event} = this.props;
        const {phoneCheckMessage, phoneCheckClassName} = this.state;
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell ta_c pick">
                        <h3><strong>55차 교사문화프로그램 신청하기</strong></h3>
                    </div>
                    <div className="applyDtl_cell ta_c pick">
                        <p>
                            당첨 시 관련 안내 연락을 받을 수 있는<br/>
                            휴대전화번호와 이메일 주소를 꼭 확인해 주세요.
                        </p>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <div className="vivasamter_applyDtl pdside0">
                        <div className="pdside20 pb25">
                            <h2 className="info_tit tit_flex">
                                <label htmlFor="ipt_name ">성명</label>
                                <div className="input_wrap input_name">
                                    <input
                                        type="text"
                                        placeholder="성명을 입력하세요"
                                        id="ipt_name"
                                        name="userName"
                                        onChange={this.handleChange}
                                        value={event.userName}
                                        className="input_sm"
                                        readOnly={true}/>
                                </div>
                            </h2>
                            <h2 className="info_tit">
                                <label htmlFor="ipt_email">이메일</label>
                            </h2>
                            <div className="input_wrap multi_wrap email">
                                <input
                                    type="text"
                                    name="email"
                                    ref="email"
                                    onChange={this.setEmailDomain}
                                    className="input_sm input_fix_wrap"
                                    value={eMailDomain}
                                    id="ipt_email"/>
                                <span className="label_txt">@</span>
                                <input
                                    type="text"
                                    name="otherDomain"
                                    ref="otherDomain"
                                    placeholder="예) domain.com"
                                    autoCapitalize="none"
                                    className="input_sm ico_at "
                                    onChange={this.setHandsAnotherEmailDomain}
                                    value={anotherEmailDomain}
                                    id="check_domain"
                                    // disabled={!this.state.isOtherDomain} // 활성화 여부를 disabled 속성으로 지정
                                />
                            </div>
                            <div className="selectbox select_sm mt5">
                                <select name="emailDomain" ref="emailDomain" id="ipt_email" className="mb10"
                                        onChange={this.setAnotherEmailDomain}>
                                    <option value="firstDomain">선택</option>
                                    <option value="otherDomain">직접입력</option>
                                    <option value="gmail.com">gmail.com</option>
                                    <option value="daum.net">daum.net</option>
                                    <option value="hanmail.net">hanmail.net</option>
                                    <option value="naver.com">naver.com</option>
                                    <option value="nate.com">nate.com</option>
                                </select>
                                <InfoText message={this.state.useEmailText} className={this.state.useEmailClass}/>
                            </div>

                            <h2 className="info_tit">
                                <label htmlFor="ipt_phone">휴대전화번호</label>
                            </h2>
                            <div className="input_wrap">
                                <input
                                    type="tel"
                                    placeholder="휴대폰 번호를 입력하세요 (예 : 010-2345-6789)"
                                    id="ipt_phone"
                                    name="cellphone"
                                    onChange={this.phoneCheck}
                                    value={event.cellphone}
                                    maxLength="13"
                                    className="input_sm mb10"/>
                                <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                            </div>
                            <h2 className="info_tit chk_tit">
                                <label htmlFor="ipt_phone">동반 선생님</label>
                                <ul className="join_ipt_chk">
                                    <li className="join_chk_list" style={{width: '45%'}}>
                                        <input
                                            type="radio"
                                            name="isCompanion"
                                            id="teacherRdo1"
                                            value="Y"
                                            checked={event.isCompanion === 'Y'}
                                            onChange={this.handleChange}
                                            className="checkbox_circle"
                                        />
                                        <label htmlFor="teacherRdo1">있음</label>
                                    </li>
                                    <li className="join_chk_list">
                                        <input
                                            type="radio"
                                            name="isCompanion"
                                            id="teacherRdo2"
                                            className="checkbox_circle"
                                            value="N"
                                            checked={event.isCompanion === 'N'}
                                            onChange={this.handleChange}
                                        />
                                        <label htmlFor="teacherRdo2">없음</label>
                                    </li>
                                </ul>
                            </h2>

                            <p className="evtForm_labelTxt">*동반 선생님의 경우 최대 3명까지만 가능합니다.</p>
                            <p className="evtForm_labelTxt">* <span className="c_o">선생님 대상으로 하는 프로그램으로 선생님만 동반 참여</span>하실
                                수 있습니다.</p>
                            <h2 className={"info_tit"}>
                                <label htmlFor="ipt_teacher_num">동반 선생님 수</label>
                            </h2>
                            <div className="input_wrap join_ipt_chk">
                                <input
                                    ref={this.withPeopleNumberRef}
                                    type="number"
                                    id="ipt_teacher_num"
                                    name="withPeopleNumber"
                                    maxLength={1}
                                    onInput={this.inputOnlyNumber}
                                    onChange={this.handleChange}
                                    readOnly={this.state.companyYn !== 'Y'}
                                    defaultValue={0}
                                    className="input_sm"
                                    disabled={this.state.companyYn == 'N'}
                                    style={this.state.companyYn !== 'Y' ? {background: '#f7f7f7', color: '#999'} : {}}/>
                                <span className="label_txt"> 명</span>
                            </div>

                        </div>

                        <div className="acco_notice_list pdside20 notice_sec mt0">
                            <div className="acco_notice_cont">
							<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
                                <ul className="privacyList event2">
                                    <li>이용목적 : 교사문화 프로그램 당첨자 연락 및 CS 문의 응대</li>
                                    <li>수집하는 개인정보 : 성명, 휴대전화번호, 이메일</li>
                                    <li>개인정보 보유 및 이용기간 : <span className={"c_o"}>2024년 12월 31일까지</span><br/>
                                        (이용목적 달성 시 즉시 파기)
                                    </li>
                                </ul>
                                <br/>
                                <p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우
                                    교사문화 프로그램 신청이 불가합니다.</p>
                            </div>
                        </div>
                        <div className="checkbox_circle_box pdside20 acco_notice_list notice_sec">
                            <div className="acco_notice_cont">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.handleChange}
                                    checked={event.agree}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree"/>
                                <label
                                    htmlFor="join_agree"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 개인정보 수집 및 이용에 동의합니다.
                                    </strong>
                                </label>

                                <input
                                    type="checkbox"
                                    name="agree2"
                                    onChange={this.handleChange}
                                    checked={event.agree2}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree2"/>
                                <label
                                    htmlFor="join_agree2"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        행사 일정 및 장소
                                        <span className="c_o">(8월 24일 토요일 14시 30분~17시/대학로 아트포레스트 1관)</span>를
                                        확인하였습니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={this.applyButtonClickSafe}
                            className="btn_event_apply mt35">신청하기
                        </button>
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event: state.saemteo.get('event').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS(),
        isApp: state.base.get('isApp')
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(EventApply));
