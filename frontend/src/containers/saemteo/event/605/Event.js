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

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부
		allAmountFull: true,       // 전체 경품 소진여부
		todayAmountFull: [true, true, true, true, true],      // 경품 소진 여부
		todayItemEnd: false,
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

			for (let i=3,size=6; i<=size; i++) {
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
			for (let i=3,size=6; i<=size; i++) {
				todayAmountFullArr.push(true); //
			}
		}

		const response = await api.getCurrentTime();
		let nowDate = response.data.nowDate;
		let DD = nowDate.split(" ")[0].split("-")[2];

		//검수용
		/*
		if( allAmountFull || (DD == 12 && todayAmountFullArr[0]) || (DD == 13 && todayAmountFullArr[1]) || (DD == 14 && todayAmountFullArr[2]) || (DD == 15 && todayAmountFullArr[3])) {
			this.setState({todayItemEnd: true});
		}
		*/

		//실서버용
		if( allAmountFull || (DD == 18 && todayAmountFullArr[0]) || (DD == 19 && todayAmountFullArr[1]) || (DD == 20 && todayAmountFullArr[2]) || (DD == 21 && todayAmountFullArr[3])) {
			this.setState({todayItemEnd: true});
		}

		this.setState({
			allAmountFull: allAmountFull,
			todayAmountFull: todayAmountFullArr
		});
	}

	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, eventAnswer, eventGiftCount, loginInfo} = this.props;
		const {allAmountFull, todayAmountFull, isEventApply} = this.state;

		if (!logged) {
			// 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		// 교사 인증
		if(loginInfo.certifyCheck === 'N'){
			BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			return;
		}

		// 준회원일 경우 신청 안됨.
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// 기 신청 여부
		if(isEventApply){
			common.error("이미 신청하셨습니다.");
			return;
		}


		if (!(loginInfo.schoolLvlCd == "ES" || loginInfo.schoolLvlCd == "MS" || loginInfo.schoolLvlCd == "HS")) {
			alert("해당 이벤트는 초중고 학교 선생님만 신청하실 수 있습니다.");
			return false;
		}

		const response = await api.getCurrentTime();
		let nowDate = response.data.nowDate;

		let YYYY = nowDate.split(" ")[0].split("-")[0];
		let MM = nowDate.split(" ")[0].split("-")[1];
		let DD = nowDate.split(" ")[0].split("-")[2];
		let hh = nowDate.split(" ")[1].split(":")[0];
		let mm = nowDate.split(" ")[1].split(":")[1];
		// console.log("이벤트 신청 시간 : " + YYYY+"-"+MM+"-"+DD+" "+hh+":"+mm);

		//실서버용
		if (0 <= hh && hh < 16) {
			alert("오후 4시에 오픈됩니다.");
			return false;
		}

		// 이벤트 기간 18~21일 : 기간별로 상품 3~6번 차례로 지급
		// 18일 이전은 테스트 용도
		//검수용
		/*
		if( allAmountFull || (DD == 12 && todayAmountFull[0]) || (DD == 13 && todayAmountFull[1]) || (DD == 14 && todayAmountFull[2]) || (DD == 17 && todayAmountFull[3])) {
			if(DD == 12 || DD == 13 || DD == 14) {
				common.info("오늘 준비된 수첩과 달력이 모두 소진되어 신청이 마감되었습니다. \n 내일 오후 4시에 다시 신청해 주세요:)");
			}
			if(DD == 17) {
				common.info("준비한 다이어리와 달력이 모두 소진되어 \n 신청이 마감되었습니다. 감사합니다!");
			}
			return;
		}
		*/
		//실서버용
		if( allAmountFull || (DD == 18 && todayAmountFull[0]) || (DD == 19 && todayAmountFull[1]) || (DD == 20 && todayAmountFull[2]) || (DD == 21 && todayAmountFull[3])) {
			if(DD == 18 || DD == 19 || DD == 20) {
				common.info("오늘 준비된 수첩과 달력이 모두 소진되어 신청이 마감되었습니다. \n 내일 오후 4시에 다시 신청해 주세요:)");
			}
			if(DD == 21) {
				common.info("준비한 다이어리와 달력이 모두 소진되어 \n 신청이 마감되었습니다. 감사합니다!");
			}
			return;
		}

		let answerNumber = "";

		//검수용
		/*
		if(DD == 12) {
			answerNumber =  "1,0,0,0";
		} else if(DD == 13) {
			answerNumber =  "0,1,0,0";
		} else if(DD == 14) {
			answerNumber =  "0,0,1,0";
		} else if(DD == 17) {
			answerNumber =  "0,0,0,1";
		} else {
			common.info("신청 기간이 아닙니다.");
			return;
		}
		*/
		//실서버용
		if(DD == 18) {
			answerNumber =  "1,0,0,0";
		} else if(DD == 19) {
			answerNumber =  "0,1,0,0";
		} else if(DD == 20) {
			answerNumber =  "0,0,1,0";
		} else if(DD == 21) {
			answerNumber =  "0,0,0,1";
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

	handlePreviewClick1 = async () => {
		const {history, eventId} = this.props;
		history.push('/saemteo/event/preview/'+ eventId +'/Diary');
	}

	handlePreviewClick2 = async () => {
		const {history, eventId} = this.props;
		history.push('/saemteo/event/preview/'+ eventId +'/Calendar');
	}

	render () {

		return (
			<section className="event251118">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2025/event251118/img.png" alt="비바샘과 미리 만나보는 2025"/>
						<span className={this.state.todayItemEnd ? "item_end deadline" : "item_end"}>{/*마감 시 deadline 클랙스 추가해주세요*/}
							<img src="/images/events/2025/event251118/evtEnd.png" alt="금일 선착순 수량 마감"/>
							<span className={"blind"}>
								금일 선착순 수량 마감
							</span>
						</span>
						<div className="item_box">
							<a href="javascript:void(0);" className="btnView1" onClick={this.handlePreviewClick1}></a>
							<a href="javascript:void(0);" className="btnView2" onClick={this.handlePreviewClick2}></a>
						</div>

						<a href="javascript:void(0);" className="btnApply" onClick={this.eventApply}></a>
					</div>
				</div>
				<div className="evtNotice">
					<strong>유의사항</strong>
					<ul className="info">
						<li>본 이벤트는 비바샘 교사인증을 완료한 <br/><span>초중고 학교 선생님만</span> 신청하실 수 있습니다.</li>
						<li><span>이벤트 기간 내</span> 1인 1회 신청 가능합니다. <span>(중복 신청 불가)</span></li>
						<li>매일 선착순 신청으로, 수량 소진 시 이벤트가 마감됩니다.</li>
						<li>다이어리와 탁상 달력은 학교로만 배송이 가능합니다. <br/>학교 주소와 수령처를 정확하게 기입해 주세요.</li>
						<li>선물 발송에 필요한 정보는 배송 업체에 공유됩니다.<br/> (성명, 주소, 전화번호 등 / <br/>CJ대한통운(주) 사업자등록번호 : 110-81-05034)</li>
						<li>주소 기재가 잘못되어 오발송된 물품은 재발송해 드리지 않습니다.</li>
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
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(Event));