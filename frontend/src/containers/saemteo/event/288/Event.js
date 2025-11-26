import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
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
        if(response.data.eventAnswerCount < response2.data.eventTotCnt){ // 해당된 수량만큼 제한
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
                    common.error("진로 브로마이드 준비된 수량이 마감되었습니다.");
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
            <section className="event200326">
                <h1><img src="/images/events/2020/event200326/img.jpg" alt=""/></h1>
                <div className="blind">
                    <h1>2020 진로 브로마이드를 보내드립니다.</h1>
                    <p>우리 아이들이 맞이할 미래사회는 어떤 모습일까요? 9개 테마별 미래 직업을 만나보고, 학생들 스스로 미래사회 속 진로를 탐색해볼 수 있는 진로 브로마이드 2종 세트를 학교로
                        보내드립니다.</p>
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>2020년 3월 26일 ~ 4월 23일 (선착순 마감)</dd>
                    </dl>
                </div>
                <div className="btn_wrap">
                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}><img
                        src="/images/events/2020/event200326/btn_apply.png" alt="신청하기"/></button>
                </div>
                <div className="cont">
                    <h2 className="blind">진로 브로마이드 2종 세트</h2>
                    <img src="/images/events/2020/event200326/img2.jpg" alt="테마별 미래 직업을 소개합니다."/>
                    <p className="blind">한국직업능력개발원에서 분석한 미래 사회를 기준으로 9가지 테마별 미래 직업을 살펴봅니다.</p>
                    <img src="/images/events/2020/event200326/img3.jpg" alt="내가 갖고 싶은 미래 직업은?"/>
                    <p className="blind">학생들이 선호하는 미래 직업을 적어보고 새로운 직업을 상상해볼 수 있습니다.</p>
                </div>
                <div className="cont2">
                    <ul>
                        <li><strong>1인 1회, 1세트</strong>까지 신청 가능합니다. (추가 수량 문의 : 02-6970-5753)</li>
                        <li><strong>선착순 신청</strong>으로, 수량 소진 시 조기 마감될 수 있습니다. (<strong>3월 30일</strong>부터 순차 배송)</li>
                        <li>정확한 주소를 기입해주세요.<br />(학교 번지수, 수령처 포함 : ex.교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</li>
                        <li>주소 기재가 잘못되어 반송된 브로마이드는 다시 발송해드리지 않습니다.</li>
                        <li>신청자 개인정보(성명/주소/휴대전화번호)는 배송업체에 공유됩니다. <br />(㈜한진 사업자등록번호 : 201-81-02823)</li>
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
