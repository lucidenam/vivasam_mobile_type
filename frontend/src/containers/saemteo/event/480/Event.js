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
		realUrl: 'https://me.vivasam.com/#/saemteo/event/view/423',
		devUrl: 'https://dev-me.vivasam.com/#/saemteo/event/view/423',
		webUrl: 'https://www.vivasam.com/event/2022/viewEvent423',
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
		aux.setAttribute("value", "https://mv.vivasam.com/#/saemteo/event/view/480");
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
			<section className="event231204">
				<div className="evtCont01">
					<h1><img src="/images/events/2023/event231204/evtTit.png" alt="제 8회 비상교육 창의융합&AI활용 수업 자료​ 공모전" /></h1>
					<div className="blind">
						<h2>제 8회 비상교육 창의융합&AI활용 수업 자료​ 공모전</h2>
						<p className="txt">2023년 한 해 동안 선생님께서 직접 만들고 활용하셨던 창의융합 & AI활용 수업 자료를 기다립니다.</p>
						<ul className="evtPeriod">
							<li><span className="tit">참여 기간</span><span className="txt">2023.12.06(수) ~ 2024.01.23(화)</span></li>
							<li><span className="tit">당첨자 발표</span><span className="txt">2024.02.21일(수)</span></li>
						</ul>
						<div>
							<strong>공모 주제 키워드는 두 가지입니다.</strong>
							<span>*아래 두 가지 키워드 중 하나만 선택하여 출품해주세요!</span>
						</div>
						<div>
							<dl>
								<dt>창의융합 수업 자료</dt>
								<dd>학교 현장엣 ㅓ활용 가능한 창의 융합 수업 자료</dd>
							</dl>
							<span>or</span>
							<dl>
								<dt>AI활용 수업 자료</dt>
								<dd>AI를 활용한 새로운 형태의 수업자료</dd>
							</dl>
						</div>
					</div>
				</div>
				<div className="btnShare2">
					<button type="button" onClick={this.copyToClipboard2}><span className="blind">이메일 주소 복사</span></button>
				</div>
				<div className="evtCont02">
					<img src="/images/events/2023/event231204/evtCont1.png" alt="공모 내용"/>
					<div className="blind">
						<div>
							<div>
								<span>참여 대상</span>
								<p>비바샘 초중고 교사 인증 완료한 회원(개인, 단체)</p>

								<span>공모 일정</span>
								<table>
									<tbody>
									<tr>
										<th>접수 기간</th>
										<td>2023.12.4(월) ~2023.1.21(일)</td>
									</tr>
									<tr>
										<th>수상작 발표</th>
										<td>2203.2.19(월)</td>
									</tr>
									<tr>
										<th>시상</th>
										<td>개별 연락​</td>
									</tr>
									</tbody>
								</table>

							</div>
						</div>
						<div>
							<span>상세 출품 내용</span>
							<ul>
								<li>*초•중•고 학교에서 실제 활용된 비상교과서 창의융합 수업 자료 또는 초중고 학교에서 실제 활용 가능한 AI 수업 자료​</li>
								<li>
									* 2차시 이상의 수업이 가능한 자료
									<ul>
										<li>- 전체 차시 계획 및 1차시 이상의 세부 수업 계획안 필수</li>
										<li>- 1개 이상의 활동지, 멀티미디어 자료 또는 활용 결과물 등의 이미지 포함 필수</li>
									</ul>
								</li>
							</ul>
							<span>※1인 1회 응모 가능하며, 1개 이상의 수업 자료 응모 가능</span>
						</div>
						<div>
							<strong>작품 접수방법</strong>
							<ul>
								<li>수업 계획안 샘플을 다운로드하여 수업 계획안을 작성해주세요.</li>
								<li>수업 계획안 + 수업 자료(활동지, 멀티미디어 자료 등)를 압축파일로 묶어주세요.</li>
								<li>
									하단 &#60;접수하기&#62; 를 통해 수업계획안+수업자료를 제출해주세요.
									<p>
										단, 압축파일이 300MB 이상일 경우 수업 계획안만  &#60;접수하기&#62;에 제출 후 수업 자료는 이메일로 추가 제출 해주세요.
										이메일로만 제출할 경우 작품이 누락될 수 있습니다.
										<span>visangcontest@naver.com</span>
									</p>
								</li>
							</ul>
							<p>
								※이메일 제출 시, 제목을 설정해 주세요. [창의 융합 수업 자료 공모전_성명]
							</p>
						</div>
					</div>
					{/*<button type="button" className="btnSampleDown" onClick={this.fileDown}><span className="blind">수업 계획안 샘플 다운로드</span></button>*/}
					<button type="button" className="btnShare" onClick={this.copyToClipboard}><span className="blind">이메일 주소 복사</span></button>
				</div>

				<div className="evtCont03">
					<img src="/images/events/2023/event231204/evtCont2.png" alt="시상 내역"/>

					<div className="blind">
						<strong><span className="blind">시상 내역</span></strong>

						<ul className="giftList">
							<li className="blind">대상 300만원 상금 + 상패 (1명)</li>
							<li className="blind">최우수상 100만원 상금 + 상패 (5명)</li>
							<li className="blind">우수상 30만원 상금 + 상장 (10명)</li>
							<li className="blind">아이디어 스파크 상 5만원권 신세계상품권 (50명)</li>
							<li className="blind"> 열정 페이백 상 스타벅스 디저트 세트</li>
						</ul>
						<p className="giftTxt">* 수업 계획안과 수업 자료를 모두 제출해주신 선생님께 열정 페이백 상 드려요!</p>

						<div>
							<div>
								<span>심사 기준</span>
								<ul>
									<li><span>01</span> 학생 중심의 활동 수업이 가능한 수업 자료인가</li>
									<li><span>02</span> 학생들의 흥미를 유발할 수 있는 수업 자료인가</li>
									<li><span>03</span> 창의융합 or AI를 활용한 수업 자료인가</li>
								</ul>
							</div>
							<div>
								<strong>비버샘이 알려주는 당성 꿀팁!</strong>

								<p>
									AI활용 수업 자료를 제출한 경우 특별 가산점을 부여해요.
									비바샘 ‘공모전 수상작‘ 채널에 공개된 주제와 겹치지 않을 수록 당선 확률 UP!
								</p>
								<p>
									출품 가이드와 유의 사항을 꼼꼼하게 확인하고 제출해 주세요!
								</p>
							</div>
						</div>
					</div>

					<div className="btnWrap">
						<a href="https://e.vivasam.com/class/alive/award/list?deviceMode=pc" target="_blank" className="ele">초등 공모전 수상작 보기</a>
						<a href="https://v.vivasam.com/opendata/OriginalIdeaConvergenceList.do?deviceMode=pc" target="_blank" className="mid">중고등 공모전 수상작 보기</a>
					</div>
				</div>
				<p className="pc_only">
					※ 본 공모전은 비바샘 PC 웹페이지에서 응모 가능합니다.
				</p>
				<div className="notice">
					<strong>유의사항</strong>
					<ul>
						<li>제출하신 자료는 반환되지 않습니다.​</li>
						<li>
							수상작에 대한 저작재산권 전부 및 2차적 저작물 작성권, 편집 저작물 작성권은 ㈜비상교육에
							양도됩니다.​<br />
							※수상작으로 선정되신 후에도 선생님께서 제출하신 자료를 수업용/강의용으로<br /> 언제든
							활용하실 수 있습니다.​
						</li>
						<li>
							비상교육에서 수상작을 편집 및 가공하여 사용하거나 자료집으로 제작, 비바샘 채널에<br />
							게시할 시 선생님과의 협의 하에 진행되며 전체 차시에 대한 세부 자료와 사진 사용에 대한<br />
							초상권 동의서 등을 요청 드릴 수 있습니다.​
						</li>
						<li>당첨자에게는 공지사항 발표 후 개별 연락을 드립니다. 연락처를 확인해 주세요​</li>
						<li>대상, 최우수상, 우수상 상금은 제세공과금(4.4%)를 제외하고 지급합니다.​</li>
						<li>경품은 중복하여 제공하지 않습니다. ​</li>
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