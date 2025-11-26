import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";
import * as popupActions from 'store/modules/popup';

class Event extends Component{

    constructor(props) {
        super(props);
        this.state = {
            agreeCheck: 0, // 개인정보 수집 이용 동의 여부 ( 0 : 거부 / 1 : 승인 )
            updateAgreeCheck : 0, // 개인정보 수정 시 수집 동의 여부
            themeChannelCheck : "", //  선호하는 플래너
            step1 : '',  // 해당 이벤트
            step1Length : 0,
            etcCheck : false  // 기타 저장 : false : 미저장 / true : 저장
        }

    }


    validate = () => {

        return true;
    };

    // 회원가입 버튼 Function
    checkJoinChange = () => {
        const { logged, history } = this.props;
        if(!logged){ // 로그인시
            history.push('/join/agree');
        }
        else{ // 미로그인시
            common.info("로그인 상태에서는 회원가입을 하실 수 없습니다.");
        }
    };

    // 개인정보 이용 동의 체크
    agreeCheckChange = () => {
        this.setState({
            agreeCheck: !this.state.agreeCheck
        });
    };

    // 라디오 버튼 체크 값 수정
    onSiteChange = (e) => {;
        this.setState({
            themeChannelCheck: e.currentTarget.value
        });
    };


    // 개인정보 수정 동의 체크
    updateAgreeCheckChange = () => {
        this.setState({
            updateAgreeCheck: !this.state.updateAgreeCheck
        }); // false로 하는 이유는 setstate 이후가 되어야 false가 true로 바뀌기 때문
        if(this.state.updateAgreeCheck == false){
            // common.info("참여해 주셔서 감사합니다.");
        }
    };


