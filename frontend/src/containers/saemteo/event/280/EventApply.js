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
        telephoneCheck: false ,
        step1 : '',  // 해당 이벤트
        step1Length : 0
    };

    componentDidMount(){
        const {eventId , history } = this.props;
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventId == null) || (typeof eventId == "undefined")){
            common.error("응답 문항이 제대로 작성되지 않으셨습니다.");
            history.push('/saemteo/event/view/278');
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
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.inputType = '개인정보 불러오기';
            event.userInfo = 'Y';
            event.cellphone = '';
            // 해당 이벤트는 Amount 가 1개이므로 여기서 등록
            event.amount = 1;
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
        } else if(event.schZipCd === "" || event.schAddr === ""){
            obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
        } else if(event.addressDetail === ""){
            obj.message = '상세주소를 입력해주세요.';
        }else if(event.receive === ""){
            obj.message = '수령처를 선택해주세요.';
        }else if(event.receive === "교실" && (event.receiveGrade === "" || event.receiveClass === "")){
            obj.message = '학년 반을 입력해주세요.';
        }else if(event.receive === "기타" && event.receiveEtc === ""){
            obj.message = '수령처를 입력해주세요.';
        }else if(event.telephone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        } else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
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
        const { event, SaemteoActions } = this.props;
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
            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + '/' +event.addressDetail + '/수령처 : ' + receive ;
            SaemteoActions.pushValues({type:"event", object:event});
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    };

    handleClose = async() => {
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/278');
    };

    // 내용 입력
    setApplyContent = (e) => {
        if(e.target.value.length > 500){
            common.info("500자 이내로 입력해 주세요.");
        }else{
            this.setState({
                step1Length: e.target.value.length,
                step1: e.target.value
            });
        }
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
                // Web과의 싱크를 맞춰주기 위해서 2번째 응답도 똑같이 맞춰준다.
                event.eventAnswerDesc = '|STEP|' + this.state.step1;
                event.eventAnswerSeq = 2;
                response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={278} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
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

    render() {
        const {eventInfo} = this.state;
        if (eventInfo === '') return <RenderLoading/>;
        const {event} = this.props;
        const { phoneCheckMessage, phoneCheckClassName } = this.state;
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    이벤트 참여하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell">
                        <h3>02. 풍요롭쥐 참여하기</h3>
                        <p>학교 번지수 및 수령처(ex. 교무실, 행정실, 학년 반, 경비실 등)를 정확히 기재해주세요.</p>
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
                                style={{ display : event.userInfo == 'N' ? 'block' : 'none' }}
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
                        <div className="input_wrap mt5 mb25">
                            <input
                                type="text"
                                placeholder="상세주소를 입력하세요"
                                id="ipt_detail_address"
                                name="addressDetail"
                                onChange={this.handleChange}
                                value={event.addressDetail}
                                className="input_sm" />
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
                                    className="input_sm"/>
                                <span className="label_txt">반</span>
                            </div>
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
                                className="input_sm mb5" />
                            <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                        </div>

                        <h2 className="info_tit txt_ls">
                            <label htmlFor="applyContent2" className="bl">답변</label>
                        </h2>

                        <div className="input_wrap">
							<textarea
                                name="applyContent2"
                                id="applyContent2"
                                cols="1"
                                rows="10"
                                maxLength="100"
                                value={this.state.step1}
                                onChange={this.setApplyContent}
                                placeholder="100자 까지 입력하실 수 있습니다."
                                className="textarea">
							</textarea>
                            <div className="count_wrap mb25">
                                <p className="count">(<span>{this.state.step1Length}</span>/100)</p>
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
                                    <li>- 이용목적 : 경품 발송</li>
                                    <li>- 수집하는 개인정보 : 성명, 학교명, 학교 주소, 휴대전화번호</li>
                                    <li>- 개인정보 보유 및 이용기간 : 이용목적 달성 시 즉시 파기</li>
                                    <li>- 수집하는 개인정보의 취급위탁 : 이벤트 경품발송을 위해 개인정보(이름/주소/휴대전화번호)를 배송업체에 취급 위탁 (㈜다우기술 사업자등록번호 : 220-81-02810 / 롯데글로벌로지스㈜ 사업자등록번호 : 102-81-23012)</li>
                                </ul>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.handleChange}
                                    checked={event.agree}
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
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
