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

const PAGE_SIZE = 6;

class Event extends Component {
  state = {
    eventId: 573,
    event1Id: 574,
    event2Id: 575,
    isEventApply: false,  // 신청여부
    currentEventId: 0,    // 신청 중인 하위 이벤트 ID
    checkedRadio: 0,      // 이벤트1 선택지
    comment: "",          // 이벤트2 참여 내용 입력값
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

    await this.setEventInfo();

  };

  // 기 신청 여부 체크
  eventApplyCheck = async (eventId) => {
    const {logged} = this.props;

    if (logged) {
      const response = await api.chkEventJoin({eventId: eventId});

      this.setState({
        currentEventId: eventId
      });

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

  // 이벤트 1 선택지 체크
  handleCheckedRadio = (no) => {
    this.setState({
      checkedRadio: no
    });
  }

  // 이벤트 2 내용 입력
  handleComment = (e) => {
    if (e.target.value.length > e.target.maxLength) {
      e.target.value = e.target.value.slice(0, e.target.maxLength);
    }

    const comment = e.target.value;

    this.setState({
      comment: comment
    });
  }

  // 전제 조건
  prerequisite = (e) => {
    const {logged, history, BaseActions, loginInfo} = this.props;
    const {isEventApply, currentEventId, checkedRadio, comment} = this.state;

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

    if (currentEventId === "574") {
      if (checkedRadio === 0) {
        common.info("정답을 선택해 주세요!");
        return false;
      }

      if (checkedRadio !== 5) {
        common.info("정답을 다시 한 번 확인해 주세요!");
        return false;
      }
    }

    if (currentEventId === "575") {
      if (comment.length < 20) {
        common.info("내용을 20자 이상 작성해 주세요.");
        return false;
      }
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
    const {eventId,  comment} = this.state;
    const selectEventId = e.target.dataset.eventId;

    await this.eventApplyCheck(selectEventId).then(() => {
      if (!this.prerequisite(e)) {
        return false;
      }

      try {
        const eventAnswer = {
          eventId: selectEventId,
          memberId: loginInfo.memberId,
          eventAnswerContent: comment,
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
  checkEventCount = async () => {
    const {event2Id} = this.state;

    const params = {
      eventId: event2Id,
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
    const {pageNo, pageSize, event2Id, eventAnswerCount} = this.state;

    const params = {
      eventId: event2Id,
      eventAnswerSeq: 2,
      answerPage: {
        pageNo: pageNo,
        pageSize: pageSize
      }
    };

    const responseList = await api.getSpecificEventAnswerList(params);
    let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

    // 최초 조회시 전체건수가 6건이상이면 더보기 버튼 표시
    if (eventAnswerCount > PAGE_SIZE) {
      this.setState({
        eventViewAddButton: 1
      });
    }

    // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
    if (eventAnswerCount <= this.state.pageSize) {
      this.setState({
        eventViewAddButton: 0
      });
    }

    // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
    if (this.state.eventAnswerCount <= this.state.pageSize) {
      this.setState({
        eventViewAddButton: 0
      });
    }

    this.setState({
      eventAnswerContents: eventJoinAnswerList,
      pageSize: this.state.pageSize + PAGE_SIZE,
      eventAnswerLeaveCnt: eventAnswerCount - eventJoinAnswerList.length,
    });
  };

  // 댓글 더보기
  commentListAddAction = () => {
    this.commentConstructorList().then(); // 댓글 목록 갱신
  };

  render() {
    const {eventAnswerContents, eventViewAddButton, eventAnswerLeaveCnt} = this.state;

    const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
        <EventListApply {...eventList} key={eventList.event_answer_id}/>
    );

    return (
        <section className="event250704">
          <div className="evtTitWrap">
            <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
            <h1><img src="/images/events/2025/event250704/img1.png" alt=""/></h1>
            <div className="blind">
              <strong>교과서 캠페인 6탄</strong>
              <h1>일상 한 컷, 교과서 속 순간</h1>
              <p>
                일상에서 발견하는 교과서 속 이야기!
                비상교육이 만든 영상을 감상하고
                선생님의 이야기를 들려주세요.
                추첨을 통해 기분 좋은 하루를 만드는 선물을 드립니다.
              </p>
              <ul>
                <li>이벤트 기간 : 7월 4일(금)~7월 25일(금)</li>
                <li>당첨자 발표 : 7월 30일 (수)</li>
              </ul>
            </div>
          </div>

          <div className="evtContWrap">
            <div className="evtCont evtCont01">
              <div className="inner">
                <div className="videoWrap">
                  <iframe src="https://www.youtube.com/embed/NJjbfyIUIVM?si=lHPYYG1MsqUvRU_E"
                          title="YouTube video player" frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
                <div className="evtTit1">
                  <img src="/images/events/2025/event250704/evtTit1.png" alt=""/>
                  <div className="blind">
                    <span>EVENT 1</span>
                    <h3>배움으로 더 보이고, 더 넓어지는 나의 세상!</h3>
                    <p>위 영상에 등장하지 않는 장면을 골라주세요.</p>
                  </div>
                </div>
                <fieldset>
                  <ul className="answerWrap">
                    <li>
                      <input type="radio" id="rdo1" name="answer" onClick={() => {this.handleCheckedRadio(1)}}/>
                      <label htmlFor="rdo1"><img src="/images/events/2025/event250704/txt_rdo1.png" alt="피아노 건반을 닮은 횡단보도를 건너며 '음악'을 만나는 장면"/></label>
                    </li>
                    <li>
                      <input type="radio" id="rdo2" name="answer" onClick={() => {this.handleCheckedRadio(2)}}/>
                      <label htmlFor="rdo2"><img src="/images/events/2025/event250704/txt_rdo2.png" alt="친구와 블록을 맞추며 함께를 배우는 '사회'를 만나는 장면"/></label>
                    </li>
                    <li>
                      <input type="radio" id="rdo3" name="answer" onClick={() => {this.handleCheckedRadio(3)}}/>
                      <label htmlFor="rdo3"><img src="/images/events/2025/event250704/txt_rdo3.png" alt="놀이터에서 연산기호를 닮은 비눗방울을 보며 '수학'을 만나는 장면"/></label>
                    </li>
                    <li>
                      <input type="radio" id="rdo4" name="answer" onClick={() => {this.handleCheckedRadio(4)}}/>
                      <label htmlFor="rdo4"><img src="/images/events/2025/event250704/txt_rdo4.png" alt="비행기를 따라 우주 속을 나아가는 '과학'을 만나는 장면"/></label>
                    </li>
                    <li>
                      <input type="radio" id="rdo5" name="answer" onClick={() => {this.handleCheckedRadio(5)}}/>
                      <label htmlFor="rdo5"><img src="/images/events/2025/event250704/txt_rdo5.png" alt="무지개를 물감 삼아 그림을 그리는 상상으로 '미술'을 만나는 장면"/></label>
                    </li>
                  </ul>
                </fieldset>
                <div className="btn_wrap">
                  <button className="btnApply" onClick={(e) => this.eventApply(e)}>
                    <img src="/images/events/2025/event250704/btn_apply1.png" alt="참여하기" data-event-id="574"/>
                  </button>
                </div>
              </div>
            </div>

            <div className="evtCont evtCont02">
              <div className="inner">
                <div className="evtTit2">
                  <img src="/images/events/2025/event250704/evtTit2.png" alt=""/>
                  <div className="blind">
                    <span>EVENT 2</span>
                    <h3>일상에서 교과서 속 이야기가 떠오른 순간이 있나요?</h3>
                    <p>선생님의 이야기를 공유해주세요!</p>
                  </div>
                </div>
                <form action="">
                  <textarea name="" id="comment" cols="30" rows="10" maxLength="200" placeholder="내용을 작성해 주세요." onInput={this.handleComment}></textarea>
                </form>
                <div className="btn_wrap">
                  <button className="btnApply" onClick={(e) => this.eventApply(e)}>
                    <img src="/images/events/2025/event250704/btn_apply2.png" alt="참여하기" data-event-id="575"/>
                  </button>
                </div>
              </div>
            </div>
            <div className="evtCont evtCont03">
              <h3 className="evtTit3"><img src="/images/events/2025/event250704/evtTit3.png" alt="일상 속 교과서를 만나는 순간"/>
              </h3>
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
                        onClick={this.commentListAddAction}>더보기 (<span>{eventAnswerLeaveCnt}</span>) <i></i>
                </button>
              </div>
            </div>
          </div>

          <div className="evtNotice">
            <strong>확인사항</strong>
            <ul className="evtInfoList">
              <li>비바샘 교사 인증을 완료하신 초·중·고 선생님만 참여하실 수 있습니다.</li>
              <li>이벤트별로 1인 1회 참여하실 수 있습니다.</li>
              <li>이벤트 1과 이벤트 2 중복 참여 및 당첨이 가능합니다.</li>
              <li>개인 정보 오기재, 유효 기간 만료로 인한 경품 재발송은 불가합니다.</li>
              <li>선물 발송을 위해 서비스사에 개인 정보가 제공됩니다.<br/>(㈜카카오 사업자 등록 번호: 120-81-47521, (주)다우기술 사업자등록번호: 220-81-02810)</li>
              <li>경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
              <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
              <li>1개의 이벤트에만 참여하셔도 비바콘 100콘을 지급해 드립니다. 2개 이벤트에 모두 참여하셔도 비바콘은 총 100콘만 지급됩니다.</li>
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