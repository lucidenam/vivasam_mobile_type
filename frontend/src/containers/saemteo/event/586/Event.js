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
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";

const PAGE_SIZE = 6;

class Event extends Component {
  state = {
    tabOn: 1,
    commentTabOn: 586,    // 댓글 타입
    eventId: 586,
    event1Id: 587,
    event2Id: 588,
    isEventApply: false,  // 신청여부
    pageNo: 1, 				    // 페이지
    pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
    eventAnswerContents: [],	// 이벤트 참여내용
    eventAnswerCount: 0,		// 이벤트 참여자 수
    eventViewAddButton: 0,  // 더보기 ( 1 : 보임 / 0 : 안보임 )
    eventAnswerLeaveCnt: 0, // 남은 댓글 수
  }

  componentDidMount = async () => {
    const {BaseActions} = this.props;
    BaseActions.openLoading();
    try {
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
  };

  // 기 신청 여부 체크
  eventApplyCheck = async (eventId) => {
    const {logged} = this.props;

    if (logged) {
      const response = await api.chkEventJoin({eventId: eventId});

      if (response.data.eventJoinYn === 'Y') {
        this.setState({
          isEventApply: true
        });
      }
    }
  }

  // 전제 조건
  prerequisite = (e) => {
    const {logged, history, BaseActions, loginInfo} = this.props;
    const {isEventApply} = this.state;

    // 로그인 여부
    if (!logged) {
      common.info("로그인 후 참여해 주세요.");
      BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
      history.push("/login");
      return false;
    }

    // 교사 인증 여부
    if (loginInfo.certifyCheck === 'N') {
      api.appConfirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?').then(confirm => {
        if (confirm === true) {
          BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
          window.location.hash = "/login/require";
          window.viewerClose();
        }
      });
      return false;
    }

    // 준회원 여부
    if (loginInfo.mLevel !== 'AU300') {
      common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
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
    const {loginInfo, SaemteoActions, handleClick} = this.props;
    const {eventId} = this.state;
    const selectEventId = e.target.dataset.eventId;

    await this.eventApplyCheck(selectEventId).then(() => {
      if (!this.prerequisite(e)) {
        return false;
      }

      try {
        const eventAnswer = {
          eventId: selectEventId,
          memberId: loginInfo.memberId,
        }
        SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
        handleClick(eventId);
      } catch (e) {
        console.log(e);
      } finally {
        setTimeout(() => {
        }, 1000);//의도적 지연.
      }
    });
  };

  // 이벤트 참여자수 확인
  checkEventCount = async (eventId = 586) => {
    const params = {
      eventAnswerSeq: 2,
      answerIndex: 1
    };
    if (eventId == 586) {
      params.eventIds = [587, 588];
    } else {
      params.eventId = eventId;
    }

    let response2 = await api.getSpecificEventAnswerCount(params);
    this.setState({
      eventAnswerCount: response2.data.eventAnswerCount
    });
  };

  // 댓글 출력
  commentConstructorList = async (eventId = 586) => {
    const {pageNo, pageSize, eventAnswerCount} = this.state;

    const params = {
      eventAnswerSeq: 2,
      answerPage: {
        pageNo: pageNo,
        pageSize: pageSize
      }
    };
    if (eventId == 586) {
      params.eventIds = [587, 588];
    } else {
      params.eventId = eventId;
    }

    const responseList = await api.getSpecificEventAnswerList(params);
    let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

    this.setState({
      eventViewAddButton: eventAnswerCount > pageSize ? 1 : 0,  // 더보기 버튼 여부
      eventAnswerContents: eventJoinAnswerList,
      pageSize: pageSize + PAGE_SIZE,
      eventAnswerLeaveCnt: eventAnswerCount - eventJoinAnswerList.length,
    });
  };

  // 댓글 더보기
  commentListAddAction = () => {
    const {commentTabOn} = this.state;
    this.commentConstructorList(commentTabOn).then(); // 댓글 목록 갱신
  };

  // 클릭 이벤트
  handleClick = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (name === 'commentTabOn') {
      this.checkEventCount(value);   		// 이벤트 참여자 수 조회
      this.commentConstructorList(value);	// 이벤트 댓글 목록 조회
    }

