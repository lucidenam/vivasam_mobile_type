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
		const { isEventApply} = this.state;

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
			<section className="event230215_2">
				<div className="evtCont01">
					<h1><img src="/images/events/2023/event230215_2/evtCont1.png" alt="선생님과 함께 만들어가는 비바샘. 비바샘 모니터링단 9기 모집" /></h1>
					<div className="blind">
						<p className="txt">비바샘과 함께 교육 현장의 다양한 이슈를 논의하고<br/>현장 맞춤형 수업 자료를 개발해 주실 열정적인 선생님을 기다립니다.</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span><span className="txt">2023년 2월 10일(목) ~ 3월 2일(수)</span></li>
							<li><span className="tit">당첨자 발표</span><span className="txt">3월 14일(월)<em> / </em>비바샘 공지사항</span></li>
						</ul>
					</div>
				</div>
				<div className="evtCont02">
					<div className="btnWrap">
						<button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">비바샘 모니터링단 9기 지원하기</span></button>
					</div>
					<div className="evtInfo">
						<div className="infoItem">
							<span className="infoTit">모집 기간</span>
							<p>2월 15일(수) ~ 3월 5일(일)</p>
						</div>
						<div className="infoItem">
							<span className="infoTit">최종 발표</span>
							<p>참여 대상 : 3월 15일(수) 비바샘 공지사항</p>
						</div>
						<div className="infoItem">
							<span className="infoTit">모집 개요</span>
							<ul>
								<li>참여 대상 : <span>비바샘 초/중/고 선생님</span></li>
								<li>선발 인원 : <span>300명</span></li>
								<li className="borB0">활동 기간 : <span>2023년 4월 ~ 11월 (8개월)</span></li>
							</ul>
						</div>
						<div className="infoItem">
							<span className="infoTit">모집 분야</span>
							<ul>
								<li>초등 교과 : <span>국어, 수학, 사회, 과학, 음악, 미술, 체육, 실과 중 택 1</span></li>
								<li>중･고등 교과 : <span>내 교과와 동일한 과목으로 자동 지원됩니다.</span></li>
								<li>비바샘 원격교육연수원 : <span>교원 연수 제안 및 자문 활동</span></li>
							</ul>
						</div>
						<p>※ 각 학교급 교과와 비바샘 원격교육연수원을 중복 지원할 수 있습니다.</p>
					</div>
				</div>
				<div className="evtCont03">
					<div className="imgWrap"><img src="/images/events/2023/event230215_2/evtCont3.png" alt="" /></div>
					<div className="blind">
						<h2>두근두근, 비바새미 선생님을 위한 다섯가지 활동 혜택</h2>
						<ul>
							<li>비바새미 활동비 지원</li>
							<li>밀리언셀러 비상교재 지원</li>
							<li>웰컴 선물, 연말 선물 발송</li>
							<li>비바새미 커뮤니티 + 이벤트</li>
							<li>비바새미 위촉장 발급</li>
						</ul>
						<p>※개인적인 상황이나 사회적인 이슈로 오프라인 행사나 대면 모임이 어려울 경우, 비대면 행사나 과목별 미션으로 대체하여 진행합니다.</p>
						<h2>열정가득, 어떤 활동을 하나요?</h2>
						<p>비바새미 선생님의 의견과 제안은 비바샘 서비스 구성과 수업 자료 개발에 적극적으로 활용됩니다.</p>
						<ul>
							<li>
								<strong>① 학교 현장 및 교육 이슈 분석</strong>
								<p>학교 현장, 수업 환경, 교육 정책과 관련된 시기별 이슈를 함께 분석합니다.</p>
							</li>
							<li>
								<strong>② 수업 지원 자료 제안 및 검토</strong>
								<p>과목별 신규 수업 자료를 검토하고 학교 현장에 필요한 수업 자료를 제안합니다.</p>
							</li>
							<li>
								<strong>③ 교원 연수 제작 참여 및 자문 활동</strong>
								<p>교육 현장의 목소리가 반영된 연수를 제안하고 개발하는 과정에 직접 참여합니다.</p>
							</li>
							<li>
								<strong>④ 비바샘 사이트 및 서비스 모니터링</strong>
								<p>비바샘 사이트에서 제공하는 다양한 서비스에 대한 의견을 전달합니다.</p>
							</li>
							<li>
								<strong>⑤ 새미 미션</strong>
								<p>비바새미 선생님과의 즐거운 소통을 위해 시즌별로 스페셜 미션이 주어집니다.</p>
							</li>
						</ul>
					</div>
				</div>
				<div className="evtCont04">
					<div className="imgWrap"><img src="/images/events/2023/event230215_2/evtCont4.png" alt="지금까지 총 1,015명의 모니터링단 선생님이 비바샘과 함께해 주셨습니다. 비바샘과의 즐거운 동행에 참여하실 9기 선생님을 기다립니다." /></div>
					<div className="blind">
						<h2>비바새미 활동을 해온 선생님들의 생생후기!</h2>
						<p>지금까지 1,176명의 선생님이 비바새미로 비바샘과 함께해 주셨습니다.</p>
						<ul>
							<li>
								<p>선생님들이 공유해 주시는 팁이나 같은 고민을 하고 있는 분들의 글을 읽으며 배우고 같이 성장하t는 것을 느꼈습니다.</p>
							</li>
							<li>
								<p>기분 좋은 이벤트 선물과 함께 선생님들의 다양한 의견과 생각을 들을 수 있게 되어 정말 재미있고 즐거웠습니다. </p>
							</li>
							<li>
								<p>함께 성장하는 느낌, 그리고 함께 나아가고 있는 느낌을 받으며 외롭지 않게 한 해를 보낼 수 있었습니다.</p>
							</li>
							<li>
								<p>매달 자신의 수업에 대하여 되돌아 보면서 자기 반성 및 앞으로의 계획을 세울 수 있어 의미가 있었어요.</p>
							</li>
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