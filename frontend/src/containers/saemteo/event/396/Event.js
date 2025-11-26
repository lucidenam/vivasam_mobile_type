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
const PAGE_SIZE = 5;

class Event extends Component{

    state = {
        isEventApply: false,
        rdoData: [
            {id: 1, labelTxt: '국어 문학', value:'국어 문학'},
            {id: 2, labelTxt: '수학 I', value:'수학 I'},
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
                 common.info('<Full수록> 과목을 선택해 주세요');
                 return;
            }
            
            if (comment.trim().length == 0) {
                 common.info('교재 신청 이유를 작성해 주세요.');
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
			<section className="event220321">
                <div className="evtCont01">
                    <h1><img src="/images/events/2022/event220321/img01.png" alt="비상교육 수능 기출 문제집. Full수록 반베송 이벤트. 당첨 학급(고2~3) 전원 증정" /></h1>
                    <div className="evtNoti">
                        <p className="txt">수능 출제 유형을 한눈에 파악하고,<br />체계적인 일차별 학습법을 제시하는<br />비상교육 <strong>수능 기출 문제집 Full수록</strong>을<br />우리반 학생들과 함께 체험해 볼 수 있는 기회!</p>
						<p className="txt">총 10분을 선정하여 Full수록 열공 세트를<br />학급으로 보내드립니다.</p>
                        <ul className="evtPeriod">
                            <li><span className="tit">신청 기간</span><span className="txt">2022.03.21(월) ~ 03.27(일)</span></li>
                            <li><span className="tit">당첨 발표</span><span className="txt">2022.03.29(화) / <em>비바샘 공지사항</em></span></li>
                        </ul>
                        <div className="blind">
                            <strong className="subTit"><span className="blind">당첨 선물</span></strong>
                            <p>Full수록 열공 세트(10개 학급 전원): 교사용 교재 1권 + 학생 당 교재 1권 + 학생 당 스프링 노트 1권 + 풀수록 안심 마스크 이너박스 2개(KF94, 총 60개입) + 교재 체험 후기 작성자(전원): 신세계 모바일 상품권(50,000원)</p>
                        </div>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="imgWrap"><img src="/images/events/2022/event220321/img02.png" alt="이벤트 진행 단계" /></div>
                    <div className="blind">
                        <ol>
                            <li>당첨 문자 확인<br /><strong>(3.29)</strong></li>
                            <li>교재 수령<br /><strong>(~4.1)</strong></li>
                            <li>교재 체험<br /><strong>(4.4~)</strong></li>
                            <li>교재 체험 후기 참여<br /><strong>(4.4~4.17)</strong></li>
                            <li>교재 체험 후기 작성자 선물 증정<br /><strong>(4.20)</strong></li>
                        </ol>
                        <span>※ 교재 체험 후기 운영 및 후기 작성 선물 증정은 교재 담당자가 선생님께 개별 연락드릴 예정입니다.</span>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="imgWrap"><img src="/images/events/2022/event220321/img03.png" alt="Full수록 소개" /></div>
                    <div className="blind">
                        <p>최신 수능 트렌드 완벽 반영!</p>
                        <p>한 눈에 파악하는 기출 경향&유형</p>
                        <p>상세한 지문 분석 및 직관적인 해설 정리</p>
                        <p>수능 필수 기출문제 Full수록</p>
                        <p>30일 완성, 자기주도 학습이 가능한 체계적인 학습 플랜 제시</p>
                    </div>
                </div>
                <div className="evtCont04">
                    <div className="evtFormWrap">
                        <div className="formInner">
                            <div className="formItem">
                                <p className="formQ"><span className="blind">&lt;Full수록&gt; 과목 선택하기</span></p>
                                <p>※1인 1교재 선택 가능</p>
                                <div className="formA">
                                    <div className="rdoWrap">
                                        {
                                            rdoData.map((item, idx) => {
                                                return (
                                                    <span key={`evtRdo${idx}`} className="rdo">
                                                        <input type="radio" name="formRdo" id={`formRdo0${ item.id }`} value={ idx } onChange={ this.onRdoChange } checked={ rdoChecked === Number(idx) } />
                                                        <label htmlFor={`formRdo0${ item.id }`}><span>{ item.labelTxt }</span></label>
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
                                <p className="formQ">Full수록 교재를 받고 싶은 이유를 작성해 주세요.</p>
                                <div className="formA">
                                    <div className="textareaWrap">
                                        <p className="count">(<span className="reasonCount">{ commentLength }</span>/300)</p>
                                        <textarea
                                            name="applyContent"
                                            id="applyContent"
                                            placeholder="300자 이내로 입력해 주세요."
                                            value={ comment }
                                            onChange={ this.setComment }
                                            onFocus={ this.onFocusComment }
                                            maxLength="300"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="btnWrap">
                                <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                            </div>
                        </div>    
                    </div>
                </div>
                <div className="evtCont05">
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