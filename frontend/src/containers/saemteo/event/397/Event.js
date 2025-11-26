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
		isEventApply: false,	// 신청여부
		comment1: '',			// 제안
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
		}
	};

	// 전제 조건
	prerequisite = () => {
		const {logged, history, BaseActions, loginInfo} = this.props;
		const {isEventApply, comment1} = this.state;

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
	};

	// 입력창 focus시
	onFocusComment = (e) => {
		if (!this.prerequisite()) {
			e.target.blur();
		}
	};

	// 입력창 내용 입력시
	setComment = (e) => {
		let comment = e.target.value;

		this.setState({
			comment1: comment,
		});
	};

	eventApply = async () => {
		const {SaemteoActions, eventId, handleClick} = this.props;
		const {comment1} = this.state;

		if (!this.prerequisite()) {
			return;
		}

		if (comment1.trim().length === 0 || '' === comment1.trim()) {
			common.info("봄날의 한.컷을 작성해주세요.");
			return false;
		}

		try {
			const eventAnswer = {
				eventAnswerContent: comment1,
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

	render() {
		return (
			<section className="event220329">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event220329/img1.png" alt="VISANG + 한해 2탄 비상.한.컷"/></h1>
					<div className="blind">
						<p>
							봄날의 하루, 기억하고 싶은 순간을, 셀프 카메라에 담아 드립니다.
							비상한 그날의 한 컷,
							가장 마음에 드는 찰나를, 직접 선택해 보세요.
						</p>
						<p>* 본 이벤트는 코로나로 어려움을 겪고 있는
							전국의 사진관(셀프 스튜디오)과 함께합니다.</p>
						<p>참여기간 2022년 3월 29일 ~ 4월 24일</p>
						<p>당첨자 발표 2022년 4월 27일</p>
					</div>
				</div>
				<div className="evtCont02">
					<img src="/images/events/2022/event220329/img2.png" alt="비상.한.컷"/>
					<div className="blind">
						<ul>
							<li>5월 1일~15일 중, 선생님이 원하시는 일정에 맞춰
								셀프 스튜디오를 예약해 드립니다.
								(사진 작가가 촬영해 드리지 않습니다)
							</li>
							<li>셀프 촬영은, 동반 1인까지 가능합니다.</li>
							<li>재직 중인 학교를 기준으로, 30분 이내에 있는
								스튜디오를 예약해 드립니다.
							</li>
						</ul>
					</div>
					<div className="evtItem">
						<img src="/images/events/2022/event220329/img3.png" alt="상품"/>
						<ul className="blind">
							<li>
								<p>언제든 한 컷 10명 코닥 필름 카메라(3만 원) *카메라 색상은 랜덤으로 지급됩니다.</p>
							</li>
							<li>
								<p>참여상 100명 스타벅스 카페라떼 T(5천 원)</p>
							</li>
						</ul>
					</div>
				</div>
				<div className="evtCont03">
					<div className="evtFormWrap">
						<h3>사진으로 남기고 싶은 <span>봄날의 한.컷</span>을 적어주세요.</h3>
						<div className="evtTextWrap">
							<textarea placeholder="100자 이내로 작성해 주세요." maxLength={100} onFocus={this.onFocusComment} onChange={this.setComment}></textarea>
						</div>
						<div className="btnWrap">
							<button type="button" className="btnApply" onClick={this.eventApply}><span
								className="blind">신청하기</span></button>
						</div>
					</div>
				</div>
				<div className="evtFooter">
					<h2>유의사항</h2>
					<ul>
						<li>1. 1인 1회 참여하실 수 있습니다.</li>
						<li>2. 참여 완료 후에는 수정 및 추가 참여가 불가능합니다.</li>
						<li>3. 경품은 중복 제공하지 않습니다.</li>
						<li>4. 유효기간이 지난 기프티콘은 다시 발송해 드리지 않습니다.</li>
						<li>5. 공지 내용은 환경적인 상황에 따라 변경될 수 있습니다.</li>
					</ul>
				</div>
			</section>
		);
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