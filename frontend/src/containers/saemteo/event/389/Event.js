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

	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.eventAmountCheck();

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
	eventApplyCheck = async() => {
		const { logged, eventId, event } = this.props;
		if(logged){

			const response = await api.chkEventJoin({eventId});
			if(response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}

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
		const {allAmountFull, todayAmountFull, isEventApply} = this.state;

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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
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

		if((DD == 15 || DD == 16) && hh < 15) {
			alert("오후 3시에 오픈됩니다.");
			return false;
		}

		// 이벤트 기간 15, 16일
		// 22일 이전은 테스트 용도
		if( allAmountFull || (DD == 15 && todayAmountFull[0]) || (DD == 16 && todayAmountFull[1])) {
			common.info("준비한 선물이 모두 소진되어 신청이 마감되었습니다.");
			return;
		}

		let answerNumber = "";

		if(DD == 15) {
			answerNumber =  "1,0";
		} else if(DD == 16) {
			answerNumber =  "0,1";
		} else if(DD < 15) {
			answerNumber =  "1,0";
		} else {
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


	render () {
		const { checkArray, comment1, commentLength1} = this.state;

		return (
			<section className="event220215">
				<div className="evtCont01">
					{/*<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>*/}
					<h1>2022 벽걸이 달력을 보내드립니다.</h1>
					<div className="evtNoti">
						<ul className="evtPeriod">
							<li>
								선생님의 수업을 더욱 풍성하게 만들어줄 신학기 선물을 준비합니다!<br />
								<span className="color2">연간 600여 개의 계기 이슈를 수록한</span> 벽걸이 달력을 신청하세요.
							</li>
						</ul>
						<div className="evtOpenwrap">
							<div className="evtOpen">
								<span className="openDate">2022년 2월 15일 ~ 2월 16일</span>
								<span className="openNotice">* 2월 28일 부터 순차 발송됩니다.</span>
							</div>
						</div>
					</div>
				</div>
				<div className="evtCont02">
					<h2>2022벽걸이 달력</h2>
					<ul>
						<li>주요 기념일, 사건·사고, 위인의 출생 등 <span className="color3">학교 수업에 활용할 수 있는 계기 이슈를 수록</span>하였습니다.</li>
						<li><span className="color3">연 600여 개, 월 50개 가량의 계기 이슈</span>를 수업에<br /> 다채롭게 활용하실 수 있습니다.</li>
						<li><span className="color3">가독성이 높은 대형 사이즈</span>로 제작되어<br />수업 활용도가 높습니다.</li>
					</ul>
					<button className="evtBtn" className="btnApply" onClick={this.eventApply}>
						신청하기
					</button>
				</div>
				<div className="evtNotice">
					<strong>신청 시 유의사항</strong>
					<ul>
						<li><span>-</span> 벽걸이 달력은 1인 1개 신청 가능하며, 2월 28일부터 순차 발송됩니다.</li>
						<li><span>-</span> 주소 기재가 잘못되어 반송된 달력은 다시 발송해드리지 않습니다.</li>
						<li>
							<span>-</span> 신청자 개인 정보(성명/주소/휴대전화번호)는 배송업체에 공유됩니다.<br />
							(㈜CJ대한통운 사업자 번호:110-81-05034)
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