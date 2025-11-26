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
import Slider from "react-slick";

// 경품의 종류
const CONTENT_TYPE_START = 3;
const CONTENT_TYPE_END = 11;

// 경품 목록
const CONTENT_LIST = [
    {id: '1', name: '[초등]3학년 자료집'},
    {id: '2', name: '[초등]4학년 자료집'},
    {id: '3', name: '[중고등]음악_음악 활동+악보집'},
    {id: '4', name: '[중고등]미술_한국·서양 미술사 게임 놀이'},
    {id: '5', name: '[중고등]미술_ 미술 교과서 QR 코드 자료집'},
    {id: '6', name: '[중고등]체육_체육 교과서 QR 코드 자료집'},
    {id: '7', name: '[중고등]체육_체육 전신 스트레칭 브로마이드'},
    {id: '8', name: '[중고등]기술·가정_기술·가정 활동집'},
    {id: '9', name: '[중학]진로와 직업_진로와 직업 활동집'},
];

class Event extends Component {
    state = {
        isEventApply : false,           // 신청여부
        isAllAmountFull: false,			// 모든 경품 소진 여부
        amountYn: 'Y',   /* 수량제한 신청 */
        applyContentTotCnt: '11',     /* 상품 종류 수 */
        isEachAmountFull: [true, true, true, true, true, true, true, true, true],		        // 각각의 경품 소진 여부
        checkContentList: [false, false, false, false, false, false, false, false, false],	// 각 항목의 체크 여부
        eachAmountLeft : [],
        tabOn: 1,
        popView: "",
        popOn: false,
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.eventAmountCheck();
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

    // 경품 소진 여부
    eventAmountCheck = async () => {
        const {SaemteoActions, eventId, event} = this.props;
        const { isEachAmountFull, checkContentList } = this.state;

        let params1 = {eventId: eventId};
        let checkAllAmountFull = false;
        let checkEsAllAmountFull = false;
        let checkMsHsAllAmountFull = false;
        let checkEachAmountFull = [];
        let eachAmountLeft = [];

        try {
            // 경품 신청가능 수량 조회
            const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
            const responseData = response.data;

            for (let i = CONTENT_TYPE_START; i <= CONTENT_TYPE_END; i++) {
                if(i === 3 && responseData['qntCnt_' + i] >= 1)  checkEsAllAmountFull = true;
                if(i > 3 && responseData['qntCnt_' + i] >= 1)  checkMsHsAllAmountFull = true;

                eachAmountLeft.push(responseData['qntCnt_' + i]);
                checkEachAmountFull.push(responseData['qntCnt_' + i] > 0);
                if (responseData['qntCnt_' + i] >= 1) {
                    checkAllAmountFull = true;
                }
            }
        } catch (e) {
            console.log(e);
        }

        this.setState({
            isAllAmountFull: checkAllAmountFull,
            isEachAmountFull: checkEachAmountFull,
            eachAmountLeft: eachAmountLeft,
        });

        event.eachAmountLeft = eachAmountLeft;
        SaemteoActions.pushValues({type: "event", object: event});
    }


    tabOnChange = (e) => {
        this.setState({
            tabOn: e.currentTarget.value,
        });
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

        if (e.target.name === 'teacherAnnual') {
            if (parseInt(e.target.value) < 1) {
                event[e.target.name] = "";
            }
            if (e.target.value.length > 2) {
                event[e.target.name] = e.target.value.substr(0, 2);
            }
        }

        SaemteoActions.pushValues({type: "event", object: event});
    };


    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, eventId, loginInfo} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId});

            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }

            this.setState({
                tabOn: loginInfo.schoolLvlCd == "MS" || loginInfo.schoolLvlCd == "HS" ? 2 : 1
            });
        }
    }

    // 전제 조건
    prerequisite = (e) => {
        const {logged, history, BaseActions, loginInfo, myClassInfo} = this.props;
        const {isEventApply, isAllAmountFull, isEsAllAmountFull, isMsHsAmountFull, checkContentList, tabOn} = this.state;


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
            common.info("이미 신청하셨습니다.");
            return false;
        }

        if (tabOn == 2 && loginInfo.schoolLvlCd !== 'MS' && loginInfo.schoolLvlCd !== 'HS') {
            common.info("중,고등학교 교사만 신청 가능한 이벤트입니다. 신청을 원하시면 회원정보를 수정해주세요.");
            return;
        }

        return true;
    }


    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, myClassInfo, loginInfo} = this.props;
        const {isEventApply, checkContentList, tabOn, isEachAmountFull} = this.state;

        let answerContent = "";
        let answerNumber = "";
        let answerAlert = "";


        const esTabValue = e.currentTarget.value;

        if (!await this.prerequisite()) {
            return;
        }

        //초등일경우
        if (tabOn == 1) {

            if (esTabValue === "3학년 자료집 신청하기") {
                if (!myClassInfo.myGrades.includes(3)) {
                    alert("초등학교 3학년 교사만 참여 가능한 이벤트입니다.\n참여를 원하시면 회원정보를 수정해주세요.");
                    return false;
                }

                // 수량 마감 얼럿
                if (!isEachAmountFull[0]) {
                    alert("자료집이 모두 소진되어 신청 마감되었습니다.");
                    return false;
                }
                answerContent += CONTENT_LIST[0].name;
                answerNumber += "1,0,0,0,0,0,0,0,0";
            }
            if (esTabValue === "4학년 자료집 신청하기") {
                if (!myClassInfo.myGrades.includes(4)) {
                    alert("초등학교 4학년 교사만 참여 가능한 이벤트입니다.\n참여를 원하시면 회원정보를 수정해주세요.");
                    return;
                }
                answerContent += CONTENT_LIST[0].name;
                answerNumber += "0,1,0,0,0,0,0,0,0";
            }

        }


        //중고등일경우
        if (tabOn == 2) {
            let chkFlag = false;  // 선택 여부 flag

            checkContentList.forEach((value, i) => {
                if (value) {
                    answerContent += CONTENT_LIST[i].name + " / ";
                    answerAlert += "\n" + CONTENT_LIST[i].name;
                    answerNumber += "1,"
                    chkFlag = true;
                } else {
                    answerNumber += "0,"
                }

                if (i === checkContentList.length - 1) {
                    answerContent = answerContent.slice(0, -3);
                    answerNumber = answerNumber.slice(0, -1);
                }
            });

            // 선택 여부
            if (!chkFlag) {
                common.info("과목별 자료집 중 최소 1개는\n선택해 주세요.");
                return false;
            }

            if (answerContent.includes('[중학]진로와 직업_진로와 직업 활동집') && loginInfo.schoolLvlCd === 'HS') {
                alert("중학교 교사만 신청 가능한 자료가 포함되어 있습니다.");
                return false;
            }
        }

            if (tabOn == 1) {
                if (window.confirm(`신청하신 자료가 '${esTabValue}'가 맞습니까?`)) {
                } else {
                    return false;
                }



          try {
                const eventAnswer = {
                    isEventApply: isEventApply,
                    eventAnswerContent: answerContent,
                    answerNumber: answerNumber
                };
                SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
                handleClick(eventId);    // 신청정보 팝업으로 이동
            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(() => {
                }, 1000);//의도적 지연.
            }
        } else {
            api.appConfirm("선생님께서 신청하신 자료집은 발송 이후 변경 및 재발송이 어렵습니다.\n다시 한번 확인 부탁드립니다\n" + answerAlert).then(confirm => {
                if (confirm === true) {
                    try {
                        const eventAnswer = {
                            isEventApply: isEventApply,
                            eventAnswerContent: answerContent,
                            answerNumber: answerNumber
                        };
                        SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
                        handleClick(eventId);    // 신청정보 팝업으로 이동
                    } catch (e) {
                        console.log(e);
                    } finally {
                        setTimeout(() => {
                        }, 1000);//의도적 지연.
                    }
                }
            });
        }
    };

    clickContent = (index) => {
        const {loginInfo, logged, BaseActions, history} = this.props;
        const {isEachAmountFull, tabOn} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        if (!isEachAmountFull[index]) {
            common.info("해당 자료집은 소진되어\n선택이 불가능합니다.");
        }
    }

    // 라디오 버튼 클릭시에 나오는 얼럿
    changeContent = (index, e) => {
        const {loginInfo, logged, BaseActions, history} = this.props;
        const {checkContentList, tabOn} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        if (tabOn == 2 && loginInfo.schoolLvlCd !== 'MS' && loginInfo.schoolLvlCd !== 'HS') {
            common.info("중,고등학교 교사만 신청 가능한 이벤트입니다.\n신청을 원하시면 회원정보를 수정해주세요.");
            e.target.value = "";
            e.target.checked = false;
            return;
        }

        checkContentList.forEach((value, i) => {
            if (index == i) {
                if (e.target.checked) {
                    checkContentList[i] = true;
                } else {
                    checkContentList[i] = false;
                }
            }
        });

        this.setState({
            checkContentList: checkContentList
        });
    }

    viewTextbook = (num) => {
        this.setState({
            popView: num,
            popOn: true,
        });
    }

    popViewClose = () => {
        this.setState({
            popOn: false,
        });
    }

    doEbook = (linkUrl) => {
        const {logged, history, BaseActions, loginInfo} = this.props;

        const link = document.createElement('a');
        link.href = linkUrl;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }

    setViewItemRef = (ref) => {
        this.viewItem = ref;
    };


    render() {
        const {tabOn, isEachAmountFull, checkContentList, popView, popOn } = this.state;

        //slick option 설정
        const settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            className: 'event_list'
        };

        return (
            <section className="event240902">
                <div className="evtCont01">
                    <div className="evtTit">
                        <img src="/images/events/2024/event240902/img1.png" alt="수업 자료 맛집도 비바샘이 맞지!" />
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="tab_wrap">
                        <ul className="tab_menu">
                            <li className={tabOn == 1 ? 'on' : ''}>
                                <button onClick={this.tabOnChange} value={1} className="tab_ele">
                                    <span className="blind">초등 자료 꾸러미 <br/>3~4학년</span>
                                </button>
                            </li>
                            <li className={tabOn == 2 ? 'on' : ''}>
                                <button onClick={this.tabOnChange} value={2} className="tab_high">
                                    <span className="blind">중고등 자료 꾸러미 <br/>예체능, 기.가, 진로</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className={"tab_conts tab_conts1 " + (tabOn == 1 ? "on" : "")}>
                        <img src="/images/events/2024/event240902/tab01_img1.png" alt="수업 자료 맛집도 비바샘이 맞지!"/>
                        <div className="evtItemBox">
                            <img src="/images/events/2024/event240902/tab01_img2.png" alt="3학년"/>
                            <div className={"btn_preivew_box" + (!isEachAmountFull[0] ? " disabled" : "")} >
                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={this.doEbook.bind(this, 'https://ibook.vivasam.com/CBS_iBook/1042/contents/index.html')}></a>
                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={this.doEbook.bind(this, 'https://ibook.vivasam.com/CBS_iBook/1103/contents/index.html')}></a>
                            </div>
                        </div>
                        <div className="btnWarp">
                            <button className="btnApply" onClick={this.eventApply} value="3학년 자료집 신청하기">
                                <img src="/images/events/2024/event240902/btn_apply1.png" alt="3학년 자료집 신청하기"/>
                            </button>
                        </div>
                        <div className="evtItemBox">
                            <img src="/images/events/2024/event240902/tab01_img3.png" alt="4학년"/>
                            <div className={"btn_preivew_box" + (!isEachAmountFull[1] ? " disabled" : "")}>
                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={this.doEbook.bind(this, 'https://ibook.vivasam.com/CBS_iBook/1045/contents/index.html')}></a>
                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={this.doEbook.bind(this, 'https://ibook.vivasam.com/CBS_iBook/1104/contents/index.html')}></a>
                            </div>
                        </div>
                        <div className="btnWarp">
                            <button className="btnApply" onClick={this.eventApply} value="4학년 자료집 신청하기">
                                <img src="/images/events/2024/event240902/btn_apply2.png" alt="4학년 자료집 신청하기"/>
                            </button>
                        </div>
                        <div className="evtItemBox">
                            <img src="/images/events/2024/event240902/tab01_img4.png" alt="공통 자료"/>
                            <div className={"btn_preivew_box ty2" + (!isEachAmountFull[0] && !isEachAmountFull[1] ? " disabled" : "")}>

                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={() => this.viewTextbook(1)}></a>
                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={() => this.viewTextbook(2)}></a>
                            </div>
                            <div className={"btn_preivew_box ty3" + (!isEachAmountFull[0] && !isEachAmountFull[1] ? " disabled" : "")}>
                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={this.doEbook.bind(this, 'https://dn.vivasam.com/vs/promotion2022/830/QRguide/%EC%B4%88%EB%93%B1_%EC%88%98%ED%95%99/index.html')}></a>
                                <a href="javascript:void(0)" className="btn_preview"
                                   onClick={this.doEbook.bind(this, 'https://dn.vivasam.com/vs/promotion2022/830/QRguide/%EC%B4%88%EB%93%B1_%EC%9D%8C%EC%95%85/index.html')}></a>
                            </div>
                        </div>
                    </div>
                    <div className={"tab_conts tab_conts2 " + (tabOn == 1 ? " " : "on")}>
                        <div className="list_wrap">
                            <div className="list">
                                <h3 className="top">
                                    <img src="/images/events/2024/event240902/evtLabel1.png" alt="중고등 음악"/>
                                </h3>
                                <ul className="list_cont">
                                    <li>
                                        <div className={"imgbox" + (!isEachAmountFull[2] ? " disabled" : "")}>
                                            <div className="img" onClick={() => this.viewTextbook(3)}>
                                                <img src="/images/events/2024/event240902/tab02_book1.png" alt="교과이미지"/>
                                            </div>
                                        </div>
                                        <input type="checkbox" id="class1" name="class"
                                               onChange={this.changeContent.bind(this, 2)}
                                               checked={checkContentList[2]} disabled={!isEachAmountFull[2]}/>
                                        <label htmlFor="class1">
                                            <img src="/images/events/2024/event240902/tab02_txt1.png" alt=""/>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                            <div className="list">
                                <h3 className="top">
                                    <img src="/images/events/2024/event240902/evtLabel2.png" alt="중고등 미술"/>
                                </h3>
                                <ul className="list_cont">
                                    <li>
                                        <div className={"imgbox" + (!isEachAmountFull[3] ? " disabled" : "")}>
                                            <div className="img" onClick={() => this.viewTextbook(4)}>
                                                <img src="/images/events/2024/event240902/tab02_book2.png" alt="교과이미지"/>
                                            </div>
                                            <div className="img" onClick={() => this.viewTextbook(5)}>
                                                <img src="/images/events/2024/event240902/tab02_book3.png" alt="교과이미지"/>
                                            </div>
                                        </div>
                                        <input type="checkbox" id="class2" name="class"
                                               onChange={this.changeContent.bind(this, 3)}
                                               checked={checkContentList[3]} disabled={!isEachAmountFull[3]}/>
                                        <label htmlFor="class2">
                                            <img src="/images/events/2024/event240902/tab02_txt2.png" alt=""/>
                                        </label>
                                    </li>
                                    <li>
                                        <div className={"imgbox" + (!isEachAmountFull[4] ? " disabled" : "")}>
                                            <div className="img" onClick={this.doEbook.bind(this, 'https://dn.vivasam.com/VS/promotion2022/830/QRguide/%EC%A4%91%ED%95%99_%EB%AF%B8%EC%88%A0/index.html')}>
                                                <img src="/images/events/2024/event240902/tab02_book4.png" alt="교과이미지"/>
                                            </div>
                                        </div>
                                        <input type="checkbox" id="class3" name="class"
                                               onChange={this.changeContent.bind(this, 4)}
                                               checked={checkContentList[4]} disabled={!isEachAmountFull[4]}/>
                                        <label htmlFor="class3">
                                            <img src="/images/events/2024/event240902/tab02_txt3.png" alt=""/>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                            <div className="list">
                                <h3 className="top">
                                    <img src="/images/events/2024/event240902/evtLabel3.png" alt="중고등 체육"/>
                                </h3>
                                <ul className="list_cont">
                                    <li>
                                        <div className={"imgbox" + (!isEachAmountFull[5] ? " disabled" : "")}>
                                            <div className="img" onClick={this.doEbook.bind(this, 'https://dn.vivasam.com/VS/promotion2022/830/QRguide/%EC%A4%91%EA%B3%A0%EB%93%B1_%EC%B2%B4%EC%9C%A1/index.html')}>
                                                <img src="/images/events/2024/event240902/tab02_book5.png" alt="교과이미지"/>
                                            </div>
                                        </div>
                                        <input type="checkbox" id="class4" name="class"
                                               onChange={this.changeContent.bind(this, 5)}
                                               checked={checkContentList[5]} disabled={!isEachAmountFull[5]}/>
                                        <label htmlFor="class4">
                                            <img src="/images/events/2024/event240902/tab02_txt4.png" alt=""/>
                                        </label>
                                    </li>
                                    <li>
                                        <div className={"imgbox" + (!isEachAmountFull[6] ? " disabled" : "")}>
                                            <div className="img" onClick={() => this.viewTextbook(7)}>
                                                <img src="/images/events/2024/event240902/tab02_book6.png" alt="교과이미지"/>
                                            </div>
                                        </div>
                                        <input type="checkbox" id="class5" name="class"
                                               onChange={this.changeContent.bind(this, 6)}
                                               checked={checkContentList[6]} disabled={!isEachAmountFull[6]}/>
                                        <label htmlFor="class5">
                                            <img src="/images/events/2024/event240902/tab02_txt5.png" alt=""/>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                            <div className="list">
                                <h3 className="top">
                                    <img src="/images/events/2024/event240902/evtLabel4.png" alt="중고등 기술 가정"/>
                                </h3>
                                <ul className="list_cont">
                                    <li>
                                        <div className={"imgbox" + (!isEachAmountFull[7] ? " disabled" : "")}>
                                            <div className="img" onClick={() => this.viewTextbook(8)}>
                                                <img src="/images/events/2024/event240902/tab02_book7.png" alt="교과이미지"/>
                                            </div>
                                        </div>
                                        <input type="checkbox" id="class6" name="class"
                                               onChange={this.changeContent.bind(this, 7)}
                                               checked={checkContentList[7]} disabled={!isEachAmountFull[7]}/>
                                        <label htmlFor="class6">
                                            <img src="/images/events/2024/event240902/tab02_txt6.png" alt=""/>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                            <div className="list">
                                <h3 className="top">
                                    <img src="/images/events/2024/event240902/evtLabel5.png" alt="중고등 진로와 직업"/>
                                </h3>
                                <ul className="list_cont">
                                    <li>
                                        <div className={"imgbox" + (!isEachAmountFull[8] ? " disabled" : "")}>
                                            <div className="img" onClick={() => this.viewTextbook(9)}>
                                                <img src="/images/events/2024/event240902/tab02_book8.png" alt="교과이미지"/>
                                            </div>
                                        </div>
                                        <input type="checkbox" id="class7" name="class"
                                               onChange={this.changeContent.bind(this, 8)}
                                               checked={checkContentList[8]} disabled={!isEachAmountFull[8]}/>
                                        <label htmlFor="class7">
                                            <img src="/images/events/2024/event240902/tab02_txt7.png" alt=""/>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="btnWarp">
                            <button className="btnApply msTabImage" onClick={this.eventApply}>
                                <img src="/images/events/2024/event240902/btn_apply3.png" alt="신청하기"/>
                                <span className="blind">신청하기</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="evtNotice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li><span>1인 1회</span>만 신청할 수 있으며, <span>교사 인증을 완료한 초·중·고등학교 선생님</span>만 신청이 가능합니다.</li>
                        <li>수령지 주소와 개인 정보를 정확히 기입해 주세요. 주소 및 개인 정보가 잘못 기재되어 <br/>오발송되거나 반송된 자료집은 다시 발송해 드리지 않습니다.</li>
                        <li>신청하신 자료는 배송 업체를 통해 전달할 예정입니다.</li>
                        <li>신청자 개인 정보(성명/주소/휴대 전화 번호)가 배송 업체에 공유됩니다.</li>
                        <li>㈜CJ대한통운 사업자번호: 110-81-05034 / ㈜한진택배 사업자등록번호: 201-81-02823</li>
                    </ul>
                </div>

                <div className={"popupWrap" + (popOn ? " on" : "")}>
                    <div className="dimmed"></div>
                    <div className="view_wrap">
                        <button className="btn_popClose" onClick={this.popViewClose}><span></span></button>

                        <div className="inner">
                            <div className="viewer" ref={this.setViewItemRef}>

                                <div className="viewerItem" style={{display: popView == "1" ? 'block' : 'none'}}>
                                    <Slider {...settings}>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book1.png"}/>
                                        </div>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book2.png"}/>
                                        </div>
                                    </Slider>
                                </div>
                                <div className="viewerItem" style={{display: popView == "2" ? 'block' : 'none'}}>
                                    <Slider {...settings}>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book3.png"}/>
                                        </div>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book4.png"}/>
                                        </div>
                                    </Slider>
                                </div>
                                <div className="viewerItem" style={{display: popView == "3" ? 'block' : 'none'}}>
                                  <Slider {...settings}>
                                      <div className="sliderThumb">
                                          <img src={"/images/events/2024/event240902/book5.png"}/>
                                      </div>
                                      <div className="sliderThumb">
                                          <img src={"/images/events/2024/event240902/book6.png"}/>
                                      </div>
                                  </Slider>
                                </div>
                                <div className="viewerItem" style={{display: popView == "4" ? 'block' : 'none'}}>
                                  <div className="thumb">
                                      <img src={"/images/events/2024/event240902/tab02_book2.png"}/>
                                  </div>
                                </div>
                                <div className="viewerItem" style={{display: popView == "5" ? 'block' : 'none'}}>
                                  <div className="thumb">
                                      <img src={"/images/events/2024/event240902/tab02_book3.png"}/>
                                  </div>
                                </div>
                                <div className="viewerItem" style={{display: popView == "6" ? 'block' : 'none'}}>
                                    <div className="thumb">
                                        <img src={"/images/events/2024/event240902/tab02_book4.png"}/>
                                    </div>
                                </div>
                                <div className="viewerItem" style={{display: popView == "7" ? 'block' : 'none'}}>
                                    <div className="thumb">
                                      <img src={"/images/events/2024/event240902/tab02_book6.png"}/>
                                  </div>
                                </div>
                                <div className="viewerItem" style={{display: popView == "8" ? 'block' : 'none'}}>
                                    <Slider {...settings}>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book7.png"}/>
                                        </div>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book8.png"}/>
                                        </div>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book9.png"}/>
                                        </div>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book10.png"}/>
                                        </div>
                                    </Slider>
                                </div>
                                <div className="viewerItem" style={{display: popView == "9" ? 'block' : 'none'}}>
                                    <Slider {...settings}>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book11.jpg"}/>
                                        </div>
                                        <div className="sliderThumb">
                                            <img src={"/images/events/2024/event240902/book12.jpg"}/>
                                        </div>
                                    </Slider>
                                </div>

                            </div>
                        </div>
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
      eventAnswer: state.saemteo.get('eventAnswer').toJS(),
      myClassInfo: state.myclass.get('myClassInfo'),
  }),
  (dispatch) => ({
      PopupActions: bindActionCreators(popupActions, dispatch),
      SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
      BaseActions: bindActionCreators(baseActions, dispatch),
  })
)(withRouter(Event));