import React, {Component} from 'react';
import './Event.css';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as SaemteoActions from 'store/modules/saemteo';
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

	// 그룹명 ( 학급, 동아리 설정 )
	setGroupCheck = (e) => {
		this.setState({
			isSetGroupCheck: e.target.value
		});
	};

	/* 학년 , 반 , 동아리명 설정 */
	// 학년 설정
	setGroupName1 = (e) => {
		if (e.target.value.length < 10) { // Number형은 length를 읽어와서 일일이 비교해주어야 됩니다.
			this.setState({
				isSetGroupName1: e.target.value
			});
		}
	};
	// 반 설정
	setGroupName2 = (e) => {
		this.setState({
			isSetGroupName2: e.target.value
		});
	};
	// 동아리명 설정
	setGroupCircleName = (e) => {
		this.setState({
			isSetGroupCircleName: e.target.value
		});
	};
	/* 학년, 반 , 동아리명 설정 끝 */

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
		} else if (event.userInfo === 'Y' && !event.schName) {
			obj.message = '주소를 입력해 주세요.';
		} else if (event.userInfo === 'N' && event.addressDetail === "") {
			obj.message = '상세주소를 입력해주세요.';
		} else if (event.telephone === "") {
			obj.message = '휴대전화번호를 입력해 주세요.';
		} else if (!telephoneCheck) {
			obj.message = '휴대폰 번호가 유효하지 않습니다.';
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
		const {event, SaemteoActions, eventId} = this.props;
		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}

		let receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail ;
		let eventAnswerDesc2 = event.answer;

		try {
			event.eventId = eventId;
			event.eventAnswerDesc = receiveInfo;
			// event.eventAnswerDesc2 = eventAnswer.eventAnswerContent ;
			event.eventAnswerDesc2 = eventAnswerDesc2 ;
			SaemteoActions.pushValues({type: "event", object: event});
			// 신청 처리
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
		event.addressDetail = schoolName;

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
			<section className="vivasamter">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top top_yell topStyle2">
					<div className="applyDtl_cell ta_c pick color2">
						<h3><span>연말 카드 이벤트</span></h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					<div className="vivasamter_applyDtl pdside0">
						<div className="applyDtl_inner pdside20 pb25">
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
								<label htmlFor="ipt_name">수령지</label>
								<ul className="join_ipt_chk">
									<li className="join_chk_list half ml38">
										<input
											id="userInfoY"
											type="radio"
											className="checkbox_circle"
											name="userInfo"
											value="Y"
											checked={event.userInfo === 'Y'}
											onChange={this.handleUserInfo}
										/>
										<label htmlFor="userInfoY">학교(정보 불러오기)</label>
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
										<label htmlFor="userInfoN">자택</label>
									</li>
								</ul>
							</h2>



							<h2 className="info_tit">
								{
									event.userInfo === 'Y' ?
										<label htmlFor="ipt_address">학교 주소</label> :
										<label htmlFor="ipt_address">수령처 주소</label>
								}

							</h2>
							<div className="input_wrap">
								<input
									type="text"
									placeholder="우편번호 검색을 선택하세요"
									value={event.schZipCd}
									className="input_sm"
									readOnly/>
								{
									event.userInfo === 'Y' ?
										<button
											className="input_in_btn btn_gray"
											onClick={this.openPopupSchool}>
											학교검색
										</button> : ''
								}
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
									id="ipt_address"
									value={event.schAddr + ' ' + event.schName}
									className="input_sm"
									readOnly/>
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
								{
								event.userInfo === 'Y' ?
								<p className="evtInfoTxt">
									○학년 ○반 교실, ○학년 교무실, 택배실 등 수령처를 <br/>구체적으로 기재해 주세요.
								</p>
								:''}
							</div>
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
									<li>개인 정보 수집 및 이용 동의 이용 목적: 경품 발송 및 고객 문의 응대</li>
									<li>수집하는 개인 정보: 성명, 재직 학교, 주소, 휴대 전화 번호</li>
									<li>
										개인 정보 보유 및 이용 기간: 2025년 1월 31일까지<br/>(이용 목적 달성 시 즉시 파기)
									</li>
									<li>개인 정보 오기재, 유효 기간 만료로 인한 경품 재발송은 불가합니다.</li>
									<li>
										신청자 개인 정보(성명/주소/휴대 전화 번호)가 서비스사 및 배송 업체에 공유됩니다.<br/>
										((주)모바일이앤엠애드 사업자 등록 번호 215-87-19169,<br/>
										(주)CJ대한통운 사업자 등록 번호 110-81-05034, <br/>
										(주)한진택배 사업자 등록 번호 201-81-02823)
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
									본인은 개인정보 수집 및 이용동의 안내를 확인<br/>
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
		SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch)
	})
)(withRouter(EventApply));