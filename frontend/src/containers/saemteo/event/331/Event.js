import React, {Component} from 'react';
import './Event.css';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import EventApplyResult from "../../EventApplyResult";

class Event extends Component {

    state = {
        data: [
            {id:1, valTxt:'창의 융합 수업 연구자료', url:'https://www.vivasam.com/opendata/OriginalIdeaConvergenceList.do?deviceMode=pc', urlTxt:'공모전 수상작'},
            {id:2, valTxt:'주제별 테마 자료', url:'https://www.vivasam.com/opendata/themeChannel2015.do?deviceMode=pc', urlTxt:'비바샘 테마관'},
            {id:3, valTxt:'계기 수업 자료', url:'https://www.vivasam.com/opendata/VMagazine2018.do?deviceMode=pc', urlTxt:'V매거진'},
            {id:4, valTxt:'온라인 수업 노하우', url:'https://www.vivasam.com/opendata/onlineClassSurvival.do?deviceMode=pc', urlTxt:'온라인 생존 비법'},
            {id:5, valTxt:'교원 연수', url:'https://www.vivasam.com/tschool/recommendedLecture.do?deviceMode=pc', urlTxt:'티스쿨 추천강의'},
            {id:6, valTxt:'기타'},
        ],
        onSelValue: '',
        popOn: false,
        agreeCheck: 0, // 개인정보 수집 이용 동의 여부 ( 0 : 거부 / 1 : 승인 )
        updateAgreeCheck : 0, // 개인정보 수정 시 수집 동의 여부
        themeChannelCheck : "", //  선호하는 플래너
        step1 : '',  // 해당 이벤트
        step1Length : 0,
        etcCheck : false  // 기타 저장 : false : 미저장 / true : 저장
    }

    onSelRdo = (e) => {
        this.setState({
            onSelValue: e.target.value
        });

        const popOn = e.target.value === '기타';
        if (popOn) {
            this.setState({
                popOn: popOn
            });
        } else {
            this.onPopClose();
        }
    }

    onPopClose = () => {
        this.setState({
            popOn: false
        })
    }

