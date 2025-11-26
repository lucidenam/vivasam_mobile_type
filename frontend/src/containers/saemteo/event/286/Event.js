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
            // Amount1 ~ Amount2 교재 수량
            // 0 : 마감 / 1 : 신청
            eventAmount1 : 0,
            eventAmount2 : 0,
            eventCheck1 : false,  // 초등 수업 체크
            eventCheck2 : false,  // 초등 사회 체크
            eventBookCheckAnswer : "" // 신청한 교과서 목록
        };
        this.eventCheckAmount();
    }

    // 이벤트 수량 검사
    eventCheckAmount = async () => {
        const { event, eventId , eventAnswer} = this.props;
        event.eventId = eventId; // 이벤트 ID
        try {
            event.eventAnswerDesc = "초등 수업";
            event.eventType = "1"; // 수량 제한시 Type 변경
            const response = await api.eventAnswerDescCheck({...event});
            const response2 = await api.eventCheckLimitAmount({...event});
            // 해당된 eventAnswerDesc 로 수량 파악
            // 해당된 수량만큼 제한 - 20200317 DB 방식으로 변경
            if(response.data.amount < response2.data.eventTotCnt){ this.setState({eventAmount1 : 1 }) }
            // 초등 수업 끝난 후 초등 사회로 작업 시작
                try {
                    event.eventAnswerDesc = "초등 사회";
                    event.eventType = "2";  // 수량 제한시 Type 변경
                    const response = await api.eventAnswerDescCheck({...event});
                    const response2 = await api.eventCheckLimitAmount({...event});
                    if(response.data.amount < response2.data.eventTotCnt){ this.setState({eventAmount2 : 1 }) }
                } catch (e) {}
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
            if(this.state.eventCheck1 == false && this.state.eventCheck2 == false && this.state.eventAmount1 == 0 && this.state.eventAmount2 == 0) {
                common.info("준비한 자료집이 모두 소진되어 신청이 마감되었습니다.");
            }else{
                if(this.state.eventCheck1 == false && this.state.eventCheck2 == false){
                    common.info("자료집을 선택해주세요.");
                }else{
                    // 로그인시
                    try {
                        event.eventId = eventId; // 이벤트 ID
                        const response = await api.eventInfo(eventId);
                        if(response.data.code === '3'){
                            common.error("이미 신청하셨습니다.");
                        }else if(response.data.code === '0'){

                            if(this.state.eventCheck1 == true && this.state.eventCheck2 == true){
                                this.setState({
                                    eventBookCheckAnswer: "초등 수업,초등 사회"
                                });
                            }else if(this.state.eventCheck1 == true){
                                this.setState({
                                    eventBookCheckAnswer: "초등 수업"
                                });
                            }else if(this.state.eventCheck2 == true){
                                this.setState({
                                    eventBookCheckAnswer: "초등 사회"
                                });
                            }

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
        }
    };

    // 이벤트 첫 신청의 경우 시작
    // 초등 수업 교재 체크
    onBookChange1 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck1: !this.state.eventCheck1
            });
        }

    };

    // 초등 사회 교재 체크
        onBookChange2 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck2: !this.state.eventCheck2
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
            <section className="event200318">
                <h1><img src="/images/events/2020/event200318/img.jpg" alt="질문이 살아있는 수업 초등편"/></h1>
                <div className="blind">
                    <h1>질문이 살아있는 수업 초등편</h1>
                    <p>질문 기반의 수업 디자인을 연구하는 현직 선생님들의 교과별 실천 사례 자료집을 보내드립니다.</p>
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2020.03.18 ~ 03.31</dd>
                    </dl>
                    <p>* 2권 모두 신청 가능하며, 선착순 증정으로 조기 마감될 수 있습니다.</p>
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
                            ‘질문이 살아있는 수업’ 과목별 PDF 자료는 무료로 다운로드 받으실 수 있습니다.
                            <a onClick={this.onClassAliveQuestion} className="btn_link"><span>바로가기</span></a>
                        </div>
                    </div>

                    <div className="cont2">
                        <ul className="radio_list">
                            <li className={(this.state.eventAmount1 === 0 ? "close" : "")}>
                                <input type="checkbox" className="radio_circle" name="sel_book" id="lb_book1" disabled={!(this.state.eventAmount1)}
                                       value="초등 수업"
                                       checked={this.state.eventCheck1}
                                       onChange={this.onBookChange1}/><label htmlFor="lb_book1" className={(this.state.eventAmount1 === 0 ? "close" : "")}>
                                    <span className="cover book1"><img src="/images/events/2020/event200318/book1.png" alt="초등 수업"/></span>
                                    <span className="radio">초등 수업</span></label>
                                    { /* 부분 렌더링 예시 */
                                        (this.state.eventAmount1 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                        <span className="lb_close"><span className="blind">신청 마감</span></span>
                                    }
                            </li>
                            <li className={(this.state.eventAmount2 === 0 ? "close" : "")}>
                                <input type="checkbox" className="radio_circle" name="sel_book" id="lb_book2"  disabled={!(this.state.eventAmount2)}
                                       value="초등 사회"
                                       checked={this.state.eventCheck2}
                                       onChange={this.onBookChange2}/><label htmlFor="lb_book2" className={(this.state.eventAmount2 === 0 ? "close" : "")}>
                                    <span className="cover book2"><img src="/images/events/2020/event200318/book2.png" alt="초등 사회"/></span>
                                    <span className="radio">초등 사회</span></label>
                                { /* 부분 렌더링 예시 */
                                    (this.state.eventAmount2 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                    <span className="lb_close"><span className="blind">신청 마감</span></span>
                                }
                            </li>
                        </ul>

                        <div className="btn_wrap">
                            <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}><img
                                src="/images/events/2020/event200318/btn_apply.png" alt="신청하기" /></button>
                        </div>
                    </div>


                    <div className="cont3">
                        <h2>신청 시 유의사항</h2>
                        <ul className="list_num">
                            <li><strong>1인 1회, 2권 모두 신청 가능합니다.</strong></li>
                            <li>수량 소진 시 조기 마감될 수 있습니다.</li>
                            <li>학교 번지수 및 수령처(ex. 교무실, 행정실, 학년 반, 경비실 등)를 정확히 기재해주세요. <a onClick="">[개인정보 확인]</a></li>
                            <li>신청자 개인정보(성명/주소/휴대전화번호)는 배송 업체에 공유됩니다.<br />(㈜한진 사업자등록번호 : 201-81-02823)</li>
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