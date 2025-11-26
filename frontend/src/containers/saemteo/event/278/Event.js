import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
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
            StoryPageNo : 1, // 페이지
            StoryPageSize : 4, // 사이즈
            eventAnswerContents1 : [], // 279번 응답
            eventAnswerContents2 : [], // 280번 응답
            eventAnswerContents3 : [], // 281번 응답
            eventAnswerContents4 : []  // 282번 응답
        };
        // 279 ~ 282번 응답
        this.commentConstructorList1();
        this.commentConstructorList2();
        this.commentConstructorList3();
        this.commentConstructorList4();
    }


    // 이벤트 신청 검사
    // 멀티 신청을 받는 이벤트의 경우에는 Button 값 설정후 해당 값으로 넘김
    eventApply = async (e) => {
        const { logged, history, BaseActions , event, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            try {
                event.eventId = e.currentTarget.value; // 이벤트 ID
                const response = await api.eventInfo(event.eventId);
                if(response.data.code === '3'){
                    common.error("이미 참여한 문항입니다.");
                }else if(response.data.code === '0'){
                    handleClick(event.eventId);
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

    // 댓글 출력
    // 279번 이벤트
    commentConstructorList1 = async  () => {
        const { event,answerPage } = this.props;
        answerPage.pageNo = this.state.StoryPageNo;
        answerPage.pageSize = this.state.StoryPageSize;
        event.eventId = 279; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 2
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;

        this.setState({
            eventAnswerContents1 : responsedata
        });
    };

    // 280번 이벤트
    commentConstructorList2 = async  () => {
        const { event,answerPage } = this.props;
        answerPage.pageNo = this.state.StoryPageNo;
        answerPage.pageSize = this.state.StoryPageSize;
        event.eventId = 280; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 2
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;

        this.setState({
            eventAnswerContents2 : responsedata,
        });
    };

    // 281번 이벤트
    commentConstructorList3 = async  () => {
        const { event,answerPage } = this.props;
        answerPage.pageNo = this.state.StoryPageNo;
        answerPage.pageSize = this.state.StoryPageSize;
        event.eventId = 281; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 2
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;

        this.setState({
            eventAnswerContents3 : responsedata
        });
    };

    // 282번 이벤트
    commentConstructorList4 = async  () => {
        const { event,answerPage } = this.props;
        answerPage.pageNo = this.state.StoryPageNo;
        answerPage.pageSize = this.state.StoryPageSize;
        event.eventId = 282; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 2
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;

        this.setState({
            eventAnswerContents4 : responsedata
        });
    };


    render () {
        return (
            <section className="event200210 opendate0302">{/* 오픈 날짜에 따라서 변경 opendate0210 opendate0217 opendate0224 opendate0302  */}
                <div className="cont">
                    <h1><img src="/images/events/2020/event200210/top.jpg" alt="2020 경자년 이벤트 흰 쥐와 함께 새학기"/></h1>
                    <div className="blind">
                        <p>지혜, 근면, 풍요로움을 상징하는 흰 쥐의 해! 2020 경자년 새학기를 맞이하여, 흰 쥐들이 매주 테마별 선물을 준비합니다. 4개의 테마에 모두 참여하시면 특별한
                            선물을 추가로 보내 드립니다 .</p>
                        <dl>
                            <dt>참여 기간</dt>
                            <dd>2020.02.10(월) ~ 03.08(일)</dd>
                            <dt>당첨자 발표</dt>
                            <dd>2020.03.11(수)</dd>
                        </dl>
                    </div>
                </div>

                <div className="cont type1">
                    <div className="blind">
                        <h2>01. 부지런하쥐</h2>
                        <p>경자년 새학기를 맞이하는 나만의 다짐을 남겨주세요! 2020.02.10(월) ~</p>
                        <strong>스타벅스 카페라떼 Tall 100명</strong>
                    </div>
                    <div className="list">
                        <a href="https://www.vivasam.com/event/2020/viewEvent278.do?deviceMode=pc" className="btn_more">더보기 +</a>
                        <EventList eventlists={this.state.eventAnswerContents1}/>
                        <div className="btns">
                            <button type="button" id="eApply" className="btn_apply" value="279" onClick={this.eventApply}><img src="/images/events/2020/event200210/btn_apply.png" alt="참여하기"/></button>
                        </div>
                    </div>
                </div>

                <div className="cont type2">
                    <div className="blind">
                        <h2>02. 풍요롭쥐</h2>
                        <p>풍요로운 경자년을 만들기 위해 꼭 필요한 것은 무엇일까요? 2020.02.17(월) ~</p>
                        <strong>배스킨라빈스 파인트 아이스크림 50명</strong>
                    </div>

                    <div className="list">
                        {/* 2월 17일 해당 ul을 다 지우고 EventList 주석 풀어야 됩니다. */}
                        {/*<ul>*/}
                            {/*<li className="nodata">*/}
                                {/*<span><strong>2월 17일 부터</strong><br />참여하실 수 있습니다.</span>*/}
                            {/*</li>*/}
                        {/*</ul>*/}
                        <a href="https://www.vivasam.com/event/2020/viewEvent278.do?deviceMode=pc" className="btn_more">더보기 +</a>
                        <EventList eventlists={this.state.eventAnswerContents2}/>
                        <div className="btns">
                            <button type="button" id="eApply" className="btn_apply" value="280" onClick={this.eventApply}><img src="/images/events/2020/event200210/btn_apply.png" alt="참여하기"/></button>
                        </div>
                    </div>
                </div>

                <div className="cont type3">
                    <div className="blind">
                        <h2>03. 총명하쥐</h2>
                        <p>학생들의 총명함을 일깨우는 선생님만의 비법을 공유해 주세요! 2020.02.24(월) ~</p>
                        <strong>컬쳐랜드 문화상품권 5,000원권 50명</strong>
                    </div>

                    <div className="list">
                        {/* 2월 24일 해당 ul을 다 지우고 EventList 주석 풀어야 됩니다. */}
                        {/*<ul>*/}
                            {/*<li className="nodata">*/}
                                {/*<span><strong>2월 24일 부터</strong><br />참여하실 수 있습니다.</span>*/}
                            {/*</li>*/}
                        {/*</ul>*/}
                        <a href="https://www.vivasam.com/event/2020/viewEvent278.do?deviceMode=pc" className="btn_more">더보기 +</a>
                        <EventList eventlists={this.state.eventAnswerContents3}/>
                        <div className="btns">
                            <button type="button" id="eApply" className="btn_apply" value="281"  onClick={this.eventApply}><img src="/images/events/2020/event200210/btn_apply.png" alt="참여하기"/></button>
                        </div>
                    </div>
                </div>

                <div className="cont type4">
                    <div className="blind">
                        <h2>04. 끈기있쥐</h2>
                        <p>2020 경자년, 비바샘에 기대하는 신규 콘텐츠가 있다면 무엇인가요? 2020.03.02(월) ~</p>
                        <strong>메가박스 영화예매권 2매 20명</strong>
                    </div>

                    <div className="list">
                        {/* 3월 2일 해당 ul을 다 지우고 EventList 주석 풀어야 됩니다. */}
                        {/*<ul>*/}
                            {/*<li className="nodata">*/}
                                {/*<span><strong>3월 2일 부터</strong><br />참여하실 수 있습니다.</span>*/}
                            {/*</li>*/}
                        {/*</ul>*/}
                        <a href="https://www.vivasam.com/event/2020/viewEvent278.do?deviceMode=pc" className="btn_more">더보기 +</a>
                        <EventList eventlists={this.state.eventAnswerContents4}/>
                        <div className="btns">
                            <button type="button" id="eApply" className="btn_apply" value="282" onClick={this.eventApply}><img src="/images/events/2020/event200210/btn_apply.png" alt="참여하기"/></button>
                        </div>
                    </div>
                </div>

                <div className="cont_info">
                    <h2><img src="/images/events/2020/event200210/bottom.jpg" alt="유의사항"/></h2>
                    <div className="blind">
                        <p>4가지 테마에 모두 참여해주신 선생님 중 좋은 답변을 남겨 주신 20명께 특별한 선물을 추가로 보내드립니다. 에스모도 보조배터리 20명</p>
                        <ul>
                            <li>테마별로 1회 씩 참여 가능합니다.</li>
                            <li>정확한 주소와 휴대전화번호를 기재해 주세요. 주소 및 휴대전화번호가 잘못 기재되어 반송된 경품은 재발송 되지 않습니다.</li>
                            <li>신청자 개인정보(성명/주소/휴대전화번호)는 배송 업체에 공유됩니다. (㈜다우기술 사업자등록번호 : 220-81-02810 / 롯데글로벌로지스㈜ 사업자등록번호 : 102-81-23012)</li>
                        </ul>
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
            event_answer_desc : this.props.event_answer_desc.substring(0,20), // 응답문항
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
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let eventSetContents = JSON.stringify(this.state.event_answer_desc).substring(1,eventSetContentLength-1); // 이벤트 내용

        let eventContentsArray =  eventSetContents.split("|STEP|");
        let step1 = eventContentsArray[0];
        let step2 = eventContentsArray[1];
        step2 = step2.replace(/(\\n|\\r\\n)/gi, '<br/>');

        this.setState({
            eventName : eventSetName,
            step1 : step1,
            step2 : step2
        });

    };

    render(){
        return (
            <li>
                <span className="id">{this.state.eventName}</span>
                <p dangerouslySetInnerHTML = {{__html: this.state.step2}}></p>
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
