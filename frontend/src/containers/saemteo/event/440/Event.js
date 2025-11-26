import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import * as viewerActions from 'store/modules/viewer';
import {bindActionCreators} from "redux";


class Event extends Component {
	state = {
		isEventApply: false,    		// 신청여부
		isAllAmountFull: true,			// 모든 경품 소진 여부
		isEachAmountFull: [true, true, true, true],		// 각각의 경품 소진 여부
		checkContentList: [false, false],	// 각 항목의 체크 여부
		eachAmountLeft : [],
		firstAmountYn : 'Y',
		secondAmountYn : 'Y',
		nowDate : 0,
		nowHour: 0,
		//실서버
		day1 : 6,
		day2 : 7,
		//테스트
		// day1 : 2,
		// day2 : 3,
	}

	componentDidMount = async () => {
		const {BaseActions, eventId, event, SaemteoActions} = this.props;
		BaseActions.openLoading();

		try {
			await this.eventApplyCheck();
			await this.getEventInfo(eventId);
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	};

	// 기 신청 여부 체크
	eventApplyCheck = async () => {
		const {logged, eventId} = this.props;

		if (logged) {
			const response = await api.chkEventJoin({eventId});
			if (response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}
		}
	}

	getEventInfo = async (eventId) => {
		const {logged, event, SaemteoActions} = this.props;
		const {isEventApply} = this.state;
		if(logged && !isEventApply) {
			const response = await api.eventInfo(eventId);

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
			event.cellphone = cellphone;
		}

		event.agree1 = false;

		SaemteoActions.pushValues({type: "event", object: event});
	};

	// 전제 조건
	prerequisite = async () => {
		const {logged, history, BaseActions, loginInfo, event} = this.props;
		const {isEventApply} = this.state;

		// 로그인 여부
		if (!logged) {
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return false;
		}

		// 교사 인증 여부
		if (loginInfo.certifyCheck === 'N') {
			api.appConfirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?').then(confirm => {
				if (confirm === true) {
					BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
					window.location.hash = "/login/require";
					window.viewerClose();
				}
			});
			return false;
		}

		// 준회원 여부
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		// 필수 동의 여부
		if (!event.agree1) {
			common.error("필수 동의 항목 확인 후 이벤트 신청을 완료해 주세요.");
			return false;
		}


