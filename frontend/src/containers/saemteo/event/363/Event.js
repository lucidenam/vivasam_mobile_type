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
        isEventApply: false,    // 신청여부

        comment: '',
        commentLength: 0,
        
		pageNo : 1, // 페이지
		pageSize : PAGE_SIZE, // 사이즈
		eventAnswerContents : [], // 이벤트 참여내용
		eventAnswerCount : 0, // 이벤트 참여자 수
		eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
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
        const { isEventApply, comment } = this.state;

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
            
            if (comment.length < 10 || comment.length > 300) {
                common.info('노트 활용 계획은 최소 10자이상 300자이내로 작성해 주세요.');
                return;
            }
            
            const eventAnswer = {
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

    onFocusComment = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }
    }

    setComment = (e) => {
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

    render () {
        const { comment, commentLength, eventAnswerContents, eventAnswerCount, eventViewAddButton} = this.state;
		const moreCnt = eventAnswerCount - eventAnswerContents.length	// 남은 조회건수

        return (
			<section className="event210817">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210817/img01.png" alt="위인의 말에서 지혜를 얻는 위인의 생각을 쓰다" /></h1>
                    <div className="evtNoti">
                        <p className="txt">
                            많은 선생님들의 사랑을 받은 <strong>학생용 필사 노트!</strong><br />
                            2021년에도 선생님을 찾아갑니다.<br /><br />
                            전국 1천여 명의 선생님이 추천해주신 위인의 명언을<br />
                            한 자 한 자 쓰며 과거로부터 지혜를 얻고,<br />
                            그 뜻을 되새길 수 있습니다.
                        </p>
                        <ul className="evtPeriod">
                            <li><span className="tit">참여 기간</span><span className="txt">2021년 8월 17일 ~ 8월 25일</span></li>
                            <li><span className="tit">당첨자 발표</span><span className="txt">2021년 8월 26일</span></li>
                        </ul>
                    </div>
                    <div className="blind">
                        <ul>
                            <li>1인당 30권 세트</li>
                            <li>비상교육 지사를 통해 순차 발송</li>
                        </ul>
                        <span>300명 추첨</span>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="imgWrap"><img src="/images/events/2021/event210817/img02.png" alt="" /></div>
                    <div className="blind">
                        <p><strong>&lt;위인의 생각을 쓰다&gt; 노트 미리보기</strong></p>
                        <ul>
                            <li>배움, 노력, 태도, 행복의 힘을 만드는 명언과 위인 소개</li>
                            <li>명언을 따라 써보는 필사 페이지</li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="evtFormWrap">
                        <p className="formTit"><span className="blind">&lt;위인의 생각을 쓰다&gt;<br />노트 활용 계획을 적어주세요.</span></p>
                        <span>※ 300분을 선정하여 필사 노트 30권 세트를 보내드립니다.</span>
                        <div className="evtTextarea">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                placeholder="<위인의 생각을 쓰다> 노트 활용 계획을 작성해 주세요.(300자 이내)"
                                value={comment}
                                onChange={ this.setComment }
                                onFocus={ this.onFocusComment }
                                maxLength="300"
                            ></textarea>
                            <p className="count">(<span className="reasonCount">{ commentLength }</span>/300)</p>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply } className="btnApply">신청하기</button>
                        </div>
                    </div>
                </div>
                <div className="evtCont04">
                    <div className="evtListWrap">
                        <EventList eventlists={ eventAnswerContents } />
                        <button type="button" className="btnMore" style={{ display : eventViewAddButton == 1 ? 'block' : 'none' }} onClick={ this.commentListAddAction }>더보기<span>({ this.formatNumberWithComma(moreCnt) })</span></button>
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
        let eventSetContents1 = eventSetContents;

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