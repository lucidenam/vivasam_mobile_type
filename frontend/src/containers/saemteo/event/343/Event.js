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

class Event extends Component{

    state = {
        popState: false,
        quizPopState: false,
        msgPopState: false,
        isEventApply: false,
        subjectName: '수학',    // 과목
        applyContent : '',  // 이야기
        contentLength : 0, // 길이 카운트
        answers:[0,0,0] // 퀴즈 응답 0은 선택되지 않은 상태
    }
    
    componentDidMount = async() => {
        const { BaseActions } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };
    
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

    // UI
    onPop = () => {
        const { popState } = this.state;
        
        this.setState({
            popState: !popState
        });
    }

    onQuizPop = (e) => {
        const { logged, history, BaseActions, loginInfo} = this.props;
        const { quizPopState } = this.state;
        
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            if (loginInfo.schoolLvlCd !== 'ES') {
                common.info("초등학교 선생님만 참여 가능합니다.");
                return false;
            }
            
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
                
                this.setState({
                    quizPopState: !quizPopState
                });

                window.scrollTo(0, 0);
            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    }
    
    onCloseQuizPopup = () => {
        api.appConfirm('마스터즈 응모가 완료되지 않았습니다. 응모를 취소하시겠습니까?').then(confirm => {
            if (confirm) {
                this.setState({
                    quizPopState: false
                });
            }
        });
    }
    
    onCloseMsgPopup = () => {
        api.appConfirm('마스터즈 응모가 완료되지 않았습니다. 응모를 취소하시겠습니까?').then(confirm => {
            if (confirm) {
                this.setState({
                    msgPopState: false
                });                
            }
        });
    }
    
    onAnswerQuiz = (qIdx, answer) => {
        var {answers} = this.state; 
        answers[qIdx] = answer;
        this.setState({
            answers: answers
        })
        
    }
    
    onCheckAnswers = () => {
        // 정답 체크
        var {answers} = this.state;
        
        if (answers[0] === 0 || answers[1] === 0 || answers[2] === 0) {
            common.info("풀지 않은 퀴즈가 있습니다.");
            return;
        }
        
        if (answers[0] !== 2 || answers[1] !== 3 || answers[2] !== 4) {
            common.info("오답이 있습니다. 다시 풀어주세요.");
            this.setState({
                answers: [0,0,0]
            });
            return;
        }
        
        // 메시지 팝업 띄우기
        const { quizPopState, msgPopState } = this.state;

        this.setState({
            quizPopState: !quizPopState,
            msgPopState: !msgPopState
        });
    }

    onSelectSubject = (subjectName) => {
        this.setState({
            subjectName: subjectName
        })
    }
    
    

      // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, loginInfo } = this.props;
        const { subjectName, applyContent } = this.state;
        if (!subjectName) {
            common.info("과목이 선택되지 않았습니다.");
            return;
        }
        if (!applyContent.trim()) {
            common.info("나누고픈 이야기를 작성해 주세요.");
            return;
        }
        
        const eventAnswer = {
            subjectName : this.state.subjectName,
            applyContent : this.state.applyContent
        }
        
        // 퀴즈 실행시 체크하지만 한번 더 체크
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            if (loginInfo.schoolLvlCd !== 'ES') {
                common.info("초등학교 선생님만 참여 가능합니다.");
                return false;
            }
            
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
                
                SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                
                handleClick(eventId);

            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    setApplyContent = (e) => {
        if (e.target.value.length > 1000) {
            common.info("1000자 이내로 입력해 주세요.");
        } else {
            this.setState({
                applyContent: e.target.value,
                contentLength: e.target.value.length
            });
        }
    };

