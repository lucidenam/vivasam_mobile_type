import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
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
        event.eventAnswerSeq = 1; // 해당 이벤트 Seq는 1
        event.memberId = loginInfo.memberId; // 멤버 ID
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;
        if(this.state.eventAnswerCount < this.state.StoryPageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }
        this.setState({
            eventAnswerContents : responsedata,
            StoryPageSize : this.state.StoryPageSize + 5,
        });
    };

    // 사연 신청하기 시작
    // 사연 선택
    // 라디오 버튼 체크 값 수정
    onStoryChange = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                StoryCheck: e.currentTarget.value
            });
        }
    };

    // 개인정보 선택
    updateAgreeCheckChange = () => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                agreeCheck:!this.state.agreeCheck
            });
        }
    };

    // 사연 입력하기
    insertApplyContent = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
             if(e.target.value.length > 300) {
                common.info("300자 이내로 입력해 주세요.");
            }else {
                this.setState({
                    storyContents: e.target.value,
                    storyLength: e.target.value.length
                });
            }
        }
    };


    // 사연 입력하기
    insertUpdateMember = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 변경해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:"/myInfo"});
            history.push("/login");
        }else{
          //  https://m.vivasam.com/#/myInfo

            history.push("/myInfo");
        }
    };

    // 사연 신청하기
    insertApplyForm = async () => {
        const { logged, event, eventId, loginInfo, history, answerPage,  SaemteoActions, PopupActions, BaseActions } = this.props;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return;
        }
        if(this.state.agreeCheck == 0){
            common.info("개인정보 수집 및 이용에 동의해 주세요.");
            return;
        }

        if(this.state.StoryCheck == ""){
            common.info("문구를 선택해주세요.");
            return;
        }

        if(this.state.storyLength == 0){
            common.info("착한 비누를 신청하시는 사연을 입력해주세요.");
            return;
        }
        try {
            event.eventId = eventId; // 이벤트 ID
            event.memberId = loginInfo.memberId; // 멤버 ID
            event.eventAnswerDesc = "[" + this.state.StoryCheck + "] " + this.state.storyContents; // 질문 응답
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
                event.eventAnswerDesc = this.state.StoryCheck; // 질문 응답
                event.eventAnswerSeq = 2;
                response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
                // 새로고침이 구현되어 있지 않으므로 값을 직접 넣어주어야 합니다.
                // 값 선택 및 응답 수정
                this.setState({
                    StoryCheck : "",
                    agreeCheck : 0,
                    storyLength : 0,
                    storyContents : "",
                    StoryPageNo : 1, // 페이지
                    StoryPageSize : 10, // 사이즈
                    eventAnswerContents : [] // 응답
                });
                let response = await SaemteoActions.insertEventApply({...event});
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
    // 사연 신청하기 끝

    // 댓글 더보기
    commentListAddAction  = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 댓글 수정
    updateCommentChange  = async (eventType, eventContents, eventLength) => {
        const { event, eventId, loginInfo, SaemteoActions, BaseActions } = this.props;
        if(eventLength == 0){
            common.info("착한 비누를 신청하시는 사연을 남겨주세요.");
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
            BaseActions.pushValues({type:"returnUrl", object:"/myInfo"});
            history.push("/login");
        }else{
            history.push("/myInfo");
        }

    };


    render () {
        return (
            <section className="event200514">
                <h1><img src="/images/events/2020/event200514/img01.jpg" alt="뽀득뽀득 손 씻는 우리 반" /></h1>
                <a  className="btn_myinfo"    onClick={this.checkMemberAddress}><span className="blind">개인정보 수정하기</span> </a>
                <div className="blind">
                    어느 때보다 손 씻기가 중요한 요즘, 다시 학교 생활을 시작할 학생들을 위해 비바샘이 착한 비누를 선물합니다.
                    <dl>
                        <dt>참여 기간</dt>
                        <dd>2020년 5월 26일(화) ~ 6월 3일(수)</dd>
                        <dt>당첨자 발표</dt>
                        <dd>2020년 6월 5일(금)</dd>
                    </dl>
                    <dl>
                        <dt>당첨 선물</dt>
                        <dd>착한 비누 1개 + 거품방 (500명)</dd>
                        <dd>사회적 기업 '동구밭'의 발달장애인들이 직접 만든 천연 비누입니다. (비누 종류는 무작위발송)</dd>
                        <dd>※ 선물은 개인정보에 기재된 ‘학교 주소’로 배송되니, 개인정보를 꼭 확인해 주세요.</dd>
                    </dl>
                    <dl>
                        <dt>참여 방법</dt>
                        <dd>STEP1, 비누에 거는 태그를 드립니다. 우리반 아이들을 위한 문구를 선택하세요.</dd>
                        <dd>STEP2, 착한 비누를 신청하시는 사연을 적어 주세요.</dd>
                    </dl>
                </div>

                <div className="cont">
                    <div className="agree">
                        <h3>개인정보 수집 및 이용 동의</h3>
                        <ul>
                            <li>이용목적 : 경품 배송 및 고객문의 응대</li>
                            <li>수집하는 개인정보 : 성명, 휴대전화번호, 학교 주소</li>
                            <li>개인정보 보유 및 이용기간 : 2020년 6월 30일까지, 이용목적 달성 시 즉시 파기</li>
                            <li>주소 및 연락처 기재 오류로 반송된 선물은 재발송되지 않습니다. 개인 정보를 꼭 확인해주세요.</li>
                            <li>선물 발송을 위해 개인정보(성명/주소/연락처)가 배송업체에 제공됩니다.<br/>
                                (㈜한진 사업자등록번호 201-81-02823)</li>
                        </ul>
                        <p>* 선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                    </div>
                    <div className="agree_check">
                        <input
                            type="checkbox"
                            name="agreeCheck"
                            id="agreeCheck"
                            ref="agreeCheck"
                            checked={this.state.agreeCheck  == 1}
                            onChange={this.updateAgreeCheckChange}
                        />
                        <label htmlFor="agreeCheck">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                    </div>
                </div>
                <div className="cont">
                    <h2><img src="/images/events/2020/event200514/img02.jpg" alt="문구를 선택하세요!" /></h2>
                    <ul className="radio_list">
                        <li className="radio_01">
                            <input
                                type="radio"
                                id="award1"
                                name="award"
                                value="건강한 나, 더 행복한 오늘!"
                                checked={this.state.StoryCheck === '건강한 나, 더 행복한 오늘!'}
                                onChange={this.onStoryChange}
                            />
                            <label htmlFor="award1">건강한 나, 더 행복한 오늘!</label>
                        </li>
                        <li className="radio_02">
                            <input
                                type="radio"
                                id="award2"
                                name="award"
                                value="거품 하나마다 예쁜 소원 빌기"
                                checked={this.state.StoryCheck === '거품 하나마다 예쁜 소원 빌기'}
                                onChange={this.onStoryChange}
                            />
                            <label htmlFor="award2">거품 하나마다 예쁜 소원 빌기</label>
                        </li>
                        <li className="radio_03">
                            <input type="radio"
                                   id="award3"
                                   name="award"
                                   value="매일매일 깨끗이, 뽀득뽀득 손 씻기"
                                   checked={this.state.StoryCheck === '매일매일 깨끗이, 뽀득뽀득 손 씻기'}
                                   onChange={this.onStoryChange}
                            />
                            <label htmlFor="award3">매일매일 깨끗이, 뽀득뽀득 손 씻기</label>
                        </li>
                    </ul>

                    <div className="msg_box">
                        <div className="msg">
                            <p className="count"><span>{this.state.storyLength}</span>/300</p>
                            <div className="bgbox">
                                <textarea
                                    name="applyContent"
                                    id="applyContent"
                                    cols="1"
                                    rows="10"
                                    maxLength="300"
                                    value={this.state.storyContents}
                                    onChange={this.insertApplyContent}
                                    placeholder="착한 비누를 신청하시는 사연을 적어주세요. (300자 이내)">
                                </textarea>

                            </div>
                            <button className="btn_submit"  id="eApply" type="button" onClick={this.insertApplyForm} >등록하기</button>
                        </div>
                    </div>
                </div>

                <div className="list_wrap">
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

        let eventTypeArray =  eventSetContents.split("]");
        eventSetContents = eventTypeArray[1];
        eventTypeArray = eventTypeArray[0].split("[");
        eventTypeArray = eventTypeArray[1].split(",");

        eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

        this.setState({
            eventType : eventTypeArray,
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents : eventSetContents
        });

    };

    eventListType = () => { // Type 출력
        if(this.state.eventType == "건강한 나, 더 행복한 오늘!"){
            return(
                <strong className="type1">건강한 나, 더 행복한 오늘!</strong>
            );
        }else if(this.state.eventType == "거품 하나마다 예쁜 소원 빌기"){
            return(
                <strong className="type2">거품 하나마다 예쁜 소원 빌기</strong>
            );
        }else {
            return (
                <strong className="type3">매일매일 깨끗이, 뽀득뽀득 손 씻기</strong>
            );
        }
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

    eventUpdateType = () => { /* 이벤트 댓글 Update 버튼 수정 */
        let eventLoginInfoId = JSON.stringify(this.state.loginInfo.memberId).replace(/\"/g,"");
        if(this.state.member_id == eventLoginInfoId){ // 초기 화면
            if(this.state.eventUpdateCheck == 0){
                return (
                    <div className="btns">
                        <button className="btn_edit_control" onClick={this.eventUpdateVisualButton}><span className="blind">수정/삭제</span></button>
                        <ul className="btn_control" style={{display: this.state.isButtonVisible ? 'block' : 'none' }}>
                            <li>
                                <button className="btn_edit" onClick={this.eventUpdateCheckButton}>수정</button>
                            </li>
                            <li>
                                <button className="btn_edit" onClick={this.state.deleteCommentChange}>삭제</button>
                            </li>
                        </ul>
                    </div>
                )
            }else{ // 수정할 경우
                return (
                    <div className="btns">
                        <button className="btn_edit_control" onClick={this.eventUpdateVisualButton}><span className="blind">수정/삭제</span></button>
                        <ul className="btn_control" style={{display: this.state.isButtonVisible ? 'block' : 'none' }}>
                            <li>
                                <button className="btn_edit" onClick={this.eventUpdateCheckButton}>수정취소</button>
                            </li>
                            <li>
                                <button className="btn_edit" onClick={this.state.deleteCommentChange}>삭제</button>
                            </li>
                        </ul>
                    </div>
                )
            }
        } //아이디가 다를시
        else{
        }
    };

    // 이벤트 컨텐츠 츌력
    eventUpdateContents = () => {
        let eventLoginInfoId = JSON.stringify(this.state.loginInfo.memberId).replace(/\"/g,""); // 접속 ID
        // 초기 화면
        // 접속아이디와 수정아이디가 같을 경우
        if(this.state.member_id == eventLoginInfoId){
            if(this.state.eventUpdateCheck == 0){
                return (
                    <p dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>
                )
            }else{
                return (
                    <div className="msg">
                        <textarea id="applyUpdateContent" maxLength="200" onChange={this.insertApplyContentChild}>{this.state.eventContents}</textarea>
                        <button className="btn_submit" onClick={this.updateCommentChangeChild}>수정하기</button>
                    </div>
                )
            }
        }else{ // 접속ID와 이벤트 ID가 다른 경우
            return (
                <p dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>
            )
        }
    };

    render(){
        return (
            <li>
                {this.eventListType()}
                <p>
                    {this.eventUpdateType()}
                    {this.eventUpdateContents()}
                </p>
                <div>
                    <span className="uid">{this.state.eventName}</span><span className="date">{this.state.eventRegDate}</span>
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

