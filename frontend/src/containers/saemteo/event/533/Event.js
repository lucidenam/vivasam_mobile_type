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

const PAGE_SIZE = 10;

class Event extends Component {
    state = {
        eventId: 533,
        pageNo:1,
        pageSize: 8,
        isEventApply : false,       // 신청여부
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerCount: 0,		// 이벤트 참여자 수
        eventViewAddButton : 0, // 더보기 ( 1 : 보임 / 0 : 안보임 )
        schLvlTab: '초등',
        schSubjectTab: '',
    }

    componentDidMount = async () => {
        const {BaseActions, loginInfo, logged} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();

            if(logged && loginInfo.schoolLvlCd !== 'ES') {
                await this.changeSchLvlTab('중고등');
            } else {
                await this.checkEventCount();   		// 이벤트 참여자 수 조회
                await this.commentConstructorList();	// 이벤트 댓글 목록 조회
            }
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

    };

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const {SaemteoActions, eventId} = this.props;
        const {schLvlTab, schSubjectTab} = this.state;


        let tmpSearchKeyword2 = schSubjectTab;
        let tmpSearchKeywordList = null;

        if (tmpSearchKeyword2.includes('/')) {
            tmpSearchKeywordList = tmpSearchKeyword2.split('/');
            tmpSearchKeyword2 = '';
        }

        const params = {
            eventId:  eventId,
            eventAnswerSeq: 2,
            answerIndex: 1,
            searchIndex: 1,
            searchKeyword: schLvlTab,
            searchKeyword2: tmpSearchKeyword2,
            searchKeywordList: tmpSearchKeywordList,
        };

        let response = await api.getSpecificEventAnswerCount(params);

        let eventAnswerCount = response.data.eventAnswerCount;
        this.setState({
            eventAnswerCount: response.data.eventAnswerCount
        });

