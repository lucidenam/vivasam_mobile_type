import React, {Component,Fragment} from 'react';
import './Event.css';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    constructor(props) {
        super(props);
        this.state = {
            agreeCheck: 0, // 개인정보 수집 이용 동의 여부 ( 0 : 거부 / 1 : 승인 )
            updateAgreeCheck : 0, // 개인정보 수정 시 수집 동의 여부
            themeChannelCheck : "" //  선호하는 지질 VR
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
    onSiteChange = (e) => {
        this.setState({
            themeChannelCheck: e.currentTarget.value
        });
    };


    // 개인정보 수정 동의 체크
    updateAgreeCheckChange = () => {
        this.setState({
            updateAgreeCheck: !this.state.updateAgreeCheck
        });
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
                common.info("활용해보고 싶은 테마관을 선택해 주세요.");
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
           event.eventAnswerDesc = "/선택한 테마관 : " + this.state.themeChannelCheck; // 질문 응답
           let response = await SaemteoActions.insertNoFormEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
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

    render () {
        const { handleClick } = this.props;

        return (
            <div className="eventDetail">
                <p><img src="https://www.vivasam.com/images/event/2019/m/event190218/img1.jpg" alt="비바샘 선생님을 위한 즐거운 신학기 선물 2019. 02. 18 ~ 03. 31" /></p>
                <div className="cont01">
                    <img src="https://www.vivasam.com/images/event/2019/m/event190218/img2.jpg" alt="신규 가입하고 100% 선물을 받아가세요." useMap="#evtMap" />
                    <div className="btn_wrap">
                        <a href="https://www.vivasam.com/opendata/themeChannel2015.do" target="_blank">
                            <img src="https://www.vivasam.com/images/event/2019/m/event190218/btn_preview.png" alt="비바샘 테마관 미리보기" />
                        </a>
                    </div>
                    <ol className="blind">
                        <li>STEP 1 신규 회원가입</li>
                        <li>STEP 2 설문조사 참여하기</li>
                        <li>STEP 3 매일 카페라떼 마일드 100% 증정</li>
                    </ol>
                    <p className="blind">Q. 신학기 수업에 활용해보고 싶은 테마관은 무엇인가요?</p>
                    <div className="btn_join">
                        <button
                            id="btnJoin"
                            type="button"
                            onClick={this.checkJoinChange}>
                            <img src="https://www.vivasam.com/images/event/2019/m/event190218/btn_join.png" alt="회원가입" />
                        </button>
                    </div>
                </div>
                <div className="cont02">
                    <div className="theme">
                        <ul>
                            <li class="theme1">
                                <input type="radio" name="attraction" id="theme1"
                                   value="VR지질답사"
                                   checked={this.state.themeChannelCheck === 'VR지질답사'}
                                   onChange={this.onSiteChange}
                                />
                                <label for="theme1">VR 지질답사</label>
                            </li>
                            <li class="theme2">
                                <input type="radio" name="attraction" id="theme2"
                                       value="신재생에너지 체험관"
                                       checked={this.state.themeChannelCheck === '신재생에너지 체험관'}
                                       onChange={this.onSiteChange}
                                />
                                <label for="theme2">신재생에너지 체험관</label>
                            </li>
                            <li class="theme3">
                                <input type="radio" name="attraction" id="theme3"
                                       value="과학 가상실험실"
                                       checked={this.state.themeChannelCheck === '과학 가상실험실'}
                                       onChange={this.onSiteChange}
                                />
                                <label for="theme3">과학 가상실험실</label>
                            </li>
                            <li class="theme4">
                                <input type="radio" name="attraction" id="theme4"
                                       value="어린이 테마백과"
                                       checked={this.state.themeChannelCheck === '어린이 테마백과'}
                                       onChange={this.onSiteChange}
                                />
                                <label for="theme4">어린이 테마백과</label>
                            </li>
                            <li class="theme5">
                                <input type="radio" name="attraction" id="theme5"
                                       value="비바샘 문학관"
                                       checked={this.state.themeChannelCheck === '비바샘 문학관'}
                                       onChange={this.onSiteChange}
                                />
                                <label for="theme5">비바샘 문학관</label>
                            </li>
                            <li class="theme6">
                                <input type="radio" name="attraction" id="theme6"
                                       value="사이언스 백과"
                                       checked={this.state.themeChannelCheck === '사이언스 백과'}
                                       onChange={this.onSiteChange}
                                />
                                <label for="theme6">사이언스 백과</label>
                            </li>
                            <li class="theme7">
                                <input type="radio" name="attraction" id="theme7"
                                       value="독도 교실"
                                       checked={this.state.themeChannelCheck === '독도 교실'}
                                       onChange={this.onSiteChange}
                                />
                                <label for="theme7">독도 교실</label>
                            </li>
                            <li class="theme8">
                                <input type="radio" name="attraction" id="theme8"
                                       value="미술작품의 세계"
                                       checked={this.state.themeChannelCheck === '미술작품의 세계'}
                                       onChange={this.onSiteChange}
                                />
                                <label for="theme8">미술작품의 세계</label>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="cont03">
                    <img src="https://www.vivasam.com/images/event/2019/m/event190218/img3.jpg" alt="개인정보 수집 및 이용동의" />
                    <ul className="blind">
                        <li>이용목적 : 경품 배송 및 고객 문의 응대</li>
                        <li>수집하는 개인정보 : 성명, 휴대전화번호</li>
                        <li>개인정보 보유 및 이용기간 : 2019년 4월 5일까지 (이용목적 달성 시 즉시 파기)</li>
                        <li>이벤트 기간 내 교사 인증이 완료된 신규 회원만 참여 가능합니다. (EPKI/GPKI 인증, 서류 인증 포함)</li>
                        <li>탈퇴 후 재가입하여 응모하신 경우, 당첨에서 제외됩니다.</li>
                        <li>선물은 매주 수요일에 발송되며, 선물 발송을 위해 서비스 업체에 휴대전화번호가 제공됩니다. (㈜다우기술-사업자번호 : 220-81-02810)</li>
                    </ul>
                    <div className="agree_check">
                        <input
                            type="checkbox"
                            className="checkbox_circle"
                            id="agreeCheck"
                            name="agreeCheck"
                            ref="agreeCheck"
                            checked={this.state.agreeCheck == 1}
                            onChange={this.agreeCheckChange}
                            />
                        <label htmlFor="agreeCheck">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                    </div>
                    <div className="btn_wrap">
                        <button
                            id="eApply"
                            type="button"
                            onClick={this.eApplyClick}
                            >
                            <img src="https://www.vivasam.com/images/event/2019/m/event190218/btn_apply.png" alt="참여하기" />
                        </button>
                    </div>
                </div>
                <div className="cont04">
                    <img src="https://www.vivasam.com/images/event/2019/m/event190218/img4.jpg" alt="개인 정보를 업데이트해주신 선생님께 매주 선물을 드립니다." />
                    <p className="blind">이벤트 기간 동안 개인 정보를 최신으로 업데이트 해주세요! 매주 100분을 선정하여 선물을 드립니다. 던킨도너츠 먼치킨 10개팩 매주 100명</p>
                    <p className="blind">당첨자 발표 : 매주 수요일 비바샘 공지사항 2/27, 3/6, 3/13, 3/20, 3/27, 4/3</p>
                    <ul className="blind">
                        <li>이용목적 : 경품 배송 및 고객 문의 응대</li>
                        <li>수집하는 개인정보 : 성명, 휴대전화번호</li>
                        <li>개인정보 보유 및 이용기간 : 2019년 4월 5일까지 (이용목적 달성 시 즉시 파기)</li>
                        <li>이벤트 기간 내 신규 가입하신 선생님은 제외합니다.</li>
                        <li>개인 정보를 2회 이상 업데이트하셨더라도 1회로 인정됩니다.</li>
                        <li>선물은 매주 수요일에 발송되며, 선물 발송을 위해 서비스 업체에 휴대전화번호가 제공됩니다.  (㈜다우기술-사업자번호 : 220-81-02810)</li>
                    </ul>
                    <div className="agree_check">
                        <input
                            type="checkbox"
                            className="checkbox_circle"
                            id="agreeCheck2"
                            name="agreeCheck2"
                            ref="agreeCheck2"
                            checked={this.state.updateAgreeCheck == 1}
                            onChange={this.updateAgreeCheckChange}
                        />
                        <label htmlFor="agreeCheck2">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                    </div>
                    <div className="btn_wrap">
                        <button
                            id="btnMypage"
                            type="button"
                            onClick={this.reApplyClick}
                        >
                        <img src="https://www.vivasam.com/images/event/2019/m/event190218/btn_mypage.png" alt="개인 정보 수정하기" />
                        </button>
                    </div>
                </div>
             </div>
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
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
