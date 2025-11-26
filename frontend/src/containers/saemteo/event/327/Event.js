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
            arrContent: [false,false,false,false],
            selContentNm: ''
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

    focusApplyContent = (e) => {
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
        }
    }

    setApplyContent = (e) => {
        if (e.target.value.length > 500) {
            common.info("500자 이내로 입력해 주세요.");
        } else {
            this.setState({
                contentLength: e.target.value.length,
                applyContent: e.target.value
            });
        }
    };

    contentOnClick = (index, e) => {
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

            let arrContent = [false, false, false, false];
            arrContent[index] = true;
            this.setState({
                arrContent: arrContent,
                selContentNm: e.target.value
            });
        }
    }

    // 댓글 출력
    commentConstructorList = async() => {
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
                    if(this.state.selContentNm.trim() === ''){
                        common.info("교재 표지를 선택해 주세요.");
                        return false;
                    }
                    if(this.state.applyContent.trim() === ''){
                        common.info("최소10자, 최대 500자 입력해주세요.");
                        return false;
                    }
                    if(this.state.applyContent.trim().length < 10){
                        common.info("최소10자, 최대 500자 입력해주세요.");
                        return false;
                    }
                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    let eventAnswerArray = {};
                    eventAnswerArray.selContentNm = this.state.selContentNm.trim();
                    eventAnswerArray.applyContent = this.state.applyContent.trim();
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
            <section className="event210125">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210125/img01.jpg" alt="비상교육 수능 기출 문제집. Full수록 수학 체험 이벤트" /></h1>
                    <div className="blind">
                        <p>수능 출제 유형을 한눈에 파악하고, 체계적인 학습법을 제시하는 비상교육 <strong>수능 기출 문제집 Full수록의 신간 교재</strong>를 만나보세요.</p>
                        <p>총 2,000분을 선정하여 교사용/학생용 교재와 노트를 보내드리며, 설문 우수자 110분께는 맛있는 선물을 드립니다.</p>
                        <ul>
                            <li>신청 기간: 2021.01.25(월) ~ 02.02(화)</li>
                            <li>당첨 발표: 2021.02.05(금)</li>
                            <li>당첨 선물: 교재별 500명 추첨 교사용+학생용 교재 & Full수록 노트 + 설문우수자 10명 BHC 치킨 세트, 설문 우수자 100명 스타벅스 아메리카노 Tall</li>
                         </ul>
                        <strong>이벤트 진행 단계</strong>
                        <ol>
                            <li>당첨 문자 확인(2/5)</li>
                            <li>교재수령(~2/20)</li>
                            <li>교재 체험(2/20~)</li>
                            <li>모바일 설문조사(2/22 ~ 3/3)</li>
                            <li>설문 우수자 상품 수령(3/5)</li>
                        </ol>
                        <span>설 연휴 이후 2월 17일부터 배송이 시작됩니다.</span>
                        <span>2월 22일(월) 설문조사 안내 SMS를 발송합니다.</span>
                        <span>비바샘 공지사항을 통해 2월 5일(금)에 당첨자를, 3월 5일(금)에 설문 우수자를 발표합니다.</span>
                    </div>
                </div>

                <div className="evtCont02">
                    <h2><img src="/images/events/2021/event210125/img02.jpg" alt="Full수록 소개" /></h2>
                    <div className="blind">
                        <ul>
                            <li><strong>수능 필수 기출 문제</strong> 완벽 탑재!</li>
                            <li><strong>30일 완성</strong>의 체계적인 학습 플랜 제시</li>
                            <li>개념 정리 후 <strong>유형별 문제 마스터</strong> 구성</li>
                            <li><strong>단계별 문제 풀이</strong>와 상세한 해설</li>
                        </ul>
                        <p>&lt;Full수록 교재 라인업&gt;</p>
                        <ul>
                            <li>국어 : 독서 기본 / 문학 기본 / 독서 / 문학 / 화법과 작문</li>
                            <li>영어 : 독해 기본 / 독해 / 어법·어휘</li>
                            <li><strong>수학 : 수학I / 수학II / 확률과 통계 / 미적분</strong></li>
                            <li>사회 : 한국 지리 / 생활과 윤리 / 사회·문화</li>
                            <li>과학 : 물리학I / 화학I / 생명과학I / 지구과학I</li>
                        </ul>
                    </div>
                    <div className="btnWrap">
                        <a href="https://dn.vivasam.com/VS/EBOOK/FULL%EC%88%98%EB%A1%9D%EC%88%98%ED%95%99_202101/index.html" target="_blank" title="새창열림" className="btnPreview"><span className="blind">미리보기</span></a>
                    </div>
                </div>

                <div className="evtCont03">
                    <h2><img src="/images/events/2021/event210125/evt_tit.png" alt="Full수록 과목 선택하기" /></h2>
                    <div className="evtWrap">
                        <div className="evtRdoWrap">
                            <span className="infoTxt">※1인 1과목 선택 가능</span>
                            <div className="rdoWrap">
                                <span className="rdo"><input type="radio" name="rdo" id="rdo01" value="수학I" checked={this.state.arrContent[0]} onChange={this.contentOnClick.bind(this, 0)}/><label for="rdo01">수학I</label></span>
                                <span className="rdo"><input type="radio" name="rdo" id="rdo02" value="수학II" checked={this.state.arrContent[1]} onChange={this.contentOnClick.bind(this, 1)}/><label for="rdo02">수학II</label></span>
                                <span className="rdo"><input type="radio" name="rdo" id="rdo03" value="확률과통계" checked={this.state.arrContent[2]} onChange={this.contentOnClick.bind(this, 2)}/><label for="rdo03">확률과통계</label></span>
                                <span className="rdo"><input type="radio" name="rdo" id="rdo04" value="미적분" checked={this.state.arrContent[3]} onChange={this.contentOnClick.bind(this, 3)}/><label for="rdo04">미적분</label></span>
                            </div>
                        </div>
                        <div className="evtCont">
                            <div className="evtTitWrap">
                                <p className="evtTit">Full수록 교재를 받고 싶은 이유를 작성해 주세요.</p>
                                <p className="count">(<span className="reasonCount">{this.state.contentLength}</span>/500)</p>
                            </div>
                            <div className="reasonWrap">
                                <div className="evtTextarea">
                                    <textarea 
                                        name="applyContent"
                                        id="applyContent" 
                                        placeholder="500자 이내로 입력해 주세요."
                                        onFocus={this.focusApplyContent}
                                        value={this.state.applyContent}
                                        onChange={this.setApplyContent}
                                        maxLength="500"
                                    ></textarea>
                                </div>
                                <div className="btnWrap">
                                    <button type="button" onClick={ this.eventApply }><img src="/images/events/2021/event210125/btn_apply.png" alt="신청하기" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="evtListWrap">
                        <EventList eventlists={ this.state.eventAnswerContents } loginInfo={ this.state.StoryLogInInfo } StoryUpdateContents={ this.state.StoryUpdateContents } />
                        <button type="button" className="btnMore" style={{ display : this.state.eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>더보기</button>
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
                <strong>{ this.state.eventName } 선생님</strong>
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