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

class Event extends Component {
    state = {
        isEventApply : false,       // 신청여부
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/448',
        showInstructorPop: false
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

        this.instructorPopRef = React.createRef();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.showInstructorPop && this.state.showInstructorPop) {
            this.instructorPopRef.current.scrollIntoView({
                behavior: "smooth",
            });
        }
    }

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, eventId} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId});

            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
        }
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
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return false;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        return true;
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, loginInfo, event} = this.props;

        if (!this.prerequisite(e)) {
            return;
        }

        try {
            SaemteoActions.pushValues({type: "event", object: event});

            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    // 강사소개 보이기
    showInstructorPop = () => {
        this.setState({
            showInstructorPop: true
        });
    };

    // 강사소개 닫기
    hideInstructorPop = () => {
        this.setState({
            showInstructorPop: false
        });
    }

    render() {

        return (
            <section className="event230426">
                {/*popup*/}
                <div id="eventPopWrap"
                     ref={this.instructorPopRef}
                     className={this.state.showInstructorPop? 'on' : ''}>
                    <div className="dimed"></div>
                    <div className="eventPop pop2">
                        <div className="titWrap">
                            <div className="blind">
                                파티를 함께할 강사님을 소개합니다.
                            </div>
                            <button type="button" className="evtPopClose" onClick={this.hideInstructorPop}><span className="blind">팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <div className="popInfoWrap">
                                <div className="party_tit">
                                    <p className="blind">
                                        안녕하세요. 몽당분필 연구회 교사 박준호입니다.<br /> 이번 Lab party는 FEK(Figma Educators of Korea) 연구회 선생님들과 함께합니다!
                                        FEK(Figma Educators of Korea) 연구회는 Figma를 교육적으로 활용하고 실증하는 공교육 교사 연구 모임입니다.
                                    </p>
                                </div>

                                <ul className="party_List">
                                    <li className="sns01"><a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.instagram.com/nalssam/')}  ><span className="blind">몽당분필 날쌤</span><span className="blind">@nalssam</span></a></li>
                                    <li className="sns02"><a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.instagram.com/goodteacher_social/')}  ><span className="blind">굿티쳐쏘샬</span><span className="blind">@goodteacher_social</span></a></li>
                                    <li className="sns03"><a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.instagram.com/hanuipyo/')}  ><span className="blind">놀람쌤</span><span className="blind">@hanuipyo</span></a></li>
                                    <li className="sns04"><a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.instagram.com/jeong_dalda/')}  ><span className="blind">정달다쌤</span><span className="blind">@jeong_dalda</span></a></li>
                                    <li className="sns05"><a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.instagram.com/chae_ssaem/')}  ><span className="blind">더나은 채쌤</span><span className="blind">@chae_ssaem</span></a></li>
                                    <li className="sns06"><a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.instagram.com/gee9ssam/')}  ><span className="blind">지구쌤</span><span className="blind">@gee9ssam</span></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>



                {/* content */}
                <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                <div className="evtCont01">
                    <h1><img src="/images/events/2023/event230426/evtCont1.png" alt="Lap Party" /></h1>
                    <div className="evtTit">
                        <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                            <span className="blind">이벤트 공유하기</span>
                        </button>
                        <div className="blind">
                            <span>몽당분필 선생님과 함께하는</span>
                            <h1>Lap Party</h1>
                            <span>시즌 01 ·피그마 편</span>
                            <h2>
                                랩 파티 시즌1을 소개 합니다.
                            </h2>
                            <p>
                                비바샘 랩파티에서 최고의 디지털 화이트보드를 만나볼까요?
                            </p>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <h1><img src="/images/events/2023/event230426/evtCont2.png" alt="Lap Party" /></h1>
                    <div className="evtCont">
                        <div className="blind">
                            <h3>
                                비바샘 랩파티에서 최고의 디지털 화이트보드를 만나볼까요?
                            </h3>
                            <p>
                                최근 에듀테크 활용 선생님 사이에서 뜨거운 반응을 일으키고 있는 피그마는
                                UI 디자인 및 디지털 화이트보드 부분 종합 1위를 차지한 프로그램입니다.
                                피그마를 통해 동료들과 협업하여 다양한 교수학습 자료를 만들고 학생들과
                                브레인스토밍,  워크 보드 만들며 보다 생생한 수업 환경을 만들 수 있습니다.
                            </p>
                            <strong>우리 교실에서 바로 활용하는 에듀테크 디지털 도구 피그마!
                                피그마를 배우고 활용해보고 싶은 선생님을 비바샘 랩파티로 초대합니다.
                            </strong>

                            <h2>
                                랩파티는 이렇게 진행됩니다.
                            </h2>
                            <p>
                                오전에는 전문가 선생님과 함께 피그마/피그잼의 핵심 꿀팁을
                                맛있는 점심 식사 후에는 직접 실습과 신나는 네트워크 시간을 준비했어요.
                            </p>

                            <div>
                                <span className="tit blind">듣고</span><span className="txt"><span
                                className="blind">파티가 시작되었습니다! 활기찬 오프닝과 함께 피그마/피그잼 기초를 배워요.</span></span>
                            </div>
                            <div>
                                <span className="tit blind">Breaktime</span><span className="txt"><span
                                className="blind">열정 가득했던 수업이 끝나면 쉬는 시간을 가져요! 비바샘이 맛있는 점심 도시락을 제공합니다.</span></span>
                            </div>
                            <div>
                                <span className="tit blind">해보고</span><span className="txt"><span
                                className="blind">강사의 티칭을 받으며 선생님이 직접 교수 자료를 제작조별 수업 실습을 진행하며 피드백을 공유해요.</span></span>
                            </div>
                            <div>
                                <span className="tit blind">나누고</span><span className="txt"><span
                                className="blind">오늘 함께한 선생님들과 함께​자유롭게 이야기를 나누며 네트워킹 시간을 가져요</span></span>
                            </div>
                            <div>
                                <span className="tit blind">즐기고</span><span className="txt"><span
                                className="blind">배움의 즐거움과 파티의 즐거움을 동시에!​ 참여해주신 선생님을 위한 특별한 선물과 간식 그리고 이벤트를 기대해주세요​</span></span>
                            </div>

                            <h2>
                                랩파티 신청 방법을 알려드려요.
                            </h2>
                            <div>
                                <span className="tit blind">파티 날짜</span><span className="txt"><span
                                className="blind">2023년 5월 20일(토) 오전 10시~ 오후 04시</span></span>
                            </div>
                            <div>
                                <span className="tit blind">파티 장소</span><span className="txt"><span
                                className="blind">비상교육 본사 20층 (서울 구로동)</span></span>
                            </div>
                            <div>
                                <span className="tit blind">파티 준비물</span><span className="txt"><span
                                className="blind">개인 노트북</span></span>
                                <span>(미지참 시 노트북 대여 가능)</span>
                            </div>

                            <h2>
                                랩파티 신청 방법을 알려드려요.
                            </h2>
                            <div>
                                <span className="tit blind">신청기간</span><span className="txt"><span
                                className="blind">2023.04.26(수) ~ 2023.05.11(목)</span></span>
                            </div>
                            <div>
                                <span className="tit blind">당첨 발표</span><span className="txt"><span
                                className="blind">2023.05.15(월)</span></span>
                            </div>
                            <div>
                                <span className="tit blind">초대 인원</span><span className="txt"><span
                                className="blind">60명</span></span>
                                <span>(동료 선생님 동반 신청 가능)</span>
                                <span>초/중/고 학교급 상관 없이 피그마에 관심있는 선생님 모두 신청 가능합니다.</span>
                                <span>활용 예시, 수업 자료 등은 초등에 맞춰 수업이 진행되는 점 유의 부탁드립니다.</span>
                            </div>
                        </div>
                    </div>

                    <a href="https://www.figma.com/" target="_blank" className="btnFigma bgImg"><span className="blind">피그마 알아보기</span></a>
                    <button type="button" target="_blank" className="btnInfo bgImg" onClick={this.showInstructorPop}><span className="blind">강사소개</span></button>
                    <a onClick={onClickCallLinkingOpenUrl.bind(this,'https://www.visang.com/pageLoad?page_id=/kr/contact/contact')} className="btnMap bgImg"><span className="blind">약도보기</span></a>
                    <button type="button" className="btnApply bgImg" onClick={this.eventApply}>
                        <span>참가 신청하기</span>
                    </button>
                </div>

                <div className="notice">
                    {/*<strong>유의사항</strong>*/}
                    <ul className="evtInfoList">
                        <li>① 본 이벤트는 비바샘 교사인증을 완료한 중고등 선생님 대상 이벤트니다.</li>
                        <li>② 경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                        <li>③ 1 인 1회 참여할 수 있습니다.</li>
                        <li>④ 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>
                            ⑤ 경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.
                            (㈜카카오 사업자등록번호 120-81-47521),
                            (㈜모바일이앤엠애드 사업자등록번호 215-87-19169)
                        </li>
                        <li>⑥ 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
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
            indexNum: this.props.indexNum,
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        eventSetName = eventSetName.substring(1, (eventSetName.length-4)) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0],
        });
    };

    render() {
        return (
            <div className={"listItem" + " comment"  + " comment0" + this.state.indexNum}>
                <span className="user_name">{this.state.eventName + " 선생님"}</span>
                <p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc}}></p>
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