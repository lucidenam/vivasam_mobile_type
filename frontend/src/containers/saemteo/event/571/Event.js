import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import * as myclassActions from "../../../../store/modules/myclass";
import {maskingStr} from '../../../../lib/StringUtils';
import {isAndroid, isIOS} from 'react-device-detect';

const PAGE_SIZE = 6;

class Event extends Component {
  state = {
    eventId: 571,
    isEventApply: false, // 신청여부
    schoolLvlCd: '',
    pageNo: 1, 				    // 페이지
    pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
    eventAnswerContents: [],	// 이벤트 참여내용
    eventAnswerCount: 0,		// 이벤트 참여자 수
    eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
    eventAnswerLeaveCnt: 0, // 남은 댓글 수
    eventStep1:false,
    eventStep2:false,
    eventStep3:false,
    eventStep4:false
  }

  componentDidMount = async () => {
    const {BaseActions} = this.props;
    BaseActions.openLoading();
    try {
      await this.eventApplyCheck();
      await this.checkEventCount();   		// 이벤트 참여자 수 조회
      await this.commentConstructorList();	// 이벤트 댓글 목록 조회
    } catch (e) {
      console.log(e);
      common.info(e.message);
    } finally {
      setTimeout(() => {
        BaseActions.closeLoading();
      }, 1000);//의도적 지연.
    }

    await this.setEventInfo();

  };

  // 기 신청 여부 체크
  eventApplyCheck = async () => {
    const {logged} = this.props;
    const {isEventApply} = this.state;

    if (logged) {
      const response = await api.chkEventJoin({eventId: 571});

      if (response.data.eventJoinYn === 'Y') {
        this.setState({
          isEventApply: true
        });
      }
    }
  }

  setEventInfo = async () => {
    const {event, SaemteoActions} = this.props;

    event.teacherAnnual = '';
    event.teacherHope = '';
    SaemteoActions.pushValues({type: "event", object: event});
  }

