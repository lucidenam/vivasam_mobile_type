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
		step1: '', // step1
		step2: '', // step2
		step1Length: 0,  // step1 길이
		step2Length: 0,  // step2 길이
		myGrade: '', // 담당학년
		mainSubject: '', // 담당과목
		career: '', // 교사경력
		visangTbYN: '', // 비상교과서 채택여부
		snsYn:'', // 운영중인 sns 여부
		eventAgree: '', // 개인정보 동의여부
		subSubject: 'N', // 비교과
		TAB: '', // 학급 ( E : 초등 / M  : 중등 / H : 고등 )
		arrApplyContent: [false, false, false],
		arrApplyContentNm: ['초등교과', '중고등교과', '비교과콘텐츠'],
		applySubject: '',
		arrMyGrade: [false, false, false, false, false, false],
		arrMySns: [false, false, false, false, false],
		directInput: 'N'
	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}

	componentDidMount() {
		const {eventId, eventAnswer, history} = this.props;
		if(!eventId) {
			history.push('/saemteo/event');
		}
		else if (eventAnswer.isEventApply) {
			common.error("이미 신청하셨습니다.");
		 	history.push('/saemteo/event/view/' + eventId);
		}
		else {
			this.getEventInfo(eventId);
		}
	}

	getEventInfo = async (eventId) => {
		const {history, event, SaemteoActions} = this.props;
		const response = await api.eventInfo(eventId);
		if (response.data.code && response.data.code === "0") {
			let eventInfo = response.data.eventList[0];
			event.eventId = eventInfo.eventId;
			let {memberId, name, schCode, schName, schZipCd, schAddr, cellphone, myGrade, mainSubject} = response.data.memberInfo;

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
			event.receive = '교무실';

			event.arrMyGrade = '';
			event.arrMySns = '';
			event.mainSubject = '';
			event.career = '';
			event.visangTbYN = '';
			event.snsYn = '' ;
			event.arrApplyContent1 = false;
			event.arrApplyContent2 = false;
			event.arrApplyContent3 = false;
			event.applySubject =  '';
			event.applyContent1 = '';
			event.applyContent2 = '';

			this.phonecheckByUserInfoCellphone(cellphone);
			SaemteoActions.pushValues({type: "event", object: event});

			// let arrMyGrade = [false, false, false, false, false, false];
			// if (myGrade != '') {
			// 	arrMyGrade[myGrade - 1] = true;
			// }
			this.setState({
				eventInfo: eventInfo,
				initialSchName: schName,
				initialSchZipCd: schZipCd,
				initialSchAddr: schAddr,
				userCellphone: cellphone,
				mainSubject: mainSubject,
				// arrMyGrade: arrMyGrade
			});

			const response2 = await api.eventMemberSchoolInfo({...event});
			this.setState({
				TAB: response2.data.TAB
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
		if (e.target.name === 'agree1' || e.target.name === 'arrApplyContent1' || e.target.name === 'arrApplyContent2' || e.target.name === 'arrApplyContent3') {
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
			this.setState({directInput: 'N',applySubject: '', arrApplyContent: [false, false, false]});
		} else {
			event.inputType = '직접입력';
			event.schName = '';
			event.schZipCd = '';
			event.schAddr = '';
			event.addressDetail = '';
			this.setState({directInput: 'Y',applySubject: '', arrApplyContent: [false, false, false]});
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
	phonecheck = (e) => {
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
		} else if (value.length < 12 || value.length > 13) {
			return false;
		}
		return true;
	};

	//우편번호 검색 팝업
	openPopupAddress = () => {
		const {PopupActions} = this.props;
		PopupActions.openPopup({title: "우편번호 검색", component: <FindAddress handleSetAddress={this.handleSetAddress}/>});
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
		const { schoolName, schoolCode, zip, addr, schoolGrade } = obj;

		event.schCode = schoolCode;
		event.schName = schoolName;
		event.schZipCd = zip;
		event.schAddr = addr;
		event.addressDetail = schoolName;
		SaemteoActions.pushValues({type:"event", object:event});
		this.setState({TAB: schoolGrade, applySubject: '', arrApplyContent: [false, false, false]});
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
		} else if (!event.schName) {
			obj.message = '재직학교를 입력해주세요.';
		} else if (event.schZipCd === "" || event.schAddr === "") {
			obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
		} else if (event.addressDetail === "") {
			obj.message = '학교주소를 입력해 주세요.';
		} else if (event.arrMyGrade === "") {
			obj.message = '담당 학년을 선택해 주세요.';
		} else if ((this.state.TAB === 'H' || this.state.TAB === 'M' || this.state.directInput === 'Y') && event.mainSubject === "") {
			obj.message = '내 교과를 선택해 주세요.';
		} else if (event.career === "" || event.career === null || event.career === undefined) {
			obj.message = '선생님의 경력 년 수를 입력해 주세요.';
		} else if (event.career <= 0 || event.career >= 51  ) {
			obj.message = '교사 경력을 다시 입력해 주세요.';
		} else if (event.visangTbYN !== "N" && event.visangTbYN !== "Y") {
			obj.message = '비상교과서 채택여부를 선택해 주세요.';
		} else if (event.snsYn !== "N" && event.snsYn !== "Y") {
			obj.message = '운영 중인 SNS 채널을 선택해 주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (event.snsYn !== "N" && event.snsYn !== "Y") {
			obj.message = '운영 중인 SNS 채널을 선택해 주세요.';
		} else if ( event.snsYn == "Y" && event.arrMySns === "") {
			obj.message = '운영 중인 SNS 채널을 선택해 주세요.';
		} else if (!event.arrApplyContent1 && !event.arrApplyContent2 && !event.arrApplyContent3) {
			obj.message = '비바새미 지원 분야를 선택해 주세요.';
		} else if (event.arrApplyContent1 && event.applySubject === "") {
			obj.message = '초등 교과 지원 과목을 선택해 주세요.';
		} else if (event.applyContent1.length === 0 || event.applyContent1 === "") {
			obj.message = '지원 동기를 입력해 주세요.';
		} else if (event.applyContent2.length === 0 || event.applyContent2 === "") {
			obj.message = '개인 활동 내역을 입력해 주세요.';
		} else if (!event.agree1) {
			obj.message = '필수 동의 항목 확인 후 이벤트 신청을 완료해 주세요.';
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
		try {
			event.eventAnswerDesc = event.inputType + '/' + event.schName + '/' + event.schAddr + ' ' + event.addressDetail + '/' + event.schZipCd +  "/담당 학년 : " + event.arrMyGrade;
			if(this.state.TAB === 'H' || this.state.TAB === 'M' || this.state.directInput === 'Y') {
				event.eventAnswerDesc += "/내 교과 : " + event.mainSubject;
			}
			event.eventAnswerDesc += "/교사 경력 : " + event.career + "/비상교과서 채택 여부 : " + event.visangTbYN + '/'  + event.snsYn + '/' + event.cellphone;

			if (event.snsYn === 'Y'){
				event.eventAnswerDesc2 = "운영중인 sns 채널 여부 : Y / " + event.arrMySns
			} else {
				event.eventAnswerDesc2 = "운영중인 sns 채널 여부 : N  "
			}

			// 지원분야
			// event.eventAnswerDesc2 = "지원 분야 : "

			if(event.arrApplyContent1) {
				event.eventAnswerDesc2 += '^||^' + "초등교과" + "-" + event.applySubject;
			}
			if(event.arrApplyContent2) {
				event.eventAnswerDesc2 += '^||^' + "중고등교과";
			}
			if((event.arrApplyContent1 || event.arrApplyContent2) && event.arrApplyContent3) {
				event.eventAnswerDesc2 += ", 비교과콘텐츠";
			} else if((!event.arrApplyContent1 && !event.arrApplyContent2) && event.arrApplyContent3) {
				event.eventAnswerDesc2 += "비교과콘텐츠";
			}
			event.eventAnswerDesc2 += '^||^' + event.applyContent1 + '^||^' + event.applyContent2;
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

	/* 담당학년 작업 */
	setMyGrade = (e) => {
		const {event, SaemteoActions} = this.props

		let tmpArr = event.arrMyGrade.split(',')

		if(event.arrMyGrade.includes(e.target.value)) {
			tmpArr = tmpArr.filter(i => i !== e.target.value);
		} else {
			tmpArr.push(e.target.value);
		}
		tmpArr = tmpArr.filter(i => i !== '');
		tmpArr.sort();

		let tmpStr = "";
		tmpArr.forEach((value, i) => {
			if(i===0) {
				tmpStr += value;
			} else {
				tmpStr += "," + value;
			}
		})
		event.arrMyGrade = tmpStr;

		SaemteoActions.pushValues({type: "event", object: event});
	};

	/* 운영중인 sns 작업 */
	setMySns = (e) => {
		const {event, SaemteoActions} = this.props

		let tmpArr2 = event.arrMySns.split(',')

		if(event.arrMySns.includes(e.target.value)) {
			tmpArr2 = tmpArr2.filter(i => i !== e.target.value);
		} else {
			tmpArr2.push(e.target.value);
		}
		tmpArr2 = tmpArr2.filter(i => i !== '');
		tmpArr2.sort();

		let tmpStr = "";
		tmpArr2.forEach((value, i) => {
			if(i===0) {
				tmpStr += value;
			} else {
				tmpStr += "," + value;
			}
		})
		event.arrMySns = tmpStr;

		SaemteoActions.pushValues({type: "event", object: event});
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
		
	};

	render() {
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;
				
		return (
			<section className="vivasamter event250224">
				<h2 className="blind">
					비바샘 비바새미 12기 신청하기
				</h2>
				<div className="applyDtl_top">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>비바샘 비바새미 12기 신청하기</strong></h3>
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
							{event.userInfo == 'Y' &&
								<p className="bulTxt mb15 mt10 ml10">* 학교 검색에서 찾으시는 학교가 없을 경우,<br/><span
									className="ml8">직접 입력을 통해 재직학교와 주소를 입력해 주세요.</span></p>}
							<h2 className="info_tit">
								<label htmlFor="ipt_address">학교주소</label>
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
							<h2 className="info_tit">
								<label htmlFor="ipt_grade">담당 학년</label>
							</h2>
							{ /* 부분 렌더링 예시 */
								(this.state.TAB !== 'E') &&  /* 중등 , 고등 */
								<div className="input_wrap">
									<ul className="join_ipt_chk">
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g01"
												name="grade"
												ref="grade"
												value="1"
												checked={event.arrMyGrade.includes('1')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g01">1학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g02"
												name="grade"
												value="2"
												checked={event.arrMyGrade.includes('2')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g02">2학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g03"
												name="grade"
												value="3"
												checked={event.arrMyGrade.includes('3')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g03">3학년</label>
										</li>
									</ul>
								</div>
							}
							{ /* 부분 렌더링 예시 */
								(this.state.TAB === 'E') &&  /* 초등인 경우 */
								<div className="input_wrap">
									<ul className="join_ipt_chk">
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g01"
												name="grade"
												ref="grade"
												value="1"
												checked={event.arrMyGrade.includes('1')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g01">1학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g02"
												name="grade"
												value="2"
												checked={event.arrMyGrade.includes('2')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g02">2학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g03"
												name="grade"
												value="3"
												checked={event.arrMyGrade.includes('3')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g03">3학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g04"
												name="grade"
												value="4"
												checked={event.arrMyGrade.includes('4')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g04">4학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g05"
												name="grade"
												value="5"
												checked={event.arrMyGrade.includes('5')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g05">5학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g06"
												name="grade"
												value="6"
												checked={event.arrMyGrade.includes('6')}
												onChange={this.setMyGrade}/>
											<label htmlFor="g06">6학년</label>
										</li>
									</ul>
								</div>
							}
							{/* 교과 선택은 학교급 정보가 중/고등일때만 노출 */}
							{
								(this.state.TAB === 'H' || this.state.TAB === 'M' || this.state.directInput === 'Y') &&  /* 중등 , 고등 */
								<h2 className="info_tit">
									<label htmlFor="ipt_subject">내 교과</label>
								</h2>
							}
							{
								(this.state.TAB === 'H' || this.state.TAB === 'M' || this.state.directInput === 'Y') &&  /* 중등 , 고등 */
								<div className="combo_box type1 mb25">
									<div className="selectbox select_sm mb25">
										<select
											name="mainSubject"
											id="ipt_subject"
											onChange={this.handleChange}
										>
											<option value="">선택하세요</option>
											{
												(this.state.directInput === 'Y') &&
												<option value="전과목(초등)"
														selected={event.mainSubject == "전과목(초등)"}>전과목(초등)</option>
											}
											<option value="국어" selected={event.mainSubject == "국어"}>국어</option>
											<option value="영어" selected={event.mainSubject == "영어"}>영어</option>
											<option value="수학" selected={event.mainSubject == "수학"}>수학</option>
											<option value="사회" selected={event.mainSubject == "사회"}>사회</option>
											<option value="역사" selected={event.mainSubject == "역사"}>역사</option>
											<option value="도덕" selected={event.mainSubject == "도덕"}>도덕</option>
											<option value="과학" selected={event.mainSubject == "과학"}>과학</option>
											<option value="한문" selected={event.mainSubject == "한문"}>한문</option>
											<option value="기술·가정" selected={event.mainSubject == "기술·가정"}>기술·가정</option>
											<option value="정보" selected={event.mainSubject == "정보"}>정보</option>
											<option value="음악" selected={event.mainSubject == "음악"}>음악</option>
											<option value="미술" selected={event.mainSubject == "미술"}>미술</option>
											<option value="체육" selected={event.mainSubject == "체육"}>체육</option>
											<option value="진로와 직업" selected={event.mainSubject == "진로와 직업"}>진로와 직업
											</option>
											<option value="기타" selected={event.mainSubject == "기타"}>기타</option>
										</select>
									</div>
								</div>
							}
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_career">교사 경력</label>
							</h2>
							<div className="input_wrap">
								<input
									onChange={this.handleChange}
									type="number"
									id="ipt_career"
									name="career"
									maxLength="2"
									value={event.career}
									onKeyDown={(e) => {
										const keyCode = e.keyCode || e.which;
										// 숫자(0-9) 이외의 키를 눌렀을 때 입력 막기
										if (
											(keyCode < 48 || keyCode > 57) &&
											(keyCode < 96 || keyCode > 105)
										) {
											if (keyCode !== 8) {
												e.preventDefault();
											}
										}
									}}
									className="input_sm"/>
							</div>
							<h2 className="info_tit tit_flex">
								<label htmlFor="ipt_choice">비상교과서 채택여부</label>
								<ul className="join_ipt_chk">
									<li className="join_chk_list half">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_select01"
											name="visangTbYN"
											ref="visangTbYN"
											value="Y"
											checked={event.visangTbYN === 'Y'}
											onChange={this.handleChange}/>
										<label htmlFor="ipt_select01">채택</label>
									</li>
									<li className="join_chk_list half">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_select02"
											name="visangTbYN"
											value="N"
											checked={event.visangTbYN === 'N'}
											onChange={this.handleChange}/>
										<label htmlFor="ipt_select02">미채택</label>
									</li>
								</ul>
							</h2>
							<h2 className="info_tit">
								<label htmlFor="ipt_phone">휴대전화번호</label>
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
							{/* 운영 중인 sns 채널 */}
							<h2 className="info_tit">
								<label htmlFor="ipt_sns">운영 중인 SNS 채널</label>
							</h2>
							<div className="input_wrap">
								<ul className="join_ipt_chk">
									<li className="join_chk_list half">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_select03"
											name="snsYn"
											ref="snsYn"
											value="Y"
											checked={event.snsYn === 'Y'}
											onChange={this.handleChange}/>
										<label htmlFor="ipt_select03">있음</label>
									</li>
									<li className="join_chk_list half">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_select04"
											name="snsYn"
											value="N"
											checked={event.snsYn === 'N'}
											onChange={this.handleChange}/>
										<label htmlFor="ipt_select04">없음</label>
									</li>
								</ul>
							</div>

							<div className="input_wrap"
								 style={{display: event.snsYn == 'Y' ? 'block' : 'none'}}>
								<ul className="join_ipt_chk sns_list">
									<li className="join_chk_list">
										<input
											type="checkbox"
											className="checkbox"
											id="snsType1"
											name="snsType"
											value="blog"
											checked={event.arrMySns.includes('blog')}
											onChange={this.setMySns}/>
										<label htmlFor="snsType1">블로그(네이버, 티스토리)</label>
									</li>
									<li className="join_chk_list">
										<input
											type="checkbox"
											className="checkbox"
											id="snsType2"
											name="snsType"
											value="instagram"
											checked={event.arrMySns.includes('instagram')}
											onChange={this.setMySns}/>
										<label htmlFor="snsType2">인스타그램</label>
									</li>
									<li className="join_chk_list">
										<input
											type="checkbox"
											className="checkbox"
											id="snsType3"
											name="snsType"
											value="facebook"
											checked={event.arrMySns.includes('facebook')}
											onChange={this.setMySns}/>
										<label htmlFor="snsType3">페이스북</label>
									</li>
									<li className="join_chk_list">
										<input
											type="checkbox"
											className="checkbox"
											id="snsType4"
											name="snsType"
											value="youtube"
											checked={event.arrMySns.includes('youtube')}
											onChange={this.setMySns}/>
										<label htmlFor="snsType4">유튜브</label>
									</li>
									<li className="join_chk_list">
										<input
											type="checkbox"
											className="checkbox"
											id="snsType5"
											name="snsType"
											value="etc"
											checked={event.arrMySns.includes('etc')}
											onChange={this.setMySns}/>
										<label htmlFor="snsType5">기타</label>
									</li>
								</ul>
							</div>

						</div>
						<div className="guideline"/>
						<div className="pdside20 pb25">
							<h2 className="info_tit">
								<label htmlFor="applyContent">지원 분야</label>
							</h2>
							<div className="input_wrap">
								<ul className="subject_field_list">
									<li className="boxFlex">
										<input
											id="subjectField01"
											type="checkbox"
											className="checkbox"
											name="arrApplyContent1"
											value="0"
											checked={event.arrApplyContent1}
											onChange={this.handleChange}
											disabled={this.state.TAB != 'E' && this.state.directInput === 'N'}
										/>
										<label htmlFor="subjectField01"><span>초등 교과</span> -</label>
										<ul>
											<li>
												<input
													id="subjectE04"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '국어' : false}
													value="국어"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE04">국어</label>
											</li>
											<li>
												<input
													id="subjectE01"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '수학' : false}
													value="수학"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE01">수학</label>
											</li>
											<li>
												<input
													id="subjectE02"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '사회' : false}
													value="사회"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE02">사회</label>
											</li>
											<li>
												<input
													id="subjectE03"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '과학' : false}
													value="과학"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE03">과학</label>
											</li>
											<li>
												<input
													id="subjectE09"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '영어' : false}
													value="영어"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE08">영어</label>
											</li>
											<li>
												<input
													id="subjectE05"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '음악' : false}
													value="음악"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE05">음악</label>
											</li>
											<li>
												<input
													id="subjectE06"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '미술' : false}
													value="미술"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE06">미술</label>
											</li>
											<li>
												<input
													id="subjectE07"
													type="radio"
													className="checkbox_circle"
													name="applySubject"
													disabled={event.arrApplyContent1 === false}
													checked={event.arrApplyContent1 === true ? event.applySubject === '체육' : false}
													value="체육"
													onChange={this.handleChange}
												/>
												<label htmlFor="subjectE07">체육</label>
											</li>
										</ul>
									</li>
									<li>
										<input
											id="subjectField02"
											type="checkbox"
											className="checkbox"
											name="arrApplyContent2"
											value="1"
											checked={event.arrApplyContent2}
											onChange={this.handleChange}
											disabled={this.state.TAB === 'E' && this.state.directInput === 'N'}
										/>
										<label htmlFor="subjectField02"><span>중 · 고등 교과 - </span>내 교과와 동일한 과목으로 자동 지원
											됩니다.</label>
									</li>
								</ul>
							</div>
							<h2 className="info_tit mt25 txt_ls">
								<label htmlFor="applyContent1">지원 동기 (200자 이내)</label>
							</h2>
							<div className="input_wrap">
								<textarea
									name="applyContent1"
									id="applyContent1"
									cols="1"
									rows="10"
									maxLength="200"
									value={event.applyContent1}
									onChange={this.handleChange}
									placeholder="200자 까지 입력하실 수 있습니다."
									className="ipt_textarea"></textarea>
								<div className="count_wrap">
									<p className="count"><span>{event.applyContent1.length}</span>/200</p>
								</div>
							</div>
							<h2 className="info_tit mt25 txt_ls">
								<label htmlFor="applyContent2">개인 활동 내역 (500자 이내)</label>
							</h2>
							<div className="input_wrap">
								<textarea
									name="applyContent2"
									id="applyContent2"
									cols="1"
									rows="10"
									maxLength="500"
									value={event.applyContent2}
									onChange={this.handleChange}
									placeholder="500자 까지 입력하실 수 있습니다."
									className="ipt_textarea"></textarea>
								<div className="count_wrap">
									<p className="count"><span>{event.applyContent2.length}</span>/500</p>
								</div>
							</div>
							
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>이용목적 : 비바새미 활동 지원 확인</li>
									<li>수집하는 개인정보 : 성명, 학교명, 담당 학년, 교과목, 교사 경력, 비상교과서 채택 여부, 휴대전화번호</li>
									<li>개인정보 보유 및 이용기간 : 2025년 3월 31일까지 (이용목적 달성 시 즉시 파기)</li>
									<li>수집하는 개인정보의 취급위탁 : 경품 발송을 위해 개인정보(이름/주소/연락처)를 서비스 업체에 취급 위탁 <br/>(㈜카카오 사업자등록번호 120-81-47521, <br/>CJ대한통운(주) 사업자등록번호 110-81-05034)</li>
								</ul>
								<br />
								<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
							</div>
						</div>
						<div className="checkbox_circle_box mt25 pdside20">
							<input
								type="checkbox"
								name="agree1"
								onChange={this.handleChange}
								checked={event.agree1}
								className="checkbox_circle checkbox_circle_rel"
								id="join_agree01"/>
							<label
								htmlFor="join_agree01"
								className="checkbox_circle_simple">
								<strong className="checkbox_circle_tit">
									본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.
								</strong>
							</label>
						</div>
						<div className="pdside20">
							<ul className="privacyList">
								<li>위 항목을 모두 입력하셔야 지원이 가능합니다.</li>
								<li>개인정보가 불분명한 경우 선발 명단에서 제외될 수 있습니다. 개인정보는 꼭 확인해주세요.</li>
								<li>작성하신 내용은 지원 후 수정/삭제가 불가합니다.</li>
							</ul>
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
		isApp: state.base.get('isApp')
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(EventApply));