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
        eventId1: 466,
        eventId2: 467,
        isEventApply1 : false,       // 신청여부
        isEventApply2 : false,       // 신청여부
        schoolLvlCd: '',
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtComment: '',
        choosedItem: '',
        tabOn: 1,
        ytVideoSwitch: false,
        ytVideoThumb: false,

    }

    componentDidMount = async () => {        const {BaseActions, event, SaemteoActions, logged} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.tabSetting();
            // await this.checkEventCount();   		// 이벤트 참여자 수 조회
            // await this.commentConstructorList();	// 이벤트 댓글 목록 조회
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

    tabSetting = (e) => {
        const {logged, loginInfo, event, SaemteoActions} = this.props;
        if(logged && (loginInfo.schoolLvlCd === 'MS' || loginInfo.schoolLvlCd === 'HS')) {
            this.setState({
                tabOn : 2
            })
        }

        event['eleCont'] = '';
        event['highCont'] = '';

        SaemteoActions.pushValues({type: "event", object: event});
    };

    tabOnChange = (e) => {
        const { tabOn } = this.state;

        console.log(e.currentTarget.value);

        this.setState({
            tabOn: e.currentTarget.value,
        })

    };


    //유튜브 재생
    ytVideoPlay = () => {
        const {ytVideoSwitch, ytVideoThumb} =this.state;

        console.log(ytVideoSwitch, ytVideoThumb);

        this.setState({
            ytVideoSwitch: true,
            ytVideoThumb: true,
        }, () => {
            console.log(ytVideoSwitch, ytVideoThumb)
        });


    }



    setEventRedux = async () => {
        const {event, SaemteoActions} = this.props;

        event.adventure = '';

        SaemteoActions.pushValues({type: "event", object: event});
    }


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
            e.target.checked = false;
            return;
        }

        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
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
        const {eventId1, eventId2} = this.state;
        if (logged) {
            const response1 = await api.chkEventJoin({eventId:eventId1});
            const response2 = await api.chkEventJoin({eventId:eventId2});

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
        const {isEventApply1, isEventApply2, schoolLvlCd, tabOn} = this.state;

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

        // 초등 교사 여부
        // if (schoolLvlCd !== 'ES') {
        //     common.info("초등학교 선생님 대상 이벤트 입니다.");
        //     return false;
        // }

        // 기 신청 여부
        if (isEventApply1 || isEventApply2) {
            common.error("이미 신청하셨습니다.");
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
                schoolLvlCd : result.data.schoolLvlCd
            })
        } catch (e) {
            console.log(e);
        }
    }



    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply1 = async () => {
        const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick, event} = this.props;
        const { isEventApply, schoolLvlCd} = this.state;

        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        if (event.eleCont === '') {
            common.info("퀴즈 정답을 선택해주세요!");
            document.activeElement.blur();
            return;
        }

        if (schoolLvlCd !== 'ES') {
            common.info("중고등 선생님을 위한 퀴즈는 바로 옆 탭에서 참여가능합니다!");
            document.activeElement.blur();
            return;
        }

        try {
            const eventAnswer = {
                isEventApply : isEventApply,
                eventId: 466
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
        const { logged,  loginInfo, history, BaseActions, SaemteoActions, eventId, handleClick, event} = this.props;
        const { isEventApply, schoolLvlCd} = this.state;

        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        if (event.highCont === '') {
            common.info("퀴즈 정답을 선택해주세요!");
            document.activeElement.blur();
            return;
        }

        if (schoolLvlCd !== 'MS' && schoolLvlCd !== 'HS') {
            common.info("초등 선생님을 위한 퀴즈는 바로 옆 탭에서 참여가능합니다!");
            document.activeElement.blur();
            return;
        }

        try {
            const eventAnswer = {
                isEventApply : isEventApply,
                eventId: 467
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
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, eventViewAddButton, tabOn,  ytVideoSwitch, ytVideoThumb } = this.state;
        const {event} = this.props;

        return (
            <section className="event230904_2">
                <div className="evtCont1">
                    <div className="evtTit">
                        <img src="/images/events/2023/event230904_2/evtTit.png" alt="에듀테크 체크하면 Don't worry" />
                        <div className="blind">
                            <h2>
                                <span>비바샘 X 상상그리다필름</span>
                                영상 ON AIR 프로젝트2
                                에듀테크? 체크하면 Don't worry
                            </h2>
                            <span>선생님의 고민을 덜어줄 비바샘 에듀테크 테마관!</span>
                            <p>
                                직접 실험하고, 채점하고, 찾았던 장소
                                비바샘에서 체크(V) 하면 스마트하게 준비할 수 있어요.
                                선생님의 고민을 덜어줄 비바샘 에듀테크 테마관!
                                아래 영상을 시청하고 퀴즈를 풀면
                                추첨을 통해 즐거움이 팡팡 터지는 선물을 드립니다.
                            </p>
                            <ul className="evtPeriod">
                                <li><span className="tit"><em className="blind">참여 기간</em></span><span className="txt">2023년 9월 4일(월) ~ 9월 24일(일)</span></li>
                                <li><span className="tit tit2"><em className="blind">당첨자 발표</em></span><span className="txt txt2">2023년 10월 2일(월)</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="evtCont2">
                    <div className="contVideo">
                        <div className="innerVideo">
                            <div className={"thumb " + (ytVideoThumb ? " " : "on")}>
                                <img src="/images/events/2023/event230904_2/thumb.png" alt="에듀체크 비바샘" />
                                <button onClick={this.ytVideoPlay}  className="btnPlay">
                                    <span className="blind">재생하기</span>
                                </button>
                            </div>
                            <ReactPlayer
                                url={'https://www.youtube.com/embed/bHQ2vE-Xfrc?si=sXvenhojFfTzUSKf'}
                                width="100%"
                                height="100%"
                                playing={ytVideoSwitch}
                            />
                        </div>
                    </div>

                    <div className="inner">
                        <div className="cont">
                            <img src="/images/events/2023/event230904_2/evtGift.png" alt="깜짝 퀴즈쇼"/>
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

                        <div className="cont">
                            <div className="tab_wrap">
                                <ul className="tab_menu">
                                    <li className={tabOn == 1 ? 'on': ''}>
                                        <button onClick={this.tabOnChange} value={1}>
                                            <span className="video_tit">초등 선생님 대상</span>
                                        </button>
                                    </li>
                                    <li className={tabOn == 2 ? 'on': ''}>
                                        <button  onClick={this.tabOnChange} value={2}>
                                            <span className="video_tit">중고등 선생님 대상</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className={"tab_conts tab_conts1 " + (tabOn == 1? "on": "")} >
                                <div className="tab_inner">
                                    <div className="cont_box">
                                        <h3>
                                            <img src="/images/events/2023/event230904_2/evtCont1.png" alt="초등 선생님 대상"/>
                                            <span className="blind">
												8월 25일 새롭게 오픈한 비바샘 에듀테크 테마관은 무엇일까요?
												힌트: 상상그라다필름 선생님들이 만든 영상 20초를 확인해보세요.
											</span>
                                        </h3>
                                        <ul>
                                            <li>
                                                <input type="radio" id="eleCont1" name="eleCont" onChange={this.handleChange} value="비바샘 악어관"/>
                                                <label htmlFor="eleCont1">
                                                    <span></span>
                                                    비바샘 악어관
                                                </label>
                                            </li>
                                            <li>
                                                <input type="radio" id="eleCont2" name="eleCont" onChange={this.handleChange} value="비바샘 음악관"/>
                                                <label htmlFor="eleCont2">
                                                    <span></span>
                                                    비바샘 음악관
                                                </label>
                                            </li>
                                            <li>
                                                <input type="radio" id="eleCont3" name="eleCont" onChange={this.handleChange} value="음악샘 비버관"/>
                                                <label htmlFor="eleCont3">
                                                    <span></span>
                                                    음악샘 비버관
                                                </label>
                                            </li>
                                            <li>
                                                <input type="radio" id="eleCont4" name="eleCont" onChange={this.handleChange} value="비바샘 흥얼관"/>
                                                <label htmlFor="eleCont4">
                                                    <span></span>
                                                    비바샘 흥얼관
                                                </label>
                                            </li>
                                        </ul>
                                        <div className="btnWrap">
                                            <button type="button" className="btnApply" onClick={this.eventApply1}>
                                                <img src="/images/events/2023/event230904_2/btnApply.png" alt="참여하기"/>
                                                <span className="blind">신청하기</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"tab_conts tab_conts2 " + (tabOn == 1?" " : "on")} >
                                <div className="tab_inner">
                                    <div className="cont_box">
                                        <h3>
                                            <img src="/images/events/2023/event230904_2/evtCont2.png" alt="초등 선생님 대상"/>
                                            <span className="blind">
												​직접 실험해야만 했던 것들을 교실에서 안전하게 실험할 수 있는 비바샘 에듀테크 테마관 이름은?
												힌트: 상상그리다필름 선생님들이 만든 영상 20초를 확인해 보세요.
											</span>
                                        </h3>
                                        <ul>
                                            <li>
                                                <input type="radio" id="highCont1" name="highCont" onChange={this.handleChange} value="우당탕 과학 놀이터"/>
                                                <label htmlFor="highCont1">
                                                    <span></span>
                                                    우당탕 과학 놀이터
                                                </label>
                                            </li>
                                            <li>
                                                <input type="radio" id="highCont2" name="highCont" onChange={this.handleChange} value="과학 가상 실험실"/>
                                                <label htmlFor="highCont2">
                                                    <span></span>
                                                    과학 가상 실험실
                                                </label>
                                            </li>
                                            <li>
                                                <input type="radio" id="highCont3" name="highCont" onChange={this.handleChange} value="비버샘 비밀 실험실"/>
                                                <label htmlFor="highCont3">
                                                    <span></span>
                                                    비버샘 비밀 실험실
                                                </label>
                                            </li>
                                            <li>
                                                <input type="radio" id="highCont4" name="highCont" onChange={this.handleChange} value="과상 과학 실험실"/>
                                                <label htmlFor="highCont4">
                                                    <span></span>
                                                    과상 과학 실험실
                                                </label>
                                            </li>
                                        </ul>
                                        <div className="btnWrap">
                                            <button type="button" className="btnApply" onClick={this.eventApply2}>
                                                <img src="/images/events/2023/event230904_2/btnApply.png" alt="참여하기"/>
                                                <span className="blind">신청하기</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={"cont"}>
                            <img src="/images/events/2023/event230904_2/evtYt.png" alt="유튜브 이벤트"/>
                            <div className="blind">
                                <h3>check2 + 유튜브 이벤트</h3>
                                <p>
                                    비바샘 채널 구독 후 영상에 좋아요와 감상평을 남겨주세요.
                                    100명을 추첨해 시원한 커피를 드려요
                                </p>
                                <p>
                                    깜짝 퀴즈쇼와 중복으로 참여/당첨이 가능합니다.
                                    이벤트 참여는 오른쪽 바로가기 버튼을 클릭해주세요.
                                    영상 설명 더보기 탭에서 참여 방법을 확인할 수 있습니다.
                                </p>
                            </div>
                            <a href="https://www.youtube.com/watch?v=bHQ2vE-Xfrc&feature=youtu.be" className="btnGo">
                                <img src="/images/events/2023/event230904_2/btnYt.png" alt="유튜브 채널 바로가기"/>
                                <span className="blind">비바샘 유튜브 채널 바로가기</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li> 1인 1회 참여하실 수 있습니다.</li>
                        <li> 본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                        <li>참여 완료 후에는 수정 및 추가 참여가 어렵습니다.</li>
                        <li>에어팟 3세대 경품 당첨자에게는 제세공과금(22%)이 부여되며 별도 연락드릴 예정입니다.</li>
                        <li>
                            정확하지 않은 휴대번호를 입력하거나 유효 기간동안 기프티콘을 사용하지 않은 경우,
                            재발송은 어렵습니다.
                        </li>
                        <li>
                            이벤트 당첨자의 잘못된 개인정보 전달로 인한 불이익(연락 불가, 경품 반송/분실 등)은
                            책임지지 않습니다.
                        </li>
                    </ul>
                </div>
            </section>
        )
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