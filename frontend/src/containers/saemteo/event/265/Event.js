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
            eventViewAddButton : 0 // 더보기 ( 1 : 보임 / 0 : 안보임 )
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
        const { logged, history, BaseActions , event, eventId, handleClick , loginInfo } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else if(loginInfo.certifyCheck == "N"){
            common.info("교사 인증 후 참여 가능합니다.");
            return;
        }else{ // 로그인시
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
            <section className="event191030">
                <h1><img src="/images/events/2019/event191030/img.jpg" alt="선생님과 함께 만드는 역사의 힘 5탄 | 2019년 우리반을 기억해"/></h1>
                <p className="blind">우리 반만을 위한 타임캡슐을 만든다면, 어떤 물건을 넣고 싶으신가요?10년 뒤, 아이들과 함께 타임캡슐을 열어보며 추억을 새록새록 떠올릴만한‘우리 반만의 특별한 물건’을 남겨주세요. 학생들과 함께 만들 수 있는 타임캡슐 세트를 보내드립니다.</p>
                <div>
                    <img src="/images/events/2019/event191030/img2.jpg" alt=""/>
                    <div className="blind">
                        1994년 11월, 서울시는 서울이 수도로 정해진지 600년을 기념하기 위해 서울의 모습을 대표하는 600점의 물건을 담아 ‘서울천년타임캡슐’을 매설하였습니다. 남산 자락에 묻혀있는 이 타임캡슐은 400년 후인 2394년에 개봉될 예정입니다. 서울천년타임캡슐에 대한 자세한 내용을 V매거진 11월호에서 만나보세요. [PC 웹에서 확인 가능]
						<dl>
							<dt>참여 기간</dt>
							<dd>2019.10.30(수) ~ 11.17(일)</dd>
							<dt>당첨 발표</dt>
							<dd>2019.11.20(수) / 비바샘 공지사항</dd>
							<dt>당첨 선물</dt>
							<dd>
								<ul>
									<li>타임캡슐 세트 (60명)</li>
									<li>던킨도너츠 커피+도넛 세트 (100명)</li>
								</ul>
							</dd>
						</dl>
                    </div>
                </div>

                <div className="cont_wrap">
                    <div className="cont">
						<div className="inner">
							<dl className="agree_info">
								<dt>개인정보 수집 및 이용 동의</dt>
								<dd>
									<ul>
										<li>ㆍ이용목적 : 경품 배송 및 고객문의 응대</li>
										<li>ㆍ수집하는 개인정보 : 성명, 배송지 정보, 휴대전화번호</li>
										<li>ㆍ개인정보 보유 및 이용기간 : 이용목적 달성 시 즉시 파기</li>
										<li>ㆍ선물 발송을 위해 개인정보(성명/주소/연락처)가 배송업체에 제공됩니다. ((주)한진-사업자등록번호 : 201-81-02823)</li>
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
                <p dangerouslySetInnerHTML = {{__html: this.state.step2}}></p>
                <div className="uid"><em>{this.state.eventName}</em> <span>{this.state.eventRegDate}</span></div>
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
