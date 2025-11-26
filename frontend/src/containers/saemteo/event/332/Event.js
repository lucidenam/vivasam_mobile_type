import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import moment from 'moment';

class Event extends Component{

    state = {
        isEventApply: false,
        chkAmountFull: false,
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
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다");
                    return false;
                }

                let chkAmountFull = this.state.chkAmountFull;
                if(chkAmountFull){
                    common.info('준비한 선물이 모두 소진되었습니다.');
                    return false;
                }

                const nowHour = moment().format('HHmm');
                if (nowHour < '1500') {
                    common.info('이벤트는 오후 3시에 오픈합니다.');
                    return false;
                }

                handleClick(eventId);

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
			<section className="event210222">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210222/img01.jpg" alt="2021 벽걸이 달력을 보내드립니다." /></h1>
                    <div className="blind">
                        <p>비바샘에서 준비한 선생님의 수업을 더욱 풍성하게 만들어줄 유용한 선물! 연간 600여 개의 계기 이슈를 수록한 벽걸이 달력을 보내드립니다.</p>
                        <span>모집 기간: 2021년 2월 22일 ~ 2월 23일</span>
                        <span>매일 오후 3시 오픈! 하루 1,000개 선착순 마감!</span>
                        <span>* 2월 24일부터 순차 발송</span>
                    </div>
                </div>

                <div className="evtCont02">
                    <h2><img src="/images/events/2021/event210222/img02.jpg" alt="2021 벽걸이 달력 주요 내용" /></h2>
                    <ul className="blind">
                        <li>주요 기념일, 사건 · 사고, 위인의 출생 등 학교 수업에 활용할 수 있는 계기 이슈를 수록하였습니다.</li>
                        <li>연 600여 개, 월 50개 가량의 계기 이슈를 수업에 다채롭게 활용하실 수 있습니다.</li>
                        <li>가독성이 높은 대형 사이즈로 제작되어 수업 활용도가 높습니다.</li>
                    </ul>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                    </div>
                </div>

                <div className="evtCont03">
                    <h2><img src="/images/events/2021/event210222/img03.jpg" alt="신청 시 유의사항" /></h2>
                    <ul className="blind">
                        <li>벽걸이 달력은 1인 1개 신청 가능하며, 2월 24일부터 순차 발송됩니다.</li>
                        <li>주소 기재가 잘못되어 반송된 달력은 다시 발송해드리지 않습니다.</li>
                        <li>신청자 개인 정보(성명/주소/휴대전화번호)는 배송업체에 공유됩니다. (㈜한진 사업자등록번호 : 201-81-02823)</li>
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
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));