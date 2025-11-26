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
import {Cookies} from "react-cookie";
import moment from "moment";

const PAGE_SIZE = 6;
const cookies = new Cookies();

class Event extends Component {
  state = {
    eventId: 566,
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
    eventStep4:false,
    eventStep5:false,
    eventStep6:false,
    eventStep7:false,
    eventStep8:false,
    eventStep9:false,
    eventStep10:false,
    eventStep11:false
  }

  componentDidMount = async () => {
    const {BaseActions} = this.props;
    BaseActions.openLoading();
    try {
      await this.eventApplyCheck();
      await this.checkEventCount();   		// 이벤트 참여자 수 조회
      await this.commentConstructorList();	// 이벤트 댓글 목록 조회
    } catch (e) {
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
      const response = await api.chkEventJoin({eventId: 566});

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
      eventId: 566,
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
    const {isEventApply, eventStep1, eventStep2, eventStep3, eventStep4, eventStep5, eventStep6, eventStep7, eventStep8, eventStep9, eventStep10, eventStep11} = this.state;
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

    if (schoolLvlCd !== 'MS' && schoolLvlCd !== 'HS') {
        common.info("중고등 선생님만 신청 가능합니다.");
        return false;
    }

    let cnt = 0;
    for (let i = 1; i < 12; i++) {
      if (document.getElementById("step" + i).classList.contains('active')) {
        cnt += 1;
      }
    }

    if (cnt < 1) {
        common.info("에듀테크 테마관을 1개 이상 ​체험 후 참여해 주세요.");
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

    let cnt = 0;
    let arr = [];
    for (let i = 1; i < 12; i++) {
      if (document.getElementById("step" + i).classList.contains('active')) {
        cnt += 1;
        let text = document.getElementById("blind" + i).innerHTML;
        arr.push(text);
      }
    }

    try {
      const eventAnswer = {
        eventId: eventId,
        memberId: loginInfo.memberId,
        eduArr: arr,
        eduCnt: cnt
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
      const {logged, loginInfo, history, BaseActions} = this.props;
      let pageUrl;
      if (!logged) {
          common.info("로그인 후 참여해 주세요.");
          BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
          history.push("/login");
          return false;
      } else {
          if (clickPostion === 'eventClick1') {
              pageUrl = "https://v.vivasam.com/themeplace/engactivity/main.do";
              this.setState({eventStep1:true});
              cookies.set("event566_step1_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick2') {
              pageUrl = "https://v.vivasam.com/themeplace/gallery/main.do";
              this.setState({eventStep2:true});
              cookies.set("event566_step2_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick3') {
              pageUrl = "https://v.vivasam.com/themeplace/geography/main.do";
              this.setState({eventStep3:true});
              cookies.set("event566_step3_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick4') {
              pageUrl = "https://v.vivasam.com/themeplace/socialActivity/main.do";
              this.setState({eventStep4:true});
              cookies.set("event566_step4_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick5') {
            pageUrl = "https://v.vivasam.com/munhak/main.do";
            this.setState({eventStep5:true});
            cookies.set("event566_step5_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick6') {
            pageUrl = "https://v.vivasam.com/themeplace/intellilab/main.do";
            this.setState({eventStep6:true});
            cookies.set("event566_step6_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick7') {
            pageUrl = "https://v.vivasam.com/themeplace/sciencelab/main.do";
            this.setState({eventStep7:true});
            cookies.set("event566_step7_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick8') {
            pageUrl = "https://v.vivasam.com/appleNumbersTextbook/main.do";
            this.setState({eventStep8:true});
            cookies.set("event566_step8_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick9') {
            pageUrl = "https://v.vivasam.com/themeplace/energy/main.do";
            this.setState({eventStep9:true});
            cookies.set("event566_step9_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick10') {
            pageUrl = "https://v.vivasam.com/themeplace/vrtrip/main.do";
            this.setState({eventStep10:true});
            cookies.set("event566_step10_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (clickPostion === 'eventClick11') {
            pageUrl = "https://v.vivasam.com/themeplace/vrkoreanhis/main.do";
            this.setState({eventStep11:true});
            cookies.set("event566_step11_" + loginInfo.memberId, true, {expires: moment().add(365, 'days').toDate()});
          }

          if (isIOS) {
              window.location.href = pageUrl;
          } else {
              window.open(pageUrl,"_blank");
          }
      }
  }

  render() {
    const {eventAnswerContents,eventViewAddButton, eventStep1, eventStep2, eventStep3, eventStep4, eventStep5,eventStep6,eventStep7,eventStep8,eventStep9,eventStep10,eventStep11, eventAnswerLeaveCnt} = this.state;
    const cookies = new Cookies();
    const {loginInfo, logged} = this.props;
    const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
      <EventListApply {...eventList} key={eventList.event_answer_id}/>
    );

    return (
      <section className="event250609">
        <div className="evtTitWrap">
          <h1><img src="/images/events/2025/event250609/img1.png" alt=""/></h1>
          <div className="blind">
              <strong>비바샘 에듀테크의 달</strong>
              <h1>에듀테크 테마관 스탬프 투어</h1>
              <p>참 잘 만들어진 비바샘 에듀테크 테마관을 활용하면?
                수업의 즐거움과 행복이 UP!
                선생님과 학생 모두가 만족하는 에듀테크 콘텐츠를 체험하고,
                스타벅스 아메리카노와 신세계 상품권을 받아가세요!
              </p>
              <ul>
                <li>이벤트 기간 : 6월 9일(월) ~ 6월 30일(월)</li>
                <li>당첨자 발표 : 7월 3일 (목)</li>
              </ul>

              <h2>이벤트 참여 방법</h2>
              <ol>
                <li>STEP 01 스탬프 투어 지도에서 1개 이상의 에듀테크 테마관을 체험하기</li>
                <li>STEP 02 ‘참여하기’에서 체험소감을 적어 주세요.</li>
              </ol>
              <p>TIP 더 많은 서비스를 체험하고, 우리반 학생들과의 활용법을 적을수록 당첨 확률 UP!</p>
          </div>
        </div>

        <div className="evtContWrap">
          <div className="evtCont evtCont01">
            <img src="/images/events/2025/event250609/img2.png" alt="에듀테크 테마관 스탬프 투어 지도 - 하나만 체험해도 이벤트 참여가 가능해요! 원하는 에듀테크 테마관을 클릭하고 체험해 보세요! 귀여운 비버샘이 스탬프를 찍어 드려요!"/>
            <div className="mapWrap">
              <a className="item0">
                <span className="blind">GO! 에듀테크 테마관</span>
              </a>
              <a href="javascript:void(0)"
                id="step1"
                className={`btnLink item1 ${logged && (eventStep1 || cookies.get("event566_step1_" + loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick1")}>
                <span id="blind1" className="blind">영어 어휘 카드</span>
              </a>
              <a href="javascript:void(0)"
                id="step2"
                className={`btnLink item2 ${logged && (eventStep2 || cookies.get("event566_step2_" + loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick2")}>
                <span id="blind2" className="blind">비바샘 미술관</span>
              </a>
              <a href="javascript:void(0)"
                id="step3"
                className={`btnLink item3 ${logged && (eventStep3 || cookies.get("event566_step3_" + loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick3")}>
                <span id="blind3" className="blind">지리 교과 자료실</span>
              </a>
              <a href="javascript:void(0)"
                id="step4"
                className={`btnLink item4 ${logged && (eventStep4 || cookies.get("event566_step4_" + loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick4")}>
                <span id="blind4" className="blind">사회 활동샘</span>
              </a>
              <a href="javascript:void(0)"
                id="step5"
                className={`btnLink item5 ${logged && (eventStep5 || cookies.get("event566_step5_" + loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick5")}>
                <span id="blind5" className="blind">비바샘 문학관</span>
              </a>
              <a href="javascript:void(0)"
                id="step6"
                className={`btnLink item6 ${logged && (eventStep6 || cookies.get("event566_step6_" + loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick6")}>
                <span id="blind6" className="blind">지능형 과학 실험실</span>
              </a>
              <a href="javascript:void(0)"
                id="step7"
                className={`btnLink item7 ${logged && (eventStep7 || cookies.get("event566_step7_" +loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick7")}>
                <span id="blind7" className="blind">과학 가상 실험실</span>
              </a>
              <a href="javascript:void(0)"
                id="step8"
                className={`btnLink item8 ${logged && (eventStep8 || cookies.get("event566_step8_" +loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick8")}>
                <span id="blind8" className="blind">비바샘 넘버스 교과서</span>
              </a>
              <a href="javascript:void(0)"
                id="step9"
                className={`btnLink item9 ${logged && (eventStep9 || cookies.get("event566_step9_" +loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick9")}>
                <span id="blind9" className="blind">신재생에너지 체험관</span>
              </a>
              <a href="javascript:void(0)"
                id="step10"
                className={`btnLink item10 ${logged && (eventStep10 || cookies.get("event566_step10_" +loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick10")}>
                <span id="blind10" className="blind">VR 지질 답사</span>
              </a>
              <a href="javascript:void(0)"
                id="step11"
                className={`btnLink item11 ${logged && (eventStep11 || cookies.get("event566_step11_"+loginInfo.memberId)) ? 'active' : ''}`}
                onClick={(e) => this.checkClickEvent("eventClick11")}>
                <span id="blind11" className="blind">VR 역사 답사</span>
              </a>
            </div>
            <div className="btn_wrap">
              <button className="btnApply" onClick={this.eventApply}>
                <span className="blind">참여하기</span>
              </button>
            </div>
          </div>

          <div className="evtCont evtCont02">
            <h1><img src="/images/events/2025/event250609/img3.png" alt=""/></h1>
            <div className="blind">
                <h3>이벤트 경품</h3>
                <p>비바샘 에듀테크 테마관 스탬프 투어를 완료한 선생님께 드리는 즐거운 여행 선물</p>
                <ul>
                  <li>총 300명 - 참여상 스탁벅스 아메리카노 T1잔</li>
                  <li>총 30명 - 우수 후기 선물​ 신세계 상품권 1만 원권</li>
                </ul>
            </div>
          </div>
          <div className="evtCont evtCont03">
            <div className="commentWrap">
              <div className="commentList">
                {eventApplyAnswerList.length > 0 ?
                    eventApplyAnswerList :
                    <div className="nodata">
                      <p>텅~아직 작성된 내용이 없어요</p>
                    </div>
                }
              </div>
              <button type="button" className="btnMore" style={{display: eventViewAddButton === 1 ? 'block' : 'none'}}
                      onClick={this.commentListAddAction}>
                더 보기(<span>{eventAnswerLeaveCnt}</span>)<i></i>
              </button>
            </div>
          </div>
        </div>

        <div className="evtNotice">
          <strong>유의사항</strong>
          <ul className="evtInfoList">
            <li>본 이벤트는 비바샘 교사인증을 완료한 중고등학교 선생님 대상 이벤트입니다.</li>
            <li>경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
            <li>1인 1회씩 참여할 수 있습니다.</li>
            <li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
            <li>경품 발송을 위해 개인정보(성명,휴대 전화번호)가 서비스사에 제공됩니다.<br /> (㈜카카오 사업자등록번호: 120-81-47521) <br /> / (㈜모바일이앤엠애드 사업자등록번호:215-87-19169)</li>
            <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
            <li>이벤트 운영 상황에 따라 운영 일정 변경이 있을 수 있습니다.</li>
          </ul>
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
      event_answer_desc: answers[2].replaceAll("\n", "<br/>"),
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