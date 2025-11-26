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

const PAGE_SIZE = 6;
let i = -1;

class Event extends Component {
    state = {
        // eventId: 445,
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
        evtTabId: 1
    }

    componentDidMount = async () => {
        const {BaseActions, event, SaemteoActions} = this.props;
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

    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.teacherAnnual = '';
        event.teacherHope = '';
        SaemteoActions.pushValues({type: "event", object: event});
    }

    handleChange = (e) => {
        const {event, SaemteoActions} = this.props;

        if (!this.prerequisite(e)) {
            e.target.value = null;
            return;
        }

        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        if(e.target.name === 'teacherAnnual') {
            if(parseInt(e.target.value) < 1) {
                event[e.target.name] = "";
            }
            if(e.target.value.length > 2) {
                event[e.target.name] = e.target.value.substr(0, 2);
            }
        }

        SaemteoActions.pushValues({type: "event", object: event});
    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, eventId} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId : '562'});

            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    // 전제 조건
    prerequisite = async (e) => {
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
    eventApply = async () => {
        const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick, event} = this.props;
        const { isEventApply} = this.state;

        if (!await this.prerequisite()) {
            return;
        }

        try {
            const eventAnswer = {
                isEventApply : isEventApply
            };
            SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
            }, 1000);//의도적 지연.
        }
    };


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
        const {eventId} = this.props;

        const params = {
            eventId:  562,
            eventAnswerSeq: 2,
            answerIndex: 1
        };

        let response = await api.getSpecificEventAnswerCount(params);

        this.setState({
            eventAnswerCount: response.data.eventAnswerCount
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
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: 562,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.getEventAnswerList(params);

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
            pageSize : pageSize + PAGE_SIZE,
        });
    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 탭
    tabMenuClick = (e) => {
        const {evtTabId} = this.state;
        this.setState({
            evtTabId: e.currentTarget.value,
        });
    }

    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, eventViewAddButton, evtTabId} = this.state;

        // console.log(eventAnswerContents);

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
            <section className="event250421">
                <div className="evtTitWrap">
                    {/*<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>*/}
                    <h1><img src="/images/events/2025/event250421/evtTit.png" alt="비바샘 X 상상그리다필름 교과서로 떠나는 비상한 여행 GO"/></h1>
                    <div className="blind">
                        <strong>‘교과서로 떠나는 비상한 여행'이란?</strong>
                        <ul>
                            <li>비상교과서에 나오는 다양한 지역을 영상으로 재미있게 만날 수 있어요.</li>
                            <li>한 지역을 역사, 문화, 특산물 등 여러 교고의 다양한 관점에서 살펴볼 수 있어요.</li>
                            <li>융합 수업, 프로젝트 수업에 활용하기 좋아요.</li>
                        </ul>
                    </div>
                </div>

                <div className="evtCont01">
                    <div className="evtTit"><img src="/images/events/2025/event250421/evtCont1.png" alt=""/></div>
                    <div className="blind">
                        <h2>교과서로 떠나는 비상한 여행</h2>
                        <p>함께 떠나 볼까요? 프롤로그 영상을 보시고 이벤트에 참여하시면 달콤한 선물을 드립니다!</p>
    
                        <h3>이벤트 날짜 정보</h3>
                        <ul>
                            <li>참여 기간 : 4월 21일(월) ~ 5월 6일(화)</li>
                            <li>당첨자 발표 : 5월 9일(금)</li>
                        </ul>
                    </div>

                    <div className="cont_video">
                        <div className="videoCont">
                            <iframe id="ytVideo" src="https://www.youtube.com/embed/Q1OAf7mlZ-E?si=ZXbaDgtp3VoS-mQR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <h2 className="blind">이벤트 내용 정보</h2>
                    <div className="evtTabWrap">
                        <ul className="tabMenu">
                            <li className={evtTabId == 1 ? 'on' : ''}>
                                <button type="button" className="tab" onClick={this.tabMenuClick} value={1}><span><em className="blind">이벤트1 투표하GO</em></span></button>
                            </li>
                            <li className={evtTabId == 2 ? 'on' : ''}>
                                <button type="button" className="tab" onClick={this.tabMenuClick} value={2}><span><em className="blind">이벤트2 유튜브 보GO</em></span></button>
                            </li>
                        </ul>

                        {evtTabId == 1 ?
                        <div className="tabpanel tabpanel_1">
                            <img src="/images/events/2025/event250421/evtCont2_1.png" alt=""/>
                            <div className="blind">
                                <h3>이벤트1 투표하GO</h3>
                                <p>다음 에피소드의 여행지를 골라 주세요! 
                                    비상교과서에 나오는 지역 중 선생님의 투표를 많이 받은 곳을 직접 찾아가 영상을 제작합니다.
                                    다음 여행 장소와 그 이유를 작성해 주세요.
                                    100명을 추첨하여 달콤한 아이스크림을 드려요.</p>
                                <p>배스킨라빈스 파인트 아이스크림 100명</p>
                            </div>
                            <div className="btnWrap">
                                <button type="button" className="btn btnApply" onClick={this.eventApply}><span className="blind">투표하기</span></button>
                            </div>
                        </div>
                        : <div className="tabpanel tabpanel_2">
                            <img src="/images/events/2025/event250421/evtCont2_2.png" alt=""/>
                            <div className="blind">
                                <h3>이벤트2 유튜브 보GO</h3>
                                <p>비바샘 유튜브 채널을 구독하신 후
                                    영상에 ‘좋아요’와 ‘감상평 댓글’을 남겨 주세요.
                                    100명을 추첨하여 달콤한 디저트 세트를 드려요.</p>
                                <p>※이벤트 2 - 유튜브 보GO 이벤트 참여 방법은 유튜브 영상 하단의 '설명' 란을 참고해주세요</p>
                                <p>투썸플레이스 떠먹는 스초생 케이크 + 아메리카노(R) 100명</p>
                            </div>
                            <div className="btnWrap">
                                <a href="https://youtu.be/Q1OAf7mlZ-E?si=IL5ytnw0brh1RYPT" className="btn" target="_blank"><span className="blind">비바샘 유튜브 바로 가기</span></a>
                            </div>
                        </div>
                        }
                    </div>
                </div>

                <div className="evtCont03">
                    <h3><img src="/images/events/2025/event250421/evtCont3.png" alt="투표 현황을 보여 드려요!"/></h3>
                    <div className="commentWrap">
                        <ul className="commentList">
                            {
                                eventList.length > 0 ? eventList : (<li className="no-data"><p>텅~ 아직 작성된 내용이 없습니다.</p></li>)
                            }
                            {/*<li>
                                <strong className="teacher">viv**** 선생님</strong>
                                <ul className="info">
                                    <li><span className="tit">지역</span> <p className="txt">경상북도 경주시</p></li>
                                    <li><span className="tit">장소</span> <p className="txt">불국사</p></li>
                                    <li>
                                        <span className="tit">이유</span>
                                        <div className="txtWrap">
                                            <div className="inner">
                                                신라 문화 예술의 정수를 맛볼 수 있는
                                                맛볼 수 있는 경주를 추천합니다. 신라
                                                문화 예술의 정수를 맛볼 수 있습니다.
                                                신라 문화 예술의 정수를 맛볼 수 있는
                                                맛볼 수 있는 경주를 추천합니다.
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </li>*/}
                        </ul>
                        <button type="button" className="btnMore" style={{display: eventViewAddButton === 1 ? 'block' : 'none'}} onClick={this.commentListAddAction}><span className="blind">더보기</span></button>
                    </div>
                </div>
                <div className="evtFooter">
                    <h2>유의사항</h2>
                    <ul className="evtInfoList">
                        <li>비바샘 교사 인증을 완료하신 초·중·고 선생님만 참여하실 수 있습니다.</li>
                        <li>이벤트별로 1인 1회 참여하실 수 있습니다.</li>
                        <li>이벤트 1과 이벤트 2 중복 참여 및 당첨이 가능합니다.</li>
                        <li>개인 정보 오기재, 유효 기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>선물 발송을 위해 서비스사에 개인 정보가 제공됩니다. <br /> (주식회사 카카오 사업자 등록 번호: 120-81-47521, (주)모바일이앤엠애드 사업자 등록 번호: 215-87-19169)</li>
                        <li>경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                        <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다. </li>
                        <li>1개의 이벤트에만 참여하셔도 비바콘 100콘을 지급해 드립니다. 다만 2개 이벤트에 모두 참여하셔도 비바콘은 총 100콘만 지급됩니다.</li>
                    </ul>
                </div>
                {/* <FooterCopyright handleLogin={this.handleLogin}/> */}
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
            event_id: 562, // eventId
            event_answer_desc: this.props.event_answer_desc, // 응답문항
            event_answer_desc2: "",
            event_answer_desc3: "",
            reg_dttm: this.props.reg_dttm, // 등록일
            BaseActions: this.props.BaseActions, // BaseAction
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
            indexNum: this.props.indexNum
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        let masking = "*"
        eventSetName = eventSetName.substring(1, 4) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0],
            event_answer_desc2 : answers[1],
            event_answer_desc3 : answers[2]
        });


    };

    render() {
        const {eventName, event_answer_desc, event_answer_desc2, event_answer_desc3} = this.state;

        if(i >= 5){
            i =0;
        }else {
            i++;
        }

        return (
            <li>
                <strong className="teacher">{eventName} 선생님</strong>
                <ul className="info">
                    <li><span className="tit">지역</span> <p className="txt">{event_answer_desc}</p></li>
                    <li><span className="tit">장소</span> <p className="txt">{event_answer_desc2}</p></li>
                    <li>
                        <span className="tit">이유</span>
                        <div className="txtWrap">
                            <div className="inner">
                                {event_answer_desc3}
                            </div>
                        </div>
                    </li>
                </ul>
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));