import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            // Amount1 ~ Amount 6 교재 수량
            // 0 : 마감 / 1 : 신청
            eventAmount1 : 0,
            eventAmount2 : 0,
            eventAmount3 : 0,
            eventAmount4 : 0,
            eventAmount5 : 0,
            eventAmount6 : 0,
            eventBookCheckAnswer : "" // 신청한 교과서 목록
        };
        this.eventCheckAmount();
    }

    // 이벤트 수량 검사
    eventCheckAmount = async () => {
        const { event, eventId , eventAnswer} = this.props;
        event.eventId = eventId; // 이벤트 ID
        try {
            const response = await api.getClassLiveQuestionEventAmount({...event});
            // 배열로 하려고 했으나 명확하게 보기 위해 setState 작업
            // 남은 수량이 있는 경우에만 Radio Button 활성화
            if(response.data.classLiveQuestionAmountList[0] > 0){ this.setState({eventAmount1 : 1 }) }
            if(response.data.classLiveQuestionAmountList[1] > 0){ this.setState({eventAmount2 : 1 }) }
            if(response.data.classLiveQuestionAmountList[2] > 0){ this.setState({eventAmount3 : 1 }) }
            if(response.data.classLiveQuestionAmountList[3] > 0){ this.setState({eventAmount4 : 1 }) }
            if(response.data.classLiveQuestionAmountList[4] > 0){ this.setState({eventAmount5 : 1 }) }
            if(response.data.classLiveQuestionAmountList[5] > 0){ this.setState({eventAmount6 : 1 }) }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
            }, 1000);//의도적 지연.
        }
    };

    // 이벤트 신청 마감 표시


    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{
            if(this.state.eventBookCheckAnswer === ""){
                common.info("자료집을 선택해주세요.");
            }else{
                // 로그인시
                try {
                    event.eventId = eventId; // 이벤트 ID
                    const response = await api.eventInfo(eventId);
                    if(response.data.code === '3'){
                        common.error("이미 신청하셨습니다.");
                    }else if(response.data.code === '0'){
                        // 응답1 : 책
                        // { Q1 : A1 }
                        let eventAnswerArray = {};
                        eventAnswerArray.Q1 = this.state.eventBookCheckAnswer;
                        // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                        eventAnswer.eventAnswerContent = eventAnswerArray;
                        SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                        handleClick(eventId);
                    }else{
                        common.error("신청이 정상적으로 처리되지 못하였습니다.");
                    }
                } catch (e) {
                    console.log(e);
                }finally {
                    setTimeout(()=>{
                    }, 1000);//의도적 지연.
                }
            }
        }
    };

    // 이벤트 첫 신청의 경우 시작
    // 해당 책 과목 교체
    onBookChange = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventBookCheckAnswer: e.currentTarget.value
            });
        }

    };

    // 클래스 바로 가기
    onClassAliveQuestion = (e) => {
        const { logged, history, BaseActions } = this.props;
        history.push("/liveLesson/classLiveQuestion");
    };

    render (){
        return (
            <section className="event190603">
                <h1><img src="/images/events/2019/event190603/img.jpg" alt="비상교육 살아있는 수업 프로젝트 05"/></h1>
                <div className="blind">
                    <h1>질문이 살아있는 수업</h1>
                    <p>질문 기반의 수업 디자인을 연구하는 현직 선생님들의 교과별 실천 사례 자료집을 보내드립니다.</p>
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2019. 06. 03 ~ 06. 30</dd>
                    </dl>
                    <p>* 1인 1권만 신청 가능하며(6종 중 택1) 선착순 증정으로 조기 마감될 수 있습니다. </p>
                </div>

                <div className="cont_wrap">
                    <div className="cont">
                        <h2>국내 최초! 질문이 살아있는 수업 자료집이란?</h2>
                        <ul className="list">
                            <li>핵심 질문을 기반으로 ‘출발-전개-도착’ 단계별 질문을 구성해 <strong>질문 중심의 수업이 가능합니다.</strong></li>
                            <li>하브루타, 협동 학습, PBL, 토의 및 토론 등 <strong>다양한 교수·학습 모형과 활동지를 제공합니다.</strong></li>
                            <li>현장 경험이 풍부한 <strong>‘수업디자인연구소’ 선생님들의 연구 자료와 실전 경험을 담았습니다.</strong></li>
                        </ul>
                        <div className="link_wrap">
                            ‘질문이 살아있는 수업’ 과목별 PDF 자료는 <br />무료로 다운로드 받으실 수 있습니다.
                            <a onClick={this.onClassAliveQuestion} className="btn_link"><span>바로가기</span></a>
                        </div>
                    </div>

                    <div className="cont2">
                        <ul className="radio_list">
                            <li className={(this.state.eventAmount1 === 0 ? "close" : "")}>
                                <input type="radio" className="radio_circle" name="sel_book" id="lb_book1" disabled={!(this.state.eventAmount1)}
                                       value="중학교 국어"
                                       checked={this.state.eventBookCheckAnswer === "중학교 국어"}
                                       onChange={this.onBookChange}/><label
                                htmlFor="lb_book1" className={(this.state.eventAmount1 === 0 ? "close" : "")}>
                                    <span className="cover book1"><img src="/images/events/2019/event190603/book1.jpg"
                                                                alt="질문이 살아있는 수업"/></span>
                                    <span className="radio">중학교 국어</span></label>
                                    { /* 부분 렌더링 예시 */
                                        (this.state.eventAmount1 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                        <span className="lb_close"><span className="blind">신청 마감</span></span>
                                    }
                            </li>
                            <li className={(this.state.eventAmount2 === 0 ? "close" : "")}>
                                <input type="radio" className="radio_circle" name="sel_book" id="lb_book2" disabled={!(this.state.eventAmount2)}
                                       value="중학교 수학"
                                       checked={this.state.eventBookCheckAnswer === "중학교 수학"}
                                       onChange={this.onBookChange}/><label
                                    htmlFor="lb_book2" className={(this.state.eventAmount2 === 0 ? "close" : "")}>
                                    <span className="cover book2"><img src="/images/events/2019/event190603/book2.jpg"
                                                                alt="질문이 살아있는 수업"/></span>
                                    <span className="radio">중학교 수학</span></label>
                                { /* 부분 렌더링 예시 */
                                    (this.state.eventAmount2 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                    <span className="lb_close"><span className="blind">신청 마감</span></span>
                                }
                            </li>
                            <li className={(this.state.eventAmount3 === 0 ? "close" : "")}>
                                <input type="radio" className="radio_circle" name="sel_book" id="lb_book3"  disabled={!(this.state.eventAmount3)}
                                       value="중학교 사회"
                                       checked={this.state.eventBookCheckAnswer === "중학교 사회"}
                                       onChange={this.onBookChange}/><label htmlFor="lb_book3" className={(this.state.eventAmount3 === 0 ? "close" : "")}>
                                    <span className="cover book3"><img src="/images/events/2019/event190603/book3.jpg"
                                                                alt="질문이 살아있는 수업"/></span>
                                    <span className="radio">중학교 사회</span></label>
                                { /* 부분 렌더링 예시 */
                                    (this.state.eventAmount3 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                    <span className="lb_close"><span className="blind">신청 마감</span></span>
                                }
                            </li>
                            <li className={(this.state.eventAmount4 === 0 ? "close" : "")}>
                                <input type="radio" className="radio_circle" name="sel_book" id="lb_book4"  disabled={!(this.state.eventAmount4)}
                                       value="중학교 도덕"
                                       checked={this.state.eventBookCheckAnswer === "중학교 도덕"}
                                       onChange={this.onBookChange}/><label
                                    htmlFor="lb_book4" className={(this.state.eventAmount4 === 0 ? "close" : "")}>
                                    <span className="cover book4"><img src="/images/events/2019/event190603/book4.jpg"
                                                                alt="질문이 살아있는 수업"/></span>
                                    <span className="radio">중학교 도덕</span></label>
                                { /* 부분 렌더링 예시 */
                                    (this.state.eventAmount4 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                    <span className="lb_close"><span className="blind">신청 마감</span></span>
                                }
                            </li>
                            <li className={(this.state.eventAmount5 === 0 ? "close" : "")}>
                                <input type="radio" className="radio_circle" name="sel_book" id="lb_book5" disabled={!(this.state.eventAmount5)}
                                       value="중학교 과학"
                                       checked={this.state.eventBookCheckAnswer === "중학교 과학"}
                                       onChange={this.onBookChange}/><label
                                    htmlFor="lb_book5" className={(this.state.eventAmount5 === 0 ? "close" : "")}>
                                    <span className="cover book5"><img src="/images/events/2019/event190603/book5.jpg"
                                                                       alt="질문이 살아있는 수업"/></span>
                                    <span className="radio">중학교 과학</span></label>
                                { /* 부분 렌더링 예시 */
                                    (this.state.eventAmount5 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                    <span className="lb_close"><span className="blind">신청 마감</span></span>
                                }
                            </li>
                            <li className={(this.state.eventAmount6 === 0 ? "close" : "")}>
                                <input type="radio" className="radio_circle" name="sel_book" id="lb_book6"  disabled={!(this.state.eventAmount6)}
                                       value="중학교 진로와 직업"
                                       checked={this.state.eventBookCheckAnswer === "중학교 진로와 직업"}
                                       onChange={this.onBookChange}/><label
                                htmlFor="lb_book6" className={(this.state.eventAmount6 === 0 ? "close" : "")}>
                                    <span className="cover book6"><img src="/images/events/2019/event190603/book6.jpg"
                                                                   alt="질문이 살아있는 수업"/></span>
                                    <span className="radio">중학교 진로와 직업</span></label>
                                { /* 부분 렌더링 예시 */
                                    (this.state.eventAmount6 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                    <span className="lb_close"><span className="blind">신청 마감</span></span>
                                }
                            </li>
                        </ul>

                        <div className="bn">
                            <dl className="blind">
                                <dt>비상교육 살아있는 수업 프로젝트</dt>
                                <dd>변화하는 교육 환경에 맞추어 행복한 학교, 즐거운 수업을 만들어가는 열정적인 학교 선생님들과 함께 비상교육이 살아있는 수업 프로젝트를 시작합니다.
                                </dd>
                            </dl>
                        </div>

                        <div className="btn_wrap">
                            <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}><img
                                src="/images/events/2019/event190603/btn_apply.png" alt="신청하기" /></button>
                        </div>
                    </div>


                    <div className="cont3">
                        <h2>신청 시 유의사항</h2>
                        <ul className="list_num">
                            <li><strong>1인 1회, 1권만 신청 가능합니다. (6종 중 택1)</strong></li>
                            <li>수량 소진 시 조기 마감될 수 있습니다.</li>
                            <li>학교 번지수 및 수령처(ex. 교무실, 행정실, 학년 반, 경비실 등)를 정확히 기재해주세요.</li>
                            <li>신청자 개인정보(성명/주소/휴대전화번호)는 배송 업체에 공유됩니다. <br />(롯데글로벌로지스㈜ 사업자등록번호: 102-81-23012)</li>
                        </ul>
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
        event : state.saemteo.get('event').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;