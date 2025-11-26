import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as SaemteoActions from 'store/modules/saemteo';
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

    state = {
        initialSchName: '',
        initialSchZipCd: '',
        initialSchAddr: '',
        eventInfo: '',
        phoneCheckMessage: '',
        phoneCheckMessage2: '',
        phoneCheckClassName: '',
        phoneCheckClassName2: '',
        telephoneCheck: false,
        telephoneCheck2: false,
        isSetMemberCount: '', // 참가 신청 인원
        eMailDomain: '', // Email Domain ( email ID )
        anotherEmailDomain: '', // Email Back Domain ( gmail.com / naver.com ... )
        isAnotherEmailDomain: '', // ( 0 : 직접입력 X / 1 : 직접 입력 )
        firstAnotherEmailDomain: '', //회원의 기본 이메일 주소 도메인 저장
        useEmailText: "", //이메일 유효성 검사 결과 텍스트
        useEmailClass: "", //이메일 클래스
        requestMessage: '',			// 스트랩 메시지
        dateDiv: [],
        dateDataArr: ["10월 25일"],
        eventContents: '',
        eventLength: 0,
    };


    constructor(props) {
        super(props);
        // Debounce
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
    }

    componentDidMount() {
        const {eventId, history, eventAnswer, eMailDomain} = this.props;

        if (!eventId) {
            history.push('/saemteo/event/view/' + eventId);
        } else {
            this.getEventInfo(eventId);
        }

    }

    getEventInfo = async (eventId) => {
        const {history, event, SaemteoActions} = this.props;
        const response = await api.eventInfo(eventId);
        if (response.data.code && response.data.code === "0") {
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId, name, email, schCode, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;

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
            event.cellphone2 = cellphone;
            event.agree1 = false;
            event.agree2 = false;
            event.stdGrade = "";
            event.stdClass = "";
            event.stdCnt = "";


            // if (email != null && email != '') {
            //     let splitEmail = email.split('@');
            //     event["emailId"] = splitEmail[0];
            //     event["emailDomain"] = splitEmail[1];
            //     SaemteoActions.pushValues({type: "event", object: event});
            //     this.setState({
            //         eMailDomain: event.emailId,
            //         anotherEmailDomain: event.emailDomain,
            //         firstAnotherEmailDomain: event.emailDomain
            //     });
            // }
            //
            // this.defaultEmailCheck();

            this.phonecheckByUserInfoCellphone(cellphone);

            SaemteoActions.pushValues({type: "event", object: event});

            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr,
                userCellphone: cellphone,
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
    };

    // maxLength 강제 적용
    checkMaxLength = (e) => {
        if (e.target.value.length > e.target.maxLength) {
            e.target.value = e.target.value.slice(0, e.target.maxLength);
        }
    }

    handleChange = (e) => {
        const {event, SaemteoActions} = this.props;
        if (e.target.name === 'agree1' || e.target.name === 'agree2') {
            event[e.target.name] = e.target.checked;
        } else if(e.target.name === "dateSelect") {
            let tmpDateArr = this.state.dateDataArr;
            tmpDateArr[e.target.dataset.idx] = e.target.value;
            this.setState({
                dateDataArr : tmpDateArr
            })
        } else {
            event[e.target.name] = e.target.value;
        }
        SaemteoActions.pushValues({type: "event", object: event});
    };

    handleUserInfo = (e) => {
        const {event, SaemteoActions} = this.props;
        const {initialSchName, initialSchZipCd, initialSchAddr, userCellphone, userCellphone2} = this.state;

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
        event.cellphone2 = userCellphone;

        SaemteoActions.pushValues({type: "event", object: event});
        this.handleChange(e);

        this.phonecheckByUserInfoCellphone(event.cellphone);
        this.phonecheckByUserInfoCellphone2(event.cellphone2);

    };

    // 사용자의 핸드폰정보 조회시 유효성 체크
    phonecheckByUserInfoCellphone = (cellphone) => {
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

    // 사용자의 핸드폰정보 조회시 유효성 체크
    phonecheckByUserInfoCellphone2 = (cellphone) => {
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
            phoneCheckClassName2: clazz,
            phoneCheckMessage2: text,
            telephoneCheck2: checkFlag
        });
    }


    setApplyContent = (e) => {
        if (e.target.value.length > 1000) {
            common.info("1000자 이내로 입력해 주세요.");
            return false;
        }
        this.setState({
            eventLength: e.target.value.length,
            eventContents: e.target.value
        });
    };


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
        e.preventDefault;
        const {PopupActions} = this.props;
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


    /* 이메일 체크 시작 */
    // 페이지 로딩시 이메일 체크
    defaultEmailCheck = () => {
        const {firstAnotherEmailDomain, useEmailText, useEmailClass} = this.state;
        const {event} = this.props;

        let text = '';
        let checkFlag = false;
        let clazz = 'point_red ml15';

        if (event.emailId === '') {
            text = '';
        } else if (!this.checkEmail(event.emailId + '@' + event.emailDomain)) {
            text = '이메일 주소가 유효하지 않습니다.';
        } else {
            text = '등록 가능한 이메일 주소입니다.';
            clazz = 'point_color_blue ml15';
            checkFlag = true;
        }

        this.setState({
            checkFlag: checkFlag,
            useEmailText: text,
            useEmailClass: clazz
        });

    };


    // 앞쪽 아이디 입력
    setEmailDomain = (e) => {

        const emailValue = e.target.value;
        const {anotherEmailDomain} = this.state;
        let text = '';
        let checkFlag = false;
        let clazz = 'point_red ml15';

        if (emailValue === '') {
            text = '이메일 주소가 유효하지 않습니다.';
            checkFlag = false;
        } else if (!this.checkEmail(emailValue + '@' + anotherEmailDomain)) {
            text = '이메일 주소가 유효하지 않습니다.';
            checkFlag = false;
        } else {
            text = '등록 가능한 이메일 주소입니다.';
            clazz = 'point_color_blue ml15';
            checkFlag = true;
        }

        this.setState({
            eMailDomain: emailValue,
            checkFlag: checkFlag,
            useEmailText: text,
            useEmailClass: clazz
        });

    };

    // 직접 입력일 경우 입력창이 뜨도록 설정
    setAnotherEmailDomain = (e) => {


        const selectedValue = e.target.value;
        const isDirectInput = selectedValue === "otherDomain";


        const {firstAnotherEmailDomain} = this.state;
        const {event} = this.props;

        if (e.target.name === 'emailDomain') {
            if (e.target.value === 'otherDomain') {
                this.setState({
                    isOtherDomain: 1,
                    anotherEmailDomain: '',
                    emailInputName: 'otherDomain'
                });
                event.emailDomain = "";

                this.defaultEmailCheck();
            } else if (e.target.value === 'firstDomain') {
                this.setState({
                    isOtherDomain: 1,
                    anotherEmailDomain: firstAnotherEmailDomain,
                    emailInputName: 'firstDomain'
                })
            } else {
                const emailValue = e.target.value;
                const {eMailDomain} = this.state;
                let text = '';
                let checkFlag = false;
                let clazz = 'point_red ml15';

                if (eMailDomain === '' || emailValue === '') {
                    text = '';
                } else if (!this.checkEmail(eMailDomain + '@' + emailValue)) {
                    text = '이메일 주소가 유효하지 않습니다.';
                } else {
                    text = '등록 가능한 이메일 주소입니다.';
                    clazz = 'point_color_blue ml15';
                    checkFlag = true;
                }

                this.setState({

                    isOtherDomain: isDirectInput,
                    anotherEmailDomain: isDirectInput ? "" : selectedValue,
                    // isOtherDomain: 0,
                    // anotherEmailDomain: emailValue,
                    emailInputName: emailValue,
                    useEmailText: text,
                    useEmailClass: clazz,
                    checkFlag: checkFlag
                });

            }
        }

    };

    // 직접 이메일 입력시 값 입력
    setHandsAnotherEmailDomain = (e) => {
        // const anotherEmailDomain  = e.target.value;
        const {eMailDomain} = this.state;
        const anotherEmailValue = e.target.value;
        let text = '';
        let checkFlag = false;
        let clazz = 'point_red ml15';

        if (eMailDomain === '' || anotherEmailValue === '') {
            // text = '';
            text = '이메일 주소가 유효하지 않습니다.';


        } else if (!this.checkEmail(eMailDomain + '@' + anotherEmailValue)) {
            text = '이메일 주소가 유효하지 않습니다.';
        } else {
            text = '등록 가능한 이메일 주소입니다.';
            clazz = 'point_color_blue ml15';
            checkFlag = true;
        }

        this.setState({
            anotherEmailDomain: anotherEmailValue,
            emailInputName: 'otherDomain',
            useEmailText: text,
            useEmailClass: clazz
        });

    };

    checkEmail = (value) => {
        if (!value) return false;

        var emailRegex = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
        // var emailRegex = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
        return emailRegex.test(value);
    };

    /* 이메일 체크 끝 */

    //값 입력 확인
    validateInfo = () => {
        const {event} = this.props;
        const {telephoneCheck, eventContents} = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        let obj = {result: false, message: ''};

        //방문 희망일 중복체크
        let isDuplicateDate = false;
        const dateSet = new Set(this.state.dateDataArr);
        if(this.state.dateDataArr.length !== dateSet.size) isDuplicateDate = true;

        if (!event.userName) {
            obj.message = '성명을 입력해주세요.';
        } else if (!reg_name.test(event.userName)) {
            obj.message = '올바른 성명 형식이 아닙니다.';
        } else if (!event.schName) {
            obj.message = '학교명을 입력해주세요.';
        } else if (event.cellphone === "") {
            obj.message = '휴대전화번호를 입력해주세요.';
        } else if (!telephoneCheck) {
            obj.message = '휴대전화번호를 입력해주세요.';
        } else if (!eventContents || eventContents === "") {
            obj.message = '사연 내용 입력해 주세요.';
        } else if (!event.agree1) {
            obj.message = '필수 동의 선택 후 이벤트 신청을 완료해주세요.';
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
        const {event, eventAnswer, SaemteoActions, eventId} = this.props;

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

        let receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone;

        try {
            event.eventId = eventId;
            event.eventAnswerDesc = receiveInfo;
            SaemteoActions.pushValues({type: "event", object: event});
            // 신청 처리
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    };


    handleClose = async (e) => {
        e.preventDefault();
        const {eventId, PopupActions, history} = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/' + eventId);
    };

    //신청
    insertApplyForm = async () => {
        const {event, eventAnswer, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;

        const eventAnswerDesc2 = this.state.eventContents;

        try {
            BaseActions.openLoading();

            var params = {
                eventId: eventId,
                eventAnswerDesc: event.eventAnswerDesc,
                eventAnswerDesc2:  eventAnswerDesc2,
                cellphone: event.cellphone,
                userInfo: event.userInfo,
                schCode: event.schCode,
            };
            let response = await SaemteoActions.insertEventApply(params);

            if (response.data.code === '1') {
                common.error("이미 신청 하셨습니다.");
            } else if (response.data.code === '0') {
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
                // 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
                if (event.schCode && event.schCode !== this.state.initialSchCode) {
                    MyclassActions.myClassInfo();
                }
            } else if (response.data.code === '4') {
                throw new Error('준비된 경품 수량이 모두 소진되었습니다.');
            } else {
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
            common.info(e.message);
            history.push('/saemteo/event/view/'+eventId);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    //날짜 셀렉트 박스 추가
    // addChildComponent = () => {
    //
    //     //state 배열에 slice 메서드로 배열을 복사한다.
    //     const newChildren = this.state.dateDiv.slice();
    //     const newDataArr = this.state.dateDataArr.slice();
    //
    //     //복사한 배열에 셀렉트 박스 컴포넌트를 추가해준다(각 자식들은 고유한 키값을 가져야함)
    //     if(newChildren.length < 2 ){
    //         newChildren.push(<DateSelector key={newChildren.length} handleChange={this.handleChange} idx={(newChildren.length + 2)}/>);
    //         newDataArr.push("10월 25일");
    //     }
    //
    //     //state를 컴포넌트를 추가한 배열값으로 갱신한다.
    //     this.setState({
    //         dateDiv : newChildren,
    //         dateDataArr : newDataArr
    //     });
    //
    // };

    removeChildComponent = () => {

        const newChildren = this.state.dateDiv.slice();
        const newDataArr = this.state.dateDataArr.slice();

        //pop메서드로 배열의 마지막 요소를 제거하고 반환
        newChildren.pop();
        newDataArr.pop();

        //마지막 요소가 제거된 state를 다시 갱신
        this.setState({
            dateDiv : newChildren,
            dateDataArr: newDataArr
        });

    };

    render() {
        const {event, eventAnswer} = this.props;
        const {eventInfo, phoneCheckMessage, phoneCheckMessage2, phoneCheckClassName, phoneCheckClassName2, dateDiv} = this.state;
        if (eventInfo === '') return <RenderLoading/>;

        return (
            <section className="vivasamter">
                <h2 className="blind">
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top ">
                    <div className="applyDtl_cell ta_c pick">
                        <h3>
                            <strong>우리의 교과서 '우리'의 교실 이벤트</strong> 신청하기
                        </h3>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <div className="vivasamter_applyDtl pdside0">
                        <div className="pdside20 pb25">
                            <h2 className="info_tit">
                                <label htmlFor="ipt_name">성명</label>
                            </h2>
                            <div className="input_wrap input_nameV2 ">
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
                            <h2 className="info_tit tit_flex school_info">
                                <label htmlFor="ipt_name">학교 정보</label>
                                <ul className="join_ipt_chk ">
                                    <li className="join_chk_list half ml38">
                                        <input
                                            id="userInfoY"
                                            type="radio"
                                            className="checkbox_circle"
                                            name="userInfo"
                                            value="Y"
                                            checked={event.userInfo === 'Y'}
                                            onChange={this.handleUserInfo}
                                        />
                                        <label htmlFor="userInfoY">학교정보 불러오기</label>
                                    </li>
                                    <li className="join_chk_list half">
                                        <input
                                            id="userInfoN"
                                            type="radio"
                                            className="checkbox_circle"
                                            name="userInfo"
                                            value="N"
                                            checked={event.userInfo === 'N'}
                                            onChange={this.handleUserInfo}
                                        />
                                        <label htmlFor="userInfoN">직접입력</label>
                                    </li>
                                </ul>
                            </h2>
							<h2 className="info_tit">
								<label htmlFor="ipt_name">소속</label>
							</h2>
							<div className="input_wrap school">
								<input
									type="text"
									placeholder="예) 비바샘 고등학교"
									onClick={this.clearPlaceHolder}
									id="ipt_school_name"
									name="schName"
									onChange={this.handleChange}
									value={event.schName}
									className="input_sm"
									readOnly={event.userInfo === 'Y'}
								/>
								{
									event.userInfo === 'Y' ?
										<button
											className="input_in_btn btn_gray"
											onClick={this.openPopupSchool}>
											학교검색
										</button> : ''
								}
							</div>
                            <h2 className="info_tit">
                                <label htmlFor="ipt_phone">휴대전화번호</label>
                            </h2>
                            <div className="input_wrap mb25">
                                <input
                                    type="tel"
                                    placeholder="휴대전화번호를 입력하세요 (예 : 010-2345-6789)"
                                    id="ipt_phone2"
                                    name="cellphone"
                                    onChange={this.phoneCheck}
                                    value={event.cellphone}
                                    maxLength="13"
                                    className="input_sm mb5"/>
                                <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                            </div>
                            <div className="tit_flex flex_style_between pb10">
                                <h2 className="info_tit pb0">
                                    <label htmlFor="ipt_textarea">신청사연 <span className="c_o">(1,000자 이내)</span></label>
                                </h2>
                                <div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/1,000</p></div>
                            </div>
                            <div className="input_wrap">
								<textarea
                                    name="applyContent"
                                    id="ipt_textarea"
                                    cols="1"
                                    rows="10"
                                    maxLength="1000"
                                    value={this.state.eventContents}
                                    onChange={this.setApplyContent}
                                    placeholder="운동장, 교과서, 친구, 선생님. 우리가 함께 웃고 배우고 지내는&#13;&#10;교실, 학교에서 있었던 다양한 이야기를 들려주세요!&#13;&#10;(1,000자 이내)"
                                    className="ipt_textarea">
								</textarea>

                            </div>
                        </div>
                        <div className="acco_notice_list pdside20 mt0">
                            <div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
                                <ul className="privacyList type02 ">
                                    <li>개인정보 수집 및 이용동의 이용 목적: 경품 발송 및 고객 문의 응대​​</li>
                                    <li>수집하는 개인 정보 : 이름, 소속(재직 학교), 휴대전화번호</li>
                                    <li>
                                        주소개인정보 보유 및 이용 기간: 이용목적 달성 시 즉시 파기
                                    </li>
                                    <li>
                                        개인정보 오기로 인한 경품 재발송은 불가능합니다.
                                        개인정보를 꼭 확인해 주세요.​​
                                    </li>
                                    <li>
                                        경품 발송을 위한 개인정보(성함, 휴대전화번호)가
                                        서비스사에 제공됩니다.​​<br/>
                                        ㈜다우기술 사업자등록번호: 220-81-02810<br/>
                                        ㈜카카오 사업자등록번호: 120-81-47521
                                    </li>
                                </ul>
                                <br/>
                                <p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우
                                    이벤트 참여가 불가합니다.</p>
                            </div>
                        </div>
                        <div className="checkbox_circle_box pdside20 acco_notice_list notice_sec acco_notice_list_last">
                            <div className="acco_notice_cont">
                                <input
                                    type="checkbox"
                                    name="agree1"
                                    onChange={this.handleChange}
                                    checked={event.agree1}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree2"/>
                                <label
                                    htmlFor="join_agree2"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 개인정보 수집 및 이용내역을 확인하였으며,<br/>
                                        이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={this.applyButtonClickSafe}
                            className="btn_event_apply mt25">참여하기
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));