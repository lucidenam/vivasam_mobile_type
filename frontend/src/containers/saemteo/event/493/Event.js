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
const PAGE_SIZE = 3;
class Event extends Component {
    state = {
        eventId: 493,
        eventId1: 494,
        eventId2: 495,
        pageNo:1,
        pageSize:PAGE_SIZE,
        isEventApply : false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        eventUrl: 'https://www.vivasam.com/saemteo/event/view/493',
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.commentConstructorList();
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

    };

    // 후기 불러오기
    commentConstructorList = async () => {
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId:495,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.getSpecificEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;
        if(responseList.data.eventJoinAnswerList != null && responseList.data.eventJoinAnswerList.length > 0) {
            this.setState({
                eventAnswerContents: eventJoinAnswerList,
            });
        }
    };

    // 기 신청 여부 체크
    eventApplyCheck = async (eventId) => {
        const {logged} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId});
            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }else if (response.data.eventJoinYn === 'N') {
                this.setState({
                    isEventApply: false
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
        let underEventId;

        if (e.target.className.indexOf("pop1") > 0) {
            underEventId = 494;
        }else if (e.target.className.indexOf("pop2") > 0) {
            underEventId = 495;
        }

        await this.eventApplyCheck(underEventId);

        if (!this.prerequisite(e)) {
            return;
        }

        try {
            const eventAnswer = {
                eventId: underEventId,
                memberId: loginInfo.memberId
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

            event['agree'] = false;
            SaemteoActions.pushValues({type: "event", object: event});


            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    render() {
        const {eventAnswerContents} = this.state;
        const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
            <EventListApply {...eventList} key={eventList.event_answer_id}/>
        );

        return (
            <section className="event240325">
                <div className="evtCont1">
                    <h1><img src="/images/events/2024/event240325/img.png" alt="비바클래스" /></h1>
                    <div className="blind">
                        <p>소통과 배움의 시작, 비바클래스 open 이벤트</p>
                        <p>준비됐나요? 모여봐요, 비바클래스</p>
                        <p>
                            즐거운 수업을 위해 왔어요. 비바클래스!
                            비바클래스의 오픈 이벤트에 참여해주시는
                            모~든 선생님을 위한 선물도 준비했으니 꼭 받아가세요!
                        </p>
                        <p>이벤트 기간 - 2024.3.25.(월) ~ 2024.4.22.(월)</p>
                        <p>당첨자 발표 - 2024.4.30 (화) *비바샘 공지에서 확인 가능</p>
                        <p>경품</p>
                        <ul>
                            <li>
                                <p>비바클래스 준비됐나요?</p>
                                <p>
                                    스타벅스
                                    아이스 아메리카노 T
                                </p>
                            </li>
                            <li>
                                <p>모여봐요, 비바클래스!</p>
                                <p>
                                    클래스 친구들에게 쏩니다!
                                    학급 간식박스
                                </p>
                            </li>
                        </ul>
                        <p>이벤트1과 이벤트2는 중복참여가 가능해요!</p>
                    </div>
                </div>

                <div className="evtCont2">
                    <h1><img src="/images/events/2024/event240325/img2.png" alt="비바클래스" /></h1>
                    <div className="blind">
                        <p>이벤트 1</p>
                        <h5>비바클래스, 준비됐나요?</h5>
                        <p>
                            비바클래스와 함께 할 준비, 시작~♬
                            학급 경영 및 관리, 수업 지원, 소통 등 다양한 기능을 제공하는
                            비바클래스에서 클래스 만들고 학급 친구들을 초대해주세요
                        </p>
                        <ul>
                            <li>
                                <span>Step 1</span>
                                <p>
                                    클래스 만들기 클릭 후, 학교, 유형, 학년도,
                                    학급정보를 입력하면 클래스 만들기 끝!
                                </p>
                            </li>
                            <li>
                                <span>Step 2</span>
                                <p>
                                    학급 인원 수에 맞춰 발급해드린 계정을
                                    학급 친구들에게 나눠주세요.
                                    (발급해드린 계정 정보는 클래스 관리
                                    >구성원 관리 에서 확인할 수 있어요.)
                                </p>
                            </li>
                            <li>
                                <span>(+) 초대방법</span>
                                <p>
                                    QR코드로 학급 친구들을 클래스로 초대하여 함께 활동할 수 있어요.
                                    (문자발송, 클래스 코드로도 초대가 가능해요.)
                                </p>
                            </li>
                        </ul>
                        <p>꼭 확인해 주세요!</p>
                        <p>
                            클래스 개설 및 학생 초대 후 반드시 본 이벤트 페이지에서
                            ‘참여하기’ 버튼을 눌러주셔야 신청이 완료됩니다.
                        </p>
                    </div>
                    <button type="button" className="btnClass" onClick={() => alert("비바클래스는 PC환경에서 더욱 편리하게 이용하실 수 있습니다.")}>
                        <span className="blind">비바클래스 바로가기</span>
                    </button>
                    <button type="button" className="btnApply pop1" onClick={this.eventApply}>
                        <span className="blind">참여하기</span>
                    </button>
                </div>
                <div className="evtCont3">
                    <h1><img src="/images/events/2024/event240325/img3.png" alt="비바클래스" /></h1>
                    <div className="blind">
                        <p>이벤트 2</p>
                        <h5>모여봐요, 비바클래스</h5>
                        <p>
                            비바클래스에서 친구들과 모여 무엇을 할 수 있을까?
                            새학기 어색한 분위기를 풀어보아요.
                            자유게시판을 활용해 릴레이 자기소개를 하고 후기를 남겨주세요!
                            예) 아직은 수줍어하지만 다들 즐거워해요
                            /아이들의 자기소개 글이 신선하고 재밌어요
                        </p>
                    </div>
                    <div className="replyWrap">

                            {eventApplyAnswerList.length > 0 ?
                                (<ul> {eventApplyAnswerList} </ul>) :
                                (
                                <ul>
                                    <li>
                                        <div className="box">
                                            <div className="txt_box">
                                                <p>선생님이 등록한 게시물에 댓글을 다는 형태였다면 다소 딱딱하게 느껴질 수도 있는데 자유게시판에서는 학생 본인이 게시물을 등록하고 서로에게 댓글도 달아줄 수 있어 반 내에서 활발한 소통이 이루어질 수 있을 것으로 기대됩니다.</p>
                                            </div>
                                            <p className="name">Hon*** 선생님</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="box">
                                            <div className="txt_box">
                                                <p>다른 게시판 메뉴와 달리 포스트잇 모양의 디자인이 귀여워요! 색감도 알록달록해서 아이들이 글을 쓸 때 너무 좋아했어요. 댓글에 이모티콘이나 스티커 기능도 추가되면 더 좋을 것 같아요~</p>
                                            </div>
                                            <p className="name">Hon*** 선생님</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="box">
                                            <div className="txt_box">
                                                <p>아직 학기 초라 그런지 아이들이 자기소개 글을 올리는 것에 쑥스러워 하진 않을까 내심 걱정했는데, 생각과는 다르게 아주 적극적으로 소개 글을 올리네요^^ 비바클래스 덕분이에요.</p>
                                            </div>
                                            <p className="name">Hon*** 선생님</p>
                                        </div>
                                    </li>
                                </ul>
                                )
                            }

                    </div>
                    <h1><img src="/images/events/2024/event240325/img4.png" alt="비바클래스" /></h1>
                    <div className="blind">
                        <p>꼭 확인해 주세요!</p>
                        <ul>
                            <li>자유게시판에서 활동 후 반드시 본 이벤트 페이지에서 ‘참여하기’ 버튼을 눌러주셔야 신청이 완료됩니다.</li>
                            <li>당첨 시 간식 발송을 위해 선생님이 입력한 학급 정보를 기준으로 선생님께 연락 드릴 예정이니 정확한 정보를 입력해 주세요.</li>
                        </ul>
                    </div>
                    <button type="button" className="btnApply pop2" onClick={this.eventApply}>
                        <span className="blind">참여하기</span>
                    </button>
                </div>
                <div className="evtFooter">
                    <div className="inner">
                        <strong>유의사항</strong>
                        <ul>
                            <li>①  본 이벤트는 비바샘 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                            <li>②  각 이벤트 별로 1인 1회씩 참여하실 수 있습니다.​</li>
                            <li>③  개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.​</li>
                            <li>④  경품 발송을 위해 선물 발송을 위해 개인정보가 서비스사와 배송업체에 제공됩니다.​ <br/>(주)모바일이앤엠애드 사업자등록번호 : 215-87-19169​ <br/>아기자기 선물가게 사업자등록번호: 5303100427​</li>
                            <li>⑤  경품은 당첨자 발표 이후 순차발송 되며, 학급 학생 대상 이벤트의 경우 간식 배송을 위해 선생님께 연락 드릴 예정입니다.​</li>
                            <li>⑥  제출하신 응답은 상업적인 사용 목적이 아닌, 기업의 활동 소개를 위해 사용될 수 있습니다.</li>
                            <li className="c">⑦  클래스에 입장한 학생의 개인정보 수집 및 활용 동의는 개설하신 클래스의 운영기간 내에 언제든지 받으실 수 있습니다. <br/>자세한 내용은 비바클래스>자주하는 질문에서 안내드리고 있습니다.</li>
                        </ul>
                    </div>
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
        let masking = "";
        for (var i = 1; i < eventSetName.length-4; i++) {
            masking += "*";
        }
        eventSetName = eventSetName.substring(1, 4) + masking; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[answers.length-1],
        });
    };

    render() {
        const {eventName, event_answer_desc} = this.state;
        return (
            <li>
                <div className="box">
                    <div className="txt_box">
                        <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
                    </div>
                    <p className="name">{eventName} 선생님</p>
                </div>
            </li>
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