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

const PAGE_SIZE = 5;

class Event extends Component {
    state = {
        isEventApply : false,       // 신청여부
        isEventApply2 : false,       // 신청여부(초등)
        schoolLvlCd: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/444',
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
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

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId : this.props.eventId});
            const response2 = await api.chkEventJoin({eventId : 443});

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

    eventApply = async () => {
        const {
            logged,
            loginInfo,
            history,
            BaseActions,
            SaemteoActions,
            eventId,
            handleClick,
            event,
            eventAnswer
        } = this.props;
        // const {isEventApply} = this.state;

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

            // 중고등 대상 이벤트, 초등학교 선생님일경우 알럿
            if (loginInfo.schoolLvlCd == 'ES') {
                common.info("중고등 선생님 대상 이벤트 입니다.");
                return false;
            }

            // 로그인시
            try {
                if (this.state.isEventApply2) {
                    common.error("이미 참여하셨습니다.");
                } else {
                    handleClick(eventId);
                }
            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(() => {
                }, 1000);//의도적 지연.
            }
        }
    };

    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, playVideo, videoSource, popVideoSource } = this.state;

        const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
            <EventListApply {...eventList} key={eventList.event_answer_id}/>
        );

        return (
            <section className="event230424">
                <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                <div className="evtCont01">
                    <div className="evtTit">
                        <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                            <span className="blind">이벤트 공유하기</span>
                        </button>
                        <a href="javascript:void(0)" className="btnView1"><span className="blind">1탄 초등 비바샘 수업시간표</span></a>
                        <div className="blind">
                            <h2>
                                비바샘과 떠나는 콘텐츠 탐험 1탄
                            </h2>
                            <p>
                                선생님에게 딱 맞는! 수업 자료와 콘텐츠를 제공하는 비바샘!
                                쉽고 즐거운 수업을 준비하고 싶다면
                                비바샘 콘텐츠 탐험을 지금 바로 떠나보세요!
                                탐험을 함께하다 보면 숨겨진 보물도 획득 할 수 있어요!
                            </p>
                            <span>첫번째 탐험. 비바샘 테마관</span>
                            <ul className="evtPeriod">
                                <li><span className="tit"><em className="blind">1탄 탐험 기간:</em></span><span
                                    className="txt">4월24일(월)~5월14일(일)</span></li>
                                <li><span className="tit tit2"><em className="blind">당첨자 발표:</em></span><span
                                    className="txt txt2">5월17일(수)</span></li>
                            </ul>
                            <h3>용감한 탐험가 선생님께 드리는 탐험 보물</h3>
                            <ul>
                                <li>
                                    <span>50명</span>
                                    <p>
                                        남은 모험도 기운차게!
                                        광동생활건강
                                        비타500데일리스틱 30포 세트
                                    </p>
                                </li>
                                <li>
                                    <span>100명</span>
                                    <p>
                                        탐험 중 발견한 반짝반짝 보물!
                                        공차
                                        브라운 슈가 쥬얼리 치즈폼 스무디
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="blind">
                        <strong>
                            비바샘 테마관 역사의 현자으로 떠나는 VR 역사 답사
                        </strong>

                        <ul>
                            <li>
                                <span>VR 콘텐츠 내륙화 영상 제공</span>
                                <ul>
                                    <li>- 역사 속으로 애니메이션 : 유적지의 과거 상황을 재현한 애니메이션</li>
                                    <li>- 답사 영상 : 유적지를 여행자의 시각으로 소개하는 영상</li>
                                    <li>- 보충 영상 : 유적지와 관련된 이야기를 보다 자세히 풀어낸 영상</li>
                                    <li>- 드론 영상 : 유적지의 전령을 생동감있게 볼 수 있는 항공 촬영 영상</li>
                                </ul>
                            </li>
                            <li>
                                <span>학생용 활동지&교사용 수업 지도안 제공</span>
                                <ul>
                                    <li>- 수업 시간에 직접 활용 가능한 활동지와 수업 지도안 등의 자료 다운로드 가능</li>
                                </ul>
                            </li>
                            <li>
                                <span>모바일 VR 기능</span>
                                <ul>
                                    <li>- PC와 모바일에서도 볼 수 있어, 학생 참여 수업 가능</li>
                                </ul>
                            </li>
                            <li>
                                <span>연계 수업 활용</span>
                                <ul>
                                    <li>- 역사 교과뿐만 아니라 국어, 사회, 과학 등 다른 교과에서도 활용 가능</li>
                                </ul>
                            </li>
                        </ul>

                        <p>
                            지금 바로 비바샘 테마관-VR 역사 답사의 특별한 기능을 확인하고
                            'VR 역사 답사'를 통해 어떤 답사지를 탐험하셨는지 알려 주세요!
                        </p>
                        <span>TIP. 학생들과 어떻게 수업에 활용할 것인지를 함께 남겨 주시면 당첨 확률이 올라갑니다.</span>
                    </div>
                    <a onClick={onClickCallLinkingOpenUrl.bind(this,'https://v.vivasam.com/themeplace/vrkoreanhis/main.do')} className="btnGo">
                        <span className="blind">VR 역사 답사 바로가기</span>
                    </a>
                    <button className="btnApply" onClick={this.eventApply}>
                        <span className="blind">이벤트 참여하기</span>
                    </button>
                </div>

                <div className="commentWrap cont_Wrap">
                    <img src="/images/events/2023/event230424/evtCont3.png" alt="에듀테크 테마관 탐험후기" />
                    <div className="commentList">
                        {eventApplyAnswerList}
                    </div>

                    <EventApplyAnswerPagination
                        eventAnswerCount={eventAnswerCount}
                        pageSize={pageSize}
                        pageNo={pageNo}
                        handleClickPage={this.handleClickPage}
                    />
                </div>

                <div className="notice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>① 본 이벤트는 비바샘 교사인증을 완료한 중고등 선생님 대상 이벤트니다.</li>
                        <li>② 경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                        <li>③ 1 인 1회 참여할 수 있습니다.</li>
                        <li>④ 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>
                            ⑤ 경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br />
                            (㈜카카오 사업자등록번호 120-81-47521),<br />
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
            event_answer_desc2: "",
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
        let eventSetName = maskingStr(this.state.member_id);;
        let answers = this.state.event_answer_desc.split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0],
            // event_answer_desc2 : answers[1].replaceAll("\n", "<br/>"),
        });
    };

    render() {
        const {eventName, event_answer_desc} = this.state;
        return (
            <div className="listItem comment comment01 circle">
                <strong>{eventName} 선생님</strong>
                <p dangerouslySetInnerHTML={{__html: event_answer_desc}}></p>
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
        const pagesInScreen = 5;
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
            <div id="eventPagingNav" className="pagingWrap">
                <div className="innerPaging">
                    { curPage > 1 &&
                        <div className="pagingPrev">
                                <button
                                    type="button"
                                    className="btnPageFirst"
                                    onClick={() => {
                                        handleClickPage(1)
                                    }}
                                >
                                    <span className="blind">처음</span>
                                </button>
                                <button
                                    type="button"
                                    className="btnPagePrev"
                                    onClick={() => {handleClickPage(curPage - 1)}}
                                >
                                    <span className="blind">이전</span>
                                </button>
                        </div>
                    }
                    <div className="pageNum">
                        {pageButtonList()}
                    </div>
                    {curPage < totalPage &&
                        <div className="pagingNext">
                            <button
                                type="button"
                                className="btnPageNext"
                                onClick={() => {handleClickPage(curPage + 1)}}
                            >
                                <span className="blind">다음</span>
                            </button>
                            <button
                                type="button"
                                className="btnPageLast"
                                onClick={() => {handleClickPage(totalPage)}}
                            >
                                <span className="blind">마지막</span>
                            </button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}