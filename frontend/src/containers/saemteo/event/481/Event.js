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
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";


class Event extends Component{
	state = {
		isEventApply : false,	// 신청여부
		isEventApply2 : false,	// 신청여부
		eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
		eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/462',
		pageNo : 1, 				// 페이지
		eventAnswerContents : [],	// 이벤트2 참여내용
		eventAnswerCount : 0,		// 이벤트1 참여자 수
		eventContents : "",
		curLength: 0, //현재 글자수
		tabOn: 1,
		videoArr: [
			'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/갤럭시탭/갤럭시탭_전체.mp4',
			'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/아이패드/아이패드_전체.mp4',
			'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/크롬북/크롬북_전체.mp4',
			'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/웨일북/웨일북_전체.mp4'
		],
		choosedVideo: '',
	}

	constructor(props){
		super(props)
		this.videoRef = [];
	}


	componentDidMount = async () => {
		const {BaseActions, event} = this.props;
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

		await this.setEventInfo();
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

	setEventInfo = async () => {
		const {event, SaemteoActions} = this.props;

		event.teacherAnnual = '';
		event.teacherStory = '';
		SaemteoActions.pushValues({type: "event", object: event});
	}


	videoState = (index) => {
		const selectedVideoRef = this.videoRef;

		Array.from(selectedVideoRef, (ele ,idx)=> {

			if(!(index == idx+ 1)){
				ele.pause();
			}
		})
	}

	tabChange = (e) => {
		const {tabOn} = this.props;
		const val = e.currentTarget.getAttribute('value');

		this.setState({
			tabOn: val,
		})

		this.videoState(val);
	}

	handleChange = (e) => {
		const {event, SaemteoActions} = this.props;

		if (!this.prerequisite(e)) {
			return;
		}

		SaemteoActions.pushValues({type: "event", object: event});
	}

	// 전제 조건
	prerequisite = (e) => {
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
			common.error("이미 신청하셨습니다.");
			return false;
		}

		return true;
	}

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {SaemteoActions, eventId, handleClick, loginInfo, event,  eventAnswer} = this.props;
		const { isEventApply, choosedVideo} = this.state;

		let eventContents = "";

		if (!this.prerequisite(e)) {
			return;
		}

		// 기 신청 여부
		if (isEventApply) {
			common.error("이미 신청하셨습니다.");
			return false;
		}

		if(choosedVideo.length === 0) {
			common.info("퀴즈의 정답을 선택해 주세요.");
			return false;
		}

		try {

			const eventAnswer = {
				eventId : eventId,
				memberId: loginInfo.memberId,
				eventAnswerContent : choosedVideo,
			};

			SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
			handleClick(eventId);    // 신청정보 팝업으로 이동
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	}

	choosedVideo = (e) => {
		if (!this.prerequisite(e)) {
			e.target.checked = false;
			return false;
		}

		this.setState({
			choosedVideo: e.target.value,
		});
	}

	handleClickPage = async (pageNo) => {
		const {BaseActions} = this.props;

		this.setState({
			pageNo : pageNo
		});
		BaseActions.openLoading();
		setTimeout(() => {
			try {
				this.commentConstructorList();	// 댓글 목록 조회
			} catch (e) {
				console.log(e);
				common.info(e.message);
			} finally {
				setTimeout(() => {
					BaseActions.closeLoading();
				}, 300);//의도적 지연.
			}
		}, 100);
	}


