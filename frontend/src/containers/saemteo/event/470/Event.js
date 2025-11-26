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

class Event extends Component {
    state = {
        eventId1: 471,
        eventId2: 472,
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
        eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/470',
        evtComment: '',
        choosedItem: '',
        ytVideoSwitch: [false, false, false],
        ytVideoThumb: [true, true, true],
        counting: 0,
        video1: false, // 영상1 선택 여부
        video2: false, // 영상2 선택 여부
        video3: false, // 영상3 선택 여부
        text1: '',
        text2: '',
        text3: '',
        evtUrl: '',
    }

    componentDidMount = async () => {
        const {BaseActions, event, SaemteoActions, logged} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.checkEventCount();   		// 이벤트 참여자 수 조회
            await this.commentConstructorList();	// 이벤트 댓글 목록 조회
            await this.setEventRedux();

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
            video4: false,
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
        // if (isEventApply1 || isEventApply2) {
        //     common.error("이미 신청하셨습니다.");
        //     return false;
        // }

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

        if (!video1 && !video2 && !video3) {
            common.info("영상 투표를 해주세요.")
            return;
        }
        if (samhangsi2 == "") {
            common.info("3행시를 입력해 주세요.")
            return;
        }
        if (samhangsi2.length < 2 ) {
            common.info("최소 2자 ~ 최대 300자까지 입력할 수 있어요.")
            return;
        } else {
            video1 ? eventAnswerContent = "선생님의 비타민 비바샘^||^" + samhangsi : eventAnswerContent += "";
            video2 ? eventAnswerContent = "선생님은 수업 준비 뿐^||^" + samhangsi : eventAnswerContent += "";
            video3 ? eventAnswerContent = "콘텐츠 맛집 비바샘^||^" + samhangsi : eventAnswerContent += "";
        }

        try {
            const eventAnswer = {
                isEventApply: isEventApply,
                eventId: 471,
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
        const {SaemteoActions, eventId, handleClick, event} = this.props;
        const {isEventApply2, evtUrl} = this.state;

        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        // 기 신청 여부
        if (isEventApply2) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        if (event.evtUrl.length < 2) {
            common.info("URL을 입력해 주세요.");
            return false;
        }

        let eventAnswerContent = "";
        eventAnswerContent += (event.evtUrl)

        try {
            const eventAnswer = {
                isEventApply: isEventApply2,
                eventId: 472,
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
            eventId: 471,
            eventAnswerSeq: 2,
            answerIndex: 1
        };
        let response2 = await api.getSpecificEventAnswerCount(params);
        this.setState({
            eventAnswerCount: response2.data.eventAnswerCount
        });

        // 최초 조회시 전체건수가 5건이상이면 더보기 버튼 표시
        if (this.state.eventAnswerCount > PAGE_SIZE) {
            this.setState({
                eventViewAddButton: 1
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
        common.info('이벤트 URL이 복사되었습니다.');
    };

    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId} = this.props;
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: 471,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList = await api.getSpecificEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if (this.state.eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 조회가 완료되면 다음 조회할 건수 설정
        this.setState({
            eventAnswerContents: eventJoinAnswerList,
            pageSize: this.state.pageSize + PAGE_SIZE,
        });
    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, eventViewAddButton, ytVideoSwitch, ytVideoThumb, counting, text1, text2, text3, evtUrl} = this.state;
        const {event} = this.props;

        //css용 인덱스
        let loopIndex = 0;
        // 댓글
        const eventList = eventAnswerContents.map((eventList, index) => {

            if (loopIndex >= 6) {
                loopIndex = 1;
            } else {
                loopIndex++;
            }

            const result = <EventListApply {...eventList} key={eventList.event_answer_id} indexNum={loopIndex}/>;
            return result;
        });

        return (
            <section className="event231018">
                <div className="evtCont1">
                    <div className="evtTit">
                        <img src="/images/events/2023/event231018/evtTit.png" alt="비바샘 10주년 이벤트"/>
                        <div className="blind">
                            <h2>비바샘 10주년 이벤트</h2>
                            <p>
                                비상교과서· 비바샘을 사랑해주신 선생님 감사합니다
                            </p>

                            <p>
                                선생님께서 보내주신 관심과 응원 속에서
                                비바샘은 10년 동안 꾸준히 성장해왔습니다.
                            </p>
                            <p>
                                시간이 흘러도 즐거운 수업을 만들기 위해 노력하는 선생님께
                                행복의 순간을 선물할 수 있도록 비바샘이 함께 하겠습니다.
                            </p>
                            <ul className="evtPeriod">
                                <li><span className="tit"><em className="blind">참여 기간</em></span><span className="txt">2023년 10월 18일 (수) ~ 11월 8일 (수)</span>
                                </li>
                                <li><span className="tit tit2"><em className="blind">당첨자 발표</em></span><span
                                    className="txt txt2">2023년 11월 10일 (금)</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="evtCont2">
                    {/*<div className="contVideo">*/}
                    {/*    <div className="innerVideo">*/}
                    {/*        <div className={"thumb " + (ytVideoThumb ? " " : "on")}>*/}
                    {/*            <img src="/images/events/2023/event231018/thumb.png" alt="에듀체크 비바샘" />*/}
                    {/*            <button onClick={this.ytVideoPlay}  className="btnPlay">*/}
                    {/*                <span className="blind">재생하기</span>*/}
                    {/*            </button>*/}
                    {/*        </div>*/}
                    {/*        <ReactPlayer*/}
                    {/*            url={'https://www.youtube.com/embed/bHQ2vE-Xfrc?si=sXvenhojFfTzUSKf'}*/}
                    {/*            width="100%"*/}
                    {/*            height="100%"*/}
                    {/*            playing={ytVideoSwitch}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className={"contTit"}>
                        <img src="/images/events/2023/event231018/evtCont1_tit.png" alt="이벤트1"/>
                        <div className={"blind"}>
                            <span>이벤트1</span>
                            <p>
                                비바샘 3행시 영상 중 가장 마음에 드는 영상에 투표하고
                                "비바샘"으로 선생님만의 3행시를 지어주세요!
                                <span>센스있는 3행시를 지어주신 1,000분을 선정하여 푸짐한 선물을 드립니다.</span>
                            </p>
                        </div>
                    </div>
                    <div className="inner">
                        <div className="cont cont1">
                            <img src="/images/events/2023/event231018/evtGift.png" alt="" className={"gift"}/>
                            <div className="blind">
                                <ul>
                                    <li>
                                        <span>2명</span>
                                        <p>듣는 즐거움 ON</p>
                                        <span>듣는 즐거움</span>
                                    </li>
                                    <li>
                                        <span>100명</span>
                                        <p>뜯고 씹는 즐거움 ON</p>
                                        <span>Bhc 치킨</span>
                                    </li>
                                    <li>
                                        <span>300명</span>
                                        <p>쓰는 즐거움 ON</p>
                                        <span>네어버 포인트 3,000원</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="cont cont2">
                            <div className={"vote"}>
                                <div className="tit">
                                    <img src="/images/events/2023/event231018/evtCont1_tit1.png"
                                         alt="가장 마음에드는 영상에 투표하세요!"/>
                                    <p className="blind">가장 마음에드는 영상에 투표하세요!</p>
                                </div>
                                <ul>
                                    <li>
                                        <div className="video_wrap">
                                            <div className={"thumb " + (ytVideoThumb[0] ? "on" : "")}>
                                                <img src="/images/events/2023/event231018/evtVote_img1.png" alt=""/>
                                                <button className="btnPlay" onClick={this.playVid} value={1}></button>
                                            </div>
                                            <ReactPlayer
                                                url={'https://www.youtube.com/embed/u5ZgvkGexnI?enablejsapi=1&version=3&playerapiid=ytplayer&start=2'}
                                                width="100%"
                                                height="100%"
                                                className={"video"}
                                                playing={ytVideoSwitch[0]}
                                                controls={1}
                                            />
                                        </div>
                                        <p>선생님의 비타민 비바샘</p>
                                        <div className="radioBtn">
                                            <input type="radio" name="video" id="video1" value="선생님의 비타민 비바샘" onChange={this.handleChange}/>
                                            <label htmlFor="video1"></label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="video_wrap">
                                            <div className={"thumb " + (ytVideoThumb[1] ? "on" : "")}>
                                                <img src="/images/events/2023/event231018/evtVote_img2.png" alt=""/>
                                                <button className="btnPlay" onClick={this.playVid} value={2}></button>
                                            </div>
                                            <ReactPlayer
                                                url={'https://www.youtube.com/embed/bxPq6BbFCHY?&version=3&playerapiid=ytplayer&start=2'}
                                                width="100%"
                                                height="100%"
                                                className={"video"}
                                                playing={ytVideoSwitch[1]}
                                                controls={1}
                                            />
                                        </div>
                                        <p>선생님은 수업 준비 뿐</p>
                                        <div className="radioBtn">
                                            <input type="radio" name="video" id="video2" value="선생님은 수업 준비 뿐" onChange={this.handleChange}/>
                                            <label htmlFor="video2"></label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="video_wrap">
                                            <div className={"thumb " + (ytVideoThumb[2] ? "on" : "")}>
                                                <img src="/images/events/2023/event231018/evtVote_img3.png" alt=""/>
                                                <button className="btnPlay" onClick={this.playVid} value={3}></button>
                                            </div>
                                            <ReactPlayer
                                                url={'https://www.youtube.com/embed/pDuRh0kwmuY?&version=3&playerapiid=ytplayer&start=2'}
                                                width="100%"
                                                height="100%"
                                                className={"video"}
                                                playing={ytVideoSwitch[2]}
                                                controls={1}
                                            />
                                        </div>
                                        <p>콘텐츠 맛집 비바샘</p>
                                        <div className="radioBtn">
                                            <input type="radio" name="video" id="video3" value="콘텐츠 맛집 비바샘" onChange={this.handleChange}/>
                                            <label htmlFor="video3"></label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className={"line_poem"}>
                                <div className="tit">
                                    <img src="/images/events/2023/event231018/evtCont1_tit2.png" alt="비바샘으로 멋진 3행시를 지어주세요!"/>
                                    <p className="blind">비바샘으로 멋진 3행시를 지어주세요!</p>
                                </div>
                                <ul>
                                    <li>
                                        <textarea name="poem" rows={1} id="poem1" className="autoResize" value={text1} placeholder="비바샘은" onInput={(e) => this.poemWrite(e, 'text1')}></textarea>
                                    </li>
                                    <li>
                                        <textarea name="poem" rows={1} id="poem2" className="autoResize" value={text2} placeholder="바보예요!" onInput={(e) => this.poemWrite(e, 'text2')}></textarea>
                                    </li>
                                    <li>
                                        <textarea name="poem" rows={1} id="poem3" className="autoResize" value={text3} placeholder="샘밖에 모르는 바보!" onInput={(e) => this.poemWrite(e, 'text3')}></textarea>
                                    </li>
                                </ul>
                                <span className="count"><span className="currentCount">{counting}</span>/300</span>
                            </div>


                            <button className="btnApply" onClick={this.eventApply1}>
                                <span className="blind">신청하기</span>
                            </button>

                        </div>
                    </div>
                </div>

                <div className="evtCont3">
                    <div className={"contTit"}>
                        <img src="/images/events/2023/event231018/evtCont2_tit.png" alt="이벤트2"/>
                        <div className={"blind"}>
                            <span>이벤트2</span>
                            <p>
                                비바샘 10주년 소식을 주변 동료 선생님께 알려주세요!
                                <span>비바샘 10주년 소식을 공유해 주신 100분을 선정하여 선물을 드립니다.</span>
                            </p>
                        </div>
                    </div>
                    <div className="inner">
                        <div className="cont cont3">
                            <div className="coffee">
                                <img src="/images/events/2023/event231018/evtCont2.png" alt=""/>
                                <div className="blind">
                                    <span>100명</span>
                                    <p>메가커피(ICE)</p>
                                    <span>아메리카노</span>
                                </div>
                            </div>
                            <div className="urlShareWrap">
                                <button className="btnShare" onClick={this.copyToClipboard}>이벤트<br/><span>URL 복사하기</span></button>
                                <div className="urlForm">
                                    <input type="text" id="evtUrl" onChange={this.handleChangeUrl} value={event.evtUrl} placeholder="SNS/커뮤니티에 공유한 URL을 입력해 주세요."/>
                                </div>
                            </div>

                            <button className="btnApply" onClick={this.eventApply2}>
                                <span className="blind">신청하기</span>
                            </button>
                        </div>
                    </div>
                </div>

                {eventAnswerCount > 0 &&
                <div className="commentWrap cont_Wrap">
                    <div className="inner">
                        <div className="commentList">
                            {eventList}
                        </div>
                        <button className="btnMore" style={{display: eventViewAddButton == 1 ? 'block' : 'none'}} onClick={this.commentListAddAction}>
                            <img src="/images/events/2023/event231018/btnMore.png"/>
                            <span className="blind">더보기</span>
                        </button>
                    </div>
                </div>}


                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                        <li>1인 1회 참여하실 수 있습니다.</li>
                        <li>참여 이후, 개인정보 변경 또는 참여 내역 수정이 불가합니다.</li>
                        <li>경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                        <li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        <li>
                            경품 발송을 위해 개인정보(성명, 휴대전화번호, 자택 주소, 학교 주소)가 서비스사에 제공됩니다.<br/>
                            (㈜CJ대한통운 사업자등록번호: 110-81-05034)/<br/>
                            (㈜한진택배 사업자등록번호: 201-81-02823)<br/>
                            (㈜카카오 사업자등록번호 : 120-81-47521)/<br/>
                            (㈜다우기술 사업자등록번호: 220-81-02810)/<br/>
                            (㈜모바일이앤엠애드 사업자등록번호:215-87-19169)
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
            eventId1: 472,
            eventId2: 471,
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

        this.textareaRef1 = React.createRef();
        this.textareaRef2 = React.createRef();
        this.textareaRef2 = React.createRef();
    }

    componentDidMount = () => {
        this.eventListApply();
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
        common.info('이벤트 URL이 복사되었습니다.');
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        let masking = "*"
        eventSetName = eventSetName.substring(1, 4) + "***"; // 이벤트 참여자 아이디


        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc: answers[1],
            event_answer_desc2: answers[1],
        });

    };


    render() {
        const {eventName, event_answer_desc, event_answer_desc2} = this.state;

        const formattedText = event_answer_desc.replace(/\\n/g, '<br/>');

        return (
            <div className={"listItem"}>
                <p className="userInfo">{eventName} 선생님</p>
                <div className="comment">
                    <p dangerouslySetInnerHTML={{ __html: formattedText }} style={{ whiteSpace: 'pre-line' }}></p>
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
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));