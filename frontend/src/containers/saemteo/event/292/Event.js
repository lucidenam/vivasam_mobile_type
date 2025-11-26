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

// 해당 댓글 정보를 가져올 수 있는지 테스트 시작
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
            eventViewAddButton : 0 // 더보기 ( 1 : 보임 / 0 : 안보임 )
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

    // 댓글 수정
    updateCommentChange  = async (eventType, eventContents, eventLength) => {
        const { event, eventId, loginInfo, SaemteoActions, BaseActions } = this.props;
        if(eventLength == 0){
            common.info("테마에 맞는 사연을 남겨주세요.");
            return;
        }
        try {
            event.eventId = eventId; // 이벤트 ID
            event.memberId = loginInfo.memberId; // 멤버 ID
            event.eventAnswerDesc = "[" + eventType + "] " + eventContents; // 질문 응답
            event.eventAnswerSeq = 1; // 질문 응답 순서 - 수정이기 때문에 1 고정
            let response = await SaemteoActions.setEventAnswerUpdate({...event});
            if(response.data.code === '0'){
                common.info("수정이 완료되었습니다.");
                // 새로고침이 구현되어 있지 않으므로 값을 직접 넣어주어야 합니다.
                // 값 선택 및 응답 수정
                this.setState({
                    StoryCheck : "",
                    agreeCheck : 0,
                    agreeCheckNote : 0,
                    storyLength : 0,
                    storyContents : "",
                    StoryPageNo : 1, // 페이지
                    StoryPageSize : 10, // 사이즈
                    eventAnswerContents : [] // 응답
                });
                this.commentConstructorList();
                this.checkEventCount();
            }
            else{
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

    };

    // 댓글 삭제
    deleteCommentChange  = async () => {
        const { event, eventId, loginInfo, history,  SaemteoActions, PopupActions, BaseActions } = this.props;
        try {
            event.eventId = eventId; // 이벤트 ID
            event.memberId = loginInfo.memberId; // 멤버 ID
            let response = await SaemteoActions.setEventAnswerDelete({...event});
            if(response.data.code === '0'){
                // 삭제가 완료되었을시 갱신
                common.error("삭제가 완료되셨습니다.");
                this.setState({
                    StoryCheck : "",
                    agreeCheck : 0,
                    agreeCheckNote : 0,
                    storyLength : 0,
                    storyContents : "",
                    StoryPageNo : 1, // 페이지
                    StoryPageSize : 10, // 사이즈
                    eventAnswerContents : [] // 응답
                });
                this.commentConstructorList();
                this.checkEventCount();
            }
            else{
                common.error("삭제가 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    // 내 주소 / 정보 확인
    checkMemberAddress  = () => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 정보를 확인해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            history.push("/myInfo");
        }

    };

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 신청하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 로그인시
            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청하셨습니다.");
                }else if(response.data.code === '0'){
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

    render () {
        return (
            <section className="event200424">
                <h1><img src="/images/events/2020/event200424/mobile_img01.jpg" alt="오늘은 꽃, 말을 전하는 날"/></h1>
                <div className="blind">
                    <h4>오늘은 꽃, 말을 전하는 날</h4>
                    <p>비바샘이 전국 100명의 선생님께 꽃 10송이를 전해드립니다.
                        1송이는 선생님을 위해, 9송이는 선생님이 마음을 나누고 싶은 분들께 선물하세요.</p>
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2020.04.29 ~ 05.05</dd>
                    </dl>
                    <p>* 재직 학교가 위치한 지역 꽃집에서 장미꽃 10송이를 보내드립니다.</p>
                </div>
                <div className="btn_wrap">
                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}><img
                        src="/images/events/2020/event200424/btn_apply.jpg" alt="신청하기"/></button>
                </div>

                <div className="cont comment_wrap">
                    <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents} deleteCommentChange={this.deleteCommentChange} updateCommentChange={this.updateCommentChange}/>
                    <button className="btn_full_on btn_more"  style={{ visibility : this.state.eventViewAddButton == 1 ? 'visible' : 'hidden' }} onClick={this.commentListAddAction}>더보기</button>
                </div>
            </section>
        )
    }
}

// 리스트 목록 UL 출력
const EventList = ({eventlists, loginInfo , StoryUpdateContents, deleteCommentChange, updateCommentChange}) => {
    const eventList = eventlists.map(eventList => {
        return (<EventListApply {...eventList} loginInfo={loginInfo} StoryUpdateContents={StoryUpdateContents} deleteCommentChange={deleteCommentChange} updateCommentChange={updateCommentChange}/>);
    });
    return (
        <ul className="list">
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
            eventLength : "", // 이벤트 길이
            eventUpdateCheck : 0, // 수정 모드
            isButtonVisible : 0, // 버튼 Visual
            deleteCommentChange : this.props.deleteCommentChange, // 삭제
            updateCommentChange : this.props.updateCommentChange // 수정
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

        eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents : eventSetContents
        });

    };

    //버튼 표시 설정
    eventUpdateVisualButton = () => {
        this.setState({
            isButtonVisible : !this.state.isButtonVisible
        })
    };

    //수정 - 수정취소 버튼 표시 설정
    eventUpdateCheckButton = () =>{
        this.setState({
            eventUpdateCheck : !this.state.eventUpdateCheck,
            isButtonVisible : 0
        })
    };

    // 이벤트 수정 시 내용 입력
    insertApplyContentChild = (e) => {
        this.setState({
            eventContents : e.target.value,
            eventLength : e.target.value.length
        });
    };

    // 이벤트 수정 - 부모 함수 호출
    updateCommentChangeChild = () => {
        this.state.updateCommentChange(this.state.eventType, this.state.eventContents , this.state.eventLength);
    };

    render(){
        return (
            <li>
                <span className="comment" dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></span>
                <div className="author">
                    <span className="user_nickname">{this.state.eventName}</span>
                    <span className="date">{this.state.eventRegDate}</span>
                </div>
            </li>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
