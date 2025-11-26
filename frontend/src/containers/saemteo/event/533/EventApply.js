import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
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
		answerLength:0,
		answerContents:'',
	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}


	componentDidMount() {
		const {eventId, history} = this.props;

		if (!eventId) {
			history.push('/saemteo/event');
		} else {
			this.getEventInfo(eventId);
		}
	}

	getEventInfo = async (eventId) => {
		const {history, event, SaemteoActions, loginInfo, myClassInfo} = this.props;
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
			event.subject = loginInfo.schoolLvlCd !== 'ES' ? myClassInfo.mainSubjectName : '';
			event.choice = '';

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

		return (
			<Link to={'/#/myInfo'}>
			</Link>
		)
		// PopupActions.openPopup({title:"학교 검색", componet:<EventFindSchool handleSetSchool={this.handleSetSchool}/>});
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
		const {event, loginInfo} = this.props;
		const {telephoneCheck, answerContents} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		if (!event.userName) {
			obj.message = '성명을 입력해주세요.';
		} else if (!reg_name.test(event.userName)) {
			obj.message = '올바른 성명 형식이 아닙니다.';
		} else if (event.addressDetail === "") {
			obj.message = '상세주소를 입력해주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (event.subject === null || event.subject === undefined || event.subject === "") {
			if(loginInfo.schoolLvlCd === 'ES') {
				obj.message = '방명록을 남길 과목을 선택해 주세요.';
			} else {
				obj.message = '회원정보 수정을 통해 담당 교과 설정 후 참여해 주세요.';
			}
		} else if (!event.choice) {
			obj.message = '22 개정 비상교과서 선정 여부를 선택해 주세요.';
		} else if (answerContents === '') {
			obj.message = '파티 방명록을 작성해 주세요.';
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
		const {answerContents} = this.state;
		const {event, SaemteoActions, eventAnswer, eventId, loginInfo} = this.props;

		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}

		const receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone;
		const eventAnswerDesc2 = (loginInfo.schoolLvlCd === 'ES' ? '초등' : '중고등') + '/' + event.subject
								+ '^||^' + event.choice
								+ '^||^' + answerContents;

		try {
			event.eventId = eventId;
			event.eventAnswerDesc = receiveInfo;
			event.eventAnswerDesc2 = eventAnswerDesc2 ;
			event.answerContent = eventAnswer.answerContent;
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

	// 내용 입력
	// 댓글 수정 시 길이 연동 및 이벤트 내용 수정
	setApplyContent = (e) => {
		if (e.target.value.length > 100) {
			common.info("100자 이내로 입력해 주세요.");
			return false;
		}
		this.setState({
			answerLength: e.target.value.length,
			answerContents: e.target.value
		});
	};

	render() {
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event, loginInfo} = this.props;
		const {phoneCheckMessage, phoneCheckClassName, answerContents, answerLength} = this.state;
		return (
			<section className="vivasamter">
				<h2 className="blind">
					비바샘터 참여하기
				</h2>
				<div className="applyDtl_top top_yell">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>22 개정 비상교과서 애프터 파티</strong></h3>
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
								<label htmlFor="ipt_school_name">재직학교</label>
							</h2>
							<div className="input_wrap">
								<input
									type="text"
									placeholder="재직학교를 입력하세요"
									id="ipt_school_name"
									name="schName"
									onChange={this.handleChange}
									value={event.schName}
									className="input_sm"
									readOnly={event.userInfo === 'Y'}
								/>
								{
									event.userInfo === 'Y' ?
										<Link
											className="input_in_btn btn_gray"
											to={'/myInfo'}>
											회원정보 수정
										</Link> : ''
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
								{
									loginInfo.schoolLvlCd !== 'ES' ?
										<Fragment>
											<h2 className="info_tit">
												<label htmlFor="ipt_name">담당교과</label>
											</h2>
											<div className="input_wrap">
												<input
													type="text"
													className="input_sm"
													name="subject"
													value={event.subject}
													readOnly={true}
												/>
											</div>
										</Fragment>
										:
										<Fragment>
											<h2 className="info_tit">
												<label htmlFor="ipt_name">방명록을 남길 과목</label>
											</h2>
											<div className="input_wrap">
												<ul className="join_ipt_chk">
													<li className="join_chk_list">
														<input
															id="math"
															type="radio"
															className="checkbox_circle"
															name="subject"
															value="수학"
															onChange={this.handleChange}
														/>
														<label htmlFor="math">수학</label>
													</li>
													<li className="join_chk_list">
														<input
															id="society"
															type="radio"
															className="checkbox_circle"
															name="subject"
															value="사회"
															onChange={this.handleChange}
														/>
														<label htmlFor="society">사회</label>
													</li>
													<li className="join_chk_list">
														<input
															id="science"
															type="radio"
															className="checkbox_circle"
															name="subject"
															value="과학"
															onChange={this.handleChange}
														/>
														<label htmlFor="science">과학</label>
													</li>
													<li className="join_chk_list">
														<input
															id="music"
															type="radio"
															className="checkbox_circle"
															name="subject"
															value="음악"
															onChange={this.handleChange}
														/>
														<label htmlFor="music">음악</label>
													</li>
													<li className="join_chk_list">
														<input
															id="art"
															type="radio"
															className="checkbox_circle"
															name="subject"
															value="미술"
															onChange={this.handleChange}
														/>
														<label htmlFor="art">미술</label>
													</li>
													<li className="join_chk_list">
														<input
															id="physical"
															type="radio"
															className="checkbox_circle"
															name="subject"
															value="체육"
															onChange={this.handleChange}
														/>
														<label htmlFor="physical">체육</label>
													</li>
												</ul>
												<p className="ml15 mt10">* 현 과목만 선택하실 수 있습니다.</p>
											</div>
										</Fragment>
								}
							<h2 className="info_tit">
								<label htmlFor="ipt_name">선택한 과목 22 개정 비상교과서 선정 여부</label>
							</h2>
							<div className="input_wrap">
								<ul className="join_ipt_chk">
									<li className="join_chk_list half">
										<input
											id="adopted"
											type="radio"
											className="checkbox_circle"
											name="choice"
											value="Y"
											onChange={this.handleChange}
										/>
										<label htmlFor="adopted">선정</label>
									</li>
									<li className="join_chk_list half">
										<input
											id="Notadopted"
											type="radio"
											className="checkbox_circle"
											name="choice"
											value="N"
											onChange={this.handleChange}
										/>
										<label htmlFor="Notadopted">미선정</label>
									</li>

								</ul>
							</div>
							{event.choice === 'Y' &&
								<div className="mt20">
									<h2 className="info_tit">
										<label htmlFor="ipt_name">22 개정 비상교과서를 사용하는 선생님!<br/>
											비상교과서를 선정한 가장 큰 이유를 작성해 주세요.(100자 이내)
										</label>
									</h2>
									<div className="input_wrap">
									<textarea
										name="applyContent"
										id="applyContent"
										cols="1"
										rows="10"
										maxLength="100"
										placeholder="EX) 탐구와 해 보기 등 다양한 활동에서 디지털 도구를 활용하여 결과 데이터를 처리할 수 있는 구성이 훌륭했습니다."
										value={answerContents}
										onChange={this.setApplyContent}
									>
									</textarea>
									<span className="count"><span className="currentCount">{answerLength}</span>/100</span>
									</div>
								</div>
							}
							{event.choice === 'N' &&
							<div className="mt20">
								<h2 className="info_tit">
									<label htmlFor="ipt_name">22 개정 비상교과서를 사용하지 않더라도<br/>
										비상교과서에 대한 의견을 자유롭게 작성해 주세요.(100자 이내)
									</label>
								</h2>
								<div className="input_wrap">
								<textarea
									name="applyContent"
									id="applyContent"
									cols="1"
									rows="10"
									maxLength="100"
									placeholder="EX) 22 개정 비상교과서의 좋았던 점, 아쉬웠던 점, 개선했으면 하는 점을 적어주세요."
									value={answerContents}
									onChange={this.setApplyContent}
								>
								</textarea>
								<span className="count"><span className="currentCount">{answerLength}</span>/100</span>
								</div>
							</div>
							}
						</div>
						<div className="acco_notice_list pdside20 ">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList event2">
									<li>개인 정보 수집 및 이용 동의 이용 목적: 경품 발송 및 고객 문의 응대</li>
									<li>수집하는 개인 정보: 성명, 재직 학교, 휴대 전화 번호</li>
									<li>개인 정보 보유 및 이용 기간: 2025년 1월 30일까지(이용 목적 달성 시 즉시 파기)</li>
									<li>개인 정보 오기로 인한 경품 재발송은 불가능합니다. 개인 정보를 꼭 확인해 주세요.</li>
									<li>신청자 개인 정보가 서비스사 및 배송 업체에 제공됩니다. <br/>
										(㈜카카오 사업자등록번호 : 120-81-47521), (㈜다우기술 사업자등록번호: 220-81-02810), (㈜모바일이앤엠애드
										사업자등록번호:215-87-19169)
									</li>
								</ul>
								<br/>
								<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우
									이벤트 참여가 불가합니다.</p>
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
		myClassInfo: state.myclass.get('myClassInfo'),
		isApp: state.base.get('isApp')
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(saemteoActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch)
	})
)(withRouter(EventApply));
