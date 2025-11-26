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
            eventAmount3 : 0,
            eventAmount4 : 0,
            eventCheck1 : false,  // 공모전수상작
            eventCheck2 : false,  // 34음악수업
            eventCheck3 : false,  // 56음악수업
            eventCheck4 : false,  // 실과수업
            eventBookCheckAnswer : "" // 신청한 교과서 목록
        };
        this.eventCheckAmount();
    }

    // 이벤트 수량 검사
    eventCheckAmount = async () => {
        const { event, eventId , eventAnswer} = this.props;
        event.eventId = eventId; // 이벤트 ID
        try {
            event.eventAnswerDesc = "공모전수상작";
            event.eventType = "1"; // 수량 제한시 Type 변경
            const response = await api.eventAnswerDescCheck({...event});
            const response2 = await api.eventCheckLimitAmount({...event});
            // 해당된 eventAnswerDesc 로 수량 파악
            // 해당된 수량만큼 제한 - 20200317 DB 방식으로 변경
            if(response.data.amount < response2.data.eventTotCnt){ this.setState({eventAmount1 : 1 }) }
            // 초등 수업 끝난 후 초등 사회로 작업 시작
            try {
                event.eventAnswerDesc = "34음악수업";
                event.eventType = "2";  // 수량 제한시 Type 변경
                const response = await api.eventAnswerDescCheck({...event});
                const response2 = await api.eventCheckLimitAmount({...event});
                if(response.data.amount < response2.data.eventTotCnt){ this.setState({eventAmount2 : 1 }) }
            } catch (e) {}
            try {
                event.eventAnswerDesc = "56음악수업";
                event.eventType = "3";  // 수량 제한시 Type 변경
                const response = await api.eventAnswerDescCheck({...event});
                const response2 = await api.eventCheckLimitAmount({...event});
                if(response.data.amount < response2.data.eventTotCnt){ this.setState({eventAmount3 : 1 }) }
            } catch (e) {}
            try {
                event.eventAnswerDesc = "실과수업";
                event.eventType = "4";  // 수량 제한시 Type 변경
                const response = await api.eventAnswerDescCheck({...event});
                const response2 = await api.eventCheckLimitAmount({...event});
                if(response.data.amount < response2.data.eventTotCnt){ this.setState({eventAmount4 : 1 }) }
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
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            if(this.state.eventCheck1 == false && this.state.eventCheck2 == false && this.state.eventCheck3 == false && this.state.eventCheck4 == false
                && this.state.eventAmount1 == 0 && this.state.eventAmount2 == 0 && this.state.eventAmount3 == 0 && this.state.eventAmount4 == 0) {
                common.info("준비한 자료집이 모두 소진되어 신청이 마감되었습니다.");
            }else{
                if(this.state.eventCheck1 == false && this.state.eventCheck2 == false && this.state.eventCheck3 == false && this.state.eventCheck4 == false){
                    common.info("신청할 자료집을 선택해주세요.");
                }else{
                    // 로그인시
                    try {
                        event.eventId = eventId; // 이벤트 ID
                        const response = await api.eventInfo(eventId);
                        if(response.data.code === '3'){
                            common.error("이미 신청 하셨습니다.");
                        }else if(response.data.code === '0') {
                            this.setState({
                                eventBookCheckAnswer: ""
                            });

                            if (this.state.eventCheck1 == true){
                                this.setState({
                                    eventBookCheckAnswer: "공모전수상작"
                                });
                            }

                            if (this.state.eventCheck2 == true){
                                if (this.state.eventBookCheckAnswer != ""){
                                    this.setState({
                                        eventBookCheckAnswer: this.state.eventBookCheckAnswer + ","
                                    });
                                }
                                this.setState({
                                    eventBookCheckAnswer: this.state.eventBookCheckAnswer + "34음악수업"
                                });
                            }
                            if (this.state.eventCheck3 == true){
                                if (this.state.eventBookCheckAnswer != ""){
                                    this.setState({
                                        eventBookCheckAnswer: this.state.eventBookCheckAnswer + ","
                                    });
                                }
                                this.setState({
                                    eventBookCheckAnswer: this.state.eventBookCheckAnswer + "56음악수업"
                                });
                            }
                            if (this.state.eventCheck4 == true){
                                if (this.state.eventBookCheckAnswer != ""){
                                    this.setState({
                                        eventBookCheckAnswer: this.state.eventBookCheckAnswer + ","
                                    });
                                }
                                this.setState({
                                    eventBookCheckAnswer: this.state.eventBookCheckAnswer + "실과수업"
                                });
                            }

                            let eventAnswerArray = {};
                            eventAnswerArray.Q1 = this.state.eventBookCheckAnswer;
                            eventAnswerArray.eventCheck1 = this.state.eventCheck1;
                            eventAnswerArray.eventCheck2 = this.state.eventCheck2;
                            eventAnswerArray.eventCheck3 = this.state.eventCheck3;
                            eventAnswerArray.eventCheck4 = this.state.eventCheck4;
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
    // 공모전수상작 체크
    onBookChange1 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck1: !this.state.eventCheck1
            });
        }

    };

    // 34음악수업 교재 체크
    onBookChange2 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck2: !this.state.eventCheck2
            });
        }

    };

    // 56음악수업 교재 체크
    onBookChange3 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck3: !this.state.eventCheck3
            });
        }

    };

    // 실과수업 교재 체크
    onBookChange4 = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck4: !this.state.eventCheck4
            });
        }

    };

    render (){
        return (
            <section className="event200423">
                <h1><img src="/images/events/2020/event200423/event01_m.jpg" alt="초등 선생님을 위한 수업자료집" /></h1>
                <div className="desc-box type1">
                    <div className="list">
                        <img src="/images/events/2020/event200423/title_m.png" alt=""/>
                        <ul>
                            {
                            /*
                            <li className={(this.state.eventAmount1 === 0 ? "close" : "")}>
                                <input type="checkbox" className="radio_circle" name="sel_book" id="lb_book1" disabled={!(this.state.eventAmount1)}
                                       value="초등 수업"
                                       checked={this.state.eventCheck1}
                                       onChange={this.onBookChange1}/><label htmlFor="lb_book1" className={(this.state.eventAmount1 === 0 ? "close" : "")}>
                                <span className="cover book1"><img src="/images/events/2020/event200318/book1.png" alt="초등 수업"/></span>
                                <span className="radio">초등 수업</span></label>
                                {
                                    (this.state.eventAmount1 === 0) &&
                                    <span className="lb_close"><span className="blind">신청 마감</span></span>
                                }
                            </li>
                            */
                            }
                            <li>
                                <div className="desc type1">
                                    <img src="/images/events/2020/event200423/item01_m.png"/>
                                    <input type="checkbox" id="checkbox1" checked={this.state.eventCheck1} disabled={!(this.state.eventAmount1)} onChange={this.onBookChange1}/>
                                    <label htmlFor="checkbox1"></label>
                                    { /* 부분 렌더링 */
                                        (this.state.eventAmount1 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                        <div className="badge">
                                            <img src="/images/events/2020/event200423/badge_m.png" alt="신청 마감"/>
                                        </div>
                                    }
                                </div>
                            </li>
                            <li>
                                <div className="desc type2">
                                    <img src="/images/events/2020/event200423/item02_m.png"/>
                                    <input type="checkbox" id="checkbox2" checked={this.state.eventCheck2} disabled={!(this.state.eventAmount2)} onChange={this.onBookChange2}/>
                                    <label htmlFor="checkbox2"></label>
                                    { /* 부분 렌더링 */
                                        (this.state.eventAmount2 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                        <div className="badge">
                                            <img src="/images/events/2020/event200423/badge_m.png" alt="신청 마감"/>
                                        </div>
                                    }
                                </div>
                            </li>
                            <li>
                                <div className="desc type3">
                                    <img src="/images/events/2020/event200423/item03_m.png"/>
                                    <input type="checkbox" id="checkbox3" checked={this.state.eventCheck3} disabled={!(this.state.eventAmount3)} onChange={this.onBookChange3}/>
                                    <label htmlFor="checkbox3"></label>
                                    { /* 부분 렌더링 */
                                        (this.state.eventAmount3 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                        <div className="badge">
                                            <img src="/images/events/2020/event200423/badge_m.png" alt="신청 마감"/>
                                        </div>
                                    }
                                </div>
                            </li>
                            <li>
                                <div className="desc type4">
                                    <img src="/images/events/2020/event200423/item04_m.png" />
                                    <input type="checkbox" id="checkbox4" checked={this.state.eventCheck4} disabled={!(this.state.eventAmount4)} onChange={this.onBookChange4}/>
                                    <label htmlFor="checkbox4"></label>
                                    { /* 부분 렌더링 */
                                        (this.state.eventAmount4 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                        <div className="badge">
                                            <img src="/images/events/2020/event200423/badge_m.png" alt="신청 마감"/>
                                        </div>
                                    }
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="btn-wrap">
                        <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}><img
                            src="/images/events/2020/event200423/btn_m.png" alt="신청하기" /></button>
                    </div>
                </div>
                <img src="/images/events/2020/event200423/event02_m.jpg" alt="초등 선생님을 위한 수업자료집2" />
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