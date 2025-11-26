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
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";

const PAGE_SIZE = 10;

class Event extends Component {
    state = {
        eventId1: 540,
        eventId2: 541,
        isEventApply1: false,       // 신청여부
        isEventApply2: false,       // 신청여부
        schoolLvlCd: '',
        bookTitle: '',
        bookReason: '',
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/535',
        evtComment: '',
        choosedItem: '',
        firstAnswer: '',
        evtItem: ''
    }

    componentDidMount = async () => {
        const {BaseActions, event, SaemteoActions, logged} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();

            if (logged) {
                await this.getMyClassInfo(); //학교급체크는 로그인했을때만 실행
            }
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.z
        }
        await this.setEventInfo();
    };

    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.firstAnswer = '';

        SaemteoActions.pushValues({type: "event", object: event});
    }

    handleChangeItem = (e) => {
        const {evtItem} = this.state;
        const evtItemVal = e.target.value;

        this.setState({
            evtItem: evtItemVal
        });
    }

    handleChangeUrl = (e) => {
        const {event, SaemteoActions} = this.props;

        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return;
        }


        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        event.firstAnswer = e.target.value;

        SaemteoActions.pushValues({type: "event", object: event});
    };

    handleChange = (e) => {
        const {event, SaemteoActions} = this.props;

        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return;
        }

        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        // event.firstAnswer = e.target.value;

        SaemteoActions.pushValues({type: "event", object: event});
    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged} = this.props;
        const {eventId1, eventId2} = this.state;
        if (logged) {
            const response1 = await api.chkEventJoin({eventId: eventId1});
            const response2 = await api.chkEventJoin({eventId: eventId2});

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
        const {logged, history, BaseActions, loginInfo, event} = this.props;
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
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return false;
        }

        return true;
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
    eventApply1 = async () => {
        const {SaemteoActions, eventId, handleClick, event} = this.props;
        const {isEventApply1, firstAnswer} = this.state;

        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        // 기 신청 여부
        if (isEventApply1) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        if (event.firstAnswer.length !== 6) {
            common.info("첫번째 정답 6자를 순서대로 입력해주세요.");
            return false;
        }

        let eventAnswerContent = "";
        eventAnswerContent += "정답 : " + (event.firstAnswer)

        try {
            const eventAnswer = {
                isEventApply: isEventApply1,
                eventId: 540,
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

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply2 = async () => {
        const {SaemteoActions, eventId, handleClick} = this.props;
        const {isEventApply, isEventApply2, evtItem} = this.state;

        let eventAnswerContent = "정답 : " + evtItem;

        // 기 신청 여부
        if (isEventApply2) {
            common.error("이미 신청하셨습니다.");
            return false;
        }
        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        if ((evtItem === null || evtItem === '')) {
            common.error("정답을 선택해주세요.");
            return;
        }

        if (evtItem !== '3번') {
            common.error("BI를 다시 선택해주세요.");
            return;
        }

        try {
            const eventAnswer = {
                isEventApply: isEventApply2,
                eventId: 541,
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
        common.info('이벤트 URL이 복사되었습니다.');
    };

    focusScroll = () => {
        const section = document.querySelector( '#evtCont2' );
        section.scrollIntoView( { behavior: 'smooth', block: 'start' } );
    };

    render() {
        const {eventAnswerContents, firstAnswer} = this.state;
        const {event} = this.props;

        //css용 인덱스
        let loopIndex = 0;

        return (
          <section className="event250210">
              <div className="evtCont1">
                  <h3><img src="/images/events/2025/event250210/img1.png" alt=""/></h3>
              </div>
              <div className="evtCont2" id="evtCont2">
                  <h3><img src="/images/events/2025/event250210/img2.png" alt=""/></h3>
              </div>
              <div className="evtCont3">
                  <h3><img src="/images/events/2025/event250210/evt_tit_01.png" alt=""/></h3>
                  <div className="evtContItem">
                      <a onClick={onClickCallLinkingOpenUrl.bind(this,'https://e.vivasam.com/newSemester/2025/1')} target="_blank" className="btn_evt01"><span className="blind">초등 신학기 안내</span></a>
                      <a onClick={onClickCallLinkingOpenUrl.bind(this,'https://e.vivasam.com/newSemester/2025/2')}  className="btn_evt02"><span className="blind">중고등 신학기 안내</span></a>
                  </div>
              </div>
              <div className="evtCont4">
                  <h3><img src="/images/events/2025/event250210/img3.png" alt=""/></h3>
                  <div className="quiz">
                      <h4>&lt;보기&gt;의 빈칸에 들어갈 말을 찾아,<br/>답란에 순서대로 입력해 주세요.</h4>
                      <div className="imgview"><img src="/images/events/2025/event250210/img4.png" alt=""/></div>
                      <h5>답을 입력해 주세요.</h5>
                      <input type="text" id="firstAnswer" onChange={this.handleChangeUrl} value={event.firstAnswer}
                             placeholder="" maxlength="6"/>
                      <p>'비바샘, 어떻게 달라졌을까요?' 코너에서 힌트를 확인해 보세요!<a onClick={this.focusScroll}>힌트 보기</a></p>
                      <button className="btn_enter" onClick={this.eventApply1}><span className="blind">참여하기</span></button>
                  </div>
              </div>
              <div className="evtCont5">
                  <h3><img src="/images/events/2025/event250210/img5.png" alt=""/></h3>
                  <div className="quiz">
                      <h4>비바샘의 새로운 BI를 선택해 주세요.</h4>
                      <div className="evtRdoItems">
                          <div className="evtRdoItem evtItem1">
                              <input type="radio" name="evtItem" id="evtItem1" value="1번"
                                     onChange={this.handleChangeItem}/>
                              <label htmlFor="evtItem1"><span className="img"><img
                                  src="/images/events/2025/event250210/bi1.png" alt=""/></span></label>
                          </div>
                          <div className="evtRdoItem evtItem2">
                              <input type="radio" name="evtItem" id="evtItem2" value="2번"
                                     onChange={this.handleChangeItem}/>
                              <label htmlFor="evtItem2"><span className="img"><img
                                  src="/images/events/2025/event250210/bi2.png" alt=""/></span></label>
                          </div>
                          <div className="evtRdoItem evtItem3">
                          <input type="radio" name="evtItem" id="evtItem3" value="3번"
                                     onChange={this.handleChangeItem}/>
                              <label htmlFor="evtItem3"><span className="img"><img
                                  src="/images/events/2025/event250210/bi3.png" alt=""/></span></label>
                          </div>
                      </div>

                      <button className="btn_enter" onClick={this.eventApply2}>
                          <span className="blind">참여하기</span>
                      </button>
                  </div>

              </div>

              <div className="evtNotice">
                  <strong>유의사항</strong>
                  <ul className="evtInfoList">
                      <li>비바샘 교사 인증을 완료하신 초·중·고 선생님만 참여하실 수 있습니다.</li>
                      <li>이벤트별로 1인 1회 참여하실 수 있습니다.</li>
                      <li>개인 정보 오기재, 유효 기간 만료로 인한 경품 재발송은 불가합니다.</li>
                      <li>경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                      <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                      <li>선물 발송을 위해 서비스사에 개인 정보가 제공됩니다.<br/>
                          (㈜카카오 사업자 등록 번호: 120-81-47521,<br/>
                          ㈜모바일이앤엠애드 사업자 등록 번호: 215-87-19169)
                      </li>
                      <li>
                          1개의 이벤트에만 참여하셔도 비바콘 100콘을 지급해 드립니다.<br/>
                          다만 2개 이벤트에 모두 참여하셔도 비바콘은 총 100콘만 지급됩니다.
                      </li>
                  </ul>
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));