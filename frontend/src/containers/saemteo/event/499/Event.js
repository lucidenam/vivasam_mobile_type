import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {Link, withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import * as viewerActions from 'store/modules/viewer';
import {bindActionCreators} from "redux";
import ReactPlayer from "react-player/youtube";

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부
		evtTabId:1,
		ytVideoSwitch1: false,
		ytVideoThumb1: false,
		ytVideoSwitch2: false,
		ytVideoThumb2: false,
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
	}

	// 전제 조건
	prerequisite = async () => {
		const {logged, history, BaseActions, loginInfo} = this.props;
		const {isEventApply, chkAllAmountFull} = this.state;

		// 모든 상품 소진 여부
		if (chkAllAmountFull) {
			common.info("종료된 이벤트 입니다.");
			return false;
		}

		// 로그인 여부
		if (!logged) {
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return false;
		}

		// 교사 인증 여부
		if (loginInfo.certifyCheck === 'N') {
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			return false;
		}

		// 준회원 여부
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			return false;
		}

		// // 초등학교 선생님 여부
		// let myClassInfo = await this.getMyClassInfo();
		// let schoolLvlCd = myClassInfo.schoolLvlCd;
		// // 초등 교사 여부
		// if (schoolLvlCd !== 'ES') {
		// 	common.info("초등학교 선생님 대상 이벤트 입니다.");
		// 	return false;
		// }

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		return true;
	}

	eventApply = async () => {
		const {SaemteoActions, eventId, handleClick} = this.props;

		if (!await this.prerequisite()) {
			return;
		}

		let answerContent = "에듀테크 꿀팁 자료집 신청";
		let answerNumber = "1";

		try {
			const eventAnswer = {
				eventAnswerContent : answerContent,
				answerNumber: answerNumber
			};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

			handleClick(eventId);
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	};

	getMyClassInfo = async () => {
		const {MyclassActions} = this.props;
		try {
			let result = await MyclassActions.myClassInfo();
			return result.data;
		} catch (e) {
			console.log(e);
		}
	}

	// 탭
	tabMenuClick = (num) => {
		const { evtTabId, ytVideoSwitch1, ytVideoSwitch2} = this.state;

		this.setState({
			evtTabId:num,
			ytVideoSwitch1:false,
			ytVideoSwitch2:false,
		})
	};

	//유튜브 재생
	ytVideoPlay = (num) => {
		const {ytVideoSwitch1, ytVideoSwitch2, ytVideoThumb1, ytVideoThumb2} =this.state;

		if(num === 1){
			this.setState({
				ytVideoSwitch1: true,
				ytVideoThumb1: true,
			})
		}else {
			this.setState({
				ytVideoSwitch2: true,
				ytVideoThumb2: true,
			})
		}
	}

	appDown = (type) => {
		if(type === 'IOS'){
			// console.log('IOS 다운로드')
			window.location.href = "https://apps.apple.com/kr/app/%EC%9C%84%EC%B1%8C-we-are-challengers/id6480443602";
		}else if(type === 'AOS'){
			// console.log('안드로이드 다운로드')
			window.location.href = "https://play.google.com/store/apps/details?id=com.visang.wechall";
		}
	}

	render () {
		const { evtTabId, ytVideoSwitch1, ytVideoThumb1, ytVideoSwitch2, ytVideoThumb2 } = this.state;

		return (
			<section className="event240429">
				<div className="evtIntro">
					<h1><img src="/images/events/2024/event240429/img1.png" alt=""/></h1>
					<div className="blind">
					</div>
					<Link to="/wechall" className="btn_view"><span className="blind">위챌 자세히 보기</span></Link>
					<div className="tabWrap">
						<ul className="tabMenu">
							<li className={evtTabId == 1 ? 'on' : ''}>
								<button type="button" onClick={() => this.tabMenuClick(1)}>선생님용<i></i></button>
							</li>
							<li className={evtTabId == 2 ? 'on' : ''}>
								<button type="button" onClick={() => this.tabMenuClick(2)}>학생용<i></i></button>
							</li>
						</ul>

						<div className={"contVideo " + (evtTabId == 1 ? 'on' : '')}>
							<div className={"thumb " + (ytVideoThumb1 ? " " : "on")}>
								<img src="/images/events/2024/event240429/thumb1.jpg" alt="위챌이벤트" />
								<button onClick={() => this.ytVideoPlay(1)} className="btn_play">
									<span className="blind">재생하기</span>
								</button>
							</div>
							<ReactPlayer
									url={'https://www.youtube.com/embed/MQbgeRauKzc?si=npzrs1lwXVBEMxMU'}
									width="100%"
									height="100%"
									playing={ytVideoSwitch1}
									onPlay={() => this.setState({ytVideoSwitch1:true})}
							/>
						</div>

						<div className={"contVideo " + (evtTabId == 2 ? 'on' : '')}>
							<div className={"thumb " + (ytVideoThumb2 ? " " : "on")}>
								<img src="/images/events/2024/event240429/thumb2.jpg" alt="위챌이벤트" />
								<button onClick={() => this.ytVideoPlay(2)} className="btn_play">
									<span className="blind">재생하기</span>
								</button>
							</div>
							<ReactPlayer
								url={'https://www.youtube.com/embed/IRsVzusqtHc?si=qqfKG61sTxFAyPkg'}
								width="100%"
								height="100%"
								playing={ytVideoSwitch2}
								onPlay={() => this.setState({ytVideoSwitch2:true})}
							/>
						</div>

					</div>
					
					<h1><img src="/images/events/2024/event240429/img2.png" alt=""/></h1>
					<div className="btn_app_down_wrap">
						<a href="javascript:void(0);" onClick={() => this.appDown('AOS')} className="btn_down"><span className="blind">안드로이드 다운로드</span></a>
						<a href="javascript:void(0);" onClick={() => this.appDown('IOS')} className="btn_down"><span className="blind">IOS 다운로드</span></a>
					</div>
				</div>
				<div className="evtCont01">
					<h3><img src="/images/events/2024/event240429/evt1.png" alt="위챌 다작상"/></h3>
					<div className="blind">

					</div>
				</div>
				<div className="evtCont02">
					<h3><img src="/images/events/2024/event240429/evt2.png" alt="위챌 그룹상"/></h3>
					<div className="blind">

					</div>
				</div>
				<div className="evtCont03">
					<h3><img src="/images/events/2024/event240429/evt3.png" alt="위챌 인기상"/></h3>
					<div className="blind">

					</div>
					<button type="button" className="btnApply" onClick={this.eventApply}><span className="blind">신청하기</span></button>
				</div>
				<div className="evtFooterWrap">
					<h6>유의사항</h6>
					<ul>
						<li className="ty2">본 이벤트는 비바샘 교사 인증을 완료한 선생님 대상 이벤트입니다.</li>
						<li className="ty2">이벤트에 참여하기 위해 제작한 챌린지 영상 내의 부적절한 내용이 발견되거나, <br/>같은 주제의 챌린지를 반복해서 올리는 행위, 매크로 사용과 같은 신의성실에 <br/>어긋나는 행위가 발견되는 경우, 해당 영상의 수량이 제외되거나 당첨이 취소될 수 있습니다.</li>
						<li>이벤트 1, 3 간 중복 당첨은 불가합니다. 이벤트 1, 3 모두 순위권 내에 드셨다면 더 높은 <br/>순위의 경품만 지급합니다.</li>
						<li>각 이벤트 내 중복 당첨은 불가합니다. 상위 금액 경품만 지급합니다.</li>
						<li>이벤트 2에서 좋아요 수가 0인 경우 당첨에서 제외됩니다.</li>
						<li>이벤트 3에서 참여자 수가 0인 경우 당첨에서 제외됩니다.</li>
						<li>동점자가 있을 시 당첨자 선발을 위한 순위는 추첨을 통하여 결정됩니다.</li>
						<li>개인 정보 오기재/유효 기간 내 기프티콘 미사용에 따른 재발송은 어렵습니다.</li>
						<li>이벤트 당첨자의 잘못된 개인 정보 전달로 인한 불이익(연락 불가, 경품 반송/분실 등)은 <br/>책임지지 않습니다.</li>
						<li>경품 발송을 위해 개인 정보(성명, 휴대 전화 번호, 주소)가 서비스사와 배송업체에 제공됩니다.​ <br/>(주)모바일이앤엠애드 사업자등록번호: 215-87-19169​ <br/>아기자기 선물가게 사업자등록번호: 530-31-00427​ <br/>우체국 택배 사업자등록번호: 206-83-02050​</li>
						<li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.​</li>
						<li>이번 이벤트에는 비바콘이 지급되지 않습니다.</li>
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
		BaseActions: bindActionCreators(baseActions, dispatch),
		MyclassActions: bindActionCreators(myclassActions, dispatch),
		ViewerActions: bindActionCreators(viewerActions, dispatch)
	})
)(withRouter(Event));