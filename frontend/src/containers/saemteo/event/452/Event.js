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

// 한페이지에 조회수
const PAGE_SIZE = 10;

class Event extends Component{

    state = {
        isEventApply: false,
        rdoData: [
            {id: 1, labelTxt: '통합과학', value:'통합과학', url: "https://www.visang.com/upload/book_data_ebook/21wanjapick_h_isc/index.html" },
            {id: 2, labelTxt: '화학 Ⅰ', value:'화학 Ⅰ', url: "https://www.visang.com/upload/book_data_ebook/21wanjapick_h_ch1/index.html"},
            {id: 3, labelTxt: '사회·문화', value:'사회·문화', url: "https://www.visang.com/upload/book_data_ebook/22wanjapick_h_iso/index.html"},
            {id: 4, labelTxt: '통합사회', value:'통합사회', url: "https://www.visang.com/upload/book_data_ebook/22wanjapick_h_sm/index.html"},
        ],
        rdoChecked: -1,  // 선택된 경품 idx
        comment: '',
        commentLength: 0,

        pageNo : 1, // 페이지
        pageSize : PAGE_SIZE, // 사이즈
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
        const { allAmountFull, isEventApply, comment, rdoChecked, rdoData } = this.state;

        if(!logged){ // 미로그인시
            common.info("로그인이 필요한 서비스입니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return;
        }

        // 교사 인증
        let isNotAuth = false;
        if (loginInfo.certifyCheck === 'N') {
            isNotAuth = true;
            api.appConfirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?').then(confirm => {
                if (confirm === true) {
                    BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                    window.location.hash = "/login/require";
                    window.viewerClose();
                }
            });
        }
        if(isNotAuth){
            return;
        }

        // 준회원일 경우 신청 안됨.
        if(loginInfo.mLevel !== 'AU300'){
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            return;
        }

        // 기 신청 여부
        if(isEventApply){
            common.error("이미 참여하셨습니다.");
            return;
        }

        if(loginInfo.schoolLvlCd !== 'HS'){
            common.error("고등학교 선생님 대상 이벤트 입니다.");
            return;
        }

        try {
            if (rdoChecked < 0) {
                 common.info('과목을 선택해 주세요');
                 return;
            }
            
            if (comment.trim().length < 2) {
                 common.info('최소 2자 ~ 최대 300자까지 입력할 수 있어요.');
                 return;
            }
            const eventAnswer = {
                selContent: rdoData[rdoChecked].value,
                eventAnswerDesc : comment
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

    onRdoChange = (e) => {
        const { logged, history, BaseActions, loginInfo} = this.props;
        const { isEventApply} = this.state;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return;
        }

        // 교사 인증
        let isNotAuth = false;
        if (loginInfo.certifyCheck === 'N') {
            isNotAuth = true;
            api.appConfirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?').then(confirm => {
                if (confirm === true) {
                    BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                    window.location.hash = "/login/require";
                    window.viewerClose();
                }
            });
        }
        if(isNotAuth){
            return;
        }

        // 준회원일 경우 신청 안됨.
        if(loginInfo.mLevel !== 'AU300'){
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            return;
        }

        // 기 신청 여부
        if(isEventApply){
            common.error("이미 참여하셨습니다.");
            return;
        }

        if(loginInfo.schoolLvlCd !== 'HS'){
            common.error("고등학교 선생님 대상 이벤트 입니다.");
            return;
        }

