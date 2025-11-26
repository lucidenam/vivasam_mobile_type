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
import * as myclassActions from 'store/modules/myclass';

// 경품의 총 수량
const GIFT_TYPE_START = 3;
const GIFT_TYPE_END = 7;
// 경품 종류
const GIFT_LIST = [
	{id: '3', name: '선풍기', imgUrl: '/images/events/2021/event210722/gift01.png'},
	{id: '4', name: '무선 충전패드', imgUrl: '/images/events/2021/event210722/gift02.png'},
	{id: '5', name: '무선마우스', imgUrl: '/images/events/2021/event210722/gift03.png'},
	{id: '6', name: '셀카봉 겸 삼각대', imgUrl: '/images/events/2021/event210722/gift04.png'},
	{id: '7', name: '홈트용품', imgUrl: '/images/events/2021/event210722/gift05.png'}
];
	



class Event extends Component {

	state = {
		activeSubEventId: '', 	// 현재 진행중인 이벤트 - eventId가 서버에서 string으로 내려옴
		isActiveSubEventProgressing: false,
        isEventApply: false,    // 신청여부
		
		totalAmount: 0,
		amountList: [0,0,0,0,0],	// 임시 수량
		
		allAmountFull: true,       // 전체 경품 소진여부
		rdoAmountFull: [true, true, true, true, true],      // 경품 소진 여부
		rdoChecked: -1,         // 선택된 경품 idx
		nickname: '',
		message: '',
		
		myAnswerGiftNo: '',
		myAnswerNickname: '',
		myAnswerMessage: ''
    }

	componentDidMount = async () => {
		const {eventId, BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			// 현재 진행중인 서브 이벤트 조회
			await this.fetchEventSubEventList(eventId);
			const activeSubEventId = this.state.activeSubEventId;

			// 현재 진행중인 서브 이벤트 참여정보 조회
			await this.eventApplyCheck(this.state.activeSubEventId);

			// 현재 진행중인 서브 이벤트 경품조회
			await this.eventAmountCheck(activeSubEventId);
			
			await this.getMyAnswer(activeSubEventId);
			
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

	};


	fetchEventSubEventList = async( eventId ) => {

		// 1. 하위 이벤트 목록 조회
		const response = await api.eventSubEventList(eventId);

		// 2. 현재 활성화된 하위 이벤트 아이디 추출
		let subEventList = response.data.eventList;
		if (subEventList.length === 0) return;
		
		let subEvent, activeSubEventId, isActiveSubEventProgressing;
		for (let i = 0, size = subEventList.length; i < size; i++) {
			subEvent = subEventList[i];
			// 1번이벤트부터 진행중인 최초의 이벤트를 활성화된 이벤트라 간주
			if (subEvent.progressing) {
				activeSubEventId = subEvent.eventId;
				isActiveSubEventProgressing = subEvent.progressing;
				break;
			}
		}

		// 3. 모든 이벤트가 끝났을 경우 마지막 이벤트를 activeEventId로 설정
		if (!activeSubEventId) {
			activeSubEventId = subEventList[subEventList.length - 1].eventId;
			isActiveSubEventProgressing = subEventList[subEventList.length -1].progressing;
		}

		// 4. 현재 activeEventId 설정
		this.setState({
			activeSubEventId: activeSubEventId,
			isActiveSubEventProgressing: isActiveSubEventProgressing
		});

	}

    eventApplyCheck = async(eventId) => {
        const { logged } = this.props;
        
        if(logged){
            const response = await api.chkEventJoin({eventId});
            if(response.data.eventJoinYn === 'Y'){
                this.setState({
                    isEventApply: true
                });
            }
        }
    }


	eventAmountCheck = async(eventId) => {
		const { SaemteoActions } = this.props;
		
		let { allAmountFull } = this.state;
		let params1 = {};
		params1.eventId = eventId; // 이벤트 ID

		let total = 0, amountList = [];
		let rdoAmountFullArr = [];
		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;
			
			for (let i = GIFT_TYPE_START, size = GIFT_TYPE_END; i <= size; i++) {
				amountList.push(responseData['qntCnt_'+i]);	// 각 경품별 잔여수량
				
				total += Number(responseData['qntCnt_'+i] || 0);
				const isRdoAmountFull = responseData['qntCnt_'+i] <= 0;
				rdoAmountFullArr.push(isRdoAmountFull); //
				// 하나의 경품이라도 full이 아니면 전체경품 소진된것이 아니므로 나머지 경품중 신청가능
				if (!isRdoAmountFull) {
					allAmountFull = false;
				}
			}
			
		} catch (e) {
			console.log(e);
			// 조회 실패시 모든 경품 신청불가하도록 신청수량 꽉참으로 표시
			for (let i = GIFT_TYPE_START, size = GIFT_TYPE_END; i <= size; i++) {
				rdoAmountFullArr.push(true); //
			}
		}

		this.setState({
			totalAmount : total,
			allAmountFull: allAmountFull,
			rdoAmountFull: rdoAmountFullArr,

			amountList : amountList
		});
	}


