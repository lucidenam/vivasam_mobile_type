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

	state = {
		isEventApply: false,    // 신청여부
		isAllAmountFull: true,
	}

	constructor(props) {
		super(props);
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


	eventApplyCheck = async () => {
		const {logged, event, eventId} = this.props;

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

	// 경품 소진 여부
	eventAmountCheck = async() => {
		const { SaemteoActions, eventId } = this.props;

		let params1 = {
			eventId: eventId
		};
		let checkAllAmountFull = false;

		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;
			if (responseData['qntCnt_3'] <= 0) {
				checkAllAmountFull = true;
			}

		} catch (e) {
			console.log(e);
		}

		this.setState({
			isAllAmountFull: checkAllAmountFull,
		});
	}

	// 이벤트 신청 검사
	eventApply = async () => {
		const {logged, history, BaseActions, eventId, handleClick, loginInfo} = this.props;
		const {isAllAmountFull, isEventApply} = this.state;

		// 경품 소진
		if (isAllAmountFull) {
			common.info("준비한 선물이 모두 소진되어 신청이 마감되었습니다.");
			return false;
		}

		// 미로그인시
		if (!logged) {
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return false;
		}

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

		// 기 참여 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		try {
			handleClick(eventId);
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	}

	render() {
		return (
			<section className="event220627">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event220627/img1.png"
							 alt="2022 진로 브로마이드를 학교로 보내드립니다."/></h1>
					<div className="blind">
						<p>앞으로 어떤 직업이 우리나라 산업을 이끌어 갈까요?<br/>
							한국고용정보원이 예측한 2030년 유망 산업을 확인해보고<br/>
							학생들이 희망 직업을 탐색해볼 수 있는<br/>
							진로 브로마이드를 학교로 보내드립니다.
						</p>
						<p>신청기간 2022년 6월 27일 ~ 7월 1일</p>
						<p>7월 4일부터 순차적으로 발송됩니다.</p>
						<span>선착순 마감</span>
					</div>
				</div>

				<div className="evtCont02">
					<div className="inner">
						<h2 className="blind">브로마이드 2종 세트</h2>

						<ul className="evtItem">
							<li>
								<img src="/images/events/2022/event220627/evtCont1.png" alt="2030년 유망 산업"/>
							</li>
							<li>
								<img src="/images/events/2022/event220627/evtCont2.png" alt="내가 도전하고 싶은 직업은?"/>
							</li>
						</ul>
					</div>
				</div>

				<div className="evtCont03">
					<div className="inner">
						<h2><img src="/images/events/2022/event220627/evtInfo.png" alt="유의사항"/></h2>
						<div className="blind">
							<ul>
								<li>1개의 패키지에 브로마이드 각 1매씩 총 2매가 들어 있습니다.</li>
								<li>2030년 유망 산업을 크게 5가지 카테고리로 나누어 하눈에 살펴볼 수 있습니다.</li>
								<li>가독성이 높은 대형 사이즈 브로마이드로 진로 탐색 활동에 유용합니다.</li>
								<li>희망하는 미애 직업을 작성해볼 수 있는 활동형 브로마이드가 포함되어 있습니다.</li>
							</ul>
						</div>

						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}>
								<img src="/images/events/2022/event220627/btn_apply.png" alt="신청하기"/>
							</button>
						</div>
					</div>
				</div>
				<div className="evtCont04">
					<img src="/images/events/2022/event220627/evtInfo2.png" alt="유의사항2"/>
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

