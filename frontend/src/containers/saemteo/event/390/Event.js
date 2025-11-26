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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
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
			<section className="event220210">
				<div className="evtCont01">
					<span className="blind">이벤트 신청 시 비바콘 100콘 적립</span>
					<h1><img src="/images/events/2022/event220210/img01.png" alt="선생님과 함께 만들어가는 비바샘. 비바샘 모니터링단 9기 모집" /></h1>
					<div className="evtNoti">
						<p className="txt">비바샘과 함께 교육 현장의 다양한 이슈를 논의하고<br />현장 맞춤형 수업자료를 개발해 주실 열정적인 선생님을 기다립니다.</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span><span className="txt">2022년 2월 10일(목) ~ 3월 2일(수)</span></li>
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
							<span className="infoTit">모집 개요</span>
							<ul>
								<li>참여 대상 : <span>비바샘 초/중/고 선생님</span></li>
								<li>선발 인원 : <span>170명</span></li>
								<li>활동 기간 : <span>2022년 4월 ~ 11월 (8개월)</span></li>
							</ul>
						</div>
						<div className="infoItem">
							<span className="infoTit">모집 분야</span>
							<ul>
								<li>초등 교과 : <span>국어, 수학, 사회, 과학 중 택 1</span></li>
								<li>중･고등 교과 : <span>전과목</span></li>
								<li>비교과 콘텐츠 : <span>수업 혁신, 진로/진학, 체험활동</span></li>
							</ul>
						</div>
						<p>※ 초･중･고 교과와 비교과 콘텐츠를 중복 지원할 수 있습니다.</p>
					</div>
				</div>
				<div className="evtCont03">
					<div className="imgWrap"><img src="/images/events/2022/event220210/img02.png" alt="" /></div>
					<div className="blind">
						<h2>1. 어떤 활동을 하나요?</h2>
						<p>모니터링단 선생님의 의견과 제안은 비바샘 서비스 구성과 수업 자료 개발에 적극적으로 활용됩니다.</p>
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
								<strong>③ 학교 현장 및 교육 이슈 분석</strong>
								<p>수업 혁신, 체험활동과 관련된 신규 자료를 검토하고, 학교 현장에 필요한 자료를 제안합니다.</p>
							</li>
							<li>
								<strong>④ 비바샘 사이트 및 서비스 모니터링</strong>
								<p>비바샘 사이트에서 제공하는 다양한 서비스에 대한 의견을 전달합니다.</p>
							</li>
							<li>
								<strong>⑤ 스페셜 미션</strong>
								<p>모니터링단 선생님과의 즐거운 소통을 위해 시즌별로 스페셜 미션이 주어집니다.</p>
							</li>
						</ul>
						<h2>2. 활동 혜택은 무엇인가요?</h2>
						<ul>
							<li>모니터링단 활동비 지원</li>
							<li>밀리언셀러 비상교재 지원</li>
							<li>교사 문화 행사 초대</li>
							<li>모니터링단 커뮤니티 + 이벤트</li>
							<li>모니터링단 위촉장 발급</li>
						</ul>
					</div>
				</div>
				<div className="evtCont04">
					<div className="imgWrap"><img src="/images/events/2022/event220210/img03.png" alt="지금까지 총 1,015명의 모니터링단 선생님이 비바샘과 함께해 주셨습니다. 비바샘과의 즐거운 동행에 참여하실 9기 선생님을 기다립니다." /></div>
					<div className="blind">
						<ul className="blind">
							<li>
								<p>아이들 하교 하면 바로 살펴봤던 모니터링단 카페. 그곳에서 선생님들의 경험에서 우러난 여러 이야기들을 살펴 보는게 재미있었습니다. 선생님들이 공유해 주시는 팁이나 나와 같은 고민을 하고 있는 분들의 글들을 읽으며 배우고 같이 성장하는 것을 느꼈습니다.</p>
								<span>초등 과학 조*아 선생님</span>
							</li>
							<li>
								<p>기분 좋은 이벤트 선물과 함께 선생님들의 다양한 의견과 생각을 들을 수 있게 되어 정말 재미있고 즐거웠습니다. 선생님들의 의견을 들어볼 수 있는 이벤트가 많지 않은데, 저 자신도 되돌아 볼 수 있게 되고, 선생님들의 생각도 함께 공유할 수 있게 되어 참 좋았습니다.</p>
								<span>초등 사회 하*화 선생님</span>
							</li>
							<li>
								<p>비바샘 모니터링단 활동은 다양한 지역, 과목의 선생님들과 랜선이지만 교류할 수 있는 정말 소중한 경험이었습니다. 매일 카페에 출석하고, 선생님들의 댓글과 멋진 활동을 보면서 만날 수는 없지만 함께 성장하는 느낌, 그리고 함께 나아가고 있는 느낌을 받으며 외롭지 않게 한 해를 보낼 수 있었습니다.</p>
								<span>중등 영어 김*원 선생님</span>
							</li>
							<li>
								<p>1년 동안 활동하면서 다양한 선생님들과 수업자료를 공유하고 의견을 나눌 수 있어서 좋았어요. 또한 매달 자신의 수업에 대하여 되돌아 보면서 자기 반성 및 앞으로의 계획을 세울 수 있어서 의미가 있었어요.</p>
								<span>고등 수학 문*지 선생님</span>
							</li>
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
	})
)(withRouter(Event));