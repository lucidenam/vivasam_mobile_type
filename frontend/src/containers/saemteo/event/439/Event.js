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
import {FooterCopyright} from "../../../../components/page";


class Event extends Component{
	state = {
		isEventApply: false,    	// 신청여부
		eventEnd: false,				// 이벤트 종료여부
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
	eventApplyCheck = async() => {
		const { logged, eventId } = this.props;

		if (logged) {
			const response = await api.chkEventJoin({eventId});
			if (response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}

			if (response.data.eventEnd === 'Y') {
				this.setState({
					eventEnd: true
				});
			}
		}
	}

	// 체크박스의 true 개수가 2개 이상일 때 다른 체크박스를 클릭시 alert창이 뜸.
	campaignOnClick = (index, e) => {
		const {logged, loginInfo, history, BaseActions} = this.props;
		const {isEventApply} = this.state;

		if (!logged) { // 미로그인시
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
			return;
		}
		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 신청하셨습니다.");
			return;
		}
	};

	// 신규 가입 회원 이벤트 참여
	eventApply = async () => {
		const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick} = this.props;
		const { isEventApply, eventEnd} = this.state;

		if (!logged) { // 미로그인시
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
			return;
		}
		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 신청하셨습니다.");
			return;
		}

		if(eventEnd) {
			common.error("'비바샘이 간다' 신청이 종료되었습니다. \n2024년에 비바샘이 다시 찾아 가겠습니다^^");
			return;
		}
		
		try {
			const eventAnswer = {
				isEventApply : isEventApply
			};
			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
			handleClick(eventId);    // 신청정보 팝업으로 이동
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(()=>{
			}, 1000);//의도적 지연.
		}
	};

	render () {

		return (
			<section className="vivasamgo">
				<div className="evtCont01">
					<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>

					{
						this.state.eventEnd && <span className="evtEnd"><em className="blind">2024년 다시 찾아옵니다!</em></span>
					}

					<h1><img src="/images/saemteo/vivago/vivago2023/img01.png" alt="비바샘이 간다" /></h1>
					<div className="blind">
						<span>선생님 목소리가 들려!</span>
						<h3>비바샘이 간다!</h3>
						<p>선생님이 계신 학교 현장으로 비바샘원정대가 찾아갑니다!</p>
					</div>

					<div className="blind">
						<div>
							<span>비바샘이 온다고?!</span>
							<p>
								비바원정대가 전국 얻디든 선생님이 원하는 시간과 장소에 찾아가 학교 현장의 진솔한 목소리를 듣고 이야기를 나누는 프로그램입니다.
							</p>
							<span>2023년 12월 중순까지 연중 상시로 운영</span>
						</div>

						<div>
							<span>모집내용</span>
							<ul>
								<li>모집 대상 : 교사인증 완료한 초중고 선생님</li>
								<li>신청 기간 : 최소 1주 후부터 2달 이내 신청 가능</li>
								<li>참여 인원 : 1회 당 5명 내외(동반 선생님 포함)</li>
								<li>선정 발표 : 선정되신 선생님께 개별 연락</li>
								<li>참여 혜택 : 비바샘이 간다 첨여 선생님 전원 신세계 상품권(20,000원) 및 다과 제공</li>
							</ul>
						</div>

						<div>
							<span>진행 방법</span>
							<ul>
								<li>신청 접수</li>
								<li>개별 연락 및 일정 조율</li>
								<li>비바원정대 출발</li>
								<li>선생님 간담회</li>
							</ul>
						</div>
					</div>

					<div className="btnWrap">
						<button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
					</div>
				</div>
				<div className="evtCont02">
					<h1><img src="/images/saemteo/vivago/vivago2023/img02.png" alt="비바샘이 간다" /></h1>
					<div className="blind">
						<span>비바원정대와 어떤 이야기를 하나요?</span>
						<h3>궁금해! 불편해! 필요해!</h3>
						<p>
							평소 비바샘에 궁금했던 사항, 개선이 필요하다고 느낀 부분 등 선생님의 목소리를 들A려주세요!
							잘 몰랐던 비바샘의 기능을 안내하고, 한 시간 동안 선생님의 의견과 이야기를 경청하겠습니다.
						</p>
					</div>
				</div>
				<div className="evtCont03">
					<h1><img src="/images/saemteo/vivago/vivago2023/img03.png" alt="비바샘이 간다" /></h1>
					<div className="blind">
						<span>선생님의 이야기가 정말 반영되나요?</span>
						<h3>비바샘이 바뀌는 여정을 함께 떠나요!</h3>
						<p>
							선생님과 함께한 자리에서 나눈 소중한 의견은 비바샘 서비스 개선과 수업 자료 개발에 적극 활용됩니다.
							선생님의 목소리로 비바샘이 바뀌는 과정을 지켜봐 주세요!
						</p>
					</div>
				</div>
				<div className="evtCont04">
					<h1><img src="/images/saemteo/vivago/vivago2023/img04.png" alt="비바샘이 간다" /></h1>
					<div className="blind">
						<strong>꼭 확인하세요!</strong>
						<ul className="info">
							<li>- 본 프로그램은 교사인증 완료한 초중고 선생님 대상으로 진행됩니다.​</li>
							<li>- 방문 신청은 최소 1주 전 부터 가능하며, 주말 및 공휴일은 방문 일정에서 제외됩니다.</li>
							<li>- 본 프로그램은 내부 사정에 따라 연기 및 취소될 수 있습니다.</li>
							<li>- 사전 연락 없이 당일 프로그램을 취소할 경우, 추후 비바샘 이벤트 활동 등에 참여가 제한 될 수 있습니다.</li>
						</ul>
					</div>
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
	})
)(withRouter(Event));