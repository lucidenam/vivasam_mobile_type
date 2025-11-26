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
        if(response.data.eventAnswerCount < 2300){ // 해당된 수량만큼 제한
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
                    common.error("준비한 선물이 모두 소진되어 신청이 마감되었습니다.");
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
			<section className="event191128">
				<h1><img src="/images/events/2019/event191128/img.jpg" alt="비바샘과 함께 미리 준비하는 2020 플래너 선물" /></h1>
				<div className="blind">
					<p>한 걸음 더 먼저 계획하는 2020년 비바샘이 준비한 2가지 연말 선물로 선생님의 알찬 수업을 지원합니다.</p>
					<dl>
						<dt>신청기간</dt>
						<dd>2019년 11월 20일 ~ 12월 15일</dd>
					</dl>
					<p>★ 11월 27일부터 발송되며, 수량 소진 시 조기 마감됩니다.</p>
				</div>
				<div className="cont">
					<img src="images/events/2019/event191128/img2.jpg" alt="" />
					<div className="blind">
						<dl>
							<dt>2020 교사용 플래너</dt>
							<dd>
								<ul>
									<li>* 월/주 단위로 세워보는 나의 일정 관리</li>
									<li>* 학교 현장에 맞춘 테마별 체험활동 자료</li>
								</ul>
							</dd>
						</dl>
						<dl>
							<dt>2020 캘린더</dt>
							<dd>
								<ul>
									<li>* 비상 로고로 함께 만나보는 열 두달 꿈 이야기</li>
									<li>* 주요 일정 체크를 위한 마킹 스티커 수록</li>
								</ul>
							</dd>
						</dl>
					</div>
					<div className="btn_wrap">
                        <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}>신청하기</button>
                    </div>
				</div>
				<div className="info">
					<h2>유의사항</h2>
					<ul>
						<li>1인 1회 신청 가능하며, 11월 27일부터 순차 배송됩니다.</li>
						<li>정확하지 않은 주소로 인해 반송된 물품은 재발송되지 않습니다. 주소를 꼭 확인해주세요.</li>
						<li>선물 발송에 필요한 정보는 서비스 업체에 공유됩니다.<br />(성명,주소.휴대전화번호 등 / ㈜한진 – 사업자등록번호 : 201-81-02823)</li>
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
