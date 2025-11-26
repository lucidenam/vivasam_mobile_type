import React, { Component } from 'react';
import './Event.css';
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
        this.state = {
            /* 기존의 값 */
            initialSchName:'',
            initialSchZipCd:'',
            initialSchAddr:'',
            eventInfo:'',
            phoneCheckMessage: '',
            phoneCheckClassName: '',
            telephoneCheck: false,
            /* 해당 이벤트에 추가 */
            isSetGroupCheck: "1", // 1 : 학급 / 2 : 동아리 ( 웹과의 연동을 위함 )
            isSetGroupName1 : '', // 학급 - 학년
            isSetGroupName2 : '', // 학급 - 반
            isSetGroupCircleName : '', // 동아리
            isSetMemberCount : '', // 참가 신청 인원
            eMailDomain : '', // Email Domain ( email ID )
            anotherEmailDomain : '', // Email Back Domain ( gmail.com / naver.com ... )
            isAnotherEmailDomain : '', // ( 0 : 직접입력 X / 1 : 직접 입력 )
            eventContents : '', // 이벤트 신청 내용 ( 꿈 명함 이유 )
            eventLength : 0, // 이벤트 신청 길이
            infoCheck01 : false, // 캠페인 유의사항 확인
            infoCheck02 : false // 캠페인 후기 사진 동의 여부
        };
    }
    componentDidMount(){
        const {eventId} = this.props;
        this.getEventInfo(eventId);
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
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.inputType = '개인정보 불러오기';
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

     // 그룹명 ( 학급, 동아리 설정 )
     setGroupCheck = (e) => {
         this.setState({
             isSetGroupCheck : e.target.value
         });
     };

     /* 학년 , 반 , 동아리명 설정 */
     // 학년 설정
    setGroupName1 = (e) => {
        if(e.target.value.length < 10) { // Number형은 length를 읽어와서 일일이 비교해주어야 됩니다.
            this.setState({
                isSetGroupName1: e.target.value
            });
        }
    };
     // 반 설정
    setGroupName2 = (e) => {
        this.setState({
            isSetGroupName2 : e.target.value
        });
    };
    // 동아리명 설정
    setGroupCircleName = (e) => {
        this.setState({
            isSetGroupCircleName : e.target.value
        });
    };
    /* 학년, 반 , 동아리명 설정 끝 */

     // 인원 설정
     setMemberCount = (e) => {
         if(e.target.value.length < 3){ // Number형은 length를 읽어와서 일일이 비교해주어야 됩니다.
             if(parseInt(e.target.value) > 50){
                 common.error("50명까지 기입 가능합니다.");
                 this.setState({
                     isSetMemberCount : 50
                 });
             }else{
                 this.setState({
                     isSetMemberCount : e.target.value
                 });
             }

         }
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

    // 이메일 체크
    // 앞쪽 아이디 입력

    setEmailDomain = (e) => {
        this.setState({
            eMailDomain : e.target.value
        });
    };
    // 직접 입력일 경우 입력창이 뜨도록 설정
    setAnotherEmailDomain = (e) => {
        if(e.target.name === 'emailDomain') {
            if(e.target.value === 'otherDomain'){
                this.setState({
                    isOtherDomain : 1
                });
            }else{
                this.setState({
                    isOtherDomain : 0,
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

    // 내용 입력
    // 댓글 수정 시 길이 연동 및 이벤트 내용 수정
    setApplyContent = (e) => {
        if(e.target.value.length > 500) {
            common.info("500자 이내로 입력해 주세요.");
            return false;
        }
        this.setState({
            eventLength: e.target.value.length,
            eventContents: e.target.value
    });
    };

    // 캠페인 유의사항 확인
    setInfoCheck01 = (e) => {
        this.setState({
            infoCheck01 : !this.state.infoCheck01
        });
    };

    // 캠페인 후기 사진 동의 여부
    setInfoCheck02 = (e) => {
        this.setState({
            infoCheck02 :!this.state.infoCheck02
        });
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
        }else if(!event.schName){
            obj.message = '학교명을 입력해주세요.';
        }else if(event.schZipCd === "" || event.schAddr === ""){
            obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
        }else if((this.state.isSetGroupCheck === "1") && (this.state.isSetGroupName1 === "")){ // 학급 - 학년 미입력
            obj.message = '학년을 입력해주세요.';
        }else if((this.state.isSetGroupCheck === "1") && (this.state.isSetGroupName2 === "")){ // 학급 - 반 미입력
            obj.message = '반을 입력해주세요..';
        }else if((this.state.isSetGroupCheck === "2") && (this.state.isSetGroupCircleName === "")){ // 학급 - 동아리 미입력
            obj.message = '동아리 명을 입력해주세요..';
        }else if(this.state.isSetMemberCount === "") { // 인원 미입력
            obj.message = '인원을 입력해주세요.';
        }else if(event.telephone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if((this.state.eMailDomain === "") || (this.state.anotherEmailDomain === "")){
            obj.message = '이메일 주소를 입력해주세요.';
        }else if(this.state.eventContents === ""){ // 내용 미입력
            obj.message = '내용을 입력해 주세요.';
        }else if(this.state.infoCheck01 === false){ // 확인 여부 미입력
            obj.message = '캠페인 유의사항을 확인해 주세요.';
        }else if(!event.agree){
            obj.message = '이벤트 참여를 위해 개인정보 수집에 동의해주세요.';
        } else {
            obj.result = true;
        }
        return obj;
    };

    applyButtonClickSafe = (e) => {
        this.applyButtonClick(e.target);
    };

    applyButtonClick = (target) => {
        target.disabled = true;
        const { event,history,SaemteoActions } = this.props;
        let obj = this.validateInfo();
        if(!obj.result){
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        try {

            // 주소를 입력받아 ex) 서울특별시 > 은평구 까지만 입력되도록 구분
            let eventschAddr = event.schAddr.split(" ");

            // inputType에 따른 값에 따라 ( 1: 개인정보 불러오기 / 2: 직접 입력 )
            let eventType = "";
            if(event.inputType === "개인정보 불러오기"){ eventType = 1; }
            else{ eventType = 2; }

            // 전화번호 구분
            let eventCellPhone = event.cellphone.split("-");


            // 응답값 설정
            // 웹에서 수정이 가능할 수 있게 조절 ( 입력방식 / 학교이름 / 학교 주소 1 - 2 Depth / 학교(반,학년) / 동아리(동아리이름) / 인원 / 전화번호 / Email / 내용
            if(this.state.isSetGroupCheck === "1"){
                event.eventAnswerDesc = eventType + '|^| ' + event.schName + '|^| ' + eventschAddr[0] + '|^| ' + eventschAddr[1] + '|^| ' + this.state.isSetGroupCheck + '|^| ' + this.state.isSetGroupName1  + '|^| '  + this.state.isSetGroupName2  + '|^| '
                                      + this.state.isSetMemberCount + '|^| ' + eventCellPhone[0]  + '|^| '  + eventCellPhone[1] + '|^| '  + eventCellPhone[2] + '|^| ' +  this.state.eMailDomain  + '@' +  this.state.anotherEmailDomain + '|^| '  +  this.state.eventContents;
            }else{
                event.eventAnswerDesc = eventType + '|^| ' +event.schName + '|^| ' + eventschAddr[0] + '|^| ' + eventschAddr[1] + '|^| ' + this.state.isSetGroupCheck + '|^| ' + this.state.isSetGroupCircleName   + '|^| ' + '|^|'
                                      + this.state.isSetMemberCount + '|^| '  + eventCellPhone[0]  + '|^| '  + eventCellPhone[1] + '|^| '  + eventCellPhone[2] + '|^| ' +  this.state.eMailDomain  + '@' +  this.state.anotherEmailDomain + '|^| '  +  this.state.eventContents;
            }

            SaemteoActions.pushValues({type:"event", object:event});
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    };

    handleClose = async(e) => {
        e.preventDefault();
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/'+eventId);
    };

    //신청
    insertApplyForm = async () => {
        const { event, eventId, SaemteoActions, PopupActions, BaseActions } = this.props;
        try {
            BaseActions.openLoading();
            event.eventId = eventId;

            var params = {
                eventId: eventId,
                eventAnswerDesc: event.eventAnswerDesc,
                userInfo: event.userInfo
            };

            let response = await SaemteoActions.insertEventApply(params);

            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
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

    render() {
        const {eventInfo} = this.state;
        if (eventInfo === '') return <RenderLoading/>;
        const {event} = this.props;
        const { phoneCheckMessage, phoneCheckClassName } = this.state;
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell ta_c">
                        <h3>2021 비바샘 꿈지기 사연 신청</h3>
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
                            <label htmlFor="ipt_name">학교명</label>
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
                        <h2 className="info_tit mt30">
                            <label htmlFor="ipt_address">학교 주소</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                type="text"
                                placeholder="우편번호 검색을 선택하세요"
                                value={event.schZipCd}
                                className="input_sm"
                                readOnly/>
                            <button
                                type="button"
                                className="input_in_btn btn_gray"
                                onClick={this.openPopupAddress}
                                >
                                우편번호 검색
                            </button>
                        </div>
                        <div className="input_wrap mt5" style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
                            <input
                            type="text"
                            id="ipt_address"
                            value={event.schAddr}
                            className="input_sm"
                            readOnly/>
                        </div>
                        <h2 className="info_tit mt30">
                            <label htmlFor="groupName1">그룹명</label>
                        </h2>
                        <div className="input_wrap mb15">
                            <ul className="join_ipt_chk">
                                <li className="join_chk_list" style={{width:'45%'}}>
                                    <input
                                        id="groupName1"
                                        type="radio"
                                        className="checkbox_circle"
                                        name="groupName"
                                        value="1"
                                        checked={this.state.isSetGroupCheck === "1"}
                                        onChange={this.setGroupCheck}
                                    />
                                    <label htmlFor="groupName1">학급</label>
                                </li>
                                <li className="join_chk_list">
                                    <input
                                        id="groupName2"
                                        type="radio"
                                        className="checkbox_circle"
                                        name="groupName"
                                        value="2"
                                        checked={this.state.isSetGroupCheck === "2"}
                                        onChange={this.setGroupCheck}
                                    />
                                    <label htmlFor="groupName2">동아리</label>
                                </li>
                            </ul>
                        </div>
                        {   /* 학급인 경우 경우 출력 */
                            this.state.isSetGroupCheck == 1 &&
                            <div className="combo_box type1 dual">
                                <div className="input_wrap">
                                    <input
                                        type="number"
                                        maxLength="5"
                                        name="receiveGrade"
                                        value={this.state.isSetGroupName1}
                                        onChange={this.setGroupName1}
                                        className="input_sm"/>
                                    <span className="label_txt">학년</span>
                                </div>
                                <div className="input_wrap">
                                    <input
                                        type="text"
                                        autoCapitalize="none"
                                        name="receiveClass"
                                        maxLength="10"
                                        onChange={this.setGroupName2}
                                        className="input_sm"/>
                                    <span className="label_txt">반</span>
                                </div>
                            </div>
                        }
                        {  /* 동아리인 경우 출력 */
                            this.state.isSetGroupCheck == 2 &&
                            <div className="combo_box type1">
                                <div className="input_wrap">
                                    <input
                                        type="text"
                                        maxLength="10"
                                        name="receiveCircleGroup"
                                        onChange={this.setGroupCircleName}
                                        className="input_sm"/>
                                </div>
                            </div>
                        }
                        <p className="mt10 mb25 c_blue">※ 한 그룹 단위로만 신청 가능합니다.</p>
                        <h2 className="info_tit">
                            <label htmlFor="personnel">총 인원</label>
                        </h2>
                        <div className="combo_box type1 dual">
                            <div className="input_wrap">
                                <input
                                    type="number"
                                    name="personnel"
                                    value={this.state.isSetMemberCount}
                                    onChange={this.setMemberCount}
                                    className="input_sm"/>
                                <span className="label_txt">명</span>
                            </div>
                        </div>
                        <p className="mt10 mb25 c_gray">※ 꿈지기 선생님을 포함한 총 인원 수를 기재하여 주세요.</p>

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
                                value={event.cellphone}
                                maxLength="13"
                                className="input_sm mb5" />
                            <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                        </div>
                        <h2 className="info_tit">
                            <label htmlFor="ipt_email">이메일</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                type="text"
                                name="email"
                                ref="email"
                                onChange={this.setEmailDomain}
                                className="input_sm input_fix_wrap"
                                id="ipt_email" />
                            <span className="input_fix_txt">@</span>
                        </div>
                        <div className="selectbox select_sm mt5">
                            <select name="emailDomain" ref="emailDomain" id="ipt_email" onChange={this.setAnotherEmailDomain}>
                                <option value="">선택</option>
                                <option value="otherDomain">직접입력</option>
                                <option value="gmail.com">gmail.com</option>
                                <option value="daum.net">daum.net</option>
                                <option value="hanmail.net">hanmail.net</option>
                                <option value="naver.com">naver.com</option>
                                <option value="nate.com">nate.com</option>
                            </select>
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
                        <h2 className="info_tit txt_ls mt25">
                            <label htmlFor="applyContent">신청사연</label>
                        </h2>
                        <p className="mb10">꿈 명함을 제작하고픈 특별한 사연이나 아이들의 꿈을 찾아주는 이색적인 활동을 남겨주세요.</p>
                        <div className="input_wrap">
                            <textarea
                                name="applyContent"
                                id="applyContent"
                                cols="1"
                                rows="10"
                                maxLength="501"
                                value={this.state.eventContents}
                                onChange={this.setApplyContent}
                                placeholder="500자 까지 입력하실 수 있습니다."
                                className="textarea">
                            </textarea>
                            <div className="count_wrap">
                                <p className="count">(<span>{this.state.eventLength}</span>/500)</p>
                            </div>
                        </div>
                    </div>
                    <div className="vivasamter_applyDtl bgGray">
                        <div className="mb25">
                            <div className="acco_notice_list mt25">
                                <div className="acco_notice_cont mt10">
                                    <span className="acco_notice_tit info_tit pb10">꿈지기 캠페인 참여 유의사항</span>
                                    <ul className="policy">
                                        <li>- 학급, 동아리 등 <span>50명 이내 그룹 단위</span>로만 신청 가능합니다.</li>
                                        <li>- 당첨되신 분께 꿈 명함 제작을 위한 정보를 요청드립니다.</li>
                                        <li>- 꿈지기 생생후기 게시판에 후기 사진 게재를 위하여 <span>학생들의 초상권 동의서</span>를 수급합니다.<br />* 학생들의 초상권 동의를 받지 못할 경우 당첨이 취소될 수 있습니다.</li>
                                        <li>- 꿈 명함 수령 후 반드시 <span>후기 사진</span>과 200자 이내의 소감을 보내주세요.</li>
                                        <li>- 꿈 명함은 <span>재직학교로 배송</span>됩니다. <a href="/#/myInfo">개인정보 확인</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="evtAgree01"
                                    onChange={this.setInfoCheck01}
                                    checked={this.state.infoCheck01 === true}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="evtAgree01" />
                                <label
                                    htmlFor="evtAgree01"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">본인은 꿈지기 캠페인 참여 유의사항을 확인하였습니다.</strong>
                                </label>
                            </div>
                        </div>

                        <div className="acco_notice_list">
                            <div className="acco_notice_cont mt10">
                            <span className="acco_notice_tit info_tit pb10">개인정보 수집 및 이용동의</span>
                                <ul className="policy">
                                    <li>- 이용목적 : 상품 배송 및 고객 문의 응대</li>
                                    <li>- 수집하는 개인정보 : 성명, 휴대전화번호, 재직학교</li>
                                    <li>- 개인정보 보유 및 이용기간 : 2021년 캠페인 종료시까지 (이용목적 달성 시 즉시 파기)</li>
                                    <li>- 선물 발송을 위해 개인정보(성명/주소/연락처)가 배송업체에 제공됩니다.<br />㈜다우기술-사업자번호 : 220-81-02810<br />㈜한진-사업자등록번호 : 201-81-02823</li>
                                </ul>
                                <p>선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.handleChange}
                                    checked={event.agree}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree" />
                                <label
                                    htmlFor="join_agree"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 개인정보 수집 및 이용에 동의합니다.
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
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
