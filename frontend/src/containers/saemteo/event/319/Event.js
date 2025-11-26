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
        data: [
            {id: 1, title: '2021 선생님 다이어리 자세히 보기', imgUrl: '/images/events/2020/event201118/popup01.jpg', imgAlt: '2021 선생님 다이어리'},
            {id: 2, title: '2021 선생님 탁상달력 자세히 보기', imgUrl: '/images/events/2020/event201118/popup02.jpg', imgAlt: '2021 선생님 탁상달력'},
        ],
        newData: [],
        popOpen: false,
        isEventApply: false,
        chkAmountFull: false,
        isEventOpen: true
    }

    onPop = popNum => {
        const { data, popOpen } = this.state
        this.setState({
            newData: data.filter( item => item.id  === popNum),
            popOpen: !popOpen
        })
    }

    onPopClose = () => {
        this.setState({
            newData: [],
            popOpen: false
        })
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
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;

        let today = new Date();
        let chkStartDate1 = new Date(2020, 11, 21, 14);
        let chkEndDate1 = new Date(2020, 11, 24, 0);

        let isEventOpen = false;
        if(today.getTime() >= chkStartDate1.getTime() && today.getTime() < chkEndDate1.getTime()){
            isEventOpen = true;
        }

        this.setState({isEventOpen: isEventOpen});

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
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다.");
                }else{
                    if(!this.state.isEventOpen){
                        common.info('오후 2시부터 신청이 가능합니다. 많은 참여 부탁드립니다.');
                        return false;
                    }

                    let chkAmountFull = this.state.chkAmountFull;
                    if(chkAmountFull){
                        common.info('준비된 선물이 모두 소진되었습니다.');
                        return false;
                    }

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
        const { newData, popOpen } = this.state
        return (
            <section className="event201118">
                <div className="evtCont01">
                    <h1><img src="/images/events/2020/event201118/img01.png" alt="새로운 시작 2021 비바샘의 특별한 선물" /></h1>
                    <div className="blind">
                        <p>2021년에는 어떤 수업을 계획하고 계신가요?<br />비바샘이 미리 준비한 두 가지 선물로 선생님의 내년 수업을 응원합니다.</p>
                        <p><strong>신청기간: 2020년 11월 23일(월) ~ 11월 25일 수요일</strong></p>
                        <span>매일 선착순 1,000세트 (매일 오후 2시 오픈)</span>
                    </div>
                </div>
                <div className="evtCont02">
                    <span class="imgWrap"><img src="/images/events/2020/event201118/img02.png" alt="" /></span>
                    <div className="evtPopWrap">
                        <div className="item">
                            <div className="blind">
                                <strong>2021 선생님 다이어리</strong>
                                <ul> 
                                    <li>월/주 단위로 효율적인 일정 관리</li>
                                    <li>최신형 테마별 체험활동 자료 수록</li>
                                </ul>
                            </div>
                            <button type="button" className="btnPop" onClick={ () => this.onPop(1) }><span className="blind">자세히 보기</span></button>
                        </div>
                        <div className="item">
                            <div className="blind">
                                <strong>2021 탁상 달력</strong>
                                <ul>
                                    <li>12개 키워드로 만나보는 비상교육</li>
                                    <li>주요 일정 체크를 위한 스티커 수록</li>
                                </ul>
                            </div>
                            <button type="button" className="btnPop" onClick={ () => this.onPop(2) }><span className="blind">자세히 보기</span></button>
                        </div>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply }><img src="/images/events/2020/event201118/btn_apply.png" alt="신청하기" /></button>
                    </div>
                </div>
                <div className="evtCont03">
                    <span className="imgWrap"><img src="/images/events/2020/event201118/img03.png" alt="신청 시 유의사항" /></span>
                    <ul className="blind">
                        <li>1인 1회 신청 가능합니다.</li> 
                        <li>다이어리와 탁상달력은 학교로만 배송이 가능합니다. 학교 주소와 수령처를 정확하게 기입해 주세요.</li>
                        <li>선물 발송에 필요한 정보는 서비스 업체에 공유됩니다. (성명, 주소, 전화번호 등 / ㈜한진-사업자등록번호 : 201-81-02823)</li>
                    </ul>
                </div>
                {
                    // 팝업
                    popOpen && newData.map( (item, idx) => {
                                    return (
                                        <div key={`evtPop${idx}`} className="evtPop">
                                            <div className="evtPopHeader">
                                                <h2>{ item.title }</h2>
                                                <button type="button" class="evtPopClose" onClick={ this.onPopClose }><span className="blind">팝업 닫기</span></button>
                                            </div>
                                            <div className="evtPopCont">
                                                <img src={ item.imgUrl } alt={ item.imgAlt } />
                                            </div>
                                        </div>
                                    )
                    })
                    
                }

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