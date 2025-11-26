import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {Link, withRouter} from "react-router-dom";
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
            <section className="event190717">
                <h1><img src="/images/events/2019/event190717/img.jpg" alt="재우쌤의 창의여행 자료집을 보내드립니다."/></h1>
                <div className="blind">
                    <h1>재우쌤의 창의여행 자료집을 보내드립니다.</h1>
                    <p>체험활동 전문가 김재우 선생님이 엄선한 창의 융합 여행 코스들을 담은 자료집을 학교로 보내드립니다.</p>
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2019. 07. 24 ~ 08. 04</dd>
                    </dl>
                    <p>※ 1인 1권만 신청 가능하며 선착순 증정으로 조기 마감될 수 있습니다.</p>

                    <ul className="blind">
                        <li>우리 주변의 특색 있는 장소들을 테마별로 묶어 창의 여행 코스로 제공합니다.</li>
                        <li>예상 이동 시간, 요금 정보, 여행지별 정보 등 여행에 필요한 최신 정보를 안내합니다.</li>
                        <li>주제별 활동지, 참고 이미지, 선생님용 체크리스트와 같은 풍성한 활동 자료를 제공합니다.</li>
                        <li>모든 여행코스마다 재우쌤의 체험활동 지도팁을 꼼꼼하게 공유합니다.</li>
                    </ul>
                </div>

                <div className="btn_wrap">
                    <button type="button" id="eApply" onClick={this.eventApply}><img
                        src="/images/events/2019/event190717/btn_apply.png" alt="신청하기" /></button>
                </div>

                <ul className="blind">
                    <li><strong>1인 1회, 1권만 신청 가능합니다. (6종 중 택1)</strong></li>
                    <li>수량 소진 시 조기 마감될 수 있습니다.</li>
                    <li>학교 번지수 및 수령처(ex. 교무실, 행정실, 학년 반, 경비실 등)를 정확히 기재해주세요.</li>
                    <li>신청자 개인정보(성명/주소/휴대전화번호)는 배송 업체에 공유됩니다. <br />(롯데글로벌로지스㈜ 사업자등록번호: 102-81-23012)</li>
                </ul>
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