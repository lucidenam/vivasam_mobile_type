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
const PAGE_SIZE = 5;
class Event extends Component {
    state = {
        eventId: 500,
        pageNo:1,
        pageSize:PAGE_SIZE,
        isEventApply : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventUrl: 'https://www.vivasam.com/saemteo/event/view/500',
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.checkEventCount();   		// 이벤트 참여자 수 조회
            await this.commentConstructorList();	// 이벤트 댓글 목록 조회
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

    };

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const {eventId} = this.props;
        const {SaemteoActions} = this.props;

        const params = {
            eventId:  eventId,
            eventAnswerSeq: 2,
            answerIndex: 1
        };

        let response = await api.getSpecificEventAnswerCount(params);

        let eventAnswerCount = response.data.eventAnswerCount;
        this.setState({
            eventAnswerCount: response.data.eventAnswerCount
        });

        // 최초 조회시 전체건수가 5건이상이면 더보기 버튼 표시
        if(this.state.eventAnswerCount > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }

    };

    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId} = this.props; // 2023-05-04 추가
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.getEventAnswerList(params);

        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김

        if(this.state.eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 조회가 완료되면 다음 조회할 건수 설정
        this.setState({
            eventAnswerContents : eventJoinAnswerList,
            pageSize : this.state.pageSize + PAGE_SIZE,
        });
    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, eventId} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId});
            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }else if (response.data.eventJoinYn === 'N') {
                this.setState({
                    isEventApply: false
                });
            }
        }
    }

    // 전제 조건
    prerequisite = (e) => {
        const {logged, history, BaseActions, loginInfo} = this.props;
        const {isEventApply} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        // 교사 인증 여부
        if (loginInfo.certifyCheck === 'N') {
            BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return false;
        }

        // 준회원 여부
        if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return false;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        return true;
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, loginInfo, event , isEventApply} = this.props;

        if (!this.prerequisite(e)) {
            return;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

            event['agree'] = false;
            SaemteoActions.pushValues({type: "event", object: event});

            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    goUrl = () => {
        window.open("https://ttukttak.vivasam.com/");
    }
    
    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, eventViewAddButton} = this.state;

        // const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
        //     <EventListApply {...eventList} key={eventList.event_answer_id}/>
        // );

        const totalPage = Math.ceil(eventAnswerCount / pageSize);
        const curPage = pageNo;


        const pagesInScreen = 5;



        let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
        let endPageInScreen = startPageInScreen + pagesInScreen - 1;

        if (totalPage < endPageInScreen) {
            endPageInScreen = totalPage;
        }

        // 페이징
        const pageList = () => {
            const result = [];
            for (let i = startPageInScreen; i <= endPageInScreen; i++) {
                result.push(<li className={curPage === i ? 'on' : ''} onClick={() => {


                    this.handleClickPage(i).then()
                }}>
                    <button>{i}</button>
                </li>);
            }
            return result;
        }

        //css용 인덱스
        let loopIndex = 0;
        // 댓글
        const eventList = eventAnswerContents.map((eventList, index) => {

            if(loopIndex >= 6) {
                loopIndex = 1;
            } else {
                loopIndex++;
            }

            const result = <EventListApply {...eventList} key={eventList.event_answer_id} indexNum={loopIndex}/>;

            return result;

        });

        return (
            <section className="event240502">
                <div className="evtCont1">
                    <img src="/images/events/2024/event240502/img1.jpg" alt="뚝딱학습지 오픈 이벤트" />
                    <div className="blind">
                        <h2>뚝딱 학습지</h2>
                        <p>우리 모두를 위한 새로운 디지털 학습지</p>
                        <p>
                            실물 학습지의 깊이 있는 학습 경험을
                            디지털로 쉽고 편리하게 숙제를 마법처럼 뚝딱!
                        </p>
                        <p>뚝딱학습지의 매력을 소개해 드릴게욥!</p>
                        <ul>
                            <li>비바클래스 연동으로 숙제 내기도 뚝딱!</li>
                            <li>
                                비상교육이 만든 2천여 개의
                                활동지, 학습지가 뚝딱!
                            </li>
                            <li>
                                자동 채점,실시간 현황으로
                                연결된 교실이 뚝딱!
                            </li>
                        </ul>
                    </div>
                    <button type="button" className="btnUrl" onClick={this.goUrl}>
                        <span className="blind">뚝딱학습지 바로가기</span>
                    </button>
                </div>

                <div className="evtCont2">
                    <img src="/images/events/2024/event240502/img2.jpg" alt="" />
                    <div className="blind">
                        <p>리뷰 이벤트</p>
                        <p>
                            뚝딱학습지
                            기대평 & 사용 후기를 남기면
                        </p>
                        <p>추첨을 통해 선물이 뚝딱!</p>
                    </div>
                    <div className="evtNoti">
                        <dl>
                            <dt>참여 기간</dt>
                            <dd>2024.5.9.(목)~5.23(목)</dd>
                        </dl>
                        <dl>
                            <dt>당첨자 발표</dt>
                            <dd>2024.5.24(금) 공지에서 확인 가능</dd>
                        </dl>
                    </div>
                    <button type="button" className="btnApply pop1" onClick={this.eventApply}>
                        <span className="blind">참여하기</span>
                    </button>
                </div>
                <div className="evtCont3">
                    <img src="/images/events/2024/event240502/img3.jpg" alt="뚝딱학습지 기대평 & 사용후기" />
                    <div className="replyWrap">
                        <ul>
                            {eventAnswerCount > 0 &&
                                <div className="inner">
                                    <div className="commentList">
                                        {eventList}
                                    </div>
                                </div>
                            }
                        </ul>
                        <button type="button" className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
                            <span className="blind">더 보기</span>
                        </button>
                    </div>
                </div>
                <div className="evtFooter">
                    <div className="inner">
                        <strong>유의사항</strong>
                        <ul>
                            <li>· 본 이벤트는 비바샘 교사인증을 완료한 선생님만 참여하실 수 있습니다. </li>
                            <li>· 1인 1회 참여할 수 있습니다.</li>
                            <li>· 경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                            <li>· 경품 발송을 위해 개인정보(이름, 재직학교명, 휴대전화번호)가 서비스사에 제공됩니다. (㈜모바일이앤엠애드 사업자등록번호 215-87-19169)</li>
                            <li>· 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                            <li>· 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        </ul>
                    </div>
                </div>
            </section>
        )
    }
}
//=============================================================================
// 댓글 목록 component
//=============================================================================

class EventListApply extends Component {

    constructor(props) {
        super(props);
        this.state = {
            member_id: this.props.member_id, // 멤버 아이디
            event_id: this.props.event_id, // eventId
            event_answer_desc: this.props.event_answer_desc, // 응답문항
            reg_dttm: this.props.reg_dttm, // 등록일
            BaseActions: this.props.BaseActions, // BaseAction
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
            indexNum: this.props.indexNum,
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        let masking = "";
        for (var i = 1; i < eventSetName.length-4; i++) {
            masking += "*";
        }
        eventSetName = eventSetName.substring(1, 4) + masking; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[answers.length-1],
        });
    };

    render() {
        const {eventName, event_answer_desc} = this.state;
        return (
            <li>
                <p className="name">{eventName} 선생님</p>
                <div className="txt_box">
                    <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
                </div>
            </li>

        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event: state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));