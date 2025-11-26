import React, {Component, Fragment} from 'react';
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

// 경품의 종류
const CONTENT_TYPE_START = 3;
const CONTENT_TYPE_END = 86;

// 경품 목록
const CONTENT_LIST = [
	{id: '1', name: '초등,수학,수학 3-1, 3-2 (방정숙) 수학 익힘 3-1, 3-2 (방정숙) 사회 4-1, 4-2 (설규주) 과학 3-1, 3-2 (강석진) 실험 관찰 3-1, 3-2 (강석진)'},
	{id: '2', name: '초등,수학,수학 4-1, 4-2 (방정숙) 수학 익힘 4-1, 4-2 (방정숙) 사회 4-1, 4-2 (설규주) 과학 4-1, 4-2 (강석진) 실험 관찰 4-1, 4-2 (강석진)'},
	{id: '3', name: '초등,음악,음악 3 (주대창)'},
	{id: '4', name: '초등,음악,음악 4 (주대창)'},
	{id: '5', name: '초등,미술,미술 3 (이재영)'},
	{id: '6', name: '초등,미술,미술 4 (이재영)'},
	{id: '7', name: '초등,체육,체육 3 (송지환)'},
	{id: '8', name: '초등,체육,체육 4 (송지환)'},
	{id: '9', name: '중학,국어,국어 1-1, 1-2 (박현숙)'},
	{id: '10', name: '중학,국어,국어 1-1, 1-2 (박영민)'},
	{id: '11', name: '중학,영어,영어 1 (황종배)'},
	{id: '12', name: '중학,수학,수학 1 (이진호)'},
	{id: '13', name: '중학,사회,사회 ①, ② (강창숙)'},
	{id: '14', name: '중학,사회,사회과 부도 (강창숙)'},
	{id: '15', name: '중학,역사,역사 ①, ② (이병인)'},
	{id: '16', name: '중학,역사,역사 부도 (이병인)'},
	{id: '17', name: '중학,도덕,도덕 ①, ② (김국현)'},
	{id: '18', name: '중학,과학,과학 1 (임태훈)'},
	{id: '19', name: '중학,한문,한문 (이동재)'},
	{id: '20', name: '중학,기술·가정,기술·가정 ①, ② (김지숙)'},
	{id: '21', name: '중학,정보,정보 (임희석)'},
	{id: '22', name: '중학,음악,음악 ①, ② (이동희)'},
	{id: '23', name: '중학,미술,미술 ①, ② (정현일)'},
	{id: '24', name: '중학,체육,체육 ①, ② (이민표)'},
	{id: '25', name: '중학,진로와 직업,진로와 직업 (손은령)'},
	{id: '26', name: '고등,국어,공통국어 1, 2 (강호영)'},
	{id: '27', name: '고등,국어,공통국어 1, 2 (박영민)'},
	{id: '28', name: '고등,국어,화법과 언어 (이관규)'},
	{id: '29', name: '고등,국어,독서와 작문 (최인영)'},
	{id: '30', name: '고등,국어,문학 (강호영)'},
	{id: '31', name: '고등,국어,직무 의사소통 (박영민)'},
	{id: '32', name: '고등,국어,매체 의사소통 (옥현진)'},
	{id: '33', name: '고등,국어,언어생활 탐구 (이관규)'},
	{id: '34', name: '고등,영어,공통영어 1, 2 (홍민표)'},
	{id: '35', name: '고등,영어,영어 Ⅰ, Ⅱ (홍민표)'},
	{id: '36', name: '고등,영어,영어 독해와 작문(황종배)'},
	{id: '37', name: '고등,영어,세계 문화와 영어(권혁승)'},
	{id: '38', name: '고등,수학,공통수학 1, 2 (김원경) '},
	{id: '39', name: '고등,수학,기본수학 1, 2 (김원경)'},
	{id: '40', name: '고등,수학,대수 (김원경)'},
	{id: '41', name: '고등,수학,미적분Ⅰ (김원경)'},
	{id: '42', name: '고등,수학,확률과 통계 (김원경)'},
	{id: '43', name: '고등,사회,통합사회 1, 2 (이영호)'},
	{id: '44', name: '고등,사회,세계시민과 지리(박배균)'},
	{id: '45', name: '고등,사회,지리 부도 (정성훈)'},
	{id: '46', name: '고등,사회,사회와 문화 (유종열)'},
	{id: '47', name: '고등,사회,한국지리 탐구 (정성훈)'},
	{id: '48', name: '고등,사회,정치 (정필운)'},
	{id: '49', name: '고등,사회,여행지리 (이우평)'},
	{id: '50', name: '고등,사회,사회문제 탐구 (이영호)'},
	{id: '51', name: '고등,역사,한국사 1, 2 (도면회)'},
	{id: '52', name: '고등,역사,역사 부도 (도면회)'},
	{id: '53', name: '고등,역사,세계사 (이병인)'},
	{id: '54', name: '고등,역사,동아시아 역사 기행 (이병인)'},
	{id: '55', name: '고등,도덕,현대사회와 윤리 (김국현)'},
	{id: '56', name: '고등,과학,통합과학 1, 2 (심규철)'},
	{id: '57', name: '고등,과학,과학탐구실험 1, 2 (심규철)'},
	{id: '58', name: '고등,과학,물리학 (손정우)'},
	{id: '59', name: '고등,과학,화학 (최원호)'},
	{id: '60', name: '고등,과학,생명과학 (심규철)'},
	{id: '61', name: '고등,과학,지구과학 (이기영)'},
	{id: '62', name: '고등,과학,역학과 에너지 (손정우)'},
	{id: '63', name: '고등,과학,전자기와 양자 (손정우)'},
	{id: '64', name: '고등,과학,물질과 에너지 (최원호)'},
	{id: '65', name: '고등,과학,화학 반응의 세계 (최원호)'},
	{id: '66', name: '고등,과학,세포와 물질대사 (심규철)'},
	{id: '67', name: '고등,과학,생물의 유전 (심규철)'},
	{id: '68', name: '고등,과학,지구시스템과학 (이기영)'},
	{id: '69', name: '고등,과학,행성우주과학 (이기영)'},
	{id: '70', name: '고등,과학,과학의 역사와 문화 (정인경)'},
	{id: '71', name: '고등,과학,기후변화와 환경생태 (이기영)'},
	{id: '72', name: '고등,과학,융합과학 탐구 (손정우)'},
	{id: '73', name: '고등,한문,언어생활과 한자 (이동재)'},
	{id: '74', name: '고등,한문,한문 (이동재)'},
	{id: '75', name: '고등,기술·가정,기술·가정 (김기수)'},
	{id: '76', name: '고등,정보,정보(임희석)'},
	{id: '77', name: '고등,정보,인공지능 기초(임희석)'},
	{id: '78', name: '고등,음악,음악 (이동희)'},
	{id: '79', name: '고등,미술,미술 (조익환)'},
	{id: '80', name: '고등,체육,체육 1, 2 (이민표)'},
	{id: '81', name: '고등,체육,운동과 건강 (천항욱)'},
	{id: '82', name: '고등,체육,스포츠 생활 1, 2 (천항욱)'},
	{id: '83', name: '고등,교양,논술 (윤상철)'},
	{id: '84', name: '고등,교양,인간과 심리 (송광자)'},
];

