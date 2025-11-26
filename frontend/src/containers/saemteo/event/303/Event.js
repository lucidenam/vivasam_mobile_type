import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    constructor(props) {
        super(props);
        this.state = {
            // Amount1 ~ Amount2 교재 수량
            // 0 : 마감 / 1 : 신청
            storyLength : 0, // 길이 카운트
            storyContents  : "",
            StoryPageNo : 1, // 페이지
            StoryPageSize : 10, // 사이즈
            eventAnswerContents : [], // 응답
            eventAnswerCount : 0, // 해당 이벤트 응답 수
            StoryLogInInfo : this.props.loginInfo, // 접속 정보
            eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
            applyContent : '',
            contentLength : 0,
            eventAmount1 : 1,
            eventAmount2 : 1,
            eventAmount3 : 1,
            eventCheck1 : false,  // 힐링키트
            eventCheck2 : false,  // 패밀리키트
            eventCheck3 : false,  // 건강키트
            eventCheckAnswer : "" // 신청한 교과서 목록
        };
        this.commentConstructorList();
        this.checkEventCount();
    }

    componentDidMount = () => {

    };

    // 이벤트 카운트 확인
    checkEventCount = async () => {
        const { event, eventId, loginInfo, history,  SaemteoActions, PopupActions, BaseActions } = this.props;
        event.eventId = eventId; // 이벤트 ID
        let response = await SaemteoActions.checkEventTotalJoin({...event});
        this.setState({
            eventAnswerCount : response.data.eventAnswerCount
        });

        if(this.state.eventAnswerCount > 10){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };

    setApplyContent = (e) => {
        if(e.target.value.length > 200){
            common.info("200자 이내로 입력해 주세요.");
        }else{
            this.setState({
                contentLength: e.target.value.length,
                applyContent: e.target.value
            });
        }
    };

    // 댓글 출력
    commentConstructorList = async  () => {
        const { event, eventId, answerPage, loginInfo,  SaemteoActions } = this.props;
        answerPage.pageNo = this.state.StoryPageNo;
        answerPage.pageSize = this.state.StoryPageSize;
        event.eventId = eventId; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 1
        event.memberId = loginInfo.memberId; // 멤버 ID
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;
        this.setState({
            eventAnswerContents : responsedata,
            StoryPageSize : this.state.StoryPageSize + 5,
        });
        if(this.state.eventAnswerCount < this.state.StoryPageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }
    };

    // 댓글 더보기
    commentListAddAction  = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 로그인시
            if(this.state.eventCheck1 == false && this.state.eventCheck2 == false && this.state.eventCheck3 == false) {
                common.info("썸머키트를 선택해주세요.");
                return;
            }
            if(this.state.applyContent == null || this.state.applyContent == 'undefined' || this.state.applyContent.trim() == ''){
                common.info("선생님의 여름휴가 계획을 작성해 주세요.");
                return;
            }
            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청 하셨습니다.");
                }else if(response.data.code === '0') {
                    this.setState({
                        eventCheckAnswer: ""
                    });

                    if (this.state.eventCheck1 == true) {
                        this.setState({
                            eventCheckAnswer: "힐링키트"
                        });
                    }
                    if (this.state.eventCheck2 == true){
                        this.setState({
                            eventCheckAnswer: "패밀리키트"
                        });
                    }
                    if (this.state.eventCheck3 == true){
                        this.setState({
                            eventCheckAnswer: "건강키트"
                        });
                    }

                    let eventAnswerArray = {};
                    eventAnswerArray.Q1 = this.state.eventCheckAnswer;
                    eventAnswerArray.Q2 = this.state.applyContent.trim();
                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    eventAnswer.eventAnswerContent = eventAnswerArray;
                    SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                    handleClick(eventId);
                }else{
                    common.error("신청이 정상적으로 처리되지 못하였습니다.");
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    // 이벤트 첫 신청의 경우 시작
    // 힐링키트
    onKitChange1 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck1: !this.state.eventCheck1
            });
        }

    };

    // 패밀리키트
    onKitChange2 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck2: !this.state.eventCheck2
            });
        }

    };

    // 건강키트
    onKitChange3 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck3: !this.state.eventCheck3
            });
        }

    };

    render (){
        return (
            <section className="event200707">
                <h1><img src="/images/events/2020/event200707/img01.jpg" alt="비바샘이 채워주는 여름 휴가 썸머키트" /></h1>
                <div className="blind">
                    몸도 마음도 지치는 7월의 여름, 비바샘이 선생님의 시원한 여름 휴가를 응원합니다.<br/>
                    3가지 주제별 키트를 고르고, 올 여름 선생님의 휴가 계획을 공유해 주세요.
                    <dl>
                        <dt>참여 기간</dt>
                        <dd>2020년 7월 9일(목) ~ 24일(금)</dd>
                        <dt>당첨자 발표</dt>
                        <dd>2020년 7월 29일(수)</dd>
                        <dt>당첨 선물</dt>
                        <dd>썸머키트(총 120명)
                            <p>※썸머키트 구성품은 공개되지 않으며, 주제에 맞는 다양한 상품으로 구성하여 보내드립니다.</p>
                        </dd>
                        <dt>참여 방법</dt>
                        <dd>
                            <ol>
                                <li>STEP 1. 올 여름 휴가에 필요한 키트를 선택하세요.</li>
                                <li>STEP 2. 선생님의 여름 휴가 계획을 공유해 주세요.</li>
                            </ol>
                        </dd>
                    </dl>
                </div>
                <div className="desc-box type1">
                    <div className="list">
                        <ul>
                            <li>
                                <div className="desc type1">
                                    <img src="/images/events/2020/event200707/radio1.png"/>
                                    <input type="radio" name="kit" id="radio1" checked={this.state.eventCheck1} disabled={!(this.state.eventAmount1)} onChange={this.onKitChange1}/>
                                    <label htmlFor="radio1"></label>
                                </div>
                            </li>
                            <li>
                                <div className="desc type2">
                                    <img src="/images/events/2020/event200707/radio2.png"/>
                                    <input type="radio" name="kit" id="radio2" checked={this.state.eventCheck2} disabled={!(this.state.eventAmount2)} onChange={this.onKitChange2}/>
                                    <label htmlFor="radio2"></label>
                                </div>
                            </li>
                            <li>
                                <div className="desc type3">
                                    <img src="/images/events/2020/event200707/radio3.png"/>
                                    <input type="radio" name="kit" id="radio3" checked={this.state.eventCheck3} disabled={!(this.state.eventAmount3)} onChange={this.onKitChange3}/>
                                    <label htmlFor="radio3"></label>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="input_wrap">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                cols="1"
                                rows="10"
                                maxLength="201"
                                value={this.state.applyContent}
                                onChange={this.setApplyContent}
                                placeholder="선생님의 여름 휴가 계획을 작성해 주세요. (200자 이내)"
                                className="textarea">
                            </textarea>
                        <div className="count_wrap">
                            <p className="count">(<span>{this.state.contentLength}</span>/200)</p>
                        </div>
                    </div>

                    <div className="btn-wrap">
                        <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}>
                            <img src="/images/events/2020/event200707/btn_apply.png" alt="신청하기" /></button>
                    </div>
                </div>

                <div className="comment_wrap">

                    <div className="comment">
                        <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents} deleteCommentChange={this.deleteCommentChange} updateCommentChange={this.updateCommentChange}/>
                    </div>

                    <div className="btn-wrap">
                        <button className="btn_more"  style={{ visibility : this.state.eventViewAddButton == 1 ? 'visible' : 'hidden' }} onClick={this.commentListAddAction}>
                            <img src="/images/events/2020/event200707/btn_more.png" alt="더보기" /></button>
                    </div>
                </div>

            </section>
        )
    }
}