  handleClickPage = async (pageNo) => {
    const {BaseActions} = this.props;

    this.setState({
      pageNo: pageNo
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
    const {SaemteoActions, eventId} = this.props;
    const params = {
      eventId: 571,
      eventAnswerSeq: 2,
      answerIndex: 1
    };
    let response2 = await api.getSpecificEventAnswerCount(params);
    this.setState({
      eventAnswerCount: response2.data.eventAnswerCount
    });
  };

  // 댓글 출력
  commentConstructorList = async () => {
    const {pageNo, pageSize, eventId, eventAnswerCount} = this.state;

    const params = {
      eventId: eventId,
      eventAnswerSeq: 2,
      answerPage: {
        pageNo: pageNo,
        pageSize: pageSize
      }
    };

    const responseList = await api.getSpecificEventAnswerList(params);
    let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

    // 최초 조회시 전체건수가 6건이상이면 더보기 버튼 표시
    if(eventAnswerCount > PAGE_SIZE){
      this.setState({
        eventViewAddButton : 1
      });
    }

    // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
    if(eventAnswerCount <= this.state.pageSize) {
      this.setState({
        eventViewAddButton: 0
      });
    }

    // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
    if(this.state.eventAnswerCount <= this.state.pageSize) {
      this.setState({
        eventViewAddButton: 0
      });
    }

    this.setState({
      eventAnswerContents : eventJoinAnswerList,
      pageSize : this.state.pageSize + PAGE_SIZE,
      eventAnswerLeaveCnt : eventAnswerCount - eventJoinAnswerList.length,
    });
  };

  // 전제 조건
  prerequisite = (e) => {
    const {logged, history, BaseActions, loginInfo} = this.props;
    const {isEventApply, eventStep1, eventStep2, eventStep3, eventStep4} = this.state;
    let schoolLvlCd = loginInfo.schoolLvlCd;

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
      common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
      return false;
    }

    if (schoolLvlCd != 'ES') {
      common.info("초등 선생님만 신청 가능합니다.");
      return false;
    }

    if (!eventStep1 || !eventStep2 || !eventStep3 || !eventStep4) {
      common.info("스탬프 투어 지도에 있는 서비스를 모두 체험하고 참여를 해주세요!");
      return false;
    }

    // 기 신청 여부
    if (isEventApply) {
      common.error("이미 신청하셨습니다.");
      return false;
    }


    return true;
  }

  eventApply = async (e) => {
    const {logged, loginInfo, SaemteoActions, eventId, handleClick, event} = this.props;

    if (!this.prerequisite(e)) {
      return false;
    }

    try {
      const eventAnswer = {
        eventId: eventId,
        memberId: loginInfo.memberId
      }
      SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
      handleClick(eventId);
    } catch (e) {
      console.log(e);
    } finally {
      setTimeout(() => {
      }, 1000);//의도적 지연.
    }
  };

  // 댓글 더보기
  commentListAddAction = () => {
    this.commentConstructorList(); // 댓글 목록 갱신
  };

  checkClickEvent = (clickPostion) => {
    const {logged} = this.props;
    let pageUrl;
    if (!logged) {
      common.info("로그인 후 참여해주세요.");
      return false;
    } else {
      if (clickPostion === 'eventClick1') {
        pageUrl = "https://e.vivasam.com/themeplace/realisticExp/society/main";
        this.setState({eventStep1:true});
      }

      if (clickPostion === 'eventClick2') {
        pageUrl = "https://e.vivasam.com/themeplace/keywordHistory/main";
        this.setState({eventStep2:true});
      }

      if (clickPostion === 'eventClick3') {
        pageUrl = "https://v.vivasam.com/themeplace/vrkoreanhis/main.do";
        this.setState({eventStep3:true});
      }

      if (clickPostion === 'eventClick4') {
        pageUrl = "https://e.vivasam.com/themeplace/localLibrary/main";
        this.setState({eventStep4:true});
      }

      if (isIOS) {
        window.location.href = pageUrl;
      } else {
        window.open(pageUrl,"_blank");
      }
    }
  }

  render() {
    const {eventAnswerContents,eventViewAddButton, eventStep1, eventStep2, eventStep3, eventStep4, eventAnswerLeaveCnt} = this.state;

    const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
        <EventListApply {...eventList} key={eventList.event_answer_id}/>
    );

    return (
        <section className="event250703">
          <div className="evtTitWrap">
            <h1><img src="/images/events/2025/event250703/img1.png" alt=""/></h1>
            <div className="blind">
              <h3>제2회 비바샘 AI 플랫폼 활용 공모전</h3>
              <h2>도전 ! AI 알잘딱깔샘! 인기투표</h2>
              <p>바야흐로 AI 시대, 알아서 척척! 깔끔하게 착착!<br/> AI로 더 똑똑하게 수업하는 선생님,<br/>이젠 선생님의 노하우를 뽐내볼 시간!<br/>선생님의 똑똑한 AI 활용법으로 비바샘 광고를
                만들어주세요!</p>
            </div>
          </div>

          <div className="evtContWrap">
            <div className="evtCont evtCont01">
              <img src="/images/events/2025/event250703/img2.png" alt="공모전 안내"/>
              <div className="blind">
                <h3>공모전 안내</h3>
                <dl>
                  <dt>참여 대상</dt>
                  <dd>비바샘 사이트에서 교사 인증 완료한 초·중·고 학교 선생님(개인)</dd>
                </dl>
                <dl>
                  <dt>출품 내용</dt>
                  <dd>
                    AI 프로그램을 활용하여 제작한 비바샘 광고(이미지,음원,영상)
                    <p>
                      영상 : 5분이내/mp4,mov,avi 등 웹에서 재생 가능한 파일 형식<br/>
                      (*일반 파일10MB & 대용량파일 전체2.00GBx10개까지 메일 첨부 가능)
                    </p>
                    <p>
                      음원 : 3분 이내 / mp3, wav 등 웹에서 재생 가능한 파일 형식
                    </p>
                    <p>
                      이미지 : jpg, png 등 웹에서 확인 가능한 파일 형식<br/>
                      (*추후 수상작에 한해 PSD / AI 원본 파일 수급 예정)
                    </p>
                  </dd>
                </dl>
                <dl>
                  <dt>참여 횟수 및 응모 작품 수</dt>
                  <dd> ※ 1인 1회 참여 가능, 부문 상관없이 최대 3개 작품 응모 가능</dd>
                </dl>
              </div>
              <img src="/images/events/2025/event250703/img3.png" alt="작품 접수 방법"/>
              <div className="blind">
                <h3>작품 접수 방법 : 본 공모전 참여는 pc에서만 가능합니다.</h3>
                <dl>
                  <dt>STEP 1</dt>
                  <dd>공모작은 이메일로 제출해 주세요.<br/>
                    visangcontest@naver.com<br/>
                    이메일 제출 시, 이메일 제목을 설정해 주세요.<br/>
                    ex) [비바샘 AI 플랫폼 활용 공모전_성명]
                  </dd>
                </dl>
                <dl>
                  <dt>STEP 2</dt>
                  <dd>
                    신청서는 작성 후, PC 이벤트 페이지 하단의 &lt;참여하기&gt; 를 통해 제출해 주세요.
                    <p>
                      *이메일로만 작품을 제출하신 경우 접수가 누락될 수 있으므로,<br/>
                      이벤트 페이지 하단 &lt;참여하기&gt; 를 통해 신청서까지 꼭 등록해 주세요!
                    </p>
                  </dd>
                </dl>
              </div>
              <img src="/images/events/2025/event250703/img4.png" alt="일정안내"/>
              <div className="blind">
                <h3>일정안내</h3>
                <dl>
                  <dt>참여 대상</dt>
                  <dd>2025년 7월 3일(목) ~ 7월 31일(목)</dd>
                </dl>
                <dl>
                  <dt>1차 비상 심사 기간</dt>
                  <dd>
                    2025년 8월 1일(금) ~ 8월 8일(금)
                  </dd>
                </dl>
                <dl>
                  <dt>2차 인기 투표 기간</dt>
                  <dd>2025년 8월 14일(목) ~ 8월 21일(목)</dd>
                </dl>
                <dl>
                  <dt>선정작 발표</dt>
                  <dd>2025년 8월 28일(목)</dd>
                </dl>
                <p>※ 심사 및 발표 일정은 변동될 수 있습니다.</p>
              </div>
            </div>

            <div className="evtCont evtCont02">
              <h1><img src="/images/events/2025/event250703/img5.png" alt=""/></h1>
              <div className="blind">
                <h3>시상 내역</h3>
                <ul>
                  <li>
                    대상 상금 200만원 (1명)
                  </li>
                  <li>
                    최우수상 상금 100만원 (2명)
                  </li>
                  <li>
                    우수상 상금 50만원 (3명)
                  </li>
                  <li>
                    특별상 신세계 백화점 상품권 5만원 (10명)
                  </li>
                  <li>
                    참여상 스타벅스 아메리카노 T 1잔 (100% 증정)<br/>
                    작품을 여러 개 출품하셔도 참여상은 한 번만 지급됩니다.
                  </li>
                </ul>
              </div>
            </div>
            <div className="evtCont evtCont03">
              <h1><img src="/images/events/2025/event250703/img6.png" alt=""/></h1>
              <div className="blind">
                <p>본 이벤트는 PC 이벤트 페이지에서만 참여 가능합니다.<br/>
                  이벤트 참여와 관련된 자세한 내용은
                  PC 이벤트 페이지에서 확인해 주세요!</p>
              </div>
            </div>
          </div>
        </section>
    )
  }
}

