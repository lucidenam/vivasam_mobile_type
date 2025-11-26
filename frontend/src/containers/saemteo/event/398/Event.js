import React, {Component} from 'react';
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

// 경품의 종류
const CONTENT_TYPE_START = 3;
const CONTENT_TYPE_END = 4;

// 경품 목록
const CONTENT_LIST = [
	{id: '1', name: 'book1'},
	{id: '2', name: 'book2'},
];

class Event extends Component {
	state = {
		isEventApply: false,    		// 신청여부
		isAllAmountFull: true,			// 모든 경품 소진 여부
		isEachAmountFull: [true, true],		// 각각의 경품 소진 여부
		checkContentList: [false, false],	// 각 항목의 체크 여부
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

	// 경품 소진 여부
	eventAmountCheck = async() => {
		const { SaemteoActions, eventId } = this.props;

		let params1 = {
			eventId: eventId
		};
		let checkAllAmountFull = true;
		let checkEachAmountFull = [];

		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;

			for (let i = CONTENT_TYPE_START; i <= CONTENT_TYPE_END; i++) {
				checkEachAmountFull.push(responseData['qntCnt_' + i] < 30);
				if (responseData['qntCnt_' + i] >= 30) {
					checkAllAmountFull = false;
				}
			}
		} catch (e) {
			console.log(e);
		}

		this.setState({
			isAllAmountFull: checkAllAmountFull,
			isEachAmountFull: checkEachAmountFull,
		});
	}

	// 전제 조건
	prerequisite = async () => {
		const {logged, history, BaseActions, loginInfo} = this.props;
		const {isEventApply, isAllAmountFull, checkContentList} = this.state;

		// 모든 상품 소진 여부
		if (isAllAmountFull) {
			common.info("종료된 이벤트 입니다.");
			return false;
		}

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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			return false;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		// 자료를 최소 하나 선택했을 경우 true를 대입하고 탐색 종료
		let checkContent = false;

		checkContentList.forEach(value => {
			if (value) {
				checkContent = true;
				return;
			}
		});

		// 자료 선택 여부
		if (!checkContent) {
			common.info("플래너를 선택해 주세요.");
			return false;
		}

		return true;
	}

	eventApply = async () => {
		const {SaemteoActions, eventId, handleClick} = this.props;
		const {checkContentList} = this.state;

		let answerContent = "";
		let answerNumber = "";

		if (!await this.prerequisite()) {
			return;
		}

		checkContentList.forEach((value, i) => {
			if (value) {
				answerContent += CONTENT_LIST[i].name +"^||^";
				answerNumber += "1,"
			}
		});

		try {
			const eventAnswer = {
				eventAnswerContent: answerContent,
				answerNumber: answerNumber
			};

			SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

			handleClick(eventId);
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	};

	getMyClassInfo = async () => {
		const {MyclassActions} = this.props;
		try {
			let result = await MyclassActions.myClassInfo();
			return result.data;
		} catch (e) {
			console.log(e);
		}
	}

	changeContent = (index, e) => {
		const {checkContentList} = this.state;

		checkContentList.forEach((value, i) => {
			if (index==i) {
				checkContentList[i] = true;
			} else {
				checkContentList[i] = false;
			}
		});

		this.setState({
			checkContentList: checkContentList
		});

	}

	render() {
		return (
				<section className="event220404">
					<div className="evtCont01">
						<h1><img src="/images/events/2022/event220404/img1.png" alt="공부 + 마음ㅇ의 힘을 기르는 2022 스터디 플래너"/></h1>
						<div className="blind">
							<p>
								학생들의 학습 계획과 마음의 온도를 하루하루 기록할 수 있는<br/>
								2022 스터디 플래너를 학교로 보내드립니다.
							</p>
							<p>신청 기간</p>
							<p>2022년 4월 4일 ~ 5일 (선착순 마감)</p>
						</div>
						<div className="evtFormWrap">
							<ul>
								<li className={this.state.isEachAmountFull[0] ? 'end' : ''}>{/*수량 마감시 end 클래스 추가*/}
									<input type="radio" id="item1-1" name="radioPlanner" value={CONTENT_LIST[0].name} onChange={this.changeContent.bind(this, 0)} disabled={this.state.isEachAmountFull[0]}/>
									<label htmlFor="item1-1">
										<div className="imgWrap">
											<img src="/images/events/2022/event220404/img2.png" alt="스터디플래너"/>
										</div>
									</label>
								</li>
								<li className={this.state.isEachAmountFull[1] ? 'end' : ''}>{/*수량 마감시 end 클래스 추가*/}
									<input type="radio" id="item1-2" name="radioPlanner" value={CONTENT_LIST[1].name} onChange={this.changeContent.bind(this, 1)} disabled={this.state.isEachAmountFull[1]}/>
									<label htmlFor="item1-2">
										<div className="imgWrap">
											<img src="/images/events/2022/event220404/img3.png" alt="스터디플래너"/>
										</div>
									</label>
								</li>
							</ul>
						</div>
						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}><span
									className="blind">신청하기</span></button>
						</div>
						<ul className="evtInfo">
							<li>스터디 플래너는 한 가지의 디자인만 선택하실 수 있습니다.</li>
							<li>학급 인원을 꼭 기입해 주세요.(1개 학급에 30권까지 가능)</li>
							<li>근무 중이신 학교 주소로, 4월 11일부터 순차적으로 발송됩니다.</li>
						</ul>
					</div>
					<div className="evtCont02">
						<ul>
							<li>
								<img src="/images/events/2022/event220404/book1.png" alt="나 공부하기, 주간 공부 계획"/>
							</li>
							<li>
								<img src="/images/events/2022/event220404/book2.png" alt="쉬어가기:달콤한 휴식 + 마음활동"/>
							</li>
							<li>
								<img src="/images/events/2022/event220404/book3.png" alt="스티커:오늘 나만의 키워드는?"/>
							</li>
						</ul>
					</div>
					<div className="evtFooter">
						<h2>유의사항</h2>
						<ul className="evtInfoList">
							<li><span>1.</span>1인 1회 참여하실 수 있습니다.</li>
							<li><span>2.</span>추가 수량 문의는 담당자에게 개별 문의해주세요.<br/>
								(담당자 : 02-6970-6498)</li>
							<li><span>3.</span>주소 기재가 잘못되어 반송된 스터디 플래너는 다시<br/>
								발송해드리지 않습니다.</li>
							<li><span>4.</span>학교 번지수 및 수령처를 정확히 기입해주세요.<br/>
								(ex.교무실, 행정실, 학년 반, 경비실 등)</li>
							<li><span>5.</span>신청자의 개인 정보(이름/주소/전화번호)는 배송 업체에 <br/>
								공유됩니다.<br/>
								(㈜CJ대한통운 사업자등록번호 : 110-81-05034)</li>
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