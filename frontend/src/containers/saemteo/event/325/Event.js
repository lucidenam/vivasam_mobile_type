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

class Event extends Component {
    state = {
        applyContent : '',
        contentLength : 0,
        isEventApply: false
    };

    constructor(props) {
        super(props);
    }

    componentDidMount = async() => {
        const { BaseActions, eventId } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    eventApplyCheck = async() => {
        const { logged, eventId, event } = this.props;
        if(logged){
            event.eventId = eventId; // 이벤트 ID
            const response = await api.eventInfo(eventId);
            if(response.data.code === '3'){
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    setApplyContent = (e) => {
        if(e.target.value.length > 500){
            //common.info("200자 이내로 입력해 주세요.");
        }else{
            this.setState({
                contentLength: e.target.value.length,
                applyContent: e.target.value
            });
        }
    };

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다.");
                }else{
                    // 의견정보 저장
                    let applyContent = this.state.applyContent.trim()
                    let eventAnswerArray = {};
                    if(applyContent === ''){
                        common.info('선생님의 의견을 작성해 주세요.');
                        return false;
                    }
                    eventAnswerArray.applyContent = applyContent;
                    eventAnswer.eventAnswerContent = eventAnswerArray;
                    SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                    handleClick(eventId);
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    render() {
        return (
            <section className="event201218">
                <div className="evtCont01">
                    <h1><img src="/images/events/2020/event201218/img01.jpg" alt="비바샘x선생님 '이벤트의 탄생'" /></h1>
                    <div className="blind">
                        <p>2021년, 비바샘에서 만나보고 싶은 이벤트를 말해주세요.<br />선생님의 아이디어가 비바샘 이벤트로 탄생합니다!</p>
                        <span>동료 선생님과 공유하고 싶은 이벤트 주제나 받고 싶은 경품 등<br />선생님의 자유로운 아이디어를 기다립니다.</span>
                        <ul>
                            <li>참여기간: 2020.12.18(금) ~ 2021.01.07(목)</li>
                            <li>당첨발표: 2021.01.21(화)</li>
                            <li>담첨혜택: 당첨되신 선생님 아이디어 중 일부는 실제 비바샘 이벤트로 진행됩니다.
                                <ul>
                                    <li>1명 포토프린터</li>
                                    <li>3명 블루투스 마이크</li>
                                    <li>10명 스타벅스 커피+케익</li>
                                    <li>30명 2021 신년응원토퍼</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="imgWrap"><img src="/images/events/2020/event201218/img02.jpg" alt="" /></div>
                    <p className="blind">동료 선생님과 공유하고 싶은 주제, 선생님이라면 꼭 참여할만한 이벤트,<br />받고 싶은 경품, 비바샘 이벤트 중 다시 만나고 싶은 이벤트 등 다양한 의견을 작성해주세요.</p>
                    <div className="textWrap">
                        <span>({this.state.contentLength}/500)</span>
                        <textarea
                            name="applyTextarea"
                            id="applyTextarea"
                            cols="30"
                            rows="10"
                            maxLength="500"
                            value={this.state.applyContent}
                            onChange={this.setApplyContent}></textarea>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply }><img src="/images/events/2020/event201218/btn_apply.png" alt="신청하기" /></button>
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));