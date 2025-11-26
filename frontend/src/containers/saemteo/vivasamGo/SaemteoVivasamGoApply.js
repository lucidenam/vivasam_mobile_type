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

import moment from "moment";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // css import
import './VivasamGo.css';


class SaemteoVivasamGoApply extends Component {

	state = {
		initialSchName: '',
		initialSchZipCd: '',
		initialSchAddr: '',
		currentUserInfo: '',
		phoneCheckMessage: '',
		phoneCheckClassName: '',
		telephoneCheck: false,
		myGrade: '', // 담당학년
		mainSubject: '', // 담당과목
		career: '', // 교사경력
		visangTbYN: '', // 비상교과서 채택여부
		eventAgree: '', // 개인정보 동의여부
		subSubject: 'N', // 비교과
		TAB: '', // 학급 ( E : 초등 / M  : 중등 / H : 고등 )
		ableDayArr: [],
		// minDate: new Date("2023/04/03 00:00:00"),
		// maxDate: new Date("2023/12/22 00:00:00"),
		counting: 0,
		nowDate: new Date(),
		minDate : '',
		maxDate : '',
		day1: '',
		day2: '',
		day1CalVisible: false,
		day2CalVisible: false,
		nowMonth: '04',
		participation : '대면' // 참여방법 _ 대면(디폴트) / 비대면

	};

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
		this.calendarRef1 = React.createRef();
		this.calendarRef2 = React.createRef();
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentWillMount() {
		document.removeEventListener('mousedown', this.handleClickOutside );
	}

