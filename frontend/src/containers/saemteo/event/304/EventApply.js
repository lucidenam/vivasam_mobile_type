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
        books: {
            book3: "국어 독서 기본(고1, 고2)",
            book4: "국어 문학 기본(고1, 고2)",
            book5: "국어 문학",
            book6: "물리학 Ⅰ",
            book7: "화학 Ⅰ",
            book8: "생명과학 Ⅰ",
            book9: "지구과학 Ⅰ",
            book10: "영어 독해 기본(고1, 고2)",
            book11: "영어 독해",
            book12: "영어 어법·어휘",
            book13: "한국지리",
            book14: "생활과 윤리",
            book15: "사회·문화"
        },
    };

    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventAnswer.eventAnswerContent.applyContent == null) || (typeof eventAnswer.eventAnswerContent.applyContent == "undefined")
            || (eventId == null) ||  (typeof eventId == "undefined")
            || (((eventAnswer.eventAnswerContent.check1 == null) || (typeof eventAnswer.eventAnswerContent.check1 == "undefined"))
            && ((eventAnswer.eventAnswerContent.check2 == null) || (typeof eventAnswer.eventAnswerContent.check2 == "undefined"))
            && ((eventAnswer.eventAnswerContent.check3 == null) || (typeof eventAnswer.eventAnswerContent.check3 == "undefined"))
            && ((eventAnswer.eventAnswerContent.check4 == null) || (typeof eventAnswer.eventAnswerContent.check4 == "undefined")))){
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
            obj.message = '연락처를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '연락처를 입력해주세요.';
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
                (eventAnswer.eventAnswerContent.applyContent == "") || (eventId == "") ||
                (
                    ((eventAnswer.eventAnswerContent.check1 == ""))
                    && ((eventAnswer.eventAnswerContent.check2 == ""))
                    && ((eventAnswer.eventAnswerContent.check3 == ""))
                    && ((eventAnswer.eventAnswerContent.check4 == ""))
                )
            ){
                common.info("선택(입력)정보가 없습니다. 다시 확인 부탁드립니다.");
                history.push('/saemteo/event/view/'+eventId);
                return;
            }

            let korean = "";
            if(eventAnswer.eventAnswerContent.check1 != ""){
                korean = this.state.books['book'+eventAnswer.eventAnswerContent.check1];
            }
            let science = "";
            if(eventAnswer.eventAnswerContent.check2 != ""){
                science = this.state.books['book'+eventAnswer.eventAnswerContent.check2];
            }
            let english = "";
            if(eventAnswer.eventAnswerContent.check3 != ""){
                english = this.state.books['book'+eventAnswer.eventAnswerContent.check3];
            }
            let others = "";
            if(eventAnswer.eventAnswerContent.check4 != ""){
                others = this.state.books['book'+eventAnswer.eventAnswerContent.check4];
            }

            let books = korean+"^"+science+"^"+english+"^"+others;

            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + ' ' +event.addressDetail + '/수령처 : ' + receive + '/' + books;

            SaemteoActions.pushValues({type:"event", object:event});

            // 수량체크
            this.checkEventAmout();
        } catch (e) {
            console.log(e);
        }
    };

    handleClose = async() => {
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/'+eventId);
    };

    // 수량체크
    checkEventAmout = async () => {
        const { history, PopupActions, BaseActions , eventAnswer, eventId , SaemteoActions} = this.props;

        let params = {};
        params.eventId = eventId; // 이벤트 ID
        // 한번더 수량 체크
        if(eventAnswer.eventAnswerContent.check1 != null && eventAnswer.eventAnswerContent.check1 != "undefined" && eventAnswer.eventAnswerContent.check1 != ""){
            try {
                const params1 = {};
                params1.eventId = eventId; // 이벤트 ID
                params1.seq = eventAnswer.eventAnswerContent.check1; // 수량 제한시 Type 변경
                let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});

                const params2 = {};
                params2.eventId = eventId;
                params2.eventType = eventAnswer.eventAnswerContent.check1;
                let response2 = await api.eventCheckLimitAmount({...params2});
                let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;

                if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                    common.error(this.state.books["book"+eventAnswer.eventAnswerContent.check1]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    history.push('/saemteo/event/view/'+eventId);
                    return;
                }
            } catch (e) {
                common.error("처리 중 오류가 발생 하였습니다.");
            }
        }
        if(eventAnswer.eventAnswerContent.check2 != null && eventAnswer.eventAnswerContent.check2 != "undefined" && eventAnswer.eventAnswerContent.check2 != ""){
            try {
                const params1 = {};
                params1.eventId = eventId; // 이벤트 ID
                params1.seq = eventAnswer.eventAnswerContent.check2; // 수량 제한시 Type 변경
                let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});

                const params2 = {};
                params2.eventId = eventId;
                params2.eventType = eventAnswer.eventAnswerContent.check2;
                let response2 = await api.eventCheckLimitAmount({...params2});
                let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;

                if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                    common.error(this.state.books["book"+eventAnswer.eventAnswerContent.check2]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    history.push('/saemteo/event/view/'+eventId);
                    return;
                }
            } catch (e) {
                common.error("처리 중 오류가 발생 하였습니다.");
            }
        }
        if(eventAnswer.eventAnswerContent.check3 != null && eventAnswer.eventAnswerContent.check3 != "undefined" && eventAnswer.eventAnswerContent.check3 != ""){
            try {
                const params1 = {};
                params1.eventId = eventId; // 이벤트 ID
                params1.seq = eventAnswer.eventAnswerContent.check3; // 수량 제한시 Type 변경
                let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});

                const params2 = {};
                params2.eventId = eventId;
                params2.eventType = eventAnswer.eventAnswerContent.check3;
                let response2 = await api.eventCheckLimitAmount({...params2});
                let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;

                if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                    common.error(this.state.books["book"+eventAnswer.eventAnswerContent.check3]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    history.push('/saemteo/event/view/'+eventId);
                    return;
                }
            } catch (e) {
                common.error("처리 중 오류가 발생 하였습니다.");
            }
        }
        if(eventAnswer.eventAnswerContent.check4 != null && eventAnswer.eventAnswerContent.check4 != "undefined" && eventAnswer.eventAnswerContent.check4 != ""){
            try {
                const params1 = {};
                params1.eventId = eventId; // 이벤트 ID
                params1.seq = eventAnswer.eventAnswerContent.check4; // 수량 제한시 Type 변경
                let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});

                const params2 = {};
                params2.eventId = eventId;
                params2.eventType = eventAnswer.eventAnswerContent.check4;
                let response2 = await api.eventCheckLimitAmount({...params2});
                let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;

                if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                    common.error(this.state.books["book"+eventAnswer.eventAnswerContent.check4]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    history.push('/saemteo/event/view/'+eventId);
                    return;
                }
            } catch (e) {
                common.error("처리 중 오류가 발생 하였습니다.");
            }
        }

        // 신청 처리
        this.insertApplyForm();
    }

    //신청
    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions , eventAnswer, eventId } = this.props;

        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청 하셨습니다.");
            }else if(response.data.code === '0'){
                event.eventAnswerDesc = eventAnswer.eventAnswerContent.applyContent; // 사연
                event.eventAnswerSeq = 2;
                response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});

                // Web과의 싱크를 맞춰주기 위해서 2번째 응답도 똑같이 맞춰준다.
                if(eventAnswer.eventAnswerContent.check1 != null && eventAnswer.eventAnswerContent.check1 != "undefined" && eventAnswer.eventAnswerContent.check1 != "") {
                    event.eventAnswerDesc = 1; // 사연
                    event.eventAnswerSeq = eventAnswer.eventAnswerContent.check1;
                    event.amountYn = "Y";
                    response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                    if(response.data.code === '4'){
                        throw new Error(this.state.books['book'+eventAnswer.eventAnswerContent.check1]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    }
                }
                if(eventAnswer.eventAnswerContent.check2 != null && eventAnswer.eventAnswerContent.check2 != "undefined" && eventAnswer.eventAnswerContent.check2 != "") {
                    event.eventAnswerDesc = 1; // 사연
                    event.eventAnswerSeq = eventAnswer.eventAnswerContent.check2;
                    event.amountYn = "Y";
                    response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                    if(response.data.code === '4'){
                        throw new Error(this.state.books['book'+eventAnswer.eventAnswerContent.check2]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    }
                }
                if(eventAnswer.eventAnswerContent.check3 != null && eventAnswer.eventAnswerContent.check3 != "undefined" && eventAnswer.eventAnswerContent.check3 != "") {
                    event.eventAnswerDesc = 1; // 사연
                    event.eventAnswerSeq = eventAnswer.eventAnswerContent.check3;
                    event.amountYn = "Y";
                    response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                    if(response.data.code === '4'){
                        throw new Error(this.state.books['book'+eventAnswer.eventAnswerContent.check3]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    }
                }
                if(eventAnswer.eventAnswerContent.check4 != null && eventAnswer.eventAnswerContent.check4 != "undefined" && eventAnswer.eventAnswerContent.check4 != "") {
                    event.eventAnswerDesc = 1; // 사연
                    event.eventAnswerSeq = eventAnswer.eventAnswerContent.check4;
                    event.amountYn = "Y";
                    response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
                    if(response.data.code === '4'){
                        throw new Error(this.state.books['book'+eventAnswer.eventAnswerContent.check4]+"의 남은 수량이 없습니다. 다시 신청해 주시기 바랍니다.");
                    }
                }
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
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
	                    <h3><img src="/images/events/2020/event200708/tit_3.png" alt="FULL수록 신청하기" /></h3>
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
                            <label htmlFor="ipt_name">재직학교</label>
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
                        <br/>
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
                        <ul className="mb15">
                            <li>* 신청하신 교재는 학교로 배송됩니다.</li>
                            <li>* 잘못 기재된 정보로 인해 반송된 교재는 재발송이 불가능합니다.</li>
                            <li>* 교재 수량에 따라 여러 개의 택배 박스로 나뉘어 배송될 수 있습니다.</li>
                        </ul>

                        <div className="acco_notice_list">
                            <a href="#" className="acco_notice_link active">
                                <span className="acco_notice_tit info_tit pb0">
                                    개인정보 수집 및 이용동의
                                </span>
                            </a>
                            <div className="acco_notice_cont mt10">
                                <ul class="policy">
	                                <li>•이용목적 : 이벤트 참여 확인 및 경품 발송</li>
                                    <li>•수집하는 개인정보 : 성명, 재직학교, 휴대전화번호</li>
                                    <li>•개인정보 보유 및 이용기간 : 2020년 8월 31일까지 <br/>(이용목적 달성 시 즉시 파기)</li>
                                    <li>•수집하는 개인정보의 취급위탁 : 교재 배송을 위해 개인정보를 발송업체에 취급 위탁<br/>
                                        ㈜한진 사업자등록번호:201-81-02823</li>
                                </ul>
                                <p className="comt mt10">* 선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를
                                    거부할 수 있습니다.<br/>
                                    단, 동의를 거부할 경우 신청이 불가합니다.</p>
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
                                        본인은 개인정보 수집 및 이용내역을 확인하였으며, 이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                            <div className="checkbox_circle_box mt5">
                                <input
                                    type="checkbox"
                                    name="agree2"
                                    onChange={this.handleChange}
                                    checked={event.agree2}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree05" />
                                <label
                                    htmlFor="join_agree05"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        재직학교 정보를 정확하게 기입하였음을 확인합니다.
                                    </strong>
                                </label>
                            </div>

                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on mt35">신청완료</button>
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
