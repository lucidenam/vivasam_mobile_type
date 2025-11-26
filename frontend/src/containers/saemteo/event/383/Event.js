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
				pdfUrl = this.state.realUrl + '/VS/heart/event/아이들과 마음을 나누는 100가지 방법_대안교과서_마음.pdf';
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
			<section className="event383">
				<div className="evtCont01">
					<h1><img src="/images/events/2021/383/img01.png" alt="비바샘이랑 오늘부터 1일" /></h1>
					<div className="blind">
						<p>비바샘 카카오 채널을 구독하세요!<br/>비바샘과 친구가 된 기념으로 맛있는 선물을 증정합니다.</p>
						<p><span>이벤트기간</span><span>2021.11.18(목) ~ 12.22(수)</span></p>
						<p>카페라떼 마일드 100% 증정</p>
					</div>
					<div className="btnWrap"><a href="https://pf.kakao.com/_JUlsK" className="evtBtn" target="_blank"><span className="blind">비바샘 카카오톡 채널 바로가기</span></a></div>
				</div>
				<div className="evtCont02">
					<ul className="evtContWrap">
						<li class="evtConts01">
							<img src="/images/events/2021/383/img02.png" alt="STEP 1" />
							<div className="blind">
								<p>참여방법</p>
								<p>STEP 1</p>
								<p>카카오톡 검색창에 <span>비바샘</span>을 검색</p>
							</div>
						</li>
						<li class="evtConts02">
							<img src="/images/events/2021/383/img03.png" alt="STEP 2" />
							<div className="blind">
								<p>STEP 2</p>
								<p><span>비바샘</span> 채널추가</p>
							</div>
						</li>
						<li class="evtConts03">
							<img src="/images/events/2021/383/img04.png" alt="STEP 3" />
							<div className="blind">
								<p>STEP 3</p>
								<p>채팅창 아래</p>
								<p><span>비바샘이랑 오늘부터 1일</span> 클릭</p>
								<p><em>(네이버 폼에 개인 정보를 입력해주세요)</em></p>
								<p><span>개인정보란?</span> 성팜, 아이디, 재직학교, 휴대전화번호</p>
							</div>
						</li>
					</ul>
				</div>
				<div className="evtFooter">
					<div className="evtFooterWrap">
						<p>유의사항</p>
						<ul className="info">
							<li>1.  <span>비바샘 교사 인증까지 완료한 선생님에 한하여 경품이 증정됩니다. </span><br/>(비바샘의 개인정보와 이벤트 참여 정보가 다르면 경품 발송이 불가능합니다. 성함, 아이디, 재직학교, 휴대전화번호를 반드시 확인해주세요.)</li>
							<li>2.  경품은 매주 금요일 선생님의 휴대전화번호로 발송됩니다. (순차발송)</li>
							<li>3.  경품은 한 아이디 당 1회 지급됩니다. <span>(중복 지급 불가)</span></li>
							<li>4.  <span>채널 구독 해제 시 기프티콘이 발송 되지 않습니다.</span></li>
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