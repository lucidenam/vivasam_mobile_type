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
		studentCnt: '',
		instagramId: '',
	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}


	componentDidMount() {
		const {eventId, history, event, SaemteoActions} = this.props;

		if (!eventId) {
			history.push('/saemteo/event');
		} else {
			this.getEventInfo(eventId);
		}

		event.instagramId = "";
		SaemteoActions.pushValues({type: "event", object: event});
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
			event.agree = false;
			event.receive = '교실';

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
		const targetName = e.target.name;
		const instagramId = e.target.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');

		if (targetName === 'agree') {
			event[targetName] = e.target.checked;
		} else if (targetName === 'instagramId') {
			event[targetName] = instagramId;
		} else {
			event[targetName] = e.target.value;
		}

		SaemteoActions.pushValues({type: "event", object: event});
	};

	onlyEnglish = (e) => {
		const regExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
		let instagramId = "";

		if(regExp.test(e.target.value)) {
			alert("영문으로 입력해주세요.");
			instagramId = e.target.value.replace(regExp, '');
			e.target.value = instagramId;
		} else {
			instagramId = e.target.value;
			this.setState({
				instagramId : instagramId,
			})
		}
	}

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
		const {telephoneCheck, instagramId} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		if (!event.userName) {
			obj.message = '성명을 입력해주세요.';
		} else if (!reg_name.test(event.userName)) {
			obj.message = '올바른 성명 형식이 아닙니다.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!instagramId) {
			obj.message = '인스타그램ID를 입력해주세요.';
		} else if (!event.agree) {
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

		let receiveInfo = event.cellphone;

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
		// eventAnswerDesc: event.eventAnswerDesc,
		// 	eventAnswerDesc2: event.eventAnswerDesc2,
		// 	cellphone: event.cellphone,
	};

	//신청
	insertApplyForm = async () => {
		const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;
		const {instagramId} = this.state;

		try {
			BaseActions.openLoading();

			var params = {
				eventId: eventId,
				eventAnswerDesc: event.eventAnswerDesc,
				eventAnswerDesc2: "인스타그램ID : " + instagramId,
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
				common.error("마일리지 적립/차감에 실패하였습니다.\n 관리자에게 문의해 주세요(1544-7714)");
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
				<div className="applyDtl_top top_yell">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>비바샘 인스타그램 팔로우 이벤트</strong></h3>
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
							<h2 className="info_tit ">
								<label htmlFor="ipt_name">인스타그램 ID</label>
							</h2>
							<div className="input_wrap">
								<input
									type="text"
									id="ipt_name"
									name="instagramId"
									onInput={this.onlyEnglish}
									className="input_sm"
								/>
							</div>
						</div>
						<div className="acco_notice_list pdside20 ">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList event2">
									<li>이용목적 : 선물 발송</li>
									<li>수집하는 개인정보 : 성명, 휴대전화번호, 인스타그램 ID</li>
									<li>개인정보 보유 및 이용기간 : 2023년 02월 28일까지(이용목적 달성 시 즉시 파기)</li>
									<li>연락처 오류 시 경품 재발송이 불가능합니다. 개인정보를 꼭 확인해 주세요.</li>
									<li>선물 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br />
										(㈜카카오 사업자등록번호 120-81-47521)
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
									name="agree"
									onChange={this.handleChange}
									checked={event.agree}
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
							</div>
						</div>
						<button
							type="button"
							onClick={this.applyButtonClickSafe}
							className="btn_event_apply">신청하기
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
