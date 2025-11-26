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
import Slider from "react-slick";
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


	eventApply = async () => {
		const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const {evtTabId, isEventApply} = this.state;

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

		let selectAction;
		let eventAnswerId;
		if (evtTabId == 1) {
			if (loginInfo.schoolLvlCd !== "MS") {
				common.info("중학교 교사만 참여 가능한 이벤트입니다. \n참여를 원하시면 회원정보를 수정해주세요.");
				return false;
			}

			if (!window.confirm("신청하시는 자료집이 중학 진로·진학 자료집이 맞으십니까?")) {
				return false;
			}

		} else {
			if (loginInfo.schoolLvlCd !== "HS") {
				common.info("고등학교 교사만 참여 가능한 이벤트입니다. \n참여를 원하시면 회원정보를 수정해주세요.");
				return false;
			}
			if (!window.confirm("신청하시는 자료집이 고등 진로·진학 자료집이 맞으십니까?")) {
				return false;
			}
		}

		if (evtTabId == 1) {
			selectAction = "중학";
			eventAnswerId = "1,0";
		} else {
			selectAction = "고등";
			eventAnswerId = "0,1";
		}

		try {

			const eventAnswer = {
				eventAnswerContent: selectAction,
				answerNumber: eventAnswerId,
				evtTabId:evtTabId
			};

			SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer });

			handleClick(eventId);	// 신청정보 팝업으로 이동

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
		//slick option 설정
		const settings = {
			dots: true,
			speed: 500,
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: false,
			className: 'event_list',
		};

		const {evtTabId, isPreviewShow, imgId} = this.state;
		return (
			<section className="event240621">
				<div className="evtCont1">
					<div className="evtTit">
						<img src="/images/events/2024/event240621/img1.png" alt="진로 진학 자료집"/>
					</div>
				</div>
				<div className="evtCont02">
					<ul className="tabMenu">
						<li className={evtTabId == 1 ? 'on' : ''}>
							<button type="button" onClick={() => this.tabMenuClick(1)}><span><em className="blind">중학</em></span></button>
						</li>
						<li className={evtTabId == 2 ? 'on' : ''}>
							<button type="button" onClick={() => this.tabMenuClick(2)}><span><em className="blind">고등</em></span></button>
						</li>
					</ul>
					<div className={"evtContItem evtContItem1 " + (evtTabId == 1 ? 'on' : '')}>
						<div className="evt_item_box">
							<img src="/images/events/2024/event240621/tab01_img.png" alt="이미지"/>

							<button type="button" className="btnView" onClick={() => this.handlePreviewClick('book1')}><span className="blind">자세히 보기</span></button>
							<button type="button" className="btnView po2" onClick={() => this.handlePreviewClick('book2')}><span className="blind">자세히 보기</span></button>
							<button type="button" className="btnView po3" onClick={() => this.handlePreviewClick('book3')}><span className="blind">자세히 보기</span></button>

							<button type="button" className="btnApply" onClick={this.eventApply}>
								<span className="blind">참여하기</span>
							</button>

						</div>

					</div>

					<div className={"evtContItem evtContItem2 " + (evtTabId == 2 ? 'on' : '')}>
						<div className="evt_item_box">
							<img src="/images/events/2024/event240621/tab02_img.png" alt="이미지"/>

							<button type="button" className="btnView" onClick={() => this.handlePreviewClick('book4')}><span className="blind">자세히 보기</span></button>
							<button type="button" className="btnView po2" onClick={() => this.handlePreviewClick('book5')}><span className="blind">자세히 보기</span></button>
							<button type="button" className="btnView po4" onClick={() => this.handlePreviewClick('book6')}><span className="blind">자세히 보기</span></button>

							<button type="button" className="btnApply" onClick={this.eventApply}>
								<span className="blind">참여하기</span>
							</button>
						</div>
					</div>

				</div>

				<div className="previewPopup" style={{display: isPreviewShow ? 'flex' : 'none'}}>
					<div className="previewPopWrap">
						<button type="button" className="btnPreviewClose" onClick={this.handlePreviewCloseClick}>
							<span><em className="blind">닫기</em></span>
						</button>
						<Slider {...settings}>
								<div>
									<img src={"/images/events/2024/event240621/" + imgId + ".png"} alt="이미지"/>
								</div>
								<div>
									<img src={"/images/events/2024/event240621/" + imgId + "-1.png"} alt="이미지"/>
								</div>
						</Slider>
					</div>
				</div>

				<div className="notice">
					<strong>신청 시 유의 사항</strong>
					<ul className="info">
						<li><span>1인 1회 1부</span>만 신청할 수 있으며, <span>교사 인증을 완료한 중·고등학교 선생님</span>만 <br/>신청이 가능합니다.​​​</li>
						<li>자료집은 <span>학교로만 배송</span>이 가능합니다. <span>학교 주소와 수령처를 정확히 기입</span>해 주세요.​</li>
						<li><span>주소 기재가 잘못되어 오발송되거나 반송된 자료집은 다시 발송해 드리지 않습니다.​</span></li>
						<li>신청하신 자료는 선생님 재직 학교의 인근 비상교육 지사를 통해, 이벤트 종료 후 10일 이내 <br/>전달할 예정입니다.​</li>
						<li>신청자 개인 정보(성명/주소/휴대 전화 번호)가 배송 업체 및 비상교육 지사에 공유됩니다. ​<br/>(주)CJ대한통운 사업자번호: 110-81-05034 / ㈜한진택배 사업자등록번호: 201-81-02823</li>
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