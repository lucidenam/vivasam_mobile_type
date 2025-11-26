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
        if(e.target.value.length > 300){
            common.info("300자 이내로 입력해 주세요.");
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
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck == 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 로그인시
            if(this.state.applyContent == null || this.state.applyContent == 'undefined' || this.state.applyContent.trim() == ''){
                common.info("학생용 필사 노트 활용 계획을 작성해 주세요.");
                return;
            }
            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청 하셨습니다.");
                }else if(response.data.code === '0') {

                    let eventAnswerArray = {};
                    eventAnswerArray.Q1 = this.state.applyContent;
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

    render (){
        return (
            <section className="event200723">
                <h1><img src="/images/events/2020/event200723/img01.jpg" alt="위인의 뜻을 되새기는 필사 한 줄" /></h1>
                <div className="blind">
                    선생님들의 큰 사랑을 받았던 학생용 필사 노트가 2020년, 다시 한번 제작되었습니다.<br/>
                    전국 1천여 명의 선생님이 추천해주신 위인의 명언을 한 자 한 자 눌러쓰며 배움, 노력, 태도, 행복에 대한 깊은 뜻을 되새길 수 있습니다.
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2020년 7월 28일(화) ~ 8월 12일(수)</dd>
                        <dt>당첨 선물</dt>
                        <dd>
                            위인의 생각을 쓰다 노트 최대30권
                        </dd>
                        <dt>당첨자 발표</dt>
                        <dd>2020년 8월 14일(금)</dd>
                    </dl>

                    <h4>&gt; 위인의 생각을 쓰다 &lt; 노트 미리보기</h4>
                    <ul>
                        <li>배움, 노력, 태도, 행복의 힘을 만드는 명언과 위인 소개</li>
                        <li>명언을 따라 써보는 필사 페이지</li>
                    </ul>
                    <p>역사 노트 활용 계획을 공유해 주세요. <br/>
                    ※ 900분을 선정하여 최대 30권의 필사 노트를 보내드립니다.</p>
                </div>
                <div className="msg_box">
                    <img src="/images/events/2020/event200723/img02.jpg" alt="" />
                    <div className="input_wrap">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                cols="1"
                                rows="10"
                                maxLength="301"
                                value={this.state.applyContent}
                                onChange={this.setApplyContent}
                                placeholder="학생용 필사 노트 활용 계획을 작성해 주세요. (300자 이내)"
                                className="textarea">
                            </textarea>
                        <div className="count_wrap">
                            <p className="count">(<span>{this.state.contentLength}</span>/300)</p>
                        </div>
                    </div>

                    <div className="btn-wrap">
                        <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}>
                            <img src="/images/events/2020/event200723/btn_apply.png" alt="참여하기" /></button>
                    </div>
                </div>

                <div className="comment_wrap">

                    <div className="comment">
                        <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents}/>
                    </div>

                    <div className="btn-wrap">
                        <button className="btn_more"  style={{ visibility : this.state.eventViewAddButton == 1 ? 'visible' : 'hidden' }} onClick={this.commentListAddAction}>
                            <img src="/images/events/2020/event200723/btn_more.png" alt="더보기" /></button>
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