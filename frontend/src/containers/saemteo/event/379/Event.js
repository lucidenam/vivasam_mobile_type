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
		comment1: '',			// 1번이벤트
		commentLength1: 0,
		comment2: '',			// 2번이벤트
		commentLength2: 0,

		pageNo : 1, // 페이지
		pageSize : PAGE_SIZE, // 사이즈
		eventAnswerContents : [], // 이벤트 참여내용
		eventAnswerCount : 0, // 이벤트 참여자 수
		eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )

		realUrl: 'https://dn.vivasam.com',
		devUrl: 'https://dev.vivasam.com',
		pdfUrl: '',
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();

			await this.commentConstructorList();	// 댓글 목록 조회
			await this.checkEventCount();   		// 이벤트 참여자 수 조회

			let pdfUrl = '';
			if (window.location.href.indexOf('dev-me.vivasam.com') > -1 || window.location.href.indexOf('dev-mv.vivasam.com') > -1) {
				pdfUrl = this.state.devUrl + '/resources/file/아이들과 마음을 나누는 100가지 방법_대안교과서_마음.pdf';
			} else {
				pdfUrl = this.state.realUrl + '//VS/heart/event/아이들과 마음을 나누는 100가지 방법_대안교과서_마음.pdf';
			}
			this.setState({pdfUrl: pdfUrl});

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
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, eventAnswer, eventGiftCount, loginInfo} = this.props;
		const {isEventApply, comment1, comment2} = this.state;

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

		try {

			if (comment1.length < 1 && comment2.length < 1) {
				alert('1개 이상의 이벤트 내용을 입력해 주세요.');
				return;
			}

			const eventAnswer = {
				eventAnswerDesc1 : comment1,
				eventAnswerDesc2 : comment2
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

	setComment2 = (e) => {
		let comment = e.target.value;
		let commentLength = comment.length;

		if (commentLength >= 200) {
			comment = comment.substring(0, 200);
			commentLength = comment.length;
		}

		this.setState({
			comment2: comment,
			commentLength2: commentLength
		});
	};

	// 이벤트 참여자수 확인
	checkEventCount = async () => {
		const { SaemteoActions, eventId } = this.props;
		const params = {
			eventId: eventId,
			eventAnswerSeq: 2,
		};
		let response = await api.getEventAnswerListCntForTwoComment(params);

		this.setState({
			eventAnswerCount : response.data.eventAnswerCount
		});

		// 최초 조회시 전체건수가 10건이상이면 더보기 버튼 표시
		if(this.state.eventAnswerCount > PAGE_SIZE){
			this.setState({
				eventViewAddButton : 1
			});
		}
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

		const responseList =  await api.getEventAnswerListForTwoComment(params);
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

	render () {
		const { comment1, commentLength1, comment2, commentLength2, eventAnswerContents, eventAnswerCount, eventViewAddButton} = this.state;
		const moreCnt = eventAnswerCount - eventAnswerContents.length	// 남은 조회건수

		return (
			<section className="event379">
				<div className="evtCont01">
					<h1><img src="/images/events/2021/379/img01.png" alt="아이들과 마음을 나누는 100가지 방법" /></h1>
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
					{/*<a href={this.state.pdfUrl} target="_blank" className="btn_shop"><img src="/images/events/2021/379/btn_shop.png" alt="마음 자세히보기"/></a>*/}
					<p className="btn_shop_txt">* 교과서 마음은 PC 이벤트 페이지에서 미리보기 하실 수 있습니다.</p>
				</div>
				<div className="evtCont02">
					<div className="evtFormWrap">
						<h3 className="tit_heart1"><span className="blind">01</span></h3>
						<p className="subtext">
							대안 교과서 '마음'을 교실 안에서 활용할 수 있는<br/><span>선생님만의 좋은 아이디어</span>를 공유해 주세요!
						</p>
						<div className="event_gift">
							<p>'마음'1권 + 파리바게뜨 블루베리듬뿍 롤케익 <span>100명</span></p>
							<p>스타벅스 카페라떼 <span>100명</span></p>
						</div>
						<div className="evtTextareaWrap">
							<div className="evtTextarea">
										<textarea
											name="evtComment1"
											id="evtComment1"
											placeholder="선생님의'마음'활용법을 작성해주세요.(200자 이내)"
											value={comment1}
											onChange={ this.setComment1 }
											onFocus={ this.onFocusComment }
											maxLength="200"
										></textarea>
								<p className="count">(<span id="evtCommentTextCnt1">{ commentLength1 }</span> / 200)</p>
							</div>

						</div>

						<h3 className="tit_heart2"><span className="blind">02</span></h3>
						<p className="subtext">
							우리반 아이들과<span>'마음'을 나누고 싶은 이유</span>를 남겨주세요.<br/>총 10개의 학급에 '마음'을 선물합니다.
						</p>
						<div className="event_gift num2">
							<p>'마음'(학생수)+'마음카드'(5세트)<span>10개 학급</span></p>
							<p>스타벅스 달달한 내 마음 세트<span>100명</span></p>
						</div>
						<div className="evtTextareaWrap">
							<div className="evtTextarea">
										<textarea
											name="evtComment2"
											id="evtComment2"
											placeholder="'마음'을 나누고 싶은 이유를 작성해주세요.(200자 이내)'"
											value={comment2}
											onChange={ this.setComment2 }
											onFocus={ this.onFocusComment }
											maxLength="200"
										></textarea>
								<p className="count">(<span id="evtCommentTextCnt2">{ commentLength2 }</span> / 200)</p>
							</div>

						</div>

						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}><span className="blind">응모하기</span></button>
						</div>
						<div className="evtnotice">
							<h4>유의사항</h4>
							<p>1. 두가지 이벤트를 모두 참여하시거나, 하나를 선택하여 참여하셔도 됩니다.</p>
							<p>2. 경품은 중복제공하지 않습니다.</p>
							<p>3. 참여 완료 후에는 추가 참여가 어렵습니다.</p>
							<p>4. 정확한 주소를 기입해주세요.<br/>(학교 주소, 수령처 포함 : ex. 교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</p>
							<p>5. 주소 기재가 잘못되어 반송된 선물은 다시 발송해드리지 않습니다.</p>
						</div>
					</div>
				</div>
				<div className="evtCont03">
					<EventList eventlists={ eventAnswerContents } />
					<button type="button" className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
						더보기
						<i><img src="/images/events/2021/379/btnmore.png" alt="+"/></i>
					</button>
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