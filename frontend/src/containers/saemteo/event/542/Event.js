import React, {Component, Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter, Link} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import ReactPlayer from 'react-player/youtube'
import * as myclassActions from "../../../../store/modules/myclass";
import {getRecommendEventInfo} from "lib/api";

const PAGE_SIZE = 30;

class Event extends Component {
    state = {
        eventId: 542,
        //486,487,488
        eventId1: 543,
        eventId2: 544,
        eventId3: 545,
        isEventApply1: false,       // 신청여부
        isEventApply2: false,       // 신청여부
        isEventApply3: false,       // 신청여부
        schoolLvlCd: '',
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/542',
        evtUrl: '',
        evtPopup: false,

        // eventJoinListAnswer:[],
        recommendRankList:[],
        eventJoinAnswerList2:[],
        schName: '',
        joinSchCount:'',
        memberRegType:null,
        myRank:"N",

        evtTabId: 1,
        evtAgreeShow : false,
        evtAgreeClass : '',
        eventJoinList:[
            {
                id:"Viva7777",
                name:"비바샘 선생님",
            },
            {
                id:"Viva7777",
                name:"비바샘 선생님"
            },
            {
                id:"Viva7777",
                name:"비바샘 선생님"
            },
            {
                id:"Viva7777",
                name:"비바샘 선생님"
            },
            {
                id:"Viva7777",
                name:"비바샘 선생님"
            }
        ]

    }

    componentDidMount = async () => {
        const {BaseActions, logged} = this.props;
        const {eventId} = this.state;

        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.setEventRedux();
            await this.newSemiEventInfo();             // 비바샘 새 학기 이벤트

            await this.getEventInfo(eventId);
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

    getEventInfo = async (eventId) => {
        const {logged, event, SaemteoActions} = this.props;
        const {isEventApply} = this.state;
        if(logged && !isEventApply) {
            const response = await api.eventInfo(eventId);

            let {memberId, name, schCode, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;

            // 학교코드가 99999, 99998, 99997일 경우 학교가 설정되지 않은 것으로 간주하여 정보불러오기에서 사용하는 정보를 공백처리한다.
            if (!schCode || schCode === 99999 || schCode === 99998 || schCode === 99997) {
                schName = '';
                schZipCd = '';
                schAddr = '';
            }

            event.memberId = memberId;
            event.userName = name;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.addressDetail = schName;
            event.cellphone = cellphone;
        }

        this.setState({ memberName: event.userName });

        event.agree1 = false;

        SaemteoActions.pushValues({type: "event", object: event});
    };

    newSemiEventInfo = async () => {
        const {logged} = this.props;

        const eventJoinRankList = await api.getRecommendEventInfo();
        if (logged) {
            let getRecommendRankList = eventJoinRankList.data.recommendList; // 추천받은 선생님 랭킹
            let memberRegType = eventJoinRankList.data.memberRegType;
            this.setState({
                eventJoinList:getRecommendRankList,
                memberRegType: memberRegType
            });
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

    handleJoin = () => {
        //회원가입 화면으로 이동
        this.props.history.push('/join/select');
    }

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

        if (e.target.name === 'agree1') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        SaemteoActions.pushValues({type: "event", object: event});
    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged} = this.props;
        const {eventId1, eventId2, eventId3} = this.state;
        if (logged) {
            const response1 = await api.chkEventJoin({eventId: eventId1});
            const response2 = await api.chkEventJoin({eventId: eventId2});
            const response3 = await api.chkEventJoin({eventId: eventId3});
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
            if (response3.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply3: true
                });
            }
        }
    }

    // 전제 조건
    prerequisite = (e) => {
        const {logged, history, BaseActions, loginInfo, event} = this.props;

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

        return true;
    }

