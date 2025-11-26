import React, { Component,Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as SaemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import FindAddress from 'containers/login/FindAddress';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';
import './Event.css';

class EventApply extends Component {

    state = {
        initialSchName:'',
        initialSchZipCd:'',
        initialSchAddr:'',
        eventInfo:'',
        phoneCheckMessage: '',
        phoneCheckClassName: '',
        telephoneCheck: false,
        contentTitle : ['역사와 친해지는 날','과학과 친해지는 날','내 마음을 돌아보는 날','책으로 여는 수업'],
        chkAmountFull: [false, false, false, false],
    };

    constructor(props) {
        super(props);
        // Debounce
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
    }



    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        console.log(eventId);
        console.log(eventAnswer.eventAnswerContent);
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventAnswer.eventAnswerContent.chkContent == null) || (typeof eventAnswer.eventAnswerContent.chkContent == "undefined")
            || (eventId == null) ||  (typeof eventId == "undefined")){
            common.error("선택(입력)정보가 없습니다. 다시 선택(입력) 해주세요.");
            history.push('/saemteo/event/view/'+eventId);
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
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.addressDetail = schName;
            event.inputType = '개인정보 불러오기';
            event.userInfo = 'Y';
            event.cellphone = '';
            event.agree1 = false;
            event.agree2 = false;
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
        if(e.target.name === 'agree1' || e.target.name === 'agree2'){
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
            event.addressDetail = initialSchName;
        }else{
            event.inputType = '직접입력';
            event.schName = '';
            event.schZipCd = '';
            event.schAddr = '';
            event.addressDetail = '';
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
        }else if(event.schZipCd === "" || event.schAddr === ""){
            obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
        }else if(event.addressDetail === ""){
            obj.message = '학교주소를 입력해주세요.';
        }else if(event.receive === ""){
            obj.message = '수령처를 선택해주세요.';
        }else if(event.receive === "교실" && (event.receiveGrade === "" || event.receiveClass === "")){
            obj.message = '학년 반을 입력해주세요.';
        }else if(event.receive === "기타" && event.receiveEtc === ""){
            obj.message = '수령처를 입력해주세요.';
        }else if(event.telephone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!event.agree1){
            obj.message = '필수 동의 선택 후 이벤트 신청을 완료해주세요.';
        }else if(!event.agree2){
            obj.message = '필수 동의 선택 후 이벤트 신청을 완료해주세요.';
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
        const { event, history, SaemteoActions, eventAnswer, eventId } = this.props;
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
            // 넘어갈때 오류가 생겼을 수 있으므로 다시 선택하게 요청
            if(
                (eventAnswer.eventAnswerContent.chkContent.length == 0) || (eventId == "")
            ){
                common.info("선택(입력)정보가 없습니다. 다시 확인 부탁드립니다.");
                history.push('/saemteo/event/view/'+eventId);
                return;
            }

            // 저장 할 내용 정리
            let selectContentInfo = '';
            let selectContentCnt = '';
            let chkContent = eventAnswer.eventAnswerContent.chkContent;
            let flag = true;
            for(let i=0; i<chkContent.length; i++){
                if(chkContent[i]){
                    if(flag){
                        selectContentInfo += this.state.contentTitle[i];
                        flag = false;
                    }else{
                        selectContentInfo += ' , '+this.state.contentTitle[i];
                    }
                }
                if(i == 0){
                    if(chkContent[i]){
                        selectContentCnt += '1';
                    }else{
                        selectContentCnt += '0';
                    }
                }else{
                    if(chkContent[i]){
                        selectContentCnt += ',1';
                    }else{
                        selectContentCnt += ',0';
                    }
                }
            }
            event.eventId = eventId;
            event.selectContentInfo = selectContentInfo;
            event.selectContentCnt = selectContentCnt;
            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + ' ' +event.addressDetail + '/수령처 : ' + receive;
            SaemteoActions.pushValues({type:"event", object:event});
            // 신청 처리
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    };

    // 이벤트 수량 검사 ( 이벤트 수량 마감시 작업 불가능 )
    eventCheckAmount = async(chkContent) => {
        const { eventAnswer , SaemteoActions, eventId} = this.props;
        let chkAmountFull = this.state.chkAmountFull;
        const params1 = {};
        params1.eventId = eventId; // 이벤트 ID
        // 역사와 친해지는 날
        try {
            params1.seq = 3;
            params1.eventType = 3;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[0] = true;
            }
        }catch(e){chkAmountFull[0] = true;}

        // 과학과 친해지는 날
        try {
            params1.seq = 4;
            params1.eventType = 4;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[1] = true;
            }
        }catch(e){chkAmountFull[1] = true;}

        // 내 마음을 돌아보는 날
        try {
            params1.seq = 5;
            params1.eventType = 5;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[2] = true;
            }
        }catch(e){chkAmountFull[2] = true;}

        // 책으로 여는 수업
        try {
            params1.seq = 6;
            params1.eventType = 6;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                chkAmountFull[3] = true;
            }
        }catch(e){chkAmountFull[3] = true;}

        let result = false;
        for(let i=0; i<chkContent.length; i++){
            if(chkContent[i]){
                if(chkAmountFull[i]){
                    result = true;
                    break;
                }
            }
        }

        return result;
    };

    handleClose = async(e) => {
        e.preventDefault();
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/'+eventId);
    };

    //신청
    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions , eventAnswer, eventId } = this.props;

        let result = await this.eventCheckAmount(eventAnswer.eventAnswerContent.chkContent);

        if(result){
            common.info('선택하신 사례집의 신청 수량이 마감되었습니다.');
            history.push('/saemteo/event/view/'+eventId);
        }else{
            try {
                BaseActions.openLoading();
                event.eventId = eventId;
                event.amountYn = 'Y';
                event.eventAnswerDesc2 = event.selectContentInfo;
                event.applyContentTotCnt = '4';
                event.applyContentNumbers = '3,4,5,6';
                event.applyTargetContentCnt = event.selectContentCnt;
                let response = await SaemteoActions.insertEventApply({...event});
                if(response.data.code === '1'){
                    common.error("이미 신청 하셨습니다.");
                }else if(response.data.code === '0'){
                    PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
                }else if(response.data.code === '4'){
                    throw new Error("선택하신 사례집 신청 수량이 마감되었습니다.");
                }else{
                    common.error("신청이 정상적으로 처리되지 못하였습니다.");
                }
            } catch (e) {
                console.log(e);
                common.info(e.message);
                history.push('/saemteo/event/view/'+eventId);
            }finally {
                setTimeout(()=>{
                    BaseActions.closeLoading();
                }, 1000);//의도적 지연.
            }
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
                    <div className="applyDtl_cell ta_c pick">
                        <h3><strong>‘오늘뭐하지 시즌2 사례집’</strong> 신청하기</h3>
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
                            <label htmlFor="ipt_name">학교 정보</label>
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
                                placeholder="학교명을 입력하세요"
                                id="ipt_name"
                                name="schName"
                                onChange={this.handleChange}
                                value={event.schName}
                                className="input_sm" />
                        </div>
                        <h2 className="info_tit mt30">
                            <label htmlFor="ipt_address">학교 소재지</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                type="text"
                                placeholder="우편번호 검색을 선택하세요"
                                value={event.schZipCd}
                                className="input_sm"
                                readOnly/>
                            { /* 부분 렌더링 예시 */
                                (event.userInfo === 'N') &&  // 직접입력
                                <button
                                    type="button"
                                    className="input_in_btn btn_gray"
                                    onClick={this.openPopupAddress}
                                > 우편번호 검색
                                </button>
                            }
                        </div>
                        <div className="input_wrap mt5" style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
                            <input
                            type="text"
                            id="ipt_address"
                            value={event.schAddr}
                            className="input_sm"
                            readOnly/>
                        </div>
                        <div className="input_wrap mt5">
                            <input
                                type="text"
                                placeholder="상세주소를 입력하세요"
                                id="ipt_detail_address"
                                name="addressDetail"
                                onChange={this.handleChange}
                                value={event.addressDetail}
                                className="input_sm" />
                        </div>
                        <br/>
                        <h2 className="info_tit">
                            <label htmlFor="ipt_receive">수령처</label>
                        </h2>
                        <div className="combo_box type1 mb25">
                            <div className="selectbox select_sm mb25">
                                <select
                                    name="receive"
                                    id="ipt_receive"
                                    onChange={this.handleReceive}>

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
                        <div className="input_wrap mb15">
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
                        <p className="mt10 mb25 c_gray">
                            * 사례집은 학교로만 배송 가능합니다.<br />
                            * 정확하지 않은 정보로 반송된 경우 재발송이 불가능합니다.
                        </p>
                        <div className="acco_notice_list">
                            <div className="acco_notice_cont mt10">
                                <span className="acco_notice_tit info_tit pb10">
                                    오늘뭐하지 시즌2 사례집 배송 관련
                                </span>
                                <ul class="policy">
                                    <li>•오늘뭐하지 시즌2 사례집은 선생님 재직 학교의 인근 비상교육 지사를 통해 전달할 예정입니다. 재직 학교를 정확히 확인해 주세요.</li>
                                    <li>•담당 지사에서 선생님께 직접 연락을 드릴 수 있습니다.</li>
                                    <li>•담당 지사는 아래 링크를 통해 확인하실 수 있습니다.</li>
                                </ul>
                                <p className="comt mt10">(비상교육 지사 안내:<br /><a href="https://book.visang.com/customer/subcompretrieve.aspx?deviceMode=pc" target="_blank" className="btnLink02">https://book.visang.com/customer/subcompretrieve.aspx)</a></p>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree1"
                                    onChange={this.handleChange}
                                    checked={event.agree1}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree01" />
                                <label
                                    htmlFor="join_agree01"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 사례집 배송에 대한 안내를 확인하였습니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <div className="acco_notice_list">
                            <div className="acco_notice_cont mt10">
                                <span className="acco_notice_tit info_tit pb10">
                                    개인정보 수집 및 이용동의
                                </span>
                                <ul class="policy">
                                    <li>•이용목적 : 사례집 발송</li>
                                    <li>•수집하는 개인정보 : 성명, 학교 정보, 학교 소재지, 수령처, 연락처</li>
                                    <li>•개인정보 보유 및 이용기간 : 2021년 4월 30일까지 (이용목적 달성 시 즉시 파기)</li>
                                    <li>•수집하는 개인정보의 취급위탁 : 사례집 발송을 위해 개인정보(이름/주소/연락처)를 재직 학교 인근 비상교육 지사에 취급 위탁</li>
                                </ul>
                                <p className="comt mt10">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree2"
                                    onChange={this.handleChange}
                                    checked={event.agree2}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree02" />
                                <label
                                    htmlFor="join_agree02"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on2 mt35">신청 완료</button>
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));