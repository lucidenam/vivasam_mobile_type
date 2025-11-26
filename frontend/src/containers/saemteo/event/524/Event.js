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
import Slider from "react-slick";


class Event extends Component {

	state = {
		isEventApply: false,    // 신청여부
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

	render () {
		//slick option 설정
		const settings = {
			slidesToShow: 6,
			slidesToScroll: 1,
			speed:3000,
			autoplay: true,
			autoplaySpeed: 0,
			infinite:true,
			arrows: false,
			swipe:false,
			cssEase: "linear",
			className: 'event_list',
		};
		const settings2 = {
			slidesToShow: 6,
			slidesToScroll: 1,
			speed:3000,
			autoplay: true,
			autoplaySpeed: 0,
			infinite:true,
			arrows: false,
			swipe:false,
			cssEase: "linear",
			className: 'event_list',
			rtl:true,
		};
		const {imgId,isShowDetail} = this.state;
		return (
			<section className="event240830">
				<div className="evtCont1">
					<div className="evtTit">
						<div className="slide-wrap">
							<Slider {...settings}>
								<div><img src="/images/events/2024/event240830_2/flow_book1.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book2.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book3.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book4.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book5.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book6.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book7.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book8.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book9.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book10.png" alt=""/></div>
							</Slider>

							<Slider {...settings2}>
								<div><img src="/images/events/2024/event240830_2/flow_book11.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book12.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book13.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book14.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book15.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book1.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book2.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book3.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book4.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book5.png" alt=""/></div>
							</Slider>

							<Slider {...settings}>
								<div><img src="/images/events/2024/event240830_2/flow_book6.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book7.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book8.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book9.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book10.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book11.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book12.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book13.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book14.png" alt=""/></div>
								<div><img src="/images/events/2024/event240830_2/flow_book15.png" alt=""/></div>
							</Slider>
						</div>
						<button type="button" className="btnApply" onClick={this.eventApply}>
							<span className="blind">신청하기</span>
						</button>

					</div>
				</div>

				<div className="evtNotice">
					<strong>유의사항</strong>
					<ul className="info">
						<li><span>해당 이벤트는 회원정보에 등록된 소속 학교급 기준으로 신청하실 수 있습니다. <br/>학교급이 바뀌었을 시 회원정보를 업데이트한 뒤 신청해 주세요.</span></li>
						<li>해당 이벤트는 1인 1회 신청하실 수 있습니다.</li>
						<li>신청하신 교과서는 신청 교과서에 한 하여 1부씩 원하시는 수령처로 택배 발송되며</li>
						<li>확인이 필요할 시 별도 연락을 드릴 수 있습니다.</li>
						<li><span>주소 및 연락처를 잘못 기입하여 수령하지 못한 경우 재발송이 불가능합니다. <br/>개인정보를 꼭 확인해 주세요.</span></li>
						<li>신청하신 교과서는 비상교육 온리원 물류센터에서 9월 2주 차부터 순차 배송됩니다.</li>
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
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(Event));