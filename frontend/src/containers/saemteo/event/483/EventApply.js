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

	state = {
		initialSchName: '',
		initialSchZipCd: '',
		initialSchAddr: '',
		eventInfo: '',
		phoneCheckMessage: '',
		phoneCheckClassName: '',
		telephoneCheck: false,

		// event 추가 속성
		// 동반인 여부
		withCompanion: '',
		// 동반인 수
		withCompanionNum: '',
		// 노트북 지참여부
		withNotebook: '',
		// 선택입력
		story: '',
	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);

		// this.state = {
		// 	withCompanion: 'N',
		// };
	}


	componentDidMount() {
		const {eventId, history} = this.props;

		if (!eventId) {
			history.push('/saemteo/event');
		} else {
			this.getEventInfo(eventId);
		}
	}

	// 0~10까지만 입력하도록 함
	checkMaxNumber = (e) => {
		if (e.target.value > 2) {
			e.target.value = 2;
			common.info("동반 선생님은 최대 2명입니다.");
		} else if (e.target.value > 0) {
			e.target.value = parseInt(e.target.value);
		} else if (e.target.value === '00') {
			e.target.value = 0;
		}
	}

	getEventInfo = async (eventId) => {
		const {history, event, SaemteoActions} = this.props;
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
			event.receive = '교실';
			event.agree1 = false;
			event.agree2 = false;

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

		if (e.target.name === 'agree' || e.target.name === 'agree1' || e.target.name === 'agree2') {
			event[e.target.name] = e.target.checked;
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
		const {event} = this.props;
		const {telephoneCheck, withCompanion, withCompanionNum} = this.state;

		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		if (!event.userName) {
			obj.message = '성명을 입력해주세요.';
		} else if (!reg_name.test(event.userName)) {
			obj.message = '올바른 성명 형식이 아닙니다.';
		} else if (!event.schName) {
			obj.message = '재직학교를 입력해주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!withCompanion || (withCompanion === 'Y' && (!withCompanionNum || withCompanionNum === '0'))) {
			obj.message = '동반 선생님 유무를 선택해 주세요.\n\'있음\'으로 선택하신 경우, 동반 수를 입력해 주세요';
		} else if (!event.agree1 || !event.agree2) {
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
		const {event, SaemteoActions, eventId} = this.props;

		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}

		const {withCompanionNum, story} = this.state;
		let withCompanionNumParam = parseInt(withCompanionNum) || '0';

		let receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone;
		let eventAnswer2 = withCompanionNumParam + '^||^' + story;

		try {
			event.eventId = eventId;
			event.eventAnswerDesc = receiveInfo;
			event.eventAnswerDesc2 = eventAnswer2;
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
	}

	// 키 입력시 숫자만 입력
	inputOnlyNumber = (e) => {
		this.checkMaxLength(e);
		e.target.value = e.target.value.replace(/[^0-9.]/g, '');
		this.checkMaxNumber(e);
	}

	// 이벤트 추가 핸들러
	handleChangeWithCompanion = (e) => {
		let withCompanionNum = this.state.withCompanionNum;
		if (e.target.value === 'N') {
			withCompanionNum = '';
		}
		this.setState({
			withCompanion: e.target.value,
			withCompanionNum: withCompanionNum
		});
	}

	handleChangeWithCompanionNum = (e) => {
		this.setState({
			withCompanionNum: e.target.value
		});
	}

	handleChangeStory = (e) => {
		// 길이 체크
		let story = e.target.value;
		if (story.length > 100) story = story.substring(0, 100);
		this.setState({
			story: story
		});
	}

	render() {
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;

		return (
			<section className="vivasamter">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top top_yell topStyle2">
					<div className="applyDtl_cell ta_c pick color2">
						<h3><span>Lab Party 시즌 2 -</span> 애플 넘버스 교과서편</h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					<div className="vivasamter_applyDtl pdside0 type02">
						<div className="applyDtl_inner pdside20 pb25">
							<h2 className="info_tit tit_flex">
								<label htmlFor="ipt_name">성명</label>
								<div className="input_wrap">
									<div className="input_wrap name_wrap style2">
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
								</div>
							</h2>
							<h2 className="info_tit tit_flex">
								<label htmlFor="ipt_school_name">학교 정보</label>
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

							{/*<div className="infoTxtWrap">*/}
							{/*	<p className="inputInfoTxt">* 학교 검색에서 찾으시는 학교가 없을 경우, <br/>직접 입력을 통해 재직 학교명과 소재지를 입력해 주세요.</p>*/}
							{/*	<p className="inputInfoTxt">* 학교 검색으로 변경된 정보는 선생님의 회원 정보로 갱신됩니다.</p>*/}
							{/*</div>*/}

							<h2 className="info_tit">
								<label htmlFor="ipt_school_name">학교명</label>
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
							<h2 className="info_tit">
								<label htmlFor="ipt_teacher">동반 선생님</label>
							</h2>
							<div className="input_wrap">
								<ul className="join_ipt_chk tit_flex">
									<li className="join_chk_list">
										<input
											type="radio"
											name="withCompanion"
											id="teacherRdo1"
											className="checkbox_circle"
											value="N"
											checked={this.state.withCompanion === 'N'}
											// checked={true}
											// onInput={this.inputOnlyNumber}
											onChange={this.handleChangeWithCompanion}
										/>
										<label htmlFor="teacherRdo1">없음</label>
									</li>
									<li className="join_chk_list" style={{width: '45%'}}>
										<input
											type="radio"
											name="withCompanion"
											id="teacherRdo2"
											value="Y"
											checked={this.state.withCompanion === 'Y'}
											onChange={this.handleChangeWithCompanion}
											className="checkbox_circle"
										/>
										<label htmlFor="teacherRdo2">있음</label>
										{/*<input type="text" id="teacherNum" className="teacherNum"  /> 명*/}
										<input
											ref={this.withCompanionNumRef}
											type="number"
											id="ipt_teacher_num"
											name="withCompanionNumber"
											maxLength="2"
											onInput={this.inputOnlyNumber}
											onChange={this.handleChangeWithCompanionNum}
											readOnly={this.state.withCompanion !== 'Y'}
											className="input_sm txt_checkbox"
											style={this.state.withCompanion !== 'Y' ? {background:'#f7f7f7', color:'#999'} : {}}
										/> 명
									</li>
								</ul>
							</div>

							<h2 className="info_tit">
								<label htmlFor="ipt_phone">배워보고 싶은 다른 주제의 수업이 있다면? <span>(선택입력)</span></label>
							</h2>
							<div className="input_wrap">
								<textarea
									name="story"
									id="applyContent2"
									cols="1"
									rows="10"
									maxLength="100"
									value={this.state.story}
									onChange={this.handleChangeStory}
									placeholder="100자 까지 입력하실 수 있습니다."
									className="textarea">
								</textarea>
								<div className="count_wrap"><p className="count"><span>{this.state.story.length}</span>/100</p></div>
							</div>
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>개인정보 수집 및 이용동의이용 목적 : 이벤트 당첨자 연락 및 CS 문의 응대</li>
									<li>수집하는 개인정보 : 성명, 재직학교, 학교주소, 휴대전화번호, 이메일</li>
									<li>개인정보 보유 및 이용기간 : 2024년 3월 31일까지<br/>(이용목적 달성 시 즉시 파기)</li>
								</ul>
								<br />
								<p className="privacyTxt">*선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
							</div>
						</div>
						<div className="checkbox_circle_box mt25 pdside20">
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
									본인은 개인정보 수집 및 이용내역을 확인하였으며,<br />
									이에 동의합니다.
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
									파티 일정 및 장소(2024년 2월 24일 오전 10시~12시 /
									서울 강남구 영동대로 517 아셈타워 1층)를 확인하였습니다.
								</strong>
							</label>
						</div>
						<button
							type="button"
							onClick={this.applyButtonClickSafe}
							className="btn_event_apply mt20">신청하기
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
