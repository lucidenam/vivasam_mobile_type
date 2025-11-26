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

const PAGE_SIZE = 4;
const subEventId = [412, 413];
const event1Items = ["허미야", "헬레나", "요정퍽", "오베른"];

class Event extends Component{
	state = {
		isSubEventApply1: false,
		isSubEventApply2: false,
		item1: false,				// 주제1 선택 여부
		item2: false,				// 주제2 선택 여부
		item3: false,				// 주제3 선택 여부
		item4: false,				// 주제4 선택 여부
		itemCount: [0,0,0,0],		// 주제 선택 횟수
		comment: '',				// 참여 댓글

		pageNo : 1, 				// 페이지
		pageSize : PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
		eventAnswerContents : [],	// 이벤트2 참여내용
		eventAnswerCount1 : 0,		// 이벤트1 참여자 수
		eventAnswerCount2 : 0,		// 이벤트2 참여자 수
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await this.eventApplyCheck();

			await this.checkEventCount();   		// 이벤트 참여자 수 조회
			await this.countConstructorList();		// 이벤트1 선택 횟수 조회
			await this.commentConstructorList();	// 이벤트2 댓글 목록 조회
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
		const {logged} = this.props;

		if (logged) {
			const response1 = await api.chkEventJoin({eventId: subEventId[0]});
			const response2 = await api.chkEventJoin({eventId: subEventId[1]});

			if (response1.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply1: true
				});
			}

