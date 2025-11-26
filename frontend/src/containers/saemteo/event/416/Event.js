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
        isEventApply : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
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
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
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
        const {SaemteoActions, eventId, handleClick, loginInfo} = this.props;
        const {bookTitle, bookReason} = this.state;

        let eventAnswerContent = "";

        if (!this.prerequisite(e)) {
            return;
        }
        if(bookTitle.length === 0) {
            common.info("선생님의 인생 책 제목을 입력해 주세요.");
            return;
        }
        if(bookReason.length === 0) {
            common.info("이유를 입력해 주세요.");
            return;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eventAnswerContent: bookTitle + "^||^" + bookReason,
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

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

    // 이벤트2 입력창 입력마다
    setBookReason = (e) => {
        let bookReason = e.target.value;

        if (bookReason.length >= 40) {
            bookReason = bookReason.substring(0, 40);
        }

        this.setState({
            bookReason: bookReason
        });
    };

    setBookTitle = (e) => {
        if (!this.prerequisite(e)) {
            document.activeElement.blur();
        }

        let bookTitle = e.target.value;

        this.setState({
            bookTitle: bookTitle
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
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, bookTitle, bookReason, eventViewAddButton} = this.state;

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
            <section className="event220915">
                <div className="evtCont01">
                    <div className="evtBg1">

                    </div>
                    <h1>비상 한.줄</h1>
                    <p className="txt">
                        선선한 바람이 불어오는 가을은 독서의 계절!
                        나만 읽기는 아쉬운 ‘인생 책’을 공유해 주세요.
                        한,줄 추천을 공유해주신 선생님께 추첨을 통해 원하시는 선물을 드립니다.
                    </p>
                    <div className="evtPeriod">
                        <div className="blind">
                            <div><span className="tit">참여 기간</span><span
                                className="txt">2022.09.14(수) ~ 2022.09.30(금)</span></div>
                            <div><span className="tit">당첨자 발표</span><span>2022.10.07(금)</span></div>
                        </div>
                    </div>
                    <div className="evtGift">
                        <span className="giftTit"></span>
                        <ul>
                            <li>
                                <p>책과 함꼐 향기로운 커피를 스타벅스 카페 라떼</p>
                            </li>
                            <li>
                                <p>책상 위의 작은 티 카페 오설록 귤꽃향을 품은 우잣담</p>
                            </li>
                            <li>
                                <p>달콤한 음료로 독서에 집중 공차 딸기 주얼리 요구루트 크러쉬</p>
                            </li>
                        </ul>

                    </div>
                    <div className="evtBg2">

                    </div>
                </div>

                <div className="evtCont02">
                    <div className="cont_Wrap">
                        <h2 className="evt2Tit">
                            선생님이 가장 좋아하는 책을 한.줄로 추천해 주세요!
                            <p>한.줄을 남기실 땐, 아래 두 가지 항목을 포함해 주세요.</p>
                        </h2>
                        <div className="evtForm">
                            <dl className="tit">
                                <dt>
                                    제목
                                </dt>
                                <dd>
                                    <input type="text" placeholder="가장 좋아하는 책 제목" maxLength="100" onChange={this.setBookTitle} value={bookTitle}/>
                                </dd>
                            </dl>
                            <dl className="txt">
                                <dt>추천 이유</dt>
                                <dd>
                                    <textarea placeholder="한.줄로 추천 이유 작성(최대 40자)" maxLength="40"  onFocus={this.onFocusComment} onChange={this.setBookReason} value={bookReason}></textarea>
                                </dd>
                            </dl>
                        </div>
                        <span className="count"><span className="currentCount">{bookReason.length}</span>/40</span>
                        <button className="submitBtn" onClick={this.eventApply}>
                            <img src="/images/events/2022/event220915/submitBtn.png" alt="한.줄 남기기"/>
                        </button>
                    </div>

                    {eventAnswerCount > 0 &&
                    <div className="commentWrap cont_Wrap">
                        <h2 className="commentTit">
                            선생님의 인생책 한.줄 저장소
                        </h2>
                        <div className="commentList">
                            {eventList}
                        </div>
                        <button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
                            더보기
                        </button>
                    </div>}

                </div>
                <div className="notice"><span className="noticeTit">유의사항</span>
                    <ul>
                        <li>① 1인 1회 참여하실 수 있습니다.</li>
                        <li>② 참여 완료 후에는 수정 및 추가 참여가 어렵습니다.</li>
                        <li>③ 모든 경품은 참여하신 휴대전화번호로 발송되며,<br />
                            유효기간이 지난 기프티콘은 다시 발송해 드리지 않습니다.
                        </li>
                        <li>
                            ④ 선물 발송을 위해 개인정보(성명,휴대전화번호)가 서비스사와<br />
                            상품 배송업체에 제공됩니다 (㈜카카오 사업자등록번호 120-81-47521)
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
        let bookTitle = answers[0]; // 책제목
        let bookReason = answers[1]; //책 선정 이유

        bookTitle = bookTitle.replace(/\\r\\n/gi, '<br/>');
        bookTitle = bookTitle.replace(/\\n/gi, '<br/>');

        bookReason = bookReason.replace(/\\r\\n/gi, '<br/>');
        bookReason = bookReason.replace(/\\n/gi, '<br/>');

        this.setState({
            eventName: eventSetName,
            bookTitle: bookTitle,
            bookReason: bookReason,
        });
    };

    render() {
        return (
            <div className={"listItem" + " comment"  + " comment0" + this.state.indexNum}>
                <span className="book_title">{this.state.bookTitle}</span>
                <span className="user_name">{" (" + this.state.eventName + " 선생님)"}</span>
                <p dangerouslySetInnerHTML={{__html: this.state.bookReason}}></p>
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