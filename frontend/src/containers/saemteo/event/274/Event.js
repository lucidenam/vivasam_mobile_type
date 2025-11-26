import React, {Component, Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as popupActions from 'store/modules/popup';
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";
class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            agreeCheck01 : false, // 개인정보 체크
            agreeCheck02 : false, // 개인정보 체크
            answer : '', // answer 닫변
            answerLength : 0,   // step2 길이// 크
            selBookNm : '' // 선택한 Full수록 체험북
        };
    }

    onBookChange = (e) => {
        this.setState({
            selBookNm: e.currentTarget.value
        });
    };

    // 내용 입력
    setApplyContent = (e) => {
        if(e.target.value.length > 50){
            common.info("50자 이내로 입력해 주세요.");
        }else{
            this.setState({
                answerLength: e.target.value.length,
                answer: e.target.value
            });
        }
    };

    setInfoCheck01 = (e) => {
        this.setState({
            agreeCheck01 : !this.state.agreeCheck01
        });
    };

    setInfoCheck02 = (e) => {
        this.setState({
            agreeCheck02 :!this.state.agreeCheck02
        });
    };

    goMyinfo = () => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            history.push("/myinfo");
        }
    }



    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            if(this.state.selBookNm == ""){
                common.info("Full수록 체험북을 선택해주세요.");
                return;
            }
            if(this.state.answer == "" || this.state.answerLength < 10){
                common.info("최소 10자 이상 입력이 되어야 합니다.");
                return;
            }
            if(this.state.agreeCheck01 == false || this.state.agreeCheck02 == false){
                common.info("개인정보 수집 및 이용에 동의해 주세요.");
                return;
            }else{
                this.getEventInfo(eventId);
            }
        }
    };

    getEventInfo = async(eventId) => {
        const { history, event, SaemteoActions } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0"){
            event.eventId = eventId;
            let {memberId, name, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
            event.inputType = '개인정보 불러오기';
            event.memberId = memberId;
            event.userName = name;
            event.agree = false;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.userInfo = 'Y';
            event.addressDetail = '';
            event.receive = '교무실';
            event.cellphone = cellphone;
            try {
                event.eventAnswerDesc = event.userName + '/' + event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + '/' +event.addressDetail + '/수령처 : ' + event.receive ;
                SaemteoActions.pushValues({type:"event", object:event});
                this.insertApplyForm();
            } catch (e) {
                console.log(e);
            }
        } else if(response.data.code && response.data.code === "3"){
            common.info("이미 신청하셨습니다.");
            history.replace(history.location.pathname.replace('apply','view'));
        } else {
            history.push('/saemteo/index');
        }
    };

    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions , eventAnswer } = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
                // Web과의 싱크를 맞춰주기 위해서 2번째 응답도 똑같이 맞춰준다.
                event.eventAnswerDesc = this.state.selBookNm + '|STEP|' +this.state.answer;
                event.eventAnswerSeq = 2;
                response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
            }else{
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

    handleClose = async() => {
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/'+eventId);
    };


    render () {
        return (
            <section className="event191205">
                <h1><img src="/images/events/2019/event191205/img.jpg" alt="비상교육 수능 대비서 Full수록 신청하기" /></h1>
                <img src="/images/events/2019/event191205/img2.jpg" alt="" />
                <div className="blind">
                    <p>수능 출제 유형을 한눈에 파악하고,체계적인 학습법을 제시하는 비상교육의 수능 필수 기출문제집 Full수록을 만나보세요. 원하시는 과목을 선택하시면 과목별 70명을 선정하여 신청하신 책을 보내드리며, 설문 우수자 31명을 선정하여 풍성한 선물을 드립니다.</p>
                    <dl>
                        <dt>참여 기간</dt>
                        <dd>2019. 12. 05(목) ~ 12. 18(수)</dd>
                        <dt>당첨 발표</dt>
                        <dd>2019. 12. 19(목)</dd>
                        <dt>당첨 선물</dt>
                        <dd>
                            Full수록 학생용+교사용(과목별 70명) + 아웃백 투움바 파스타 세트 (설문 우수자 1명) / 스타벅스 아메리카노 Tall (설문 우수자 30명)
                        </dd>
                        <dt>이벤트 진행 단계</dt>
                        <dd>
                            <ol>
                                <li>당첨 문자 확인(~12/19)</li>
                                <li>신청한 책 수령(~12/23)</li>
                                <li>2주간 교재 체험(12/23~1/3)</li>
                                <li>모바일 설문조사(1/3~1/17)</li>
                                <li>설문 우수자 경품 수령(1/21)</li>
                            </ol>
                            <ul>
                                <li>* 1월 3일(금) 설문조사 안내 SMS를 발송합니다.</li>
                                <li>* 1월 20일(월) 비바샘 공지사항을 통해 설문 우수자를 발표합니다.</li>
                            </ul>
                        </dd>
                    </dl>
                    <p>비상교육 Full수록 소개</p>
                    <ul>
                        <li>수능 필수 기출문제 완벽 탑재!</li>
                        <li>30일 완성의 체계적인 학습 플랜 제시</li>
                        <li>수능 기출 유형 한눈에 파악할 수 있는 수능 대비서</li>
                        <li>직관적인 해설과 정리로 실전 감각 UP!</li>
                    </ul>
                </div>

                <div className="cont_wrap">
                    <div className="cont">
                        <div className="tit">Full수록 체험북 미리보기 <span>* 표지를 클릭하면 E-book을 보실 수 있습니다.</span></div>
                        <ul className="book_preview">
                            <li><a href="https://dn.vivasam.com/ebook/fullebook/korean/index.html" target="_blank"><img src="/images/events/2019/event191205/book.jpg" alt="Full수록 문학" /><span>&lt;Full수록&gt; 문학</span></a></li>
                            <li><a href="https://dn.vivasam.com/ebook/fullebook/english/index.html" target="_blank"><img src="/images/events/2019/event191205/book2.jpg" alt="Full수록 영어 독해" /><span>&lt;Full수록&gt; 영어 독해</span></a></li>
                            <li><a href="https://dn.vivasam.com/ebook/fullebook/social/index.html" target="_blank"><img src="/images/events/2019/event191205/book3.jpg" alt="Full수록 사회·문화" /><span>&lt;Full수록&gt; 사회·문화</span></a></li>
                            <li><a href="https://dn.vivasam.com/ebook/fullebook/science/index.html" target="_blank"><img src="/images/events/2019/event191205/book4.jpg" alt="Full수록 지구과학" /><span>&lt;Full수록&gt; 지구과학</span></a></li>
                        </ul>
                    </div>

                    <div className="cont2">
                        <div className="tit_sel_book">
                            <img src="/images/events/2019/event191205/tit_sel_book.jpg" alt="Full수록 선택하기" />
                        </div>
                        <dl className="sel_book">
                            <dt>국어 교과</dt>
                            <dd>
                                <ul>
                                    <li><input type="radio" id="lb_kor1" name="lb_book" value = "국어 독서 기본 (고1, 2)"  onChange={this.onBookChange} /><label for="lb_kor1">국어 독서 기본 (고1, 2)</label></li>
                                    <li><input type="radio" id="lb_kor2" name="lb_book" value = "국어 독서"  onChange={this.onBookChange} /><label for="lb_kor2">국어 독서</label></li>
                                    <li><input type="radio" id="lb_kor3" name="lb_book" value = "국어 문학 기본 (고1, 2)" onChange={this.onBookChange} /><label for="lb_kor3">국어 문학 기본 (고1, 2)</label></li>
                                    <li><input type="radio" id="lb_kor4" name="lb_book" value = "국어 문학"  onChange={this.onBookChange} /><label for="lb_kor4">국어 문학</label></li>
                                </ul>
                            </dd>
                            <dt>영어 교과</dt>
                            <dd>
                                <ul>
                                    <li><input type="radio" id="lb_eng1" name="lb_book" value="영어 독해 기본 (고1, 2)" onChange={this.onBookChange}/><label for="lb_eng1">영어 독해 기본 (고1, 2)</label></li>
                                    <li><input type="radio" id="lb_eng2" name="lb_book" value="영어 독해" onChange={this.onBookChange} /><label for="lb_eng2">영어 독해</label></li>
                                    <li><input type="radio" id="lb_eng3" name="lb_book" value="영어 어법·어휘" onChange={this.onBookChange} /><label for="lb_eng3">영어 어법 · 어휘</label></li>
                                </ul>
                            </dd>
                            <dt>사회 교과</dt>
                            <dd>
                                <ul>
                                    <li><input type="radio" id="lb_soc1" name="lb_book" value="한국 지리" onChange={this.onBookChange} /><label for="lb_soc1">한국 지리</label></li>
                                    <li><input type="radio" id="lb_soc2" name="lb_book" value="생활과 윤리" onChange={this.onBookChange} /><label for="lb_soc2">생활과 윤리</label></li>
                                    <li><input type="radio" id="lb_soc3" name="lb_book" value="사회·문화" onChange={this.onBookChange} /><label for="lb_soc3">사회 · 문화</label></li>
                                </ul>
                            </dd>
                            <dt>과학 교과</dt>
                            <dd>
                                <ul>
                                    <li><input type="radio" id="lb_sci1" name="lb_book" value="물리학Ⅰ" onChange={this.onBookChange} /><label for="lb_sci1">물리학Ⅰ</label></li>
                                    <li><input type="radio" id="lb_sci2" name="lb_book" value="화학Ⅰ"onChange={this.onBookChange} /><label for="lb_sci2">화학Ⅰ</label></li>
                                    <li><input type="radio" id="lb_sci3" name="lb_book" value="생명과학Ⅰ" onChange={this.onBookChange} /><label for="lb_sci3">생명과학Ⅰ</label></li>
                                    <li><input type="radio" id="lb_sci4" name="lb_book" value="지구과학Ⅰ" onChange={this.onBookChange} /><label for="lb_sci4">지구과학Ⅰ</label></li>
                                </ul>
                            </dd>
                        </dl>
                        <div className="tit">선택하신 이유를 적어주세요.</div>
                        <textarea
                            name="applyContent"
                            id="applyContent"
                            cols="1"
                            rows="8"
                            maxLength="50"
                            minLength="10"
                            value={this.state.answer}
                            onChange={this.setApplyContent}
                            placeholder="이 책을 선택하신 이유를 적어주세요. (50자 이내)"
                            className="textarea">
                        </textarea>

                        <dl className="agree_info">
                            <dt>개인정보 수집 및 이용 동의</dt>
                            <dd>
                                <ul>
                                    <li>• 이용목적 : 이벤트 참여 확인 및 경품 발송</li>
                                    <li>• 수집하는 개인정보 : 성명, 재직학교, 휴대전화번호</li>
                                    <li>• 개인정보 보유 및 이용기간 : 2020년 1월 31일까지 (이용목적 달성 시 즉시 파기)</li>
                                    <li>• 수집하는 개인정보의 취급위탁 : 기프티콘 발송을 위해 개인정보를 발송업체에 취급 위탁<br/>(주)모바일이앤엠애드-사업자번호: 215-87-19169, (주)한진 –사업자등록번호 : 201-81-02823</li>
                                </ul>
                            </dd>
                        </dl>
                        <p className="agree">
                            <input type="checkbox" id="infoCheck01" name="infoCheck01" value="" className="checkbox" onChange={this.setInfoCheck01} checked={this.state.agreeCheck01 === true} />
                            <label for="infoCheck01"><span>본인은 개인정보 수집 및 이용내역을 확인하였으며, 이에 동의합니다.</span></label>
                        </p>
                        <p className="agree">
                            <input type="checkbox" id="infoCheck02" name="infoCheck02" value="" className="checkbox"  onChange={this.setInfoCheck02} checked={this.state.agreeCheck02 === true}  />
                            <label for="infoCheck02"><span>비바샘에 등록되어있는 재직학교, 휴대폰 번호가 사용됩니다. 개인정보를 확인해주세요. <a onClick={this.goMyinfo} >[개인정보 확인]</a></span></label>
                        </p>

                    </div>

                    <div className="btn_wrap">
                        <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}>응모하기</button>
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
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
