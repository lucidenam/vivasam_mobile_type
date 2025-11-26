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
import moment from "moment";
import {Cookies} from "react-cookie";


const cookies = new Cookies();
const eventStartDate = new Date("2023-02-13");
const eventEndDate = new Date("2023-03-31");


class Event extends Component{
	state = {
		isEventApply: false,    	// 신청여부

		checkArray: [false, false, false, false, false],
		comment1: '',				// 제안
		commentLength1: 0,			// 제안 길이
		selectCampaign : '',		// 선택한 캠페인 내용

		ticketRemainNum : 0,
		urlSaveYn : '',
		memberJoinDate : null,

		eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/429',
		agreeCheck: 0,				// 개인정보 수집 이용 동의 여부 ( 0 : 거부 / 1 : 승인 )
		updateAgreeCheck: 0,		// 개인정보 수정 시 수집 동의 여부 ( 0 : 거부 / 1 : 승인 )
		numSpace : 0,				// 룰렛 상품의 값
		prizeIdx : 0,
		prizeName: "",
		rolBox: '',
		eventEnd: false,

		scrollX : window.innerWidth,
	}




	componentDidMount = async () => {
		const {BaseActions, SaemteoActions, loginInfo, event, roulette,} = this.props;
		const {scrollX} = this.state;
		console.log(loginInfo);
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.eventTicketNumCheck();
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

		console.log(scrollX);

		event.url = '';
		SaemteoActions.pushValues({type: "event", object: event});

		if(roulette.start) {
			const BODY = document.documentElement;
			const Rol = document.getElementById("roulette_board");

			setTimeout(function(){
				BODY.scrollTo(0, scrollX * 2.7);
			}, 1000);

			this.startRol();
		}

		this.setState({
			memberJoinDate : new Date(loginInfo.regDate),
		})

	};

	// 기 신청 여부 체크
	eventApplyCheck = async() => {
		const { logged, eventId, event, SaemteoActions } = this.props;

		if (logged) {
			const response = await api.chkEventJoin({eventId});
			if (response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}

			event.eventJoinYn = response.data.eventJoinYn;
			SaemteoActions.pushValues({type: "event", object: event});
		}
	}

	eventTicketNumCheck = async() => {
		const { logged, eventId, event, SaemteoActions } = this.props;

		if (logged) {
			const response = await api.getRouletteTicketNum({eventId});
			console.log(response.data);
			this.setState({
				ticketRemainNum : response.data.ticketRemainNum,
				urlSaveYn : response.data.urlSaveYn,
			});

			event.ticketRemainNum = response.data.ticketRemainNum;
			event.urlSaveYn = response.data.urlSaveYn;
			SaemteoActions.pushValues({type: "event", object: event});
		}

	}

	prerequisitionUrl = async(e) => {
		const { logged,  loginInfo, history, BaseActions, event, eventId} = this.props;
		const { isEventApply, urlSaveYn, memberJoinDate} = this.state;

		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			e.target.value = "";
			return;
		}

