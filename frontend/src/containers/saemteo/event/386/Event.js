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

// 한페이지에 조회수
const PAGE_SIZE = 10;

class Event extends Component{
	state = {
		isEventApply: false,    // 신청여부
		comment1: '',			// 이유
		commentLength1: 0,
		keyword: '',			// 키워드

		pageNo : 1, // 페이지
		pageSize : PAGE_SIZE, // 사이즈
		eventAnswerContents : [], // 이벤트 참여내용
		eventAnswerCount : 0, // 이벤트 참여자 수
		eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )

	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();

			await this.commentConstructorList(); // 댓글 목록 조회
			await this.checkEventCount();   // 이벤트 참여자 수 조회

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
		const { logged, eventId } = this.props;
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
		const { logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const { isEventApply, comment1, keyword } = this.state;

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

		if(keyword == '') {
			common.info("선생님이 바라는 福을 입력해 주세요.");
			return;
		}

		if(keyword.length > 5) {
			common.info("선생님이 바라는 福은 최대 5글자까지 입력해 주세요.");
			return;
		}

		if (comment1.length < 1 || comment1.length > 100) {
			common.info('이유를 입력해 주세요.');
			return;
		}

		if (this.state.agreeCheck == 0) {
			common.info('필수 동의 선택 후 이벤트 신청을 완료해주세요.');
			return;
		}

		try {
			const eventAnswer = {
				eventAnswerDesc1 : keyword,
				eventAnswerDesc2 : comment1
			};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

			handleClick(eventId);    // 신청정보 팝업으로 이동

		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(()=>{
			}, 1000);//의도적 지연.
		}
	}

	handleChangeKeyword = (e) => {
		let val = e.target.value;
		if(val.length > 5) {
			common.info("최대 5글자까지 입력 가능합니다.");
			val = val.substring(0, 5);
		}
		this.setState({
			keyword: val
		});
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

	setComment = (e) => {
		let comment = e.target.value;
		let commentLength = comment.length;

		if (commentLength >= 100) {
			comment = comment.substring(0, 100);
			commentLength = comment.length;
		}

		this.setState({
			comment1: comment,
			commentLength1: commentLength
		});
	};

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

		const responseList =  await api.getEventAnswerList(params);
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
	
	formatNumberWithComma = (num) => {
		return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	}

	render () {

		const { comment1, commentLength1, keyword, eventAnswerContents, eventAnswerCount, eventViewAddButton} = this.state;

		return (
			<section className="event220106">
				<div className="evtCont01">
					<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
					<h1><img src="/images/events/2022/event220106/bg_tit.png" alt="2022년, 선생님의 福이 가득하기를!" /></h1>
					<div className="evtNoti">
						<p className="txt">선생님, 올해에는 어떤 福이 가득하기를 바라시나요?</p>
						<p className="txt">인복, 먹을 복, 연인 복 무엇이든!<br />선생님이 바라는 福과 이유를 작성해 주세요.</p>
						<p className="txt">도전적이면서도 낙천적인 호랑이 기운을 가득 담아<br />비바샘이 선생님의 건강과 福을 기원하는 선물을 보내드립니다.<br />새해 복 많이 받으세요!</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span><span className="txt">2022년 01월 06일 ~ 01월 31일</span></li>
							<li><span className="tit">당첨자 발표</span><span className="txt">2022년 02월 09일</span></li>
						</ul>
						<div className="evtGift">
							<span className="tit">당첨선물</span>
							<ul>
								<li>
									<p className="giftTit">에너지 듬뿍 건강상 <span>(5명)</span></p>
									<p>정관장 모바일 금액 상품권 5만 원권</p>
								</li>
								<li>
									<p className="giftTit">용기 충만 도전상 <span>(20명)</span></p>
									<p>BHC 후라이드 반+양념 반+콜라1.25L</p>
								</li>
								<li>
									<p className="giftTit">자신감 충만 여유상 <span>(50명)</span></p>
									<p>스타벅스 따뜻한 카라멜 마키아또 Tall</p>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="evtCont02">
					<div className="evtFormWrap">
						<div className="formItem">
							<div className="formTit">
								<span className="blind">2022년</span>
								<span className="evtInput square">
									<input type="text"
										   id="ipt_keyword"
										   name="keyword"
										   onChange={this.handleChangeKeyword}
										   value={keyword}/>
								</span>
								<span className="blind">福이 가득하기를!</span>
							</div>
							<div className="evtTextareaWrap">
								<textarea 
									name="applyContent1" 
									id="applyContent1" 
									placeholder="이유를 적어주세요. (100자 이내)"
									value={ comment1 }
									onChange={ (e) => this.setComment(e) }
									onFocus={ this.onFocusComment }
									maxlength="100"
								></textarea>
								<p className="count"><span className="reasonCount">{ commentLength1 }</span>/100</p>
							</div>
						</div>
						<div className="formTip">
							<strong>유의 사항</strong>
							<ul>
								<li>1. 1인 1회 참여하실 수 있습니다.</li>
								<li>2. 참여 완료 후에는 수정 및 추가 참여가 어렵습니다.</li>
								<li>3. 경품은 중복 제공하지 않습니다.</li>
								<li>4. 유효기간이 지난 기프티콘은 다시 발송해 드리지 않습니다.</li>
							</ul>
						</div>
						<div className="btnWrap">
							<button type="button" onClick={ this.eventApply } className="btnApply">참여하기</button>
						</div>
					</div>
				</div>
				<div className="evtCont03">
					<div className="evtListWrap">
						<EventList eventlists={ eventAnswerContents } />
						<button type="button" className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>더보기</button>
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
        return (<EventListApply {...eventList} key={eventList.member_id}/>);
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
		let eventSetKeyword = answers[0]; // 키워드
		let eventSetContents = answers[1]; // 이벤트 내용

		eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
		eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

		this.setState({
			eventName : eventSetName,
			eventKeyword : eventSetKeyword,
			eventContents : eventSetContents,
		});
	};

	render(){
		return (
			<div className="listItem">
				<div className="listTit">
					<span className="square">{this.state.eventKeyword}</span>
					<span className="user">{ this.state.eventName } 선생님</span>
				</div>
				<p className="listTxt" dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>
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
		BaseActions: bindActionCreators(baseActions, dispatch),
	})
)(withRouter(Event));