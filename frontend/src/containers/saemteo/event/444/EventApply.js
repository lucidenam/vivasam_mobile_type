import React, {Component} from 'react';
import './Event.css';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import FindAddress from 'containers/login/FindAddress';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';
import EventFindSchool from "../../EventFindSchool";
import * as myclassActions from 'store/modules/myclass';

class EventApply extends Component {

	constructor(props) {
		super(props);
		// Debounce
		this.applyButtonClick = debounce(this.applyButtonClick, 300);
		this.state = {
			/* 기존의 값 */
			initialSchName: '',
			initialSchZipCd: '',
			initialSchAddr: '',
			eventInfo: '',
			phoneCheckMessage: '',
			phoneCheckClassName: '',
			telephoneCheck: false,
			/* 해당 이벤트에 추가 */
			isSetGroupCheck: "1", // 1 : 학급 / 2 : 동아리 ( 웹과의 연동을 위함 )
			isSetGroupName1: '', // 학급 - 학년
			isSetGroupName2: '', // 학급 - 반
			isSetGroupCircleName: '', // 동아리
			isSetMemberCount: '', // 참가 신청 인원
			eMailDomain: '', // Email Domain ( email ID )
			anotherEmailDomain: '', // Email Back Domain ( gmail.com / naver.com ... )
			isAnotherEmailDomain: '', // ( 0 : 직접입력 X / 1 : 직접 입력 )
			firstAnotherEmailDomain: '', //회원의 기본 이메일 주소 도메인 저장
			eventContents: '', // 이벤트 신청 내용 ( 꿈 명함 이유 )
			eventLength: 0, // 이벤트 신청 길이
			infoCheck01: false, // 캠페인 유의사항 확인
			infoCheck02: false // 캠페인 후기 사진 동의 여부
		};
	}

	componentDidMount() {
		const {eventId} = this.props;
		this.getEventInfo(eventId);
	}

