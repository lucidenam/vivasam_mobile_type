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
import {getSpecificEventAnswerCount} from "lib/api";

const PAGE_SIZE = 6;

class Event extends Component {
    state = {
        isEventApply : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        prePageSize : 0,
        clickCnt: 0,
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtComment: '',
        choosedItem: '',
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.checkEventCount();   		// 이벤트 참여자 수 조회
            await this.commentConstructorList();	// 이벤트 댓글 목록 조회
            await this.countConstructorList();
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
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
        const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;
        const {evtComment, choosedItem} = this.state;

        if (!this.prerequisite(e)) {
            return;
        }
        if(choosedItem.length === 0 || evtComment.length === 0) {
            common.info("글을 작성하고 힐링 테마를 선택해주세요.");
            return;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eventAnswerContent: evtComment + "^||^" + choosedItem,
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

            event['agree1'] = false;
            SaemteoActions.pushValues({type: "event", object: event});


            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    // 이벤트2 입력창 focus시
    onFocusComment = (e) => {
        if (!this.prerequisite(e)) {
            document.activeElement.blur();
        }
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

        // 최초 조회시 전체건수가 page_size이상이면 더보기 버튼 표시
        if(this.state.eventAnswerCount > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };


    // 참여 정보 출력
    countConstructorList = async () => {
        const {eventAnswerCount} = this.state;
        const {eventId} = this.props;

        let tmpEventAnswerCount = (eventAnswerCount === 0 ? 1 : eventAnswerCount);

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: 1,
                pageSize: tmpEventAnswerCount
            }
        };

        const responseList = await api.getEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        for (let i = 0; i < eventJoinAnswerList.length; i++) {
            let answers = eventJoinAnswerList[i].event_answer_desc.split('^||^');
        }
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


    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId,loginInfo} = this.props;
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            memberId: loginInfo.memberId,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.get2024EventAnswerList498(params);
        let eventJoinAnswerList = responseList.data.eventAnswerList;

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 조회가 완료되면 다음 조회할 건수 설정
        this.setState({
            eventAnswerContents : eventJoinAnswerList,
            pageSize : this.state.pageSize + PAGE_SIZE
        });

    };

    // 댓글 출력
    commentConstructorList2 = async () => {
        const {eventId,loginInfo} = this.props;
        const {pageNo, prePageSize} = this.state;

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            memberId: loginInfo.memberId,
            answerPage: {
                pageNo: pageNo,
                pageSize: prePageSize
            }
        };

        const responseList =  await api.get2024EventAnswerList498(params);
        let eventJoinAnswerList = responseList.data.eventAnswerList;

        // 조회가 완료되면 다음 조회할 건수 설정
        this.setState({
            eventAnswerContents : eventJoinAnswerList
        });

    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.setState({
            clickCnt : (this.state.clickCnt-1) + 2
        })