class EventApply extends Component {

	state = {
		initialSchName: '',
		initialSchZipCd: '',
		initialSchAddr: '',
		eventInfo: '',
		phoneCheckMessage: '',
		phoneCheckClassName: '',
		telephoneCheck: false,
		evtPop: 1,
		layerVisible:false,
		checkedValues: [],
		addressChange: null,
		isAllAmountFull: false,			// 모든 경품 소진 여부
		mountYn: 'Y',   /* 수량제한 신청 */
		applyContentTotCnt: '84',     /* 상품 종류 수 */
		applyContentNumbers: '3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86',
		isEachAmountFull: [
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true, true, true,
			true, true, true, true
		] ,
		checkContentList: [
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false, false, false, false, false, false, false,
			false, false, false, false
		] ,

	};

	constructor(props) {
		super(props);

		this.applyButtonClick = debounce(this.applyButtonClick, 300);
	}

	componentDidMount() {
		const {eventId, eventAnswer, history, BaseActions} = this.props;

		if (!eventId) {
			history.push('/saemteo/event');
		} else {
			this.getEventInfo(eventId);

		}
		try {
			this.eventAmountCheck();
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

	}

	eventAmountCheck = async () => {
		const {SaemteoActions, eventId} = this.props;
		let {allAmountFull} = this.state;

		let params1 = {eventId: eventId};
		let checkAllAmountFull = false;

		let checkEachAmountFull = [];
		let eachAmountLeft = [];

		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;


			for (let i = CONTENT_TYPE_START; i <= CONTENT_TYPE_END; i++) {
				if (i === 3 && responseData['qntCnt_' + i] >= 1) checkAllAmountFull = true;

				eachAmountLeft.push(responseData['qntCnt_' + i]);
				checkEachAmountFull.push(responseData['qntCnt_' + i] > 0);
				if (responseData['qntCnt_' + i] >= 1) {
					checkAllAmountFull = true;
				}
			}
		} catch (e) {
			console.log(e);
		}

		this.setState({
			allAmountFull: allAmountFull,
			isAllAmountFull: checkAllAmountFull,
			isEachAmountFull: checkEachAmountFull,
			eachAmountLeft: eachAmountLeft,
		});
	};

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
		console.log("===================");
		console.log(e.target.name);
		console.log("===================");

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
		if (cellphone === '') {
			text = "";
		} else if (!this.checkPhoneNum(cellphone)) {
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
		event.inputType = '개인정보불러오기';
		event.userInfo = 'Y';
		event.schZipCd = zipNo;
		event.schAddr = roadAddr;
		SaemteoActions.pushValues({type: "event", object: event});
		PopupActions.closePopup();
	};

