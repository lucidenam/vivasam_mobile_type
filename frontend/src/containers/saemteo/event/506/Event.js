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
		imgSrc: "book1",
		isShowDetailPop:false,
		selectBook:""
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
		let selectBook = e.currentTarget.value;

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

		if(selectBook == "ES"){
			if (loginInfo.schoolLvlCd !== 'ES') {
				alert("초등 선생님만 신청하실 수 있습니다.");
				return;
			}
		}else if (selectBook == "MS"){
			if (loginInfo.schoolLvlCd !== 'MS' && loginInfo.schoolLvlCd !== "HS") {
				alert("중고등 선생님만 신청하실 수 있습니다.");
				return;
			}
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

	eventDetailView = (e) => {
		this.setState({
			imgSrc: e.currentTarget.value,
			isShowDetailPop:true,
		});
	};

	closeEventDetailView = () => {
		this.setState({
			isShowDetailPop:false,
		});
	};

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {SaemteoActions, eventId, handleClick} = this.props;
		let selectBook = e.currentTarget.value;

		if (!this.prerequisite(e)) {
			document.activeElement.blur();
			return false;
		}

		try {
			const eventAnswer = {
				eventAnswerDesc: selectBook
			};
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
		const { imgSrc , isShowDetailPop} = this.state;
		return (
			<section className="event240527">
				<div className="evtCont1">
					<div className="evtTit">
						<h1><img src="/images/events/2024/event240527/img1.png" alt="AI 디지털 교과서 2022 개정 교육과정"/></h1>
						<div className="blind">
							<p>비상한 꿀팁 나눔 이벤트</p>
							<p>AI 디지털교과서 2022 개정 교육과정 2022% 대비하기</p>
							<p>신청 기간 _  5. 27.(월) ~ 6. 3.(월)</p>
							<p>
								새로운 교육과정 완벽 대비!
								비상교육에서 A to Z 모두 알려 드립니다.
								지금 바로 자료집을 신청하세요!
							</p>
							<ul>
								<li>
									<p>AI 디지털교과서?</p>
									<p>
										AI 디지털교과서는 인공지능을 포함한
										지능 정보 기술을 활용하여, 다양한 학습 자료,
										학습 지원 기능 등을 탑재한
										소프트웨어 형태의 교과서입니다.
										학생 개인의 능력과 수준에 맞는
										다양한 맞춤형 학습 기회를 지원합니다.
									</p>
								</li>
								<li>
									<p>2022 개정 교육과정?</p>
									<p>
										2022년 12월 발표된 교육과정으로,
										2024년부터 현장에 순차적으로 적용됩니다.
									</p>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="evtCont02">
					<h1><img src="/images/events/2024/event240527/img2.png" alt="AI 디지털 교과서 2022 개정 교육과정"/></h1>
					<div className="blind">
						<p>초등</p>
						<p>
							AI 디지털교과서가 무엇인지,
							언제부터 적용되는지,
							핵심 기능은 무엇인지
							알 수 있습니다.
						</p>
						<p>
							2022 개정
							초등 교육과정의
							주요 변화를 살펴볼 수
							있습니다.
						</p>
					</div>
					<button type="button" className="btnView po1" onClick={this.eventDetailView} value="book1">
						<span className="blind">자세히보기</span>
					</button>
					<button type="button" className="btnView po2" onClick={this.eventDetailView} value="book2">
						<span className="blind">자세히보기</span>
					</button>
					<button type="button" className="btnApply" onClick={this.eventApply} value={"ES"}>
						<span className="blind">신청하기</span>
					</button>
				</div>

				<div className="evtCont03">
					<h1><img src="/images/events/2024/event240527/img3.png" alt="AI 디지털 교과서 2022 개정 교육과정"/></h1>
					<div className="blind">
						<p>중고등</p>
						<p>
							AI 디지털교과서가 무엇인지,
							언제부터 적용되는지,
							핵심 기능은 무엇인지
							알 수 있습니다.
						</p>
						<p>
							2022 개정
							초등 교육과정의
							주요 변화를 살펴볼 수
							있습니다.
						</p>
					</div>
					<button type="button" className="btnView po3" onClick={this.eventDetailView}  value="book3">
						<span className="blind">자세히보기</span>
					</button>
					<button type="button" className="btnView po4" onClick={this.eventDetailView}  value="book4">
						<span className="blind">자세히보기</span>
					</button>
					<button type="button" className="btnApply" onClick={this.eventApply} value={"MS"}>
						<span className="blind">신청하기</span>
					</button>
				</div>

				<div className="evtCont04">
					<h1><img src="/images/events/2024/event240527/img4.png" alt="AI 디지털 교과서 2022 개정 교육과정"/></h1>
					<div className="blind">
						<p>
							AI 디지털교과서 + 교육과정 안내 자료는
							‘비바샘 초등/중고등 > 수업 연구소 >
							살아있는 수업 채널’에서 E-book으로
							살펴보시거나, PDF로 다운로드하실 수 있습니다.
						</p>
					</div>
					<div className="evtBtns">
						<a href="https://me.vivasam.com/#/livelesson/aidtNewcurriculum" className="btn1"><span className="blind">초등 바로가기</span></a>
						<a href="https://mv.vivasam.com/#/liveLesson/aidtNewcurriculum" className="btn2"><span className="blind">중고등 바로가기</span></a>
					</div>
				</div>

				{isShowDetailPop &&
					<div className="evtDetailViewPop">
						<div className="popBox">
							<button type="button" className="closeDetailPop" onClick={this.closeEventDetailView}><span className="blind">닫기</span></button>
							<img src={"/images/events/2024/event240527/" + imgSrc + ".png"} alt="AI 디지털 교과서 2022 개정 교육과정"/>
						</div>
					</div>
				}

				<div className="notice">
					<strong>유의사항</strong>
					<ul className="info">
						<li>- 1인 1회 1부만 신청할 수 있으며, 교사 인증을 완료한 해당 학교급 선생님만 신청이 <br/>가능합니다.</li>
						<li>- 선착순 신청으로 수량 소진 시 이벤트 신청이 마감됩니다.</li>
						<li>- 자료집은 학교로만 배송이 가능합니다. 학교 주소와 수령처를 정확히 기입해 주세요.</li>
						<li>- 주소 기재가 잘못되어 오발송되거나 반송된 자료집은 다시 발송해 드리지 않습니다.</li>
						<li>- 신청하신 자료는 선생님 재직 학교의 인근 비상교육 지사를 통해, <br/>이벤트 종료 후 10일 이내 전달할 예정입니다.</li>
						<li>- 신청자 개인 정보(성명/주소/휴대 전화 번호)가 배송 업체 및 비상교육 지사에 공유됩니다. <br/>(주)CJ대한통운 사업자번호: 110-81-05034 / ㈜한진택배 사업자등록번호: 201-81-02823</li>
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