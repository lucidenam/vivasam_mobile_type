import React, {Component, useRef} from 'react';
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
		realUrl: 'https://me.vivasam.com/#/saemteo/event/view/532',
		devUrl: 'https://dev-me.vivasam.com/#/saemteo/event/view/532',
		webUrl: 'https://www.vivasam.com/event/2024/viewEvent532',
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
		aux.setAttribute("value", "visangcontest@naver.com");
		// bdy에 추가한다.
		document.body.appendChild(aux);
		// 지정된 내용을 강조한다.
		aux.select();
		// 텍스트를 카피 하는 변수를 생성
		document.execCommand("copy");
		// body 로 부터 다시 반환 한다.
		document.body.removeChild(aux);
		common.info('이메일 주소가 복사되었습니다.​\n' + '용량이 큰 수업 자료를 이메일로 보내실 때는 반드시 하단의 ‘참여하기’를 통해 ‘수업 계획안’을 등록해 주세요.\n');
	};

	copyToClipboard2 = (e) => {
		// 글을 쓸 수 있는 란을 만든다.
		let aux = document.createElement("input");
		// 지정된 요소의 값을 할당 한다.
		aux.setAttribute("value", "https://mv.vivasam.com/#/saemteo/event/view/532");
		// bdy에 추가한다.
		document.body.appendChild(aux);
		// 지정된 내용을 강조한다.
		aux.select();
		// 텍스트를 카피 하는 변수를 생성
		document.execCommand("copy");
		// body 로 부터 다시 반환 한다.
		document.body.removeChild(aux);
		common.info('링크가 복사되었습니다. 동료 선생님과 함께 공모전에 참여해 보세요.');
	};

	// 수업 계획안 샘플 다운로드
	fileDown = async () => {

		fetch("https://dn.vivasam.com/VS/EVENT/zip/contents/제8회 창의융합 & AI활용 수업자료 공모전 수업계획안.zip", {
			method: 'GET',
		})
			// 응답 데이터를 블롭(Blob) 객체로 변환
			.then((response) => {
				return response.blob()
			})
			.then((blob) => {
				// 블롭(Blob) 객체 생성하고 URL을 생성
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');

				// 생성한 URL과 다운로드할 파일명 설정
				link.setAttribute('href', url);
				link.setAttribute('download', '제8회 창의융합 수업자료 공모전-수업계획안 샘플.zip');

				// 링크를 문서(body)에 추가
				document.body.appendChild(link);

				// 링크 클릭 => 파일 다운로드
				link.click();

				// 다운로드 후 링크와 URL을 정리
				link.parentNode.removeChild(link);
				window.URL.revokeObjectURL(url)
			});

	}

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
			<section className="event241209">
				<div className="evtCont01">
					<h1><img src="/images/events/2024/event241209/img1.png" alt="제 8회 비상교육 창의융합&AI활용 수업 자료 공모전"/></h1>
				</div>
				<div className="btnShare2">
					<button type="button" onClick={this.copyToClipboard2}><span className="blind">이메일 주소 복사</span></button>
				</div>
				<div className="evtCont02">
					<img src="/images/events/2024/event241209/img2.png" alt="공모 내용"/>
					<button type="button" className="btnShare" onClick={this.copyToClipboard}>
						<span className="blind">이메일 주소 복사</span></button>
				</div>

				<div className="evtCont03">
					<img src="/images/events/2024/event241209/img3.png" alt="시상 내역"/>
					<div className="btnWrap">
						<a href="https://e.vivasam.com/class/alive/award/list?deviceMode=pc" target="_blank" className="ele"></a>
						<a href="https://v.vivasam.com/opendata/OriginalIdeaConvergenceList.do?deviceMode=pc" target="_blank" className="mid"></a>
					</div>
				</div>
				<div className="evt_notice">
					<strong>유의사항</strong>
					<ul>
						<li>제출하신 자료는 반환되지 않습니다.</li>
						<li>1인 1회 / 1팀 1회 참여 가능하며, 여러 수업의 자료를 한꺼번에 응모하실 수 있습니다.</li>
						<li>교사 인증을 완료한 초·중·고등학교 선생님만 접수 가능합니다.</li>
						<li>수상작에 대한 저작재산권 전부 및 2차적 저작물 작성권, 편집 저작물 작성권은 ㈜비상교육에 양도됩니다. <br/>※수상작으로 선정되신 후에도 선생님께서 제출하신 자료를 수업용/강의용으로 언제든 활용하실 수 있습니다.</li>
						<li>비상교육에서 수상작을 편집 및 가공하여 사용하거나 자료집으로 제작, 비바샘 채널에 게시할 시 선생님과의 협의 하에 진행됩니다.</li>
						<li>전체 차시에 대한 세부 자료와 사진 사용에 대한 초상권 동의서 등을 요청드릴 수 있습니다.</li>
						<li>당첨자에게는 공지사항 발표 후 개별 연락을 드립니다. 연락처를 확인해 주세요.</li>
						<li>대상, 최우수상, 우수상 상금은 제세공과금(22%)을 제외하고 지급하며, 지급에 필요한 서류를 추가 제출해 주셔야 합니다.</li>
						<li>경품은 중복하여 제공되지 않습니다.</li>
						<li>상황에 따라 동일 조건의 타상품으로 변경될 수 있습니다.</li>
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