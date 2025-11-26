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
		const {
			logged,
			event,
			eventId
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
		const {
			logged,
			history,
			BaseActions,
			eventId,
			handleClick,
			loginInfo
		} = this.props;

		const{isAllAmountFull} = this.state;

		if(isAllAmountFull) {
			common.info("준비한 선물이 모두 소진되어 신청이 마감되었습니다.");
			return false;
		}

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
			<section className="event220421">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event220421/img1.png"
					         alt="민주주의 개념을 한눈에! 사회 브로마이드 세트를 학교로 보내드립니다."/></h1>
					<div className="blind">
						<p>우리나라 민주주의와 경제는 어떤 변화를 거쳐왔을까요?<br/>
							선거와 권력 분립은 무엇일까요?<br/>
							<br/>
							민주주의의 발전, 민주 정치의 원리를 쉽게 이해할 수 있는<br/>
							사회 브로마이드를 신청하세요!
						</p>
						<p>신청기간 2022년 4월 21일 ~ 4월 26일</p>
						<p>선착순 마감 4월 27일부터 순차적으로 발송됩니다.</p>
					</div>
				</div>

				<div className="evtCont02">
					<h2><img src="/images/events/2022/event220421/img2.png" alt="브로마이드 소개"/></h2>
					<div className="blind">
						<p>민주주의의 발전과 경제 성장</p>
					</div>
				</div>

				<div className="evtCont03">
					<h2><img src="/images/events/2022/event220421/img3.png" alt="꼭 참고하세요!"/></h2>
					<div className="blind">
						<p>민주 정치의 원리</p>
						<ul>
							<li>우리나라 민주주의 발전과 경제 성장 흐름을 한눈에 살펴볼 수
								있습니다.</li>
							<li>아이들의 눈높이에 맞춘 디자인으로 어려운 사회 개념을 쉽게
								이해할 수 있습니다.</li>
							<li>가독성이 높은 대형 사이즈의 브로마이드로 활용도가 높습니다.</li>
							<li>이벤트 마감 후 순차적으로 발송됩니다.</li>
						</ul>
					</div>
					<div className="btnWrap">
						<button type="button" className="btnApply" onClick={this.eventApply}>
							<img src="/images/events/2022/event220421/btn_apply.png" alt="캠페인 참여하기"/>
						</button>
					</div>
				</div>
				<div className="evtCont04">
					<h2><img src="/images/events/2022/event220421/img4.png" alt="유의사항"/></h2>
					<div className="blind">
						<ul>
							<li>1인 1개 신청 가능합니다.</li>
							<li>선착순 신청으로, 수량 소진 시 조기 마감될 수 있습니다.</li>
							<li>정확한 주소를 기입해주세요.<br/>
								(학교 주소, 수령처 포함: ex.교무실, 진로상담실, 행정실, 학년 반,<br/>
								경비실 등)</li>
							<li>주소 기재가 잘못되어 반송된 브로마이드는 다시 발송해드리지<br/>
								않습니다.</li>
							<li>신청자 개인 정보(성명/주소/휴대전화번호)가 배송업체에 공유됩니다.<br/>
								((주)CJ대한통운 사업자번호 : 110-81-05034)</li>
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

