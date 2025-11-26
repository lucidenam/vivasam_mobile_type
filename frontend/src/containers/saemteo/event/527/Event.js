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

const PAGE_SIZE = 3;

class Event extends Component {
  state = {
    isEventApply : false,       // 신청여부
    bookTitle: '',
    bookReason: '',
    pageNo: 1, 				    // 페이지
    pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
    eventAnswerContents: [],	// 이벤트 참여내용
    eventAnswerCount: 0,		// 이벤트 참여자 수
    eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
    evtComment: '',
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
  };

  // 기 신청 여부 체크
  eventApplyCheck = async () => {
    const {logged, eventId} = this.props;

    if (logged) {
      const response = await api.chkEventJoin({eventId});

      if (response.data.eventJoinYn === 'Y') {
        this.setState({
          isEventApply: true
        });
      }

      if (response.data.campaignJoinYn === 'Y') {
        this.setState({
          isCampaignApply: true
        });
      }
    }
  }

  // 전제 조건
  prerequisite = (e) => {
    const {logged, history, BaseActions, loginInfo} = this.props;
    const {isCampaignApply, isEventApply} = this.state;

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

    // 기 신청 여부
    if (isEventApply) {
      common.error("이미 신청하셨습니다.");
      return false;
    }

    // 기 신청 여부
    if (isCampaignApply) {
      common.error("이미 참여하셨습니다.");
      return false;
    }

    return true;
  }

  // 참여하기 버튼 클릭, eventApply로 이동
  eventApply = async (e) => {
    const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;
    const {evtComment} = this.state;

    if (!this.prerequisite(e)) {
      return;
    }
    if(evtComment.length === 0) {
      common.info("노트 활용 계획을 입력해 주세요.");
      return;
    }

    try {
      const eventAnswer = {
        eventId: eventId,
        memberId: loginInfo.memberId,
        eventAnswerContent: evtComment,
      };

      SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

      event['agree1'] = false;
      SaemteoActions.pushValues({type: "event", object: event});


      handleClick(eventId);    // 신청정보 팝업으로 이동
    } catch (e) {
      console.log(e);
    } finally {
      setTimeout(() => {
      }, 1000);//의도적 지연.
    }
  }

  // 이벤트2 입력창 focus시
  onFocusComment = (e) => {
    if (!this.prerequisite(e)) {
      document.activeElement.blur();
    }
  }

  setEvtComment = (e) => {
    if (!this.prerequisite(e)) {
      document.activeElement.blur();
      return;
    }

    let evtComment = e.target.value;

    if (evtComment.length >= 300) {
      evtComment = evtComment.substring(0, 300);
    }

    this.setState({
      evtComment: evtComment
    });
  };

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
      eventId: eventId,
      eventAnswerSeq: 2,
      answerIndex: 1
    };
    let response2 = await api.getSpecificEventAnswerCount(params);
    this.setState({
      eventAnswerCount: response2.data.eventAnswerCount
    });

    // 최초 조회시 전체건수가 5건이상이면 더보기 버튼 표시
    if(this.state.eventAnswerCount > PAGE_SIZE){
      this.setState({
        eventViewAddButton : 1
      });
    }
  };


  // 댓글 출력
  commentConstructorList = async () => {
    const {eventId} = this.props;
    const {pageNo, pageSize} = this.state;

    const params = {
      eventId: eventId,
      eventAnswerSeq: 2,
      answerPage: {
        pageNo: pageNo,
        pageSize: pageSize
      }
    };

    const responseList =  await api.getSpecificEventAnswerList(params);
    let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

    // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
    if(this.state.eventAnswerCount <= this.state.pageSize) {
      this.setState({
        eventViewAddButton: 0
      });
    }

    // 조회가 완료되면 다음 조회할 건수 설정
    this.setState({
      eventAnswerContents : eventJoinAnswerList,
      pageSize : this.state.pageSize + 5,
    });
  };

  // 댓글 더보기
  commentListAddAction = () => {
    this.commentConstructorList(); // 댓글 목록 갱신
  };

  render() {
    const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, bookTitle, bookReason, eventViewAddButton, evtComment} = this.state;

    const totalPage = Math.ceil(eventAnswerCount / pageSize);
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
          this.handleClickPage(i).then()
        }}>
          <button>{i}</button>
        </li>);
      }
      return result;
    }

    //css용 인덱스
    let loopIndex = 0;
    // 댓글
    const eventList = eventAnswerContents.map((eventList, index) => {

      if(loopIndex >= 6) {
        loopIndex = 1;
      } else {
        loopIndex++;
      }

      const result = <EventListApply {...eventList} key={eventList.event_answer_id} indexNum={loopIndex}/>;
      return result;
    });

    return (
      <section className="event240923">
        <div className="evtCont01">
          <h1><img src="/images/events/2024/event240923/img1.png" alt="위인의 생각을 쓰다"/></h1>
        </div>

        <div className="evtCont02">
          <h1><img src="/images/events/2024/event240923/img2.png" alt="미리보기"/></h1>
          <div className="evtForm">
            <div className="formBox">
              <textarea
                placeholder="<위인의 생각을 쓰다> 노트 활용 계획을 작성해 주세요.(300자 이내)"
                onChange={this.setEvtComment}
                value={evtComment}
                maxLength={300}
              ></textarea>
              <p className="count">(<span className="currentCount">{evtComment.length}</span>/300)</p>
            </div>
            <button className="btnApply" onClick={this.eventApply}>
              <img src="/images/events/2024/event240923/btn_apply.png" alt="신청하기"/>
            </button>
          </div>
        </div>
        {eventAnswerCount > 0 &&
          <div className="commentWrap cont_Wrap">
            <div className="commentList">
              {eventList}
            </div>
            <button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
              <img src="/images/events/2024/event240923/btn_more.png" alt="더보기"/>
            </button>
          </div>
        }
        <div className="evtNotice">
          <strong>【 유의사항 】</strong>
          <ul>
            <li>1인 1회 신청 가능합니다.</li>
            <li>본 이벤트는 비바샘 교사 인증을 완료한 초/중/고 학교 선생님 대상 이벤트입니다.</li>
            <li>정확한 주소를 기입해 주세요. (학교 주소, 수령처 포함: ex. 교무실, 행정실, 학년 반, <br/>경비실 등) 정보 오기재 시 재발송이 불가능합니다.</li>
            <li>참여 완료 후에는 정보 수정이 불가능합니다.</li>
            <li>필사 노트는 선생님 재직 학교의 인근 비상교육 지사를 통해 전달할 예정입니다.</li>
            <li><span>지사별 배송 일정에 따라 수령 시점이 다를 수 있습니다.</span></li>
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
      eventRegDate: "", // 이벤트 등록일
      eventContents: "", // 이벤트 내용
      eventLength: "", // 이벤트 길이
      indexNum: this.props.indexNum,
    }
  }

  componentDidMount = () => {
    this.eventListApply();
  };

  eventListApply = () => { // 이벤트 표시 값 세팅

    let eventSetName = JSON.stringify(this.state.member_id)
    eventSetName = eventSetName.substring(1, (eventSetName.length-4)) + "***"; // 이벤트 참여자 아이디
    let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
    let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

    this.setState({
      eventName: eventSetName,
      event_answer_desc : answers[0],
    });
  };

  render() {
    return (
      <div className={"listItem" + " comment"  + " comment0" + this.state.indexNum}>
        <span className="user_name">{this.state.eventName + " 선생님"}</span>
        <p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc}}></p>
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