        this.setState({
            rdoChecked: Number(e.target.value)
        });
    }

    setComment = (e) => {
        const { logged, history, BaseActions, loginInfo} = this.props;
        const { isEventApply} = this.state;

        // 교사 인증
        let isNotAuth = false;
        if (loginInfo.certifyCheck === 'N') {
            isNotAuth = true;
            api.appConfirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?').then(confirm => {
                if (confirm === true) {
                    BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                    window.location.hash = "/login/require";
                    window.viewerClose();
                }
            });
        }
        if(isNotAuth){
            return;
        }

        // 준회원일 경우 신청 안됨.
        if(loginInfo.mLevel !== 'AU300'){
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            return;
        }

        // 기 신청 여부
        if(isEventApply){
            common.error("이미 참여하셨습니다.");
            return;
        }

        if(loginInfo.schoolLvlCd !== 'HS'){
            common.error("고등학교 선생님 대상 이벤트 입니다.");
            return;
        }

        let comment = e.target.value;
        let commentLength = comment.length;

        if (commentLength > 300) {
            common.info("300자 이내로 입력해 주세요.");
        } else {
            this.setState({
                comment: comment,
                commentLength: commentLength
            });
        }
    };
    
    onFocusComment = (e) => {
        const { logged, history, BaseActions, loginInfo} = this.props;
        const { isEventApply} = this.state;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }
    }

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

        // 최초 조회시 전체건수가 PAGE_SIZE 건이상이면 더보기 버튼 표시
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
		return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

    render () {
        const { rdoData, rdoChecked, comment, commentLength, eventAnswerContents, eventViewAddButton } = this.state

        return (
			  <section className="event230515">
                <div className="evtCont01">
                    <h1 className="imgWrap"><img src="/images/events/2023/event230515/img1.png" alt="기출 PICK 체험 이벤트" /></h1>
                    <div className="blind">
                        <p>비상교육 내신 기출 문제집</p>
                        <h3>기출 PICK 체험 이벤트</h3>
                        <p>완자 기출PICK으로 핵심을 PICK! 선물도 PICK!</p>
                        <p>완자가 PICK한 기출로 핵심만 ALL PICK!​​ <br/>과목이 새롭게 확장된 &lt;완자 기출PICK&gt;을 체험해 보세요!​​</p>
                        <p>선생님 200분께 교사용 교재와 학생용 교재를,​​ <br/>체험 후 설문조사에 참여해 주신 모든 선생님께 선물을 보내드립니다.​​</p>
                        <dl>
                            <dt>신청 기간</dt>
                            <dd>2023년 5월 15일(월) ~ 5월 21일(일)</dd>
                        </dl>
                        <dl>
                            <dt>당첨 발표</dt>
                            <dd>2023년 5월 24일(수)</dd>
                        </dl>
                        <p>당첨 선물</p>
                        <ul>
                            <li>이벤트 당첨자 전원 - 완자 기출PICK 선택 과목​​ 교사용 1권 + 학생용 1권​</li>
                            <li>설문 참여자 전원 - 스타벅스 아메리카노 Tall</li>
                            <li>설문 우수자 10명 - 도미노피자 포테이토 피자 + 콜라 1.25L</li>
                        </ul>
                        <p>이벤트 진행 단계</p>
                        <ul>
                            <li>당첨 문자 확인(5.24)</li>
                            <li>교재 수령(5.26)</li>
                            <li>교재 체험(5.29~)</li>
                            <li>설문조사(~6.11)</li>
                            <li>경품 발송(6.14)</li>
                        </ul>
                        <p>※ 5월 29일(월) 설문조사 안내 SMS를 발송합니다.</p>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="imgWrap"><img src="/images/events/2023/event230515/img2.png" alt="<완자 기출PICK> 교재 소개" /></div>
                    <div className="blind">
                        <ul>
                            <li>PICK 1. 전국의 내신 기출문제 분석을 통한 완벽한 개념 정리!</li>
                            <li>PICK 2. 필수 문제를 주제별, 난이도별로 구성하여 핵심 문제를 한눈에 파악!</li>
                            <li>PICK 3. 서술형, 최고 수준의 고난도 문제까지 수록하여 내신 1등급 완성!</li>
                        </ul>
                        <p>과학 통합과학 / 물리학 I / 화학 I /​ 생명과학 I / 지구과학 I</p>
                        <p>사회 통합사회 / 한국사 / 사회 ·문화 /​ 생활과 윤리 / 윤리와 사상 / 정치와 법</p>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="imgWrap"><img src="/images/events/2023/event230515/img3.png" alt="<완자 기출PICK> 과목 선택하기" /></div>
                    <p>※ 1인 1과목 선택이 가능하며, 표지를 클릭하면 미리보기 하실 수 있습니다.</p>
                    <div className="evtFormWrap">
                        <div className="formInner">
                            <div className="formItem">
                                <div className="formA">
                                    <div className="rdoWrap">
                                        {
                                            rdoData.map((item, idx) => {
                                                return (
                                                    <span key={`evtRdo${idx}`} className={'rdo evtRdo'+idx}>
                                                        <input type="radio" name="formRdo" id={`formRdo0${ item.id }`} value={ idx } onChange={ this.onRdoChange } checked={ rdoChecked === Number(idx) } />
                                                        <label htmlFor={`formRdo0${ item.id }`}>
                                                            <a href={item.url} target="_blank" className="thumb">
                                                                <img src={"/images/events/2023/event230515/item"+ item.id +".png"} alt={item.labelTxt} />
                                                            </a>
                                                            <p>{ item.labelTxt }</p>
                                                        </label>
                                                    </span>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>    
                        <div className="formInner">
                            <div className="formItem">
                                <div className="imgWrap"><img src="/images/events/2023/event230515/txt_tit.png" alt="완자 기출PICK 교재를 받고 싶은 이유를 작성해 주세요." /></div>
                                <div className="formA">
                                    <div className="textareaWrap">
                                        <textarea
                                            name="applyContent"
                                            id="applyContent"
                                            placeholder="300자까지 입력 가능합니다."
                                            value={ comment }
                                            onChange={ this.setComment }
                                            onFocus={ this.onFocusComment }
                                            maxLength="300"
                                        ></textarea>
                                        <p className="count">(<span className="reasonCount">{ commentLength }</span>/300)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="btnWrap">
                                <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                            </div>
                        </div>    
                    </div>
                </div>
                <div className="evtCont04">
                    <div className="evtFooterWrap">
                        <p>유의사항</p>
                        <ul>
                            <li>① 본 이벤트는 비바샘 교사인증을 완료한 고등 선생님 대상 이벤트입니다.</li>
                            <li>② 당첨자 교재 발송은 순차적으로 발송됩니다.</li>
                            <li>③ 1인 1회 참여할 수 있습니다.</li>
                            <li>④ 개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                            <li>⑤ 경품 발송을 위해 개인정보(성명, 휴대전화번호, 수령처)가 서비스사에 제공됩니다.<br/>((주)모바일이앤엠애드 사업자등록번호 215-87-19169),<br/>(주)CJ대한통운 사업자등록번호 : 110-81-05034).</li>
                            <li>⑥ 경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont05">
                    <div className="evtListWrap">
                        <EventList eventlists={ eventAnswerContents } />
                        <button type="button" className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>더보기<i></i></button>
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
        let eventSetContents1 = eventSetContentsArr[1];

        this.setState({
            eventName : eventSetName,
            eventRegDate : eventSetRegDate,
            eventContents1 : eventSetContents1
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