import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{

    constructor(props) {
        super(props);
        this.state = {
            eventCheck : "", // 선택한 테마
            eventLength : 0, // 내 글 길이 카운트
            eventContents  : "", // 설렘꾸러미 이벤트 내용
            eventButtonView : 0, // 이벤트 내 글 버튼 표시 여부 ( 0 : 미표시 / 1 : 표시 )
            eventUpdateCheck : 0, // 이벤트 내 글 보기 / 수정 버튼 표시 여부 ( 0 : 내 글 보기  /  1 : 내 글 수정 )
            eventGradeCount : 0, // 학교 숫자 ( 설렘꾸러미 )
            eventGradeBookCount : 0 //  책 숫자 ( 설렘꾸러미 )
        };
        this.getGiftBundleCount();
        this.eventCheckView();
    };

    // 설렘꾸러미 ( 학교, 권수 체크 )
    getGiftBundleCount = async () =>{
        const { eventGiftBundleCount, logged, history, BaseActions } = this.props;

        // 설렘꾸러미 학교 체크
        eventGiftBundleCount.eventGiftCount = 1;
        const response1 = await api.getGiftBundleCount(eventGiftBundleCount);
        let eventGrade1 = response1.data.requestCount;

        // 설렘꾸러미 권수 체크
        eventGiftBundleCount.eventGiftCount = 2;
        const response2 = await api.getGiftBundleCount(eventGiftBundleCount);
        let eventGrade2 = response2.data.requestCount;

        // 설렘꾸러미 카운트에 따른 값 추가
        eventGrade1 = eventGrade1.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        eventGrade2 = eventGrade2.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.setState({
            eventGradeCount: eventGrade1,
            eventGradeBookCount: eventGrade2
        });

    };


    // 이벤트 첫 신청의 경우 시작
    // 테마 입력 및 교체
    onTermChange = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                eventCheck: e.currentTarget.value
            });
        }

    };

    // 댓글 수정 시 길이 연동 및 이벤트 내용 수정
    setApplyContent = (e) => {

        if(e.target.value.length > 400) common.info("400자 이내로 입력해 주세요.");
        const { logged, history, BaseActions, loginInfo } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else if(loginInfo.certifyCheck == "N"){
            common.info("교사 인증 후 참여 가능합니다.");
            return;
        }else {
            this.setState({
                eventLength: e.target.value.length,
                eventContents: e.target.value
            });
        }

    };

    // 이벤트 신청 검사
    eventApply = (e) => {
        const { logged, history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            if(this.state.eventCheck == ""){ // 책의 장르 미선택시
                common.info("책의 장르를 선택해주세요.");
            }else{
                if(this.state.eventContents == ""){ // 수업 미작성시
                    common.info("학생들과 함께 만들고 싶은 수업을 적어주세요.");
                }else{
                    this.insertApplyForm(); // 이벤트 신청 이동
                }
            }
        }
    };

    // 이벤트 참여 여부 확인 및 이벤트 신청 폼으로 이동
    insertApplyForm = async () => {
        const { event, eventId, handleClick , SaemteoActions, eventAnswer } = this.props;
        try {
            event.eventId = eventId; // 이벤트 ID
            const response = await api.eventInfo(eventId);
            if(response.data.code === '3'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
                // 응답1 : 장르 / 응답 2 : 수업
                // { Q1 : A1 , Q2 : A2 }
                // JSON Object 생성하여 보내기.
                let eventAnswerArray = {};
                eventAnswerArray.Q1 = this.state.eventCheck;
                eventAnswerArray.Q2 = this.state.eventContents;
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
    };
    // 이벤트 첫 신청의 경우 끝

    // 내 글 보기 / 수정 작업
    eventUpdateContent = async () => {

        if(this.state.eventUpdateCheck == 0){ // 내 글 보기
            const { event, eventId, loginInfo } = this.props;
            event.eventId = eventId; // 이벤트 ID
            event.eventAnswerSeq = 2; // 해당 값만을 출력
            event.memberId = loginInfo.memberId; // 멤버 ID
            const responseList =  await api.getEventAnswerSingleQuestion({...event});
            const responsedata = responseList.data.eventJoinAnswerList[0].event_answer_desc;
            this.setState({
                eventContents: responsedata,
                eventUpdateCheck : !this.state.eventUpdateCheck
            });
            this.eventCheckView(); // 내 글 보기 함수 실행
        }else{ // 수정하기
            const { event, eventId, loginInfo, SaemteoActions } = this.props;
            if(this.state.eventContents == ""){ // 수정 시에 값 미입력시
                common.info("학생들과 함께 만들고 싶은 수업을 적어주세요.");
            }
            else{ // 수정 과정
                try {

                    // 이벤트 수정할 내용 불러오기
                    event.eventId = eventId; // 이벤트 ID
                    event.eventAnswerSeq = 3; // 해당 이벤트 Seq는 3
                    event.memberId = loginInfo.memberId; // 멤버 ID
                    const responseList =  await api.getEventAnswerSingleQuestion({...event});
                    const responsedata = responseList.data.eventJoinAnswerList[0].event_answer_desc.split("수업 :");

                    // 이벤트 내용 ( 2,3 번 문항 수정 )
                    event.eventId = eventId; // 이벤트 ID
                    event.memberId = loginInfo.memberId; // 멤버 ID
                    event.eventAnswerDesc = this.state.eventContents; // 질문 응답
                    event.eventAnswerSeq = 2; // 질문 응답 순서 - 수정이기 때문에 1 고정
                    let response = await SaemteoActions.setEventAnswerUpdate({...event});
                    if(response.data.code === '0') {
                        event.eventId = eventId; // 이벤트 ID
                        event.memberId = loginInfo.memberId; // 멤버 ID
                        event.eventAnswerDesc = responsedata[0] + "수업 : " + this.state.eventContents; // 질문 응답
                        event.eventAnswerSeq = 3; // 질문 응답 순서 - 수정이기 때문에 1 고정
                        response = await SaemteoActions.setEventAnswerUpdate({...event});
                        if (response.data.code === '0') {
                            common.info("수정이 완료되었습니다.");
                        }else{
                            common.error("수정이 정상적으로 처리되지 못하였습니다.");
                        }

                    }
                    else{
                        common.error("수정이 정상적으로 처리되지 못하였습니다.");
                    }

                } catch (e) {
                    console.log(e);
                } finally {
                    setTimeout(()=>{
                        // 새로고침이 구현되어 있지 않으므로 값을 직접 넣어주어야 합니다.
                        // 값 선택 및 응답 수정
                        this.setState({
                            eventCheck: "",
                            eventLength: 0,
                            eventContents: "",
                            eventUpdateCheck: 0
                        });
                        this.eventCheckView();
                    }, 1000);//의도적 지연.
                }
            }
        }
    };

    // 이벤트 참여 여부 확인 ( 내 글 보기 / 수정 버튼 표시 여부 )
    eventCheckView  = async () => {
        const { event, eventId } = this.props;
        try {
            event.eventId = eventId; // 이벤트 ID
            const response = await api.eventInfo(eventId);
            if(response.data.code === '3'){ // 참여한 경우
                this.setState({
                    eventButtonView: 1
                });
            }else{ // 미 참여의 경우
                this.setState({
                    eventButtonView: 0
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
            }, 1000);//의도적 지연.
        }

    };
    // 내 글 보기 / 수정하기 작업




    validate = () => {
        return true;
    };

    render () {

        return (
            <section className="event190402">
                <h1><img src="/images/events/2019/event190402/img01.jpg" alt="2019 비바샘 설렘꾸러미 캠페인"/></h1>
                <div className="blind">
                    <p>학생들과 함께 읽고 싶은 책이 있으신가요? 비바샘이 청계천 헌책방거리와 함께 책 나누기 캠페인을 시작합니다. 설렘꾸러미 속 특별한 책도 만나고, 헌책방거리 살리기 프로젝트에도
                        동행해주세요.</p>
                    <dl>
                        <dt>캠페인 기간</dt>
                        <dd>2019년 4월 2일 ~ 10월 30일 (7개월 간)</dd>
                        <dt>당첨자 발표</dt>
                        <dd>매월 15일, 말일 / 비바샘 공지사항</dd>
                        <dt>당첨자 선물</dt>
                        <dd>선호 도서 장르 설렘꾸러미 / 매회 30명씩 * 설렘꾸러미에는 청계천거리 헌책방 사장님들이 장르별로 엄선한 총 10권의 책이 담겨 있습니다.</dd>
                    </dl>
                </div>
                <div className="cont">
                    전국 <strong>{this.state.eventGradeCount}</strong>개 학교에<br />총 <strong>{this.state.eventGradeBookCount}</strong>권의<br />설렘꾸러미 책이 도착했습니다.
                    <p className="comment">※ 각 지역별 설렘꾸러미 현황은 비바샘 PC버전에서 확인해주세요.</p>
                </div>

                <div className="cont2">
                    <h2><img src="/images/events/2019/event190402/tit_01.png" alt="STEP 1. 설렘꾸러미로 받고 싶은 책의 장르를 선택해주세요."/>
                    </h2>
                    <ul className="radio_list">
                        <li className="radio_01">
                            <input
                                type="radio"
                                name="lb_book"
                                id="lb_book1"
                                value="힐링"
                                checked={this.state.eventCheck === '힐링'}
                                onChange={this.onTermChange}
                            />
                            <label htmlFor="lb_book1">힐링</label>
                        </li>
                        <li className="radio_02">
                            <input
                                type="radio"
                                name="lb_book"
                                id="lb_book2"
                                value="추리"
                                checked={this.state.eventCheck === '추리'}
                                onChange={this.onTermChange}
                            />
                            <label htmlFor="lb_book2">추리</label>
                        </li>
                        <li className="radio_03">
                            <input
                                type="radio"
                                name="lb_book"
                                id="lb_book3"
                                value="여행"
                                checked={this.state.eventCheck === '여행'}
                                onChange={this.onTermChange}
                            />
                            <label htmlFor="lb_book3">여행</label>
                        </li>
                        <li className="radio_04">
                            <input
                                type="radio"
                                name="lb_book"
                                id="lb_book4"
                                value="지식교양"
                                checked={this.state.eventCheck === '지식교양'}
                                onChange={this.onTermChange}
                            />
                            <label htmlFor="lb_book4">지식교양</label>
                        </li>
                        <li className="radio_05">
                            <input
                                type="radio"
                                name="lb_book"
                                id="lb_book5"
                                value="문학"
                                checked={this.state.eventCheck === '문학'}
                                onChange={this.onTermChange}
                            />
                            <label htmlFor="lb_book5">문학</label>
                        </li>
                        <li className="radio_06">
                            <input
                                type="radio"
                                name="lb_book"
                                id="lb_book6"
                                value="인문사회"
                                checked={this.state.eventCheck === '인문사회'}
                                onChange={this.onTermChange}
                            />
                            <label htmlFor="lb_book6">인문사회</label>
                        </li>
                    </ul>

                    <h2><img src="/images/events/2019/event190402/tit_02.png"
                             alt="STEP 2. 설렘꾸러미의 책을 활용하여 학생들과 함께 만들고 싶은 수업을 적어주세요."/></h2>
                    <div className="msg_box">
                        <div className="bgbox">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                cols="1"
                                rows="15"
                                maxLength="400"
                                value={this.state.eventContents}
                                onChange={this.setApplyContent}
                                placeholder="자세하게 적어주실수록 당첨 확률이 높아집니다!">
                            </textarea>
                            <p className="count">(<span>{this.state.eventLength}</span>/400)</p>
                        </div>
                        { /* 부분 렌더링 예시 */
                         (this.state.eventButtonView == 1 && this.state.eventUpdateCheck == 0) &&  /* 내 글을 작성한 상태, 글 보기 */
                            <div className="btn_area">
                                <button
                                    type="button"
                                    name="eventViewButton"
                                    id="eventViewButton"
                                    className="btn_mywrite"
                                    onClick={this.eventUpdateContent}>
                                    내 글 보기
                                </button>
                            </div>
                        }
                        {(this.state.eventButtonView == 1 && this.state.eventUpdateCheck == 1) &&  /* 내 글을 작성한 상태, 글 수정 */
                            <div className="btn_area">
                                <button
                                    type="button"
                                    name="eventUpdateButton"
                                    id="eventUpdateButton"
                                    className="btn_mywrite"
                                    onClick={this.eventUpdateContent}>
                                    수정하기
                                </button>
                            </div>
                        }

                    </div>
                    <div className="btn_apply_wrap">
                        <button
                            type="button"
                            id="eApply"
                            className="btn_apply"
                            onClick={this.eventApply}>
                            <img src="/images/events/2019/event190402/btn_apply.png" alt="설렘꾸러미 신청하기"/>
                        </button>
                    </div>
                </div>

                <div className="cont3">
                    <img src="/images/events/2019/event190402/img_info.jpg" alt="신청 시 유의사항"/>
                    <ul className="blind">
                        <li>캠페인은 1인 1회 참여 가능합니다.</li>
                        <li>캠페인 선물은 교환이 불가합니다. 파본일 경우 담당자에게 연락해주세요. (02-6970-5753)</li>
                        <li>캠페인 선물은 신청시 작성해주신 학교 주소로 발송되며, 반송된 경우 다시 발송해드리지 않습니다.</li>
                        <li>신청자 개인정보(성명/주소/휴대전화번호)는 배송업체에 공유됩니다. (롯데글로벌로지스(주) - 사업자등록번호 : 102-81-23012)</li>
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
        eventAnswer: state.saemteo.get('eventAnswer').toJS(),
        eventGiftBundleCount : state.saemteo.get('eventGiftBundleCount').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;


