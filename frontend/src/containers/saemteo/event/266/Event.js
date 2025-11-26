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
        let response = await SaemteoActions.checkEventTotalJoin({...event});
        if(response.data.eventAnswerCount < 2000){ // 해당된 수량만큼 제한
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
                    common.error("준비된 배치표 수량이 모두 마감되었습니다.");
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
            <section className="event191118">
                <h1><img src="images/events/2019/event191118/reopen/img.jpg" alt="2020학년도 비상교육 정시 모집 배치표를 보내드립니다." /></h1>
                <div className="blind">
                    <p>빠르고 정확한 2020학년도 정시 진학 상담 지원을 위해 비상모의고사 입시 전문가와 고등 진학 담당교사들이 함께 제작한 2020학년도 비상교육 정시 모집 배치표를 학교로 보내드립니다. </p>
                    <dl>
                        <dt>신청 기간</dt>
                        <dd>신청 기간  :  ~ 2019.12.22(일)</dd>
                    </dl>
                    <p>1인 1회(1세트)만 신청 가능하며, 이벤트 기간 중 수량이 조기 소진될 수 있습니다.</p>
                </div>

                <div className="cont">
                    <img src="/images/events/2019/event191118/reopen/img2.jpg" alt="정시 모집 배치표 구성"/>
                     <div className="blind">
                        <dl>
                            <dt>가채점 배치표 (선착순 1,000부)</dt>
                            <dd>가채점 배치표 마감</dd>
                            <dt>실채점 배치표 (선착순 1,000부)</dt>
                            <dd>
                                구성 : 인문 (가군, 나군, 다군) 1매 / 자연 (가군, 나군, 다군) 1매
                                발송 : 12월 중순부터 순차 발송
                            </dd>
                        </dl>
                        <ul>
                            <li>※ 11월 30일까지 신청하신 선생님께는 가채점 / 실채점 배치표 모두 보내드립니다.</li>
                            <li>※ 12월 1일부터 신청하신 선생님께는 실채점 배치표만 보내드립니다.</li>
                        </ul>
                    </div>

                    <div className="btn_wrap">
                        <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}>신청하기</button>
                    </div>
                </div>
                <div className="cont2">
                    <ul>
                        <li><strong>1인 1회만 신청</strong> 가능하며, 이벤트 기간 중 수량이 조기 소진될 수 있습니다.</li>
                        <li>정확하지 않은 주소로 인해 반송된 물품은 재 발송하지 않습니다.<br />번지수와 상세 주소를 꼼꼼히 확인해 주세요.</li>
                        <li>배치표 발송을 위한 개인정보(성명/주소/휴대전화번호)는 서비스 업체에 공유됩니다.<br />(우체국 – 사업자등록번호 : 206-83-02050)</li>
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
