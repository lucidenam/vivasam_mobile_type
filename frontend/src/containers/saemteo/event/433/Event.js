import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";
import {bindActionCreators} from "redux";
import ReactPlayer from 'react-player/youtube'

const PAGE_SIZE = 10;

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
        eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/432',
        tabOn: 1,
        ytVideoSwitch1: false,
        ytVideoSwitch2: false,
        ytVideoThumb1: false,
        ytVideoThumb2: false,
        ytVideoPause: 1,
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

    //유튜브 재생
    ytVideoPlay = (e) => {
        const {ytVideoSwitch1, ytVideoSwitch2, ytVideoThumb1, ytVideoThumb2} =this.state;

        if(e.currentTarget.value == 1){
            this.setState({
                ytVideoSwitch1: true,
                ytVideoThumb1: true,

            })
        }else {
            this.setState({
                ytVideoSwitch2: true,
                ytVideoThumb2: true,
            })
        }
    }

    tabOnChange = (e) => {
        const { tabOn, ytVideoPause, ytVideoSwitch1, ytVideoSwitch2 } = this.state;

        console.log(e.currentTarget.value);

        if(e.currentTarget.value == 1){
            this.setState ({
                ytVideoSwitch2: false,
            })
            console.log(ytVideoSwitch2);
        }else {
            this.setState ({
                ytVideoSwitch1: false,
            })
            console.log(ytVideoSwitch1);
        }

        this.setState({
            tabOn: e.currentTarget.value,
        })

    };


    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.teacherAnnual = '';
        event.teacherHope = '';
        SaemteoActions.pushValues({type: "event", object: event});
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
        common.info('링크가 복사되었습니다.\n동료 선생님과 함께 공모전에 참여해 보세요.');
    };


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
    eventApply = async () => {
        const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick, event} = this.props;
        const { isEventApply} = this.state;

        if (!logged) { // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        }
        // 교사 인증
        if (loginInfo.certifyCheck === 'N') {
            BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return;
        }
        // 준회원일 경우 신청 안됨.
        if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return;
        }
        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return;
        }

        // if(event.teacherAnnual == null || event.teacherAnnual.length == 0) {
        //     common.error("선생님의 연차를 입력해 주세요.");
        //     return;
        // }

        if(!(1 <= event.teacherAnnual && event.teacherAnnual <= 99)) {
            common.error("선생님의 년차를 1~99까지만 입력해 주세요.");
            return;
        }

        // if(event.teacherHope == '' || event.teacherHope.length == 0) {
        //     common.error("선생님의 행복 포인트를 기록해 주세요.");
        //     return;
        // }

        if(event.teacherHope.length <= 1) {
            common.error("최소 2자~최대 200자까지 입력할 수 있어요");
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
        common.info('링크가 복사되었습니다.\n동료 선생님과 함께 투표에 참여해 보세요.');
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
        console.log(responseList);
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
            <section className="event230228">
                <div className="evtCont01">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="evtTit">
                        <img src="/images/events/2023/event230228/evtCont1.png" alt="선생님 행복 ON" />
                        <div className="blind">
                            <h2>
                                <span>비바샘 X 상상그리다필름</span>
                                영상 ON AIR 프로젝트1
                                선생님 행복 ON
                            </h2>
                            <span>새내기 선생님과 선배 교사의 일상 속 소소한 행복은 무엇일까요?</span>
                            <p>
                                영상을 시청하고
                                성생님의 소소한 행볻 포인트를 공유해주세요.
                                비바샘은 선생님의 소소한 행복을 모아 더 큰 행복으로 돌려드립니다.
                            </p>
                            <ul className="evtPeriod">
                                <li><span className="tit"><em className="blind">참여 기간</em></span><span className="txt">2023.2.28(화) ~ 2023.3.17(금)</span>
                                </li>
                                <li><span className="tit tit2"><em className="blind">당첨자 발표</em></span><span
                                    className="txt txt2">2023.3.24(금)</span></li>
                            </ul>
                        </div>
                        <div className="video_wrap">
                            <div className="tab_wrap">
                                <ul className="tab_menu">
                                    <li className={tabOn == 1 ? 'on': ''}>
                                        <button onClick={this.tabOnChange} value={1}>
                                            <div className="txt_wrap">
                                                <span className="video_tit">1년차 새내기 선생님</span>
                                                <span className="video_txt">소소한 행복이야기</span>
                                            </div>
                                        </button>
                                    </li>
                                    <li className={tabOn == 2 ? 'on': ''}>
                                        <button  onClick={this.tabOnChange} value={2}>
                                            <div className="txt_wrap">
                                                <span className="video_tit">11년차 선배 선생님</span>
                                                <span className="video_txt">소소한 행복이야기</span>
                                            </div>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className={"tab_conts " + (tabOn == 1? "on": "")} >
                                <div>
                                    <div className={"thumb " + (ytVideoSwitch1 ? " " : "on") }>
                                        <img src="/images/events/2023/event230228/thumb1.png" alt="1년차 선생님" />
                                        <button onClick={this.ytVideoPlay} value={1}>
                                            <span className="blind">
                                                재생하기
                                            </span>
                                        </button>
                                    </div>
                                    <ReactPlayer
                                        url={'https://youtu.be/zOu0DkWoF3A?t=2'}
                                        width="100%"
                                        height="100%"
                                        playing={ytVideoSwitch1}
                                    />
                                </div>
                            </div>
                            <div className={"tab_conts " + (tabOn == 1?" " : "on")} >
                                <div>
                                    <div className={"thumb " + (ytVideoSwitch2 ? "": "on") }>
                                        <img src="/images/events/2023/event230228/thumb2.png" alt="11년차 선생님" />
                                        <button onClick={this.ytVideoPlay} value={2}>
                                            <span className="blind">
                                                재생하기
                                            </span>
                                        </button>
                                    </div>
                                    <ReactPlayer
                                        url={'https://youtu.be/zOu0DkWoF3A?t=88'}
                                        width="100%"
                                        height="100%"
                                        playing={ytVideoSwitch2}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <img src="/images/events/2023/event230228/evtCont2.png" alt="참여방법" />
                    <a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.youtube.com/@vivasam_official')} className="btnLink">
                        <span className=" blind">비바샘 유튜브 채널 바로가기</span>
                    </a>
                    <div className="blind">
                        <div>
                            <h3>참여 방법</h3>
                            <p>
                                상상그리다필름 선생님들이 제작한 영상을 시청하고
                                선생님의 소소한 행복이 담긴 하루를 기록해주세요.
                                <span>영상은 비바샘 유튜브 계정에서도 시청 가능합니다.</span>
                            </p>
                            <p>비바샘 계정 구독 후 영상에 댓글 남기면 당첨 확률 UP!</p>
                        </div>
                    </div>
                </div>

                <div className="evtForm">
                    <div className="formTop">
                        <p>
                            <span>2023년,</span>
                            <input
                                type="number"
                                min="1"
                                max="99"
                                name="teacherAnnual"
                                onChange={this.handleChange}
                                onKeyUp={this.numTest}
                                value={event.teacherAnnual}
                            />
                                년차 교사의 소소한 행복 기록장
                        </p>
                    </div>
                    <div className="formBox">
                                <textarea
                                    placeholder="선생님의 소소한 행복 포인트는 무엇인가요?(200자 이내)"
                                    name="teacherHope"
                                    onChange={this.handleChange}
                                    value={event.teacherHope}
                                    maxLength="200"
                                ></textarea>
                        <span className="count"><span className="currentCount">{event.teacherHope == undefined ? 0 : event.teacherHope.length}</span>/200</span>
                    </div>
                    <button className="btnApply" onClick={this.eventApply}>
                        <span className="blind">참여하기</span>
                    </button>
                </div>

                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>① 1인 1회 참여하실 수 있습니다.</li>
                        <li>② 참여 완료 후에는 수정 및 추가 참여가 어렵습니다.</li>
                        <li>③ 폴라로이드 경품의 경우, 제세공과금(22%)이 부여됩니다.</li>
                        <li>④ 정확하지 않은 휴대전화 정보로 반송되거나 유효 기간동안 기프티콘을 사용하지 않은 경우, 재발송되지 않습니다.</li>
                        <li>⑤ 경품(폴라로이드, 학급간식)은 재직하고 계신 학교 택배함 또는 교무실로 배송됩니다.</li>
                        <li>⑥ 이벤트 당첨자의 잘못된 개인정보 전달로 인한 불이익(연락 불가, 경품 반송/분실 등)은 책임지지 않습니다</li>
                        <li>⑦ 경품 발송 전 제세공과금, 학급 인원 수 파악을 위해 따로 연락드릴 예정입니다</li>
                    </ul>
                </div>

                <div>
                    {eventAnswerCount > 0 &&
                    <div className="commentWrap cont_Wrap">
                        <div className="inner">
                            <div className="commentList">
                                {eventList}
                                <button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
                                    <span className="blind">더보기</span>
                                </button>
                            </div>
                        </div>
                    </div>}
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
        let masking = "*"
        eventSetName = eventSetName.substring(1, (eventSetName.length-4)) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        console.log(answers[0]);

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0],
            event_answer_desc2 : answers[1],
        });
    };

    render() {
        const {eventName, event_answer_desc, event_answer_desc2} = this.state;
        return (
            <div className="listItem">
                <p><span>{event_answer_desc}년차 {eventName}</span>선생님의 행복 기록장</p>
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