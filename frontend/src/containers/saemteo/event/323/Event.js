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
    state = {
        isEventApply: false,
        chkAmountFull: [false, false],
        isEventOpen: [false, false]
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
        const { logged, event, eventId } = this.props;

        let today = new Date();
        let chkStartDate1 = new Date(2020, 11, 9, 0);
        let chkEndDate1 = new Date(2020, 11, 22, 0);
        let chkStartDate2 = new Date(2020, 11, 22, 0);
        let chkEndDate2 = new Date(2021, 0, 1,0);

        let isEventOpen1 = false;
        let isEventOpen2 = false;
        if(today.getTime() >= chkStartDate1.getTime() && today.getTime() < chkEndDate1.getTime()){
            isEventOpen1 = true;
        }else if(today.getTime() >= chkStartDate2.getTime() && today.getTime() < chkEndDate2.getTime()){
            isEventOpen2 = true;
        }

        this.setState({
            isEventOpen: [isEventOpen1, isEventOpen2]
        });

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
        let chkAmountFull = [false, false];
        try {
            params1.seq = 3;
            params1.eventType = 3;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[0] = true;
            }
        } catch (e) {
            console.log(e);
            chkAmountFull[0] = true;
        }
        try {
            params1.seq = 4;
            params1.eventType = 4;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[1] = true;
            }
        } catch (e) {
            console.log(e);
            chkAmountFull[1] = true;
        }

        this.setState({
            chkAmountFull: chkAmountFull
        });

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
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다.");
                    return false;
                }else{
                    let isEventOpen = this.state.isEventOpen;
                    let chkAmountFull = this.state.chkAmountFull;
                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    let eventAnswerArray = {};
                    if(isEventOpen[0]){
                        if(chkAmountFull[0]){
                            common.info('가채점 배치표는 물량이 모두 소진되었습니다.12월 22일에 실채점 배치표 신청 부탁드립니다.');
                            return false;
                        }else{
                            chkAmountFull[1] = true;
                            eventAnswerArray.chkAmountFull = chkAmountFull;
                        }
                    }else if(isEventOpen[1]){
                        if(chkAmountFull[0] && chkAmountFull[1]){
                            common.info('물량이 모두 소진되어 이벤트가 종료되었습니다.');
                            return false;
                        }else{
                            eventAnswerArray.chkAmountFull = chkAmountFull;
                        }
                    }else{
                        common.info('종료된 이벤트 입니다.');
                        return false;
                    }

                    eventAnswer.eventAnswerContent = eventAnswerArray;
                    SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
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
            <section className="event201209">
                <div className="evtCont01">
                    <h1><img src="/images/events/2020/event201209/img01.png" alt="2021 학년도 비상교육. 정시모집 배치표를 보내드립니다." /></h1>
                    <div className="blind">
                        <p>빠르고 정확한 정시 진학 상담 지원을 위해<br />비상모의고사 입시 전문가와 고등 진학 담당교사들이 함께 제작한<br />2021학년도 비상교육 정시 모집 배치표를 학교로 보내드립니다.</p>
                        <p>신청 기간: <strong>2020.12.09(수) ~ 12.31(목)</strong></p>
                        <span>* 1인 1회(1세트)만 신청 가능하며, 이벤트 기간 중 수량이 조기 소진될 수 있습니다.</span>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="imgWrap"><img src="/images/events/2020/event201209/img02.png" alt="" /></div>
                    <ul className="listWrap">
                        <li>
                            <div className="blind">
                                <strong>가채점 배치표</strong>
                                <p>구성: 인문(가군, 나군, 다군) 1매 / 자연(가군, 나군, 다군) 1매</p>
                                <p>12월 중순부터 순차 발송</p>
                            </div>
                            {/* [DEV]: 원하는 아이콘 활성화 시 class="on" 사용 */}
                            {
                                this.state.chkAmountFull[0] === true
                                    ? <span className={'iconInfo done on'}><em className="blind">마감</em></span>
                                    : <span className={'iconInfo done'}><em className="blind">마감</em></span>
                            }
                        </li>
                        <li>
                            <div className="blind">
                                <strong>실채점 배치표</strong>
                                <p>구성: 인문(가군, 나군, 다군) 1매 / 자연(가군, 나군, 다군) 1매</p>
                                <p>12월 말부터 순차 발송</p>
                            </div>
                            {/* [DEV]: 원하는 아이콘 활성화 시 class="on" 사용 */}
                            {
                                this.state.isEventOpen[1] === true
                                    ? <span className={'iconInfo'}><em className="blind">12.22(화) 오픈 예정!</em></span>
                                    : <span className={'iconInfo on'}><em className="blind">12.22(화) 오픈 예정!</em></span>
                            }
                            {
                                this.state.chkAmountFull[1] === true
                                    ? <span className={'iconInfo done on'}><em className="blind">마감</em></span>
                                    : <span className={'iconInfo done'}><em className="blind">마감</em></span>
                            }
                        </li>
                    </ul>
                    <div className="btnWrap">
                        <button type="button" className="btnApply" onClick={ this.eventApply }><img src="/images/events/2020/event201209/btn_apply.png" alt="신청하기" /></button>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="imgWrap"><img src="/images/events/2020/event201209/img03.png" alt="유의사항" /></div>
                    <ul className="blind">
                        <li>① 선착순 배포로 이벤트 기간 중 수량이 조기 소진될 수 있습니다.</li>
                        <li>② 정시 모집 배치표는 학교로만 배송이 가능합니다. 학교 주소와 수령처를 정확하게 기입해 주세요.</li>
                        <li>③ 배송에 필요한 정보는 서비스 업체에 공유됩니다.<br />(성명, 학교 정보, 전화번호 등 / ㈜한진-사업자등록번호 : 201-81-02823)</li>
                    </ul>
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
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));