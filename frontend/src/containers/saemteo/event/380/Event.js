import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import {bindActionCreators} from "redux";
import $ from "jquery";

// 한페이지에 조회수
const PAGE_SIZE = 10;

class Event extends Component{
    state = {
        isEventApply: false,    // 신청여부

        comment1: '',			// 1번이벤트
        commentLength1: 0,
        comment2: '',			// 2번이벤트
        commentLength2: 0,
        comment3: '',			// 3번이벤트
        commentLength3: 0,

        pageNo : 1, // 페이지
        pageSize : PAGE_SIZE, // 사이즈
        eventAnswerContents : [], // 이벤트 참여내용
        eventAnswerCount : 0, // 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        evtCont03 : 0
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.commentConstructorList(); // 댓글 목록 조회
            await this.checkEventCount();   // 이벤트 참여자 수 조회

        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
        let offset = $('.evtCont03').offset();
        this.setState({
            evtCont03: offset.top
        });
    };

    // 기 신청 여부 체크
    eventApplyCheck = async() => {
        const { logged, eventId } = this.props;
        if(logged){

            const response = await api.chkEventJoin({eventId});
            if(response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
        const { isEventApply, comment1, comment2, comment3 } = this.state;

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return;
        }

        // 기 신청 여부
        if(isEventApply){
            common.error("이미 신청하셨습니다");
            return;
        }

        // 준회원일 경우 신청 안됨.
        if(loginInfo.mLevel !== 'AU300'){
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            return;
        }

        // 교사 인증
        if(loginInfo.certifyCheck === 'N'){
            BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return;
        }

        try {
            if(comment1.trim().length == 0 || comment2.trim().length == 0){
                common.info('참여 내용을 입력해 주세요.');
                return;
            }
            let eventAnswerDesc = comment1.trim()+'^||^'+comment2.trim()+'^||^'+comment3.trim();
            const eventAnswer = {
                eventAnswerDesc :eventAnswerDesc
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

    onFocusComment = (e) => {
        const { logged, history, BaseActions , loginInfo} = this.props;
        const {isEventApply} = this.state;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            document.activeElement.blur();
        }
        // 교사 인증
        else if(loginInfo.certifyCheck === 'N'){
            BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            document.activeElement.blur();
        }
        // 준회원일 경우 신청 안됨.
        else if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            document.activeElement.blur();
        }
        // 기 신청 여부
        else if(isEventApply){
            common.error("이미 신청하셨습니다.");
            document.activeElement.blur();
        }
    }

    setComment = (el, e) => {
        let comment = e.target.value;
        let commentLength = comment.length;

        if (commentLength > 200) {
            common.info("200자 이내로 입력해 주세요.");
        } else {
            if(el === 1) {
                this.setState({
                    comment1: comment,
                    commentLength1: commentLength
                });
            } else if(el === 2) {
                this.setState({
                    comment2: comment,
                    commentLength2: commentLength
                });
            } else if(el ===3 ) {
                this.setState({
                    comment3: comment,
                    commentLength3: commentLength
                });
            }
        }
    };

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const { SaemteoActions, eventId } = this.props;
        const params = {
            eventId: eventId
        };
        let response = await SaemteoActions.checkEventTotalJoin(params);

        this.setState({
            eventAnswerCount : response.data.eventAnswerCount
        });

        // 최초 조회시 전체건수가 10건이상이면 더보기 버튼 표시
        if(this.state.eventAnswerCount > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }
    };
    // 댓글 출력
    commentConstructorList = async () => {
        const { eventId } = this.props;
        const {pageNo, pageSize} = this.state;

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            answerPage : {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList =  await api.getEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 조회가 완료되면 다음 조회할 건수 설정
        this.setState({
            eventAnswerContents : eventJoinAnswerList,
            pageSize : this.state.pageSize + PAGE_SIZE,
        });

    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    formatNumberWithComma = (num) => {
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    onTrainingSupportBtn = () => {
        const { evtCont03 } = this.state;
        window.scrollTo(0, evtCont03-150);
    }

    render () {
        const { comment1, commentLength1, comment2, commentLength2, comment3, commentLength3,eventAnswerContents, eventAnswerCount, eventViewAddButton} = this.state;

        return (
			<section className="event211116">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event211116/img01.png" alt="선생님의 온앤오프" /></h1>
                    <span className="blind">이벤트 신청 시 비바콘 100콘 적립</span>
                    <div className="evtNoti">
                        <p className="txt">
                            선생님 모드 스위치가 <span className="pt01">온(ON)</span>일 때와 <span className="pt02">오프(OFF)</span>일 때의 모습은 어떤가요?<br/>
                            온앤오프 모드에 맞춰 본캐/부캐의 이름을 붙여 주세요!
                        </p>
                        <p className="txt">선생님의 365일 일과 일상을 응원하는 선물을 보내 드립니다.</p>
                        <div className="infoWrap">
                            <p className="tit"><span className="blind">"비바샘이 선생님의 온앤오프를 지원합니다!"</span></p>
                            <span className="txt">다양한 연수로 온앤오프에 배움을 더해 보세요.</span>
                            <button onClick={this.onTrainingSupportBtn} className="btnLink">연수 지원 받기</button>
                        </div>
                        <ul className="evtPeriod">
                            <li><span className="tit">참여 기간</span><span className="txt">2021년 11월 16일 ~ 12월 5일</span></li>
                            <li><span className="tit">당첨자 발표</span><span className="txt">2021년 12월 9일</span></li>
                            <li className="blind">
                                <span className="tit">당첨 선물</span>
                                <span className="txt">선물1. 본캐 왕 - 미니 공기청정기 (10명). 선물2. 부캐 왕 - 캠핑 폴딩박스 (10명). 선물3. 도전상 - 블루투스 스피커 (100명). 선물4. 응원상 - USB허브 (100명)</span>
                            </li>
                        </ul>
                        <div className="evtTip">
                            <strong>당첨 꿀팁</strong>
                            <ul>
                                <li>1. 나의 온앤오프를 표현하는 <span className="pt03">본캐/부캐 이름에 센스</span> 한 스푼!</li>
                                <li>2. <span className="pt03">찰떡같은 설명</span>을 더해 주세요!</li>
                                <li>3. 나의 <span className="pt03">온앤오프를 유지하는 노하우 공유</span>하면 당첨 확률 UP! UP!</li>
                                <li>4. 나의 <span className="pt03">온앤오프에 도움이 되는 연수 주제</span>를 적어주면 보너스!</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="evtFormWrap">
                        <div className="formItem">
							<div className="formTit icoOn">나의 ‘본캐’는 <span className="square"></span>이다!</div>
							<div className="evtTextarea">
								<textarea 
                                    name="applyContent1" 
                                    id="applyContent1" 
                                    placeholder="본캐에 대한 설명과 노하우를 남겨 주세요. (200자 이내)" 
                                    value={ comment1 }
                                    onChange={ (e) => this.setComment(1, e) }
                                    onFocus={ this.onFocusComment }
                                    maxlength="200"
                                ></textarea>
								<div className="areaInfo">
									<p>* 본캐 : 본래의 캐릭터이자 교직 생활 속 선생님의 모습</p>
									<p className="count"><span className="reasonCount">{ commentLength1 }</span>/200</p>
								</div>
                            </div>
						</div>
                        <div className="formItem">
							<div className="formTit icoOff">나의 ‘부캐’는 <span className="square"></span>이다!</div>
							<div className="evtTextarea">
                                <textarea 
                                    name="applyContent2" 
                                    id="applyContent2" 
                                    placeholder="부캐에 대한 설명과 노하우를 남겨 주세요. (200자 이내)" 
                                    value={ comment2 }
                                    onChange={ (e) => this.setComment(2, e) }
                                    onFocus={ this.onFocusComment }
                                    maxlength="200"
                                ></textarea>
								<div className="areaInfo">
									<p>* 부캐: 본래의 캐릭터가 아닌 학교 밖 선생님의 일상 속 모습</p>
									<p className="count"><span className="reasonCount">{ commentLength2 }</span>/200</p>
								</div>
                            </div>
						</div>
						<div className="formItem">
							<div className="formTit icoAdd">나의 온앤오프에 도움이 되는<br />교육/연수/체험이 있다면?</div>
							<div className="evtTextarea">
                                <textarea 
                                    name="applyContent3" 
                                    id="applyContent3" 
                                    placeholder="원하는 주제 혹은 경험했던 교육/연수/체험 중에 도움이 되었던 주제가 있다면 남겨주세요. (200자 이내)" 
                                    value={ comment3 }
                                    onChange={ (e) => this.setComment(3, e) }
                                    onFocus={ this.onFocusComment }
                                    maxlength="200"
                                ></textarea>
								<div className="areaInfo">
                                    <p className="count"><span className="reasonCount">{ commentLength3 }</span>/200</p>
								</div>
                            </div>
						</div>
						<div className="formTip">
                            <strong>유의 사항</strong>
                            <ul>
								<li><span>1.</span><p>선생님의 온(ON)/오프(OFF) 두 가지를 모두 작성해 주셔야 참여하실 수 있습니다.</p></li>
								<li><span>2.</span><p>마지막 온앤오프에 도움이 되는 교육/연수/체험 작성란은 선택사항입니다.</p></li>
								<li><span>3.</span><p>참여 완료 후에는 수정 및 추가 참여가 어렵습니다.</p></li>
								<li><span>4.</span><p>정확한 주소를 기입해주세요. (학교 주소, 수령처 포함 : ex. 교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</p></li>
								<li><span>5.</span><p>주소 기재가 잘못되어 반송된 선물은 다시 발송해드리지 않습니다.</p></li>
							</ul>
						</div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply } className="btnApply">참여하기</button>
                        </div>
                    </div>
                </div>
                <div className="evtCont03">
                    <div id="coupon" className="couponWrap">
                        <div className="couponTitWrap">
                            <p className="tit"><span className="blind">"비바샘이 선생님의 온앤오프를 지원합니다!"</span></p>
                            <p className="txt">티스쿨원격교육연수원에서 일과 일상에 도움이 되는 연수를<br />만나보실 수 있습니다.</p>
                        </div>
                        <div className="couponCont">
                            <div className="couponItem">
                                <a href="https://www.tschool.net/mdvs/menu01sub?lcode=t21-014" target="_blank" className="btnLink" title="새창열림">행복한 교사가 되는 15가지 습관</a>
                                <a href="https://www.tschool.net/mdvs/menu01sub?lcode=t20-003" target="_blank" className="btnLink" title="새창열림">소통하는 선생님 언어의 연금술사가 되라!</a>
                            </div>
                            <div className="couponItem">
                                <a href="https://www.tschool.net/mdvs/menu01sub?lcode=t21-031" target="_blank" className="btnLink" title="새창열림">나를 돌보는 마음 챙김 명상</a>
                                <a href="https://www.tschool.net/mdvs/menu01sub?lcode=t19-010" target="_blank" className="btnLink" title="새창열림">하루 한 번 쉼표, 색연필로 그리는 1일 1손그림</a>
                            </div>
                            <span>* 티스쿨 연수 할인권은 PC에서 다운로드 하실 수 있습니다.</span>
                        </div>
                        <ul className="couponList">
                            <li>연수 할인권은 비바샘 X 티스쿨 통합회원 선생님께 제공합니다.</li>
                            <li>연수 할인권은 강의당 1개의 할인권만 발급이 가능하며, 선착순 100분께 제공해드립니다.</li>
                            <li>발급 받으신 연수 할인권은 티스쿨원격교육연수원 > 나의 쿠폰함에서 확인하실 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont04">
                    <div className="evtListWrap">
                        <EventList eventlists={ eventAnswerContents } />
                        <button type="button" className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>더보기</button>
                    </div>
                </div>
            </section>
        )
    }
}

//=============================================================================
// 댓글 목록 component
//=============================================================================

// 리스트 목록 UL 출력
const EventList = ({eventlists}) => {
    const eventList = eventlists.map(eventList => {
        return (<EventListApply {...eventList} key={eventList.member_id}/>);
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
        let eventSetContentsArr = eventSetContents.split('^||^');
        let eventSetContents1 = '';
        let eventSetContents2 = '';
        let eventSetContents3 = '';
        if(eventSetContentsArr.length > 2){
            eventSetContents1 = eventSetContentsArr[0];
            eventSetContents2 = eventSetContentsArr[1];
            eventSetContents3 = eventSetContentsArr[2];
        }else{
            eventSetContents1 = eventSetContentsArr[0];
            eventSetContents2 = eventSetContentsArr[1];
        }

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents1 : eventSetContents1,
            eventContents2 : eventSetContents2,
            eventContents3 : eventSetContents3
        });
    };

    render(){
        const { eventContents1, eventContents2, eventContents3 } = this.state;
        return (
            <div className="listItem">
                <p className="user">{this.state.eventName} 선생님</p>
                <div className="txtWrap">
                    <div>
                        <div className="formTit icoOn">나의 ‘본캐’는 <span className="square"></span>이다!</div>
                        <p className="txt" dangerouslySetInnerHTML = {{__html: eventContents1}}></p>
                    </div>
                    <div>
                        <div className="formTit icoOff">나의 ‘부캐’는 <span className="square"></span>이다!</div>
                        <p className="txt" dangerouslySetInnerHTML = {{__html: eventContents2}}></p>
                    </div>
                </div>
                <div className="addTxtWrap" style={{display: eventContents3 !== '' ? 'block' : 'none'}}>
                    <div className="formTit icoAdd">나의 교육/연수/체험 이야기</div>
                    <p className="txt" dangerouslySetInnerHTML = {{__html: eventContents3}}></p>
                </div>
            </div>
        )
    }
}

export default connect(
	(state) => ({
		logged: state.base.get('logged'),
		loginInfo: state.base.get('loginInfo').toJS(),
		event: state.saemteo.get('event').toJS(),
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