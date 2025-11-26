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
        eventUrl: 'https://me.vivasam.com/#/saemteo/event/view/483',
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
            <section className="event240214">
                {/* content */}
                <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                <div className="evtCont01">
                    <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                        <span className="blind">이벤트 공유하기</span>
                    </button>
                    <h1><img src="/images/events/2024/event240214/evtCont1.png" alt="Lap Party" /></h1>
                    <div className="evtTit">
                        <div className="blind">
                            <span>애플코리아 교육팀과 함께하는</span>
                            <h1>Lap Party</h1>
                            <span>시즌 2   애플넘버스 교과서 편</span>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <h1><img src="/images/events/2024/event240214/evtCont2.png" alt="Lap Party" /></h1>
                    <div className="evtCont">
                        <div className="blind">
                            <h3>랩파티 시즌2를 소개합니다!</h3>
                            <p>비바샘 랩파티란?</p>
                            <p>
                                에듀테크의 시대, 어렵게만 느껴지는
                                에듀테크 툴을 사용하여 나만의 수업 자료를
                                만드는 방법을 배우고 실습해 보는 자리입니다.
                            </p>
                            <h2>
                                비바샘 랩파티 시즌2에서
                                애플 넘버스의 무한한 가능성가능성을 알아 볼까요?
                            </h2>
                            <p>
                                넘버스는 디지털 에듀테크 시대의 시작을 연 프로그램으로,​
                                아이패드와 맥북에 기본적으로 깔려 있는 App입니다.
                                넘버스 교과서를 통해 손쉽게 나만의 수업을 준비할 수 있고,​
                                학생들과 소통하며 보다 생생한 수업을 진행할 수 있습니다.
                            </p>
                            <h3>
                                랩파티는 이렇게 진행됩니다.
                            </h3>
                            <p>
                                애플코리아 교육팀과 함께 넘버스 교과서를 활용하는 방법을 배우고,
                                넘버스로 다양한 수업 자료를 만들어 보는 방법을 배워 보세요.
                            </p>
                            <ul>
                                <li>
                                    <span>사용하고</span>
                                    <p>
                                        비바샘에서 제공하는 넘버스 교과서의 사용법을
                                        배우고, 넘버스 교과서에 원하는 수업 자료를 추가하여
                                        나만의 교과서를 만들어요.
                                    </p>
                                </li>
                                <li>
                                    <span>공유하고</span>
                                    <p>
                                        넘버스로 만든 교과서와 활동지를 학생에게 공유하는
                                        법을 배우고, 실시간 쌍방향 수업을 진행하고,
                                        학생의 활동 내용을 손쉽게 관리해요.
                                    </p>
                                </li>
                                <li>
                                    <span>활용하고</span>
                                    <p>
                                        아이패드의 무료 App을 이용하여 다양한 자료를
                                        제작하고, 넘버스를 통해 공유해 보아요.
                                    </p>
                                </li>
                            </ul>
                            <h3>랩파티 일정이에요!</h3>
                            <ul>
                                <li>
                                    <span>파티 날짜 : </span>
                                    <p>2024년 2월 24일(토) 오전 10시~12시</p>
                                </li>
                                <li>
                                    <span>파티 장소 : </span>
                                    <p>
                                        서울 강남구 영동대로517
                                        아셈타워 1층
                                    </p>
                                </li>
                                <li>
                                    <span>파티 준비물 : </span>
                                    <p>열정과 호기심 (아이패드는 비바샘에서 준비합니다.)</p>
                                </li>
                            </ul>
                            <h3>랩파티 신청 방법을 알려드려요.</h3>
                            <ul>
                                <li>
                                    <span>신청 기간</span>
                                    <p> 2024.02.14(수) ~ 2024.02.19(월)</p>
                                </li>
                                <li>
                                    <span>당첨 발표</span>
                                    <p>2024.02.20(화)</p>
                                </li>
                                <li>
                                    <span>초대 인원</span>
                                    <p>40명(동료 선생님 동반 신청 가능)</p>
                                    <p>
                                        초/중/고 학교급 상관 없이 넘버스에 관심있는 선생님 모두 신청 가능합니다.
                                        활용 예제로 사용할 넘버스 교과서는 비상교육 초등 검정 교과서를
                                        사용하는 점 양해 부탁드립니다.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <a href="https://www.vivasam.com/samter/story/detail?id=147&page=2" target="_blank" className="btnReview bgImg"><span className="blind">시즌 1 후기 바로가기</span></a>
                    <a onClick={onClickCallLinkingOpenUrl.bind(this,'https://naver.me/5FehjKPs')} className="btnMap bgImg"><span className="blind">약도보기</span></a>
                    <button type="button" className="btnApply bgImg" onClick={this.eventApply}>
                        <span>참가 신청하기</span>
                    </button>
                </div>
                <div className="notice">
                    {/*<strong>유의사항</strong>*/} 
                    <ul className="evtInfoList">
                        <li>① 에듀테크 랩파티는 오프라인 행사입니다.</li>
                        <li>② 한정된 인원으로 진행하는 파티인 만큼, 파티 당일 참석 여부를 꼭 확인해 주세요.</li>
                        <li>③ 초대 인원만 참석할 수 있으며, 다른 선생님께 당첨 기회를 양도하실 수 없습니다.</li>
                        <li>④ 당첨자 발표 후 참여 여부 확정을 위해 개별 연락을 드릴 예정입니다. <br/>전화번호를 다시 한번 확인해 주세요.</li>
                        <li>⑤ 별도의 연락 없이 불참하신 경우, 이후 이벤트 참여에 제약이 있을 수 있습니다.</li>
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
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));