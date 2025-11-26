import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter,Link} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
const PAGE_SIZE = 3;
class Event extends Component {
    state = {
        eventId: 503,
        eventId1: 504,
        eventId2: 505,
        pageNo:1,
        pageSize:PAGE_SIZE,
        isEventApply : false,       // 신청여부
        isEventApply2 : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/503',
        myRecomCnt : 0,
        memberRegType:null,

    }

    componentDidMount = async () => {
        const {BaseActions ,logged} = this.props;
        BaseActions.openLoading();
        try {

            await this.eventApplyCheck();

            if (logged) {
                await this.getMyRecomCnt();
            }

        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

    };

    getMyRecomCnt = async () => {
        const {myRecomCnt} = this.state;
        const {logged } = this.props;

        const myRecomCntApi = await api.getMyRecomCnt();

        let getMyRecomCnt = myRecomCntApi.data.myRecomCnt;

        if (logged) {
            let memberRegType = myRecomCntApi.data.memberRegType;
            this.setState({
                memberRegType: memberRegType,
            });

        }

        this.setState({
            myRecomCnt: getMyRecomCnt
        });

    }

    // 기 신청 여부 체크
    eventApplyCheck = async (eventId) => {
        const {logged} = this.props;
        const {eventId1, eventId2} = this.state;

        if (logged) {
            const response = await api.chkEventJoin({eventId: eventId1});
            const response2 = await api.chkEventJoin({eventId: eventId2});

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

            else if (response.data.eventJoinYn === 'N') {
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

        // // 기 신청 여부
        // if (isEventApply) {
        //     common.error("이미 신청하셨습니다.");
        //     return false;
        // }

        return true;
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;
        const {isEventApply} = this.state;


        // await this.eventApplyCheck(underEventId);


        if (!this.prerequisite(e)) {
            return;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        try {
            const eventAnswer = {
                // isEventApply: isEventApply2,
                eventId: 504,
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

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply2 = async (e) => {
        const {SaemteoActions, eventId, handleClick, BaseActions,  loginInfo, event} = this.props;
        const {isEventApply2, memberRegType} = this.state;

        // await this.eventApplyCheck(underEventId);

        if (!this.prerequisite(e)) {
            return;
        }

        if(memberRegType === 'A001'){
            common.info("기존 회원 선생님은 추천 이벤트 참여하기 버튼을 클릭해서 이벤트에 참여해 주세요.")
            return false;
        }

        if (isEventApply2) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        if (this.state.memberRegType === 'B001') {
            // 교사 인증 여부
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
        }

        // 기 신청 여부
        if (isEventApply2) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        try {
            const eventAnswer = {
                eventId: 505,
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
        common.info('링크가 복사되었습니다.');
    };

    render() {
        const {logged, loginInfo , myRank} = this.props;
        const {myRecomCnt} = this.state;

        return (
            <section className="event240524">
                <div className="evtCont1">
                    <button className="btnShare" onClick={this.copyToClipboard}><span className="blind">이벤트 공유하기</span></button>
                    <h1><img src="/images/events/2024/event240524/img1.png" alt="모여봐요~ 비바샘!" /></h1>
                    <div className="blind">
                        <h2>
                            모여봐요~
                            비바샘!
                        </h2>
                        <p>추천인 수가 모이면 커지는 선물 ♥</p>
                        <dl>
                            <dt>참여 기간</dt>
                            <dd>5월 24일(금) ~ 6월 23일(일)</dd>
                        </dl>
                        <dl>
                            <dt>당첨자 발표</dt>
                            <dd>
                                6월 26일(수)
                                * 발표 당일 선물 발송
                            </dd>
                        </dl>
                        <p>
                            에듀테크 서비스와 최신 수업 자료가 풍성한
                            비바샘을 동료 선생님께 추천해 주세요!
                        </p>
                        <ul>
                            <li>
                                동료 선생님이 추천인 아이디 입력 후 회원가입 및 교사인증을 완료하면
                                추천 선생님과 신규 회원 선생님 모두에게 100% 선물을 드립니다.
                            </li>
                            <li>
                                아직 비바샘 회원이 아니라면?
                                회원가입 및 교사인증 후 100% 선물도 받고 추천 이벤트에도
                                참여하실 수 있어요!
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont2">
                    <h1><img src="/images/events/2024/event240524/img2.png" alt="모여봐요~ 비바샘!" /></h1>
                    <div className="blind">
                        <p>당첨 경품</p>
                        <p>추천인 선물</p>
                        <ul>
                            <li>신세계상품권 모바일 교환권  5만원</li>
                            <li>투썸플레이스 딸기 생크림 1호</li>
                            <li>투썸플레이스 아메리카노 R 2잔 떠먹는 티라미수, 아이스박스</li>
                            <li>스타벅스 아메리카노 T 2잔+ 클라우드 치즈케이크</li>
                            <li>스타벅스 아메리카노 T 2잔</li>
                            <li>스타벅스 카페라떼 T 1잔</li>
                        </ul>
                        <ul>
                            <li>· 추천인 선생님 ID 입력 기준에 따라 경품이 지급됩니다.</li>
                            <li>· 추천인 수는 선생님이 이벤트 참여하기를 접수한 시점부터 집계됩니다.</li>
                            <li>· 추천인 수가 0명인 경우, 이벤트 참여에서 제외됩니다.</li>
                        </ul>
                        <p>신규 회원 선물</p>
                        <p>신규 회원가입 선생님 스타벅스 카페라떼 T 1잔 100% 선물</p>
                    </div>
                </div>
                <div className="evtCont3">
                    <h1><img src="/images/events/2024/event240524/img3.png" alt="모여봐요~ 비바샘!" /></h1>
                    <div className="blind">
                        <p>기존 회원 참여 방법</p>
                        <ul>
                            <li>
                                아래의 이벤트 참여하기 버튼 클릭 후
                                동료 선생님께 비바샘을 추천하고
                                선생님의 ID를 알려주세요!
                            </li>
                            <li>
                                동료 선생님은 회원가입 단계에서
                                최하단 추천인 아이디 “있음”을 클릭,
                                비바샘을 추천한 선생님의  아이디를
                                기입해주세요!
                            </li>
                            <li>
                                동료 선생님이  회원가입 후
                                교사인증을 완료하면 참여 완료!
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont4">
                    <h1><img src="/images/events/2024/event240524/img4.png" alt="모여봐요~ 비바샘!" /></h1>
                    <div className="blind">
                        <p>신규 회원 참여 방법</p>
                        <ul>
                            <li>
                                하단의 ‘회원가입 바로가기’버튼을
                                클릭 후 회원가입과 교사인증을
                                진행해주세요.
                            </li>
                            <li>
                                가입 완료 후 해당 이벤트 페이지에
                                ‘신규 회원 선생님 이벤트 참여하기’
                                버튼을 클릭하면 참여 완료!
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="evtCont5">
                    <div className="blind">실시간 선생님 추천인 수</div>

                    {/* 로그인 전 */}
                    {!logged &&
                        (
                            <div className="evtLoginBox">
                                <p className="evtAlertTxt">
                                    로그인하시면 나의 추천인 아이디<br/>
                                    집계 현황을 확인할 수 있습니다.
                                </p>
                                <div className="evtBtns">
                                    <Link to="/login"><img src="/images/events/2024/event240524/btn_login.png" alt="로그인"/></Link>
                                    <Link to="/join/select"><img src="/images/events/2024/event240524/btn_join.png" alt="회원가입"/></Link>
                                </div>
                            </div>

                        )
                    }

                    {/* 로그인 후 && 이벤트 참여한 경우  */}
                    {logged && typeof myRecomCnt === 'number' &&
                        (
                            <div className="evtLoginBox">
                                <h4>
                                    <span>{loginInfo.memberName}</span> 선생님 <br/><span>현재 추천인 아이디 수</span> : <em>{myRecomCnt}</em>명
                                </h4>
                                <p className="evtInfoTxt">*선생님이 이벤트 참여하기를 접수한 시점부터 집계됩니다.</p>
                            </div>
                        )
                    }
                    {/* 로그인 후 && 이벤트 참여 안한 경우  */}
                    {logged && typeof myRecomCnt === 'string' && (
                        <div className="evtLoginBox">
                            <p className="evtAlertTxt aside20">
                                참여하기를 클릭 후, 동료 선생님이 추천인 ID를 입력하여 회원가입 후 교사인증을 완료하면 실시간 추천인 수에 집계 됩니다.
                            </p>
                        </div>
                    )}


                    <div className="evtBtnBox btn1">
                        <button type="button" className="btnApply pop1" onClick={this.eventApply}>
                            <span className="blind">참여하기</span>
                        </button>
                    </div>
                    <div className="evtBtnBox btn2">
                        <button type="button" className="btnApply pop2" onClick={this.eventApply2}>
                            <span className="blind">참여하기</span>
                        </button>
                    </div>
                </div>
                <div className="evtFooter">
                    <div className="inner">
                        <strong>유의사항</strong>
                        <ul>
                            <li>이벤트에서 비바콘은 지급되지 않습니다.</li>
                            <li>본 이벤트를 통해 신규 회원가입 및 교사인증을 완료한 선생님은 추천인 <br/>아이디 입력 유무와 상관없이 회원가입 100% 선물을 드립니다. </li>
                            <li>본 이벤트는 비바샘 교사 인증을 완료한 선생님 대상 이벤트입니다.</li>
                            <li>추천인 아이디 이벤트는 기존 회원(학교 선생님) 대상 이벤트로, 신규 회원은 <br/>회원가입 및 교사인증 완료 후 이벤트에 참여하실 수 있습니다. </li>
                            <li>신규 회원은 회원가입 100% 선물과 추천인 선물을 중복으로 받으실 수 있습니다. </li>
                            <li>이벤트 경품은 추천인 아이디 입력 기준에 따라 지급됩니다. </li>
                            <li>추천인은 이벤트 참여하기를 접수한 시점부터 집계되며, 동료 선생님이 <br/>회원가입 및 교사인증을 완료하셔야 집계됩니다.</li>
                            <li>이벤트 참여 후, 이벤트 기간 내 탈퇴 시 이벤트 참여로 인정되지 않습니다.</li>
                            <li>추천인 수가 0명인 경우 이벤트 참여에서 제외되며, 추천인 수 1명부터 <br/>경품이 100%로 지급됩니다.</li>
                            <li>추천인 아이디 입력 누락, 오기입으로 인한 경품 발송은 불가합니다. </li>
                            <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                            <li>경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.</li>
                            <li>이벤트 당첨자의 잘못된 개인 정보 전달로 인한 불이익 <br/>(연락 불가, 경품 반송/분실 등)은 책임지지 않습니다. <br/>(㈜카카오 사업자등록번호 : 120-81-47521), <br/>(㈜다우기술 사업자등록번호: 220-81-02810), <br/>(㈜모바일이앤엠애드 사업자등록번호:215-87-19169)</li>
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
                <div className="box">
                    <div className="txt_box">
                        <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
                    </div>
                    <p className="name">{eventName} 선생님</p>
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