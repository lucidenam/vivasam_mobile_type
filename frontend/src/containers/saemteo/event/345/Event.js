import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import {bindActionCreators} from "redux";


const answerArr = ['7가지 유형별 퀴즈 탑재', '4가지 플레이 모드 제공', '퀴즈 세부 리포트 저장 기능', '내 마음대로 제작하는 채점 스탬프'];

class Event extends Component{

    state = {
        popState: false,
        isEventApply: false,
        answer1Idx: -1,    // 샘퀴즈 기대되는 기능
        applyContent : ''  //

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

    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions, event, eventId, handleClick, loginInfo} = this.props;
        const { answer1Idx, applyContent } = this.state;
        
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

                // 초등대상 이벤트 초등학교 선생님이 아닌경우 알럿
                let myClassInfo = await this.getMyClassInfo();
                let schoolLvlCd = myClassInfo.schoolLvlCd;
                if(schoolLvlCd !== 'ES') {
                    common.info("초등학교 선생님 대상 이벤트 입니다.");
                    return false;
                }

                if (answer1Idx < 0) {
                    common.info("\'샘퀴즈\'에서 가장 기대되는 기능을 선택해주세요.");
                    return;
                }
                if (!applyContent.trim()) {
                    common.info("\'샘퀴즈\'에 어떤 퀴즈가 탑재되면 좋을지 의견을 입력해주세요.");
                    return;
                }

                const eventAnswer = {
                    answer1 : answerArr[answer1Idx],
                    applyContent : applyContent
                }

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

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;
        try {
            let result = await MyclassActions.myClassInfo();
            return result.data;
        } catch (e) {
            console.log(e);
        }
    }

    setApplyContent = (e) => {
        if (e.target.value.length > 2000) {
            common.info("2000자 이내로 입력해 주세요.");
        } else {
            this.setState({
                applyContent: e.target.value
            });
        }
    };

    onPop = () => {
        const { popState } = this.state;

        this.setState({
            popState: !popState
        });
    }

    onAnswerQuiz = (answer1Idx) => {
        this.setState({
            answer1Idx: answer1Idx
        })

    }

    render () {
        const { popState, answer1Idx, applyContent} = this.state;

        return (
			<section className="event210604">
                <div className="evtBannerWrap">
                    <button type="button" className={`btnBannerPop ${ popState ? 'on' : ''}`} onClick={ this.onPop }><img src="/images/events/2021/event210604/btn_banner.png" alt="초등 비바샘 100일간의 동행에 함께하세요!" /></button>
                    <div className="evtBannerPop" style={{ display: popState ? 'block' : 'none' }}>
                        <div className="dimed"></div>
                        <div className="evtBannerCont">
                            <div className="ani">
                                {/* bg 이미지 월마다 경로 변경됨 */}
                                <img src="/images/events/2021/event210604/bg_pop.png" alt="" className="bg" />
                                {/* 3월, 4월, 5월 (335, 343, 344 참고) */}
                                {/* 6월 */}
                                <div className="june">
                                    <img src="/images/events/2021/event210319/ani/june_on.png" alt="6월 동행 4탄 샘 퀴즈 온 더 블럭" className="on" />
                                </div>
                                <span className="roadOn"></span>
                                {/* 6월 */}
                                
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
                    <h1><img src="/images/events/2021/event210604/img_tit.png" alt="초등 비바샘, 100일 간의 동행 4탄. 샘퀴즈 온더 블럭" /></h1>
                    <div className="blind">
                        <p>6월에 열리는 초등 비바샘에 아이들과 더욱 재미있게 쌍방향 수업을 할 수 있는 퀴즈 플랫폼 ‘샘퀴즈’가 오픈됩니다. 수업에 필요한 퀴즈는 무엇일까요? 퀴즈 주제부터 내용까지 다양한 의견을 남겨주시면 풍성한 선물을 보내드립니다.</p>
                        <ul>
							<li>
								<span>응모 기간</span>
								<p>2021.06.04(금) ~ 06.25(월)</p>
							</li>
							<li>
								<span>당첨자 발표</span>
								<p>2021.06.29(화)</p>
							</li>
							<li>
								<span>당첨자 혜택</span>
								<p>백화점상품권 5만원권 5명, 럭키백 랜덤 선물 100명</p>
							</li>
						</ul>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="evtInfoWrap">
                        <img src="/images/events/2021/event210604/img_evtinfo.png" alt="" />
						<div className="blind">
							<strong>쌍방향 수업, 비바샘 ‘샘퀴즈’와 함께!</strong>
							<ul>
								<li>7가지 유형별 퀴즈(OX형, 선택형, 초성퀴즈형 등)</li>
								<li>4가지 플레이 모드(함께 모드, 선생님 모드, 게임 모드, 과제 모드 등)</li>
								<li>개별 피드백을 위한 결과 리포트(학생별, 퀴즈별 리포트)</li>
								<li>우리 반만의 채점 스탬프 꾸미기</li>
							</ul>
						</div>
					</div>
                    <div className="evtFormWrap">
                        <div className="formInner">
                            <div className="formItem">
								<p className="formQ">‘샘퀴즈’에서 가장 기대되는 기능은 무엇인가요?</p>
								<div className="rdoWrap">
									<span className="rdo"><input type="radio" name="formRdo" id="formRdo01" checked={answer1Idx === 0} onChange={() => {this.onAnswerQuiz(0)}} /><label htmlFor="formRdo01">7가지 유형별 퀴즈 탑재</label></span>
									<span className="rdo"><input type="radio" name="formRdo" id="formRdo02" checked={answer1Idx === 1} onChange={() => {this.onAnswerQuiz(1)}} /><label htmlFor="formRdo02">4가지 플레이 모드 제공</label></span>
									<span className="rdo"><input type="radio" name="formRdo" id="formRdo03" checked={answer1Idx === 2} onChange={() => {this.onAnswerQuiz(2)}} /><label htmlFor="formRdo03">퀴즈 세부 리포트 저장 기능</label></span>
									<span className="rdo"><input type="radio" name="formRdo" id="formRdo04" checked={answer1Idx === 3} onChange={() => {this.onAnswerQuiz(3)}} /><label htmlFor="formRdo04">내 마음대로 제작하는 채점 스탬프</label></span>
								</div>
							</div>
                            <div className="formItem">
								<p className="formQ">‘샘퀴즈’에 어떤 퀴즈가 탑재되면 좋을까요?</p>
								<div className="textareaWrap">
									<textarea 
                                        name="quizComment"
                                        placeholder="2,000자까지 가능"
                                        value={applyContent}
                                        onChange={this.setApplyContent}
                                        maxLength="2000"
                                    ></textarea>
								</div>
								<div className="tipWrap">
									<p className="icoTip">작성 Tip!</p>
									<ul className="tipList">
										<li>단원 마무리, 계기이슈 관련 외에 <strong>색다른 주제의 퀴즈</strong>를 기다립니다!</li>
										<li><strong>원하시는 퀴즈 내용</strong>을 남겨주셔도 좋습니다!</li>
										<li>수업에 적용해보니 <strong>반응이 좋았던 퀴즈</strong>도 환영합니다!</li>
									</ul>
								</div>
							</div>
                            <div className="btnWrap">
                                <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">응모하기</span></button>
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
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(Event));
