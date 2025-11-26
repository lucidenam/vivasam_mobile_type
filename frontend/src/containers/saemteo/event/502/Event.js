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

// 경품의 종류
const CONTENT_TYPE_START = 3;
const CONTENT_TYPE_END = 4;

// 경품 목록
const CONTENT_LIST = [
	{id: '1', name: '중학 문해력 향상 프로그램'},
	{id: '2', name: '고등 문해력 향상 프로그램'}
];

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부
		evtTabId:1,
		isAllAmountFull: false, // 모든 경품 소진 여부
		allAmountFull: false,    // 각각 경품 소진여부
		todayAmountFull: [true, true],      // 경품 소진 여부
		imgId:'',
		isPreviewShow:false,
		mainSubject:'',
		secondSubject:''
	}

	componentDidMount = async () => {
		const {BaseActions, SaemteoActions, logged} = this.props;
		let {mainSubject,secondSubject } = this.state;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();
			await this.eventAmountCheck();

			if(logged){
				const memberInfoResponse = await SaemteoActions.getMemberInfo();
				this.setState({
					mainSubject : memberInfoResponse.data.mainSubject,
					secondSubject : memberInfoResponse.data.secondSubject
				});
			}else{
				this.setState({
					mainSubject : '',
					secondSubject : ''
				});
			}

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
		const { logged, eventId, event } = this.props;
		if(logged){

			const response = await api.chkEventJoin({eventId});
			if(response.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply: true
				});
			}

		}
	}

	eventAmountCheck = async() => {
		const { SaemteoActions, eventId} = this.props;
		let { allAmountFull } = this.state;
		let params1 = {};
		params1.eventId = eventId; // 이벤트 ID
		let checkAllAmountFull = false;
		let checkEachAmountFull = [];
		let eachAmountLeft = [];
		try {
			// 경품 신청가능 수량 조회
			const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
			const responseData = response.data;

			for (let i = CONTENT_TYPE_START; i <= CONTENT_TYPE_END; i++) {
				if (i === 3 && responseData['qntCnt_' + i] >= 1) checkAllAmountFull = true;

				eachAmountLeft.push(responseData['qntCnt_' + i]);
				checkEachAmountFull.push(responseData['qntCnt_' + i] > 0);
				if (responseData['qntCnt_' + i] >= 1) {
					checkAllAmountFull = true;
				}
			}
		} catch (e) {
			console.log(e);
		}

		this.setState({
			allAmountFull: allAmountFull,
			isAllAmountFull: checkAllAmountFull,
			isEachAmountFull: checkEachAmountFull,
			eachAmountLeft: eachAmountLeft
		});
	}

	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const {allAmountFull, isEventApply, mainSubject, secondSubject, evtTabId, isEachAmountFull} = this.state;

		if (allAmountFull) {
			common.info("준비한 선물이 모두 소진되었습니다.");
			return;
		}

		if (!logged) {
			// 미로그인시
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return;
		}

		// 교사 인증
		if(loginInfo.certifyCheck === 'N'){
			BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
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

		if ((loginInfo.schoolLvlCd !== "MS" && loginInfo.schoolLvlCd !== "HS") || (mainSubject !== "SC100" && secondSubject !== "SC100")) {
			common.info("중 · 고등학교 국어 교사만 참여 가능한 이벤트입니다. \n 참여를 원하시면 회원정보를 수정해주세요.");
			return false;
		}

		let selectAction;
		let eventAnswerId;
		if (evtTabId == 1) {
			if (!window.confirm("신청하시는 자료집이 '중학' 문해력 향상 프로그램이 맞으신가요?")) {
				return false;
			}
		} else {
			if (!window.confirm("신청하시는 자료집이 '고등' 문해력 향상 프로그램이 맞으신가요?")) {
				return false;
			}
		}

		if (evtTabId == 1) {
			if(!isEachAmountFull[0]){
				alert("자료집이 모두 소진되어 신청 마감되었습니다.");
				return false;
			}
			selectAction = "중학 문해력 향상 프로그램";
			eventAnswerId = "1,0";
		} else {
			if(!isEachAmountFull[1]){
				alert("자료집이 모두 소진되어 신청 마감되었습니다.");
				return false;
			}
			selectAction = "고등 문해력 향상 프로그램";
			eventAnswerId = "0,1";
		}

		try {

			const eventAnswer = {
				eventAnswerContent: selectAction,
				answerNumber: eventAnswerId
			};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

			handleClick(502);	// 신청정보 팝업으로 이동

		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.`
		}

	};

	// 미리보기 팝업 열기
	handlePreviewClick = (imgName) => {
		const { imgId, isPreviewShow } = this.state;

		this.setState({
			imgId: imgName,
			isPreviewShow:true,
		});
	}

	// 미리보기 팝업 닫기
	handlePreviewCloseClick = () => {
		const { isPreviewShow } = this.state;

		this.setState({
			isPreviewShow:false,
		});
	}

	// 탭
	tabMenuClick = (num) => {
		const {evtTabId} = this.state;

		this.setState({
			evtTabId:num,
		})
	};

	render () {
		const {evtTabId, isPreviewShow, imgId} = this.state;
		return (
			<section className="event240520">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2024/event240520/evtTit.png" alt="문해력 향상 프로그램"/>
						<div className="blind">
							<p>중ㆍ고등 국어 선생님을 위한</p>
							<h2>문해력 향상 프로그램으로 비상해요!</h2>
							<div>
								<p>
									글을 읽고 그 의미를 이해하는 능력, ‘문해력’!
									문해력은 학습 능력의 기초가 됩니다.
									문해력 향상 프로그램으로 학생들이
									비상할 수 있도록 지원해 주세요.
								</p>
								<p>신청기간 2024. 5. 20.(월) ~ 5. 27.(월)</p>
								<ul>
									<li>총 2,000세트 증정 (중ㆍ고등학교별 각 1,000세트 선착순 마감)</li>
									<li>중ㆍ고등학교 ‘국어’ 교과 선생님만 신청 가능 (1명당 1세트 신청 가능)</li>
									<li>재직 중이신 학교로 배송 (학교 외 주소로는 발송 불가)</li>
								</ul>
								<p>문해력 향상 프로그램이란?</p>
								<p>
									다양한 분야
									인문, 사회, 과학, 기술, 예술 등 다양한 분야의
									어휘와 지문을 실었습니다.
								</p>
								<p>
									3단계 구성
									‘기본 편 – 필수 편 – 발전 편’의 3단계 구성으로
									문해력을 체계적으로 길러 줄 수 있습니다.
									‘기본 편’, ‘필수 편’, ‘발전 편’으로 구성된 한 세트를
									드립니다.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="evtCont02">
					<ul className="tabMenu">
						<li className={evtTabId == 1 ? 'on' : ''}>
							<button type="button" onClick={() => this.tabMenuClick(1)}><span className="blind">중학 문해력 향상 프로그램</span></button>
						</li>
						<li className={evtTabId == 2 ? 'on' : ''}>
							<button type="button" onClick={() => this.tabMenuClick(2)}><span className="blind">고등 문해력 향상 프로그램</span></button>
						</li>
					</ul>
					<div className={"evtContItem evtContItem1 " + (evtTabId == 1 ? 'on' : '')}>
						<div className="item_list_wrap">

							<div className="item_box first">
								<div className="thumb">
									<img src="/images/events/2024/event240520/img1.png" alt="이미지"/>
								</div>
								<div className="imgs">
									<p>한자 뜻을 바탕으로 한자어 어휘를 익히고, 문맥에서 <br/>어휘의 뜻을 유추하며 <span>어휘력 향상!</span></p>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img1_1')}>
											<img src="/images/events/2024/event240520/img1_1.jpg" alt="이미지"/>
										</button>
									</div>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img1_2')}>
											<img src="/images/events/2024/event240520/img1_2.jpg" alt="이미지"/>
										</button>
									</div>
								</div>
							</div>

							<div className="item_box second">
								<div className="thumb">
									<img src="/images/events/2024/event240520/img2.png" alt="이미지"/>
								</div>
								<div className="imgs">
									<p>문단을 읽고 핵심어와 핵심 내용을 찾으며 <br/><span>문단을 읽는 힘 향상!</span></p>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img2_1')}>
											<img src="/images/events/2024/event240520/img2_1.jpg" alt="이미지"/>
										</button>
									</div>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img2_2')}>
											<img src="/images/events/2024/event240520/img2_2.jpg" alt="이미지"/>
										</button>
									</div>
								</div>
							</div>

							<div className="item_box last">
								<div className="thumb">
									<img src="/images/events/2024/event240520/img3.png" alt="이미지"/>
								</div>
								<div className="imgs">
									<p>전체 글을 집중하여 읽고 핵심 내용을 문제로 확인하며 <br/><span>글 한 편을 읽는 힘 향상!</span></p>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img3_1')}>
											<img src="/images/events/2024/event240520/img3_1.jpg" alt="이미지"/>
										</button>
									</div>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img3_2')}>
											<img src="/images/events/2024/event240520/img3_2.jpg" alt="이미지"/>
										</button>
									</div>
								</div>
							</div>

						</div>

						<a href="javascript:void(0);" className="btnApply" onClick={this.eventApply}>
							<span className="blind">참여하기</span>
						</a>
					</div>

					<div className={"evtContItem evtContItem2 " + (evtTabId == 2 ? 'on' : '')}>
						<div className="item_list_wrap">

							<div className="item_box first">
								<div className="thumb">
									<img src="/images/events/2024/event240520/img4.png" alt="이미지"/>
								</div>
								<div className="imgs">
									<p>한자 뜻을 바탕으로 한자어 어휘를 익히고, 문맥에서 <br/>어휘의 뜻을 유추하며 <span>어휘력 향상!</span></p>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img4_1')}>
											<img src="/images/events/2024/event240520/img4_1.jpg" alt="이미지"/>
										</button>
									</div>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img4_2')}>
											<img src="/images/events/2024/event240520/img4_2.jpg" alt="이미지"/>
										</button>
									</div>
								</div>
							</div>

							<div className="item_box second">
								<div className="thumb">
									<img src="/images/events/2024/event240520/img5.png" alt="이미지"/>
								</div>
								<div className="imgs">
									<p>문단을 읽고 핵심어와 핵심 내용을 찾으며 <br/><span>문단을 읽는 힘 향상!</span></p>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img5_1')}>
											<img src="/images/events/2024/event240520/img5_1.jpg" alt="이미지"/>
										</button>
									</div>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img5_2')}>
											<img src="/images/events/2024/event240520/img5_2.jpg" alt="이미지"/>
										</button>
									</div>
								</div>
							</div>

							<div className="item_box last">
								<div className="thumb">
									<img src="/images/events/2024/event240520/img6.png" alt="이미지"/>
								</div>
								<div className="imgs">
									<p>전체 글을 집중하여 읽고 핵심 내용을 문제로 확인하며 <br/><span>글 한 편을 읽는 힘 향상!</span></p>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img6_1')}>
											<img src="/images/events/2024/event240520/img6_1.jpg" alt="이미지"/>
										</button>
									</div>
									<div className="img">
										<button type="button" className="btnView" onClick={() => this.handlePreviewClick('img6_2')}>
											<img src="/images/events/2024/event240520/img6_2.jpg" alt="이미지"/>
										</button>
									</div>
								</div>
							</div>

						</div>

						<a href="javascript:void(0);" className="btnApply" onClick={this.eventApply}>
							<span className="blind">참여하기</span>
						</a>
					</div>

				</div>

				{isPreviewShow &&
					<div className="previewPopup">
						<div className="previewPopWrap">
							<button type="button" className="btnPreviewClose" onClick={this.handlePreviewCloseClick}></button>
							<div className="thumb">
								<img src={"/images/events/2024/event240520/" + imgId + ".jpg"} alt="이미지"/>
							</div>
						</div>
					</div>
				}

				<div className="notice">
					<strong>신청 시 유의 사항</strong>
					<ul className="info">
						<li><span>1인 1회 1세트</span>만 신청할 수 있으며, <span>교사 인증을 완료하신 중·고등학교 국어 선생님</span>만 신청이 가능합니다.​​</li>
						<li><span>선착순 신청</span>으로 수량 소진 시 이벤트 신청이 마감됩니다.</li>
						<li>자료집은 <span>학교로만 배송</span>이 가능합니다. <span>학교 주소와 수령처를 정확히 기입</span>해 주세요. <br/><span>주소 기재가 잘못되어 오발송되거나 반송된 자료집은 다시 발송해 드리지 않습니다.</span></li>
						<li>신청하신 자료는 <span>이벤트 종료 후 순차적으로 발송</span>할 예정입니다.</li>
						<li>신청자 개인 정보(성명/주소/휴대 전화 번호)가 배송 업체에 공유됩니다. (주)CJ대한통운 사업자번호: 110-81-05034</li>
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