import React, {Component, Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import * as viewerActions from 'store/modules/viewer';
import {bindActionCreators} from "redux";
import PreView from "./PreView"

class Event extends Component {
	state = {
		isEventApply: false,		// 신청여부
		isAllAmountFull: true,		// 모든 경품소진여부
		eventAnswerContents : [], 	// 이벤트 참여내용
		item1: false,				// 주제1 선택 여부
		item2: false,				// 주제2 선택 여부
		item3: false,				// 주제3 선택 여부
		item4: false,				// 주제4 선택 여부
		item5: false,				// 주제5 선택 여부
		itemCount: [0,0,0,0,0],		// 주제 선택 횟수
		imgText: '',
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();

		try {
			await this.eventApplyCheck();
			await this.commentConstructorList();
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
		const {isEventApply, isAllAmountFull} = this.state;

		// 로그인 여부
		if (!logged) {
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return false;
		}

		// 교사 인증 여부
		if (loginInfo.certifyCheck === 'N') {
			api.appConfirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?').then(confirm => {
				if (confirm === true) {
					BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
					window.location.hash = "/login/require";
					window.viewerClose();
				}
			});
			return false;
		}

		// 준회원 여부
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		// 경품 소진
		if (isAllAmountFull) {
			common.info('준비된 경품 수량이 모두 소진되었습니다.');
			return false;
		}

		return true;
	}

	eventApply = () => {
		const {SaemteoActions, eventId, handleClick} = this.props;

		let eventAnswerContent = "";

		if (!this.prerequisite()) {
			return;
		}

		try {
			const eventAnswer = {
				eventAnswerContent: eventAnswerContent,
			};

			SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

			handleClick(eventId);
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	}

	handleChange = (e) => {
		this.setState({
			item1: false,
			item2: false,
			item3: false,
			item4: false,
			item5: false,
			[e.target.id]: e.target.checked,
		});
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


	// 참여 정보 출력
	commentConstructorList = async () => {
		const {eventId} = this.props;
		const {itemCount} = this.state;

		const params = {
			eventId: eventId,
			eventAnswerSeq: 2,
			answerPage: {
				pageNo: 1,
				pageSize: 99999
			}
		};

		const responseList =  await api.getEventAnswerList(params);
		let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

		for (let i = 0; i < eventJoinAnswerList.length; i++) {
			let answers = eventJoinAnswerList[i].event_answer_desc.split('^||^');

			for (let idx = 0; idx < answers.length; idx++) {
				if (answers[idx] == '블루베리' || answers[idx] == '사과' || answers[idx] == '멜론' || answers[idx] == '자몽' || answers[idx] == '복숭아') {
					itemCount[idx]++;
					break;
				}
			}
		}

		this.setState({
			itemCount: itemCount
		});
	};


	openPopupTerms = (e) => {
		const {PopupActions} = this.props;
		const {imgText} = this.state;
		let container;
		let title;

		switch (e) {
			default:
				container = <PreView text={e.target.value}/>;
				title = '수업자료 미리보기';
				break;
		}

		PopupActions.openPopup({title: title, componet: container});
	}

	render() {
		const {itemCount, imgText} = this.state;

		return (
			<section className="event230823">
				<div className="evtCont01">
					<h1><img src="/images/events/2023/event230823/evtTit.png" alt="체인지 메이커 브로마이드 배포 이벤트"/></h1>
					<div className="blind">
						<h2>
							체인지 메이커 브로마이드 배포 이벤트
						</h2>
						<ul className="evtPeriod">
							<li>
								<span className="tit"><em className="blind">이벤트 기간</em></span><span className="txt">2023년 8월 23일 (수) ~ 8월 25일 (금)</span>
							</li>
						</ul>
						<span>* 5,000개 선착순 마감! *</span>
						<span>8/31(금) 부터 순차적으로 발송됩니다.</span>
					</div>
				</div>
				<div className="evtCont02">
					<div className="cont">
						<div className="contTit">
							<img src="/images/events/2023/event230823/contTit.png" alt="브로마이드 2종 세트" />
							<div className="blind">
								<h3>브로마이드 2종 세트</h3>
							</div>
						</div>

						<div className="contMain">
							<p className="useInfo">
								<img src="/images/events/2023/event230823/evtInfo1.png" alt="이렇게 활용해 보세요"/>
								<span className="blind">이렇게 활용해 보세요</span>
							</p>

							<ul className="setLIst">
								<li>
									<img src="/images/events/2023/event230823/evtCont1.png" alt="10대에 변화를 만든 세계의 인물"/>
									<span className="blind">10대에 변화를 만든 세계의 인물</span>
									<button className="view" value="1" onClick={this.openPopupTerms}></button>
								</li>
								<li>
									<img src="/images/events/2023/event230823/evtCont2.png" alt="내가 꿈꾸는 변화"/>
									<span className="blind">내가 꿈꾸는 변화</span>
									<button  className="view" value="2" onClick={this.openPopupTerms}></button >
								</li>
							</ul>

							<ul className="noti">
								<li>1개의 패키지에 브로마이드 각 1매씩 총 2매가 들어있습니다.</li>
								<li>가독성이 높은 대형 사이즈 브로마이드로 활용도가 높습니다.</li>
								<li>
									자신이 꿈꾸는 변화를 작성해 볼 수 있는 활동형 브로마이드가<br />
									포함되어 있습니다.
								</li>
							</ul>

							<div className="btnWrap">
								<button type="button" className="btnApply" onClick={this.eventApply}>
									<img src="/images/events/2023/event230823/btnApply.png" alt="내가 꿈꾸는 변화"/>
									<span className="blind">신청하기</span></button>
							</div>
						</div>


					</div>

				</div>
				<div className="notice">
					<strong>신청 시 유의사항</strong>
					<ul className="evtInfoList">
						<li>1인 1회 신청할 수 있습니다.</li>
						<li>선착순 신청으로 수량 소진 시 이벤트 신청이 마감됩니다.</li>
						<li>
							브로마이드는 학교로만 배송이 가능합니다. 학교 주소와 수령처를<br />
							정확히 기재해 주세요.
						</li>
						<li>
							주소 기재가 잘못되어 오발송된 브로마이드는 다시 발송해<br />
							드리지 않습니다.
						</li>
						<li>
							신청자 개인정보(성명/주소/휴대 전화번호)가 배송업체에<br />
							공유됩니다.  ((주)CJ대한통운 사업자번호: 110-81-05034)
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
			MyclassActions: bindActionCreators(myclassActions, dispatch),
			ViewerActions: bindActionCreators(viewerActions, dispatch)
		})
)(withRouter(Event));