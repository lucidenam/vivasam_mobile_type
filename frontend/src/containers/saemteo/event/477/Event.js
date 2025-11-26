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
import ReactPlayer from 'react-player/youtube'
import * as myclassActions from "../../../../store/modules/myclass";

const PAGE_SIZE = 10;

let ourSchJoin = 0;
let eventJoinListAnswer = [];
let eventJoinAnswerList2 = [];

class Event extends Component {
    state = {
        eventId1: 478,
        eventId2: 479,
        isEventApply1: false,       // 신청여부
        isEventApply2: false,       // 신청여부
        schoolLvlCd: '',
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/477',
        evtUrl: '',
        evtPopup: false,

        eventJoinListAnswer:[],
        eventJoinAnswerList2:[],
        schName: '',
        joinSchCount:'',
        memberRegType:null,

    }

    componentDidMount = async () => {
        const {BaseActions, event, SaemteoActions, logged} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.checkEventCount();   		// 이벤트 참여자 수 조회
            // await this.commentConstructorList2();	// 이벤트 댓글 목록 조회2
            await this.setEventRedux();
            await this.vivaJoinEventInfo();             // 실시간 학교 랭킹 3위

            if (logged) {
                await this.getMyClassInfo(); //학교급체크는 로그인했을때만 실행
            }
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
    playVid = (e) => {
        const {ytVideoThumb, ytVideoSwitch} = this.state;
        let i = e.target.value
        this.updateElement(i);
    }

    //썸네일노출
    updateElement = (idx) => {

        this.setState((prevState) => {
            //prevState: 변경전인 state객체를 저장

            //변경전인 ytVideoThumb의 배열을 복사
            const newArr = [...prevState.ytVideoThumb];
            const newPlaying = [...prevState.ytVideoSwitch];


            //복사한 배열에서 원하는 값을 변경
            newArr[idx - 1] = false;
            newPlaying[idx - 1] = true;

            //기존 state로 업데이트
            return {ytVideoThumb: newArr, ytVideoSwitch: newPlaying};
        });
    }

    poemWrite = (e, textareaName) => {
        const {text, counting} = this.state;

        let element = e.target
        element.style.height = "auto";
        element.style.height = ((e.target.scrollHeight / window.innerWidth) * 100) + "vw";

        //리액트에서 변수를 value로 지정하면 e.target.value가 된다.
        const {value} = e.target;

        // 현재 textarea의 글자 수
        const textLength = value.length;

        // 다른 두 textarea의 글자 수
        const otherTextLength =
            (textareaName === 'text1' ? this.state.text2.length + this.state.text3.length :
                textareaName === 'text2' ? this.state.text1.length + this.state.text3.length :
                    this.state.text1.length + this.state.text2.length);

        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        // 만약 합친 글자 수가 300자 이하라면 상태 업데이트
        if (textLength + otherTextLength <= 300) {
            this.setState({
                [textareaName]: value,
                counting: textLength + otherTextLength,
            });
        } else {
            alert('최소 2자 ~ 최대 300자까지 입력할 수 있어요');
        }
    }

    vivaJoinEventInfo = async () => {
        const {logged, eventId} = this.props;

        const eventJoinList = await api.getVivaJoinEventInfo();

        let eventJoinListAnswer = eventJoinList.data.eventJoinList; // 실시간 학교 랭킹 3위

        let ourSchJoinList = eventJoinList.data.ourSchJoinList; // 우리학교 가입자
        let memberRegType = eventJoinList.data.memberRegType;

        if(logged) {
            if(ourSchJoinList.length > 0) {
                ourSchJoin = ourSchJoinList[0].joinSchCount
            }else {
                ourSchJoin = 0;
            }

            this.setState({
                // memberRegType:eventJoinList.data.memberRegType,
                memberRegType: memberRegType,
                ourSchJoin : ourSchJoin, // 우리학교 가입자
            });

        }

        this.setState({
            eventJoinListAnswer : eventJoinList.data.eventJoinList, //  실시간 랭킹 3위
        });

    }

    setEventRedux = async () => {
        const {event, SaemteoActions} = this.props;

        event.adventure = '';

        SaemteoActions.pushValues({type: "event", object: event});
    }

    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.evtUrl = '';

        SaemteoActions.pushValues({type: "event", object: event});
    }


