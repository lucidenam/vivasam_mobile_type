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
            storyContents  : '',
            StoryPageNo : 1, // 페이지
            StoryPageSize : 3, // 사이즈
            eventAnswerContents : [], // 응답
            eventAnswerCount : 0, // 해당 이벤트 응답 수
            StoryLogInInfo : this.props.loginInfo, // 접속 정보
            eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
            applyContent : '',
            contentLength : 0,
            eventCheck1 : false,
            eventCheck2 : false,
            eventCheck3 : false,
            eventCheck4 : false,
            eventCheck5 : false,
            eventCheck6 : false,
            eventCheckAnswer : '' // 신청한 교과서 목록
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

        if(response.data.eventAnswerCount > 3){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };

    setApplyContent = (e) => {
        const { logged, history, BaseActions} = this.props;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }

        if(e.target.value.length > 500){
            common.info("500자 이내로 입력해 주세요.");
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

        let StoryPageSize = this.state.StoryPageSize + 3
        this.setState({
            eventAnswerContents : responsedata,
            StoryPageSize : StoryPageSize,
        });
        if(this.state.eventAnswerCount < StoryPageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }
    };

    // 댓글 더보기
    commentListAddAction  = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    onCheckContent  = (targetId) => {
        const { logged, history, BaseActions} = this.props;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }

        if(targetId == 1){
            if(this.state.eventCheck1){
                this.setState({
                    eventCheck1: false
                });
            }else {
                this.radioAllOff();
                this.setState({
                    eventCheck1: true
                });
            }
        }else if(targetId == 2){
            if(this.state.eventCheck2){
                this.setState({
                    eventCheck2: false
                });
            }else{
                this.radioAllOff();
                this.setState({
                    eventCheck2: true
                });
            }
        }else if(targetId == 3){
            if(this.state.eventCheck3){
                this.setState({
                    eventCheck3: false
                });
            }else{
                this.radioAllOff();
                this.setState({
                    eventCheck3: true
                });
            }
        }else if(targetId == 4){
            if(this.state.eventCheck4){
                this.setState({
                    eventCheck4: false
                });
            }else{
                this.radioAllOff();
                this.setState({
                    eventCheck4: true
                });
            }
        }else if(targetId == 5){
            if(this.state.eventCheck5){
                this.setState({
                    eventCheck5: false
                });
            }else{
                this.radioAllOff();
                this.setState({
                    eventCheck5: true
                });
            }
        }else if(targetId == 6){
            if(this.state.eventCheck6){
                this.setState({
                    eventCheck6: false
                });
            }else{
                this.radioAllOff();
                this.setState({
                    eventCheck6: true
                });
            }
        }
    };

    // off 시키기
    radioAllOff = async() => {
        this.setState({
            eventCheck1: false,
            eventCheck2: false,
            eventCheck3: false,
            eventCheck4: false,
            eventCheck5: false,
            eventCheck6: false
        });
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
            if(loginInfo.certifyCheck == 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청 하셨습니다.");
                }else if(response.data.code === '0') {

                    // 콘텐츠 선택 체크
                    let eventCheck = 0;
                    let eventCheckAnswer = '';
                    if(this.state.eventCheck1){
                        eventCheck = 1;
                    }
                    if(this.state.eventCheck2){
                        eventCheck = 2;
                    }
                    if(this.state.eventCheck3){
                        eventCheck = 3;
                    }
                    if(this.state.eventCheck4){
                        eventCheck = 4;
                    }
                    if(this.state.eventCheck5){
                        eventCheck = 5;
                    }
                    if(this.state.eventCheck6){
                        eventCheck = 6;
                    }

                    if(eventCheck == 0){
                        common.info("비바샘에서만 볼 수 있는 콘텐츠\n한 가지를 선택해주세요.");
                        return;
                    }else{
                        if(eventCheck == 1){
                            eventCheckAnswer = 'VR 역사 답사';
                        }else if(eventCheck == 2){
                            eventCheckAnswer = 'VR 지질 답사';
                        }else if(eventCheck == 3){
                            eventCheckAnswer = '비바샘 미술관';
                        }else if(eventCheck == 4){
                            eventCheckAnswer = '전자 도서관';
                        }else if(eventCheck == 5){
                            eventCheckAnswer = '교재 자료실';
                        }else if(eventCheck == 6){
                            eventCheckAnswer = '수박씨 추천강의';
                        }
                    }

                    if(eventCheckAnswer == ''){
                        common.info("비바샘에서만 볼 수 있는 콘텐츠\n한 가지를 선택해주세요.");
                        return;
                    }

                    let applyContent = this.state.applyContent;

                    // 로그인시
                    if(applyContent == null || applyContent == 'undefined' || applyContent.trim() == ''){
                        common.info("선생님만의 수업 계획을\n500자 이내로 입력해주세요.");
                        return;
                    }

                    applyContent = applyContent.trim();

                    let eventAnswerArray = {};
                    eventAnswerArray.Q1 = eventCheckAnswer;
                    eventAnswerArray.Q2 = applyContent;
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
            <section className="event200831">
                <h1><img src="/images/events/2020/event200831/img01.png" alt="비바샘 자료로 나만의 수업 만들기" /></h1>
                <div className="blind">
                    비바샘은 선생님의 온라인 수업을 응원하며, 테마별 자료과 수업 연구 자료를 제공합니다.<br/>
                    비바샘에서만 볼 수 있는 다양한 자료로 어떤 수업을 만들 수 있을까요?<br/>
                    선생님만의 수업 계획을 남겨주세요.
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2020년 9월 2일(수) ~ 9월 21일(월)</dd>
                        <dt>당첨 선물</dt>
                        <dd>
                            펜 타블렛, 스타벅스 아메리나코 Tall
                        </dd>
                        <dt>당첨자 발표</dt>
                        <dd>2020년 9월 23일(수)</dd>
                    </dl>
                </div>


                <div className="msg_box">
                <img src="/images/events/2020/event200831/img02.png" alt="비바샘에서만 볼 수 잇는 콘텐츠 한 가지를 선택해주세요." className="img02Title"/>
                <div className="containerBox">
                <ul className="item">
                            <li>
                                <div className="desc type1" onClick={() => this.onCheckContent(1)}>
                                    <img src={this.state.eventCheck1 ? '/images/events/2020/event200831/contents_1_on.png' : '/images/events/2020/event200831/contents_1_off.png'}/>
                                </div>
                                <a href="https://www.vivasam.com/themeplace/vrkoreanhis/main.do?deviceMode=pc" target="_blank"><img src="/images/events/2020/event200831/contents_1_tit.png" className="titleImg"/></a>
                            </li>
                            <li>
                                <div className="desc type2" onClick={() => this.onCheckContent(2)}>
                                    <img src={this.state.eventCheck2 ? '/images/events/2020/event200831/contents_2_on.png' : '/images/events/2020/event200831/contents_2_off.png'}/>
                                </div>
                                <a href="https://www.vivasam.com/themeplace/vrtrip/main.do?deviceMode=pc" target="_blank"><img src="/images/events/2020/event200831/contents_2_tit.png" className="titleImg"/></a>
                            </li>
                            <li>
                                <div className="desc type3" onClick={() => this.onCheckContent(3)}>
                                    <img src={this.state.eventCheck3 ? '/images/events/2020/event200831/contents_3_on.png' : '/images/events/2020/event200831/contents_3_off.png'}/>
                                </div>
                                <a href="https://www.vivasam.com/themeplace/gallery/main.do?deviceMode=pc" target="_blank"><img src="/images/events/2020/event200831/contents_3_tit.png" className="titleImg"/></a>
                            </li>
                            <li>
                                <div className="desc type4" onClick={() => this.onCheckContent(4)}>
                                    <img src={this.state.eventCheck4 ? '/images/events/2020/event200831/contents_4_on.png' : '/images/events/2020/event200831/contents_4_off.png'}/>
                                </div>
                                <a href="http://visang.bookcube.biz/FxLibrary/index/" target="_blank"><img src="/images/events/2020/event200831/contents_4_tit.png" className="titleImg"/></a>
                            </li>
                            <li>
                                <div className="desc type5" onClick={() => this.onCheckContent(5)}>
                                    <img src={this.state.eventCheck5 ? '/images/events/2020/event200831/contents_5_on.png' : '/images/events/2020/event200831/contents_5_off.png'}/>
                                </div>
                                <a href="https://www.vivasam.com/library/main.do?deviceMode=pc" target="_blank"><img src="/images/events/2020/event200831/contents_5_tit.png" className="titleImg"/></a>
                            </li>
                            <li>
                                <div className="desc type6" onClick={() => this.onCheckContent(6)}>
                                    <img src={this.state.eventCheck6 ? '/images/events/2020/event200831/contents_6_on.png' : '/images/events/2020/event200831/contents_6_off.png'}/>
                                </div>
                                <a href="/#/soobakc"><img src="/images/events/2020/event200831/contents_6_tit.png" className="titleImg subac"/></a>
                            </li>
                        </ul>
                </div>
                    <img src="/images/events/2020/event200831/img03.png" alt="선택하신 콘텐츠로 어떤 수업을 만들면 좋을까요?" className="img03Title"/>
                    <div className="input_wrap">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                cols="1"
                                rows="10"
                                maxLength="501"
                                value={this.state.applyContent}
                                onChange={this.setApplyContent}
                                placeholder="선생님만의 수업 계획을 작성해주세요. (500자 이내)"
                                className="textarea">
                            </textarea>
                        <div className="count_wrap">
                            <p className="count">(<span>{this.state.contentLength}</span>/500)</p>
                        </div>
                    </div>

                    <div className="btn-wrap">
                        <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}>
                            <img src="/images/events/2020/event200831/btn_apply.png" alt="참여하기" /></button>
                    </div>
                </div>

                <div className="comment_wrap">

                    <div className="comment">
                        <ul>
                            <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents}/>
                        </ul>
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
            eventContents : eventSetContents,
            eventSetContentLength: eventSetContentLength
        });

    };

    closeText  = (e) => {
        e.target.previousSibling.className = 'textOpen';
        let img = document.createElement('img');
        img.src = '/images/events/2020/event200831/textOpen.png';
        img.alt = '펼치기';
        img.addEventListener('click', this.openText);
        e.target.parentNode.appendChild(img);
        e.target.remove();
    }

    openText  = (e) => {
        e.target.previousSibling.className = '';
        let img = document.createElement('img');
        img.src = '/images/events/2020/event200831/textClose.png';
        img.alt = '접기';
        img.addEventListener('click', this.closeText);
        e.target.parentNode.appendChild(img);
        e.target.remove();
    }

    render(){
        return (
            <li>
                <strong>{this.state.eventName} 선생님</strong>
                <p dangerouslySetInnerHTML = {{__html: this.state.eventContents}} className={this.state.eventSetContentLength > 200 ? 'textOpen' : ''}></p>
                { /* 부분 렌더링 */
                    (this.state.eventSetContentLength > 200) &&  /* 내 글을 작성한 상태, 글 보기 */
                    <img src="/images/events/2020/event200831/textOpen.png" alt="펼치기" onClick={this.openText}/>
                }
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
