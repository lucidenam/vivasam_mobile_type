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
        chkAmountFull: [false, false, false, false],
        chkContent: [false, false, false, false],
        isEventApply: false,
        targetEventId: 314,
        isChkAll: false
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = async() => {
        const { BaseActions } = this.props;
        BaseActions.openLoading();
        try{
            let targetEventId = await this.eventApplyCheck();
            await this.eventAmountCheck(targetEventId);
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
        let chkStartDate1 = new Date(2020, 10, 16, 14);
        let chkEndDate1 = new Date(2020, 10, 17, 0);
        let chkStartDate2 = new Date(2020, 10, 17, 14);
        let chkEndDate2 = new Date(2020, 10, 18, 0);
        let chkStartDate3 = new Date(2020, 10, 18, 14);
        let chkEndDate3 = new Date(2020, 10, 19, 0);
        let chkStartDate4 = new Date(2020, 10, 19, 14);
        let chkEndDate4 = new Date(2020, 10, 20, 0);

        let targetEventId = 314;
        if(today.getTime() >= chkStartDate1.getTime() && today.getTime() < chkEndDate1.getTime()){
            targetEventId = 315;
        }else if(today.getTime() >= chkStartDate2.getTime() && today.getTime() < chkEndDate2.getTime()){
            targetEventId = 316;
        }else if(today.getTime() >= chkStartDate3.getTime() && today.getTime() < chkEndDate3.getTime()){
            targetEventId = 317;
        }else if(today.getTime() >= chkStartDate4.getTime() && today.getTime() < chkEndDate4.getTime()){
            targetEventId = 318;
        }

        this.setState({targetEventId: targetEventId});

        if(logged){
            const response = await api.eventInfo(targetEventId);
            console.log(response.data.code);
            if(response.data.code === '3'){
                this.setState({
                    isEventApply: true
                });
            }
        }

        return targetEventId;
    }

    eventAmountCheck = async(targetEventId) => {
        const { SaemteoActions} = this.props;
        let chkAmountFull = this.state.chkAmountFull;
        let params1 = {};
        params1.eventId = targetEventId; // 이벤트 ID

        // 새로운 친구와 만나는 날
        if(targetEventId != 314) {
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

            // 세상을 바꾸고 싶은 날
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

            // 수학과 친해지는 날
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
                const response = await api.eventInfo(this.state.targetEventId);
                if(response.data.code === '3'){
                    common.error("이미 신청하셨습니다.");
                }else if(response.data.code === '0') {
                    if(this.state.targetEventId == 314){
                        common.info('오후 2시부터 신청이 가능합니다. 많은 참여 부탁드립니다.');
                        return false;
                    }

                    let chkAmountFull = this.state.chkAmountFull;
                    if(chkAmountFull[0] && chkAmountFull[1] && chkAmountFull[2] && chkAmountFull[3]){
                        common.info('금일 사례집을 신청이 마감 되었습니다.');
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
                    eventAnswerArray.targetEventId = this.state.targetEventId;
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

            if(this.state.targetEventId == 314){
                common.info('오후 2시부터 신청이 가능합니다. 많은 참여 부탁드립니다.');
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
        if(this.state.targetEventId == 314){
            common.info('오후 2시부터 신청이 가능합니다. 많은 참여 부탁드립니다.');
            return false;
        }

        let chkContent = this.state.chkContent;
        let chkAmountFull = this.state.chkAmountFull;
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
            <section className="event201110">
                <div className="evtCont01">
                    <h1><img src="/images/events/2020/event201110/img01.png" alt="시즌1 사례집을 보내드립니다" /></h1>
                    <div className="blind">
                        <em>초등 선생님의 수업 이야기</em><strong>‘오늘 뭐하지’ 시즌1 사례집을 보내드립니다.</strong><br /><br />
                        <p>전국의 초등 선생님과 함께 만든 오늘의 수업 이야기!<br />비바샘 오늘 뭐하지 시즌1의 수상작으로 4가지 주제별 수업 노하우를 만나보세요.</p>
                        <p><strong>2020년 11월 16일 (월) ~ 11월 19일(목)</strong><br />매일 오후 2시 오픈<strong>(매일 500권씩 선착순 마감!)</strong></p>
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
                                    <input type="checkbox" name="chk" id="chk01" value="새로운 친구와 만나는 날" disabled={this.state.chkAmountFull[0]} checked={this.state.chkContent[0]} onChange={() => this.contentOnChange(0)}/><label for="chk01"><span className="blind">오늘 뭐하지 새로운 친구와 만나는 날 - 친구 관계 맺기, 협동, 인성 관련 수업사례</span></label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk02" value="세상을 바꾸고 싶은 날" disabled={this.state.chkAmountFull[1]} checked={this.state.chkContent[1]} onChange={() => this.contentOnChange(1)}/><label for="chk02"><span className="blind">오늘 뭐하지 세상을 바꾸고 싶은 날 - 환경, 시민 의식, 공동체 역량 강화 수업 사례</span></label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk03" value="수학과 친해지는 날" disabled={this.state.chkAmountFull[2]} checked={this.state.chkContent[2]} onChange={() => this.contentOnChange(2)}/><label for="chk03"><span className="blind">오늘 뭐하지 수학과 친해지는 날 - 도형, 연산 등을 놀이로 풀어낸 수업 사례</span></label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk04" value="새로운 책으로 여는 수업" disabled={this.state.chkAmountFull[3]} checked={this.state.chkContent[3]} onChange={() => this.contentOnChange(3)}/><label for="chk04"><span className="blind">오늘 뭐하지 책으로 여는 수업 - 독서 및 토론 활동, 사고력 강화 수업 사례</span></label>
                                </li>
                            </ul>
                            <div className="caseBookInfo">
                                <p className="txtInfo"><img src="/images/events/2020/event201110/txt.png" alt="‘오늘 뭐하지 시즌1’ 사례집은 비바샘에서 무료로 다운로드 받으실 수 있습니다." /></p>
                                <a href="https://www.vivasam.com/event/2020/viewEvent293.do?deviceMode=pc" className="btnLink01" target="_blank"><img src="/images/events/2020/event201110/btn_link01.png" alt="바로가기" /></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="inner">
                        <div className="bannerWrap">
                            <img src="/images/events/2020/event201110/banner.png" alt="‘오늘 뭐하지 시즌2’가 진행 중 입니다. 선생님만의 특별한 수업 이야기를 기다립니다." />
                            <a href="https://www.vivasam.com/event/2020/viewEvent311.do?deviceMode=pc" className="btnLink02" target="_blank"><img src="/images/events/2020/event201110/btn_link02.png" alt="시즌2 참여하기" /></a>
                        </div>
                    </div>
                </div>
                <div className="evtCont04">
                    <div className="inner">
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply }><img src="/images/events/2020/event201110/btn_apply.png" alt="신청하기" /></button>
                        </div>
                    </div>
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