        // 최초 조회시 전체건수가 5건이상이면 더보기 버튼 표시
        if(this.state.eventAnswerCount > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }

    };

    // 댓글 출력
    commentConstructorList = async () => {
        const {eventId} = this.props; // 2023-05-04 추가
        const {pageNo, pageSize, schLvlTab, schSubjectTab} = this.state;

        let tmpSearchKeyword2 = schSubjectTab;
        let tmpSearchKeywordList = null;

        if (tmpSearchKeyword2.includes('/')) {
            tmpSearchKeywordList = tmpSearchKeyword2.split('/');
            tmpSearchKeyword2 = '';
        }

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            searchIndex: 1,
            searchKeyword: schLvlTab,
            searchKeyword2: tmpSearchKeyword2,
            searchKeywordList: tmpSearchKeywordList,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize,
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
        await this.setState({
            eventAnswerContents : eventJoinAnswerList,
            pageSize : this.state.pageSize + PAGE_SIZE,
        });
    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, eventId} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId});
            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }else if (response.data.eventJoinYn === 'N') {
                this.setState({
                    isEventApply: false
                });
            }
        }
    }

    // 전제 조건
    prerequisite = (e) => {
        const {logged, history, BaseActions, loginInfo} = this.props;
        const {isEventApply} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        // 교사 인증 여부
        if (loginInfo.certifyCheck === 'N') {
            BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return false;
        }

        // 준회원 여부
        if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return false;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        return true;
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {SaemteoActions, eventId, handleClick, loginInfo, event , isEventApply} = this.props;

        if (!this.prerequisite(e)) {
            return;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});

            event['agree'] = false;
            SaemteoActions.pushValues({type: "event", object: event});

            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    changeSchLvlTab = async (schLvl) => {
        await this.setState({
            schLvlTab : schLvl,
            schSubjectTab : '',
            pageSize: 8,
        });
        await this.checkEventCount();   		// 이벤트 참여자 수 조회
        await this.commentConstructorList();	// 이벤트 댓글 목록 조회
    }

    changeSubjectTab = async (subject) => {
       await this.setState({
            schSubjectTab : subject,
            pageSize: 8,
        });
        await this.checkEventCount();   		// 이벤트 참여자 수 조회
        await this.commentConstructorList();	// 이벤트 댓글 목록 조회
    }

    render() {
        const {eventAnswerContents, eventAnswerCount, pageNo, pageSize, eventViewAddButton, evtComment, schLvlTab, schSubjectTab} = this.state;

        const totalPage = Math.ceil(eventAnswerCount / pageSize);

        const curPage = pageNo;
        const pagesInScreen = 5;
        let startPageInScreen = curPage - ((curPage - 1) % pagesInScreen);
        let endPageInScreen = startPageInScreen + pagesInScreen - 1;

        if (totalPage < endPageInScreen) {
            endPageInScreen = totalPage;
        }
        // 페이징
        const pageList = () => {
            const result = [];
            for (let i = startPageInScreen; i <= endPageInScreen; i++) {
                result.push(<li className={curPage === i ? 'on' : ''} onClick={() => {
                    this.handleClickPage(i).then()
                }}>
                    <button>{i}</button>
                </li>);
            }
            return result;
        }
        
        //css용 인덱스
        let loopIndex = 0;
        // // 댓글

        const eventList = eventAnswerContents.map((eventList, index) => {

            if(loopIndex >= 6) {
                loopIndex = 1;
            } else {
                loopIndex++;
            }

            let eventSetName = JSON.stringify(eventList.member_id);
            let answers = eventList.event_answer_desc.split('^||^');
            let answer = answers[2].replace(/\\\"/g, '');
            const schType = answers[0].split('/')[0];
            const subject = answers[0].split('/')[1];

            let masking = "";
            for (var i = 1; i < eventSetName.length-4; i++) {
                masking += "*";
            }
            eventSetName = eventSetName.substring(1, 4) + masking; // 이벤트 참여자 아이디
            const result = <div className="listItem">
                                <div className="comment_inner">
                                    <div className="school_id"><p><span>{subject}</span> 교과서</p></div>
                                    <span className="teacher_id">{eventSetName} 선생님</span>
                                    <div className="comment">
                                        <p dangerouslySetInnerHTML={{__html: answer}}></p>
                                    </div>
                                </div>
                            </div>

            return result;

        });

        return (
            <section className="event241209">
                <div className="evtCont01">
                    <div className="evtTit">
                        <h1><img src="/images/events/2024/event241209_2/img1.png" alt="22 개정 비상 교과서 After Party"/></h1>

                    </div>
                </div>

                <div className="evtCont02">
                    <h3>
                        <img src="/images/events/2024/event241209_2/evtTit1.png" alt="교과서를 딱 펼쳐본 순간, 어떤 느낌이 들었나요?"/>
                    </h3>
                    <div className="contBox">
                        <div className="right_wrap">
                            <img src="/images/events/2024/event241209_2/evt1_right.png"
                                 alt="아직 22 개정 비상교과서를 만나보지 못하셨다구욥?"/>
                            <a href="https://e.vivasam.com/visangTextbook/2022/intro" target="_blank"
                               className="btn_landing">
                                <img src="/images/events/2024/event241209_2/btn_link.png"
                                     alt="교과서 개정판"/>
                            </a>
                        </div>

                        <div className="btnWrap">
                            <button className="btnApply" onClick={this.eventApply}>
                                <img src="/images/events/2024/event241209_2/btn_apply.png" alt="파티 방명록 남기기"/>
                            </button>
                        </div>
                        <h3 className="evtLabel">
                            <img src="/images/events/2024/event241209_2/party_gift.png" alt="파티 답례품"/>
                        </h3>

                    </div>
                </div>
                <div className="evtCont03">
                    <h3>
                        <img src="/images/events/2024/event241209_2/evt03_tit.png" alt="선생님과 22 개정 비상교과서, 첫 만남의 기록"/>
                    </h3>
                    <ul className="tab">
                        <li className={schLvlTab === '초등' ? 'on' : ''}><a onClick={() => this.changeSchLvlTab('초등')}>초등</a></li>
                        <li className={schLvlTab === '중고등' ? 'on' : ''}><a onClick={() => this.changeSchLvlTab('중고등')}>중고등</a></li>
                    </ul>
                    <div className="tab_conts">
                        <p>지금까지 <span>{eventAnswerCount}</span>명의 전국 {schLvlTab === '초등' ? `초등` : `중고등`} 선생님께서<br/>
                            22 개정 비상교과서와의 첫 만남 순간을<br/>
                            공유해 주셨습니다.</p>
                        {
                            schLvlTab === '초등' ?
                                <ul className="tagList">
                                    <li className={schSubjectTab === '' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('')}>전체</a></li>
                                    <li className={schSubjectTab === '수학' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('수학')}>수학</a></li>
                                    <li className={schSubjectTab === '사회' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('사회')}>사회</a></li>
                                    <li className={schSubjectTab === '과학' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('과학')}>과학</a></li>
                                    <li className={schSubjectTab === '음악' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('음악')}>음악</a></li>
                                    <li className={schSubjectTab === '미술' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('미술')}>미술</a></li>
                                    <li className={schSubjectTab === '체육' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('체육')}>체육</a></li>
                                </ul>
                                :
                                <ul className="tagList">
                                    <li className={schSubjectTab === '' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('')}>전체</a></li>
                                    <li className={schSubjectTab === '국어' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('국어')}>국어</a></li>
                                    <li className={schSubjectTab === '영어' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('영어')}>영어</a></li>
                                    <li className={schSubjectTab === '수학' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('수학')}>수학</a></li>
                                    <li className={schSubjectTab === '사회' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('사회')}>사회</a></li>
                                    <li className={schSubjectTab === '역사' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('역사')}>역사</a></li>
                                    <li className={schSubjectTab === '도덕/윤리' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('도덕/윤리')}>도덕/윤리</a></li>
                                    <li className={schSubjectTab === '과학' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('과학')}>과학</a></li>
                                    <li className={schSubjectTab === '한문' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('한문')}>한문</a></li>
                                    <li className={schSubjectTab === '음악/미술/체육' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('음악/미술/체육')}>음악/미술/체육</a></li>
                                    <li className={schSubjectTab === '기술·가정/정보' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('기술·가정/정보')}>기술가정/정보</a></li>
                                    <li className={schSubjectTab === '진로와 직업/교양' ? 'on' : ''}><a onClick={() => this.changeSubjectTab('진로와 직업/교양')}>진로와 직업/교양</a></li>
                                </ul>
                        }
                        <div className="commentWrap">
                            {eventAnswerCount > 0 &&
                                <div className="inner">
                                    <div className="commentList">
                                        {eventList}
                                    </div>
                                </div>
                            }
                            <button className="btnMore"
                                    style={{display: eventViewAddButton == 1 ? 'block' : 'none'}}
                                    onClick={this.commentListAddAction}>
                                <img src="/images/events/2024/event241209_2/btn_more.png" alt="더보기"/>
                            </button>
                        </div>
                    </div>

                </div>


                <div className="evtNotice">
                    <strong>유의사항</strong>
                    <ul>
                        <li>본 이벤트는 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                        <li>이벤트는 1인 1회 참여하실 수 있습니다.</li>
                        <li>전원 증정 경품(비바콘)과 추첨 이벤트 경품(스타벅스, 파리바게트)는 중복 당첨이 가능합니다</li>
                        <li>참여 완료 후 수정 및 추가 참여가 어렵습니다.</li>
                        <li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        <li>경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br/>
                            (㈜카카오 사업자등록번호 : 120-81-47521),<br/>
                            (㈜다우기술 사업자등록번호: 220-81-02810),<br/>
                            (㈜모바일이앤엠애드 사업자등록번호:215-87-19169)
                        </li>
                    </ul>
                </div>
            </section>
        )
    }
}