    // 제출하기
    eApplyClick = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{ // 로그인시
            if(this.state.themeChannelCheck == ""){
                common.info("학생들과 함께 기록하고 싶은 플래너 유형을 선택해 주세요.");
                return;
            }
            if(this.state.themeChannelCheck == '기타' && (this.state.etcCheck == false || this.state.step1 == "")){
                common.info("기타 의견을 입력해주세요.");
                return;
            }
            if(this.state.agreeCheck == 0){
                common.info("개인정보 수집 및 이용에 동의해 주세요.");
                return;
            }
            this.insertApplyForm();
        }

    };


    //신청
    insertApplyForm = async () => {
        const { event, eventId, loginInfo, history,  SaemteoActions, PopupActions, BaseActions } = this.props;
        try {
            event.eventId = eventId; // 이벤트 ID
            event.memberId = loginInfo.memberId; // 멤버 ID
            if(this.state.themeChannelCheck == '기타'){
                event.eventAnswerDesc = "/선택한 플래너 : " + this.state.themeChannelCheck + "/기타 의견 : " + this.state.step1 ; // 질문 응답
            }else{
                event.eventAnswerDesc = "/선택한 플래너 : " + this.state.themeChannelCheck; // 질문 응답
            }

            let response = await SaemteoActions.insertNoFormEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){

                if(this.state.themeChannelCheck != "기타"){
                    event.eventAnswerDesc = this.state.themeChannelCheck;
                }else{ // 기타인 경우 질문 응답 기록
                    event.eventAnswerDesc = this.state.step1;
                }
                event.eventAnswerSeq = 2;
                response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
                // 새로고침이 구현되어 있지 않으므로 값을 직접 넣어주어야 합니다.
                this.state.agreeCheck =  0;
                this.state.updateAgreeCheck = 0;
                this.state.themeChannelCheck = "";
            }else if(response.data.code === '4'){
                common.error("신규 회원만 참여 가능합니다.\n이미 회원이신 경우, 아래의 개인정보 수정 이벤트에 참여해 주세요")
            }
            else{
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    // 개인정보 수정하기 이동

    reApplyClick = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            if(this.state.updateAgreeCheck == 0){
                common.info("개인정보 수집 및 이용에 동의해 주세요");
            }else{
                history.push("/myInfo");
            }
        }
    };

    // 내용 입력
    setApplyContent = (e) => {
        if(e.target.value.length > 50){
            common.info("50 이내로 입력해 주세요.");
        }else{
            this.setState({
                step1Length: e.target.value.length,
                step1: e.target.value
            });
        }
    };

    // 기타 의견 저장 ( 사실 영향 없음 )
    setEtcCheck = (e) => {
        if(this.state.step1 == ""){
            common.info("기타 의견을 입력해주세요.");
        }else{
            if(this.state.etcCheck == false){
                this.setState({
                    etcCheck: !this.state.etcCheck
                });
                common.info("기타 의견이 저장되었습니다. 참여하기 버튼을 눌러주세요.");
            }else{
                common.info("기타 의견이 저장되었습니다. 참여하기 버튼을 눌러주세요.");
            }
        }
    };

    render () {
        return (
            <section className="event200217">
                <h1 className="blind">비바샘 선생님을 위한 2020 신학기 선물 2020.02.17 ~ 03.29</h1>
                <div className="inner">
                    <div className="cont">
                        <img src="images/events/2020/event200217/img2.jpg" alt="1. 신규 가입 선생님, 100% 선물!"/>
                        <div className="blind">
                            <p>신규 가입하신 후 아래 설문에 참여해주세요! 참여하신 모든 선생님께 선물을 드립니다. 매일 카페라떼 마일드</p>
                            <ul>
                                <li>※ 이벤트 기간 내 신규 회원만 참여 가능합니다.</li>
                                <li>※ 탈퇴 후 재가입하여 응모하신 경우, 당첨에서 제외됩니다.</li>
                                <li>※ 선물은 매주 휴대전화 번호로 발송됩니다.</li>
                            </ul>
                        </div>
                        <a onClick={this.checkJoinChange} className="btn_join"><img src="images/events/2020/event200217/btn_join.png" alt="회원가입"/></a>

                        <div className="question">
                            <h2><em>Q.</em> 한 해 동안 학생들과 함께 기록하고 싶은 플래너 유형을 선택해 주세요.</h2>
                            <ul>
                                <li><input type="radio" name="que" value="자기주도학습 플래너" id="q1"  checked={this.state.themeChannelCheck === '자기주도학습 플래너'} onChange={this.onSiteChange}/><label htmlFor="q1" className={this.state.themeChannelCheck === '자기주도학습 플래너' ? "on" : ""} >자기주도학습 플래너</label></li>{/* 클릭시 클래스 on 추가 */}
                                <li><input type="radio" name="que" value="인성교육 플래너" id="q2" checked={this.state.themeChannelCheck === '인성교육 플래너'} onChange={this.onSiteChange}/><label htmlFor="q2" className={this.state.themeChannelCheck === '인성교육 플래너' ? "on" : ""} >인성교육 플래너</label></li>
                                <li><input type="radio" name="que" value="진로탐색 플래너" id="q3" checked={this.state.themeChannelCheck === '진로탐색 플래너'} onChange={this.onSiteChange}/><label htmlFor="q3" className={this.state.themeChannelCheck === '진로탐색 플래너' ? "on" : ""} >진로탐색 플래너</label></li>
                                <li><input type="radio" name="que" value="독서활동 플래너" id="q4" checked={this.state.themeChannelCheck === '독서활동 플래너'} onChange={this.onSiteChange}/><label htmlFor="q4" className={this.state.themeChannelCheck === '독서활동 플래너' ? "on" : ""} >독서활동 플래너</label></li>
                                <li><input type="radio" name="que" value="테마별 플래너" id="q5" checked={this.state.themeChannelCheck === '테마별 플래너'} onChange={this.onSiteChange}/><label htmlFor="q5" className={this.state.themeChannelCheck === '테마별 플래너' ? "on" : ""} >음악/미술/역사 등<br />테마별 플래너</label></li>
                                <li><input type="radio" name="que" value="기타" id="q6" checked={this.state.themeChannelCheck === '기타'} onChange={this.onSiteChange}/><label htmlFor="q6" className={this.state.themeChannelCheck === '기타' ? "on" : ""} >기타</label>
                                { /* 부분 렌더링 예시 */
                                    (this.state.themeChannelCheck == '기타') &&  /* 내 글을 작성한 상태, 글 보기 */
                                    <div className="pop_etc">
                                        <textarea
                                            name=""
                                            rows="3"
                                            cols=""
                                            maxLength="50"
                                            id="etcMsg"
                                            value={this.state.step1}
                                            onChange={this.setApplyContent}
                                            placeholder="기타 의견을 입력해주세요. (50자 이내 입력)">
                                        </textarea>
                                        <button type="button" className="btn_pop_close"><span className="blind">닫기</span></button>
                                        <a onClick={this.setEtcCheck} className="btn_submit">확인</a>
                                    </div>
                                }
                                </li>
                            </ul>
                        </div>

                        <div className="agree_info">
                            <dl>
                                <dt>개인정보 수집 및 이용동의</dt>
                                <dd>
                                    <ul>
                                        <li>- 이용 목적 : 경품 배송 및 고객 문의 응대</li>
                                        <li>- 수집하는 개인정보 : 성명, 휴대전화번호</li>
                                        <li>- 개인정보 보유 및 이용기간 : 2020년 4월 30일까지 (이용목적 달성 시 즉시 파기)<br/>선생님께서는 개인정보의 수집 및
                                            이용, 취급 위탁에 대한 동의를 거부할 수 있습니다.<br/>단, 동의를 거부할 경우 신청이 불가합니다.
                                        </li>
                                    </ul>
                                </dd>
                            </dl>
                            <div className="join_ipt_chk">
                                <input type="checkbox" name="agree" className="checkbox_circle" id="infoCheck01"  checked={this.state.agreeCheck == 1} onChange={this.agreeCheckChange}/><label htmlFor="infoCheck01" className="checkbox_circle_simple">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                            </div>
                        </div>

                        <div className="btn_wrap">
                            <button type="button" id="eApply" onClick={this.eApplyClick}><img src="images/events/2020/event200217/btn_apply.png" alt="참여하기"/></button>
                        </div>
                    </div>

                    <div className="cont2">
                        <img src="images/events/2020/event200217/img3.jpg" alt="2. 개인정보 업데이트 선생님, 300명 선물!" />
                        <div className="blind">
                            <p>이벤트 기간 동안 개인 정보를 최신으로 업데이트 해주세요! 300명을 선정하여 선물을 드립니다. 문화상품권 5,000원권</p>
                            <ul>
                                <li>※ 당첨자 발표 : 4월 1일 / 비바샘 공지사항</li>
                                <li>※ 이벤트 기간 중 신규 가입하신 선생님은 제외됩니다.</li>
                                <li>※ 이벤트 기간 중 개인 정보를 2회 이상 업데이트하여도 1회만 참여됩니다.</li>
                            </ul>
                        </div>

                        <div className="agree_info">
                            <dl>
                                <dt>개인정보 수집 및 이용동의</dt>
                                <dd>
                                    <ul>
                                        <li>- 이용 목적 : 경품 배송 및 고객 문의 응대</li>
                                        <li>- 수집하는 개인정보 : 성명, 휴대전화번호</li>
                                        <li>- 개인정보 보유 및 이용기간 : 2020년 4월 30일까지 (이용목적 달성 시 즉시 파기)<br />선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다.<br />단, 동의를 거부할 경우 신청이 불가합니다.</li>
                                    </ul>
                                </dd>
                            </dl>
                            <div className="join_ipt_chk">
                                <input type="checkbox" name="agree2" className="checkbox_circle" id="infoCheck02"  checked={this.state.updateAgreeCheck == 1} onChange={this.updateAgreeCheckChange}/><label htmlFor="infoCheck02" className="checkbox_circle_simple">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                            </div>
                        </div>

                        <div className="btn_wrap">
                            <button type="button" id="" onClick={this.reApplyClick}><img src="/images/events/2020/event200217/btn_modify.png" alt="정보수정"/></button>
                        </div>
                    </div>
                </div>

                <div className="info">
                    <img src="/images/events/2020/event200217/info.jpg" alt="신청 시 유의사항" />
                    <div className="blind">
                        <ul>
                            <li>1인 1회 신청 가능합니다.</li>
                            <li>정확하지 않은 휴대전화 번호로 반송되거나 유효 기간 동안 상품권을 사용하지 않은 경우, 재발송되지 않습니다.</li>
                            <li>선물 발송을 위해 서비스 업체에 휴대전화 번호가 제공됩니다. (㈜다우기술-사업자번호 : 220-81-02810)</li>
                        </ul>
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
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
