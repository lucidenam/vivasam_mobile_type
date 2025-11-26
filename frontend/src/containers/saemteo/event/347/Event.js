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


const example1Arr = ['초등 (1~3학년)', '초등 (4~6학년)', '중학', '고등', '전체'];

const example2Arr = ['체험 학습을 위한 정보, 활동지', '주제별 이론 교육 자료', '캠페인, 프로젝트 활동을 위한 수업 가이드', '기타'];

class Event extends Component{

    state = {
        isEventApply: false,
        answer1IdxArr: [],
        answer1Comment : '',
        answer1CommentLength : 0, // 답변1의 길이 카운트
        answer2Idx: -1,
        answer2Etc: '',
        enableAnswer2Etc: false,

        pageNo : 1, // 페이지
        pageSize : 10, // 사이즈
        eventAnswerContents : [], // 이벤트 참여내용
        eventAnswerCount : 0, // 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
    }
    
    componentDidMount = async() => {
        const { BaseActions } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
            await this.commentConstructorList(); // 댓글 목록 조회
            await this.checkEventCount();   // 이벤트 참여자 수 조회
        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const { event, SaemteoActions } = this.props;
        let response = await SaemteoActions.checkEventTotalJoin({...event});

        this.setState({
            eventAnswerCount : response.data.eventAnswerCount
        });

        // 최초 조회시 전체건수가 10건이상이면 더보기 버튼 표시
        if(this.state.eventAnswerCount > 10){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };

    // 댓글 출력
    commentConstructorList = async  () => {
        const { event, eventId, answerPage, loginInfo, SaemteoActions } = this.props;
        const {pageNo, pageSize} = this.state;

        answerPage.pageNo = pageNo;
        answerPage.pageSize = pageSize;
        event.eventId = eventId; // 이벤트 ID
        event.eventAnswerSeq = 2; // 해당 이벤트 Seq는 1
        event.memberId = loginInfo.memberId; // 멤버 ID

        const responseList =  await api.getEventAnswerList({...event, answerPage});
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.eventAnswerCount < this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 조회가 완료되면 다음 조회할 건수 설정
        this.setState({
            eventAnswerContents : eventJoinAnswerList,
            pageSize : this.state.pageSize + 10,
        });

    };

    // 댓글 더보기
    commentListAddAction  = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 이벤트 신청 검사
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

    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions, event, eventId, handleClick, loginInfo} = this.props;
        
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

                const {answer1IdxArr, answer2Idx} = this.state;
                let {answer1Comment, answer2Etc} = this.state;
                answer1Comment = answer1Comment.trim();
                answer2Etc = answer2Etc.trim();

                if (answer1IdxArr.length === 0 || answer1Comment.length === 0 || answer2Idx < 0 || (answer2Idx === 3 && !answer2Etc)) {
                    this.setState({
                        answer1Comment: answer1Comment,
                        answer1CommentLength: answer1Comment.length,
                        answer2Etc: answer2Etc
                    });
                    common.error("환경 교육과 관련된 정보를 입력해 주세요.");
                    return;
                }

                // 답변1
                let answer1Txt;
                if (answer1IdxArr.includes(4)) {
                    answer1Txt = example1Arr[4];
                } else {
                    let answer1TxtArr = answer1IdxArr.map((val) => example1Arr[val]);
                    answer1Txt = answer1TxtArr.join(',');
                }
                answer1Txt += '/' + answer1Comment;

                // 답변2
                let answer2Txt = example2Arr[answer2Idx];
                if (answer2Idx === 3) {
                    answer2Txt += '/' + answer2Etc;
                }

