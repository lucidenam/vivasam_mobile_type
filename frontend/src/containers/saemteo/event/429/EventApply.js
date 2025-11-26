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

class EventApply extends Component {

	state = {
		initialSchName: '',
		initialSchZipCd: '',
		initialSchAddr: '',
		eventInfo: '',
		phoneCheckMessage: '',
		phoneCheckClassName: '',
		telephoneCheck: false,
		starScore: { 0: false, 1: false, 2: false, 3: false, 4:false, 5: false, 6: false, 7: false, 8: false, 9: false},
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
			event.agree1 = false;
			event.receive = '교무실';

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
		const {telephoneCheck, starScore} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		//별점구하기
		let starPoint = 0;
		for(let i = 9; i>= 0; i--) {
			if(starScore[i]){
				starPoint = i;
				starPoint = (starPoint + 1) / 2;
				break;
			}
		}

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
		} else if (!(0.5 <= starPoint && starPoint <= 5)) {
			obj.message = '이벤트 설문조사에 참여해 주세요.';
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
		const {starScore} = this.state;
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


			//별점구하기
			let starPoint = 0;
			for(let i = 9; i>0; i--) {
				if(starScore[i]){
					starPoint = i;
					break;
				}
			}

			starPoint = (starPoint + 1) / 2;
			//1차참여
			if(event.eventJoinYn === 'N') {
				event.eventAnswerDesc2 = "1차참여/별점 : " + starPoint + "/당첨상품 : ";
			//2차참여
			} else if(event.eventJoinYn === 'Y') {
				event.eventAnswerDesc2 = "^||^2차참여/별점 : " + starPoint + "/당첨상품 : ";
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

	//신청
	insertApplyForm = async () => {
		const {event, eventAnswer, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId, roulette} = this.props;

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
			
			let response = await api.insertRouletteEventApply(params);
			
			if (response.data.code === '1') {
				common.error("이미 신청 하셨습니다.");
			} else if (response.data.code === '0') {
				//당첨상품 저장
				roulette.prizeIdx = response.data.prizeIdx;
				roulette.prizeName = response.data.prizeName;
				SaemteoActions.pushValues({type: "roulette", object: roulette});

				this.returnMainAndStartRoul();

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

	returnMainAndStartRoul = async (e) => {
		// e.preventDefault();
		const {eventId, PopupActions, history, SaemteoActions, roulette} = this.props;
		await PopupActions.closePopup();

		roulette.start = true;
		SaemteoActions.pushValues({type: "roulette", object: roulette});
		history.push('/saemteo/event/view/' + eventId);
	}

	starRating = (e) => {
		// starScore: [false, false, false, false, false, false, false, false, false, false],
		const { starScore, starScoreArr } = this.state;

		console.log(e.target.value)

		for(let i=0; i<=9; i++) {
			starScore[i] = false;
		}

		for(let i=0; i<=e.target.value; i++) {
			starScore[i] =  true;
		}

		this.setState({
			starScore : starScore,
		})


	}






	render() {
		const {eventInfo, starScore} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;
				
		return (
			<section className="vivasamter">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top">
					<div className="applyDtl_cell ta_c pick">
						<h3>비바샘 입학식 이벤트</h3>
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
								<label htmlFor="ipt_school_name">재직 학교</label>
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

							{/*{event.userInfo == 'Y' && <p className="bulTxt mb15">* 학교 검색에서 찾으시는 학교가 없을 경우,<br />직접 입력을 통해 재직 학교명과 소재지를 입력해 주세요.</p>}*/}
							<h2 className="info_tit">
								<label htmlFor="ipt_address">학교 소재지</label>
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
								<label htmlFor="ipt_receive">수령처</label>
							</h2>
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
								<div className={(event.receive === '교실' ? '' : 'hide')}>
									<h2 className="info_tit">
										<label htmlFor="ipt_receive">학년/반</label>
									</h2>
									<div className='input_wrap mt5 receiveGradeClass'>
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
							<div className="infoSurvey">
								<strong className="surveyTit c_o">※ 이벤트 설문조사</strong>
								<p>
									&#60;비바샘 입학식 &#62; 이벤트에 참여해 주셔서 감사드립니다.<br />
									선생님들께 더욱 즐거운 이벤트를 제공해 드리기 위해<br />
									간단한 설문을 진행합니다.<br />
									&#60;비바샘 입학식 &#62; 이벤트가 재미있으셨다면 별 개수로 의견을<br />
									남겨주세요!
								</p>
								<ul className="starRating">
									<li>
										<input type="checkbox" name="starScore" id="star0" value={0}
											   onClick = {this.starRating}
											   checked={starScore[0]}
										/>
										<label htmlFor="star0"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star1" value={1}
											   onClick = {this.starRating}
											   checked={starScore[1]}
										/>
										<label htmlFor="star1"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star2" value={2}
											   onClick = {this.starRating}
											   checked={starScore[2]}
										/>
										<label htmlFor="star2"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star3" value={3}
											   onClick = {this.starRating}
											   checked={starScore[3]}
										/>
										<label htmlFor="star3"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star4" value={4}
											   onClick = {this.starRating}
											   checked={starScore[4]}
										/>
										<label htmlFor="star4"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star5" value={5}
											   onClick = {this.starRating}
											   checked={starScore[5]}
										/>
										<label htmlFor="star5"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star6" value={6}
											   onClick = {this.starRating}
											   checked={starScore[6]}
										/>
										<label htmlFor="star6"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star7" value={7}
											   onClick = {this.starRating}
											   checked={starScore[7]}
										/>
										<label htmlFor="star7"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star8" value={8}
											   onClick = {this.starRating}
											   checked={starScore[8]}
										/>
										<label htmlFor="star8"></label>
									</li>
									<li>
										<input type="checkbox" name="starScore" id="star9" value={9}
											   onClick = {this.starRating}
											   checked={starScore[9]}
										/>
										<label htmlFor="star9"></label>
									</li>
								</ul>
								<span className="removeStar"></span>
							</div>
						</div>
						<div className="acco_notice_list pdside20">

							<div className="acco_notice_cont">
								<span className="privacyTit">
									개인정보 수집 및 이용동의
								</span>
								<ul className="privacyList">
									<li>이용 목적 : 경품 발송 및 고객문의 응대​</li>
									<li>수집하는 개인정보 : 성명, 휴대전화번호, 학교명, 학교주소</li>
									<li>수집하는 개인정보 : 성명, 재직학교, 학교주소, 휴대전화번호,<br />​ 자택주소</li>
									<li>
										아이패드 에어/에어팟 3세대 경품이 당첨될 경우,<br />​
										제세공과금(22%)이 부여되며 제세공과금 처리를 위한 개인정보<br />​
										수급(신분증 사본, 주민등록번호, 계좌번호)을 위해 별도로 안내를<br />​
										드릴 예정입니다. ​
									</li>
									<li>
										개인정보 보유 및 이용기간 : 2023년 4월 30일까지 (이용목적<br />​
										달성 시 즉시 파기)​
									</li>
									<li>
										연락처 오류 시 경품 재발송이 불가능합니다. 개인정보를 꼭<br />​
										확인해 주세요.​
									</li>
									<li>
										선물 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사와 배송업체에 제공됩니다.​<br />​
										(㈜카카오 사업자등록번호 120-81-47521​)<br />​
										(㈜한진 사업자등록번호: 201-81-02823)​
									</li>
								</ul>
								<br />
								<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
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
		roulette: state.saemteo.get('roulette').toJS(),
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