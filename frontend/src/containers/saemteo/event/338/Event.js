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
import * as myclassActions from 'store/modules/myclass';

class Event extends Component {

    state = {
        chkAmountFull: [false, false, false],
        chkContent: [false, false, false],
        isEventApply: false,
        isChkAll: false,
        isEventOpen: false
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
        let chkStartDate = new Date(2021, 3, 7, 15);

        let isEventOpen = false;
        if(today.getTime() >= chkStartDate.getTime()){
            isEventOpen = true;
        }

        this.setState({isEventOpen: isEventOpen});

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

        // 초등 수학
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

        // 초등 사회
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

        // 초등 과학
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

                    if(!this.state.isEventOpen){
                        common.info('오후 3시부터 신청이 가능합니다.');
                        return false;
                    }

                    // 초등대상 이벤트 초등학교 선생님이 아닌경우 알럿
                    let myClassInfo = await this.getMyClassInfo();
                    let schoolLvlCd = myClassInfo.schoolLvlCd;
                    if(schoolLvlCd != 'ES'){
                        common.info("초등 선생님만 신청 가능합니다.");
                        return false;
                    }

                    let chkAmountFull = this.state.chkAmountFull;
                    if(chkAmountFull[0] && chkAmountFull[1] && chkAmountFull[2]){
                        common.info('자료집 신청이 마감 되었습니다.');
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
                        common.info('자료집을 선택해주세요.');
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

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;
        try {
            let result = await MyclassActions.myClassInfo();
            return result.data;
        } catch (e) {
            console.log(e);
        }
    }

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

        if(chkAmountFull[0] && chkAmountFull[1] && chkAmountFull[2]){
            common.info('자료집 신청이 마감 되었습니다.');
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
            <section className="event210407">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210407/img01.jpg" alt="생생한 초등 수업의 시작. 질문이 살아있는 수업" /></h1>
                    <div className="blind">
                        <p>우리나라 최초의 질문 기반 수업 자료집을 학교로 보내드립니다.</p>
                        <p>2021년 4월 7일 (수) ~ 4월 16일(금)<br />선착순 마감. 4월 19일부터 비상교육 지사를 통해 순차 발송</p>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="inner">
                        <div className="caseBookWrap">
                            <ul className="desList">
                                <li>핵심 질문 기반으로 질문 중심 수업 가능</li>
                                <li>하브루타, 협동 학습, PBL 수업, 토의 및 토론 등<br />다채로운 활동지 제공</li>
                                <li>초등학교 현장에 알맞은 실전 수업 사례 수록</li>
                            </ul>
                            <div className="chkAllWrap">
                                <input type="checkbox" name="chkAll" id="chkAll" value="전체선택" onChange={this.chkAll} checked={this.state.isChkAll}/>
                                <label for="chkAll">전체 선택하기</label>
                            </div>
                            <ul className="caseBookList">
                                <li>
                                    <input type="checkbox" name="chk" id="chk01" value="3~4학년 수학" disabled={this.state.chkAmountFull[0]} checked={this.state.chkContent[0]} onChange={() => this.contentOnChange(0)}/><label for="chk01">3~4학년 수학</label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk02" value="3~4학년 사회" disabled={this.state.chkAmountFull[1]} checked={this.state.chkContent[1]} onChange={() => this.contentOnChange(1)}/><label for="chk02">3~4학년 사회</label>
                                </li>
                                <li>
                                    <input type="checkbox" name="chk" id="chk03" value="3~4학년 과학" disabled={this.state.chkAmountFull[2]} checked={this.state.chkContent[2]} onChange={() => this.contentOnChange(2)}/><label for="chk03">3~4학년 과학</label>
                                </li>
                            </ul>
                            <div className="btnWrap">
                                <button type="button" className="btnApply" onClick={ this.eventApply }><img src="/images/events/2021/event210407/btn_apply.png" alt="신청하기" /></button>
                            </div>
                        </div>
                        <div className="caseBookInfo">
                            <p className="txtInfo"><span className="blind">‘질문이 살아 있는 수업’ 자료집은 비바샘 수업 혁신 채널에서 PDF 파일로 제공하고 있습니다. 초등 3~4학년 수학, 사회, 과학은 4월 중에 업데이트 됩니다. 프로젝트를 이어가고 있습니다.</span></p>
                            <Link to="/liveLesson/classLiveQuestion" className="btnLink01"><span className="blind">바로가기</span></Link>
                        </div>
                    </div>
                </div>
                <div className="evtCont03">
                    <h2>신청 시 유의사항</h2>
                    <ul>
                        <li><strong>1인 1회, 3권 모두 신청 가능</strong>합니다.</li>
                        <li>4월 19일부터 순차적으로 배송/전달을 시작합니다.</li>
                        <li>신청하신 선생님의 재직 학교 인근 비상교육 지사를 통해 전달할 예정입니다. 재직학교를 정확히 확인해 주세요.</li>
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
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(Event));