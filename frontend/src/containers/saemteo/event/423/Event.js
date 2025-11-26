import React, {Component, useRef} from 'react';
import './Event.css';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{
    state = {
		realDomain: 'mv.vivasam.com',
		devDomain: 'dev-mv.vivasam.com',
		eventTitle: '창의 융합 수업 자료 공모전',
		realUrl: 'https://mv.vivasam.com/#/saemteo/event/view/384',
		devUrl: 'https://dev-mv.vivasam.com/#/saemteo/event/view/384',
		webUrl: 'https://www.vivasam.com/event/2021/viewEvent384',
		bandUrl: '',
		eventUrl: '',
		eventMode: 1
	}
    
    componentDidMount = async () => {
		let eventUrl = '';
		let domain = '';
		let eventTitle = this.state.eventTitle;
		if (window.location.href.indexOf('dev-mv.vivasam.com') > -1) {
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
		//let chkStartDate1 = new Date(2021, 0, 1);

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
				description: '2021년 한 해동안 선생님께서 직접 만들고 활용하셨던 자료를 기다립니다.',
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
			<section className="event221201">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event221201/img01.png" alt="제7회 비상교육 창의 융합 수업 자료 공모전" /></h1>
					<div className="blind">
						<p>2022년 한 해 동안 선생님께서 직접 만들고 활용하셨던 창의 융합 수업 자료를 기다립니다.</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span><span className="txt">2022.12.01(목) ~ 2023.01.20(금)</span></li>
							<li><span className="tit">당첨자 발표</span><span className="txt">2023.02.20(월)</span></li>
						</ul>
					</div>
				</div>
				<div className="evtCont02">
					<h2><img src="/images/events/2022/event221201/img02.png" alt="공모 내용"/></h2>
					<div className="blind">
						<ul>
							<li>
								<strong>공모 주제</strong>
								<p>학교 현장에서 확용 가능한 차의 융합 수업 자료</p>
							</li>
							<li>
								<strong>출품 내용</strong>
								<ul>
									<li>초 · 중 · 고 학교에서 실제 활용된 비상교과서 수업 자료</li>
									<li>2차시 이상의 수업이 가능한 자료
										<ul>
											<li>전체 차시 계획 및 1차시 이상의 세부 수업 계획안 필수</li>
											<li>1개 이상의 활동지, 멀티미디어 자료 또는 활용 결과물 등의 이미지 포함 필수</li>
										</ul>
									</li>
								</ul>
								<p>※ 1인 1회 응모 가능하며, 1개 이상의 수업 자료 응모 가능</p>
							</li>
								<li>
										<strong>출품 양식</strong>
										<p>* PC 웹페이지에서 다운로드 할 수 있습니다.</p>
										<ul>
												<li>수업 계획안 + 수업 자료(활동지, 멀티미디어 자료 등)를 압축파일로 등록해 주세요.</li>
												<li>300MB 이상의 수업 자료는 이메일로 접수할 수 있습니다.<br />단, 수업계획안은 공모전 페이지를 통해 별도로 등록해 주셔야 합니다.<br />
														visangcontest@naver.com
												</li>
										</ul>
										<p>※ 이메일 제출 시, 제목을 설정해 주세요. [창의 융합 수업 자료 공모전_성명]</p>
								</li>
						</ul>
					</div>
					<div className="btnShareWrap">
						<p>공모전 공유하기</p>
						<button type="button" className="btnShare01" onClick={this.copyToClipboard}>
								<span className="blind">링크 복사</span>
						</button>
						<button type="button" className="btnShare02" onClick={this.onKakaoFeed}>
								<span className="blind">카카오톡 공유하기</span>
						</button>
					</div>
				</div>
				<div className="evtCont03">
					<h2><img src="/images/events/2022/event221201/img03.png" alt="시상 내역"/></h2>
					<div className="blind">
						<ul>
							<li>대상 300만원 상금 + 상패 (1명)</li>
							<li>최우수상 100만원 상금 + 상패 (5명)</li>
							<li>우수상 30만원 상금 + 상장 (10명)</li>
							<li>응원상 백화점 상품권 5만원권 (50명)</li>
							<li>참여상 스타벅스 카페 아메리카노T 2잔 100% 증정</li>
						</ul>
						<p>* 수업 계획안과 수업 자료를 모두 제출해주신 분들께 참여상을 드립니다.</p>
					</div>
				</div>
				<div className="evtCont04">
					<h2><img src="/images/events/2022/event221201/img04.png" alt="심사 기준"/></h2>
					<div className="blind">
						<ul>
							<li>학생 중심의 활동 수업이 가능한 수업 자료인가</li>
							<li>학생들의 흥미를 유발할 수 있는 수업 자료인가</li>
							<li>교과 내 혹은 교과 간 창의 융합 수업 자료인가</li>
						</ul>
					</div>
        </div>
        <div className="evtCont05">
					<h2><img src="/images/events/2022/event221201/img05.png" alt="당선 확률을 높이는 3가지 꿀팁!"/></h2>
					<div className="blind">
						<ul>
							<li>활동지와 사진 자료는 多多益善! 많으면 많을 수록 좋아요!</li>
							<li>비바샘 ‘공모전 수상작’ 채널에 공개된 주제와 겹치지 않을 수록 당첨 확률 UP!</li>
							<li>출품 가이드와 유의 사항을 꼼꼼하게 확인하고 제출해 주세요!</li>
						</ul>
						<p>※ 본 공모전은 비바샘 PC 웹페이지에서 응모 가능합니다.</p>
					</div>
					<div className="btnWrap">
							<a href="https://e.vivasam.com/class/alive/award/list?deviceMode=pc" target="_blank" className="btn">초등 공모전 수상작 보기</a>
							<a href="https://v.vivasam.com/opendata/OriginalIdeaConvergenceList.do?deviceMode=pc" target="_blank" className="btn">중고등 공모전 수상작 보기</a>
					</div>
				</div>
				<div className="evtCont06">
					<strong className="subTit">유의사항</strong>
					<ul>
						<li>제출하신 자료는 반환되지 않습니다.</li>
						<li>수상작에 대한 저작재산권 전부 및 2차적 저작물 작성권, 편집 저작물<br />작성권은 ㈜비상교육에 양도됩니다.<br />※ 수상작으로 선정되신 후에도 선생님께서 제출하신 자료를<br />수업용/강의용으로 언제든 활용하실 수 있습니다.</li>
						<li>비상교육에서 수상작을 편집 및 가공하여 사용하거나 자료집으로<br />제작할 시 선생님과의 협의 하에 진행되며, 전체 차시에 대한 세부 자료와<br />사진 사용에 대한 초상권 동의서 등을 요청 드릴 수 있습니다.</li>
						<li>당첨자에게는 공지사항 발표 후 개별 연락을 드립니다.<br />연락처를 확인해 주세요.</li>
						<li>대상, 최우수상, 우수상 상금은 제세공과금(4.4%)를 제외하고 지급합니다.</li>
						<li>대상, 최우수상, 우수상, 응원상을 수상하시는 분들께는 참여상을 중복하여 제공하지 않습니다.</li>
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