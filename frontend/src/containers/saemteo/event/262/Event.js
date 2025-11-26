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
            eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
            stampName : "" // 도장선택
        };
        this.commentConstructorList();
        this.checkEventCount();
    }

    // 개인정보 선택
    updateAgreeCheckChange = () => {
        const { logged, loginInfo , history, BaseActions, SaemteoActions } = this.props;
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

    // 라디오 버튼 체크 값 수정
    onStampChange = (e) => {
        this.setState({
            stampName: e.currentTarget.value
        });
    };

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick , loginInfo, SaemteoActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else if(loginInfo.certifyCheck == "N"){
            common.info("교사 인증 후 참여 가능합니다.");
            return;
        }else{ // 로그인시
            if(this.state.stampName == ""){
                common.info("갖고 싶은 위인의 도장을 선택해주세요.");
                return;
            }
            if(this.state.agreeCheck == 0){
                common.info("개인정보 수집 및 이용에 동의해 주세요.");
                return;
            }else{
                try {
                    event.eventId = eventId; // 이벤트 ID
                    const response = await api.eventInfo(eventId);
                    if(response.data.code === '3'){
                        common.error("이미 참여하셨습니다.");
                    }else if(response.data.code === '0'){
                        event.amount = this.state.stampName;
                        SaemteoActions.pushValues({type:"event", object:event});
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

        if(this.state.eventAnswerCount > 10){
            this.setState({
                eventViewAddButton : 1
            });
        }
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
    // 댓글 출력시 필요 끝

    render () {
        return (
            <section className="event190923">
                <h1><img src="/images/events/2019/event190923/img.jpg" alt="선생님과 함께 만드는 역사의 힘 4탄 | 아이들에게 새겨주는위인의 뜻 "/></h1>
                <p className="blind">역사의 힘 1탄에 남겨주신 위인의 글귀 중,학생들에게 교훈이 되는 글귀를 선정하여 도장을 만들었습니다.위인의 지혜를 종이 위에 고스란히 새길 수 있는 뜻 깊은 도장.아이들과 위인의 뜻을 함께 나누실 선생님의 사연을 기다립니다.</p>
                <div>
                    <img src="/images/events/2019/event190923/img2.jpg" alt=""/>
                    <div className="blind">
                        <dl>
                            <dt>참여 기간</dt>
                            <dd>2019.09.23 ~ 10.14</dd>
                            <dt>당첨 발표</dt>
                            <dd>2019. 10. 16 (수) / 비바샘 공지사항</dd>
                            <dt>당첨 선물</dt>
                            <dd>
                                <ul>
                                    <li>위인의 도장 + 엽서 세트(60명)</li>
                                    <li>문화상품권 5천원권(100명)</li>
                                </ul>
                            </dd>
                            <dt>참여 방법</dt>
                            <dd>
                                <ol>
                                    <li>갖고 싶은 위인의 도장을 선택하세요.</li>
                                    <li>도장이 필요한 사연을 남겨주세요.* 위인의 뜻과 사연이 가까울수록 좋습니다. </li>
                                </ol>
                            </dd>
                        </dl>
                    </div>
                </div>

                <div className="cont_wrap">
                    <div className="cont">
                        <div className="inner">
                            <ul className="stamp_select">
                                <li className="fst">
                                    <input type="radio" id="event_radio_01" name="event_radio_gr" value ="충무 이순신" onChange={this.onStampChange}
                                           className="checkbox_circle"/>
                                    <label htmlFor="event_radio_01">
                                        <img src="/images/events/2019/event190923/stamp.jpg"
                                             alt="가벼이 움직이지 마라. 태산같이 침착하고 무겁게 행동하라.- 충무 이순신 -"/>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" id="event_radio_02" name="event_radio_gr" value = "도마 안중근"  onChange={this.onStampChange}
                                           className="checkbox_circle"/>
                                    <label htmlFor="event_radio_02">
                                        <img src="/images/events/2019/event190923/stamp2.jpg"
                                             alt="세월을 헛되이 보내지 말라. 청춘은 다시 오지 않는다. - 도마 안중근 -"/>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" id="event_radio_03" name="event_radio_gr" value = "빈센트 반 고흐"  onChange={this.onStampChange}
                                           className="checkbox_circle"/>
                                    <label htmlFor="event_radio_03">
                                        <img src="/images/events/2019/event190923/stamp3.jpg"
                                             alt="위대한 성과는 작은 일들이 이어져 이루어진다.- 빈센트 반 고흐 -"/>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" id="event_radio_04" name="event_radio_gr" value = "신사임당"  onChange={this.onStampChange}
                                           className="checkbox_circle"/>
                                    <label htmlFor="event_radio_04">
                                        <img src="/images/events/2019/event190923/stamp4.jpg"
                                             alt="뜻을 세우면 이루지 못할 것이 없다 - 신사임당 -"/>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" id="event_radio_05" name="event_radio_gr" value = "알베르트 아인슈타인"  onChange={this.onStampChange}
                                           className="checkbox_circle"/>
                                    <label htmlFor="event_radio_05">
                                        <img src="/images/events/2019/event190923/stamp5.jpg"
                                             alt="성공한 사람보다는 가치 있는 사람이 되어라. - 알베르트 아인슈타인 -"/>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" id="event_radio_06" name="event_radio_gr" value = "앙투안 드 생텍쥐페리"  onChange={this.onStampChange}
                                           className="checkbox_circle"/>
                                    <label htmlFor="event_radio_06">
                                        <img src="/images/events/2019/event190923/stamp6.jpg"
                                             alt="사막이 아름다운 것은 어딘가에 샘이 숨겨져 있기 때문이다. - 앙투안 드 생텍쥐페리 -"/>
                                    </label>
                                </li>
                            </ul>
                            <dl className="agree_info">
                                <dt>개인정보 수집 및 이용 동의</dt>
                                <dd>
                                    <ul>
                                        <li>ㆍ이용목적 : 경품 배송 및 고객문의 응대</li>
                                        <li>ㆍ수집하는 개인정보 : 성명, 배송지 정보, 휴대전화번호</li>
                                        <li>ㆍ개인정보 보유 및 이용기간 : 이용목적 달성 시 즉시 파기</li>
                                        <li>ㆍ선물 발송을 위해 개인정보(성명/주소/연락처)가 배송업체에 제공됩니다. <br/>㈜다우기술-사업자번호: 220-81-02810,
                                            롯데글로벌로지스㈜ –사업자등록번호 : 102-81-23012
                                        </li>
                                    </ul>
                                </dd>
                            </dl>
                            <p className="agree">
                                <input type="checkbox" id="infoCheck01" value="" className="checkbox"
                                       checked={this.state.agreeCheck == 1}
                                       onChange={this.updateAgreeCheckChange}/>
                                <label htmlFor="infoCheck01"><span>본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.</span></label>
                            </p>
                        </div>
                        <div className="btn_wrap">
                            <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}>참여하기</button>
                        </div>
                    </div>

                    <div className="cont2">
                        <div className="story_list">
                            <EventList eventlists={this.state.eventAnswerContents}/>
                            <button type="button" className="btn_more" style={{ display : this.state.eventViewAddButton == 1 ? 'block' : 'none' }} onClick={this.commentListAddAction}>더보기 +</button>
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

        let eventContentsArray =  eventSetContents.split("|STEP|");
        let step1 = eventContentsArray[0];
        let step2 = eventContentsArray[1];
        step2 = step2.replace(/(\\n|\\r\\n)/gi, '<br/>');

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            step1 : step1,
            step2 : step2
        });

    };

    render(){
        return (

            <li>
                <dl>
                    <dt>{this.state.step1}</dt>
                    <dd>
                        <div dangerouslySetInnerHTML = {{__html: this.state.step2}}></div>
                    </dd>
                    <dd className="uid"><em>{this.state.eventName}</em> <span>{this.state.eventRegDate}</span></dd>
                </dl>

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
