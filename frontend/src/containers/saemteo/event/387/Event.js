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

class Event extends Component{
	state = {
		isEventApply: false,    	// 신청여부

		checkArray: [false, false, false, false, false],
		applyCampaignLength: 0,		// 신규 캠페인 제안 내용 길이
		comment1: '',				// 제안
		commentLength1: 0,			// 제안 길이
		selectCampaign : '',		// 선택한 캠페인 내용

		agreeCheck: 0,				// 개인정보 수집 이용 동의 여부 ( 0 : 거부 / 1 : 승인 )
		updateAgreeCheck: 0,		// 개인정보 수정 시 수집 동의 여부 ( 0 : 거부 / 1 : 승인 )
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
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			document.activeElement.blur();
			return;
		}
		// 기 신청 여부
		else if (isEventApply) {
			common.error("이미 신청하셨습니다.");
			document.activeElement.blur();
			return;
		}

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

	// 체크박스의 true 개수가 2개 이상일 때 다른 체크박스를 클릭시 alert창이 뜸.
	campaignOnClick = (index, e) => {
		const {logged, loginInfo, history, BaseActions} = this.props;
		const {isEventApply, checkArray} = this.state;

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

		if (checkArray[index]) {
			checkArray[index] = false;
		} else {
			let cnt = 0;
			for (let i in checkArray) {
				if (checkArray[i]) {
					cnt++;
				}
			}
			if (cnt >= 2) {
				common.info('최대 2개까지 선택 가능합니다.');
				return false;
			} else {
				checkArray[index] = true;
			}
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
			selectCampaign: selectContents,
		});
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
		const { isEventApply, checkArray, comment1, commentLength1, selectCampaign, agreeCheck} = this.state;

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
		// 신규 캠페인 제안 체크 후 내용 미입력
		if (checkArray[4] === true && commentLength1 === 0) {
			common.info('캠페인 내용을 입력해주세요.');
			return;
		}
		// 캠페인 항목 선택하지 않은 경우
		if (selectCampaign === '') {
			common.info('참여해보고 싶은 캠페인을 선택해주세요.');
			return;
		}
		// 동의 항목 체크 여부
		if (agreeCheck == 0) {
			common.info('필수 동의 항목 확인 후 이벤트 신청을 완료해 주세요.');
			return;
		}

