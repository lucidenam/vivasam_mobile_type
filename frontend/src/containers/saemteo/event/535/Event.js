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
import ReactPlayer from 'react-player/youtube'
import * as myclassActions from "../../../../store/modules/myclass";

const PAGE_SIZE = 10;

class Event extends Component {
    state = {
        eventId1: 536,
        eventId2: 537,
        isEventApply1: false,       // 신청여부
        isEventApply2: false,       // 신청여부
        schoolLvlCd: '',
        bookTitle: '',
        bookReason: '',
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/535',
        evtComment: '',
        choosedItem: '',
        evtUrl: '',
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
            }, 1000);//의도적 지연.
        }
        await this.setEventInfo();
    };

    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.evtUrl = '';

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

        event.evtUrl = e.target.value;

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

        // event.evtUrl = e.target.value;

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
        const {isEventApply1, evtUrl} = this.state;

        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        // 기 신청 여부
        if (isEventApply1) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        if (event.evtUrl.length < 2) {
            common.info("소문내기 URL을 입력해 주세요.");
            return false;
        }

        let eventAnswerContent = "";
        eventAnswerContent += "URL : " + (event.evtUrl)

        try {
            const eventAnswer = {
                isEventApply: isEventApply1,
                eventId: 536,
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

        try {
            const eventAnswer = {
                isEventApply: isEventApply2,
                eventId: 537,
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

    render() {
        const {eventAnswerContents, evtUrl} = this.state;
        const {event} = this.props;

        //css용 인덱스
        let loopIndex = 0;

        return (
          <section className="event241216">
              <div className="evtCont1">
                  <h3><img src="/images/events/2024/event241216/img1.png" alt=""/></h3>
              </div>
              <div className="evtCont2">
                  <h3><img src="/images/events/2024/event241216/img2.png" alt=""/></h3>
              </div>
              <div className="evtCont3">
                  <h3><img src="/images/events/2024/event241216/img3.png" alt=""/></h3>
                  <div className="evtContItem">
                      <a href="https://www.visang.com/pageLoad?page_id=kr/company/kkomkkom" target="_blank"><span className="blind">꼼꼼체 더 알아보기</span></a>
                      <a href="https://dn.vivasam.com//vs/event/zip/contents/꼼꼼체 폰트&사용 가이드.zip" download><span className="blind">꼼꼼체 다운로드</span></a>
                      <a href="https://dn.vivasam.com/vs/event/document/contents/[ver1.2] 꼼꼼체 쓰기 교본_241224.pdf" download><span className="blind">꼼꼼체 쓰기 교본</span></a>
                  </div>
              </div>
              <div className="evtCont4">
                  <h3><img src="/images/events/2024/event241216/img4.png" alt=""/></h3>
              </div>
              <div className="evtCont5">
                  <h3><img src="/images/events/2024/event241216/img5.png" alt=""/></h3>
                  <div className="evtContItem evtContItem1">
                      <div className="urlShareWrap">
                          <button className="btnShare"
                                  onClick={this.copyToClipboard}><span className="blind">이벤트 URL 복사하기</span></button>
                          <div className="urlForm">
                              <input type="text" id="evtUrl" onChange={this.handleChangeUrl} value={event.evtUrl}
                                     placeholder="소문내주신 SNS/커뮤니티의 게시물 URL을 입력해 주세요."/>
                          </div>
                      </div>

                      <button className="btnApply" onClick={this.eventApply1}>
                          <span className="blind">신청하기</span>
                      </button>
                  </div>
                  <div className="evtContItem evtContItem2">
                      <div className="evtRdoItems">
                          <div className="evtRdoItem evtItem1">
                              <input type="radio" name="evtItem" id="evtItem1" value="1번" onChange={this.handleChangeItem} />
                              <label htmlFor="evtItem1"><span className="blind">선생님과 함께 만들어가는 즐거운 수업, 비바샘</span></label>
                          </div>
                          <div className="evtRdoItem evtItem2">
                              <input type="radio" name="evtItem" id="evtItem2" value="2번" onChange={this.handleChangeItem} />
                              <label htmlFor="evtItem2"><span className="blind">선생님과 함께 만들어가는 즐거운 수업, 비바샘</span></label>
                          </div>
                          <div className="evtRdoItem evtItem3">
                              <input type="radio" name="evtItem" id="evtItem3" value="3번" onChange={this.handleChangeItem} />
                              <label htmlFor="evtItem3"><span className="blind">선생님과 함께 만들어가는 즐거운 수업, 비바샘</span></label>
                          </div>
                          <div className="evtRdoItem evtItem4">
                              <input type="radio" name="evtItem" id="evtItem4" value="4번" onChange={this.handleChangeItem} />
                              <label htmlFor="evtItem4"><span className="blind">선생님과 함께 만들어가는 즐거운 수업, 비바샘</span></label>
                          </div>
                      </div>
                      <button className="btnApply" onClick={this.eventApply2}>
                          <span className="blind">신청하기</span>
                      </button>
                  </div>
              </div>

              <div className="evtNotice">
              <strong>유의사항</strong>
                  <ul className="evtInfoList">
                      <li>본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                      <li>각 이벤트 별로 1인 1회씩 참여하실 수 있습니다.</li>
                      <li>개인정보 오개재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                      <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                      <li>경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다. <br/>(㈜카카오 사업자등록번호 : 120-81-47521), (㈜다우기술 사업자등록번호: 220-81-02810),<br/>(㈜모바일이앤엠애드 사업자등록번호:215-87-19169)</li>
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