	//중간에 다른 페이지로 가버렸을때 EventListener에서 mousedown삭제
	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside );
	}

	componentDidMount() {
		this.getCurrentUserInfo();
		this.setAbleDayArr();

		console.log(this.calendarRef1 = React.createRef());

		document.addEventListener('mousedown', this.handleClickOutside );
	}

	handleClickOutside = (e) => {
		const {day1, day2, day1CalVisible, day2CalVisible} = this.state;
		if (this.calendarRef1 && !this.calendarRef1.current.contains(e.target) && day1CalVisible) {
			this.setState({
				day1CalVisible: false,
				day1 : '',
				day2CalVisible: false,
			});
		}else if ( this.calendarRef2 && !this.calendarRef2.current.contains(e.target) && day2CalVisible) {
			this.setState({
				day2CalVisible: false,
				day2 : '',
				day1CalVisible: false,
			});
		}
	}

	getCurrentUserInfo = async () => {
		const {history, event, SaemteoActions} = this.props;
		const response = await api.currentUserInfo();
		if (response.data.code && response.data.code === "0") {
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
			event.schCode = schCode;

			event.receiveInfo = '',
			event.visitDate1 = '',
			event.visitDate2 = '',
			event.peopleCount = '',
			event.reason = '',
			event.reasonDetail = '',
			event.participation = '',

			event.memberCnt = 1;
			event.joinReason = [];
			event.applyContent1 = '';

			this.phonecheckByUserInfoCellphone(cellphone);
			SaemteoActions.pushValues({type: "event", object: event});

			this.setState({
				currentUserInfo: 'okokok',
				initialSchName: schName,
				initialSchZipCd: schZipCd,
				initialSchAddr: schAddr,
				userCellphone: cellphone,
				mainSubject: mainSubject,
			});

			const response2 = await api.eventMemberSchoolInfo({...event});
			this.setState({
				TAB: response2.data.TAB
			});

		} else {
			history.push('/saemteo/vivasam/go/view');
		}
	};

	setAbleDayArr = async() => {
		const {ableDayArr} = this.state;

		//선택할 수 있는 날짜 범위 계산(시작)
		const tmpAbleDayArr = [];
		let startDate = new Date();
		let endDate = new Date();
		const nowDate = new Date();

		// 신청 당일 기준으로 +7 ~ +60 일까지 신청 가능으로 변경
		startDate.setDate(nowDate.getDate() + 7)
		endDate.setDate(nowDate.getDate() + 60)
		// endDate = new Date(nowDate.getDate() + 60)

		// if(new Date('2023/03/22 00:00:00') <= nowDate && nowDate <= new Date('2023/03/27 23:59:59')) {
		// 	startDate = new Date('2023/04/03 00:00:00');
		// 	endDate.setDate(endDate.getDate()+60);
		// }
		//
		// if(new Date('2023/03/28 00:00:00') <= nowDate && nowDate <= new Date('2023/10/23 23:59:59')) {
		// 		startDate.setDate(startDate.getDate()+21)
		// 	endDate.setDate(nowDate.getDate()+91);
		//
		// 	this.setState({
		// 		nowMonth: ('0' + (startDate.getMonth() + 1))
		// 	})
		// }
		//
		// if(new Date('2023/10/24 00:00:00') <= nowDate && nowDate <= new Date('2023/12/13 23:59:59')) {
		// 	startDate.setDate(startDate.getDate()+7)
		// 	endDate = new Date('2023/12/22 23:59:59');
		//
		// 	this.setState({
		// 		nowMonth: ('0' + (startDate.getMonth() + 1))
		// 	})
		// }

		this.setState({
			nowMonth: ('0' + (startDate.getMonth() + 1))
		})

		console.log(moment(startDate).format('YYYY-MM-DD'));
		console.log(moment(endDate).format('YYYY-MM-DD'));
		while(startDate < endDate) {
			const tmpStr = moment(startDate).format('YYYY-MM-DD') + "";
			//주말 및 공휴일 제외
			if(startDate.getDay() == 0 || startDate.getDay() == 6
				|| tmpStr == '2025-05-01'
				|| tmpStr == '2025-05-05'
				|| tmpStr == '2025-05-06'
				|| tmpStr == '2025-06-06'
				|| tmpStr == '2025-08-15'
				|| tmpStr == '2025-10-03'
				|| tmpStr == '2025-10-06'
				|| tmpStr == '2025-10-07'
				|| tmpStr == '2025-10-08'
				|| tmpStr == '2025-10-09') {
				startDate.setDate(startDate.getDate()+1);
				continue;
			}

			tmpAbleDayArr.push(tmpStr);
			startDate.setDate(startDate.getDate()+1);
		}

		console.log(tmpAbleDayArr);
		//선택할 수 있는 날짜 범위 계산(종료)

		this.setState({
			ableDayArr: tmpAbleDayArr
		})
	}

	handleChange = (e) => {
		const {event, SaemteoActions} = this.props;
		if (e.target.name === 'agree1') {
			event[e.target.name] = e.target.checked;
		} else {
			if (e.target.name === 'memberCnt') {
				console.log(e.target.value, " / ", e.target.value > 99);
				if (e.target.value > 99) {
					alert("최대 99명까지 참여 가능합니다.");
					event[e.target.name] = 99;
				} else {
					event[e.target.name] = e.target.value;
				}
			} else if (e.target.name === 'applyContent1') {
				if (e.target.value.length > 500) {
					common.info("500자 이내로 입력해 주세요.");
					return false;
				}

				event[e.target.name] = e.target.value;
				this.setState({
					counting: e.target.value.length,
				});
			} else {
				event[e.target.name] = e.target.value;
			}
		}
		SaemteoActions.pushValues({type: "event", object: event});
	};

	handleParticipation = (e) => {
		const participation = e.target.value;

		this.setState({
			participation: e.target.value,
		});

		const partiEle = document.getElementById('parti');

		if (participation === '대면') {
			partiEle.style.display = 'none';
		} else {
			partiEle.style.display = 'block';
			partiEle.style.color = '#ff3859';
		}
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
		PopupActions.openPopup({title:"소속 검색", componet:<EventFindSchool handleSetSchool={this.handleSetSchool}/>});
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
		PopupActions.closePopup();
	}

	//값 입력 확인
	validateInfo = () => {
		const {event} = this.props;
		const {telephoneCheck, day1, day2} = this.state;
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
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (day1 === '' && day2 === '') {
			obj.message = '간담회 희망일을 선택해 주세요.';
		} else if (event.joinReason.length === 0) {
			obj.message = '신청 이유를 선택해 주세요.';
		} else if (event.applyContent1.length === 0 || event.applyContent1 === "") {
			obj.message = '궁금한 콘텐츠 및 페이지 개선이 필요한 사항 등 자세한 이유를 작성해 주세요.';
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
		const {day1, day2} = this.state;

		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}
		try {
			event.receiveInfo = event.schName + '/' + event.schAddr + ' ' + event.addressDetail + '/' + event.schZipCd +  '/' + event.cellphone;

			// 동반 인원
			event.peopleCount = event.memberCnt;

			// 간담회 희망일
			const tmpDay1 = (day1 === '' ? '' : moment(day1).format("YYYY-MM-DD"));
			const tmpDay2 = (day2 === '' ? '' : moment(day2).format("YYYY-MM-DD"));
			if(tmpDay1 !== '') {
				event.visitDate1 = tmpDay1;
			}
			if(tmpDay2 !== '') {
				event.visitDate2 = tmpDay2;
			}

			//신청이유

			event.joinReason.forEach((value, i) => {
				if(value === '1'){
					event.reason += "비바샘 활용법 소개";
				}
				if(value === '2'){
					event.reason += "비바샘 개선 및 보완점 직접 전달";
				}
				if(value === '3'){
					event.reason += "주변 선생님들께 비바샘 소개";
				}
				if(value === '4'){
					event.reason += "기타";
				}
				if(value === '5'){
					event.reason += "AI 디지털교과서 활용법";
				}

				if(event.joinReason.length > 1 && (i !== (event.joinReason.length - 1))) {
					event.reason += "/ ";
				}
			})

			//궁금한 콘텐츠 및 페이지 개선
			event.reasonDetail += event.applyContent1;

			event.participation += this.state.participation;

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
				eventId: '001',
				receiveInfo: event.receiveInfo,
				visitDate1: event.visitDate1,
				visitDate2: event.visitDate2,
				peopleCount: event.peopleCount,
				reason: event.reason,
				reasonDetail: event.reasonDetail,
				cellphone: event.cellphone,
				userInfo: event.userInfo,
				schCode: event.schCode,
				participation : event.participation
			};

			console.log("params", params);

			let response = await api.insertVivasamGoApply(params);

			if (response.data.code === '1') {
				common.error("이미 신청 하셨습니다.");
			} else if (response.data.code === '0') {
				// PopupActions.openPopup({title:"신청완료", component:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
				// 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
				if (event.schCode && event.schCode !== this.state.initialSchCode) {
					MyclassActions.myClassInfo();
				}

				common.info("신청이 완료되었습니다.");
				history.push('/saemteo/vivasam/go');
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
			history.push('/saemteo/vivasam/go/view');
		} finally {
			setTimeout(()=>{
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

	};

	setJoinReason = (e) => {
		const {event, SaemteoActions} = this.props

		let tmpArr = event.joinReason;

		if(tmpArr.includes(e.target.value)) {
			tmpArr = tmpArr.filter(i => i !== e.target.value);
		} else {
			tmpArr.push(e.target.value);
		}
		tmpArr = tmpArr.filter(i => i !== '');
		event.joinReason = tmpArr;

		SaemteoActions.pushValues({type: "event", object: event});
	}

	changeDay1 = (date) => {
		const {day1, day2, minDate, maxDate} = this.state;

		this.setState({
			day1CalVisible: false,
			day1: date,
		})
	}

	changeDay2 = (date) => {
		const {day1, day2, minDate, maxDate} = this.state;

		if(date <= day1) {
			common.info("간담회 희망일2는 간담회 희망일1이후 날짜로 선택이 가능합니다.");
			this.setState({
				day2: ''
			})
			return;
		}

		this.setState({
			day2CalVisible: false,
			day2: date,
		})
	}

	showCalendar = (e) => {
		const {day1, day2, day1CalVisible, day2CalVisible} =this.state;

		if (e.target.name === 'visitDay1') {
			// if(day1==='') {
			// 	this.setState({
			// 		day1: new Date()
			// 	})
			// }
			this.setState({
				day1CalVisible: true,
				day2CalVisible: false
			})
		} else {
			// if(day2==='') {
			// 	this.setState({
			// 		day2: new Date()
			// 	})
			// }
			this.setState({
				day2CalVisible: true,
				day1CalVisible: false,
			})
		}

	}

	render() {
		const {currentUserInfo, ableDayArr} = this.state;
		if (currentUserInfo === '') return <RenderLoading/>;
		const {event} = this.props;
		const {phoneCheckMessage, phoneCheckClassName, day1, day2, day1CalVisible, day2CalVisible, nowMonth, counting} = this.state;


		return (
			<section className="vivasamter event220210">
				<h2 className="blind">
					비바샘이 간다 신청하기
				</h2>
				<div className="applyDtl_top">
					<div className="applyDtl_cell ta_c pick">
						<h3><strong>비바샘이 간다</strong></h3>
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
								<label htmlFor="ipt_phone">연락처</label>
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

							<h2 className="info_tit tit_flex">
								<label htmlFor="ipt_person ">참여 인원(본인 포함)</label>
								<div className="person_box type1 ">
									<div className="select_sm ">
										<input type="number"
											   inputMode="numeric"
											   pattern="[0-9]*"
											   maxLength={2} name="memberCnt" id="ipt_person"
											   onChange={this.handleChange} value={event.memberCnt}/>
										{/*<select
											name="memberCnt"
											id="ipt_person"
											onChange={this.handleChange}
										>
											<option value="1">1</option>
											<option value="2">2</option>
											<option value="3">3</option>
											<option value="4">4</option>
											<option value="5">5</option>
											<option value="">6</option>
										</select>*/}
										<span>명</span>
									</div>
								</div>
							</h2>

							<h2 className="info_tit tit_flex">
								<label htmlFor="ipt_school_name">참여 방식</label>
								<ul className="join_ipt_chk">
									<li className="join_chk_list half">
										<input
											id="faceToFace"
											type="radio"
											className="checkbox_circle"
											name="participation"
											checked={this.state.participation === '대면'}
											value="대면"
											onChange={this.handleParticipation}
										/>
										<label htmlFor="faceToFace">대면</label>
									</li>
									<li className="join_chk_list half">
										<input
											id="nonFaceToFace"
											type="radio"
											className="checkbox_circle"
											name="participation"
											value="비대면"
											// checked={this.state.participation === '비대면'}
											checked={this.state.participation === '비대면'}
											onChange={this.handleParticipation}
										/>
										<label htmlFor="nonFaceToFace">비대면</label>
									</li>
								</ul>
							</h2>
							<p id="parti" className="mt10" style={{display: "none"}}>* 비대면 선택시 화상회의로 진행됩니다.</p>

							<h2 className="info_tit mt25">
								<label htmlFor="ipt_visitDay1">간담회 희망일</label>
							</h2>
							<div className="input_wrap calendar_wrap">
								<p className="bulTxt mt10 type02">* 선생님이 신청하신 일정에 따라 개별 연락 후 상세 일정 조율 됩니다.</p>
								<p className="bulTxt type02">* 간담회 일정은  최소 7일 전 ~ 최대 60일 이내로만 신청 가능합니다. <br/>(주말 및 공휴일 제외)</p>
								<ul className="pl8">
									<li>
										<span>간담회 희망일 ①</span>
										<div className="calendar_box">
											<input
												onClick={this.showCalendar}
												type="text"
												id="ipt_visitDay1"
												name="visitDay1"
												value={day1 === '' ? '' : moment(day1).format("YYYY-MM-DD")}
												className="input_sm"
												inputmode="none"
											/>
											<div
												ref = {this.calendarRef1}
												className={"myCalendar " + (day1CalVisible ? "on": "")}
											>
												<Calendar
													onChange={date => this.changeDay1(date)}
													value={day1}
													name="day1"
													id="ipt_visitDay1Calendar"
													tileDisabled={({date, view}) => (view === 'month') && !ableDayArr.includes(moment(date).format('YYYY-MM-DD'))}
													formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})}
													next2Label={null}
													prev2Label={null}
													defaultActiveStartDate={new Date("2025/" + nowMonth + "/01 00:00:00")}
												/>
											</div>
										</div>
									</li>
									<li>
										<span>간담회 희망일 ②</span>
										<div className="calendar_box">
											<input
												onClick={this.showCalendar}
												type="text"
												id="ipt_visitDay2"
												name="visitDay2"
												value={day2 === '' ? '' : moment(day2).format("YYYY-MM-DD")}
												className="input_sm"
												inputmode="none"
											/>
											<div
												ref = {this.calendarRef2}
												className={"myCalendar " + (day2CalVisible ? "on": "")}
											>
												<Calendar
													onChange={date => this.changeDay2(date)}
													value={day2}
													name="day2"
													id="ipt_visitDay1Calendar"
													tileDisabled={({date, view}) => (view === 'month') && !ableDayArr.includes(moment(date).format('YYYY-MM-DD'))}
													formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})}
													className={"myCalendar" + (day2CalVisible ? "on": "")}
													next2Label={null}
													prev2Label={null}
													defaultActiveStartDate={new Date("2025/" + nowMonth + "/01 00:00:00")}
												/>
											</div>
										</div>
									</li>
								</ul>

							</div>

							<h2 className="info_tit">
								<label htmlFor="ipt_phone">신청 이유(중복선택 가능)</label>
							</h2>
							<div className="input_wrap reason_list">
								<ul className="pl8">
									<li>
										<input type="checkbox" id="reason1" name="reason" className="checkbox" value="1"
											   onChange={this.setJoinReason} checked={event.joinReason.includes('1')}/>
										<label htmlFor="reason1">비바샘 활용법 소개</label>
									</li>
									<li>
										<input type="checkbox" id="reason2" name="reason" className="checkbox" value="2"
											   onChange={this.setJoinReason} checked={event.joinReason.includes('2')}/>
										<label htmlFor="reason2">비바샘 개선 및 보완점 직접 전달</label>
									</li>
									<li>
										<input type="checkbox" id="reason3" name="reason" className="checkbox" value="3"
											   onChange={this.setJoinReason} checked={event.joinReason.includes('3')}/>
										<label htmlFor="reason3">주변 선생님들께 비바샘 소개</label>
									</li>
									<li>
										<input type="checkbox" id="reason5" name="reason" className="checkbox" value="5"
											   onChange={this.setJoinReason} checked={event.joinReason.includes('5')}/>
										<label htmlFor="reason5">AI 디지털교과서 활용법</label>
									</li>
									<li>
										<input type="checkbox" id="reason4" name="reason" className="checkbox" value="4"
											   onChange={this.setJoinReason} checked={event.joinReason.includes('4')}/>
										<label htmlFor="reason4">기타</label>
									</li>
								</ul>
							</div>
						</div>

						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<div className="input_wrap">
									<textarea
										name="applyContent1"
										onChange={this.handleChange}
										value={event.applyContent1}
										placeholder="궁금한 콘텐츠 및 페이지 개선이 필요한 사항 등 자세한 이유를 적아주세요"
										className="ipt_textarea"></textarea>
									<div className="count_wrap"><p className="count">
										<span>{counting}</span>/500</p></div>
								</div>
							</div>
						</div>

						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>이용 목적: ‘비바샘이 간다’ 신청 확인</li>
									<li>수집하는 개인 정보: 성명, 재직학교명, 학교 주소, 휴대전화번호</li>
									<li>개인 정보 보유 및 이용 기간: 2025년 12월 31일까지</li>
								</ul>
								<br/>
								<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우
									신청이 불가합니다.</p>
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
								<li>개인정보가 불분명한 경우 선발 명단에서 제외될 수 있습니다.<br />개인정보는 꼭 확인해주세요.</li>
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
)(withRouter(SaemteoVivasamGoApply));