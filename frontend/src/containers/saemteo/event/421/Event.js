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

const PAGE_SIZE = 15;

class Event extends Component {
    state = {
        isEventApply: false,       // 신청여부
        bookTitle: '',
        bookReason: '',
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton: 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtComment: '',
        questionList: [{
            name : '1',
            value : '',
        }],
        popupVisible : false,
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
        const {evtComment, questionList} = this.state;

        if (!this.prerequisite(e)) {
            return;
        }
        if(questionList.length < 6){
            common.info("모든 문제를 체크해주시기 바랍니다.");
            return;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eventAnswerContent: questionList,
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

            event['agree1'] = false;
            SaemteoActions.pushValues({type: "event", object: event});


            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    //문항 선택 이벤트
    chooseExam = (e) => {
        const {questionList} = this.state;

        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return;
        }

        let tmpQuestionList = questionList.filter((arr, i) => arr.name !== e.target.name);
        tmpQuestionList = [...tmpQuestionList, {name : e.target.name, value: e.target.value}];
        tmpQuestionList.sort((a, b) => parseInt(a.name) - parseInt(b.name));

        console.log(tmpQuestionList);

        this.setState({
            questionList : tmpQuestionList,
        })
    }


    showPopup = (e) => {
        this.setState({
            popupVisible : true,
        })
    }

    closePopup = (e) => {
        this.setState({
            popupVisible : false,
        })
    }


    render() {
        const {popupVisible} = this.state;
        return (
            <div>
                <section className="event221101">
                    <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
                    <div className="evtBg">
                        <div className="evtCont01">
                            <div className="evtTit">
                                <div className="blind">
                                    <span>VISANG + 한해 7탄</span>
                                    <h1>
                                        2022학년도 1회 비상한 모의고사 이벤트 비바샘 영역
                                    </h1>

                                    <p className="txt">
                                        2022년에도 선생님을 찾아 갑니다.
                                        많은 선생님들의 사랑을 받은 학생용 필사 노트!

                                        전국 1천여 명의 선생님이 추천해주신 위인의 명언을
                                        한 자 한자 쓰며 과거로부터 지혜를 얻고, 그 뜻을 되새길 수 있습니다.
                                    </p>
                                </div>
                                <div className="evtCode">
                                    <div className="blind">
                                        <dl>
                                            <dt>성명</dt>
                                            <dd>비바샘</dd>
                                        </dl>
                                        <dl>
                                            <dt>수험 번호</dt>
                                            <dl>
                                                <span>2</span>
                                                <span>0</span>
                                                <span>1</span>
                                                <span>3</span>
                                            </dl>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="evtPeriod">
                                <div className="blind">
                                    <div><span className="tit blind">시험일시</span><span className="txt"><span className="blind">2022년 11월 1일(화) ~ 11월 27일(일)</span></span>
                                    </div>
                                    <div><span className="tit blind">성적발표</span><span className="txt"><span className="blind">2022년 11월 30일</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="evtGift">
                                <div className="blind">
                                    <h2>비상한 모의고사 경품안내</h2>
                                </div>
                                <ul>
                                    <li>
                                        <img src="/images/events/2022/event221101/evtGift1.png" alt="비바샘"/>
                                        <div className="blind">
                                            <span>최우수상</span>
                                            <p>
                                                [학급선물]
                                                홈런볼 과자박스(36개입)
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <img src="/images/events/2022/event221101/evtGift2.png" alt="비바샘"/>
                                        <div className="blind">
                                            <span>우수상</span>
                                            <p>
                                                [파리바게뜨]
                                                명가명품 우리벌꿀 카스테라
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <img src="/images/events/2022/event221101/evtGift3.png" alt="비바샘"/>
                                        <div className="blind">
                                            <span>장려상</span>
                                            <p>
                                                [베스킨라빈스]
                                                싱글레귤러 아이스크림
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <img src="/images/events/2022/event221101/evtGift4.png" alt="비바샘"/>
                                        <div className="blind">
                                            <span>참여상</span>
                                            <p>
                                                [비상]
                                                손난로 보조배터리
                                            </p>
                                        </div>
                                    </li>

                                </ul>
                            </div>
                            <div className="evtExam">
                                <div className="evtQ q1">
                                    <span className="evtQ_tit">Q1. 비바샘이 태어난 연도는 언제일까요?</span>
                                    <ul>
                                        <li>
                                            <input type="radio" name="1" id="q1-1" value="1" onClick={this.chooseExam}/>
                                            <label htmlFor="q1-1">①&nbsp;&nbsp;    2010년</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="1" id="q1-2" value="2" onClick={this.chooseExam}/>
                                            <label htmlFor="q1-2">②&nbsp;&nbsp;   2013년</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="1" id="q1-3" value="3" onClick={this.chooseExam}/>
                                            <label htmlFor="q1-3">③&nbsp;&nbsp;    2015년</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="1" id="q1-4" value="4" onClick={this.chooseExam}/>
                                            <label htmlFor="q1-4">④&nbsp;&nbsp;    2022년</label>
                                        </li>
                                    </ul>

                                    <span className="btnHint hint1">
                                        힌트: 시험지에 정답이 숨어있습니다.
                                    </span>
                                </div>
                                <div className="evtQ q2">
                                    <span className="evtQ_tit">Q2. 비바샘이 운영하는 SNS 채널이 아닌 것은 무엇일까요?</span>
                                    <ul>
                                        <li>
                                            <input type="radio" name="2" id="q2-1" value="1" onClick={this.chooseExam}/>
                                            <label htmlFor="q2-1">①&nbsp;&nbsp;    인스타그램</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="2" id="q2-2" value="2" onClick={this.chooseExam}/>
                                            <label htmlFor="q2-2">②&nbsp;&nbsp;    페이스북</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="2" id="q2-3" value="3" onClick={this.chooseExam}/>
                                            <label htmlFor="q2-3">③&nbsp;&nbsp;    카카오톡</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="2" id="q2-4" value="4" onClick={this.chooseExam}/>
                                            <label htmlFor="q2-4">④&nbsp;&nbsp;    네이버 블로그</label>
                                        </li>
                                    </ul>

                                    <button className="btnHint hint2" onClick={this.showPopup}>
                                        힌트 보기
                                    </button>

                                </div>
                                <div className="evtQ q3">
                                    <span className="evtQ_tit">Q3. 비바샘은 2017년부터 선생님의 사연을 받아 학생들의 꿈 명함을 만들어드리고 있습니다. 이 캠페인의 정식 명칭은 무엇일까요?</span>
                                    <ul>
                                        <li>
                                            <input type="radio" name="3" id="q3-1" value="1" onClick={this.chooseExam}/>
                                            <label htmlFor="q3-1">①&nbsp;&nbsp;    설렘꾸러미 캠페인</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="3" id="q3-2" value="2" onClick={this.chooseExam}/>
                                            <label htmlFor="q3-2">②&nbsp;&nbsp;    비바샘 캠페인</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="3" id="q3-3" value="3" onClick={this.chooseExam}/>
                                            <label htmlFor="q3-3">③&nbsp;&nbsp;    꿈지기 캠페인</label>
                                        </li>
                                    </ul>
                                </div>
                                <div className="evtQ q4">
                                    <span className="evtQ_tit">Q4. 오직 선생님만을 위한 비바샘의 차별화된 문화 프로그램의 명칭은 무엇일까요?</span>
                                    <ul>
                                        <li>
                                            <input type="radio" name="4" id="q4-1" value="1" onClick={this.chooseExam}/>
                                            <label htmlFor="q4-1">①&nbsp;&nbsp;     교사문화 프로그램</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="4" id="q4-2" value="2" onClick={this.chooseExam}/>
                                            <label htmlFor="q4-2">②&nbsp;&nbsp;     교사행복 프로그램</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="4" id="q4-3" value="3" onClick={this.chooseExam}/>
                                            <label htmlFor="q4-3">③&nbsp;&nbsp;     교사연수 프로그램</label>
                                        </li>
                                    </ul>
                                </div>
                                <div className="evtQ q5">
                                    <span className="evtQ_tit">Q5. 선생님의 비바샘 사이트 활동에 따라 적립되는 마일리지 서비스의 명칭은 무엇일까요?</span>
                                    <ul>
                                        <li>
                                            <input type="radio" name="5" id="q5-1" value="1" onClick={this.chooseExam}/>
                                            <label htmlFor="q5-1">①&nbsp;&nbsp;     비바콘</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="5" id="q5-2" value="2" onClick={this.chooseExam}/>
                                            <label htmlFor="q5-2">②&nbsp;&nbsp;     월드콘</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="5" id="q5-3" value="3" onClick={this.chooseExam}/>
                                            <label htmlFor="q5-3">③&nbsp;&nbsp;     팝콘</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="5" id="q5-4" value="4" onClick={this.chooseExam}/>
                                            <label htmlFor="q5-4">④&nbsp;&nbsp;     바일리지</label>
                                        </li>
                                    </ul>
                                </div>
                                <div className="evtQ q6">
                                    <span className="evtQ_tit">Q6. 초등선생님과 함께 개발하는 주제발 수업 자료집으로 재미있고 창의적인 '오늘' 의 수업 이야기를 담은 수업 사례집의 명칭은 무엇일까요?</span>
                                    <ul>
                                        <li>
                                            <input type="radio" name="6" id="q6-1" value="1" onClick={this.chooseExam}/>
                                            <label htmlFor="q6-1">①&nbsp;&nbsp;    놀면 뭐 하니?</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="6" id="q6-2" value="2" onClick={this.chooseExam}/>
                                            <label htmlFor="q6-2">②&nbsp;&nbsp;   내일 뭐 하지?</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="6" id="q6-3" value="3" onClick={this.chooseExam}/>
                                            <label htmlFor="q6-3">③&nbsp;&nbsp;    오늘 뭐 하지?</label>
                                        </li>
                                        <li>
                                            <input type="radio" name="6" id="q6-4" value="4" onClick={this.chooseExam}/>
                                            <label htmlFor="q6-4">④&nbsp;&nbsp;    오늘 뭐 먹지?</label>
                                        </li>
                                    </ul>
                                </div>
                                {   popupVisible &&
                                <div className="pop_hint" id="popHint">
                                    <div className="popTit">
                                        <h3 className="blind">비바샘 SNS 채널 안내</h3>
                                        <button className="popClose" onClick={this.closePopup}></button>
                                    </div>
                                    <div className="popCont">
                                        <span className="blind">비바샘의 소식을 가장 빠르게 만나느 방법!</span>
                                        <ul>
                                            <li>
                                                <a href="http://pf.kakao.com/_JUlsK" target="_blank">
                                                    <img src="/images/events/2022/event221101/pop_kakao.png" alt="카카오톡 플러스친구" />
                                                        <div className="blind">
                                                            <p>비바샘 카카오톡</p>
                                                            <p>플러스 친구 추가하기</p>
                                                        </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="https://www.instagram.com/vivasam_official/" target="_blank">
                                                    <img src="/images/events/2022/event221101/pop_instagram.png" alt="인스타그램 팔로우" />
                                                        <div className="blind">
                                                            <p>비바샘 인스타그램</p>
                                                            <p>팔로우하기</p>
                                                        </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="https://www.facebook.com/vivasam.official" target="_blank">
                                                    <img src="/images/events/2022/event221101/pop_facebook.png" alt="페이스북 좋아요" />
                                                        <div className="blind">
                                                            <p>비바샘 페이스북</p>
                                                            <p>좋아요하기</p>
                                                        </div>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                    <button className="btnApply" onClick={this.eventApply}>
                        <span>참여하기</span>
                    </button>
                </section>
                <div className="notice">
                    <span>유의사항</span>
                    <ul>
                        <li>①  본 이벤트는 1인 1회 참여하실 수 있습니다.</li>
                        <li>②  참여 완료 후에는 수정 및 추가 참여가 어렵습니다.</li>
                        <li>③  동점자가 있을 경우, 선착순 조건을 추가하여 당첨자를 선정합니다.</li>
                        <li>④  개인정보 오류 또는 유효기간이 지난 경품은 다시 발송해 드리지 않습니다.</li>
                        <li>⑤  경품은 업체 상황에 따라 변경될 수 있습니다.</li>
                        <li>
                            ⑥  선물 발송을 위해 개인정보(성명,휴대전화번호, 주소)가 서비스사와 <br/>
                            상품 배송업체에 제공됩니다<br/>
                            (㈜카카오 사업자등록번호 120-81-47521,<br/>
                            ㈜한진 사업자등록번호 : 201-81-02823, ㈜CJ대한통운 사업자번호 :  110-81-05034)
                        </li>
                    </ul>
                </div>
            </div>
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