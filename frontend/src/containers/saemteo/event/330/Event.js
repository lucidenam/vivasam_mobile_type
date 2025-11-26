import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component {
    /**
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isEventApply : false
        };
    }

    componentDidMount = async() => {
        const { BaseActions } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

    };

    eventApplyCheck = async() => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
        if(logged){
            event.eventId = eventId; // 이벤트 ID
            const response = await api.eventInfo(eventId);
            if(response.data.code === '3'){
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, eventId, handleClick, loginInfo} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 지원해 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다.");
                }else{
                    handleClick(eventId);
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    render() {
        return (
            <div>
                <section className="event210209">
                    <div className="evtCont01">
                        <h1><img src="/images/events/2021/event210209/img01.jpg" alt="선생님과 함께 만들어가는 비바샘 비바샘 모니터링단 8기 모집" /></h1>
                        <div className="blind">
                            <p>비바샘과 함께 교육 현장의 다양한 이슈를 소통하고 현장 맞춤형 수업 자료 개발을 해주실 열정적인 선생님을 기다립니다.</p>
                            <ul>
                                <li>참여 대상: 비바샘 초/중/고 선생님</li>
                                <li>모집 기간: 2월 9일(화) ~ 3월 5일(금)</li>
                                <li>최종 발표: 3월 16일(화) / 비바샘 공지사항</li>
                            </ul>
                        </div>
                    </div>
                    <div className="evtCont02">
                        <h2><img src="/images/events/2021/event210209/img02.jpg" alt="비바샘 모니터링단 8기 모집 내용" /></h2>
                        <div className="blind">
                            <ul>
                                <li>선발 인원: 170명</li>
                                <li>활동 기간: 2021년 4월 ~ 11월 (8개월)</li>
                            </ul>
                            <strong>모집 분야</strong>
                            <ul>
                                <li>초등 교과: 국어, 수학, 사회, 과학 중 택1</li>
                                <li>중·고등 교과: 전과목</li>
                                <li>비교과 콘텐츠: 수업 혁신, 진로/진학, 체험활동</li>
                            </ul>
                            <span>초·중·고 교과와 비교과 콘텐츠를 중복 지원할 수 있습니다.</span>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">지원하기</span></button>
                        </div>
                    </div>
                    <div className="evtCont03">
                        <div className="imgWrap"><img src="/images/events/2021/event210209/img03.jpg" alt="" /></div>
                        <div className="blind">
                            <h2>1. 어떤 활동을 하나요?</h2>
                            <p>모니터링단 선생님의 의견과 제안은 비바샘 서비스 구성과 수업 자료 개발에 적극적으로 활용됩니다.</p>
                            <ul>
                                <li>
                                    <strong>① 학교 현장 및 교육 이슈 분석</strong>
                                    <p>학교 현장, 수업 환경, 교육 정책과 관련된 시기별 이슈를 함께 분석합니다.</p>
                                </li>
                                <li>
                                    <strong>② 수업 지원 자료 제안 및 검토</strong>
                                    <p>과목별 신규 수업 자료를 검토하고 학교 현장에 필요한 수업 자료를 제안합니다.</p>
                                </li>
                                <li>
                                    <strong>③ 비교과 채널 자료 제안 및 검토</strong>
                                    <p>수업 혁신, 체험활동과 관련된 신규 자료를 검토하고, 학교 현장에 필요한 자료를 제안합니다.</p>
                                </li>
                                <li>
                                    <strong>④ 비바샘 사이트 및 서비스 모니터링</strong>
                                    <p>비바샘 사이트에서 제공하는 다양한 서비스에 대한 의견을 전달합니다.</p>
                                </li>
                                <li>
                                    <strong>⑤ 스페셜 미션</strong>
                                    <p>모니터링단 선생님과의 즐거운 소통을 위해 시즌별로 스페셜 미션이 주어집니다.</p>
                                </li>
                            </ul>
                            <h2>1. 활동 혜택은 무엇인가요?</h2>
                            <ul>
                                <li>모니터링단 활동비 지원</li>
                                <li>밀리언셀러 비상교재 지원</li>
                                <li>교사 문화 행사 초대</li>
                                <li>모니터링단 커뮤니티</li>
                                <li>모니터링단 8기 위촉장 발급</li>
                            </ul>
                        </div>
                    </div>
                    <div className="evtCont04">
                        <div className="imgWrap"><img src="/images/events/2021/event210209/img04.jpg" alt="지금까지 총 845분의 모니터링단 선생님이 비바샘과 함께 해주셨습니다." /></div>
                        <div className="blind">
                            <ul>
                                <li>
                                    <p>일년 동안 활동을 하면서 수업을 조금은 더 자극 받으며 재미있게, 그리고 매달 스페셜 미션을 통해 생각의 시간도 가져보면서 지낼 수 있었습니다. 좋은 시간이었습니다.</p>
                                    <span>[고등 국어 박*영 선생님]</span>
                                </li>
                                <li>
                                    <p>모니터링단을 하며 해당 과목 수업을 고민하고 실천하면서 자기 성장이 이뤄졌다고 생각합니다. 모둠 활동을 자유롭게 할 수 없는 상황에서 학생들의 배움을 위해 어떻게 해야 할까를 함께 고민해보고 싶습니다.</p>
                                    <span>[초등 김*애 선생님]</span>
                                </li>
                                <li>
                                    <p>모니터링단 활동을 통해 교사로서 더욱 발전하고 싶다는 생각을 항상 가지게 됩니다. 수업 준비부터 자료 제작, 다양한 활동에 대한 링크 등을 정리하면서 수업도 되돌아보고 또는 수업을 설계하기도 합니다.</p>
                                    <span>[고등 수학 백*희 선생님]</span>
                                </li>
                                <li>
                                    <p>모니터링단을 하며 다른 지역 선생님들과 소통한 것이 너무 좋았습니다. 또한 선생님들의 아이디어가 무궁무진하다는 것을 배우고 저 또한 학교 생활을 하며 학생들에게 더욱 많은 도움을 주고 싶습니다.</p>
                                    <span>[고등 수학 차*경 선생님]</span>
                                </li>
                                <li>
                                    <p>1년 동안 비바샘 모니터링단을 하면서 매달 올라오는 스페셜 미션도 즐겁게 참여하였네요. 교사 생활을 하면서 활력소가 된 것 같습니다. 내년에도 기회가 되면 꼭 참여하고 싶네요.</p>
                                    <span>[중등 과학 이*혜 선생님]</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));