	// 이벤트 신청 검사
	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		
		const { rdoChecked, nickname , message } = this.state;
		
		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
		} else {
			
			// 준회원일 경우 신청 안됨.
			if (loginInfo.mLevel != 'AU300') {
				common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
				return false;
			}

			// 교사 인증
			if (loginInfo.certifyCheck === 'N') {
				BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
				common.info("교사 인증 후 이벤트 참여를 해주세요.");
				window.location.hash = "/login/require";
				window.viewerClose();
				return false;
			}

			// 로그인시
			try {
				if(this.state.isEventApply){
					common.error("이미 신청하셨습니다");
					return false;
				}

				
				// 입력값 점검				
				if (!GIFT_LIST[rdoChecked]) {
					common.info("상품을 선택해주세요.");
					return;
				}
				const nicknameLength = nickname.length;
				if (nicknameLength < 2 || nicknameLength > 10) {
					common.info("별명은 최소 2자에서 최대 10자까지 입력가능합니다.");
					return;
				}
				const messageLength = message.length;
				if (messageLength < 10 || messageLength > 200) {
					common.info("메시지는 최소 10자에서 최대 200자까지 입력가능합니다.");
					return;
				}
				
				let eventAnswer = {
					activeSubEventId: this.state.activeSubEventId,
					giftNo: GIFT_LIST[this.state.rdoChecked].id,
					giftName: GIFT_LIST[this.state.rdoChecked].name,
					giftNoIdx: this.state.rdoChecked,
					nickname: nickname,
					message: message
				};

				SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

				handleClick(eventId);
			} catch (e) {
				console.log(e);
			} finally {
				setTimeout(() => {
				}, 1000);//의도적 지연.
			}
		}
	};




	buildTotalHtml = () => {
		const {totalAmount} = this.state;

		const totalNumStr = totalAmount.toString();
		const totalNumStrLen = totalNumStr.length;

		let totalNumStrLeftPaddingZero = totalNumStr;
		while (totalNumStrLeftPaddingZero.length < 4) totalNumStrLeftPaddingZero = "0" + totalNumStrLeftPaddingZero;

		let num = '', html = '';
		for (var i = 0, size = 4; i < size; i++) {
			num = totalNumStrLeftPaddingZero.charAt(i);
			if (totalNumStrLen <= (4-i)  && num === '0') {
				html += '<em class="off">' + num + '</em>';
			} else {
				html += '<em>' + num + '</em>';
			}

			if (i === 0) {
				html += '<sub>,</sub>';
			}
		}
		return html;
	}
	
	handleChangeGift = (e) => {
		this.checkLogin();
		
		let selectedGiftIdx = -1;
		for (let i = 0, size = GIFT_LIST.length; i < size; i++) {
			if (GIFT_LIST[i].id === e.target.value) {
				selectedGiftIdx = i;
				break;				
			}
		}
		
		// 상품 소진여부 체크
		if (selectedGiftIdx >= 0) {
			const {allAmountFull, rdoAmountFull} = this.state;
			if (allAmountFull) {
				common.info("상품이 모두 소진되었습니다.");
				return;
			}
			if (rdoAmountFull[selectedGiftIdx]) {
				common.info("상품이 모두 소진되었습니다. 다른 상품을 선택해 주세요.");
				return;
			}
		}
		
		
		this.setState({
			rdoChecked : Number(selectedGiftIdx)
		});
		
	}
	
	checkLogin = () => {
		
		const {logged, history, BaseActions} = this.props;

		if (!logged) { // 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
		}
	}
	
	handleChangeNickname = (e) => {
		this.setState({
			nickname : e.target.value
		})
	}
	handleChangeMessage = (e) => {
		this.setState({
			message: e.target.value
		})
	}

	handleKeyDownNickName = (e) => {
		if (e.keyCode === 191) {
			e.preventDefault();
		}
	}

	getMyAnswer = async (activeSubEventId) => {
		const {logged, SaemteoActions } = this.props;
		if (!logged) { // 미로그인시
			return;
		}
		
		var params = {
			eventId : activeSubEventId
		}
		try {
			const response = await SaemteoActions.getEventMyAnswer({...params});
			const responseData = response.data.answer;

			if (responseData) {
				//
				const idx = responseData.indexOf('^||^');
				const giftName = responseData.substring(0, idx);
				const giftInfo = this.findGiftByName(giftName);
				const giftNo = giftInfo ? giftInfo.id : '';

				const answer = responseData.substring(idx + 4);

				const idx2 = answer.indexOf('/');
				const nickname = answer.substring(0, idx2);
				let msg = answer.substring(idx2 + 1);
				msg = msg.replace(/(<([^>]+)>)/gi, "");
				msg = msg.replace(/(?:\r\n|\r|\n)/g, '<br>');

				this.setState({
					myAnswerGiftNo: giftNo,
					myAnswerNickname: nickname,
					myAnswerMessage: msg
				});
			}
		} catch (e) {
			common.error('나의 신청정보 조회중 오류가 발생했습니다.');
			return;
		}
	}
	
	findGiftById = (id) => {
		for (let i=0, size=GIFT_LIST.length; i<size; i++) {
			if (id === GIFT_LIST[i].id) return GIFT_LIST[i];
		}
		return null;
	}

	findGiftByName = (name) => {
		for (let i=0, size=GIFT_LIST.length; i<size; i++) {
			if (name === GIFT_LIST[i].name) return GIFT_LIST[i];
		}
		return null;
	}

	
	render() {
		const { rdoAmountFull, rdoChecked } = this.state;
		
		return (
			<section className="event210722">
				<div className="evtCont evtTitWrap">
					<div className="inner">
						<h1><img src="/images/events/2021/event210722/img01.png" alt="비바샘이 준비하는 궁금한 선물. 선생님이, 선생님에게" /></h1>
						<div className="evtTitInfo">
							<span className="blind">매주 선착순 1,000개의 선물이 배달됩니다</span>
							<p>
								나에겐 어떤 메시지와 선물이 도착할까요?<br /><br />
								내 앞의 선생님이 선택한 서프라이즈 선물을 받고<br />
								내 뒤의 선생님에게 전달하고 싶은 서프라이즈 선물을 고르는<br />
								<strong className="point01">릴레이 선물 이벤트!</strong><br />
								선생님의 마음이 담긴 메시지가<br />
								전국 어딘가의 선생님께 소중한 응원이 되어 날아갑니다.
							</p>
							<div className="evtPeriod">
								<span className="tit">이벤트 기간 :</span><span className="txt"><em>2021.07.22</em>(목)<em>~08.18</em>(수)</span>
							</div>
							<span className="periodTxt">*선착순 이벤트로 상품 소진시 조기 종료됩니다.</span>
						</div>
					</div>
				</div>
				<div className="evtCont evtSection">
					<div className="inner">
						<div className="scheduleWrap">
							<div className="tblWrap">
								<table>
									<colgroup>
										<col style={{width: '20%'}} />
										<col style={{width: '50%'}} />
										<col style={{width: '30%'}} />
									</colgroup>
									<thead>
										<tr>
											<th scope="col">이벤트</th>
											<th scope="col">참여 기간</th>
											<th scope="col">선물 배송</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td scope="row">1회차</td>
											<td>7월 22일 ~ 7월 28일</td>
											<td>8월 2일 이후</td>
										</tr>
										<tr>
											<td scope="row">2회차</td>
											<td>7월 29일 ~ 8월 4일</td>
											<td>8월 9일 이후</td>
										</tr>
										<tr>
											<td scope="row">3회차</td>
											<td>8월 5일 ~ 8월 11일</td>
											<td>8월 16일 이후</td>
										</tr>
										<tr>
											<td scope="row">4회차</td>
											<td>8월 12일 ~ 8월 18일</td>
											<td>8월 23일 이후</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p className="tblInfoTxt">멋진 메시지를 남겨주신<strong>선생님 10분을<br />매주 선정하여</strong> 특별한 여름 선물을<br />추가로 보내드립니다!</p>
						</div>
					</div>
				</div>
				<div className="evtCont evtSection">
					<div className="inner">
						<h3>참여 방법</h3>
						<ol className="evtStepList">
							<li>
								<span className="stepTit">STEP 01</span>
								내 뒤의 선생님께 드리고 싶은<br />선물을 골라주세요.
							</li>
							<li>
								<span className="stepTit">STEP 02</span>
								선물을 받는 선생님께 메시지를<br />남겨주세요.
							</li>
							<li>
								<span className="stepTit">STEP 03</span>
								<strong>다음 주 나에게 도착할 선물을<br />기다려 주세요!</strong> 
							</li>
						</ol>
						<ul className="evtNotiList">
							<li>이벤트 기간 중 <strong>아이디당 1회 참여</strong> 가능하며, 내 뒤의 선생님께 응모하신 선생님의 별명과 메시지로 선물이 배송됩니다.</li>
							<li>이벤트 참여 완료 후 <strong>선택하신 선물은 변경하실 수 없습니다.</strong></li>
							<li>이벤트 신청란에 <strong>입력하신 주소로 선물이 배송됩니다.</strong><br />주소 오류로 반품된 선물은 다시 배송해드리지 않습니다.</li>
							<li>매주 화요일에 특별한 여름 선물을 받으실 10분을 선정하여 발표합니다. (공지사항)</li>
						</ul>
						<div className="evtFormWrap">
							<div className="giftNoti">
								<span className="tit">현재 남은 선물</span>
								<span className="num" dangerouslySetInnerHTML={{ __html : this.buildTotalHtml()}}>

								</span>
								<span className="txt">개</span>
							</div>
							<div className="evtForm">
								
								<div className="rdoWrap">
									{
										GIFT_LIST.map((item, idx) => {
											const rdoTagId = 'rdo0' + (idx + 1);
											return (
												<div className="rdo" key={idx}>
													<input type="radio" name="rdo" id={rdoTagId} value={item.id} className={rdoAmountFull[idx] ? 'disabled' : ''} onChange={this.handleChangeGift} checked={idx === rdoChecked} />
													<label htmlFor={rdoTagId}>
														<span className="imgWrap"><img src={item.imgUrl} alt={item.name} /></span>
														<span className="txt">{item.name}</span>
													</label>
												</div>
											);
										})
									}
									
								</div>
								
								<div className="multiWrap">
									<div className="input">
										<label htmlFor="input01"><input type="text" id="input01" placeholder="보내시는 선생님의 별명을 입력해 주세요." onFocus={this.checkLogin} onChange={this.handleChangeNickname} onKeyDown={this.handleKeyDownNickName} maxLength="10"/></label>
									</div>
									<div className="textareaWrap">
										<textarea name="giftComment" id="giftComment" placeholder="선물을 받으시는 선생님께 메시지를 남겨 주세요." onFocus={this.checkLogin} onChange={this.handleChangeMessage}></textarea>
									</div>
								</div>
							</div>
							{/* [DEV] 2021-07-22 마감스티커 사용시 btnWrap영역에 class="on" 추가 */}
							<div className={this.state.allAmountFull ? 'btnWrap on' : 'btnWrap'}>
								<button type="button" className="btnApply" id="btnShowForm" onClick={this.eventApply}>참여 완료</button>
								<p className="endBadge">선착순 1,000명 <strong>완료</strong></p>
							</div>
						</div>
					</div>
				</div>
				<div className="evtCont evtSection">
					<div className="inner">
						<h3>내가 선택한 선물과 메시지</h3>
						{/* DEV] 응모내역 없을 경우 giftMsgWrap 영역에 className="nodata"추가 */}
						<div className={ !this.state.myAnswerGiftNo ? 'giftMsgWrap nodata' : 'giftMsgWrap' }>
							<div className="imgWrap">
								{ /* 신청한 상품이미지 */
									this.state.myAnswerGiftNo && 
										GIFT_LIST.map((item, idx) => {
											if (item.id === this.state.myAnswerGiftNo) {
												return (
													<img src={item.imgUrl} alt={item.name} key={item.id}/>
												)
											}
										})
								}
							</div>
							{	/* 신청한 경우 */
								this.state.myAnswerGiftNo && (
									<div className="msgWrap">
										<strong className="tit">{this.state.myAnswerNickname}</strong>
										<p className="txt" dangerouslySetInnerHTML={{ __html: this.state.myAnswerMessage}}></p>
									</div>
								)
							}
							{ 	/* 신청하지 않은 경우 */
								!this.state.myAnswerGiftNo && (
									<div className="msgWrap">
									<p className="infoTxt">선생님께서 응모하신 내역이 없습니다.</p>
									</div>	
								)
							}
						</div>
					</div>
				</div>
            </section>
		);
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
		MyclassActions: bindActionCreators(myclassActions, dispatch)
	})
)(withRouter(Event));