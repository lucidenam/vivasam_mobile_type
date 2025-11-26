import React, {Component, Fragment} from 'react';
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
		showAll : false , 			// 후기 더보기
	}

	// 후기 더보기
	commentListAddAction = () => {
		this.setState({ showAll: true });
	};

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
		const {showAll} = this.state;
		return (
			<section className="event250224">
				<div className="evtCont01">
					<h1><img src="/images/events/2025/event250224/img1.png" alt="" /></h1>
					<div className="blind">
						<h2>VIVA 2025! 힙하게 보내고 싶다면 비바새미 12기 모집</h2>
						<p>비바샘 팬클럽 선생님을 찾습니다! 더 멋진 비바샘을 함께 만들어 가요.</p>
					</div>
				</div>
				<div className="evtCont02">
					<img src="/images/events/2025/event250224/img2.png" alt="" />
					<div className="blind">
						<h3>모집개요</h3>
						<ul>
							<li>모집 기간 : 2025년 2월 24일(월) ~ 3월 9일(일)</li>
							<li>최종 발표 : 2025년 3월 14일(금) 비바샘 공지사항 발표</li>
							<li>모집 대상 : 비바샘 초/중/고 선생님 300명</li>
							<li>모집 분야 : 
								<p>초등 교과: 국어, 수학, 사회, 과학, 영어, 예체능 중 택 1</p> 
								<p>중∙고등 교과: 내 교과와 동일한 과목으로 자동 지원</p>
							</li>
						</ul>
						<p>비바새미 활동은 4월부터 11월까지, 8개월간 진행됩니다!</p>
					</div>
				</div>
				<div className="evtCont03">
					<img src="/images/events/2025/event250224/img3.png" alt="" />
					<div className="blind">
						<h3>주요 활동</h3>
						<ul>
							<li>1. 학교 현장 및 교육 이슈 분석 : 학교 현장, 수업 환경, 교육 정책과 관련된 시기별 이슈를 함께 분석합니다.</li>
							<li>2. 수업 지원 자료 제안 및 검토 : 과목별 신규 수업 자료를 검토하고 학교 현장에 필요한 수업 자료를 제안합니다.</li>
							<li>3. 비바샘 홍보 대사 활동 : 비바샘의 유용한 서비스와 콘텐츠를 널리 알립니다.</li>
							<li>4. 비바샘 사이트 및 서비스 모니터링 : 비바샘 사이트에서 제공하는 다양한 서비스에 대한 의견을 전달합니다.</li>
						</ul>
						<p>비바새미 선생님의 의견은 비바샘 서비스 구성과 수업 자료 개발, 비바샘 홍보에 적극 활용될 예정입니다.</p>
					</div>
				</div>
				<div className="evtCont04">
					<img src="/images/events/2025/event250224/img4.png" alt="" />
					<div className="blind">
						<h3>활동 혜택</h3>
						<ul>
							<li>비바새미 위촉장 발급</li>
							<li>비바새미 활동비 지원</li>
							<li>웰컴 선물, 연말 선물 발송</li>
							<li>비바새미 커뮤니티+이벤트</li>
						</ul>
						
						<h4>주의사항</h4>
						<ul>
							<li>개인적인 상황이나 사회적인 이슈로 오프라인 행사나 대면 모임이 어려울 경우, 비대면 행사나 과목별 미션으로 대체하여 진행합니다.</li>
							<li>활동 혜택은 성실하고 꾸준히 활동을 진행해 주신 선생님들을 대상으로 지급될 예정이며,  지급 규정 및 혜택에 관한 자세한 내용은선발자분들께 별도로 안내드릴 예정입니다.</li>
							<li>활동 혜택은 상황에 따라 사전 안내 후 대체될 수 있습니다.</li>
						</ul>
					</div>

					<div className="btnWrap">
						<button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">지원하기</span></button>
					</div>
				</div>
				<div className="evtCont05">
					<div className="imgWrap"><img src="/images/events/2025/event250224/img5.png" alt="" /></div>
					<div className="blind">
						<h3>비바새미 11기 선생님들의 생생 후기</h3>
						<p>지금까지 1,774명의 비바새미 선생님이 비바샘과 함께해 주셨습니다! 선생님들께서 직접 남겨 주신 후기를 확인해 보세요!</p>
					</div>
					
					<ul className="review_box">
						<li>
							<div className="top">
								<span className="flag">비바새미 11기</span>
								<span className="teacher">이O람 선생님</span>
							</div>
							<p className="body">
								비바새미 활동을 통해서 <strong> 비바샘의 학습 툴을 <br />
								사용해 볼 수 있어서 너무 좋았습니다. </strong><br />
								또한 매 차시의 수업을 분석하고 돌아보는 <br />
								활동을 통해 아쉬운 점, 학생들의 학습 수준 및 <br />
								흥미도를 생각해 볼 수 있어 좋았습니다.
							</p>
						</li>
						<li>
							<div className="top">
								<span className="flag">비바새미 11기</span>
								<span className="teacher">김O동 선생님</span>
							</div>
							<p className="body">
								<strong> 저의 수업에 대해 다시 점검해 볼 수 있었어요. </strong> 
								또, 커뮤니티를 활용하여 미션을 수행하며 <br />
								<strong> 여러 선생님과 의견을 나눌 수도 있어서 좋았습<br />
								니다.</strong> 앞으로도 기회가 있다면 <br />
								비상교육과 함께 현장 목소리를 전달하고<br />
								보다 성장하고 싶습니다.
							</p>
						</li>
						<li>
							<div className="top">
								<span className="flag">비바새미 11기</span>
								<span className="teacher">주O호 선생님</span>
							</div>
							<p className="body">
								<strong> 비바새미 활동을 통해 올 한 해 더욱 열정을 <br />
								쏟아서 수업 </strong>할 수 있었고,<br />
								매달 새미 Talk 활동을 통해 다른 선생님들과 <br />
								소통하면서 의미 있는 시간을 보냈습니다. <br />
								<strong>비바새미 11기 활동을 한 것을 <br />
								평생 잊지 못할 것 같습니다.</strong>
							</p>
						</li>
						<li>
							<div className="top">
								<span className="flag">비바새미 11기</span>
								<span className="teacher">송O영 선생님</span>
							</div>
							<p className="body">
								열심히 교직에서 생활하고 계시는<br />
								선생님들을 보면서 자극을 많이 받았고,<br />
								선생님들께 양질의 자료를 제공하고자 노력하는 <br />
								비상교육에 감명을 받고 갑니다! <br />
								<strong>덕분에 2024 알찬 교직생활을 <br />
								하게 되었습니다.</strong> 감사합니다!
							</p>
						</li>

						{/*더보기 클릭시 보이는*/}
						{showAll && (
						<Fragment>
							<li>
								<div className="top">
									<span className="flag">비바새미 11기</span>
									<span className="teacher">박O진 선생님</span>
								</div>
								<p className="body">
									비바샘과 비상교육 교과서들을 좀 더<br />
									깊이 있게 알아볼 수 있어 좋았습니다. <br />
									<strong> 적절한 시기에 좋은 자료를 활용하니 수업이 <br />
									더욱 풍성해졌습니다.<br />
									주변 선생님들께도 좋은 자료를 소개해서 <br />
									같이 깊어지는 시간</strong>이어서 더욱 좋았습니다!
								</p>
							</li>
							<li>
								<div className="top">
									<span className="flag">비바새미 11기</span>
									<span className="teacher">조O훈 선생님</span>
								</div>
								<p className="body">
									재미있었고, 스스로 교육 활동과 학급<br />
									운영 등을 돌아볼 수도 있었네요.<br />
									비바새미 활동을 하며 ‘학교 바깥에서도 <br />
									할 수 있는 일이 있겠구나.’ 느꼈고,<br />
									이것저것 해 보고 싶다고 생각했습니다.<br />
									<strong> 새로운 도전을 하게 해 준 비바샘에 감사합니다. </strong>
								</p>
							</li>
							<li>
								<div className="top">
									<span className="flag">비바새미 11기</span>
									<span className="teacher">조O아 선생님</span>
								</div>
								<p className="body">
									덕분에 일 년간 <strong>좋은 자극도 많이 받고 <br />
									제 자신도 돌아볼 수 있는 시간</strong>이었습니다. <br />
									또 비바샘 곳곳에 있는 기능들도 유심히 <br />
									살펴보고 이용할 수 있어서 실제로 <br />
									저의 <strong> 수업 발전에 좋은 영향을 많이 받았습니다. </strong> <br />
									감사합니다.
								</p>
							</li>
						</Fragment>
						)}
					</ul>

					<div className="btnWrap">
						<button type="button" className="btnMore" style={{ display: showAll ? 'none' : 'block' }} onClick={this.commentListAddAction}><span className="blind">후기 더보기</span></button>
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