		if(!(eventStartDate <= memberJoinDate && memberJoinDate <= eventEndDate)) {
			alert("이벤트 기간에 가입한 신규회원만 참여 가능합니다.");
			e.target.value = "";
			return;
		}
		// 교사 인증
		if (loginInfo.certifyCheck === 'N') {
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			e.target.value = "";
			return;
		}
		// 준회원일 경우 신청 안됨.
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			e.target.value = "";
			return;
		}
		// 기 신청 여부
		if (urlSaveYn === 'Y' || urlSaveYn === 'N') {
			common.error("이미 참여하셨습니다.\n소문내기 룰렛 티켓은 1회만 지급 가능합니다.");
			e.target.value = "";
			return;
		}
	}

	urlRegister = async() => {
		const { logged,  loginInfo, history, BaseActions, event, eventId} = this.props;
		const { isEventApply, urlSaveYn, memberJoinDate} = this.state;

		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		if(!(eventStartDate <= memberJoinDate && memberJoinDate <= eventEndDate)) {
			alert("이벤트 기간에 가입한 신규회원만 참여 가능합니다.");
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
		if (urlSaveYn === 'Y' || urlSaveYn === 'N') {
			common.error("이미 참여하셨습니다.\n소문내기 룰렛 티켓은 1회만 지급 가능합니다.");
			return;
		}

		if(!event.url || !event.url.includes(":") || !event.url.includes("/")) {
			alert("정확한 URL을 입력해주세요.");
			return;
		}

		var params = {
			eventId: eventId,
			url: event.url,
		};

		const response = await api.rouletteSaveUrl(params);

		if (response.data.code === '0') {
			alert('참여가 완료되었습니다. \n룰렛 티켓 1개가 지급되었습니다.');
			window.location.reload();
		} else {
			common.error('url등록 중 오류가 발생했습니다. \n다시 시도해주세요.');
		}

	}

	// 회원가입 버튼 Function
	checkJoinChange = () => {
		const {logged, history} = this.props;
		if (!logged) {
			cookies.set("returnEvent387", true, {
				expires: moment().add(1, 'hours').toDate()
			});
			history.push('/join/select');
		} else {
			common.info("이미 회원이신 경우, 개인정보 업데이트 이벤트에 참여해 주세요");
		}
	};

	//신규 캠페인 제안 textarea에 onFocus시
	onFocusComment = (e) => {
		const {logged, history, BaseActions, loginInfo} = this.props;
		const {isEventApply, checkArray} = this.state;
		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			document.activeElement.blur();
			return;
		}
		// 교사 인증
		else if (loginInfo.certifyCheck === 'N') {
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			document.activeElement.blur();
			return;
		}
		// 준회원일 경우 신청 안됨.
		else if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
			document.activeElement.blur();
			return;
		}
		// 기 신청 여부
		// else if (isEventApply) {
		// 	common.error("이미 신청하셨습니다.");
		// 	document.activeElement.blur();
		// 	return;
		// }

		// 체크박스 자동 체크
		if (checkArray[4] === false) {
			let cnt = 0;
			for (let i in checkArray) {
				if (checkArray[i]) {
					cnt++;
				}
			}
			if (cnt >= 2) {
				common.info('최대 2개까지 선택 가능합니다.');
				document.activeElement.blur();
			} else {
				checkArray[4] = true;
			}

			let selectContents = '';
			for (let i in checkArray) {
				if (checkArray[i]) {
					if (selectContents === '') {
						selectContents = ++i;
					} else {
						selectContents += ' , ' + ++i;
					}
				}
			}

			this.setState({
				checkArray: checkArray,
				selectCampaign: selectContents
			});
		}
	};

	setComment = (e) => {
		let comment = e.target.value;
		let commentLength = comment.length;

		if (commentLength >= 100) {
			comment = comment.substring(0, 100);
			commentLength = comment.length;
		}

		this.setState({
			comment1: comment,
			commentLength1: commentLength
		});
	};

	// 신규 가입 회원 이벤트 참여
	eventApply = async () => {
		const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick} = this.props;
		const { isEventApply, checkArray, comment1, commentLength1, selectCampaign, agreeCheck, memberJoinDate, ticketRemainNum} = this.state;

		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		if(!(eventStartDate <= memberJoinDate && memberJoinDate <= eventEndDate)) {
			alert("이벤트 기간에 가입한 신규회원만 참여 가능합니다.");
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
		if (ticketRemainNum == null || ticketRemainNum <= 0) {
			common.error("룰렛 티켓이 없습니다.");
			return;
		}

		try {

			// const eventAnswer = {
			// 	eventAnswerDesc1 : selectCampaign,
			// 	eventAnswerDesc2 : checkArray[4] ? comment1 : '',
			// };
			//
			// SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
			handleClick(eventId);    // 신청정보 팝업으로 이동
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(()=>{
			}, 1000);//의도적 지연.
		}
	};


	handleChange = (e) => {
		const {event, SaemteoActions} = this.props;
		if (e.target.name === 'agree1') {
			event[e.target.name] = e.target.checked;
		} else {
			event[e.target.name] = e.target.value;
		}
		SaemteoActions.pushValues({type: "event", object: event});
	};

	handleUpdateChange = (e) => {
		this.setState({
			updateAgreeCheck: !this.state.updateAgreeCheck
		});
	};

	// 룰렛 돌리기
	startRol = () => {
		const {roulette} = this.props;
		const {numSpace, prizeIdx, prizeName,  } = this.state;

		const tmpPrizeName = roulette.prizeName;
		const tmpPrizeIdx = roulette.prizeIdx;
		let tmpNumSpace = 0;



		if(tmpPrizeName == "스타벅스") {
			tmpNumSpace = 3;
		} else if(tmpPrizeName == "페레로로쉐") {
			tmpNumSpace = 15;
		} else if(tmpPrizeName == "바나나우유") {
			tmpNumSpace = 7;
		} else if(tmpPrizeName == "비요뜨 초코링") {
			tmpNumSpace = 11;
		} else if(tmpPrizeName == "무선줄넘기") {
			tmpNumSpace = 9;
		} else if(tmpPrizeName == "에어팟") {
			tmpNumSpace = 5;
		} else if(tmpPrizeName == "아이패드") {
			tmpNumSpace = 13;
		} else if(tmpPrizeName == "비바콘 200P") {
			tmpNumSpace = 1;
		}

		this.setState({
			numSpace: tmpNumSpace,
			prizeName : tmpPrizeName,
			prizeIdx: tmpPrizeIdx,
		});
	}

	// 확인버튼 누르기
	resetNum = () => {
		const {SaemteoActions, roulette} = this.props;
		const {eventEnd} = this.state;
		this.setState({
			eventEnd: true,
		})

		roulette.start = false;
		SaemteoActions.pushValues({type: "roulette", object: roulette});

		window.location.reload();
	}

	copyToClipboard = (e) => {
		// 글을 쓸 수 있는 란을 만든다.
		let aux = document.createElement("input");
		// 지정된 요소의 값을 할당 한다.
		aux.setAttribute("value", this.state.eventUrl);
		// bdy에 추가한다.
		document.body.appendChild(aux);
		// 지정된 내용을 강조한다.
		aux.select();
		// 텍스트를 카피 하는 변수를 생성
		document.execCommand("copy");
		// body 로 부터 다시 반환 한다.
		document.body.removeChild(aux);
		common.info('링크가 복사되었습니다.\n동료 선생님과 함께 이벤트에 참여해 보세요.');
	};

	joinVivasam = (e) => {
		const {logged, history} = this.props;
		if(logged) {
			common.info('로그인되어 있는 상태입니다.');
		} else {
			history.push("/join/select");
		}
	}









	render () {
		const { checkArray, comment1, commentLength1, numSpace, rolBox, eventEnd, ticketRemainNum, prizeName, prizeIdx} = this.state;
		const {event, roulette} = this.props;

		// 룰렛 애니메이션 스타일
		let {style, url} = this.state;

		// 당첨박스 on
		let {rBox} = this.state;

		// 당첨된 품목 클래스 값으로 주기
		if(numSpace > 0){
			setTimeout(( ) => {
				if(prizeName === "에어팟"){
					this.setState({ rolBox: 'airpod', })
				}else if (prizeName === "비요뜨 초코링"){
					this.setState({ rolBox: 'yogurt', })
				}else if (prizeName === "아이패드"){
					this.setState({ rolBox: 'ipad', })
				}else if (prizeName === "페레로로쉐"){
					this.setState({ rolBox: 'chocolate', })
				}else if (prizeName === "스타벅스"){
					this.setState({ rolBox: 'coffee', })
				}else if (prizeName === "비바콘 200P"){
					this.setState({ rolBox: 'con', })
				}else if (prizeName === "바나나우유"){
					this.setState({ rolBox: 'banana', })
				}else if (prizeName === "무선줄넘기"){
					this.setState({ rolBox: 'jumprope', })
				}
			}, 4500)
		}

		style = {
			transform: numSpace > 0 ? 'rotate('+ ((360*8)+ (22.5 * numSpace)) + 'deg)' : 'rotate(0deg)' ,
			transition: 'all 4s ease ',
			visibility: 'visible'
		}

		rBox = {
			display : rolBox.length > 0 ? 'block': 'none',
		}



		return (
			<section className="event230131">
				<div className="evtCont01">
					<img src="/images/events/2023/event230131/evtCont1.png" alt="비바샘 입학식" />
					<div className="blind">
						<h2>비바샘 입학식</h2>
						<p>성생님! 비바샘은 처음이시죠?</p>
						<p>비바샘에 방문하신것을 진심으로 환영합니다.</p>
						<p>
							회원가입 후 주변 선생님들께 이벤트 소식을 알려주시면<br />
							100% 당첨~! 푸집한 입학 선물이 와르르 쏟아집니다!
						</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span>
								<span className="txt">2023년 1월 31일(화) ~ 2023년 3월 26일(일)</span>
							</li>
							<li>
								<span className="tit">경품 발송</span>
								<span className="txt">매주 화요일 경품발송</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="evtCont02">
					<img src="/images/events/2023/event230131/evtCont2.png" alt="비바샘 입학식" />
					<div className="blind">
						<h3><span>1</span>회원가입</h3>
						<ul>
							<li><span className="tit">참여대상</span>
								<span className="txt">교사 인증이 완료된 비바샘 신규 회원</span>
							</li>
							<li><span className="tit">참여 방법</span>
								<span className="txt">비바샘 신규 회원가입시 자동으로 티켓 1회 추가</span>
							</li>
						</ul>
						<span>※ 교사 서류 인증의 경우, 평일 기준으로 하루가 지난 뒤에 티켓이 생성됩니다.​</span>
						<span>1회 추가</span>
					</div>
					<a href="javascript:void(0)" className="btnJoin" onClick={this.joinVivasam}><span className="blind">회원가입 하러가기</span></a>
				</div>

				<div className="evtCont03">
					<img src="/images/events/2023/event230131/evtCont3.png" alt="비바샘 입학식" />
					<div className="blind">
						<h3><span>2</span>이벤트 소문내기</h3>
						<ul>
							<li><span className="tit">참여대상</span>
								<span className="txt">교사 인증이 완료된 비바샘 신규 회원</span>
							</li>
							<li><span className="tit">참여 방법</span>
								<span className="txt">
									&#60;비바샘 입학식&#62; 이벤트를<br />
									SNS/커뮤니티에 소문내 주세요!
								</span>
							</li>
						</ul>
						<span>1회 추가</span>
					</div>
					<a href="javascript:void(0)" className="btnShare" onClick={this.copyToClipboard}><span className="blind">URL 복사하기</span></a>
					<span className="urlForm">
						<input type="text"
							   placeholder="공유한 URL을 입력해주세요"
							   name="url"
							   value={event.url}
							   onKeyPress={this.prerequisitionUrl}
							   onChange={this.handleChange}
						/>
						<button className="btnRegister" onClick={this.urlRegister}>등록하기</button>
					</span>
				</div>

				<div className="evtCont04">
					<div className="roulette">
						<div className="board_wrap">
							<div className="board"
								style={style}
								 id = "roulette_board"
							></div>
							<button type="button" id="rulStart" className="btn_start"  onClick = {this.eventApply} disabled={roulette.start}>
								<span className="ticket" id="ticketNum">{ticketRemainNum}</span>
							</button>
							<div id="rouletteResult" className={"end" } style={rBox}>
								<div className={"end_cont " + rolBox} >
									<p>당첨을 축하합니다!</p>
									<span id="giftName">문화상품권 2000원권</span>
									<div className="btnWrap">
										<button type="button" onClick={this.resetNum}><span></span></button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="evtCont05">
					<h2>유의사항</h2>
					<ul className="evtInfoList">
						<li>① 해당 이벤트는 1인 최대 2회까지 참여하실 수 있습니다.</li>
						<li className="info_color">
							② 아이패드 에어, 에어팟 3세대 당첨의 경우,<br />
							제세공과금(22%)이 부여됩니다.
						</li>
						<li>③ 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
						<li>④ 등록된 정보 중 학교 정보가 불명확한 경우 경품 대상에서 제외됩니다.</li>
						<li>
							⑤ 교사 미인증 및 필수정보 미입력, 본인 미인증 회원인 경우<br />
							이벤트 경품 지급에서 제외됩니다.
						</li>
						<li>
							⑥ 정확하지 않은 휴대전화 정보로 반송되거나 유효 기간 동안 기프티콘을<br />
							사용하지 않은 경우, 재발송되지 않습니다.
						</li>
						<li>
							⑦ 선물 발송을 위해 개인정보(성명, 휴대전화번호, 주소)가 서비스사와<br />
							상품 배송업체에 제공됩니다.<br />
							(㈜카카오 사업자등록번호 120-81-47521)<br />
							(㈜한진 사업자등록번호: 201-81-02823)
						</li>
						<li>
							⑧ &#60;비바샘 입학식&#62; 이벤트 참여 후 탈퇴하여 재참여하는 경우,<br />
							경품 지급에서 제외됩니다.
						</li>
						<li>
							⑨ 이벤트 기간 중 탈퇴하여 재가입한 경우, 경품 지급에서 제외됩니다.
						</li>
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
		roulette: state.saemteo.get('roulette').toJS(),
		answerPage: state.saemteo.get('answerPage').toJS(),
		eventAnswer: state.saemteo.get('eventAnswer').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		SaemteoActions: bindActionCreators(saemteoActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch),
	})
)(withRouter(Event));