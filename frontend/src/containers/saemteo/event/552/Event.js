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
import {FooterCopyright} from "../../../../components/page";

// 경품의 종류
const eventStartDate = new Date("2025-02-26");
const eventEndDate = new Date("2025-03-19");

// 경품 목록
const CONTENT_LIST = [
	{id: '1', name: 'book1'},
	{id: '2', name: 'book2'},
];

class Event extends Component {
	state = {
		isEventApply: false,    		// 신청여부
		checkContentList: [false, false],	// 각 항목의 체크 여부
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
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

	// 전제 조건
	prerequisite = async () => {
		const {logged, history, BaseActions, loginInfo} = this.props;
		const {isCampaignApply, isEventApply, checkContentList} = this.state;

		// 자료를 최소 하나 선택했을 경우 true를 대입하고 탐색 종료
		let checkContent = false;
		let contentVal = '';

		checkContentList.forEach((value, i) => {
			if (value) {
				checkContent = true;
				contentVal = CONTENT_LIST[i].name;
				return;
			}
		});

		// 자료 선택 여부
		if (!checkContent) {
			common.info("플래너를 선택해 주세요.");
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

		// 기 신청 여부
		if (isCampaignApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		if (new Date() > eventEndDate || new Date() < eventStartDate) {
			alert("이벤트 기간이 아니거나 종료된 이벤트입니다.");
			return false;
		}

		if (loginInfo.schoolLvlCd === 'ES' && contentVal === 'book2') {
			alert('해당 플래너는 중고등 선생님만 신청하실 수 있습니다.');
			return false;
		}

		if ((loginInfo.schoolLvlCd === 'MS' || loginInfo.schoolLvlCd === 'HS') && contentVal === 'book1') {
			alert('해당 플래너는 초등학교 선생님만 신청하실 수 있습니다.');
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

		return (
				<section className="event250312">
					<div className="evtCont01">
						<div className="evtTit"><img src="/images/events/2025/event250312/evtCont1.png" alt="꿈으로 빛나는 2025 드리밍 플래너"/></div>
						<div className="blind">
							<h2>꿈으로 빛나는 드리밍 플래너</h2>
							<p>큐티뽀짝 비버샘과 함께 꿈을 향한 학생들의 학습 계획을 효율적으로 관리할 수 있는 2025드리밍 플래너를 학교로 보내 드립니다.</p>
							<p>신청 기간 - 2025.03.12(수) ~ 03.19(수)</p>
							<p>당첨자 발표 - 03.21(금)</p>
							<ul>
								<li>초등 250명, 중고등 950명 추첨</li>
								<li>1명 당 30권 세트(수량 추가 불가능)</li>
							</ul>
						</div>
					</div>
					<div className="evtCont02">
						<img src="/images/events/2025/event250312/evtCont2.png" alt=""/>
						<div className="evtFormWrap">
							<ul>
								<li>
									<input type="radio" id="item1-1" name="radioPlanner" value={CONTENT_LIST[0].name} onChange={this.changeContent.bind(this, 0)}/>
									<label htmlFor="item1-1"><span className="blind">초등 - 탁상달력형 (※위 이미지는 이해를 돕기 위한 예시로, 실제 디자인과 차이가 있을 수 있습니다.)</span></label>
								</li>
								<li>
									<input type="radio" id="item1-2" name="radioPlanner" value={CONTENT_LIST[1].name} onChange={this.changeContent.bind(this, 1)}/>
									<label htmlFor="item1-2"><span className="blind">중고등 - 다이어리형 2종 중 랜덤 1종</span></label>
								</li>
							</ul>
						</div>
						<div className="blind">
							<ul>
								<li>플래너는 초등/중고등 중 <strong>한 가지의 학교급</strong>만 선택하실 수 있습니다.</li>
								<li>중고등 플래너의 디자인은 랜덤으로 제공됩니다. (색상 지정 불가)</li>
								<li>입력하신 학교 주소로 비상교육 지사를 통해 <strong>3월 24일부터 순차 발송</strong>됩니다.</li>
								<li><strong>1인 당 30권</strong>이 제공되며, <strong>수량 추가는 불가능</strong>합니다.</li>
							</ul>
						</div>
						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}><span className="blind">신청하기</span></button>
						</div>
					</div>
					<div className="evtCont03">
						<img src="/images/events/2025/event250312/evtCont3.png" alt=""/>
						<div className="blind">
							<h3>2025 드리밍 플래너 내지 구성</h3>
							<h4>초등</h4>
							<ul>
								<li>주간 학습 계획하기</li>
								<li>꿈을 이룬 내 모습 그리기</li>
								<li>꿈꾸는 어린이상 상장</li>
								<li>스티커</li>
							</ul>

							<h4>중고등</h4>
							<ul>
								<li>월간/주간 학습 계획하기</li>
								<li>나에 대해 알아보기</li>
								<li>진로 검사별 내 직업&middot;유형 찾기</li>
								<li>스티커</li>
							</ul>
						</div>
					</div>
					<div className="evtFooter">
						<h2>유의사항</h2>
						<ul className="evtInfoList">
							<li>1. 비바샘에서 교사인증을 완료한 초중고 학교 선생님만 1인 1회 참여하실 수 있습니다.</li>
							<li>2. 학교 주소 및 수령처를 정확히 기입해주세요. 신청 이후 주소 변경은 불가합니다.(ex.교무실, 행정실, 학년 반, 경비실 등)</li>
							<li>3. 주소 기재가 잘못되어 반송된 플래너는 다시 발송해드리지 않습니다.</li>
							<li>4. 경품 발송을 위해 신청자의 개인 정보(이름/재직학교/주소/전화번호)는 지사에 공유됩니다.</li>
							<li>5. 지사별 배송 일정에 따라 수령 시점이 다를 수 있습니다. </li>
						</ul>
					</div>
					<FooterCopyright handleLogin={this.handleLogin}/>
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