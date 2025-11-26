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
import {maskingStr} from '../../../../lib/StringUtils';
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";
import {getSpecificEventAnswerList2} from "lib/api";

const PAGE_SIZE = 6;

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
        questionAnswer: null, // 정답 선택값
        replyTotalCount: 0,
        replyAnswer: "",
        btnClickYn: true,
        thisWeek:[false,false,false,false],
        evnetAttendance: [
            ["2024-08-29 00:00:00", "2024-09-08 23:59:59"],
            ["2024-09-09 00:00:00", "2024-09-15 23:59:59"],
            ["2024-09-16 00:00:00", "2024-09-22 23:59:59"],
            ["2024-09-23 00:00:00", "2024-09-30 23:59:59"]
        ],
        eventJoinDate: [false,false,false,false],
        joinDate:null,
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
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

    questionSelect = async(e) => {
        const questionAnswer = this.state;

        this.setState({questionAnswer:e.target.value});
    }

    // 이번주 체크
    weekActive = async  () => {
        const {evnetAttendance,thisWeek,joinDate,eventJoinDate} = this.state;
        const today = new Date();
        let testData = "";
        let myCeckDay = [false,false,false,false];

        if (joinDate != null && joinDate.indexOf("X") > -1){
            testData = joinDate.split("X");
            this.setState({
                eventJoinDate : testData
            });
        }

        // 현재 주차 check
        for (let i = 0; i < evnetAttendance.length; i++) {
            const startDate = new Date(evnetAttendance[i][0]);
            const endDate = new Date(evnetAttendance[i][1]);

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
                        myCeckDay[i] = true;
                        break;
                    }
                }
            } else {
                if (startDate <= new Date(joinDate) && new Date(joinDate) <= endDate) {
                   myCeckDay[i] = true;
                }
            }
        }

        this.setState({
           eventJoinDate : myCeckDay
        });
    }

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId : 521});
            const response2 = await api.chkEventJoin({eventId : 522});

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
            eventId : 520,
            replyAns : {
                // eslint-disable-next-line no-restricted-globals
                refUrl: location.href,
                contents: content,
                memberId: loginInfo.memberId,
                eventId : 520
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

    commentConstructorList = async () => {
        const {eventId} = this.props;
        const {pageNo, eventAnswerContents} = this.state;

        const params = {
            eventId: 520,
            answerPage: {
                pageNo: this.state.pageNo,
                pageSize: this.state.pageSize,
                eventId: eventId
            }
        };

        const responseList =  await api.getSpecificEventAnswerList3(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        let cnt = responseList.data.replyTotalCnt;

        for(let i = 0; i < eventJoinAnswerList.length; i++){
            let eventSetName = eventJoinAnswerList[i].REG_MEMBER_ID;
            let masking = "";
            for(var x = 1; x < eventJoinAnswerList.length - 4; x++) {
                masking += "*";
            }
            eventJoinAnswerList[i].eventName = eventSetName.substring(0,3) + masking; // 이벤트 참여자 아이디
        }

        this.setState({
            replyTotalCnt : cnt
        });

        // 최초 조회시 전체건수가 6건이상이면 더보기 버튼 표시
        if(this.state.replyTotalCnt > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.replyTotalCnt <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        this.setState({
            eventAnswerContents : eventJoinAnswerList,
            pageSize : this.state.pageSize + PAGE_SIZE,
            pageNo : this.state.pageNo + 1
        });

    };

    // 댓글 더보기
    moreCommentConstructorList = async () => {
        const {eventId} = this.props;
        const {pageNo, eventAnswerContents} = this.state;

        const params = {
            eventId: 520,
            answerPage: {
                pageNo: this.state.pageNo,
                pageSize: this.state.pageSize
            }
        };

        const responseList =  await api.getSpecificEventAnswerList3(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        let cnt = responseList.data.replyTotalCnt;
        let preData = this.state.eventAnswerContents;
        let getData = preData.concat(eventJoinAnswerList);

        for(let i = 0; i < getData.length; i++){
            let eventSetName = getData[i].REG_MEMBER_ID;
            let masking = "";
            for(var x = 1; x < eventSetName.length - 4; x++) {
                masking += "*";
            }
            getData[i].eventName = eventSetName.substring(0,3) + masking; // 이벤트 참여자 아이디
        }

        this.setState({
            replyTotalCnt : cnt
        });

        // 최초 조회시 전체건수가 6건이상이면 더보기 버튼 표시
        if(this.state.replyTotalCnt > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.replyTotalCnt <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        this.setState({
            eventAnswerContents : getData,
            pageSize : this.state.pageSize + PAGE_SIZE,
            pageNo : this.state.pageNo + 1
        });

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

    hintMove = async() => {
        window.location.href = "https://e.vivasam.com/visangTextbook/2022/intro";
    }

    eventApply = async (e) => {
        const {logged,loginInfo,history,BaseActions,eventId,handleClick, SaemteoActions, event} = this.props;
        const {questionAnswer,thisWeek,eventJoinDate,joinDate,evnetAttendance} = this.state;

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
                let underEventId = e.target.className;

                if (underEventId.indexOf("event1") > -1) {
                    underEventId = "521";
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
                                    window.location.href = 'https://e.vivasam.com/visangTextbook/2022/intro';
                                    return false;
                                } else {
                                    this.setState({
                                        btnClickYn : false
                                    });
                                    let params = {
                                        eventId : underEventId,
                                        eventAnswerDesc2 : checkDayText
                                    }

                                    let response = await api.insertEventApply521(params);

                                    if (response.data.code === '0') {
                                        alert("22개정 교육과정 비상교과서 홈페이지로 연결됩니다.");
                                        window.location.href = 'https://e.vivasam.com/visangTextbook/2022/intro';
                                        setTimeout(function(){
                                            window.location.reload();
                                        }, 1000);
                                        this.setState({
                                            btnClickYn : true
                                        })
                                    }
                                }
                                break;
                            }
                        }
                        return false;
                    }
                } else if (underEventId.indexOf("event2")  > -1) {
                    underEventId = "522";
                    if (this.state.isEventApply2) {
                        common.error("이미 참여하셨습니다.");
                        return false;
                    }
                }

                if (underEventId == "522" && questionAnswer == null) {
                    alert("정답을 선택해주세요.");
                    return false;
                }

                const eventAnswer = {
                    eventId: underEventId,
                    memberId: loginInfo.memberId,
                    eventAnswerDesc2: questionAnswer
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

    render() {
        const {eventAnswerContents, replyTotalCount, eventViewAddButton,pageNo, pageSize, playVideo, videoSource, popVideoSource, replyAnswer, joinDate,thisWeek, eventJoinDate, btnClickYn } = this.state;
        const {logged} = this.props;

        return (
            <section className="event240830">
                <div className="evtTitWrap">
                    <h1><img src="/images/events/2024/event240830/img1.png" alt="22 개정 비상교과서 합격" /></h1>
                    <div className="vivacon"><img src="/images/events/2024/event240830/ico_viva.png" alt="비바콘"/></div>
                </div>

                <div className="evtContWrap">
                    <div className="evtCont evtCont01">
                        <h1><img src="/images/events/2024/event240830/img2.png" alt="마주하는 상상"/></h1>
                        <div className="evtCheckWrap">
                            <ul>
                                {/* 해당 기간에 active 클래스 추가 */}
                                {/* 출석 체크 시 on 클래스 추가 */}
                                {/*<li className={joinDate != null ? "on" : "active"} className={thisWeek[0] ? "active" : ""}>*/}
                                <li className={eventJoinDate[0] ? "active on" : thisWeek[0] ? "active" : ""}>
                                    <div className="thumb"></div>
                                    <strong>1주차</strong>
                                    <p>8. 30. ~ 9. 8.</p>
                                </li>
                                <li className={eventJoinDate[1] ? "active on" : thisWeek[1] ? "active" : ""}>
                                    <div className="thumb"></div>
                                    <strong>2주차</strong>
                                    <p>9. 9. ~ 9. 15.</p>
                                </li>
                                <li className={eventJoinDate[2] ? "active on" : thisWeek[2] ? "active" : ""}>
                                    <div className="thumb"></div>
                                    <strong>3주차</strong>
                                    <p>9. 16. ~ 9. 22.</p>
                                </li>
                                <li className={eventJoinDate[3] ? "active on" : thisWeek[3] ? "active" : ""}>
                                    <div className="thumb"></div>
                                    <strong>4주차</strong>
                                    <p>9. 23. ~ 9. 30.</p>
                                </li>
                            </ul>
                        </div>
                        <button className="btnApply" onClick={btnClickYn ? this.eventApply : ''}>
                            <img className="event1" src="/images/events/2024/event240830/btn_check.png" alt="참여하기"/>
                        </button>
                        <h1><img src="/images/events/2024/event240830/img3.png" alt="둘러보기 TIP"/></h1>
                    </div>

                    <div className="evtCont evtCont02">
                        <h1><img src="/images/events/2024/event240830/img4.png" alt="더해보는 상상"/></h1>
                        <button className="btn_hint" onClick={this.hintMove}><span className="blind">힌트 확인하기</span></button>
                        <div className="answerBox">
                            <div className="rdo">
                                <input type="radio" id="answer01" name="questionAnswer" value="343" onChange={this.questionSelect}/>
                                <label htmlFor="answer01"><span>343</span></label>
                            </div>
                            <div className="rdo">
                                <input type="radio" id="answer02" name="questionAnswer" value="243" onChange={this.questionSelect}/>
                                <label htmlFor="answer02"><span>243</span></label>
                            </div>
                            <div className="rdo">
                                <input type="radio" id="answer03" name="questionAnswer" value="486" onChange={this.questionSelect}/>
                                <label htmlFor="answer03"><span>486</span></label>
                            </div>
                            <div className="rdo">
                                <input type="radio" id="answer04" name="questionAnswer" value="1004" onChange={this.questionSelect}/>
                                <label htmlFor="answer04"><span>1004</span></label>
                            </div>
                        </div>
                        <button className="btnApply" onClick={this.eventApply}>
                            <img className="event2" src="/images/events/2024/event240830/btn_apply.png" alt="정답 제출하기"/>
                        </button>
                    </div>

                    <div className="evtCont evtCont03">
                        <h1><img src="/images/events/2024/event240830/img5.png" alt="기대평을 자유롭게 작성해 주세요."/></h1>
                        <div className="commentInputWrap">
                            {!logged ?
                                (
                                    <div className="textareaWrap">
                                        <textarea name="" id="" cols="30" rows="10" placeholder="로그인 후 작성해 주세요." onClick={this.clickTextARea}></textarea>
                                        <button className="btn_cmt" ><span className="blind">등록</span></button>
                                    </div>
                                )
                            :
                                (
                                    <div className="textareaWrap">
                                        <textarea name="" id="" cols="30" rows="10" placeholder="300자 이내" value={replyAnswer} onInput={this.checkTextArea}></textarea>
                                        <button className="btn_cmt" onClick={this.writeReply}><span className="blind">등록</span></button>
                                    </div>
                                )
                            }

                            <p>* 기대평 작성 시 당첨확률이 높아집니다.</p>
                        </div>
                    </div>

                    <div className="evtCont evtCont04">
                        <h1><img src="/images/events/2024/event240830/img6.png" alt="기대평"/></h1>
                        <div className="commentWrap">
                            <div className="commentList">
                                {eventAnswerContents.map((item, index) => (
                                        <div className="listItem comment" key={index}>
                                            <strong>{item.eventName} 선생님</strong>
                                            <p>{item.CONTENTS}</p>
                                        </div>
                                    )
                                )}
                                <button type="button" className="btn_more"
                                        style={{display: eventViewAddButton == 1 ? 'block' : 'none'}}
                                        onClick={this.moreCommentConstructorList}><span className="blind">더보기</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>- 본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                        <li>- 이벤트 1은 출석체크 이벤트로 해당 주차마다 참여하실 수 있으며, <br/>이벤트 2는 1인 1회 참여하실 수 있습니다.</li>
                        <li>- 이벤트 참여 시 지급되는 비바콘은 이벤트 2번 참여 시 지급됩니다.</li>
                        <li>- 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        <li>- 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>- 경품 발송을 위해 선물 발송을 위해 개인정보가 서비스사와 배송업체에 제공됩니다. <br/>(주)카카오 120-81-47521 ㈜다우기술 220-81-02810</li>
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


//=============================================================================
// 댓글 페이징 component
//=============================================================================
