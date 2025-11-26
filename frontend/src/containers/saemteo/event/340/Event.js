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
        data: [
            {id: 1, valTxt: 'gift01', labelTxt: '학교로 가는 커피차', selNum: '5'},
            {id: 2, valTxt: 'gift02', labelTxt: '더블 아이스크림', selNum: '30'},
            {id: 3, valTxt: 'gift03', labelTxt: '보조배터리', selNum: '50'},
        ],
        StoryPageNo : 1, // 페이지
        StoryPageSize : 10, // 사이즈
        eventAnswerContents : [], // 응답
        eventAnswerCount : 0, // 해당 이벤트 응답 수
        StoryLogInInfo : this.props.loginInfo, // 접속 정보
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        applyContent : '',
        onRdoValue: '',
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

                const {applyContent, onRdoValue} = this.state;
                if (applyContent.length === 0) {
                    common.error("내용을 입력해 주세요.");
                    return;
                }

                if (onRdoValue.length === 0) {
                    common.error("나만의 충전 아이템을 선택해 주세요.");
                    return;
                }

                const eventAnswer = {
                    applyContent : applyContent,
                    onRdoValue : onRdoValue
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

            if (e.target.value.length > 20) {
                common.info("글자는 20자까지 입력 가능합니다.");
            } else {
                this.setState({
                    contentLength: e.target.value.length,
                    applyContent: e.target.value
                });
            }
        }
    };

    onRdoValue = (e) => {
        const { logged, history, BaseActions, loginInfo} = this.props;
        const { data } = this.state;
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

            this.setState({
                onRdoValue: e.target.value
            });
        }
    }

    render () {
        const { applyContent, data } = this.state
        return (
			<section className="event210413">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210413/img01.png" alt="선생님도 충전이 필요해!" /></h1>
                    <div className="blind">
                        <p>선생님이 만든 선생님을 위한 이벤트. 비바샘 X 선생님 이벤트의 탄생 2탄</p>
                        <p>이미 봄의 중턱! 선생님의 마음 충전을 위해 필요한 것은 무엇인가요?</p>
                        <p>친구들과의 수다, 얼음이 톡 내려앉는 달달한 커피, 우연히 만난 책 속의 한 줄까지 선생님의 충전 아이템을 다른 분들과 나눌 수 있다면 어떨까요?</p>
                        <span>참여 기간: 2021년 4월 13일 화요일부터 4월 30일 금요일까지</span>
                        <span>당첨자 발표: 2021년 5월 4일 화요일</span>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="evtCont">
                        <strong className="evtTit">선생님에게 충전이 필요한 순간은 언제인가요?</strong>
                        <div className="evtTextarea">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                placeholder="충전이 필요한 순간을 입력해 주세요."
                                value={ applyContent }
                                onChange={ this.setApplyContent }
                                maxLength="20"
                            ></textarea>
                        </div>
                    </div>
                    <div className="evtCont">
                        <strong className="evtTit">나만의 충전 아이템을 선택해 주세요!</strong>
                        <div className="evtRdoWrap">
                            {
                                data.map((item, idx) => {
                                    return (
                                        <div key={`evtRdo${idx}`} className="rdoItem">
                                            <input type="radio" name="rdo" id={`rdo0${idx + 1}`} value={ item.labelTxt } onChange={ this.onRdoValue } />
                                            <label htmlFor={`rdo0${idx + 1}`}>{ item.labelTxt }<span className="labelNum">{ item.selNum }명</span></label>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <ul className="evtInfoList">
                        <li><strong>커피차는 선생님의 학교로</strong>, 에너지 충전 메시지를 달고 달려갑니다.</li>
                        <li>학교 정문/후문/운동장 등 <strong>커피차가 잠시 머물 공간</strong>이 있어야 해요.</li>
                        <li>당첨된 후, 학교와 선생님의 사정상 커피차 출입이 어려울 경우,<br />다른 선생님께 당첨 기회가 돌아갑니다.</li>
                    </ul>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">참여하기</span></button>
                    </div>
                </div>

                <div className="evtCont03">
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
        let eventSetContents1 = eventSetContents.split('^||^')[1];

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents1 : eventSetContents1
        });
    };

    render(){
        return (
            <div className="listItem">
                <strong>{this.state.eventName} 선생님</strong>
                <p className="txt" dangerouslySetInnerHTML = {{__html: this.state.eventContents1}}></p>
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
