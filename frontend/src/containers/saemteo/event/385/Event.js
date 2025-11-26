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

const PAGE_SIZE = 2;

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부
		comment1: '',			// 에피소드
		commentLength1: 0,
		emoji: '',				// 이모지
		arrContent: [false, false, false, false, false, false, false],

		pageNo : 1, // 페이지
		pageSize : PAGE_SIZE, // 사이즈
		eventAnswerContents : [], // 이벤트 참여내용
		eventAnswerCount : 0, // 이벤트 참여자 수

	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();

			await this.commentConstructorList();	// 댓글 목록 조회
			await this.checkEventCount();   		// 이벤트 참여자 수 조회

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

	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, eventAnswer, loginInfo} = this.props;
		const {isEventApply, comment1, emoji} = this.state;

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
			return;
		}

		// 기 신청 여부
		if(isEventApply){
			common.error("이미 신청하셨습니다.");
			return;
		}

		if(emoji == '') {
			common.info("이모지를 선택해 주세요.");
			return;
		}

		if (comment1.length < 1 || comment1.length > 200) {
			common.info('에피소드를 입력해 주세요.');
			return;
		}

		if (this.state.agreeCheck == 0) {
			common.info('필수 동의 선택 후 이벤트 신청을 완료해주세요.');
			return;
		}

		try {

			const eventAnswer = {
				eventAnswerDesc1 : emoji,
				eventAnswerDesc2 : comment1
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

	onFocusComment = (e) => {
		const { logged, history, BaseActions , loginInfo} = this.props;
		const {isEventApply} = this.state;
		if(!logged){ // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
			history.push("/login");
			document.activeElement.blur();
		}
		// 교사 인증
		else if(loginInfo.certifyCheck === 'N'){
			BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			document.activeElement.blur();
		}
		// 준회원일 경우 신청 안됨.
		else if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			document.activeElement.blur();
		}
		// 기 신청 여부
		else if(isEventApply){
			common.error("이미 신청하셨습니다.");
			document.activeElement.blur();
		}
	}

	setComment1 = (e) => {
		let comment = e.target.value;
		let commentLength = comment.length;

		if (commentLength >= 200) {
			comment = comment.substring(0, 200);
			commentLength = comment.length;
		}

		this.setState({
			comment1: comment,
			commentLength1: commentLength
		});
	};

	contentOnClick = (index, e) => {
		const { logged, history, BaseActions , loginInfo} = this.props;
		const {isEventApply} = this.state;

		if(!logged){ // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
			history.push("/login");
			document.activeElement.blur();
		}
		// 교사 인증
		else if(loginInfo.certifyCheck === 'N'){
			BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			document.activeElement.blur();
		}
		// 준회원일 경우 신청 안됨.
		else if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			document.activeElement.blur();
		}
		// 기 신청 여부
		else if(isEventApply){
			common.error("이미 신청하셨습니다.");
			document.activeElement.blur();
		}

		let arrContent = [false, false, false, false, false, false, false];
		arrContent[index] = true;
		this.setState({
			arrContent: arrContent,
			emoji: e.target.value
		});
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
		const { SaemteoActions, eventId } = this.props;
		const params = {
			eventId: eventId
		};
		let response = await SaemteoActions.checkEventTotalJoin(params);

		this.setState({
			eventAnswerCount : response.data.eventAnswerCount
		});


	};
	// 댓글 출력
	commentConstructorList = async () => {
		const { eventId } = this.props;
		const {pageNo, pageSize} = this.state;

		const params = {
			eventId: eventId,
			eventAnswerSeq: 2,
			answerPage : {
				pageNo: pageNo,
				pageSize: pageSize
			}
		};

		const responseList =  await api.getEventAnswerList(params);
		let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

		// 조회가 완료되면 다음 조회할 건수 설정
		this.setState({
			eventAnswerContents : eventJoinAnswerList
		});

	};

	render () {
		const { comment1, commentLength1, eventAnswerContents, eventAnswerCount, pageSize, pageNo} = this.state;

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
			for(let i=startPageInScreen;i<=endPageInScreen;i++) {
				result.push(<li><a href="javascript:void(0);" className={curPage === i ? 'on' : ''} onClick={() => {this.handleClickPage(i)}}>{i}</a></li>)
			}
			return result;
		}
		// 댓글
		const eventList = eventAnswerContents.map(eventList => {
			const result = <EventListApply {...eventList} key={eventList.event_answer_id}/>;
			return result;
		});
		// 댓글창 좌/우 타입
		const commentType = (curPage % 2 == 1) ? 'type01' : 'type02';

		return (
			<section className="event385">
				<div className="evtCont01">
					<h1><img src="/images/events/2021/event211215/img01.png" alt="2021년, 기억을 걷는 시간" /></h1>
					<div className="blind">
						<p>비바샘 교단 일기장 2021년, 기억을 걷는 시간</p>
						<p>원격 수업, 등교 수업, 방역으로 올해 바쁜 시간을 보내셨을 전국의 선생님,웃고 울었던 선생님 만의 에피소드가 있으신가요?</p>
						<p>2021년을 돌아보며 각자 기억에 남는 에피소드를 공유해 주세요!비바샘 교단 일기장이 선생님의 기억을 담아냅니다.</p>
						<p>참여기간 2021년 12월 15일 ~ 12월 28일</p>
						<p>당첨자 발표 2021년 12월 30일</p>
					</div>
					<div className="evtBg"></div>
				</div>
				<div className="evtCont02">
					<div className="productWrap">
						<p className="tit">당첨 선물</p>
						<div className="product">
							<img src="/images/events/2021/event211215/img03.png" alt="당첨선물" />
						</div>
						<ul className="blind">
							<li>
								<div className="txtWrap">
									<p>베스트 에피소드 <span>(10명)</span></p>
									<p className="txt">파리바게뜨 스노우 화이트 치즈케이크</p>
								</div>
							</li>
							<li>
								<div className="txtWrap">
									<p>원더풀 에피소드  <span>(20명)</span></p>
									<p className="txt">스타벅스 부드러운 디저트 세트</p>
								</div>
							</li>
							<li>
								<div className="txtWrap">
									<p>참여상  <span>(100명)</span></p>
									<p className="txt">맥도날드 베이컨 에그 맥머핀 세트</p>
								</div>
							</li>
						</ul>
					</div>
					<div className="evtFormWrap">
						<div className="evtInputWrap">
							<p className="txt">선생님의 에피소드에 어울리는 <span>이모지</span>를 선택해 주세요.</p>
								<ul>
									<li className="emoji1">
										<input type="radio" id="emoji1" name="emoji" value="emoji1"
											   checked={this.state.arrContent[0]} onChange={this.contentOnClick.bind(this, 0)} />
										<label htmlFor="emoji1"></label>
									</li>
									<li className="emoji2">
										<input type="radio" id="emoji2" name="emoji" value="emoji2"
											   checked={this.state.arrContent[1]} onChange={this.contentOnClick.bind(this, 1)} />
										<label htmlFor="emoji2"></label>
									</li>
									<li className="emoji3">
										<input type="radio" id="emoji3" name="emoji" value="emoji3"
											   checked={this.state.arrContent[2]} onChange={this.contentOnClick.bind(this, 2)} />
										<label htmlFor="emoji3"></label>
									</li>
									<li className="emoji4">
										<input type="radio" id="emoji4" name="emoji" value="emoji4"
											   checked={this.state.arrContent[3]} onChange={this.contentOnClick.bind(this, 3)} />
										<label htmlFor="emoji4"></label>
									</li>
									<li className="emoji5">
										<input type="radio" id="emoji5" name="emoji" value="emoji5"
											   checked={this.state.arrContent[4]} onChange={this.contentOnClick.bind(this, 4)} />
										<label htmlFor="emoji5"></label>
									</li>
									<li className="emoji6">
										<input type="radio" id="emoji6" name="emoji" value="emoji6"
											   checked={this.state.arrContent[5]} onChange={this.contentOnClick.bind(this, 5)} />
										<label htmlFor="emoji6"></label>
									</li>
									<li className="emoji7">
										<input type="radio" id="emoji7" name="emoji" value="emoji7"
											   checked={this.state.arrContent[6]} onChange={this.contentOnClick.bind(this, 6)} />
										<label htmlFor="emoji7"></label>
									</li>
								</ul>
							</div>
						<div className="evtTextareaWrap">
							<p className='txt'>비바샘 교단 일기장에 선생님의 에피소드를 공유해 주세요.</p>
							<div className="evtTextarea">
										<textarea
											name="evtComment1"
											id="evtComment1"
											placeholder="에피소드를 입력해 주세요.(200자 이내)"
											value={comment1}
											onChange={ this.setComment1 }
											onFocus={ this.onFocusComment }
											maxLength="200"
										></textarea>
								<p className="count"><span id="evtCommentTextCnt1">{ commentLength1 }</span> / 200</p>
							</div>

						</div>
					</div>
					<div className="evtnotice">
						<h4>유의사항</h4>
						<p>1.  1인 1회 참여하실 수 있습니다.</p>
						<p>2.  참여 완료 후에는 수정 및 추가 참여가 어렵습니다.</p>
						<p>3.  경품은 중복 제공하지 않습니다.</p>
						<p>4.  유효기간이 지난 기프티콘은 다시 발송해 드리지 않습니다.</p>
					</div>
					<div className="btnWrap">
						<button type="button" className="btnApply" onClick={this.eventApply}><span className="blind">응모하기</span></button>
					</div>
				</div>
				{eventAnswerCount > 0 &&
					<div className="evtCont03">
						<div className={'evtList ' + commentType}>
							{eventList}
							{eventAnswerContents.length == 1 &&
							<div className="listItem"></div>
							}
						</div>
						{curPage > 1 &&
						<button className="replyBtn prev" onClick={() => {
							this.handleClickPage(curPage - 1)
						}}></button>
						}
						{curPage < totalPage &&
						<button className="replyBtn next" onClick={() => {
							this.handleClickPage(curPage + 1)
						}}></button>
						}
						<div className="paging ty2">
							<ul>
								{startPageInScreen > 1 &&
								<li><a href="javascript:void(0);" className="first" onClick={() => {
									this.handleClickPage(1)
								}}>처음</a></li>
								}
								{startPageInScreen > 1 &&
								<li><a href="javascript:void(0);" className="prev" onClick={() => {
									this.handleClickPage(startPageInScreen - 1)
								}}>이전</a></li>
								}
								{pageList()}
								{endPageInScreen < totalPage &&
								<li><a href="javascript:void(0);" className="next" onClick={() => {
									this.handleClickPage(endPageInScreen + 1)
								}}>다음</a></li>
								}
								{endPageInScreen < totalPage &&
								<li><a href="javascript:void(0);" className="last" onClick={() => {
									this.handleClickPage(totalPage)
								}}>마지막</a></li>
								}
							</ul>
						</div>
					</div>
				}
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
			event_answer_no : this.props.event_answer_no,	// 이벤트 참여 항목
			reg_dttm : this.props.reg_dttm, // 등록일
			BaseActions : this.props.BaseActions, // BaseAction
			eventType : "", // 이벤트 타입
			eventName : "", // 이벤트 응모자
			eventRegDate : "", // 이벤트 등록일
			eventEmoji : "", // 이벤트 이모지
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
		let eventSetEmoji = answers[0]; // 이모지
		let eventSetContents = answers[1]; // 이벤트 내용

		eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
		eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

		this.setState({
			eventName : eventSetName,
			eventEmoji : eventSetEmoji,
			eventContents : eventSetContents,
		});
	};

	render () {
		return (
			<div className="listItem">
				<div className={"eventtype " + (this.state.eventEmoji)} >
					<strong className="user">{this.state.eventName} 선생님의 기억을 걷는 시간</strong>
				</div>
				<div className="txt">
					<p dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>
				</div>
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