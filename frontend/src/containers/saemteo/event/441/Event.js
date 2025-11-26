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

const PAGE_SIZE = 10;

class Event extends Component {
    state = {
        isEventApply : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용 (응답)
        eventAnswerCount: 0,		// 이벤트 참여자 수 (해당 이벤트 응답 수)
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtComment: '',
        choosedItem: '',
        eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/441',
        tabOn: 1,

        StoryCheck: "", // 선택한 선생님
        agreeCheck: 0, // 개인정보 체크
        agreeCheckNote: 0, // 유의사항 체크
        storyLength: 0, // 길이 카운트
        storyContents: "",
        initialStoryPage: true, // 첫 랜더링시 사연 추가 방지
        StoryLogInInfo: this.props.loginInfo, // 접속 정보
        applyContent: '',
        applyName: ''
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

    numTest = (e) => {
        const num = /[1-99]/
        console.log(!num.test(e.target.value));
        if(!num.test(e.target.value)) {
            e.target.value = '';
            common.error("선생님의 년차를 1~99까지만 입력해 주세요.");
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

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const {event, SaemteoActions, eventId} = this.props;
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
    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, event, eventId} = this.props;

        if (logged) {
            event.eventId = eventId; // 이벤트 ID
            const response = await api.chkEventJoin({eventId});
            // const response = await api.eventInfo({eventId});

            if (response.data.eventJoinYn === 'Y') {
            // if (response.data.code === '3') {
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async () => {
        const {
            logged,
            loginInfo,
            history,
            BaseActions,
            SaemteoActions,
            eventId,
            handleClick,
            event,
            eventAnswer
        } = this.props;
        // const {isEventApply} = this.state;

        if (!logged) { // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        } else {
            // 준회원일 경우 신청 안됨.
            if (loginInfo.mLevel != 'AU300') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
                return false;
            }

            // 교사 인증
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 로그인시
            try {
                if (this.state.isEventApply) {
                    common.error("이미 참여하셨습니다.");
                } else {
                    handleClick(eventId);
                }
            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(() => {
                }, 1000);//의도적 지연.
            }
        }
    };

    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, bookTitle, bookReason, eventViewAddButton, evtComment, tabOn, ytVideoSwitch1, ytVideoSwitch2, ytVideoThumb1, ytVideoThumb2 } = this.state;
        const {event} = this.props;
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
            <section className="event230327">
                <div className="evtCont01">
                    {/*<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>*/}
                    <div className="evtTit">
                        <img src="/images/events/2023/event230327/evtCont1.png" alt="2023 꿈지기 캠페인" />
                        <div className="blind">
                            <p className="blind">
                                <strong>세상에 ‘단 하나 뿐인 꿈 명함’에<br />
                                    특별한 추억과 꿈을 새겨드립니다.​<br /></strong>
                                우리반, 우리 동아리 학생들에게<br />
                                꿈 명함을 선물하고 싶은 사연을 남겨주세요!​​
                            </p>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <img src="/images/events/2023/event230327/evtCont2.png" alt="2023 꿈지기 캠페인" />
                    <ul className="evtPeriod blind">
                        <li><span className="tit">1학기 모집 일정</span><span className="txt">03.29(월) ~ 6.23(금)</span></li>
                        <li><span className="tit">당첨자 발표</span><span className="txt">4.26(수) / 5.31(수) / 6.28(수)</span></li>
                        <li><span className="tit">당첨자 선물</span><span className="txt">학생 1인당​ 1통의 꿈 명함​</span><span className="txt">선생님의 꿈 명함과 토퍼​ + 후기 선물​</span></li>
                        <li>
                            <span className="tit">꿈 명함 제작 일정</span>
                            <span className="txt">학생 1인당​ 1통의 꿈 명함​</span>
                            <ul>
                                <li>당첨 안내</li>
                                <li>1주 후 - 명함 정보 확인</li>
                                <li>3주 후 - 꿈 명함 제작 완료</li>
                                <li>3일 후 - 꿈 명함 수령</li>
                                <li>1주 후 - 캠페인 후기 수급</li>
                            </ul>
                        </li>
                        <li>
                            <span className="tit">꼭 참고하세요!</span>
                            <ul>
                                <li>학급, 동아리 40명 이내 그룹 단위로만 신청 가능합니다.</li>
                                <li>구체적인 꿈 명함 활용 계획을 알려주시면 당첨 확률이 올라갑니다.</li>
                                <li>당첨되신 분께 꿈 명함 제작을 위한 정보를 요청 드립니다.</li>
                                <li>'꿈지기 생생후기' 게시판에 후기 사진 게재를 위해 학생들의 초상권 활용 동의서를 수급합니다.</li>
                                <li>꿈 명함 수령 후 만족도 조사 및 후기 작성에 꼭 참여해주세요.​</li>
                            </ul>
                        </li>
                    </ul>

                    <a href="https://v.vivasam.com/event/dreamMate/dream2023Part.do" className="btnReview"><span className={"blind"}>꿈지기 생성 후기</span></a>

                    <button className="btnApply" onClick={this.eventApply}>
                        <span className="blind">참여하기</span>
                    </button>
                </div>

                <div className="evtCont03" style={{display: this.state.eventAnswerCount !== 0 ? 'block' : 'none'}}>
                    <img src="/images/events/2023/event230327/evtCont3.png" alt="2023 꿈지기 캠페인" />
                    <div className="blind">
                        <h3>꿈 명함 신청 사연</h3>
                    </div>
                    {/*{eventAnswerCount > 0 &&*/}
                    <div className="commentWrap cont_Wrap">
                        <div className="commentList">
                            {eventList}
                            {/*style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }}*/}
                        </div>
                        <button className="btnMore"
                                style={{display: this.state.eventViewAddButton == 1 ? 'block' : 'none'}}
                                onClick={ this.commentListAddAction }>
                            <span className="blind">더보기</span>
                        </button>
                    </div>
                    {/*}*/}
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

    componentDidMount = async () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        let masking = "*"
        eventSetName = eventSetName.substring(1, (eventSetName.length-4)) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0],
            event_answer_desc2 : answers[2],

        });
    };

    render() {
        const {eventName, event_answer_desc, event_answer_desc2} = this.state;
        return (
            <div className="listItem">
                <p>{eventName}선생님</p>
                <div className='comment'>
                    <p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc2}}></p>
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
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));