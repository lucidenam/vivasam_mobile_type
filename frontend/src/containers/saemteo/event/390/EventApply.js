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
		eventAgree: '', // 개인정보 동의여부
		subSubject: 'N', // 비교과
		TAB: '', // 학급 ( E : 초등 / M  : 중등 / H : 고등 )
		arrApplyContent: [false, false, false],
		arrApplyContentNm: ['초등교과', '중고등교과', '비교과콘텐츠'],
		applySubject: '',
		arrMyGrade: [false, false, false, false, false, false],
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

			this.phonecheckByUserInfoCellphone(cellphone);
			SaemteoActions.pushValues({type: "event", object: event});

			let arrMyGrade = [false, false, false, false, false, false];
			if (myGrade != '') {
				arrMyGrade[myGrade - 1] = true;
			}
			this.setState({
				eventInfo: eventInfo,
				initialSchName: schName,
				initialSchZipCd: schZipCd,
				initialSchAddr: schAddr,
				userCellphone: cellphone,
				mainSubject: mainSubject,
				arrMyGrade: arrMyGrade
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
		if (e.target.name === 'agree1') {
			event[e.target.name] = e.target.checked;
		} else {
			event[e.target.name] = e.target.value;
		}
		SaemteoActions.pushValues({type: "event", object: event});
	};

	handleUserInfo = (e) => {
		const {event, SaemteoActions} = this.props;
		const {initialSchName, initialSchZipCd, initialSchAddr, userCellphone} = this.state;
		// 학년 초기화
		let arrMyGrade = [false, false, false, false, false, false];
		this.setState({arrMyGrade: arrMyGrade});
		
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
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
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
			let mainSubject = this.state.mainSubject;
			if ((mainSubject === '' && this.state.TAB !== 'E' && this.state.directInput === 'N') || (mainSubject === '' && this.state.directInput === 'Y')) {
				common.info('내교과를 선택해 주세요.');
				target.disabled = false;
				return false;
			}
			if (this.state.TAB === 'E') {
				mainSubject = '';
			}
			// 담당학년 구분
			let myGrade = '';
			let arrMyGrade = this.state.arrMyGrade;
			let notSelMyGrade = true;
			for (let i = 0; i < arrMyGrade.length; i++) {
				if (arrMyGrade[i]) {
					notSelMyGrade = false;
					if (myGrade === '') {
						myGrade = (i + 1);
					} else {
						myGrade += ',' + (i + 1);
					}
				}
			}
			if (notSelMyGrade) {
				common.info('담당 학년을 선택해 주세요.');
				target.disabled = false;
				return false;
			}
			event.eventAnswerDesc = event.inputType + '/' + event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail + "/담당 학년 : " + myGrade + "/내 교과 : ";
			// 과목별 구분
			if (mainSubject == "SC100") {
				event.eventAnswerDesc += "국어";
			} else if (mainSubject == "SC101") {
				event.eventAnswerDesc += "영어";
			} else if (mainSubject == "SC102") {
				event.eventAnswerDesc += "수학";
			} else if (mainSubject == "SC103") {
				event.eventAnswerDesc += "사회";
			} else if (mainSubject == "SC106") {
				event.eventAnswerDesc += "역사";
			} else if (mainSubject == "SC107") {
				event.eventAnswerDesc += "도덕";
			} else if (mainSubject == "SC104") {
				event.eventAnswerDesc += "과학";
			} else if (mainSubject == "SC105") {
				event.eventAnswerDesc += "한문";
			} else if (mainSubject == "SC110") {
				event.eventAnswerDesc += "기술·가정";
			} else if (mainSubject == "SC114") {
				event.eventAnswerDesc += "정보";
			} else if (mainSubject == "SC108") {
				event.eventAnswerDesc += "음악";
			} else if (mainSubject == "SC109") {
				event.eventAnswerDesc += "미술";
			} else if (mainSubject == "SC111") {
				event.eventAnswerDesc += "체육";
			} else if (mainSubject == "SC112") {
				event.eventAnswerDesc += "실과";
			} else if (mainSubject == "SC113") {
				event.eventAnswerDesc += "진로와 직업";
			} else if (mainSubject == "SC199") {
				event.eventAnswerDesc += "기타";
			}

			if(this.state.career === ''){
				common.info('선생님의 경력 년 수를 입력해 주세요.');
				target.disabled = false;
				return false;
			}
			if(this.state.visangTbYN === ''){
				common.info('비상교과서 채택여부를 선택해 주세요.');
				target.disabled = false;
				return false;
			}
			event.eventAnswerDesc += "/교사 경력 : " + this.state.career + "/교과서 채택 여부 : " + this.state.visangTbYN;
			// 지원분야
			let arrApplyContent = this.state.arrApplyContent;
			let arrApplyContentNm = this.state.arrApplyContentNm;
			let applySubject = this.state.applySubject;
			if (!arrApplyContent[0] && !arrApplyContent[1] && !arrApplyContent[2]) {
				common.info('모니터링단 지원 분야를 선택해 주세요.');
				target.disabled = false;
				return false;
			}
			if (arrApplyContent[0] && applySubject === '') {
				common.info('초등 교과 지원 과목을 선택해 주세요.');
				target.disabled = false;
				return false;
			}
			let applyContentNm = '';
			for (let i = 0; i < arrApplyContent.length; i++) {
				if (arrApplyContent[i]) {
					if (applyContentNm === '') {
						if (i === 0) {
							applyContentNm = arrApplyContentNm[i] + '-' + applySubject;
						} else {
							applyContentNm += arrApplyContentNm[i];
						}
					} else {
						applyContentNm += ',' + arrApplyContentNm[i];
					}
				}
			}
			event.eventAnswerDesc += "/지원 분야 : " + applyContentNm;

			let comment1 = this.state.step1;
			let comment2 = this.state.step2;
			if (comment1.trim() === '') {
				common.info('지원 동기를 입력해 주세요.');
				target.disabled = false;
				return false;
			}
			if (comment2.trim() === '') {
				common.info('개인 활동 내역을 입력해 주세요.');
				target.disabled = false;
				return false;
			}
			event.eventAnswerDesc2 = comment1 + '^||^' + comment2;
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
	setMyGrade = (index, e) => {
		console.log(index);
		let arrMyGrade = this.state.arrMyGrade;
		arrMyGrade[index] = !arrMyGrade[index];
		this.setState({
			arrMyGrade: arrMyGrade
		});
	};

	/* 담당교과 작업 */
	setMainSubject = (e) => {
		this.setState({
			mainSubject: e.target.value
		});
	};

	/* 담당 교사 경력 작업 */
	setCareer = (e) => {
		this.setState({
			career: e.target.value
		});
	};

	/* 교과서 채택 작업 */
	setVisangTbYN = (e) => {
		this.setState({
			visangTbYN: e.target.value
		});
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

	setApplySubject = async (e) => {
		this.setState({applySubject: e.target.value});
	}
	
	setApplyContent = (index, e) => {
		let arrApplyContent = this.state.arrApplyContent;
		if(!arrApplyContent[index]){
			if(index == 0){
				if(arrApplyContent[1]){
					common.info("초등과 중고등 교과는 중복 지원 불가합니다.");
					return false;
				}
			}else if(index == 1){
				if(arrApplyContent[0]){
					common.info("초등과 중고등 교과는 중복 지원 불가합니다.");
					return false;
				}
			}
		}
		arrApplyContent[index] = !arrApplyContent[index];
		this.setState({arrApplyContent: arrApplyContent});
	};

	// 내용 입력
	// 댓글 수정 시 길이 연동 및 이벤트 내용 수정
	setApplyContent1 = (e) => {
		if (e.target.value.length > 200) {
			common.info("200자 이내로 입력해 주세요.");
		} else {
			this.setState({
				step1Length: e.target.value.length,
				step1: e.target.value
			});
		}
	};

	setApplyContent2 = (e) => {
		if (e.target.value.length > 500) {
			common.info("500자 이내로 입력해 주세요.");
		} else {
			this.setState({
				step2Length: e.target.value.length,
				step2: e.target.value
			});
		}
	};

	render() {
		const {eventInfo} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;
				
		return (
			<section className="vivasamter event220210">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>비바샘 모니터링단 9기 모집</strong></h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					<div className="vivasamter_applyDtl pdside0">
						<div className="pdside20 pb25">
							<h2 className="info_tit">
								<label htmlFor="ipt_name">성명</label>
							</h2>
							<div className="input_wrap mb25">
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
							<div className="input_wrap mb10">
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
							</div>
							<div className={event.userInfo === 'Y' ? 'input_wrap school mb10' : 'input_wrap school mb25'}>
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
							{event.userInfo == 'Y' && <p className="bulTxt mb15 mt10 ml10">* 학교 검색에서 찾으시는 학교가 없을 경우,<br/><span className="ml8">직접 입력을 통해 재직학교와 주소를 입력해 주세요.</span></p>}
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
							<div className="input_wrap mt5 mb25">
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
								(this.state.TAB !== 'E' && this.state.directInput === 'N') &&  /* 중등 , 고등 */
								<div className="input_wrap mb25">
									<ul className="join_ipt_chk">
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g01"
												name="grade"
												ref="grade"
												value="1"
												checked={this.state.arrMyGrade[0]}
												onChange={this.setMyGrade.bind(this, 0)}/>
											<label htmlFor="g01">1학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g02"
												name="grade"
												value="2"
												checked={this.state.arrMyGrade[1]}
												onChange={this.setMyGrade.bind(this, 1)}/>
											<label htmlFor="g02">2학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g03"
												name="grade"
												value="3"
												checked={this.state.arrMyGrade[2]}
												onChange={this.setMyGrade.bind(this, 2)}/>
											<label htmlFor="g03">3학년</label>
										</li>
									</ul>
								</div>
							}
							{ /* 부분 렌더링 예시 */
								(this.state.TAB === 'E' || this.state.directInput === 'Y') &&  /* 초등인 경우 */
								<div className="input_wrap mb25">
									<ul className="join_ipt_chk">
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g01"
												name="grade"
												ref="grade"
												value="1"
												checked={this.state.arrMyGrade[0]}
												onChange={this.setMyGrade.bind(this, 0)}/>
											<label htmlFor="g01">1학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g02"
												name="grade"
												value="2"
												checked={this.state.arrMyGrade[1]}
												onChange={this.setMyGrade.bind(this, 1)}/>
											<label htmlFor="g02">2학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g03"
												name="grade"
												value="3"
												checked={this.state.arrMyGrade[2]}
												onChange={this.setMyGrade.bind(this, 2)}/>
											<label htmlFor="g03">3학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g04"
												name="grade"
												value="4"
												checked={this.state.arrMyGrade[3]}
												onChange={this.setMyGrade.bind(this, 3)}/>
											<label htmlFor="g04">4학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g05"
												name="grade"
												value="5"
												checked={this.state.arrMyGrade[4]}
												onChange={this.setMyGrade.bind(this, 4)}/>
											<label htmlFor="g05">5학년</label>
										</li>
										<li className="join_chk_list" style={{width: '33%'}}>
											<input
												type="checkbox"
												className="checkbox"
												id="g06"
												name="grade"
												value="6"
												checked={this.state.arrMyGrade[5]}
												onChange={this.setMyGrade.bind(this, 5)}/>
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
											name="receive"
											id="ipt_subject"
											onChange={this.setMainSubject}
										>
											<option value="">선택하세요</option>
											{
												(this.state.directInput === 'Y') &&
												<option value="SC000" selected={this.state.mainSubject == "SC000"}>전과목(초등)</option>
											}
											<option value="SC100" selected={this.state.mainSubject == "SC100"}>국어</option>
											<option value="SC101" selected={this.state.mainSubject == "SC101"}>영어</option>
											<option value="SC102" selected={this.state.mainSubject == "SC102"}>수학</option>
											<option value="SC103" selected={this.state.mainSubject == "SC103"}>사회</option>
											<option value="SC106" selected={this.state.mainSubject == "SC106"}>역사</option>
											<option value="SC107" selected={this.state.mainSubject == "SC107"}>도덕</option>
											<option value="SC104" selected={this.state.mainSubject == "SC104"}>과학</option>
											<option value="SC105" selected={this.state.mainSubject == "SC105"}>한문</option>
											<option value="SC110" selected={this.state.mainSubject == "SC110"}>기술·가정
											</option>
											<option value="SC114" selected={this.state.mainSubject == "SC114"}>정보</option>
											<option value="SC108" selected={this.state.mainSubject == "SC108"}>음악</option>
											<option value="SC109" selected={this.state.mainSubject == "SC109"}>미술</option>
											<option value="SC111" selected={this.state.mainSubject == "SC111"}>체육</option>
											<option value="SC112" selected={this.state.mainSubject == "SC112"}>실과</option>
											<option value="SC113" selected={this.state.mainSubject == "SC113"}>진로와 직업
											</option>
											<option value="SC199" selected={this.state.mainSubject == "SC199"}>기타</option>
										</select>
									</div>
								</div>
							}
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_career">교사 경력</label>
							</h2>
							<div className="input_wrap mb25">
								<input
									onChange={this.setCareer}
									type="number"
									id="ipt_career"
									name="career"
									maxLength="2"
									value={this.state.career}
									className="input_sm"/>
							</div>
							<h2 className="info_tit">
								<label htmlFor="ipt_choice">비상교과서 채택여부</label>
							</h2>
							<div className="input_wrap mb25">
								<ul className="join_ipt_chk">
									<li className="join_chk_list half">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_select01"
											name="visangTbYN"
											ref="visangTbYN"
											value="Y"
											checked={this.state.visangTbYN === 'Y'}
											onChange={this.setVisangTbYN}/>
										<label htmlFor="ipt_select01">채택</label>
									</li>
									<li className="join_chk_list half">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_select02"
											name="visangTbYN"
											value="N"
											checked={this.state.visangTbYN === 'N'}
											onChange={this.setVisangTbYN}/>
										<label htmlFor="ipt_select02">미채택</label>
									</li>
								</ul>
							</div>
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
						</div>
						<div className="guideline"/>
						<div className="pdside20 pb25">
							<p className="pointTxt mt25 mb25">※ 초·중·고 교과와 비교과 콘텐츠를 중복 지원할 수 있습니다.</p>
							<h2 className="info_tit">
								<label htmlFor="applyContent">지원 분야</label>
							</h2>
							<div className="input_wrap">
								<ul className="subject_field_list">
									<li>
										<input
											id="subjectField01"
											type="checkbox"
											className="checkbox"
											name="subjectField"
											checked={this.state.arrApplyContent[0]}
											onChange={this.setApplyContent.bind(this, 0)}
											disabled={this.state.TAB != 'E' && this.state.directInput === 'N'}
										/>
										<label htmlFor="subjectField01"><span>초등 교과</span> -</label>
										<ul>
											<li>
												<input
													id="subjectE04"
													type="radio"
													className="checkbox_circle"
													name="subjectE"
													disabled={this.state.arrApplyContent[0] === false}
													checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '국어' : false}
													value={'국어'}
													onChange={this.setApplySubject}
												/>
												<label htmlFor="subjectE04">국어</label>
											</li>
											<li>
												<input
													id="subjectE01"
													type="radio"
													className="checkbox_circle"
													name="subjectE"
													disabled={this.state.arrApplyContent[0] === false}
													checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '수학' : false}
													value={'수학'}
													onChange={this.setApplySubject}
												/>
												<label htmlFor="subjectE01">수학</label>
											</li>
											<li>
												<input
													id="subjectE02"
													type="radio"
													className="checkbox_circle"
													name="subjectE"
													disabled={this.state.arrApplyContent[0] === false}
													checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '사회' : false}
													value={'사회'}
													onChange={this.setApplySubject}
												/>
												<label htmlFor="subjectE02">사회</label>
											</li>
											<li>
												<input
													id="subjectE03"
													type="radio"
													className="checkbox_circle"
													name="subjectE"
													disabled={this.state.arrApplyContent[0] === false}
													checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '과학' : false}
													value={'과학'}
													onChange={this.setApplySubject}
												/>
												<label htmlFor="subjectE03">과학</label>
											</li>
										</ul>
									</li>
									<li>
										<input
											id="subjectField02"
											type="checkbox"
											className="checkbox"
											name="subjectField"
											checked={this.state.arrApplyContent[1]}
											onChange={this.setApplyContent.bind(this, 1)}
											disabled={this.state.TAB === 'E' && this.state.directInput === 'N'}
										/>
										<label htmlFor="subjectField02"><span>중 · 고등 교과</span> - 전과목</label>
									</li>
									<li>
										<input
											id="subjectField03"
											type="checkbox"
											className="checkbox"
											name="subjectField"
											checked={this.state.arrApplyContent[2]}
											onChange={this.setApplyContent.bind(this, 2)}
										/>
										<label htmlFor="subjectField03"><span>비교과 콘텐츠</span> - 수업 혁신, 진로/진학, 체험활동</label>
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
									value={this.state.step1}
									onChange={this.setApplyContent1}
									placeholder="200자 까지 입력하실 수 있습니다."
									className="ipt_textarea"></textarea>
								<div className="count_wrap">
									<p className="count"><span>{this.state.step1Length}</span>/200</p>
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
									value={this.state.step2}
									onChange={this.setApplyContent2}
									placeholder="500자 까지 입력하실 수 있습니다."
									className="ipt_textarea"></textarea>
								<div className="count_wrap">
									<p className="count"><span>{this.state.step2Length}</span>/500</p>
								</div>
							</div>
							
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>이용목적 : 이벤트 참여 확인</li>
									<li>수집하는 개인정보 : 성명, 재직학교, 학교주소, 휴대전화번호</li>
									<li>개인정보 보유 및 이용기간 : 2022년 3월 31일까지 <br/>(이용목적 달성 시 즉시 파기)</li>
									<li>수집하는 개인정보의 취급위탁 : 개인정보(성명/주소, 휴대전화번호)를 배송업체에 취급위탁<br/>((주)한진 사업자등록번호 201-81-02823)</li>
								</ul>
								<br />
								<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
							</div>
						</div>
						<div className="checkbox_circle_box mt25 mb15 pdside20">
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
									<li>개인정보가 불분명한 경우 선발 명단에서 제외될 수 있습니다.<br />개인정보는 꼭 확인해주세요.</li>
									<li>작성하신 내용은 지원 후 수정/삭제가 불가합니다.</li>
								</ul>
						</div>
						<button
							type="button"
							onClick={this.applyButtonClickSafe}
							className="btn_full_on mt35">신청하기
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