// 리스트 목록 UL 출력
const EventList = ({eventlists, loginInfo , StoryUpdateContents}) => {
    const eventList = eventlists.map(eventList => {
        return (<EventListApply {...eventList} loginInfo={loginInfo} StoryUpdateContents={StoryUpdateContents} />);
    });
    return (
        <ul>
            {eventList}
        </ul>
    );
};


class EventListApply extends Component{

    constructor(props) {
        super(props);
        this.state = {
            member_id : this.props.member_id, // 멤버 아이디
            event_id : this.props.event_id, // eventId
            event_answer_desc : this.props.event_answer_desc, // 응답문항
            reg_dttm : this.props.reg_dttm, // 등록일
            loginInfo : this.props.loginInfo, // 로그인 정보
            BaseActions : this.props.BaseActions, // BaseAction
            StoryUpdateContents : this.props.StoryUpdateContents, // 컨텐츠
            eventType : "", // 이벤트 타입
            eventName : "", // 이벤트 응모자
            eventRegDate : "", // 이벤트 등록일
            eventContents : "", // 이벤트 내용
            eventLength : "" // 이벤트 길이
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id).substring(1,4) + "***"; // 이벤트 이름
        let eventSetRegDate = JSON.stringify(this.state.reg_dttm).replace(/\"/g, ""); // 이벤트 등록일
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let eventSetContents = JSON.stringify(this.state.event_answer_desc).substring(1,eventSetContentLength-1); // 이벤트 내용

        eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
        eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents : eventSetContents
        });

    };

    render(){
        return (
            <li>
                <strong>{this.state.eventName} 선생님</strong>
                <p dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>
            </li>
        )
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
//export default MiddleClassAppraisalListContainer;