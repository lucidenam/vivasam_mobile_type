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

class Event extends Component {

	constructor(props) {
		super(props);
		this.state = {
			StoryCheck: "", // 선택한 선생님
			agreeCheck: 0, // 개인정보 체크
			agreeCheckNote: 0, // 유의사항 체크
			storyLength: 0, // 길이 카운트
			storyContents: "",
			StoryPageNo: 1, // 페이지
			StoryPageSize: 10, // 사이즈
			initialStoryPage: true, // 첫 랜더링시 사연 추가 방지
			eventAnswerContents: [], // 응답
			eventAnswerCount: 0, // 해당 이벤트 응답 수
			StoryLogInInfo: this.props.loginInfo, // 접속 정보
			eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
			applyContent: '',
			applyName: ''
		};
	}


	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.commentConstructorList();
			await this.checkEventCount();
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

	};

	// 이벤트 카운트 확인
	checkEventCount = async () => {
		const {event, eventId, loginInfo, history, SaemteoActions, PopupActions, BaseActions} = this.props;
		event.eventId = eventId; // 이벤트 ID
		let response = await SaemteoActions.checkEventTotalJoin({...event});
		this.setState({
			eventAnswerCount: response.data.eventAnswerCount
		});

		if (this.state.eventAnswerCount > 10) {
			this.setState({
				eventViewAddButton: 1
			});
		}
	};

	// 댓글 출력
	commentConstructorList = async () => {
		const {event, eventId, answerPage, loginInfo, SaemteoActions} = this.props;

		let currentPageSize = this.state.StoryPageSize;


		if(!this.state.initialStoryPage){ //더보기 버튼 클릭시 실행
			currentPageSize += 10;
			this.setState({
				StoryPageSize: this.state.StoryPageSize + 10
			});
		} else if(this.state.initialStoryPage){ //첫 페이지 랜더링 때만 작동
			this.setState({
				initialStoryPage: false
			});
		}

		answerPage.pageNo = this.state.StoryPageNo;
		answerPage.pageSize = currentPageSize;
		event.eventId = eventId; // 이벤트 ID
		event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 2(사연출력)
		event.memberId = loginInfo.memberId; // 멤버 ID
		const responseList = await api.getEventAnswerList({...event, answerPage});
		const responsedata = responseList.data.eventJoinAnswerList;
		this.setState({
			eventAnswerContents: responsedata
		});
		if (this.state.eventAnswerCount < currentPageSize) {
			this.setState({
				eventViewAddButton: 0
			});
		}
	};

	// 댓글 더보기
	commentListAddAction = () => {
		this.commentConstructorList(); // 댓글 목록 갱신
	};

	eventApplyCheck = async () => {
		const {
			logged,
			history,
			BaseActions,
			SaemteoActions,
			event,
			eventId,
			handleClick,
			eventAnswer,
			loginInfo
		} = this.props;
		if (logged) {
			event.eventId = eventId; // 이벤트 ID
			const response = await api.eventInfo(eventId);
			if (response.data.code === '3') {
				this.setState({
					isEventApply: true
				});
			}
		}
	}

	// 이벤트 신청 검사
	eventApply = async () => {
		const {
			logged,
			history,
			BaseActions,
			SaemteoActions,
			event,
			eventId,
			handleClick,
			eventAnswer,
			loginInfo
		} = this.props;
		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
		} else {
			// 준회원일 경우 신청 안됨.
			if (loginInfo.mLevel != 'AU300') {
				common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
				return false;
			}

			// 교사 인증
			if (loginInfo.certifyCheck === 'N') {
				BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
				common.info("교사 인증 후 이벤트 참여를 해주세요.");
				window.location.hash = "/login/require";
				window.viewerClose();
				return false;
			}

			// 로그인시
			try {
				if (this.state.isEventApply) {
					common.error("이미 참여하셨습니다.");
				} else {
					// Store에 전송하기 위한 AnswerContents Push 후 Event 전송
					//let eventAnswerArray = {};
					//eventAnswerArray.applyName = this.state.applyName;
					//eventAnswerArray.applyContent = this.state.applyContent;
					// eventAnswer.eventAnswerContent = eventAnswerArray;
					//SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
					handleClick(eventId);
				}
			} catch (e) {
				console.log(e);
			} finally {
				setTimeout(() => {
				}, 1000);//의도적 지연.
			}
		}
	};

	render() {
		return (
			<section className="event220418">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event220418/img1.png"
					         alt="비바샘과 함께 만들어가는 꿈꾸는 학교. 2022 비바샘 꿈지기 캠페인"/></h1>
					<div className="blind">
						<p>비바샘이 ‘단 하나뿐인 꿈 명함’에<br/>
							반짝반짝 빛나는 아이들의 꿈을 담아 드립니다.<br/>
							<strong>우리 반, 우리 동아리 학생들에게<br/>
								꿈 명함을 선물하고 싶은 사연을 남겨 주세요!</strong>
						</p>
					</div>
				</div>

				<div className="evtCont02">
					<h2><img src="/images/events/2022/event220418/img2.png" alt="꿈지기 캠페인 안내"/></h2>
					<div className="blind">
						<dl>
							<dt>캠페인 기간</dt>
							<dd>1학기 : 2022.04.18 ~ 06.30<br/>
								2학기 : 2022.09.01 ~ 11.30</dd>
							<dt>당첨자 발표</dt>
							<dd>월 1회, 각 10분의 꿈지기 선생님을 선정합니다.<br/>
								1학기: 05.11(수) / 06.08(수) / 07.06(수)<br/>
								2학기: 10.05(수) / 11.02(수) / 12.07(수)
							</dd>
							<dt>캠페인 선물</dt>
							<dd>
								1. 학생 1인당 1통의 꿈 명함
								2. 선생님 꿈 명함과 토퍼 + 후기 선물
							</dd>
							<dt>꿈 명함 제작 일정</dt>
							<dd>
								<span>※ 당첨자 발표부터 꿈 명함 수령까지 약 1개월 정도 소요됩니다.</span>
								<ol>
									<li>당첨 안내</li>
									<li>1주 후 - 명함 정보 확인</li>
									<li>3주 후 - 꿈 명함 제작 완료</li>
									<li>3일 후 - 꿈 명함 수령</li>
									<li>1주 후 - 캠페인 후기 수급</li>
								</ol>
							</dd>
						</dl>
					</div>
				</div>

				<div className="evtCont03">
					<h2><img src="/images/events/2022/event220418/img3.png" alt="꼭 참고하세요!"/></h2>
					<div className="blind">
						<ul>
							<li>학급, 동아리 40명 이내 그룹 단위로만 신청 가능합니다.</li>
							<li>구체적인 꿈 명함 활용 계획을 알려주시면 당첨 확률이 올라갑니다.</li>
							<li>당첨되신 선생님께 꿈 명함 제작을 위한 정보를 요청 드립니다.</li>
							<li>&lt;꿈지기 생생후기&gt; 게시판에 후기 사진 게재를 위해 학생들의 초상권 활용 동의서를 수급합니다.</li>
							<li>꿈 명함 수령 후 ★후기 사진★ 을 꼭 보내주세요.</li>
						</ul>
					</div>
					<div className="btnWrap">
						<a href="https://e.vivasam.com/samter/campaign/review/list?deviceMode=pc" className="btnReview" target="_blank">
							<img src="/images/events/2022/event220418/btn_review.png" alt="꿈지기 생생한 후기"/>
						</a>
						<button type="button" className="btnApply" onClick={this.eventApply}>
							<img src="/images/events/2022/event220418/btn_apply.png" alt="캠페인 참여하기"/>
						</button>
					</div>
				</div>


				<div className="evtCont04" style={{display: this.state.eventAnswerCount !== 0 ? 'block' : 'none'}}>
					<h2><img src="/images/events/2022/event220418/img4.png" alt="꿈 명함 신청 사연"/></h2>
					<div className="evtListWrap">
						<EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo}
						           StoryUpdateContents={this.state.StoryUpdateContents}/>
						<button className="btnMore"
						        style={{display: this.state.eventViewAddButton == 1 ? 'block' : 'none'}}
						        onClick={this.commentListAddAction}>더보기<span></span>
						</button>
					</div>
				</div>
			</section>
		)
	}
}

