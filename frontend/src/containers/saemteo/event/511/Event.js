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
			<section className="event240708">
				<div className="evtCont1">
					<div className="evtTit">
						<h1><img src="/images/events/2024/event240708/img1.png" alt="미디어 리터러시 배포 이벤트"/></h1>
						<div className="blind">

						</div>

					</div>
				</div>

				<div className="evtCont02">
					<h1><img src="/images/events/2024/event240708/img2.png" alt="미디어 리터러시 배포 이벤트"/></h1>
					<div className="blind">

					</div>
					<button type="button" onClick={this.detailPopShow} value="item1" className="btn_view"><span className="blind">자세히 보기</span></button>
					<button type="button" onClick={this.detailPopShow} value="item2" className="btn_view ty2"><span className="blind">자세히 보기</span></button>
					<button type="button" className="btnApply" onClick={this.eventApply}>
						<span className="blind">신청하기</span>
					</button>
				</div>

				<div className="evtDetailPop" style={{display: isShowDetail ? '' : 'none'}}>
					<div className="evtPopWrap">
						<button type="button" className="btn_evt_pop_close" onClick={this.detailPopHide}><span><em className="blind">닫기</em></span></button>
						<img src={"/images/events/2024/event240708/"+ imgId +".png"} alt="이미지"/>
					</div>
				</div>

				<div className="notice">
					<h1><img src="/images/events/2024/event240708/img3.png" alt="미디어 리터러시 배포 이벤트"/></h1>
					<div className="blind">
						<strong>유의사항</strong>
						<ul className="info">
							<li>1인 1회 1세트만 신청할 수 있으며, 교사 인증을 완료하신 선생님만 신청이 가능합니다.</li>
							<li>자료집은 신청자 선생님께서 재직 중이신 학교로만 배송이 가능합니다. 학교 주소와 수령처를 정확히 기입해 주세요.</li>
							<li>주소가 잘못 기재되어 오발송되거나 반송된 자료집은 다시 발송해 드리지 않습니다.</li>
							<li>신청하신 자료는 선생님 재직 학교의 인근 비상교육 지사를 통해, 이벤트 종료 후 10일 이내 전달할 예정입니다.</li>
							<li>신청자 개인 정보(성명/주소/휴대 전화 번호)가 배송 업체 및 비상교육 지사에 공유됩니다. <br/>㈜CJ대한통운 사업자번호: 110-81-05034 / ㈜한진택배 사업자등록번호: 201-81-02823</li>
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