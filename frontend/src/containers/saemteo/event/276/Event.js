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
    }

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청하셨습니다.");
                }else if(response.data.code === '0'){
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

    render () {
        return (
            <section className="event191217">
                <div className="cont">
                    <h1><img src="/images/events/2019/event191217/img.jpg" alt="비상교육 초등 검정 교과서 검토진 모집"/></h1>
                    <div className="blind">
                        <p>2022학년도부터 초등학교 3~4학년군 수학, 사회, 과학 교과도 검정 교과서를 사용하게 됩니다. 비상교육은 교육과정의 구현, 학교 현장의 사용성, 학생의 눈높이를
                            고려하여 배움이 즐거운 초등학교 교과서를 개발하고자 선생님의 의견을 듣고자 합니다. 비상교육 초등 검정 교과서 검토회를 아래와 같이 개최하오니 비바샘 선생님들의 많은
                            지원을 부탁 드립니다.</p>
                        <dl>
                            <dt>모집기간</dt>
                            <dd>2019.12.17(화) ~ 2019.12.31(화)</dd>
                            <dt>검토진 발표</dt>
                            <dd>2020.01.03(금)</dd>
                        </dl>
                        <p>검토진에 선정되신 선생님들께 개별 연락을 드립니다.</p>
                    </div>
                </div>
                <div className="cont2">
                    <img src="images/events/2019/event191217/img2.jpg" alt="비상교육 초등 교과서 검토회 안내"/>
                    <div className="blind">
                        <dl>
                            <dt>일시</dt>
                            <dd>2020.01.18(토) 1차 (09:50~13:00), 2차 (14:50~18:00) 중 1회 참여</dd>
                            <dt>장소</dt>
                            <dd>비상교육 본사 20층</dd>
                            <dt>구성</dt>
                            <dd>현재 학교에서 근무 중인 전국 초등학교 선생님</dd>
                            <dt>교과서 검토 내용</dt>
                            <dd>내용 위계의 체계와 연계성</dd>
                            <dd>디자인 요소의 적절성</dd>
                            <dd>현 국정 도서에 비교해 개선 및 보완점</dd>
                            <dd>교수학습자료 검토 및 제안</dd>
                        </dl>
                        <h2>지원 자격 및 유의 사항</h2>
                        <ul>
                            <li>타교과서의 원고 집필에 참여하고 계신 선생님은 지원하실 수 없습니다.</li>
                            <li>대리 참석은 불가능하며, 선정되지 않은 선생님은 동행하실 수 없습니다.</li>
                            <li>검토회와 관련된 세부 사항은 최종 검토진으로 선정되신 선생님께 개별 안내 드립니다. (2020년 1월 3일부터 순차 연락 예정)</li>
                            <li>본 검토회에 참여하시는 선생님께 소정의 검토료를 지급합니다.</li>
                        </ul>
                    </div>
					<div className="btn_wrap">
                        <button type="button" id="eApply" onClick={this.eventApply}><img src="/images/events/2019/event191217/btn_apply.png" alt="검토진 지원하기" /></button>
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
