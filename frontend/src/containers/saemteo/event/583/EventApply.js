import React, {Component, Fragment} from 'react';
import './Event.css';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import FindAddress from 'containers/login/FindAddress';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';
import EventFindSchool from "../../EventFindSchool";
import * as myclassActions from 'store/modules/myclass';

class EventApply extends Component {

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
		this.state = {
			/* 기존의 값 */
			initialSchName: '',
			initialSchZipCd: '',
			initialSchAddr: '',
			eventInfo: '',
			phoneCheckMessage: '',
			phoneCheckClassName: '',
			telephoneCheck: false,
			agree: false,
			agreeN:false,
			agreeY:false,
		};
	}

	componentDidMount() {
		const {eventId,eventAnswer} = this.props;
		this.getEventInfo(eventId);
	}

	getEventInfo = async (eventId) => {
		const {history, event, SaemteoActions} = this.props;
		const response = await api.eventInfo(eventId);
		if (response.data.code && response.data.code === "0") {
			let eventInfo = response.data.eventList[0];
			event.eventId = eventInfo.eventId;
			let {memberId, name, email, schName, schZipCd, schAddr, cellphone, schCode} = response.data.memberInfo;

			// 학교코드가 99999, 99998, 99997일 경우 학교가 설정되지 않은 것으로 간주하여 정보불러오기에서 사용하는 정보를 공백처리한다.
			if (!schCode || schCode === 99999 || schCode === 99998 || schCode === 99997) {
				schName = '';
				schZipCd = '';
				schAddr = '';
			}

			event.memberId = memberId;
			event.userName = name;
			event.schCode = schCode;
			event.schName = schName;
			event.schZipCd = schZipCd;
			event.schAddr = schAddr;
			event.addressDetail = schName;
			event.inputType = '개인정보 불러오기';
			event.userInfo = 'Y';
			event.email = email;
			event.agree = false;

			if(cellphone!=null && cellphone!='') {
				event.cellphone = cellphone;
				this.setState({
					telephoneCheck: true
				})
			}else{
				event.cellphone = '';
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

	handleChange = (e) => {
		const {event, SaemteoActions} = this.props;

		if (e.target.name === 'agree') {
			if (e.target.id === 'join_agree') {
				this.setState({ agree: true,  agreeY: true,  agreeN: false });
			} else if (e.target.id === 'join_agreeN') {
				this.setState({ agree: false, agreeY: false, agreeN: true  });
			}
			return;
		} else {
			event[e.target.name] = e.target.value;
		}

		SaemteoActions.pushValues({type: "event", object: event});
	};

	handleUserInfo = (e) => {
		const {event, SaemteoActions} = this.props;
		const {initialSchName, initialSchZipCd, initialSchAddr} = this.state;
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
		SaemteoActions.pushValues({type: "event", object: event});

		this.handleChange(e);
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
		let clazz = 'point_red';
		if (tel === '') {
			text = "";
		} else if (!this.checkPhoneNum(tel)) {
			text = "휴대폰 번호가 유효하지 않습니다.";
		} else {
			clazz = 'point_color_blue';
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
			obj.message = '재직학교를 입력해 주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대폰 번호가 유효하지 않습니다.';
		} else if (!this.state.agreeY && !this.state.agreeN) {
			obj.message = "개인정보 수집 및 이용 동의를 확인해주세요.";
		} else if (this.state.agreeN) {
			obj.message = "개인정보 수집 및 이용에 동의하지 않을시, 이벤트 응모를 완료할 수 없습니다.";
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
		const {event, eventAnswer, SaemteoActions} = this.props;
		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}
		try {
			// 전화번호 구분
			let eventCellPhone = event.cellphone.split("-");


			// 응답값 설정
			// 웹에서 수정이 가능할 수 있게 조절 ( 입력방식 / 학교이름 / 학교 주소 1 - 2 Depth / 학교(반,학년) / 동아리(동아리이름) / 인원 / 전화번호 / Email / 내용
			if (this.state.isSetGroupCheck === "1") {
				event.eventAnswerDesc = event.schName + '/ ' +eventCellPhone[0] + '-' + eventCellPhone[1] + '-' + eventCellPhone[2] ;
				event.eventAnswerDesc2 =  eventAnswer.eventAnswerDesc2;
			} else {
				event.eventAnswerDesc = event.schName + '/ ' +eventCellPhone[0] + '-' + eventCellPhone[1] + '-' + eventCellPhone[2] ;
				event.eventAnswerDesc2 =  eventAnswer.eventAnswerDesc2;
			}


			event.eventId = eventAnswer.eventId;
			SaemteoActions.pushValues({type: "event", object: event});
			this.insertApplyForm();
		} catch (e) {
			console.log(e);
		}
	};

	openPopupSchool = (e) => {
		e.preventDefault;
		const { PopupActions } = this.props;
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
		event.addressDetail = '';

		SaemteoActions.pushValues({type:"event", object:event});
		PopupActions.closePopup();
	}

	handleClose = async (e) => {
		e.preventDefault();
		const {eventId, PopupActions, history} = this.props;
		await PopupActions.closePopup();
		history.push('/saemteo/event/view/' + eventId);
	};

	//신청
	insertApplyForm = async () => {
		const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId, eventAnswer} = this.props;
		try {
			BaseActions.openLoading();

			let today = new Date();
			let month = new String(today.getMonth()+1);
			let day = new String(today.getDate());
			if(month.length < 2) month = "0"+month;
			if(day.length < 2) day = "0"+day;
			let textDay = today.getFullYear() + "-" + month + "-" + day;


			var params = {
				eventId: eventAnswer.eventId,
				eventAnswerDesc: event.eventAnswerDesc,
				eventAnswerDesc2: event.eventId == '521' ? textDay : event.eventAnswerDesc2,
				cellphone: event.cellphone,
				userInfo: event.userInfo,
				schCode: event.schCode
			};

			let response = await SaemteoActions.insertEventApply(params);

			if (response.data.code === '1') {
				common.error("이미 신청 하셨습니다.");
			} else if (response.data.code === '0') {
				if (event.eventId == '521') {
					alert("22 개정 비상교과서 홈페이지로 연결됩니다.");
					window.location.href = "https://e.vivasam.com/visangTextbook/2022/story";
				} else {
					PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
				}
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
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	};

	render() {
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event, eventAnswer } = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;
		return (
			<section className="vivasamter">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top top_yell topStyle2">
					<div className="applyDtl_cell ta_c pick color2">
						<h3>[교과서캠페인 7탄] PEFRECT! ONLY! 비상 교과서</h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					<div className="vivasamter_applyDtl pdside0">
						<div className="applyDtl_inner pdside20 pb25">
							<h2 className="info_tit tit_flex">
								<label htmlFor="ipt_name">성명</label>
								<div className="input_wrap name_wrap style2">
									<input
											type="text"
											placeholder="성명을 입력하세요"
											id="ipt_name"
											name="userName"
											onChange={this.handleChange}
											value={event.userName}
											className="input_sm input_name"
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
												학교 검색
											</button> : ''
								}
							</div>

							<h2 className="info_tit">
								<label htmlFor="ipt_phone">휴대전화번호</label>
							</h2>
							<div className="input_wrap">
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
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">개인정보 수집 및 이용동의</span>
								<ul className="privacyList">
									<li>이용 목적: 경품 발송 및 고객 문의 응대</li>
									<li>수집하는 개인정보: 성명, 재직 학교, 휴대전화번호</li>
									<li>개인정보 보유 및 이용 기간: 2025년 12월 31일까지</li>
									<li>※ 개인정보 오기재, 유효 기간 만료로 인한 경품 재발송은 불가합니다.</li>
									<li>※ 경품 발송을 위해 개인정보가 서비스사와 배송업체에 제공됩니다. <br /> ㈜ 카카오 120-81-47521 <br />㈜ 다우기술 220-81-02810 <br />㈜ LG전자 107-86-14075 <br />(유) 애플코리아 120-81-84429</li>
								</ul>
							</div>
						</div>
						{/*<div className="checkbox_circle_box mt25 pdside20">
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
									본인은 개인정보 수집 및 이용동의 안내를 확인<br/>
									하였으며, 이에 동의합니다.
								</strong>
							</label>
						</div>*/}
						<div className="checkbox_circle_box mt25 pdside20">
							<span className="txt">* 개인정보 수집 및 이용에 동의합니다.</span>
							<input
								type="radio"
								name="agree"
								onChange={this.handleChange}
								checked={this.state.agreeY}
								className="checkbox_circle checkbox_circle_rel"
								autoComplete="off"
								id="join_agree"/>
							<label
								htmlFor="join_agree"
								className="checkbox_circle_simple">
								<strong className="checkbox_circle_tit">동의함</strong>
							</label>
							<input
								type="radio"
								name="agree"
								onChange={this.handleChange}
								checked={this.state.agreeN}
								className="checkbox_circle checkbox_circle_rel"
								autoComplete="off"
								id="join_agreeN"/>
							<label
								htmlFor="join_agreeN"
								className="checkbox_circle_simple">
								<strong className="checkbox_circle_tit">동의하지않음</strong>
							</label>
						</div>
						<button
								type="button"
								onClick={this.applyButtonClickSafe}
								className="btn_event_apply btn_c2 mt20">참여하기
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