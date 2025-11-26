import React, {Component} from 'react';
import './Event.css';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{
    state = {
		realDomain: 'me.vivasam.com',
		devDomain: 'dev-me.vivasam.com',
		eventTitle: '창의 융합 수업 자료 공모전',
		realUrl: 'https://me.vivasam.com/#/saemteo/event/view/423',
		devUrl: 'https://dev-me.vivasam.com/#/saemteo/event/view/423',
		webUrl: 'https://www.vivasam.com/event/2023/viewEvent423',
		bandUrl: '',
		eventUrl: '',
		eventMode: 1
	}
    
    componentDidMount = async () => {
		let eventUrl = '';
		let domain = '';
		let eventTitle = this.state.eventTitle;
		if (window.location.href.indexOf('dev-me.vivasam.com') > -1) {
			eventUrl = this.state.devUrl;
			domain = this.state.devDomain;
		} else {
			eventUrl = this.state.realUrl;
			domain = this.state.realDomain;
		}
		this.setState({eventUrl: eventUrl});
		this.setState({bandUrl: "https://band.us/plugin/share?body=" + encodeURIComponent(eventTitle + ' ' + eventUrl) + "&route=" + domain});

		// 날짜 체크 (얼리버드)
		let today = new Date();
		let chkStartDate1 = new Date(2022, 0, 1);

		let eventMode = 1;
		if (today.getTime() >= chkStartDate1.getTime()) {
			eventMode = 2;
		}

		this.setState({eventMode: eventMode});
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
		common.info('링크가 복사되었습니다.\n동료 선생님과 함께 공모전에 참여해 보세요.');
	};

	onKakaoFeed = (e) => {
		window.Kakao.Link.sendDefault({
			objectType: 'feed',
			content: {
				title: '제7회 창의 융합 수업 자료 공모전',
				description: '2022년 한 해동안 선생님께서 직접 만들고 활용하셨던 자료를 기다립니다.',
				imageUrl: 'https://dn.vivasam.com/VS/EVENT/kakaoscrap/creative_kakaoscarp.png',
				link: {
					webUrl: this.state.webUrl,
					mobileWebUrl: this.state.eventUrl
				},
			},
			buttons: [
				{
					title: '자세히보기',
					link: {
						webUrl: this.state.webUrl,
						mobileWebUrl: this.state.eventUrl
					},
				}
			]
		})
	}

	onBandFeed = (e) => {
		let aux = document.createElement("a");
		aux.setAttribute("href", this.state.bandUrl);
		aux.setAttribute("target", '_blank');
		aux.click();
		aux.remove();
	}

	goMyInfo = (e) => {
		const {logged, BaseActions, history} = this.props;
		if (!logged) {
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
		} else {
			history.push('/myInfo');
		}
		return false;
	}

	render() {
		return (
			<section className="event230112">
				<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
				<div className="evtCont01">
					<h1><img src="/images/events/2023/event230112/evtCont1.png" alt="비바샘 캐릭터 공모전" /></h1>
					<div className="blind">
						<h2>선생님과 함께 만드는 <strong>비바샘 캐릭터</strong>공모전</h2>
						<p>
							선생님께 한 걸음 더 가까이 다가가기 위해
							<strong>비바샘 캐릭터</strong> 공모전을 진행합니다.

							선생님에 대한 공감과 이해를 바탕으로
							더욱 즐거운 수업을 만들기 위해
							<strong>선생님을 대표하는 캐릭터</strong>를 제작합니다.

							비바샘과 이름이 비슷한 동물 “비버”를 활용하여
							<strong>비바샘을 대표하는 캐릭터</strong>를 만들어 주세요!

							제작된 캐릭터는 콘텐츠와 이벤트에 다양하게 활용될 예정입니다!
						</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span><span className="txt">2023년 1월 12일(목) ~ 2월 12일(일)</span></li>
							<li><span className="tit">1차 비상 심사 기간</span><span className="txt">2023년 2월 13일(월) ~ 2월15일(수)</span></li>
							<li><span className="tit">2차 인기 투표 기간</span><span className="txt">2023년 2월 20일(월) ~ 2월 28일(일) </span></li>
							<li><span className="tit">선정작 발표</span><span className="txt">2023년 2월 28일(화)</span></li>
						</ul>
					</div>
				</div>
				<div className="evtCont02">
					<h2><img src="/images/events/2023/event230112/evtCont2.png" alt="공모전 안내"/></h2>
					<div className="blind">
						<div>
							<strong><span className="blind">시상 내역</span></strong>
							<ul className="bulList">
								<li>대상(1명) 상금 300만원</li>
								<li>최우수상(3명) 상금 50만원</li>
								<li>우수상(5명) 백화점 상품권 20만원</li>
								<li>참여상 100% 선물 스타벅스 카페라떼 T 2잔</li>
							</ul>
						</div>
						<div>
							<strong><span className="blind">공모전 안내</span></strong>
							<ul>
								<li>
									<span className="subTit"><em className="blind">주제</em></span>
									<div className="subCont">
										<p className="pt01">비바샘 캐릭터 디자인</p>
									</div>
								</li>
								<li>
									<span className="subTit"><em className="blind">참여방법</em></span>
									<div className="subCont">
										<ul>
											<li className="pt01">
												1. 비바샘 캐릭터 디자인 개발
												<ul>
													<li>- 캐릭터 성별 : 중성</li>
													<li>- 캐릭터 직업 : 선생님</li>
												</ul>
											</li>
											<li className="pt01">
												2. 제출 서류
												<ul>
													<li>
														<span>1) 캐릭터 디자인 시안</span>
														<ul className="depth02">
															<li>- 캐릭터 대표 시안 (선택사항: 응용동작 2개)</li>
															<li>- 규격: jpg 파일(*추후 수상작에 한해 psd/ai 등의 원본 파일 수급)</li>
															<li>- 사이즈: A4(2450*3508 pixel)</li>
															<li>- 해상도: 300dpi</li>
															<li>- 색상모드: CMYK</li>
														</ul>
													</li>
													<li>
														<span>2)참가 신청서</span>
													</li>
												</ul>
											</li>
										</ul>
										<p className="bold">★ 등록 파일은 100MB까지 가능하며, 용량이 클 경우 메일로 접수 가능합니다.</p>
										<p>visangcontest@naver.com</p>
									</div>
								</li>
							</ul>
						</div>
						<div>
							<strong><span className="blind">심사 기준</span></strong>
							<ul className="giftList">
								<li className="blind">01 동물 비버의 아기자기함이 잘 반영된 캐릭터</li>
								<li className="blind"> 02 열정 가득한 선생님의 모습이 잘 반영된 캐릭터</li>
								<li className="blind">03 온/오프라인에서의 활용이 유용한 깔끔한 디자인</li>
							</ul>
						</div>
						<div>
							<strong><span className="blind">심사 절차</span></strong>
							<ul className="dataList">
								<li className="blind">1차 비상교육 심사 70점</li>
								<li className="blind">2차 비바샘 선생님의 인기투표 30점</li>
							</ul>
						</div>
						<span>작품 등록은 PC에서만 가능합니다.</span>
					</div>
				</div>
				<div className="notice">
					<strong className="subTit">유의사항</strong>
					<ul>
						<li>① 이벤트 1인 1회 참여하실 수 있습니다.</li>
						<li>② 참여 완료 후에는 수정, 참여 취소, 자료 반환이 불가합니다.</li>
						<li>③ 공모전 수상작의 소유권, 저작권 등 기타 지적재산권 등의 권리는<br /> 비상교육에 귀속됩니다.</li>
						<li>④ 타 공모전에 출품되지 않은 순수 창작물에 한하며, 표절로 확인될 경우,<br /> 모든 법적 책임은 출품자에게 있습니다.</li>
						<li>⑤ 당선된 캐릭터는 비상교육에서 재가공하여 대표 캐릭터로<br /> 제작합니다.</li>
						<li>⑥ 대상, 최우수상 상금은 제세공과금(4.4%)을 제외하고 지급합니다.</li>
						<li>⑦ 참여상은 제출 서류와 참가신청서를 정상적으로 제출해 주신<br /> 분에게만 제공됩니다.</li>
						<li>
							⑧ 선물 발송을 위해 개인정보(성명, 휴대전화번호, 주소)가 서비스사와 상품 배송업체에 제공됩니다.<br />
							(㈜카카오 사업자등록번호 120-81-47521)<br />
							(㈜다우기술 사업자등록번호  220-81-02810)
						</li>
					</ul>
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
	}),
	(dispatch) => ({
		BaseActions: bindActionCreators(baseActions, dispatch),
	})
)(withRouter(Event));