import React, {Component} from 'react';
import './Event.css';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import * as viewerActions from 'store/modules/viewer';
import {bindActionCreators} from "redux";

class Event extends Component{

	state = {
		isEventApply: false,    // 신청여부
	}

	componentDidMount = () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();

		try {
		} catch (e) {
			console.log(e);
			common.info(e.message);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	};

	render () {
		return (
			<section className="event220520">
				<div className="evtCont01">
					<h1><img src="/images/events/2022/event220607/img1.png" alt="비상한 콘테스트"/></h1>
					<div className="blind">
						<p>VISANG + 한해 4탄</p>
						<h2>비상한 콘테스트</h2>
						<span>
							아이들이 공부하고 싶게 만드는 디자인!
							'갖고 싶은 예쁜 교과서'로 학생들의 마음을
							사로잡은 VISANG 교과서!

							선생님과 학생들이 감각으로
							또 하나의 VISANG 교과서 표지를 만들어 주세요.
						</span>
						<div>
							<span>참여기간</span>
							<span>2022.06.07 ~ 2022.06.30</span>
						</div>
						<span>*비상한 콘테스트는 PC에서 다시 참여하실 수 있습니다.</span>
					</div>
					<div className="evtContWrap">
						<h1><img src="/images/events/2022/event220607/img1-1.png" alt="콘테스트 안내"/></h1>
						<div className="blind">
							<h3>콘테스트 안내</h3>
							<ul>
								<li>
									<span>주제 :</span> <p>비상 교과서 표지를 활용한 컬러링 작품</p>
								</li>
								<li>
									<span>부문 :</span>
									<dl>
										<dt>교사 부문</dt>
										<dd>비바샘 회원 선생님</dd>
									</dl>
									<dl>
										<dt>학급 부문</dt>
										<dd>전국의 초.중.고 학급</dd>
									</dl>
								</li>
								<li>
									<span>참여방법:</span>
									<ul>
										<li>
											<span>도안을 선택하여 프린터로 출력해 주세요</span>
											<p>교사 : 1인 3장까지선택하여 제출할 수 있습니다.</p>
											<p>학급 : 학생 1인당 1장만 제출 가능합니다. 학생마다 다른 도안을 선택해도 됩니다.</p>
										</li>
										<li>
											<span>도안을 나만의 감각으로 꾸며 주세요.</span>
											<p>색연필, 크레파스, 물감, 반짝이, 색종이 등 재료에 대한 제한은 없습니다.</p>
											<p>글미이나 글씨 등으로 여백을 자유롭게 채워 넣어도 됩니다.</p>
										</li>
										<li>
											<span>완성된 작품 파일 + 신청서를 제출합니다.</span>
											<p>완성된 작품은 3가지 방법 중 1가지를 선택하여 제출해 주세요.</p>
											<ul>
												<li>
													<span>1 사진으로 제출</span>: 작품을 사진으로 찍어 파일을 등록해 주세요.
												</li>
												<li>
													<span>2 스캔 파일 제출</span>: 작품을 스캔하여 파일을 등록해 주세요.
												</li>
												<li>
													<span>3 우편으로 제푸</span>: 아래의 주소로 우편을 보내주세요.(7월 10일까지 도착 마감)
												</li>
												<span>* 서울시 구로구 디지털로 33길 48 대룡포스트타워 7차 20층 / 비바샘 운영자</span>
											</ul>
										</li>
									</ul>
								</li>
							</ul>

							<p>등록 파일은 100MB까지 가능하며, 용량이 큰 경우 메일로 접수 가능합니다.</p>
							<span>visangcontest@naver.com</span>
							<p>신청서는 1인/1학급당 1장을 제출해 주셔야 합니다.</p>
						</div>
					</div>
					<div className="evtContWrap">
						<h1><img src="/images/events/2022/event220607/img2.png" alt="심사기준"/></h1>
						<div className="blind">
							<h3>심사기준</h3>
							<ul>
								<li>
									<span>01</span>
									<p>아이디어를 담아 독창적으로 잘 채색하였는가</p>
								</li>
								<li>
									<span>02</span>
									<p>개인의 개성을
										잘 살려
										표현하였는가
									</p>
								</li>
								<li>
									<span>03</span>
									<p>색채 조화 및
										최종 완성도 수준
									</p>
									<span>
										* 학급 부문 초/중/고
										다른 기준으로 평가
									</span>
								</li>
							</ul>
						</div>
					</div>
					<div className="evtContWrap">
						<h1><img src="/images/events/2022/event220607/img3.png" alt="시상내역"/></h1>
						<div className="blind">
							<h3>심사기준</h3>
							<ul>
								<li>
									<h4>교사 부문(136명)</h4>
									<ul>
										<li>
											<span>대상 [1명]</span>
											<p>신세계 상품권 20만원 +
												우드케이스 미술용품 세트
											</p>
										</li>
										<li>
											<span>최우수상 [5명]</span>
											<p>신세계 상품권 10만원 +
												우드케이스 미술용품 세트
											</p>
										</li>
										<li>
											<span>우수상 [30명]</span>
											<p>베스킨라빈스
												아이스크림 케이크
											</p>
										</li>
										<li>
											<span>감각상 [100명]</span>
											<p>스타벅스
												아이스 카페라떼 T
											</p>
										</li>
									</ul>
								</li>
								<li>
									<h4>학급 부문(10개 학급)</h4>
									<ul>
										<li>
											<p>
												개성이 넘치는 10개 학급에 든든한 간식박스를 선물합니다!
											</p>
										</li>
									</ul>
								</li>
							</ul>
						</div>
					</div>
					<div className="evtContWrap">
						<h1><img src="/images/events/2022/event220607/img4.png" alt="도안 다운로드"/></h1>
						<div className="blind">
							<h3>도안 다운로드</h3>
							<span>*도안은 PC에서 미리보기/다운로드를 하실 수 있습니다.</span>
							<span>위 이미지는 도안으로 제작된 초중고 VISANG교과서 표지입니다.</span>
							<span>작품 등록은 PC에서만 가능합니다.</span>
						</div>
					</div>
					<div className="evtFooter">
						<h2><img src="/images/events/2022/event220607/evtFooter.png" alt="유의사항"/></h2>
						<div className="blind">
							<ul className="evtInfoList">
								<li>· 제출하신 자료는 반환되지 않습니다.</li>
								<li>· 제출하신 자료는 상업적인 사용 목적이 아닌, 기업의 활동 소개를 위해 사용될 수 있습니다..</li>
								<li>· 비상교육에서 홍보용으로 작품 사용이 필요할 경우, 선생님/학생과의 협의 하에 진행합니다.</li>
								<li>· 선정되신 분께는 개별 연락을 드릴 예정입니다. 연락처를 확인해 주세요.</li>
								<li>· 콘테스트 관련 문의 : 02-6970-6429</li>
							</ul>
						</div>
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
		MyclassActions: bindActionCreators(myclassActions, dispatch),
		ViewerActions: bindActionCreators(viewerActions, dispatch)
	})
)(withRouter(Event));