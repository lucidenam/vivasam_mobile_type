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
import {maskingStr} from "../../../../lib/StringUtils";
import {Cookies} from "react-cookie";

const PAGE_SIZE = 6;

class Event extends Component {
  state = {
    eventId: 570,
    isEventApply: false, // 신청여부
    schoolLvlCd: '',
    pageNo: 1, 				    // 페이지
    pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
    eventAnswerContents: [],	// 이벤트 참여내용
    eventAnswerCount: 0,		// 이벤트 참여자 수
    eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
    eventAnswerLeaveCnt: 0, // 남은 댓글 수
  }

  componentDidMount = async () => {
    const {BaseActions, event, SaemteoActions} = this.props;
    BaseActions.openLoading();

    try {
      await this.eventApplyCheck();
    } catch (e) {
      common.info(e.message);
    } finally {
      setTimeout(() => {
        BaseActions.closeLoading();
      }, 1000);//의도적 지연.
    }

    await this.setEventInfo();
  };

  setEventInfo = async () => {
    const {event, SaemteoActions} = this.props;

    event.teacherAnnual = '';
    event.teacherHope = '';
    SaemteoActions.pushValues({type: "event", object: event});
  }

  handleChange = (e) => {
    const {event, SaemteoActions} = this.props;

    if (!this.prerequisite(e)) {
      e.target.value = null;
      return;
    }

    if (e.target.name === 'agree') {
      event[e.target.name] = e.target.checked;
    } else {
      event[e.target.name] = e.target.value;
    }

    if(e.target.name === 'teacherAnnual') {
      if(parseInt(e.target.value) < 1) {
        event[e.target.name] = "";
      }
      if(e.target.value.length > 2) {
        event[e.target.name] = e.target.value.substr(0, 2);
      }
    }

    SaemteoActions.pushValues({type: "event", object: event});
  };

  // 기 신청 여부 체크
  eventApplyCheck = async () => {
    const {logged} = this.props;
    const {isEventApply} = this.state;

    if (logged) {
      const response = await api.chkEventJoin({eventId: 570});

      if (response.data.eventJoinYn === 'Y') {
        this.setState({
          isEventApply: true
        });
      }
    }
  }

  // 전제 조건
  prerequisite = async (e) => {
    const {logged, history, BaseActions, loginInfo} = this.props;
    const {isEventApply, isCampaignApply} = this.state;

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

    // 참여 학교급
    if (loginInfo.schoolLvlCd === 'ES') {
      common.error("중고등 선생님 대상 이벤트입니다.");
      return false;
    }

    // 기 신청 여부
    if (isEventApply) {
      common.error("이미 신청하셨습니다.");
      return false;
    }

    return true;
  }


  // 참여하기 버튼 클릭, eventApply로 이동
  eventApply = async () => {
    const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick, event} = this.props;
    const { isEventApply} = this.state;

    if (!await this.prerequisite()) {
      return;
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
      setTimeout(()=>{
      }, 1000);//의도적 지연.
    }
  };

  render() {
    const {eventAnswerContents,eventViewAddButton, eventStep1, eventStep2, eventStep3, eventStep4, eventStep5,eventStep6,eventStep7,eventStep8,eventStep9,eventStep10,eventStep11, eventAnswerLeaveCnt} = this.state;
    const cookies = new Cookies();
    const {loginInfo, logged} = this.props;
    const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
        <EventListApply {...eventList} key={eventList.event_answer_id}/>
    );
    return (
        <section className="event250625">
          <div className="evtCont01">
            <h3><img src="/images/events/2025/event250625_2/evt1.png"/></h3>
          </div>

          <div className="evtCont02">
            <h3><img src="/images/events/2025/event250625_2/evt2.png"/></h3>
            <div className="btnWarp">
              <button className="btnApply" onClick={this.eventApply}>
                <span className="blind">신청하기</span>
              </button>
            </div>
          </div>

          <div className="evtNotice">
            <h3><img src="/images/events/2025/event250625_2/evt3.png"/></h3>
          </div>

        </section>
    )
  }
}

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
      eventName: eventSetName
    });
  };

  render() {
    const {eventName, event_answer_desc} = this.state;

    return (
        null
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
      BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));