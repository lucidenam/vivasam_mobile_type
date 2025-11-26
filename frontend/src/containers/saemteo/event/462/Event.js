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
import * as SaemteoActions from "../../../../store/modules/saemteo";

const PAGE_SIZE = 10;
const subEventId = [463, 464];

class Event extends Component{
	state = {
		isEventApply : false,	// 신청여부
		isEventApply2 : false,	// 신청여부
		eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
		eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/462',
		pageNo : 1, 				// 페이지
		pageSize : PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
		eventAnswerContents : [],	// 이벤트2 참여내용
		eventAnswerCount : 0,		// 이벤트1 참여자 수
		eventContents : "",
		curLength: 0, //현재 글자수
	}

	componentDidMount = async () => {
		const {BaseActions, event} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.checkEventCount();   		// 이벤트 참여자 수 조회
			await this.commentConstructorList();	// 이벤트2 댓글 목록 조회
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

		await this.setEventInfo();
	};

	// 기 신청 여부 체크
	eventApplyCheck = async () => {
		const {logged} = this.props;

		if (logged) {
			// const response = await api.chkEventJoin({eventId});
			const response = await api.chkEventJoin({eventId : subEventId[0]});
			const response2 = await api.chkEventJoin({eventId : subEventId[1]});

			if (response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}
			if (response2.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply2: true
				});
			}

		}
	}

	setEventInfo = async () => {
		const {event, SaemteoActions} = this.props;

		event.teacherAnnual = '';
		event.teacherStory = '';
		SaemteoActions.pushValues({type: "event", object: event});
	}

	handleChange = (e) => {
		const {event, SaemteoActions} = this.props;

		if (!this.prerequisite(e)) {
			return;
		}

		SaemteoActions.pushValues({type: "event", object: event});
	}

	// 전제 조건
	prerequisite = (e) => {
		const {logged, history, BaseActions, loginInfo} = this.props;
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
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			return false;
		}

		// 준회원 여부
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// // 기 신청 여부
		// if (isEventApply) {
		// 	common.error("이미 신청하셨습니다.");
		// 	return false;
		// }

		return true;
	}

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {SaemteoActions, eventId, handleClick, loginInfo, event,  eventAnswer} = this.props;
		const { isEventApply} = this.state;

		let eventContents = "";

		if (!this.prerequisite(e)) {
			return;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 신청하셨습니다.");
			return false;
		}

		try {
			const eventAnswer = {
				eventId: 463,
				memberId: loginInfo.memberId,
				eventContent: eventContents,
			};

			SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

			handleClick(eventId);    // 신청정보 팝업으로 이동
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	}


	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply2 = async () => {
		const { logged,  eventAnswer,loginInfo, history, BaseActions, SaemteoActions, eventId2, eventId, handleClick, event} = this.props;
		const { isEventApply2} = this.state;
		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return false;
		}
		// 교사 인증
		if (loginInfo.certifyCheck === 'N') {
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			return false;
		}
		// 준회원일 경우 신청 안됨.
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}
		// 기 신청 여부
		if (isEventApply2) {
			common.error("이미 신청하셨습니다.");
			return false;
		}

		if(eventAnswer.eventId === undefined) {
			eventAnswer.eventId = 464;
			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
		}

		try {
			const eventAnswer = {
				eventId : 464,
				isEventApply : isEventApply2
			};
			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
			handleClick(eventId);    // 신청정보 팝업으로 이동
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(()=>{
			}, 1000);//의도적 지연.
		}
	};

	handleClickPage = async (pageNo) => {
		const {BaseActions} = this.props;

		this.setState({
			pageNo : pageNo
		});
		BaseActions.openLoading();
		setTimeout(() => {
			try {
				this.commentConstructorList();	// 댓글 목록 조회
			} catch (e) {
				console.log(e);
				common.info(e.message);
			} finally {
				setTimeout(() => {
					BaseActions.closeLoading();
				}, 300);//의도적 지연.
			}
		}, 100);
	}

	// 이벤트 참여자수 확인
	checkEventCount = async () => {
		const {SaemteoActions, eventId} = this.props;
		const params = {
			eventId:  subEventId[0],
			eventAnswerSeq: 2,
			answerIndex: 1
		};
		const params2 = {
			eventId:  subEventId[1],
			eventAnswerSeq: 2,
			answerIndex: 1
		};

		let response = await api.getSpecificEventAnswerCount(params);
		let response2 = await api.getSpecificEventAnswerCount(params2);
		this.setState({
			eventAnswerCount: response.data.eventAnswerCount,
			eventAnswerCount2: response2.data.eventAnswerCount,
		});

		// 최초 조회시 전체건수가 5건이상이면 더보기 버튼 표시
		if(this.state.eventAnswerCount > PAGE_SIZE){
			this.setState({
				eventViewAddButton : 1
			});
		}

	};

	// 댓글 출력
	commentConstructorList = async () => {
		const {eventId} = this.props;
		const {pageNo, pageSize} = this.state;

		const params = {
			eventId: 463,
			eventAnswerSeq: 2,
			answerPage: {
				pageNo: pageNo,
				pageSize: pageSize
			}
		};

		const responseList = await api.getEventAnswerList(params);

		let eventJoinAnswerList = responseList.data.eventJoinAnswerList;


		// 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
		if(this.state.eventAnswerCount <= this.state.pageSize) {
			this.setState({
				eventViewAddButton: 0
			});
		}

		// 조회가 완료되면 다음 조회할 건수 설정
		this.setState({
			eventAnswerContents : eventJoinAnswerList,
			 pageSize : this.state.pageSize + PAGE_SIZE,
		});
	};

	// 댓글 더보기
	commentListAddAction = () => {
		this.commentConstructorList(); // 댓글 목록 갱신
	};

	render() {
		const {eventAnswerCount, eventAnswerContents, pageNo, pageSize, eventViewAddButton, curLength} = this.state;
		const {event} = this.props;
		const totalPage = Math.ceil(eventAnswerCount / pageSize);
		const curPage = pageNo;
		const pagesInScreen = 5;
		let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
		let endPageInScreen = startPageInScreen + pagesInScreen - 1;

		if (totalPage < endPageInScreen) {
			endPageInScreen = totalPage;
		}
		// 페이징
		const pageList = () => {
			const result = [];
			for (let i = startPageInScreen; i <= endPageInScreen; i++) {
				result.push(<li className={curPage === i ? 'on' : ''} onClick={() => {
					this.handleClickPage(i).then()
				}}><button>{i}</button></li>);
			}
			return result;
		}

		//css용 인덱스
		let loopIndex = 0;
		// 댓글
		const eventList = eventAnswerContents.map((eventList, index) => {

			if(loopIndex >= 6) {
				loopIndex = 1;
			} else {
				loopIndex++;
			}

			const result = <EventListApply {...eventList} key={eventList.event_answer_id} indexNum={loopIndex}/>;
			return result;
		});


		return (
			<section className="event230908">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2023/event230908/evtTit.png" alt="내가 꿈꾸는 나의 교과서"/>
						<div className="blind">
							<h3>
								내가 꿈꾸는
								‘나’의 교과서
							</h3>
							<p>
								선생님, 학생들과 함께 만들어가는 비상교과서!
							</p>
							<p className="evtTxt">
								<span className="blind">
									‘나, 너, 우리가 만드는 교과서 캠페인’ 의 첫 번째 이야기를 시작합니다.
									학생들과 함께 꿈꾸고 바라는 교과서에 대한 즐거운 상상을 맘껏 펼쳐보세요.
									선생님 그리고 학급으로 선물이 찾아갑니다.
								</span>
							</p>
							<div className="evtPeriod">
								<div className="blind">
									<div><span className="tit blind">이벤트 기간</span><span className="txt"><span
										className="blind">2023.9.8.(금) ~ 2023.10.31.(화)</span></span></div>
									<div><span className="tit blind">당첨자 발표</span><span className="txt"><span
										className="blind">10월 5일/11월 3일 (월 1회 발표)</span></span><em>*비바샘 공지사항에서 확인하실 수
										있습니다.</em></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="evtCont2">
					<div className="cont cont1">
						<span className="evtBadge">
							<img src="/images/events/2023/event230908/evtContTit1.png" alt="이벤트1 교사대상" />
						</span>
						<div className="contInner">
							<div className="contTxt">
								<img src="/images/events/2023/event230908/evtContTxt1.png" alt="내가 꿈꾸는 나의 교과서"/>
								<div className="blind">
									<h4>선생님이 바라고 꿈꾸는 교과서는 무엇인가요? 자유롭게 의견을 남겨주세요.</h4>
									<p> 예) 학생들과 양방향 소통이 가능한 교과서였으면 좋겠어요! / 학생들과 게임처럼 놀고, 즐길 수 있는 교과서를 원해요!</p>
								</div>
							</div>
							<div className="commentWrap">
								<div className="commentList">
									{/*<div className="listItem">*/}
									{/*	<div className="listTxt">*/}
									{/*		<div className="txtInner">*/}
									{/*			<p>가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사</p>*/}
									{/*		</div>*/}
									{/*		/!*<p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc2}}></p>*!/*/}
									{/*	</div>*/}
									{/*	<span className="teacher_id">{this.state.eventName} 선생님</span>*/}
									{/*</div>*/}
									{/*<div className="listItem">*/}
									{/*	<div className="listTxt">*/}
									{/*		<div className="txtInner">*/}
									{/*			<p>가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사</p>*/}
									{/*		</div>*/}
									{/*		/!*<p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc2}}></p>*!/*/}
									{/*	</div>*/}
									{/*	<span className="teacher_id">{this.state.eventName} 선생님</span>*/}
									{/*</div>*/}
									{/*<div className="listItem">*/}
									{/*	<div className="listTxt">*/}
									{/*		<div className="txtInner">*/}
									{/*			<p>가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사가나다라 마바사</p>*/}
									{/*		</div>*/}
									{/*		/!*<p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc2}}></p>*!/*/}
									{/*	</div>*/}
									{/*	<span className="teacher_id">{this.state.eventName} 선생님</span>*/}
									{/*</div>*/}

									{eventList}
									{/*<button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>*/}
									{/*	<span className="blind">더보기</span>*/}
									{/*</button>*/}
								</div>
							</div>
							{/*{eventAnswerCount > 0 &&*/}
							{/*}*/}
						</div>
						<button className="btnApply" onClick={this.eventApply}>
							<span className="blind">신청하기</span>
						</button>
					</div>

					<div className="cont cont2">
						<span className="evtBadge">
							<img src="/images/events/2023/event230908/evtContTit2.png" alt="이벤트2 학급 학생 대상상" />
						</span>
						<div className="contInner">
							<div className="contTxt">
								<img src="/images/events/2023/event230908/evtContTxt2.png" alt="내가 꿈꾸는 나의 교과서"/>
								<div className="blind">
									<h4>학생들이 바라고 꿈꾸는 교과서는 무엇일까요? ​ QR 설문을 통해 학생이 참여할 수 있도록 도와주세요!​</h4>
									<p>예)  마음껏 색칠할 수 있는 교과서였으면 좋겠어요!​ 숙제도 재미있게 할 수 있는 교과서가 있으면 좋겠어요!​</p>
								</div>
							</div>
						</div>
						<button className="btnApply" onClick={this.eventApply2}>
							<span className="blind">신청하기</span>
						</button>
					</div>
				</div>

				<div className="notice">
					<strong>유의사항</strong>
					<ul>
						<li>
							①  본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.
						</li>
						<li>
							②  각 이벤트 별로 1인 1회씩 참여하실 수 있습니다.​
						</li>
						<li>
							③  개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.​
						</li>
						<li>
							④  경품 발송을 위해 선물 발송을 위해 개인정보가 서비스사와<br />
							배송업체에 제공됩니다.​<br />
							(주)모바일이앤엠애드 사업자등록번호 : 215-87-19169​  /<br />
							아기자기 선물가게 사업자등록번호: 5303100427​
						</li>
						<li>
							⑤  경품은 당첨자 발표 이후 순차발송 되며, 학급 학생 대상 이벤트의 경우<br />
							간식 배송을 위해 선생님께 연락 드릴 예정입니다.​
						</li>
						<li>
							⑥  제출하신 응답은 상업적인 사용 목적이 아닌, 기업의 활동 소개를 위해<br />
							사용될 수 있습니다.​
						</li>
					</ul>
				</div>



				{/*<div>*/}
				{/*	{eventAnswerCount > 0 &&*/}
				{/*	<div className="commentWrap cont_Wrap">*/}
				{/*		<div className="inner">*/}
				{/*			<div className="commentList">*/}
				{/*				{eventList}*/}
				{/*				<button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>*/}
				{/*					<span className="blind">더보기</span>*/}
				{/*				</button>*/}
				{/*			</div>*/}
				{/*		</div>*/}
				{/*	</div>}*/}
				{/*</div>*/}
			</section>
		)
	}
}

//=============================================================================
// 댓글 목록 component
//=============================================================================

class EventListApply extends Component{

    constructor(props) {
        super(props);
        this.state = {
            member_id : this.props.member_id, // 멤버 아이디
            event_id : this.props.event_id, // eventId
            event_answer_desc : this.props.event_answer_desc, // 응답문항
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
		let answers = JSON.stringify(this.state.event_answer_desc).substring(1,eventSetContentLength-1).split('^||^');
		let eventSetContents = answers[0]; // 이벤트 내용

        eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');

        this.setState({
			eventName : eventSetName,
			eventContents : eventSetContents,
			event_answer_desc : answers[0],
			event_answer_desc2 : answers[1],
        });
    };

	render() {
		const {eventName, event_answer_desc, event_answer_desc2} = this.state;
		return (
			<div className="listItem">
				<div className="listTxt">
					<div className="txtInner">
						<p dangerouslySetInnerHTML={{__html: this.state.eventContents}}></p>
					</div>
				</div>
				<span className="teacher_id">{this.state.eventName} 선생님</span>
			</div>
		);
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