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
		phoneCheckClassName: '',
		telephoneCheck: false,

		ssn1: '',
		ssn2: '',
	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);

	}


	componentDidMount() {
		const {eventId, event, history} = this.props;

		if (!eventId) {
			history.push('/saemteo/event');
		} else if (!event.amountMap || !event.applyPoint) {
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
			let {memberId, name, schCode, schName, schZipCd, schAddr, cellphone, email} = response.data.memberInfo;

			// 학교코드가 99999, 99998, 99997일 경우 학교가 설정되지 않은 것으로 간주하여 정보불러오기에서 사용하는 정보를 공백처리한다.
			if (!schCode || schCode === 99999 || schCode === 99998 || schCode === 99997) {
				schName = '';
				schZipCd = '';
				schAddr = '';
			}

			event.memberId = memberId;
			event.userName = name;
			event.schName = '';
			event.schZipCd = '';
			event.schAddr = '';
			event.addressDetail = '';
			event.inputType = '직접 입력';
			event.userInfo = 'N';
			event.cellphone = cellphone;
			event.email = email;
			event.receive = '문앞';
			event.agree1 = false;

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

		if (e.target.name === 'companionName' || e.target.name === 'companionSchool' ) {
			event['noCompanionInfo'] = '';
		}

		SaemteoActions.pushValues({type: "event", object: event});
	};

	handleUserInfo = (e) => {
		const {event, SaemteoActions} = this.props;
		const {initialSchName, initialSchZipCd, initialSchAddr, userCellphone} = this.state;

		if (e.target.value === 'Y') {
			event.inputType = '정보 불러오기';
			event.schName = initialSchName;
			event.schZipCd = initialSchZipCd;
			event.schAddr = initialSchAddr;
			event.addressDetail = initialSchName;
			event.receive = '교무실';
		} else {
			event.inputType = '직접 입력';
			event.schName = '';
			event.schZipCd = '';
			event.schAddr = '';
			event.addressDetail = '';
			event.receive = '문앞';
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
		event.inputType = '직접 입력';
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
		const {telephoneCheck} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		if (!event.userName) {
			obj.message = '성명을 입력해주세요.';
		} else if (!reg_name.test(event.userName)) {
			obj.message = '올바른 성명 형식이 아닙니다.';
		} else if (event.userInfo === 'Y' && !event.schName) {
			obj.message = '재직학교를 입력해주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (event.schZipCd === "" || event.schAddr === "") {
			obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
		} else if (event.addressDetail === "") {
			obj.message = '상세주소를 입력해주세요.';
		} else if (event.receive === "") {
			obj.message = '수령처를 선택해주세요.';
		} else if (event.receive === "교실" && (event.receiveGrade === "" || event.receiveClass === "")) {
			obj.message = '학년 반을 입력해주세요.';
		} else if (event.receive === "기타" && event.receiveEtc === "") {
			obj.message = '수령처를 입력해주세요.';
		} else if (event.applyPoint > 50000 && (!this.state.ssn1 || this.state.ssn1.length != 6)) {
			obj.message = '주민등록 번호를 입력해 주세요.';
		} else if (event.applyPoint > 50000 && (!this.state.ssn2 || this.state.ssn2.length != 7)) {
			obj.message = '주민등록 번호를 입력해 주세요.';
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
		const {event, SaemteoActions, eventId} = this.props;

		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}

		let receiveInfo = ''
		if (event.userInfo === 'Y') {
			receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail;
		} else {
			receiveInfo = event.inputType + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail;
		}
		//수령처
		if (event.receive === "교실") {
			receiveInfo += '/수령처:' + event.receiveGrade + '학년 ' + event.receiveClass + '반'
		} else if (event.receive === "기타") {
			receiveInfo += '/수령처:' + event.receiveEtc
		} else {
			receiveInfo += '/수령처:' + event.receive;
		}
		let eventAnswer2 = '';

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
				eventId: '451',
				eventAnswerDesc: event.eventAnswerDesc,
				eventAnswerDesc2: event.eventAnswerDesc2,
				cellphone: event.cellphone,
				userInfo: event.userInfo,
				schCode: event.schCode,
				amountYn: 'Y',
			};

			/*
			 // 복수개 상품 신청
			 params.amountYn: 'Y';
			 // 신청 상품 종류 수
			 params.applyContentTotCnt: '3';
			 // 상품 seq, 복수신청시는 csv(3,4,5)
			 params.applyContentNumbers: '3,4,5';
			 // 상품 신청수량, 복수신청시는 csv(0,1,1)
			 params.applyTargetContentCnt: '0,0,1';
			*/

			let productTypeList = [];
			let productTypeCntList = [];
			let applyTotCnt = 0;
			for (let prodType in event.amountMap) {
				let cnt = event.amountMap[prodType];
				if (cnt > 0) {
					applyTotCnt++;
					productTypeList.push(prodType);
					productTypeCntList.push(cnt)
				}
			}

			params.applyContentTotCnt = applyTotCnt;
			params.applyContentNumbers = productTypeList.join(',');
			params.applyTargetContentCnt = productTypeCntList.join(',');
			if (event.applyPoint > 50000) {
				params.ssn = this.state.ssn1 + '-' + this.state.ssn2;
			}

			let response = await SaemteoActions.insertEventApply451(params);

			if (response.data.code === '1') {
				common.error("이미 신청 하셨습니다.");
			} else if (response.data.code === '0') {
				PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
				// 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
				if (event.schCode && event.schCode !== this.state.initialSchCode) {
					MyclassActions.myClassInfo();
				}
			} else if (response.data.code === '5') {
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
	}

	handleChangeSsn = (e) => {
		this.setState ({
			[e.target.name]: e.target.value
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
						<h3><span>스승의날 선물대잔치</span>- 신청하기</h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					<div className="vivasamter_applyDtl pdside0 type02">
						<div className="applyDtl_inner pdside20 pb25">
							<p className="point_red ml15" style={{textAlign:"center"}}>* 배송을 위해 선생님의 정보를 정확히 입력해 주세요.</p>
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
										className="input_sm"
										readOnly={true}/>
								</div>
							</h2>
							<h2 className="info_tit tit_flex">
								<label htmlFor="ipt_school_name">정보</label>
								<ul className="join_ipt_chk">
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
										<label htmlFor="userInfoY">학교정보 불러오기</label>
									</li>
								</ul>
							</h2>
							{/*직접입력시 재직학교 숨김 클래스 on 추가*/}
							<div className={"txt_hidden " + (event.userInfo === 'Y' ? 'on' : '')}>
								<div className="infoTxtWrap">
									<p className="inputInfoTxt">* 학교 검색에서 찾으시는 학교가 없을 경우, <br/>직접 입력을 통해 재직 학교명과 소재지를 입력해 주세요.</p>
									<p className="inputInfoTxt">* 학교 검색으로 변경된 정보는 선생님의 회원 정보로 갱신됩니다.</p>
								</div>
								<h2 className="info_tit">
									<label htmlFor="ipt_name">재직학교</label>
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
							</div>
							<h2 className="info_tit required">
								<label htmlFor="ipt_address">수령처</label>
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
							<div className={'combo_box mt5 ' + (event.receive === '교실'? 'type2' : (event.receive === '기타' ? 'type3' : 'type1'))}>
								<div className="selectbox select_sm">
									<select name="receive" id="ipt_receive" onChange={this.handleChange} value={event.receive}>
										{
											event.userInfo === 'N' ? (
												<Fragment>
													<option value="문앞">문 앞</option>
													<option value="경비실">경비실</option>
													<option value="교무실">교무실</option>
													<option value="행정실">행정실</option>
													<option value="택배실">택배실</option>
													<option value="진로상담실">진로상담실</option>
													<option value="교실">교실</option>
													<option value="기타">기타</option>
												</Fragment>
											) : (
												<Fragment>
													<option value="교무실">교무실</option>
													<option value="행정실">행정실</option>
													<option value="택배실">택배실</option>
													<option value="진로상담실">진로상담실</option>
													<option value="경비실">경비실</option>
													<option value="교실">교실</option>
													<option value="기타">기타</option>
												</Fragment>
											)
										}
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
							{ event.applyPoint > 50000 &&
								<Fragment>
									<h2 className="info_tit">
										<label htmlFor="ipt_phone">주민등록번호</label>
									</h2>
									<p className="point_color_blue mb15">* 6만 포인트 이상의 경품을 선택한 경우, 제세공과금 대납을 위해
										선생님의 개인정보가 필요합니다. (주민등록번호를 입력하지 않은 경우,
										상품자 정보 처리가 불가하여 상품이 배송되지 않습니다.)
									</p>
									<div className="input_wrap user_number">
										<span>
											<input
												type="number"
												name="ssn1"
												maxLength="6"
												onInput={this.inputOnlyNumber}
												onChange={this.handleChangeSsn}
												className="input_sm mb10"/>
										</span>
										<span className="bar">-</span>
										<span>
											<input
												type="number"
												name="ssn2"
												maxLength="7"
												onInput={this.inputOnlyNumber}
												onChange={this.handleChangeSsn}
												className="input_sm mb10"/>
										</span>
										{
											(this.state.ssn1.length != 6 || this.state.ssn2.length != 7) &&
											<p className="point_red ml15">주민등록번호를 다시 입력해 주세요.</p>
										}
									</div>
								</Fragment>
							}
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>이용 목적 : 경품 지급 및 고객문의 응대, 경품이 6만 포인트
										이상인 경우 제세공과금처리를 위해 주민등록번호 수집.</li>
									<li>수집하는 개인 정보 : 신청자의 성명, 수령처(학교 정보), 휴대전화번호, 주민등록번호</li>
									<li>개인정보 보유 및 이용 기간: 2023년 6월 30일까지</li>
									<li>선물 발송을 위해 개인정보(성명, 수령처, 휴대전화번호)가 배송업체에 제공됩니다.  * 이용 목적 달성 시 즉시 파기
										(㈜카카오 사업자등록번호 120-81-47521),
										(㈜모바일이앤엠애드 사업자등록번호 215-87-19169)
										(㈜CJ대한통운 사업자등록번호 110-81-0503),
										(㈜다우기술 사업자등록번호: 220-81-02810)</li>
									<li>5만 포인트를 초과하는 경품을 선택하실 경우, (주)비상교육에서 제세공과금 대납을 진행할 예정이며
										이에 따라 제세공과금 22%가 포함된 금액으로 기타소득 신고가 진행될 예정입니다.
										관련하여 세금 신고에 필요한 개인정보(주민등록번호)를 수급할 예정입니다.
										주민등록번호는 상품자 정보 처리로 인해 받으며 이벤트 종료 후 일괄 폐기처분 됩니다.</li>
								</ul>
								<br />
								<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한<br />
									동의를 거부할 수 있습니다.<br />
									단, 동의를 거부할 경우 신청이 불가합니다.</p>
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
									본인은 개인정보 수집 및 이용에 동의합니다.
								</strong>
							</label>
						</div>
						<button
							type="button"
							onClick={this.applyButtonClickSafe}
							className="btn_event_apply btn_c2 mt20">신청하기
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