	getEventInfo = async (eventId) => {
		const {history, event, SaemteoActions} = this.props;
		const response = await api.eventInfo(eventId);
		if (response.data.code && response.data.code === "0") {
			let eventInfo = response.data.eventList[0];
			event.eventId = eventInfo.eventId;
			let {memberId, name, email, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
			event.memberId = memberId;
			event.userName = name;
			event.agree = false;
			event.schName = schName;
			event.schZipCd = schZipCd;
			event.schAddr = schAddr;
			event.addressDetail = schName;
			event.inputType = '개인정보 불러오기';
			event.userInfo = 'Y';

			if(cellphone!=null && cellphone!='') {
				event.cellphone = cellphone;
				this.setState({
					telephoneCheck: true
				})
			}else{
				event.cellphone = '';
			}

			if(email!=null && email!=''){
				let splitEmail = email.split('@');
				event["emailId"] = splitEmail[0];
				event["emailDomain"] = splitEmail[1];
				SaemteoActions.pushValues({type: "event", object: event});
				this.setState({
					eMailDomain: event.emailId,
					anotherEmailDomain: event.emailDomain,
					firstAnotherEmailDomain: event.emailDomain
				});
			}
			this.phoneCheckByUserInfoCellphone(cellphone);
			this.setState({
				eventInfo: eventInfo,
				initialSchName: schName,
				initialSchZipCd: schZipCd,
				initialSchAddr: schAddr
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
		let clazz = 'point_red';
		if (tel === '') {
			text = "";
		} else if (!this.checkPhoneNum(tel)) {
			text = "휴대폰 번호가 유효하지 않습니다.";
		} else {
			clazz = 'point_color_blue';
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

	// 이메일 체크
	// 앞쪽 아이디 입력

	setEmailDomain = (e) => {
		this.setState({
			eMailDomain: e.target.value
		});
	};
	// 직접 입력일 경우 입력창이 뜨도록 설정
	setAnotherEmailDomain = (e) => {
		const {firstAnotherEmailDomain} = this.state;

		if (e.target.name === 'emailDomain') {
			if (e.target.value === 'otherDomain') {
				this.setState({
					isOtherDomain: 1,
					anotherEmailDomain: ''
				});
			} else if (e.target.value === 'firstDomain') {
				this.setState({
					isOtherDomain: 1,
					anotherEmailDomain: firstAnotherEmailDomain,
				})
			} else {
				this.setState({
					isOtherDomain: 0,
					anotherEmailDomain: e.target.value
				})
			}
		}
	};
	// 직접 이메일 입력시 값 입력
	setHandsAnotherEmailDomain = (e) => {
		this.setState({
			anotherEmailDomain: e.target.value
		});
	};

	/* 이메일 체크 끝 */

	// 내용 입력
	// 댓글 수정 시 길이 연동 및 이벤트 내용 수정
	setApplyContent = (e) => {
		if (e.target.value.length > 300) {
			// common.info("300자 이내로 입력해 주세요.");
			return false;
		}
		this.setState({
			eventLength: e.target.value.length,
			eventContents: e.target.value
		});
	};

	// 캠페인 유의사항 확인
	setInfoCheck01 = (e) => {
		this.setState({
			infoCheck01: !this.state.infoCheck01
		});
	};

	// 캠페인 후기 사진 동의 여부
	setInfoCheck02 = (e) => {
		this.setState({
			infoCheck02: !this.state.infoCheck02
		});
	};

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
			obj.message = '재직 학교를 입력해 주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대폰 번호가 유효하지 않습니다.';
		} else if (this.state.eventContents === "") { // 내용 미입력
			obj.message = '후기를 입력해 주세요.';
		} else if (!event.agree) {
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
		const {event, history, SaemteoActions} = this.props;
		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}
		try {

			// // 주소를 입력받아 ex) 서울특별시 > 은평구 까지만 입력되도록 구분
			// let eventschAddr = event.schAddr.split(" ");
			//
			// // inputType에 따른 값에 따라 ( 1: 개인정보 불러오기 / 2: 직접 입력 )
			// let eventType = "";
			// if (event.inputType === "개인정보 불러오기") {
			// 	eventType = 1;
			// } else {
			// 	eventType = 2;
			// }

			// 전화번호 구분
			let eventCellPhone = event.cellphone.split("-");


			event["eventAnswerDesc2"] = "";

			// 응답값 설정
			// 웹에서 수정이 가능할 수 있게 조절 ( 입력방식 / 학교이름 / 학교 주소 1 - 2 Depth / 학교(반,학년) / 동아리(동아리이름) / 인원 / 전화번호 / Email / 내용
			if (this.state.isSetGroupCheck === "1") {
				event.eventAnswerDesc = event.schName + '/ ' +eventCellPhone[0] + '-' + eventCellPhone[1] + '-' + eventCellPhone[2] ;
				event.eventAnswerDesc2 =  this.state.eventContents;
			} else {
				event.eventAnswerDesc = event.schName + '/ ' +eventCellPhone[0] + '-' + eventCellPhone[1] + '-' + eventCellPhone[2] ;
				event.eventAnswerDesc2 =  this.state.eventContents;
			}

			SaemteoActions.pushValues({type: "event", object: event});
			this.insertApplyForm();
		} catch (e) {
			console.log(e);
		}
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
		event.addressDetail = '';

		SaemteoActions.pushValues({type:"event", object:event});
		PopupActions.closePopup();
	}

	handleClose = async (e) => {
		e.preventDefault();
		const {eventId, PopupActions, history} = this.props;
		await PopupActions.closePopup();
		history.push('/saemteo/event/view/' + eventId);
	};

	//신청
	insertApplyForm = async () => {
		const {event, eventId, SaemteoActions, PopupActions, BaseActions, MyclassActions} = this.props;
		try {
			BaseActions.openLoading();
			event.eventId = eventId;

			var params = {
				eventId: eventId,
				eventAnswerDesc: event.eventAnswerDesc,
				eventAnswerDesc2: event.eventAnswerDesc2,
				userInfo: event.userInfo,
				schCode: event.schCode
			};

			let response = await SaemteoActions.insertEventApply(params);

			if (response.data.code === '1') {
				common.error("이미 신청하셨습니다.");
			} else if (response.data.code === '0') {
				PopupActions.openPopup({title: "신청완료", componet: <EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
				// 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
				if (event.schCode && event.schCode !== this.state.initialSchCode) {
					MyclassActions.myClassInfo();
				}
			} else {
				common.error("신청이 정상적으로 처리되지 못하였습니다.");
			}
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	};

	render() {
		const {eventInfo, eMailDomain, anotherEmailDomain} = this.state;
		if (eventInfo === '') return <RenderLoading/>;
		const {event} = this.props;
		const {phoneCheckMessage, phoneCheckClassName} = this.state;
		return (
			<section className="vivasamter ">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top top_yell topStyle2">
					<div className="applyDtl_cell ta_c pick color2">
						<h3><span>콘텐츠 릴레이 이벤트 1탄</span>&lt;비바샘 테마관&gt;</h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					<div className="vivasamter_applyDtl pdside0 type02">
						<div className="applyDtl_inner pdside20 pb25">
							<h2 className="info_tit not_essential">
								<label htmlFor="ipt_textarea">
									‘VR 역사 답사’를 통해 어떤 답사지를 탐험하셨는지<br />
									알려 주세요!
								</label>
							</h2>
							<div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/300</p></div>
							<div className="input_wrap">
								<textarea
									name="applyContent"
									id="ipt_textarea"
									cols="1"
									rows="10"
									maxLength="501"
									value={this.state.eventContents}
									onChange={this.setApplyContent}
									placeholder="TIP.학생들과 어떻게 수업에 활용할 것인지를 함께 남겨주시면 당첨 확률이 올라갑니다."
									className="ipt_textarea">
								</textarea>
							</div>
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
										className="input_sm input_name"
										readOnly={true}/>
								</div>
							</h2>
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
											학교 검색
										</button> : ''
								}
							</div>

							{/*{event.userInfo == 'Y' &&*/}
							{/*	<div>*/}
							{/*		<p className="bulTxt mt10">* 학교 검색에서 찾으시는 학교가 없을 경우, 직접 입력을 통해<br/> <span className="ml8">재직학교와 주소를 입력해 주세요.</span></p>*/}
							{/*		<p className="bulTxt">* 학교 검색으로 변경된 정보는 선생님의 회원 정보로 갱신됩니다.</p>*/}
							{/*	</div>*/}
							{/*}*/}
							<h2 className="info_tit">
								<label htmlFor="ipt_phone">휴대전화번호</label>
							</h2>
							<div className="input_wrap">
								<input
									type="tel"
									placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
									id="ipt_phone"
									name="cellphone"
									onChange={this.phoneCheck}
									value={event.cellphone}
									maxLength="13"
									className="input_sm mb5"/>
								<InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
							</div>
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">개인정보 수집 및 이용동의</span>
								<ul className="privacyList">
									<li>개인정보 수집 및 이용동의이용 목적 : 경품 발송 및 고객문의 응대</li>
									<li>수집하는 개인정보 : 성명, 재직학교, 휴대전화번호</li>
									<li>
										개인정보 보유 및 이용기간 : 2023년 6월 30일까지<br />
										(이용목적 달성 시 즉시 파기)
									</li>
									<li>연락처 오류 시 경품 재발송이 불가능합니다. 개인정보를 꼭 확인해 주세요.</li>
									<li className="mt15">
										선물 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사와 배송업체에 제공됩니다.<br />
										(㈜카카오 사업자등록번호 120-81-47521)<br />
										(㈜모바일이앤엠애드 사업자등록번호 215-87-19169)
									</li>
								</ul>
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
									본인은 개인정보 수집 및 이용동의 안내를 확인<br />
									하였으며, 이에 동의합니다.
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
		event: state.saemteo.get('event').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(saemteoActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch)
	})
)(withRouter(EventApply));