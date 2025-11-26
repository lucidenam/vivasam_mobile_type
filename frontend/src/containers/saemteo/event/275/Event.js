import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as popupActions from 'store/modules/popup';
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    reApplyClick = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{
            history.push("/myInfo");
        }
    };



    render () {
        const { handleClick } = this.props;

        return (
            <section className="event191209">
                <div className="cont">
                    <h1><img src="/images/events/2019/event191209/img.jpg" alt="제4회 비상교육 창의 융합 수업 자료 공모전"/></h1>
                    <div className="blind">
                        <p>2019년 한 해 동안 학교 현장에서 선생님이 직접 만들고 활용하셨던 창의 융합 수업 자료를 기다립니다.</p>
                        <dl>
                            <dt>공모 기간</dt>
                            <dd>2019. 12. 09 (월) ~ 2020. 01. 31 (금)</dd>
                            <dt>수상 발표</dt>
                            <dd>2020. 02. 19 (수)</dd>
                        </dl>
                    </div>
                </div>

                <div className="cont2">
                    <img src="/images/events/2019/event191209/img2.jpg" alt="공모 내용" />
                    <div className="blind">
                        <dl>
                            <dt>공모주제</dt>
                            <dd>학교 현장에서 활용 가능한 창의 융합 수업 자료</dd>
                            <dt>출품내용</dt>
                            <dd>초·중·고 학교에서 실제 활용된 비상교과서 수업 자료</dd>
                            <dd>2차시 이상의 수업이 가능한 자료</dd>
                            <dt>출품 방법</dt>
                            <dd>비바샘 PC 웹 페이지에서 ‘수업 계획안 양식’을 다운로드 후 수업 계획안 + 수업 자료를 등록해 주세요.</dd>
                        </dl>
                    </div>
                </div>

                <div className="cont3">
                    <img src="/images/events/2019/event191209/img3.jpg" alt="수상 내역" />
                    <div className="blind">
                        <dl>
                            <dt>대상</dt>
                            <dd>200만원 상금 + 상패(1명)</dd>
                            <dt>최우수상</dt>
                            <dd>50만원 상금 + 상패 (10명)</dd>
                            <dt>우수상</dt>
                            <dd>30만원 상금 + 상장 (30명)</dd>
                            <dt>참여상</dt>
                            <dd>신세계 상품권 5만원권 (50명)</dd>
                        </dl>
                    </div>
                </div>

                <div className="cont4">
                    <img src="images/events/2019/event191209/img4.jpg" alt="심사 기준" />
                    <div className="blind">
                        <ul>
                            <li>학생 중심의 활동 수업이 가능한 수업 자료인가</li>
                            <li>학생들의 흥미를 유발할 수 있는 수업 자료인가</li>
                            <li>교과 내 또는 교과 간의 창의 융합수업 자료인가</li>
                        </ul>

                        <dl>
                            <dt>당선 확률을 높이는 3가지 꿀팁</dt>
                            <dd>활동지와 사진 자료는 많을수록 좋아요!</dd>
                            <dd>비바샘 ‘공모전 수상작’ 채널에 공개된 주제와 겹치지 않을수록 당선 확률 UP!</dd>
                            <dd>출품 가이드와 유의 사항을 꼼꼼하게 확인하고 제출해주세요!</dd>
                        </dl>

                        <strong>※ 본 공모전은 비바샘 PC 웹페이지에서 응모 가능합니다.</strong>
                    </div>
                </div>

                <div className="cont_info">
                    <img src="images/events/2019/event191209/img_notice.jpg" alt="유의사항" />
                    <a onClick={this.reApplyClick} className="btn_myinfo"><img
                        src="images/events/2019/event191209/btn_myinfo.png" alt="개인정보 수정"/></a>
                    <ul className="blind">
                        <li>제출하신 자료는 반환되지 않습니다.</li>
                        <li>수상작에 대한 저작재산권 전부 및 2차적 저작물 작성권, 편집 저작물 작성권은 ㈜비상교육에 양도됩니다. * 수상작으로 선정되신 후에도 선생님께서 제출하신 자료를
                            수업용/강의용으로 언제든 활용하실 수 있습니다.
                        </li>
                        <li>비상교육에서 수상작을 편집·가공하여 사용할 시 선생님과의 협의 하에 진행되며, 전체 차시에 대한 세부 자료와 사진 사용에 대한 초상권 동의서 등을 요청드릴 수
                            있습니다.
                        </li>
                        <li>당첨자는 공지사항 발표 후 개별연락을 진행합니다. 연락처를 확인해주세요.</li>
                        <li>대상, 최우수상, 우수상 상금은 제세공과금(4.4%)을 제외하고 지급합니다.</li>
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
        event : state.saemteo.get('event').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
