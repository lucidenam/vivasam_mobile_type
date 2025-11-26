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
        let response = await SaemteoActions.chkEventJoinQntCnt({...event});
        let response2 = await api.eventCheckLimitAmount({...event});
        if(response.data.qntCnt < response2.data.eventTotCnt){ // 해당된 수량만큼 제한
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
                    common.error("초등 브로마이드 준비된 수량이 마감되었습니다.");
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
            <section className="event200331">
                <div className="cont">
                    <h1><img src="images/events/2020/event200331/img.jpg" alt="학생들의 자기 주도 학습을 돕는 2020 스터디 플래너"/></h1>
                    <div className="blind">
                        <h1>학생들의 자기 주도 학습을 돕는 2020 스터디 플래너</h1>
                        <p>효율적인 학습 일정 관리와 다양한 진로 탐색 활동을 학생 스스로 채워갈 수 있는 스터디 플래너를 학교로 보내드립니다.</p>
                        <dl>
                            <dt>신청 기간</dt>
                            <dd>2020년 3월 31일 ~ 4월 12일 (선착순 마감)</dd>
                        </dl>
                        <ul>
                            <li>1인 30권 제한</li>
                            <li>학교 주소로만 발송 가능</li>
                            <li>4월 1일부터 순차 발송</li>
                        </ul>
                    </div>
                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}><img
                        src="/images/events/2020/event200331/btn_apply.png" alt="신청하기"/></button>
                </div>

                <div className="cont">
                    <img src="/images/events/2020/event200331/img2.jpg" alt="2020 스터디 플래너 미리보기"/>
                    <div className="blind">
                        <ul>
                            <li>지금의 나를 기록하기</li>
                            <li>월간 / 주간 공부 계획 스스로 체크하기</li>
                            <li>유형별 대표 직업 찾아보기</li>
                            <li>진로 독서 목록 채워보기</li>
                            <li>스티커로 스스로 진도 체크하기</li>
                        </ul>
                    </div>
                </div>

                <div className="cont_info">
                    <img src="/images/events/2020/event200331/img3.jpg" alt="신청 시 유의사항"/>
                    <div className="blind">
                        <ul>
                            <li>1인 최대 30권까지 신청 가능하며, 수령 소진 시 조기 마감될 수 있습니다. (4월 1일부터 순차 발송)</li>
                            <li>학교 번지수 및 수령처를 정확히 기입해주세요. (ex.교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</li>
                            <li>주소 기재가 잘못되어 반송된 스터디 플래너는 다시 발송해드리지 않습니다.</li>
                            <li>신청자의 개인정보(이름/주소/전화번호)는 배송 업체에 공유됩니다. (㈜한진 사업자등록번호 : 201-81-02823)</li>
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
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