    // 회원가입 버튼 Function
    checkJoinChange = () => {
        const { logged, history } = this.props;
        if(!logged){
            history.push('/join/agree');
        } else {
            common.info("이미 회원이신 경우, 아래의 개인정보 수정 이벤트에 참여해 주세요");
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
        }); // false로 하는 이유는 setstate 이후가 되어야 false가 true로 바뀌기 때문
        if(this.state.updateAgreeCheck == false){
            // common.info("참여해 주셔서 감사합니다.");
        }
    };

    handleClose = async(e) => {
        e.preventDefault();
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();

        // 초기 설정으로 변경
        this.setState({
            onSelValue: '',
            popOn: false,
            agreeCheck: 0, // 개인정보 수집 이용 동의 여부 ( 0 : 거부 / 1 : 승인 )
            updateAgreeCheck : 0, // 개인정보 수정 시 수집 동의 여부
            themeChannelCheck : "", //  선호하는 플래너
            step1 : '',  // 해당 이벤트
            step1Length : 0,
            etcCheck : false  // 기타 저장 : false : 미저장 / true : 저장
        });

    };


    // 이벤트 신청 검사
    eventApply = async () => {

        const { logged, history, BaseActions, SaemteoActions , PopupActions, event, eventId, loginInfo} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 로그인시
            if (this.state.onSelValue.trim().length === 0) {
                common.info("신학기 수업 준비를 위해 선생님께 가장 필요한 것을 선택해 주세요.");
                return false;
            }

            if (this.state.onSelValue === '기타' && this.state.step1.trim().length === 0) {
                common.info("기타 의견을 입력해주세요.");
                return false;
            }

            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            if(this.state.themeChannelCheck == '기타' && (this.state.etcCheck == false || this.state.step1 == "")){
                common.info("기타 의견을 입력해주세요.");
                return;
            }
            if(this.state.agreeCheck == 0){
                common.info("개인정보 수집 및 이용에 동의해 주세요.");
                return;
            }

            try {
                const memberInfoResponse = await SaemteoActions.getMemberInfo();
                const regDate = memberInfoResponse.data.regDate;
                if (regDate < '2021-02-17') {
                    common.info("신규 회원만 참여 가능합니다. 이미 회원이신 경우, 아래의 개인정보 수정 이벤트에 참여해 주세요.");
                    return;
                }
                if (regDate > '2021-03-31') {
                    common.info("이벤트 기간이 지났습니다. 다른 이벤트에 참여해 주세요.");
                    return;
                }

                try {
                    event.eventId = eventId;
                    event.memberId = loginInfo.memberId;
                    event.eventAnswerDesc = '';
                    event.eventAnswerDesc2 = this.state.onSelValue + (this.state.step1 ? '^||^'+this.state.step1 : '');

                    let response = await SaemteoActions.insertEventApply({...event});

                    if(response.data.code === '1'){
                        common.error("이미 참여하셨습니다.");
                    }else if(response.data.code === '0'){
                        PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
                    }else{
                        common.error("신청이 정상적으로 처리되지 못하였습니다.");
                    }

                } catch (e) {
                    console.log(e);
                    common.info(e.message);
                    history.push('/saemteo/event/view/'+eventId);
                } finally {
                    setTimeout(()=>{
                        BaseActions.closeLoading();
                    }, 1000);//의도적 지연.
                }


            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
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
            e.target.value = e.target.value.substr(0, 50);
        } else{
            this.setState({
                step1: e.target.value,
                step1Length: e.target.value.length,
            });
        }
    };

    // 기타 의견 저장 ( 사실 영향 없음 )
    setEtcCheck = (e) => {
        if(this.state.step1.trim().length === 0){
            this.setState({
                step1: ''
            });
            common.info("기타 의견을 입력해주세요.");
        } else {
            this.setState({
                etcCheck: !this.state.etcCheck
            });
            common.info("기타 의견이 저장되었습니다. 참여하기 버튼을 눌러주세요.");
        }
    };

    render() {
        const { data, popOn } = this.state
        return (
            <section className="event210217">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210217/img01.jpg" alt="비바샘 선생님을 위한 2021 신학기 응원 선물" /></h1>
                    <span className="blind">신청 기간: 2021.02.17 ~ 03.31</span>
                </div>

                <div className="evtCont02">
                    <div className="evtInfo">
                        <h2 className="blind">이벤트 1. 신규 가입 선생님, 100% 선물!</h2>
                        <p className="blind">신규 가입하신 후 아래 설문에 참여해주세요! 참여하신 모든 선생님께 선물(매일 카페라떼 마일드)을 드립니다.</p>
                        <div className="btnWrap">
                            <button type="button" className="btnJoin" onClick={ this.checkJoinChange }><span className="blind">회원 가입하기</span></button>
                        </div>
                        <ul className="blind">
                            <li>※ 이벤트 기간 내 <strong>신규 회원만 참여 가능</strong>합니다.</li>
                            <li>※ 탈퇴 후 재가입하여 응모하신 경우, 당첨에서 제외됩니다.</li>
                            <li>※ 선물은 매주 화요일 선생님 휴대전화 번호로 발송됩니다.</li>
                        </ul>
                    </div>
                    <div className="evtCont">
                        <strong><span className="blind">Q. 신학기 수업 준비를 위해 선생님께 가징 필요한 것은 무엇인가요?</span></strong>
                        <ul className="evtRdoWrap">
                            {
                                data.map((item, idx) => {
                                    return (
                                        <li key={`evtRdo${idx}`}>
                                            <span className="rdo">
                                                <input type="radio" name="rdo" id={`rdo0${idx}`} value={ item.valTxt } onChange={ this.onSelRdo } />
                                                <label htmlFor={`rdo0${idx}`}><span className="blind">{ item.valTxt }</span></label>
                                            </span>
                                            {
                                                (idx !== 5) ? <a target="_blank" href={ item.url } className="btnLink"><span className="blind">{ item.urlTxt }</span></a> :
                                                <div className="popWrap" style={{ 'display': (popOn === true) ? 'block' : 'none' }}>
                                                    <div className="textareaWrap">
                                                        <textarea
                                                            name="applyContent1"
                                                            id="applyContent1"
                                                            cols="1"
                                                            rows="10"
                                                            maxLength="50"
                                                            value={ this.state.step1 }
                                                            onChange={ this.setApplyContent }
                                                            placeholder="기타 의견을 입력해주세요.&#13;&#10;(50자 이내 입력)"
                                                            className="textarea"></textarea>
                                                    </div>
                                                    <div className="btnWrap">
                                                        <button type="button" className="btnPopConfirm" onClick={ this.setEtcCheck }><span className="blind">확인</span></button>
                                                    </div>
                                                    <button type="button" className="btnPopClose" onClick={ this.onPopClose }><span className="blind">팝업 닫기</span></button>
                                                </div>
                                            }
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <div className="evtAgreeWrap">
                            <div className="evtAgree">
                                <strong>개인정보 수집 및 이용동의</strong>
                                <ul>
                                    <li>이용 목적 : 경품 배송 및 고객 문의 응대</li>
                                    <li>수집하는 개인정보 : 성명, 휴대전화번호</li>
                                    <li>개인정보 보유 및 이용기간 : 2021년 4월 30일까지 (이용목적 달성 시 즉시 파기)</li>
                                </ul>
                                <p>선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                            </div>
                            <span className="chk">
                                <input type="checkbox" name="agree01" id="agree01" className="checkbox" checked={ this.state.agreeCheck == 1 } onChange={ this.agreeCheckChange } />
                                <label htmlFor="agree01">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                            </span>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">참여하기</span></button>
                        </div>
                    </div>
                </div>

                <div className="evtCont03">
                    <div className="evtInfo">
                        <h2 className="blind">이벤트 2. 개인정보 업데이트 선생님, 300명 선물!</h2>
                        <p className="blind">이벤트 기간 동안 개인 정보를 최신으로 업데이트 해주세요! 총 300분을 선정하여 선물을 드립니다.</p>
                        <ul className="blind">
                            <li>※ 당첨자 발표 : 4월 2일 / 비바샘 공지사항</li>
                            <li>※ 이벤트 기간 중 신규 가입하신 선생님은 제외됩니다. </li>
                            <li>※ 이벤트 기간 중 개인 정보를 2회 이상 업데이트하여도 1회만 참여됩니다.</li>
                        </ul>
                    </div>
                    <div className="evtCont">
                        <div className="evtAgreeWrap">
                            <div className="evtAgree">
                                <strong>개인정보 수집 및 이용동의</strong>
                                <ul>
                                    <li>이용 목적 : 경품 배송 및 고객 문의 응대</li>
                                    <li>수집하는 개인정보 : 성명, 휴대전화번호</li>
                                    <li>개인정보 보유 및 이용기간 : 2021년 4월 30일까지 (이용목적 달성 시 즉시 파기)</li>
                                </ul>
                                <p>선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                            </div>
                            <span className="chk">
                                <input type="checkbox" name="agree02" id="agree02" className="checkbox" checked={ this.state.updateAgreeCheck == 1 } onChange={ this.updateAgreeCheckChange } />
                                <label htmlFor="agree02">본인은 개인정보 수집 및 이용에 동의합니다.</label>
                            </span>
                        </div>
                        <div className="btnWrap">
                            <button type="button" onClick={ this.reApplyClick } className="btnModify"><span className="blind">회원정보 수정</span></button>
                        </div>
                    </div>
                </div>

                <div className="evtCont04">
                    <h2><img src="/images/events/2021/event210217/img04.jpg" alt="신청 시 유의사항" /></h2>
                    <ul className="blind">
                        <li>- 1인 1회 신청 가능합니다.</li>
                        <li>- 교사미인증 및 필수정보 미입력, 본인 미인증 회원인 경우 이벤트 1의 100% 경품 지급에서 제외됩니다.</li>
                        <li>- 등록된 정보 중 학교정보가 불명확한 경우 경품 대상에서 제외됩니다.</li>
                        <li>- 정확하지 않은 휴대전화 번호로 반송되거나 유효 기간 동안 상품권을 사용하지 않은 경우, 재발송되지 않습니다.</li>
                        <li>- 선물 발송을 위해 서비스 업체에 휴대전화 번호가 제공됩니다. (㈜다우기술-사업자번호 : 220-81-02810)</li>
                    </ul>
                </div>
            </section>
        );
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
