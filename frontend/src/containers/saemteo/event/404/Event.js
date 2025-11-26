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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			return false;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		return true;
	}

	eventApply = () => {
		const {SaemteoActions, eventId, handleClick} = this.props;
		const {item1, item2, item3, item4, item5} = this.state;

		let eventAnswerContent = "";

		if (!this.prerequisite()) {
			return;
		}

		if (!item1 && !item2 && !item3 && !item4 && !item5) {
			common.info("선생님께 필요한 힐링코스를 선택해 주세요.");
			return;
		} else {
			item1 ? eventAnswerContent = "item1^||^" : eventAnswerContent = "^||^";
			item2 ? eventAnswerContent += "item2^||^" : eventAnswerContent += "^||^";
			item3 ? eventAnswerContent += "item3^||^" : eventAnswerContent += "^||^";
			item4 ? eventAnswerContent += "item4^||^" : eventAnswerContent += "^||^";
			item5 ? eventAnswerContent += "item5" : eventAnswerContent += "";
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
			[e.target.id]: e.target.checked
		});
	}

	// 댓글 출력
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
				if (answers[idx] == ("item"+(idx+1))) {
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
			<section className="event220509">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event220509/img1.png" alt="VISANG + 한해 3탄 비상.한.숨"/></h1>
					<div className="blind">
						<p>
							선생님께 필요한 힐링은 무엇인가요?
						</p>
						<p>바쁜 일상을 보내고 계신 선생님께 비바샘이 살짝 ‘한숨’을<br/>돌릴 때 꼭 필요한 선물을 준비했습니다.</p>
						<p>나만의 힐링 코스를 선택하시면<br/>총 700명의 선생님들께 선물이 전달됩니다.</p>
						<p>참여 기간 - 2022.05.09~2022.05.29</p>
						<p>당첨자 발표 - 2022.05.31 비바샘 공지사항</p>
					</div>
				</div>
				<div className="evtCont02">
					<div className="evtForm">
						<h2><img src="/images/events/2022/event220509/img2.png" alt="선생님께 필요한 힐링 코스를 선택하세요!"/></h2>
						<div className="blind">
							각 주제별로 맞춤형 선물이 숨어 있습니다. <br/>선택하신 주제의 선물이 6월에 도착합니다.
							<span>실시간 참여현황</span>
						</div>
						<ul className="evtItem">
							<li className="item1">
								<input type="radio" id="item1" name="item" onChange={this.handleChange}/>
								<label htmlFor="item1">
									<div className="thumb"></div>
									<p><span></span>{itemCount[0]}</p>
								</label>
							</li>
							<li className="item2">
								<input type="radio" id="item2" name="item" onChange={this.handleChange}/>
								<label htmlFor="item2">
									<div className="thumb"></div>
									<p><span></span>{itemCount[1]}</p>
								</label>
							</li>
							<li className="item3">
								<input type="radio" id="item3" name="item" onChange={this.handleChange}/>
								<label htmlFor="item3">
									<div className="thumb"></div>
									<p><span></span>{itemCount[2]}</p>
								</label>
							</li>
							<li className="item4">
								<input type="radio" id="item4" name="item" onChange={this.handleChange}/>
								<label htmlFor="item4">
									<div className="thumb"></div>
									<p><span></span>{itemCount[3]}</p>
								</label>
							</li>
							<li className="item5">
								<input type="radio" id="item5" name="item" onChange={this.handleChange}/>
								<label htmlFor="item5">
									<div className="thumb"></div>
									<p><span></span>{itemCount[4]}</p>
								</label>
							</li>
						</ul>
						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}>
								<span className="blind">신청하기</span></button>
						</div>
					</div>
				</div>
				<div className="evtFooter">
					<h2><img src="/images/events/2022/event220509/img3.png" alt="유의사항"/></h2>
					<div className="blind">
						<ul className="evtInfoList">
							<li>1. 1인 1회 참여하실 수 있습니다.</li>
							<li>2. 한 번 선택하신 주제는 변경하실 수 없습니다.</li>
							<li>3. 유효기간이 지난 기프티콘은 다시 발송해 드리지 않습니다.</li>
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
			BaseActions: bindActionCreators(baseActions, dispatch),
			MyclassActions: bindActionCreators(myclassActions, dispatch),
			ViewerActions: bindActionCreators(viewerActions, dispatch)
		})
)(withRouter(Event));