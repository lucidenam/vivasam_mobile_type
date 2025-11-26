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
			<section className="event240226">
				<div className="evtCont01">
					<h1><img src="/images/events/2024/event240226/img1.png" alt="새학기 힘차게 출발하고 싶다면 비바새미 11기" /></h1>
					<div className="blind">
						<p className="txt">
							비바샘을 사랑하는 선생님이라면 주목!
							비바샘과 즐거운 수업을 함께 만들어갈 선생님을 모집합니다.
						</p>
						<ul className="evtPeriod">
							<li><span className="tit">모집 기간</span><span className="txt">2024년 2월 26일(월) ~ 3월 10일(일)</span></li>
						</ul>
					</div>
				</div>
				<div className="evtCont02">
					<img src="/images/events/2024/event240226/img2.png" alt="새학기 힘차게 출발하고 싶다면 비바새미 11기" />
					<div className="blind">
						<div>
							<h6>모집 개요 zip.</h6>
							<dl>
								<dt>모집 기간</dt>
								<dd>2024년 2월 26일(월) ~ 3월 10일(일)</dd>
							</dl>
							<dl>
								<dt>최종 발표</dt>
								<dd>2024년 3월 15일(금) 비바샘 공지사항</dd>
							</dl>
							<dl>
								<dt>모집 대상</dt>
								<dd>비바샘 초/중/고 선생님 300명</dd>
							</dl>
							<dl>
								<dt>모집 분야</dt>
								<dd>
									<p>초등 교과: 국어, 수학, 사회, 과학, 음악, 미술, 체육, 실과, 영어 중 택 1</p>
									<p>중고등 교과: 내 교과와 동일한 과목으로 자동 지원</p>
								</dd>
							</dl>
							<p>교육 현장에서 뜻깊은 한 해를 만들고 싶은 비바샘 팬클럽 선생님을 찾습니다. </p>
						</div>

						<div>
							<h6>미션 활동 zip.</h6>
							<dl>
								<dt>① 학교 현장 및 교육 이슈 분석</dt>
								<dd>학교 현장, 수업 환경, 교육 정책과 관련된 시기별 이슈를 함께 분석합니다.</dd>
							</dl>
							<dl>
								<dt>② 수업 지원 자료 제안 및 검토</dt>
								<dd>과목별 신규 수업 자료를 검토하고 학교 현장에 필요한 수업 자료를 제안합니다.</dd>
							</dl>
							<dl>
								<dt>③ 비교과 채널 자료 제안 및 검토</dt>
								<dd>수업 혁신, 체험활동과 관련된 신규 자료를 검토하고, 학교 현장에 필요한 자료를 제안합니다.</dd>
							</dl>
							<dl>
								<dt>④ 비바샘 사이트 및 서비스 모니터링</dt>
								<dd>비바샘 사이트에서 제공하는 다양한 서비스에 대한 의견을 전달합니다.</dd>
							</dl>
							<p>활동기간 : 2024년 4월 ~ 11월 (8개월)</p>
							<p>비바새미 선생님의 의견과 제안은 비바샘 서비스 구성과  수업 자료 개발에 적극적으로 활용됩니다.</p>
						</div>

						<div>
							<h6>활동 혜택 zip.</h6>
							<ul>
								<li>비바새미 활동비 지원</li>
								<li>밀리언셀러 비상교재 지원</li>
								<li>웰컴 선물, 연말 선물 발송</li>
								<li>비바새미 커뮤니티+이벤트</li>
								<li>비바새미 위촉장 발급</li>
							</ul>
							<p>
								※ 미션 활동은 온라인 커뮤니티를 통해 진행되며 과목에 따라 활동 기간 중 1~2회 오프라인 미팅이 진행될 수 있습니다.
								※ 활동 혜택은 상황에 따라 사전 안내 후 대체될 수 있습니다.
							</p>
						</div>
					</div>
					<div className="btnWrap">
						<button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">지원하기</span></button>
					</div>

				</div>
				<div className="evtCont03">
					<div className="imgWrap"><img src="/images/events/2024/event240226/img3.png" alt="비바새미 활동 Q&A zip." /></div>
					<div className="blind">
						<ul>
							<li>활동 혜택은 비바새미라면 누구든지 받을 수 있나요? 혜택 지급일정이 궁금해요.</li>
							<li>비바새미 활동 혜택은 4월 ~ 11월 성실하고 꾸준히 활동을 진행해주신 선생님들을 대상으로 지급됩니다. 지급 규정 및 혜택 상세 내용은 선발자 대상으로 별도 안내 예정입니다.</li>
							<li>비바새미에 대해 조금 더 자세하게 알고 싶어요!</li>
							<li>지금까지 1,476명의 선생님이 비바새미로 비바샘과 함께해 주셨습니다! 선생님들이 직접 남겨주신 생생 후기를 공개합니다.</li>
						</ul>
					</div>
					<ul className="review_box">
						<li>
							<p>
								비바샘은 수업 준비할 때 가장
								먼저 찾아가는
								사이트 입니다.
								제가 항상 선생님들께도
								비바샘과 비바새미 활동
								추천드리거든요^^
								올 한해도 즐겁게 활동한 것
								같습니다. 감사합니다!
							</p>
							<p className="t">
								비바새미 10기<br/>
								신O경 선생님
							</p>
						</li>
						<li>
							<p>
								비바새미 활동을 계기로
								수업을 스스로 돌이켜 볼 수
								있었어요. 그리고 교육을 위해
								함께 노력한다는 느낌도
								들었고 혼자 노력하는 외로움
								없이 큰 힘이 되었어요.
								감사합니다.
							</p>
							<p className="t">
								비바새미 10기<br/>
								류O철 선생님
							</p>
						</li>
						<li>
							<p>
								교과서 검토도 해 보고 수업에
								대한 다양한 의견을 내면서 제
								자신도 성장할 수 있었던 정말
								좋은 기회였습니다. 이후에도
								함께 성장해 나가고
								싶었습니다. 기회를 마련해
								주셔서 감사합니다.
							</p>
							<p className="t">
								비바새미 10기<br/>
								임O정 선생님
							</p>
						</li>
						<li>
							<p>
								활동하면서 얻은 것들이 참.
								많습니다. 교과서를
								검토하면서 단원 전체 흐름 뿐
								아니라 활동 하나를 세세하게
								살펴보니 이해도도 높아지고
								비판적으로 보는 시각이
								길러졌습니다.
							</p>
							<p className="t">
								비바새미 10기<br/>
								김O현 선생님
							</p>
						</li>
						<li>
							<p>
								비바새미로 선정되어
								1년간 즐겁게 활동했고, 교사로서 해보지 못했던 경험들도 할 수 있었습니다. 새롭고 보람찬 활동을 할 수 있는 기회를 마련해 주셔서 감사합니다.
							</p>
							<p className="t">
								비바새미 10기<br/>
								강O미 선생님
							</p>
						</li>
						<li>
							<p>
								제가 비바샘에
								어떤 도움을 드렸을까
								생각을 해보았는데
								제가 받은 도움이
								더 많다는 생각이 듭니다.이런 공유의 장이 있다는 것만으로
								위로가 되었습니다.
							</p>
							<p className="t">
								비바새미 10기<br/>
								전O연 선생님
							</p>
						</li>
						<li>
							<p>
								비바새미 활동을 통해서 모르는 서비스를 많이
								알게 되고 직접 수업에
								활용하면서 교사로서
								역량도 증가했습니다.
								감사합니다.
							</p>
							<p className="t">
								비바새미 10기<br/>
								임O균 선생님
							</p>
						</li>
					</ul>
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