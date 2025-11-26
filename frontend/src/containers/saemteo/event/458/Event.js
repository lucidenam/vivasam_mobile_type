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
        eventUrl: 'https://www.vivasam.com/event/2023/viewEvent458',
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
            <section className="event230809">
                {/*<span className="teacherProgram">교사문화 프로그램 46차</span>*/}
                <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                <div className="evtCont1">
                    <h1><img src="/images/events/2023/event230809/evtTit.png" alt="인생날" /></h1>
                    <div className="blind">
                        <div className="evtTit">
                            <h2>
                                인생 날 시즌 2 비바샘터 재즈살롱
                            </h2>
                            <p>
                                재즈와 함께하는 힐링의 순간,
                                비바샘터 재즈살롱에 선생님을 초대합니다!
                            </p>
                            <p>
                                2월 선생님들의 사랑을 듬뿍 받은 인생날 프로그램 기억하시나요?
                                특별한 영화관에서 힐링을 선사했던 시즌1에 이어 시즌2는 재즈 음악회를 준비했어요.
                                일상을 특별하게 만들어줄 재즈 이야기와 생생한 라이브 공연까지!
                                감동과 힐링이 있는 비바샘터 재즈살롱에 선생님을 초대합니다.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="evtCont2">
                    <h1><img src="/images/events/2023/event230809/evtCont1.png" alt="인생날" /></h1>
                    <div className="blind">
                        <div className="evtPeriod">
                            <strong><span className="blind">행사 개요</span></strong>
                            <div>
                                <div>
                                    <p>인생날</p>
                                    <div>
                                        <span className="tit blind">일시</span><span className="txt"><span
                                        className="blind">2023.9.2(토) 11:00~12:50</span></span>
                                    </div>
                                    <div>
                                        <span className="tit blind">장소</span><span className="txt"><span
                                        className="blind">한남동 올댓재즈</span></span>
                                    </div>
                                    <div>
                                        <span className="tit blind">내용</span>
                                        <span className="txt blind">즐거운 재즈 토크쇼와 라이브 공연 감상</span>
                                    </div>
                                </div>
                                <ul>
                                    <li>
                                        <span>1부</span>
                                        <h3>방과후 재즈 살롱</h3>
                                        <p>
                                            평범한 국어 선생님이 재즈를 듣게 된 사연은?
                                            재즈 초심자도 쉽게 이해할 수 있는 재즈 이야기와 추천 곡
                                        </p>
                                    </li>
                                    <li>
                                        <span>2부</span>
                                        <h3>재즈에 물들다</h3>
                                        <p>
                                            선생님만을 위한 프라이빗 재즈 음악회!
                                            힐링이 필요한 선생님을 라이브 공연에 초대합니다.
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <strong><span className="blind">진행자 및 아티스트</span></strong>
                            <div className="blind">
                                <h3><span>1부</span>토크쇼 진행자</h3>
                                <p>이강휘 선생님 <span>(재즈 좋아하는 인문쟁이)</span></p>
                                <ul>
                                    <li>- 마산무학여자고등학교 국어교사</li>
                                    <li>- &lt;어쩌다 보니 재즈를 듣게 되었습니다&gt;, &lt;무기가 되는 토론의 기술&gt; 저자</li>
                                    <li>- 제10회 브런치북 출판 프로젝트 특별상 수상</li>
                                </ul>
                            </div>
                            <div className="blind">
                                <h3><span>1부</span>재즈 아티스트</h3>
                                <p>이경은</p>
                                <ul>
                                    <li>- 리치파이 보컬리스트</li>
                                    <li>- 단국대학원 예술경영학 석사</li>
                                    <li>- 인순이, 김건모, 허각, 주현미, 변진섭, 김수희,
                                        홍경민, 박상민, 장윤정 외 코러스
                                    </li>
                                    <li>- 뮤지컬 ‘맘마미아’ 코러스 앙상블 등</li>
                                </ul>
                                <ul>
                                    <li>강신혜 <span>피아노</span></li>
                                    <li>박지웅 <span>베이스</span></li>
                                    <li>정승우 <span>드럼</span></li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <strong><span className="blind">특별한 혜택</span></strong>
                            <div className="blind">
                                <p>
                                    프로그램 종료 후 깜짝 이벤트가 있어요.​
                                    두근두근 선물을 기대해 주세요!​
                                </p>
                            </div>
                            <div className="blind">
                                <p>
                                    참여해주시는 모든 분들께
                                    맛있는 케이터링 도시락을 드려요!
                                </p>
                                <span>
                                           논알콜 음료와 물도 함께 제공합니다.
                                       </span>
                            </div>
                        </div>
                        <div>
                            <strong><span className="blind">신청 안내</span></strong>
                            <div>
                                <div>
                                    <span className="tit blind">신청 기간</span><span className="txt"><span
                                    className="blind">2023.8.11(금) ~ 8.27(일)</span></span>
                                </div>
                                <div>
                                    <span className="tit blind">당청 발표</span><span className="txt"><span
                                    className="blind">2023.8.28(월)</span></span>
                                </div>
                                <div>
                                    <span className="tit blind">초대 인원</span>
                                    <span className="txt blind">90명 (동료 선생님 동반 신청 가능)</span>
                                </div>
                                <div>
                                    <span className="tit blind">참가비</span>
                                    <span className="txt blind">3천원 + 자율기부금 <span>*참가비는 소외계층 교육을 위한 학생복지기금으로 전액 기부됩니다. 자율기부금은 개인 선택사항입니다.</span></span>
                                </div>
                            </div>
                            <div>
                                <h3 className="blind">당첨 꿀팁</h3>
                                <ul>
                                    <li className="blind">① 페이지 하단 기대 평 작성시, 당첨확률 UP!</li>
                                    <li className="blind"> ② 함께 하고 싶은 동료 선생님에게 이벤트 공유하기</li>
                                    <li className="blind">③ 동료 선생님도 프로그램 신청하면 당첨 확률 2배!</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                        <span className="blind">이벤트 공유하기</span>
                    </button>

                    <a href="https://map.naver.com/v5/entry/place/11571524?lng=126.9981224&lat=37.5347153&placePath=%2F&c=15,0,0,0,dh" target="_blank" className="btnMap"><span className="blind">약도보기</span></a>

                    <button type="button" className="btnApply" onClick={this.eventApply}>
                        <span className="blind">신청하기</span>
                    </button>

                    <div>
                        <img src="/images/events/2023/event230809/evtInfo.png" alt="인생날" />
                        <div>
                            <strong className="blind">유의사항</strong>
                            <ul>
                                <li className="blind">선정된 선생님만 참석 가능하며, 다른 선생님께 당첨 기회를 양보하실 수 없습니다.</li>
                                <li className="blind">한정된 인원으로 진행되는 행사인 만큼, 행사 당일 참석 가능 여부를 꼭 확인해 주세요.</li>
                                <li className="blind">별도의 안내없이 불참하신 경우, 이후 프로그램 신청에 제약이 있을 수 있습니다.</li>
                            </ul>
                            <p className="blind">기대평은 PC에서 작성 가능합니다</p>
                        </div>
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