import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import * as myclassActions from "../../../../store/modules/myclass";
import {maskingStr} from '../../../../lib/StringUtils';
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";

const PAGE_SIZE = 5;

class Event extends Component {
    state = {
        eventId: 516,
        eventId1: 517,
        eventId2: 518,
        isEventApply: false,       // 신청여부
        isEventApply2: false,       // 신청여부(중고등)
        schoolLvlCd: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
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

        await this.setEventInfo();

    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId: this.props.eventId});
            const response2 = await api.chkEventJoin({eventId: 444});

            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
            if (response2.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply2: true
                });
            }
        }
    }

    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.teacherAnnual = '';
        event.teacherHope = '';
        SaemteoActions.pushValues({type: "event", object: event});
    }

    copyToClipboard = (e) => {
        // 글을 쓸 수 있는 란을 만든다.
        let aux = document.createElement("input");
        // 지정된 요소의 값을 할당 한다.
        aux.setAttribute("value", this.state.eventUrl);
        // bdy에 추가한다.
        document.body.appendChild(aux);
        // 지정된 내용을 강조한다.
        aux.select();
        // 텍스트를 카피 하는 변수를 생성
        document.execCommand("copy");
        // body 로 부터 다시 반환 한다.
        document.body.removeChild(aux);
        common.info('링크가 복사되었습니다.\n동료 선생님과 함께 이벤트에 참여해 보세요.');
    };


    handleClickPage = async (pageNo) => {
        const {BaseActions} = this.props;

        this.setState({
            pageNo: pageNo
        });
        BaseActions.openLoading();
        setTimeout(() => {
            try {
                this.commentConstructorList();	// 댓글 목록 조회
            } catch (e) {
                console.log(e);
                common.info(e.message);
            } finally {
                setTimeout(() => {
                    BaseActions.closeLoading();
                }, 300);//의도적 지연.
            }
        }, 100);
    }

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const {SaemteoActions, eventId} = this.props;
        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            answerIndex: 1
        };
        let response2 = await api.getSpecificEventAnswerCount(params);
        this.setState({
            eventAnswerCount: response2.data.eventAnswerCount
        });
    };

    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId} = this.props;
        const {pageNo, pageSize, eventId2} = this.state;

        const params = {
            eventId: eventId2,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: 1,
                pageSize: 2
            }
        };

        const responseList = await api.getSpecificEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        this.setState({
            eventAnswerContents: eventJoinAnswerList,
        });
    };

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

    eventApply = async (e) => {
        const { eventId1, eventId2} = this.state;
        const {logged, loginInfo, SaemteoActions, eventId, handleClick, event} = this.props;

        let showEventId;

        if (e.currentTarget.className.indexOf("pop1") > 0) {
            showEventId = eventId1;
        } else if (e.currentTarget.className.indexOf("pop2") > 0) {
            showEventId = eventId2;
        }

        if (!this.prerequisite(e)) {
            return false;
        }

        try {
            const eventAnswer = {
                eventId: showEventId,
                memberId: loginInfo.memberId
            }
            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
            handleClick(eventId);
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    };

    linkVivaClass = () => {

    }

    render() {
            const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, playVideo, videoSource, popVideoSource} = this.state;

            const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
                <EventListApply {...eventList} key={eventList.event_answer_id}/>
            );

            return (
                <section className="event240819">
                    <div className="evtTitWrap">
                        <h1><img src="/images/events/2024/event240819/img1.png" alt="투게더 비바클래스"/></h1>
                    </div>

                    <div className="evtContWrap">
                        <div className="evtCont evtCont01">
                            <h1><img src="/images/events/2024/event240819/img2.png" alt="투표를 만들어요"/></h1>
                            <a href="https://vivaclass.vivasam.com/" target="_blank" className="btnLink">
                                <span className="blind">비바클래스 바로가기</span>
                            </a>
                        </div>
                        <button className="btnApply pop1" onClick={this.eventApply}>
                            <img src="/images/events/2024/event240819/btn_apply1.png" alt="참여하기"/>
                        </button>

                        <div className="evtCont evtCont02">
                            <h1><img src="/images/events/2024/event240819/img3.png" alt="다함께 투표해요"/></h1>
                            <div className="commentWrap">
                                <div className="commentList">
                                    {/*<div className="listItem comment">
                                    <p>테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다테스트입니다</p>
                                    <strong>비바샘 선생님</strong>
                                </div>*/}
                                    {eventApplyAnswerList}
                                </div>
                            </div>
                            <h1><img src="/images/events/2024/event240819/img4.png" alt="꼭 확인해 주세요!"/></h1>
                        </div>
                        <button className="btnApply pop2" onClick={this.eventApply}>
                            <img src="/images/events/2024/event240819/btn_apply2.png" alt="참여하기"/>
                        </button>
                    </div>

                    <div className="notice">
                        <strong>유의사항</strong>
                        <ul className="evtInfoList">
                            <li>· 본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.​</li>
                            <li>· 각 이벤트 별로 1인 1회씩 참여하실 수 있습니다.​​</li>
                            <li>· 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.​​</li>
                            <li>· 경품 발송을 위해 개인정보가 서비스사와 배송업체에 제공됩니다.​​ <br/>(주)모바일이앤엠애드 사업자등록번호 : 215-87-19169​​ <br/>아기자기
                                선물가게 사업자등록번호: 5303100427​​
                            </li>
                            <li>· 경품은 당첨자 발표 이후 순차발송 되며, 학급 간식 경품의 경우 학급 인원수에 <br/>맞춰 배송됩니다.​​</li>
                            <li>· 제출하신 응답은 상업적인 사용 목적이 아닌, 기업의 활동 소개를 위해 <br/>사용될 수 있습니다.​</li>
                        </ul>
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
            event_answer_desc2: "",
            reg_dttm: this.props.reg_dttm, // 등록일
            BaseActions: this.props.BaseActions, // BaseAction
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅
        let eventSetName = maskingStr(this.state.member_id);
        let answers = this.state.event_answer_desc.split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc: answers[1],
            // event_answer_desc2 : answers[1].replaceAll("\n", "<br/>"),
        });
    };

    render() {
        const {eventName, event_answer_desc} = this.state;

        return (
            /* 후기 리스트 */
            <div className="listItem comment">
                <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
                <strong>{eventName} 선생님</strong>
            </div>
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));