//=============================================================================
// 댓글 목록 component
//=============================================================================

class EventListApply extends Component {

    constructor(props) {
        super(props);
        this.state = {
            member_id: this.props.member_id, // 멤버 아이디
            event_id: this.props.event_id, // eventId
            event_answer_desc: this.props.event_answer_desc, // 응답문항
            event_answer_desc2: "",
            BaseActions: this.props.BaseActions, // BaseAction
            logged: this.props.logged,
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            schType: "", // 응모자 학교급
            subject: "", // 응모자 과목
            indexNum: this.props.indexNum,
            pageSize: this.props.pageSize
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = async () => { // 이벤트 표시 값 세팅
        let eventSetName = JSON.stringify(this.state.member_id);
        let answers = this.state.event_answer_desc.split('^||^');
        let answer = answers[2].replace(/\\\"/g, '');
        const schType = answers[0].split('/')[0];
        const subject = answers[0].split('/')[1];

        let masking = "";
        for (var i = 1; i < eventSetName.length-4; i++) {
            masking += "*";
        }
        eventSetName = eventSetName.substring(1, 4) + masking; // 이벤트 참여자 아이디

        this.setState({
            schType: schType,
            subject: subject,
            eventName: eventSetName,
            event_answer_desc2 : answer
        });


    };


    render() {
        const {schType, subject, eventName, event_answer_desc2} = this.state;

        return (
            <div className="listItem">
                <div className="comment_inner">
                    <div className="school_id"><p> {schType} <span>{subject}</span> 교과서</p></div>
                    <span className="teacher_id">{eventName} 선생님</span>
                    <div className="comment">
                        <p dangerouslySetInnerHTML={{__html: event_answer_desc2}}></p>
                    </div>
                </div>
            </div>
        );
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
    })
)(withRouter(Event));