    handleChangeUrl = (e) => {
        const {event, SaemteoActions} = this.props;

        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return;
        }


        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        event.evtUrl = e.target.value;

        SaemteoActions.pushValues({type: "event", object: event});
    };


    handleChange = (e) => {
        const {event, SaemteoActions} = this.props;

        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return;
        }

        this.setState({
            video1: false,
            video2: false,
            video3: false,
            [e.target.id]: e.target.checked,
        });

        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        // event.evtUrl = e.target.value;

        SaemteoActions.pushValues({type: "event", object: event});
    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged} = this.props;
        const {eventId1, eventId2} = this.state;
        if (logged) {
            const response1 = await api.chkEventJoin({eventId: eventId1});
            const response2 = await api.chkEventJoin({eventId: eventId2});

            if (response1.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply1: true
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
    prerequisite = (e) => {
        const {logged, history, BaseActions, loginInfo, event} = this.props;
        const {isEventApply1, isEventApply2} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        var nowDate = new Date();
        var endDate = new Date('2023-12-18 18:00:00.000');

        if (nowDate > endDate) {
            alert("이벤트 기간이 아니거나 종료된 이벤트입니다.");
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



        return true;
    }

    // 선생님 학교급 확인
    getMyClassInfo = async () => {
        const {MyclassActions} = this.props;

        try {
            let result = await MyclassActions.myClassInfo();
            this.setState({
                schoolLvlCd: result.data.schoolLvlCd
            })
        } catch (e) {
            console.log(e);
        }
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply1 = async () => {
        const {SaemteoActions, eventId, handleClick, event} = this.props;
        const {isEventApply, video1, video2, video3, text1, text2, text3, isEventApply2, isEventApply1} = this.state;

        let eventAnswerContent = "";
        let samhangsi = text1 + "\n" + text2 + "\n" + text3;
        let samhangsi2 = text1 + text2 + text3;

        // 기 신청 여부
        if (isEventApply1) {
            common.error("이미 신청하셨습니다.");
            return false;
        }
        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        try {
            const eventAnswer = {
                isEventApply: isEventApply,
                eventId: 478,
                eventAnswerContent: eventAnswerContent,
            };
            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    };

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply2 = async () => {
        const {SaemteoActions, eventId, handleClick, event, loginInfo, BaseActions} = this.props;
        const {isEventApply2, evtUrl} = this.state;

        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        if(this.state.memberRegType === 'A001'){
            common.info("이벤트 기간 내 신규 가입한 선생님만 참여 가능하십니다.")
            return false;
        }

        if (this.state.memberRegType === 'B001') {
            // 교사 인증 여부
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
        }

        // 기 신청 여부
        if (isEventApply2) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        let eventAnswerContent = "";
        eventAnswerContent += (event.evtUrl)

        try {
            const eventAnswer = {
                isEventApply: isEventApply2,
                eventId: 479,
                eventAnswerContent: eventAnswerContent,
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    };

    // 이벤트2 입력창 focus시
    onFocusComment = (e) => {
        if (!this.prerequisite(e)) {
            document.activeElement.blur();
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
                this.commentConstructorList2();	// 댓글 목록 조회
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

    copyToClipboard = (url, alrt) => {

        // 글을 쓸 수 있는 란을 만든다.
        let aux = document.createElement("input");
        // 지정된 요소의 값을 할당 한다.
        aux.setAttribute("value", url);
        // bdy에 추가한다.
        document.body.appendChild(aux);
        // 지정된 내용을 강조한다.
        aux.select();
        // 텍스트를 카피 하는 변수를 생성
        document.execCommand("copy");
        // body 로 부터 다시 반환 한다.
        document.body.removeChild(aux);
        alert(alrt);
    };

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const {SaemteoActions, eventId} = this.props;
        const params = {
            eventId: 478,
            eventAnswerSeq: 1,
            answerIndex: 1
        };
        let response2 = await api.getSpecificEventAnswerCount2(params);
        this.setState({
            eventAnswerCount: response2.data.eventAnswerCount
        });
    };

    handlePopupChange = async () => {
        const {pageNo, pageSize, evtPopup} = this.state;

        var nowDate = new Date();
        //  실서버용
        var endDate = new Date('2023-12-18 18:00:00.000');
        // 개발검수시간
        // var endDate = new Date('2023-12-01 11:00:00:00.000');
        if(nowDate > endDate){
            common.info("최종 결과 집계 중입니다.\n최종 순위는 20일에 공지사항을 확인해 주세요.");
            return false;
        }

        if(evtPopup) {
            this.setState({
                evtPopup: false
            })
        }else {
            this.setState({
                evtPopup: true
            })
        };
        this.commentConstructorList2();

    };


    // 학교 랭킹 50
    commentConstructorList2 = async () => {
        const {eventId} = this.props;
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: 478,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList = await api.getSpecificEventAnswerList2(params);

        let eventJoinAnswerList2 = responseList.data.eventJoinAnswerList2;

        this.setState({
            eventJoinAnswerList2: eventJoinAnswerList2,
            // eventJoinAnswerList2: data.recommendationList,
            // pageSize: this.state.pageSize + PAGE_SIZE,
            pageSize: 10,
        });

    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    render() {
        const { responseList, eventJoinAnswerList2, eventAnswerContents, eventAnswerCount, pageNo, pageSize, eventViewAddButton, evtPopup, ourSchJoin, eventJoinListAnswer, schName, joinSchCounts} = this.state;
        const {logged, event} = this.props;

        const eventApplyAnswerList2 = eventJoinAnswerList2.map((item, index) => (
            <EventListApply
                orderNo={item.orderNo}
                joinSchCounts={item.joinSchCount}
                schName={item.schName}
            />
        ));

        return (
            <section className="event231130">
                <div className="evtCont1">
                    <div className="evtTit">
                        <img src="/images/events/2023/event231130/evtTit.png" alt="비버샘 팬클럽"/>
                        <div className="blind">
                            <h3>
                                뭉쳐라 비버샘 팬클럽!
                                <span>비바샘의 귀염둥이, 비버샘의 팬클럽을 모집합니다!</span>
                            </h3>
                            <p>
                                뭉치면 커진다!
                                우리 학교 선생님을 비바샘 팬클럽에 초대하고,
                                동료 선생님들과 함께 비버샘 웰컴 굿즈 키트를 받아 보세요!
                            </p>
                            <div className="evtPeriod">
                                <div className="blind">
                                    <div><span className="tit blind">참여 기간​</span><span className="txt"><span
                                        className="blind">2023. 11. 30(목)~12.18(월) 18시</span></span></div>
                                    <span>*정확한 집계를 위해 18일 18시 이전까지 교사인증 및 이벤트 신청을 완료해 주세요.</span>
                                    <div><span className="tit blind">당첨자 발표​</span><span className="txt"><span
                                        className="blind">2023. 12. 20(수)</span></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evtCont2">
                    <div className="inner">
                        <div className="cont cont1">
                            <div className={"evtBadge"}>
                                <img src="/images/events/2023/event231130/evtBadge1.png" alt="이벤트1" />
                                <h3 className="blind">
                                    <span>최강 비버샘 팬클럽이 되기 위해 우리 학교, 뭉쳐라!</span>
                                </h3>
                            </div>

                            <div className={"contTxt"}>
                                <img src="/images/events/2023/event231130/evtCont1.png" alt="이벤트1"  className={"evtCont1_img"}/>
                                <div className="blind">
                                    <p>
                                        비버샘 팬클럽에 가장 많이 가입한 상위 50개교의
                                        이벤트 참여 선생님 전원에게 비버샘 굿즈 키트를 드립니다.
                                    </p>
                                    <span>참여대상</span>
                                    <p>
                                        비바샘 회원 대상 (교사 인증 완료)
                                    </p>
                                    <span>
                                        당첨 경품
                                    </span>
                                    <p>
                                        <strong>상위 50개교</strong>
                                        <span>* 키트 구성은 변경될 수 있습니다.</span>
                                        큐티뽀짝 비버샘 굿즈 키트
                                    </p>
                                </div>

                                <div className="txtBox">
                                    <h4>
                                        <img src="/images/events/2023/event231130/evtRanking.png" alt="실시간 학교 랭킹" />
                                        <span className="blind">실시간 학교랭킹</span>
                                    </h4>

                                    <div className="content_wrap">
                                        <a href="javascript:void(0);" onClick={() => this.copyToClipboard('https://mv.vivasam.com/#/saemteo/event/view/477','이벤트 URL이 복사되었습니다.')} className={"btnShare1"}>
                                            <img src="/images/events/2023/event231130/btnShare1.png" alt="팬클럽 가입 소문내기" />
                                        </a>
                                        <div className="right_content">
                                            <div className="join_wrap">
                                                { !logged &&
                                                (
                                                <div className="login_before">
                                                    <p>
                                                        로그인 후<br />
                                                        <strong>우리 학교 팬클럽 가입수</strong>를<br />
                                                        확인하실 수 있습니다.
                                                    </p>
                                                </div>
                                                )
                                                }

                                                { logged &&
                                                (
                                                <div className="login_after">
                                                    <p>
                                                        우리 학교<br />
                                                        <strong>팬클럽 가입 수</strong>
                                                    </p>
                                                    <div className="join_view">
                                                        <p> {ourSchJoin} </p>
                                                        <span>명</span>
                                                    </div>
                                                </div>
                                                )
                                                }



                                            </div>
                                            <div className="ranking_view_wrap">
                                                <a href="javascript:void(0)"onClick={this.handlePopupChange} className="btnViewRanking" >
                                                    <img src="/images/events/2023/event231130/btnViewranking.png" alt="학교 랭킹 보기" />
                                                    <span className="blind">학교 랭킹 보기</span>
                                                </a>
                                                <div className="join_ranking_pop" style ={{display: evtPopup ? "block": "none"}}>
                                                    <div className="pop_head">
                                                        <h3 className={'popTit'}>
                                                            <img src="/images/events/2023/event231130/popTit.png" alt="비버샘 팬클럽 가입랭킹" />
                                                            <span className="blind">비버샘 팬클럽 가입 랭킹</span>
                                                        </h3>
                                                        <button className="btnPopClose" onClick={this.handlePopupChange}>

                                                        </button>
                                                    </div>
                                                    <div className="pop_body">
                                                        {/*{eventApplyAnswerList2}*/}

                                                        <table>
                                                            <colgroup>
                                                                <col width={""}/>
                                                                <col width={""}/>
                                                                <col width={""}/>
                                                            </colgroup>
                                                            <thead>
                                                                <tr>
                                                                    <th>순위</th>
                                                                    <th>학교</th>
                                                                    <th>가입수</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                            {
                                                                (this.state.eventJoinAnswerList2 && this.state.eventJoinAnswerList2.length > 0)
                                                                    ?
                                                                    this.state.eventJoinAnswerList2.map((item, index) => {
                                                                        return (
                                                                            <tr key={index} >
                                                                                <td className={"rank"}>{item.orderNo}</td>
                                                                                <td className={"school"}>{item.schName}</td>
                                                                                <td className={"join"}>{item.joinSchCount}</td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                    :
                                                                    <tr>
                                                                        <td></td>
                                                                    </tr>
                                                            }
                                                            </tbody>
                                                        </table>
                                                        <EventApplyAnswerPagination
                                                            eventAnswerCount={eventAnswerCount}
                                                            pageSize={pageSize}
                                                            pageNo={pageNo}
                                                            handleClickPage={this.handleClickPage}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ul className={"realTime_rankingList"}>
                                        {eventJoinListAnswer[1] ? (
                                            <li className={"rank_2nd"}>
                                                <div className={"imgbox"}>
                                                    <img src="/images/events/2023/event231130/realTime_2nd.png" alt="학교 랭킹 보기" />
                                                </div>
                                                <div className="info">
                                                    <span className={"sc_name"}>{eventJoinListAnswer[1].schName}</span>
                                                    <span className={"person"}>{eventJoinListAnswer[1].joinSchCount}<span>명</span></span>
                                                </div>
                                            </li>
                                        ) : (
                                            <li className={"rank_2nd"}>
                                                <div className={"imgbox"}>
                                                    <img src="/images/events/2023/event231130/realTime_2nd.png" alt="학교 랭킹 보기" />
                                                </div>
                                                <div className="info">
                                                    <span className={"sc_name"}>비버샘학교</span>
                                                    <span className={"person"}>NN<span>명</span></span>
                                                </div>
                                            </li>
                                        )}
                                        {eventJoinListAnswer[0] ? (
                                            <li className={"rank_1st"}>
                                                <div className={"imgbox"}>
                                                    <img src="/images/events/2023/event231130/realTime_1st.png" alt="학교 랭킹 보기" />
                                                </div>
                                                <div className="info">
                                                    <span className={"sc_name"}>{eventJoinListAnswer[0].schName}</span>
                                                    <span className={"person"}>{eventJoinListAnswer[0].joinSchCount}<span>명</span></span>
                                                </div>
                                            </li>
                                        ) : (
                                            <li className={"rank_1st"}>
                                                <div className={"imgbox"}>
                                                    <img src="/images/events/2023/event231130/realTime_1st.png" alt="학교 랭킹 보기" />
                                                </div>
                                                <div className="info">
                                                    <span className={"sc_name"}>비버샘학교</span>
                                                    <span className={"person"}>NN<span>명</span></span>
                                                </div>
                                            </li>
                                        )}
                                        {eventJoinListAnswer[2] ? (
                                            <li className={"rank_3rd"}>
                                                <div className={"imgbox"}>
                                                    <img src="/images/events/2023/event231130/realTime_3rd.png" alt="학교 랭킹 보기" />
                                                </div>
                                                <div className="info">
                                                    <span className={"sc_name"}>{eventJoinListAnswer[2].schName}</span>
                                                    <span className={"person"}>{eventJoinListAnswer[2].joinSchCount}<span>명</span></span>
                                                </div>
                                            </li>
                                        ) : (
                                            <li className={"rank_3rd"}>
                                                <div className={"imgbox"}>
                                                    <img src="/images/events/2023/event231130/realTime_3rd.png" alt="학교 랭킹 보기" />
                                                </div>
                                                <div className="info">
                                                    <span className={"sc_name"}>비버샘학교</span>
                                                    <span className={"person"}>NN<span>명</span></span>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <button className="btnApply btnApply1" onClick={this.eventApply1}>
                                    <span className="blind">비버샘 팬클럽 가입하기</span>
                                </button>
                            </div>

                        </div>

                        <div className="cont cont2">
                            <div className={"evtBadge"}>
                                <img src="/images/events/2023/event231130/evtBadge2.png" alt="이벤트2" />
                                <h3 className="blind">
                                    <span>아직 비버샘&비바샘을 모르는 동료 선생님도 뭉쳐라! </span>
                                </h3>
                            </div>

                            <div className={"contTxt"}>
                                <img src="/images/events/2023/event231130/evtCont2_txt.png" alt="이벤트2"  className={"evtCont2_txt"}/>
                                <div className="blind">
                                    이벤트 기간동안 신규가입하고, 아래 신청하기 버튼을 통해 신청을 완료하시면 신규 가입 선생님 전원 & 가장 많은 추천을 받은 선생님 30분께 선물을
                                    드립니다! 동료선생님께 이벤트를 소문내 주세요!
                                </div>
                                <button className="btnApply btnApply2" onClick={this.eventApply2}>
                                    <span className="blind">신청하기</span>
                                </button>
                            </div>

                            <div className="contTxt_inner">
                                <div className="evtInnerBadge">
                                    <img src="/images/events/2023/event231130/evtInnerBadge.png" alt="당첨 경품" />
                                    <h3 className="blind">
                                        <span>당첨 경품</span>
                                    </h3>
                                </div>

                                <img src="/images/events/2023/event231130/evtCont2.png" alt="당첨 경품" />

                                <a href="javascript:void(0);" onClick={() => this.copyToClipboard('https://mv.vivasam.com/#/join/select​','URL이 복사되었습니다.')} className="btnShare2">
                                    <img src="/images/events/2023/event231130/btnShare2.png" alt="비바샘 회원가입 소문내가" />
                                    <span className="blind">비바샘 회원가입 소문내가</span>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>이벤트1은 비바샘 교사인증을 완료한 학교 선생님만 1인 1회 신청하실 수 있습니다.</li>
                        <li>이벤트2는 이벤트 기간 내 신규가입하시는 선생님만 1인 1회 신청하실 수 있습니다.</li>
                        <li>이벤트1 비버샘 팬클럽 가입 수가 동일할 경우, 해당 학교의 이벤트2 신규 가입 회원 수가 많은 순으로 순위가 집계됩니다.</li>
                        <li>비바샘 굿즈 키트는 학교 선생님 1분의 정보(연락처, 배송지 등)를 대표로 사용하여 지급될 예정이며, 상황에 따라 발송 방법은 변경될 수 있습니다.</li>
                        <li>최다 초대인은 신규 가입한 선생님이 추천인 ID를 입력하신 내역대로 집계됩니다.</li>
                        <li>초대인 ID 수가 동일할 경우, 마지막 신규 가입자가 이벤트 참여를 먼저 완료한 순으로 순위가 집계됩니다.</li>
                        <li>가입 후 이벤트 기간 내 탈퇴 시, 참여 내역은 삭제되며 이벤트 신청이 제한될 수 있으므로 신중히 탈퇴해 주세요.</li>
                        <li>개인정보 오기재로 인한 선물 재발송은 불가합니다.</li>
                        <li>참여 완료 후 정보 수정은 불가하므로 정확한 정보를 입력해 주세요.</li>
                        <li>경품 발송은 12월 21일부터 순차적으로 진행될 예정입니다.</li>
                        <li>비바샘 굿즈 키트는 학교로 발송되며, 발송에는 일정 시간이 소요될 수 있습니다.</li>
                        <li>
                            선물 발송을 위해 개인정보(성명, 주소, 연락처)가 서비스사에 제공됩니다.<br />
                            (㈜카카오 사업자등록번호 120-81-47521),<br /> ㈜모바일이앤엠애드 사업자등록번호 215-87-19169,<br /> ㈜CJ대한통운 사업자등록번호 110-81-0503)
                        </li>
                        <li>선물은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        <li>이벤트는 상황에 따라 조기 종료될 수 있습니다.</li>
                        <li>본 이벤트에서는 비바콘이 지급되지 않습니다.</li>
                    </ul>
                </div>
            </section>
        )
    }
}

//=============================================================================
// 학교 랭킹 50위 보기 목록 component
//=============================================================================

class EventListApply extends Component {

    constructor(props) {
        super(props);
        this.state = {
            member_id: this.props.member_id, // 멤버 아이디
            eventId1: 478,
            eventId2: 479,
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
            orderNo:"",
            schName:"",
            joinSchCount:0,
            joinSchCounts:'',
            ourSchJoin: 0,
            eventJoinAnswerList2: [],
        }

    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = async () => { // 이벤트 표시 값 세팅
        const {pageNo, pageSize, evtPopup} = this.state;

        let orderNo = this.state.orderNo;
        let joinSchCount = this.state.joinSchCount;
        let schName = this.state.schName;

        const params = {
            eventId: 478,
            eventAnswerSeq: 1,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

    };


    render() {
        const {eventJoinAnswerList2, orderNo, schName, joinSchCount,joinSchCounts, item} = this.state;

        return (
            <table>
                <colgroup>
                    <col width={""}/>
                    <col width={""}/>
                    <col width={""}/>
                </colgroup>
                <thead>
                <tr>
                    <th>순위</th>
                    <th>학교</th>
                    <th>가입수</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td className={"rank"}>순번{orderNo}</td>
                    <td className={"school"}>{eventJoinAnswerList2.schName}</td>
                    <td className={"join"}><strong>{joinSchCounts}</strong>명!</td>
                </tr>
                </tbody>
            </table>



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

class EventApplyAnswerPagination extends Component {

    render() {
        const {eventAnswerCount, pageSize, pageNo, handleClickPage} = this.props;

        const totalPage = Math.ceil(eventAnswerCount / pageSize);

        const curPage = pageNo;

        const pagesInScreen = 5;
        let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
        let endPageInScreen = startPageInScreen + pagesInScreen - 1;


        if (totalPage < endPageInScreen) endPageInScreen = totalPage;

        const pageButtonList = () => {
            const result = [];
            for (let i = startPageInScreen; i <= endPageInScreen; i++) {
                if (i === curPage) {
                    result.push(<button type="button" className={i===curPage ? 'on' : ''}>{i}</button>);
                } else {
                    result.push(<button type="button" onClick={() => handleClickPage(i)}>{i}</button>);
                }
            }

            return result;
        }

        return (
            <div className="eventPagingNav">
                    { curPage > 1 &&
                    <button
                        type="button"
                        className="pagingPrev"
                        onClick={() => {handleClickPage(curPage - 1)}}
                    ></button>
                    }
                    {pageButtonList()}
                    {curPage < totalPage &&
                    <button
                        type="button"
                        className="pagingNext"
                        onClick={() => {handleClickPage(curPage + 1)}}
                    ></button>
                    }
            </div>
        );
    }
}