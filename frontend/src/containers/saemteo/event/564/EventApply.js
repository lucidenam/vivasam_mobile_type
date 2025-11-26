import React, {Component, Fragment} from 'react';
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
			myPhoneCheckMessage: '',
			myPhoneCheckClassName: '',
			myTelephoneCheck: false,
		};
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
			let {memberId, name, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
			event.memberId = memberId;
			event.userName = name;
			event.agree = false;
			event.mySchName = schName;
			event.mySchZipCd = schZipCd;
			event.mySchAddr = schAddr;
			event.myAddressDetail = schName;
			event.userInfo = 'Y';

			if (cellphone != null && cellphone != '') {
				event.myCellphone = cellphone;
				this.setState({
					myTelephoneCheck: true
				})
			} else {
				event.myCellphone = '';
			}

			SaemteoActions.pushValues({type: "event", object: event});

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

	// 사용자의 핸드폰정보 조회시 유효성 체크
	phoneCheckByUserInfoCellphone = (cellphone) => {
		let text;
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
			myPhoneCheckClassName: clazz,
			myPhoneCheckMessage: text,
			myTelephoneCheck: checkFlag
		});
	}
	//핸드폰번호 체크
	phoneCheck = (e) => {
		e.target.value = common.autoHypenPhone(e.target.value);
		let tel = e.target.value;
		let text;
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

		if (e.target.name === 'myCellphone') {
			this.setState({
				myPhoneCheckClassName: clazz,
				myPhoneCheckMessage: text,
				myTelephoneCheck: checkFlag
			});
		} else {
			this.setState({
				phoneCheckClassName: clazz,
				phoneCheckMessage: text,
				telephoneCheck: checkFlag
			});
		}
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
	openPopupAddress = (isSelfReceive) => {
		const {PopupActions} = this.props;
		PopupActions.openPopup({title: "우편번호 검색", componet: <FindAddress handleSetAddress={isSelfReceive ? this.handleSetMyAddress : this.handleSetAddress}/>});
	};

	//도로명주소 입력 후 callback
	handleSetMyAddress = (zipNo, roadAddr) => {
		const {event, PopupActions, SaemteoActions} = this.props;
		event.userInfo = 'N';
		event.mySchZipCd = zipNo;
		event.mySchAddr = roadAddr;
		SaemteoActions.pushValues({type: "event", object: event});
		PopupActions.closePopup();
	};
	handleSetAddress = (zipNo, roadAddr) => {
		const {event, PopupActions, SaemteoActions} = this.props;
		event.schZipCd = zipNo;
		event.schAddr = roadAddr;
		SaemteoActions.pushValues({type: "event", object: event});
		PopupActions.closePopup();
	};

	//값 입력 확인
	validateInfo = () => {
		const {event, eventAnswer} = this.props;
		const {telephoneCheck, myTelephoneCheck} = this.state;
		let reg_name = /[\uac00-\ud7a3]{2,4}/;
		let obj = {result: false, message: ''};

		// 나에게 전송 여부
		const isSelfReceive = eventAnswer.chosenItem === "item9";

		if (!event.userName) {
			obj.message = '성명을 입력해주세요.';
			return obj;
		}
		if (!reg_name.test(event.userName)) {
			obj.message = '올바른 성명 형식이 아닙니다.';
			return obj;
		}
		if (!event.mySchName) {
			obj.message = '재직 학교를 입력해 주세요.';
			return obj;
		}
		if (event.myCellphone === "") {
			obj.message = '휴대전화번호를 입력해 주세요.';
			return obj;
		}
		if (!myTelephoneCheck) {
			obj.message = '휴대폰 번호가 유효하지 않습니다.';
			return obj;
		}
		if (!event.agree) {
			obj.message = '유의 사항 및 개인정보 수집 및 이용 사항에 동의해 주세요.';
			return obj;
		}

		if (isSelfReceive) {
			if (event.mySchZipCd === "" || event.mySchAddr === "") {
				obj.message = '수령지를 입력해 주세요.';
				return obj;
			}
			if (event.myAddressDetail === "") {
				obj.message = '상세주소를 입력해 주세요.';
				return obj;
			}
		} else {
			if (!event.receiverName) {
				obj.message = '받으실 선생님의 성명을 입력해 주세요.';
				return obj;
			}
			if (!reg_name.test(event.receiverName)) {
				obj.message = '올바른 성명 형식이 아닙니다.';
				return obj;
			}
			if (!event.schName) {
				obj.message = '재직 학교를 입력해 주세요.';
				return obj;
			}
			if (event.schZipCd === "" || event.schAddr === "") {
				obj.message = '수령지를 입력해 주세요.';
				return obj;
			}
			if (event.addressDetail === "") {
				obj.message = '상세주소를 입력해 주세요.';
				return obj;
			}
			if (event.cellphone === "") {
				obj.message = '휴대전화번호를 입력해 주세요.';
				return obj;
			}
			if (!telephoneCheck) {
				obj.message = '휴대폰 번호가 유효하지 않습니다.';
				return obj;
			}
		}

		obj.result = true;
		return obj;
	};

	applyButtonClickSafe = (e) => {
		this.applyButtonClick(e.target);
	};

	applyButtonClick = (target) => {
		target.disabled = true;
		const {event, eventAnswer, SaemteoActions} = this.props;
		let obj = this.validateInfo();
		if (!obj.result) {
			common.error(obj.message);
			target.disabled = false;
			return false;
		}
		// 나에게 전송 여부
		const isSelfReceive = eventAnswer.chosenItem === "item9";

		try {
			event.eventAnswerDesc = "";

			if (isSelfReceive) {
				event.eventAnswerDesc = event.mySchName + '/' + event.mySchZipCd + '/' + event.mySchAddr + ' ' + event.myAddressDetail
					+ "/" + event.myCellphone;
			} else {
				event.eventAnswerDesc = event.mySchName + "/" + event.myCellphone + "/받으실 선생님: " + event.receiverName + "/" + event.schName
					+ "/" + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail + "/" + event.cellphone;
			}

			event.eventAnswerDesc2 = eventAnswer.chosenItemName + "^||^" + eventAnswer.evtComment;

			SaemteoActions.pushValues({type: "event", object: event});
			this.insertApplyForm();
		} catch (e) {
			console.log(e);
		}
	};

	openPopupSchool = (e, isSelfReceive) => {
		e.preventDefault;
		const { PopupActions } = this.props;
		PopupActions.openPopup({title:"학교 검색", componet:<EventFindSchool handleSetSchool={isSelfReceive ? this.handleSetMySchool : this.handleSetSchool}/>});
	}

	// 학교검색 선택후 callback
	handleSetMySchool = (obj) => {
		const {event, SaemteoActions, PopupActions} = this.props;
		const {schoolName, schoolCode, zip, addr} = obj;

		event.schCode = schoolCode;
		event.mySchName = schoolName;
		event.mySchZipCd = zip;
		event.mySchAddr = addr;
		event.myAddressDetail = '';

		SaemteoActions.pushValues({type: "event", object: event});
		PopupActions.closePopup();
	};
	handleSetSchool = (obj) => {
		const {event, SaemteoActions, PopupActions} = this.props;
		const {schoolName, zip, addr} = obj;

		event.schName = schoolName;
		event.schZipCd = zip;
		event.schAddr = addr;
		event.addressDetail = '';

		SaemteoActions.pushValues({type: "event", object: event});
		PopupActions.closePopup();
	};

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
		const {event, eventAnswer} = this.props;
		const {eventInfo, myPhoneCheckMessage, myPhoneCheckClassName, phoneCheckMessage, phoneCheckClassName} = this.state;
		if (eventInfo === '') return <RenderLoading/>;

		return (
			<section className="vivasamter">
				<h2 className="blind">
					비바샘터 신청하기
				</h2>
				<div className="applyDtl_top top_yell">
					<div className="applyDtl_cell ta_c pick">
						<h3>고마운 마음, 비바샘이 꽃으로 전해드려요.</h3>
					</div>
				</div>
				<div className="vivasamter_apply">
					<div className="vivasamter_applyDtl pdside0">
						<div className="txt_event">* 신청하시는 선생님 정보</div>
						<div className="pdside20 pb25">
							<h2 className="info_tit">
								<label htmlFor="my_ipt_name">성명</label>
							</h2>
							<div className="input_wrap">
								<input
									type="text"
									placeholder="성명을 입력하세요"
									id="my_ipt_name"
									name="userName"
									value={event.userName || ''}
									className="input_sm"
									readOnly={true}/>
							</div>
							<h2 className="info_tit">
								<label htmlFor="ipt_school_name">재직 학교</label>
							</h2>
							<div className="input_wrap school">
								<input
									type="text"
									placeholder="예) 비바샘 고등학교"
									id="ipt_school_name"
									name="mySchName"
									onChange={this.handleChange}
									value={event.mySchName || ''}
									className="input_sm"
									readOnly={event.userInfo === 'Y'}
								/>

								<button
									className="input_in_btn btn_gray"
									onClick={(e) => {
										this.openPopupSchool(e, true);
									}}>
									학교검색
								</button>
							</div>

							{eventAnswer.chosenItem === 'item9' ?
								<Fragment>
									<h2 className="info_tit mt30">
										<label htmlFor="ipt_address">학교 주소</label>
									</h2>
									<div className="input_wrap">
										<input
											type="text"
											placeholder="우편번호 검색을 선택하세요"
											value={event.mySchZipCd || ''}
											className="input_sm"
											readOnly/>
										<button
											type="button"
											className="input_in_btn btn_gray"
											onClick={() => {
												this.openPopupAddress(true);
											}}
										>
											우편번호 검색
										</button>
									</div>
									<div className="input_wrap mt5"
										 style={{display: event.mySchAddr !== '' ? 'block' : 'none'}}>
										<input
											type="text"
											id="ipt_address"
											value={event.mySchAddr || ''}
											className="input_sm"
											readOnly/>
									</div>
									<div className="input_wrap mt5 ">
										<input
											type="text"
											placeholder="상세주소를 입력하세요"
											id="ipt_detail_address"
											name="myAddressDetail"
											onChange={this.handleChange}
											value={event.myAddressDetail}
											className="input_sm"/>
									</div>
								</Fragment> : ''
							}
							<h2 className="info_tit">
								<label htmlFor="ipt_phone">휴대전화번호</label>
							</h2>
							<div className="input_wrap mb25">
								<input
									type="tel"
									placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
									id="ipt_phone"
									name="myCellphone"
									onChange={this.phoneCheck}
									value={event.myCellphone || ''}
									maxLength="13"
									className="input_sm mb5"/>
								<InfoText message={myPhoneCheckMessage} className={myPhoneCheckClassName}/>
							</div>
						</div>

						{eventAnswer.chosenItem !== 'item9' ?
							<Fragment>
								<div className="txt_event">* 꽃다발을 받으실 선생님 정보</div>
								<div className="pdside20 pb25">
									<h2 className="info_tit">
										<label htmlFor="ipt_name">성명</label>
									</h2>
									<div className="input_wrap">
										<input
											type="text"
											placeholder="성명을 입력하세요"
											id="ipt_name"
											name="receiverName"
											onChange={this.handleChange}
											value={event.receiverName || ''}
											className="input_sm"/>
									</div>
									<h2 className="info_tit">
										<label htmlFor="ipt_school_name">재직 학교</label>
									</h2>
									<div className="input_wrap school">
										<input
											type="text"
											placeholder="예) 비바샘 고등학교"
											id="ipt_school_name"
											name="schName"
											onChange={this.handleChange}
											value={event.schName || ''}
											className="input_sm"
											readOnly
										/>
										<button
											className="input_in_btn btn_gray"
											onClick={(e) => {
												this.openPopupSchool(e, false);
											}}>
											학교검색
										</button>
									</div>

									<h2 className="info_tit mt30">
										<label htmlFor="ipt_address">학교 주소</label>
									</h2>
									<div className="input_wrap">
										<input
											type="text"
											placeholder="우편번호 검색을 선택하세요"
											value={event.schZipCd || ''}
											className="input_sm"
											readOnly/>
										<button
											type="button"
											className="input_in_btn btn_gray"
											onClick={ () => {
												this.openPopupAddress(false);
											}}
										>
											우편번호 검색
										</button>
									</div>
									<div className="input_wrap mt5"
										 style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
										<input
											type="text"
											id="ipt_address"
											className="input_sm"
											value={event.schAddr || ''}
											readOnly/>
									</div>
									<div className="input_wrap mt5 ">
										<input
											type="text"
											placeholder="상세주소를 입력하세요"
											id="ipt_detail_address"
											name="addressDetail"
											onChange={this.handleChange}
											value={event.addressDetail || ''}
											className="input_sm"/>
									</div>

									<h2 className="info_tit">
										<label htmlFor="ipt_phone">휴대전화번호</label>
									</h2>
									<div className="input_wrap mb25">
										<input
											type="tel"
											placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
											id="ipt_phone"
											name="cellphone"
											onChange={this.phoneCheck}
											value={event.cellphone || ''}
											maxLength="13"
											className="input_sm mb5"/>
										<InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
									</div>
								</div>
							</Fragment> : ''}
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">유의사항</span>
								<ul className="privacyList">
									<li>본 카드는 상대 선생님에게 선물하는 카드로 ‘상대 선생님의 재직 학교‘ 로만 배송이 가능합니다.</li>
									<li>본인에게 선물하고 싶다면 [누구보다 응원해주고 싶은 나에게] 카드를 선택해 주세요.</li>
									<li>선물을 받으실 선생님에게 선물은 5월15일(목) 재직 학교로 배송 완료됩니다.</li>
									<li>개인정보 오기재로 인한 경품 재발송은 불가하오니 신청 정보를 꼼꼼히 확인해 주세요.</li>
								</ul>
							</div>
						</div>
						<div className="acco_notice_list pdside20">
							<div className="acco_notice_cont">
								<span className="privacyTit">개인정보 수집 및 이용동의</span>
								<ul className="privacyList">
									<li>이용 목적: 경품 발송 및 고객 문의 응대</li>
									<li>수집하는 개인 정보: 신청자의 재직학교와 휴대전화번호, 선물 수령인의 재직학교와 휴대전화번호</li>
									<li>개인정보 보유 및 이용 기간: 2025년 8월 31일까지(이용목적 달성 시 즉시 파기)</li>
									<li>선물 발송을 위해 개인정보(성명, 주소, 연락처)가 배송업체에 제공됩니다. <br/>(㈜카카오 사업자 등록번호 120-81-47521), ㈜꾸까 사업자 등록번호 264-81-32594)</li>
								</ul>
								<br/>
								<p className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
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
									본인은 개인정보 수집 및 이용에 동의합니다.
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
		event: state.saemteo.get('event').toJS(),
		eventAnswer: state.saemteo.get('eventAnswer').toJS(),
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(saemteoActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch)
	})
)(withRouter(EventApply));