    render () {
        const { popState, quizPopState, msgPopState, applyContent, contentLength, subjectName, answers } = this.state;

        return (
			<section className="event210504">
                <div className="evtBannerWrap">
                    <button type="button" className={`btnBannerPop ${ popState ? 'on' : ''}`} onClick={ this.onPop }><img src="/images/events/2021/event210504/btn_banner.jpg" alt="초등 비바샘 100일간의 동행에 함께하세요!" /></button>
                    <div className="evtBannerPop" style={{ display: popState ? 'block' : 'none' }}>
                        <div className="dimed"></div>
                        <div className="evtBannerCont">
                            <div className="ani">
                                {/* bg 이미지 월마다 경로 변경됨 */}
                                <img src="/images/events/2021/event210504/bg_pop.png" alt="" className="bg" />
                                {/* 3월 (335 참고) */}
                                {/* 4월 */}
                                <div className="april">
                                    <img src="/images/events/2021/event210319/ani/april_on.png" alt="4월 동행 2탄 비바샘*깨몽 마스터즈" className="on" />
                                    <span className="tip">마스터즈<br />파티에<br />초대합니다.</span>
                                </div>
                                <span className="roadOn"></span>
                                {/* 4월 */}
                                
                                {/* OPEN */}
                                <div className="open">
                                    <span className="openpop01"></span>
                                    <span className="openpop02"></span>
                                    <span className="openpop03"></span>
                                    <span className="openpop04"></span>
                                    <span className="openpop05"></span>
                                    <span className="openpop06"></span>
                                    <span className="openpop07"></span>
                                    <span className="openpop08"></span>
                                    <span className="openpop09"></span>
                                </div>
                                {/* OPEN */}
                            </div>
                            <div className="blind">
                                <strong>초등 비바샘 100일간의 동행</strong><p>초등 비바샘을 기다리며, 선생님과 즐거운 동행을 이어갑니다.</p>
                            </div>
                            <button type="button" className="btnEvtPopClose" onClick={ this.onPop }><span className="blind">팝업 닫기</span></button>
                        </div>
                    </div>
                </div>
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210504/main_tit.png" alt="초등 비바샘, 100일 간의 동행 2탄. 비바샘 * 깨몽 마스터즈" /></h1>
                    <p>
						<strong>나만의 수업 노하우를 선생님들과 공유하고<br />비상교육 수업 자료 개발자와 함께 소통하는<br />마스터즈 파티를 오픈합니다.</strong><br /><br />
						초등 수업 차시창 깨몽이와 관련된 퀴즈를 풀면<br />마스터즈 파티에 한 걸음 다가갈 수 있습니다.
					</p>
                </div>
                <div className="evtCont02">
                    <h2><img src="/images/events/2021/event210504/evt_cont.png" alt="모집안내" /></h2>
                    <div className="blind">
						<ul>
							<li>
								<span className="labelTit">응모 기간</span>
								<div>2021년 5월 4일 ~ 5월 18일</div>
							</li>
							<li>
								<span className="labelTit">당첨자 발표</span>
								<div>2021년 5월 20일</div>
							</li>
							<li>
								<span className="labelTit">모집 내용</span>
								<ul>
									<li>마스터즈 72명 : 마스터즈 파티 초대권 + 선물 패키지</li>
									<li>아차상 100명 : 스타벅스 아이스 카페라떼 기프티콘</li>
								</ul>
							</li>
                            <p>‘깨몽’이는 비바샘 차시창에 등장하는 수업 도우미입니다.</p>
						</ul>
					</div>
                    <div className="infoList01">
						<span className="blind">마스터즈 파티 안내</span>
						<ul>
							<li>비상교육 수업자료 <strong>개발자 + 선생님 8명</strong>이 한 팀이 되어 파티가 진행됩니다.</li>
							<li>마스터즈 선생님께는 <strong>깨몽 굿즈 세트</strong>와 <strong>스낵박스</strong>가 파티 전에 배송됩니다.</li>
							<li><strong>파티 일정 : 5월 넷째 주 예정</strong></li>
						</ul>
						<span>* 자세한 사항은 마스터즈 선생님께 별도로 안내드립니다.</span>
					</div>
                    <div className="btnWrap">
						<button type="button" className="btnQuiz" onClick={ this.onQuizPop }><img src="/images/events/2021/event210504/btn_apply.png" alt="마스터즈 응모하기" /></button>
					</div>
                    <div className="infoList02">
						<h4 className="blind">마스터즈 이벤트 참여 순서</h4>
						<ol>
							<li><strong>깨몽 퀴즈 풀기!</strong><br />3문제 모두 맞추셔야 통과됩니다.</li>
							<li>2021년 5월 18일,<br /><strong>72인의 마스터즈 발표</strong></li>
							<li><strong>2021년 5월 넷째 주</strong><br />전국 마스터즈 온라인 파티!<br /><p><em>비바샘이 보내드린 맛있는 간식</em>과 함께!<br />온라인 Zoom에서 만나요!</p></li>
						</ol>
					</div>
                </div>
                <div className="popQuiz" style={{ display: quizPopState ? 'block' : 'none' }}>
                    <div className="dimed"></div>
                    <div id="popQuiz01" className="quizCont">
                        <div className="titWrap">
                            <strong className="tit">깨몽 퀴즈 풀기!<br />3문제 모두 맞추셔야 통과됩니다.</strong>
                            <button type="button" className="btnQuizClose" onClick={ this.onCloseQuizPopup }><span className="blind">퀴즈 팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <div className="quizItem">
                                <p className="quizQ"><em>Q1.</em>다음 중 깨몽을 골라주세요.</p>
                                <div className="rdoWrap vertical">
                                    <span className="rdo"><input type="radio" name="q1" id="rdo01" checked={answers[0] === 1} onChange={() => {this.onAnswerQuiz(0, 1)}}/><label htmlFor="rdo01"><img src="/images/events/2021/event210504/img_chracter01.jpg" alt="" /></label></span>
                                    <span className="rdo"><input type="radio" name="q1" id="rdo02" checked={answers[0] === 2} onChange={() => {this.onAnswerQuiz(0, 2)}}/><label htmlFor="rdo02"><img src="/images/events/2021/event210504/img_chracter02.jpg" alt="" /></label></span>
                                    <span className="rdo"><input type="radio" name="q1" id="rdo03" checked={answers[0] === 3} onChange={() => {this.onAnswerQuiz(0, 3)}}/><label htmlFor="rdo03"><img src="/images/events/2021/event210504/img_chracter03.jpg" alt="" /></label></span>
                                </div>
                            </div>
                            <div className="quizItem">
                                <p className="quizQ"><em>Q2.</em>초등 차시창에서 깨몽의 역할이 아닌 것은?</p>
                                <div className="rdoWrap">
                                    <span className="rdo"><input type="radio" name="q2" id="rdo04" checked={answers[1] === 1} onChange={() => {this.onAnswerQuiz(1, 1)}}/><label htmlFor="rdo04">도움말</label></span>
                                    <span className="rdo"><input type="radio" name="q2" id="rdo05" checked={answers[1] === 2} onChange={() => {this.onAnswerQuiz(1, 2)}}/><label htmlFor="rdo05">힌트</label></span>
                                    <span className="rdo"><input type="radio" name="q2" id="rdo06" checked={answers[1] === 3} onChange={() => {this.onAnswerQuiz(1, 3)}}/><label htmlFor="rdo06">스톱워치</label></span>
                                    <span className="rdo"><input type="radio" name="q2" id="rdo07" checked={answers[1] === 4} onChange={() => {this.onAnswerQuiz(1, 4)}}/><label htmlFor="rdo07">과목 소개</label></span>
                                </div>
                            </div>
                            <div className="quizItem">
                                <p className="quizQ"><em>Q3.</em>깨몽이 가장 좋아하는 것은?</p>
                                <div className="rdoWrap">
                                    <span className="rdo"><input type="radio" name="q3" id="rdo08" checked={answers[2] === 1} onChange={() => {this.onAnswerQuiz(2, 1)}}/><label htmlFor="rdo08">옹달샘</label></span>
                                    <span className="rdo"><input type="radio" name="q3" id="rdo09" checked={answers[2] === 2} onChange={() => {this.onAnswerQuiz(2, 2)}}/><label htmlFor="rdo09">밤샘</label></span>
                                    <span className="rdo"><input type="radio" name="q3" id="rdo10" checked={answers[2] === 3} onChange={() => {this.onAnswerQuiz(2, 3)}}/><label htmlFor="rdo10">눈물샘</label></span>
                                    <span className="rdo"><input type="radio" name="q3" id="rdo11" checked={answers[2] === 4} onChange={() => {this.onAnswerQuiz(2, 4)}}/><label htmlFor="rdo11">비바샘 선생님</label></span>
                                </div>
                            </div>
                            <div className="btnWrap">
                                <button type="button" className="btnConfirm" onClick={ this.onCheckAnswers }>정답 확인</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="popQuiz" style={{ display: msgPopState ? 'block' : 'none' }}>
                    <div className="dimed"></div>
                    <div id="popQuiz02" className="quizCont">
                        <div className="titWrap">
                            <strong className="tit">퀴즈를 모두 맞추셨습니다!<br />깨몽이에게 쪽지를 남겨주세요.</strong>
                            <button type="button" className="btnQuizClose" onClick={this.onCloseMsgPopup}><span className="blind">퀴즈 팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <p>마스터즈 온라인 파티에서 비상교육 과목별 수업자료 개발자, 전국의 마스터즈와 나누고픈 이야기를 남겨주세요!</p>
                            <div className="quizItem">
                                <p className="quizQ">과목 선택</p>
                                <div className="rdoWrap">
                                    <span className="rdo"><input type="radio" name="q4" id="rdo12" checked={subjectName === '수학'} onChange={() => this.onSelectSubject('수학')}/><label htmlFor="rdo12">수학</label></span>
                                    <span className="rdo"><input type="radio" name="q4" id="rdo13" checked={subjectName === '사회'} onChange={() => this.onSelectSubject('사회')}/><label htmlFor="rdo13">사회</label></span>
                                    <span className="rdo"><input type="radio" name="q4" id="rdo14" checked={subjectName === '과학'} onChange={() => this.onSelectSubject('과학')}/><label htmlFor="rdo14">과학</label></span>
                                </div>
                            </div>
                            <div className="quizItem">
                                <p className="quizQ">파티에서 나누고픈 이야기</p>
                                <div className="evtTextarea">
                                    <textarea 
                                        name="quizComment" 
                                        id="quizComment"
                                        placeholder="전국의 마스터즈와 나누고픈 이야기를 상세하게 적어주세요."
                                        value={ applyContent }
                                        onChange={ this.setApplyContent }
                                        maxLength="1000"
                                    ></textarea>
                                    <p className="count"><span className="reasonCount">{ contentLength }</span>/1000</p>
                                </div>
                            </div>
                            <div className="btnWrap">
                                <button type="button" className="btnConfirm" onClick={ this.eventApply }>참여 완료</button>
                            </div>
                        </div>
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
