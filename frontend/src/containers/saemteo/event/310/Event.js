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

class Event extends Component{

    constructor(props) {
        super(props);
        this.state = {
            // Amount1 ~ Amount2 교재 수량
            // 0 : 마감 / 1 : 신청
            storyLength : 0, // 길이 카운트
            storyContents  : '',
            StoryPageNo : 1, // 페이지
            StoryPageSize : 3, // 사이즈
            eventAnswerContents : [], // 응답
            eventAnswerCount : 0, // 해당 이벤트 응답 수
            StoryLogInInfo : this.props.loginInfo, // 접속 정보
            applyContent : '',
            checkContents: {
                check3: false,
                check4: false,
                check5: false,
                check6: false,
                check7: false,
                check8: false,
                check9: false,
                check10: false,
                check11: false
            },
            eventAmount: {
                amount3: true,
                amount4: true,
                amount5: true,
                amount6: true,
                amount7: true,
                amount8: true,
                amount9: true,
                amount10: true,
                amount11: true
            },
            endYn : false,
            eventCheckAnswer : '' // 신청한 교과서 목록
        };
        this.checkEventAmount();
    }

    componentDidMount = () => {

    };

    // 이벤트 수량 확인
    checkEventAmount = async () => {
        const { eventAnswer, eventId , SaemteoActions, BaseActions} = this.props;
        const params1 = {};
        params1.eventId = eventId; // 이벤트 ID
        let eventAmount = this.state.eventAmount

        BaseActions.openLoading();

        // 음악 3~4학년
        try {
            params1.seq = 3;
            params1.eventType = 3;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount3 = false;
            }
        }catch(e){eventAmount.amount3 = false;}
        // 음악 5~6학년
        try {
            params1.seq = 4;
            params1.eventType = 4;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount4 = false;
            }
        }catch(e){eventAmount.amount4 = false;}
        // 미술 3학년
        try {
            params1.seq = 5;
            params1.eventType = 5;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount5 = false;
            }
        }catch(e){eventAmount.amount5 = false;}
        // 미술 4학년
        try {
            params1.seq = 6;
            params1.eventType = 6;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount6 = false;
            }
        }catch(e){eventAmount.amount6 = false;}
        // 미술 5학년
        try {
            params1.seq = 7;
            params1.eventType = 7;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount7 = false;
            }
        }catch(e){eventAmount.amount7 = false;}
        // 미술 6학년
        try {
            params1.seq = 8;
            params1.eventType = 8;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount8 = false;
            }
        }catch(e){eventAmount.amount8 = false;}
        // 체육 3~4학년
        try {
            params1.seq = 9;
            params1.eventType = 9;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount9 = false;
            }
        }catch(e){eventAmount.amount9 = false;}
        // 체육 5~6학년
        try {
            params1.seq = 10;
            params1.eventType = 10;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount10 = false;
            }
        }catch(e){eventAmount.amount10 = false;}
        // 실과 3~4학년
        try {
            params1.seq = 11;
            params1.eventType = 11;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                eventAmount.amount11 = false;
            }
        }catch(e){eventAmount.amount11 = false;}

        this.setState({
            eventAmount: eventAmount
        });

        setTimeout(()=>{
            BaseActions.closeLoading();
        }, 1000);//의도적 지연.
    };

    onCheckContent = async (targetId) => {
        const {loginInfo, logged, history, BaseActions, eventId, SaemteoActions} = this.props;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return false;
        }else{
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }
        }

        let obj = this.state.checkContents;

        if(this.state.checkContents["check"+targetId]){
            obj["check"+targetId] = false;
            document.getElementById('allCheck').checked = false;
        }else{
            const params1 = {};
            params1.eventId = eventId; // 이벤트 ID
            let checkAmount = true;
            let eventAmount = this.state.eventAmount
            // 수량이 남아있는지 체크
            try {
                params1.seq = targetId;
                params1.eventType = targetId;
                let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
                let response2 = await api.eventCheckLimitAmount({...params1});
                let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
                if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                    eventAmount["amount"+targetId] = false;
                    checkAmount = false;
                }
            }catch(e){
                eventAmount["amount"+targetId] = false;
                checkAmount=false;
            }

            this.setState({
                eventAmount: eventAmount
            });

            if(checkAmount){
                obj["check"+targetId] = true;
            }else{
                obj["check"+targetId] = false;
            }
        }

        this.setState({
            checkContents: obj
        });
    };

    // all check
    onAllCheck = (e) => {
        const {loginInfo, logged, history, BaseActions} = this.props;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return false;
        }else{
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }
        }

        if(e.target.checked){
            this.allCheck();
        }else{
            this.allUncheck();
        }
    }

    // all check
    allCheck = async () => {
        // 수량체크 확인
        //await this.checkEventAmount();

        let obj = this.state.checkContents;
        let eventAmount = this.state.eventAmount;

        for(let i=3; i<=11;i++){
            if(eventAmount["amount"+i]){
                obj["check"+i] = true;
            }else{
                obj["check"+i] = false;
            }
        }

        this.setState({
            checkContents: obj
        });
    }

    // all uncheck
    allUncheck = async () => {
        let obj = this.state.checkContents;

        for(let i=3; i<=11;i++){
            obj["check"+i] = false;
        }

        this.setState({
            checkContents: obj
        });
    }

    // 수량종료 체크
    endCheck = () => {
        let result = true;
        let obj = this.state.eventAmount;

        for(let i=3; i<=11;i++){
            if(obj["amount"+i]){
                result = false;
            }
        }
        return result;
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
            if(loginInfo.certifyCheck == 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청 하셨습니다.");
                }else if(response.data.code === '0') {

                    // 콘텐츠 선택 체크
                    let checkContents = this.state.checkContents;
                    let flag = true;
                    for(let i=3; i<=11; i++){
                        if(checkContents["check"+i]){
                           flag = false;
                           break;
                        }
                    }

                    // 수량이 남아있는지 체크
                    let endCheck = await this.endCheck();

                    if(endCheck){
                        common.error("활동집 수량이 마감되었습니다.");
                        return;
                    }
                    if(flag){
                        common.error("활동집을 선택하세요.");
                        return;
                    }
                    let eventAnswerArray = {};
                    eventAnswerArray.Q1 = checkContents;

                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
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

    render (){
        return (
            <section className="event200910">
                <div class="section1">
                   <img src="/images/events/2020/event200910/img01.jpg" alt="초등 수업에 필요한 오늘뭐하지? 활동집을 보내드립니다." />
                   <div class="blind">
                                <h1>초등 수업에 필요한 "오늘 뭐하지?" 활동집을 보내드립니다.</h1>
                                <p>초등 수업에 바로 쓸 수 있는 100여 가지 창의ㆍ융합 활동 모음집 !<br/>
                                "오늘 뭐하지?" 교과별 자료로 수업을 풍성하게 구성해보세요.</p>
                                <strong>2020년 9월 17일(목)~10월 16일(금)</strong>
                                <p>*선착순 마감 / 9월 21일부터 순차 발송</p>

                                <h3>"오늘 뭐하지?" 초등 활동집 소개</h3>
                                <ul>
                                    <li>수업에 바로 활용하는 100여 가지 자료</li>
                                    <li>교과서에서 볼 수 없는 활동,퀴즈,게임이 가득 !</li>
                                    <li>교과와 연계한 다채로운 활동지</li>
                                    <li>우리 반 아이들의 창의ㆍ융합적 사고력 UP!</li>
                                </ul>
                                <p>"오늘 뭐하지?" 활동집은 비바샘 교과서 자료실에서 PDF 파일로 다운로드 받으실 수 있습니다.</p>
							</div>
                </div>

                <div class="section2">
                    <img src="/images/events/2020/event200910/choice_tit.png" alt="초등 활동집 선택하기" />

                    <div class="all">
                        <input type="checkbox" id="allCheck" onChange={this.onAllCheck}/>
                        <label for="allCheck">전체선택</label>
                    </div>
                    

                    <div class="contents">
                        <img src="/images/events/2020/event200910/choiceBox1.png" alt="음악 수업"/>
                        <ul>
                            <li className={this.state.eventAmount.amount3 ? 'list01' : 'list01 deadline'}>
                                <input type="checkbox" id="mu34" checked={this.state.checkContents.check3} onChange={() => this.onCheckContent(3)}/>
                                <label for="mu34">음악 3~4학년</label>
                            </li>
                            <li className={this.state.eventAmount.amount4 ? 'list01' : 'list01 deadline'}>
                                <input type="checkbox" id="mu45" checked={this.state.checkContents.check4} onChange={() => this.onCheckContent(4)}/>
                                <label for="mu45">음악 5~6학년</label>
                            </li>
                        </ul>
                    </div>

                    <div class="contents contentsArt">
                        <img src="/images/events/2020/event200910/choiceBox2.png" alt="미술 수업"/>
                        <ul class="artUl">
                            <li className={this.state.eventAmount.amount7 ? 'list02' : 'list02 deadline'}>
                                <input type="checkbox" id="art5" checked={this.state.checkContents.check7} onChange={() => this.onCheckContent(7)}/>
                                <label for="art5">미술 5학년</label>
                            </li>
                            <li className={this.state.eventAmount.amount8 ? 'list02' : 'list02 deadline'}>
                                <input type="checkbox" id="art6" checked={this.state.checkContents.check8} onChange={() => this.onCheckContent(8)}/>
                                <label htmlFor="art6">미술 6학년</label>
                            </li>
                        </ul>
                        <ul>
                            <li className={this.state.eventAmount.amount5 ? 'list02' : 'list02 deadline'}>
                                <input type="checkbox" id="art3" checked={this.state.checkContents.check5} onChange={() => this.onCheckContent(5)}/>
                                <label for="art3">미술 3학년</label>
                            </li>
                            <li className={this.state.eventAmount.amount6 ? 'list02' : 'list02 deadline'}>
                                <input type="checkbox" id="art4" checked={this.state.checkContents.check6} onChange={() => this.onCheckContent(6)}/>
                                <label for="art4">미술 4학년</label>
                            </li>
                        </ul>
                    </div>

                    <div class="contents">
                        <img src="/images/events/2020/event200910/choiceBox3.png" alt="체육 수업"/>
                        <ul>
                            <li className={this.state.eventAmount.amount9 ? 'list03' : 'list03 deadline'}>
                                <input type="checkbox" id="ph34" checked={this.state.checkContents.check9} onChange={() => this.onCheckContent(9)}/>
                                <label for="ph34">체육 3~4학년</label>
                            </li>
                            <li className={this.state.eventAmount.amount10 ? 'list03' : 'list03 deadline'}>
                                <input type="checkbox" id="ph45" checked={this.state.checkContents.check10} onChange={() => this.onCheckContent(10)}/>
                                <label for="ph45">체육 5~6학년</label>
                            </li>
                        </ul>
                    </div>

                    <div class="contents contentsSk">
                        <img src="/images/events/2020/event200910/choiceBox4.png" alt="실과 수업"/>
                        <ul>
                            <li className={this.state.eventAmount.amount11 ? 'list04' : 'list04 deadline'}>
                                <input type="checkbox" id="sk34" checked={this.state.checkContents.check11} onChange={() => this.onCheckContent(11)}/>
                                <label for="sk34">실과 5~6학년</label>
                            </li>
                        </ul>
                    </div>
                    <div className="btn-wrap">
                        <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}>
                            <img src="/images/events/2020/event200910/btn_apply.png" alt="신청하기" />
                        </button>
                    </div>

                    <div class="blind">
                        <h3>"오늘 뭐하지?" 초등 활동집 선택하기</h3>

                        <ul>
                            <li><strong>오늘 뭐하지? 룰루랄라 신나는 음악 수업</strong></li>
                            <li>음악 3~4학년</li>
                            <li>음악 4~5학년</li>
                        </ul>

                        <ul>
                            <li><strong>오늘 뭐하지? 알록달록 재미있는 미술 수업</strong></li>
                            <li>미술 3학년</li>
                            <li>미술 4학년</li>
                            <li>미술 5학년</li>
                            <li>미술 6학년</li>
                        </ul>

                        <ul>
                            <li><strong>오늘 뭐하지? 폴짝폴짝 즐거운 체육 수업</strong></li>
                            <li>체육 3~4학년</li>
                            <li>체육 4~5학년</li>
                        </ul>

                        <ul>
                            <li><strong>오늘 뭐하지? 알쏭달쏭 호기심 실과 수업</strong></li>
                            <li>실과 5~6학년</li>
                        </ul>
                    </div>
                </div>

                <div class="section3">
                    <h1><img src="/images/events/2020/event200910/img03.jpg" alt="신청 시 유의사항" /></h1>
                    <div class="blind">
                        <p>신청 시 유의사항</p>
                        <ul>
                            <li>1인 1회, 9종 모두 신청 가능합니다.</li>
                            <li>9.30~10.3 추석 연휴로 인해 배송이 지연될 수 있습니다.</li>
                            <li>정확하지 않은 주소로 인해 반송된 물품은 재발송이 불가능합니다. 학교 번지수 및 수령처를 정확히 기재해 주세요.</li>
                            <li>배송에 필요한 정보는 서비스 업체에 공유됩니다. (성명,주소,전화번호 등 / (주)한진-사업자등록번호:201-81-02823)</li>
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
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
