import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{

    state = {
        isEventApply: false,
    }

    constructor(props) {
        super(props);
        this.state = {
            StoryCheck : "", // 선택한 선생님
            agreeCheck : 0, // 개인정보 체크
            agreeCheckNote : 0, // 유의사항 체크
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
            await this.commentConstructorList(); // 댓글 목록 조회
            await this.checkEventCount();   // 이벤트 참여자 수 조회

        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const { event, SaemteoActions } = this.props;
        let response = await SaemteoActions.checkEventTotalJoin({...event});

        this.setState({
            eventAnswerCount : response.data.eventAnswerCount
        });

        // 최초 조회시 전체건수가 10건이상이면 더보기 버튼 표시
        if(this.state.eventAnswerCount > 10){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };

    setApplyName = (e) => {
        if (e.target.value.length > 20) {
            common.info("단어는 20자까지 입력 가능합니다.");
        } else {
            this.setState({
                applyName: e.target.value
            });
        }
    };

    setApplyContent = (e) => {
        if (e.target.value.length > 200) {
            common.info("200자 이내로 입력해 주세요.");
        } else {
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

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.eventAnswerCount < this.state.StoryPageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 조회가 완료되면 다음 조회할 건수 설정
        this.setState({
            eventAnswerContents : responsedata,
            StoryPageSize : this.state.StoryPageSize + 5,
        });

    };

    // 댓글 더보기
    commentListAddAction  = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
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
                    common.error("이미 참여하셨습니다");
                    return false;
                }

                const {applyContent, applyName} = this.state;
                if (applyName.length === 0) {
                    common.error("급훈을 입력해 주세요");
                    return;
                }
                if (applyContent.length === 0) {
                    common.error("급훈을 정한 이유나 의미를 작성해주세요.");
                    return;
                }

                const eventAnswer = {
                    applyName : applyName,
                    applyContent : applyContent
                };

                SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                handleClick(eventId);

            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    render () {
        const { applyName, applyContent } = this.state
        return (
			<section className="event210310">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210310/img01.png" alt="비바샘과 함께하는 우리 반 급훈 만들기" /></h1>
                    <div className="blind">
                        <p>선생님이 만든 선생님을 위한 이벤트. 비바샘 X 선생님 이벤트의 탄생 1탄</p>
                        <p>새 학기 급훈, 비바샘과 함께 만들어요! 우리 반 아이들과 공유하고픈 급훈을 올려주시면, 비바샘에서 멋진 급훈 액자를 만들어 드립니다.</p>
                        <span>참여 기간: 2021년 3월 10일 수요일부터 4월 7일 수요일까지</span>
                        <span>당첨자 발표: 매주 목요일</span>
                        <span>당첨선물: 1. 매주 10명 톡톡 튀는 급훈을 남겨주신 분께 급훈액자를 만들어 드립니다. 급훈 액자 제작에 10일정도 소요됩니다. 2. 매주 50명 추첨을 통해 따뜻한 커피를 보내드려요. 목요일 오후에 기프티콘을 발송합니다.</span>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="evtTit">
                        <h2><span className="blind">2021 우리 반의 특별한 급훈을 남겨주세요!</span></h2>
                    </div>
                    <div className="evtCont">
                        <div className="evtInput">
                            <input type="text" placeholder="급훈을 입력해주세요. [20자 이내]" value={ applyName } onChange={ this.setApplyName } />
                        </div>
                        <div className="evtTextarea">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                placeholder="급훈을 정한 이유나 의미를 작성해주세요. [200자 이내]"
                                value={ applyContent }
                                onChange={ this.setApplyContent }
                                maxLength="200"
                            ></textarea>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply }><img src="/images/events/2021/event210310/btn_apply.png" alt="참여하기" /></button>
                        </div>
                    </div>
                    <p className="evtInfoTxt"><img src="/images/events/2021/event210310/info_txt.png" alt="비바샘 x 선생님 이벤트의 탄생 1탄에 유의미한 아이디어를 주신 선생님 감사합니다." /></p>
                </div>

                <div className="evtCont03">
                    <h2>신청 시 유의사항</h2>
                    <ul>
                        <li>1인 1회 참여하실 수 있습니다.</li>
                        <li>한번 참여하시면 이벤트 종료 시까지 참여 내역이 유지됩니다.</li>
                        <li>급훈 액자에 당첨되신 선생님께는 제작/배송 안내를 위해 개별 연락을 드립니다.</li>
                    </ul>
                </div>

                <div className="evtCont04">
                    <div className="evtListWrap">
                        <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents}/>
                        <button type="button" className="btnMore" style={{ display : this.state.eventViewAddButton == 1 ? 'block' : 'none' }} onClick={this.commentListAddAction}>더보기</button>
                    </div>
                </div>
            </section>
        )
    }
}

// 리스트 목록 UL 출력
const EventList = ({eventlists, loginInfo , StoryUpdateContents}) => {
    const eventList = eventlists.map(eventList => {
        return (<EventListApply {...eventList}
                                key={eventList.member_id}
                                loginInfo={loginInfo}
                                StoryUpdateContents={StoryUpdateContents}/>);
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
                <strong>{this.state.eventName} 선생님</strong>
                <p className="listTit" dangerouslySetInnerHTML = {{__html: `급훈 : ${this.state.eventContents1}`}}></p>
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