        this.commentConstructorList(); // 댓글 목록 갱신
    };

    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, bookTitle, bookReason, eventViewAddButton, evtComment} = this.state;

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
            loopIndex++;

            const result = <EventListApply {...eventList} key={eventList.event_answer_id} indexNum={loopIndex} loginInfo={this.props.loginInfo} BaseActions={this.props.BaseActions} logged={this.props.logged} commentConstructorList2={this.commentConstructorList2} history={this.props.history} pageSize={this.state.pageSize} />;
            return result;
        });

        return (
            <section className="event240424">
                <div className="evtCont01">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="evtTit">
                        <h1><img src="/images/events/2024/event240424/evtTit.png" alt="스승의날 이벤트"/></h1>
                        <div className="blind">
                            <h1>눈부시게 아름다운 날</h1>
                            <p>선생님이 되어 눈부시게 아름다웠던 날들에 대해 들려주세요.</p>
                            <p>눈물이 찔끔 나왔던 감동적인 날</p>
                            <p>하하호호 웃음이 절로 나왔던 날</p>
                            <p>정신없이 바쁜 일상에 위로가 필요했던 날</p>
                            <p>앞으로는 더욱 눈부시게 빛나는 날들이 계속되기를!</p>
                            <strong>감사와 응원의 마음을 담아 준비한 힐링 선물을 골라주세요.</strong>
                            <p>선택하신 깜짝 선물을 5월 15일 스승의 날에 보내드립니다♥</p>
                            <dl>
                                <dt>참여 기간</dt>
                                <dd>4월 24일(수) ~ 5월 12일(일)</dd>
                            </dl>
                            <dl>
                                <dt>당첨자 발표</dt>
                                <dd>5월 13일(월)</dd>
                            </dl>
                            <dl>
                                <dt>선물 발송</dt>
                                <dd>5월 15일(수)</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="contBox">
                        <h3><img src="/images/events/2024/event240424/subTit.png" alt="선생님, 눈부시게 아름다웠던 그 날에 대해 들려주세요." /></h3>
                        <div className="evtForm">
                            <textarea
                                placeholder="300자 이내로 자유롭게 작성해주세요."
                                onChange={this.setEvtComment}
                                value={evtComment}
                                maxLength={300}
                            ></textarea>
                            <p className="count"><span className="currentCount">{evtComment.length}</span>/300</p>
                        </div>

                        <h3><img src="/images/events/2024/event240424/subTit2.png" alt="선생님께 필요한 힐링 테마를 골라주세요! 비버샘이 직접 고른 깜짝 선물을 700분께 드립니다." /></h3>
                        <div className="rdos_wrap">
                            <ul>
                                <li className="item1">
                                    <input type="radio" id="item1" name="item" value="소중한 사람과 함께하는 시간" onClick={this.chooseItem}/>
                                    <label htmlFor="item1">
                                        <p>소중한 사람과 <br/>함께하는 시간</p>
                                    </label>
                                </li>
                                <li className="item2">
                                    <input type="radio" id="item2" name="item" value="온전히 나에게 집중하는 시간" onClick={this.chooseItem}/>
                                    <label htmlFor="item2">
                                        <p>온전히 나에게 <br/>집중하는 시간</p>
                                    </label>
                                </li>
                                <li className="item3">
                                    <input type="radio" id="item3" name="item" value="일상 속 즐거움을 얻는 시간" onClick={this.chooseItem}/>
                                    <label htmlFor="item3">
                                        <p>일상 속 즐거움을 <br/>얻는 시간</p>
                                    </label>
                                </li>
                                <li className="item4">
                                    <input type="radio" id="item4" name="item" value="파워 업 에너지를 충전하는 시간" onClick={this.chooseItem}/>
                                    <label htmlFor="item4">
                                        <p>파워 업 에너지를 <br/>충전하는 시간</p>
                                    </label>
                                </li>
                                <li className="item5">
                                    <input type="radio" id="item5" name="item" value="시원하게 스트레스를 날리는 시간" onClick={this.chooseItem}/>
                                    <label htmlFor="item5">
                                        <p>시원하게 스트레스를 <br/>날리는 시간</p>
                                    </label>
                                </li>
                            </ul>
                        </div>
                        <div className="btnWrap">
                            <button className="btnApply" onClick={this.eventApply}>
                                <span className="blind">참여하기</span>
                            </button>
                        </div>

                        {eventAnswerCount > 0 &&
                        <div className="commentWrap cont_Wrap">
                            <div className="commentList">
                                {eventList}
                            </div>
                            <button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
                                <span className="blind">더 보기</span>
                            </button>
                        </div>}

                    </div>
                </div>

                <div className="evtCont03">
                    <h3><img src="/images/events/2024/event240424/evt2.png" alt="비버샘 PICK" /></h3>
                    <div className="blind">
                        <p>눈부시게 아름다운 상</p>
                        <p>전국의 선생님과 비버샘에게 감동을 주신 30분께 눈부시게 아름다운 상을 드립니다.</p>
                        <p>신세계 모바일 상품권 1만원</p>
                    </div>
                </div>


                <div className="notice">
                    <strong>유의사항</strong>
                    <ul>
                        <li>- 본 이벤트는 교사인증을 완료한 학교 선생님 대상 이벤트입니다.</li>
                        <li>- 이벤트는 1인 1회 참여하실 수 있습니다.</li>
                        <li>- '힐링 테마 깜짝 선물'과 '눈부시게 아름다운 상'은 중복으로 당첨 가능합니다.</li>
                        <li>- 상단에 고정된 사연은 선생님들의 공감을 가장 많이 받은 Best 3 사연으로, <br/>좋아요 수가 동일할 경우, 이벤트에 먼저 참여한 순서로 나열됩니다.<br />좋아요 실시간 순위는 화면 새로고침 후에 반영 됩니다.</li>
                        <li>- 참여 완료 후 수정 및 추가 참여가 어렵습니다.</li>
                        <li>- 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>- 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        <li>- 경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다. <br/>㈜카카오 사업자등록번호 : 120-81-47521, <br/>㈜다우기술 사업자등록번호: 220-81-02810, <br/>㈜모바일이앤엠애드 사업자등록번호:215-87-19169</li>
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
            member_id: this.props.memberId, // 멤버 아이디
            event_id: this.props.evenId, // eventId
            event_answer_desc: this.props.eventAnswerDesc, // 응답문항
            event_answer_desc2: "",
            BaseActions: this.props.BaseActions, // BaseAction
            logged: this.props.logged,
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
            indexNum: this.props.indexNum,
            likeCnt: this.props.likeCnt,
            likeYn: this.props.likeYn === "Y" ? true : false,
            likeMemberId: this.props.memberId,
            pageSize: this.props.pageSize
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅
        let eventSetName = JSON.stringify(this.state.memberId);
        let answers = JSON.stringify(this.state.event_answer_desc).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0].substring(1),
            likeCnt : answers[2].substring(4,answers[2].length-2)
        });
    };

    likeBtnClick = async (target) => {
        const {eventId,loginInfo,logged,history,BaseActions,commentConstructorList2} = this.props;
        const {likeMemberId} = this.state;

        if (!this.prerequisite(target)) {
            return;
        }

        const params = {
            eventId: eventId,
            memberId: loginInfo.memberId,
            likeMemberId: likeMemberId,
            likeCheck: target.checked
        };

        const response = await api.makeEventLike(params);

        this.setState({likeYn: !this.state.likeYn,
                            likeCnt: this.state.likeYn ? (this.state.likeCnt)-1:(this.state.likeCnt-1+2)});


        window.location.reload();
    }

    likeBtnAction = (e) => {
        this.likeBtnClick(e.target);
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


    render() {
        return (
            <div className={this.state.indexNum < 4 && this.state.pageSize == 12 ? "listItem best" : "listItem"}>
                <div className="txt">
                    <p>{this.state.event_answer_desc}</p>
                </div>
                <div className="like">
                    <input type="checkbox" name="like" id={"like"+ this.state.indexNum} checked={this.state.likeYn} value={this.state.likeMemberId} onChange={this.likeBtnAction} />
                    <label htmlFor={"like"+ this.state.indexNum} onClick={Event.componentDidMount} >
                        <p>{this.state.likeCnt}</p>
                    </label>
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
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));