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

const itemKorEnMap = {
    쿠키: 'cookie',
    원형트리: 'circle',
    모자: 'hat',
    장식볼: 'bell',
    양말: 'socks',
}

let eventAnsweritemsCount = {
    cookie : 0,
    circle : 0,
    hat : 0,
    bell : 0,
    socks : 0,
}

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
            common.info("준회원은 참여하실 수 없습니다.\n고객센터로 문의해 주세요(1544-7714)");
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
        // if(choosedItem.length === 0) {
        //     common.info("트리의 장식을 선택해 주세요.");
        //     return;
        // }
        //
        // if(evtComment.length === 0) {
        //     common.info("소원을 적어주세요.");
        //     return;
        // }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eventAnswerContent: choosedItem + "^||^" + evtComment,
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

        if (evtComment.length >= 50) {
            evtComment = evtComment.substring(0, 50);
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

    initCountList = () => {
        eventAnsweritemsCount = {
            cookie : 0,
            circle : 0,
            hat : 0,
            bell : 0,
            socks : 0,
        };
    }

    // 참여 정보 출력
    countConstructorList = async () => {
        const {eventAnswerCount} = this.state;
        const {eventId} = this.props;

        this.initCountList();

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
            eventAnsweritemsCount[itemKorEnMap[answers[0]]]++; //각 아이템별 참여갯수
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
            <section className="event230116">
                <div className="evtCont01">
                        <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                        <img src="/images/events/2023/event230116/evtCont1.png" alt="비바샘 인스타그램 팔로우" />
                        <div className="blind">
                            <h2>비바샘의 새해엔 새 친구가 필요해</h2>
                            <p>
                                2023년 비바샘 인스타그램의 친구가 되어주세요
                                친구가 되어주신 선생님에게 추첨을 통해 따뜻한 선물을 드려요!
                            </p>
                            <ul className="evtPeriod">
                                <li><span className="tit">참여 기간</span><span className="txt">2023년 1월 6일(월) ~ 2023년 2월 12일(일)</span></li>
                                <li><span className="tit">당첨자 발표</span><span className="txt">이벤트 기간 중 매주 화요일 / 비바샘 공지사항</span></li>
                            </ul>
                            <div>
                                <h3>비바샘의 인스타그램 친구 공약</h3>
                                <ul>
                                    <li>
                                        하나! 계기수업자료, 쌤채널 콘텐츠 등 수업에 활용할 수 있는
                                        다양한 수업자료를 전할게요.
                                    </li>
                                    <li>
                                        둘! 선생님만을 위한 비바샘의 다양한 이벤트 소식을 빠르게 전할게요.
                                    </li>
                                    <li>
                                        셋! 선생님을 위한 힐링 콘텐츠를 전할게요.
                                    </li>
                                </ul>
                                <div>
                                    <span>경품</span>
                                    <ul>
                                        <li>
                                            <span>매주 250명</span>
                                            <p>스타벅스 마페 아메리카노T</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                </div>
                <div className="evtCont02">
                    <img src="/images/events/2023/event230116/evtCont2.png" alt="참여방법" />
                    <div className="blind">
                        <div>
                            <span>참여방법</span>
                            <ul>
                                <li>
                                    <span>STEP01</span>
                                    <p>인스타그램에서 비바샘 계정을 검색 또는 QR코드를 스캔한다.</p>
                                </li>
                                <li>
                                    <span>STEP02</span>
                                    <p>비바샘 계정을 팔로우 한다.</p>
                                </li>
                                <li>
                                    <span>STEP03</span>
                                    <p>팔로우 후 본 이벤트 페이지 내 응모하기 버튼을 누른다</p>
                                </li>
                                <li>
                                    <span>STEP04</span>
                                    <p>응모에 필요한 개인 정보를 기입하고 신청을 완료한다 (*성함, 핸드폰 번호, 인스타그램ID) </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <a href="https://www.instagram.com/vivasam_official/" target="_blank" className="btnInstagram"><span>@vivasma_offical<br />바로가기</span></a>
                    <button className="btnApply" onClick={this.eventApply}>
                        <span>참여하기</span>
                    </button>
                </div>
                <div className="notice">
                    <strong>유의사항</strong>
                    <ul>
                        <li>경품은 매주 수요일 선생님의 휴대 전화번호로 발송됩니다. </li>
                        <li>본 이벤트는 1인 1회 참여할 수 있습니다.</li>
                        <li>개인정보 오기재로 인한 경품 재발송은 불가합니다.</li>
                        <li>팔로우 취소 시 경품이 발송되지 않습니다.</li>
                        <li>경품 발송을 위해 개인정보(성명, 휴대 전화번호)가 서비스사에 제공됩니다.<br />
                            (㈜카카오 사업자등록번호 120-81-47521)
                        </li>
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
            indexNum: this.props.indexNum,
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        eventSetName = eventSetName.substring(1, (eventSetName.length-4)) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');
        let choosedItem = itemKorEnMap[answers[0]];

        this.setState({
            eventName: eventSetName,
            event_answer_desc : choosedItem,
            event_answer_desc2 : answers[1].split('\\n').join(''),
        });
    };

    render() {
        return (
            <div className={"listItem" + " comment"  + " comment0"  + this.state.indexNum + " " + this.state.event_answer_desc}>
                <p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc2}}></p>
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