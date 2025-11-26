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
        /* 이메일 부분 추가 */
        eMailDomain : '', // Email Domain ( email ID )
        anotherEmailDomain : '', // Email Back Domain ( gmail.com / naver.com ... )
        isAnotherEmailDomain : '' // ( 0 : 직접입력 X / 1 : 직접 입력 )

    };

    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        // 응답 문항이 제대로 넘어오지 않거나, EventId를 실수로 Null로 날릴경우 이전 화면으로.
        if((eventId == null) ||  (typeof eventId == "undefined")){
            common.error("이벤트 처리 과정 중 오류가 발생하였습니다.");
            history.push('/saemteo/event/view/258');
        }else{
            this.getEventInfo(eventId);
        }
    }

    /* 비공개 이벤트 회원 검사 */
    /* 20190828 미사용 */
    checkPrivateEvent = async(eventId) => {
        const { history, event } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0") {
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId} = response.data.memberInfo;
            event.memberId = memberId;
            const response_Check = await api.checkPrivateEventMember({...event});
            if(response_Check.data.code === "1"){
                this.getEventInfo(eventId);
            }else{
                common.error("선생님은 해당 이벤트에 참여하실 수 없습니다.");
                history.push('/');
            }
        }
    };

    /* 비공개 이벤트 회원 검사 끝 */

    getEventInfo = async(eventId) => {
        const { history, event, SaemteoActions } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0"){
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId, email, name, schName, schZipCd, schAddr, cellphone } = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.agree = false;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.inputType = '개인정보 불러오기';
            event.userInfo = 'Y';
            event.cellphone = cellphone;
            // 개인정보 불러올때 핸드폰 번호 검사 & 수령처 작업
            event.receive = '교무실';
            this.phonecheckStart(event.cellphone);
            SaemteoActions.pushValues({type:"event", object:event});
            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr,
                // 이메일 부분 추가
                eMailDomain : email.split("@")[0]
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

    handleReceive = (e) => {
        const { event, SaemteoActions } = this.props;
        let target = document.getElementsByClassName('combo_box')[0];
        //hidden
        Array.from(document.getElementsByClassName('receiveGrade')).map((e) => e.classList.add('hide'));
        Array.from(document.getElementsByClassName('receiveClass')).map((e) => e.classList.add('hide'));
        Array.from(document.getElementsByClassName('receiveEtc')).map((e) => e.classList.add('hide'));
        target.classList.remove('type1');
        target.classList.remove('type2');
        target.classList.remove('type3');

        if(e.target.value === '교실'){
            target.classList.add('type3');
            Array.from(document.getElementsByClassName('receiveGrade')).map((e) => e.classList.remove('hide'));
            Array.from(document.getElementsByClassName('receiveClass')).map((e) => e.classList.remove('hide'))
        }else if(e.target.value === '기타'){
            target.classList.add('type2');
            Array.from(document.getElementsByClassName('receiveEtc')).map((e) => e.classList.remove('hide'))
        }else{
            target.classList.add('type1')
        }

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
        }else if(event.telephone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(!event.schName){
            obj.message = '배송지를 입력해주세요.';
        } else if(event.schZipCd === "" || event.schAddr === ""){
            obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
        }else if(event.receive === ""){
            obj.message = '수령처를 선택해주세요.';
        }else if(event.receive === "교실" && (event.receiveGrade === "" || event.receiveClass === "")){
            obj.message = '학년 반을 입력해주세요.';
        }else if(event.receive === "기타" && event.receiveEtc === ""){
            obj.message = '수령처를 입력해주세요.';
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
        const { event, history, SaemteoActions, eventAnswer } = this.props;
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
        try {
            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr +  '/수령처 : ' + receive ;
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
    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions , eventAnswer } = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
                // Web과의 싱크를 맞춰주기 위해서 2번째 응답도 똑같이 맞춰준다.
                /* WEB 이벤트가 아니므로 제외
                event.eventAnswerDesc = this.state.eventContents;
                event.eventAnswerSeq = 2;
                response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                */
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
                    <div className="applyDtl_cell">
                        <h3>비상교육 초등 미술 5~6 교과서를 신청합니다.</h3>
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
                            <label htmlFor="ipt_phone">연락처</label>
                        </h2>
                        <div className="input_wrap mb25">
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

                        <h2 className="info_tit">
                            <label htmlFor="ipt_name">배송지</label>
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
                                    <label htmlFor="userInfoY">학교정보 불러오기</label>
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
                                placeholder="배송지를 입력해 주세요"
                                id="ipt_name"
                                name="schName"
                                onChange={this.handleChange}
                                value={event.schName}
                                className="input_sm" />
                        </div>
                            
                        <h2 className="info_tit mt30">
                            <label htmlFor="ipt_address">배송지 주소</label>
                        </h2>
                        <div className="input_wrap mb25">
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
                        </div>

                        <h2 className="info_tit">
                            <label htmlFor="ipt_receive">수령처</label>
                        </h2>
                        <div className="combo_box type1 mb25">
                            <div className="selectbox select_sm mb25">
                                <select
                                    name="receive"
                                    id="ipt_receive"
                                    onChange={this.handleReceive}
                                    >
                                    <option value="교무실">교무실</option>
                                    <option value="행정실">행정실</option>
                                    <option value="택배실">택배실</option>
                                    <option value="진로상담실">진로상담실</option>
                                    <option value="경비실">경비실</option>
                                    <option value="교실">교실</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                            <div className="input_wrap receiveEtc hide">
                                <input
                                    type="text"
                                    autoCapitalize="none"
                                    name="receiveEtc"
                                    onChange={this.handleChange}
                                    className="input_sm"/>
                            </div>

                            <div className="input_wrap receiveGrade hide">
                                <input
                                    type="number"
                                    maxLength="5"
                                    name="receiveGrade"
                                    onChange={this.handleChange}
                                    className="input_sm"/>
                                <span className="label_txt">학년</span>
                            </div>
                            <div className="input_wrap receiveClass hide">
                                <input
                                    type="text"
                                    autoCapitalize="none"
                                    name="receiveClass"
                                    onChange={this.handleChange}
                                	style={{width : '60px'}}
                                    className="input_sm"/>
                                <span className="label_txt">반</span>
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
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