	openPopupSchool = (e) => {
		e.preventDefault;
		const {PopupActions} = this.props;
		PopupActions.openPopup({title: "학교 검색", componet: <EventFindSchool handleSetSchool={this.handleSetSchool}/>});
	}
	// 학교검색 선택후 callback
	handleSetSchool = (obj) => {
		const {event, SaemteoActions, PopupActions} = this.props;
		const {schoolName, schoolCode, zip, addr} = obj;

		event.schCode = schoolCode;
		event.schName = schoolName;
		event.schZipCd = zip;
		event.schAddr = addr;
		event.addressDetail = schoolName;

		SaemteoActions.pushValues({type: "event", object: event});
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
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해주세요.';
		} else if (!event.agree) {
			obj.message = '필수 동의 선택 후 이벤트 신청을 완료해주세요2222222.';
		} else {
			obj.result = true;
		}
		return obj;
	};

	changeContent = (index, e) => {
		const {checkContentList, tabOn} = this.state;

		checkContentList.forEach((value, i) => {

			if (index == i) {
				if (e.target.checked) {
					checkContentList[i] = true;
				} else {
					checkContentList[i] = false;
				}
			}
		});

		this.setState({
			checkContentList: checkContentList
		});

	};


	applyButtonClickSafe = (e) => {
		this.applyButtonClick(e.target);
	};

	applyButtonClick = async (target) => {
		target.disabled = true;
		const {event, SaemteoActions, eventId} = this.props;
		const {joinedValues} = this.state;

		let receiveInfo = event.cellphone + '/' + event.schZipCd + '/' + (event.schAddr+event.addressDetail) + '/' + event.schName ;

		try {
			event.eventId = eventId;
			event.eventAnswerDesc = receiveInfo;
			event.eventAnswerDesc2 = joinedValues;
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
		const {event, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;
		const {joinedValues, checkContentList} = this.state;


		let answerContent = "";
		let answerNumber = "";
		let answerAlert = "";
		let chkFlag = false;

		checkContentList.forEach((value, i) => {
			if (value) {
				answerContent += CONTENT_LIST[i].name + " / ";
				answerAlert += "\n" + CONTENT_LIST[i].name;
				answerNumber += "1,"
				chkFlag = true;
			} else {
				answerNumber += "0,"
			}

			if (i === checkContentList.length - 1) {
				answerContent = answerContent.slice(0, -3);
				answerNumber = answerNumber.slice(0, -1);
			}
		});

		try {
			BaseActions.openLoading();
			var params = {
				eventId: eventId,
				eventAnswerDesc: event.eventAnswerDesc,
				eventAnswerDesc2:  joinedValues ,
				cellphone: event.cellphone,
				userInfo: event.userInfo,
				schCode: event.schCode,

				amountYn: 'Y',   /* 수량제한 신청 */
				applyContentTotCnt: '84',     /* 상품 종류 수 */
				applyContentNumbers : '3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86', /* 상품 seq, 복수신청시는 csv(3,4,5) */
				applyTargetContentCnt: answerNumber
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
			// history.push('/saemteo/event/view/' + eventId);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.

			// window.location.href = 'https://www.vivasam.com/aiSam/info';

		}

	};
	handlePopChange = () => {
		const { event } = this.props;
		const { evtPop } = this.state;

		if (!event.agree) {
			const obj = {};
			obj.message = '필수 동의 선택 후 이벤트 신청을 완료해주세요.';
			alert(obj.message);
			return;
		}

		this.setState({ evtPop: 2 }, () => {
			console.log("##### setState evtPop:", this.state.evtPop);

		});

	}



	handleLayer = () => {
		const { layerVisible, checkContentList } = this.state;
		let chkFlag = true;
		const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="el_"], input[type="checkbox"][name^="mi_"], input[type="checkbox"][name^="hi_"]');
		let isChecked = false;

		let checkedValues = [];

		for (let i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].checked) {
				checkedValues.push(checkboxes[i].value.trim());
			}
		}

		const joinedValues = checkedValues.join(' / ');

		this.setState({
			checkedValues: checkedValues,
			joinedValues : joinedValues,
		});

		if (checkContentList.filter(x => x == true).length < 1) {
			alert("신청하실 교과서를 선택해주세요.");
			return;
		}

		if (layerVisible) {
			this.setState({
				layerVisible: false

			})
		} else {
			this.setState({
				layerVisible: true
			});
		}

	}

	setBooksRef = (ref) => {
		this.textBookList = ref;
	};

	handleScroll = (index) => {
		const textBookListBox = this.textBookList.children;
		const targetTop = textBookListBox[index].offsetTop;

		this.textBookList.scrollTo({
			top: targetTop,
			behavior: 'smooth',
		});
	};

	render() {
		const {eventInfo, evtPop, layerVisible, isEachAmountFull } = this.state;

		if (eventInfo === '') return <RenderLoading/>;
		const {event, myClassInfo} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;

		return (
			<section className="vivasamter event240830">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>22 개정 비상교과서 신청하기</strong></h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					{ evtPop == 1 ?
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

										{/*<li className="join_chk_list half">
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
									*/}
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
								{/*<div className="infoTxtWrap">
								<p className="inputInfoTxt">* 학교 검색에서 찾으시는 학교가 없을 경우, <br/>직접 입력을 통해 재직 학교명과 소재지를 입력해 주세요.</p>
							</div>*/}

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
								{/*<div className="infoTxtWrap">
								<p className="inputInfoTxt">* 학교 주소 및 수령처를 정확히 기입해 주세요.</p>
							</div>*/}
								<h2 className="info_tit">
									<label htmlFor="ipt_address">수령처</label>
								</h2>
								<div className="input_wrap">
									<input
										type="text"
										placeholder="우편번호 검색을 선택하세요"
										value={event.schZipCd}
										className="input_sm"
										readOnly/>
									{ /* 부분 렌더링 예시 */
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
										id="ipt_address"
										name="ipt_detail"
										onChange={this.handleChange}
										value={event.schAddr}
										className="input_sm"
										readOnly
									/>
								</div>
								<div className="input_wrap mt5">
									<input
										type="text"
										placeholder="상세주소를 입력하세요"
										id="ipt_detail_address"
										name="addressDetail"
										onChange={this.handleChange}
										value={event.addressDetail}
										className="input_sm"/>
								</div>
							</div>

							<div className="acco_notice_list pdside20">
								<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
									<ul className="privacyList">
										<li>개인정보 수집 및 이용동의이용 목적 : 신청 도서 발송</li>
										<li>수집하는 개인정보 : 성명, 재직학교, 수령처 주소, 휴대전화번호</li>
										<li>개인정보 보유 및 이용기간 : 2024년 10월 30일까지</li>
										<li>신청하시는 22 개정 비상교과서는 신청과목에 한해 1부씩 원하시는 수령처로 택배 발송되며 확인이 필요할 시 별도 연락을 드릴 수 있습니다.</li>
										<li>주소 및 휴대전화번호가 부정확하여 수령하지 못한 경우 재발송이 불가능합니다. 개인정보를 꼭 확인해 주세요.</li>
										<li>신청하신 도서는 비상교육 온리원 물류센터에서 택배로 배송됩니다.</li>
									</ul>
									<br/>
									<p className="privacyTxt pl0">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. <br/> 단, 동의를 거부할 경우 신청이
										불가합니다.</p>
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
								onClick={this.handlePopChange}
								className="btn_event_apply mt35">신청하기
							</button>
							<p className="evtInfoText">※ 22 개정 비상교과서는 한정 수량으로 수량 소진 시 조기 마감될 수 있습니다.</p>
						</div>
						:
						<div className="vivasamter_applyDtl pdside0">
							<div className="evtTextBookWrap">
								{myClassInfo.schoolLvlCd === 'ES' && (
									<h3 className="evtPopLabel">초등 교과서</h3>
								)}
								{myClassInfo.schoolLvlCd === 'MS' && (
									<h3 className="evtPopLabel">중학 교과서</h3>
								)}
								{myClassInfo.schoolLvlCd === 'HS' && (
									<h3 className="evtPopLabel">고등 교과서</h3>
								)}

								<div className="textBookListWrap">
									{/* 중고등일 경우 노출 */}
									<div className="textBookScBtnBox">

										{(myClassInfo.schoolLvlCd === 'MS' || myClassInfo.schoolLvlCd === 'HS') && (
											<React.Fragment>
												<button type="button" onClick={() => this.handleScroll(0)} value="0">국어
												</button>
												<button type="button" onClick={() => this.handleScroll(1)} value="1">영어
												</button>
												<button type="button" onClick={() => this.handleScroll(2)} value="2">수학
												</button>
												<button type="button" onClick={() => this.handleScroll(3)} value="3">사회
												</button>
												<button type="button" onClick={() => this.handleScroll(4)} value="4">역사
												</button>
												<button type="button" onClick={() => this.handleScroll(5)} value="5">도덕
												</button>
												<button type="button" onClick={() => this.handleScroll(6)} value="6">과학
												</button>
												<button type="button" onClick={() => this.handleScroll(7)} value="7">한문
												</button>
												<button type="button" onClick={() => this.handleScroll(8)} value="8">기술·가정
												</button>
												<button type="button" onClick={() => this.handleScroll(9)} value="9">정보
												</button>
												<button type="button" onClick={() => this.handleScroll(10)} value="10">음악
												</button>
												<button type="button" onClick={() => this.handleScroll(11)} value="11">미술
												</button>
												<button type="button" onClick={() => this.handleScroll(12)} value="12">체육
												</button>

												{/*중등일 경우 */}
												{myClassInfo.schoolLvlCd === 'MS' && (
													<button type="button" onClick={() => this.handleScroll(13)}
															value="13">진로와 직업</button>
												)}
												{/*고등일 경우 */}
												{myClassInfo.schoolLvlCd === 'HS' && (
													<button type="button" onClick={() => this.handleScroll(13)}
															value="13">교양</button>
												)}
											</React.Fragment>
										)}

									</div>
									{/* 중고등일 경우 노출 */}


									{/*<div className="textBookList" ref={this.setBooksRef}> /!* 중고등일 경우 scrollArea 클래스 추가 *!/*/}


									<div
										className={`textBookList ${myClassInfo.schoolLvlCd === 'MS' || myClassInfo.schoolLvlCd === 'HS' ? 'scrollArea' : ''}`}
										ref={this.setBooksRef}
									>

										{myClassInfo.schoolLvlCd === 'ES' && (
											<Fragment>
												{/*	초등 */}

												<dl>
													<dt><p>수학<br/>사회<br/>과학</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="el_01" id="el_0101" value="수학 3-1, 3-2 (방정숙), 수학 익힘 3-1, 3-2(방정숙), 수학 3-1, 3-2 (방정숙), 수학 익힘 3-1, 3-2	(방정숙), 사회 3-1, 3-2 (설규주), 과학 3-1, 3-2 (강석진), 실험 관찰 3-1, 3-2(강석진)" onChange={this.changeContent.bind(this, 0)} disabled={!isEachAmountFull[0]}/>
																<label htmlFor="el_0101">
																	<p><em>수학 3-1, 3-2 (방정숙),</em> <em>수학 익힘 3-1, 3-2
																		(방정숙),</em></p>
																	<p>사회 3-1, 3-2 (설규주),</p>
																	<p><em>과학 3-1, 3-2 (강석진),</em> <em>실험 관찰 3-1, 3-2
																		(강석진)</em>
																		{!isEachAmountFull[0] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="el_01" id="el_0102" value="수학 4-1, 4-2 (방정숙), 수학 익힘 4-1, 4-2(방정숙), 사회 4-1, 4-2 (설규주), 과학 4-1, 4-2 (강석진), 실험 관찰 4-1, 4-2(강석진)" onChange={this.changeContent.bind(this, 1)} disabled={!isEachAmountFull[1]} />
																<label htmlFor="el_0102">
																	<p><em>수학 4-1, 4-2 (방정숙),</em> <em>수학 익힘 4-1, 4-2
																		(방정숙),</em></p>
																	<p>사회 4-1, 4-2 (설규주),</p>
																	<p><em>과학 4-1, 4-2 (강석진),</em> <em>실험 관찰 4-1, 4-2
																		(강석진)</em>
																		{!isEachAmountFull[1] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>
												<dl>
													<dt><p>음악</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="el_02" id="el_0201" value="음악 3 (주대창)" onChange={this.changeContent.bind(this, 2)} disabled={!isEachAmountFull[2]}/>
																<label htmlFor="el_0201">
																	<p>음악 3 (주대창)
																		{!isEachAmountFull[2] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="el_02" id="el_0202" value="음악 4 (주대창)" onChange={this.changeContent.bind(this, 3)} disabled={!isEachAmountFull[3]}/>
																<label htmlFor="el_0202">
																	<p>음악 4 (주대창)
																		{!isEachAmountFull[3] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>
												<dl>
													<dt><p>미술</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="el_03" id="el_0301" value="미술 3 (이재영)" onChange={this.changeContent.bind(this, 4)} disabled={!isEachAmountFull[4]} />
																<label htmlFor="el_0301">
																	<p>미술 3 (이재영)
																		{!isEachAmountFull[4] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="el_03" id="el_0302" value="미술 4 (이재영)" onChange={this.changeContent.bind(this, 5)} disabled={!isEachAmountFull[5]}/>
																<label htmlFor="el_0302">
																	<p>미술 4 (이재영)
																		{!isEachAmountFull[5] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>
												<dl>
													<dt><p>체육</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="el_04" id="el_0401" value="체육 3 (송지환)" onChange={this.changeContent.bind(this, 6)} disabled={!isEachAmountFull[6]}/>
																<label htmlFor="el_0401">
																	<p>체육 3 (송지환)
																		{!isEachAmountFull[6] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="el_04" id="el_0402" value="체육 4 (송지환)" onChange={this.changeContent.bind(this, 7)} disabled={!isEachAmountFull[7]}/>
																<label htmlFor="el_0402">
																	<p>체육 4 (송지환)
																		{!isEachAmountFull[7] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>
											</Fragment>
										)}

										{myClassInfo.schoolLvlCd === 'MS' && (
											<Fragment>
												{/*중등*/}
												<dl id="t01">
													<dt><p>국어</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_01" id="mi_0101" value="국어 1-1, 1-2 (박현숙)" onChange={this.changeContent.bind(this, 8)} disabled={!isEachAmountFull[8]}/>
																<label htmlFor="mi_0101">
																	<p>국어 1-1, 1-2 (박현숙)
																		{!isEachAmountFull[8] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="mi_01" id="mi_0102" value="국어 1-1, 1-2 (박영민)" onChange={this.changeContent.bind(this, 9)} disabled={!isEachAmountFull[9]}/>
																<label htmlFor="mi_0102">
																	<p>국어 1-1, 1-2 (박영민)
																		{!isEachAmountFull[9] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t02">
													<dt><p>영어</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_02" id="mi_0201" value="영어 1 (황종배)" onChange={this.changeContent.bind(this, 10)} disabled={!isEachAmountFull[10]}/>
																<label htmlFor="mi_0201">
																	<p>영어 1 (황종배)
																		{!isEachAmountFull[10] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t03">
													<dt><p>수학</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_03" id="mi_0301" value="수학 1 (이진호)" onChange={this.changeContent.bind(this, 11)} disabled={!isEachAmountFull[11]}/>
																<label htmlFor="mi_0301">
																	<p>수학 1 (이진호)
																		{!isEachAmountFull[11] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t04">
													<dt><p>사회</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_04" id="mi_0401" value="사회 ①, ② (강창숙)" onChange={this.changeContent.bind(this, 12)} disabled={!isEachAmountFull[12]}/>
																<label htmlFor="mi_0401">
																	<p>사회 ①, ② (강창숙)
																		{!isEachAmountFull[12] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="mi_04" id="mi_0402" value="사회과 부도 (강창숙)" onChange={this.changeContent.bind(this, 13)} disabled={!isEachAmountFull[13]}/>
																<label htmlFor="mi_0402">
																	<p>사회과 부도 (강창숙)
																		{!isEachAmountFull[13] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t05">
													<dt><p>역사</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_05" id="mi_0501" value="역사 ①, ② (이병인)" onChange={this.changeContent.bind(this, 14)} disabled={!isEachAmountFull[14]}/>
																<label htmlFor="mi_0501">
																	<p>역사 ①, ② (이병인)
																		{!isEachAmountFull[14] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="mi_05" id="mi_0502" value="역사 부도 (이병인)" onChange={this.changeContent.bind(this, 15)} disabled={!isEachAmountFull[15]}/>
																<label htmlFor="mi_0502">
																	<p>역사 부도 (이병인)
																		{!isEachAmountFull[15] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t06">
													<dt><p>도덕</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_06" id="mi_0601" value="도덕 ①, ② (김국현)" onChange={this.changeContent.bind(this, 16)} disabled={!isEachAmountFull[16]}/>
																<label htmlFor="mi_0601">
																	<p>도덕 ①, ② (김국현)
																		{!isEachAmountFull[16] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t07">
													<dt><p>과학</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_07" id="mi_0701" value="과학 1 (임태훈)" onChange={this.changeContent.bind(this, 17)} disabled={!isEachAmountFull[17]}/>
																<label htmlFor="mi_0701">
																	<p>과학 1 (임태훈)
																		{!isEachAmountFull[17] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t08">
													<dt><p>한문</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_08" id="mi_0801" value="한문 (이동재)" onChange={this.changeContent.bind(this, 18)} disabled={!isEachAmountFull[18]}/>
																<label htmlFor="mi_0801">
																	<p>한문 (이동재)
																		{!isEachAmountFull[18] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t09">
													<dt><p>기술·가정</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_09" id="mi_0901" value="기술·가정 ①, ② (김지숙)" onChange={this.changeContent.bind(this, 19)} disabled={!isEachAmountFull[19]}/>
																<label htmlFor="mi_0901">
																	<p>기술·가정 ①, ② (김지숙)
																		{!isEachAmountFull[19] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t10">
													<dt><p>정보</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_10" id="mi_1001" value="정보 (임희석)" onChange={this.changeContent.bind(this, 20)} disabled={!isEachAmountFull[20]}/>
																<label htmlFor="mi_1001">
																	<p>정보 (임희석)
																		{!isEachAmountFull[20] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t11">
													<dt><p>음악</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_11" id="mi_1101" value="음악 ①, ② (이동희)" onChange={this.changeContent.bind(this, 21)} disabled={!isEachAmountFull[21]}/>
																<label htmlFor="mi_1101">
																	<p>음악 ①, ② (이동희)
																		{!isEachAmountFull[21] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t12">
													<dt><p>미술</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_12" id="mi_1201" value="미술 ①, ② (정현일)" onChange={this.changeContent.bind(this, 22)} disabled={!isEachAmountFull[22]}/>
																<label htmlFor="mi_1201">
																	<p>미술 ①, ② (정현일)
																		{!isEachAmountFull[22] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t13">
													<dt><p>체육</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_13" id="mi_1301" value="체육 ①, ② (이민표)" onChange={this.changeContent.bind(this, 23)} disabled={!isEachAmountFull[23]}/>
																<label htmlFor="mi_1301">
																	<p>체육 ①, ② (이민표)
																		{!isEachAmountFull[23] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t14">
													<dt><p>진로와 직업</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="mi_14" id="mi_1401" value="진로와 직업 (손은령)" onChange={this.changeContent.bind(this, 24)} disabled={!isEachAmountFull[24]}/>
																<label htmlFor="mi_1401">
																	<p>진로와 직업 (손은령)
																		{!isEachAmountFull[24] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>
												{/*//중등 */}
											</Fragment>
										)}

										{myClassInfo.schoolLvlCd === 'HS' && (
											<Fragment>
												{/*고등 */}

												<dl id="t01">
													<dt><p>국어</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_011" id="hi_0101" value="공통국어 1, 2 (강호영) " onChange={this.changeContent.bind(this, 25)} disabled={!isEachAmountFull[25]}/>
																<label htmlFor="hi_0101">
																	<p>공통국어 1, 2 (강호영)
																		{!isEachAmountFull[25] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_01" id="hi_0102" value="공통국어 1, 2 (박영민)" onChange={this.changeContent.bind(this, 26)} disabled={!isEachAmountFull[26]}/>
																<label htmlFor="hi_0102">
																	<p>공통국어 1, 2 (박영민)
																		{!isEachAmountFull[26] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_01" id="hi_0103" value="화법과 언어 (이관규)" onChange={this.changeContent.bind(this, 27)} disabled={!isEachAmountFull[27]}/>
																<label htmlFor="hi_0103">
																	<p>화법과 언어 (이관규) {!isEachAmountFull[27] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_01" id="hi_0104" value="독서와 작문 (최인영)" onChange={this.changeContent.bind(this, 28)} disabled={!isEachAmountFull[28]}/>
																<label htmlFor="hi_0104">
																	<p>독서와 작문 (최인영) {!isEachAmountFull[28] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_01" id="hi_0105" value="문학 (강호영)" onChange={this.changeContent.bind(this, 29)} disabled={!isEachAmountFull[29]}/>
																<label htmlFor="hi_0105">
																	<p>문학 (강호영) {!isEachAmountFull[29] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_01" id="hi_0106" value="직무 의사소통 (박영민)" onChange={this.changeContent.bind(this, 30)} disabled={!isEachAmountFull[30]}/>
																<label htmlFor="hi_0106">
																	<p>직무 의사소통 (박영민) {!isEachAmountFull[30] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_01" id="hi_0107" value="매체 의사소통 (옥현진)" onChange={this.changeContent.bind(this, 31)} disabled={!isEachAmountFull[31]}/>
																<label htmlFor="hi_0107">
																	<p>매체 의사소통 (옥현진) {!isEachAmountFull[31] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_01" id="hi_0108" value="언어생활 탐구 (이관규)" onChange={this.changeContent.bind(this, 32)} disabled={!isEachAmountFull[32]}/>
																<label htmlFor="hi_0108">
																	<p>언어생활 탐구 (이관규) {!isEachAmountFull[32] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t02">
													<dt><p>영어</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_02" id="hi_0201" value="공통영어 1, 2 (홍민표)" onChange={this.changeContent.bind(this, 33)} disabled={!isEachAmountFull[33]}/>
																<label htmlFor="hi_0201">
																	<p>공통영어 1, 2 (홍민표) {!isEachAmountFull[33] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_02" id="hi_0202" value="영어 Ⅰ, Ⅱ (홍민표)" onChange={this.changeContent.bind(this, 34)} disabled={!isEachAmountFull[34]}/>
																<label htmlFor="hi_0202">
																	<p>영어 Ⅰ, Ⅱ (홍민표) {!isEachAmountFull[34] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_02" id="hi_0203" value="영어 독해와 작문(황종배)" onChange={this.changeContent.bind(this, 35)} disabled={!isEachAmountFull[35]}/>
																<label htmlFor="hi_0203">
																	<p>영어 독해와 작문(황종배) {!isEachAmountFull[35] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_02" id="hi_0204" value="세계 문화와 영어(권혁승)" onChange={this.changeContent.bind(this, 36)} disabled={!isEachAmountFull[36]}/>
																<label htmlFor="hi_0204">
																	<p>세계 문화와 영어(권혁승) {!isEachAmountFull[36] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t03">
													<dt><p>수학</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_03" id="hi_0301" value="공통수학 1, 2 (김원경)" onChange={this.changeContent.bind(this, 37)} disabled={!isEachAmountFull[37]}/>
																<label htmlFor="hi_0301">
																	<p>공통수학 1, 2 (김원경) {!isEachAmountFull[37] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_03" id="hi_0302" value="기본수학 1, 2 (김원경)" onChange={this.changeContent.bind(this, 38)} disabled={!isEachAmountFull[38]}/>
																<label htmlFor="hi_0302">
																	<p>기본수학 1, 2 (김원경) {!isEachAmountFull[38] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_03" id="hi_0303" value="대수 (김원경)" onChange={this.changeContent.bind(this, 39)} disabled={!isEachAmountFull[39]}/>
																<label htmlFor="hi_0303">
																	<p>대수 (김원경) {!isEachAmountFull[39] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_03" id="hi_0304" value="미적분Ⅰ (김원경)" onChange={this.changeContent.bind(this, 40)} disabled={!isEachAmountFull[40]}/>
																<label htmlFor="hi_0304">
																	<p>미적분Ⅰ (김원경) {!isEachAmountFull[40] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_03" id="hi_0305" value="확률과 통계 (김원경)" onChange={this.changeContent.bind(this, 41)} disabled={!isEachAmountFull[41]}/>
																<label htmlFor="hi_0305">
																	<p>확률과 통계 (김원경) {!isEachAmountFull[41] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t04">
													<dt><p>사회</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0401" value="통합사회 1, 2 (이영호)" onChange={this.changeContent.bind(this, 42)} disabled={!isEachAmountFull[42]}/>
																<label htmlFor="hi_0401">
																	<p>통합사회 1, 2 (이영호) {!isEachAmountFull[42] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0402" value="세계시민과 지리(박배균)" onChange={this.changeContent.bind(this, 43)} disabled={!isEachAmountFull[43]}/>
																<label htmlFor="hi_0402">
																	<p>세계시민과 지리(박배균) {!isEachAmountFull[43] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0403" value="지리 부도 (정성훈)" onChange={this.changeContent.bind(this, 44)} disabled={!isEachAmountFull[44]}/>
																<label htmlFor="hi_0403">
																	<p>지리 부도 (정성훈) {!isEachAmountFull[44] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0404" value="사회와 문화 (유종열)" onChange={this.changeContent.bind(this, 45)} disabled={!isEachAmountFull[45]}/>
																<label htmlFor="hi_0404">
																	<p>사회와 문화 (유종열) {!isEachAmountFull[45] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0405" value="한국지리 탐구 (정성훈)" onChange={this.changeContent.bind(this, 46)} disabled={!isEachAmountFull[46]}/>
																<label htmlFor="hi_0405">
																	<p>한국지리 탐구 (정성훈) {!isEachAmountFull[46] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0406" value="정치 (정필운)" onChange={this.changeContent.bind(this, 47)} disabled={!isEachAmountFull[47]}/>
																<label htmlFor="hi_0406">
																	<p>정치 (정필운) {!isEachAmountFull[47] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0407" value="여행지리 (이우평)" onChange={this.changeContent.bind(this, 48)} disabled={!isEachAmountFull[48]}/>
																<label htmlFor="hi_0407">
																	<p>여행지리 (이우평) {!isEachAmountFull[48] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_04" id="hi_0408" value="사회문제 탐구 (이영호)" onChange={this.changeContent.bind(this, 49)} disabled={!isEachAmountFull[49]}/>
																<label htmlFor="hi_0408">
																	<p>사회문제 탐구 (이영호) {!isEachAmountFull[49] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t05">
													<dt><p>역사</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_05" id="hi_0501" value="한국사 1, 2 (도면회)" onChange={this.changeContent.bind(this, 50)} disabled={!isEachAmountFull[50]}/>
																<label htmlFor="hi_0501">
																	<p>한국사 1, 2 (도면회) {!isEachAmountFull[50] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_05" id="hi_0502" value="역사 부도 (도면회)" onChange={this.changeContent.bind(this, 51)} disabled={!isEachAmountFull[51]}/>
																<label htmlFor="hi_0502">
																	<p>역사 부도 (도면회) {!isEachAmountFull[51] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_05" id="hi_0503" value="세계사 (이병인)" onChange={this.changeContent.bind(this, 52)} disabled={!isEachAmountFull[52]}/>
																<label htmlFor="hi_0503">
																	<p>세계사 (이병인) {!isEachAmountFull[52] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_05" id="hi_0504" value="동아시아 역사 기행 (이병인)" onChange={this.changeContent.bind(this, 53)} disabled={!isEachAmountFull[53]}/>
																<label htmlFor="hi_0504">
																	<p>동아시아 역사 기행 (이병인) {!isEachAmountFull[53] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t06">
													<dt><p>도덕</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_06" id="hi_0601" value="현대사회와 윤리 (김국현)" onChange={this.changeContent.bind(this, 54)} disabled={!isEachAmountFull[54]}/>
																<label htmlFor="hi_0601">
																	<p>현대사회와 윤리 (김국현) {!isEachAmountFull[54] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t07">
													<dt><p>과학</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0701" value="통합과학 1, 2 (심규철)" onChange={this.changeContent.bind(this, 55)} disabled={!isEachAmountFull[55]}/>
																<label htmlFor="hi_0701">
																	<p>통합과학 1, 2 (심규철) {!isEachAmountFull[55] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0702" value="과학탐구실험 1, 2 (심규철)" onChange={this.changeContent.bind(this, 56)} disabled={!isEachAmountFull[56]}/>
																<label htmlFor="hi_0702">
																	<p>과학탐구실험 1, 2 (심규철) {!isEachAmountFull[56] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0703" value="물리학 (손정우)" onChange={this.changeContent.bind(this, 57)} disabled={!isEachAmountFull[57]}/>
																<label htmlFor="hi_0703">
																	<p>물리학 (손정우) {!isEachAmountFull[57] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0704" value="화학 (최원호)" onChange={this.changeContent.bind(this, 58)} disabled={!isEachAmountFull[58]}/>
																<label htmlFor="hi_0704">
																	<p>화학 (최원호) {!isEachAmountFull[58] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0705" value="생명과학 (심규철)" onChange={this.changeContent.bind(this, 59)} disabled={!isEachAmountFull[59]}/>
																<label htmlFor="hi_0705">
																	<p>생명과학 (심규철) {!isEachAmountFull[59] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0706" value="지구과학 (이기영)" onChange={this.changeContent.bind(this, 60)} disabled={!isEachAmountFull[60]}/>
																<label htmlFor="hi_0706">
																	<p>지구과학 (이기영) {!isEachAmountFull[60] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0707" value="역학과 에너지 (손정우)" onChange={this.changeContent.bind(this, 61)} disabled={!isEachAmountFull[61]}/>
																<label htmlFor="hi_0707">
																	<p>역학과 에너지 (손정우) {!isEachAmountFull[61] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0708" value="전자기와 양자 (손정우)" onChange={this.changeContent.bind(this, 62)} disabled={!isEachAmountFull[62]}/>
																<label htmlFor="hi_0708">
																	<p>전자기와 양자 (손정우) {!isEachAmountFull[62] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0709" value="물질과 에너지 (최원호)" onChange={this.changeContent.bind(this, 63)} disabled={!isEachAmountFull[63]}/>
																<label htmlFor="hi_0709">
																	<p>물질과 에너지 (최원호) {!isEachAmountFull[63] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0710" value="화학 반응의 세계 (최원호)" onChange={this.changeContent.bind(this, 64)} disabled={!isEachAmountFull[64]}/>
																<label htmlFor="hi_0710">
																	<p>화학 반응의 세계 (최원호) {!isEachAmountFull[64] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0711" value="세포와 물질대사 (심규철)" onChange={this.changeContent.bind(this, 65)} disabled={!isEachAmountFull[65]}/>
																<label htmlFor="hi_0711">
																	<p>세포와 물질대사 (심규철) {!isEachAmountFull[65] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0712" value="생물의 유전 (심규철)" onChange={this.changeContent.bind(this, 66)} disabled={!isEachAmountFull[66]}/>
																<label htmlFor="hi_0712">
																	<p>생물의 유전 (심규철) {!isEachAmountFull[66] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0713" value="지구시스템과학 (이기영)" onChange={this.changeContent.bind(this, 67)} disabled={!isEachAmountFull[67]}/>
																<label htmlFor="hi_0713">
																	<p>지구시스템과학 (이기영) {!isEachAmountFull[67] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0714" value="행성우주과학 (이기영)" onChange={this.changeContent.bind(this, 68)} disabled={!isEachAmountFull[68]}/>
																<label htmlFor="hi_0714">
																	<p>행성우주과학 (이기영) {!isEachAmountFull[68] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0715" value="과학의 역사와 문화 (정인경)" onChange={this.changeContent.bind(this, 69)} disabled={!isEachAmountFull[69]}/>
																<label htmlFor="hi_0715">
																	<p>과학의 역사와 문화 (정인경) {!isEachAmountFull[69] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0716" value="기후변화와 환경생태 (이기영)" onChange={this.changeContent.bind(this, 70)} disabled={!isEachAmountFull[70]}/>
																<label htmlFor="hi_0716">
																	<p>기후변화와 환경생태 (이기영) {!isEachAmountFull[70] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_07" id="hi_0717" value="융합과학 탐구 (손정우)" onChange={this.changeContent.bind(this, 71)} disabled={!isEachAmountFull[71]}/>
																<label htmlFor="hi_0717">
																	<p>융합과학 탐구 (손정우) {!isEachAmountFull[71] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t08">
													<dt><p>한문</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_08" id="hi_0801" value="언어생활과 한자 (이동재)"  onChange={this.changeContent.bind(this, 72)} disabled={!isEachAmountFull[72]}/>
																<label htmlFor="hi_0801">
																	<p>언어생활과 한자 (이동재) {!isEachAmountFull[72] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_08" id="hi_0802" value="한문 (이동재)" onChange={this.changeContent.bind(this, 73)} disabled={!isEachAmountFull[73]}/>
																<label htmlFor="hi_0802">
																	<p>한문 (이동재) {!isEachAmountFull[73] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t09">
													<dt><p>기술·가정</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_09" id="hi_0901" value="기술·가정 (김기수)" onChange={this.changeContent.bind(this, 74)} disabled={!isEachAmountFull[74]}/>
																<label htmlFor="hi_0901">
																	<p>기술·가정 (김기수) {!isEachAmountFull[74] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t10">
													<dt><p>정보</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_10" id="hi_1001" value="정보(임희석)" onChange={this.changeContent.bind(this, 75)} disabled={!isEachAmountFull[75]}/>
																<label htmlFor="hi_1001">
																	<p>정보(임희석) {!isEachAmountFull[75] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_10" id="hi_1002" value="인공지능 기초(임희석)" onChange={this.changeContent.bind(this, 76)} disabled={!isEachAmountFull[76]}/>
																<label htmlFor="hi_1002">
																	<p>인공지능 기초(임희석) {!isEachAmountFull[76] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t11">
													<dt><p>음악</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_11" id="hi_1101" value="음악 (이동희)" onChange={this.changeContent.bind(this, 77)} disabled={!isEachAmountFull[77]}/>
																<label htmlFor="hi_1101">
																	<p>음악 (이동희) {!isEachAmountFull[77] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t12">
													<dt><p>미술</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_12" id="hi_1201" value="미술 (조익환)" onChange={this.changeContent.bind(this, 78)} disabled={!isEachAmountFull[78]}/>
																<label htmlFor="hi_1201">
																	<p>미술 (조익환) {!isEachAmountFull[78] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t13">
													<dt><p>체육</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_13" id="hi_1301" value="체육 1, 2 (이민표)" onChange={this.changeContent.bind(this, 79)} disabled={!isEachAmountFull[79]}/>
																<label htmlFor="hi_1301">
																	<p>체육 1, 2 (이민표) {!isEachAmountFull[79] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_13" id="hi_1302" value="운동과 건강 (천항욱)" onChange={this.changeContent.bind(this, 80)} disabled={!isEachAmountFull[80]}/>
																<label htmlFor="hi_1302">
																	<p>운동과 건강 (천항욱) {!isEachAmountFull[80] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_13" id="hi_1303" value="스포츠 생활 1, 2 (천항욱)" onChange={this.changeContent.bind(this, 81)} disabled={!isEachAmountFull[81]}/>
																<label htmlFor="hi_1303">
																	<p>스포츠 생활 1, 2 (천항욱) {!isEachAmountFull[81] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												<dl id="t14">
													<dt><p>교양</p></dt>
													<dd>
														<ul>
															<li>
																<input type="checkbox" name="hi_14" id="hi_1401" value="논술 (윤상철)" onChange={this.changeContent.bind(this, 82)} disabled={!isEachAmountFull[82]}/>
																<label htmlFor="hi_1401">
																	<p>논술 (윤상철) {!isEachAmountFull[82] && <span className="noItem">신청 마감</span>}</p>
																</label>
															</li>
															<li>
																<input type="checkbox" name="hi_14" id="hi_1402" value="인간과 심리 (송광자)" onChange={this.changeContent.bind(this, 83)} disabled={!isEachAmountFull[83]}/>
																<label htmlFor="hi_1402">
																	<p>인간과 심리 (송광자) {!isEachAmountFull[83] && <span className="noItem">신청 마감</span>}
																	</p>
																</label>
															</li>
														</ul>
													</dd>
												</dl>

												{/*//고등 */}
											</Fragment>
										)}
									</div>
								</div>
								<div className="chkBookListPop" style={{display: layerVisible ? 'block' : 'none'}}>
									<div className="pop_cont">
										<h3 className="pop_tit">신청 내역 확인</h3>
										<div className="bookListBox">
											<div className="evtBookList">
												<ul>

													{this.state.checkedValues.map((value, index) => (
														<li key={index}>
															<span>{index + 1}.</span>{value}
														</li>
													))}


												</ul>
											</div>
											<div className="cnt">
												<p>총 <span>{this.state.checkedValues.length}</span>건</p>
											</div>
										</div>

										<div className="btn_wrap">
											<button
												type="button"
												onClick={this.handleLayer}
												className="btn_close">다시 선택하기
											</button>
											<button
												type="button"
												onClick={this.applyButtonClickSafe}
												className="pop_btn_event_apply">신청하기
											</button>
										</div>

									</div>
								</div>
							</div>
							<button
								type="button"
								onClick={this.handleLayer}
								className="btn_event_apply mt35">신청하기
							</button>
							<p className="evtInfoText">※ 22개정 비상교과서는 한정 수량으로 수량 소진 시 조기 마감될 수 있습니다.</p>
						</div>
					}
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
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(EventApply));