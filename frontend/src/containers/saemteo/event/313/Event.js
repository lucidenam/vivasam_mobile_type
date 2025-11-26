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
            {no:1, word: '교사', chkState: false, contentLength: 0, applyContent: ''},
            {no:2, word: '스승', chkState: false, contentLength: 0, applyContent: ''},
            {no:3, word: '제자', chkState: false, contentLength: 0, applyContent: ''},
            {no:4, word: '학생', chkState: false, contentLength: 0, applyContent: ''},
            {no:5, word: '동료', chkState: false, contentLength: 0, applyContent: ''},
            {no:6, word: '친구', chkState: false, contentLength: 0, applyContent: ''},
            {no:7, word: '가르침', chkState: false, contentLength: 0, applyContent: ''},
            {no:8, word: '인사', chkState: false, contentLength: 0, applyContent: ''},
            {no:9, word: '칭찬', chkState: false, contentLength: 0, applyContent: ''},
            {no:10, word: '숙제', chkState: false, contentLength: 0, applyContent: ''},
            {no:11, word: '학교', chkState: false, contentLength: 0, applyContent: ''},
            {no:12, word: '교무실', chkState: false, contentLength: 0, applyContent: ''},
            {no:13, word: '졸업', chkState: false, contentLength: 0, applyContent: ''},
            {no:14, word: '입학', chkState: false, contentLength: 0, applyContent: ''},
            {no:15, word: '새 학기', chkState: false, contentLength: 0, applyContent: ''},
            {no:16, word: '방학', chkState: false, contentLength: 0, applyContent: ''},
            {no:17, word: '교실', chkState: false, contentLength: 0, applyContent: ''},
            {no:18, word: '운동장', chkState: false, contentLength: 0, applyContent: ''},
            {no:19, word: '보건실', chkState: false, contentLength: 0, applyContent: ''},
            {no:20, word: '급식', chkState: false, contentLength: 0, applyContent: ''},
            {no:21, word: '교과서', chkState: false, contentLength: 0, applyContent: ''},
            {no:22, word: '수업', chkState: false, contentLength: 0, applyContent: ''},
            {no:23, word: '점심 시간', chkState: false, contentLength: 0, applyContent: ''},
            {no:24, word: '쉬는 시간', chkState: false, contentLength: 0, applyContent: ''},
            {no:25, word: '종소리', chkState: false, contentLength: 0, applyContent: ''},
            {no:26, word: '칠판', chkState: false, contentLength: 0, applyContent: ''},
            {no:27, word: '책상', chkState: false, contentLength: 0, applyContent: ''},
            {no:28, word: '가방', chkState: false, contentLength: 0, applyContent: ''},
            {no:29, word: '사물함', chkState: false, contentLength: 0, applyContent: ''},
            {no:30, word: '국어', chkState: false, contentLength: 0, applyContent: ''},
            {no:31, word: '영어', chkState: false, contentLength: 0, applyContent: ''},
            {no:32, word: '수학', chkState: false, contentLength: 0, applyContent: ''},
            {no:33, word: '사회', chkState: false, contentLength: 0, applyContent: ''},
            {no:34, word: '과학', chkState: false, contentLength: 0, applyContent: ''},
            {no:35, word: '역사', chkState: false, contentLength: 0, applyContent: ''},
            {no:36, word: '한문', chkState: false, contentLength: 0, applyContent: ''},
            {no:37, word: '음악', chkState: false, contentLength: 0, applyContent: ''},
            {no:38, word: '미술', chkState: false, contentLength: 0, applyContent: ''},
            {no:39, word: '체육', chkState: false, contentLength: 0, applyContent: ''},
            {no:40, word: '지식', chkState: false, contentLength: 0, applyContent: ''},
            {no:41, word: '노력', chkState: false, contentLength: 0, applyContent: ''},
            {no:42, word: '진로', chkState: false, contentLength: 0, applyContent: ''},
            {no:43, word: '보람', chkState: false, contentLength: 0, applyContent: ''},
            {no:44, word: '우정', chkState: false, contentLength: 0, applyContent: ''},
            {no:45, word: '소통', chkState: false, contentLength: 0, applyContent: ''},
            {no:46, word: '꿈', chkState: false, contentLength: 0, applyContent: ''},
            {no:47, word: '지혜', chkState: false, contentLength: 0, applyContent: ''},
            {no:48, word: '그 밖에...', chkState: false, contentLength: 0, applyContent: ''},
        ],
        selWordData: [],
        isEventApply: false
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this.eventApplyCheck();
    };

    eventApplyCheck = async() => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
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
                    // 입력값 확인
                    let selWordData = this.state.selWordData;
                    if(selWordData.length == 0){
                        common.info("낱말을 1개 이상 선택해 주세요.");
                        return;
                    }
                    let validate = true;

                    for(let i=0; i < selWordData.length; i++){
                        if(selWordData[i].applyContent.trim() === ''){
                            validate = false;
                            break;
                        }
                    }

                    if(!validate){
                        common.info("선택하신 낱말의 정의를 입력해 주세요.");
                        return;
                    }

                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    let eventAnswerArray = {};
                    eventAnswerArray.selWordData = selWordData;
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
        }

        if(this.state.isEventApply){
            common.error("이미 신청하셨습니다.");
            return false;
        }

        const newData = data.map( item => {
            if(item.no === itemKey) {
                if(!item.chkState && this.state.selWordData.length == 5){
                    common.info('낱말은 5개 까지 선택 가능합니다.');
                    return item;
                }else{
                    return {
                        ...item,
                        chkState: !item.chkState
                    }
                }
            } else {
                return item;
            }
        });

        let chkData = this.state.selWordData;

        newData.forEach((item) => {
            if(item.no === itemKey) {
                if(item.chkState === true){
                    chkData.push(item);
                }else{
                    for(let i=0; i<chkData.length; i++){
                        if(chkData[i].no === item.no){
                            chkData.splice(i,1);
                            break;
                        }
                    }
                }
            }
        });

        this.setState({
            data: newData,
            selWordData: chkData
        });

    }

    setApplyContent = (itemKey, e) => {
        const { selWordData } = this.state;
        if(e.target.value.length > 25) {
            common.info("25자 이내로 입력해 주세요.");
        }else{
            const newData = selWordData.map( item => {
                if(item.no === itemKey) {
                    return {
                        ...item,
                        contentLength: e.target.value.length,
                        applyContent: e.target.value
                    }
                } else {
                    return item;
                }
            });

            this.setState({
                selWordData: newData
            });
        }
    };

    clickText = (e) => {
        common.info("낱말을 선택해 주세요.");
    }

    render() {
        const { data, selWordData } = this.state;
        return (
            <section className="event201028">
                <div className="evtCont01">
                    <h1><img src="/images/events/2020/event201028/img01.jpg" alt="전국 선생님이 만드는 학교 낱말 사전" /></h1>
                    <div className="blind">
                        <p>
                            <strong>선생님께 학교, 새 학기, 가르침이란 무엇인가요?</strong><br />
                            학교와 관련된 낱말을 선택하고, 선생님만의 정의를 작성해 주세요.<br />
                            전국 선생님이 함께 만든 학교 낱말 사전은 2021년 비바샘을 통해 공개됩니다.
                        </p>
                        <ul>
                            <li><strong>참여기간</strong><span>2020년 11월 4일(수) ~ 11월 25일(수)</span></li>
                            <li><strong>당첨자 발표</strong><span>2020년 11월 30일(월)</span></li>
                            <li><strong>당첨 선물</strong><span>5명 신세계 상품권 5만원, 10명 휴대용 가습기, 30명 스타벅스 아메리카노</span></li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="inner">
                        <h2><img src="/images/events/2020/event201028/tit01.png" alt="원하는 낱말을 선택해 주세요.(5개까지 선택 가능)" /></h2>
                        <div className="evtWordWrap">
                            {
                                data.map( item => {
                                    return <span key={ item.no } className="word">
                                        <input type="checkbox" id={`chk${ item.no }`} onChange={ () => this.contentOnChange(item.no) } checked={item.chkState}/><label for={`chk${ item.no }`}>{ item.word }</label>
                                    </span>
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="inner">
                        <h2><img src="/images/events/2020/event201028/tit02.png" alt="선생님만의 정의를 작성해주세요.(각 25자이내)" /></h2>
                        <div className="evtTxtWrap">
                            {
                                selWordData.map( item => {
                                    return <dl key={ item.no } className="selItem">
                                                 <dt className="selTxt" onClick={this.clickText}>{ item.word }</dt>
                                                 <dd>
                                                    <div className="evtAreaWrap">
                                                        <textarea
                                                            rows="2"
                                                            maxLength="25"
                                                            value={item.applyContent}
                                                            onChange={this.setApplyContent.bind(this, item.no)}>
                                                        </textarea>
                                                    </div>
                                                    <span className="txtInfo"><em>{item.contentLength}</em>/25</span>
                                                 </dd>
                                            </dl>
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="evtCont04">
                    <div className="inner">
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply }><img src="/images/events/2020/event201028/btn_apply.png" alt="참여하기" /></button>
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