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
import * as myclassActions from 'store/modules/myclass';

class Event extends Component {

    state = {
        isEventApply: false,
        chkAmountFull: false,
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = async() => {
        const { BaseActions } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
            await this.eventAmountCheck();
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
        const { logged, eventId, event } = this.props;
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

    eventAmountCheck = async() => {
        const { SaemteoActions, eventId} = this.props;
        let params1 = {};
        params1.eventId = eventId; // 이벤트 ID

        try {
            params1.seq = 3;
            params1.eventType = 3;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({chkAmountFull: true});
            }
        } catch (e) {
            console.log(e);
            this.setState({chkAmountFull: true});
        }
    }

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
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
                common.info("교사 인증 후 이벤트를 신청해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다");
                }else{
                    // 초등대상 이벤트 초등학교 선생님이 아닌경우 알럿
                    let myClassInfo = await this.getMyClassInfo();
                    let schoolLvlCd = myClassInfo.schoolLvlCd;
                    if(schoolLvlCd != 'ES'){
                        common.info("초등학교 선생님 대상 이벤트 입니다.");
                        return false;
                    }else{
                        let chkAmountFull = this.state.chkAmountFull;
                        if(chkAmountFull){
                            common.info('수량이 모두 마감되었습니다.');
                            return false;
                        }else{
                            handleClick(eventId);
                        }
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

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;
        try {
            let result = await MyclassActions.myClassInfo();
            return result.data;
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        return (
            <section className="event210127">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210127/img01.jpg" alt="초등 창의 융합 수업에 유용한 공모전 수상작 초등편2" /></h1>
                    <div className="blind">
                        <p>초등학교 현장 선생님들의 생생한 창의 융합 수업 사례를 모은 비상교육 창의 융합 수업 자료 공모전 수상작 초등편2 자료집을 보내드립니다.</p>
                        <strong>2021.01.27(수) ~ 02.19(금)</strong>
                        <span>※ 선착순 마감</span>
                        <span> ※ 설 연휴 이후부터 순차 발송 마감</span>
                    </div>
                    <div className="btnWrap">
                        <a href="https://www.vivasam.com/html/event/event210127/창의융합_수업자료_공모전수상작_초등편II.pdf" target="_blank" title="새창열림" className="btnPreview"><span className="blind">공모전 수상작 초등편2 자료집 미리보기</span></a>
                    </div>
                </div>

                <div className="evtCont02">
                    <h2><img src="/images/events/2021/event210127/img02.jpg" alt="이렇게 구성되어 있어요!" /></h2>
                    <div className="blind">
                        <ul>
                            <li>계획 의도와 관련 교과 내용을 확인할 수 있는 수업 소개</li>
                            <li>수업의 흐름을 파악할 수 있는 ‘수업 지도안’과 ‘Special Tip!’</li>
                            <li>수업 현장을 생생하게 느껴보는 ‘수업 엿보기’</li>
                            <li>복사만 하면 수업에 바로 활용할 수 있는 활동지</li>
                        </ul>
                        <p>※ 비바샘 공모전 수상작 페이지에서 더 많은 자료를 확인할 수 있습니다.</p>
                    </div>
                    <div className="btnWrap">
                        <a href="https://www.vivasam.com/opendata/OriginalIdeaConvergenceList.do?deviceMode=pc" target="_blank" title="새창열림" className="btnLink"><span className="blind">비바샘 수상작 페이지 바로가기</span></a>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><img src="/images/events/2021/event210127/btn_apply.png" alt="신청하기" /></button>
                    </div>
                </div>

                <div className="evtCont03">
                    <h2><img src="/images/events/2021/event210127/img03.jpg" alt="신청 시 유의사항" /></h2>
                    <ol className="blind">
                        <li>1인 당 1권 씩, 1회 신청 가능합니다.</li>
                        <li>정확하지 않은 주소로 인해 반송된 물품은 재발송 되지 않습니다.학교 번지수 및 수령처를 정확히 기재해 주세요.</li>
                        <li>자료집 배송에 필요한 정보는 서비스 업체에 공유됩니다.(성명, 주소, 휴대전화번호 등 / ㈜한진 – 사업자등록번호: 201-81-02823)</li>
                    </ol>
                </div>
            </section>
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
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(Event));