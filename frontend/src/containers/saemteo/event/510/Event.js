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
import Slider from "react-slick";

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부
	}

	componentDidMount = async () => {
		const {BaseActions, SaemteoActions, logged} = this.props;
		let {mainSubject,secondSubject } = this.state;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();

			if(logged){
				const memberInfoResponse = await SaemteoActions.getMemberInfo();
				this.setState({
					mainSubject : memberInfoResponse.data.mainSubject,
					secondSubject : memberInfoResponse.data.secondSubject
				});
			}else{
				this.setState({
					mainSubject : '',
					secondSubject : ''
				});
			}

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
	eventApplyCheck = async() => {
		const { logged, eventId, event } = this.props;
		if(logged){

			const response = await api.chkEventJoin({eventId});
			if(response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}

		}
	}


	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const {evtTabId, isEventApply} = this.state;

		if (!logged) {
			// 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		// 교사 인증
		if(loginInfo.certifyCheck === 'N'){
			BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
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
				evtTabId:evtTabId
			};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer });

			handleClick(eventId);	// 신청정보 팝업으로 이동

		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.`
		}

	};


	render () {

		return (
			<section className="event240703">
				<div className="evtCont1">
					<h1><img src="/images/events/2024/event240703/img1.png" alt="비바샘 AI 플랫폼 활용 공모전"/></h1>
					<h1><img src="/images/events/2024/event240703/img2.png" alt="비바샘 AI 플랫폼 활용 공모전"/></h1>
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