		return true;
	}

	eventApply = async () => {
		const {SaemteoActions, eventId, handleClick} = this.props;
		const {checkContentList} = this.state;

		if (!await this.prerequisite()) {
			return;
		}

		try {
			// 신청 처리
			await this.insertApplyForm();
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	};

	insertApplyForm = async () => {
		const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;

		try {
			BaseActions.openLoading();

			var params = {
				eventId: eventId,
				eventAnswerDesc: event.schName + '/' + event.schAddr + ' ' + event.addressDetail + '/' + event.schZipCd + '/' + event.cellphone,
				cellphone: event.cellphone,
				userInfo: "",
				schCode: "",
			};


			let response = await SaemteoActions.insertEventApply(params);

			if (response.data.code === '1') {
				common.error("이미 신청 하셨습니다.");
			} else if (response.data.code === '0') {
				// 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
				history.push("/myInfo");

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
	}

	getMyClassInfo = async () => {
		const {MyclassActions} = this.props;
		try {
			let result = await MyclassActions.myClassInfo();
			return result.data;
		} catch (e) {
			console.log(e);
		}
	}

	changeContent = (index, e) => {
		const {checkContentList} = this.state;

		checkContentList.forEach((value, i) => {
			if (index==i) {
				checkContentList[i] = true;
			} else {
				checkContentList[i] = false;
			}
		});

		this.setState({
			checkContentList: checkContentList
		});

	}

	handleChange = (e) => {
		const {event, SaemteoActions} = this.props;
		if (e.target.name === 'agree1') {
			event[e.target.name] = e.target.checked;
		} else {
			event[e.target.name] = e.target.value;
		}
		SaemteoActions.pushValues({type: "event", object: event});
	};

	render() {
		const {event} = this.props;

		return (
				<section className="event230323">
					<div className="evtCont01">
						<h1><img src="/images/events/2023/event230323/evtCont1.png" alt="우리 업데이트 할래?"/></h1>
						<div className="blind">
							<span>회원정보 업데이트 이벤트</span>
							<h3>우리 업데이트 할래?</h3>
							<p>
								아직 회원정보가 이전 학교로 되어있으신가요?
								휴대전화 번호가 바뀌셨나요?
								선생님의 정보로 맞춤 안내될 비바샘 서비스 이용을 위해
								회원정보를 최신으로 업데이트 해주세요!
							</p>
							<div className="evtPeriod">
								<div className="blind">
									<div>
										<span className="tit blind">참여 기간</span><span className="txt"><span
										className="blind">3월 23일(목) ~ 4월 6일(목)</span></span>
									</div>
									<div>
										<span className="tit blind">당첨자 발표</span><span className="txt"><span
										className="blind">4월 10일(목)</span></span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="evtCont02">
						<div className="blind">
							<h3>이벤트 기간 동안 회원정보를 업데이트 해주신 300분꼐 선물을 드립니다!</h3>
							<span>300명 추첨</span>
							<p>
								데이트 선물
								베스킨라빈스 싱글레귤러 아이스크림
							</p>
							<ul>
								<li>이벤트 기간 중 신규 가입하신 선생님은 제외됩니다.</li>
								<li>이벤트 기간 중 개인 정보를 2회 이상 중복으로 업데이트하여도 1회만 참여됩니다.</li>
								<li>당첨 발표 : 4월 10일 / 비바샘 공지사항</li>
							</ul>
						</div>
						<div className="agreeWrap">
							<strong className="infoTit">개인정보 수집 및 이용동의</strong>
							<ul className="infoList">
								<li>이용목적 : 경품 배송 및 고객 문의 응대​</li>
								<li>수집하는 개인정보 :​ 성명, 휴대전화번호​</li>
								<li>개인정보 보유 및 이용 기간 : 2023년 4월 30일까지 (이용목적 달성 시 즉시 파기)​​</li>
							</ul>
							<p className="infoTxt">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다.<br /><span>단, 동의를 거부할 경우 이벤트 참여가 불가합니다.</span>
							</p>
						</div>
						
						<div className="agreeCheck mt25 ">
							<input
								type="checkbox"
								name="agree1"
								onChange={this.handleChange}
								className="checkbox"
								checked={event.agree1}
								id="join_agree01"/>
							<label
								htmlFor="join_agree01"
								>
								<strong className="checkbox_tit">
									개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.
								</strong>
							</label>
						</div>
						
						<div className="btnWrap">
							<a className="btnApply" onClick={this.eventApply}>
								<span className="blind">회원정보 변경하기</span>
							</a>
						</div>

						<p className="infoTit">
							위 버튼 클릭 후 회원정보를 업데이트하면 이벤트에 자동 참여됩니다.
						</p>
					</div>
					<div className="evtCont3">
						<img src="/images/events/2023/event230323/evtCont3.png" alt="개인정보 없데이트 "/>
						<div className="blind">
							<h3>회원정보를 업데이트 해야하는 이유</h3>
							<ul>
								<li>
									<stronng>최신 정보 업데이트로 개인정보를 보호해요</stronng>
									<p>
										오래된 개인정보로 생기는 택배 반송, 경품 발송 오류 등의 불편함을 줄일 수 있어요!
									</p>
								</li>
								<li>
									<strong>비바샘 소식을 정확하게 받아볼 수 있어요!</strong>
									<p>
										다양한 이벤트 소식과 당첨 안내 등 선생님께 필요한 정보를 보내 드려요!
										<span>(*이메일 & SMS 수신동의 시)</span>
									</p>
								</li>
							</ul>
						</div>
					</div>
					<div className="evtFooter">
						<strong>유의사항</strong>
						<ul className="info">
							<li>- 본 이벤트는 이벤트 기간 중 신규가입하신 선생님은 제외됩니다.</li>
							<li>- 이벤트 기간 중 개인정보를 2회 이상 중복으로 업데이트하여도<br /> 1회만 참여 됩니다.</li>
							<li>- 개인정보 오기재, 유효기간 만료로 인한 상품 재발송은 불가합니다.​</li>
							<li>
								- 상품 발송을 위해 서비스사에 개인정보(성명, 휴대 전화번호)가 제공됩니다.​<br />
								(㈜모바일이앤엠애드 215-87-19169)​
							</li>

						</ul>
					</div>
				</section>
		)
	}
}

export default connect(
		(state) => ({
			logged: state.base.get('logged'),
			loginInfo: state.base.get('loginInfo').toJS(),
			event: state.saemteo.get('event').toJS(),
			answerPage: state.saemteo.get('answerPage').toJS(),
			eventAnswer: state.saemteo.get('eventAnswer').toJS()
		}),
		(dispatch) => ({
			PopupActions: bindActionCreators(popupActions, dispatch),
			SaemteoActions: bindActionCreators(saemteoActions, dispatch),
			BaseActions: bindActionCreators(baseActions, dispatch),
			MyclassActions: bindActionCreators(myclassActions, dispatch),
			ViewerActions: bindActionCreators(viewerActions, dispatch)
		})
)(withRouter(Event));