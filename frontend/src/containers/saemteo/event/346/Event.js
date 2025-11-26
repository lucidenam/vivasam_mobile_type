import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import {bindActionCreators} from "redux";
import moment from "moment";


class Event extends Component{

    state = {
        popState: false,
        isEventApply: false,
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

    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions, event, eventId, handleClick, loginInfo} = this.props;

        let chkAmountFull = this.state.chkAmountFull;
        if(chkAmountFull){
            common.info('준비한 선물이 모두 소진되었습니다.');
            return false;
        }

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{

            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel !== 'AU300'){
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
                // 이벤트 시작시간 제어
                const now = moment().format('YYYYMMDDHHmm');
                if (now < '202106091400') {
                    common.info('오후 2시부터 신청이 가능합니다.');
                    return false;
                }

                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다");
                    return false;
                }

                // 초등대상 이벤트 초등학교 선생님이 아닌경우 알럿
                let myClassInfo = await this.getMyClassInfo();
                let schoolLvlCd = myClassInfo.schoolLvlCd;
                if(schoolLvlCd !== 'ES') {
                    common.info("초등학교 선생님 대상 이벤트 입니다.");
                    return false;
                }

                handleClick(eventId);    // 신청정보 팝업으로 이동

            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    }

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;
        try {
            let result = await MyclassActions.myClassInfo();
            return result.data;
        } catch (e) {
            console.log(e);
        }
    }

    render () {
        return (
			<section className="event210609">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210609/img01.png" alt="초등학교 선생님을 위한 과학 브로마이드를 학교로 보내드립니다." /></h1>
                    <div className="blind">
                        <p><strong>실험실 안전수칙</strong>과 <strong>실험기구 사용 방법</strong>을 한눈에 볼 수 있는<br />과학 브로마이드 세트를 보내드립니다.</p>
                        <p><strong>신청기간 | 2021년 6월 9일 ~ 18일</strong></p>
                        <span>비상교육 지사를 통해 순차적으로 발송됩니다.</span>
                        <strong>초등 과학 브로마이드 세트 내용</strong>
                        <ul>
                            <li>실험실 안전수칙</li>
                            <li>실험기구 사용 방법</li>
                        </ul>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                    </div>
                </div>
                <div className="evtCont02">
                    <span className="imgWrap"><img src="/images/events/2021/event210609/img02.png" alt="" /></span>
                    <div className="blind">
                        <p>신청 시 유의사항</p>
                        <ul>
                            <li><strong>1인 1세트만</strong> 신청 가능합니다.</li>
                            <li><strong>선착순 신청</strong>으로, 수량 소진 시 조기 마감될 수 있습니다. (비상교육 지사를 통해 순차 발송)</li>
                            <li>정확한 주소를 기입해주세요. (학교 주소, 수령처 포함: ex.교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</li>
                            <li>주소 기재가 잘못되어 반송된 브로마이드는 다시 발송해드리지 않습니다.</li>
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
