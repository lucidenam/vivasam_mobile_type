import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter, Link} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import * as myclassActions from "../../../../store/modules/myclass";
import {FooterCopyright} from "../../../../components/page";

const PAGE_SIZE = 30;

class Event extends Component {
  state = {
    eventId: 557,
    isEventApply1: false,       // 신청여부
    schoolLvlCd: '',
    eventAnswerContents: [],	// 이벤트 참여내용
    eventAnswerCount: 0,		// 이벤트 참여자 수
    eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
    evtPopup: false,
    schName: '',
    memberRegType: null,
    elOffTop:0,
    eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/557',
    eventJoinList: [
      {
        id: "Viva7777",
        name: "비바샘 선생님",
      },
      {
        id: "Viva7777",
        name: "비바샘 선생님"
      },
      {
        id: "Viva7777",
        name: "비바샘 선생님"
      },
      {
        id: "Viva7777",
        name: "비바샘 선생님"
      },
      {
        id: "Viva7777",
        name: "비바샘 선생님"
      }
    ]

  }

  componentDidMount = async () => {
    const {BaseActions, logged} = this.props;
    this.setState({
      elOffTop:document.querySelector('.btn_share').getBoundingClientRect().top
    })
    window.addEventListener('scroll', this.handleScroll);
    BaseActions.openLoading();
    try {
      await this.eventApplyCheck();
      await this.eventVoteRank();             // 랭킹 목록 가지고 오기

      if (logged) {
        await this.getMyClassInfo(); //학교급체크는 로그인했을때만 실행
      }
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

  eventVoteRank = async () => {
    const {logged} = this.props;

    const eventJoinRankList = await api.getEventVoteRank();
    let getRecommendRankList = eventJoinRankList.data.voteRank;

    this.setState({
      eventJoinList: getRecommendRankList,
    });

    let memberRegType = eventJoinRankList.data.memberRegType;

    if (logged) {
      this.setState({
        eventJoinList: getRecommendRankList,
        memberRegType: memberRegType,
      });
    }

  }

  setEventInfo = async () => {
    const {event, SaemteoActions} = this.props;

    event.evtUrl = '';

    SaemteoActions.pushValues({type: "event", object: event});
  }

  handleChange = (e) => {
    const {event, SaemteoActions} = this.props;

    if (!this.prerequisite(e)) {
      return;
    }


    if (e.target.name === 'agree') {
      event[e.target.name] = e.target.checked;
    } else {
      event[e.target.name] = e.target.value;
    }

    SaemteoActions.pushValues({type: "event", object: event});
  };

  // 기 신청 여부 체크
  eventApplyCheck = async () => {
    const {logged} = this.props;
    const {eventId} = this.state;
    if (logged) {
      const response1 = await api.chkEventJoin({eventId: eventId});
      if (response1.data.eventJoinYn === 'Y') {
        this.setState({
          isEventApply1: true
        });
      }
    }
  }

  // 전제 조건
  prerequisite = (e) => {
    const {logged, history, BaseActions, loginInfo, event} = this.props;

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


    return true;
  }

  insertApplyForm = async () => {
    const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;
    if (!event.agree1) {
      common.error("필수 동의 항목 확인 후 이벤트 신청을 완료해 주세요.");
      return false;
    }

    try {
      BaseActions.openLoading();

      var params = {
        eventId: eventId,
        eventAnswerDesc: event.schName + '/' + event.schAddr + ' ' + event.addressDetail + '/' + event.schZipCd + '/' + event.cellphone,
        cellphone: event.cellphone,
        userInfo: "",
        schCode: "",
      };

      let response = await SaemteoActions.insertEventApply(params);

      if (response.data.code === '1') {
        common.error("이미 신청 하셨습니다.");
      } else if (response.data.code === '0') {
        // 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
        history.push("/myInfo");

      } else if (response.data.code === '5') {
        common.error("마일리지의 잔액이 모자랍니다. 다시 확인해주세요.");
      } else if (response.data.code === '6') {
        common.error("마일리지 적립/차감에 실패하였습니다.\n비바샘으로 문의해 주세요. (1544-7714)");
      } else {
        common.error("신청이 정상적으로 처리되지 못하였습니다.");
      }

    } catch (e) {
      console.log(e);
      common.info(e.message);
      history.push('/saemteo/event/view/' + eventId);
    } finally {
      setTimeout(() => {
        BaseActions.closeLoading();
      }, 1000);//의도적 지연.
    }
  }

  // 선생님 학교급 확인
  getMyClassInfo = async () => {
    const {MyclassActions} = this.props;

    try {
      let result = await MyclassActions.myClassInfo();
      this.setState({
        schoolLvlCd: result.data.schoolLvlCd
      })
    } catch (e) {
      console.log(e);
    }
  }

  // 참여하기 버튼 클릭, eventApply로 이동
  eventApply = async () => {
    const {SaemteoActions, eventId, handleClick} = this.props;
    const {isEventApply} = this.state;
    let eventAnswerContent = "";

    // 기 신청 여부
    if (isEventApply) {
      common.error("이미 신청하셨습니다.");
      return false;
    }

    if (!this.prerequisite()) {
      document.activeElement.blur();
      return;
    }

    try {
      const eventAnswer = {
        isEventApply: isEventApply,
        eventId: eventId,
        eventAnswerContent: eventAnswerContent,
      };
      SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
      handleClick(eventId);    // 신청정보 팝업으로 이동
    } catch (e) {
      console.log(e);
    } finally {
      setTimeout(() => {
      }, 1000);//의도적 지연.
    }
  };

  handlePopupChange = async () => {
    const {evtPopup} = this.state;
    if (evtPopup) {
      this.setState({
        evtPopup: false
      })
    } else {
      this.setState({
        evtPopup: true
      })
    }

    this.eventVoteRank();
  };

  copyToClipboard = (e) => {
    // 글을 쓸 수 있는 란을 만든다.
    let aux = document.createElement("input");
    // 지정된 요소의 값을 할당 한다.
    aux.setAttribute("value", this.state.eventUrl);
    // bdy에 추가한다.
    document.body.appendChild(aux);
    // 지정된 내용을 강조한다.
    aux.select();
    // 텍스트를 카피 하는 변수를 생성
    document.execCommand("copy");
    // body 로 부터 다시 반환 한다.
    document.body.removeChild(aux);
    common.info('링크가 복사되었습니다.\n동료 선생님과 함께 이벤트에 참여해 보세요.');
  };

  handleScroll = () => {
    const { elOffTop } = this.state;
    let $sectionEle = document.getElementById('btn_share');
    let curScroll =  window.scrollY;
    let headerHeight = document.querySelector('header').offsetHeight;

    if($sectionEle == null || $sectionEle == undefined) return;
    if (curScroll > elOffTop - headerHeight) {
      $sectionEle.classList.add('fixed');
    } else {
      $sectionEle.classList.remove('fixed');
    }
  }

  render() {
    const {evtPopup, eventJoinList} = this.state;

    return (
      <section className="event250318">
        <div className="evtCont1">
          <img src="/images/events/2025/event250318/img1.png" alt="찾아가는 교사문화 프로그램"/>
          <button type="button" className="btn_share" id="btn_share" onClick={this.copyToClipboard}><span className="blind">공유하기</span></button>
        </div>
        <div className="evtCont2">
          <img src="/images/events/2025/event250318/img2.png" alt="지금 바로 선생님의 지역에 투표해주세요"/>
        </div>
        <div className="evtCont3">
          <h3><img src="/images/events/2025/event250318/evtLabel2.png" alt="실시간 지역 랭킹"/></h3>

          <div className="evt_rank_wrap">
            <ul className="evt_rank_list">
              {
                eventJoinList.slice(0, 3).map((item, idx) => {
                  return (<li className={"rank" + (item.voteRank)} key={idx}>
                    <h6>{item.eventAnswerDesc}</h6>
                    <p>{item.voteCnt} 표</p>
                  </li>)
                })
              }
            </ul>
            <button type="button" onClick={this.handlePopupChange} className="btnViewRanking"><span className="blind">전체 랭킹 보기</span></button>
            <p className="rank_txt">*동점일 경우, 투표가 먼저 등록된 지역이 <br/>우선순위로 집계됩니다.</p>
          </div>

          <div className="btn_wrap">
            <a href="https://www.vivasam.com/samter/teacher/program/list" target="_blank" className="evtBtn1"><span className="blind">교사문화 프로그램 둘러보기</span></a>
            <button type="button" className="evtBtn2 btn_apply" onClick={this.eventApply}><span className="blind">선생님 지역투표 참여하기</span></button>
          </div>
        </div>
        <div className="evtNotice">
          <strong>유의사항</strong>
          <ul className="evtInfoList">
            <li>교사문화 프로그램 지역 대항전 투표는 학교 선생님만 참여 가능합니다.</li>
            <li>투표는 1인 1회 참여하실 수 있습니다.</li>
            <li>참여 완료 후 수정 및 추가 참여가 어렵습니다.</li>
          </ul>
        </div>
        {
          evtPopup && (<div>
              <div className="dimmed"></div>
              <div className="join_ranking_pop">
                <div className="pop_head">
                  <h3 className={'popTit'}>실시간 지역 랭킹 현황</h3>
                  <button className="btnPopClose" onClick={this.handlePopupChange}><span className="blind">닫기</span></button>
                </div>
                <div className="pop_body">
                  <table>
                    <colgroup>
                      <col className="widTy1"/>
                      <col className="widTy3"/>
                      <col className="widTy2"/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>순위</th>
                      <th>지역</th>
                      <th>투표 수</th>
                    </tr>
                    </thead>
                  </table>
                  <div className="scroll-area">
                    <table>
                      <colgroup>
                        <col className="widTy1"/>
                        <col className="widTy3"/>
                        <col className="widTy2"/>
                      </colgroup>
                      <tbody>
                      {
                        eventJoinList.map((item, idx) => {
                          return (
                              <tr key={idx}>
                                <td className="rank">{item.voteRank}</td>
                                <td className="area">{item.eventAnswerDesc}</td>
                                <td className="num">{item.voteCnt}</td>
                              </tr>
                          )
                        })
                      }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        <FooterCopyright handleLogin={this.handleLogin}/>
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
    SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
    MyclassActions: bindActionCreators(myclassActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch),
  })
)(withRouter(Event));