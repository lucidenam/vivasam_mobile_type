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

const PAGE_SIZE = 10;

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부

		chkAllAmountFull: true,       // 전체 경품 소진여부
		todayAmountFull: [true, true, true, true],      // 경품 소진 여부

	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.eventAmountCheck();
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

	// 모든 경품 소진 여부
	eventAmountCheck = async() => {
		const { SaemteoActions, eventId } = this.props;

		let params1 = {
			eventId: eventId
		};
		let chkAllAmountFull = true;
		let amount_3 = true;

		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;

			amount_3 = responseData['qntCnt_3'] <= 0;
			chkAllAmountFull = amount_3;
		} catch (e) {
			console.log(e);
		}

		this.setState({
			chkAllAmountFull: chkAllAmountFull
		});
	}

	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, eventAnswer, eventGiftCount, loginInfo} = this.props;
		const {chkAllAmountFull, todayAmountFull, isEventApply} = this.state;

		// 경품 소진
		if (chkAllAmountFull) {
			common.info("이벤트 기간이 아니거나 종료된 이벤트입니다.");
			return false;
		}

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

			const eventAnswer = {};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

			handleClick(eventId);	// 신청정보 팝업으로 이동

		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}

	};


	render () {

		return (
			<section className="event424">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event221212/cont01.png" alt="ABM 영어 교육 전문가 자격증 과정 이벤트" /></h1>
					<div className="blind">
						<p>ABM 영어교육 전문가 자격증 과정은 국내·외 유일한 AI, Big Data, Metaverse 영어교육 전문가 양성 프로그램으로 인공지능 등의 최신 기술을 영어교육 현장에 응용해보는 실습 중심의 온라인 자격증 과정입니다. ​</p>
						<p>영어 교육 전문가 양성 프로그램을 희망하시는 선착순 100분께 무료 수강 혜택을 드립니다.​</p>
						<p>​신청 기간 2022년 12월 12일(월) ~ 소진 시 마감​ 선착순 마감</p>
						<p>당첨 발표 2022년 12월 19일(월)​</p>
						<p>혜택 ABM 영어 교육 전문가 자격증 과정 무료 수강권 100명 증정​​</p>
					</div>
				</div>
				<div className="evtCont02">
					<h1><img src="/images/events/2022/event221212/cont02.png" alt="ABM 자격증 프로그램" /></h1>
					<div className="blind">
						<p>교육 안내 2023년 1월 9일(월)~1월 18일(수)</p>
						<p>교육 방법 온라인 교육</p>
						<p>교육 일정 2023년 1월 9일(월)~1월 14일(토) 09:30 AM ~ 12:20 PM</p>
					</div>
				</div>
				<div className="evtCont03">
					<h1><img src="/images/events/2022/event221212/cont03.png" alt="ABM 자격증 프로그램" /></h1>
					<div className="blind">
						<ul>
							<li>
								<p>광주교대 신동광 교수 / 1월 9~10일</p>
								<span>AI/Big Data​ 코퍼스, 챗봇, 텍스트 마이닝, 자동 문항생성/번역기를 활용한 AI 기반 영어 교육 실습​</span>
							</li>
							<li>
								<p>원광대 이혜진 교수​ / 1월 11~12일</p>
								<span>Metaverse 1 AR/VR과 메타버스 플랫폼 ZEP을 활용한 영어 교육용 콘텐츠 제작 실습​</span>
							</li>
							<li>
								<p>전주대 황요한 교수​​ / 1월 13~14일</p>
								<span>Metaverse 2 메타버스 플랫폼 Frame과 Spot을 활용한 영어 수업 교실 및  과업 제작 실습​​</span>
							</li>
						</ul>
						<p>프로그램에 대한 더 자세한 내용은​  KATE 홈페이지에서 확인해 주세요!​</p>
					</div>
					<a onClick={onClickCallLinkingOpenUrl.bind(this,'http://www.kate.or.kr/')} className="btnView" target="_blank"></a>
					<a href="javascript:void(0);" className="btnApply" onClick={this.eventApply}></a>
				</div>
				<div className="evtCont04">
					<h1><img src="/images/events/2022/event221212/cont04.png" alt="유의사항" /></h1>
					<div className="blind">
						<ul className="info">
							<li>이벤트는 1인 1회 참여하실 수 있습니다.​</li>
							<li>참여 완료 후에는 수정 및 추가 참여가 어렵습니다.​</li>
							<li>무료 수강 혜택은 참여해주신 개인정보를 확인하여 제공해 드립니다. 개인정보 오류 시 자격증 과정 수강이 불가하오니, 개인정보를 꼭 확인해 주세요.​</li>
							<li>ABM 영어교육 전문가 자격증 과정 프로그램은 한국영어교육학회 홈페이지에서 온라인 등록을 통해 들으실 수 있습니다.​</li>
						</ul>
					</div>
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
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(Event));