                const eventAnswer = {
                    answer1 : answer1Txt,
                    answer2 : answer2Txt
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

    setAnswer1Comment = (e) => {
        let comment = e.target.value;
        let commentLength = comment.length;

        if (commentLength > 2000) {
            common.info("2000자 이내로 입력해 주세요.");
        } else {
            this.setState({
                answer1Comment: comment,
                answer1CommentLength: commentLength
            });
        }
    };

    onAnswer1 = e => {
        const {answer1IdxArr} = this.state;

        const checked = e.target.checked;
        const answer1Idx = Number(e.target.value);

        // value === 4 일 경우 전체 체크/해제
        if (answer1Idx === 4) {
            if (checked) {
                this.setState({
                    answer1IdxArr: [0,1,2,3,4]
                });
            } else {
                this.setState({
                    answer1IdxArr: []
                });
            }
            return;
        }

        let newAnswer1IdxArr = answer1IdxArr;
        const included = answer1IdxArr.includes(answer1Idx);
        if (checked) {
            if (!included) {
                newAnswer1IdxArr = answer1IdxArr.concat([answer1Idx]).sort();
            }
            // 초등저학년, 초등고학년, 중등, 고등 모두 선택되어 있을 경우 '전체' 추가
            if (newAnswer1IdxArr.includes(0) && newAnswer1IdxArr.includes(1) && newAnswer1IdxArr.includes(2) && newAnswer1IdxArr.includes(3)) {
                newAnswer1IdxArr.push(4)
            }

        } else {
            if (included) {
                const idx = answer1IdxArr.indexOf(answer1Idx);
                newAnswer1IdxArr = answer1IdxArr.slice(0, idx).concat(answer1IdxArr.slice(idx + 1)).sort();
            }

            // '전체' 가 있을 경우 삭제
            if (newAnswer1IdxArr.includes(4)) {
                const idxAll = newAnswer1IdxArr.indexOf(4);
                newAnswer1IdxArr = newAnswer1IdxArr.slice(0, idxAll).concat(newAnswer1IdxArr.slice(idxAll + 1)).sort();
            }
        }

        this.setState({
            answer1IdxArr: newAnswer1IdxArr
        });

    }

    onAnswer2 = e => {
        const answer2Idx = Number(e.target.value)

        let enableAnswer2Etc = false;
        let answer2Etc = '';
        if (answer2Idx === 3) {
            enableAnswer2Etc = true;
            answer2Etc = this.state.answer2Etc
        }

        this.setState({
            answer2Idx: answer2Idx,
            answer2Etc: answer2Etc,
            enableAnswer2Etc: enableAnswer2Etc
        });
    }

    onAnswer2Etc = e => {
        this.setState({
            answer2Etc: e.target.value
        });
    }

    render () {
        const { answer1IdxArr, answer1Comment, answer1CommentLength, answer2Idx, answer2Etc, enableAnswer2Etc, eventAnswerContents, eventViewAddButton } = this.state

        return (
			<section className="event210611">
                <div className="evtCont01">
                    <h1><span className="blind">환경 교육, 어떻게 가르치면 좋을까요?</span></h1>
                    <p><strong>학교 현장에 가장 필요한 혹은<br />선생님이 원하는 환경 교육은 무엇인가요?</strong><br />다양한 의견을 남겨주시면,<br />가치 있는 선물을 보내드립니다.</p>
                    <span className="period"><em>2021</em>년 <em>6</em>월 <em>11</em>일(금) ~ <em>7</em>월 <em>9</em>일(금)</span>
                    <span>당첨자 발표 : 2021년 7월 14일(수)</span>
                    <div className="blind">
                        <span>당첨자 혜택</span>
                        <ul>
                            <li>제로웨이스트 키트 5명</li>
                            <li>미니 식물 키트 100명</li>
                            <li>스타벅스 아이스 카페라떼 30명</li>
                        </ul>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">응모하기</span></button>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="evtFormWrap">
                        <div className="formItem">
                            <p className="formQ">1. 환경 교육에 대해 이야기해 주세요!</p>
                            <div className="formA">
                                <div className="chkWrap">
                                {
                                    example1Arr.map((item, idx) => {
                                        return (
                                            <span key={`evtChk${idx}`} className="chk">
                                                <input type="checkbox" name="evtChk" id={`chk0${idx + 1}`} value={idx} onChange={ this.onAnswer1 } checked={answer1IdxArr.includes(idx)}/>
                                                <label htmlFor={`chk0${idx + 1}`}>{ item }</label>
                                            </span>
                                        )
                                    })
                                }
                                </div>
                                <span className="subQ">초·중·고 학교급에 맞는 환경 교육에는 어떤 것들이 있을까요?<br />학교 현장에 꼭 필요하거나 선생님이 원하는 환경 교육에 대해 자유롭게 이야기해 주세요.</span>
                                <div className="evtTextarea">
                                    <textarea
                                        name="answer1Comment"
                                        placeholder="환경 교육에 대해 자유롭게 작성해 주세요."
                                        value={ answer1Comment }
                                        onChange={ this.setAnswer1Comment }
                                        maxLength="2000"
                                    ></textarea>
                                    <p className="count"><span className="reasonCount">{ answer1CommentLength }</span>/2000자</p>
                                </div>
                            </div>
                        </div>
                        <div className="formItem">
                            <p className="formQ">2. 환경 교육에 어떤 자료가 필요하신가요?</p>
                            <div className="formA">
                                <div className="rdoWrap">
                                    <span className="rdo"><input type="radio" name="formRdo" id="formRdo01" value={0} onChange={ this.onAnswer2 } checked={answer2Idx === 0}/><label htmlFor="formRdo01">체험 학습을 위한 정보, 활동지</label></span>
                                    <span className="rdo"><input type="radio" name="formRdo" id="formRdo02" value={1} onChange={ this.onAnswer2 } checked={answer2Idx === 1}/><label htmlFor="formRdo02">주제별 이론 교육 자료</label></span>
                                    <span className="rdo"><input type="radio" name="formRdo" id="formRdo03" value={2} onChange={ this.onAnswer2 } checked={answer2Idx === 2}/><label htmlFor="formRdo03">캠페인, 프로젝트 활동을 위한 수업 가이드</label></span>
                                    <span className="rdo">
                                        <input type="radio" name="formRdo" id="formRdo04" value={3} onChange={this.onAnswer2} checked={answer2Idx === 3}/><label htmlFor="formRdo04">기타</label>
                                        <input type="text" onChange={this.onAnswer2Etc} value={answer2Etc} readOnly={!enableAnswer2Etc} className="inputTxt" />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">응모하기</span></button>
                        </div>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="evtListWrap">
                        <EventList eventlists={ eventAnswerContents } />
                        <button type="button" className="btnMore" style={{ display: eventViewAddButton == 1 ? 'block' : 'none' }} onClick={this.commentListAddAction}>더보기</button>
                    </div>
                </div>
            </section>
        )
    }
}

// 리스트 목록 UL 출력
const EventList = ({eventlists}) => {
    const eventList = eventlists.map(eventList => {
        return (
            <EventListApply {...eventList} key={eventList.member_id} />
        );
    });

    return (
        <div className="evtList">
            {eventList}
        </div>
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
            BaseActions : this.props.BaseActions, // BaseAction
            eventType : "", // 이벤트 타입
            eventName : "", // 이벤트 응모자
            eventRegDate : "", // 이벤트 등록일
            eventContents : "", // 이벤트 내용
            eventLength : "", // 이벤트 길이
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
        let eventSetContents1 = eventSetContents.split('^||^')[0];
        let comment = eventSetContents1.substr(eventSetContents1.indexOf('/') + 1)

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents1 : comment
        });
    };

    render(){
        return (
            <div className="listItem">
                <strong>{this.state.eventName} 선생님</strong>
                <p className="txt" dangerouslySetInnerHTML = {{__html: this.state.eventContents1}}></p>
            </div>
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
