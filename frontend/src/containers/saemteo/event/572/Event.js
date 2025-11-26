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

// 경품의 종류
const CONTENT_TYPE_START = 3;
const CONTENT_TYPE_END = 20;

// 경품 목록
const CONTENT_LIST = [
    {id: '1', name: '중학 역사'},
    {id: '2', name: '중학 한문'},
    {id: '3', name: '고등 국어'},
    {id: '4', name: '고등 영어'},
    {id: '5', name: '고등 수학'},
    {id: '6', name: '고등 사회_일반사회'},
    {id: '7', name: '고등 사회_지리'},
    {id: '8', name: '고등 역사'},
    {id: '9', name: '고등 윤리'},
    {id: '10', name: '고등 과학_물리학'},
    {id: '11', name: '고등 과학_화학'},
    {id: '12', name: '고등 과학_생명과학'},
    {id: '13', name: '고등 과학_지구과학'},
    {id: '14', name: '고등 과학_융합'},
    {id: '15', name: '고등 한문'},
    {id: '16', name: '고등 정보'},
    {id: '17', name: '고등 체육'},
    {id: '18', name: '고등 교양'},
];

class Event extends Component {
    state = {
        isEventApply : false,           // 신청여부
        isAllAmountFull: false,         // 모든 경품 소진 여부
        amountYn: 'Y',   /* 수량제한 신청 */
        applyContentTotCnt: '18',     /* 상품 종류 수 */
        isEachAmountFull: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],                 // 각각의 경품 소진 여부
        checkContentList: [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false],   // 각 항목의 체크 여부
        eachAmountLeft : [],
        tabOn: 1,
        sTabOn: 1,
        popViewURL: "",
        popOn: false,
        check1: false,
        check2: false,
        check3: false,
        check4: false
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
            sTabOn: 1,
        });
    };

    sTabOnChange = (e) => {
        this.setState({
            sTabOn: e.currentTarget.value,
        });
    };

    copyText = (e) => {
        e.preventDefault();

        const url = e.target.href;

        window.navigator.clipboard.writeText(url);
        alert('이벤트 URL이 복사되었습니다.');
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
                tabOn: loginInfo.schoolLvlCd === "HS" ? 2 : 1
            });
        }
    }

    // 전제 조건
    prerequisite = (e) => {
        const {logged, history, BaseActions, loginInfo} = this.props;
        const {isEventApply, tabOn} = this.state;

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

        if (loginInfo.schoolLvlCd !== 'MS' && loginInfo.schoolLvlCd !== 'HS') {
            common.info("중,고등학교 교사만 신청 가능한 이벤트입니다. 신청을 원하시면 회원정보를 수정해주세요.");
            return;
        }

        if (tabOn == 1 && loginInfo.schoolLvlCd !== 'MS') {
            common.info("회원정보 기준, 재직학교에 해당하는 학교급의\n​꾸러미만 신청 가능합니다.\n​회원정보 수정 후 이용 부탁드립니다.");
            return;
        }

        if (tabOn == 2 && loginInfo.schoolLvlCd !== 'HS') {
            common.info("회원정보 기준, 재직학교에 해당하는 학교급의\n​꾸러미만 신청 가능합니다.\n​회원정보 수정 후 이용 부탁드립니다.");
            return;
        }

        return true;
    }


    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, myClassInfo, loginInfo} = this.props;
        const {isEventApply, checkContentList, check1,check2,check3,check4} = this.state;

        let answerContent = "";
        let answerNumber = "";
        let answerAlert = "";
        let index = -1;
        let checkYn = false;
        let checkText = '';

        const esTabValue = e.currentTarget.value;

        if (!await this.prerequisite()) {
            return;
        }

        if (esTabValue === '중학 역사') {
            index = 0;
        }
        if (esTabValue === '중학 한문') {
            index = 1;
        }
        if (esTabValue === '고등 국어') {
            index = 2;
        }
        if (esTabValue === '고등 영어') {
            index = 3;
        }
        if (esTabValue === '고등 수학') {
            index = 4;
        }
        if (esTabValue === '고등 사회/역사/윤리') {
            if (check1+check2+check3+check4 < 1) {
                alert('과목별 자료집 중 최소 1개는 선택해 주세요.');
                return false;
            } else {
                index = '';
                if (check1) {
                    index += '5,';
                    checkText += '사회_일반사회 영역, ';
                }
                if (check2) {
                    index += '6,';
                    checkText += '사회_지리 영역, ';
                }
                if (check3) {
                    index += '7,';
                    checkText += '역사 영역, ';
                }
                if (check4) {
                    index += '8,';
                    checkText += '윤리 영역, ';
                }
            }
            index = index.slice(0,-1);
            checkText = checkText.slice(0,-2);
            checkYn = true;
        }
        if (esTabValue === '고등 과학_물리학') {
            index = 9;
        }
        if (esTabValue === '고등 과학_화학') {
            index = 10;
        }
        if (esTabValue === '고등 과학_생명과학') {
            index = 11;
        }
        if (esTabValue === '고등 과학_지구과학') {
            index = 12;
        }
        if (esTabValue === '고등 과학_융합 선택 과목') {
            index = 13;
        }
        if (esTabValue === '고등 한문') {
            index = 14;
        }
        if (esTabValue === '고등 정보') {
            index = 15;
        }
        if (esTabValue === '고등 체육') {
            index = 16;
        }

        if (!checkYn) {
            checkContentList.forEach((value, i) => {
                if (i === index) {
                    answerContent += CONTENT_LIST[i].name + " / ";
                    answerAlert += "\n" + CONTENT_LIST[i].name;
                    answerNumber += "1,"
                } else {
                    answerNumber += "0,"
                }

                if (i === checkContentList.length - 1) {
                    answerContent = answerContent.slice(0, -3);
                    answerNumber = answerNumber.slice(0, -1);
                }
            });
        } else {
            checkContentList.forEach((value, i) => {
                if (i === index) {
                    answerContent += CONTENT_LIST[i].name + " / ";
                    answerAlert += "\n" + CONTENT_LIST[i].name;
                    answerNumber += "1,"
                } else if (index.indexOf('5') !== -1 && i === 5) {
                    answerContent += CONTENT_LIST[i].name + " / ";
                    answerAlert += "\n" + CONTENT_LIST[i].name;
                    answerNumber += "1,"
                } else if (index.indexOf('6') !== -1 && i === 6) {
                    answerContent += CONTENT_LIST[i].name + " / ";
                    answerAlert += "\n" + CONTENT_LIST[i].name;
                    answerNumber += "1,"
                } else if (index.indexOf('7') !== -1 && i === 7) {
                    answerContent += CONTENT_LIST[i].name + " / ";
                    answerAlert += "\n" + CONTENT_LIST[i].name;
                    answerNumber += "1,"
                } else if (index.indexOf('8') !== -1 && i === 8) {
                    answerContent += CONTENT_LIST[i].name + " / ";
                    answerAlert += "\n" + CONTENT_LIST[i].name;
                    answerNumber += "1,"
                } else {
                    answerNumber += "0,"
                }

                if (i === checkContentList.length - 1) {
                    answerContent = answerContent.slice(0, -3);
                    answerNumber = answerNumber.slice(0, -1);
                }
            });
        }
        if (checkText === '') {
            if (window.confirm(`${esTabValue} 자료 꾸러미를 신청하시겠습니까?\n신청 후에는 자료 꾸러미를 변경할 수 없습니다.​`)) {
            } else {
                return false;
            }
        } else {
            if (window.confirm(checkText + ` 자료 꾸러미를 신청하시겠습니까?\n신청 후에는 자료 꾸러미를 변경할 수 없습니다.​`)) {
            } else {
                return false;
            }
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
    };

    viewTextbook = (url) => {
        this.setState({
            //popView: num,
            popViewURL: url,
            popOn: true,
        });
    }

    popViewClose = () => {
        this.setState({
            popOn: false,
        });
    }

    setViewItemRef = (ref) => {
        this.viewItem = ref;
    };

    changeCheck = (e) => {
        const {check1, check2, check3, check4} = this.state;
        if (e.target.id === 'class1') {
            if (check1) {
                this.setState({
                    check1: false
                })
            } else {
                this.setState({
                    check1: true
                })
            }
        }
        if (e.target.id === 'class2') {
            if (check2) {
                this.setState({
                    check2: false
                })
            } else {
                this.setState({
                    check2: true
                })
            }
        }
        if (e.target.id === 'class3') {
            if (check3) {
                this.setState({
                    check3: false
                })
            } else {
                this.setState({
                    check3: true
                })
            }
        }
        if (e.target.id === 'class4') {
            if (check4) {
                this.setState({
                    check4: false
                })
            } else {
                this.setState({
                    check4: true
                })
            }
        }
    }

    render() {
        const {tabOn, sTabOn, isEachAmountFull, popViewURL, popOn } = this.state;

        return (
            <section className="event250707">
                <div className="evtCont01">
                    <div className="evtTit">
                        <img src="/images/events/2025/event250707/img1.png" alt="" />
                        <div className="blind">
                            <h2>수업 자료를 부탁해</h2>
                            <p>비상한 꿀팁 나눔 이벤트 중고등 편</p>
                            <p>신청 기간 : 7.7(월)~7.10(목)</p>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="evtCont">
                        <img src="/images/events/2025/event250707/img2.png" alt="" />
                        <div className="btnWrap">
                            <a href="https://mv.vivasam.com/#/saemteo/event/view/572" class="copy_share"  onClick={this.copyText}><span class="blind">이벤트 공유하기</span></a>
                        </div>
                        <div class="blind">
                            <p>최고의 셰프들이 요리한 최고의 수업 자료를 모두 모아 드려요!</p>
                            <p>자료별 수량이 상이하여 선착순 마감될 수 있습니다.</p>
                            <p>일부 자료는 샘플로 제공됩니다.</p>
                        </div>
                    </div>
                </div>

                <div className="evtCont03">
                    <div className="tab_wrap">
                        <ul className="tab_menu">
                            <li className={tabOn == 1 ? 'on' : ''}>
                                <button onClick={this.tabOnChange} value={1} className="tab_mid">
                                    <span className="blind">중학 - 역사, 한문 자료 꾸러미</span>
                                </button>
                            </li>
                            <li className={tabOn == 2 ? 'on' : ''}>
                                <button onClick={this.tabOnChange} value={2} className="tab_high">
                                    <span className="blind">고등 - 과목별 자료 꾸러미</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className={"tab_conts tab_conts1" + (tabOn == 1 ? " on" : "")}>
                        <div className={"evtItemBox" + (!isEachAmountFull[0] ? " disabled" : "")}>
                            <div className="txtbox">
                                <p className="tit">역사</p>
                                <div className="btnWrap">
                                    <button className="btnApply" onClick={this.eventApply} value="중학 역사">
                                        <img src="/images/events/2025/event250707/btnApply.png" alt="중학 역사 자료집 신청하기" data-value="중학 역사 자료집 꾸러미" />
                                    </button>
                                </div>
                            </div>
                            <div className="btn_preivew_box">
                                <a href="javascript:void(0)" className="btn_preview" 
                                    onClick={() => this.viewTextbook('03. 중학 역사 1 수활북')}><img src="/images/events/2025/event250707/book_m_hi_01.png" alt="중학 역사 ① 수활북" /></a>
                                <a href="javascript:void(0)" className="btn_preview" 
                                    onClick={() => this.viewTextbook('04. 중학 역사 2 수활북')}><img src="/images/events/2025/event250707/book_m_hi_02.png" alt="중학 역사 ② 수활북" /></a>
                                <a href="javascript:void(0)" className="btn_preview" 
                                    onClick={() => this.viewTextbook('05. 우리나라의영역변화전근대편브로마이드')}><img src="/images/events/2025/event250707/book_m_hi_03.png" alt="우리나라의 영역 변화 전근대편 브로마이드" /></a>
                                <a href="javascript:void(0)" className="btn_preview" 
                                    onClick={() => this.viewTextbook('06. 우리나라의영역변화근현대편브로마이드')}><img src="/images/events/2025/event250707/book_m_hi_04.png" alt="우리나라의 영역 변화 근현대편 브로마이드" /></a>
                            </div>
                        </div>
                        <div className={"evtItemBox" + (!isEachAmountFull[1] ? " disabled" : "")}>
                            <div className="txtbox">
                                <p className="tit">한문</p>
                                <div className="btnWrap">
                                    <button className="btnApply" onClick={this.eventApply} value="중학 한문">
                                        <img src="/images/events/2025/event250707/btnApply.png" alt="중학 한문 자료집 신청하기" data-value="중학 한문 자료집 꾸러미" />
                                    </button>
                                </div>
                            </div>
                            <div className="btn_preivew_box">
                                <a href="javascript:void(0)" className="btn_preview" 
                                    onClick={() => this.viewTextbook('01. 이 말도 한자였어 브로마이드')}><img src="/images/events/2025/event250707/book_m_ch_01.png" alt="이 말도 한자였어 브로마이드" /></a>
                            </div>
                        </div>
                    </div>
                    <div className={"tab_conts tab_conts2" + (tabOn == 1 ? " " : " on")}>
                        <ul className="stabs">
                            <li className={(sTabOn == 1 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={1}><span className="blind">국어</span></button></li>
                            <li className={(sTabOn == 2 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={2}><span className="blind">영어</span></button></li>
                            <li className={(sTabOn == 3 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={3}><span className="blind">수학</span></button></li>
                            <li className={(sTabOn == 4 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={4}><span className="blind">사회/역사/윤리</span></button></li>
                            <li className={(sTabOn == 5 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={5}><span className="blind">과학</span></button></li>
                            <li className={(sTabOn == 6 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={6}><span className="blind">한문</span></button></li>
                            <li className={(sTabOn == 7 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={7}><span className="blind">정보</span></button></li>
                            <li className={(sTabOn == 8 ? "on" : " ")}><button type="button" className="stab" onClick={this.sTabOnChange} value={8}><span className="blind">체육</span></button></li>
                        </ul>
                        <div className={"tabpanel" + (sTabOn == 1 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[2] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">국어</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 국어">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 국어 자료집 신청하기" data-value="고등 국어 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('07. 문학 수활북')}><img src="/images/events/2025/event250707/book_h_ko_01.png" alt="문학 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('08. 독서와 작문 수활북')}><img src="/images/events/2025/event250707/book_h_ko_02.png" alt="독서와 작문 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('09. 화법과 언어 수활북')}><img src="/images/events/2025/event250707/book_h_ko_03.png" alt="화법과 언어 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('10. 주제 탐구 독서 수활북')}><img src="/images/events/2025/event250707/book_h_ko_04.png" alt="주제 탐구 독서 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('11. 비상한 필수 개념 문학')}><img src="/images/events/2025/event250707/book_h_ko_05.png" alt="비상한 필수 개념 문학" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('12. 비상한 필수 개념 독서와 작문')}><img src="/images/events/2025/event250707/book_h_ko_06.png" alt="비상한 필수 개념 독서와 작문" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('13. 비상한 필수 개념 화법과 언어')}><img src="/images/events/2025/event250707/book_h_ko_07.png" alt="비상한 필수 개념 화법과 언어" /></a>
                                </div>
                            </div>
                        </div>
                        <div className={"tabpanel" + (sTabOn == 2 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[3] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">영어</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 영어">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 영어 자료집 신청하기" data-value="고등 영어 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('14. 영어12 수활북')}><img src="/images/events/2025/event250707/book_h_en_01.png" alt="영어 Ⅰ, Ⅱ 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('15. 영어 독해와 작문 수활북')}><img src="/images/events/2025/event250707/book_h_en_02.png" alt="영어 독해와 작문 수활북" /></a>
                                </div>
                            </div>
                        </div>
                        <div className={"tabpanel" + (sTabOn == 3 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[4] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">수학</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 수학">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 수학 자료집 신청하기" data-value="고등 수학 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('17. 대수 수활북')}><img src="/images/events/2025/event250707/book_h_ma_01.png" alt="대수 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('18. 미적분1 수활북')}><img src="/images/events/2025/event250707/book_h_ma_02.png" alt="미적분 Ⅰ 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('19. 확률과 통계 수활북')}><img src="/images/events/2025/event250707/book_h_ma_03.png" alt="확률과 통계 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('20. 미적분2, 기하 수활북')}><img src="/images/events/2025/event250707/book_h_ma_04.png" alt="미적분 Ⅱ, 기하 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('21. 인공지능 수학 수활북')}><img src="/images/events/2025/event250707/book_h_ma_05.png" alt="인공지능 수학 수활북" /></a>
                                </div>
                            </div>
                        </div>
                        <div className={"tabpanel" + (sTabOn == 4 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[5] ? " disabled" : "")}>
                                <div className="btnWrap">
                                    <button className="btnApply" onClick={this.eventApply} value="고등 사회/역사/윤리">
                                        <img src="/images/events/2025/event250707/btnApply.png" alt="고등 사회/역사/윤리 자료집 신청하기" data-value="고등 사회/역사/윤리 자료집 꾸러미" />
                                    </button>
                                </div>
                                <div className="txtbox">
                                    <input type="checkbox" id="class1" name="class"
                                            onChange={this.changeCheck}
                                            checked={this.state.check1} />
                                    <label htmlFor="class1" className="tit">사회_일반사회 영역 </label>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('22. 사회와 문화 수활북')}><img src="/images/events/2025/event250707/book_h_so_01.png" alt="사회와 문화 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('23. 정치 수활북')}><img src="/images/events/2025/event250707/book_h_so_02.png" alt="정치 수활북" /></a>
                                </div>
                            </div>
                            <div className={"evtItemBox" + (!isEachAmountFull[6] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <input type="checkbox" id="class2" name="class"
                                            onChange={this.changeCheck}
                                            checked={this.state.check2} />
                                    <label htmlFor="class2" className="tit">사회_지리 영역 </label>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('24. 세계시민과 지리 수활북')}><img src="/images/events/2025/event250707/book_h_so_03.png" alt="세계시민과 지리 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('25. 한국 지리 탐구 수활북')}><img src="/images/events/2025/event250707/book_h_so_04.png" alt="한국지리 탐구 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('26. 여행지리 수활북')}><img src="/images/events/2025/event250707/book_h_so_05.png" alt="여행지리 수활북" /></a>
                                </div>
                            </div>
                            <div className={"evtItemBox" + (!isEachAmountFull[7] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <input type="checkbox" id="class3" name="class"
                                            onChange={this.changeCheck}
                                            checked={this.state.check3} />
                                    <label htmlFor="class3" className="tit">역사 영역 </label>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('28. 세계사 수활북')}><img src="/images/events/2025/event250707/book_h_hi_01.png" alt="세계사 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('29. 동아시아 역사 기행 수활북')}><img src="/images/events/2025/event250707/book_h_hi_02.png" alt="동아시아 역사 기행 수활북" /></a>
                                </div>
                            </div>
                            <div className={"evtItemBox" + (!isEachAmountFull[8] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <input type="checkbox" id="class4" name="class"
                                            onChange={this.changeCheck}
                                            checked={this.state.check4} />
                                    <label htmlFor="class4" className="tit">윤리 영역 </label>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('30. 현대사회와 윤리 수활북')}><img src="/images/events/2025/event250707/book_h_et_01.png" alt="현대사회와 윤리 수활북" /></a>
                                </div>
                            </div>
                        </div>
                        <div className={"tabpanel" + (sTabOn == 5 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[9] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">과학_물리학</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 과학_물리학">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 과학_물리학 자료집 신청하기" data-value="고등 과학_물리학 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('31. 물리학 영역 수활북')}><img src="/images/events/2025/event250707/book_h_sc_01.png" alt="물리학 영역 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('32. 물리학 수활북')}><img src="/images/events/2025/event250707/book_h_sc_02.png" alt="물리학 수활북" /></a>
                                </div>
                            </div>
                            <div className={"evtItemBox" + (!isEachAmountFull[10] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">과학_화학</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 과학_화학">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 과학_화학 자료집 신청하기" data-value="고등 과학_화학 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('33. 화학 영역 수활북')}><img src="/images/events/2025/event250707/book_h_sc_03.png" alt="화학 영역 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('34. 화학 수활북')}><img src="/images/events/2025/event250707/book_h_sc_04.png" alt="화학 수활북" /></a>
                                </div>
                            </div>
                            <div className={"evtItemBox" + (!isEachAmountFull[11] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">과학_생명과학</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 과학_생명과학">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 과학_생명과학 자료집 신청하기" data-value="고등 과학_생명과학 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('35. 생명과학 영역 수활북')}><img src="/images/events/2025/event250707/book_h_sc_05.png" alt="생명과학 영역 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('36. 생명과학 수활북')}><img src="/images/events/2025/event250707/book_h_sc_06.png" alt="생명과학 수활북" /></a>
                                </div>
                            </div>
                            <div className={"evtItemBox" + (!isEachAmountFull[12] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">과학_지구과학</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 과학_지구과학">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 과학_지구과학 자료집 신청하기" data-value="고등 과학_지구과학 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('37. 지구과학 영역 수활북')}><img src="/images/events/2025/event250707/book_h_sc_07.png" alt="지구과학 영역 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('38. 지구과학 수활북')}><img src="/images/events/2025/event250707/book_h_sc_08.png" alt="지구과학 수활북" /></a>
                                </div>
                            </div>
                            <div className={"evtItemBox" + (!isEachAmountFull[13] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">과학_융합 선택 과목</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 과학_융합 선택 과목">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 과학_융합 선택 과목 자료집 신청하기" data-value="고등 과학_융합 선택 과목 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('39. 과학의 역사와 문화 수활북')}><img src="/images/events/2025/event250707/book_h_sc_09.png" alt="과학의 역사와 문화 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('40. 기후변화와 환경생태 수활북')}><img src="/images/events/2025/event250707/book_h_sc_10.png" alt="기후변화와 환경생태 수활북" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('41. 융합과학 탐구 수활북')}><img src="/images/events/2025/event250707/book_h_sc_11.png" alt="융합과학 탐구 수활북" /></a>
                                </div>
                            </div>
                        </div>
                        <div className={"tabpanel" + (sTabOn == 6 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[14] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">한문</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 한문">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 한문 자료집 신청하기" data-value="고등 한문 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('42. 이 말도 한자였어 브로마이드')}><img src="/images/events/2025/event250707/book_h_ch_01.png" alt="이 말도 한자였어 브로마이드" /></a>
                                    {/*<a href="javascript:void(0)" className="btn_preview"
                                        onClick={() => this.viewTextbook('43. 한문 활동 자료집')}><img src="/images/events/2025/event250707/book_h_ch_02.png" alt="바로바로 뽑아 쓰는 중고등 한문 활동 자료집" /></a>*/}
                                </div>
                            </div>
                        </div>
                        <div className={"tabpanel" + (sTabOn == 7 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[15] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">정보</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 정보">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 정보 자료집 신청하기" data-value="고등 정보 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('44. 인공지능활동자료집_표1')}><img src="/images/events/2025/event250707/book_h_in_01.png" alt="프로젝트로 배우는 인공지능 활동집" /></a>
                                </div>
                            </div>
                        </div>
                        <div className={"tabpanel" + (sTabOn == 8 ? " on" : " ") }>
                            <div className={"evtItemBox" + (!isEachAmountFull[16] ? " disabled" : "")}>
                                <div className="txtbox">
                                    <p className="tit">체육</p>
                                    <div className="btnWrap">
                                        <button className="btnApply" onClick={this.eventApply} value="고등 체육">
                                            <img src="/images/events/2025/event250707/btnApply.png" alt="고등 체육 자료집 신청하기" data-value="고등 체육 자료집 꾸러미" />
                                        </button>
                                    </div>
                                </div>
                                <div className="btn_preivew_box">
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('45. 전통 스포츠 수활북')}><img src="/images/events/2025/event250707/book_h_ph_01.png" alt="전통 스포츠 수활" /></a>
                                    <a href="javascript:void(0)" className="btn_preview" 
                                        onClick={() => this.viewTextbook('46. 뉴스포츠 수활북')}><img src="/images/events/2025/event250707/book_h_ph_02.png" alt="뉴스포츠 수활북" /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evtNotice">
                    <h3><img src="/images/events/2025/event250707/footer_title.png" alt="유의사항" /></h3>
                    <strong>꼭! 읽어 주세요.</strong>
                    <ul className="evtInfoList">
                        <li>본 이벤트는 교사인증이 완료된 비바샘 중고등 교사에 한해 1인 1회 참여하실 수 있습니다.</li>
                        <li>담당 학교급과 과목이 일치하는 자료집 세트만 신청하실 수 있습니다. <br /> (ex. 국어 자료 꾸러미 선택 시, 영어 자료 꾸러미는 신청이 불가합니다.)</li>
                        <li>단, 사회/역사/윤리 교과의 경우, 자료집 세트를 중복으로 신청하실 수 있습니다. <br /> (ex. 사회_지리 영역 자료 꾸러미와 윤리 자료 꾸러미를 모두 신청하실 수 있습니다.) </li>
                        <li>수령지 주소와 개인정보를 정확히 기입해 주세요. 주소 및 개인 정보가 잘못 기재되어 오발송되거나 반송된 자료집은  다시 발송해 드리지 않습니다.</li>
                        <li>신청하신 자료는 선생님 재직 학교로만 배송 가능하며, 인근 비상교육 지사를 통해 전달될 예정입니다.</li>
                        <li>자료 꾸러미 발송을 위해 신청자 개인 정보(성명/주소/휴대 전화 번호)가 배송 업체 및 비상교육 지사에 제공됩니다. <br />㈜CJ대한통운 사업자번호: 110-81-05034 / <br />㈜한진택배 사업자등록번호: 201-81-02823</li>
                    </ul>
                </div>

                <div className={"popupWrap" + (popOn ? " on" : "")}>
                    <div className="dimmed"></div>
                    <div className="view_wrap">
                        <button className="btn_popClose" onClick={this.popViewClose}><span className="blind">닫기</span></button>

                        <div className="inner">
                            <div className="viewer" ref={this.setViewItemRef}>
                                <div className="viewerItem">
                                    <div className="thumb">
                                        <img src={`/images/events/2025/event250707/popView/${popViewURL}.jpg`}/>
                                    </div>
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