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
    /**
     * @param props
     */
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
            arrContent: [false,false,false,false,false,false,false,false,false,false,false],
            arrContentVal: ['나일론 개발','진시황릉 병마용갱 발견','서울 시내버스 등장','표트르 일리치 차이콥스키 출생','세계 우유의 날','안동 하회마을, 세계 유산 등재',
                '작가 요한 볼프강 폰 괴테 출생','곤총의 날','노인의 날','우정총국 업무 개시','노벨상 수여'],
            selContentNm: '',
            isEventApply : false
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
        if (e.target.value.length > 200) {
            common.info("200자 이내로 입력해 주세요.");
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


            let arrContent = this.state.arrContent;

            if(arrContent[index]){
                arrContent[index] = false;
            }else{
                let cnt = 0;
                for(let i=0; i<arrContent.length; i++){
                    if(arrContent[i]){
                        cnt++;
                    }
                }
                if(cnt >= 2){
                    common.info('최대 2개까지 선택 가능합니다.');
                    return false;
                }else{
                    arrContent[index] = true;
                }
            }

            //selContentNm 설정
            let selContentNm = '';
            for(let i=0; i<arrContent.length; i++){
                if(arrContent[i]){
                    if(selContentNm === ''){
                        selContentNm = this.state.arrContentVal[i];
                    }else{
                        selContentNm += ' , '+this.state.arrContentVal[i];
                    }

                }
            }
            this.setState({
                arrContent: arrContent,
                selContentNm: selContentNm
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
                        common.info("2020년 V매거진 중 가장 좋았던 테마를 선택해 주세요. 최대 2개까지 선택 가능합니다.");
                        return false;
                    }
                    if(this.state.applyContent.trim() === ''){
                        common.info("2021년 V매거진 테마를 추천해 주세요. 200자 이내로 작성 가능합니다.");
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
            <section className="event210203">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210203/img01.jpg" alt="한 번에 만나는 2020 V매거진" /></h1>
                    <div className="blind">
                        <p>* V매거진은 수업에 유용한 테마별 자료와 창의융합 수업 사례, 체험활동, 진로 자료 등을 엮은 선생님 전용 매거진입니다.</p>
                        <strong>2020년 V매거진 전권을 책자로 받아볼 수 있는 기회!</strong>
                        <p>2020년 테마 중 가장 좋았던 테마를 선택하고, 2021년 V매거진을 위한 소중한 의견을 내주시면, 추첨을 통해 총 <strong>130분께 선물</strong>을 보내 드립니다.</p>
                        <ul>
                            <li>신청 기간: 2021.02.03(수) ~ 02.19(금)</li>
                            <li>당첨 발표: 2021.02.24(수)</li>
                            <li>당첨 선물: 유익한 선물. 2020 V매거진 전권 세트 100명, 맛있는 선물. 맥도날드 오레오 맥플러리 30명</li>
                        </ul>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="evtWrap">
                        <div className="evtTit">
                            <h2 className="blind">이벤트 1. 2020년 V매거진 중 가장 좋았던 테마를 선택해 주세요.</h2>
                            <span className="blind">※ 최대 2개까지 선택 가능합니다.</span>
                        </div>
                        <div className="evtCont">
                            <div className="evtChkWrap">
                                <span className="chk"><input type="checkbox" name="chk" id="chk01" value="나일론 개발" checked={this.state.arrContent[0]} onChange={this.contentOnClick.bind(this, 0)}/><label for="chk01"><em>2020.02</em><span>나일론 개발</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk02" value="진시황릉 병마용갱 발견" checked={this.state.arrContent[1]} onChange={this.contentOnClick.bind(this, 1)}/><label for="chk02"><em>2020.03</em><span>진시황릉<br />병마용갱 발견</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk03" value="서울 시내버스 등장" checked={this.state.arrContent[2]} onChange={this.contentOnClick.bind(this, 2)}/><label for="chk03"><em>2020.04</em><span>서울 시내버스<br />등장</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk04" value="표트르 일리치 차이콥스키 출생" checked={this.state.arrContent[3]} onChange={this.contentOnClick.bind(this, 3)}/><label for="chk04"><em>2020.05</em><span>표트르 일리치<br />차이콥스키 출생</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk05" value="세계 우유의 날" checked={this.state.arrContent[4]} onChange={this.contentOnClick.bind(this, 4)}/><label for="chk05"><em>2020.06</em><span>세계 우유의 날</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk06" value="안동 하회마을, 세계 유산 등재" checked={this.state.arrContent[5]} onChange={this.contentOnClick.bind(this, 5)}/><label for="chk06"><em>2020.07</em><span>안동 하회마을,<br />세계 유산 등재</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk07" value="작가 요한 볼프강 폰 괴테 출생" checked={this.state.arrContent[6]} onChange={this.contentOnClick.bind(this, 6)}/><label for="chk07"><em>2020.08</em><span>작가 요한 볼프강<br />폰 괴테 출생</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk08" value="곤총의 날" checked={this.state.arrContent[7]} onChange={this.contentOnClick.bind(this, 7)}/><label for="chk08"><em>2020.09</em><span>곤충의 날</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk09" value="노인의 날" checked={this.state.arrContent[8]} onChange={this.contentOnClick.bind(this, 8)}/><label for="chk09"><em>2020.10</em><span>노인의 날</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk10" value="우정총국 업무 개시" checked={this.state.arrContent[9]} onChange={this.contentOnClick.bind(this, 9)}/><label for="chk10"><em>2020.11</em><span>우정총국<br />업무 개시</span></label></span>
                                <span className="chk"><input type="checkbox" name="chk" id="chk11" value="노벨상 수여" checked={this.state.arrContent[10]} onChange={this.contentOnClick.bind(this, 10)}/><label for="chk11"><em>2020.12</em><span>노벨상 수여</span></label></span>
                                <a href="https://www.vivasam.com/opendata/VMagazine2018.do?deviceMode=pc" target="_blank" title="새창열림" className="btnLink">V매거진<br />자세히 보기</a>
                            </div>
                        </div>  
                    </div>
                    <div className="evtWrap">
                        <div className="evtTit">
                            <h2 className="blind">이벤트 2. 2021년 V매거진 테마를 추천해 주세요.</h2>
                            <span className="blind">※ V매거진은 계기 수업에 활용할 수 있는 흥미로운 주제를 탑재하고 있습니다.</span>
                        </div>
                        <div className="evtCont">
                            <div className="reasonWrap">
                                <p className="count">(<span className="reasonCount">{this.state.contentLength}</span>/200)</p>
                                <div className="evtTextarea">
                                    <textarea 
                                        name="applyContent"
                                        id="applyContent" 
                                        placeholder="200자 이내로 입력해 주세요."
                                        onFocus={this.focusApplyContent}
                                        value={this.state.applyContent}
                                        onChange={this.setApplyContent}
                                        maxLength="200"
                                    ></textarea>
                                </div>
                                <div className="btnWrap">
                                    <button type="button" onClick={ this.eventApply }><img src="/images/events/2021/event210203/btn_apply.png" alt="참여하기" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <div className="evtCont03">
                    <div className="evtListWrap">
                        <EventList eventlists={ this.state.eventAnswerContents } loginInfo={ this.state.StoryLogInInfo } StoryUpdateContents={ this.state.StoryUpdateContents } />
                    </div>
                    <button type="button" className="btnMore" style={{ display : this.state.eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>더보기</button>
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

        eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br />');
        eventSetContents = eventSetContents.replace(/\\n/gi, '<br />');
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