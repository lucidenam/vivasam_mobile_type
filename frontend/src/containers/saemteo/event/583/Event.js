import React, {Component, useState} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import * as myclassActions from "../../../../store/modules/myclass";
import {maskingStr} from "../../../../lib/StringUtils";
import $ from "jquery";
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";



const PAGE_SIZE = 8;
const WEEK_LINKS = [
    "https://text.vivasam.com/",                // 1주차
    "https://text.vivasam.com/P_gallery_intro", // 2주차
    "https://text.vivasam.com/",                // 3주차
    "https://text.vivasam.com/vivasam"          // 4주차
];
class Event extends Component {
    state = {
        isEventApply: false,       // 신청여부
        isEventApply2: false,       // 신청여부(중고등)
        schoolLvlCd: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventAnswerLeaveCnt: 0, // 남은 댓글 수
        questionAnswer: null, // 정답 선택값
        replyTotalCount: 0,
        replyAnswer: "",
        eventUrl:'https://mv.vivasam.com/#/saemteo/event/view/583',
        btnClickYn: true,
        thisWeek:[false,false,false,false],
        eventAttendance: [
           ["2025-08-29 00:00:00", "2025-09-07 23:59:59"],
           ["2025-09-08 00:00:00", "2025-09-21 23:59:59"],
           ["2025-09-22 00:00:00", "2025-10-05 23:59:59"],
           ["2025-10-06 00:00:00", "2025-10-17 23:59:59"]
           ],

        eventJoinDate: [false,false,false,false],
        joinDate:null,
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

        await this.setEventInfo();
        await this.weekActive();
    };

    handleTabClick = (idx) => {
        const { thisWeek } = this.state;
        if (!thisWeek[idx]) {
            alert('이벤트 기간이 아닙니다.');
            return;
        }
    };

    questionSelect = async(e) => {
        const { name } = e.target; // 'event1' | 'event2' | 'event3' | 'event4'
        // 라디오(1/3/4주차)
        if (name === 'event1' || name === 'event3' || name === 'event4') {
            this.setState({ questionAnswer: e.target.value });
            return;
        }

        // 텍스트(2주차)
        if (name === 'event2') {
            const inputs = document.querySelectorAll('.tabpanel.on input[name="event2"]');
            const joined = Array.from(inputs).map(el => (el.value || '').trim()).join('');
            this.setState({ questionAnswer: joined });
        }
    }

    onlyAlpha = (e) => {
        var $el = $(e.currentTarget);
        var v = $el.val() || '';
        v = v.replace(/[^A-Za-z]/g, '').slice(0, 1);
        $el.val(v.toUpperCase());

        this.questionSelect(e);
    }

