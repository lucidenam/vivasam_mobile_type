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
                // 이벤트 시작시간 제어
                const now = moment().format('YYYYMMDDHHmm');
                if (now < '202104161500') {
                    common.info('이벤트는 오후 3시부터 신청 가능합니다.');
                    return false;
                }
                
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다");
                    return false;
                }

                let chkAmountFull = this.state.chkAmountFull;
                if(chkAmountFull){
                    common.info('준비한 선물이 모두 소진되었습니다.');
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
			<section className="event210416">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210416/img01.png" alt="한눈에 보는 한국사/세계사 역사 연표 브로마이드" /></h1>
                    <p>초·중·고등학교 어디에나 다채롭게 활용할 수 있는<br />활용 만점 역사 연표를 보내드립니다.<br /><br />기원전부터 현대에 이르기까지의 역사 흐름을<br />주요 사건과 이미지로 한눈에 파악할 수 있습니다.</p>
                    <div className="evtInfo">
                        <p>신청 기간 : 2021.04.16(금) ~ 04.23(금)</p>
                        <span>선착순 마감</span>
                        <span className="bulTxt">4월 21일부터 순차적 발송</span>
                    </div>
                </div>

                <div className="evtCont02">
                    <div class="inner">
                        <img src="/images/events/2021/event210416/img_chronol.png" alt="" />
                        <div className="evtCont">
                            <h2><span className="blind">비상교육 역사 연표 브로마이드</span></h2>
                            <ul>
                                <li><strong>기원전~현대까지 주요 사건</strong>을 이미지와 함께 한눈에!</li>
                                <li><strong>한국사/세계사 교과서의 주요 내용</strong>을 한 장의 연표로 쏙쏙! </li>
                                <li><strong>교과 수업, 계기 수업</strong> 등 다채로운 활용!</li>
                                <li>교실 수업에 딱 맞는 <strong>가독성 높은 사이즈와 디자인!</strong></li>
                            </ul>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply } className="btnApply">신청하기</button>
                        </div>
                    </div>
                </div>

                <div className="evtCont03">
                    <div className="inner">
                        <h2>신청 시 유의사항</h2>
                        <ul>
                            <li>역사 연표 브로마이드는 1인 1개 신청 가능하며, 4월 21일부터 순차적 발송됩니다.</li>
                            <li>주소 기재가 잘못되어 반송된 브로마이드는 다시 발송해드리지 않습니다.</li>
                        </ul>
                    </div>
                </div>
                {   /* 이벤트 시작 */
                    // beforeEventStartHour &&
                    // <span className="bannerInfo">
                    //     <img src="/images/events/2021/event210304/banner_info.png" alt="이벤트 시작 정보. 3월 4일(목) 오후 2시 오픈!"/>
                    // </span>
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
