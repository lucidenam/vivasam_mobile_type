import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter, Link} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";


class Event extends Component {

	state = {
		isEventApply: false,    // 신청여부
		imgId:'',
		isShowDetail:false,
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
		const {logged, eventId, event} = this.props;
		if (logged) {
			const response = await api.chkEventJoin({eventId});
			if (response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}
		}
	}

	prerequisite = (e) => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const {isEventApply} = this.state;

		if (!logged) {
			// 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		// 교사 인증
		if (loginInfo.certifyCheck === 'N') {
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			return;
		}

		// 준회원일 경우 신청 안됨.
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// 기 신청 여부
		if(isEventApply){
			common.error("이미 신청하셨습니다.");
			return;
		}

		try {
			const eventAnswer = {
				eventId: eventId,
				memberId: loginInfo.memberId,
			};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

			handleClick(eventId);	// 신청정보 팝업으로 이동

		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
		return true;
	};

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {SaemteoActions, eventId, handleClick, eventAnswer} = this.props;

		if (!this.prerequisite(e)) {
			document.activeElement.blur();
			return false;
		}

		try {
			SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
			handleClick(eventId);    // 신청정보 팝업으로 이동
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	};

	detailPopShow = (e) => {
		const {imgId,isShowDetail} = this.state;
		let img = e.target.value;
		this.setState({
			imgId:img,
			isShowDetail:true,
		})
	}

	detailPopHide = () => {
		const {isShowDetail} = this.state;
		this.setState({
			isShowDetail:false,
		})
	}

	render () {
		const {imgId,isShowDetail} = this.state;
		return (
			<section className="event240807">
				<div className="evtCont1">
					<div className="evtTit">
						<h1><img src="/images/events/2024/event240807/img1.png" alt="AI 수업체험관 리뷰 이벤트"/></h1>
						<div className="blind">

						</div>

					</div>
				</div>

				<div className="evtCont02">
					<h1><img src="/images/events/2024/event240807/img2.png" alt="AI 수업체험관 리뷰 이벤트"/></h1>
					<div className="blind">

					</div>
					<a href="https://www.vivasam.com/aiSam/info?tabId=tab02&classDetailCd=AI101"
					   target="_blank" className="btnEng"><span className="blind">체험하기</span></a>
					<a href="https://www.vivasam.com/aiSam/math/main" target="_blank" className="btnMath"><span
						className="blind">체험하기</span></a>
					<a href="https://dn.vivasam.com/vs/theme/aigame/index.html" target="_blank" className="btnGame"><span className="blind">체험하기</span></a>
					
					<button type="button" className="btnApply" onClick={this.eventApply}>
						<span className="blind">영어/수학/게임 후기 작성하기</span>
					</button>
				</div>

				<div className="notice">
					<h1><img src="/images/events/2024/event240807/img3.png" alt="AI 수업체험관 리뷰 이벤트 유의사항"/></h1>
					<div className="blind">
						<strong>유의사항</strong>
						<ul className="info">
							<li>이미 수업체험관 후기를 작성하신 선생님도 이벤트에 참여하신 것으로 간주됩니다.</li>
							<li>본 이벤트는 비바샘 교사인증을 완료한 선생님만 참여하실 수 있습니다.</li>
							<li>1인 1회 참여할 수 있습니다. (영어/수학/게임 각각 후기 1회씩)​</li>
							<li>경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
							<li>경품 발송을 위해 개인정보(이름, 재직학교명, 휴대전화번호)가 서비스사에 제공됩니다.<br/>(주식회사 카카오 사업자등록번호 120-81-47521)</li>
							<li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
							<li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
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