    eventApply = async () => {
        if (!await this.prerequisite()) {
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
    };

    insertApplyForm = async () => {
        const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;
        const {eventId1} = this.state;
        if (!event.agree1) {
            common.error("개인정보 수집 및 이용내역에 동의해주세요.");
            return false;
        }

        if(this.state.memberRegType === 'B001'){
            common.info("이벤트1은 기존 가입자 대상 이벤트입니다.\n이벤트 기간에 가입한 선생님께서는 이벤트2와 3에 참여하실 수 있습니다.")
            return false;
        }


        try {
            BaseActions.openLoading();

            var params = {
                eventId: eventId1,
                eventAnswerDesc: event.schName + '/' + event.cellphone + "/"+ event.schAddr + ' ' + event.addressDetail + '/' + event.schZipCd,
                userInfo: "",
                schCode: "",
            };

            let response = await SaemteoActions.insertEventApply(params);

            if (response.data.code === '1') {
                common.error("이미 신청 하셨습니다.");
            } else if (response.data.code === '0') {
                // 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
                history.push("/myInfo");

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
            history.push('/saemteo/event/view/'+eventId1);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
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
        const {SaemteoActions, eventId, handleClick} = this.props;
        const {isEventApply3} = this.state;

        let eventAnswerContent = "";

        // 기 신청 여부
        if (isEventApply3) {
            common.error("이미 신청하셨습니다.");
            return false;
        }
        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        try {
            const eventAnswer = {
                isEventApply: isEventApply3,
                eventId: 545,
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
        const {isEventApply2} = this.state;

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
                eventId: 544,
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

    // 탭
    tabMenuClick = (e) => {
        const {evtTabId} = this.state;
        this.setState({
            evtTabId: e.currentTarget.value,
        });
    }

    evtAgreeShow = (e) => {
        const {evtAgreeShow} = this.state;
        this.setState({
            evtAgreeShow : !evtAgreeShow
        })
    }

    evtMoveLogin = () => {
        const {BaseActions, history} = this.props;
        BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
        history.push("/login");

        return false;
    }

    render() {
        const { evtTabId, eventJoinList, evtAgreeShow} = this.state;
        const {logged, event} = this.props;

        return (
            <section className="event250218">
                <div className="evtCont1">
                    <div className="evtTit">
                        <img src="/images/events/2025/542/evtTit.png" alt="welcome to vivasam"/>
                        <div className="blind">
                            <p>새 학기 시작은 비바샘과 함께!<br/> 최신 수업자료, 풍성한 수업도구, 선생님 맞춤 이벤트까지!<br/>비바샘이 준비한 신학기 선물, 지금 바로 만나보세요
                            </p>
                            <p>
                                참여 기간 - 2월 18일(화) ~ 3월 31일(월)
                                선물 발송 - 4월 7일(월)
                            </p>
                        </div>
                        <button type="button" className="btn_share" onClick={this.copyToClipboard}><span
                            className="blind">공유하기</span></button>
                    </div>
                    <ul className="tabMenu">
                        <li className={evtTabId == 1 ? 'on' : ''}>
                            <button type="button" onClick={this.tabMenuClick} value={1}><span><em className="blind">EVENT 1 회원 정보 업데이트</em></span>
                            </button>
                        </li>
                        <li className={evtTabId == 2 ? 'on' : ''}>
                            <button type="button" onClick={this.tabMenuClick} value={2}><span><em className="blind">EVENT 2 신규 회원 가입</em></span>
                            </button>
                        </li>
                        <li className={evtTabId == 3 ? 'on' : ''}>
                            <button type="button" onClick={this.tabMenuClick} value={3}><span><em className="blind">EVENT 3 신규 회원가입</em></span>
                            </button>
                        </li>
                    </ul>
                    <div className={"evtCont2 tab" + evtTabId}>
                        {evtTabId == 1 ?
                            <div className="cont cont1">
                                <img src="/images/events/2025/542/evt1.png" alt="회원 정보 업데이트"/>
                                <div className="blind">
                                    <h5>회원 정보 업데이트</h5>
                                    <p>
                                        회원 정보를 업데이트 하시면 최신 회원 정보에 맞춰 수업 자료와 이벤트 선물을 제공해 드려요!
                                    </p>
                                    <div>
                                        <p>참여 대상 - 비바샘 초중고 선생님</p>
                                        <p>참여 방법 - 아래 이벤트 참여하기 버튼을 클릭하여 학교정보, 학년정보, SMS 수신여부 등 회원 정보를 업데이트 하시면 자동으로 응모됩니다.
                                            ※ 이벤트 기간 중 신규 가입하신 선생님은 제외됩니다.
                                        </p>
                                    </div>

                                </div>
                                <div className={evtAgreeShow ? "privacy show" : "privacy"}>
                                    <div className="title" onClick={this.evtAgreeShow}>
                                        <p>개인정보 수집 및 이용동의</p>
                                        <button className="btn_arrow"></button>
                                    </div>
                                    <div className="privacyConts">
                                        <ul>
                                            <li>개인정보 수집 및 이용동의 이용 목적:<br/>경품 발송 및 고객 문의 응대</li>
                                            <li>수집하는 개인 정보: 성명, 재직 학교, 휴대전화번호</li>
                                            <li>개인정보 보유 및 이용 기간: 2025년 6월 30일까지<br/>(이용목적 달성 시 즉시 파기)</li>
                                            <li>개인정보 오기재로 인한 경품 재발송은 불가능합니다.<br/>개인정보를 꼭 확인해 주세요.</li>
                                            <li>경품 발송을 위한 개인정보(성함, 휴대 전화번호)가<br/> 배송업체 및 기프티콘 발송 서비스사에 제공됩니다.<br/>
                                                (㈜카카오 사업자등록번호 : 120-81-47521)/<br/>(㈜모바일이앤엠애드 사업자등록번호:215-87-19169)<br/>(CJ대한통운(주)  사업자등록번호 : 110-81-05034)
                                            </li>
                                        </ul>
                                        <p>선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다.<br/>단, 동의를 거부할 경우 신청이 불가합니다.</p>
                                        <div className="chk">
                                            <input type="checkbox" name="agree1" onChange={this.handleChange} checked={event.agree1}
                                                   id="evt1_agree"/>
                                            <label htmlFor="evt1_agree">개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="btn_wrap">
                                    <a className="btn_apply" onClick={this.eventApply}>
                                        <span className="blind">회원 정보 수정 바로가기</span>
                                    </a>
                                </div>
                            </div>
                            : ''
                        }
                        {evtTabId == 2 ?
                            <div className="cont cont2">
                                <img src="/images/events/2025/542/evt2.png" alt="신규 회원 가입"/>

                                <div className="blind">
                                    <h5>신규 회원 가입</h5>
                                    <p>
                                        비바샘 회원가입 및 교사인증을 완료하시고 최신 수업 자료와 선생님 맞춤 프로모션을 편하게 이용하세요!
                                    </p>
                                    <ul>
                                        <li>50만 개의 과목별,단원별, 유형별 수업자료</li>
                                        <li>국내 최대 규모의 창의 융합,에듀테크 수업자료</li>
                                        <li>전문가 선생님들과 만드는 수업 혁신 자료</li>
                                        <li>차별화된 선생님 전용서비스, 이벤트</li>
                                    </ul>
                                    <dl>
                                        <dt>당첨 선물</dt>
                                        <dd>
                                            100% 지급 메가커피 아메리카노(HOT),100명 추첨 비버샘 방석
                                        </dd>
                                    </dl>
                                    <dl>
                                        <dt>참여 대상</dt>
                                        <dd>비바샘 신규 회원</dd>
                                    </dl>
                                    <dl>
                                        <dt>참여 방법</dt>
                                        <dd>
                                            이벤트 기간동안 신규가입 및 교사인증 완료 후, 아래 이벤트 참여하기 버튼 클릭!<br/>
                                            *서류인증으로 교사인증을 진행하시는 경우, 반영일 최대 3일까지 소요됩니다.
                                        </dd>
                                    </dl>

                                </div>

                                <div className="btn_wrap">
                                    <a onClick={this.handleJoin} className="btn_join"><span
                                        className="blind">회원가입 바로가기</span></a>
                                    <button type="button" className="btn_apply" onClick={this.eventApply2}><span
                                        className="blind">이벤트 참여하기</span></button>
                                </div>
                            </div>
                            : ''
                        }
                        {evtTabId == 3 ?
                            <div className="cont cont3">
                                <img src="/images/events/2025/542/evt3.png" alt="동료 선생님 추천"/>
                                <div className="blind">
                                    <h6>동료 선생님 추천</h6>
                                    <p>
                                        아직 비바샘 회원이 아닌 동료 선생님께 에듀테크 서비스와 최신 수업 자료가 풍성한 비바샘을 추천해 주세요!<br/>
                                        동료 선생님이 회원가입 및 교사인증을 완료하면 추천해 주신 선생님게 100% 선물을 드려요
                                    </p>
                                    <div>
                                        <dl>
                                            <dt>참여 대상</dt>
                                            <dd>비바샘 초중고 선생님</dd>
                                        </dl>
                                        <dl>
                                            <dt>참여 방법</dt>
                                            <dd>
                                                <ul>
                                                    <li>아래의 이벤트 참여하기 버튼 클릭 후, 동료 선생님께 선생님의 ID를 알려주세요.</li>
                                                    <li>동료 선새님은 회원가입 단계에서 최하단 추천인 아이디 "있음"을 클릭하고 비바샘을 추천한 선생님의 아이디를
                                                        기입해주세요.
                                                    </li>
                                                    <li>동료 선생님이 회원가입 후 교사인증을 완료하면 참여 완료!</li>
                                                </ul>
                                            </dd>
                                        </dl>
                                        <dl>
                                            <dt>100% 선물</dt>
                                            <dd>
                                                <ul>
                                                    <li>10명 이상 추천 - 신세계 상품권 모바일 교환권 5만원</li>
                                                    <li>6명 이상 추천 - 파리바게트 초코반 딸기반 케이크</li>
                                                    <li>4명 이상 추천 - 스타벅스 아메리카노 2잔 & 케이크 2종</li>
                                                    <li>1명 이상 추천 - 메가커피 아메리카노(HOT)</li>

                                                </ul>
                                            </dd>
                                        </dl>
                                        <p>* 추천인 선생님 ID 입력 기준에 따라 경품이 지급됩니다.<br/>
                                            * 추천인 수는 선생님이 이벤트 참여하기를 접수한 시점부터 집계됩니다.<br/>
                                            * 추천인 수가 0명인 경우, 이벤트 참여에서 제외됩니다.</p>
                                    </div>
                                   
                                </div>


                                <div className="evt_rank_wrap">
                                    <h5 className="evt_rank_tit"><span className="blind">실시간 선생님 랭킹</span></h5>
                                    <div className="evt_rank_top">
                                        <h3>
                                            <span className="blind">참여 접수 이후, 동료 선생님이 회원가입+추천인 ID 입력+교사인증을 완료 하면 실시간 추천인 수에 집계됩니다.</span>
                                            <span
                                                className="blind">* 단, 서류인증으로 교사인증을 진행하시는 경우, 반영일 최대 3일까지 소요됩니다.</span>
                                        </h3>
                                        {/* 로그인 전 */}
                                        {!logged &&
                                            (
                                                <div className="ranking" onClick={this.evtMoveLogin}>
                                                    <p>로그인 하고<br/>추천인 현황 확인하기<span></span></p>
                                                </div>
                                            )
                                        }
                                        {/* 로그인 후 && 나를 추천한 사람이 없으면 */}
                                        {(logged && (eventJoinList.length < 1)) && (
                                            <div className="nodata"><p>아직 집계된 추천인이 없습니다.</p></div>
                                        )
                                        }

                                        <ul className={"ranking evt_rank_list"} style={{'display':(logged && (eventJoinList.length > 0)) ? 'flex' : 'none'}}>
                                            {(logged && (eventJoinList.length > 0)) ?
                                                eventJoinList.slice(0, 5).map((item, idx) => {
                                                    // 아이디 식별화 처리 (앞에서부터 4자리만 *로 대체)
                                                    const idStar = item.memberId.substring(0, 3) + item.memberId.substring(3).replace(/./g, '*');
                                                    // 이름 식별화 처리
                                                    const nameStar = item.memberName.split("");
                                                    const nameStars = nameStar.map((char, index) => {
                                                        if (nameStar.length == 2) {
                                                            if (index == 0) return char + "*";
                                                        } else {
                                                            // 첫 번째 글자와 마지막 글자는 그대로 유지하고 나머지는 '*'로 대체
                                                            if (index === 0 || index === nameStar.length - 1) {
                                                                return char;
                                                            } else {
                                                                return '*';
                                                            }
                                                        }
                                                    }).join("");
                                                    const nameStarTeacher = nameStars + " 선생님";
                                                    return (<li className={"rank" + (idx)} key={idx}>
                                                        <span className="num">{(idx+1)}</span>
                                                        <h6>{idStar}</h6>
                                                        <p>{nameStarTeacher}</p>
                                                    </li>)
                                                }) : ''
                                            }
                                        </ul>
                                    </div>

                                </div>


                                <div className="btn_wrap">
                                    <button type="button" className="btn_apply" onClick={this.eventApply1}><span
                                        className="blind">이벤트 참여하기</span></button>
                                </div>
                            </div>
                            : ''
                        }

                    </div>

                    <div className="notice">
                        <strong>유의사항</strong>
                        <ul className="evtInfoList">
                            <li>본 이벤트에서는 비바콘은 지급되지 않습니다.</li>
                            <li>회원정보 업데이트는 기존 회원(학교 선생님) 대상 이벤트입니다.</li>
                            <li>신규 회원가입은 신규 회원 대상 이벤트입니다.</li>
                            <li>동료 선생님 추천 이벤트 경품은 추천인 아이디 입력 기준에 따라 지급되며 추천인 수가 0명인 경우 이벤트 참여에서 제외됩니다.(추천인 수 1명부터 경품
                                100% 증정)
                            </li>
                            <li>추천인은 이벤트 참여하기를 접수한 시점부터 집계되며, 동료 선생님이 회원가입 및 교사인증을 모두 완료하셔야 집계됩니다.
                            </li>
                            <li>추천인 아이디 입력 누락, 오기입으로 인한 경품 발송은 불가합니다.</li>
                            <li>이벤트 참여 후, 이벤트 기간 내 탈퇴 시 참여로 인정되지 않습니다.</li>
                            <li>참여 이후, 개인정보 변경 또는 참여 내역 수정이 불가합니다.</li>
                            <li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                            <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                            <li>경품 발송을 위해 개인정보(성명, 휴대전화번호, 자택 주소, 학교 주소)가 서비스사에 제공됩니다. <br/>(㈜카카오 사업자등록번호 :
                                120-81-47521)/<br/> (㈜모바일이앤엠애드 사업자등록번호: 215-87-19169)<br/>
                                (CJ대한통운㈜ 사업자등록번호 110-81-05034))
                            </li>
                        </ul>
                    </div>
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