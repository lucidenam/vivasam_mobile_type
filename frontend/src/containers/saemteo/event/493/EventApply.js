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

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
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
			useCompanionName: false,
			useCompanionSchool: false,
			useNoCompanionInfo: false,
		};
	}


	componentDidMount() {
		const {eventId, history, event, SaemteoActions, eventAnswer} = this.props;
		if (!eventId) {
			history.push('/saemteo/event');
		} else {
			this.getEventInfo(eventId);
		}

		event.email = "";
		event.emailId = "";
		event.emailDomain = "";
		event.isCompanion = "";
		event.companionName = "";
		event.companionSchool = "";
		event.noCompanionInfo = false;
		event.story = "";
		event.agree1 = false;
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

		if (e.target.name === 'agree' || e.target.name === 'agree1' || e.target.name === 'agree2' || e.target.name === 'noCompanionInfo') {
			event[e.target.name] = e.target.checked;
		} else {
			event[e.target.name] = e.target.value;
		}

		if (e.target.name === 'isCompanion') {
			if (e.target.value === "Y") {
				this.setState({
					useCompanionName: false,
					useCompanionSchool: false,
					useNoCompanionInfo: false
				});
			} else {
				event.companionName = '';
				event.companionSchool = '';
				event.noCompanionInfo = false;
				this.setState({
					useCompanionName: true,
					useCompanionSchool: true,
					useNoCompanionInfo: true
				});
			}
		}

		if (e.target.name === 'companionName' || e.target.name === 'companionSchool' ) {
			event['noCompanionInfo'] = '';
		}

		if (e.target.name === 'noCompanionInfo') {
			if(event.noCompanionInfo) {
				event.companionName = '';
				event.companionSchool = '';
				this.setState({
					useCompanionName: true,
					useCompanionSchool: true
				});
			} else {
				this.setState({
					useCompanionName: false,
					useCompanionSchool: false
				});
			}
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
		const { PopupActions } = this.props;

		e.preventDefault();
		PopupActions.openPopup({title:"학교 검색", componet:<EventFindSchool handleSetSchool={this.handleSetSchool}/>});
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

	//값 입력 확인
	validateInfo = () => {
		const {event,eventAnswer} = this.props;
		const {telephoneCheck} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		if (!event.userName) {
			obj.message = '성명을 입력해주세요.';
		} else if (!reg_name.test(event.userName)) {
			obj.message = '올바른 성명 형식이 아닙니다.';
		} else if (!event.schName) {
			obj.message = '학교명을 입력해 주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (eventAnswer.eventId == 494) {
			if (!event.agree) {
				obj.message = '모든 필수 동의 선택 후 이벤트 신청을 완료해주세요.';
			}else{
				obj.result = true;
			}
		} else if(eventAnswer.eventId == 495) {
			if (event.schZipCd === "" || event.schAddr === "") {
				obj.message = '재직 학교 주소를 입력해 주세요.';
			} else if (event.addressDetail === "") {
				obj.message = '재직학교 상세주소를 입력해주세요.';
			} else if (!event.receiveGrade) {
				obj.message = '학급 정보를 입력해주세요.';
			} else if(!event.receiveClass) {
				obj.message = '학급 정보를 입력해주세요.';
			} else if(!event.receiveEtc) {
				obj.message = '학급 학생 수를 입력해주세요.';
			} else if (!event.story) {
				obj.message = '상세내용을 입력해주세요.';
			} else if (!event.agree1) {
				obj.message = '모든 필수 동의 선택 후 이벤트 신청을 완료해주세요.';
			} else {
				obj.result = true;
			}
		}
		return obj;
	};

	applyButtonClickSafe = (e) => {
		this.applyButtonClick(e.target);
	};

	applyButtonClick = (target) => {
		target.disabled = true;
		const {event, SaemteoActions, eventAnswer} = this.props;

		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}

		let userInfo = "";
		if (event.userInfo == "Y") {
			userInfo = "개인정보 불러오기";
		} else {
			userInfo = "직접 입력"
		}

		let receiveInfo = userInfo + '/' + event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + '/' + event.addressDetail;
		let answerData = "";

		if (eventAnswer.eventId == 494) {
			receiveInfo = userInfo + '/' + event.schName + '/' + event.cellphone;
		}

		if (eventAnswer.eventId == 495) {
			answerData = event.receiveGrade + "학년 " + event.receiveClass + "반^||^" + event.receiveEtc + "명^||^" + event.story;
		}

		try {
			event.eventId = eventAnswer.eventId;
			event.eventAnswerDesc = receiveInfo;
			event.eventAnswerDesc2 = answerData;
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
		const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;

		try {
			BaseActions.openLoading();

			var params = {
				eventId: event.eventId,
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
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event,eventAnswer} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;
		return (
			<section className="vivasamter">
				{
					eventAnswer.eventId === 494
						?
						<Fragment>
							<h2 className="blind">
								비바샘터 신청하기
							</h2>
							<div className="applyDtl_top">
								<div className="applyDtl_cell ta_c pick">
									<h3><strong>이벤트 1) 비바클래스, 준비됐나요?</strong></h3>
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
											<label htmlFor="ipt_school_name">소속 </label>
										</h2>
										<div className="input_wrap school_wrap style2">
											<input
												type="text"
												placeholder="예) 비바샘 고등학교"
												id="ipt_school_name"
												name="schName"
												onChange={this.handleChange}
												value={event.schName}
												className="input_sm input_school"
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
									</div>
									<div className="acco_notice_list pdside20 notice_sec mt0">
										<div className="acco_notice_cont">
									<span className="privacyTit">
										개인정보 수집 및 이용동의
									</span>
											<ul className="privacyList event2">
												<li>개인정보 수집 및 이용동의 이용 목적: 경품 발송 및 고객 문의 응대​​</li>
												<li>수집하는 개인 정보: 이름, 재직학교, 휴대전화번호​​</li>
												<li>개인정보 보유 및 이용 기간: 2024년 5월 31일까지(이용목적 달성 시 즉시 파기)​​</li>
												<li>개인정보 오기로 인한 경품 재발송은 불가능합니다. 개인정보를 꼭 확인해 주세요.​​​</li>
												<li>경품 발송을 위한 개인정보(이름, 휴대전화번호)가 서비스사에 제공됩니다.​​​</li>
												<li>(주)모바일이앤엠애드 사업자등록번호 : 215-87-19169</li>
											</ul>


											<br/>
											<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단,
												동의를 거부할 경우 교사문화 프로그램 신청이 불가합니다.</p>
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
													본인은 개인정보 수집 및 이용내역을 확인하였으며,<br/>
													이에 동의합니다.
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
						</Fragment>
						:
						<Fragment>
							<h2 className="blind">
								비바샘터 신청하기
							</h2>
							<div className="applyDtl_top">
								<div className="applyDtl_cell ta_c pick">
									<h3><strong>이벤트 2) 모여봐요, 비바클래스</strong></h3>
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
										<div>
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
										</div>

										<h2 className="info_tit">
											<label htmlFor="ipt_school_name">소속 </label>
										</h2>
										<div className="input_wrap school_wrap style2">
											<input
												type="text"
												placeholder="예) 비바샘 고등학교"
												id="ipt_school_name"
												name="schName"
												onChange={this.handleChange}
												value={event.schName}
												className="input_sm input_school"
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
												style={{display: event.userInfo == 'N' ? 'block' : 'none'}}
											>
												우편번호 검색
											</button>
										</div>
										<div className="input_wrap mt5"
											 style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
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
										<h2 className="info_tit">
											<label htmlFor="ipt_receive">학급 정보</label>
										</h2>
										<div className="type2">
											<div>
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
											<label htmlFor="ipt_phone">학급 학생 수</label>
										</h2>
										<div className="input_wrap">
											<input
												type="number"
												name="receiveEtc"
												onInput={this.inputOnlyNumber}
												onChange={this.handleChange}
												className="input_sm mb10"/>
										</div>
										<h2 className="info_tit tit_flex textarea_tit">
											<label htmlFor="ipt_phone">후기</label>
										</h2>
										<div className="input_wrap">
											<textarea
												name="story"
												id="applyContent2"
												cols="1"
												rows="10"
												maxLength="200"
												value={event.story}
												onChange={this.handleChange}
												placeholder="비바클래스>자유게시판에서 릴레이 자기소개하고 후기를 남겨주세요. (최대 200자)"
												className="textarea">
											</textarea>
										</div>
									</div>
									<div className="acco_notice_list pdside20 notice_sec mt0">
										<div className="acco_notice_cont">
									<span className="privacyTit">
										개인정보 수집 및 이용동의
									</span>
											<ul className="privacyList event2">
												<li>개인정보 수집 및 이용동의 이용 목적: 경품 발송 및 고객 문의 응대​​</li>
												<li>수집하는 개인 정보: 이름, 재직학교, 휴대전화번호​​</li>
												<li>개인정보 보유 및 이용 기간: 2024년 5월 31일까지(이용목적 달성 시 즉시 파기)​​</li>
												<li>개인정보 오기로 인한 경품 재발송은 불가능합니다. 개인정보를 꼭 확인해 주세요.​​​</li>
												<li>경품 발송을 위한 개인정보(이름, 휴대전화번호)가 서비스사에 제공됩니다.​​​</li>
												<li>(주)모바일이앤엠애드 사업자등록번호 : 215-87-19169</li>
											</ul>


											<br/>
											<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단,
												동의를 거부할 경우 교사문화 프로그램 신청이 불가합니다.</p>
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
												id="join_agree"/>
											<label
												htmlFor="join_agree"
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
										className="btn_event_apply mt35">신청하기
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