    // 이번주 체크
    weekActive = async  () => {
        const {eventAttendance,thisWeek,joinDate,eventJoinDate} = this.state;
        const today = new Date();
        let testData = "";
        let myCheckDay = [false,false,false,false];

        if (joinDate != null && joinDate.indexOf("&") > -1){
            testData = joinDate.split("&");
            this.setState({
                eventJoinDate : testData
            });
        }

        // 현재 주차 check
        for (let i = 0; i < eventAttendance.length; i++) {
            const startDate = new Date(eventAttendance[i][0]);
            const endDate = new Date(eventAttendance[i][1]);

            if (startDate <= today && today <= endDate) {
                const test1 = [true,false,false,false];
                const test2 = [false,true,false,false];
                const test3 = [false,false,true,false];
                const test4 = [false,false,false,true];

                if (i == 0) {
                    this.setState({
                        thisWeek: test1
                    });
                } else if(i == 1) {
                    this.setState({
                        thisWeek: test2
                    });
                } else if(i == 2) {
                    this.setState({
                        thisWeek: test3
                    });
                } else if(i == 3) {
                    this.setState({
                        thisWeek: test4
                    });
                }
            }

            if(testData.length > 0) {
                for (let n = 0; n < testData.length; n++) {
                    if (startDate <= new Date(testData[n]) && new Date(testData[n]) <= endDate) {
                        myCheckDay[i] = true;
                        break;
                    }
                }
            } else {
                if (startDate <= new Date(joinDate) && new Date(joinDate) <= endDate) {
                    myCheckDay[i] = true;
                }
            }
        }

        this.setState({
           eventJoinDate : myCheckDay
        });
    }

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId : 584});
            const response2 = await api.chkEventJoin({eventId : 585});

            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true,
                    joinDate: response.data.joinDate,
                });
            }
            if (response2.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply2: true
                });
            }
        }
    }

    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.teacherAnnual = '';
        event.teacherHope = '';
        SaemteoActions.pushValues({type: "event", object: event});
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

    // 댓글 등록
    writeReply = async () => {
        const {loginInfo,BaseActions} = this.props;
        const {replyAnswer,pageSize,pageNo} = this.state;

        if (loginInfo.mLevel != 'AU300') {
            common.info("준회원은 참여하실 수 없습니다.\n고객센터로 문의해 주세요(1544-7714)");
            return false;
        }

        // 교사 인증
        if (loginInfo.certifyCheck === 'N') {
            common.info("교사 인증 후 이벤트 참여를 해주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return false;
        }

        const content = this.state.replyAnswer;

        if(content.length === 0 || !content.trim()) {
            alert("기대평을 입력해주세요.");
            return false;
        }

        const param = {
            eventId : 583,
            replyAns : {
                // eslint-disable-next-line no-restricted-globals
                refUrl: location.href,
                contents: content,
                memberId: loginInfo.memberId,
                eventId : 583
            }
        };

        const response =  await api.writeReply(param);

        this.setState({
            pageSize : 6,
            pageNo : 1,
            replyAnswer : ""
        });

        this.commentConstructorList();
    }

    // 이벤트 참여자수 확인
    checkEventCount = async () => {

        const params = {
            eventId: 585,
            eventAnswerSeq: 2,
            answerIndex: 1
        };
        let response2 = await api.getSpecificEventAnswerCount(params);
        this.setState({
            eventAnswerCount: response2.data.eventAnswerCount
        });
    };

    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId} = this.props;
        const {pageNo, pageSize, eventAnswerCount} = this.state;

        const params = {
            eventId: 585,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.getSpecificEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        // 최초 조회시 전체건수가 8건이상이면 더보기 버튼 표시
        if (eventAnswerCount > PAGE_SIZE) {
            this.setState({
                eventViewAddButton: 1
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if (eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if (this.state.eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        this.setState({
            eventAnswerContents: eventJoinAnswerList,
            pageSize: this.state.pageSize + PAGE_SIZE,
            eventAnswerLeaveCnt: eventAnswerCount - eventJoinAnswerList.length,
        });
    };

    // 댓글 더보기
    commentListAddAction = async () => {
        this.commentConstructorList().then(); // 댓글 목록 갱신

    };

    clickTextARea = async(e) => {
        const {BaseActions,logged,history} = this.props;

        if (!logged) { // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        }
    }

    checkTextArea = async(e) => {
        this.setState({
            replyAnswer : e.target.value
        })
    }

    eventApply = async (e) => {
        const {logged,loginInfo,history,BaseActions,eventId,handleClick, SaemteoActions, event} = this.props;
        const {replyAnswer, questionAnswer,thisWeek,eventJoinDate,joinDate,eventAttendance} = this.state;

        if (!logged) { // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        } else {
            // 준회원일 경우 신청 안됨.
            if (loginInfo.mLevel != 'AU300') {
                common.info("준회원은 참여하실 수 없습니다.\n고객센터로 문의해 주세요(1544-7714)");
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
                let underEventId = e.currentTarget.dataset.event;
                if (underEventId.indexOf("event1") > -1) {
                    underEventId = "584";

                    const panel = document.querySelector(".tabpanel.on") || document.querySelector(".tabpanel");
                    const isTextMode = !!(panel && panel.querySelector(".event2")); // 2주차 형식인지?

                    const isBlank = (v) => v == null || String(v).trim() === "";
                    if (isTextMode) {
                        // 2주차: name="event2" 모두 채워졌는지 확인
                        const inputs = panel.querySelectorAll('input[name="event2"]');
                        const allFilled = Array.from(inputs).every(el => {
                            const need = el.maxLength > 0 ? el.maxLength : 1;
                            return ((el.value || "").trim().length >= need);
                        });
                        if (!allFilled || isBlank(questionAnswer)) {
                            alert("정답의 모든 글자를 입력해주세요.");
                            return false;
                        }
                    } else {
                        // 1/3/4주차: 라디오 선택 여부 확인
                        if (isBlank(questionAnswer)) {
                            alert("정답을 선택해주세요.");
                            return false;
                        }
                    }

                    if (this.state.isEventApply) {
                        for(let x = 0; x < eventJoinDate.length; x ++){
                            if (thisWeek[x]) {
                                const checkDay = new Date();
                                var mon = new String(checkDay.getMonth()+1);
                                var day = new String(checkDay.getDate());
                                if(day.length < 2){
                                    day = "0"+day;
                                }
                                if(mon.length < 2){
                                    mon = "0"+mon;
                                }
                                const checkDayText = checkDay.getFullYear() + "-" + mon + "-" + day;

                                if (eventJoinDate[x]) {
                                    alert("이번주는 이미 참여하셨습니다.");
                                    return false;
                                } else {
                                    this.setState({
                                        btnClickYn: false
                                    });
                                    let params = {
                                        eventId: underEventId,
                                        eventAnswerDesc2: checkDayText + '#' + questionAnswer
                                    }

                                    let response = await api.insertEventApply584(params);

                                    if (response.data.code === '0') {
                                       alert("이벤트 참여가 완료 되었습니다.");
                                        setTimeout(function () {
                                            window.location.reload();
                                        }, 1000);
                                        this.setState({
                                            btnClickYn: true
                                        })
                                    }
                                }
                                break;
                            }
                        }
                        return false;
                    }
                } else if (underEventId.indexOf("event2")  > -1) {
                    underEventId = "585";
                    if (this.state.isEventApply2) {
                        common.error("이미 참여하셨습니다.");
                        return false;
                    }
                    if (replyAnswer =='') {
                        alert("이벤트 2 내용을 작성해 주세요.");
                        return false;
                    }
                }

                const checkDay = new Date();
                var mon = new String(checkDay.getMonth()+1);
                var day = new String(checkDay.getDate());
                if(day.length < 2){
                    day = "0"+day;
                }
                if(mon.length < 2){
                    mon = "0"+mon;
                }
                const checkDayText = checkDay.getFullYear() + "-" + mon + "-" + day;

                const answerDesc2 =
                    underEventId === "584" ? checkDayText + '#' + questionAnswer
                        : replyAnswer;
                const eventAnswer = {
                    eventId: underEventId,
                    memberId: loginInfo.memberId,
                    eventAnswerDesc2: answerDesc2
                };

                SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

                event['agree'] = false;
                event['eventId'] = underEventId;

                SaemteoActions.pushValues({type: "event", object: event});

                handleClick(eventId);
            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(() => {
                }, 1000);//의도적 지연.
            }
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
        common.info('링크가 복사되었습니다.');
    };

    render() {
        const {eventAnswerContents, eventAnswerLeaveCnt, eventViewAddButton, replyAnswer, joinDate,thisWeek, eventJoinDate, btnClickYn } = this.state;
        const {logged} = this.props;
        const activeWeekIdx = (() => {
            const i = thisWeek.findIndex(Boolean);
            return i === -1 ? 0 : i;
        })();
        const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
            <EventListApply {...eventList} key={eventList.event_answer_id}/>
        );

        return (
            <section className="event250829">
                <div className="evtTitWrap">
                    <h1><img src="/images/events/2025/event250829/imgVisual.jpg" alt=""/></h1>
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <button className="btnShare" onClick={this.copyToClipboard}><span className="blind">이벤트 공유하기</span>
                    </button>
                    <a onClick={onClickCallLinkingOpenUrl.bind(this, 'https://text.vivasam.com/')}
                       className="btnLinkGo">
                        <span className="blind">22개정 비상교과서 홈페이지 바로가기</span>
                    </a>
                    <div className="blind">
                        <h1>교과서 캠페인 7탄 Perfect Only! 비상교과서!</h1>
                        <strong>22 개정 교육과정 비상교과서 초중고 전 과목 100% 합격!</strong>
                        <p>
                            초중고 전 과목 100% 합격한 출판사는 오직 비상교과서뿐인 것 알고 계셨나요?
                            기쁜 합격 소식을 이벤트 참여로 함께 축하해 주세요.
                            감사의 의미로 오직 선생님만을 위한 완벽한 선물이 찾아갑니다.
                        </p>
                        <p>이벤트 참여 기간 : 8월 29일(금) ~ 10월 17일(금), 당첨자 발표 : 10월 24일(금)</p>

                        <h2>이벤트 경품 리스트</h2>
                        <ul>
                            <li>
                                <strong>#이벤트 1</strong>
                                추첨 1명 - LG 스탠바이미 2
                                추첨 150명 - 신세계 상품권 5만 원 권
                                추첨 100명 - BHC 후라이드+콜라 1.25L
                            </li>
                            <li>
                                <strong>#이벤트 2</strong>
                                추첨 3명 - APPLE AirPods 4
                                추첨 100명 - 배달의 민족 상품권 만 원 권
                            </li>
                            <li>
                                <strong>#이벤트 1-2 모두 참여한 선생님</strong>
                                추첨 300명 - CU 모바일 상품권 5천 원 권
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="evtContWrap">
                    <div className="evtCont evtCont01">
                        <h2><img src="/images/events/2025/event250829/img1.png" alt=""/></h2>
                        <div className="blind">
                            <h2>#이벤트 1 함께해요! 퀴즈 릴레이 이벤트</h2>
                            <p>선생님의 상상이 펼쳐지는 비상교과서! 22 개정 교과서 홈페이지를 둘러보고 매주 새로운 퀴즈 이벤트에 참여해 보세요! 참여 완료 도장을 1개 이상 모은 선생님을 대상으로 추첨을 통해 경품을 드립니다.</p>
                            <p>Tip. 도장을 많이 모을수록 당첨 확률이 높아져요!</p>
                        </div>

                        <div className="evtCheckWrap evt_inner inner1">
                            <ul>
                                {/* 해당 기간에 active 클래스 추가 */}
                                {/* 출석 체크 시 on 클래스 추가 */}
                                {/*<li className={joinDate != null ? "on" : "active"} className={thisWeek[0] ? "active" : ""}>*/}
                                <li className={eventJoinDate[0] ? "active on" : thisWeek[0] ? "active" : ""}>
                                    <strong>1회차</strong>
                                    <p>(8/29~9/7)</p>
                                </li>
                                <li className={eventJoinDate[1] ? "active on" : thisWeek[1] ? "active" : ""}>
                                    <strong>2회차</strong>
                                    <p>(9/8~9/21)</p>
                                </li>
                                <li className={eventJoinDate[2] ? "active on" : thisWeek[2] ? "active" : ""}>
                                    <strong>3회차</strong>
                                    <p>(9/22~10/5)</p>
                                </li>
                                <li className={eventJoinDate[3] ? "active on" : thisWeek[3] ? "active" : ""}>
                                    <strong>4회차</strong>
                                    <p>(10/6~10/17)</p>
                                </li>
                            </ul>
                        </div>

                        <div className="evt_inner inner2">
                            <div className="tabWrap">
                                <ul className="tab_list">
                                    <li className={`tab_item ${thisWeek[0] ? 'on' : ''}`}><button type="button" className="tab_btn" onClick={() => this.handleTabClick(0)}><span className="blind">1회차 특장점 키워드 (8/29~9/7)</span></button></li>
                                    <li className={`tab_item ${thisWeek[1] ? 'on' : ''}`}><button type="button" className="tab_btn" onClick={() => this.handleTabClick(1)}><span className="blind">2회차 쉽고 간편해지는 수업 (9/8~9/21)</span></button></li>
                                    <li className={`tab_item ${thisWeek[2] ? 'on' : ''}`}><button type="button" className="tab_btn" onClick={() => this.handleTabClick(2)}><span className="blind">3회차 쉽고 간편해지는 수업 (9/22~10/5)</span></button></li>
                                    <li className={`tab_item ${thisWeek[3] ? 'on' : ''}`}><button type="button" className="tab_btn" onClick={() => this.handleTabClick(3)}><span className="blind">4회차 쉽고 간편해지는 수업 (10/6~10/17)</span></button></li>
                                </ul>

                                {/* 1회차 */}
                                <div className={`tabpanel ${thisWeek[0] ? 'on' : ''}`}>
                                    <img src="/images/events/2025/event250829/evtCont2_panel_top_01.png" alt=""/>
                                    <div className="blind">
                                        <h3>QUIZ 1</h3>
                                        <p>선생님이 상상하는 교과서에 대한 비상교과서의 답! 22 개정 교과서 홈페이지에 소개된 22 개정 비상교과서의 특장점 키워드가 아닌
                                            것은?</p>
                                    </div>
                                    <fieldset className="event1">
                                        <h4 className="blind">1회차 특장점 키워드 (8/29~9/7)</h4>
                                        <ul>
                                            <li><input type="radio" name="event1" id="event1-1"
                                                       onChange={this.questionSelect} value={1}/><label for="event1-1">상상하는 힘</label></li>
                                            <li><input type="radio" name="event1" id="event1-2"
                                                       onChange={this.questionSelect} value={2}/><label for="event1-2">활동 강화</label></li>
                                            <li><input type="radio" name="event1" id="event1-3"
                                                       onChange={this.questionSelect} value={3}/><label
                                                for="event1-3">알록달록</label></li>
                                            <li><input type="radio" name="event1" id="event1-4"
                                                       onChange={this.questionSelect} value={4}/><label for="event1-4">한 번에
                                                끝</label></li>
                                            <li><input type="radio" name="event1" id="event1-5"
                                                       onChange={this.questionSelect} value={5}/><label
                                                for="event1-5">인공지능</label></li>
                                        </ul>
                                    </fieldset>
                                </div>
                                {/* 2회차 */}
                                <div className={`tabpanel ${thisWeek[1] ? 'on' : ''}`}>
                                    <img src="/images/events/2025/event250829/evtCont2_panel_top_02.png" alt=""/>
                                    <div className="blind">
                                        <h3>QUIZ 2</h3>
                                        <p>22 개정 비상교과서에는 학생들과의 수업을 더욱 생생하게 만들어주는 다양한 자료가 담겨있습니다. 이 자료들을 쉽고 간편하게 만나볼 수
                                            있도록 도와주는 것은 무엇일까요?</p>
                                    </div>
                                    <fieldset className="event2">
                                        <h4 className="blind">2회차 쉽고 간편해지는 수업 (9/8~9/21)</h4>
                                        <div className="balloonTip"><p className="blind">한 글자씩 정답을 입력하세요!</p></div>
                                        <ul>
                                            <li><label for="event2-1"><span className="blind" >첫번째 글자</span></label>
                                                <input type="text" name="event2" id="event2-1" placeholder="" maxlength="1" inputMode="latin"  pattern="[A-Za-z]" onInput={this.onlyAlpha}/></li>
                                            <li><label for="event2-2"><span className="blind">두번째 글자</span></label>
                                                <input type="text" name="event2" id="event2-2" placeholder="" maxlength="1" inputMode="latin" pattern="[A-Za-z]" onInput={this.onlyAlpha} /></li>
                                        </ul>
                                        <p className="txt">코드</p>
                                    </fieldset>
                                </div>
                                {/* 3회차 */}
                                <div className={`tabpanel ${thisWeek[2] ? 'on' : ''}`}>
                                    <img src="/images/events/2025/event250829/evtCont2_panel_top_03.png" alt=""/>
                                    <div className="blind">
                                        <h3>QUIZ 3</h3>
                                        <p>후기가 말해주는 비상교과서의 힘! 비상교과서와 선생님의 첫만남 후기가 아닌 것은 무엇일까요?</p>
                                    </div>
                                    <fieldset className="event3">
                                        <h4 className="blind">3회차 쉽고 간편해지는 수업 (9/22~10/5)</h4>
                                        <ul>
                                            <li><input type="radio" name="event3" id="event3-1" value={1} onChange={this.questionSelect}/><label
                                                for="event3-1">“학생들 수준에 알맞은 예시 자료가 수업 준비에 도움이 됩니다."</label></li>
                                            <li><input type="radio" name="event3" id="event3-2" value={2} onChange={this.questionSelect}/><label
                                                for="event3-2">“QR 코드로 보는 다양한 형태의 콘텐츠가 구성된 점이 좋았습니다.”</label></li>
                                            <li><input type="radio" name="event3" id="event3-3" value={3} onChange={this.questionSelect}/><label
                                                for="event3-3">"학생들과 일방적으로 소통하는 콘텐츠로 수업 준비가 즐거워 졌어요.”</label></li>
                                            <li><input type="radio" name="event3" id="event3-4" value={4} onChange={this.questionSelect}/><label
                                                for="event3-4">"수업을 뒷받침해 주는 영상, 워크지, 피피티 등 교사를 도와주는 자료가 풍성합니다."</label>
                                            </li>
                                            <li><input type="radio" name="event3" id="event3-5" value={5} onChange={this.questionSelect}/><label
                                                for="event3-5">"컬러감, 캐릭터 등이 학생들의 관심을 끌기 충분하고, 에듀테크 연계 페이지의 구성이
                                                훌륭합니다."</label></li>
                                        </ul>
                                    </fieldset>
                                </div>

                                {/* 4회차 */}
                                <div className={`tabpanel ${thisWeek[3] ? 'on' : ''}`}>
                                    <img src="/images/events/2025/event250829/evtCont2_panel_top_04.png" alt=""/>
                                    <div className="blind">
                                        <h3>QUIZ 4</h3>
                                        <p>선생님의 든든한 수업 파트너 비바샘! 비바샘이 제공하는 서비스 중 아래 설명에 해당하는 서비스는 무엇일까요? &lt;학급 개설부터 수업
                                            관리까지 one-stop 수업 플랫폼!&gt;</p>
                                    </div>
                                    <fieldset className="event4">
                                        <h4 className="blind">4회차 쉽고 간편해지는 수업 (10/6~10/17)</h4>
                                        <ul>
                                            <li><input type="radio" name="event4" id="event4-1" value={1} onChange={this.questionSelect}/><label
                                                for="event4-1">비바클래스</label></li>
                                            <li><input type="radio" name="event4" id="event4-2" value={2} onChange={this.questionSelect} /><label
                                                for="event4-2">스마트 문제은행</label></li>
                                            <li><input type="radio" name="event4" id="event4-3" value={3} onChange={this.questionSelect} /><label
                                                for="event4-3">학습심리정서검사</label></li>
                                            <li><input type="radio" name="event4" id="event4-4" value={4} onChange={this.questionSelect}/><label
                                                for="event4-4">샘퀴즈</label></li>
                                        </ul>
                                    </fieldset>
                                </div>
                            </div>
                        </div>

                        <div className="btnWrap">
                            <a href={WEEK_LINKS[activeWeekIdx]} className="btnLink" target="_blank"><span className="blind">22개정 비상교과서 홈페이지 바로가기</span></a>
                            <button className="btnApply" data-event="event1" onClick={btnClickYn ? this.eventApply : ''}><span
                                className="blind">이벤트 1 참여하기</span></button>
                        </div>
                    </div>

                    <div className="evtCont evtCont02">
                        <h2><img src="/images/events/2025/event250829/img2.png" alt=""/></h2>
                        <div class="blind">
                            <h2>#이벤트 2 상상 그 이상의 교과서로 만나는 수업 이야기</h2>
                            <p>선생님의 상상으로 만들어진 상상 그 이상의 교과서 비상교과서. 선생님은 어떤 수업을 꿈꾸시나요? 새로운 교육과정의 교과서와 함께하는 수업의 모습과 변화를 상상하고 공유해 주세요!</p>
                        </div>

                        <div className="commentInputWrap">
                            <div className="textareaWrap">
                                <div className="textarea_inner">
                                    <textarea name="" id="comment" cols="30" rows="10" placeholder="내용을 작성해 주세요. (최대 200자까지 입력 가능합니다.)"  onClick={this.clickTextARea} maxLength="200" value={replyAnswer} onInput={this.checkTextArea}></textarea>
                                </div>
                                <button className="btn_cmt" data-event="event2" onClick={(e) => this.eventApply(e)}><span className="blind">이벤트 2 참여하기</span></button>
                            </div>
                        </div>
                        <div className="commentWrap">
                            <div className="commentList">
                                {eventApplyAnswerList.length > 0 ?
                                    eventApplyAnswerList :
                                    <div className="nodata">
                                        {/*<p>텅~아직 작성된 내용이 없어요</p>*/}
                                    </div>
                                }
                            </div>
                            <button type="button" className="btnMore"
                                    style={{display: eventViewAddButton === 1 ? 'block' : 'none'}}
                                    onClick={this.commentListAddAction}>더보기 (<span>{eventAnswerLeaveCnt}</span>) <i></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="notice">
                    <strong>유의사항</strong>
                    <div className="content">
                        <span>꼭! 읽어 주세요.</span>
                        <ul className="evtInfoList">
                            <li>본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                            <li>이벤트 1은 회차별로 1인 1회, 이벤트 2는 1인 1회 참여하실 수 있습니다.</li>
                            <li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                            <li>경품 발송을 위해 선물 발송을 위해 개인정보가 서비스사와 배송업체에 제공됩니다. <br />(주) 카카오 120-81-47521 ㈜ 다우기술 220-81-02810 <br />㈜LG전자 107-86-14075 (유) 애플코리아 120-81-84429</li>
                            <li>스탠바이미2 와 에어팟의 경우 제세공과금(22%)가 본인 부담으로 발생되며, 경품 발송을 위한 절차를 위해 개별 연락을 드릴 예정입니다. <br />관련하여 세금 신고에 필요한 개인정보(주민등록번호, 주소 등)를 수급할 예정입니다. (주민등록번호는 상품자 정보 처리로 인해 받으며 이벤트 종료 후 일괄 폐기 처분 됩니다.)</li>
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
            event_answer_desc2: "",
            reg_dttm: this.props.reg_dttm, // 등록일
            BaseActions: this.props.BaseActions, // BaseAction
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅
        let eventSetName = maskingStr(this.state.member_id);
        let answers = this.state.event_answer_desc.split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc: answers[0].replaceAll("\n", "<br/>"),
        });
    };

    render() {
        const {eventName, event_answer_desc} = this.state;

        return (
            /* 후기 리스트 */
            <div className="listItem comment">
                <strong>{eventName} 선생님</strong>
                <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
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
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));


//=============================================================================
// 댓글 페이징 component
//=============================================================================
