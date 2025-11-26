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
		idCheck:'',

		/* 해당 이벤트에 추가 */
		eventContents: '', // 이벤트 신청 내용 ( 꿈 명함 이유 )
		eventLength: 0, //
		idExist : '',

	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}


	componentDidMount() {
		const {eventId, history, eventAnswer} = this.props;

		if (!eventAnswer.eventId) {
			common.error("참여할 이벤트 정보가 없습니다. 다시 확인해 주세요.");
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
			let {memberId, name, schCode, schName, schZipCd, schAddr} = response.data.memberInfo;

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
			event.agree1 = false;
			event.selectArea = 1;

			SaemteoActions.pushValues({type: "event", object: event});

			this.setState({
				eventInfo: eventInfo,
				initialSchName: schName,
				initialSchZipCd: schZipCd,
				initialSchAddr: schAddr,
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

		if (e.target.name === 'agree1') {
			event[e.target.name] = e.target.checked;
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
		let obj = {result: false, message: ''};

		if (!event.schName) {
			obj.message = '재직 학교를 입력해 주세요.';
		} else if (!event.schAddr || !event.addressDetail) {
			obj.message = '상세주소를 입력해 주세요.';
		} else if (event.selectArea === 1 || event.selectArea === "1") {
			obj.message = '투표지역을 선택해주세요.';
		} else if (!event.agree1) {
			obj.message = '필수 동의 선택 후 이벤트 신청을 완료해 주세요.';
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

		let receiveInfo = '';
		let answer = '';

		receiveInfo = event.inputType + '/' + event.schName +  '/' + event.schZipCd + '/' + event.schAddr + '/' + event.addressDetail + '/010-0000-0000';
		answer += event.selectArea;

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
	};

	//신청
	insertApplyForm = async () => {
		const {event, eventAnswer, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;
		try {
			BaseActions.openLoading();

			var params = {
				eventId: eventAnswer.eventId,
				eventAnswerDesc: event.eventAnswerDesc,
				eventAnswerDesc2: event.eventAnswerDesc2,
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
		const {eventInfo, recommender, recommendMsg, isRealizeId} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event, eventAnswer} = this.props;
		const {phoneCheckMessage, phoneCheckMessage2, phoneCheckClassName, phoneCheckClassName2, idExist, idCheckOn} = this.state;
		// console.log(eventAnswer.eventId);
		return (
			<section className="vivasamter">
				{
						<Fragment>
							<h2 className="blind">
								비바샘터 신청하기
							</h2>
							<div className="applyDtl_top ">
								<div className="applyDtl_cell ta_c pick">
									<h3>
										<strong>교사문화 프로그램 지역 대항전 투표</strong>
									</h3>
								</div>
							</div>
							<div className="vivasamter_apply">
								<div className="vivasamter_applyDtl type02 pdside0 ">
									<div className="apply_form_wrap pdside20 pb15">
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
										<h2 className="info_tit">
											<label htmlFor="ipt_school_name">재직 학교</label>
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
												placeholder="우편번호"
												value={event.schZipCd}
												className="input_sm"
												readOnly/>
											{ /* 부분 렌더링 예시 */
												(event.userInfo === 'N') &&  // 직접입력
												<button
													type="button"
													className="input_in_btn btn_gray"
													onClick={this.openPopupAddress}
												> 우편번호 검색
												</button>
											}
										</div>
										<div className="input_wrap mt5"
											 style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
											<input
												type="text"
												placeholder="주소 입력"
												id="ipt_address"
												value={event.schAddr}
												className="input_sm"
												readOnly/>
										</div>
										<div className="input_wrap mt5">
											<input
												type="text"
												placeholder="상세 주소 입력"
												id="ipt_detail_address"
												name="addressDetail"
												onChange={this.handleChange}
												value={event.addressDetail}
												className="input_sm"/>
										</div>
										<h2 className="info_tit">
											<label htmlFor="ipt_receive">투표 지역</label>
										</h2>
										<div className={'combo_box type1'}>
											<div className="selectbox select_sm">
												<select name="selectArea" id="selectArea" onChange={this.handleChange}>
													<option value="1">지역을 선택해주세요.</option>
													<option value="강원특별자치도">강원특별자치도</option>
													<option value="충청남도">충청남도</option>
													<option value="충청북도">충청북도</option>
													<option value="세종특별자치시">세종특별자치시</option>
													<option value="대전광역시">대전광역시</option>
													<option value="경상북도">경상북도</option>
													<option value="대구광역시">대구광역시</option>
													<option value="전북특별자치도">전북특별자치도</option>
													<option value="경상남도">경상남도</option>
													<option value="울산광역시">울산광역시</option>
													<option value="부산광역시">부산광역시</option>
													<option value="광주광역시">광주광역시</option>
													<option value="전라남도">전라남도</option>
													<option value="제주특별자치도">제주특별자치도</option>
													<option value="울릉도">울릉도</option>
													<option value="독도">독도</option>
												</select>
											</div>
										</div>
									</div>


									<div className="acco_notice_list mt0">
										<div className="acco_notice_cont">
											<span className="privacyTit">
												개인정보 수집 및 이용동의
											</span>
											<ul className="privacyList type02 ">
												<li>개인정보 수집 및 이용동의 이용 목적: 투표 결과 집계</li>
												<li>수집하는 개인정보: 성명, 재직학교, 투표 지역</li>
												<li>개인정보 보유 및 이용 기간: 2025년 6월 30일까지(이용목적 달성 시 즉시 파기)</li>
											</ul>
											<br/>
											<p className="privacyTxt type02">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수
												있습니다. 단, 동의를 거부할 경우 이벤트 참여가 불가합니다.</p>
										</div>
									</div>
									<div className="checkbox_circle_box checkbox_circle_box mt25 pdside20">
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
									<button
										type="button"
										onClick={this.applyButtonClickSafe}
										className="btn_event_apply mt35">투표하기
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
		// recommender: state.saemteo.get('recommender').toJS(),
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
