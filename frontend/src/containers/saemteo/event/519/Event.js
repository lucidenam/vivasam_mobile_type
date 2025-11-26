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

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부
		evtTabId:1,
		videoSwitch1: false,
		videoThumb1: false,
		videoSwitch2: false,
		videoThumb2: false,
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;

		const fullhash = window.location.hash;
		const hash  = fullhash.includes('#tab') ? fullhash.split('#').pop() : '';
		const tabId = hash === 'tab2' ? 2 : 1;


		this.setState({
			evtTabId: tabId,
			videoSwitch1: tabId === 1,
			videoSwitch2: tabId === 2
		});

		BaseActions.openLoading();

		setTimeout(() => {
			const tabMenuEle = document.querySelector('.tabWrap');

			if (tabMenuEle) {
				if (tabId === 1 || tabId === 2) {
					tabMenuEle.scrollIntoView({
						behavior: 'smooth'
					});

					setTimeout(() => {
						window.scrollBy({
							top: 55,
							behavior: 'smooth'
						});
					}, 500);
				}
			} else {

			}
		}, 300);


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

	handleDownloadClick = async () => {
		alert("이벤트가 종료되어 다운로드가 불가합니다."); // 알림 띄우기
		return false;
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
	tabMenuClick = (num, item1, item2) => {
		const { history } = this.props;
		const { evtTabId, videoSwitch1, videoSwitch2} = this.state;

		// 탭 클릭시 url 뒤에 tab 붙이기
		history.push(`#tab${num}`);

		this.setState({
			evtTabId:num,
		});

		item1.play();
		item2.pause();

		if(num == 1) {
			this.setState({
				videoSwitch1:true,
				videoSwitch2:false,
			})
		}
		if(num == 2) {
			this.setState({
				videoSwitch1:false,
				videoSwitch2:true,
			})
		}
	};

	//유튜브 재생
	// videoPlay = (num) => {
	// 	const {videoSwitch1, videoSwitch2, videoThumb1, videoThumb2} =this.state;
	//
	// 	if(num === 1){
	// 		this.setState({
	// 		})
	// 	}else {
	// 		this.setState({
	// 			videoSwitch2: true,
	// 			videoThumb2: true,
	// 		})
	// 	}
	// }

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
		const { evtTabId, videoSwitch1, videoThumb1, videoSwitch2, videoThumb2 } = this.state;

		return (
			<section className="event240819">
				<div className="evtIntro">
					<h1><img src="/images/events/2024/event240819_2/img1.png" alt=""/></h1>
					<div className="blind">
					</div>
					<Link to="/wechall" className="btn_view"><span className="blind">위챌 자세히 보기</span></Link>
					<div className="tabWrap">
						<ul className="tabMenu">
							<li className={evtTabId == 1 ? 'on' : ''}>
								<button type="button" onClick={() => this.tabMenuClick(1, this.itemRef1, this.itemRef2)}>인터뷰</button>
							</li>
							<li className={evtTabId == 2 ? 'on' : ''}>
								<button type="button" onClick={() => this.tabMenuClick(2, this.itemRef2, this.itemRef1)}>활용법</button>
							</li>
						</ul>

						<div className={"contVideo " + (evtTabId == 1 ? 'on' : '')}>
							<video ref={(ref) => this.itemRef1 = ref}
										 controls controlsList="nodownload">
								<source src={"https://dn.vivasam.com/vs/event/zip/contents/디지털 교육혁신 시나리오 카드_인터뷰 영상.mp4"} type="video/mp4"/>
							</video>
							{/*<div className={"thumb " + (videoThumb1 ? " " : "on")}>
								<img src="/images/events/2024/event240819_2/thumb1.jpg" alt="위챌이벤트" />
								<button onClick={() => this.videoPlay(1)} className="btn_play">
									<span className="blind">재생하기</span>
								</button>
							</div>
							<ReactPlayer
									url={'https://www.youtube.com/embed/MQbgeRauKzc?si=npzrs1lwXVBEMxMU'}
									width="100%"
									height="100%"
									playing={videoSwitch1}
									onPlay={() => this.setState({videoSwitch1:true})}
							/>*/}
						</div>

						<div className={"contVideo " + (evtTabId == 2 ? 'on' : '')}>
							<video ref={(ref) => this.itemRef2 = ref}
										 controls controlsList="nodownload">
								<source src={"https://dn.vivasam.com/vs/event/zip/contents/디지털 교육혁신 시나리오 카드_활용법 영상.mp4"} type="video/mp4"/>
							</video>
							{/*<div className={"thumb " + (videoThumb2 ? " " : "on")}>
								<img src="/images/events/2024/event240819_2/thumb2.jpg" alt="위챌이벤트" />
								<button onClick={() => this.videoPlay(2)} className="btn_play">
									<span className="blind">재생하기</span>
								</button>
							</div>
							<ReactPlayer
								url={'https://www.youtube.com/embed/IRsVzusqtHc?si=qqfKG61sTxFAyPkg'}
								width="100%"
								height="100%"
								playing={videoSwitch2}
								onPlay={() => this.setState({videoSwitch2:true})}
							/>*/}
						</div>

					</div>

					<a href="javascript:void(0)" className="btn_down" onClick={this.handleDownloadClick}><span className="blind">가이드북 다운로드</span></a>
				</div>
				<div className="evtCont01">
					<h3><img src="/images/events/2024/event240819_2/img2.png" alt="어떤 카드들이 있나요?"/></h3>
					<button type="button" className="btnApply" onClick={this.eventApply}><span className="blind">신청하기</span></button>
				</div>
				<div className="evtFooterWrap">
					<h3><img src="/images/events/2024/event240819_2/img3.png" alt="유의사항"/></h3>
					<div className="blind">
						<h6>신청 시 유의 사항</h6>
						<ul>
							<li>1인 1회 1세트만 신청할 수 있으며, 교사 인증을 완료하신 선생님만 신청이 가능합니다.</li>
							<li>본 이벤트는 초등학교 / 중학교 / 고등학교 교사만 참여 가능하며, 교육대학생/일반대학생 <br/>또는 유치원 교사, 교육청 소속 직원으로 가입한 비바샘 회원은  참여 불가합니다.</li>
							<li>수령처를 정확히 기입해 주세요. 주소가 잘못 기재되어 오발송되거나 반송된 자료는 <br/>다시 발송해 드리지 않습니다.</li>
							<li>신청하신 자료는 선생님 재직 학교의 인근 비상교육 지사 혹은 배송 업체를 통해 이벤트 <br/>종료일 이후 순차적으로 전달할 예정입니다.</li>
							<li>신청자 개인 정보(성명/주소/휴대 전화 번호)가 비상교육 지사 및 배송 업체에 공유됩니다. <br/>㈜CJ대한통운 사업자번호: 110-81-05034 / ㈜한진택배 사업자등록번호: 201-81-02823</li>
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
		MyclassActions: bindActionCreators(myclassActions, dispatch),
		ViewerActions: bindActionCreators(viewerActions, dispatch)
	})
)(withRouter(Event));