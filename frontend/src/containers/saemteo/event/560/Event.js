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

class Event extends Component {
    state = {
        // eventId: 445,
        isEventApply : false,       // 신청여부
    }

    componentDidMount = async () => {
        const {BaseActions, event, SaemteoActions} = this.props;
        BaseActions.openLoading();

        try {
            await this.eventApplyCheck();
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
                isEventApply : isEventApply
            };
            SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});

            window.open('https://answer.moaform.com/answers/W7lY5w/reserved')
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
            }, 1000);//의도적 지연.
        }
    };

    render() {

        return (
          <section className="event250414">
              <div className="evtCont01">
                  <h3><img src="/images/events/2025/event250414_2/img1.png"/></h3>
              </div>

              <div className="evtCont02">
                  <h3><img src="/images/events/2025/event250414_2/img2.png"/></h3>
                  <h3><img src="/images/events/2025/event250414_2/img3.png"/></h3>

                  <div className="btnWarp">
                    <button className="btnApply" onClick={this.eventApply}>
                          <span className="blind">신청하기</span>
                      </button>
                  </div>
              </div>

              <div className="evtNotice">
                  <strong>유의사항</strong>
                  <ul className="evtInfoList">
                      <li>본 설문 이벤트는 비바샘 교사인증을 완료한 중학교, 고등학교 선생님을 대상으로 진행되는 이벤트입니다.</li>
                      <li>1인 1회 참여 가능하며, 응답 제출 후 답변 내용을 수정하려는 경우, 다시 설문을 시작해 답변할 수 있습니다.</li>
                      <li>경품 추첨 당첨자는 설문 종료 후 일주일 내에 비바샘 공지사항 채널을 통해 공지되며, 개별 연락이 진행됩니다.</li>
                      <li>개인정보 오기재, 유효기간 만료로 인한 경품의 재발송은 불가합니다.</li>
                      <li>경품 발송을 위해 개인정보(성명, 휴대전화번호, 주소)가 서비스사에 제공됩니다. 주식회사 꿈네트웍스(모아폼) 사업자등록번호: 114-87-04572</li>
                      <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                      <li>이벤트 운영 상황에 따라 운영 일정 변경이 있을 수 있습니다.</li>
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
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));