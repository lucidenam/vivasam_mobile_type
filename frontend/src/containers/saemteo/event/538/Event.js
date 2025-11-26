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

const PAGE_SIZE = 6;

class Event extends Component {
    state = {
        isEventApply: false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtComment: '',
        eventUrl: 'https://www.vivasam.com/event/2025/viewEvent538',
        replyAnswer: "", // 댓글 내용
        replyAnswerCnt: 0, // 댓글 길이
        replyTotalCount: 0,
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.commentConstructorList();

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
        const {evtComment} = this.state;

        if (!this.prerequisite(e)) {
            return;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eventAnswerContent: evtComment,
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


    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId} = this.props;
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize,
                eventId: eventId

            }
        };

        const responseList = await api.getSpecificEventAnswerList3(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        let cnt = responseList.data.replyTotalCnt;

        for (let i = 0; i < eventJoinAnswerList.length; i++) {
            let eventSetName = eventJoinAnswerList[i].REG_MEMBER_ID;
            let masking = "";
            for (var x = 1; x < eventJoinAnswerList.length - 4; x++) {
                masking += "*";
            }
            eventJoinAnswerList[i].eventName = eventSetName.substring(0, 3) + masking; // 이벤트 참여자 아이디
        }

        this.setState({
            replyTotalCnt: cnt
        });

        // 최초 조회시 전체건수가 6건이상이면 더보기 버튼 표시
        if (this.state.replyTotalCnt > PAGE_SIZE) {
            this.setState({
                eventViewAddButton: 1
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if (this.state.replyTotalCnt <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        this.setState({
            eventAnswerContents: eventJoinAnswerList,
            pageSize: this.state.pageSize + PAGE_SIZE,
            pageNo: this.state.pageNo + 1
        });
    };

    // 댓글 더보기
    moreCommentConstructorList = async () => {
        const {eventId} = this.props;
        const {pageNo, eventAnswerContents} = this.state;

        const params = {
            eventId: 538,
            answerPage: {
                pageNo: this.state.pageNo,
                pageSize: this.state.pageSize,
                eventId: eventId
            }
        };

        const responseList = await api.getSpecificEventAnswerList3(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        let cnt = responseList.data.replyTotalCnt;

        let preData = this.state.eventAnswerContents;
        let getData = preData.concat(eventJoinAnswerList);

        for (let i = 0; i < getData.length; i++) {
            let eventSetName = getData[i].REG_MEMBER_ID;
            let masking = "";
            for (var x = 1; x < eventSetName.length - 4; x++) {
                masking += "*";

            }
            getData[i].eventName = eventSetName.substring(0, 3) + masking; // 이벤트 참여자 아이디
        }

        this.setState({
            replyTotalCnt: cnt
        });

        // 최초 조회시 전체건수가 6건이상이면 더보기 버튼 표시
        if (this.state.replyTotalCnt > PAGE_SIZE) {
            this.setState({
                eventViewAddButton: 1
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if (this.state.replyTotalCnt <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        this.setState({
            eventAnswerContents: getData,
            pageSize: this.state.pageSize + PAGE_SIZE,
            pageNo: this.state.pageNo + 1
        });

    };

    clickTextARea = async (e) => {
        const {BaseActions, logged, history} = this.props;

        if (!logged) { // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        }
    }

    checkTextArea = async (e) => {
        this.setState({
            replyAnswer: e.target.value,
            replyAnswerCnt: e.target.value.length
        })
    }

    // 댓글 등록
    writeReply = async () => {
        const {loginInfo, BaseActions} = this.props;
        // const {replyAnswer, pageSize, pageNo} = this.state;

        if (loginInfo.mLevel != 'AU300') {
            common.info("준회원은 참여하실 수 없습니다.\n고객센터로 문의해 주세요(1544-7714)");
            return false;
        }

        // 교사 인증
        if (loginInfo.certifyCheck === 'N') {
            common.info("교사 인증 후 이벤트 참여를 해주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return false;
        }

        const content = this.state.replyAnswer;

        if (content.length === 0 || !content.trim()) {
            alert("기대평을 입력해주세요.");
            return false;
        }

        const param = {
            eventId: 538,
            replyAns: {
                // eslint-disable-next-line no-restricted-globals
                refUrl: location.href,
                contents: content,
                memberId: loginInfo.memberId,
                eventId: 538
            }
        };

        const response = await api.writeReply(param);

        this.setState({
            pageSize: 6,
            pageNo: 1,
            replyAnswer: ""
        });

        this.commentConstructorList();
    }

    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, bookTitle, bookReason, eventViewAddButton, evtComment, replyAnswer} = this.state;
        const {logged} = this.props;

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
        // const eventList = eventAnswerContents.map((eventList, index) => {
        //
        //     if(loopIndex >= 6) {
        //         loopIndex = 1;
        //     } else {
        //         loopIndex++;
        //     }
        //
        //     const result = <EventListApply {...eventList} key={eventList.event_answer_id} indexNum={loopIndex}/>;
        //     return result;
        // });

        return (
            <section className="event250208">
                {/*<span className="teacherProgram">교사문화 프로그램 46차</span>*/}
                <div className="evtCont1">
                    <h1><img src="/images/events/2025/event250208/evt_tit.png" alt="인생날 시즌5" /></h1>
                    <div className="blind">
                        <div className="evtTit">
                            <h2>
                                인생 날 시즌 5 비바샘과 함께하는 문화한 하루
                            </h2>
                            <p>
                                오직 선생님만을 위한 교사문화 프로그램,
                                2025년의 첫번째 이야기!
                                흥미진진한 코믹 서스펜스 연극을 준비했어요!
                            </p>
                            <p>
                                25년 새학기 시작 전,
                                비바샘이 준비한 즐거운 공연으로
                                동료 선생님과 문화한 하루를 보내보세요.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="evtCont2">
                    <h1><img src="/images/events/2025/event250208/evt_cont.png" alt="인생날 시즌5"/></h1>
                    <div className="blind">
                        <div className="evtPeriod">
                            <strong><span className="blind">신청 안내</span></strong>
                            <div>
                                <div>
                                    <p>인생날</p>
                                    <div>
                                        <span className="tit blind">신청 기간</span><span className="txt"><span
                                        className="blind">2025년 2월 8일 (토) ~ 2월 16일 (일)</span></span>
                                    </div>
                                    <div>
                                        <span className="tit blind">당첨자 발표</span><span className="txt"><span
                                        className="blind">2월 17일 (월)</span></span>
                                    </div>
                                    <div>
                                        <span className="tit blind">신청 기간</span>
                                        <span className="txt blind">200명 (동료 선생님 동반 신청 가능)</span>
                                    </div>
                                </div>
                                <ul>
                                    <li>
                                        <p>
                                            초대된 인원만 참석하실 수 있으며,
                                            다른 선생님께 당첨 기회를 양도하실 수 없습니다.
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            한정된 인원으로 진행되는 행사인 만큼,
                                            행사 당일 참석 가능 여부를 꼭 확인해 주세요.
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            별도의 안내 없이 불참하는 경우, 이후 프로그램 신청에
                                            제약이 있을 수 있습니다.
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <strong><span className="blind">행사 개요</span></strong>
                            <div>
                                <div>
                                    <span className="tit blind">일시</span><span className="txt"><span
                                    className="blind">2025년 2월 22일 (토) 오후 12시 ~ 13시 40분</span></span>
                                </div>
                                <div>
                                    <span className="tit blind">장소</span><span className="txt"><span
                                    className="blind">JTN 아트홀 3관 (혜화역 근처)</span></span>
                                </div>
                                <div>
                                    <span className="tit blind">참가비</span>
                                    <span className="txt blind">3천원 + 자율기부금</span>
                                    <ul>
                                        <li>* 자율기부금은 개인 선택 사항입니다.</li>
                                        <li>* 참가비는 소외 계층 교육을 위한 학생 복지 기금으로 전액 기부됩니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div>
                            <strong><span className="blind">프로그램 소개</span></strong>
                            <div className="blind">
                                <h3>연극 '오백의 삼십'</h3>
                            </div>
                            <div className="blind">
                                <h3>시놉식스</h3>
                                <p>
                                    보증금 500에 월세 30, 서울의 한 동네에 있는 돼지 빌라.
                                    옆집에 누가 사는지도 모르고 무관심한 세상이라지만,
                                    돼지빌라는 다릅니다.
                                    주인 아주머니도 좋으신 분이고 인정이 많은 이웃도 넘치거든요!
                                    고작 7평짜리 원룸이지만 겨울에는 따뜻하고 여름에는 시원한
                                    돼지빌라에서 사람들은 삶을 배워 나갑니다.
                                    그러던 어느 날 평화로운 돼지빌라에서 의문의 살인사건이 일어나는데...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="winTip">
                    <img src="/images/events/2025/event250208/evt_cont2.png" alt="당첨 꿀팁"/>
                    <div>
                        <h3 className="blind">당첨 꿀팁</h3>
                        <ul>
                            <li className="blind">① 페이지 하단 기대 평 작성시, 당첨확률 UP!</li>
                            <li className="blind"> ② 함께 하고 싶은 동료 선생님에게 이벤트 공유하기</li>
                            <li className="blind">③ 동료 선생님도 프로그램 신청하면 당첨 확률 2배!</li>
                        </ul>
                    </div>
                    <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                        <span className="blind">이벤트 공유하기</span>
                    </button>
                    <button type="button" className="btnApply" onClick={this.eventApply}>
                        <span className="blind">신청하기</span>
                    </button>
                </div>
                <div>
                    <div>
                        <strong className="blind">유의사항</strong>
                        <ul>
                            <li className="blind">신청 선생님 및 동료 선생님 모두 현장에서 초대 명단 확인 후 입장이 가능합니다.</li>
                            <li className="blind">행사 당일 현장 스케치용 촬영이 진행되며 사진은 상업적인 사용 목적이 아닌 기업의 활도 소개를 위해 사용될 수 있습니다.</li>
                        </ul>
                    </div>
                </div>

                {/* 기대평 */}
                <div className="evtCont evtCont03">
                    <div className="commentInputWrap">
                        {!logged ?
                            (
                                <div className="textareaWrap">
                                    <textarea name="" id="" cols="30" rows="10" placeholder="로그인 후 작성해 주세요."
                                              onClick={this.clickTextARea}></textarea>
                                    <button className="btn_cmt"><span className="blind">등록</span></button>
                                </div>
                            )
                            :
                            (
                                <div className="textareaWrap">
                                    <textarea name="" id="" cols="30" rows="10" placeholder="프로그램 기대평을 남겨주세요! (300자 이내)"
                                              value={replyAnswer} onInput={this.checkTextArea}></textarea>
                                    <div className="text">
                                        <span className="remaining"><span className="count">{this.state.replyAnswerCnt}</span>/<span
                                            className="totCount">300</span></span>
                                    </div>
                                    <button className="btn_cmt" onClick={this.writeReply}><span
                                        className="blind">등록</span></button>
                                </div>
                            )
                        }
                    </div>
                </div>

                <div className="evtCont evtCont04">
                    <div className="commentWrap">
                        <div className="commentList">
                            {eventAnswerContents.map((item, index) => (
                                <div className="listItem comment" key={index}>
                                    <strong>{item.eventName} 선생님</strong>
                                    <p>{item.CONTENTS}</p>
                                </div>
                                )
                            )}
                            <button type="button" className="btn_more"
                                    style={{display: eventViewAddButton == 1 ? 'block' : 'none'}}
                                    onClick={this.moreCommentConstructorList}><span>더보기</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* 기대평 */}
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
        // this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        eventSetName = eventSetName.substring(1, (eventSetName.length - 4)) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc: answers[0],
        });
    };

    render() {
        return (
            <div className={"listItem" + " comment" + " comment0" + this.state.indexNum}>
                <span className="user_name">{this.state.eventName + " 선생님"}</span>
                <p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc}}></p>
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