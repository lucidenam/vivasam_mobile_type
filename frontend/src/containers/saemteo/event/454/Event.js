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
import * as myclassActions from "../../../../store/modules/myclass";
import {maskingStr} from '../../../../lib/StringUtils';
import {onClickCallLinkingOpenUrl} from "../../../../lib/OpenLinkUtils";


const PAGE_SIZE = 10;
const event1Items = ["담백한 인터뷰", "솔직한 인터뷰", "재학생 인터뷰", "학과별 인터뷰"];
class Event extends Component {
    state = {
        isEventApply : false,       // 신청여부
        isEventApply2 : false,      // 신청여부(초등)
        schoolLvlCd: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/454',
        eventContents : "",
        eventLength: 0, //
        item1: false,				// 아이템1 선택 여부
        item2: false,				// 아이템2 선택 여부
        item3: false,				// 아이템3 선택 여부
        item4: false,				// 아이템4 선택 여부

    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();           // 초등과 중복참여
            await this.checkEventCount();   		// 이벤트 참여자 수 조회
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

    };

    eventApplyCheck = async () => {
        const {logged} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId : this.props.eventId});
            const response2 = await api.chkEventJoin({eventId : 453});

            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
            if (response2.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply2: true
                });
            }
        }
    }

    setApplyContent = (e) => {

        const {loginInfo} = this.props;
        if (loginInfo.schoolLvlCd == 'ES') {
            common.info("초등 선생님 대상 이벤트 입니다.");
            e.target.value = "";
            return;
        }

        if (e.target.value.length > 300) {
            // common.info("300자 이내로 입력해 주세요.");
            return false;
        }
        this.setState({
            eventLength: e.target.value.length,
            eventContents: e.target.value
        });
    };

    setEventInfo = async () => {
        const {event, SaemteoActions} = this.props;

        event.teacherAnnual = '';
        event.teacherHope = '';
        SaemteoActions.pushValues({type: "event", object: event});
        event.applyContent2 = '';
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
    };

    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;
        const {item1, item2, item3, item4} = this.state;

        let eventContents = "";

        if (!this.prerequisite(e)) {
            return;
        }

        if (!item1 && !item2 && !item3 && !item4) {
            common.info("퀴즈의 정답을 선택해주세요 ");
            return;
        } else {
            item1 ? eventContents = event1Items[0] : "";
            item2 ? eventContents = event1Items[1] : "";
            item3 ? eventContents = event1Items[2] : "";
            item4 ? eventContents = event1Items[3] : "";
        }

        eventContents += (this.state.eventContents !== "" ?  "^||^" + this.state.eventContents : "");

        try {

            const eventAnswer = {
                eventId: e.target.id,
                memberId: loginInfo.memberId,
                eventContent : eventContents,
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

    handleChange = (e) => {
        const {loginInfo} = this.props;

        if (loginInfo.schoolLvlCd == 'ES') {
            common.info("중고등 선생님 대상 이벤트입니다");
            e.target.checked = false;
            return;
        }

        this.setState({
            item1: false,
            item2: false,
            item3: false,
            item4: false,
            [e.target.id]: e.target.checked,
        });
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

    prerequisite = (e) => {
        const {logged, history, BaseActions, loginInfo, eventId} = this.props;
        const {isEventApply} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        // 준회원 여부
        if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
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

        // 중고등 대상 이벤트, 초등학교 선생님일경우 알럿
        if (loginInfo.schoolLvlCd == 'ES') {
            common.info("중고등 선생님 대상 이벤트 입니다.");
            return false;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        try {
            if (this.state.isEventApply2) {
                common.error("이미 신청하셨습니다.");
                return;
            } else {
                // handleClick(eventId);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }

        return true;
    }


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
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        this.setState({
            eventAnswerContents : eventJoinAnswerList,
        });
    };

    render() {
        const {event} = this.props;

        return (
            <section className="event230518">
                <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                <div className="evtCont01">
                    <img src="/images/events/2023/event230518/evtCont1.png" alt="콘텐츠 탐험 4탄" />
                    <div className="evtTit">
                        <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                            <span className="blind">이벤트 공유하기</span>
                        </button>
                        <span className="btnView1"><span className="blind">1탄 비바샘 테마관</span></span>

                        <div className="blind">
                            <h2>
                                비바샘과 떠나는 콘텐츠 탐험 2탄
                            </h2>
                            <p>
                                선생님에게 딱 맞는! 수업 자료와 콘텐츠를 제공하는 비바샘!
                                쉽고 즐거운 수업을 준비하고 싶다면
                                비바샘 콘텐츠 탐험을 지금 바로 떠나보세요!
                                탐험을 함께하다 보면 숨겨진 보물도 획득 할 수 있어요!
                            </p>
                            <span>두번째 탐험. 창의적 체험활동 - 진로/진학</span>
                            <ul className="evtPeriod">
                                <li><span className="tit"><em className="blind">4탄 탐험 기간:</em></span><span
                                    className="txt">2023.05.18(목)~06.11(일)</span></li>
                                <li><span className="tit tit2"><em className="blind">당첨자 발표:</em></span><span
                                    className="txt txt2">2023.06.14(수)</span></li>
                            </ul>
                            <h3>용감한 탐험가 선생님께 드리는 달콤한 탐험 보물</h3>
                            <ul>
                                <li>
                                    <span>300명 추첨</span>
                                    <p>
                                        사막 속 오아시스 같은 시원한 충전타입!
                                        스타벅스 딸기 딜라이트 요거트 블렌디드T
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <img src="/images/events/2023/event230518/evtCont2.png" alt="콘텐츠 탐험 4탄" />
                    <h3 className="blind">
                       <span>전국 대학의 학과별 핵심 정보를 살펴볼 수 있는</span>
                        창의적 체험활동  진로
                    </h3>

                    <ul className="evt_info">
                        <li>학과의 특성을 인문, 사회, 교육, 공학, 자연, 의학, 예체능 계열별로<br />
                            나누어 제공합니다.
                        </li>
                        <li>
                            학과의 특성과 함께 주요 진로 분야 및 관련 학과, 관련 자격증 정보를<br />
                            제공합니다.
                        </li>
                        <li className="point">
                            현실적인 학과 생활을 엿볼 수 있는 ○○○ ○○○ 를 제공합니다.
                        </li>
                        <li>
                            입시대비 및 진학 자료와 직업별 특성 및 관련 정보를 안내하는<br />
                            인터뷰 영상을 제공합니다.
                        </li>
                    </ul>

                    <div className="event_label">
                        <h2>
                            <span className="blind">Event1 필수 참여</span>
                        </h2>

                        <div className="cont contRdo">

                            <img src="/images/events/2023/event230518/evt_label1_txt.png" alt="진로 활동 특장점으로 소개해드린 세 번째 문장 빈칸에 들어갈 정답을 골라주세요!" />
                            <p className="blind">
                                진로 활동 특장점으로 소개해드린
                                세 번째 문장 빈칸에 들어갈 정답을 골라주세요!
                                정답을 맞히신 분들 중 추첨을 통해 총 300분께 선물을 드립니다.

                                현실적인 학과 생활을 엿볼 수 있는
                                ○○○ ○○○를 제공합니다.
                            </p>

                            <ul className="cont_check">
                                <li>
                                    <input type="radio" name="item" id="item1" onChange={this.handleChange}/>
                                    <label htmlFor="item1">
                                        <img src="/images/events/2023/event230518/evt_radio_txt1.png" alt="담백한 인터뷰" />
                                        <span htmlFor="item1" className="blind">담백한 인터뷰</span>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" name="item" id="item2" onChange={this.handleChange} />
                                    <label htmlFor="item2">
                                        <img src="/images/events/2023/event230518/evt_radio_txt2.png" alt="솔직한 인터뷰" />
                                        <span htmlFor="item2" className="blind">솔직한 인터뷰</span>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" name="item" id="item3" onChange={this.handleChange}/>
                                    <label htmlFor="item3">
                                        <img src="/images/events/2023/event230518/evt_radio_txt3.png" alt="재학생 인터뷰" />
                                        <span htmlFor="item3" className="blind">재학생 인터뷰</span>
                                    </label>
                                </li>
                                <li>
                                    <input type="radio" name="item" id="item4" onChange={this.handleChange}/>
                                    <label htmlFor="item4">
                                        <img src="/images/events/2023/event230518/evt_radio_txt4.png" alt="학과별 인터뷰" />
                                        <span htmlFor="item4" className="blind">학과별 인터뷰</span>
                                    </label>
                                </li>
                            </ul>

                            <span className="onlyPc">
                                <span className="blind">힌트는 '비바샘 중고등' PC 이벤트 페이지에서 확인 가능합니다</span>
                            </span>
                        </div>
                    </div>

                    <div className="event_label">
                        <h2>
                            <span className="blind">Event3 선택 참여</span>
                        </h2>

                        <div className="cont">
                            <img src="/images/events/2023/event230518/evt_label2_txt.png" alt="창의적 체험활동에 어떤 수업 자료가 추가되면 좋을까요? 자유롭게 의견을 작성해 주세요." />
                            <p className="blind">
                                팡의적 체험활동에 어떤 수업 자료가 추가되면 좋을까요?
                                자유롭게 의견을 작성해 주세요.(300자 이내)
                            </p>

                            <div className="formBox">
                                <textarea
                                    placeholder="300자 이내로 자유롭게 작성해주세요."
                                    name="applyContent2"
                                    id="applyContent2"
                                    maxLength="300"
                                    value={this.state.eventContents}
                                    onChange={this.setApplyContent}
                                    className="ipt_textarea"></textarea>
                                <span className="count"><span className="currentCount">{this.state.eventLength}</span>/300</span>
                            </div>

                        </div>
                    </div>

                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                    </div>

                </div>


                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>① 본 이벤트는 비바샘 교사인증을 완료한 중고등 선생님 대상 이벤트입니다.</li>
                        <li>② 경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                        <li>③ 1 인 1회 참여할 수 있습니다.</li>
                        <li>④ 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>
                            ⑤ 경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br />
                            (㈜카카오 사업자등록번호 120-81-47521),<br />
                            ㈜모바일이앤엠애드 사업자등록번호 215-87-19169)
                        </li>
                        <li>⑥ 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
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

