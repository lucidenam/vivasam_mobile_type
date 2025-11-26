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
		day1 : 11,
		day2 : 12,
		//테스트
		// day1 : 7,
		// day2 : 8,
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

			if (response.data.campaignJoinYn === 'Y') {
				this.setState({
					isCampaignApply: true
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
		const {isCampaignApply, isEventApply, isAllAmountFull, checkContentList, isEachAmountFull, nowDate, nowHour, day1, day2} = this.state;

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
		if (logged && loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		// 기 신청 여부
		if (isCampaignApply) {
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
			common.info("오늘 준비한 플래너가 모두 소진되어 이벤트가 종료되었습니다. \n내일 오후 5시 정각에 다시 신청해주세요^^");
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

		if (nowHour < 17) {
			common.info("오후 5시 정각에 오픈됩니다.");
			return false;
		}


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
		const {checkContentList, isEventApply} = this.state;

		let answerContent = "";
		let answerNumber = "";


		if (!await this.prerequisite()) {
			return;
		}

		checkContentList.forEach((value, i) => {
			if (value) {
				answerContent += CONTENT_LIST[i].name;
				// answerNumber += "1,"
				answerNumber += "30,"
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
			<section className="event240311">
				<div className="evtCont01">
					<h1><img src="/images/events/2024/event240311/evtCont1.png" alt="꿈으로 빛나는 2024 드리밍 플래너"/></h1>
					<div className="blind">
						<p>큐티뽀짝 비버샘과 함께 꿈을 향한 학생들의 학습 계획을 효율적으로 관리할 수 있는 2024 드리밍 플래너를 학교로  보내 드립니다!</p>
						<p>신청 기간 - 2024년 3월 11일(월)~3월 12일(화)​</p>
						<ul>
							<li>하루 21,000부 선착순 마감 ! (* 플래너 당 10,500부 씩)</li>
							<li>이틀 간 17시 정각 오픈 !</li>
							<li>1명당 30부 세트(수량 추가 불가)</li>
						</ul>
					</div>
				</div>
				<div className="evtCont02">
					<div className="evtFormWrap">
						<ul>
							<li className={firstAmountYn == 'N' ? 'end' : ''}>{/*수량 마감시 end 클래스 추가*/}
								<input type="radio" id="item1-1" name="radioPlanner" value={CONTENT_LIST[0].name} onChange={this.changeContent.bind(this, 0)} disabled={firstAmountYn == 'N'}/>
								<label htmlFor="item1-1">
									<div className="imgWrap">
										<img src="/images/events/2024/event240311/book1.png" alt="플래너1"/>
									</div>
								</label>
							</li>
							<li className={secondAmountYn == 'N' ? 'end' : ''}>{/*수량 마감시 end 클래스 추가*/}
								<input type="radio" id="item1-2" name="radioPlanner" value={CONTENT_LIST[1].name} onChange={this.changeContent.bind(this, 1)} disabled={secondAmountYn == 'N'}/>
								<label htmlFor="item1-2">
									<div className="imgWrap">
										<img src="/images/events/2024/event240311/book2.png" alt="플래너2"/>
									</div>
								</label>
							</li>
						</ul>
					</div>
					<div className="evtNotiWrap">
						<ul>
							<li>플래너는 <span>한 가지의 디자인만</span> 선택하실 수 있습니다.</li>
							<li>입력하신 학교 주소로 비상교육 지사를 통해 <span>3월 20일부터 순차 발송</span>​됩니다.</li>
							<li><span>1인 당 30권</span>이 제공되며, <span>수량 추가는 불가</span>합니다.</li>
						</ul>
					</div>
					<div className="btnWrap">
						<button type="button" className="btnApply" onClick={this.eventApply}><span
							className="blind">신청하기</span></button>
					</div>
					<img src="/images/events/2024/event240311/evtCont2.png" alt="꿈으로 빛나는 2024 드리밍 플래너"/>
					<div className="blind">
						<ul>
							<li>나에 대해 공부하기</li>
							<li>월간/주간 학습 계획하기</li>
							<li>진로 검사별 내 유형·직업 찾기</li>
							<li>스티커로 자유롭게 표현하기</li>
							<li>쉬는 시간을 활용해 꿈 관련 활동하기</li>
						</ul>
					</div>
				</div>
				<div className="evtFooter">
					<h2>신청 시 유의사항</h2>
					<ul className="evtInfoList">
						<li>1. 비바샘 교사인증을 완료한 선생님만 1인 1회 참여하실 수 있습니다.</li>
						<li>2. 학교 주소 및 수령처를 정확히 기입해주세요. 신청 이후 주소 변경은 불가합니다.(ex.교무실, 행정실, 학년 반, 경비실 등)</li>
						<li>3. 주소 기재가 잘못되어 반송된 플래너는 다시 발송해드리지 않습니다.</li>
						<li>4. 경품 발송을위해 신청자의개인정보(이름/재직학교/주소/전화번호)는 지사에 공유됩니다.</li>
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