//=============================================================================
// 댓글 페이징 component
//=============================================================================

class EventApplyAnswerPagination extends Component {

    render() {
        const {eventAnswerCount, pageSize, pageNo, handleClickPage} = this.props;

        const totalPage = Math.ceil(eventAnswerCount / pageSize);
        const curPage = pageNo;
        const pagesInScreen = 5;
        let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
        let endPageInScreen = startPageInScreen + pagesInScreen - 1;

        if (totalPage < endPageInScreen) endPageInScreen = totalPage;

        const pageButtonList = () => {
            const result = [];
            for (let i = startPageInScreen; i <= endPageInScreen; i++) {
                if (i === curPage) {
                    result.push(<button type="button" className={i === curPage ? 'on' : ''}>{i}</button>);
                } else {
                    result.push(<button type="button" onClick={() => handleClickPage(i)}>{i}</button>);
                }
            }
            return result;
        }

        return (
            <div id="eventPagingNav" className="pagingWrap">
                <div className="innerPaging">
                    {curPage > 1 &&
                        <div className="pagingPrev">
                            <button
                                type="button"
                                className="btnPageFirst"
                                onClick={() => {
                                    handleClickPage(1)
                                }}
                            >
                                <span className="blind">처음</span>
                            </button>
                            <button
                                type="button"
                                className="btnPagePrev"
                                onClick={() => {
                                    handleClickPage(curPage - 1)
                                }}
                            >
                                <span className="blind">이전</span>
                            </button>
                        </div>
                    }
                    <div className="pageNum">
                        {pageButtonList()}
                    </div>
                    {curPage < totalPage &&
                        <div className="pagingNext">
                            <button
                                type="button"
                                className="btnPageNext"
                                onClick={() => {
                                    handleClickPage(curPage + 1)
                                }}
                            >
                                <span className="blind">다음</span>
                            </button>
                            <button
                                type="button"
                                className="btnPageLast"
                                onClick={() => {
                                    handleClickPage(totalPage)
                                }}
                            >
                                <span className="blind">마지막</span>
                            </button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}