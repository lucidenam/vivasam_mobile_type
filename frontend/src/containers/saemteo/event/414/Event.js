import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";

const event1Items = ["수학", "과학", "사회(설)", "사회(김)"];

class Event extends Component {
    state = {
        isEventApply: false,
        isSubEventApply1: false,
        isSubEventApply2: false,
        title1: false,				// 제목1 선택 여부
        title2: false,				// 제목2 선택 여부
        title3: false,				// 제목3 선택 여부
        title4: false,				// 제목4 선택 여부
        cover1: false,				// 표지1 선택 여부
        cover2: false,				// 표지2 선택 여부
        cover3: false,				// 표지3 선택 여부
        cover4: false,				// 표지4 선택 여부
        comment: '',				// 참여 댓글
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, event, eventId} = this.props;

        if (logged) {
            event.eventId = eventId; // 이벤트 ID
            const response = await api.eventInfo(eventId);
            if (response.data.code === '3') {
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    // 전제 조건
    prerequisite = (e) => {
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
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            return false;
        }

        // 기 참여 여부
        if (isEventApply) {
            common.error("이미 참여하셨습니다.");
            return false;
        }

        return true;
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, loginInfo} = this.props;
        const {comment, title1, title2, title3, title4, cover1, cover2, cover3, cover4, isSubEventApply1, isSubEventApply2} = this.state;

        let eventAnswerContent = "";

        if (!this.prerequisite(e)) {
            return;
        }

        if(!isSubEventApply1 && !isSubEventApply2) {
            common.info("이벤트1의 타이틀 또는 이벤트2의 표지를 선택해 주세요.");
            return
        }

        if(isSubEventApply2 && comment.length === 0) {
            common.info("이벤트2의 표지 선정 이유를 입력해주세요.");
            return
        }

        if(!isSubEventApply2 && comment.length !== 0) {
            common.info("이벤트2의 표지를 선택해 주세요.");
            return
        }

        if(isSubEventApply1) {
            title1 ? eventAnswerContent += "이벤트1 : " + event1Items[0] : eventAnswerContent += '';
            title2 ? eventAnswerContent += "이벤트1 : " + event1Items[1] : eventAnswerContent += '';
            title3 ? eventAnswerContent += "이벤트1 : " + event1Items[2] : eventAnswerContent += '';
            title4 ? eventAnswerContent += "이벤트1 : " + event1Items[3] : eventAnswerContent += '';
        }

        eventAnswerContent += "^||^";

        if(isSubEventApply2) {
            cover1 ? eventAnswerContent += ("이벤트2 : " + event1Items[0] + "^||^" + "이벤트2 선정이유 : " + comment) : eventAnswerContent += '';
            cover2 ? eventAnswerContent += ("이벤트2 : " + event1Items[1] + "^||^" + "이벤트2 선정이유 : " + comment) : eventAnswerContent += '';
            cover3 ? eventAnswerContent += ("이벤트2 : " + event1Items[2] + "^||^" + "이벤트2 선정이유 : " + comment) : eventAnswerContent += '';
            cover4 ? eventAnswerContent += ("이벤트2 : " + event1Items[3] + "^||^" + "이벤트2 선정이유 : " + comment) : eventAnswerContent += '';
        }


        try {
            const eventAnswer = {
                eventId: e.target.id,
                memberId: loginInfo.memberId,
                eventAnswerContent: eventAnswerContent,
                eventAnswerComment: comment,
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

    handleChange1 = (e) => {
        if (!this.prerequisite(e)) {
            return;
        }
        this.setState({
            title1: false,
            title2: false,
            title3: false,
            title4: false,
            isSubEventApply1 : true,
            [e.target.id]: e.target.checked,
        });
    }

    handleChange2 = (e) => {
        if (!this.prerequisite(e)) {
            return;
        }
        this.setState({
            cover1: false,
            cover2: false,
            cover3: false,
            cover4: false,
            isSubEventApply2 : true,
            [e.target.id]: e.target.checked,
        });
    }

    // 이벤트2 입력창 focus시
    onFocusComment = (e) => {
        if (!this.prerequisite(e)) {
            document.activeElement.blur();
        }
    }

    // 이벤트2 입력창 입력마다
    setComment = (e) => {
        let comment = e.target.value;

        if (comment.length >= 150) {
            comment = comment.substring(0, 150);
        }

        this.setState({
            comment: comment
        });
    };


    render() {
        const {comment, title1, title2, title3, title4, cover1, cover2, cover3, cover4} = this.state;

        return (
            <section className="event220831">
                <div className="evtCont01">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="cont1_top">
                        <h1>
                            초등 검정 교과서 5, 6 수/사/과 합격 기념 이벤트
                            비상한 교과서
                        </h1>
                        <p className="txt">
                            학생들의 흥미와 호기심을 자극하는 비상교육 · 비상교과서
                            최종 합격한 초등 5, 6학년 검정 교과서를 소개합니다!

                            교과서를 둘러보시고 비바샘이 준비한 두 가지 이벤트에
                            모두 참여하시면 추첨을 통해 선물을 드립니다.
                        </p>
                        <div className="evtPeriod">
                            <div className="blind">
                                <div><span className="tit">이벤트 기간</span><span
                                    className="txt">2022년 08월 31일 ~ 09월 31일</span></div>
                                <div><span className="tit">당첨자 발표</span><span>2022년 10월 06일</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="evtBg_ico"></div>
                </div>
                <div className="evtBg">
                    <div className="evtCont02">
							<span className="evt1">
								<div className="blind">
									event01
								</div>
							</span>
                        <div className="evt1Tit">
                            <div className="blind">
                                <h3>교과서 타이틀 맞추기</h3>
                                <p>
                                    초등 검정 교과서 5, 6 수/과/사/사의
                                    과목별 타이틀 중 잘못된 것을 골라주세요!

                                    정답을 맞춰주신 분들 중
                                    추첨을 통해 총 600명의 선생님들께 선물을 드립니다.
                                </p>
                            </div>
                        </div>
                        <a className="hintBtn" onClick={onClickCallLinkingOpenUrl.bind(this, `https://me.vivasam.com/#/visangTextbook/2015Upper/intro`)}>
                            <span className="blind">힌트보기</span>
                        </a>
                        <div className="evtGift1">
                            <div className="blind">
                                <span>스타벅스 카페라떼 T</span>
                            </div>
                        </div>
                        <ul className='cont02List'>
                            <li>
                                <div className="list_check">
                                    <input type="radio" id="title1" name="title" onChange={this.handleChange1} checked={title1}/>
                                    <label htmlFor="title1">
                                        <div className="blind">
                                            <h3>수학</h3>
                                            <p>"맛있는 수학+여행을 가볼까?"</p>
                                        </div>
                                    </label>
                                </div>
                            </li>
                            <li>
                                <div className="list_check">
                                    <input type="radio" id="title2" name="title" onChange={this.handleChange1} checked={title2}/>
                                    <label htmlFor="title2">
                                        <div className="blind">
                                            <h3>과학</h3>
                                            <p>"“어두운 밤하늘, 갑자기 무언가가 반짝였어!”"</p>
                                        </div>
                                    </label>
                                </div>
                            </li>
                            <li>
                                <div className="list_check">
                                    <input type="radio" id="title3" name="title" onChange={this.handleChange1} checked={title3}/>
                                    <label htmlFor="title3">
                                        <div className="blind">
                                            <h3>사회(설)</h3>
                                            <p>“오늘은 어떤 세상 속 이야기를 만나 볼까?”</p>
                                        </div>
                                    </label>
                                </div>
                            </li>
                            <li>
                                <div className="list_check">
                                    <input type="radio" id="title4" name="title" onChange={this.handleChange1} checked={title4}/>
                                    <label htmlFor="title4">
                                        <div className="blind">
                                            <h3>사회(김)</h3>
                                            <p>“세계 곳곳에 숨겨진 느낌표를 찾아 볼까?”</p>
                                        </div>
                                    </label>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="evtCont02 second">
							<span className="evt2">
								<div className="blind">
									event01
								</div>
							</span>
                        <div className="evt2Tit">
                            <div className="blind">
                                <h3>교과서 타이틀 맞추기</h3>
                                <p>
                                    초등 검정 교과서 5, 6 수/과/사/사의
                                    과목별 타이틀 중 잘못된 것을 골라주세요!

                                    정답을 맞춰주신 분들 중
                                    추첨을 통해 총 600명의 선생님들께 선물을 드립니다.
                                </p>
                            </div>
                        </div>
                        <div className="evtGift2">
                            <div className="blind">
                                <span>스타벅스 카페라떼 T</span>
                            </div>
                        </div>
                        <div className="listWrap">
                            <ul className='cont02List'>
                                <li>
                                    <div className="list_check">
                                        <input type="radio" id="cover1" name="cover" onChange={this.handleChange2} checked={cover1}/>
                                        <label htmlFor="cover1">
                                            <div className="blind">
                                                <h3>수학</h3>
                                            </div>
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <div className="list_check">
                                        <input type="radio" id="cover2" name="cover" onChange={this.handleChange2} checked={cover2}/>
                                        <label htmlFor="cover2">
                                            <div className="blind">
                                                <h3>과학</h3>
                                            </div>
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <div className="list_check">
                                        <input type="radio" id="cover3" name="cover" onChange={this.handleChange2} checked={cover3}/>
                                        <label htmlFor="cover3">
                                            <div className="blind">
                                                <h3>사회(설)</h3>
                                            </div>
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <div className="list_check">
                                        <input type="radio" id="cover4" name="cover" onChange={this.handleChange2} checked={cover4}/>
                                        <label htmlFor="cover4">
                                            <div className="blind">
                                                <h3>사회(김)</h3>
                                            </div>
                                        </label>
                                    </div>
                                </li>
                            </ul>
                            <div className="evtComment2">
                                <textarea placeholder="선정 이유를 적어주세요.(150자 이내)" onFocus={this.onFocusComment} onChange={this.setComment} value={comment}></textarea>
                                <span className="count"><span className="currentCount">{comment.length}</span>/150</span>
                            </div>
                        </div>
                    </div>
                    <button className="evtBtn" onClick={this.eventApply}>
                        <img src="/images/events/2022/event220831/btnApply.png" alt="참여하기"/>
                    </button>
                </div>
                <div className="notice">
                    <span className="noticeTit">유의사항</span>
                    <ul>
                        <li>
                            ①  각 이벤트는 1인 1회 참여하실 수 있습니다.
                        </li>
                        <li>
                            ②  이벤트1과 이벤트2 중 한 가지만 참여하거나, 두 가지 모두 참여하실 수 있습니다.
                        </li>
                        <li>
                            ③  개인정보가 잘못되었거나 유효기간이 지난 경우, 기프티콘을 다시 발송해 드리지 않습니다.
                        </li>
                        <li>
                            ④  기프티콘 업체 상황에 따라 상품 변경 가능성이 있습니다.
                        </li>
                        <li>
                            ⑤  선물 발송을 위해 서비스/배송 업체에 개인정보(이름, 휴대전화번호)가 제공됩니다.
                            (㈜모바일이앤엠애드 사업자등록번호 215-87-19169,
                            ㈜카카오 사업자등록번호 120-81-47521)
                            }
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
            reg_dttm: this.props.reg_dttm, // 등록일
            BaseActions: this.props.BaseActions, // BaseAction
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id).substring(1, 4) + "***"; // 이벤트 이름
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');
        let eventSetContents = answers[0]; // 이벤트 내용

        eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
        eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

        this.setState({
            eventName: eventSetName,
            eventContents: eventSetContents,
        });
    };

    render() {
        return (
            <div className="listItem">
                <div className="comment_inner">
                    <div className="comment">
                        <span className="teacher_id">{this.state.eventName} 선생님</span>
                        <p dangerouslySetInnerHTML={{__html: this.state.eventContents}}></p>
                    </div>
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
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));