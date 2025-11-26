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
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";


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
			<section className="event231103">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2023/event231103/evtTit.png" alt="내가 꿈꾸는 나의 교과서"/>
						<div className="blind">
							<h3>
								우리의 교과서 '우리'의 교실 이벤트​
							</h3>
							<p>
								운동장, 교과서, 친구, 선생님.​
								우리가 함께 웃고 배우고 지내는 교실, 학교에서 있었던 ​
								다양한 이야기를 들려주세요!​
								비바샘이 선생님의 이야기를 작가님과 함께 *인스타툰으로 만들어 드립니다.​ ​
							</p>
							<span>
								*인스타툰이란? 인스타그램에서 공유되는 웹툰 또는 디지털 만화​
							</span>
							<div className="evtPeriod">
								<div className="blind">
									<div><span className="tit blind">참여 기간​</span><span className="txt"><span className="blind">2023.11.3.(금) ~ 2023.11.24.(금)​</span></span></div>
									<div><span className="tit blind">당첨자 발표​</span><span className="txt"><span className="blind">2023.11.29.(수) *비바샘 공지사항에서 확인하실 수 있습니다.​</span></span><em>*비바샘 공지사항에서 확인하실 수 있습니다.</em></div>
									<div><span className="tit blind">인스타툰 게시 일정​</span><span className="txt"><span className="blind">12월 1주~12월 4주(주 1회, 총 4편)​ *비바샘 공식 인스타그램 게시 @vivasam_official​</span></span></div>
								</div>
							</div>
						</div>
					</div>

					<div className="evtGift">
						<img src="/images/events/2023/event231103/evtGift.png" alt="참여선물"/>
							<ul className="blind">
								<li>
									<div className="blind">
										<h4>기록하는 이야기</h4>
										<p>LAMY 만년필+카트리지 세트​</p>
										<span>선정 사연 ​대상자​ 4명​</span>
									</div>
								</li>
								<li>
									<div className="blind">
										<h4>행복한 이야기​</h4>
										<p>배달의민족 상품권 ​1만원권​</p>
										<span>추첨 50명</span>
									</div>
								</li>
								<li>
									<div className="blind">
										<h4>따뜻한 이야기​</h4>
										<p>스타벅스 카페라떼(T)​</p>
										<span>추첨​ 100명</span>
									</div>
								</li>
							</ul>
					</div>
				</div>

				<div className="evtCont2">
					<div className="cont cont1">
						<span className="evtBadge">
							<img src="/images/events/2023/event231103/evtBadge.png" alt="함께하는 작가 소개" />
						</span>
						<div className="contInner">
							<div className="contTxt">
								<img src="/images/events/2023/event231103/evtCont.png" alt="참여 혜택"/>
								<div className="blind">
									<span>방구빵빵(@bg_bb)​</span>
									<ul className="info">
										<li>한국예술종합학교 애니메이션과 졸업 ​</li>
										<li>인스타그램 빵빵이의 일상만화/유튜브 채널 일상애니 방구빵빵 ​</li>
										<li>단편 애니메이션 [컬투쇼 할아버지와 손녀], [자다깨서 마신우유] 감독 ​</li>
										<li>웨이브, 인디그라운드 독립영화 라이브러리 [고래의 티타임] 감독​</li>
									</ul>

									<ul className="notice">
										<li>① 개인정보보호를 위해 사연에 등장하는 학교명, 이름 등의 정보는 ​가명 표기 또는 제외하고 제작 될 예정입니다.​</li>
										<li>② 최대 10컷으로 제작된 인스타툰은 비바샘 인스타그램에 게시되며, 기업의 홍보를 위해 사용될 수 있습니다.​</li>
										<li>③ 제작된 인스타툰 파일은 게시 완료 후 사연 대상 선생님께만 별도 전달 드립니다.​</li>
									</ul>
								</div>
								<div className="profile_btn">
									<a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.instagram.com/bg_bb_/')} className="btnInstagram">
										<img src="/images/events/2023/event231103/btnInstagram.png" alt="작가 소개"/><span className="blind">인스타그램 구경가기</span>
									</a>
									<a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.youtube.com/channel/UCOkS5_DFvlhkY-WqtiakDAw?app=desktop')} className="btnYouTube">
										<img src="/images/events/2023/event231103/btnYoutube.png" alt="작가 소개"/> <span className="blind">유튜브 구경가기</span>
									</a>
								</div>
							</div>
						</div>
						<button className="btnApply" onClick={this.eventApply}>
							<img src="/images/events/2023/event231103/btnApply.png" alt="작가 소개"/>
							<span className="blind">참여하기</span>
						</button>
					</div>
				</div>

				<div className="notice">
					<strong>유의사항</strong>
					<ul>
						<li>본 이벤트는 비바샘 교사인증을 완료한 학교 선생님만 신청하실 수 있습니다. </li>
						<li>1인 1회 신청할 수 있습니다.</li>
						<li>
							경품 발송을 위해 개인정보(이름, 휴대전화번호)가 서비스사에 제공됩니다.<br />
							㈜다우기술 사업자등록번호: 220-81-02810<br />
							㈜카카오 사업자등록번호:  120-81-47521
							​</li>
						<li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
						<li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
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