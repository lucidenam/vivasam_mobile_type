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

const PAGE_SIZE = 6;
const subEventId = [446, 447];
let i = -1;

class Event extends Component {
    state = {
        // eventId: 445,
        // eventId1: 446,
        // eventId2: 447,
        isEventApply : false,       // 신청여부
        isEventApply2 : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventAnswerCount2: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtComment: '',
        choosedItem: '',
        tabOn: 1,
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


    tabOnChange = (e) => {
        const { tabOn, } = this.state;


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
        common.info('링크가 복사되었습니다.\n동료 선생님과 함께 이벤트에 참여해 보세요.');
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
        const {logged} = this.props;


        if (logged) {
            const response = await api.chkEventJoin({eventId: subEventId[0]});
            const response2 = await api.chkEventJoin({eventId: subEventId[1]});

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
        // if (isEventApply) {
        //     common.error("이미 신청하셨습니다.");
        //     return false;
        // }

        return true;
    }


    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async () => {
        const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick, event} = this.props;
        const { isEventApply, eventId1} = this.state;



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
        // if (isEventApply) {
        //     common.error("이미 신청하셨습니다.");
        //     return false;
        // }


        const response = await api.getCurrentTime();
        let nowDate = response.data.nowDate;

        let YYYY = nowDate.split(" ")[0].split("-")[0];
        let MM = nowDate.split(" ")[0].split("-")[1];
        let DD = nowDate.split(" ")[0].split("-")[2];
        let hh = nowDate.split(" ")[1].split(":")[0];
        let mm = nowDate.split(" ")[1].split(":")[1];
        // console.log("이벤트 신청 시간 : " + YYYY+"-"+MM+"-"+DD+" "+hh+":"+mm)

        // 실서버용
        if (YYYY == 2023 && MM == 5) {
            if (DD >= 4 && DD <= 10) {
                alert("향기로운 마음을 준비 중입니다.");
                return false
            } else if (DD >= 11 && DD <= 12) {
                alert("향기로운 마음을 배송 중입니다.");
                return false
            } else if (DD >= 13) {
                alert("신청이 종료된 이벤트입니다.");
                return false
            }
        }

        if (YYYY == 2023 && MM == 6) {
            if (DD >= 1) {
                alert("신청이 종료된 이벤트입니다.");
                return false
            }
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

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply2 = async () => {
        const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId2, eventId, handleClick, event} = this.props;
        const { isEventApply2} = this.state;

        if (!logged) { // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }
        // 교사 인증
        if (loginInfo.certifyCheck === 'N') {
            BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return false;
        }
        // 준회원일 경우 신청 안됨.
        if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return false;
        }

        const response = await api.getCurrentTime();
        let nowDate = response.data.nowDate;

        let YYYY = nowDate.split(" ")[0].split("-")[0];
        let MM = nowDate.split(" ")[0].split("-")[1];
        let DD = nowDate.split(" ")[0].split("-")[2];
        let hh = nowDate.split(" ")[1].split(":")[0];
        let mm = nowDate.split(" ")[1].split(":")[1];
        // console.log("이벤트 신청 시간 : " + YYYY+"-"+MM+"-"+DD+" "+hh+":"+mm)


        // 실서버용
        if (YYYY == 2023 && MM == 5) {
            if (DD >= 20) {
                alert("신청이 종료된 이벤트입니다.");
                return false;
            }
        }
        if (YYYY >= 2023 && MM >= 6) {
            if (DD >= 1) {
                alert("신청이 종료된 이벤트입니다.");
                return false
            }
        }

        // 기 신청 여부
        if (isEventApply2) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        try {
            const eventAnswer = {
                eventId : 447,
                isEventApply : isEventApply2
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
        const {SaemteoActions} = this.props;

        const params = {
            eventId:  subEventId[0],
            eventAnswerSeq: 2,
            answerIndex: 1
        };
        const params2 = {
            eventId:  subEventId[1], //447
            eventAnswerSeq: 2,
            answerIndex: 1
        };

        let response = await api.getSpecificEventAnswerCount(params);
        let response2 = await api.getSpecificEventAnswerCount(params2);

        // console.log("response2.data", response2.data)

        this.setState({
            eventAnswerCount: response.data.eventAnswerCount,
            eventAnswerCount2: response2.data.eventAnswerCount
        });

        // 최초 조회시 전체건수가 5건이상이면 더보기 버튼 표시
        // if(this.state.eventAnswerCount2 > PAGE_SIZE){
        if(response2.data.eventAnswerCount > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };


    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId} = this.props; // 2023-05-04 추가
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: subEventId[1],  // 447
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.getSpecificEventAnswerList(params);

        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.eventAnswerCount2 <= this.state.pageSize) {
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
        const {eventAnswerContents, eventAnswerCount,eventAnswerCount2, pageNo, pageSize, eventViewAddButton, tabOn} = this.state;

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
            <section className="event230424_2">
                <div className="evtCont01">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="evtTit">
                        <img src="/images/events/2023/event230424_2/evtCont1.png" />
                        <div className="blind">
                            <div>
                                <p>
                                    동료 선생님, 은사님 등
                                    감사 인사를 전하고 싶은 선생님에게
                                    전하고 싶은 말을 적어주세요!
                                </p>

                                <h3>꾸까 꽃다발 + 화병 + 편지 패키지</h3>
                                <span>추첨 200명</span>
                                <span>*상기 꽃 구성의 경우 계절에 맞게 변경될 수 있습니다.</span>
                                <p>
                                    추첨을 통해 상대 선생님의 재직 학교로
                                    향기로운 꽃 선물과 함께 전하고 싶은 말이 편지로 배송됩니다.
                                </p>

                                <p>마음을 전하는 선생님</p>
                            </div>

                            <div>
                                <p>
                                    마음을 담은 선물을 받으셨다면,
                                    5월 10일 오픈되는 '감동 답장 쓰기'를 통해
                                    감사 인사 또는 선물을 받은 후기를 작성해 주세요!
                                </p>

                                <h3>스타벅스 아이스 카페라떼T 2잔</h3>
                                <span>작성시 100% 전달</span>
                                <p>
                                    꽃 선물을 보낸 선생님께
                                    커피 쿠폰으로 감사를 대신 전해드립니다.
                                </p>

                                <p>마음을 받는 선생님</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">

                    <ul className="tab_menu">
                        <li className={tabOn == 1 ? 'on': ''}>
                            <button onClick={this.tabOnChange} value={1}>
                                <span>이벤트 안내</span>
                            </button>
                        </li>
                        <li className={tabOn == 2 ? 'on': ''}>
                            <button  onClick={this.tabOnChange} value={2}>
                                <span>감동 답장 쓰기</span>
                            </button>
                        </li>
                    </ul>

                    <div className={"tab_conts " + (tabOn == 1? "on": "")} >
                        <div className="cont">
                            <img src="/images/events/2023/event230424_2/tab1Cont1.png"  />
                            <div className="blind">
                                <div>
                                    <p>
                                        동료 선생님, 은사님 등
                                        감사 인사를 전하고 싶은 선생님에게
                                        전하고 싶은 말을 적어주세요!
                                    </p>

                                    <h3>꾸까 꽃다발 + 화병 + 편지 패키지</h3>
                                    <span>추첨 200명</span>
                                    <span>*상기 꽃 구성의 경우 계절에 맞게 변경될 수 있습니다.</span>
                                    <p>
                                        추첨을 통해 상대 선생님의 재직 학교로
                                        향기로운 꽃 선물과 함께 전하고 싶은 말이 편지로 배송됩니다.
                                    </p>

                                    <p>마음을 전하는 선생님</p>
                                </div>

                                <div>
                                    <p>
                                        마음을 담은 선물을 받으셨다면,
                                        5월 10일 오픈되는 '감동 답장 쓰기'를 통해
                                        감사 인사 또는 선물을 받은 후기를 작성해 주세요!
                                    </p>

                                    <h3>스타벅스 아이스 카페라떼T 2잔</h3>
                                    <span>작성시 100% 전달</span>
                                    <p>
                                        꽃 선물을 보낸 선생님께
                                        커피 쿠폰으로 감사를 대신 전해드립니다.
                                    </p>

                                    <p>마음을 받는 선생님</p>
                                </div>
                            </div>
                        </div>
                        <div className="info">
                            <img src="/images/events/2023/event230424_2/tab1Cont2.png"  />

                            <div className="blind">
                                <strong>마음을 전하기 전! 확인해 주세요</strong>
                                <ul>
                                    <li>본인이 본인에게 선물을 보내는 것은 불가합니다.</li>
                                    <li>본 이벤트는 선생님을 위한 이벤트로 꽃 배송은 ‘상대 선생님의 재직 학교’ 로만 배송이 가능합니다.</li>
                                    <li>선물은 11일(목) ~ 12(금) 이틀에 걸쳐 배송 완료 됩니다.</li>
                                    <li>개인정보 오기재로 인한 경품 재발송은 불가하니 신청 정보를 꼼꼼히 확인해 주세요.</li>
                                </ul>
                            </div>

                            <button className="btnApply" onClick={this.eventApply}>
                                <img src="/images/events/2023/event230424_2/btnApply1.png"  />
                                <span className="blind">신청하기</span>
                            </button>
                        </div>
                    </div>
                    <div className={"tab_conts " + (tabOn == 1?" " : "on")} >
                        <div className="cont notOpen">
                            {/*5월 10일부터 notOpen 클래스 삭제*/}

                            {/*<div className="evtOpen510">*/}
                            {/*    <div>*/}
                            {/*        <p>*/}
                            {/*            감동답장은 5월 10일 부터<br />*/}
                            {/*            작성가능합니다*/}
                            {/*        </p>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            <div>
                                {/*{eventAnswerCount > 0 &&*/}

                                {eventAnswerCount > 0 &&

                                <div className="commentWrap cont_Wrap">
                                    <div className="inner">
                                        <div className={"commentList"}>


                                            {/*{eventList}*/}

 {/*
                                            <div className="listItem listStyle1">
                                                <p className="userInfo">viv*** 선생님</p>
                                                <div className="comment">
                                                    <p>
                                                        OOO 선생님 향기로운
                                                        꽃 선물 감사합니다!

                                                        곧 뵈어요 !
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="listItem listStyle2">
                                                <p className="userInfo">viv*** 선생님</p>
                                                <div className="comment">
                                                    <p>
                                                        OOO 선생님 향기로운
                                                        꽃 선물 감사합니다!

                                                        곧 뵈어요 !
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="listItem listStyle3">
                                                <p className="userInfo">viv*** 선생님</p>
                                                <div className="comment">
                                                    <p>
                                                        OOO 선생님 향기로운
                                                        꽃 선물 감사합니다!

                                                        곧 뵈어요 !
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="listItem listStyle1">
                                                <p className="userInfo">viv*** 선생님</p>
                                                <div className="comment">
                                                    <p>
                                                        OOO 선생님 향기로운
                                                        꽃 선물 감사합니다!

                                                        곧 뵈어요 !
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="listItem listStyle2">
                                                <p className="userInfo">viv*** 선생님</p>
                                                <div className="comment">
                                                    <p>
                                                        OOO 선생님 향기로운
                                                        꽃 선물 감사합니다!

                                                        곧 뵈어요 !
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="listItem listStyle3">
                                                <p className="userInfo">viv*** 선생님</p>
                                                <div className="comment">
                                                    <p>
                                                        OOO 선생님 향기로운
                                                        꽃 선물 감사합니다!

                                                        곧 뵈어요 !
                                                    </p>
                                                </div>
                                            </div>*/}

                                            {eventList}

                                        </div>


                                        <button className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>
                                            <span className="blind">더보기</span>
                                        </button>
                                    </div>

                                </div>}
                                {/*}*/}
                            </div>
                        </div>

                        <div className="info">
                            <img src="/images/events/2023/event230424_2/tab2Cont2.png"  />

                            <div className="blind">
                                <strong>감동 답장 쓰기 전! 확인해 주세요</strong>
                                <ul>
                                    <li>
                                        ‘감동 답장 쓰기’는 본 이벤트 당첨자 선생님을 통해 꽃 선물을 받으신 선생님을 대상으로 하며,
                                        대상자가 아닌 경우 참여 대상에서 제외됩니다.
                                    </li>
                                    <li>경품은 ‘꽃을 수령한 선생님(본인)이 아닌 꽃 선물을 보낸 선생님’의 휴대전화 번호로 발송됩니다.</li>
                                </ul>
                            </div>

                            <button className="btnApply" onClick={this.eventApply2}>
                                <img src="/images/events/2023/event230424_2/btnApply2.png"  />
                                <span className="blind">감동 답장 쓰기</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>① 본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                        <li>② 경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                        <li>③ 1 인 1회 참여할 수 있습니다.</li>
                        <li>④ 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>
                            ⑤ 경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br />
                            ㈜꾸까 사업자 등록번호 264-81-32594​<br />
                            ㈜다우기술 사업자등록번호: 220-81-02810
                        </li>
                        <li>
                            ⑥ 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.
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
            randomNum: "",
            randomSave: [1, 2, 3, 1, 2, 3],
        }
    }

    componentDidMount = () => {
        const {randomSave, randomNum} =  this.state;

        this.eventListApply();
        // await this.commentConstructorList();	// 이벤트2 댓글 목록 조회

    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        let masking = "*"
        eventSetName = eventSetName.substring(1, 4) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');


        this.setState({
            eventName: eventSetName,
            event_answer_desc2 : answers[0],
        });


    };


    render() {
        const {eventName, event_answer_desc, event_answer_desc2, randomNum,randomSave} = this.state;

        // console.log(randomNum);
        if(i >= 5){
            i =0;
        }else {
            i++;
        }



        return (
            <div className={"listItem listStyle" + randomSave[i] }>
                <p className="userInfo" >{eventName} 선생님</p>
                <div className="comment">
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