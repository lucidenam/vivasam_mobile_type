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

const PAGE_SIZE = 10;

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

			for (let i=3,size=5; i<=size; i++) {
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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			return false;
		}

		// 기 신청 여부
		if(isEventApply){
			common.error("이미 신청하셨습니다.");
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

		if(hh < 14) {
			alert("오후 2시부터 신청이 가능합니다. 많은 참여 부탁드립니다.");
			return false;
		}

		if( allAmountFull || (DD == 22 && todayAmountFull[0]) || (DD == 23 && todayAmountFull[1]) || (DD == 24 && todayAmountFull[2])) {
			common.info("준비한 선물이 모두 소진되어 이벤트가 종료되었습니다.");
			return;
		}

		let answerNumber = "";

		if(DD == 22) {
			answerNumber =  "1,0,0";
		} else if(DD == 23) {
			answerNumber =  "0,1,0";
		} else if(DD == 24) {
			answerNumber =  "0,0,1";
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
			<section className="event381">
				<div className="evtCont01">
					<div className="logo">
            <span className="logoVisang"><img src="/images/events/logo_visang.png" alt="visang" /></span>
            <span className="logoVivasam"><a href="#" target="_blank"><img src="/images/events/logo_vivasam.png" alt="비바샘" /></a></span>
          </div>
					<h1><img src="/images/events/2021/381/event.png" alt="비바샘이 준비한 연말선물" /></h1>
					<div className="blind">
						<p>
							아이들에게 나를 사랑하는 법을 안내하는 대안 교과서'마음'.<br/>10가지 코스의 마음여행을 통해 자신의 마음을 탐색하고<br/>자유롭게 여백을 채워가며 공감과 소통에 대해<br/>생각할 수 있게 해 주는 책입니다.
						</p>
						<p>아이들 스스로 생각하고 완성해 가는 '마음'한권, 교실 안에서 어떻게 나누면 좋을까요?</p>
						<p><span>참여기간</span><span>2021년 10월 29일 ~ 11월 19일</span></p>
						<p><span>담청자 발표</span><span>2021년 11월 22일</span></p>
						<p><strong>비상교육 지사를 통해 순차적으로 발송됩니다.</strong></p>
						<p>초등 사회 수업에 바로 활용하는 워크북</p>
						<p>수업 시간에 바로 활용할 수 있는 차시별 학습지 제공</p>
						<p>단원별 성취 수준을 확인할 수 있는 단원 평가 문제 제공</p>
						<p>단원별 핵심 용어를 활용하여 학생 스스로 만들 수 있는 용어사전 제공</p>
					</div>
				</div>
				<div className="evtCont02">
					<h1><img src="/images/events/2021/381/event2.png" alt="2022 선생님 다이어리, 2022 선생님 탁상달력" /></h1>
					<ul className="blind">
						<li>
							<span>01</span>
							<p>2022 선생님 다이어리</p>
							<p>월/주 단위로 효율적인 일정 관리</p>
							<p>최신형 테마별 체험활동 자료 수록</p>
						</li>
						<li>
							<span>02</span>
							<p>2022 선생님 탁상 달력</p>
							<p>12개의 메시지와 아이콘으로 만나는 비상교육</p>
						</li>
					</ul>
					<a href="javascript:void(0);" className="btnView1" onClick={this.handlePreviewClick1}></a>
					<a href="javascript:void(0);" className="btnView2" onClick={this.handlePreviewClick2}></a>
					<a href="javascript:void(0);" className="btnApply" onClick={this.eventApply}></a>
				</div>
				<div className="evtCont03">
					<div className="evtFootWrap">
						<p>유의사항</p>
						<ul className="info">
							<li>1.  1인 1회 신청 가능합니다.</li>
							<li>2.  다이어리와 탁상달력은 학교로만 배송이 가능합니다. 학교 주소와 수령처를 정확하게 기입해 주세요.</li>
							<li>3.  선물 발송에 필요한 정보는 서비스 업체에 공유됩니다. (성명, 주소, 전화번호 등/ CJ대한통운(주) 사업자등록번호 : 110-81-05034)</li>
							<li>4.  주소 기재가 잘못되어 반송된 상품은 다시 발송해드리지 않습니다.</li>
						</ul>
					</div>
				</div>
			</section>
		)
	}
}

//=============================================================================
// 댓글 목록 component
//=============================================================================

// 리스트 목록 UL 출력
const EventList = ({eventlists}) => {
	const eventList = eventlists.map(eventList => {
		return (<EventListApply {...eventList} key={eventList.rownum}/>);
	});

	return (
		<div className="evtList">
			{eventList}
		</div>
	);
};

class EventListApply extends Component{

	constructor(props) {
		super(props);
		this.state = {
			member_id : this.props.member_id, // 멤버 아이디
			event_id : this.props.event_id, // eventId
			event_answer_desc : this.props.event_answer_desc, // 응답문항
			event_answer_no : this.props.event_answer_no,	// 이벤트 참여 항목
			reg_dttm : this.props.reg_dttm, // 등록일
			BaseActions : this.props.BaseActions, // BaseAction
			eventType : "", // 이벤트 타입
			eventName : "", // 이벤트 응모자
			eventRegDate : "", // 이벤트 등록일
			eventContents : "", // 이벤트 내용
			eventLength : "", // 이벤트 길이
		}
	}

	componentDidMount = () => {
		this.eventListApply();
	};

	eventListApply = () => { // 이벤트 표시 값 세팅

		let eventSetName = JSON.stringify(this.state.member_id).substring(1,4) + "***"; // 이벤트 이름
		let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
		let eventSetContents = JSON.stringify(this.state.event_answer_desc).substring(1,eventSetContentLength-1); // 이벤트 내용

		eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
		eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

		this.setState({
			eventName : eventSetName,
			eventContents : eventSetContents,
		});
	};

	render () {
		return (
			<div className="listItem">
				<div className={"eventtype bedge" + (this.state.event_answer_no)} ></div>
				<strong className="user">{this.state.eventName} 선생님</strong>
				<p className="txt" dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>
			</div>
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