		try {
			const memberInfoResponse = await SaemteoActions.getMemberInfo();
			const regDate = memberInfoResponse.data.regDate;
			if (regDate < '2022-01-25') {
				common.info("신규 회원만 참여 가능합니다. 이미 회원이신 경우, 아래의 개인정보 수정 이벤트에 참여해 주세요.");
				return;
			}

			const eventAnswer = {
				eventAnswerDesc1 : selectCampaign,
				//공백일 경우 체크한 항목 또한 보여지지 않음.
				eventAnswerDesc2 : checkArray[4] ? comment1 : "-",
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

	// 개인정보 수정하기 이동
	eventUpdateApply = async (e) => {
		const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId} = this.props;
		const { isEventApply, updateAgreeCheck} = this.state;

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
		// 동의 항목 체크 여부
		if (updateAgreeCheck == 0) {
			common.info("필수 동의 항목 확인 후 이벤트 신청을 완료해 주세요.");
			return;
		}

		try {
			const memberInfoResponse = await SaemteoActions.getMemberInfo();
			const regDate = memberInfoResponse.data.regDate;

			if (regDate >= '2022-01-25') {
				common.info("신규 가입하신 경우, 신규 가입 이벤트에 참여해주세요.");
				return;
			} else {
				try {
					await api.eventAgreeInfo(eventId.toString());
				} catch (e) {
					console.log(e);
				} finally {
					history.push("/myInfo");
				}
			}
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	}

	handleChange = (e) => {
		this.setState({
			agreeCheck: !this.state.agreeCheck
		});
	};

	handleUpdateChange = (e) => {
		this.setState({
			updateAgreeCheck: !this.state.updateAgreeCheck
		});
	};

	render () {
		const { checkArray, comment1, commentLength1} = this.state;

		return (
			<section className="event220125">
				<div className="evtCont01">
					<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
					<h1><span className='blind'>2022년, 비바샘 신학기 선물 웰컴 to 비바샘!"</span></h1>
					<div className="evtNoti">
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간 :</span><span className="txt">&nbsp;2022년 1월 25일(화) ~ 3월 31일(목)</span></li>
						</ul>
					</div>
				</div>
				<div className="evtCont02">
					<div className='evtContTit'>
						<span className='blind'>01. 신규 가입 선생님, 100% 선물</span>
						<p className='txt'>신규 가입하신 모든 선생님께 웰컴 선물을 드립니다.<br/><span>신규 가입 후 아래 설문에 참여해 주신 선생님께는<br/>30분을 추첨하여 스페셜 선물</span>을 드릴게요!</p>
					</div>
						<button type="button" className='btnJoin' onClick={this.checkJoinChange}><span
							className='blind'>회원 가입하기</span></button>
					<div className="evtGift">
						<ul>
							<li>
								<p className="blind">웰컴 100%</p>
								<p className="blind">매일 카페라떼 마일드</p>
							</li>
							<li>
								<p className="blind">스페셜 총 30명</p>
								<p className="blind">미니공기청정기</p>
							</li>
						</ul>
					</div>
					<div className='evtGiftInfo'>
						<ul>
							<li>※ 이벤트 기간 내 신규 회원만 참여 가능합니다.</li>
							<li>※ 탈퇴 후 재가입하여 응모하신 경우, 당첨에서 제외됩니다.</li>
							<li>※ 웰컴 선물은 매주 화요일에 선생님 휴대전화 번호로 발송됩니다.</li>
							<li>※ 스페셜 선물 당첨자 발표 : 4월 5일 / 비바샘 공지사항</li>
						</ul>
					</div>
					<div className="evtFormWrap">
						<div className="formTit">
							<p>2022년 비바샘에서 꼭 참여해보고 싶은<br/>캠페인은 무엇인가요? <span>(2개 선택 가능)</span></p>
						</div>
						<div className='evtItemWrap'>
							<div className="formItem">
								<input type="checkbox" id="check" checked={checkArray[0]} onChange={this.campaignOnClick.bind(this, 0)}/>
								<label for="check">2022<br/>꿈지기 캠페인</label>
								<p>학생들의 소중한 꿈을<br/>예쁜 꿈 명함으로<br/>담아 냅니다.</p>
								<a href='https://www.vivasam.com/saemteo/vivaStoryView.do?storyId=126&pageNo=1&listTp=ALL?deviceMode=pc'>지난 캠페인 보기</a>
							</div>
							<div className="formItem">
								<input type="checkbox" id="check2" checked={checkArray[1]} onChange={this.campaignOnClick.bind(this, 1)}/>
								<label for="check2">환경 살리기<br/>캠페인</label>
								<p>학생들과 함께<br/>지구를 살리는 방법을<br/>실천합니다.</p>
							</div>
							<div className="formItem">
								<input type="checkbox" id="check3" checked={checkArray[2]} onChange={this.campaignOnClick.bind(this, 2)}/>
								<label for="check3">설렘꾸러미<br/>캠페인</label>
								<p>청계천 헌책방을 살리는<br/>독서 프로젝트를<br/>운영합니다.</p>
								<a href='https://www.vivasam.com/saemteo/vivaStoryView.do?storyId=96&pageNo=4&listTp=ALL?deviceMode=pc'>지난 캠페인 보기</a>
							</div>
							<div className="formItem">
								<input type="checkbox" id="check4" checked={checkArray[3]} onChange={this.campaignOnClick.bind(this, 3)}/>
								<label for="check4">학교 기념<br/>사진 촬영</label>
								<p>학교/학급/동아리의<br/>특별한 기념 촬영을<br/>지원합니다.</p>
								<a href='https://www.vivasam.com/saemteo/vivaStoryView.do?storyId=72&pageNo=9&listTp=ALL?deviceMode=pc'>지난 캠페인 보기</a>
							</div>
							<div className="formItem text">
								<input type="checkbox" id="check5" checked={checkArray[4]} onChange={this.campaignOnClick.bind(this, 4)}/>
								<label for="check5">비바샘 신규 캠페인을 제안합니다.</label>
								<div className="evtTextareaWrap">
									<textarea
										name="applyContent1"
										id="applyContent1"
										placeholder="원하시는 캠페인을 직접 제안해 주세요. (100자 이내)"
										value={ comment1 }
										onChange={ (e) => this.setComment(e) }
										onFocus={ this.onFocusComment }
										maxLength={100}
										></textarea>
									<p className="count"><span className="reasonCount">{ commentLength1 }</span>/100</p>
								</div>
							</div>
						</div>
					</div>
					<div className="formTip">
						<strong>개인정보 수집 및 이용동의</strong>
						<ul>
							<li>이용 목적 : 경품 배송 및 고객 문의 응대</li>
							<li>수집하는 개인정보 : 성명, 휴대전화번호, 학교명, 학교주소</li>
							<li>
								개인정보 보유 및 이용기간 : 2022년 4월 30일까지 <br/>
								(이용목적 달성 시 즉시 파기)<br/>
								선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다.<br/>
								단, 동의를 거부할 경우 신청이 불가합니다.
							</li>
						</ul>
					</div>
					<div className="evtAgree">
						<input
							type="checkbox"
							name="agree1"
							onChange={this.handleChange}
							id="join_agree01"/>
						<label
							htmlFor="join_agree01">
							본인은 개인정보 수집 및 이용에 동의합니다.
						</label>
					</div>
					<div className="btnWrap">
						<button type="button" onClick={ this.eventApply } className="btnApply">참여하기<span></span></button>
					</div>
				</div>
				<div className="evtCont03">
					<div className='evtContTit'>
						<span className='blind'>02. 개인정보 업데이트 선생님, 총 300명 선물</span>
						<p className='txt'>이벤트 기간 동안 <span>개인 정보를 최신으로 업데이트</span>해 주세요!<br/>총 300분을 선정하여 선물을 드립니다.</p>
					</div>
					<div className="evtGift">
						<ul>
							<li>
								<p className="blind">총 300명</p>
								<p className="blind">베스킨라빈스 싱글 레귤러 아이스크림</p>
							</li>
						</ul>
					</div>
					<div className='evtGiftInfo'>
						<ul>
							<li>※ 이벤트 기간 중 신규 가입하신 선생님은 제외됩니다. </li>
							<li>※ 이벤트 기간 중 개인 정보를 2회 이상 중복으로 업데이트하여도, 1회만 참여됩니다.</li>
							<li>※ 웰컴 선물은 매주 화요일에 선생님 휴대전화 번호로 발송됩니다.</li>
							<li>※ 당첨자 발표 : 4월 5일 / 비바샘 공지사항</li>
						</ul>
					</div>
					<div className="formTip">
						<strong>개인정보 수집 및 이용동의</strong>
						<ul>
							<li>이용 목적 : 경품 배송 및 고객 문의 응대</li>
							<li>수집하는 개인정보 : 성명, 휴대전화번호</li>
							<li>
								개인정보 보유 및 이용기간 : 2022년 4월 30일까지 <br/>
								(이용목적 달성 시 즉시 파기)<br/>
								선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다.<br/>
								단, 동의를 거부할 경우 신청이 불가합니다.
							</li>
						</ul>
					</div>
					<div className="evtAgree">
						<input
							type="checkbox"
							name="updateAgree"
							onChange={this.handleUpdateChange}
							id="join_agree02"/>
						<label
							htmlFor="join_agree02">
							본인은 개인정보 수집 및 이용에 동의합니다.
						</label>
					</div>
					<div className="btnWrap">
						<button type="button" onClick={ this.eventUpdateApply } className="btnApply">회원 정보 수정<span></span></button>
					</div>
				</div>
				<div className="evtCont04">
					<div className="evtNotice">
						<strong>신청 시 유의사항</strong>
						<ul>
							<li>1. 1인 1회 신청 가능합니다.</li>
							<li>2. 교사 미인증 및 필수정보 미입력, 본인 미인증 회원인 경우 이벤트 01의 경품 지급에서 제외됩니다.</li>
							<li>3. 등록된 정보 중 학교 정보가 불명확한 경우 경품 대상에서 제외됩니다.</li>
							<li>4. 정확하지 않은 휴대전화 정보로 반송되거나 유효 기간동안 기프티콘을 사용하지 않은 경우, 재발송되지 않습니다.</li>
							<li>5. 선물 발송을 위해 서비스/배송 업체에 개인정보<br/>(이름, 휴대전화번호, 학교주소)가 제공됩니다.<br/>((주)모바일이앤엠애드 사업자등록번호 215-87-19169)<br/>((주)한진 사업자등록번호 201-81-02823)</li>
						</ul>
						<p>이벤트 참여로 적립되는 100콘 외에 통합 회원 가입, 비바샘 단독 회원 가입, 통합 회원 전환 등의 활동은 비바콘 적립 규정에 따라 추가로 자동 적립됩니다.</p>
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