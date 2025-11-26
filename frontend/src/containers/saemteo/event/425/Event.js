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
        const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;
        const {evtComment, choosedItem} = this.state;

        if (!this.prerequisite(e)) {
            return;
        }
        if(choosedItem.length === 0) {
            common.info("트리의 장식을 선택해 주세요.");
            return;
        }

        if(evtComment.length === 0) {
            common.info("소원을 적어주세요.");
            return;
        }

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
            <section className="event221212">
                <div className="evtCont01">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="evtTit">
                        <img src="/images/events/2022/event221212_2/evtCont1.png" alt="비상한 트리" />
                        <div className="blind">
                            <h1>VISNAG + 한해 8탄 비상한 트리</h1>
                            <p>
                                올 한해도 열심히 달려오신 선생님들꼐 감사드립니다.
                                2022년네 희망하셨던 것들은 모두 이루셨을까요?
                                못 다 이룬 소원을 담아, 비상한.트리를 장식해 주세요.
                            </p>
                            <span>선생님들이 만드는 비상한.트리</span>
                            <p>훈훈한 메시지로 트리를 꾸며 주신 분들 중 추처믕ㄹ 통해 500분꼐 랜덤 선물을 드립니다.</p>

                            <dl>
                                <dt>참여 기간.</dt>
                                <dd>2022.12.12.(월) ~ 12.23.(금)</dd>
                                <dt>당첨자 발표.</dt>
                                <dd>2022.12.26.(월)</dd>
                                <dt>당첨인원.</dt>
                                <dd>총 500명</dd>
                            </dl>

                            <ul>
                                <li>
                                    스타벅스 카페라뗴 (2잔)
                                </li>
                                <li>
                                    메가박스 관람권 (1인)
                                </li>
                                <li>
                                    교보문고 금액권 (1만원)
                                </li>
                                <li>
                                    신세계 모바일 교환권 (1만원)
                                </li>
                                <li>
                                    설빙 팥인정미설빙
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <h2>
                        트리를 꾸미고 싶은 장식을 선택하고, 소원을 적어 주세요!
                    </h2>
                    <span className="tree_count_wrap"> <span className="tree_count">{eventAnswerCount}</span></span>
                    <div className="tree_decoration">
                        <ul>
                            <li className="cookie">
                                <input type="radio" id="deco1" name="deco" value="쿠키" onClick={this.chooseItem}/>
                                <label htmlFor="deco1"></label>
                                <span className="like">{eventAnsweritemsCount.cookie}</span>
                            </li>
                            <li className="circle">
                                <input type="radio" id="deco2" name="deco" value="원형트리" onClick={this.chooseItem}/>
                                <label htmlFor="deco2"></label>
                                <span className="like">{eventAnsweritemsCount.circle}</span>
                            </li>
                            <li className="hat">
                                <input type="radio" id="deco3" name="deco" value="모자" onClick={this.chooseItem}/>
                                <label htmlFor="deco3"></label>
                                <span className="like">{eventAnsweritemsCount.hat}</span>
                            </li>
                            <li className="bell">
                                <input type="radio" id="deco4" name="deco" value="장식볼" onClick={this.chooseItem}/>
                                <label htmlFor="deco4"></label>
                                <span className="like">{eventAnsweritemsCount.bell}</span>
                            </li>
                            <li className="socks">
                                <input type="radio" id="deco5" name="deco" value="양말" onClick={this.chooseItem}/>
                                <label htmlFor="deco5"></label>
                                <span className="like">{eventAnsweritemsCount.socks}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="evtForm">
                        <div className="formBox">
                                <textarea
                                    placeholder="선생님께서 바라는 소원을 적어 주세요. (50자 이내)"
                                    onChange={this.setEvtComment}
                                    value={evtComment}
                                    maxLength={50}
                                ></textarea>
                            <span className="count">(<span className="currentCount">{evtComment.length}</span>/50)</span>
                        </div>
                        <button className="btnApply" onClick={this.eventApply}>
                            <span>참여하기</span>
                        </button>
                    </div>
                    <div>
                        {eventAnswerCount > 0 &&
                        <div className="commentWrap cont_Wrap">
                            <div className="commentList">
                                {eventList}
                            </div>
                            <button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
                                <img src="/images/events/2022/event221212_2/btnMore.png" alt="더보기" />
                            </button>
                        </div>}
                    </div>
                </div>


                <div className="notice">
                    <strong>유의사항</strong>
                    <ul>
                        <li> 본 이벤트는 1인 1회 참여하실 수 있습니다.</li>
                        <li> 선택하신 요소와 메시지 내용은 변경하실 수 없습니다.</li>
                        <li> 선물 발송을 위해 개인정보(성명, 휴대폰번호)가 서비스사와 상품<br />배송업체에 배송업체에 제공됩니다.</li>
                        <li>
                            (㈜카카오 사업자등록번호 120-81-47521),(주)모바일이앤엠애드<br  /> 사업자등록번호 215-87-19169)
                        </li>
                        <li> 개인정보 오류 또는 유효기간이 지난 상품은 재발송해 드리지 않습니다.</li>
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