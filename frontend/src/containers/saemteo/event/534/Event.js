import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo'
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import * as myclassActions from "../../../../store/modules/myclass";
import {maskingStr} from '../../../../lib/StringUtils';

const PAGE_SIZE = 5;

class Event extends Component {
    state = {
        isEventApply : false,       // 신청여부
        isEventApply2 : false,       // 신청여부(중고등)
        schoolLvlCd: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/534',
        playVideo: false,
        evtComment:'',
        choosedItem:'',

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
            const response = await api.chkEventJoin({eventId : this.props.eventId});
            const response2 = await api.chkEventJoin({eventId : 444});

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

    setEvtComment = (e) => {
        if (!this.prerequisite(e)) {
            document.activeElement.blur();
            return;
        }

        let evtComment = e.target.value;

        if (evtComment.length >= 300) {
            evtComment = evtComment.substring(0, 300);
        }

        this.setState({
            evtComment: evtComment
        });
    };


    playVid = () => {
        const {playVideo} = this.state;

        let contVideo = document.getElementById("video");

        this.setState({
            playVideo: true
        });

        contVideo.play();
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
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.getSpecificEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        this.setState({
            eventAnswerContents : eventJoinAnswerList,
        });
    };

    chooseItem = (e) => {
        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return;
        }

        this.setState({
            choosedItem : e.target.value,
        });
    }

    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, event, loginInfo} = this.props;
        const {evtComment, choosedItem} = this.state;

        if (!this.prerequisite(e)) {
            return;
        }

        if (evtComment.length === 0 || evtComment.length < 20) {
            common.info("내용을 20자 이상 작성해 주세요.");
            return;
        }

        if (choosedItem.length === 0) {
            common.info("우표를 선택해주세요.");
            return;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eventAnswerContent: evtComment + "^||^" + choosedItem,
            };

            event.answer = evtComment + "^||^" + choosedItem;
            eventAnswer.eventAnswerContent = evtComment + "^||^" + choosedItem;
            SaemteoActions.pushValues({type: "event", object: eventAnswer});
            // SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

            event['agree1'] = false;
            SaemteoActions.pushValues({type: "event", object: event});

            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    };

    render() {
        const {eventAnswerContents, eventAnswerCount,evtComment, pageNo, pageSize, playVideo, videoSource, popVideoSource } = this.state;

        const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
            <EventListApply {...eventList} key={eventList.event_answer_id}/>
        );

        return (
            <section className="event241218">
                <div className="evtTit">
                    <h1><img src="/images/events/2024/event241218/evtTit2.png" alt="연말 카드를 부탁해"/></h1>
                    <div className="blind">
                        <p>비바샘은 올해도 선생님과 함께여서 행복했습니다.</p>
                        <p>선생님께도 비바샘과 함께라 행복한 순간이 있었다면,</p>
                        <p>비바샘에게 연말 카드를 보내 주세요.</p>
                        <p>추첨을 통해 총 300분의 선생님께 따뜻한 선물을 보내 드릴게요.</p>
                        <dl>
                            <dt>이벤트 기간</dt>
                            <dd>12월 18일(수) ~ 12월 28일(일)</dd>
                        </dl>
                        <dl>
                            <dt>당첨자 발표</dt>
                            <dd>12월 30일(월)</dd>
                        </dl>

                    </div>
                </div>

                <div className="evtCont01">
                    <div className="ribon"><img src="/images/events/2024/event241218/ribon.png"/></div>
                    <div className="evtCont1_box">

                        <h3><img src="/images/events/2024/event241218/step_01_txt.png"
                                 alt="1단계 비바샘과의 행복한 순간을 담아 연말 카드를 써 주세요."/></h3>
                        <p className="blind">최소 20자 이상, 최대 300자 이내로 자유롭게 작성해 주세요.</p>
                        <div className="textarea_wrap">
                            <textarea name="evtComment" onChange={this.setEvtComment} id="evtComment" placeholder="내용을 입력해주세요."
                                      maxLength="300"></textarea>
                            {/*<p className="count"><span className="currentCount">{evtComment.length}</span>/300</p>*/}
                        </div>

                        <h3><img src="/images/events/2024/event241218/step_02_txt.png"
                                 alt="2단계 연말 카드에 붙일 비버샘 우표를 골라주세요."/></h3>
                        <p className="blind">총 300분께 우표와 어울리는 깜짝 선물을 드립니다.</p>
                        <ul className="rdo_items">
                            <li className="item1">
                                <input type="radio" name="rdo" id="rdo01" value="산타 비버샘 우표" onClick={this.chooseItem}/>
                                <label htmlFor="rdo01"></label>
                                <span className="stamp_txt"><img
                                    src="/images/events/2024/event241218/stamp_1.png"
                                    alt="산타 비버샘 우표"/></span>
                            </li>
                            <li className="item2">
                                <input type="radio" name="rdo" id="rdo02" value="눈사람 비버샘 우표" onClick={this.chooseItem}/>
                                <label htmlFor="rdo02"></label>
                                <span className="stamp_txt"><img
                                    src="/images/events/2024/event241218/stamp_2.png" alt="눈사람 비버샘 우표"/></span>
                            </li>
                            <li className="item3">
                                <input type="radio" name="rdo" id="rdo03" value="루돌프 비버샘 우표" onClick={this.chooseItem}/>
                                <label htmlFor="rdo03"></label>
                                <span className="stamp_txt"><img
                                    src="/images/events/2024/event241218/stamp_3.png" alt="루돌프 비버샘 우표"/></span>
                            </li>

                        </ul>

                        <div className="btnWrap">
                            <button type="button" className="btnApply" onClick={this.eventApply} id="btnShowForm">
                                <img src="/images/events/2024/event241218/btn_send.png" alt="연말 카드 보내기"/>

                            </button>
                        </div>

                    </div>

                </div>

                <div className="evtCont02">
                    <h1><img src="/images/events/2024/event241218/evtCardTit.png" alt="에듀테크 테마관 탐험후기"/></h1>
                    <div className="commentWrap cont_Wrap">
                        <div className="commentList">
                            {eventApplyAnswerList}
                        </div>

                        <button className="btnMore" style={{display: this.state.eventViewAddButton == 1 ? 'block' : 'none'}}>
                            <img src="/images/events/2024/event241218/btn_more.png" alt="더보기"/>
                        </button>
                        {/*<EventApplyAnswerPagination*/}
                        {/*    eventAnswerCount={eventAnswerCount}*/}
                        {/*    pageSize={pageSize}*/}
                        {/*    pageNo={pageNo}*/}
                        {/*    handleClickPage={this.handleClickPage}*/}
                        {/*/>*/}
                    </div>
                </div>


                <div className="notice">
                    <strong>유의사항</strong>
                    <ul>
                        <li>1인 1회만 참여하실 수 있으며, 교사 인증을 완료한 초·중·고 선생님만 신청이 가능합니다.</li>
                        <li>개인 정보 오기재, 유효 기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>경품 발송을 위해 신청자 개인 정보(성명/주소/휴대 전화 번호)가 서비스사와 배송 업체에 제공됩니다.<br/>
                            (주)모바일이앤엠애드 사업자 등록 번호 215-87-19169<br/>
                            (주)CJ대한통운 사업자 등록 번호 110-81-05034<br/>
                            (주)한진택배 사업자 등록 번호 201-81-02823
                            </li>
                        <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
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
            event_answer_desc: answers[0],
            // event_answer_desc2 : answers[1].replaceAll("\n", "<br/>"),
        });
    };

    render() {
        const {eventName, event_answer_desc} = this.state;
        return (
            /* 후기 리스트 */
            <div className="listItem comment comment01 circle">
                <strong>{eventName} 선생님</strong>
                <div className="comment">
                    <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
                </div>
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
                                onClick={() => {handleClickPage(totalPage)}}
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