			if (response2.data.eventJoinYn === 'Y') {
				this.setState({
					isEventApply2: true
				});
			}
		}
	}

	// 전제 조건
	prerequisite = (e) => {
		const {logged, history, BaseActions, loginInfo} = this.props;
		const {isEventApply1, isEventApply2} = this.state;

		// 로그인 여부
		if (!logged) {
			common.info("로그인 후 참여해 주세요.");
			BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
			history.push("/login");
			return false;
		}

		// 교사 인증 여부
		if (loginInfo.certifyCheck === 'N') {
			BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
			common.info("교사 인증 후 이벤트에 참여해 주세요.");
			window.location.hash = "/login/require";
			window.viewerClose();
			return false;
		}

		// 준회원 여부
		if (loginInfo.mLevel !== 'AU300') {
			common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
			return false;
		}

		// 기 신청 여부
		if (e.target.id == subEventId[0] && isEventApply1) {
			common.error("이미 신청하셨습니다.");
			return false;
		}

		if (e.target.id == subEventId[1] && isEventApply2) {
			common.error("이미 신청하셨습니다.");
			return false;
		}

		return true;
	}

	// 참여하기 버튼 클릭, eventApply로 이동
	eventApply = async (e) => {
		const {SaemteoActions, eventId, handleClick, loginInfo} = this.props;
		const {comment, item1, item2, item3, item4} = this.state;

		let eventAnswerContent = "";

		if (!this.prerequisite(e)) {
			return;
		}

		if (e.target.id == subEventId[0]) {
			if (!item1 && !item2 && !item3 && !item4) {
				common.info("나를 닮은 작품 속 주인공을 선택해 주세요.");
				return;
			} else {
				item1 ? eventAnswerContent = event1Items[0] + "^||^" : eventAnswerContent = "^||^";
				item2 ? eventAnswerContent += event1Items[1] + "^||^" : eventAnswerContent += "^||^";
				item3 ? eventAnswerContent += event1Items[2] + "^||^" : eventAnswerContent += "^||^";
				item4 ? eventAnswerContent += event1Items[3] + "^||^" : eventAnswerContent += "^||^";
			}
		} else if (e.target.id == subEventId[1]) {
			if (comment.length === 0 || comment === '') {
				common.info("선생님께 꼭 필요한 마법의 약과 이유를 적어주세요.");
				return;
			}
		}

		try {
			const eventAnswer = {
				eventId: e.target.id,
				memberId: loginInfo.memberId,
				eventAnswerContent: eventAnswerContent,
				eventAnswerComment: comment,
			};

			SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

			handleClick(eventId);    // 신청정보 팝업으로 이동
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
			}, 1000);//의도적 지연.
		}
	}

	handleChange = (e) => {
		this.setState({
			item1: false,
			item2: false,
			item3: false,
			item4: false,
			[e.target.id]: e.target.checked,
		});
	}

	// 이벤트2 입력창 focus시
	onFocusComment = (e) => {
		if (!this.prerequisite(e)) {
			document.activeElement.blur();
		}
	}

	// 이벤트2 입력창 입력마다
	setComment = (e) => {
		let comment = e.target.value;

		if (comment.length >= 100) {
			comment = comment.substring(0, 100);
		}

		this.setState({
			comment: comment
		});
	};

	handleClickPage = async (pageNo) => {
		const {BaseActions} = this.props;

		this.setState({
			pageNo : pageNo
		});
		BaseActions.openLoading();
		setTimeout(() => {
			try {
				this.commentConstructorList();	// 댓글 목록 조회
			} catch (e) {
				console.log(e);
				common.info(e.message);
			} finally {
				setTimeout(() => {
					BaseActions.closeLoading();
				}, 300);//의도적 지연.
			}
		}, 100);
	}

	// 이벤트 참여자수 확인
	checkEventCount = async () => {
		const {SaemteoActions} = this.props;
		const params1 = {
			eventId: subEventId[0]
		};
		const params2 = {
			eventId: subEventId[1]
		};
		let response1 = await SaemteoActions.checkEventTotalJoin(params1);
		let response2 = await SaemteoActions.checkEventTotalJoin(params2);

		this.setState({
			eventAnswerCount1: response1.data.eventAnswerCount,
			eventAnswerCount2: response2.data.eventAnswerCount
		});
	};

	// 참여 정보 출력
	countConstructorList = async () => {
		const {itemCount, eventAnswerCount1} = this.state;

		const params = {
			eventId: subEventId[0],
			eventAnswerSeq: 2,
			answerPage: {
				pageNo: 1,
				pageSize: eventAnswerCount1
			}
		};

		const responseList =  await api.getEventAnswerList(params);
		let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

		for (let i = 0; i < eventJoinAnswerList.length; i++) {
			let answers = eventJoinAnswerList[i].event_answer_desc.split('^||^');

			for (let idx = 0; idx < event1Items.length; idx++) {
				if (answers[idx] == event1Items[idx]) {
					itemCount[idx]++;
					break;
				}
			}
		}

		this.setState({
			itemCount: itemCount
		});
	};

	// 댓글 출력
	commentConstructorList = async () => {
		const {pageNo, pageSize} = this.state;

		const params = {
			eventId: subEventId[1],
			eventAnswerSeq: 2,
			answerPage: {
				pageNo: pageNo,
				pageSize: pageSize
			}
		};

		const responseList =  await api.getEventAnswerList(params);
		let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

		// 조회가 완료되면 다음 조회할 건수 설정
		this.setState({
			eventAnswerContents : eventJoinAnswerList,
		});
	};

	render() {
		const {comment, eventAnswerContents, eventAnswerCount2, pageNo, pageSize, itemCount} = this.state;

		const totalPage = Math.ceil(eventAnswerCount2 / pageSize);
		const curPage = pageNo;
		const pagesInScreen = 5;
		let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
		let endPageInScreen = startPageInScreen + pagesInScreen - 1;

		if (totalPage < endPageInScreen) {
			endPageInScreen = totalPage;
		}
		// 페이징
		const pageList = () => {
			const result = [];
			for (let i = startPageInScreen; i <= endPageInScreen; i++) {
				result.push(<li className={curPage === i ? 'on' : ''} onClick={() => {
					this.handleClickPage(i)
				}}><button>{i}</button></li>);
			}
			return result;
		}
		// 댓글
		const eventList = eventAnswerContents.map(eventList => {
			const result = <EventListApply {...eventList} key={eventList.event_answer_id}/>;
			return result;
		});

		return (
			<section className="event220718">
				<div className="evtCont01">
					<div className="cont1_top">
						<h1>비상 한 여름밤의 꿈</h1>
						<p className="txt">
							다양한 사람의 모습을 담은 셰익스피어의'한 여름 밤의 꿈'을 기억하시나요?
							비바샘이 선생님들의 다가오는 여름 밤을 특별한 이야기와 작품을 닮은 선물로 채워 드립니다.
						</p>
						<div className="evtPeriod">
							<div className="blind">
								<div><span className="tit">참여 기간</span><span className="txt">2022년 7월 18일 ~ 8월 28일</span></div>
								<div><span className="tit">당첨자 발표</span>
									<span>[이벤트1]이벤트 기간 중 매주 화요일/비바샘 공지사항</span>
									<span>[이벤트2]8월31일/비바샘 공지사항</span>
								</div>
							</div>
						</div>
					</div>

				</div>
				<div className="evtBg">
					<div className="evtBg_ico"></div>
					<div className="evtCont02">
						<div className="visangTeacher">
							이벤트1
							<h2 className="teacherTit">나를 닮은 작품속 주인공은 누구인가요?</h2>
							<p className="txt">
								‘한 여름 밤의 꿈’ 속에는 네 명의 주인공이 등장합니다.
								부모님의 반대로 사랑에 위기를 겪는 허미야와 라이샌더,
								어긋난 사랑을 쫓는 드리트리우스와 헬레나.
								이들의 사각 관계를 안타까워 한 요정세계의 왕 오베른과 요정 퍽도
								작품에서 중요한 역할을 하는데요.
								선생님과 어울리는 주인공은 누구인가요?
							</p>
							<div className="evtGift1">
								<div className="blind">
									<span>매주 화요일/매주 100명 선생니께</span>
									<p>스타벅스 딸기 딜라이트 요거트 블렌디드T</p>
								</div>
							</div>
							<ul className='cont02List'>
								<li>
									<div className="list_check">
										<input type="radio" id="item1" name="hero" onChange={this.handleChange}/>
										<label htmlFor="item1">
											<div className="blind">
												<h3>허미야</h3>
												<p>사랑에 대한 강력한 신뢰자</p>
												<p>"사랑 앞에서 죽음도 두렵지 않아요!"</p>
											</div>
											<div className="count">
												<p>{itemCount[0]}</p><span>명</span>
											</div>
										</label>
									</div>
								</li>
								<li>
									<div className="list_check">
										<input type="radio" id="item2" name="hero" onChange={this.handleChange}/>
										<label htmlFor="item2">
											<div className="blind">
												<h3>헬레나</h3>
												<p>사랑을 향한 성실한 안내자</p>
												<p>"저는 항상 이 자리에 있을게요."</p>
											</div>
											<div className="count">
												<p>{itemCount[1]}</p><span>명</span>
											</div>
										</label>
									</div>
								</li>
								<li>
									<div className="list_check">
										<input type="radio" id="item3" name="hero" onChange={this.handleChange}/>
										<label htmlFor="item3">
											<div className="blind">
												<h3>요정 퍽</h3>
												<p>유쾌한 사랑읭 장난 꾸러기</p>
												<p>"즐겁고 경쾌한게 사랑 아닌가요?"</p>
											</div>
											<div className="count">
												<p>{itemCount[2]}</p><span>명</span>
											</div>
										</label>
									</div>
								</li>
								<li>
									<div className="list_check">
										<input type="radio" id="item4" name="hero" onChange={this.handleChange}/>
										<label htmlFor="item4">
											<div className="blind">
												<h3>오베른</h3>
												<p>느동적인 사랑의 주도자</p>
												<p>"내가 이 관계를 바로잡겠어!"</p>
											</div>
											<div className="count">
												<p>{itemCount[3]}</p><span>명</span>
											</div>
										</label>
									</div>

								</li>
							</ul>
							<button className="evtBtn" onClick={this.eventApply}>
								<img src="/images/events/2022/event220718/btnApply1.png" alt="참여하기" id={subEventId[0]}/>
							</button>
						</div>
					</div>
					<div className="evtCont03">
						<div className="visangClass">
							이벤트2
							<h2 className="teacherTit">올 여름, 나에게 필요한 마법의 약은?</h2>
							<p className="txt">
								사랑의 묘약으로 시각 관계의 새로운 반전을 만든 요정 퍽!
								올 여름, 선생님께 꼭 필요한 마법의 약은 무엇인가요?
							</p>
							<div className="evtGift2">
								<div className="gift">
									<span className="blind">8월 31일 총 100명의 선생님께</span>
								</div>
								<ul>
									<li>
										<span>에너지 한약</span>
										<p>정관장 홍삼지갑</p>
									</li>
									<li>
										<span>달콤한 예약</span>
										<p>메가박스 영화티켓 2인권</p>
									</li>
									<li>
										<span>쌉쌉한 물약</span>
										<p>오설록 웨딩그린티 + 녹차 웨하스</p>
									</li>
								</ul>
							</div>
							<div className="evtTxt_form">
								<textarea placeholder="마법의 약과 이유를 적어주세요.(100자 이내)" onFocus={this.onFocusComment} onChange={this.setComment} value={comment}></textarea>
								<div className="txt_count">
									<span><span className="currentCount">{comment.length}</span>/100</span>
								</div>
							</div>
							<button className="evtBtn" onClick={this.eventApply}>
								<img src="/images/events/2022/event220718/btnApply2.png" alt="참여하기" id={subEventId[1]}/>
							</button>
						</div>
						{eventAnswerCount2 > 0 &&
						<div className="commentWrap">
							<div className="commnetList">
								{eventList}
							</div>
							<div className="comment_arr">
								{curPage > 1 &&
								<button className="arr_prev" onClick={() => {
									this.handleClickPage(curPage - 1)
								}}></button>
								}
								{curPage < totalPage &&
								<button className="arr_next" onClick={() => {
									this.handleClickPage(curPage + 1)
								}}></button>
								}
							</div>
							<div className="commentPager_wrap">
								{startPageInScreen > 1 &&
								<button className="prevAll" onClick={() => {
									this.handleClickPage(1)
								}}>
								</button>
								}
								{startPageInScreen > 1 &&
								<button className="prev" onClick={() => {
									this.handleClickPage(startPageInScreen - 1)
								}}>
								</button>
								}
								<ul className='commentPager'>
									{pageList()}
								</ul>
								{endPageInScreen < totalPage &&
								<button className="next" onClick={() => {
									this.handleClickPage(endPageInScreen + 1)
								}}>
								</button>
								}
								{endPageInScreen < totalPage &&
								<button className="nextAll" onClick={() => {
									this.handleClickPage(totalPage)
								}}>
								</button>
								}
							</div>
						</div>}
						{/*<div className="commentWrap">*/}
						{/*	<div className='commnetList'>*/}
						{/*		<div className="listItem">*/}
						{/*			<div className="comment_inner">*/}
						{/*				<div className="comment">*/}
						{/*					<span className="teacher_id">abc선생님</span>*/}
						{/*					<p>*/}
						{/*						하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는.*/}
						{/*					</p>*/}
						{/*				</div>*/}
						{/*			</div>*/}
						{/*		</div>*/}
						{/*		<div className="listItem">*/}
						{/*			<div className="comment_inner">*/}
						{/*				<div className="commnet">*/}
						{/*					<span className="teacher_id">abc선생님</span>*/}
						{/*					<p>*/}
						{/*						하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는.*/}
						{/*					</p>*/}
						{/*				</div>*/}
						{/*			</div>*/}
						{/*		</div>*/}
						{/*		<div className="listItem">*/}
						{/*			<div className="comment_inner">*/}
						{/*				<div className="commnet">*/}
						{/*					<span className="teacher_id">abc선생님</span>*/}
						{/*					<p>*/}
						{/*						하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는.*/}
						{/*					</p>*/}
						{/*				</div>*/}
						{/*			</div>*/}
						{/*		</div>*/}
						{/*		<div className="listItem">*/}
						{/*			<div className="comment_inner">*/}
						{/*				<div className="commnet">*/}
						{/*					<span className="teacher_id">abc선생님</span>*/}
						{/*					<p>*/}
						{/*						하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는..하루하루 해야 하는 일을 시간 맞춰 해내려고 무던히도 애쓰는 타입*/}
						{/*						최대한 다른 사람에게 피해주지 않으려고 하다보니 개미 중에서도 여왕개미가 아닌 일개미와 맞는 듯 합니다.*/}
						{/*						일개미 중에서도 상일개미ㅠㅠ*/}
						{/*						근데 또 제대로 해내지 못하는 것에 엄청난 스트레스를 받는.*/}
						{/*					</p>*/}
						{/*				</div>*/}
						{/*			</div>*/}
						{/*		</div>*/}
						{/*	</div>*/}
						{/*	<div className="comment_arr">*/}
						{/*		<button className="arr_prev">이전</button>*/}
						{/*		<button className="arr_next">다음</button>*/}
						{/*	</div>*/}
						{/*	<div className="commentPager_wrap">*/}
						{/*		<ul className='commentPager'>*/}
						{/*			<li className="on"></li>*/}
						{/*			<li></li>*/}
						{/*			<li></li>*/}
						{/*			<li></li>*/}
						{/*		</ul>*/}
						{/*	</div>*/}
						{/*</div>*/}
					</div>
				</div>
				<div className="notice">
					<span className="noticeTit">유의사항</span>
					<ul>
						<li>
							<span className="list_num">1.</span> 각 이벤트 당 1인 1회 참여하실 수 있습니다.
						</li>
						<li>
							<span className="list_num">2.</span> 참여 완료 후에는 수정 및 추가 참여가 어렵습니다.
						</li>
						<li>
							<span className="list_num">3.</span>모든 경품은 참여하신 휴대전화번호로 발송되며, 유효기간이 지난 기프티콘은<br />
							다시 발송해 드리지 않습니다.
						</li>
						<li>
							<span className="list_num">4.</span>선물 발송을 위해 개인정보(성명,휴대전화번호)가 서비스사와 상품  <br/>
							배송업체에 제공됩니다.<br /> (㈜카카오 사업자등록번호 120-81-47521)
						</li>
						<li>
							<span className="list_num">※</span> 이벤트 관련 문의 : 02-6970-6498
						</li>
					</ul>
				</div>
			</section>
		)
	}
}