	render() {
		const {eventAnswerCount, eventAnswerContents, pageNo, pageSize, tabOn, videoArr} = this.state;
		const {event} = this.props;
		const totalPage = Math.ceil(eventAnswerCount / pageSize);
		const curPage = pageNo;
		const pagesInScreen = 5;
		let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
		let endPageInScreen = startPageInScreen + pagesInScreen - 1;

		if (totalPage < endPageInScreen) {
			endPageInScreen = totalPage;
		}
		// 페이징
		const pageList = () => {
			const result = [];
			for (let i = startPageInScreen; i <= endPageInScreen; i++) {
				result.push(<li className={curPage === i ? 'on' : ''} onClick={() => {
					this.handleClickPage(i).then()
				}}><button>{i}</button></li>);
			}
			return result;
		}

		//css용 인덱스



		return (
			<section className="event231218">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2023/event231218/evtTit.png" alt="내가 꿈꾸는 나의 교과서"/>
						<div className="blind">
							<h3>
								<span>비바샘이 간다! 후속 시리즈</span>
								스마트기기 똑똑! 하게 알아보기
							</h3>
							<span>
									학교 수업에서 사용하고 있는 스마트 기기!
								</span>
							<p>
								2023년 ‘비바샘이 간다’ 프로그램에서 ​
								선생님들이 주신 의견을 바탕으로 ​
								기초 사용법 영상이 제작되었습니다!​
							</p>
							<span>
									기초 사용법 영상을 보고 퀴즈를 풀면, 추첨을 통해 선물을 드려요!​
								</span>
							<div className="evtPeriod">
								<div className="blind">
									<div><span className="tit blind">참여 기간​</span><span className="txt"><span
										className="blind">2023.12.18(월) ~ 12.31(일)​</span></span></div>
									<div><span className="tit blind">당첨자 발표​</span><span className="txt"><span
										className="blind">2024.01.02(화)​</span></span></div>
								</div>
							</div>
							<ul>
								<li>
									<p>
										삼성전자​<br />
										스마트 키보드 트리오 500​<br />
										<span>(25명)</span>
									</p>
								</li>
								<li>
									<p>
										올리브영<br />
										기프트카드 1만원 권<br />
										<span>(100명)</span>
									</p>
								</li>
								<li>
									<p>
										스타벅스<br />
										카페 아메리카노 T<br />
										<span>(200명)</span>
									</p>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="evtCont2">
					<img src="/images/events/2023/event231218/evtCont.png" alt=""/>
					<div className="blind">
						<ul>
							<li>
								<div className="top">
									<strong className="num">01.</strong>
									<p>
										기기의 시작 및<br />
										종료 순서 안내
									</p>
								</div>
								<p>
									외부 조작 버튼을 활용해 기기를<br />
									<span>켜고 끄는 법,​ 반납 전 확인할 사항</span>까지<br />
									꼼꼼히 설명합니다.​

								</p>
							</li>
							<li>
								<div className="top">
									<strong className="num">02.</strong>
									<p>
										맞춤 설정법 <br />
										설명
									</p>
								</div>
								<p>
									화면 밝기, 음향, 와이파이 등​<br />
									<span>기본 시스템을 제어할 수 있는 방법</span>을<br />
									안내합니다.​​

								</p>
							</li>
							<li>
								<div className="top">
									<strong className="num">03.</strong>
									<p>
										필수 활용 기능<br />
										탑재
									</p>
								</div>
								<p>
									정보 검색과 파일 다운로드, 펜슬 활용,<br />
									앱 설치 등​ <span>수업에 꼭 사용되는 <br /> 다양한 활용법</span>
									을 알려 줍니다.​
								</p>
							</li>
						</ul>
					</div>
					<div className={"video"}>
						<div className="tab_wrap">
							<ul className="tab_menu">
								<li className={tabOn == 1 ? 'on': ''}>
									<a href="javascript:void(0)" onClick={this.tabChange} value={1}>
										갤럭시탭
									</a>
								</li>
								<li className={tabOn == 2 ? 'on': ''}>
									<a href="javascript:void(0)" onClick={this.tabChange} value={2}>
										아이패드
									</a>
								</li>
								<li className={tabOn == 3 ? 'on': ''}>
									<a href="javascript:void(0)" onClick={this.tabChange} value={3}>
										크롬북
									</a>
								</li>
								<li className={tabOn == 4 ? 'on': ''}>
									<a href="javascript:void(0)" onClick={this.tabChange} value={4}>
										웨일북
									</a>
								</li>
							</ul>
						</div>

						{Array.from({ length: 4 }, (_, index) => {
							return (
								<div className={"tab_conts " + (tabOn == index + 1? 'on' : '')} >
									<video
										ref = {(ref) => this.videoRef[index] = ref}
										controls = {true}
									>
										<source src={videoArr[index]} type="video/mp4"/>
									</video>
								</div >
							)
						})}






						{/*<div className={"tab_conts " + (tabOn == 1? 'on' : '')} >*/}
						{/*	<video*/}
						{/*		controls = {true}*/}
						{/*		onPlay={tabOn ==  1? true : false}*/}
						{/*	>*/}
						{/*		<source src={'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/갤럭시탭/갤럭시탭_전체.mp4'} type="video/mp4"/>*/}
						{/*	</video>*/}
						{/*</div >*/}
						{/*<div className={"tab_conts " + (tabOn == 2? 'on' : '')}>*/}
						{/*	<video*/}
						{/*		controls = {true}*/}
						{/*		onPlay={tabOn ==  2? true : false}*/}
						{/*	>*/}
						{/*		<source src={'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/아이패드/아이패드_전체.mp4'} type="video/mp4"/>*/}
						{/*	</video>*/}
						{/*</div >*/}
						{/*<div className={"tab_conts " + (tabOn == 3? 'on' : '')}>*/}
						{/*	<video*/}
						{/*		controls = {true}*/}
						{/*		onPlay={tabOn ==  3? true : false}*/}
						{/*	>*/}
						{/*		<source src={'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/크롬북/크롬북_전체.mp4'} type="video/mp4"/>*/}
						{/*	</video>*/}
						{/*</div >*/}
						{/*<div className={"tab_conts " + (tabOn == 4? 'on' : '')}>*/}
						{/*	<video*/}
						{/*		controls = {true}*/}
						{/*		onPlay={tabOn ==  4? true : false}*/}
						{/*	>*/}
						{/*		<source src={'https://dn.vivasam.com/movie/contents/학교 스마트기기 매뉴얼/웨일북/웨일북_전체.mp4'} type="video/mp4"/>*/}
						{/*	</video>*/}
						{/*</div >*/}
						<div className={'quiz'}>
							<strong>
								<img src="/images/events/2023/event231218/quiz_tit.png" alt="영상에서 설명하지 않은 기능은 무엇일까요?"/>
								<span className="blind">영상에서 설명하지 않은 기능은 무엇일까요?</span>
							</strong>
							<ul>
								<li>
									<input type="radio" name="quiz" id="quiz1" value="와이파이 연결" onClick={this.choosedVideo}/>
									<label htmlFor="quiz1">와이파이 연결</label>
								</li>
								<li>
									<input type="radio" name="quiz" id="quiz2" value="펜슬 활용 및 화면 분할" onClick={this.choosedVideo}/>
									<label htmlFor="quiz2">펜슬 활용 및 화면 분할</label>
								</li>
								<li>
									<input type="radio" name="quiz" id="quiz3" value="디자인 프로그램 활용법" onClick={this.choosedVideo}/>
									<label htmlFor="quiz3">디자인 프로그램 활용법</label>
								</li>
								<li>
									<input type="radio" name="quiz" id="quiz4" value="앱 설치 및 QR 코드 접속" onClick={this.choosedVideo}/>
									<label htmlFor="quiz4">앱 설치 및 QR 코드 접속</label>
								</li>
							</ul>
							<span className="quiz_noti">※퀴즈 정답을 선택하신 후, 아래의 <em>‘이벤트 참여하기’</em> 버튼을 눌러주세요</span>
						</div>
						<div className={"btn_wrap"}>
							<button className="btnApply" onClick={this.eventApply}>
								<span className="blind">이벤트 참여하기</span>
							</button>
						</div>
					</div>


				</div>

				<div className="notice">
					<strong>유의사항</strong>
					<ul>
						<li>1인 1회 참여하실 수 있습니다</li>
						<li>본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
						<li>참여 완료 후에는 참여 내역 수정 및 추가 참여가 어렵습니다.</li>
						<li>개인 정보 오기재/유효 기간 내 기프티콘 미사용에 따른 재발송은 어렵습니다.</li>
						<li>이벤트 당첨자의 잘못된 개인정보 전달로 인한 불이익(연락 불가, 경품 반송/분실 등)은<br /> 책임지지 않습니다.</li>
						<li>경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br /> (㈜카카오 사업자등록번호 120-81-47521)</li>
						<li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
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
	})
)(withRouter(Event));