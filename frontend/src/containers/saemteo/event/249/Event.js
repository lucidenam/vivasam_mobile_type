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
            StoryLogInInfo : this.props.loginInfo // 접속 정보
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
            this.setState({
                storyContents : e.target.value ,
                storyLength : e.target.value.length
            });
        }
    };

    // 사연 신청하기
    insertApplyForm = async () => {
        const { event, eventId, loginInfo, history, answerPage,  SaemteoActions, PopupActions, BaseActions } = this.props;
        if(this.state.StoryCheck == ""){
            common.info("테마를 선택해주세요.");
            return;
        }
        if(this.state.agreeCheck == 0){
            common.info("개인정보 수집 및 이용에 동의해 주세요.");
            return;
        }
        if(this.state.storyLength == 0){
            common.info("사연을 남겨주세요");
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
            common.info("사연을 남겨주세요");
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
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            history.push("/myInfo");
        }

    };


    render () {
        return (
            <section className="event190410">
                <h1><img src="/images/events/2019/event190410/img01.jpg" alt="제7회 비상교과서 선생님 어워드" /></h1>
                <p className="img"><img src="/images/events/2019/event190410/img02.jpg" alt="" /></p>
                <div className="blind">
                    <p>올해로 일곱 번째를 맞는 특별한 시상식에 선생님의 따뜻한 이야기를 들려주세요. 한결같은 열정으로 즐거운 수업을 만들어 주시는 선생님께 비상교과서가 존경의 마음을 담은 선물을
                        보내 드립니다.</p>
                    <dl>
                        <dt>참여 기간</dt>
                        <dd>2019년 4월 10일 ~ 5월 3일</dd>
                        <dt>당첨 발표</dt>
                        <dd>2019년 5월 7일, 비바샘 공지사항</dd>
                    </dl>
                    <dl>
                        <dt>각 1명 (총 5명)</dt>
                        <dd>상패 + 백화점 상품권(5만원) 테마별 우수 사연 선정</dd>
                        <dt>20명</dt>
                        <dd>휴대용 보조 배터리 (5200mAh)</dd>
                        <dt>50명</dt>
                        <dd>스타벅스 카페라떼 기프티콘</dd>
                    </dl>
                </div>

                <div className="cont">
                    <h2 className="blind">선생님의 학생 지도 스타일에 <strong>가장 어울리는 테마를 선택</strong> 후 테마와 관련된 선생님의 사연을 적어주세요.</h2>
                    <ul className="radio_list">
                        <li className="radio_01">
                            <input
                                type="radio"
                                id="award1"
                                name="award"
                                value="꼼꼼이 선생님"
                                checked={this.state.StoryCheck === '꼼꼼이 선생님'}
                                onChange={this.onStoryChange}
                            />
                            <label htmlFor="award1">꼼꼼이 선생님 <span className="blind">소외된 학생이 없도록 세심하게 보살펴 주시는 선생님</span></label>
                        </li>
                        <li className="radio_02">
                            <input
                                type="radio"
                                id="award2"
                                name="award"
                                value="다정다감 선생님"
                                checked={this.state.StoryCheck === '다정다감 선생님'}
                                onChange={this.onStoryChange}
                            />
                            <label htmlFor="award2">다정다감 선생님 <span className="blind">따뜻한 마음으로 학생들과 가까이에서 소통해 주시는 선생님</span></label>
                        </li>
                        <li className="radio_03">
                            <input type="radio"
                                   id="award3"
                                   name="award"
                                   value="얼리어답터 선생님"
                                   checked={this.state.StoryCheck === '얼리어답터 선생님'}
                                   onChange={this.onStoryChange}
                            />
                            <label htmlFor="award3">얼리어답터 선생님 <span className="blind">학생들의 눈높이에 맞춰 스마트한 수업을 이끄시는 선생님</span></label>
                        </li>
                        <li className="radio_04">
                            <input
                                type="radio"
                                id="award4"
                                name="award"
                                value="모험가 선생님"
                                checked={this.state.StoryCheck === '모험가 선생님'}
                                onChange={this.onStoryChange}
                            />
                            <label htmlFor="award4">모험가 선생님 <span className="blind">창의적인 수업과 다양한 활동을 만들어 주시는 선생님</span></label>
                        </li>
                        <li className="radio_05">
                            <input
                                type="radio"
                                id="award5"
                                name="award"
                                value="멘토 선생님"
                                checked={this.state.StoryCheck === '멘토 선생님'}
                                onChange={this.onStoryChange}
                            />
                            <label htmlFor="award5">멘토 선생님 <span className="blind">학생들의 고민에 진심 어린 조언을 해주시는 선생님</span></label>
                        </li>
                    </ul>

                    <div className="agree">
                        <h3>개인정보 수집 및 이용 동의</h3>
                        <ul>
                            <li>이용목적 : 경품 배송 및 고객문의 응대</li>
                            <li>수집하는 개인정보 : 성명, 휴대전화번호</li>
                            <li>개인정보 보유 및 이용기간 :2019년 5월 7일까지<br />(이용목적 달성 시 즉시 파기)</li>
                            <li><em>하나의 테마에만 참여하실 수 있으며</em>, 테마별 선물은 상기 이미지와 다를 수 있습니다.</li>
                            <li>주소 및 연락처 기재 오류로 반송된 선물은 재발송되지 않았습니다. 개인 정보를 꼭 확인해주세요.<br /><a className="btn_myinfo" onClick={this.checkMemberAddress}>내 주소/연락처 확인 ▶</a></li>
                            <li>선물 발송을 위해 개인정보(성명/주소/연락처)가 배송업체에 제공됩니다.<br />(CJ대한통운㈜-사업자등록번호: 110-81-05034 /<br/>㈜다우기술-사업자번호: 220-81-02810)</li>
                        </ul>
                    </div>
                    <div className="agree_check">
                        <input
                            type="checkbox"
                            name="agreeCheck"
                            id="agreeCheck"
                            ref="agreeCheck"
                            checked={this.state.agreeCheck == 1}
                            onChange={this.updateAgreeCheckChange}
                        />
                        <label htmlFor="agreeCheck">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                    </div>

                    <div className="msg_box">
                        <div className="msg">
                            <div className="bgbox">
                                <textarea
                                    name="applyContent"
                                    id="applyContent"
                                    cols="1"
                                    rows="10"
                                    maxLength="200"
                                    value={this.state.storyContents}
                                    onChange={this.insertApplyContent}
                                    placeholder="선생님의 사연을 적어주세요.">
                                </textarea>
                                <p className="count">(<span>{this.state.storyLength}</span>/200)</p>
                            </div>
                            <button className="btn_submit"  id="eApply" type="button" onClick={this.insertApplyForm} >사연 남기기</button>
                        </div>
                    </div>
                </div>

                <div className="list_wrap">
                    <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents} deleteCommentChange={this.deleteCommentChange} updateCommentChange={this.updateCommentChange}/>
                    <button className="btn_full_on btn_more"  style={{ visibility : this.state.eventAnswerCount ? 'visible' : 'hidden' }} onClick={this.commentListAddAction}>더보기</button>
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

        eventSetContents = eventSetContents.replace(/\\n/gi, ' ');

        this.setState({
            eventType : eventTypeArray,
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents : eventSetContents
        });

    };

    eventListType = () => { // Type 출력
        if(this.state.eventType == "다정다감 선생님"){
            return(
                <strong className="type1">다정다감 선생님</strong>
            );
        }else if(this.state.eventType == "얼리어답터 선생님"){
            return(
                <strong className="type2">얼리어답터 선생님</strong>
            );
        }else if(this.state.eventType == "꼼꼼이 선생님"){
            return(
                <strong className="type3">꼼꼼이 선생님</strong>
            );
        }else if(this.state.eventType == "모험가 선생님"){
            return(
                <strong className="type4">모험가 선생님</strong>
            );
        }else {
            return (
                <strong className="type5">멘토 선생님</strong>
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
                    <p>{this.state.eventContents}</p>
                )
            }else{
                return (
                    <div className="msg">
                        <textarea id="applyUpdateContent" maxLength="200" onChange={this.insertApplyContentChild} >{this.state.eventContents}</textarea>
                        <button className="btn_submit" onClick={this.updateCommentChangeChild}>수정하기</button>
                    </div>
                )
            }
        }else{ // 접속ID와 이벤트 ID가 다른 경우
            return (
                <p>{this.state.eventContents}</p>
            )
        }
    };

    render(){
        return (
            <li>
                {this.eventListType()}
                <div>
                    <span className="uid">{this.state.eventName}</span><span className="date">{this.state.eventRegDate}</span>
                </div>
                {this.eventUpdateType()}
                {this.eventUpdateContents()}
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

