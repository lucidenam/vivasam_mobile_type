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

                const today = moment().format('YYYYMMDD');
                const now = moment().format('YYYYMMDDHHmm');
                if (today <= '20210304' && now < '202103041400') {
                    common.info('이벤트는 오후 2시 부터 참여가능합니다.');
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

        const today = moment().format('YYYYMMDD');
        const now = moment().format('YYYYMMDDHHmm');
        var beforeEventStartHour = false;
        if (today <= '20210304' && now < '202103041400') {
            beforeEventStartHour = true;
        }

        return (
			<section className="event210304">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210304/img01.jpg" alt="자기주도 학습을 돕는 학생 맞춤형 2021 스터디 플래너" /></h1>
                    <div className="blind">
                        <p>효율적인 학습 일정 관리와 주도적인 진로탐색 활동을 돕는 똑똑한 학생 맞춤형 2021 스터디 플래너를 학교로 보내드립니다.</p>
                        <span>모집 기간: 2021년 3월 4일 ~ 3월 12일. 선착순 마감!</span>
                        <span>1인 30권 제한, 학교 주소로만 발송 가능, 3월 10일부터 순차 발송</span>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                    </div>
                </div>

                <div className="evtCont02">
                    <h2><img src="/images/events/2021/event210304/img02.jpg" alt="2021 스터디 플래너 내용" /></h2>
                    <ul className="blind">
                        <li>지금의 나를 기록하기</li>
                        <li>진로 마인드맵</li>
                        <li>월간 / 주간 공부 계획 스스로 체크하기</li>
                        <li>유형별 대표 직업 찾아보기</li>
                        <li>스티커로 스스로 진도 체크하기</li>
                    </ul>

                </div>

                <div className="evtCont03">
                    <h2><img src="/images/events/2021/event210304/img03.jpg" alt="신청 시 유의사항" /></h2>
                    <ul className="blind">
                        <li>추가 수량 문의는 담당자에게 개별 문의해주세요.(담당자: 02-6970-5753)</li>
                        <li>학교 번지수 및 수령처를 정확히 기입해주세요.(ex.교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</li>
                        <li>주소 기재가 잘못되어 반송된 스터디 플래너는 다시 발송해드리지 않습니다.</li>
                        <li>신청자의 개인정보(이름/주소/전화번호)는 배송 업체에 공유됩니다. ((주)한진 사업자등록번호: 201-81-02823)</li>
                    </ul>
                </div>
                {   /* 이벤트 시작 */
                    beforeEventStartHour &&
                    <span className="bannerInfo">
                        <img src="/images/events/2021/event210304/banner_info.png" alt="이벤트 시작 정보. 3월 4일(목) 오후 2시 오픈!"/>
                    </span>
                }
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
