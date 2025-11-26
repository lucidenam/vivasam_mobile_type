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

    constructor(props) {
        super(props);
        this.state = {
            StoryCheck : "", // 선택한 선생님
            agreeCheck : 0, // 개인정보 체크
            agreeCheckNote : 0, // 유의사항 체크
            storyLength : 0, // 길이 카운트
            storyContents  : "",
            StoryPageNo : 1, // 페이지
            StoryPageSize : 10, // 사이즈
            eventAnswerContents : [], // 응답
            eventAnswerCount : 0, // 해당 이벤트 응답 수
            StoryLogInInfo : this.props.loginInfo, // 접속 정보
            eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
            applyContent : '',
            applyName: ''
        };
    }

    componentDidMount = async() => {
        const { BaseActions } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
            await this.commentConstructorList();
            await this.checkEventCount();
        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

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
                applyContent: e.target.value
            });
        }
    };

    setApplyName = (e) => {
        if(e.target.value.length > 10){
            common.info("10자 이내로 입력해 주세요.");
        }else{
            this.setState({
                applyName: e.target.value
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

    eventApplyCheck = async() => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
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
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 참여하셨습니다.");
                }else{
                    if(this.state.applyName.trim() === ''){
                        common.info("이름 입력란에 이름을 입력해 주세요.");
                        return false;
                    }
                    if(this.state.applyContent.trim() === ''){
                        common.info("나에게 보내는 메시지를 작성해 주세요.");
                        return false;
                    }
                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    let eventAnswerArray = {};
                    eventAnswerArray.applyName = this.state.applyName;
                    eventAnswerArray.applyContent = this.state.applyContent;
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
        const { newData, popOpen } = this.state
        return (
            <section className="event201201">
                <div className="evtCont01">
                    <h1><img src="/images/events/2020/event201201/img01.png" alt="2020년을 달려온 나에게 보내는 메시지. 수고했어, 경자씨!" /></h1>
                    <div className="blind">
                        <p>2020 경자년이 저물어 갑니다.<br />유례 없이 어려웠을 학교 상황에도,<br />열심히 씩씩하게 달려온 선생님!</p>
                        <p>나 자신에게 ‘올해도 수고했다’고 말해 주세요.<br />비바샘이 선생님께 선물을 보내드릴게요.</p>
                        <div>
                            <div><strong>참여 기간</strong><p>2020.12.01(화) ~ 12.20(일)</p></div>
                            <div><strong>당첨자 발표</strong><p>2020.12.22(화)</p></div>
                            <div>
                                <strong>당첨 선물</strong>
                                <ul>
                                    <li>클럭 미니 마사지기 5명</li>
                                    <li>록시땅 핸드크림 듀오 10명</li>
                                    <li>도미노피자 슈퍼슈프림 피자 20명</li>
                                    <li>스타벅스 아메리카노 100명</li>
                                </ul>
                            </div>
                            <span>* 당첨 선물은 12.23일부터 발송됩니다.</span>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="evtInner">
                        <div className="msgAddWrap">
                            <div className="msgTit">
                                <span className="imgWrap"><img src="/images/events/2020/event201201/txt_msgtit01.png" alt="수고했어," /></span>
                                <span className="inputWrap"><input type="text" placeholder="이름 입력란" maxLength="10" value={this.state.applyName} onChange={this.setApplyName}/></span>
                                <span className="imgWrap"><img src="/images/events/2020/event201201/txt_msgtit02.png" alt="씨" /></span>
                            </div>
                            <div className="msgTxt">
                                <textarea
                                    name="applyContent"
                                    id="applyContent"
                                    maxLength="200"
                                    value={this.state.applyContent}
                                    onChange={this.setApplyContent}
                                    placeholder="나에게 보내는 메시지를 작성해 주세요. [200자 이내]">
                                </textarea>
                            </div>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply }><img src="/images/events/2020/event201201/btn_apply.png" alt="신청하기" /></button>
                        </div>
                    </div>
                </div>

                <div className="evtCont03">
                    <div className="evtInner">
                        <div className="msgViewWrap">
                            <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents}/>
                            <button className="btnMore" style={{ display : this.state.eventViewAddButton == 1 ? 'block' : 'none' }} onClick={this.commentListAddAction}>더보기</button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

// 리스트 목록 UL 출력
const EventList = ({eventlists, loginInfo , StoryUpdateContents}) => {
    const eventList = eventlists.map(eventList => {
        return (<EventListApply {...eventList} loginInfo={loginInfo} StoryUpdateContents={StoryUpdateContents}/>);
    });
    return (
        <div className="msgList">
            {eventList}
        </div>
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
            eventLength : "", // 이벤트 길이
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
        let eventSetContents1 = eventSetContents.split('^||^')[0];
        let eventSetContents2 = eventSetContents.split('^||^')[1];

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents1 : eventSetContents1,
            eventContents2 : eventSetContents2
        });

    };

    render(){
        return (
            <div className="msgItem">
                <strong className="msgTit">{this.state.eventName}  선생님</strong>
                <p className="msgTxt" dangerouslySetInnerHTML = {{__html: this.state.eventContents2}}></p>
            </div>
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