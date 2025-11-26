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
import ReactPlayer from 'react-player/youtube';


class Event extends Component {

	state = {
		isEventApply: false,    // 신청여부
		ytVideoSwitch: false,
		ytVideoThumb: false,
		evtComment: '',
		choosedQuiz2: '',
		choosedQuiz3: '',
		choosedQuiz4: '',
	}

	choosedQuiz = (e) => {
		if (!this.prerequisite(e)) {
			e.target.checked = false;
			return false;
		}

		const radioName = e.target.name;
		const choosedQuiz = e.target.value;

		if (radioName === 'rdo01') {
			this.setState({
				choosedQuiz2: choosedQuiz,
			});
		}

		if (radioName === 'rdo02') {
			this.setState({
				choosedQuiz3: choosedQuiz,
			});
		}
		if (radioName === 'rdo03') {
			this.setState({
				choosedQuiz4: choosedQuiz,
			});
		}

	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();

		try {
			await this.eventApplyCheck();
			// await this.eventAmountCheck();
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
		const {isEventApply} = this.state;

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

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 참여하셨습니다.");
			return false;
		}

		return true;
	}

	eventApply = async () => {
		const {SaemteoActions, eventId, handleClick, event, loginInfo} = this.props;
		const {evtComment, choosedQuiz2, choosedQuiz3, choosedQuiz4} = this.state;

		if (!await this.prerequisite()) {
			return;
		}

		if (evtComment.length === 0 || choosedQuiz2.length === 0 || choosedQuiz3.length === 0 || choosedQuiz4.length === 0) {
			common.info("퀴즈 정답을 모두 작성, 선택해주세요.");
			return false;
		}

		let answerContent = "에듀테크 꿀팁 자료집 신청";
		let answerNumber = "1";

		try {
			const eventAnswer = {
				eventId: eventId,
				memberId: loginInfo.memberId,
				eventAnswerContent: evtComment + "^||^" + choosedQuiz2 + "^||^" + choosedQuiz3 + "^||^" + choosedQuiz4,
			};

			SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

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

	//유튜브 재생
	ytVideoPlay = () => {
		const {ytVideoSwitch, ytVideoThumb} = this.state;

		this.setState({
			ytVideoSwitch: true,
			ytVideoThumb: true,
		}, () => {
		});
	}

	// 주관식
	setEvtComment = (e) => {
		if (!this.prerequisite(e)) {
			document.activeElement.blur();
			return false;
		}
		let evtComment = e.target.value;

		if (evtComment.length >= 20) {
			evtComment = evtComment.substring(0, 20);
		}

		this.setState({
			evtComment: evtComment
		});
	}



	render () {
		const {eventAnswerContents, eventAnswerCount, ytVideoSwitch, ytVideoThumb, evtComment } = this.state;
		const {event} = this.props;

		return (
			<section className="event240411">
				<div className="evtTitle">
					<h1><img src="/images/events/2024/event240411/evtTit.png" alt="관심사를 말해봐"/></h1>
					<div className="blind">
						<p>비바샘X상상그리다필름</p>
						<h2><span>영상 ON AIR 프로젝트3</span>관심사를 말해봐</h2>
						<p>
							“우리 회원님의 관심사는
							아주 다양합니다.”
						</p>
						<ul>
							<li>회원님이 원하던 교과서</li>
							<li>회원님이 원하던 수업 자료</li>
							<li>회원님이 원하던 에듀테크 수업</li>
						</ul>
						<p>원하는 건 전부 다 있는 비바샘!</p>
						<p>
							아래의 영상을 시청하고
							이벤트에 참여하시면
							풍성한 선물을 드립니다!
						</p>
						<dl>
							<dt>참여 기간</dt>
							<dd>4월 11일 (목) ~ 4월 28일(일)</dd>
						</dl>
						<dl>
							<dt>당첨자 발표</dt>
							<dd>5월 1일 (수)</dd>
						</dl>
					</div>
				</div>

				<div className="evtCont01">
					<div className="contVideo">
						<div className="innerVideo">
							<div className={"thumb " + (ytVideoThumb ? " " : "on")}>
								<img src="/images/events/2024/event240411/thumb.png" alt="회원님의 관심사" />
								<button onClick={this.ytVideoPlay}  className="btn_play">
									<span className="blind">재생하기</span>
								</button>
							</div>
							<ReactPlayer
									url={'https://www.youtube.com/embed/Thvo9uvMSfc?si=q-_sP1wVgrR5o-UJ'}
									width="100%"
									height="100%"
									playing={ytVideoSwitch}
							/>
						</div>
					</div>

					<h1><img src="/images/events/2024/event240411/evt1.png" alt="EVENT 1. 깜짝 퀴즈"/></h1>
					<div className="blind">
						<p>
							영상을 시청하고 비바샘이 준비한
							깜짝 퀴즈를 풀어보세요!
						</p>
						<p>
							정답을 모두 맞춘 선생님 중 추첨을 통해 총 150분께 깜짝 선물을 드립니다.
							(Hint. 영상 속에 정답이 숨어 있습니다.)
						</p>
						<ul>
							<li>투썸플레이스 스트로베리 초콜릿 생크림 - 10명</li>
							<li>배스킨라빈스 쿼터 아이스크림 - 40명</li>
							<li>맘스터치 싸이버거 단품 - 100명</li>
						</ul>
					</div>

					<div className="form_wrap">

						<div className="form_cont">
							<p className="form_label"><span>Q1</span></p>
							<dl>
								<dt>
									내용이 체계적으로 잘 정리되어 있고, 삽화와 글이 조화롭고,<br/>
									디자인이 한 눈에 들어오며 활용 가능한 자료가 많은<br/>
									온라인 사이트가 있는 책은 무엇일까요?
								</dt>
								<dd>
									<textarea onChange={this.setEvtComment} value={evtComment} maxLength={20} placeholder="(주관식)"></textarea>
								</dd>
							</dl>
						</div>

						<div className="form_cont">
							<p className="form_label"><span>Q2</span></p>
							<dl>
								<dt>
									가상 실험실 도구 조작으로 안전하고 다양한 실험을 할 수 있는<br/>
									에듀테크 모의 실험실 서비스명은?
								</dt>
								<dd>
									<div className="rdo_wrap row2">
										<div className="rdo">
											<input type="radio" name="rdo01" id="rdo0101" value="과학 가상 실험실" onClick={this.choosedQuiz}/>
											<label htmlFor="rdo0101">과학 가상 실험실</label>
										</div>
										<div className="rdo">
											<input type="radio" name="rdo01" id="rdo0102" value="AI 연산 학습지" onClick={this.choosedQuiz}/>
											<label htmlFor="rdo0102">AI 연산 학습지</label>
										</div>
										<div className="rdo">
											<input type="radio" name="rdo01" id="rdo0103" value="비바샘 미술관" onClick={this.choosedQuiz}/>
											<label htmlFor="rdo0103">비바샘 미술관</label>
										</div>
										<div className="rdo">
											<input type="radio" name="rdo01" id="rdo0104" value="VR 역사 답사" onClick={this.choosedQuiz} />
											<label htmlFor="rdo0104">VR 역사 답사</label>
										</div>
									</div>
								</dd>
							</dl>
						</div>

						<div className="form_cont">
							<p className="form_label"><span>Q3</span></p>
							<dl>
								<dt>비바샘에 있는 은행은 무엇일까요?</dt>
								<dd>
									<div className="rdo_wrap">
										<div className="rdo">
											<input type="radio" name="rdo02" id="rdo0201" value="넘옙은행" onClick={this.choosedQuiz} />
											<label htmlFor="rdo0201">넘옙은행</label>
										</div>
										<div className="rdo">
											<input type="radio" name="rdo02" id="rdo0202" value="비바은행" onClick={this.choosedQuiz}/>
											<label htmlFor="rdo0202">비바은행</label>
										</div>
										<div className="rdo">
											<input type="radio" name="rdo02" id="rdo0203" value="문제은행" onClick={this.choosedQuiz}/>
											<label htmlFor="rdo0203">문제은행</label>
										</div>
									</div>
								</dd>
							</dl>
						</div>

						<div className="form_cont">
							<p className="form_label"><span>Q4</span></p>
							<dl>
								<dt>비바샘은 비상교과서를 사용하는 선생님만 사용할 수 있다?</dt>
								<dd>
									<div className="rdo_wrap">
										<div className="rdo">
											<input type="radio" name="rdo03" id="rdo0301" value="O" onClick={this.choosedQuiz}/>
											<label htmlFor="rdo0301">O</label>
										</div>
										<div className="rdo">
											<input type="radio" name="rdo03" id="rdo0302" value="X" onClick={this.choosedQuiz}/>
											<label htmlFor="rdo0302">X</label>
										</div>
									</div>
								</dd>
							</dl>
						</div>

						<p className="txt">※ 퀴즈의 정답을 모두 작성 및 선택하신 후, 아래의 ‘참여하기’ 버튼을 눌러주세요.</p>
					</div>

					<button type="button" className="btnApply" onClick={this.eventApply}><span className="blind">신청하기</span></button>
				</div>

				<div className="evtCont02">
					<h1><img src="/images/events/2024/event240411/evt2.png" alt="EVENT 2. 유튜브 이벤트"/></h1>
					<div className="blind">
						<p>
							비바샘 채널 구독과 좋아요를 누르고 영상 시청 후
							선생님의 관심사는 무엇인지 댓글로 남겨주세요.
							100명을 추첨해 시원한 음료를 드립니다!
						</p>
						<p>
							이벤트 참여는 아래의 비바샘 유튜브 바로가기 버튼을 클릭해 주세요.
							유튜브 영상 설명 더보기란에서 참여 방법을 확인하실 수 있습니다.
						</p>
					</div>

					<a href="https://youtu.be/Thvo9uvMSfc?si=ES6-u_5K6id9JwRk" target="_blank" className="btnYoutube"><span className="blind">비바샘 유튜브 바로가기</span></a>
				</div>


				<div className="evtFooterWrap">
					<h6>유의사항</h6>
					<ul>
						<li>- 본 이벤트는 교사인증을 완료한 학교 선생님 대상 이벤트입니다.</li>
						<li>- 각 이벤트는 1인 1회 참여하실 수 있습니다.</li>
						<li>- 이벤트 2번은 이벤트 1번과 중복으로 참여 및 당첨이 가능합니다.</li>
						<li>- 참여 완료 후 수정 및 추가 참여가 어렵습니다.</li>
						<li>- 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
						<li>- 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
						<li>- 경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다. <br/>㈜카카오 사업자등록번호 : 120-81-47521), ㈜다우기술 사업자등록번호: 220-81-02810), <br/>㈜모바일이앤엠애드 사업자등록번호:215-87-19169</li>
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