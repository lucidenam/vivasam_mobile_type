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
        // eventId: 564,
        isEventApply : false,       // 신청여부
        chosenItem: '',
        chosenItemName: '',
        evtComment: '',
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
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
        }
    }

    // 전제 조건
    prerequisite = async () => {
        const {logged, history, BaseActions, loginInfo} = this.props;
        const {isEventApply, chosenItem, evtComment} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인이 필요한 서비스입니다.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
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
            common.info("준회원은 참여하실 수 없습니다.\n고객센터로 문의해 주세요(1544-7714)");
            return false;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        if (evtComment.length < 20) {
            common.info("내용을 20자 이상 입력해 주세요.");
            return false;
        }

        if (chosenItem === '') {
            common.info("[1단계] 카드를 선택해 주세요.");
            return false;
        }

        return true;
    }

    // 편지 내용 변경
    inputEvtComment = (e) => {
        this.setState({
            evtComment: e.target.value
        });
    };

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async () => {
        const {SaemteoActions, eventId, handleClick} = this.props;
        const {chosenItem, chosenItemName, evtComment} = this.state;

        if (!await this.prerequisite()) {
            return;
        }

        try {
            const eventAnswer = {
                chosenItem: chosenItem,
                chosenItemName: chosenItemName,
                evtComment: evtComment,
            };
            SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
            }, 1000);//의도적 지연.
        }
    };

    handleTypeClick = (type, name) => {
        this.setState({
            chosenItem: type,
            chosenItemName: name
        });
    }

    render() {
        const { chosenItem } = this.state;

        return (
            <section className="event250430">
                <div className="evtTitWrap">
                    <div className="evtTit">
                        <img src="/images/events/2025/event250430/tit.png" alt="스승의날 이벤트"/>
                     </div>
                </div>

                <div className="evtCont evtCont01">
                    <div className="evtContBox">
                        <div className="evtContHead">
                            <h2>
                                <span className="blind">
                                    감사의 마음을 전하고 싶은 선생님은
                                    어떤 분이신가요?
                                    카드를 눌러 마음을 전할 선생님을 골라보세요.
                                </span>
                            </h2>
                        </div>
                        <div className="evtContBody">
                            <div className="evtItemList">
                                <div className={"evtItem item1 type1 " + (chosenItem === 'item1' ? 'on' : '')} onClick={()=>this.handleTypeClick('item1', '교무부장 선생님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">학교의 중심을 든든하게 지켜주는 교무부장 선생님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item2 type2 " + (chosenItem === 'item2' ? 'on' : '')} onClick={()=>this.handleTypeClick('item2', '긍정 에너지 선생님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">언제나 분위기를 밝게 만드는 긍정 에너지 선생님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item3 type3 " + (chosenItem === 'item3' ? 'on' : '')} onClick={()=>this.handleTypeClick('item3', '새내기 선생님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">올해 처음 담임을 맡은 새내기 선생님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item4 type4 " + (chosenItem === 'item4' ? 'on' : '')} onClick={()=>this.handleTypeClick('item4', '옆자리 선생님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">늘 조용히 도와주는 든든한 옆자리 선생님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item5 type1 " + (chosenItem === 'item5' ? 'on' : '')} onClick={()=>this.handleTypeClick('item5', '학년부장 선생님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">우리 학년을 따뜻하게 이끌어 주시는 학년부장 선생님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item6 type2 " + (chosenItem === 'item6' ? 'on' : '')} onClick={()=>this.handleTypeClick('item6', '연구부장 선생님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">보이지 않는 곳에서 늘 수업을 고민하는 연구부장 선생님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item7 type2 " + (chosenItem === 'item7' ? 'on' : '')} onClick={()=>this.handleTypeClick('item7', '존경하는 스승님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">선생님의 선생님, 존경하는 스승님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item8 type4 " + (chosenItem === 'item8' ? 'on' : '')} onClick={()=>this.handleTypeClick('item8', '특별한 선생님')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">특별한 고마움을 전달하고 싶은 특별한 선생님께</span>
                                    </div>
                                </div>
                                <div className={"evtItem item9 type3 " + (chosenItem === 'item9' ? 'on' : '')} onClick={()=>this.handleTypeClick('item9', '나에게')}>
                                    <div className="ico"></div>
                                    <div className="txt">
                                        <span className="blind">누구보다 응원해주고 싶은 나에게</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evtCont evtCont02">
                    <div className="evtContBox">
                        <div className="evtContHead">
                            <h2>
                                <span className="blind">
                                    전달하고 싶은 감사의 마음을
                                    편지지에 작성해 주세요.
                                    작성해주신 내용은 감사카드로 제작되어 꽃다발과 함께 전달합니다.
                                </span>
                            </h2>
                        </div>
                        <div className="evtContBody">
                            <div className="evtBox">
                                <div className="textarea_wrap">
                                    <textarea id="evtComment" cols="30" rows="10" placeholder="(최소 20자 이상, 최대 250자 이내로 자유롭게 작성해 주세요.)" maxLength="250"
                                        onInput={this.inputEvtComment}></textarea>
                                </div>
                                <p className="evtTxt1"><span className="blind">* 특수문자 및 이모티콘은 편지 내용에 포함되지 않습니다.</span></p>
                                <p className="evtTxt2"><span className="blind">스승의 날, 선생님이 기억하는 선생님께 마음을 전해 보세요. 비바샘이 그 마음을 꽃으로 예쁘게 전해드릴게요.</span></p>

                                <div className="btnWrap">
                                    <button className="btnApply" onClick={this.eventApply}>
                                        <span className="blind">신청하기</span>
                                    </button>
                                </div>
                            </div>

                            <div className="evtInfo">
                                <img src="/images/events/2025/event250430/evt2_info.png" alt="선물 안내"/>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="evtFooter">
                    <img src="/images/events/2025/event250430/evtFooter.png" alt="유의사항"/>
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