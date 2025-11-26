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

class Event extends Component {
	state = {
		isEventApply: false,		// 신청여부
		chkAllAmountFull: true,		// 모든 경품소진여부
		eventAnswerContents : [], 	// 이벤트 참여내용
		item1: false,				// 주제1 선택 여부
		item2: false,				// 주제2 선택 여부
		item3: false,				// 주제3 선택 여부
		item4: false,				// 주제4 선택 여부
		item5: false,				// 주제5 선택 여부
		itemCount: [0,0,0,0,0],		// 주제 선택 횟수
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();

		try {
			await this.eventApplyCheck();
			await this.commentConstructorList();
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

		// let radio = document.querySelectorAll('input[name="item"]');
		// [].forEach.call(radio,function(col){
		// 	col.addEventListener("input",function(){
		// 		alert('비바샘 이벤트는 추모의 마음을 담고자 잠시 중단되며\n7월 29일 재오픈 예정입니다. ');
		// 		[].forEach.call(radio, function(col){
		// 			col.checked = false;
		// 		});
		// 	});
		// });
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

		return true;
	}

	eventStop = () => {
		alert('비바샘 이벤트는 추모의 마음을 담고자 잠시 중단되며\n7월 26일 재오픈 예정입니다. ');
	}

	eventApply = () => {
		const {SaemteoActions, eventId, handleClick} = this.props;
		const {item1, item2, item3, item4, item5} = this.state;

		let eventAnswerContent = "";

		if (!this.prerequisite()) {
			return;
		}

		if (!item1 && !item2 && !item3 && !item4 && !item5) {
			common.info("맛있는 과일을 선택해주세요!");
			return;
		} else {
			item1 ? eventAnswerContent = "블루베리^||^" : eventAnswerContent = "^||^";
			item2 ? eventAnswerContent += "사과^||^" : eventAnswerContent += "^||^";
			item3 ? eventAnswerContent += "멜론^||^" : eventAnswerContent += "^||^";
			item4 ? eventAnswerContent += "자몽^||^" : eventAnswerContent += "^||^";
			item5 ? eventAnswerContent += "복숭아" : eventAnswerContent += "";
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

	render() {
		const {itemCount} = this.state;

		return (
			<section className="event230715">
				<div className="evtCont01">
					<h1><img src="/images/events/2023/event230715/evtTit.png" alt="비버샘의 싱그러운 과일가게"/></h1>
					<div className="blind">
						<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
						<h2>
							비버샘의 싱그러운 과일가게
						</h2>
						<span>최애 과일을 선택하고 비타민 충전하세요! </span>
						<p>
							시원한 여름을 만들어줄 비버샘의 싱그러운 과일들.
							선생님이 가장 좋아하는 과일을 선택해주세요.
							추첨을 통해 800명의 선생님들께 달콤한 선물을 보내드려요!
						</p>
						<ul className="evtPeriod">
							<li>
								<span className="tit"><em className="blind">참여기간</em></span><span className="txt">2023.7.17 ~ 2023.8.20</span>
							</li>
							<li>
								<span className="tit tit2"><em className="blind">당첨자 발표</em></span><span
								className="txt txt2">2023.8.22 비바샘 공지사항</span>
							</li>
						</ul>
					</div>
				</div>
				<div className="evtCont02">
						<div className="contTit">
							<img src="/images/events/2023/event230715/evtContTit.png" alt="비버샘의 싱그러운 과일가게" />
							<div className="blind">
								<h3>선생님의 최애 과일을 선택하세요</h3>
								<p>
									각 과일 별로 특별한 선물이 숨어 있습니다.
									선택하신 과일에 해당하는 선물이 8월에 도착합니다.
								</p>
							</div>
						</div>

						<div className="fruit_list">
							<span className="sell">
								<p className="blind">
									<span>실시간</span> 이만큼 팔렸어요
								</p>
							</span>


							<div className="evtFormWrap">
								<div className="item1">
									<input type="radio" id="item1" name="item" value="item1" data-key="3" onChange={this.handleChange}/>
										<label htmlFor="item1">
											<img src="/images/events/2023/event230715/fruit1.png"
												 alt="새콤달달 블루베리" />
												<p className="blind">
													새콤달달
													<span>블루베리</span>
												</p>
												<span className="sell_num">{itemCount[0]}</span>
										</label>
								</div>
								<div className="item2">
									<input type="radio" id="item2" name="item" value="item2" data-key="3" onChange={this.handleChange}/>
										<label htmlFor="item2">
											<img src="/images/events/2023/event230715/fruit2.png"
												 alt="아삭아삭 사과" />
												<p className="blind">
													아삭아삭
													<span>사과</span>
												</p>
												<span className="sell_num">{itemCount[1]}</span>
										</label>
								</div>
								<div className="item3">
									<input type="radio" id="item3" name="item" value="item3" data-key="3" onChange={this.handleChange}/>
										<label htmlFor="item3">
											<img src="/images/events/2023/event230715/fruit3.png"
												 alt="꿀맛보장 멜론" />
												<p className="blind">
													꿀맛보장
													<span>멜론</span>
												</p>
												<span className="sell_num">{itemCount[2]}</span>
										</label>
								</div>
								<div className="item4">
									<input type="radio" id="item4" name="item" value="item4" data-key="3" onChange={this.handleChange}/>
										<label htmlFor="item4">
											<img src="/images/events/2023/event230715/fruit4.png"
												 alt="달콤씁쓸 자몽" />
												<p className="blind">
													달콤씁쓸
													<span>자몽"</span>
												</p>
												<span className="sell_num">{itemCount[3]}</span>
										</label>
								</div>
								<div className="item5">
									<input type="radio" id="item5" name="item" value="item5" data-key="3" onChange={this.handleChange}/>
										<label htmlFor="item5">
											<img src="/images/events/2023/event230715/fruit5.png"
												 alt="과즙팡팡 복숭아" />
												<p className="blind">
													과즙팡팡
													<span>복숭아</span>
												</p>
												<span className="sell_num">{itemCount[4]}</span>
										</label>
								</div>
							</div>
						</div>
						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}>
								<span className="blind">신청하기</span></button>
						</div>
				</div>
				<div className="notice">
					<strong>신청 시 유의사항</strong>
					<ul className="evtInfoList">
						<li>① 본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
						<li>② 경품은 당첨자 발표 이후 순차적으로 발송됩니다. </li>
						<li>③ 1인 1회 참여할 수 있습니다.</li>
						<li>④ 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
						<li>⑤ 경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br />(㈜카카오 사업자등록번호 120-81-47521)</li>
						<li>⑥ 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
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