//=============================================================================
// 댓글 목록 component
//=============================================================================

class EventListApply extends Component{

	constructor(props) {
		super(props);
		this.state = {
			member_id : this.props.member_id, // 멤버 아이디
			event_id : this.props.event_id, // eventId
			event_answer_desc : this.props.event_answer_desc, // 응답문항
			reg_dttm : this.props.reg_dttm, // 등록일
			BaseActions : this.props.BaseActions, // BaseAction
			eventType : "", // 이벤트 타입
			eventName : "", // 이벤트 응모자
			eventRegDate : "", // 이벤트 등록일
			eventContents : "", // 이벤트 내용
			eventLength : "", // 이벤트 길이
		}
	}

	componentDidMount = () => {
		this.eventListApply();
	};

	eventListApply = () => { // 이벤트 표시 값 세팅

		let eventSetName = JSON.stringify(this.state.member_id).substring(1,4) + "***"; // 이벤트 이름
		let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
		let answers = JSON.stringify(this.state.event_answer_desc).substring(1,eventSetContentLength-1).split('^||^');
		let eventSetContents = answers[0]; // 이벤트 내용

		eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
		eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

		this.setState({
			eventName : eventSetName,
			eventContents : eventSetContents,
		});
	};

	render() {
		return (
			<div className="listItem">
				<div className="comment_inner">
					<div className="comment">
						<span className="teacher_id">{this.state.eventName} 선생님</span>
						<p dangerouslySetInnerHTML={{__html: this.state.eventContents}}></p>
					</div>
				</div>
			</div>
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
	})
)(withRouter(Event));