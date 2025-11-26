import React, {Component} from 'react';
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

const PAGE_SIZE = 30;

let recommendRankList = [];
let eventJoinAnswerList2 = [];

class Event extends Component {
    state = {
        eventId: 485,
        eventId1: 486,
        eventId2: 487,
        eventId3: 488,
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
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/485',
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
        const {BaseActions, event, SaemteoActions, logged} = this.props;
        const {eventId} = this.state;

        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.checkEventCount();   		// 이벤트 참여자 수 조회
            await this.commentConstructorList2();	// 이벤트 댓글 목록 조회2
            await this.setEventRedux();
            await this.newSemiEventInfo();             // 비바샘 새 학기 이벤트

            // await this.vivaJoinEventInfo();

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
        const {eventJoinList , memberName ,myRank} = this.state
        const {logged, eventId} = this.props;

        const eventJoinRankList = await api.getNewSemiEventInfo();

        let getRecommendRankList = eventJoinRankList.data.getRecommendRankList; // 추천받은 선생님 랭킹

        this.setState({
            eventJoinList:getRecommendRankList,
            myRank:myRank
        });

        let memberRegType = eventJoinRankList.data.memberRegType;

        if (logged) {
            let myRank = eventJoinRankList.data.myRank;
            this.setState({
                eventJoinList: getRecommendRankList,
                myRank: myRank,
                memberRegType: memberRegType,
            });
        }


        this.setState({
            recommendRankList : eventJoinRankList.data.getRecommendRankList, //  추천 받은 선생님의 랭킹
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

    handleJoin = () => {
        //회원가입 화면으로 이동
        this.props.history.push('/join/select');
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



        return true;
    }

    eventApply = async () => {
        const {SaemteoActions, eventId, handleClick} = this.props;
        const {checkContentList} = this.state;

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
            common.error("필수 동의 항목 확인 후 이벤트 신청을 완료해 주세요.");
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
                eventAnswerDesc: event.schName + '/' + event.schAddr + ' ' + event.addressDetail + '/' + event.schZipCd + '/' + event.cellphone,
                cellphone: event.cellphone,
                userInfo: "",
                schCode: "",
            };

            // 필수 동의 여부
            // if (!event.agree1) {
            //     common.error("필수 동의 항목 확인 후 이벤트 신청을 완료해 주세요.");
            //     return false;
            // }

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
        const {SaemteoActions, eventId, handleClick, event} = this.props;
        const {isEventApply, video1, video2, video3, text1, text2, text3, isEventApply2} = this.state;

        let eventAnswerContent = "";
        let samhangsi = text1 + "\n" + text2 + "\n" + text3;
        let samhangsi2 = text1 + text2 + text3;

        // 기 신청 여부
        if (isEventApply2) {
            common.error("이미 신청하셨습니다.");
            return false;
        }
        if (!this.prerequisite()) {
            document.activeElement.blur();
            return;
        }

        try {
            const eventAnswer = {
                isEventApply: isEventApply2,
                eventId: 487,
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
        const {isEventApply3, evtUrl} = this.state;

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
        if (isEventApply3) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        let eventAnswerContent = "";
        eventAnswerContent += (event.evtUrl)

        try {
            const eventAnswer = {
                isEventApply: isEventApply3,
                eventId: 488,
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

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const {SaemteoActions, eventId} = this.props;
        const params = {
            eventId: 485,
            eventAnswerSeq: 1,
            answerIndex: 1
        };
        // let response2 = await api.getSpecificEventAnswerCount2(params);
        let response2 = await api.get2024EventAnswerCount(params);
        this.setState({
            eventAnswerCount: response2.data.eventAnswerCount
        });
    };

    handlePopupChange = async () => {
        const {pageNo, pageSize, evtPopup} = this.state;

        var nowDate = new Date();
        //  실서버용
        var endDate = new Date('2024-12-18 18:00:00.000');
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

    // 추천인 아이디 랭킹 순위
    commentConstructorList2 = async () => {
        const {eventId} = this.props;
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: 487,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList = await api.get2024EventAnswerList(params);

        let eventJoinAnswerList2 = responseList.data.eventAnswerList;


        this.setState({
            eventJoinAnswerList2: eventJoinAnswerList2,
            pageSize: 30,
        });

    };

    // // 댓글 더보기
    // commentListAddAction = () => {
    //     this.commentConstructorList(); // 댓글 목록 갱신
    // };

    // 탭
    tabMenuClick = (e) => {
        const {evtTabId} = this.state;
        this.setState({
            evtTabId: e.currentTarget.value,
        });
    }

    render() {
        const { responseList, eventJoinAnswerList2, eventAnswerContents, eventAnswerCount, pageNo, pageSize, eventViewAddButton, evtPopup, ourSchJoin, eventJoinListAnswer, schName, joinSchCounts, evtTabId, eventJoinList, memberName ,myRank} = this.state;
        const {logged, event} = this.props;

        const eventApplyAnswerList2 = eventJoinAnswerList2.map((item, index) => (
            <EventListApply
                orderNo={item.orderNo}
                joinSchCounts={item.joinSchCount}
                schName={item.schName}
            />
        ));

        return (
            <section className="event240222">
                <div className="evtCont1">
                    <div className="evtTit">
                        <img src="/images/events/2024/event240222/evtTit.png" alt="비바샘 새학기를 부탁해"/>
                        <div className="blind">
                            <p>
                                참여 기간 - 2월 22일(목) ~ 3월 31일(일)
                                선물 발송 - 4월 5일(금)
                            </p>
                        </div>
                    </div>
                </div>
                <button type="button" className="btn_share" onClick={this.copyToClipboard}><span className="blind">공유하기</span></button>


                <ul className="tabMenu">
                   <li className={evtTabId == 1 ? 'on' : ''}>
                       <button type="button" onClick={this.tabMenuClick} value={1}><span><em className="blind">EVENT 1 회원 정보 업데이트</em></span></button>
                   </li>
                    <li className={evtTabId == 2 ? 'on' : ''}>
                       <button type="button" onClick={this.tabMenuClick} value={2}><span><em className="blind">EVENT 2 동료 선생님 추천</em></span></button>
                   </li>
                    <li className={evtTabId == 3 ? 'on' : ''}>
                       <button type="button" onClick={this.tabMenuClick} value={3}><span><em className="blind">EVENT 3 신규 회원가입</em></span></button>
                   </li>
                </ul>
                <div className={"evtCont2 tab"+evtTabId }>
                    {evtTabId == 1 ?
                        <div className="cont cont1">
                            <img src="/images/events/2024/event240222/evt1.png" alt="회원 정보 업데이트"/>
                            <div className="blind">
                                <h5>회원 정보 업데이트</h5>
                                <p>
                                    선생님의 회원 정보로 비바샘 최신 자료와 이벤트 선물이 제공됩니다.
                                    이벤트 기간 동안 회원 정보를 업데이트해주신 300분께 선물을 드립니다.
                                </p>
                                <div>
                                    <p>참여 대상 - 비바샘 초중고 선생님</p>
                                    <p>참여 방법 - 회원 정보 수정 바로가기 버튼을 클릭하여 학교정보,
                                        학년정보, SMS 수신여부 등 회원 정보를 업데이트하시면
                                        자동 응모됩니다.
                                        ※ 이벤트 기간 중 신규 가입하신 선생님은 제외됩니다.
                                    </p>
                                </div>
                                <div>
                                    <p>개인정보 수집 및 이용동의</p>
                                    <ul>
                                        <li>이용목적 : 경품 발송 및 고객 문의 응대</li>
                                        <li>수집하는 개인정보 : 성명, 휴대전화번호</li>
                                        <li>개인정보 보유 및 이용 기간: 2024년 4월 30일까지(이용목적 달성 시 즉시 파기) 경품 발송을 위한 개인정보(성함, 휴대 전화번호,
                                            주소)가 배송업체 및 기프티콘 발송 서비스사에 제공됩니다. (㈜카카오 사업자등록번호 : 120-81-47521)/(㈜다우기술
                                            사업자등록번호: 220-81-02810)/ (㈜모바일이앤엠애드 사업자등록번호:215-87-19169)
                                        </li>
                                    </ul>
                                    <p>
                                        선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다.
                                        단, 동의를 거부할 경우 신청이 불가합니다.
                                    </p>
                                </div>
                            </div>
                            <div className="chk">
                                <input type="checkbox" name="agree1" onChange={this.handleChange} checked={event.agree1} id="evt1_agree"/>
                                <label htmlFor="evt1_agree">개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.</label>
                            </div>
                            <div className="btn_wrap">
                                {/*<Link to={"/"} className="btn_apply">*/}
                                <a className="btn_apply" onClick={this.eventApply}>
                                    <span className="blind">회원 정보 수정 바로가기</span>
                                </a>
                                {/*</Link>*/}
                            </div>
                        </div>
                        :''
                    }
                    {evtTabId == 2 ?
                        <div className="cont cont2">
                            <img src="/images/events/2024/event240222/evt2.png" alt="동료 선생님 추천"/>

                            <div className="blind">
                                <h5>동료 선생님 추천 이벤트</h5>
                                <p>
                                    비바샘 회원이 아닌 동료 선생님께 비바샘을 추천해 주세요!
                                    동료 선생님께 가장 많은 추천을 받은
                                    선생님 상위 100분께 풍성한 선물을 드립니다.
                                </p>
                                <dl>
                                    <dt>참여 대상</dt>
                                    <dd>비바샘 초중고 선생님</dd>
                                </dl>
                                <dl>
                                    <dt>참여 방법</dt>
                                    <dd>
                                        <ul>
                                            <li>하단의 랭킹 참여하기 버튼을 클릭하여 이벤트에 접수해 주세요.</li>
                                            <li>동료 선생님께 비바샘을 추천하고 선생님의 ID를 알려주세요.</li>
                                            <li>동료 선생님이 회원가입 시 추천인 ID 기입 후 회원가입과 교사인증 완료하면 선생님의 순위가 실시간 랭킹에 반영됩니다.</li>
                                        </ul>
                                    </dd>
                                </dl>
                                <dl>
                                    <dt>당첨 경품</dt>
                                    <dd>
                                        <ul>
                                            <li>1~3위 - 신세계 상품권 30만원 권</li>
                                            <li>4~10위 - 신세계 상품권 10만원 권</li>
                                            <li>11위~20위 - 신세계 상품권 5만원 권</li>
                                            <li>21위~40위 - 뚜레쥬르 케이크속에순우유</li>
                                            <li>41위~100위 - 비버샘 폴딩문체어</li>
                                        </ul>
                                    </dd>
                                </dl>
                            </div>


                            <div className="evt_rank_wrap">
                                <h5 className="evt_rank_tit"><span className="blind">실시간 선생님 랭킹</span></h5>
                                <div className="evt_rank_top">
                                    {/* 로그인 전 */}
                                    { !logged &&
                                    (
                                        <p>로그인하시면 현재 나의 순위를 확인할 수 있습니다.</p>

                                    )
                                    }
                                    {/* 로그인 후 && 나의 순위가 없는 경우  */}
                                    {logged && myRank === "N" && (
                                            <p>참여하기 클릭 후, 동료 선생님이 추천인 ID를 입력하여 <br/>회원가입을 완료하시면 실시간 랭킹에 반영됩니다.</p>
                                        )
                                    }
                                    {/* 로그인 후 && 나의 순위가 있는 경우  */}
                                    {logged && myRank !== "N" && (
                                        <p> {memberName} 선생님은 현재 <span>{myRank}위</span> 입니다.</p>
                                    )
                                    }
                                    <button type="button" onClick={this.handlePopupChange} className="btnViewRanking"><span className="blind">전체 랭킹 보기</span></button>
                                </div>
                                <ul className="evt_rank_list">
                                    {
                                        eventJoinList.slice(0, 5).map((item, idx) => {
                                            // 아이디 식별화 처리 (앞에서부터 4자리만 *로 대체)
                                            const idStar = item.recommendId.substring(0, 3) + item.recommendId.substring(3).replace(/./g, '*');
                                            // 이름 식별화 처리
                                            const nameStar = item.recommendName.split("");
                                            const nameStars = nameStar.map((char, index) => {
                                                if (nameStar.length == 2) {
                                                    if(index == 0) return char + "*";
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
                                            return (<li className={"rank"+(item.orderNo)} key={idx}>
                                                <img src={"/images/events/2024/event240222/rank"+ (item.orderNo) +".png"} alt="트로피"/>
                                                {/*<h6>{item.recommendId}</h6>*/}
                                                {/*<p>{item.recommendName}</p>*/}
                                                <h6>{idStar}</h6>
                                                <p>{nameStarTeacher}</p>
                                            </li>)
                                        })
                                    }
                                </ul>
                            </div>
                            <p className="evt_noti">
                                * 추천인 ID 순위가 동일할 경우, 1) 동료 선생님이 회원가입을 먼저 완료한 순, 2) 동료 선생님 추천 이벤트 참여 접수를 먼저 한 순으로 순위가 집계됩니다.<br/>
                                * 선생님이 참여하기 완료한 시점부터 집계됩니다.<br/>
                                * <span>추천인 수가 0명인 경우, 이벤트 참여에서 제외됩니다.</span>
                            </p>

                            <div className="btn_wrap">
                                <button type="button" className="btn_apply" onClick={this.eventApply1}><span className="blind">랭킹 참여하기</span></button>
                            </div>
                        </div>
                        :''
                    }
                    {evtTabId == 3 ?
                        <div className="cont cont3">
                            <img src="/images/events/2024/event240222/evt3.png" alt="신규 회원가입 이벤트"/>
                            <div className="blind">
                                <h6>신규 회원가입 이벤트</h6>
                                <p>
                                    비바샘 회원가입 및 교사인증을 완료하시고
                                    최신 수업 자료와 선생님 맞춤 프로모션을 편하게 이용하세요!
                                </p>
                                <div>
                                    <dl>
                                        <dt>참여 대상</dt>
                                        <dd>비바샘 신규 회원</dd>
                                    </dl>
                                    <dl>
                                        <dt>참여 방법</dt>
                                        <dd>
                                            이벤트 기간동안 신규가입 및 교사인증을 완료 후,
                                            아래 응모하기 버튼을 통해 응모하시면 됩니다.
                                        </dd>
                                    </dl>
                                </div>
                                <p>
                                    * 단, 서류인증으로 교사인증을 진행하시는 경우, 반영일 최대 3일까지 소요됩니다.
                                    * 이벤트 기간 내 이미 회원가입 및 교사 인증을 완료한 선생님은 응모하기 버튼 클릭 후 이벤트 접수만 하시면 자동 응모됩니다.
                                </p>
                            </div>
                            {/*<Link to={"/join/select"} className="btn_go_join"><span className="blind">회원가입 바로가기</span></Link>*/}
                            <a onClick={this.handleJoin} className="btn_go_join"><span className="blind">회원가입 바로가기</span></a>
                            <div className="btn_wrap">
                                <button type="button" className="btn_apply" onClick={this.eventApply2}><span className="blind">응모하기</span></button>
                            </div>
                        </div>
                        :''
                    }

                    <div className="notice">
                        <strong>유의사항</strong>
                        <ul className="evtInfoList">
                            <li>- 본 이벤트에서는 비바콘은 지급되지 않습니다.</li>
                            <li>- 이벤트 1은 이벤트 기간 중 신규 가입하신 선생님은 제외됩니다.</li>
                            <li>- 이벤트 1은 이벤트 페이지 내 개인정보 수집 이용동의를 체크한 후 회원 정보를 변경한 경우에만 응모가 됩니다.</li>
                            <li>- 이벤트 2는 비바샘 초중고 선생님 대상 이벤트입니다. 추천인 ID 순위가 동일할 경우, 1) 동료 선생님이 회원가입을 먼저 완료한 순, 2) 이벤트 참여 접수를 먼저 완료한 순으로 순위가 집계됩니다. <span>참여 접수 이후, 참여 기간까지 추천인 수가 0명인 경우, 이벤트 참여에서 제외됩니다.</span></li>
                            <li>- <span>이벤트 2 &lt;동료 선생님 추천 이벤트&gt; 신세계 상품권 30만원 권, 10만원 권 당첨의 경우, 제세공과금 22%이 부여되며 세금 신고에 필요한 개인정보(주민등록번호, 계좌번호 등)를 수급할 예정입니다. 개인정보는 상품자 정보 처리로 인해 받으며 이벤트 종료 후 일괄 폐기처분 됩니다.</span></li>
                            <li>- 이벤트 3은 신규 회원 대상 이벤트입니다.</li>
                            <li>- 참여 이후, 개인정보 변경 또는 참여 내역 수정이 불가합니다.</li>
                            <li>- 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                            <li>- 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                            <li>- 경품 발송을 위해 개인정보(성명, 휴대전화번호, 자택 주소, 학교 주소)가 서비스사에 제공됩니다. <br/>(㈜카카오 사업자등록번호 : 120-81-47521), (㈜다우기술 사업자등록번호: 220-81-02810), <br/>(㈜모바일이앤엠애드 사업자등록번호:215-87-19169), (㈜CJ대한통운 사업자등록번호 110-81-0503))</li>
                        </ul>
                    </div>
                </div>
                {
                    evtTabId == 2 && evtPopup && (<div>
                        <div className="dimmed"></div>
                        <div className="join_ranking_pop">
                            <div className="pop_head">
                                <h3 className={'popTit'}>
                                    <span className="blind">실시간 추천인 ID 선생님 랭킹</span>
                                </h3>
                                <button className="btnPopClose" onClick={this.handlePopupChange}>

                                </button>
                            </div>
                            <div className="pop_body">
                                {/*{eventApplyAnswerList2}*/}
                                <table>
                                    <colgroup>
                                        <col className="widTy1"/>
                                        <col className="widTy2"/>
                                        <col className="widTy2"/>
                                        <col className="widTy3"/>
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th>순위</th>
                                        <th>ID</th>
                                        <th>이름</th>
                                        <th>추천인 수</th>
                                    </tr>
                                    </thead>
                                </table>
                                <div className="scroll-area">
                                    <table>
                                        <colgroup>
                                            <col className="widTy1"/>
                                            <col className="widTy2"/>
                                            <col className="widTy2"/>
                                            <col className="widTy3"/>
                                        </colgroup>
                                        <tbody>
                                        {
                                            eventJoinAnswerList2.map((item, idx) => {
                                                // 아이디 식별화 처리 (앞에서부터 4자리만 *로 대체)
                                                const idStar = item.recommendId.substring(0, 3) + item.recommendId.substring(3).replace(/./g, '*');
                                                // 이름 식별화 처리
                                                const nameStar = item.recommendName.split("");
                                                const nameStars = nameStar.map((char, index) => {
                                                    if (nameStar.length == 2) {
                                                        if(index == 0) return char + "*";
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
                                                return (
                                                    <tr key={idx}>
                                                        <td className="rank">{item.orderNo}위</td>
                                                        <td className="id">{idStar}</td>
                                                        <td className="name">{nameStarTeacher}</td>
                                                        <td className="num">{item.cnt}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        </tbody>
                                        {/*<tr>*/}
                                        {/*    <td className="rank">1위</td>*/}
                                        {/*    <td className="id">vivasam</td>*/}
                                        {/*    <td className="name">비바샘</td>*/}
                                        {/*    <td className="num">40명</td>*/}
                                        {/*</tr>*/}
                                        {/*{
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
                                                }*/}
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
                    )
                }


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
            eventId1: 486,
            eventId2: 487,
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
            eventId: 485,
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

        const pagesInScreen = 10;
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
                    ><span></span></button>
                    }
                    {pageButtonList()}
                    {curPage < totalPage &&
                    <button
                        type="button"
                        className="pagingNext"
                        onClick={() => {handleClickPage(curPage + 1)}}
                    ><span></span></button>
                    }
            </div>
        );
    }
}