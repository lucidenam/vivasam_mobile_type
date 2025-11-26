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
            common.info('준비된 진로 브로마이드가 모두 소진 되었습니다.');
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

                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다");
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

    render () {
        return (
			<section className="event210615">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210615/img01.png" alt="2021 진로 브로마이드를 학교로 보내드립니다." /></h1>
                    <div className="txt">
                        <p><strong>160여 개의 미래형 신직업</strong>을 한눈에 살펴보고<br />학생들이 희망 직업을 기록해 볼 수 있는<br />진로 브로마이드를 학교로 보내드립니다.</p>
                        <span className="period">신청기간<em>2021</em>년 <em>6</em>월 <em>15</em>일 ~ <em>20</em>일</span>
                        <span className="blind">비상교육 지사를 통해 순차적으로 발송됩니다.<br /><em>선착순 마감</em></span>
                    </div>
                    <div className="blind">
                        <strong>진로 브로마이드 2종 세트 내용</strong>
                        <ul>
                            <li>정보형 브로마이드: 10개 분야, 160여 개의 미래형 신직업 소개</li>
                            <li>참여형 브로마이드: 학생들이 희망하는 미래의 직업 작성</li>
                        </ul>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                    </div>
                </div>
                <div className="evtCont02">
                    <p className="subTit"><span className="blind">신청 시 유의사항</span></p>
                    <ul>
                        <li><strong>1인 1개</strong> 신청 가능합니다.</li>
                        <li><strong>선착순 신청</strong>으로, 수량 소진 시 조기 마감될 수 있습니다.<br />(비상교육 지사를 통해 순차 발송)</li>
                        <li>정확한 주소를 기입해주세요. (학교 주소, 수령처 포함: ex.교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</li>
                        <li>주소 기재가 잘못되어 반송된 브로마이드는 다시 발송해드리지 않습니다.</li>
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
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(Event));