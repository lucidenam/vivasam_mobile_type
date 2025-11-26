import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import FindAddress from 'containers/login/FindAddress';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';

class EventApply extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
    }

    state = {
        initialSchName:'',
        initialSchZipCd:'',
        initialSchAddr:'',
        eventInfo:'',
        phoneCheckMessage: '',
        phoneCheckClassName: '',
        telephoneCheck: false,


        /* 배열로 만들지 않는 이유는 사용하기 까다롭기 때문*/
        // 해당 이벤트 사용
        // 이벤트 시간 참석 여부
        eventAttend1 : '',
        eventAttend2 : '',
        eventAttendCheck1: false,
        eventAttendCheck2: false,

        // 해당 이벤트 선호 교과
        eventSubject1 : '',
        eventSubject2 : '',
        eventSubject3 : '',
        eventSubjectCheck1 : false,
        eventSubjectCheck2 : false,
        eventSubjectCheck3 : false,

        // 유의사항 확인
        eventNoticeCheck : false,

        // 근속 년수
        eventSenerity : ''
    };

    componentDidMount(){
        const {eventId , history } = this.props;
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventId == null) || (typeof eventId == "undefined")){
            common.error("응답 문항이 제대로 작성되지 않으셨습니다.");
            history.push('/saemteo/event/view/267');
        }else{
            this.getEventInfo(eventId);
        }
    }

    getEventInfo = async(eventId) => {
        const { history, event, SaemteoActions } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0"){
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId, name, email, schName, schZipCd, schAddr} = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.agree = false;
            event.schName = schName;
            event.inputType = '개인정보 불러오기';
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.userInfo = 'Y';
            event.cellphone = '';
            SaemteoActions.pushValues({type:"event", object:event});
            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr
            });

        } else if(response.data.code && response.data.code === "3"){
            common.info("이미 신청하셨습니다.");
            history.replace(history.location.pathname.replace('apply','view'));
        } else {
            history.push('/saemteo/index');
        }
    };

    handleChange = (e) => {
        const { event, SaemteoActions } = this.props;
        if(e.target.name === 'agree'){
            event[e.target.name] = e.target.checked;
        }else{
            event[e.target.name] = e.target.value;
        }
        SaemteoActions.pushValues({type:"event", object:event});
    };

    handleUserInfo = (e) => {
        const { event, SaemteoActions } = this.props;
        const { initialSchName, initialSchZipCd, initialSchAddr } = this.state;
        if(e.target.value === 'Y'){
            event.inputType = '개인정보 불러오기';
            event.schName = initialSchName;
            event.schZipCd = initialSchZipCd;
            event.schAddr = initialSchAddr;
        }else{
            event.inputType = '직접입력';
            event.schName = '';
            event.schZipCd = '';
            event.schAddr = '';
        }
        SaemteoActions.pushValues({type:"event", object:event});

        this.handleChange(e);
    };


    //핸드폰번호 체크
    phonecheck = (e) => {
        e.target.value = common.autoHypenPhone(e.target.value);
        let tel = e.target.value;
        let text = '';
        let checkFlag = false;
        let clazz = 'point_red';
        if(tel === ''){
            text = "";
        } else if(!this.checkPhoneNum(tel)){
            text = "휴대폰 번호가 유효하지 않습니다.";
        } else{
            clazz = 'point_color_blue';
            text = "등록가능한 휴대폰 번호입니다.";
            checkFlag = true;
        }
        this.setState({
            phoneCheckClassName: clazz,
            phoneCheckMessage: text,
            telephoneCheck: checkFlag
        });
        this.handleChange(e);
    };
    checkPhoneNum = (value) => {
        if(value === '' || value.length === 0){
            return false;
        }else if(value.indexOf("01") !== 0){
            return false;
        }else if(value.length < 12 || value.length > 13){
            return false;
        }
        return true;
    };

    //우편번호 검색 팝업
    openPopupAddress = () => {
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:"우편번호 검색", componet:<FindAddress handleSetAddress={this.handleSetAddress}/>});
    };

    //도로명주소 입력 후 callback
    handleSetAddress = (zipNo, roadAddr) => {
        const { event, PopupActions, SaemteoActions } = this.props;
        event.inputType = '직접입력';
        event.userInfo = 'N';
        event.schZipCd = zipNo;
        event.schAddr = roadAddr;
        SaemteoActions.pushValues({type:"event", object:event});
        PopupActions.closePopup();
    };

    //값 입력 확인
    validateInfo = () => {
        const { event , myClassInfo} = this.props;
        const { telephoneCheck } = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        let obj = { result : false , message : ''};
        if(!event.userName){
            obj.message = '성명을 입력해주세요.';
        }else if(!reg_name.test(event.userName)) {
            obj.message = '올바른 성명 형식이 아닙니다.';
        }else if(!event.schName){
            obj.message = '학교명을 입력해주세요.';
        }else if(event.inputType == '개인정보 불러오기' && myClassInfo.schoolLvlCd != 'ES'){
            obj.message = '초등학교만 신청 가능합니다.';
        }else if(event.telephone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!telephoneCheck) {
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(this.state.eventSenerity == ''){
            obj.message = '재직년수를 입력해주세요.';
        }else if(this.state.eventAttendCheck1 == false && this.state.eventAttendCheck2 == false){
            obj.message = '참석 가능 시간대를 선택해 주세요.';
        }else if(this.state.eventSubjectCheck1 == false && this.state.eventSubjectCheck2 == false && this.state.eventSubjectCheck3 == false){
            obj.message = '선호 교과를 선택해 주세요.';
        }else if(this.state.eventNoticeCheck == false){
            obj.message = '이벤트 참여를 위해 유의사항에 동의해주세요.';
        }else if(!event.agree){
            obj.message = '이벤트 참여를 위해 개인정보 수집에 동의해주세요.';
        }else {
            obj.result = true;
        }
        return obj;
    };

    applyButtonClickSafe = (e) => {
        this.applyButtonClick(e.target);
    };

    applyButtonClick = (target) => {
        target.disabled = true;
        const { event, SaemteoActions } = this.props;
        let obj = this.validateInfo();
        if(!obj.result){
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        try {
            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + '/' +event.addressDetail + '/근속년수 : ' + this.state.eventSenerity + '/참석 가능 시간대 : ';

            // 참석가능 시간대 추가
            if(this.state.eventAttendCheck1 == false){
                event.eventAnswerDesc += this.state.eventAttend2;
            }else{
                if(this.state.eventAttendCheck2 == false){
                    event.eventAnswerDesc += this.state.eventAttend1;
                }else{
                    event.eventAnswerDesc += this.state.eventAttend1 + "," + this.state.eventAttend2;
                }
            }
            // 선호 과목 추가
            if(this.state.eventSubjectCheck1 == false){
                if(this.state.eventSubjectCheck2 == false){
                    event.eventAnswerDesc += "/선호 교과 : " + this.state.eventSubject3;
                }else{
                    if(this.state.eventSubjectCheck3 == false){
                        event.eventAnswerDesc += "/선호 교과 : " + this.state.eventSubject2;
                    }else{
                        event.eventAnswerDesc += "/선호 교과 : " + this.state.eventSubject2 + "," + this.state.eventSubject3;
                    }
                }
            }else{
                event.eventAnswerDesc += "/선호 교과 : " + this.state.eventSubject1;
                if(this.state.eventSubjectCheck2 == false){
                    if(this.state.eventSubjectCheck3 == false){
                    }else{
                        event.eventAnswerDesc += "," + this.state.eventSubject3;
                    }
                }else{
                    if(this.state.eventSubjectCheck3 == false){
                        event.eventAnswerDesc += "," + this.state.eventSubject2;
                    }else{
                        event.eventAnswerDesc += "," + this.state.eventSubject2 + "," + this.state.eventSubject3;
                    }
                }
            }

            SaemteoActions.pushValues({type:"event", object:event});
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    };

    handleClose = async() => {
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/'+eventId);
    };
    //신청
    //신청이 잘못된 경우 다시 못들어오게 해야되므로 이전 페이지로 Return
    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions } = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
                history.goBack()
            }else if(response.data.code === '0'){
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
            }else{
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
                history.goBack()
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    /** 이번 이벤트 사용 함수 **/
    // 근속 년수 입력
    setEventSenerity = (e) => {
        this.setState({
            eventSenerity: e.target.value
        });

    };

    // 이벤트 참여 시간
    // 1차, 2차
    checkEventAttend = (e) =>{
        if(e.target.value == 1){ // 이벤트 참여 시간 1차
            if(this.state.eventAttendCheck1 == true){
                this.setState({
                    eventAttend1 : "",
                    eventAttendCheck1 : false
                })
            }else{
                this.setState({
                    eventAttend1 : "1차(9:50~13:00)",
                    eventAttendCheck1 : true
                })
            }
        }else if(e.target.value == 2){ // 이벤트 참여 시간 2차
            if(this.state.eventAttendCheck2 == true){
                this.setState({
                    eventAttend2 : "",
                    eventAttendCheck2 : false
                })
            }else{
                this.setState({
                    eventAttend2 : "2차(14:50~18:00)",
                    eventAttendCheck2 : true
                })
            }
        }

    };

    // 이벤트 참여 선호 교과
    // 수학, 사회, 과학
    checkEventSubject = (e) => {
        if(e.target.value == 1){ // 수학
            if(this.state.eventSubjectCheck1 == true){
                this.setState({
                    eventSubject1 : "",
                    eventSubjectCheck1 : false
                })
            }else{
                this.setState({
                    eventSubject1 : "수학",
                    eventSubjectCheck1 : true
                })
            }
        }else if(e.target.value == 2){ // 사회
            if(this.state.eventSubjectCheck2 == true){
                this.setState({
                    eventSubject2 : "",
                    eventSubjectCheck2 : false
                })
            }else{
                this.setState({
                    eventSubject2 : "사회",
                    eventSubjectCheck2 : true
                })
            }
        }else if(e.target.value == 3){ // 과학
            if(this.state.eventSubjectCheck3 == true){
                this.setState({
                    eventSubject3 : "",
                    eventSubjectCheck3 : false
                })
            }else{
                this.setState({
                    eventSubject3 : "과학",
                    eventSubjectCheck3 : true
                })
            }
        }

    };

    // 유의사항 확인
    checkEventNoticeCheck = () => {
        if(this.state.eventNoticeCheck == false){
            this.setState({
                eventNoticeCheck : true
            })
        }else{
            this.setState({
                eventNoticeCheck : false
            })
        }
    };


    /** 이번 이벤트 사용 함수 **/

    render() {
        const {eventInfo} = this.state;
        if (eventInfo === '') return <RenderLoading/>;
        const {event} = this.props;
        const { phoneCheckMessage, phoneCheckClassName } = this.state;
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    비상교육 초등 검정 교과서 검토진 지원
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell">
                        <h3>비상교육 초등 검정 교과서 검토진 지원</h3>
                        <p>아래 내용을 정확히 입력해 주셔야 지원이 가능합니다.</p>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <div className="vivasamter_applyDtl">
                        <h2 className="info_tit">
                            <label htmlFor="ipt_name">성명</label>
                        </h2>
                        <div className="input_wrap mb25">
                            <input
                                type="text"
                                placeholder="성명을 입력하세요"
                                id="ipt_name"
                                name="userName"
                                onChange={this.handleChange}
                                value={event.userName}
                                className="input_sm" />
                        </div>
                        <h2 className="info_tit">
                            <label htmlFor="userInfoY">재직학교</label>
                        </h2>
                        <div className="input_wrap mb15">
                            <ul className="join_ipt_chk">
                                <li className="join_chk_list" style={{width:'45%'}}>
                                    <input
                                        id="userInfoY"
                                        type="radio"
                                        className="checkbox_circle"
                                        name="userInfo"
                                        value="Y"
                                        checked={event.userInfo === 'Y'}
                                        onChange={this.handleUserInfo}
                                    />
                                    <label htmlFor="userInfoY">개인정보 불러오기</label>
                                </li>
                                <li className="join_chk_list">
                                    <input
                                        id="userInfoN"
                                        type="radio"
                                        className="checkbox_circle"
                                        name="userInfo"
                                        value="N"
                                        checked={event.userInfo === 'N'}
                                        onChange={this.handleUserInfo}
                                    />
                                    <label htmlFor="userInfoN">직접입력</label>
                                </li>
                            </ul>
                        </div>
                        <div className="input_wrap mb25">
                            <input
                                type="text"
                                placeholder="학교명을 입력하세요"
                                id="ipt_name"
                                name="schName"
                                onChange={this.handleChange}
                                value={event.schName}
                                className="input_sm" />
                        </div>
                        
                        <h2 className="info_tit">
                            <label htmlFor="ipt_phone">휴대전화번호</label>
                        </h2>
                        <div className="input_wrap mb25">
                            <input
                                type="tel"
                                placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
                                id="ipt_phone"
                                name="cellphone"
                                onChange={this.phonecheck}
                                maxLength="13"
                                className="input_sm" />
                            <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                        </div>

                        <h2 className="info_tit">
                            <label htmlFor="ipt_year">재직년수</label>
                        </h2>
                        <div className="input_wrap mb25">
                            <input
                                type="text"
                                placeholder="Ex)1년"
                                id="ipt_year"
                                name="schYear"
                                maxLength="10"
                                value={this.state.eventSenerity}
                                onChange={this.setEventSenerity}
                                className="input_sm" />
                        </div>

                        <h2 className="info_tit pb0">
                            참석 가능 시간대(복수 응답 가능)
                        </h2>
                        <p className="mb10 c_gray">1, 2차 모두 표기하실 경우, 비상교육 담당자가 지원자 비율 등을 고려하여 한 차시를 확정합니다.</p>
                        <div className="checkbox_flex_wrap mb25">
                            <ul>
                                <li>
                                    <input
                                        type="checkbox"
                                        name="joinTime"
                                        onChange={this.checkEventAttend}
                                        checked={this.state.eventAttendCheck1}
                                        className="checkbox_box"
                                        id="joinTime01"
                                        value="1"
                                    />
                                    <label htmlFor="joinTime01">1차(9:50~13:00)</label>
                                </li>
                                <li>
                                    <input
                                        type="checkbox"
                                        name="joinTime"
                                        onChange={this.checkEventAttend}
                                        checked={this.state.eventAttendCheck2}
                                        className="checkbox_box"
                                        id="joinTime02"
                                        value="2"
                                    />
                                    <label htmlFor="joinTime02">2차(14:50~18:00)</label>
                                </li>
                            </ul>
                        </div>

                        <h2 className="info_tit pb0">
                            선호 교과(복수 응답 가능)
                        </h2>
                        <p className="mb10 c_gray">여러 과목을 표기하실 경우, 비상교육 담당자가 지원자 비율 등을 고려하여 한 과목을 확정합니다</p>
                        <div className="checkbox_flex_wrap mb25">
                            <ul>
                                <li>
                                    <input
                                        type="checkbox"
                                        name="subject"
                                        onChange={this.checkEventSubject}
                                        checked={this.state.eventSubjectCheck1}
                                        className="checkbox_box"
                                        id="subject01"
                                        value="1"
                                    />
                                    <label htmlFor="subject01">수학</label>
                                </li>
                                <li>
                                    <input
                                        type="checkbox"
                                        name="subject"
                                        onChange={this.checkEventSubject}
                                        checked={this.state.eventSubjectCheck2}
                                        className="checkbox_box"
                                        id="subject02"
                                        value="2"
                                    />
                                    <label htmlFor="subject02">사회</label>
                                </li>
                                <li>
                                    <input
                                        type="checkbox"
                                        name="subject"
                                        onChange={this.checkEventSubject}
                                        checked={this.state.eventSubjectCheck3}
                                        className="checkbox_box"
                                        id="subject03"
                                        value="3"
                                    />
                                    <label htmlFor="subject03">과학</label>
                                </li>
                            </ul>
                        </div>

                        <div className="acco_notice_list">
                        </div>

                        <div className="acco_notice_list">
                            <h2 className="info_tit pb0 acco_notice_link active">
                                유의 사항
                            </h2>
                            <div className="acco_notice_cont mt10">
                                <ul className="policy">
                                    <li>- 타교과서의 원고 집필에 참여하고 계신 선생님은 지원하실 수 없습니다.</li>
                                    <li>- 대리 참석은 불가능하며, 선정되지 않은 선생님은 동행하실 수 없습니다.</li>
                                    <li>- 검토회와 관련된 세부 사항은 최종 검토진으로 선정되신 선생님께 개별 안내 드립니다. (2020년 1월 3일부터 순차 연락 예정)</li>
                                    <li>- 본 검토회에 참여하시는 선생님께 소정의 검토료를 지급합니다.</li>
                                </ul>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.checkEventNoticeCheck}
                                    checked={this.state.eventNoticeCheck}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree01" />
                                <label
                                    htmlFor="join_agree01"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 유의 사항을 모두 확인하였습니다.
                                    </strong>
                                </label>
                            </div>

                            <h2 className="info_tit pb0 mt25 acco_notice_link active">
                                개인정보 수집 및 이용 동의
                            </h2>
                            <div className="acco_notice_cont mt10">
                                <ul className="policy">
                                    <li>- 이용목적 : 비상교육 초등 검정 교과서 검토회 진행 및 안내</li>
                                    <li>- 수집하는 개인정보 : 성명, 재직학교, 연락처, 재직년수</li>
                                    <li>- 개인정보 보유 및 이용기간 : 2020년 1월 18일까지 (이용목적 달성 시 즉시 파기)</li>
                                    <li>- 개인정보의 수집 및 이용에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 검토진 지원이 불가합니다.</li>
                                </ul>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.handleChange}
                                    checked={event.agree}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree02" />
                                <label
                                    htmlFor="join_agree02"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 개인정보 수집 및 이용 동의 내역을 확인하였으며, 이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on mt35">지원하기</button>
                    </div>
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
        eventAnswer: state.saemteo.get('eventAnswer').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
