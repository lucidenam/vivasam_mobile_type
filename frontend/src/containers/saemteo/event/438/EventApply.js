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
import RenderLoading from 'components/common/RenderLoading';

import './Event.css';
import {Cookies} from "react-cookie";
import moment from "moment";

const cookies = new Cookies();
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
		directInput: 'N',
	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}

	componentDidMount() {
		const {eventId, eventAnswer, history} = this.props;
		this.getEventInfo(eventId);
		// const {eventId, eventAnswer, history} = this.props;
		// if(!eventId) {
		// 	history.push('/saemteo/event');
		// }
		// else if (eventAnswer.isEventApply) {
		// 	common.error("이미 신청하셨습니다.");
		//  	history.push('/saemteo/event/view/' + eventId);
		// }
		// else {
		// 	this.getEventInfo(eventId);
		// }
	}



	getEventInfo = async (eventId) => {
		const {history, event, SaemteoActions} = this.props;
		const response = await api.eventInfo(eventId);
		if (response.data.code && response.data.code === "0") {
			let eventInfo = response.data.eventList[0];
			event.eventId = eventInfo.eventId;
			let {memberId, name, schCode, schName, schZipCd, schAddr, schFlag, cellphone, myGrade, mainSubject} = response.data.memberInfo;


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
			event.arrMySubject = '';
			event.mainSubject = '';
			event.career = '';
			event.visangTbYN = '';
			event.arrApplyContent1 = false;
			event.arrApplyContent2 = false;
			event.arrApplyContent3 = false;
			event.applySubject =  '';
			event.applyContent1 = '';
			event.applyContent2 = '';
			event.address = 'address1';
			event.ogSchType = '';
			event.currSchType = '';
			event.grade = '';
			event.subjectEle = ["수학","사회",'과학','음악','미술','체육','실과'];
			event.subjectMid = ["국어", "영어", "수학", "사회", "과학", "역사", "도덕", "기술가정", "음악", "한문", "정보", "미술", "체육", "진로와 직업",];
			event.subjectHigh = ["국어", "문학", "독서", "언어와 매체", "화법과 작문", "​영어", "영어 회화", "영어 독해와 작문", "수학", "미적분", "확률과 통계", "기하", "통합과학", "과학탐구실험", "물리학", "화학", "생명과학", "지구과학", "통합사회", "한국사", "생활과 윤리", "윤리와 사상", "사회문화", "경제", "한국지리", "동아시아사", "세계지리", "세계사", "정치와 법", "기술가정", "한문", "정보", "진로와 직업", "음악", "인공기능 기초"];

			//디폴트 학교급 셋팅
			if(schFlag == 'ES' || schFlag == 'E'){
				event.currSchType = 'E';
			} else if (schFlag == 'MS' || schFlag == 'M') {
				event.currSchType = 'M';
			} else if (schFlag == 'HS' || schFlag == 'H') {
				event.currSchType = 'H';
			} else {
				event.currSchType = 'E';
			}
			event.ogSchType = event.currSchType;


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

	//직접 입력 선택
	chooseAddress = (e) => {
		const {event, SaemteoActions} = this.props;

		event.address = e.currentTarget.getAttribute('value');

		//담당학년, 신청과목 초기화 및 원래 학교급으로 변환
		event.arrMyGrade = '';
		event.arrMySubject = '';
		event.currSchType = event.ogSchType;

		SaemteoActions.pushValues({type: "event", object: event});
	};

	//학교급선택
	chooseCurrSchType = (e) => {
		const {event, SaemteoActions} = this.props;

		if(event.address == "address1") {
			return false
		}else {
			event.currSchType = e.currentTarget.getAttribute('value');

			//담당학년, 신청과목 초기화
			event.arrMyGrade = '';
			event.arrMySubject = '';

			SaemteoActions.pushValues({type: "event", object: event});
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

		//디폴트 학교급 셋팅
		if(schoolGrade == 'ES' || schoolGrade == 'E'){
			event.currSchType = 'E';
		} else if (schoolGrade == 'MS' || schoolGrade == 'M') {
			event.currSchType = 'M';
		} else if (schoolGrade == 'HS' || schoolGrade == 'H') {
			event.currSchType = 'H';
		} else {
			event.currSchType = 'E';
		}
		event.ogSchType = event.currSchType;

		//담당학년, 신청과목 초기화
		event.arrMyGrade = '';
		event.arrMySubject = '';

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
		} else if (event.arrMySubject === "") {
			obj.message = '내 신청과목을 선택해 주세요.';
		} else if (event.visangTbYN !== "N" && event.visangTbYN !== "Y") {
			obj.message = '비상교과서 채택여부를 선택해 주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해 주세요.';
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
			event.eventAnswerDesc = event.inputType + '/' + event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail;

			// 신청 내용
			event.eventAnswerDesc2 = "학교급 : "
			if(event.currSchType == 'E') {
				event.eventAnswerDesc2 += '초등학교';
			} else if(event.currSchType == 'M') {
				event.eventAnswerDesc2 += '중학교';
			} else if(event.currSchType == 'H') {
				event.eventAnswerDesc2 += '고등학교';
			}

			event.eventAnswerDesc2 += "^||^담당 학년 : " + event.arrMyGrade;
			event.eventAnswerDesc2 += "^||^신청교과 : " + event.arrMySubject;
			event.eventAnswerDesc2 += "^||^비상교과서 채택여부 : " + event.visangTbYN;
			if(event.applyContent2 != null && event.applyContent2 != ''){
				event.eventAnswerDesc2 += "^||^기타 요청사항 : " + event.applyContent2;
			}

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

	/* 신청과목 작업 */
	setMySubject = (e) => {
		const {event, SaemteoActions} = this.props

		let tmpArr = event.arrMySubject.split(',')

		if(event.arrMySubject.includes(e.target.value)) {
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
		event.arrMySubject = tmpStr;

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
				// PopupActions.openPopup({title:"신청완료", component:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});

				// 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
				if (event.schCode && event.schCode !== this.state.initialSchCode) {
					MyclassActions.myClassInfo();
				}
				cookies.set("2023popDataAsk", true, {
					expires: moment().add(365, 'days').toDate()
				});

				common.info("신청이 완료되었습니다.");
				history.push("/");
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

		const list1 = event.subjectEle.map((v1, index1) => {
			return (
				<li className="join_chk_list" style={{width: '33%'}}>
					<input
						type="checkbox"
						className="checkbox"
						id={"subjectEle" + (index1 + 1)}
						name="subjectEle"
						ref="subjectEle"
						value={v1}
						checked={event.arrMySubject.includes(v1)}
						onChange={this.setMySubject}
					/>
					<label htmlFor={"subjectEle" + (index1 + 1)}>{v1}</label>
				</li>
			)
		});

		const list2 = event.subjectMid.map((v2, index2) => {
			return (
				<li className="join_chk_list" style={{width: '33%'}}>
					<input
						type="checkbox"
						className="checkbox"
						id={"subjectMid" + (index2 + 1)}
						name="subjectMid"
						ref="subjectEle"
						value={v2}
						checked={event.arrMySubject.includes(v2)}
						onChange={this.setMySubject}
					/>
					<label htmlFor={"subjectMid" + (index2 + 1)}>{v2}</label>
				</li>
			)
		});

		const list3 = event.subjectHigh.map((v3, index3) => {
			return (
				<li className="join_chk_list" style={{width: '33%'}}>
					<input
						type="checkbox"
						className="checkbox"
						id={"subjectHigh" + (index3 + 1)}
						name="subjectHigh"
						ref="subjectHigh"
						value={v3}
						checked={event.arrMySubject.includes(v3)}
						onChange={this.setMySubject}
					/>
					<label htmlFor={"subjectHigh" + (index3 + 1)}>{v3}</label>
				</li>
			)
		});

		return (
			<section className="vivasamter event220210">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>비상교과서 신학기 연구용 자료 신청하기</strong></h3>
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
										<label htmlFor="userInfoY" value="address1" onClick={this.chooseAddress}>정보 불러오기</label>
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
										<label htmlFor="userInfoN" value="address2" onClick={this.chooseAddress}>직접입력</label>
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
							{event.userInfo == 'Y' && <p className="bulTxt mt10 ml10">* 학교 검색에서 찾으시는 학교가 없을 경우,<br/><span className="ml8">직접 입력을 통해 재직학교와 주소를 입력해 주세요.</span></p>}
							{event.userInfo == 'Y' && <p className="bulTxt mb15 ml10">* 학교 검색으로 변경된 정보는선생님의 회원 정보로 갱신됩니다.</p>}
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
								<label htmlFor="ipt_grade">학교급</label>
							</h2>
							<div className="input_wrap">
								<ul className="join_ipt_chk">
									<li className="join_chk_list" style={{width: '33%'}}>
										<input
											type="radio"
											className="checkbox_circle"
											id="schType01"
											name="schType"
											ref="schType"
											value="M"
											disabled={event.address == 'address1' ? true : false}
											checked = {event.currSchType == "E" ? true : false}
										/>
										<label htmlFor="schType01" onClick={this.chooseCurrSchType} value="E">초등학교</label>
									</li>
									<li className="join_chk_list" style={{width: '33%'}}>
										<input
											type="radio"
											className="checkbox_circle"
											id="schType02"
											name="schType"
											ref="schType"
											value="M"
											disabled={event.address == 'address1' ? true : false}
											checked = {event.currSchType == "M" ? true : false}
										/>
										<label htmlFor="schType02" onClick={this.chooseCurrSchType} value="M">중학교</label>
									</li>
									<li className="join_chk_list" style={{width: '33%'}}>
										<input
											type="radio"
											className="checkbox_circle"
											id="schType03"
											name="schType"
											ref="schType"
											value="H"
											disabled={event.address == 'address1' ? true : false}
											checked = {event.currSchType == "H" ? true : false}
										/>
										<label htmlFor="schType03" onClick={this.chooseCurrSchType} value="H">고등학교</label>
									</li>
								</ul>
							</div>
							<h2 className="info_tit">
								<label htmlFor="ipt_grade">담당 학년</label>
							</h2>
							<div className={"input_wrap grade_wrap" + (event.currSchType == "E" ? " on" : "" )}>
								<ul className="join_ipt_chk">
									<li className="join_chk_list" style={{width: '25%'}}>
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
									<li className="join_chk_list" style={{width: '25%'}}>
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
									<li className="join_chk_list" style={{width: '25%'}}>
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
									<li className="join_chk_list" style={{width: '25%'}}>
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
							<div className={"input_wrap grade_wrap" + ((event.currSchType == "M" || event.currSchType == "H") ? " on" : "" )} >
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
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_career">신청 과목</label>
							</h2>
							<div className="input_wrap">
								<ul className={"join_ipt_chk subject_wrap" + (event.currSchType == "E" ? " on" : "")}>
									{list1}
								</ul>
								<ul className={"join_ipt_chk subject_wrap" + (event.currSchType == "M" ? " on" : "")}>
									{list2}
								</ul>
								<ul className={"join_ipt_chk subject_wrap" + (event.currSchType == "H" ? " on" : "")}>
									{list3}
								</ul>
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
							<h2 className="info_tit mt25 txt_ls tit_flex required">
								<label htmlFor="applyContent2">기타 요청사항 <span>(선택)</span></label>
								<div className="count_wrap">
									<p className="count"><span>{event.applyContent2.length}</span>/500</p>
								</div>
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
									placeholder="최대 500자 입력 가능합니다."
									className="ipt_textarea"></textarea>
							</div>

							 <p className="bulTxt mt10 type02">
								 신학기 연구용 자료는 가까운 지사를 통해 배포되며 내용 확인을<br />
								  위하여 연락을 드릴 수 있습니다.
							 </p>
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>이용목적 : 고객 문의 응대</li>
									<li className="infoIndent">
										수집하는 개인정보 : 성명, 휴대전화번호, 재직 학교
									</li>
									<li>
										개인정보 보유 및 이용기간 : 2023년 6월 30일까지 <br />
										(이용목적 달성 시 즉시 파기)
									</li>
								</ul>
								<br />
								<p className="privacyTxt">
									선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한
									동의를 거부할 수 있습니다.
									단, 동의를 거부할 경우 지원이 불가합니다.
								</p>
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
