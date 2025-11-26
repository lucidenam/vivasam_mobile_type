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

		eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
		eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/455',
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
			// await this.countConstructorList();		// 이벤트1 선택 횟수 조회
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

		if (e.target.value.length > 200 ) {
			common.info('최소 2자 ~ 최대 200자까지 입력할 수 있어요.');
			return false;
		}

		event.teacherStory = e.target.value;

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

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 신청하셨습니다.");
			return false;
		}

		return true;
	}

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;
		const { isEventApply} = this.state;

		let eventContents = "";

		if (!this.prerequisite(e)) {
			return;
		}

		if (event.teacherStory.length < 2) {
			common.info('최소 2자 ~ 최대 200자까지 입력할 수 있어요.');
			return;
		}

		eventContents += (event.teacherStory);

		try {
			const eventAnswer = {
				eventId: e.target.id,
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
			eventId: eventId,
			eventAnswerSeq: 2,
			answerIndex: 1
		};

		let response1 = await api.getSpecificEventAnswerCount(params);
		this.setState({
			eventAnswerCount: response1.data.eventAnswerCount,
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
			eventId: eventId,
			eventAnswerSeq: 2,
			answerPage: {
				pageNo: pageNo,
				pageSize: pageSize
			}
		};

		const responseList = await api.getEventAnswerList(params);

		// console.log(responseList);
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
			<section className="event230607">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2023/event230607/evtTit.png" alt="플로깅을 지구지키깅"/>
						<div className="blind">
							<h1>플로깅으로 지구 지키기</h1>
							<span className="blind">
							지구 지키기를 약속해주신 선생님 중 추첨을 통해 반 학생들과 함께 <br />
							'쓰레기 줍기' 활동을 할 수 있는 플로깅 집게를 학급 선물로 보내 드립니다.​
						</span>
							<span className="blind">
							환경의 달 6월을 맞아 비바샘과 함께 더욱 의미 있는 <br />
							플로깅 캠페인에 참여하고 지구 지키기에 동참해주세요!
						</span>
							<div className="evtPeriod">
								<div><span className="tit">참여 기간</span><span className="txt">6월 8일(목) ~ 6월 28일(수)</span></div>
								<div><span className="tit">당첨 발표</span><span className="txt">6월 30일(금)</span></div>
							</div>
						</div>
						<div className="plogging">
							<img src="/images/events/2023/event230607/plogging.png" alt="플로깅이란?"/>
							<p className="blind">
							달리는 것만으로 기후위기를 멈추고, 지구를 살리 수 있을까?라는 호기심에서 시작한 플로깅은 조깅을 하면서 동시에 쓰레기도 줍는 환경 운동을 말해요!
						</p>
						</div>
					</div>
				</div>

				<div className="evtCont2">
					<div className="cont">
						<img src="/images/events/2023/event230607/evtGift.png" alt="60개 학급선정" />
						<div className="blind">
							<ul className="giftWrap">
								<li>
									<h3>60개 학급 선정</h3>
									<span className="evtGift">
										<p>
											플로깅 집개
											1인당 1개
										</p>
									</span>
									<span className="evtGift">
										<p>
											토퍼
											학급당 1개
										</p>
									</span>
								</li>
								<li>
									<h3>60개 학급 선정</h3>
									<span className="evtGift">
										<p>
											플로깅 집개
											1인당 1개
										</p>
									</span>
									<span className="evtGift">
										<p>
											토퍼
											학급당 1개
										</p>
									</span>
								</li>
							</ul>
						</div>
						<p className="giftInfo">
							학생들과 함께할 플로깅 활동 계획을 알려주세요!<br />
							추후 활동 후기를 남겨주신 선생님께는 친환경 선물을 보내드립니다!
						</p>
					</div>
					<div className="cont">
						<h3>
							<span className="blind">
								신청 사연을 작성해주세요
							</span>
						</h3>
						<div className="formBox">
                                <textarea
									placeholder="학생들과 함께 할 플로깅 활동 계획을 알려주세요!(200자 이내)"
									name="write"
									onChange={this.handleChange}
									value={event.teacherStory}
									maxLength="200"
								></textarea>
							<span className="count"><span className="currentCount">{event.teacherStory == undefined ? 0 : event.teacherStory.length}</span>/200</span>
							<button className="btnApply" onClick={this.eventApply}>
								<img src="/images/events/2023/event230607/btnApply.png" alt="신청하기" />
								<span className="blind">신청하기</span>
							</button>
						</div>
					</div>
				</div>

				<div className="notice">
					<strong>유의사항</strong>
					<ul>
						<li>
							본 이벤트는 비바샘 교사 인증을 완료한 선생님 대상 이벤트 입니다.​
						</li>
						<li>
							이벤트는 1인 1회 참여할 수 있습니다.​
						</li>
						<li>
							모개인정보 오기재로 인한 상품 재발송은 불가합니다.​​
						</li>
						<li>
							상품 발송을 위해 서비스사에 개인정보(성명, 휴대 전화번호)가 제공됩니다.​​<br/>
							(㈜카카오 사업자 등록번호 120-81-47521) ​
						</li>
						<li>
							학급 선물 플로깅 집게 수령 후 후기 작성에 꼭 참여해주세요.
						</li>
					</ul>
				</div>

				<div className="evtCont3">
					{eventAnswerCount > 0 &&
					<div className="commentWrap cont">
						<h3>
							<span className="blind">지구 지키기 약속</span>
						</h3>
						<div className="commentList">
							{eventList}
							<button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
								<span className="blind">더보기</span>
							</button>
						</div>
					</div>}
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
        // eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');
		// console.log(eventSetContents)
        // console.log(answers[0])

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
				<div className="comment">
					<span className="teacher_id">{this.state.eventName} 선생님</span>
					<p dangerouslySetInnerHTML={{__html: this.state.eventContents}}></p>
					{/*<p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc2}}></p>*/}
				</div>
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