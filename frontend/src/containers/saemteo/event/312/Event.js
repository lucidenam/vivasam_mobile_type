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
import IframeComponent from 'components/common/IframeComponent';

class Event extends Component{

    validate = () => {
        return true;
    };

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
            eventViewAddButton : 1, // 더보기 ( 1 : 보임 / 0 : 안보임 )
            applyContent : '',
            contentLength : 0
        };
    }

    componentDidMount = () => {
        this.commentConstructorList();
        this.checkEventCount();
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
        if(e.target.value.length > 500){
            common.info("최소 10자, 최대 500자 입력해 주세요.");
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
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 로그인시
            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청 하셨습니다.");
                }else if(response.data.code === '0') {
                    // 입력값 확인
                    if(this.state.applyContent.trim() === ''){
                        common.info("교재를 신청하시는 이유를 남겨 주세요.");
                        return;
                    }
                    if(this.state.applyContent.trim().length < 10){
                        common.info("교재를 신청하시는 이유를 최소 10자, 최대 500자 입력해 주세요.");
                        return;
                    }

                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    let eventAnswerArray = {};
                    eventAnswerArray.applyContent = this.state.applyContent;
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
    
    // 미리보기
    eventPreview = (e) => {
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:'완자 기출PICK 통합과학 미리보기', componet:<IframeComponent src='https://dn.vivasam.com/ebook/wanja_PICK_Mobile/index.html'/>});
    };

    render (){
        return (
            <section className="event201016">
                <h1>
                    <img src="/images/events/2020/event201016/img01.png" alt="완자 기출 pick 체험이벤트" />
                    <button onClick={this.eventPreview} className="btnLink"></button>
                </h1>

                <div className="blind">
                    <h2>완자 기출 pick 체험이벤트</h2>
                    <span>비상교육 내신 기출 문제집</span>
                    <p>전국의 내신 기출 문제를 완벽하게 분석한 비상교육 시간 교재 &lt;완자 기출PICK&gt; 통합과학을 체험해 보세요.<br />200분을 선정하여 교사용&amp;학생용 교재를 함께 보내드리며, 설문 우수자 53분께 맛있는 선물을 드립니다.</p>
                    <ul>
                        <li>신청기간 2020년 10월 19일(월) ~ 10월 25일(일)</li>
                        <li>당첨자 발표 2020년 10월 26일(월)</li>
                        <li>당첨선물 200명&lt;완자 기출PICK&gt;통합과학 교사용1권+학생용 1권 + 설문우수자3명 BHC치킨, 설문우수자50명 스타벅스 아메리카노 Tall</li>
                    </ul>

                    <strong>체험 이번트 진행 단계</strong>
                    <ol>
                        <li>당첨문자 확인 (10.26)</li>
                        <li>교재수령(~10.31)</li>
                        <li>교재체험(10.31~)</li>
                        <li>모바일 설문조사(11.4~11.12)</li>
                        <li>설문 우수자 상품 수령(11.16)</li>
                    </ol>	
                    <span>※11월 4일(수) 설문조사 안내 SMS를 발송합니다.</span>
                    <span>※11월 13일(금) 비바샘 공지사항을 통해 설문 우수자를 발표합니다. </span>
                        
                    <strong>&lt;완자 기출PICK&gt; 통합과학 소개</strong>
                    <ul>
                        <li>·내신 기출 문제 완벽 분석!</li>
                        <li>·내신 필수 문제 최다 수록!</li>
                        <li>·빈출 문제와 보기 선지로 개념 정리!</li>
                        <li>·꼭 풀어봐야 할 필수 문제를 주제별, 난이도별로 구성</li>
                        <li>·내신 1등급 완성을 위한 서술형, 최고 수준의 고난도 문제 수록</li>
                    </ul>	
                    <span>＊표지를 클릭하면 &lt;완자 기출PICK&gt; 통합과학을 미리볼 수 있습니다.</span>
                </div>
                
                <div className="desc-box type1">
                   <h3><img src="/images/events/2020/event201016/tit_2.png" alt="교재를 신청하시는 이유를 남겨 주세요." /></h3>
                    <div className="input_wrap">
                        <textarea
                            name="applyContent"
                            id="applyContent"
                            cols="1"
                            rows="10"
                            maxLength="501"
                            value={this.state.applyContent}
                            onChange={this.setApplyContent}
                            placeholder="500자까지 입력 가능합니다."
                            className="textarea">
                        </textarea>
                        <div className="count_wrap">
                            <p className="count">(<span>{this.state.contentLength}</span>/500)</p>
                        </div>
                    </div>

                    <div className="btn-wrap">
                        <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}>
                            <img src="/images/events/2020/event201016/btn_apply.png" alt="신청하기" />
                        </button>
                    </div>
                </div>
                <div className="comment_wrap">
                    <div className="comment">
                        <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents} deleteCommentChange={this.deleteCommentChange} updateCommentChange={this.updateCommentChange}/>
                    </div>

                    <div className="btn-wrap">
                        <button type="button" id="eMore" className="btn_more" style={{ visibility : this.state.eventViewAddButton == 1 ? 'visible' : 'hidden' }} onClick={this.commentListAddAction}>
                            <img src="/images/events/2020/event201016/btn_more.png" alt="더보기" />
                        </button>
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
            <li><strong>{this.state.eventName}  선생님</strong>
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