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
            <section className="event200214">
                <div className="cont">
                    <h1><img src="/images/events/2020/event200214/img.jpg" alt="비바샘 모니터링단 7기 모집" /></h1>
                    <div className="blind">
                        <p>비바샘과 함께 교육 현장의 다양한 이슈를 소통하고 현장 맞춤형 수업 자료 개발을 해주실 열정적인 선생님을 기다립니다.</p>
                        <dl>
                            <dt>참여 대상</dt>
                            <dd>비바샘 초/중/고 선생님</dd>
                            <dt>모집 기간</dt>
                            <dd>2월 14일 ~ 3월 8일</dd>
                            <dt>최종 발표</dt>
                            <dd>3월 16일 / 비바샘 공지사항</dd>
                            <dt>선발 인원</dt>
                            <dd>150명</dd>
                            <dt>활동 기간</dt>
                            <dd>2020년 4월 ~ 11월 (8개월)</dd>
                            <dt>모집 분야</dt>
                            <dd>초등 교과 : 수학, 사회, 과학 중 택 1</dd>
                            <dd>중·고등 교과 : 전과목</dd>
                            <dd>비교과 콘텐츠 : 수업 혁신, 진로/진학, 체험활동</dd>
                        </dl>
                    </div>
                </div>
                <div className="cont2">
                    <img src="images/events/2020/event200214/img2.jpg" alt="활동 안내 &amp; 활동 혜택" />
                    <div className="blind">
                        <h2>01. 모니터링단은 어떤 활동을 하나요?</h2>
                        모니터링단 선생님의 의견과 제안은 비바샘 수업 자료 개발과 서비스 구성에 적극적으로 활용됩니다.
                        <ul>
                            <li>① 학교 현장 및 교육 이슈 분석 <p>학교 현장, 수업 환경, 교육 정책과 관련된 시기별 이슈를 함께 분석합니다.</p></li>
                            <li>② 수업 지원 자료 제안 및 검토 <p>과목별 신규 수업 자료를 검토하고 학교 현장에 필요한 수업 자료를 제안합니다.</p></li>
                            <li>③ 비교과 채널 자료 제안 및 검토 <p>수업 혁신, 체험활동과 관련된 신규 자료를 검토하고, 학교 현장에 필요한 자료를 제안합니다.</p></li>
                            <li>④ 비바샘 사이트 및 서비스 모니터링 <p>비비바샘 사이트에서 제공하는 다양한 서비스에 대한 의견을 전달합니다.</p></li>
                            <li>⑤ 스페셜 미션 <p>모니터링단 선생님과의 즐거운 소통을 위해 시즌별로 스페셜 미션이 주어집니다.</p></li>
                        </ul>
                    </div>
                </div>

                <div className="cont3">
                    <img src="/images/events/2020/event200214/img3.jpg" alt="모니터링단 후기" />
                    <div className="blind">
                        <p>지금까지 총 695분의 선생님이 비바샘 모니터링단으로 함께 해주셨습니다.</p>
                        <ul>
                            <li>교과서를 재구성할 수 있어서 좋았고, 모니터링단 덕분에 다양한 자료를 이용하여 수업을 진행할 수 있었습니다. “수업을 어떻게 하면 더 알차게 할까?”를
                                생각해 보는 값진 한 해였습니다. -[중등 영어] 오*래 선생님
                            </li>
                            <li>모니터링단을 통해 진로 교육 콘텐츠를 분석해볼 수 있었으며, 진로 전담 교사로서 진로 교육에 대한 책임감과 진로의 중요성을 알 수 있었습니다. 비바샘의
                                좋은 교육 자료들도 유용했습니다. -[중등 진로와 직업] 이*창현 선생님
                            </li>
                            <li>여러 지역의 선생님들과 함께 교감하고 정보를 나눌 수 있는 자리를 마련해주셔서 좋았습니다. 앞으로 이런 시간을 더 늘려나가면 좋겠습니다. -[고등
                                과학] 최*승 선생님
                            </li>
                            <li>매달 지도 계획을 세워 성취 기준에 도달하는 데 도움을 받았으며, 모니터링단 활동을 수업 성찰의 기회로 삼았습니다. -[중등 국어] 안*기 선생님
                            </li>
                            <li>수학과 모임을 통해 수학 교육의 실태를 알아볼 수 있었고, 이를 토대로 다음 해 수업, 평가를 구성해보고자 합니다. 내년에도 비바샘 모니터링단에 함께
                                하고 싶습니다. -[고등 수학] 유*영 선생님
                            </li>
                        </ul>
                    </div>

                    <div className="btn_wrap">
                        <button type="button" id="eApply" onClick={this.eventApply}><img src="/images/events/2020/event200214/btn_apply.png" alt="지원하기" /></button>
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
