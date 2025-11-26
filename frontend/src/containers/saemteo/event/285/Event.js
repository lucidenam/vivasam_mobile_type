import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
           eventApplyCheck : 0 // 0 : 신청 불가능 / 1 : 신청 가능
        };
        this.eventCheckAmount();
    }

    // 이벤트 수량 검사 ( 이벤트 수량 마감시 작업 불가능 )
    eventCheckAmount = async() => {
        const { event, eventId, SaemteoActions } = this.props;
        event.eventId = eventId; // 이벤트 ID
        event.eventType = "1"; // 수량 제한시 Type 변경
        let response = await SaemteoActions.checkEventTotalJoin({...event});
        let response2 = await api.eventCheckLimitAmount({...event});
        if(response.data.eventAnswerCount < response2.data.eventTotCnt){ // 해당된 수량만큼 제한 - 20200317 DB 방식으로 변경
            this.setState({
                eventApplyCheck : 1
            });
        }
    };


    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            try {
                this.eventCheckAmount();
                if(this.state.eventApplyCheck === 0){
                    common.error("준비한 선물의 수량이 모두 마감되었습니다.");
                }else{
                    event.eventId = eventId; // 이벤트 ID
                    const response = await api.eventInfo(eventId);
                    if(response.data.code === '3'){
                        common.error("이미 신청하셨습니다.");
                    }else if(response.data.code === '0'){
                        handleClick(eventId);
                    }else{
                        common.error("신청이 정상적으로 처리되지 못하였습니다.");
                    }
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    render () {
        return (
			<section className="event200303">
                <h1 className="blind">2020 벽걸이 달력을 보내드립니다.</h1>
                <img src="images/events/2020/event200303/img.jpg" alt="2020 벽걸이 달력을 보내드립니다."/>
                <div className="blind">
                    <p>선생님의 다채로운 수업을 돕기 위해 비바샘이 드리는 선물! 2020년 최신 계기 이슈를 꼼꼼하게 담은 벽걸이 달력을 보내드립니다.</p>
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2020년 3월 24일 ~ 4월 29일(선착순 마감)</dd>
                    </dl>

                    <h2>2020 벽걸이 달력</h2>
                    <ul>
                        <li>학생들이 선호하는 재미있는 일러스트로 매월의 테마를 소개합니다.</li>
                        <li>주요 기념일, 사건&middot;사고, 위인의 출생 등 학교 수업에 활용할 수 있는 최신 계기 이슈를 수록하였습니다.</li>
                        <li>가독성이 높은 대형 사이즈로 제작되어 수업 활용도가 높습니다.</li>
                    </ul>
                </div>

                <div className="btn_wrap">
                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}><img src="images/events/2020/event200303/btn_apply.png" alt="신청하기" /></button>
                </div>

                <div className="blind">
                    <ul>
                        <li>벽걸이 달력은 1인 1개 신청 가능하며, 3월 10일부터 순차 발송됩니다.</li>
                        <li>정확하지 않은 주소로 인해 반송된 물품은 재 발송하지 않습니다.</li>
                        <li>번지수와 상세 주소를 꼼꼼히 확인해 주세요.</li>
                        <li>달력 발송을 위한 개인정보(성명/주소/휴대전화번호)는 배송업체에 공유됩니다. (㈜한진 사업자등록번호 : 201-81-02823)</li>
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
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
