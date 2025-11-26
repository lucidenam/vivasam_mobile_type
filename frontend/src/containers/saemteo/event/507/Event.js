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
		isEventApply: false    // 신청여부
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

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {SaemteoActions, eventId, handleClick, eventAnswer} = this.props;

		if (!this.prerequisite(e)) {
			document.activeElement.blur();
			return false;
		}

		try {
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
		return (
			<section className="event240610">
				<div className="evtCont1">
					<div className="evtTit">
						<h1><img src="/images/events/2024/event240610/img1.png" alt="이 달의 리뷰어"/></h1>
						<div className="blind">
							<p>
								블로그, SNS 등 선생님의 채널에 비바샘 콘텐츠 이용 후기를 올리고
								선생님의 게시물을 ‘이 달의 리뷰어’에 공유해 주세요.
								‘이 달의 리뷰어’에 후기를 공유해 주신 선생님께
								추첨을 통해 선물을 드립니다.
							</p>
							<p>
								이 달의 리뷰어 란?
								비바샘터에 새롭게 오픈한 상시 코너로
								선생님이 선생님에게 전하는
								비바샘 콘텐츠 후기와 사용 TIP을 올리고
								둘러볼 수 있어요!
							</p>
							<p>이벤트 참여 기간_ 2024. 6. 10.(월) ~ 6. 30.(일)</p>
							<p>당첨자 발표_ 2024. 7. 8.(월)</p>
						</div>
						<a href="https://www.vivasam.com/samter/reviewer/list" target="_blank" className="btn_link"><span className="blind">이 달의 리뷰어 둘러보기</span></a>
					</div>
				</div>

				<div className="evtCont02">
					<h1><img src="/images/events/2024/event240610/img2.png" alt="이 달의 리뷰어"/></h1>
					<div className="blind">
						<div>
							<p>당첨자 선물</p>
							<ul>
								<li>
									비바샘을 기록하다
									어로어 다회용 필름카메라 +
									필름(12컷 1통) 세트
								</li>
								<li>
									비바샘을 맛보다
									배달의 민족 상품권
									1만원 권
								</li>
								<li>
									비바샘에 녹아들다
									스타벅스
									아이스 시그니처 초콜릿 T
								</li>
							</ul>
						</div>
						<div>
							<p>참여 방법</p>
							<ul>
								<li>
									본 이벤트 페이지
									하단의 ‘참여하기’
									버튼을 눌러 참여
									신청하기
								</li>
								<li>
									블로그, SNS 등
									나의 채널에
									비바샘 콘텐츠
									후기 올리기
								</li>
								<li>
									비바샘터 >
									이 달의 리뷰어
									‘리뷰 등록하기’
									버튼 클릭!
								</li>
								<li>
									내가 작성한 후기
									게시물 URL을 포함해
									게시에 필요한 내용을
									작성 후 등록하면
									참여 완료!
								</li>
							</ul>
						</div>
						<div>
							<p>꼭 확인해 주세요 !</p>
							<ul>
								<li>- 이벤트 참여를 위해 하단 ‘참여하기’ 버튼으로  참여 신청을 꼭 해 주세요.</li>
								<li>- 블로그, SNS 등 선생님의 채널에 후기를 게시 후 ‘이 달의 리뷰어’ 페이지에 게시물 등록까지 완료하셔야 참여로 인정됩니다.</li>
								<li>- 리뷰 게시물 등록 수는 제한되지 않습니다.</li>
								<li>- 비바샘 콘텐츠 후기 외 게시판 성격에 맞지 않는 글은 관리자에 의해 삭제될 수 있습니다</li>
							</ul>
						</div>
						<p>
							‘이 달의 리뷰어’는 상시 오픈 코너로 매월 10분의 우수한 후기를 남겨주신
							선생님께 선물을 드리며 본 이벤트와 중복 당첨이 가능합니다.
						</p>
					</div>
					<button type="button" className="btnApply" onClick={this.eventApply} value={"ES"}>
						<span className="blind">신청하기</span>
					</button>
				</div>

				<div className="notice">
					<strong>유의사항</strong>
					<ul className="info">
						<li>- &nbsp;본 이벤트는 교사 인증을 완료한 학교 선생님 대상 이벤트입니다.</li>
						<li>- &nbsp;개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
						<li>- &nbsp;경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
						<li>- &nbsp;경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다. <br/>㈜카카오 사업자등록번호 : 120-81-47521, ㈜다우기술 사업자등록번호: 220-81-02810</li>
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