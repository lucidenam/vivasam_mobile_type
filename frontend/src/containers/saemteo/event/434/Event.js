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
const CONTENT_TYPE_END = 6;

// 경품 목록
const CONTENT_LIST = [
	{id: '1', name: 'book1'},
	{id: '2', name: 'book2'},
];

class Event extends Component {
	state = {
		isEventApply: false,    		// 신청여부
		isAllAmountFull: true,			// 모든 경품 소진 여부
		isEachAmountFull: [true, true, true, true],		// 각각의 경품 소진 여부
		checkContentList: [false, false],	// 각 항목의 체크 여부
		eachAmountLeft : [],
		firstAmountYn : 'Y',
		secondAmountYn : 'Y',
		nowDate : 0,
		nowHour: 0,
		//실서버
		day1 : 6,
		day2 : 7,
		//테스트
		// day1 : 2,
		// day2 : 3,
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();

		try {
			await this.getNowDate();
			await this.eventApplyCheck();
			await this.eventAmountCheck();
			await this.outOfAmountCheck();
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
		const { SaemteoActions, eventId, event } = this.props;

		let params1 = {
			eventId: eventId
		};
		let checkAllAmountFull = true;
		let checkEachAmountFull = [];
		let eachAmountLeft = [];

		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;

			for (let i = CONTENT_TYPE_START; i <= CONTENT_TYPE_END; i++) {
				eachAmountLeft.push(responseData['qntCnt_' + i]);
				checkEachAmountFull.push(responseData['qntCnt_' + i] > 0);
				if (responseData['qntCnt_' + i] >= 1) {
					checkAllAmountFull = false;
				}
			}
		} catch (e) {
			console.log(e);
		}


		this.setState({
			isAllAmountFull: checkAllAmountFull,
			isEachAmountFull: checkEachAmountFull,
			eachAmountLeft: eachAmountLeft,
		});

		event.eachAmountLeft = eachAmountLeft;
		SaemteoActions.pushValues({type: "event", object: event});
	}

	outOfAmountCheck = async() => {
		const { isEachAmountFull, eachAmountLeft, firstAmountYn, secondAmountYn, nowDate, day1, day2 } = this.state;

		if(nowDate === day1) {
			if(!isEachAmountFull[0]) {
				this.setState({
					firstAmountYn : 'N'
				});
			}

			if(!isEachAmountFull[1]) {
				this.setState({
					secondAmountYn : 'N'
				});
			}
		}

		if(nowDate === day2) {
			if(!isEachAmountFull[2]) {
				this.setState({
					firstAmountYn : 'N'
				});
			}

			if(!isEachAmountFull[3]) {
				this.setState({
					secondAmountYn : 'N'
				});
			}
		}

	}

	getNowDate = async() => {
		const response = await api.getCurrentTime();
		const nowDate = response.data.nowDate;
		this.setState({
			nowDate : parseInt(nowDate.split(" ")[0].split("-")[2]),
			nowHour : parseInt(nowDate.split(" ")[1].split(":")[0]),
		})
	}

