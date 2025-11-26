import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {Link, withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component {

    state = {
        chkAmountFull: [false, false, false, false],
        chkContent: [false, false, false, false],
        isEventApply: false,
        isChkAll: false
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

        if(logged){
            const response = await api.eventInfo(eventId);
            console.log(response.data.code);
            if(response.data.code === '3'){
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    eventAmountCheck = async() => {
        const { SaemteoActions, eventId} = this.props;
        let chkAmountFull = this.state.chkAmountFull;
        let params1 = {};
        params1.eventId = eventId; // 이벤트 ID

        // 역사와 친해지는 날
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
            chkAmountFull[0] = true;
        }

        // 과학과 친해지는 날
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
            chkAmountFull[1] = true;
        }

        // 내 마음을 돌아보는 날
        try {
            params1.seq = 5;
            params1.eventType = 5;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[2] = true;
            }
        } catch (e) {
            chkAmountFull[2] = true;
        }

        // 책으로 여는 수업
        try {
            params1.seq = 6;
            params1.eventType = 6;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[3] = true;
            }
        } catch (e) {
            chkAmountFull[3] = true;
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
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청하셨습니다.");
                }else if(response.data.code === '0') {

                    let chkAmountFull = this.state.chkAmountFull;
                    if(chkAmountFull[0] && chkAmountFull[1] && chkAmountFull[2] && chkAmountFull[3]){
                        common.info('사례집 신청이 마감 되었습니다.');
                        return false;
                    }

                    // 컨텐츠를 한개 이상 선택했는지 체크
                    let chkContent = this.state.chkContent;
                    let chkOneContent = true;
                    for(let i=0; i<chkContent.length; i++){
                        if(chkContent[i]){
                            chkOneContent = false;
                            break;
                        }
                    }
                    if(chkOneContent){
                        common.info('사례집을 선택해주세요.');
                        return false;
                    }

                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    let eventAnswerArray = {};
                    eventAnswerArray.chkContent = this.state.chkContent;
                    eventAnswer.eventAnswerContent = eventAnswerArray;
                    SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                    handleClick(eventId);
                }else{
                    common.error("신청이 정상적으로 처리되지 못하였습니다.");
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    contentOnChange = (itemKey) => {
        const { logged, history, BaseActions, loginInfo} = this.props;
        const { data } = this.state;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else {
            // 준회원일 경우 신청 안됨.
            if (loginInfo.mLevel != 'AU300') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            if(this.state.isEventApply){
                common.error("이미 신청하셨습니다.");
                return false;
            }

            let chkContent = this.state.chkContent;
            chkContent[itemKey] = !chkContent[itemKey];
            if(!chkContent[itemKey]){
                this.setState({isChkAll: false})
            }
            this.setState({chkContent: chkContent})
        }
    }

    chkAll = () => {
        const { logged, history, BaseActions } = this.props;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }

        if(this.state.isEventApply){
            common.error("이미 신청하셨습니다.");
            return false;
        }

        let chkContent = this.state.chkContent;
        let chkAmountFull = this.state.chkAmountFull;

        if(chkAmountFull[0] && chkAmountFull[1] && chkAmountFull[2] && chkAmountFull[3]){
            common.info('사례집 신청이 마감 되었습니다.');
            return false;
        }

        if(this.state.isChkAll){
            for(let i=0; i<chkContent.length; i++){
                chkContent[i] = false;
            }
            this.setState({chkContent: chkContent})
        }else{
            for(let i=0; i<chkContent.length; i++){
                if(!chkAmountFull[i]){
                    chkContent[i] = true;
                }
            }
            this.setState({chkContent: chkContent});
        }
        this.setState({isChkAll: !this.state.isChkAll})
    }

    render() {
        return (
            <section className="event210324">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210324/img01.png" alt="초등 선생님의 수업 이야기. ‘오늘 뭐하지’ 시즌2 사례집을 보내드립니다." /></h1>
                    <div className="blind">
                        <p>전국의 초등 선생님과 함께 만든 오늘의 수업 이야기! 시즌1 이어 초등 선생님의 특별한 수업 사례를 담았습니다. 비바샘 오늘 뭐하지 시즌2의 수상작으로 주제별 ‘오늘’의 수업 노하우를 만나보세요.</p>
                        <p>2021년 3월 24일 (수) ~ 3월 31일(수)<br />선착순 마감. 4월 1일부터 비상교육 지사를 통해 순차 발송</p>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="inner">
                        <div className="caseBookWrap">
                            <div className="chkAllWrap">
                                <input type="checkbox" name="chkAll" id="chkAll" value="전체선택" onChange={this.chkAll} checked={this.state.isChkAll}/>
                                <label for="chkAll">전체 선택하기</label>
                            </div>
                            <ul className="caseBookList">
                                <li>
                                    <input type="checkbox" name="chk" id="chk01" value="역사와 친해지는 날" disabled={this.state.chkAmountFull[0]} checked={this.state.chkContent[0]} onChange={() => this.contentOnChange(0)}/><label for="chk01"><span className="blind">오늘 뭐하지 역사와 친해지는 날 - 타임슬립 역사 수업으로 시대를 공감하기</span></label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk02" value="과학과 친해지는 날" disabled={this.state.chkAmountFull[1]} checked={this.state.chkContent[1]} onChange={() => this.contentOnChange(1)}/><label for="chk02"><span className="blind">오늘 뭐하지 과학과 친해지는 날 - 일상 생활 속에서 과학의 원리를 발견하기</span></label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk03" value="내 마음을 돌아보는 날" disabled={this.state.chkAmountFull[2]} checked={this.state.chkContent[2]} onChange={() => this.contentOnChange(2)}/><label for="chk03"><span className="blind">오늘 뭐하지 내 마음을 돌아보는 날 - ‘나’를 사랑하고 ‘너’를 알아가며 ‘우리’를 공부하기</span></label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk04" value="책으로 여는 수업" disabled={this.state.chkAmountFull[3]} checked={this.state.chkContent[3]} onChange={() => this.contentOnChange(3)}/><label for="chk04"><span className="blind">오늘 뭐하지 책으로 여는 수업 - 책 속에서 더 넓은 세상을 마주보기</span></label>
                                </li>
                            </ul>
                            <div className="caseBookInfo">
                                <p className="txtInfo"><img src="/images/events/2021/event210324/txt.png" alt="비바샘은 전국 초등 선생님과 ‘오늘 뭐하지’ 프로젝트를 이어가고 있습니다." /></p>
                                <Link to="/liveLesson/WhatToday" className="btnLink01"><img src="/images/events/2021/event210324/btn_link01.png" alt="시즌1 바로가기" /></Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="inner">
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply }><img src="/images/events/2021/event210324/btn_apply.png" alt="신청하기" /></button>
                        </div>
                    </div>
                </div>
                <div className="evtCont04">
                    <h2><img src="/images/events/2021/event210324/img02.png" alt="신청 시 유의사항" /></h2>
                    <ul className="blind">
                        <li>- 1인 1회, 4종 모두 신청 가능합니다.</li>
                        <li>- 4월 1일부터 순차적으로 배송/전달을 시작합니다.</li>
                        <li>- 신청하신 선생님의 재직 학교 인근 비상교육 지사를 통해 전달할 예정입니다. 재직학교를 정확히 확인해 주세요.</li>
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