import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            agreeCheck : 0, // 개인정보 체크
            StoryPageNo : 1, // 페이지
            StoryPageSize : 10, // 사이즈
            eventAnswerContents : [], // 응답
            eventAnswerCount : 0, // 해당 이벤트 응답 수
        };
        this.commentConstructorList();
        this.checkEventCount();
    }

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

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            if(this.state.agreeCheck == 0){
                common.info("개인정보 수집 및 이용에 동의해 주세요.");
                return;
            }else{
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
        }
    };

    // 댓글 출력시 필요 시작
    // 이벤트 카운트 확인
    checkEventCount = async () => {
        const { event, eventId, SaemteoActions } = this.props;
        event.eventId = eventId; // 이벤트 ID
        let response = await SaemteoActions.checkEventTotalJoin({...event});
        this.setState({
            eventAnswerCount : response.data.eventAnswerCount
        });
    };

    // 댓글 출력
    commentConstructorList = async  () => {
        const { event, eventId, answerPage } = this.props;
        answerPage.pageNo = this.state.StoryPageNo;
        answerPage.pageSize = this.state.StoryPageSize;
        event.eventId = eventId; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 1
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;
        this.setState({
            eventAnswerContents : responsedata,
            StoryPageSize : this.state.StoryPageSize + 5,
        });
    };

    // 댓글 더보기
    commentListAddAction  = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };
    // 댓글 출력시 필요 끝

    // 개인정보 수정하기 이동

    reApplyClick = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{
            history.push("/myInfo");
        }
    };

    render () {
        return (
            <section className="event190516">
                <h1><img src="/images/events/2019/event190516/img.jpg" alt="달달한 간식 박스를 학교로 보내드립니다. 우리 반 간식 파티" /></h1>
                <div className="blind">
                    <p>학생들에게 간식 파티를 열어주고 싶은 이유를 남겨주세요. 비바샘이 달콤한 간식과 함께 특별한 추억을 선물합니다.</p>
                    <dl>
                        <dt>참여 기간</dt>
                        <dd>2019. 05. 16 (목) ~ 06. 16 (일)</dd>
                        <dt>당첨 발표</dt>
                        <dd>2019. 06. 18 (화) / 비바샘 공지사항</dd>
                        <dt>당첨 선물</dt>
                        <dd>우리 반 간식 박스 / 10명</dd>
                    </dl>
                    <p>선생님이 원하시는 날짜에 배송됩니다. 우리 반 인원수를 꼭 기입하세요.</p>
                </div>

                <div className="cont_wrap">
                    <div className="cont">
                        <dl className="agree_info">
                            <dt>개인정보 수집 및 이용 동의</dt>
                            <dd>
                                <ul>
                                    <li>- 이용목적 : 경품 배송 및 고객문의 응대</li>
                                    <li>- 수집하는 개인정보 : 성명, 휴대전화번호, 재직학교 정보</li>
                                    <li>- 개인정보 보유 및 이용기간 : 2019년 6월 30일까지 (이용목적 달성 시 즉시 파기)</li>
                                    <li>- 주소 및 연락처 기재 오류로 반송된 선물은 재발송되지 않았습니다. <br />개인 정보를 꼭 확인해주세요. <a
                                        onClick={this.reApplyClick}>내 주소/연락처 확인▶</a></li>
                                    <li>- <em>이벤트는 1인 1회 참여 가능하며, 간식 박스 속 내용물은 랜덤으로 제공</em>됩니다.</li>
                                    <li>- 간식 박스는 회원 정보에 기재되어 있는 학교 주소로 발송됩니다.</li>
                                    <li>- 당첨자 개인정보(성명/휴대전화번호/주소)는 배송 업체에 공유됩니다. <br />(CJ대한통운㈜ 사업자등록번호: 110-81-05034)</li>
                                </ul>
                            </dd>
                        </dl>
                        <p className="agree">
                            <input type="checkbox" id="infoCheck01" value="" className="checkbox"
                                   checked={this.state.agreeCheck == 1}
                                   onChange={this.updateAgreeCheckChange}/>
                                <label htmlFor="infoCheck01"><span>본인은 개인정보 수집 및 이용에 동의합니다.</span></label>
                        </p>

                        <div className="btn_wrap">
                            <button type="button"
                                    id="eApply"
                                    className="btn_apply"
                                    onClick={this.eventApply}><span>신청하기</span></button>
                        </div>
                    </div>

                    <div className="cont2">
                        <div className="story_list">
                            <EventList eventlists={this.state.eventAnswerContents}/>
                            <button type="button" className="btn_more" style={{ visibility : this.state.eventAnswerCount ? 'visible' : 'hidden' }} onClick={this.commentListAddAction}>더보기<span className="ico"></span></button>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}


// 리스트 목록 UL 출력
const EventList = ({eventlists}) => {
    const eventList = eventlists.map(eventList => {
        return (<EventListApply {...eventList}/>);
    });
    return (
        <ul id="storyList">
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
            BaseActions : this.props.BaseActions, // BaseAction
            eventName : "", // 이벤트 이름
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
        eventSetContents = eventSetContents.replace(/\\n/gi, ' ');

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents : eventSetContents
        });

    };

    render(){
        return (
            <li>
                <p><em>{this.state.eventName}</em> <span>{this.state.eventRegDate}</span></p>
                <div>{this.state.eventContents}
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
