import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import {Cookies} from "react-cookie";

const cookies = new Cookies();

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부

		allAmountFull: true,       // 전체 경품 소진여부
		todayAmountFull: [true, true, true],      // 경품 소진 여부

		clickCalender: false,
		evtDeadLineSticker: "",
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.eventAmountCheck();
			await this.checkEvtDeadLine();
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}



	};


	checkEvtDeadLine = async() => {
		const {allAmountFull, todayAmountFull} = this.state;
		const response = await api.getCurrentTime();
		let nowDate = response.data.nowDate;
		let DD = nowDate.split(" ")[0].split("-")[2];
		//실서버
		const day1 = 15;
		const day2 = 16;
		//테스트
		// const day1 = 13;
		// const day2 = 14;
		// 이벤트 기간 15일
		if(DD == day1 && todayAmountFull[0]) {
			this.setState({
				evtDeadLineSticker: "on"
			})
		}

		// 이벤트 기간 16일
		if( allAmountFull || (DD == day2 && todayAmountFull[1])) {
			this.setState({
				evtDeadLineSticker: "on"
			})
		}
	}


	// 기 신청 여부 체크
	eventApplyCheck = async() => {
		const { logged, eventId, event } = this.props;

		if(logged){

			const response = await api.chkEventJoin({eventId});
			if(response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true,
				});
			}else {

			}
		}else {

		}
	}

	eventAmountCheck = async() => {
		const { SaemteoActions, eventId} = this.props;
		let { allAmountFull } = this.state;
		let params1 = {};
		params1.eventId = eventId; // 이벤트 ID

		let todayAmountFullArr = [];
		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;

			for (let i=3,size=4; i<=size; i++) {
				const isTodayAmountFull = responseData['qntCnt_'+i] <= 0;
				todayAmountFullArr.push(isTodayAmountFull); //
				// 하나의 경품이라도 full이 아니면 전체경품 소진된것이 아니므로 나머지 경품중 신청가능
				if (!isTodayAmountFull) {
					allAmountFull = false;
				}
			}

		} catch (e) {
			console.log(e);
			// 조회 실패시 모든 경품 신청불가하도록 신청수량 꽉참으로 표시
			for (let i=3,size=21; i<=size; i++) {
				todayAmountFullArr.push(true); //
			}
		}

		this.setState({
			allAmountFull: allAmountFull,
			todayAmountFull: todayAmountFullArr
		});
	}

	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, eventAnswer, eventGiftCount, loginInfo} = this.props;
		const {allAmountFull, todayAmountFull, isEventApply, clickCalender} = this.state;

		if (allAmountFull) {
			common.info("준비한 선물이 모두 소진되었습니다.");
			return;
		}

		if (!logged) {
			// 미로그인시
			common.info("로그인이 필요한 서비스입니다.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		// 교사 인증
		if(loginInfo.certifyCheck === 'N'){
			BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});

			if(window.confirm("교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?")) {
				window.location.hash = "/login/require";
				window.viewerClose();
				return;
			} else {
				return;
			}
			// common.info("교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?");
			// window.location.hash = "/login/require";
			// window.viewerClose();
			// return;
		}

		// 준회원일 경우 신청 안됨.
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// 기 신청 여부
		if(isEventApply){
			common.error("이미 참여하셨습니다.");
			return;
		}

		const response = await api.getCurrentTime();
		let nowDate = response.data.nowDate;

		let YYYY = nowDate.split(" ")[0].split("-")[0];
		let MM = nowDate.split(" ")[0].split("-")[1];
		let DD = nowDate.split(" ")[0].split("-")[2];
		let hh = nowDate.split(" ")[1].split(":")[0];
		let mm = nowDate.split(" ")[1].split(":")[1];
		console.log("이벤트 신청 시간 : " + YYYY+"-"+MM+"-"+DD+" "+hh+":"+mm)
		//실서버
		const day1 = 15;
		const day2 = 16;
		//테스트
		// const day1 = 13;
		// const day2 = 14;


		if((DD == day1 || DD == day2) && hh < 14) {
			alert("오후 2시에 오픈됩니다.");
			return false;
		}

		// 이벤트 기간 15일
		if(DD == day1 && todayAmountFull[0]) {
			common.info("오늘 준비한 선물이 모두 소진되어 신청이 마감되었습니다. \n내일 오후 2시에 다시 신청해주세요^^");

			return;
		}

		// 이벤트 기간 16일
		if( allAmountFull || (DD == day2 && todayAmountFull[1])) {
			common.info("준비한 선물이 모두 소진되어 신청이 마감되었습니다.");
			return;
		}

		let answerNumber = "";

		if(DD == day1) {
			answerNumber =  "1,0";
		} else if(DD == day2) {
			answerNumber =  "0,1";
		} else if(DD < day1) {
			answerNumber =  "1,0";
		}  else {
			common.info("신청 기간이 아닙니다.");
			return;
		}

		try {

			const eventAnswer = {
				answerNumber: answerNumber
			};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

			handleClick(eventId);	// 신청정보 팝업으로 이동

		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}

	};

	//달력 클릭
	clickedCalender = () => {
		const {logged} = this.props;
		const {allAmountFull} = this.state;

		if(!allAmountFull && logged){
			this.setState({
				clickCalender: true,
			});
		}


		setTimeout(()=>{
			this.eventApply();
		},500);
	}


	render () {
		const { checkArray, comment1, commentLength1, isEventApply, clickCalender, todayAmountFull, evtDeadLineSticker} = this.state;
		const {loginInfo} = this.props;

		return (
			<section className="event230215">
				<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
				<div className="evtCont01">
					<img src="/images/events/2023/event230215/evtCont1.png" alt=""/>
					<span className={"evtDeadline " + evtDeadLineSticker} ></span>
					<div className="blind">
						<h2>2023 벽걸이 달력으로 교실을 꾸며 주세요</h2>
						<p>
							선생님의 수업을 더 풍성하게 만들어 줄 신학기 교ㆍ꾸 아이템!
							연간 600여 개의 계기 이슈를 수록한 벽결이 달력을 만나 보세요!
						</p>
					</div>
				</div>
				<div className="evtCont02">
					<img src="/images/events/2023/event230215/evtCont2.png" alt=""/>
					<div className="blind">
						<div className="blind">
							<h3>선생님께 THE 필요한 2023벽걸이 달력</h3>

							<ul>
								<li><span>THE ISSUE!</span>주요 기념일, 사건·사고, 위인의 출생 등​ 학교 수업에 활용할 수 있는 계기 이슈 수록</li>
								<li><span>THE 유용!</span>약 연 600여 개, 월 50개! 다양한 계기 이슈를​ 수업에 다채롭게 활용 가능​</li>
								<li><span>THE BIG</span>가독성이 높은 대형 사이즈로 제작되어​ 수업 활용도 높음</li>
							</ul>

							<p><span>참여방법</span> 하단의 달력을 끌어당기고, 정보를 입력하면 참여 완료!</p>
						</div>
					</div>

					<a href="javascript:void(0)" className={"dropImg " +  (isEventApply || clickCalender ? "evtJoinY": "") } onClick={this.clickedCalender}>

					</a>

					<div className={'calenderImg ' + (isEventApply ? "evtJoinY": "") + (clickCalender && loginInfo.mLevel == 'AU300' ? "active" : " ") }>
						<div className="front">
							<img src="/images/events/2023/event230215/evt_calender.png" alt=""/>
						</div>
						<span className="back"></span>
					</div>


					<div className={"calenderEnd " + (isEventApply ? "on": "") }>
						<img src="/images/events/2023/event230215/evt_calender.png" alt=""/>
					</div>
				</div>

				<div className="notice">
					<strong>신청 시 유의사항</strong>
					<ul>
						<li>벽걸이 달력은 1인 1개 신청 가능하며, 2월 27일부터 순차 발송됩니다.</li>
						<li>
							벽걸이달력은 학교로만 배송이 가능합니다. 학교 주소와 수령처를<br />
							정확하게 기입해 주세요. 주소 기재가 잘못되어 반송된 달력은 다시<br />
							발송해 드리지 않습니다.
						</li>
						<li>
							본 이벤트는 선착순 이벤트로, 추후 추가 제작이나 발송은 어렵습니다.<br />
							신청자 개인 정보(성명,주소,휴대전화번호 등)는 배송 업체에<br />
							공유됩니다. (㈜CJ대한통운 사업자등록번호 : 110-81-05034)
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
	})
)(withRouter(Event));