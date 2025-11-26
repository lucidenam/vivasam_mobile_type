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
        eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/432',
        listOn: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false},

    }

    componentDidMount = async () => {
        const {BaseActions, event, SaemteoActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.checkEventCount();   		// 이벤트 참여자 수 조회
            // await this.commentConstructorList();	// 이벤트 댓글 목록 조회
            // await this.countConstructorList();
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

        event.charNum = "";
        event.charName = "";
        SaemteoActions.pushValues({type: "event", object: event});
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
        common.info('링크가 복사되었습니다.\n동료 선생님과 함께 공모전에 참여해 보세요.');
    };

    handleChange = (e) => {
        const { listOn } = this.state;

        for(let i=0; i<9; i++) {

            if(i == e.target.value - 1) {
                listOn[i] = true;
            }else {
                listOn[i] = false;
            }
        }

        this.setState({
            listOn : listOn,
        })


        const {event, SaemteoActions} = this.props;

        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return;
        }

        event['charNum'] = e.target.value;
        event['charName'] = e.target.dataset.name;

        SaemteoActions.pushValues({type: "event", object: event});
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

    insertApplyForm = async () => {
        const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;

        try {
            BaseActions.openLoading();

            var params = {
                eventId: eventId,
                eventAnswerDesc: "",
                eventAnswerDesc2: event.charNum,
                cellphone: "",
                userInfo: "",
                schCode: "",
            };

            let response = await SaemteoActions.insertEventApply(params);

            if (response.data.code === '1') {
                common.error("이미 신청 하셨습니다.");
            } else if (response.data.code === '0') {
                // 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
                if (event.schCode && event.schCode !== this.state.initialSchCode) {
                    MyclassActions.myClassInfo();
                }
                common.info("투표 참여가 완료되었습니다.");
                history.push("/");

            } else if (response.data.code === '5') {
                common.error("마일리지의 잔액이 모자랍니다. 다시 확인해주세요.");
            } else if (response.data.code === '6') {
                common.error("마일리지 적립/차감에 실패하였습니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            } else {
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }

        } catch (e) {
            console.log(e);
            common.info(e.message);
            history.push('/saemteo/event/view/'+eventId);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;
        const {evtComment, choosedItem} = this.state;

        if (!this.prerequisite(e)) {
            return;
        }

        if(event.charNum == "") {
            common.info("캐릭터를 선택해 주세요.");
            return;
        }

        try {
            // 신청 처리
            await this.insertApplyForm();
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
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, bookTitle, bookReason, eventViewAddButton, evtComment, listOn} = this.state;

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

        //리스트 생성
        const listItem = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const list = listItem.map(a => {
        return  (<li className={listOn[a-1] ? 'on' : ''} >
                    <img src={"/images/events/2023/event230220/character" +  a  + ".png"} alt="캐릭터 공모전 투표" />
                    <input type="radio" name="competition" id={"competition"+ a} value={a} onClick={this.handleChange} />
                    <label htmlFor={"competition" + a}>공모전 이미지</label>
                </li>)
        });

        return (
            <section className="event230220">
                <div className="evtCont01">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="evtTit">
                        <img src="/images/events/2023/event230220/evtCont1.png" alt="캐릭터 공모전 투표" />
                        <div className="blind">
                            <h1>
                                선생님과 함께 만드는
                                비바샘 캐릭터 공모전
                                인기투표
                            </h1>
                            <p>
                                비바샘 캐릭터를 만들어 주신 361명의 선생님 감사합니다!
                                1차 심사를 통과함 캐릭터 후보를 소개합니다.

                                지금 바로 마음에 드는 캐릭터에 투표해 주세요!
                                비바샘 대표 캐릭터는 1차 심사 점수와 인기투표 점수를 합산하여 선정됩니다.
                            </p>

                            <ul className="evtPeriod">
                                <li>
                                    <span className="tit"><em className="blind">투표기간</em></span><span className="txt">2023년 2월 20일 ~ 2월 26일</span>
                                    <span>(1인 1회 투표가능, 중복 투표 불가)</span>
                                </li>
                            </ul>
                        </div>
                        <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                            <span className="blind">이벤트 공유하기</span>
                        </button>
                    </div>
                </div>

                <div className="evtCont02">
                    <h2>
                        <span className="blind">선생님의 비버샘 One Pick픽은!?</span>
                    </h2>
                    <span className="count_wrap"><span className="count">{eventAnswerCount}</span></span>
                    <ul className="competition_list">
                        {list}
                    </ul>
                    <button className="btnVote" onClick={this.eventApply}>
                        <span></span>
                    </button>
                </div>


                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>① 투표는 1인 1회 참여하실 수 있습니다.</li>
                        <li>② 비바샘 회원가입 및 교사인증을 완료하셔야 투표가 가능합니다.</li>
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