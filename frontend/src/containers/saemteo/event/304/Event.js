import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            // Amount1 ~ Amount2 교재 수량
            // 0 : 마감 / 1 : 신청
            storyLength : 0, // 길이 카운트
            storyContents  : "",
            StoryPageNo : 1, // 페이지
            StoryPageSize : 10, // 사이즈
            eventAnswerContents : [], // 응답
            eventAnswerCount : 0, // 해당 이벤트 응답 수
            StoryLogInInfo : this.props.loginInfo, // 접속 정보
            eventViewAddButton : 1, // 더보기 ( 1 : 보임 / 0 : 안보임 )
            applyContent : '',
            contentLength : 0,
            eventAmount1 : 1,
            eventAmount2 : 1,
            eventAmount3 : 1,
            eventAmount4 : 1,
            eventAmount5 : 1,
            eventAmount6 : 1,
            eventAmount7 : 1,
            eventAmount8 : 1,
            eventAmount9 : 1,
            eventAmount10 : 1,
            eventAmount11 : 1,
            eventAmount12 : 1,
            eventAmount13 : 1,
            books: {
                book3: "국어 독서 기본(고1, 고2)",
                book4: "국어 문학 기본(고1, 고2)",
                book5: "국어 문학",
                book6: "물리학 Ⅰ",
                book7: "화학 Ⅰ",
                book8: "생명과학 Ⅰ",
                book9: "지구과학 Ⅰ",
                book10: "영어 독해 기본(고1, 고2)",
                book11: "영어 독해",
                book12: "영어 어법·어휘",
                book13: "한국지리",
                book14: "생활과 윤리",
                book15: "사회·문화"
            },
            checkBooks: {
                book3: false,
                book4: false,
                book5: false,
                book6: false,
                book7: false,
                book8: false,
                book9: false,
                book10: false,
                book11: false,
                book12: false,
                book13: false,
                book14: false,
                book15: false
            },
            checkBooksCnt: 0,
            checkBooksNm: "",
            check1: "",
            check2: "",
            check3: "",
            check4: "",
            checkVal: []
        };
        this.commentConstructorList();
        this.checkEventCount();
        this.checkEventAmount();
    }

    componentDidMount = () => {

    };

    // 이벤트 카운트 확인
    checkEventCount = async () => {
        const { event, eventId, loginInfo, history,  SaemteoActions, PopupActions, BaseActions } = this.props;
        event.eventId = eventId; // 이벤트 ID
        let response = await SaemteoActions.checkEventTotalJoin({...event});
        this.setState({
            eventAnswerCount : response.data.eventAnswerCount
        });

        if(this.state.eventAnswerCount > 10){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };

    // 이벤트 수량 확인
    checkEventAmount = async () => {
        const { eventAnswer, eventId , SaemteoActions} = this.props;
        const params1 = {};
        params1.eventId = eventId; // 이벤트 ID
        try {
            // 국어 독서 기본
            params1.seq = 3;
            params1.eventType = 3;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount1: 0});
            }
        }catch(e){this.setState({eventAmount1: 0});}

        try {
            // 국어 문학 기본
            params1.seq = 4;
            params1.eventType = 4;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount2: 0});
            }
        }catch(e){this.setState({eventAmount2: 0});}

        try {
            // 국어 문학
            params1.seq = 5;
            params1.eventType = 5;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount3: 0});
            }
        }catch(e){this.setState({eventAmount3: 0});}

        try {
            // 물리학
            params1.seq = 6;
            params1.eventType = 6;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount4: 0});
            }
        }catch(e){this.setState({eventAmount4: 0});}

        try {
            // 화학
            params1.seq = 7;
            params1.eventType = 7;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount5: 0});
            }
        }catch(e){this.setState({eventAmount5: 0});}

        try {
            // 생명과학
            params1.seq = 8;
            params1.eventType = 8;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount6: 0});
            }
        }catch(e){this.setState({eventAmount6: 0});}

        try {
            // 지구과학
            params1.seq = 9;
            params1.eventType = 9;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount7: 0});
            }
        }catch(e){this.setState({eventAmount7: 0});}

        try {
            // 영어 독해 기본
            params1.seq = 10;
            params1.eventType = 10;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;

            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount8: 0});
            }
        }catch(e){this.setState({eventAmount8: 0});}

        try {
            // 영어 독해
            params1.seq = 11;
            params1.eventType = 11;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount9: 0});
            }
        }catch(e){this.setState({eventAmount9: 0});}

        try {
            // 영어 어법 어휘
            params1.seq = 12;
            params1.eventType = 12;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount10: 0});
            }
        }catch(e){this.setState({eventAmount10: 0});}

        try {
            // 한국지리
            params1.seq = 13;
            params1.eventType = 13;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount11: 0});
            }
        }catch(e){this.setState({eventAmount11: 0});}

        try {
            // 생활과 윤리
            params1.seq = 14;
            params1.eventType = 14;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount12: 0});
            }
        }catch(e){this.setState({eventAmount12: 0});}

        try {
            // 사회 문화
            params1.seq = 15;
            params1.eventType = 15;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                this.setState({eventAmount13: 0});
            }
        }catch(e){this.setState({eventAmount13: 0});}
    };

    setApplyContent = (e) => {
        if(e.target.value.length > 50){
            common.info("50자 이내로 입력해 주세요.");
        }else{
            this.setState({
                contentLength: e.target.value.length,
                applyContent: e.target.value
            });
        }
    };

    // 댓글 출력
    commentConstructorList = async  () => {
        const { event, eventId, answerPage, loginInfo,  SaemteoActions } = this.props;
        answerPage.pageNo = this.state.StoryPageNo;
        answerPage.pageSize = this.state.StoryPageSize;
        event.eventId = eventId; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 1
        event.memberId = loginInfo.memberId; // 멤버 ID
        const responseList =  await api.getEventAnswerList({...event, answerPage});
        const responsedata = responseList.data.eventJoinAnswerList;
        this.setState({
            eventAnswerContents : responsedata,
            StoryPageSize : this.state.StoryPageSize + 5,
        });

        if(this.state.eventAnswerCount < this.state.StoryPageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }
    };

    // 댓글 더보기
    commentListAddAction  = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 교사 인증
            if(loginInfo.certifyCheck == 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 초기화
            let obj = [];
            for(let i=3; i<= 15; i++){
                if(this.state.checkBooks["book"+i]){
                    obj.push(i);
                }
            }

            if(obj.length == 0) {
                common.info("교재를 선택해주세요.");
                return;
            }
            if(this.state.applyContent.trim() == "") {
                common.info("이 책을 선택한 이유를 작성해 주세요.");
                return;
            }
            // 로그인시
            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 신청 하셨습니다.");
                }else if(response.data.code === '0') {
                    let check1 = '';
                    let check2 = '';
                    let check3 = '';
                    let check4 = '';
                    if(obj.length > 0){
                        check1 = obj[0];
                    }
                    if(obj.length > 1){
                        check1 = obj[1];
                    }
                    if(obj.length > 2){
                        check1 = obj[2];
                    }
                    if(obj.length > 3){
                        check1 = obj[3];
                    }

                    let eventAnswerArray = {};

                    eventAnswerArray.check1 = check1;
                    eventAnswerArray.check2 = check2;
                    eventAnswerArray.check3 = check3;
                    eventAnswerArray.check4 = check4;
                    eventAnswerArray.applyContent = this.state.applyContent.trim();

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
    
    // 체크이벤트
    onBookChange = (e) => {
        const { logged, history, BaseActions, loginInfo } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 하신 후 응모하실 수 있습니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 교사 인증
            if(loginInfo.certifyCheck == 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            let value = e.target.value;
            let obj = this.state.checkBooks;

            let checked = e.target.checked;

            if(checked){
                if(this.state.checkBooksCnt < 4){
                    obj["book"+value] = true;
                    this.setState({checkBooks: obj});
                    this.setState({checkBooksCnt: this.state.checkBooksCnt + 1});
                }else{
                    common.info("최대 4종의 교재를 선택하실수 있습니다.");
                }
            }else{
                obj["book"+value] = false;
                this.setState({checkBooks: obj});
                this.setState({checkBooksCnt: this.state.checkBooksCnt - 1});
            }
        }

    };

    render (){
        return (
            <section className="event200708">
                <h1><img src="/images/events/2020/event200708/img01.png" alt="수능 기출 문제집, Full수록을 보내드립니다." /></h1>
                <div className="blind">수능 출제 유형을 한눈에 파악하고, 체계적인 학습법을 제시하는 비상교육의 수능 필수 기출문제집 Full수록을 만나보세요.
                    원하시는 과목을 선택하여 신청하시면 재직하시는 학교로 보내드립니다.
                    2020.07.13 ~ 07.19 (선착순 마감)
                    * 7월 24일부터 순차 발송
                    <br/>
                    <h5>비상교육 &gt;Full수록&lt; 소개</h5>
                    <ul>
                        <li>수능 필수 기출문제 완벽 탑재!</li>
                        <li>30일 내 완성의 체계적인 학습 플랜 제시</li>
                        <li>수능 기출 유형을 한눈에 파악할 수 있는 수능 대비서</li>
                        <li>직관적인 해설과 정리로 실전 감각 UP!</li>
                    </ul>
                </div>
                <div className="link-box">
                    <img src="/images/events/2020/event200708/img02.png" alt="Full수록 체험북 미리보기" />
                    <ul className="">
                        <li><a href="https://dn.vivasam.com/ebook/fullebook/korean/index.html" target="_blank"><span className="blind">Full수록 문학 자세히보기</span></a></li>
                        <li><a href="https://dn.vivasam.com/ebook/fullebook/english/index.html" target="_blank"><span className="blind">Full수록 영어 독해 자세히보기</span></a></li>
                        <li><a href="https://dn.vivasam.com/ebook/fullebook/social/index.html" target="_blank"><span className="blind">Full수록 사회·문화 자세히보기</span></a></li>
                        <li><a href="https://dn.vivasam.com/ebook/fullebook/science/index.html" target="_blank"><span className="blind">Full수록 지구과학 자세히보기</span></a></li>
                    </ul>
                </div>

                <div className="desc-box type1">
                    <h2><img src="/images/events/2020/event200708/tit.png" alt="Full수록 선택하기, 종류별 1권씩, 최대 4종의 교재를 선택하실 수 있습니다." /></h2>
                    <div className="list">
                        <div>
                            <ul>
                                <li>
                                    <div className="desc type1">
                                        <img src="/images/events/2020/event200708/item01.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio1" checked={this.state.checkBooks['book3']} disabled={!(this.state.eventAmount1)} onChange={this.onBookChange} value="3"/>
                                        <label htmlFor="radio1"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount1 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type2">
                                        <img src="/images/events/2020/event200708/item02.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio2" checked={this.state.checkBooks['book5']} disabled={!(this.state.eventAmount3)} onChange={this.onBookChange} value="5"/>
                                        <label htmlFor="radio2"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount3 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type3">
                                        <img src="/images/events/2020/event200708/item03.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio3" checked={this.state.checkBooks['book4']} disabled={!(this.state.eventAmount2)} onChange={this.onBookChange} value="4"/>
                                        <label htmlFor="radio3"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount2 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                            </ul>
                            <ul>
                                <li>
                                    <div className="desc type4">
                                        <img src="/images/events/2020/event200708/item04.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio4" checked={this.state.checkBooks['book6']} disabled={!(this.state.eventAmount4)} onChange={this.onBookChange} value="6"/>
                                        <label htmlFor="radio4"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount4 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type5">
                                        <img src="/images/events/2020/event200708/item05.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio5" checked={this.state.checkBooks['book8']} disabled={!(this.state.eventAmount6)} onChange={this.onBookChange} value="8"/>
                                        <label htmlFor="radio5"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount6 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type6">
                                        <img src="/images/events/2020/event200708/item06.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio6" checked={this.state.checkBooks['book7']} disabled={!(this.state.eventAmount5)} onChange={this.onBookChange} value="7"/>
                                        <label htmlFor="radio6"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount5 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type7">
                                        <img src="/images/events/2020/event200708/item07.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio7" checked={this.state.checkBooks['book9']} disabled={!(this.state.eventAmount7)} onChange={this.onBookChange} value="9"/>
                                        <label htmlFor="radio7"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount7 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                            </ul>
                            <ul>
                                <li>
                                    <div className="desc type8">
                                        <img src="/images/events/2020/event200708/item08.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio8" checked={this.state.checkBooks['book10']} disabled={!(this.state.eventAmount8)} onChange={this.onBookChange} value="10"/>
                                        <label htmlFor="radio8"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount8 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type9">
                                        <img src="/images/events/2020/event200708/item09.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio9" checked={this.state.checkBooks['book12']} disabled={!(this.state.eventAmount10)} onChange={this.onBookChange} value="12"/>
                                        <label htmlFor="radio9"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount10 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type10">
                                        <img src="/images/events/2020/event200708/item10.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio10" checked={this.state.checkBooks['book11']} disabled={!(this.state.eventAmount9)} onChange={this.onBookChange} value="11"/>
                                        <label htmlFor="radio10"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount9 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                            </ul>
                            <ul>
                                <li>
                                    <div className="desc type11">
                                        <img src="/images/events/2020/event200708/item11.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio11" checked={this.state.checkBooks['book13']} disabled={!(this.state.eventAmount11)} onChange={this.onBookChange} value="13"/>
                                        <label htmlFor="radio11"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount11 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type12">
                                        <img src="/images/events/2020/event200708/item12.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio12" checked={this.state.checkBooks['book15']} disabled={!(this.state.eventAmount13)} onChange={this.onBookChange} value="15"/>
                                        <label htmlFor="radio12"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount13 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <div className="desc type13">
                                        <img src="/images/events/2020/event200708/item13.jpg" alt=""/>
                                        <input type="checkbox" name="choicebook" id="radio13" checked={this.state.checkBooks['book14']} disabled={!(this.state.eventAmount12)} onChange={this.onBookChange} value="14"/>
                                        <label htmlFor="radio13"></label>
                                        { /* 부분 렌더링 */
                                            (this.state.eventAmount12 === 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                                            <div className="badge">
                                                <img src="/images/events/2020/event200708/badge_m.png" alt="신청 마감"/>
                                            </div>
                                        }
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h3><img src="/images/events/2020/event200708/tit_2.png" alt="이 책을 선택한 이유를 작성해 주세요" /></h3>
                    <div className="input_wrap">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                cols="1"
                                rows="10"
                                maxLength="51"
                                value={this.state.applyContent}
                                onChange={this.setApplyContent}
                                placeholder="이 책을 선택하신 이유를 적어주세요. (50자 이내)"
                                className="textarea">
                            </textarea>
                        <div className="count_wrap">
                            <p className="count">(<span>{this.state.contentLength}</span>/50)</p>
                        </div>
                    </div>

                    <div className="btn-wrap">
                        <button type="button" id="eApply" className="btn_apply"  onClick={this.eventApply}>
                            <img src="/images/events/2020/event200708/btn_apply.png" alt="신청하기" /></button>
                    </div>
                </div>

                <div className="comment_wrap">
                    <div className="comment">
                        <EventList eventlists={this.state.eventAnswerContents} loginInfo={this.state.StoryLogInInfo} StoryUpdateContents={this.state.StoryUpdateContents} deleteCommentChange={this.deleteCommentChange} updateCommentChange={this.updateCommentChange}/>
                    </div>

                    <div className="btn-wrap">
                        <button type="button" id="eMore" className="btn_more" style={{ visibility : this.state.eventViewAddButton == 1 ? 'visible' : 'hidden' }} onClick={this.commentListAddAction}>
                            <img src="/images/events/2020/event200708/btn_more.png" alt="더보기" /></button>
                    </div>
                </div>

            </section>
        )
    }
}

// 리스트 목록 UL 출력
const EventList = ({eventlists, loginInfo , StoryUpdateContents}) => {
    const eventList = eventlists.map(eventList => {
        return (<EventListApply {...eventList} loginInfo={loginInfo} StoryUpdateContents={StoryUpdateContents} />);
    });
    return (
        <ul>
            {eventList}
        </ul>
    );
};


class EventListApply extends Component{

    constructor(props) {
        super(props);
        this.state = {
            member_id : this.props.member_id, // 멤버 아이디
            event_id : this.props.event_id, // eventId
            event_answer_desc : this.props.event_answer_desc, // 응답문항
            reg_dttm : this.props.reg_dttm, // 등록일
            loginInfo : this.props.loginInfo, // 로그인 정보
            BaseActions : this.props.BaseActions, // BaseAction
            StoryUpdateContents : this.props.StoryUpdateContents, // 컨텐츠
            eventType : "", // 이벤트 타입
            eventName : "", // 이벤트 응모자
            eventRegDate : "", // 이벤트 등록일
            eventContents : "", // 이벤트 내용
            eventLength : "" // 이벤트 길이
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id).substring(1,4) + "***"; // 이벤트 이름
        let eventSetRegDate = JSON.stringify(this.state.reg_dttm).replace(/\"/g, ""); // 이벤트 등록일
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let eventSetContents = JSON.stringify(this.state.event_answer_desc).substring(1,eventSetContentLength-1); // 이벤트 내용

        eventSetContents = eventSetContents.replace(/\\r\\n/gi, '<br/>');
        eventSetContents = eventSetContents.replace(/\\n/gi, '<br/>');

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents : eventSetContents
        });

    };

    render(){
        return (
            <li><strong>{this.state.eventName}  선생님</strong>
                <p dangerouslySetInnerHTML = {{__html: this.state.eventContents}}></p>
            </li>
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