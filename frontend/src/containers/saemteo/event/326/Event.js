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
            contentLength : 0, // 길이 카운트
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
        const { logged, history, BaseActions, loginInfo} = this.props;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else {
            // 준회원일 경우 신청 안됨.
            if (loginInfo.mLevel != 'AU300') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            if (e.target.value.length > 500) {
                common.info("500자 이내로 입력해 주세요.");
            } else {
                this.setState({
                    contentLength: e.target.value.length,
                    applyContent: e.target.value
                });
            }
        }
    };

    setApplyName = (e) => {
        const { logged, history, BaseActions, loginInfo} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else {
            // 준회원일 경우 신청 안됨.
            if (loginInfo.mLevel != 'AU300') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            if (e.target.value.length > 10) {
                common.info("단어는 10자까지 입력 가능합니다.");
            } else {
                this.setState({
                    applyName: e.target.value
                });
            }
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
                        common.info("단어를 입력해 주세요.");
                        return false;
                    }
                    if(this.state.applyContent.trim() === ''){
                        common.info("신념 다짐을 입력해 주세요.");
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
            <section className="event210113">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210113/img01.jpg" alt="선생님의 신년 다짐. 2021년, 없이 살아보기!" /></h1>
                    <div className="blind">
                        <strong>선생님, 새해에 어떤 계획을 세우고 계신가요?</strong>
                        <p>더 행복한 2021년을 위해,<br />올해에 꼭 버리고 싶은 물건이나 습관, 생각 등이 있다면<br />그 이유와 결심을 함께 작성해주세요!<br />비바샘이 선생님의 계획을 도와줄 선물을 보내드립니다.</p>
                        <ul>
                            <li>참여 기간: 2021.01.13(수) ~ 02.03(수)</li>
                            <li>당첨 발표: 2021.02.08(월)</li>
                            <li>당첨 선물: 새해꾸러미 새해 계획을 도와주는 꾸러미 20명, 해피머니 상품권 5천원권 50명, GS25 매일 카페라떼 100명</li>
                        </ul>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="evtWrap">
                        <div className="evtTitWrap">
                            <span>2021년,</span><br />
                            <span className="evtInput"><input type="text" placeholder="단어를 입력해 주세요." value={ this.state.applyName } onChange={ this.setApplyName } maxLength={11}/></span> <span>없이</span><br />
                            <span>살아보기!</span>
                        </div>
                        <div className="evtCont">
                            <p className="txt">망설임, 편견, 할부, 낭비, 플라스틱, 일회용품, 담배, 술 등 버리고 싶은 물건이나 습관, 생각 등을 자유롭게 적어주세요.</p>
                            <div className="reasonWrap">
                                <p className="count">(<span className="reasonCount">{this.state.contentLength}</span>/500)</p>
                                <div className="evtTextarea">
                                    <textarea 
                                        name="applyContent"
                                        id="applyContent" 
                                        placeholder="2021년, 새해 계획에 대한 결심을 적어보세요."
                                        value={ this.state.applyContent}
                                        onChange={ this.setApplyContent }
                                        maxLength="500"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="btnWrap">
                                <button type="button" onClick={ this.eventApply }><img src="/images/events/2021/event210113/btn_apply.png" alt="참여하기" /></button>
                            </div>
                        </div>
                    </div>
                    <div class="evtListWrap">
                        <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents}/>
                        <button type="button" className="btnMore" style={{ display : this.state.eventViewAddButton == 1 ? 'block' : 'none' }} onClick={this.commentListAddAction}>더보기</button>
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
        <div className="evtList">
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
            <div className="listItem">
                <strong >{ this.state.eventName} 선생님</strong>
                <p className="listTit">“2021년, <span className="word" dangerouslySetInnerHTML = {{__html: this.state.eventContents1}}></span> 없이 살아보기”</p>
                <p className="txt" dangerouslySetInnerHTML = {{__html: this.state.eventContents2}}></p>
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