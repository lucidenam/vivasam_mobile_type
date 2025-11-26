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
const CONTENT_TYPE_END = 13;

// 경품 목록
const CONTENT_LIST = [
    {id: '1', name: '[초등]음/미/체 수업 자료 꾸러미'},
    {id: '2', name: '[중등]인공지능 실습이 있는 정보 활동집'},
    {id: '3', name: '[고등]프로젝트 학습이 있는 정보 활동집'},
    {id: '4', name: '[중고등]내 꿈을 찾아 DREAM,기술가정 활동집​'},
    {id: '5', name: '[중고등-한문]이 말도 한자어였어?​'},
    {id: '6', name: '[중고등-정보]인공지능  기술의 발전 과정​'},
    {id: '7', name: '[중고등-음악]리코더, 오카리나 단소, 소금 운지법(2종)'},
    {id: '8', name: '[중고등-미술]시대의 흐름으로 보는 미술사​'},
    {id: '9', name: '[중등-체육]학생건강체력평가제도 체육관 안전 수칙'},
    {id: '10', name: '[고등-체육]학생건강체력평가제도 체육관 안전 수칙​'},
    {id: '11', name: '[중등-진로와 직업]직업 적성 테스트/포스트잇 게시판(2종)'},
];

class Event extends Component {
    state = {
        isEventApply : false,           // 신청여부
        isAllAmountFull: false,			// 모든 경품 소진 여부
        isEsAllAmountFull: false,			// 초등 모든 경품 소진 여부
        isMsHsAmountFull: false,			// 중고등 모든 경품 소진 여부
        isEachAmountFull: [true, true, true, true, true, true, true, true, true, true, true],		        // 각각의 경품 소진 여부
        checkContentList: [false, false, false, false, false, false, false, false, false, false, false],	// 각 항목의 체크 여부
        eachAmountLeft : [],
        tabOn: 2,
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
            isEsAllAmountFull: checkEsAllAmountFull,
            isMsHsAmountFull: checkMsHsAllAmountFull,
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
        const {logged, history, BaseActions, loginInfo} = this.props;
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

        if (tabOn == 1 && loginInfo.schoolLvlCd !== 'ES') {
            common.info("초등 선생님만 신청하실 수 있습니다.\n중고등 선생님의 경우 과목별 수업자료 탭에서 중고등 자료집을 신청해 주세요.");
            return;
        }

        if (tabOn == 2 && loginInfo.schoolLvlCd !== 'MS' && loginInfo.schoolLvlCd !== 'HS') {
            common.info("중고등 선생님만 신청하실 수 있습니다.\n초등 선생님의 경우 음/미/체 탭에서 초등 자료를 신청해 주세요.");
            return;
        }

        // 초등 경품 소진 여부
        if (tabOn == 1 && !isEsAllAmountFull) {
            common.info("자료집이 모두 소진되어 신청 마감되었습니다.");
            return;
        }

        // 중고등 경품 소진 여부
        if (tabOn == 2 && !isMsHsAmountFull) {
            common.info("자료집이 모두 소진되어 신청 마감되었습니다.");
            return;
        }

        return true;
    }


    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async () => {
        const {SaemteoActions, eventId, handleClick} = this.props;
        const {isEventApply, checkContentList, tabOn} = this.state;

        let answerContent = "";
        let answerNumber = "";
        let answerAlert = "";

        if (!await this.prerequisite()) {
            return;
        }

        //초등일경우
        if (tabOn == 1) {
            answerContent += CONTENT_LIST[0].name;
            answerNumber += "1,0,0,0,0,0,0,0,0,0,0";
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
        }

        if (tabOn == 1) {
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

        if (tabOn == 1 && loginInfo.schoolLvlCd !== 'ES') {
            common.info("초등 선생님만 신청하실 수 있습니다.\n중고등 선생님의 경우 과목별 수업자료 탭에서 중고등 자료집을 신청해 주세요.");
            e.target.value = "";
            e.target.checked = false;
            return;
        }

        if (tabOn == 2 && loginInfo.schoolLvlCd !== 'MS' && loginInfo.schoolLvlCd !== 'HS') {
            common.info("중고등 선생님만 신청하실 수 있습니다.\n초등 선생님의 경우 음/미/체 탭에서 초등 자료를 신청해 주세요.");
            e.target.value = "";
            e.target.checked = false;
            return;
        }

        // 체육 체력 평가 브로마이드 중등/고등 중복 선택 불가
        if (index == 8) {
            if (checkContentList[9]) {
                e.preventDefault();
                common.info("체육 체력 평가 브로마이드는\n중등/고등 중복 선택이 불가능합니다.");
                return;
            }
        } else if (index == 9) {
            if (checkContentList[8]) {
                e.preventDefault();
                common.info("체육 체력 평가 브로마이드는\n중등/고등 중복 선택이 불가능합니다.");
                return;
            }
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

    render() {
        const {tabOn, isEachAmountFull, checkContentList, popView, popOn } = this.state;

        return (
            <section className="event230821">
                <div className="evtCont01">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="evtTit">
                        <img src="/images/events/2023/event230821/evtTit.png" alt="수업자료가 학교로 슝!" />
                        <div className="blind">
                            <h2>
                                <span>오직 비바샘에서만 만나볼 수 있는</span>
                                수업자료가
                                학교로 슝
                            </h2>
                            <span>자료 맛집 비바샘에서 수업자료를 학교로 빠르게 보내드립니다.</span>
                            <ul className="evtPeriod">
                                <li><span className="tit"><em className="blind">신청기간</em></span><span className="txt">2023.08.21(월) ~ 08.27(일)</span>
                                </li>
                            </ul>
                            <span>* 선착순! 자료 소진 시 마감 *</span>
                            <span>9월 4일부터 순차 배송됩니다.</span>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="tab_wrap">
                        <ul className="tab_menu">
                            <li className={tabOn == 1 ? 'on': ''}>
                                <button onClick={this.tabOnChange} value={1} className="tab_ele">
                                    <span className="tab_tit">
                                            음/미/체 수업 자료 꾸러미
                                    </span>
                                    <span className="tab_grade">초등</span>
                                </button>
                            </li>
                            <li className={tabOn == 2 ? 'on': ''}>
                                <button  onClick={this.tabOnChange} value={2} className="tab_high">
                                    <span className="tab_tit">
                                            과목별 수업 자료
                                    </span>
                                    <span className="tab_grade">중고등</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className={"tab_conts tab_conts1 " + (tabOn == 1? "on": "")} >
                        <div className="list_wrap">
                            <div className="list">
                                <div className="imgbox">
                                    <img src="/images/events/2023/event230821/class0-1.png" alt="교과이미지" />
                                    <a href="javascript:void(0)" className="view view1" onClick={() => this.viewTextbook(1)}></a>
                                    <span className={"disabled" + (!isEachAmountFull[0] ? " on" : "")}></span>
                                </div>
                                <p>
                                    <span>[초등 3-4학년]</span>
                                    쏠쏠한 음악 이론집
                                </p>
                            </div>
                            <div className="list">
                                <div className="imgbox">
                                    <img src="/images/events/2023/event230821/class0-2.png" alt="교과이미지" />
                                    <a href="javascript:void(0)" className="view view2" onClick={() =>this.viewTextbook(2)}></a>
                                    <span className={"disabled" + (!isEachAmountFull[0] ? " on" : "")}></span>
                                </div>
                                <p className="txt_position">
                                    <span>[초등 3-4학년]</span>
                                    오늘 뭐하지?<br /> 알록달록 재미있는 미술 수업
                                </p>
                            </div>
                            <div className="list">
                                <div className="imgbox">
                                    <img src="/images/events/2023/event230821/class0-3.png" alt="교과이미지" />
                                    <a href="javascript:void(0)" className="view view3" onClick={() =>this.viewTextbook(3)}></a>
                                    <a href="javascript:void(0)" className="view view4" onClick={() =>this.viewTextbook(4)}></a>
                                    <a href="javascript:void(0)" className="view view5" onClick={() =>this.viewTextbook(5)}></a>
                                    <span className={"disabled" + (!isEachAmountFull[0] ? " on" : "")}></span>
                                </div>
                                <p >
                                    <span>[초등 체육]</span>
                                    스포츠, 표현 활동 보드 게임판과 카드​
                                    <span className="info">✽ 움직임 기술을 게임 형식으로 학습하는 보드 게임판 세트 ​</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={"tab_conts tab_conts2 " + (tabOn == 1?" " : "on")} >
                        <div className="list_wrap">
                            <div className="list">
                                <h3 className="top">
                                    <span>
                                        실습 및 프로젝트 수업 사례를 담은 활동집
                                        정보, 기술 가정
                                        <img src="/images/events/2023/event230821/cont2_tit1.png" alt="실습 및 프로젝트 수업 사례를 담은 활동집 정보, 기술 가정" />
                                    </span>
                                </h3>
                                <ul className="list_cont">
                                    <li>
                                        <div className="cont" onClick={() =>this.clickContent(1)}>
                                            <input type="checkbox" id="class1" name="class" onChange={this.changeContent.bind(this, 1)}
                                                   checked={checkContentList[1]} disabled={!isEachAmountFull[1]}/>
                                            <label htmlFor="class1">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class1-1.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view6" onClick={() =>this.viewTextbook(6)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[1] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[중등]</span>
                                                    인공지능 실습이 있는 정보 활동집
                                                </p>
                                            </label>
                                        </div>
                                        <div className="cont" onClick={() =>this.clickContent(2)}>
                                            <input type="checkbox" id="class2" name="class" onChange={this.changeContent.bind(this, 2)}
                                                   checked={checkContentList[2]} disabled={!isEachAmountFull[2]}/>
                                            <label htmlFor="class2">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class1-2.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view7" onClick={() =>this.viewTextbook(7)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[2] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[고등]</span>
                                                    프로젝트 학습이 있는 정보 활동집
                                                </p>
                                            </label>
                                        </div>
                                        <div className="cont" onClick={() =>this.clickContent(3)}>
                                            <input type="checkbox" id="class3" name="class" onChange={this.changeContent.bind(this, 3)}
                                                   checked={checkContentList[3]} disabled={!isEachAmountFull[3]}/>
                                            <label htmlFor="class3" className="textbookLabelT2">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class1-3.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view8" onClick={() =>this.viewTextbook(8)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[3] ? " on" : "")}></span>
                                                </div>
                                                <p className="txt_position pos_type2">
                                                    <span >[중고등]</span>
                                                    내 꿈을 찾아 DREAM,<br /> 기술가정 활동집​
                                                </p>
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="list">
                                <h3 className="top">
                                    <span>
                                        과목별 대형 브로마이드
                                        한문, 정보, 음악, 미술, 체육, 진로와 직업
                                        <img src="/images/events/2023/event230821/cont2_tit2.png" alt="과목별 대형 브로마이드 한문, 정보, 음악, 미술, 체육, 진로와 직업" />
                                    </span>
                                </h3>
                                <ul className="list_cont list_cont2">
                                    <li>
                                        <div className="cont" onClick={() =>this.clickContent(4)}>
                                            <input type="checkbox" id="class4" name="class" onChange={this.changeContent.bind(this, 4)}
                                                   checked={checkContentList[4]} disabled={!isEachAmountFull[4]} />
                                            <label htmlFor="class4">
                                                <div className="imgbox borderT2 ">
                                                    <img src="/images/events/2023/event230821/class1.png" alt="교과이미지"  />
                                                    <a href="javascript:void(0)" className="view view9" onClick={() =>this.viewTextbook(9)}></a>
                                                    <span className={"disabled type2" + (!isEachAmountFull[4] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[중고등-한문]</span>
                                                    이 말도 한자어였어?​
                                                </p>
                                            </label>
                                        </div>
                                        <div className="cont" onClick={() =>this.clickContent(5)}>
                                            <input type="checkbox" id="class5" name="class" onChange={this.changeContent.bind(this, 5)}
                                                   checked={checkContentList[5]} disabled={!isEachAmountFull[5]}/>
                                            <label htmlFor="class5">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class2.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view10" onClick={() =>this.viewTextbook(10)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[5] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[중고등-정보]</span>
                                                    인공지능  기술의 발전 과정​
                                                </p>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cont" onClick={() =>this.clickContent(6)}>
                                            <input type="checkbox" id="class6" name="class" onChange={this.changeContent.bind(this, 6)}
                                                   checked={checkContentList[6]} disabled={!isEachAmountFull[6]}/>
                                            <label htmlFor="class6">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class3.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view11" onClick={() =>this.viewTextbook("11-1")}></a>
                                                    <a href="javascript:void(0)" className="view view12" onClick={() =>this.viewTextbook(11)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[6] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[중고등-음악]</span>
                                                    리코더,  오카리나/<br /> 단소, 소금 운지법(2종)
                                                </p>
                                            </label>
                                        </div>
                                        <div className="cont" onClick={() =>this.clickContent(7)}>
                                            <input type="checkbox" id="class7" name="class" onChange={this.changeContent.bind(this, 7)}
                                                   checked={checkContentList[7]} disabled={!isEachAmountFull[7]}/>
                                            <label htmlFor="class7">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class4.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view13" onClick={() =>this.viewTextbook(12)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[7] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[중고등-미술]</span>
                                                    시대의 흐름으로 보는 미술사​
                                                </p>
                                            </label>
                                        </div>
                                    </li>
                                    <li className="ex">
                                        <div className="cont" onClick={() =>this.clickContent(8)}>
                                            <input type="checkbox" id="class8" name="class" onChange={this.changeContent.bind(this, 8)}
                                                   checked={checkContentList[8]} disabled={!isEachAmountFull[8]}/>
                                            <label htmlFor="class8">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class5.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view14" onClick={() =>this.viewTextbook(13)}></a>
                                                    <a href="javascript:void(0)" className="view view15" onClick={() =>this.viewTextbook(14)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[8] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[중등-체육]</span>
                                                    학생 건강 체력 평가표(PAPS) /<br /> 체육관 안전 수칙
                                                </p>
                                            </label>
                                        </div>
                                        <div className="cont" onClick={() =>this.clickContent(9)}>
                                            <input type="checkbox" id="class9" name="class" onChange={this.changeContent.bind(this, 9)}
                                                   checked={checkContentList[9]} disabled={!isEachAmountFull[9]}/>
                                            <label htmlFor="class9">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class6.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view16" onClick={() =>this.viewTextbook(15)}></a>
                                                    <a href="javascript:void(0)" className="view view17" onClick={() =>this.viewTextbook(16)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[9] ? " on" : "")}></span>
                                                </div>
                                                <p>
                                                    <span >[고등-체육]</span>
                                                    학생 건강 체력 평가표(PAPS) /<br /> 체육관 안전 수칙
                                                </p>
                                            </label>
                                        </div>
                                        <span className="info">
                                            *체육 체력 평가 브로마이드 중등/고등 중복 선택 불가 ​
                                        </span>
                                    </li>
                                    <li>
                                        <div className="cont" onClick={() =>this.clickContent(10)}>
                                            <input type="checkbox" id="class10" name="class" onChange={this.changeContent.bind(this, 10)}
                                                   checked={checkContentList[10]} disabled={!isEachAmountFull[10]}/>
                                            <label htmlFor="class10">
                                                <div className="imgbox">
                                                    <img src="/images/events/2023/event230821/class7.png" alt="교과이미지" />
                                                    <a href="javascript:void(0)" className="view view18" onClick={() =>this.viewTextbook(17)}></a>
                                                    <a href="javascript:void(0)" className="view view19" onClick={() =>this.viewTextbook(18)}></a>
                                                    <span className={"disabled" + (!isEachAmountFull[10] ? " on" : "")}></span>
                                                </div>
                                                <p className="txt_position type2">
                                                    <span >[중등-진로와 직업]</span>
                                                    직업 적성 테스트/포스트잇 게시판(2종)
                                                </p>
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="btnWarp">
                        <button className="btnApply" onClick={this.eventApply}>
                            <img src="/images/events/2023/event230821/btnApply.png"  />
                            <span className="blind">신청하기</span>
                        </button>
                    </div>

                </div>

                <div className={"notice " + (tabOn == 1 ? "on" : "")}>
                    <strong>초등 유의사항</strong>
                    <ul className="evtInfoList">
                        <li>해당 이벤트는 1인 1회 신청할 수 있으며, 초등 수업 자료는<br /> 초등 선생님만 신청이 가능합니다.​​</li>
                        <li>선착순 신청으로 수량 소진 시 이벤트 신청이 마감됩니다.​​</li>
                        <li>자료집은 학교로만 배송이 가능합니다. 재직학교와 수령처를<br /> 정확히 기재해 주세요.​​</li>
                        <li>주소 기재가 잘못되어 오발송된 자료집은 다시 발송해 드리지 않습니다.​​</li>
                        <li>이벤트 신청 시 음악/미술/체육 자료집 3종 세트를 같이 보내드립니다.​​</li>
                        <li>과목별 자료집 개별 신청은 불가합니다.​​</li>
                        <li>신청하신 자료는 선생님 재직 학교의 인근 비상교육 지사를 통해<br /> 전달할 예정입니다. ​​</li>
                        <li>
                            신청자의 개인 정보(이름/주소/전화번호)는 배송 업체 및<br />
                            비상교육 지사에 공유됩니다.<br />
                            (㈜CJ대한통운 사업자등록번호: 110-81-05034)/<br />
                            (㈜한진택배 사업자등록번호: 201-81-02823)​​
                        </li>

                    </ul>
                </div>

                <div className={"notice " + (tabOn == 1 ? "" : "on")}>
                    <strong>중고등 유의사항</strong>
                    <ul className="evtInfoList">
                        <li>해당 이벤트는 1인 1회 신청할 수 있으며, 중고등 수업 자료는<br /> 중고등 선생님만 신청이 가능합니다.</li>
                        <li>활동집과 브로마이드 선택 개수에 제한이 없습니다. 단, 체육 체력<br /> 평가 브로마이드는 중고등 중복 선택이 불가능합니다. </li>
                        <li>선착순 신청으로 수량 소진 시 이벤트 신청이 마감됩니다.</li>
                        <li>자료집은 학교로만 배송이 가능합니다. 재직학교와 수령처를<br /> 정확히 기재해 주세요.</li>
                        <li>주소 기재가 잘못되어 오발송된 자료집은 다시 발송해 드리지 않습니다.</li>
                        <li>자료집 신청 이후에는 자료집 신청 변경이 불가합니다. </li>
                        <li>
                            신청자의 개인 정보(이름/주소/전화번호)는 배송 업체 및<br />
                            비상교육 지사에 공유됩니다.<br />
                            (㈜CJ대한통운 사업자등록번호: 110-81-05034)/<br />
                            (㈜한진택배 사업자등록번호: 201-81-02823)​​
                        </li>
                    </ul>
                </div>

                <div className={"popupWrap" + (popOn ? " on" : "")} >
                    <div className="dimmed">

                    </div>
                    <div className="view_wrap">
                        <button className={"btn_popClose"}  onClick={this.popViewClose}></button>

                        <div className="inner">
                            <div className="viewer">
                                <div>
                                    <img src={"/images/events/2023/event230821/classView" + popView + ".png"}  />
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
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));