    this.setState({
      [name]: value,
    });
  };

  render() {
    const {eventAnswerContents, eventViewAddButton, tabOn, commentTabOn} = this.state;

    const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
      <EventListApply {...eventList} key={index}/>
    );

    return (
      <section className="event250827">
        <div className="evtTitWrap">
          <h1><img src="/images/events/2025/event250827/img1.png" alt="25년 2학기 비바클래스 이벤트"/></h1>
          <div className="blind">
            비바클래스와 함께 걷는
            교실 속 변화의 길
            매번 똑같은 수업, 변화를 고민하고 계신가요?
            새롭게 열리는 교실 속 변화의 길,
            그 첫 걸음을 비바클래스와 함께 걸어요!
            이벤트 기간 : 2025.08.27(수) ~ 2025.09.24(수)
            당첨자 발표 : 2025.10.1(수)
            * 당첨자 발표는 비바샘 공지사항에서 확인하실 수 있습니다.
            경품
            참여교사 전원 한 걸음, 나만의 수업 만들기 도전! 메가커피 아메리카노 T
            추첨 30 학급 두 걸음, 우리반 사회정서 체크! 학급 간식박스
          </div>
        </div>

        <div className="evtContWrap">
          <div className="evtCont evtCont01">
            <h1><img src="/images/events/2025/event250827/img2.png" alt="한 걸음, 나만의 수업 만들기 도전!"/></h1>
            <div className="evtContBox">
              <div className="evtTabWrap">
                <div className="evtTabMenu">
                  <button type="button" className={"es " + (tabOn == 1 ? 'on' : '')} name={'tabOn'} onClick={this.handleClick} value={1}><span className="blind">초등</span></button>
                  <button type="button" className={"mh " + (tabOn == 2 ? 'on' : '')} name={'tabOn'} onClick={this.handleClick} value={2}><span className="blind">중고등</span></button>
                </div>
                <div className={"evtTabCont " + (tabOn == 1 ? 'on' : '')}>
                  <div className="bnrs">
                    <button type="button" onClick={onClickCallLinkingOpenUrl.bind(this,'https://vivaclass.notion.site/1f44442e673b81ac8455ed6c877662f2')}><img src="/images/events/2025/event250827/evtCont2_tab1_img1.svg" alt=""/></button>
                    <button type="button" onClick={onClickCallLinkingOpenUrl.bind(this,'https://vivaclass.notion.site/2034442e673b810095b2f752e2d343b6')}><img src="/images/events/2025/event250827/evtCont2_tab1_img2.svg" alt=""/></button>
                    <button type="button" onClick={onClickCallLinkingOpenUrl.bind(this,'https://vivaclass.notion.site/2034442e673b8106a631c0631594c484')}><img src="/images/events/2025/event250827/evtCont2_tab1_img3.svg" alt=""/></button>
                  </div>
                </div>
                <div className={"evtTabCont " + (tabOn == 2 ? 'on' : '')}>
                  <div className="bnrs">
                    <button type="button" onClick={onClickCallLinkingOpenUrl.bind(this,'https://vivaclass.notion.site/20f4442e673b8153ad3afa3e831443d2')}><img src="/images/events/2025/event250827/evtCont2_tab2_img1.svg" alt=""/></button>
                    <button type="button" onClick={onClickCallLinkingOpenUrl.bind(this,'https://vivaclass.notion.site/20f4442e673b8148bf31d2fcc14b2cda')}><img src="/images/events/2025/event250827/evtCont2_tab2_img2.svg" alt=""/></button>
                    <button type="button" onClick={onClickCallLinkingOpenUrl.bind(this,'https://vivaclass.notion.site/20f4442e673b817d9f87cefbd888d6e1')}><img src="/images/events/2025/event250827/evtCont2_tab2_img3.svg" alt=""/></button>
                  </div>
                </div>
              </div>
              <div className="btn_link_wrap">
                <button className="btn_link" onClick={() => alert("PC에서 진행해 주세요.")}><span className="blind">나만의 수업 만들기</span></button>
              </div>
              <div className="btn_wrap">
                <button className="btnApply" onClick={(e) => this.eventApply(e)} data-event-id="587"><span className="blind">참여하기</span></button>
              </div>
            </div>
          </div>

          <div className="evtCont evtCont02">
            <div className="inner">
              <h1><img src="/images/events/2025/event250827/img3.png" alt=""/></h1>
              <div className="btn_link_wrap">
                <button className="btn_link" onClick={() => alert("PC에서 진행해 주세요.")}><span className="blind">나만의 수업 만들기</span></button>
              </div>
              <div className="btn_wrap">
                <button className="btnApply" onClick={(e) => this.eventApply(e)} data-event-id="588"><span className="blind">참여하기</span></button>
              </div>
            </div>
          </div>

          <div className="evtCont evtCont03">
            <h3 className="evtTit"></h3>
            <div className="commentFilterWrap">
              {/* 활성화 클래스 on */}
              <button type="button" className={`all ${(commentTabOn == 586 ? 'on' : '')}`} name={'commentTabOn'} value={586} onClick={this.handleClick}><span>전체</span></button>
              <button type="button" className={`ty1 ${(commentTabOn == 587 ? 'on' : '')}`} name={'commentTabOn'} value={587} onClick={this.handleClick}><i></i><span>수업 만들기</span></button>
              <button type="button" className={`ty2 ${(commentTabOn == 588 ? 'on' : '')}`} name={'commentTabOn'} value={588} onClick={this.handleClick}><i></i><span>학습심리정서검사</span></button>
            </div>
            <div className="commentWrap">
              <div className="commentList">
                {eventApplyAnswerList.length > 0 ?
                  eventApplyAnswerList :
                  <div className="listItem comment">
                    <p>후기를 등록하시면 이 곳에 노출됩니다.</p>
                  </div>
                }
              </div>
              <button type="button" className="btnMore" style={{display: eventViewAddButton === 1 ? 'block' : 'none'}}
                      onClick={this.commentListAddAction}><span className="blind">더 보기</span>
              </button>
            </div>
          </div>
        </div>

        <div className="evtNotice">
          <strong>유의사항</strong>
          <ul className="evtInfoList">
            <li>① 본 이벤트는 비바샘 교사 인증을 완료하신 선생님을 대상으로 진행됩니다.</li>
            <li>② 각 이벤트는 1인 1회 참여만 가능합니다.</li>
            <li>③ 각 이벤트의 ‘꼭 확인해 주세요!’ 안내사항에 따라 경품이 지급되오니 반드시 내용을 확인해 주세요.</li>
            <li>④ 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
            <li>⑤ 경품 발송을 위해 개인정보가 서비스사와 배송업체에 제공됩니다.<br/>(주)모바일이앤엠애드 사업자등록번호 : 215-87-19169, <br/>(주) 카카오 120-81-47521, ㈜ 다우기술 220-81-02810, <br/>아기자기 선물가게 사업자등록번호: 5303100427</li>
            <li>⑥ 이벤트2 경품은 당첨자 발표 후 순차적으로 발송되며, 학급 간식 경품은 학급 인원 수에 맞춰 배송됩니다.</li>
            <li>⑦ 제출하신 응답은 상업적 목적이 아닌, 기업 활동 소개를 위한 자료로 활용될 수 있습니다.</li>
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
      reg_dttm: this.props.reg_dttm, // 등록일
      BaseActions: this.props.BaseActions, // BaseAction
      eventType: "", // 이벤트 타입
      eventName: "", // 이벤트 응모자
    }
  }

  componentDidMount = () => {
    this.eventListApply();
  };

  // props가 변동되어도 리렌더링은 발생하지 않음
  // 따라서 state까지 변경해주어야 함.
  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.member_id !== this.props.member_id
      || prevProps.event_id !== this.props.event_id
      || prevProps.event_answer_desc !== this.props.event_answer_desc) {
      this.setState({
        member_id: this.props.member_id,
        event_id: this.props.event_id,
        event_answer_desc: this.props.event_answer_desc.split('^||^')[0].replaceAll("\n", "<br/>"), // 응답문항
      });
    }
  }

  eventListApply = () => { // 이벤트 표시 값 세팅
    let eventSetName = maskingStr(this.state.member_id);
    let answers = this.state.event_answer_desc.split('^||^');

    this.setState({
      eventName: eventSetName,
      event_answer_desc: answers[0].replaceAll("\n", "<br/>"),
    });
  };

  render() {
    const {eventName, event_id, event_answer_desc} = this.state;

    return (
      /* 수업 만들기 = ty1, 학습심리정서검사 = ty2 클래스 추가 */
      <div className={"listItem comment" + (event_id == 587 ?' ty1' : (event_id == 588 ? ' ty2' : ''))}>
        <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
        <div className="info">
          <i className="ico"></i>
          <strong>{eventName} 선생님</strong>
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
    SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
    MyclassActions: bindActionCreators(myclassActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch),
  })
)(withRouter(Event));