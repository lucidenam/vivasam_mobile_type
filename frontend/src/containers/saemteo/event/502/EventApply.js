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
		phoneCheckClassName: '',
		telephoneCheck: false,
	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}


	componentDidMount() {
		const {eventId, history} = this.props;

		if(!eventId) {
			history.push('/saemteo/event');
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
			event.receive = '교무실';
			event.amount = '';

			this.phonecheckByUserInfoCellphone(cellphone);
			
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

		this.phonecheckByUserInfoCellphone(event.cellphone);
	};

	// 사용자의 핸드폰정보 조회시 유효성 체크
	phonecheckByUserInfoCellphone = (cellphone) => {
		let text = '';
		let checkFlag = false;
		let clazz = 'point_red ml15';
		if(cellphone === ''){
			text = "";
		} else if(!this.checkPhoneNum(cellphone)){
			text = "휴대전화번호가 유효하지 않습니다.";
		} else{
			clazz = 'point_color_blue ml15';
			text = "등록가능한 휴대전화번호입니다.";
			checkFlag = true;
		}
		this.setState({
			phoneCheckClassName: clazz,
			phoneCheckMessage: text,
			telephoneCheck: checkFlag
		});
	}

	//핸드폰번호 체크
	phonecheck = (e) => {
		e.target.value = common.autoHypenPhone(e.target.value);
		let tel = e.target.value;
		let text = '';
		let checkFlag = false;
		let clazz = 'point_red ml15';
		if (tel === '') {
			text = "";
		} else if (!this.checkPhoneNum(tel)) {
			text = "휴대전화번호가 유효하지 않습니다.";
		} else {
			clazz = 'point_color_blue ml15';
			text = "등록가능한 휴대전화번호입니다.";
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
		} else if (value.length < 12 || value.length > 13) {
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
		event.addressDetail = schoolName;

		SaemteoActions.pushValues({type:"event", object:event});
		PopupActions.closePopup();
	}

	//값 입력 확인
	validateInfo = () => {
		const {event, eventAnswer} = this.props;
		const {telephoneCheck} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};
		if (!event.userName) {
			obj.message = '성명을 입력해주세요.';
		} else if (!reg_name.test(event.userName)) {
			obj.message = '올바른 성명 형식이 아닙니다.';
		} else if (!event.schName) {
			obj.message = '재직학교를 입력해주세요.';
		} else if (event.schZipCd === "" || event.schAddr === "") {
			obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
		} else if (event.addressDetail === "") {
			obj.message = '학교주소를 입력해주세요.';
		} else if (event.receive === "") {
			obj.message = '수령처를 선택해주세요.';
		} else if (event.receive === "교실" && (event.receiveGrade === "" || event.receiveClass === "")) {
			obj.message = '학년 반을 입력해주세요.';
		} else if (event.receive === "기타" && event.receiveEtc === "") {
			obj.message = '수령처를 입력해주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
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
		const {event, history, SaemteoActions, eventAnswer, eventId} = this.props;
		
		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}

		let receive = event.receive;
		if(event.receive === "교실"){
			receive = event.receiveGrade+'학년 ' + event.receiveClass+'반'
		}else if(event.receive === "기타"){
			receive = event.receiveEtc
		}

		let receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail + '/수령처 : ' + receive;

		try {
			event.eventId = eventId;
			event.eventAnswerDesc = receiveInfo;
			event.eventAnswerDesc2 = eventAnswer.eventAnswerContent;
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

				amountYn: 'Y',   /* 수량제한 신청 */
				applyContentTotCnt: '2',     /* 상품 종류 수 */
				applyContentNumbers: '3,4',    /* 상품 seq, 복수신청시는 csv(3,4,5) */
				applyTargetContentCnt: eventAnswer.answerNumber
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
				common.error("준비한 수량이 모두 소진되어 신청이 마감되었습니다. 감사합니다!");
			} else {
				common.error("신청이 마감되었습니다.");
				history.push('/saemteo/event/view/' + eventId);
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
		
	};

	render() {
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event, eventAnswer} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;
				
		return (
			<section className="vivasamter event240520">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>문해력 향상 프로그램 자료집 배포 이벤트</strong> 신청하기</h3>
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
							<div className="infoTxtWrap">
								<p className="inputInfoTxt">* 학교 검색에서 찾으시는 학교가 없을 경우, <br/>직접 입력을 통해 재직 학교명과 소재지를 입력해 주세요.</p>
							</div>

							<h2 className="info_tit">
								<label htmlFor="ipt_receive">수령처</label>
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
							<div className="input_wrap mt5" style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
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

							<div className={'combo_box ' + (event.receive === '교실'? 'type2' : (event.receive === '기타' ? 'type3' : 'type1'))}>
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
								<div className={'input_wrap mt5 receiveGradeClass ' + (event.receive === '교실' ? '' : 'hide')}>
									<input
										type="number"
										maxLength="5"
										name="receiveGrade"
										onChange={this.handleChange}
										className="input_sm"/>
									<span className="label_txt">학년</span>
									<input
										type="text"
										autoCapitalize="none"
										name="receiveClass"
										onChange={this.handleChange}
										className="input_sm"/>
									<span className="label_txt">반</span>
								</div>
							</div>
							<h2 className="info_tit">
								<label htmlFor="ipt_phone">휴대폰 번호</label>
							</h2>
							<div className="input_wrap">
								<input
									type="tel"
									placeholder="휴대전화번호를 입력하세요 (예 : 010-2345-6789)"
									id="ipt_phone"
									name="cellphone"
									onChange={this.phonecheck}
									value={event.cellphone}
									maxLength="13"
									className="input_sm mb10"/>
								<InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
							</div>
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>개인 정보 수집 및 이용 동의 이용 목적: 경품 발송 및 고객 문의 응대</li>
									<li>수집하는 개인 정보: 성명, 재직 학교, 주소, 휴대 전화 번호</li>
									<li>개인 정보 보유 및 이용 기간: 2024년 7월 30일까지(이용 목적 달성 시 즉시 파기)</li>
									<li>개인 정보 오기로 인한 자료 재발송은 불가능합니다. 개인 정보를 꼭 확인해 주세요.</li>
									<li>신청자 개인 정보(성명/주소/휴대 전화 번호)가 배송 업체에 공유됩니다.<br/>(주)CJ대한통운 사업자번호: 110-81-05034</li>
								</ul>
								<br />
								<p className="privacyTxt pl0">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다 ​<br /> 단, 동의를 거부할 경우 신청이 불가합니다.</p>
							</div>
						</div>
						<div className="checkbox_circle_box mt25 pdside20">
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
									본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.
								</strong>
							</label>
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
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(EventApply));