//=============================================================================
// 댓글 목록 component
//=============================================================================

class EventListApply extends Component {

  constructor(props) {
    super(props);
    this.state = {
      member_id: this.props.member_id, // 멤버 아이디
      event_id: this.props.event_id, // eventId
      event_answer_desc: this.props.event_answer_desc, // 응답문항
      event_answer_desc2: "",
      reg_dttm: this.props.reg_dttm, // 등록일
      BaseActions: this.props.BaseActions, // BaseAction
      eventType: "", // 이벤트 타입
      eventName: "", // 이벤트 응모자
      eventRegDate: "", // 이벤트 등록일
      eventContents: "", // 이벤트 내용
      eventLength: "", // 이벤트 길이
    }
  }

  componentDidMount = () => {
    this.eventListApply();
  };

  eventListApply = () => { // 이벤트 표시 값 세팅
    let eventSetName = maskingStr(this.state.member_id);
    let answers = this.state.event_answer_desc.split('^||^');

    this.setState({
      eventName: eventSetName,
      event_answer_desc: answers[0].replaceAll("\n", "<br/>"),
    });
  };

  render() {
    const {eventName, event_answer_desc} = this.state;

    return (
        /* 후기 리스트 */
        <div className="listItem comment">
          <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
          <strong>{eventName} 선생님</strong>
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
      SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
      MyclassActions: bindActionCreators(myclassActions, dispatch),
      BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));


//=============================================================================
// 댓글 페이징 component
//=============================================================================

class EventApplyAnswerPagination extends Component {

  render() {
    const {eventAnswerCount, pageSize, pageNo, handleClickPage} = this.props;

    const totalPage = Math.ceil(eventAnswerCount / pageSize);
    const curPage = pageNo;
    const pagesInScreen = 2;
    let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
    let endPageInScreen = startPageInScreen + pagesInScreen - 1;

    if (totalPage < endPageInScreen) endPageInScreen = totalPage;

    const pageButtonList = () => {
      const result = [];
      for (let i = startPageInScreen; i <= endPageInScreen; i++) {
        if (i === curPage) {
          result.push(<button type="button" className={i === curPage ? 'on' : ''}>{i}</button>);
        } else {
          result.push(<button type="button" onClick={() => handleClickPage(i)}>{i}</button>);
        }
      }
      return result;
    }

    return (
        <div id="eventPagingNav" className="pagingWrap">
          <div className="innerPaging">
            {curPage > 1 &&
            <div className="pagingPrev">
              <button
                  type="button"
                  className="btnPageFirst"
                  onClick={() => {
                    handleClickPage(1)
                  }}
              >
                <span className="blind">처음</span>
              </button>
              <button
                  type="button"
                  className="btnPagePrev"
                  onClick={() => {
                    handleClickPage(curPage - 1)
                  }}
              >
                <span className="blind">이전</span>
              </button>
            </div>
            }
            <div className="pageNum">
              {pageButtonList()}
            </div>
            {curPage < totalPage &&
            <div className="pagingNext">
              <button
                  type="button"
                  className="btnPageNext"
                  onClick={() => {
                    handleClickPage(curPage + 1)
                  }}
              >
                <span className="blind">다음</span>
              </button>
              <button
                  type="button"
                  className="btnPageLast"
                  onClick={() => {
                    handleClickPage(totalPage)
                  }}
              >
                <span className="blind">마지막</span>
              </button>
            </div>
            }
          </div>
        </div>
    );
  }
}