	// 전제 조건
	prerequisite = async () => {
		const {logged, history, BaseActions, loginInfo} = this.props;
		const {isEventApply, isAllAmountFull, checkContentList, isEachAmountFull, nowDate, nowHour, day1, day2} = this.state;

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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
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

		if(nowDate === day1 && !isEachAmountFull[0] && !isEachAmountFull[1]) {
			common.info("오늘 준비한 플래너가 모두 소진되어 이벤트가 종료되었습니다. \n내일 오후 12시 정각에 다시 신청해주세요^^");
			return false;
		}

		if(nowDate === day2 && !isEachAmountFull[2] && !isEachAmountFull[3]) {
			common.info("준비한 플래너가 모두 소진되어 신청이 마감되었습니다.");
			return false;
		}

		// 자료 선택 여부
		if (!checkContent) {
			common.info("플래너를 선택해 주세요.");
			return false;
		}

		if (nowHour < 12) {
			common.info("오후 12시 정각에 오픈됩니다.");
			return false;
		}
		console.log(isEachAmountFull);


		if(nowDate === day1) {
			if(checkContentList[0] && !isEachAmountFull[0]) {
				common.info("선택하신 플래너 신청이 마감되었습니다.\n다른 플래너 선택 부탁드립니다!​");
				return false;
			}

			if(checkContentList[1] && !isEachAmountFull[1]) {
				common.info("선택하신 플래너 신청이 마감되었습니다.\n다른 플래너 선택 부탁드립니다!​");
				return false;
			}
		}

		if(nowDate === day2) {
			if(checkContentList[0] && !isEachAmountFull[2]) {
				common.info("선택하신 플래너 신청이 마감되었습니다.\n다른 플래너 선택 부탁드립니다!​");
				return false;
			}

			if(checkContentList[1] && !isEachAmountFull[3]) {
				common.info("선택하신 플래너 신청이 마감되었습니다.\n다른 플래너 선택 부탁드립니다!​");
				return false;
			}
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
				answerContent += CONTENT_LIST[i].name;
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
		const { firstAmountYn, secondAmountYn } = this.state;

		return (
				<section className="event230306">
					<div className="evtCont01">
						<h1><img src="/images/events/2023/event230306/evtCont1.png" alt="꿈으로 빛나는 2023 드리밍 플래너"/></h1>
						<div className="blind">
							<p>
								꿈을 향한 학생들의 학습 계획을 효율적으로 관리할 수 있는
								2023 드리밍 플래너를 학교로 보내드립니다.
							</p>
							<p>신청 기간</p>
							<p>2023년 3월 6일(월) ~ 3월 7일(화)</p>
							<span>하루 18,000개 선착순 마감 !    이틀간 오후 12시 정각 오픈 !</span>
						</div>
					</div>
					<div className="evtCont02">
						<img src="/images/events/2023/event230306/evtCont2.png" alt="꿈으로 빛나는 2023 드리밍 플래너"/>
						<div className="evtFormWrap">
							<ul>
								<li className={firstAmountYn == 'N' ? 'end' : ''}>{/*수량 마감시 end 클래스 추가*/}
									<input type="radio" id="item1-1" name="radioPlanner" value={CONTENT_LIST[0].name} onChange={this.changeContent.bind(this, 0)} disabled={firstAmountYn == 'N'}/>
									<label htmlFor="item1-1">
										<div className="imgWrap">
											<img src="/images/events/2023/event230306/book1.png" alt="플래너1"/>
										</div>
									</label>
								</li>
								<li className={secondAmountYn == 'N' ? 'end' : ''}>{/*수량 마감시 end 클래스 추가*/}
									<input type="radio" id="item1-2" name="radioPlanner" value={CONTENT_LIST[1].name} onChange={this.changeContent.bind(this, 1)} disabled={secondAmountYn == 'N'}/>
									<label htmlFor="item1-2">
										<div className="imgWrap">
											<img src="/images/events/2023/event230306/book2.png" alt="플래너2"/>
										</div>
									</label>
								</li>
							</ul>
						</div>
						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}><span
								className="blind">신청하기</span></button>
						</div>
					</div>
					<div className="evtFooter">
						<h2>신청 시 유의사항</h2>
						<ul className="evtInfoList">
							<li><span>1.</span>1인 1회 참여하실 수 있습니다.</li>
							<li><span>2.</span>학교 번지수 및 수령처를 정확히 기입해주세요. 신청 이후 주소 변경은<br/>
								불가합니다.(ex.교무실, 행정실, 학년 반, 경비실 등)</li>
							<li><span>3.</span>주소 기재가 잘못되어 반송된 플래너는 다시 발송해드리지 않습니다.</li>
							<li><span>4.</span>신청자의 개인 정보(이름/주소/전화번호)는 배송 업체에 공유됩니다.<br/>
								(㈜CJ대한통운 사업자등록번호: 110-81-05034)/<br/>
								(㈜한진택배 사업자등록번호: 201-81-02823)
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