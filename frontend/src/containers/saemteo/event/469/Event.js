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
		isEventApply : false,	// 신청여부
		isEventApply2 : false,	// 신청여부
		eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
		eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/462',
		pageNo : 1, 				// 페이지
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



		return (
			<section className="event231004">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2023/event231004/evtTit.png" alt="내가 꿈꾸는 나의 교과서"/>
						<div className="blind">
							<h3>
								너의 목소리를 들려줘
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
						<div className="contInner">
							<div className="contTxt">
								<img src="/images/events/2023/event231004/cont1Txt.png" alt="수업소개"/>
								<div className="blind">
									<h4>선생님이 바라고 꿈꾸는 교과서는 무엇인가요? 자유롭게 의견을 남겨주세요.</h4>
									<p> 예) 학생들과 양방향 소통이 가능한 교과서였으면 좋겠어요! / 학생들과 게임처럼 놀고, 즐길 수 있는 교과서를 원해요!</p>
								</div>
							</div>
						</div>
					</div>

					<div className="cont cont2">
						<span className="evtBadge">
							<img src="/images/events/2023/event231004/cont2Tit.png" alt="참여 혜택" />
						</span>
						<div className="contInner">
							<div className="contTxt">
								<img src="/images/events/2023/event231004/cont2Txt.png" alt="참여 혜택"/>
								<div className="blind">
									<h4>학생들이 바라고 꿈꾸는 교과서는 무엇일까요? ​ QR 설문을 통해 학생이 참여할 수 있도록 도와주세요!​</h4>
									<p>예)  마음껏 색칠할 수 있는 교과서였으면 좋겠어요!​ 숙제도 재미있게 할 수 있는 교과서가 있으면 좋겠어요!​</p>
								</div>
							</div>
						</div>
						<button className="btnApply" onClick={this.eventApply}>
							<span className="blind">신청하기</span>
						</button>
					</div>
				</div>

				<div className="notice">
					<strong>유의사항</strong>
					<ul>
						<li>
							본 이벤트는 비바샘 교사인증을 완료한 선생님만 신청하실 수 있습니다.
						</li>
						<li>
							1인 1회 신청할 수 있습니다.​
						</li>
						<li>
							경품 발송을 위해 개인정보(성명, 휴대 전화번호)가 서비스사에 제공됩니다.<br />
							(주)다우기술 사업자등록번호: 220-81-02810
						</li>
						<li>
							개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.
						</li>
						<li>
							경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.
						</li>
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
		BaseActions: bindActionCreators(baseActions, dispatch),
	})
)(withRouter(Event));