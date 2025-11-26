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

const PAGE_SIZE = 4;

class Event extends Component{
	state = {
		isEventApply: false,    	// 신청여부
		comment1: '',				// 이벤트1 댓글
		checkEvent1: 0,				// 이벤트1 체크 여부 ( 0 : 미참 / 1 : 참여 )
		checkEvent2: 0,				// 이벤트2 체크 여부 ( 0 : 미참 / 1 : 참여 )

		pageNo : 1, 				// 페이지
		pageSize : PAGE_SIZE, 		// 사이즈
		eventAnswerContents : [],	// 이벤트 참여내용
		eventAnswerCount : 0,		// 이벤트 참여자 수
		eventViewAddButton : 0,		// 더보기 ( 1 : 보임 / 0 : 안보임 )
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();

			await this.checkEventCount();   		// 이벤트 참여자 수 조회
			await this.commentConstructorList();	// 댓글 목록 조회
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

	// 전제 조건
	prerequisite = () => {
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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
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
	eventApply = async () => {
		const {SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const {comment1, checkEvent1, checkEvent2} = this.state;

		if (!this.prerequisite()) {
			return;
		}

		// 어느 하나라도 신청하지 않거나
		// 이벤트1을 체크하고 아무런 값을 입력하지 않거나
		// 값을 입력하고 이벤트1을 체크 해제한 경우
		if (!(checkEvent1 || checkEvent2)
			|| (checkEvent1 && (comment1.length < 1 || "" === comment1.trim()))
			|| (!checkEvent1 && comment1.length > 0)) {
			common.info('단어 입력 또는 스트랩 신청을 선택해 주세요.');
			return;
		}

		try {
			const eventAnswer = {
				eventAnswerDesc: comment1,
				checkEvent1: checkEvent1,
				checkEvent2: checkEvent2,
				memberId: loginInfo.memberId,
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

	onFocusComment = () => {
		if (!this.prerequisite()) {
			document.activeElement.blur();
		}
	}

	setComment = (e) => {
		let comment = e.target.value;
		let commentLength = comment.length;
		let checkEvent;

		if (commentLength === 0) {
			checkEvent = 0;
		} else {
			checkEvent = 1;
		}

		if (commentLength >= 10) {
			comment = comment.substring(0, 10);
		}

		this.setState({
			comment1: comment,
			checkEvent1: checkEvent,
		});
	};

	handleChange = (e) => {
		let {checkEvent1, checkEvent2} = this.state;

		if (e.target.checked) {
			if (e.target.name === 'checkEvent1') {
				checkEvent1 = 1;
			} else {
				checkEvent2 = 1;
			}
		} else {
			if (e.target.name === 'checkEvent1') {
				checkEvent1 = 0;
			} else {
				checkEvent2 = 0;
			}
		}

		this.setState({
			checkEvent1: checkEvent1,
			checkEvent2: checkEvent2,
		});
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
		const {eventId} = this.props;
		const params = {
			eventId: eventId,
			eventAnswerSeq: 2,
			answerIndex: 1
		};
		let response = await api.getSpecificEventAnswerCount(params);

		this.setState({
			eventAnswerCount : response.data.eventAnswerCount
		});
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
			},
			answerIndex: 1
		};
		
		const responseList =  await api.getSpecificEventAnswerList(params);
		let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

		// 조회가 완료되면 다음 조회할 건수 설정
		this.setState({
			eventAnswerContents : eventJoinAnswerList,
		});
	};

	render() {
		const {comment1, eventAnswerContents, checkEvent1, checkEvent2, eventAnswerCount, pageNo, pageSize} = this.state;

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
				result.push(<li>
					<button className={curPage === i ? 'on' : ''} onClick={() => {
						this.handleClickPage(i)
					}}>{i}</button>
				</li>)
			}
			return result;
		}
		// 댓글
		const eventList = eventAnswerContents.map(eventList => {
			const result = <EventListApply {...eventList} key={eventList.event_answer_id}/>;
			return result;
		});

		return (
			<section className="event220211">
				<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
				<div className="evtCont01">
					<div className="cont1_top">
						<span className="evt_top">VISANG + 한해 1탄</span>
						<h1>비상한 선생님 비상한 우리반</h1>
						<p className="txt">VISANG과의 한해를 시작할 준비가 되셨나요? <br/> 따뜻한 봄을 기다리며,<br/> 비바샘이 선생님과 우리반을 위한 신학기 선물을
							준비합니다.</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span><span className="txt">2022년 2월 11일 ~ 2월 28일</span></li>
							<li><span className="tit">당첨자 발표</span><span className="txt">2022년 3월 7일</span></li>
						</ul>
					</div>
				</div>
				<div className="evtBg">
					<div className="evtCont02">
						<div className="visangTeacher">
							비상한 선생님
							<h2 className="teacherTit">'visang', '비상'이 들어간 아이디어 넘치는 단어를 남겨주세요!</h2>
							<p className="txt">비상다움, 비상식량, Only VISANG등 선생님들의 아이디어가 또 하나의 선물로 탄생합니다.</p>
							<ul className='cont02List'>
								<li>
									<h3>아이디어맨(3명)</h3>
									<p>신세계 모바일 상품권(50,000원)</p>
								</li>
								<li>
									<h3>지치만점상(10명)</h3>
									<p>SIRO SUPVAN 라벨 프린터</p>
								</li>
								<li>
									<h3>도전만점상(50명)</h3>
									<p>스타벅스 카페 라떼T</p>
								</li>
								<li>
									<h3>선물의 탄생(5명)</h3>
									<p>남겨주신 단어에 딱 맞는 선물을 보내드려요!</p>
								</li>
							</ul>
							<div id="evtCreate">
								<input
									type="checkbox"
									name="checkEvent1"
									id="join_create01"
									checked={checkEvent1}
									onChange={this.handleChange}/>
								<label
									htmlFor="join_create01">
									'VISANG' 혹은 '비상'이 들어간 단어를 만들어 주세요!
								</label>
								<div className='createWord'>
									<input
										type="text"
										placeholder="(10자 이내)"
										value={comment1}
										onFocus={this.onFocusComment}
										onChange={this.setComment}
										className={(checkEvent1 === 1 ? 'on' : '')}/>{/*on 클래스들어갈시 강조 스타일로 변경*/}
								</div>
							</div>
							{eventAnswerCount > 0 &&
							<div className="comentList">
								<div className="listItemWrap">
									<ul>
										<li>
											{eventList}
										</li>
									</ul>
									{curPage > 1 &&
									<button className="pagePrev" onClick={() => {
										this.handleClickPage(curPage - 1)
									}}></button>
									}
									{curPage < totalPage &&
									<button className="pageNext" onClick={() => {
										this.handleClickPage(curPage + 1)
									}}></button>
									}
								</div>
								<div className="pagerWrap">
									{startPageInScreen > 1 &&
									<button className="prevAll" onClick={() => {
										this.handleClickPage(1)
									}}>
									</button>
									}
									{startPageInScreen > 1 &&
									<button className="prev" onClick={() => {
										this.handleClickPage(startPageInScreen - 1)
									}}>
									</button>
									}
									<ul>
										{pageList()}
									</ul>
									{endPageInScreen < totalPage &&
									<button className="next" onClick={() => {
										this.handleClickPage(endPageInScreen + 1)
									}}>
									</button>
									}
									{endPageInScreen < totalPage &&
									<button className="nextAll" onClick={() => {
										this.handleClickPage(totalPage)
									}}>
									</button>
									}
								</div>
							</div>
							}
							{/*<div className="comentList">*/}
							{/*	<div className="listItemWrap">*/}
							{/*		<ul>*/}
							{/*			<li>*/}
							{/*				<div className="listItem">*/}
							{/*					<div className="listTit">*/}
							{/*						<span className="user">{ this.state.eventName } 선생님</span>*/}
							{/*						<p>비상다움이비상다움이</p>*/}
							{/*					</div>*/}
							{/*					<p className="listTxt" dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>*/}
							{/*				</div>*/}
							{/*				<div className="listItem">*/}
							{/*					<div className="listTit">*/}
							{/*						<span className="user">{ this.state.eventName } 선생님</span>*/}
							{/*					</div>*/}
							{/*					<p className="listTxt" dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>*/}
							{/*				</div>*/}
							{/*				<div className="listItem">*/}
							{/*					<div className="listTit">*/}
							{/*						<span className="user">{ this.state.eventName } 선생님</span>*/}
							{/*					</div>*/}
							{/*					<p className="listTxt" dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>*/}
							{/*				</div>*/}
							{/*				<div className="listItem">*/}
							{/*					<div className="listTit">*/}
							{/*						<span className="user">{ this.state.eventName } 선생님</span>*/}
							{/*					</div>*/}
							{/*					<p className="listTxt" dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>*/}
							{/*				</div>*/}
							{/*			</li>*/}
							{/*		</ul>*/}
							{/*		<button className="pagePrev">이전</button>*/}
							{/*		<button className="pageNext">다음</button>*/}
							{/*	</div>*/}
							{/*	<div className="pagerWrap">*/}
							{/*		<button className="prevAll">마지막</button>*/}
							{/*		<button className="prev">이전</button>*/}
							{/*		<ul>*/}
							{/*			<li><button className="on">1</button></li>*/}
							{/*			<li><button>2</button></li>*/}
							{/*			<li><button>3</button></li>*/}
							{/*			<li><button>4</button></li>*/}
							{/*			<li><button>5</button></li>*/}
							{/*		</ul>*/}
							{/*		<button className="next">다음</button>*/}
							{/*		<button className="nextAll">마지막</button>*/}
							{/*	</div>*/}
							{/*</div>*/}
						</div>
					</div>
					<div className="evtCont03">
						<div className="visangClass">
							비상한 우리반
							<h2 className="teacherTit">우리반 아이들을 위한 단 하나뿐인 마스크 스트랩을 선물합니다.</h2>
							<p className="txt">당첨 선물:<span className="color1"> 30개 학급</span>/학급 학생 전원에게 마스크 스트랩 증정</p>
							<ul className='cont03List'>
								<li>
									<p>메세지는 20자 이내로!디자인은 상의하여 제작합니다.</p>
								</li>
								<li>
									<p>재활용 PET로 만들어진 친환경 섬유, RPET 폴리에스테르로 제작합니다.</p>
								</li>
								<li>
									<p>선정되신 경우, 신청 시 기입하신 학생수를 변경하실 수 없습니다.</p>
								</li>
								<li>
									<p>스트랩 제작은 디자인 포합하여 약 2주 소요됩니다.</p>
								</li>
							</ul>
							<div className="evtMask">
								<input
									type="checkbox"
									name="checkEvent2"
									checked={checkEvent2}
									onChange={this.handleChange}
									id="Mask01"/>
								<label
									htmlFor="Mask01">
									<span>우리반 마스크 스트랩 신청하기</span>
								</label>
							</div>
						</div>
					</div>
					<button className="evtBtn" onClick={this.eventApply}>
						<span>
							참여하기
						</span>
					</button>
				</div>
				<div className="notice">
					<span className="noticeTit">유의사항</span>
					<ul>
						<li>
							<span className="list_num">1.</span> 01이벤트와 02이벤트 중 한가지만 참여하거나,<br/>
							두가지 모두 참여하실 수 있습니다.
						</li>
						<li>
							<span className="list_num">2.</span> 각 이벤트는 1인 1회 참여하실 수 있습니다.
						</li>
						<li>
							<span className="list_num">3.</span> 참여 완료 후에는 수정 및 삭제가 어렵습니다.
						</li>
						<li>
							<span className="list_num">4.</span> 01이벤트와 02이벤트의 경품은 중복 제공하지 않습니다.
						</li>
						<li>
							<span className="list_num">5.</span> 유효기간이 지난 기프티콘, 주소가 잘못되어 반송된 선물은<br/>
							다시 발송해 드리지 않습니다.
						</li>
						<li>
							<span className="list_num">6.</span> 선물 발송을 위해 서비스/배송 업체에 개인정보<br/>
							(이름, 휴대전화번호, 학교주소)가 제공됩니다.<br/>
							((주)다우기술 사업자등록번호 220-81-02810)<br/>
							((주)한진 사업자등록번호 201-81-02823)
						</li>
					</ul>
				</div>
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
        eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

        this.setState({
			eventName : eventSetName,
			eventContents : eventSetContents,
        });
    };

    render(){
        return (
            <div className="listItem">
                <div className="listTit">
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