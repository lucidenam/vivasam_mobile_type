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

const PAGE_SIZE = 15;

class Event extends Component {
    state = {
        isEventApply : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtComment: '',
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/514',
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();

            // await this.checkEventCount();   		// 이벤트 참여자 수 조회
            // await this.commentConstructorList();	// 이벤트 댓글 목록 조회
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

        // 최초 조회시 전체건수가 5건이상이면 더보기 버튼 표시
        if(this.state.eventAnswerCount > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }
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
            <section className="event240805">
                {/*<span className="teacherProgram">교사문화 프로그램 55차</span>*/}
                <div className="evtCont1">
                    <h1><img src="/images/events/2024/event240805/evt_tit.png" alt="" /></h1>
                    <div className="blind">
                        <div className="evtTit">
                            <h2>
                                인생 날 시즌 4 비바샘터 뮤지컬 시어터
                            </h2>
                            <p>
                                비바샘과 함께하는 코미디 연극 관람,
                                비바샘터 극장으로 선생님을 초대합니다!
                            </p>
                            <p>
                                아름다운 멜로디와 서사로 감동적인 순간을 선물했던
                                지난 ‘인생날 시즌3’에 이어 인생날 시즌4는
                                무더운 여름 빵빵 터지는 웃음으로
                                시원한 하루를 보낼 수 있는 코미디 연극을 준비했습니다.

                                웃음 가득한 연극과 함께 2학기의 시작을 비바샘과 함께해요!
                            </p>

                        </div>
                    </div>
                </div>
                <div className="evtCont2">
                    <img src="/images/events/2024/event240805/evt_cont.png" alt="" />
                    <div className="blind">
                        <div>
                            <h2>신청안내</h2>
                            <ul>
                                <li>신청기간: 2024.8.5(월)~8.18(일)</li>
                                <li>당첨 발표: 2024.8.19(월)</li>
                                <li>초대 인원: 200명 (동료 선생님 동반 신청 가능)</li>
                                <li>참가비: 3천원 + 자율기부금<br/>*참가비는 소외계층 교육을 위한 학생복지기금으로 전액 기부됩니다. 자율기부금은 개인 선택사항입니다.</li>
                            </ul>
                        </div>
                        <div>
                            <div>
                                <h2>행사 개요</h2>
                                <ul>
                                    <li>일시: 2024.8.24(토) 오후 14시30분~17시</li>
                                    <li>장소: 대학로 아트포레스트 1관(혜화역 근처)</li>
                                    <li>내용: 비바샘 퀴즈타임(10분)<br/>뮤지컬 ‘썸데이’ 관람(100분)</li>
                                </ul>
                            </div>
                            <div>
                                <strong>연극 ‘늘근도둑이야기’ 시놉시스​</strong>
                                <p>
                                    두 늙은 도둑의 노후 대책을 위한 마지막 한 탕!
                                    그런데 하필 ‘그 분’의 미술관을!

                                    대통령 취임 특사로 감옥에서 풀려난 두 늙은 도둑은 노후 대책을
                                    위한 마지막 한탕을  꿈꾸며 어느 부잣집, 하필 ‘그 분’의 미술관에
                                    잠입한다.

                                    엄청난 부와 권위를 자랑하는 ‘그 분’의 미술관엔 세계적인
                                    미술작품들이 소장되어 있지만 작품의 가치를 모르는 두 늙은
                                    도둑은 오직 금고만을 노린다. 경비견이 잠들기까지 옥신각신
                                    금고 앞을 지키던 두 사람은 결국 조사실로 끌려가게 되는데…

                                    있지도 않은 범행 배후와 있을 수도 없는 사상적 배경을 밝히려는
                                    수사관, 그리고 엉뚱한 소리만 늘어놓는 두 늙은 도둑의 포복절도
                                    코미디가 시작된다!
                                </p>
                            </div>
                        </div>
                        <div>
                            <h2>당첨 꿀팁</h2>
                            <ul>
                                <li>① 페이지 하단 기대 평 작성시, 당첨확률 UP!</li>
                                <li>② 함께 하고 싶은 동료 선생님에게 이벤트 공유하기</li>
                                <li>③ 동료 선생님도 프로그램 신청하면 당첨 확률 2배!</li>
                            </ul>
                        </div>
                    </div>

                    <a href="https://naver.me/GXEgtFgA" target="_blank" className="btnMap"><span className="blind">약도보기</span></a>
                    <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                        <span className="blind">이벤트 공유하기</span>
                    </button>
                    <button type="button" className="btnApply" onClick={this.eventApply}>
                        <span className="blind">신청하기</span>
                    </button>
                </div>
                <div className="evtInfo">
                    <img src="/images/events/2024/event240805/evt_info.png" alt="" />
                    <div className="blind">
                        <strong>유의사항</strong>
                        <ul>
                            <li>초대된 인원만 참석하실 수 있으며, 다른 선생님께 당첨 기회를 양도하실 수 없습니다.​</li>
                            <li>한정된 인원으로 진행되는 행사인 만큼, 행사 당일 참석 가능 여부를 꼭 확인해 주세요.​</li>
                            <li>별도의 안내 없이 불참하는 경우, 이후 프로그램 신청에 제약이 있을 수 있습니다.</li>
                            <li>신청 선생님 및 동료 선생님 모두 현장에서 초대 명단 확인 후 입장이 가능합니다.</li>
                            <li>행사 당일 현장 스케치용 촬영이 진행되며 사진은 상업적인 사용 목적이 아닌 기업의 활동 소개를 위해 사용될 수 있습니다.</li>
                        </ul>
                        <p>기대평은 PC에서 작성 가능합니다</p>
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
        // this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        eventSetName = eventSetName.substring(1, (eventSetName.length-4)) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0],
        });
    };

    render() {
        return (
            <div className={"listItem" + " comment"  + " comment0" + this.state.indexNum}>
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