// 리스트 목록 UL 출력
const EventList = ({eventlists, loginInfo, StoryUpdateContents}) => {
	const eventList = eventlists.map(eventList => {
		return (<EventListApply {...eventList} loginInfo={loginInfo} StoryUpdateContents={StoryUpdateContents}/>);
	});
	return (
		<div className="evtList">
			{eventList}
		</div>
	);
};


class EventListApply extends Component {

	constructor(props) {
		super(props);
		this.state = {
			member_id: this.props.member_id, // 멤버 아이디
			event_id: this.props.event_id, // eventId
			event_answer_desc: this.props.event_answer_desc, // 응답문항
			reg_dttm: this.props.reg_dttm, // 등록일
			loginInfo: this.props.loginInfo, // 로그인 정보
			BaseActions: this.props.BaseActions, // BaseAction
			StoryUpdateContents: this.props.StoryUpdateContents, // 컨텐츠
			eventType: "", // 이벤트 타입
			eventName: "", // 이벤트 응모자
			eventRegDate: "", // 이벤트 등록일
			eventContents: "", // 이벤트 내용
			eventLength: "", // 이벤트 길이
		}
	}

	componentDidMount = () => {
		this.eventListApply();
	};

	eventListApply = () => { // 이벤트 표시 값 세팅

		let eventSetName = JSON.stringify(this.state.member_id).substring(1, 4) + "***"; // 이벤트 이름
		let eventSetRegDate = JSON.stringify(this.state.reg_dttm).replace(/\"/g, ""); // 이벤트 등록일
		let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
		let eventSetContents = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1); // 이벤트 내용

		eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
		eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');
		let eventSetContents2 = eventSetContents.split('^||^')[2];

		this.setState({
			eventName: eventSetName,
			eventRegDate: eventSetRegDate,
			eventContents2: eventSetContents2
		});

	};

	render() {
		return (
			<div className="listItem">
				<strong className="listTit">{this.state.eventName} 선생님</strong>
				<p className="txt" dangerouslySetInnerHTML={{__html: this.state.eventContents2}}></p>
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

