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
        /* 해당 이벤트에 추가 */
        isSetMemberCount : '', // 참가 신청 인원
        step1 : '', // step1
        step2 : '', // step2
        step1Length : 0,  // step1 길이
        step2Length : 0,  // step2 길이
        /* 이메일 부분 추가 */
        eMailDomain : '', // Email Domain ( email ID )
        anotherEmailDomain : '', // Email Back Domain ( gmail.com / naver.com ... )
        isAnotherEmailDomain : '', // ( 0 : 직접입력 X / 1 : 직접 입력 )
        myGrade : '', // 담당학년
        mainSubject : '', // 담당과목
        career : '', // 교사경력
        visangTbYN : '', // 비상교과서 채택여부
        eventAgree : '', // 개인정보 동의여부
        subSubject : 'N', // 비교과
        TAB : '' // 학급 ( E : 초등 / M  : 중등 / H : 고등 )

    };

    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        // 응답 문항이 제대로 넘어오지 않거나, EventId를 실수로 Null로 날릴경우 이전 화면으로.
        if((eventId == null) ||  (typeof eventId == "undefined")){
            common.error("이벤트 처리 과정 중 오류가 발생하였습니다.");
            history.push('/saemteo/event/view/254');
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
            let {memberId, email, name, schName, schZipCd, schAddr, cellphone, mainSubject, myGrade } = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.agree = false;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.userInfo = 'Y';
            event.cellphone = cellphone;

            // 개인정보 불러올때 핸드폰 번호 검사
            this.phonecheckStart(event.cellphone);
            SaemteoActions.pushValues({type:"event", object:event});
            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr,
                // 이메일 부분 추가
                eMailDomain : email.split("@")[0],
                mainSubject : mainSubject ,
                myGrade : myGrade
            });

            // 개인정보에서 이메일 불러오기 추가
            // @를 통해 구분 ( 해당되는 도메인이 아닌경우 직접입력으로 넘김 )
            if ((email.split("@")[1] === "gmail.com") || (email.split("@")[1] === "daum.net") || (email.split("@")[1] === "hanmail.net")
                ||(email.split("@")[1] === "naver.com") || (email.split("@")[1] === "nate.com")) {
                this.setState({
                    isAnotherEmailDomain : 0,
                    anotherEmailDomain : email.split("@")[1]
                });
            }else{
                this.setState({
                    isAnotherEmailDomain : 1,
                    anotherEmailDomain : email.split("@")[1]
                });
            }

            // 개인정보에서 이메일 불러오기 끝
            const response2 = await api.eventMemberSchoolInfo({...event});
            this.setState({
                TAB : response2.data.TAB
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


    //개인정보 불러올때 핸드폰번호 체크
    phonecheckStart = (checkPhoneNumber) => {
        checkPhoneNumber = common.autoHypenPhone(checkPhoneNumber);
        let tel = checkPhoneNumber;
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

    // 내용 입력
    // 댓글 수정 시 길이 연동 및 이벤트 내용 수정
    setApplyContent1 = (e) => {
        if(e.target.value.length > 200){
            common.info("200자 이내로 입력해 주세요.");
        }else{
            this.setState({
                step1Length: e.target.value.length,
                step1: e.target.value
            });
        }
    };

    setApplyContent2 = (e) => {
        if(e.target.value.length > 500){
            common.info("500자 이내로 입력해 주세요.");
        }else{
            this.setState({
                step2Length: e.target.value.length,
                step2: e.target.value
            });
        }
    };

    // 이메일 체크
    // 앞쪽 아이디 입력

    setEmailDomain = (e) => {
        this.setState({
            eMailDomain : e.target.value
        });
    };

    // 직접 입력일 경우 입력창이 뜨도록 설정
    // 개인정보 불러오기로 인한 직접 입력할 경우에 값이 안들어오도록 설정
    setAnotherEmailDomain = (e) => {
        if(e.target.name === 'emailDomain') {
            if(e.target.value === 'otherDomain'){
                this.setState({
                    isAnotherEmailDomain : 1,
                    anotherEmailDomain : ''
                });
            }else{
                this.setState({
                    isAnotherEmailDomain : 0,
                    anotherEmailDomain : e.target.value
                })
            }
        }
    };
    // 직접 이메일 입력시 값 입력
    setHandsAnotherEmailDomain = (e) => {
        this.setState({
            anotherEmailDomain : e.target.value
        });
    };

    /* 이메일 체크 끝 */

    /* 담당학년 작업 */
    setMyGrade = (e) => {
        this.setState({
            myGrade : e.target.value
        });
    };

    /* 담당교과 작업 */
    setMainSubject = (e) => {
        this.setState({
            mainSubject : e.target.value
        });
    };

    /* 담당 교사 경력 작업 */
    setCareer = (e) => {
        this.setState({
           career : e.target.value
        });
    };

    /* 교과서 채택 작업 */
    setVisangTbYN = (e) => {
      this.setState({
          visangTbYN : e.target.value
      });
    };


    /* 개인정보 수집 동의 이유 */
    checkEventAgree = () =>{
        if(this.state.eventAgree == false){
            this.setState({
                eventAgree : true
            });
        }else{
            this.setState({
                eventAgree : false
            });
        }
    };


    //값 입력 확인
    validateInfo = () => {
        const { event } = this.props;
        const { telephoneCheck } = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        let obj = { result : false , message : ''};
        if(!event.userName){
            obj.message = '성명을 입력해주세요.';
        }else if(!reg_name.test(event.userName)) {
            obj.message = '올바른 성명 형식이 아닙니다.';
        }else if((this.state.eMailDomain === "") || (this.state.anotherEmailDomain === "")){
            obj.message = '이메일 주소를 입력해주세요.';
        }else if(!event.schName){
            obj.message = '학교명을 입력해주세요.';
        }else if(event.cellphone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(this.state.myGrade === ""){
            obj.message = "담당 학년을 선택해주세요.";
        }else if(this.state.mainSubject === ""){
            obj.message = "내 교과를 선택해주세요.";
        }else if(this.state.career === ""){
            obj.message = "교사 경력을 입력해주세요.";
        }else if(this.state.visangTbYN === ""){
            obj.message = "비상교과서 채택 여부를 선택해주세요.";
        }else if(this.state.mainSubject === ""){
            obj.message = "내 교과를 선택해주세요";
        }else if(this.state.step1 === ""){
            obj.message = "지원동기를 입력해주세요.";
        }else if(this.state.step2 === ""){
            obj.message = "개인 활동 내역을 입력해주세요.";
        }else if(this.state.eventAgree === false){
            obj.message = "개인정보 수집 및 이용에 동의해주세요.";
        }else{
            obj.result = true;
        }
        return obj;
    };

    applyButtonClickSafe = (e) => {
        this.applyButtonClick(e.target);
    };

    applyButtonClick = (target) => {
        target.disabled = true;
        const { event,history,SaemteoActions,eventAnswer } = this.props;
        let obj = this.validateInfo();
        if(!obj.result){
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        let receive = event.receive;
        if(event.receive === "교실"){
            receive = event.receiveGrade+'학년 ' + event.receiveClass+'반'
        }else if(event.receive === "기타"){
            receive = event.receiveEtc
        }

        try { // 응답 제출
            // 과목별 구분
            event.eventAnswerDesc  =  event.cellphone + "/" + event.schName + "/이메일 : " + this.state.eMailDomain  + '@' +  this.state.anotherEmailDomain + "/담당 학년 : " +  this.state.myGrade + "/내 교과 : ";
            if(this.state.mainSubject == "SC100"){
                event.eventAnswerDesc  += "국어";
            }else if(this.state.mainSubject == "SC101"){
                event.eventAnswerDesc  += "영어";
            }else if(this.state.mainSubject == "SC102"){
                event.eventAnswerDesc  += "수학";
            }else if(this.state.mainSubject == "SC103"){
                event.eventAnswerDesc  += "사회";
            }else if(this.state.mainSubject == "SC106"){
                event.eventAnswerDesc  += "역사";
            }else if(this.state.mainSubject == "SC107"){
                event.eventAnswerDesc  += "도덕";
            }else if(this.state.mainSubject == "SC104"){
                event.eventAnswerDesc  += "과학";
            }else if(this.state.mainSubject == "SC105"){
                event.eventAnswerDesc  += "한문";
            }else if(this.state.mainSubject == "SC110"){
                event.eventAnswerDesc  += "기술·가정";
            }else if(this.state.mainSubject == "SC114"){
                event.eventAnswerDesc  += "정보";
            }else if(this.state.mainSubject == "SC108"){
                event.eventAnswerDesc  += "음악";
            }else if(this.state.mainSubject == "SC109"){
                event.eventAnswerDesc  += "미술";
            }else if(this.state.mainSubject == "SC111"){
                event.eventAnswerDesc  += "체육";
            }else if(this.state.mainSubject == "SC112"){
                event.eventAnswerDesc  += "실과";
            }else if(this.state.mainSubject == "SC113"){
                event.eventAnswerDesc  += "진로와 직업";
            }else if(this.state.mainSubject == "SC199"){
                event.eventAnswerDesc  += "기타";
            }

            // 비교과 추가
            if(this.state.subSubject == 'Y'){
                event.eventAnswerDesc  += ",비교과";
            }
            event.eventAnswerDesc  +=  "/교사 경력  : " + this.state.career + "/교과서 채택 여부 : " + this.state.visangTbYN + " /지원 동기 : " + this.state.step1 + " /개인 활동 내역 : " + this.state.step2;
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

    // 비교과 설정
    setSubSubject  = (e) => {
        this.setState({
            subSubject : e.target.value
        });
    };

    //신청
    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions , eventAnswer, eventMonitoring } = this.props;
        try {
            const { event, PopupActions, SaemteoActions } = this.props;
                BaseActions.openLoading();
                // 이벤트 신청
                let response = await SaemteoActions.insertEventApply({...event});
                if(response.data.code === '1'){
                    common.error("이미 신청하셨습니다.");
                }else if(response.data.code === '0'){
                    // 모니터링단 처리
                    // 모니터링단 진행 횟수, 아이디, 교사경력, 지원동기, 개인활동
                    eventMonitoring.number = "07";
                    eventMonitoring.memberId = event.memberId;
                    eventMonitoring.teacherCareer = this.state.career;
                    eventMonitoring.applyReason = this.state.step1;
                    eventMonitoring.activityDesc = this.state.step2;
                    // 비교과 유무에 따른 결정
                    if(this.state.subSubject == 'Y'){
                        eventMonitoring.mSubjectCd = 'SC***';
                    }else{
                        eventMonitoring.mSubjectCd = this.state.mainSubject;
                    }
                    response = await SaemteoActions.insertMonitoringEvent({...eventMonitoring});
                    if(response.data.code === '1'){
                        common.error("이미 신청하셨습니다.");
                    }else if(response.data.code === '0') {
                        PopupActions.openPopup({title: "신청완료",
                            componet: <EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList}
                                                        handleClose={this.handleClose}/>
                        });
                    }else{
                        common.error("신청이 정상적으로 처리되지 못하였습니다.");
                    }
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

    render() {
        const {eventInfo} = this.state;
        if (eventInfo === '') return <RenderLoading/>;
        const {event} = this.props;
        const { phoneCheckMessage, phoneCheckClassName } = this.state;
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    이벤트 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell">
                        <h3>비바샘 모니터링단 7기 지원하기</h3>
                        <p>현장 맞춤형 수업 자료 개발을 위해 비바샘과 함께 소통해주실 150명의 열정적인 선생님을 기다립니다.</p>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <div className="vivasamter_applyDtl">
                        <h2 className="info_tit">
                            <label htmlFor="ipt_name">성명</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                type="text"
                                placeholder="성명을 입력하세요"
                                id="ipt_name"
                                name="userName"
                                onChange={this.handleChange}
                                value={event.userName}
                                className="input_sm" />
                        </div>
                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_email">이메일</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                type="text"
                                name="email"
                                ref="email"
                                onChange={this.setEmailDomain}
                                value={this.state.eMailDomain}
                                className="input_sm input_fix_wrap"
                                id="ipt_email" />
                            <span className="input_fix_txt">@</span>
                        </div>
                        <div className="selectbox select_sm mt5">
                            {/* 이메일 개인정보 불러오기를 할때에는 해당되는 selected 조건을 넣어주어야 함 */}
                            <select name="emailDomain" ref="emailDomain" id="ipt_email" onChange={this.setAnotherEmailDomain}>
                                <option value="">선택</option>
                                <option value="otherDomain" selected={this.state.isAnotherEmailDomain === 1}>직접입력</option>
                                <option value="gmail.com" selected={this.state.isAnotherEmailDomain === 0 && this.state.anotherEmailDomain === "gmail.com"}>gmail.com</option>
                                <option value="daum.net" selected={this.state.isAnotherEmailDomain === 0 && this.state.anotherEmailDomain === "daum.net"}>daum.net</option>
                                <option value="hanmail.net" selected={this.state.isAnotherEmailDomain === 0 && this.state.anotherEmailDomain === "hanmail.net"}>hanmail.net</option>
                                <option value="naver.com" selected={this.state.isAnotherEmailDomain === 0 && this.state.anotherEmailDomain === "naver.com"}>naver.com</option>
                                <option value="nate.com" selected={this.state.isAnotherEmailDomain === 0 && this.state.anotherEmailDomain === "nate.com"}>nate.com</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            name="otherDomain"
                            ref="otherDomain"
                            placeholder="예) domain.com"
                            autoCapitalize="none"
                            value={this.state.anotherEmailDomain}
                            className="input_sm ico_at mt5"
                            onChange={this.setHandsAnotherEmailDomain}
                            style={{display:this.state.isAnotherEmailDomain === 1 ? 'block' : 'none'}}
                            id="check_domain" />

                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_phone">휴대전화번호</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                type="tel"
                                placeholder="휴대전화번호를 입력하세요 (예 : 010-2345-6789)"
                                id="ipt_phone"
                                name="cellphone"
                                onChange={this.phonecheck}
                                value={event.cellphone}
                                maxLength="13"
                                className="input_sm mb5" />
                            <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                        </div>

                        <input
                            type="text"
                            name="otherDomain"
                            ref="otherDomain"
                            placeholder="예) domain.com"
                            autoCapitalize="none"
                            className="input_sm ico_at mt5"
                            onChange={this.setHandsAnotherEmailDomain}
                            style={{display:this.state.isOtherDomain ? 'block' : 'none'}}
                            id="check_domain" />
                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_name">재직 학교명</label>
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

                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_grade">담당 학년</label>
                        </h2>
                        { /* 부분 렌더링 예시 */
                            (this.state.TAB != 'E') &&  /* 중등 , 고등 */
                            <div className="input_wrap">
                                <ul className="join_ipt_chk">
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g01"
                                            name="grade"
                                            ref="grade"
                                            value="1"
                                            checked={this.state.myGrade == 1}
                                            onChange={this.setMyGrade} />
                                        <label htmlFor="g01">1학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g02"
                                            name="grade"
                                            value="2"
                                            checked={this.state.myGrade == 2}
                                            onChange={this.setMyGrade}/>
                                        <label htmlFor="g02">2학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g03"
                                            name="grade"
                                            value="3"
                                            checked={this.state.myGrade == 3}
                                            onChange={this.setMyGrade}/>
                                        <label htmlFor="g03">3학년</label>
                                    </li>
                                </ul>
                            </div>
                        }
                        { /* 부분 렌더링 예시 */
                            (this.state.TAB == 'E') &&  /* 초등인 경우 */
                            <div className="input_wrap">
                                <ul className="join_ipt_chk">
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g01"
                                            name="grade"
                                            ref="grade"
                                            value="1"
                                            checked={this.state.myGrade == 1}
                                            onChange={this.setMyGrade} />
                                        <label htmlFor="g01">1학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g02"
                                            name="grade"
                                            value="2"
                                            checked={this.state.myGrade == 2}
                                            onChange={this.setMyGrade}/>
                                        <label htmlFor="g02">2학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g03"
                                            name="grade"
                                            value="3"
                                            checked={this.state.myGrade == 3}
                                            onChange={this.setMyGrade}/>
                                        <label htmlFor="g03">3학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g04"
                                            name="grade"
                                            value="4"
                                            checked={this.state.myGrade == 4}
                                            onChange={this.setMyGrade} />
                                        <label htmlFor="g04">4학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g05"
                                            name="grade"
                                            value="5"
                                            checked={this.state.myGrade == 5}
                                            onChange={this.setMyGrade}/>
                                        <label htmlFor="g05">5학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g06"
                                            name="grade"
                                            value="6"
                                            checked={this.state.myGrade == 6}
                                            onChange={this.setMyGrade}/>
                                        <label htmlFor="g06">6학년</label>
                                    </li>
                                </ul>
                            </div>
                        }
                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_subject">내 교과</label>
                        </h2>
                        <div className="combo_box type1 mb25">
                            { /* 부분 렌더링 예시 */
                                (this.state.TAB != 'E') &&  /* 중등 , 고등 */
                                <div className="selectbox select_sm mb25">
                                    <select
                                        name="receive"
                                        id="ipt_subject"
                                        onChange={this.setMainSubject}
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="SC100" selected={this.state.mainSubject == "SC100"}>국어</option>
                                        <option value="SC101" selected={this.state.mainSubject == "SC101"}>영어</option>
                                        <option value="SC102" selected={this.state.mainSubject == "SC102"}>수학</option>
                                        <option value="SC103" selected={this.state.mainSubject == "SC103"}>사회</option>
                                        <option value="SC106" selected={this.state.mainSubject == "SC106"}>역사</option>
                                        <option value="SC107" selected={this.state.mainSubject == "SC107"}>도덕</option>
                                        <option value="SC104" selected={this.state.mainSubject == "SC104"}>과학</option>
                                        <option value="SC105" selected={this.state.mainSubject == "SC105"}>한문</option>
                                        <option value="SC110" selected={this.state.mainSubject == "SC110"}>기술·가정</option>
                                        <option value="SC114" selected={this.state.mainSubject == "SC114"}>정보</option>
                                        <option value="SC108" selected={this.state.mainSubject == "SC108"}>음악</option>
                                        <option value="SC109" selected={this.state.mainSubject == "SC109"}>미술</option>
                                        <option value="SC111" selected={this.state.mainSubject == "SC111"}>체육</option>
                                        <option value="SC112" selected={this.state.mainSubject == "SC112"}>실과</option>
                                        <option value="SC113" selected={this.state.mainSubject == "SC113"}>진로와 직업</option>
                                        <option value="SC199" selected={this.state.mainSubject == "SC199"}>기타</option>
                                    </select>
                                </div>
                            }
                            { /* 부분 렌더링 예시 */
                                (this.state.TAB == 'E') &&  /* 초등인 경우 */
                                <div className="selectbox select_sm mb25">
                                    <select
                                        name="receive"
                                        id="ipt_subject"
                                        onChange={this.setMainSubject}
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="SC102" selected={this.state.mainSubject == "SC102"}>수학</option>
                                        <option value="SC103" selected={this.state.mainSubject == "SC103"}>사회</option>
                                        <option value="SC104" selected={this.state.mainSubject == "SC104"}>과학</option>
                                    </select>
                                </div>
                            }

                        </div>

                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_career">교사 경력</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                onChange={this.setCareer}
                                type="number"
                                id="ipt_career"
                                name="career"
                                maxLength="2"
                                value={this.state.career}
                                className="input_sm" />
                        </div>

                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_choice">비교과 콘텐츠 분야에도 지원하시겠습니까?</label>
                        </h2>
                        <div className="input_wrap">
                            <ul className="join_ipt_chk">
                                <li className="join_chk_list">
                                    <input
                                        type="radio"
                                        className="checkbox_circle"
                                        id="subSubject_select01"
                                        name="subSubject"
                                        ref="subSubject"
                                        value="Y"
                                        checked={this.state.subSubject === 'Y'}
                                        onChange={this.setSubSubject}/>
                                    <label htmlFor="subSubject_select01">예</label>
                                </li>
                                <li className="join_chk_list">
                                    <input
                                        type="radio"
                                        className="checkbox_circle"
                                        id="subSubject_select02"
                                        name="subSubject"
                                        value="N"
                                        checked={this.state.subSubject === 'N'}
                                        onChange={this.setSubSubject} />
                                    <label htmlFor="subSubject_select02">아니오</label>
                                </li>
                            </ul>
                        </div>

                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_choice">비상교과서 채택여부</label>
                        </h2>
                        <div className="input_wrap">
                            <ul className="join_ipt_chk">
                                <li className="join_chk_list">
                                    <input
                                        type="radio"
                                        className="checkbox_circle"
                                        id="ipt_select01"
                                        name="visangTbYN"
                                        ref="visangTbYN"
                                        value="Y"
                                        checked={this.state.visangTbYN === 'Y'}
                                        onChange={this.setVisangTbYN}/>
                                    <label htmlFor="ipt_select01">채택</label>
                                </li>
                                <li className="join_chk_list">
                                    <input
                                        type="radio"
                                        className="checkbox_circle"
                                        id="ipt_select02"
                                        name="visangTbYN"
                                        value="N"
                                        checked={this.state.visangTbYN === 'N'}
                                        onChange={this.setVisangTbYN} />
                                    <label htmlFor="ipt_select02">미채택</label>
                                </li>
                            </ul>
                        </div>

                        <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyContent">지원 동기</label>
                        </h2>
                        <div className="input_wrap">
                            <textarea
                                name="applyContent1"
                                id="applyContent1"
                                cols="1"
                                rows="10"
                                maxLength="200"
                                value={this.state.step1}
                                onChange={this.setApplyContent1}
                                placeholder="200자 까지 입력하실 수 있습니다."
                                className="textarea">
	                        </textarea>
                            <div className="count_wrap mb25">
                                <p className="count">(<span>{this.state.step1Length}</span>/200)</p>
                            </div>
                        </div>

                        <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyContent2">개인 활동 내역</label>
                        </h2>
                        <div className="input_wrap">
	                        <textarea
                                name="applyContent2"
                                id="applyContent2"
                                cols="1"
                                rows="10"
                                maxLength="500"
                                value={this.state.step2}
                                onChange={this.setApplyContent2}
                                placeholder="500자 까지 입력하실 수 있습니다."
                                className="textarea">
	                        </textarea>
                            <div className="count_wrap mb25">
                                <p className="count">(<span>{this.state.step2Length}</span>/500)</p>
                            </div>
                        </div>

                        <div className="acco_notice_list">
                            <a href="#" className="acco_notice_link active">
                                <span className="acco_notice_tit info_tit pb0">
                                    개인정보 수집 및 이용동의
                                </span>
                            </a>
                            <div className="acco_notice_cont mt10">
                                <ul className="policy">
                                    <li>- 이용목적 : 모니터링단 선발 시 개별안내 및 활동기간 내 의견 수렴</li>
                                    <li>- 수집하는 개인정보 : 성명, 휴대전화번호, 이메일, 재직 정보 등</li>
                                    <li>- 개인정보 보유 및 이용기간 : 모니터링단 신청 종료 시까지 (이용목적 달성 시 즉시 파기)</li>
                                </ul>
                                <p className="comt mt10">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.checkEventAgree}
                                    checked={this.state.eventAgree == true}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree01" />
                                <label
                                    htmlFor="join_agree01"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on mt35">신청하기</button>
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
        eventMonitoring : state.saemteo.get('eventMonitoring').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
