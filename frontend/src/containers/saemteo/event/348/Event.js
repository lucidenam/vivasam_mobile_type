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


const contentNameArr = [
    '초등 수학 3-1, 3-2',
    '초등 수학 4-1, 4-2'
]


class Event extends Component{

    state = {
        isEventApply: false,    // 신청여부
        isChkAll: false,        // 전체체크 여부
        chkAmountFull: [true, true],      // 경품 소진 여부 (3,4)
        chkContent: [true, false]          // 경품 체크여부 (3,4)
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
        let { chkAmountFull } = this.state;
        let params1 = {};
        params1.eventId = eventId; // 이벤트 ID

        try {
            params1.seq = 3;
            params1.eventType = 3;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[0] = false;
            }
        } catch (e) {
            console.log(e);
            chkAmountFull[0] = false;
        }

        try {
            params1.seq = 4;
            params1.eventType = 4;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[1] = false;
            }
        } catch (e) {
            console.log(e);
            chkAmountFull[1] = false;
        }

        this.setState({
            chkAmountFull: chkAmountFull
        });

    }

    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions, event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
        const { chkAmountFull, chkContent } = this.state;

        if (!chkContent[0] && !chkContent[1]) {
            common.info("신청하실 수·활·북을 선택해주세요");
            return;
        }

        if(!chkAmountFull[0] && !chkAmountFull[1]){
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

                let eventAnswerDesc = chkContent[0] ? contentNameArr[0] : '';
                if (chkContent[1]) eventAnswerDesc += '^||^' + contentNameArr[1];
                const eventAnswer = {
                    eventAnswerDesc: eventAnswerDesc,
                    chkContent: this.state.chkContent
                };

                SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
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

    contentOnChange = (itemIdx) => {
        const { chkAmountFull } = this.state;
        const { chkContent } = this.state;

        // 신청 가능할 경우만 체크상태 변경
        if (chkAmountFull[itemIdx]) {
            chkContent[itemIdx] = !chkContent[itemIdx];
        }

        const checked = chkContent[itemIdx];    // 클릭한 항목 체크여부
        let newIsChkAll = false;
        let hasNotCheckContent = false;
        if (checked) {
            // 하나라도 체크안된게 있으면 모두선택 체크 해제
            for (let i=0; i<chkContent.length; i++) {
                if (!chkContent[i]) {
                    newIsChkAll = false;
                    hasNotCheckContent = true;
                    break;
                }
            }

            // 모든항목 체크되어 있으면 모두선택 체크
            if (!hasNotCheckContent) {
                newIsChkAll = true;
            }
        }

        this.setState({
            isChkAll: newIsChkAll,
            chkContent: chkContent
        })

    }

    chkAll = () => {
        const { isChkAll, chkAmountFull } = this.state;
        const { chkContent } = this.state;

        const newIsChkAll = !isChkAll;

        // 전체신청이 체크되었을 경우
        if(newIsChkAll){
            for(let i=0; i<chkContent.length; i++){
                // 신청가능한 상품만 체크
                if (chkAmountFull[i]) {
                    chkContent[i] = true;
                }
            }
            this.setState({chkContent: chkContent})
        }else{
            for(let i=0; i<chkContent.length; i++){
                // 신청가능한 상품만 체크 해제
                if (chkAmountFull[i]) {
                    chkContent[i] = false;
                }
            }
            this.setState({chkContent: chkContent});
        }
        this.setState({
            isChkAll: newIsChkAll,
            chkContent: chkContent
        })
    }

    render () {

        return (
			<section className="event210612">
                <div className="evtCont01">
                    <h1 className="blind">초등수학 수.활.북(수학 수업에 바로 활용하는 워크북!)을 보내드립니다.</h1>
                    <p>체계적으로 구성된 차시별 문제, 단원별 문제를<br />수학 수업에 유용하게 활용하실 수 있습니다.</p>
                    <div className="evtInfoWrap">
                        <span className="period"><em>2021</em>년 <em>6</em>월 <em>11</em>일 ~ <em>6</em>월 <em>23</em>일</span>
                        <span className="infoTxt">* 비상교육 지사를 통해 순차적으로 발송됩니다.</span>
                        <span className="infoTxt2">선착순<br />마감</span>
                    </div>
                    <div className="evtContWrap">
                        <strong className="conTit"><span className="blind">초등 수학 수업에 바로 활용하는 워크북</span></strong>
                        <div className="conInfoList">
                            <ul>
                                <li>차시별 마무리 학습을 위한 확인 문제와 익히기 문제 구성</li>
                                <li>수준별 수업에 활용 가능한 단원별 보충 문제와 심화 문제 구성</li>
                                <li>학습 내용을 종합적으로 평가 할 수 있는 단원 평가 수록</li>
                            </ul>
                            <span>* 초등 수학 수활북 PDF는 7월부터 교과서 자료실에서 무료로<br />다운로드 받으실 수 있습니다.</span>
                        </div>
                    </div>
                    <div className="evtFormWrap">
                        <div className="chkAllWrap">
                            <input type="checkbox" name="chkAll" id="chkAll" value="전체 선택" disabled={!!this.state.chkAmountFull[0] && !this.state.chkAmountFull[1]} onChange={this.chkAll} checked={this.state.isChkAll} />
                            <label htmlFor="chkAll">모두 선택하기</label>
                        </div>
                        <ul className="chkList">
                            <li>
                                <input type="checkbox" name="chk" id="chk01" value={0}  disabled={!this.state.chkAmountFull[0]} checked={this.state.chkContent[0]} onChange={() => this.contentOnChange(0)} /><label htmlFor="chk01"><span>초등 수학 3-1, 3-2</span></label>
                            </li>
                            <li>
                                <input type="checkbox" name="chk" id="chk02" value={1}  disabled={!this.state.chkAmountFull[1]} checked={this.state.chkContent[1]} onChange={() => this.contentOnChange(1)} /><label htmlFor="chk02"><span>초등 수학 4-1, 4-2</span></label>
                            </li>
                        </ul>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply } className="btnApply">신청하기</button>
                        </div>
                    </div>
                </div>
                <div className="evtCont02">
                    <p className="subTit">신청 시 <span>유의사항</span></p>
                    <ul>
                        <li><strong>선착순 신청</strong>으로, 수량 소진 시 조기 마감될 수 있습니다.<br />(비상교육 지사를 통해 순차 발송)</li>
                        <li>정확한 주소를 기입해주세요. (학교 주소, 수령처 포함: ex.교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</li>
                        <li>주소 기재가 잘못되어 반송된 교재는 다시 발송해드리지 않습니다.</li>
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
