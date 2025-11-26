import React, {Component, Fragment} from 'react';
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
		studentCnt: '',

		/* 해당 이벤트에 추가 */
		eventContents: '', // 이벤트 신청 내용 ( 꿈 명함 이유 )
		eventLength: 0,


	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}


	componentDidMount() {
		const {eventId, history, eventAnswer, SaemteoActions} = this.props;


		if (!eventId) {
			history.push('/saemteo/event');
		}

		// else if (!eventAnswer.eventId) {
		// 	common.error("참여할 이벤트 정보가 없습니다. 다시 확인해 주세요.");
		// 	history.push('/saemteo/event/view/' + eventId);
		// }


		else {
			this.getEventInfo(eventId);
		}

		if(eventAnswer.eventId === undefined) {
			eventAnswer.eventId = 447;
			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
		}
	}

	getEventInfo = async (eventId) => {
		const {history, event, SaemteoActions} = this.props;
		const response = await api.eventInfo(eventId);

		if (response.data.code && response.data.code === "0") {
			let eventInfo = response.data.eventList[0];
			event.eventId = eventInfo.eventId;
			let {memberId, name, schCode, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;

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
			event.agree1 = false;
			event.agree2 = false;
			event.receive = '교무실';

			event.youTubeJoin = '';
			event.youTubeId = '';
			event.useNumOn = false;


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

	handleChange = (e) => {
		const {event, SaemteoActions} = this.props;

		if (e.target.name === 'agree1' || e.target.name === 'agree2') {
			event[e.target.name] = e.target.checked;
		} else {
			event[e.target.name] = e.target.value;
		}

		// if (e.target.name === 'schName' || e.target.name === 'schName2') {
		// 	event[e.target.name] = e.target.checked;
		// } else {
		// 	event[e.target.name] = e.target.value;
		// }
/*
		if (e.target.name === 'schName' || e.target.name === 'schName2') {
			event[e.target.name] = e.target.value;
		} else {
			event[e.target.name] = e.target.value;
		}
*/
		if (e.target.name === 'schName2') {
			event['schName2'] = e.target.value;
		} else {
			event[e.target.name] = e.target.value;
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
		if(cellphone === ''){
			text = "";
		} else if(!this.checkPhoneNum(cellphone)){
			text = "휴대폰 번호가 유효하지 않습니다.";
		} else{
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

	//핸드폰번호 체크
	phoneCheck2 = (e) => {
		const {event} = this.props;

		e.target.value = common.autoHypenPhone(e.target.value);
		let tel2 = e.target.value;
		let text2 = '';
		let checkFlag2 = false;
		let clazz2 = 'point_red ml15';

		if (tel2 != '') {
			event.useNumOn = true;
		}

		if (tel2 === '') {
			text2 = "";
		} else if (!this.checkPhoneNum2(tel2)) {
			text2 = "휴대폰 번호가 유효하지 않습니다.";
		} else {
			clazz2 = 'point_color_blue ml15';
			text2 = "등록가능한 휴대폰 번호입니다.";
			checkFlag2 = true;
		}

		this.setState({
			phoneCheckClassName2: clazz2,
			phoneCheckMessage2: text2,
			telephoneCheck2: checkFlag2
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
	checkPhoneNum2 = (value) => {
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

	//우편번호 검색 팝업
	openPopupAddress2 = () => {
		const {PopupActions} = this.props;
		PopupActions.openPopup({title: "우편번호 검색", componet: <FindAddress handleSetAddress={this.handleSetAddress2}/>});
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

	//도로명주소 입력 후 callback
	handleSetAddress2 = (zipNo, roadAddr) => {
		const {event, PopupActions, SaemteoActions} = this.props;
		event.inputType = '직접입력';
		event.userInfo = 'N';
		event.schZipCd2 = zipNo;
		event.schAddr2 = roadAddr;
		SaemteoActions.pushValues({type: "event", object: event});
		PopupActions.closePopup();
	};

	openPopupSchool = (e) => {
		const { PopupActions } = this.props;

		e.preventDefault();
		PopupActions.openPopup({title:"학교 검색", componet:<EventFindSchool handleSetSchool={this.handleSetSchool}/>});
		// PopupActions.openPopup({title:"학교 검색", component:<EventFindSchool handleSetSchool2={this.handleSetSchool2}/>});
	}

	openPopupSchool2 = (e) => {
		const { PopupActions } = this.props;

		e.preventDefault();
		PopupActions.openPopup({title:"학교 검색", componet:<EventFindSchool handleSetSchool={this.handleSetSchool2}/>});
	}

	// 학교검색 선택후 callback
	handleSetSchool = (obj) => {
		const { event, SaemteoActions, PopupActions } = this.props;
		const { schoolName, schoolCode, zip, addr } = obj;

		event.schCode = schoolCode;
		event.schName = schoolName;
		event.schZipCd = zip;
		event.schAddr = addr;
		event.addressDetail = schoolName;

		SaemteoActions.pushValues({type:"event", object:event});
		PopupActions.closePopup();
	}

	// 학교검색 선택후 callback
	handleSetSchool2 = (obj) => {
		const { event, SaemteoActions, PopupActions } = this.props;
		const { schoolName, schoolCode, zip, addr} = obj;

		event.schCode2 = schoolCode;
		event.schName2 = schoolName;
		event.schZipCd2 = zip;
		event.schAddr2 = addr;
		event.addressDetail2 = schoolName;


		SaemteoActions.pushValues({type:"event", object:event});
		PopupActions.closePopup();
	};


	// 전하고 싶은말 입력 _  수정 시 길이 연동 및 이벤트 내용 수정
	setApplyContent = (e) => {
		if (e.target.value.length > 300) {
			// common.info("160자 이내로 입력해 주세요.");
			return false;
		}
		this.setState({
			eventLength: e.target.value.length,
			eventContents: e.target.value
		});
	};


	//값 입력 확인
	validateInfo = () => {
		const {event, eventAnswer} = this.props;
		const {telephoneCheck, telephoneCheck2} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		if (!event.schName) {
			obj.message = '재직 학교를 입력해 주세요.';
		} else if (event.schZipCd === "" || event.schAddr === "") {
			obj.message = '재직 학교 주소를 입력해 주세요.';
		} else if (event.addressDetail === "") {
			obj.message = '재직학교 상세주소를 입력해주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해 주세요.';

		// }else if (!event.userName2) {
		// 	obj.message = '마음을 받는 선생님의 성명을 입력해 주세요.';
		// } else if (!reg_name.test(event.userName)) {
		// 	obj.message = '올바른 성명 형식이 아닙니다.';
		// } else if (!event.schName2) {
		// 	obj.message = '마음을 받는 선생님의 재직 학교를 입력해 주세요.';
		// } else if (!event.schZipCd2 || !event.schAddr2) {
		// 	obj.message = '마음을 받는 선생님의 재직 학교 주소를 입력해 주세요.';
		// } else if (!event.addressDetail2) {
		// 	obj.message = '마음을 받는 선생님의 재직 학교 상세주소를 입력해 주세요.';
		// } else if (event.receive === "") {
		// 	obj.message = '수령처를 선택해주세요.';
		// } else if (event.receive === "교실" && (event.receiveGrade === "" || event.receiveClass === "")) {
		// 	obj.message = '학년 반을 입력해주세요.';
		// } else if (event.receive === "기타" && event.receiveEtc === "") {
		// 	obj.message = '수령처를 입력해주세요.';
		// } else if (event.cellphone2 === "") {
		// 	obj.message = '마음을 받는 선생님의 휴대전화번호를 입력해 주세요.';
		// } else if (!telephoneCheck2) {
		// 	obj.message = '마음을 받는 선생님의 휴대전화번호를 입력해 주세요.';
		} else if (this.state.eventContents === "") { // 내용 미입력
			obj.message = '전하고 싶은 말을 작성해 주세요.';
		} else if (!event.agree1) {
			obj.message = '유의 사항 및 개인정보 수집 및 이용 사항에 동의해 주세요.';
		} else if (!event.agree2) {
			obj.message = '유의 사항 및 개인정보 수집 및 이용 사항에 동의해 주세요.';
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


		let receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone ;

		let answer =  this.state.eventContents;

		try {
			event.eventId = eventId;
			event.eventAnswerDesc = receiveInfo;
			event.eventAnswerDesc2 = answer;
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
		// eventAnswerDesc: event.eventAnswerDesc,
		// 	eventAnswerDesc2: event.eventAnswerDesc2,
		// 	cellphone: event.cellphone,
	};

	//신청
	insertApplyForm = async () => {
		const {event, eventAnswer, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;
		const {eventId2} = this.state;
		try {
			BaseActions.openLoading();

			var params = {
				eventId: eventAnswer.eventId,
				eventAnswerDesc: event.eventAnswerDesc,
				eventAnswerDesc2: event.eventAnswerDesc2,
				cellphone: event.cellphone,
				userInfo: event.userInfo,

				schCode: event.schCode,
				schName: event.schName,
				schZipCd: event.schZipCd,
				schAddr: event.schAddr,
				addressDetail: event.addressDetail,

				schCode2: event.schCode2,
				schName2: event.schName2,
				schZipCd2: event.schZipCd2,
				schAddr2: event.schAddr2,
				addressDetail2: event.addressDetail2,


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
			history.push('/saemteo/event/view/'+eventId);
		} finally {
			setTimeout(()=>{
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
			this.initEventInfo();
		}
	}

	initEventInfo = () => {
		const {event, SaemteoActions} = this.props;

		event.teacherAnnual = null;
		event.teacherHope = '';
		SaemteoActions.pushValues({type: "event", object: event});
	}

	// maxLength 강제 적용
	checkMaxLength = (e) => {
		if (e.target.value.length > e.target.maxLength) {
			e.target.value = e.target.value.slice(0, e.target.maxLength);
		}
	}

	// 키 입력시 숫자만 입력
	inputOnlyNumber = (e) => {
		this.checkMaxLength(e);
		e.target.value = e.target.value.replace(/[^0-9.]/g, '');
	}

	render() {
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event, eventAnswer} = this.props;
		const {phoneCheckMessage, phoneCheckMessage2, phoneCheckClassName, phoneCheckClassName2} = this.state;
		// console.log(eventAnswer.eventId);
		return (
			<section className="vivasamter">
				{
					eventAnswer.eventId == 447
					?
						<Fragment>
							<h2 className="blind">
								비바샘터 신청하기
							</h2>
							<div className="applyDtl_top ">
								<div className="applyDtl_cell ta_c pick">
									<h3><strong>스승의 날 이벤트 –</strong> 감동 답장 쓰기</h3>
								</div>
							</div>
							<div className="vivasamter_apply">
								<div className="vivasamter_applyDtl pdside0">
									<div className="pdside20 pb25">
										<h2 className="info_tit">
											<label htmlFor="ipt_name">성명</label>
										</h2>
										<div className="input_wrap">
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
										<h2 className="info_tit tit_flex">
											<label htmlFor="ipt_school_name">학교정보</label>
											<ul className="join_ipt_chk">
												<li className="join_chk_list half">
													<input
														id="userInfoY"
														type="radio"
														className="checkbox_circle"
														name="userInfo"
														value="Y"
														checked={event.userInfo === 'Y'}
														onChange={this.handleUserInfo}
													/>
													<label htmlFor="userInfoY">정보 불러오기</label>
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
											<label htmlFor="ipt_school_name1">재직학교</label>
										</h2>
										<div className="input_wrap school">
											<input
												type="text"
												placeholder="예) 비바샘 고등학교"
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
										{event.userInfo == 'Y' && <p className="bulTxt mt10 ml10">* 학교 검색에서 찾으시는 학교가 없을 경우, ​직접 입력을 통해 <br/><span className="ml8">재직학교와 주소를 입력해 주세요.​</span></p>}
										{event.userInfo == 'Y' && <p className="bulTxt mb15 ml10">* 학교 검색으로 변경된 정보는 선생님의 회원 정보로 갱신됩니다.​</p>}

										<h2 className="info_tit mt30">
											<label htmlFor="ipt_address">학교 주소</label>
										</h2>
										<div className="input_wrap">
											<input
												type="text"
												placeholder="우편번호 검색을 선택하세요"
												value={event.schZipCd}
												className="input_sm"
												readOnly/>
											<button
												type="button"
												className="input_in_btn btn_gray"
												onClick={this.openPopupAddress}
											>
												우편번호 검색
											</button>
										</div>
										<div className="input_wrap mt5" style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
											<input
												type="text"
												id="ipt_address"
												value={event.schAddr}
												className="input_sm"
												readOnly/>
										</div>
										<div className="input_wrap mt5 mb25">
											<input
												type="text"
												placeholder="상세주소를 입력하세요"
												id="ipt_detail_address"
												name="addressDetail"
												onChange={this.handleChange}
												value={event.addressDetail}
												className="input_sm"/>
										</div>

										<h2 className="info_tit">
											<label htmlFor="ipt_phone">휴대전화번호</label>
										</h2>
										<div className="input_wrap mb25">
											<input
												type="tel"
												placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
												id="ipt_phone"
												name="cellphone"
												onChange={this.phoneCheck}
												value={event.cellphone}
												maxLength="13"
												className="input_sm mb5"/>
											<InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
											<p className="bulTxt mt10 ml10">* 선물(꽃)을 받은 본인의 핸드폰 번호를 적어주세요</p>
										</div>
										<h2 className="info_tit">
											<label htmlFor={"ipt_textarea"} className="tit_textarea">감동 답장 쓰기 <span>(300자 이내)</span></label>
											<p className="mt5">
												비바샘 이벤트 페이지에 노출됩니다.
											</p>
										</h2>
										<div className="input_wrap">
											<textarea name="applyContent"
													  id="ipt_textarea" cols="1"
													  rows="10" maxLength="301"
													  value={this.state.eventContents}
													  onChange={this.setApplyContent}
													  placeholder="전하고 싶은 말 300자 이내"
													  className="ipt_textarea"
											>

											</textarea>
											<div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/300</p></div>
										</div>
									</div>
									<div className="acco_notice_list pdside20 ">
										<div className="acco_notice_cont">
											<span className="privacyTit">
												유의사항
											</span>
											<ul className="privacyList list1">
												<li>1. ‘감동 답장 쓰기’는 본 이벤트 당첨을 통해 꽃 선물을 받으신<br /> 선생님을 대상으로 하며 대상자가 아닌 경우 이벤트  참여 대상에서 제외됩니다.​​​</li>
												<li>
													2. 경품은 후기를 남긴 선생님 본인이 아닌 ‘꽃 선물을 보내신<br /> 선생님’의 휴대전화 번호로 발송됩니다.
												</li>
											</ul>
										</div>
									</div>
									<div className="checkbox_circle_box pdside20 acco_notice_list notice_sec">
										<div className="acco_notice_cont">
											<input
												type="checkbox"
												name="agree1"
												onChange={this.handleChange}
												checked={event.agree1}
												className="checkbox_circle checkbox_circle_rel"
												id="join_agree1"/>
											<label
												htmlFor="join_agree1"
												className="checkbox_circle_simple">
												<strong className="checkbox_circle_tit">
													본인은 유의사항을 확인하였습니다. ​
												</strong>
											</label>
										</div>
									</div>
									<div className="acco_notice_list pdside20 mt0">
										<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
											<ul className="privacyList type02 ">
												<li><strong>이용 목적 :</strong> 경품 발송 및 고객 문의 응대​​</li>
												<li>
													<strong>수집하는 개인 정보 :</strong> 성명, 재직학교, 휴대전화번호​​
												</li>
												<li>
													<strong>개인정보 보유 및 이용 기간 :</strong> 2023년 8월 31일까지<br />
													(이용목적 달성 시 즉시 파기)
												</li>
												<li>
													선물 발송을 위해 개인정보(성명, 주소, 연락처)가 배송업체에<br />
													제공됩니다.​​​<br />
													(㈜다우기술 사업자등록번호: 220-81-02810​​​<br />
													㈜꾸까 사업자 등록번호 264-81-32594)​
												</li>
											</ul>
											<br />
											<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 이벤트 참여가 불가합니다.</p>
										</div>
									</div>
									<div className="checkbox_circle_box pdside20 acco_notice_list notice_sec">
										<div className="acco_notice_cont">
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
													본인은 개인정보 수집 및 이용내역을 확인하였으며,<br />
													이에 동의합니다.
												</strong>
											</label>
										</div>
									</div>
									<button
										type="button"
										onClick={this.applyButtonClickSafe}
										className="btn_event_apply mt35">참여하기
									</button>
								</div>
							</div>
						</Fragment>
						:
						<Fragment>
							<h2 className="blind">
								비바샘터 신청하기
							</h2>
							<div className="applyDtl_top ">
								<div className="applyDtl_cell ta_c pick">
									<h3><strong>스승의 날 이벤트 –</strong> 꽃 배송 신청하기</h3>
								</div>
							</div>
							<div className="vivasamter_apply">
								<div className="vivasamter_applyDtl pdside0">
									<div className="pdside20 pb25">
										<div className={'applySec_top'}>
											<span>마음을 전하는 선생님</span>
										</div>
										<h2 className="info_tit">
											<label htmlFor="ipt_name">성명</label>
										</h2>
										<div className="input_wrap">
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
										<h2 className="info_tit tit_flex">
											<label htmlFor="ipt_school_name">학교정보</label>
											<ul className="join_ipt_chk">
												<li className="join_chk_list half">
													<input
														id="userInfoY"
														type="radio"
														className="checkbox_circle"
														name="userInfo"
														value="Y"
														checked={event.userInfo === 'Y'}
														onChange={this.handleUserInfo}
													/>
													<label htmlFor="userInfoY">정보 불러오기</label>
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
											<label htmlFor="ipt_school_name1">재직학교</label>
										</h2>
										<div className="input_wrap school">
											<input
												type="text"
												placeholder="예) 비바샘 고등학교"
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
										{event.userInfo == 'Y' && <p className="bulTxt mt10 ml10">* 학교 검색에서 찾으시는 학교가 없을 경우, ​직접 입력을 통해 <br/><span className="ml8">재직학교와 주소를 입력해 주세요.​</span></p>}
										{event.userInfo == 'Y' && <p className="bulTxt mb15 ml10">* 학교 검색으로 변경된 정보는 선생님의 회원 정보로 갱신됩니다.​</p>}

										<h2 className="info_tit mt30">
											<label htmlFor="ipt_address">학교 주소</label>
										</h2>
										<div className="input_wrap">
											<input
												type="text"
												placeholder="우편번호 검색을 선택하세요"
												value={event.schZipCd}
												className="input_sm"
												readOnly/>
											<button
												type="button"
												className="input_in_btn btn_gray"
												onClick={this.openPopupAddress}
											>
												우편번호 검색
											</button>
										</div>
										<div className="input_wrap mt5" style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
											<input
												type="text"
												id="ipt_address"
												value={event.schAddr}
												className="input_sm"
												readOnly/>
										</div>
										<div className="input_wrap mt5 mb25">
											<input
												type="text"
												placeholder="상세주소를 입력하세요"
												id="ipt_detail_address"
												name="addressDetail"
												onChange={this.handleChange}
												value={event.addressDetail}
												className="input_sm"/>
										</div>

										<h2 className="info_tit">
											<label htmlFor="ipt_phone">휴대전화번호</label>
										</h2>
										<div className="input_wrap mb25">
											<input
												type="tel"
												placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
												id="ipt_phone"
												name="cellphone"
												onChange={this.phoneCheck}
												value={event.cellphone}
												maxLength="13"
												className="input_sm mb5"/>
											<InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
										</div>
										<div className={'applySec_top'}>
											<span>마음을 받는 선생님</span>
										</div>
										<h2 className="info_tit">
											<label htmlFor="ipt_name">성명</label>
										</h2>
										<div className="input_wrap">
											<input
												type="text"
												placeholder="성명을 입력하세요"
												id="ipt_name2"
												name="userName2"
												onChange={this.handleChange}
												className="input_sm"
												readOnly={false}/>
										</div>
										<h2 className="info_tit">
											<label htmlFor="ipt_school_name2">재직학교</label>
										</h2>
										<div className="input_wrap school">
											<input
												type="text"
												placeholder="예) 비바샘 고등학교"
												id="ipt_school_name2"
												name="schName2"
												onChange={this.handleChange}
												className="input_sm"
												value={event.schName2}
												readOnly={false}
											/>

											{/*<button*/}
											{/*	className="input_in_btn btn_gray"*/}
											{/*	onClick={this.openPopupSchool}>*/}
											{/*	학교검색*/}
											{/*</button>*/}

										</div>
										{/*{event.userInfo == 'Y' && <p className="bulTxt mt10 ml10">* 학교 검색에서 찾으시는 학교가 없을 경우, ​직접 입력을 통해 <br/><span className="ml8">재직학교와 주소를 입력해 주세요.​</span></p>}*/}
										{/*{event.userInfo == 'Y' && <p className="bulTxt mb15 ml10">* 학교 검색으로 변경된 정보는 선생님의 회원 정보로 갱신됩니다.​</p>}*/}
										<h2 className="info_tit mt30">
											<label htmlFor="ipt_address">수령처</label>
										</h2>
										<div className="input_wrap">
											<input
												type="text"
												placeholder="우편번호"
												name="schZipCd2"
												className="input_sm"
												value={event.schZipCd2}
											/>
											<button
												type="button"
												className="input_in_btn btn_gray"
												onClick={this.openPopupAddress2}
											>
												우편번호 검색
											</button>
										</div>
										<div className="input_wrap mt5" >
											<input
												type="text"
												placeholder="주소입력"
												name="schAddr2"
												id="ipt_address2"
												className="input_sm"
												value={event.schAddr2}
											/>
										</div>
										<div className="input_wrap mt5">
											<input
												type="text"
												placeholder="상세주소를 입력하세요"
												id="ipt_detail_address2"
												name="addressDetail2"
												onChange={this.handleChange}
												value={event.addressDetail2}
												className="input_sm"/>
										</div>
										<div className={'combo_box mt5 ' + (event.receive === '교실'? 'type2' : (event.receive === '기타' ? 'type3' : 'type1'))}>
											<div className="selectbox select_sm">
												<select name="receive" id="ipt_receive" onChange={this.handleChange}>
													<option value="교무실">교무실</option>
													<option value="행정실">행정실</option>
													<option value="택배실">택배실</option>
													<option value="진로상담실">진로상담실</option>
													<option value="경비실">경비실</option>
													<option value="교실">교실</option>
													<option value="기타">기타</option>
												</select>
											</div>
											<div className={'input_wrap mt5 receiveEtc ' + (event.receive === '기타' ?  '' : 'hide')}>
												<input
													type="text"
													autoCapitalize="none"
													name="receiveEtc"
													onChange={this.handleChange}
													className="input_sm"/>
											</div>
											<div className={(event.receive === '교실' ? '' : 'hide')}>
												<div className='input_wrap mt5 receiveGradeClass'>
													<input
														type="number"
														name="receiveGrade"
														maxLength="1"
														onInput={this.inputOnlyNumber}
														onChange={this.handleChange}
														className="input_sm"/>
													<span className="label_txt">학년</span>
													<input
														type="number"
														autoCapitalize="none"
														name="receiveClass"
														maxLength="2"
														onInput={this.inputOnlyNumber}
														onChange={this.handleChange}
														className="input_sm"/>
													<span className="label_txt">반</span>
												</div>
											</div>
										</div>
										<h2 className="info_tit">
											<label htmlFor="ipt_phone">휴대전화번호</label>
										</h2>
										<div className="input_wrap mb25">
											<input
												type="tel"
												placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
												id="ipt_phone2"
												name="cellphone2"
												onChange={this.phoneCheck2}
												value={event.cellphone2}
												maxLength="13"
												className="input_sm mb5"/>
											<InfoText message={phoneCheckMessage2} className={"useNum " + (phoneCheckClassName2) + (event.useNumOn ? " on" : " ")}/>
										</div>
										<h2 className="info_tit">
											<label htmlFor={"ipt_textarea"} className="tit_textarea">전하고 싶은 말 <span>(160자 이내)</span></label>
											<p className="mt5">
												꽃과 함께 전하고 싶은 말을 남겨 주세요.<br />
												특수 문자는 편지에 프린트되지 않습니다.
											</p>
										</h2>
										<div className="input_wrap">
											<textarea name="applyContent"
													  id="ipt_textarea" cols="1"
													  rows="10" maxLength="161"
													  value={this.state.eventContents}
													  onChange={this.setApplyContent}
													  placeholder="전하고 싶은 말 160자 이내"
													  className="ipt_textarea"
											>

											</textarea>
											<div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/160</p></div>
										</div>
									</div>
									<div className="acco_notice_list pdside20 ">
										<div className="acco_notice_cont">
								<span className="privacyTit">
									유의사항
								</span>
											<ul className="privacyList list1">
												<li>1. 본인이 본인에게 선물을 보내는 것은 불가합니다.​</li>
												<li>
													2. 본 이벤트는 선생님을 위한 이벤트로 <br />
													‘상대 선생님의 재직 학교’ 로만 배송이 가능합니다.​
												</li>
												<li>
													3. 선물을 받으실 선생님에게 선물은 11일(목) ~ 12(금) 이틀에<br />
													걸쳐 배송완료 됩니다.​
												</li>
												<li>
													4. 개인정보 오기재로 인한 경품 재발송은 불가하니 신청 정보를 <br />
													꼼꼼히 확인해 주세요.
												</li>
											</ul>
										</div>
									</div>
									<div className="checkbox_circle_box pdside20 acco_notice_list notice_sec">
										<div className="acco_notice_cont">
											<input
												type="checkbox"
												name="agree1"
												onChange={this.handleChange}
												checked={event.agree1}
												className="checkbox_circle checkbox_circle_rel"
												id="join_agree1"/>
											<label
												htmlFor="join_agree1"
												className="checkbox_circle_simple">
												<strong className="checkbox_circle_tit">
													본인은 유의사항을 확인하였습니다. ​
												</strong>
											</label>
										</div>
									</div>
									<div className="acco_notice_list pdside20 mt0">
										<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
											<ul className="privacyList type02 ">
												<li><strong>이용 목적 :</strong> 경품 발송 및 고객 문의 응대​</li>
												<li className="indent_101">
													<strong>수집하는 개인 정보 :</strong> 신청자의 재직학교와 휴대전화번호, 선물<br />
													수령인의 재직학교와 휴대전화번호​
												</li>
												<li>
													<strong>개인정보 보유 및 이용 기간 :</strong> 2023년 8월 31일까지<br />
													(이용목적 달성 시 즉시 파기)​
												</li>
												<li>
													선물 발송을 위해 개인정보(성명, 주소, 연락처)가<br />
													배송업체에 제공됩니다.​<br />
													㈜다우기술 사업자등록번호: 220-81-02810​<br />
													㈜꾸까 사업자 등록번호 264-81-32594​
												</li>
											</ul>
											<br />
											<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 이벤트 참여가 불가합니다.</p>
										</div>
									</div>
									<div className="checkbox_circle_box pdside20 acco_notice_list notice_sec">
										<div className="acco_notice_cont">
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
													본인은 개인정보 수집 및 이용내역을 확인하였으며,<br />
													이에 동의합니다.
												</strong>
											</label>
										</div>
									</div>
									<button
										type="button"
										onClick={this.applyButtonClickSafe}
										className="btn_event_apply mt35">참여하기
									</button>
								</div>
							</div>
						</Fragment>
				}
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
