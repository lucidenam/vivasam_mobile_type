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
import EventFindSchool from "containers/saemteo/EventFindSchool";

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
        userCellphone:'',
        date: [
            {textVal:'날짜 선택',isSelect: true},
            {textVal:'2021-05-10',isSelect: false},
            {textVal:'2021-05-11',isSelect: false},
            {textVal:'2021-05-12',isSelect: false},
            {textVal:'2021-05-13',isSelect: false},
            {textVal:'2021-05-14',isSelect: false}
        ],
        time: [
            {textVal:'시간 선택',isSelect: true},
            {textVal:'10:00 ~ 12:00',isSelect: false},
            {textVal:'12:00 ~ 14:00',isSelect: false},
            {textVal:'14:00 ~ 16:00',isSelect: false},
            {textVal:'16:00 ~ 18:00',isSelect: false}
        ],
        selDate: '',
        selTime: ''
    };

    componentDidMount = async() => {
        const {eventId, history, eventAnswer} = this.props;
        const {onRdoValue, applyContent} = eventAnswer;

        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventId == null) || (typeof eventId == "undefined") || !applyContent || !onRdoValue){
            history.push('/saemteo/event/view/'+eventId);
        }else{
            await this.getEventInfo(eventId);
        }
    }

    getEventInfo = async(eventId) => {
        const { history, event, SaemteoActions } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0"){
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId, name, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.addressDetail = schName;
            event.inputType = '개인정보 불러오기';
            event.userInfo = 'Y';
            event.cellphone = cellphone;
            event.agree = false;
            event.place = '';

            this.phonecheckByUserInfoCellphone(cellphone);

            SaemteoActions.pushValues({type:"event", object:event});
            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr,
                userCellphone: cellphone
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
        const { initialSchName, initialSchZipCd, initialSchAddr, userCellphone } = this.state;
        if(e.target.value === 'Y'){
            event.userInfo = 'Y';
            event.inputType = '개인정보 불러오기';
            event.schName = initialSchName;
            event.schZipCd = initialSchZipCd;
            event.schAddr = initialSchAddr;
            event.addressDetail = initialSchName;
            event.cellphone = userCellphone;
        }else{
            event.userInfo = 'N';
            event.inputType = '직접입력';
            event.schCode = '';
            event.schName = '';
            event.schZipCd = '';
            event.schAddr = '';
            event.addressDetail = '';
            event.cellphone = userCellphone;
        }
        SaemteoActions.pushValues({type:"event", object:event});
        this.handleChange(e);

        this.phonecheckByUserInfoCellphone(event.cellphone);
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

    // 사용자의 핸드폰정보 조회시 유효성 체크
    phonecheckByUserInfoCellphone = (cellphone) => {
        let text = '';
        let checkFlag = false;
        let clazz = 'point_red';
        if(cellphone === ''){
            text = "";
        } else if(!this.checkPhoneNum(cellphone)){
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
    }

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
    
    // 학교 검색 팝업
    openPopupSchool = (e) => {
        e.preventDefault;
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:"학교 검색", componet:<EventFindSchool handleSetSchool={this.handleSetSchool}/>});
    }
    // 학교검색 선택후 callback
    handleSetSchool = (obj) => {
        const { event, SaemteoActions, PopupActions } = this.props;
        const { schoolName, schoolCode, zip, addr } = obj;

        event.schCode = schoolCode;
        event.schName = schoolName;
        event.schZipCd = zip;
        event.schAddr = addr;
        event.addressDetail = '';

        SaemteoActions.pushValues({type:"event", object:event});
        PopupActions.closePopup();
    }
    
    
    //값 입력 확인
    validateInfo = () => {
        const { event, eventAnswer } = this.props;
        const { telephoneCheck } = this.state;
        const {onRdoValue} = eventAnswer;
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
        }else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(!event.agree){
            obj.message = '이벤트 참여를 위해 개인정보 수집에 동의해주세요.';
        } else {
            if(onRdoValue === '학교로 가는 커피차') {
                if(this.state.selDate === '' || this.state.selDate === '날짜 선택') {
                    obj.message = '날짜를 선택해주세요.';
                }else if(this.state.selTime === '' || this.state.selTime === '시간 선택') {
                    obj.message = '시간을 선택해주세요.';
                }else if(!event.place || event.place === '') {
                    obj.message = '장소를 입력해주세요.';
                }else{
                    obj.result = true;
                }
            }else{
                obj.result = true;
            }
        }
        return obj;
    };

    applyButtonClickSafe = (e) => {
        this.applyButtonClick(e.target);
    }

    applyButtonClick = (target) => {
        target.disabled = true;
        const { event, SaemteoActions, eventAnswer } = this.props;
        const {onRdoValue, applyContent} = eventAnswer;
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
            event.eventInfo = '';

            if(onRdoValue === '학교로 가는 커피차'){
                event.eventInfo = onRdoValue+'/'+this.state.selDate+'/'+this.state.selTime+'/'+event.place;
            }else{
                event.eventInfo = onRdoValue+'/'+'/'+'/';
            }

            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + ' ' +event.addressDetail + '/수령처 : ' + receive;
            SaemteoActions.pushValues({type:"event", object:event});
            // 신청 처리
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
        const { event, eventAnswer, history, SaemteoActions, PopupActions, BaseActions, eventId } = this.props;
        const {onRdoValue, applyContent} = eventAnswer;
        try {
            BaseActions.openLoading();
            event.eventId = eventId;
            event.amountYn = 'N';
            event.eventAnswerDesc2 = event.eventInfo + '^||^' + applyContent;

            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
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

    handleSeletBox = (target, e) => {
        console.log(target);
        console.log(e.target.value);
        if(target === 'selDate'){
            this.setState(
                {
                    selDate: e.target.value
                }
            )
        }else if(target === 'selTime'){
            this.setState(
                {
                    selTime: e.target.value
                }
            )
        }
    }

    render() {
        const {eventInfo} = this.state;
        if (eventInfo === '') return <RenderLoading/>;
        const {event, eventAnswer} = this.props;
        const { phoneCheckMessage, phoneCheckClassName } = this.state;
        const {onRdoValue} = eventAnswer;
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell">
                        <h3>선생님도 충전이 필요해 신청하기</h3>
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
                                readOnly={true}
                                value={event.userName}
                                className="input_sm" />
                        </div>
                        <h2 className="info_tit">
                            <label htmlFor="ipt_school_name">학교정보</label>
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
                                id="ipt_school_name"
                                name="schName"
                                onChange={this.handleChange}
                                value={event.schName}
                                className="input_sm"
                                readOnly={event.userInfo === 'Y'}
                            />
                            {
                                event.userInfo === 'Y' ? 
                                <button
                                    className="input_in_btn btn_gray"
                                    onClick={this.openPopupSchool}>
                                    학교검색
                                </button> : ''
                            }
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
                                className="input_sm"/>
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
                            <label htmlFor="ipt_phone">연락처</label>
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
                            <label htmlFor="ipt_noti">유의사항</label>
                        </h2>
                        <p className="mb25">
                            * 학교 주소 및 수령처를 정확히 기입해주세요.<br />
                            * 잘못 기재된 주소 정보로 인해 반송된 선물은 재발송되지 않습니다.
                        </p>
                        {
                            onRdoValue === '학교로 가는 커피차' &&
                            <div className="addForm pt25">
                                <strong>커피차를 선호하는 날짜, 시간, 장소를 기입해 주세요.<br/>선호 기간 중 하루를 협의하여 진행됩니다.</strong>
                                <h2 className="info_tit mt25">
                                    <label htmlFor="ipt_date">선호 기간</label>
                                </h2>
                                <div className="selectbox select_sm mb25">
                                    <select
                                        name="date"
                                        id="ipt_date"
                                        onChange={this.handleSeletBox.bind(this, 'selDate')}
                                    >
                                        {
                                            this.state.date.map((item, idx) => {
                                                return (
                                                    <option value={item.textVal} selected={item.isSelect}>{item.textVal}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <h2 className="info_tit">
                                    <label htmlFor="ipt_time">선호 시간</label>
                                </h2>
                                <div className="selectbox select_sm mb5">
                                    <select
                                        name="time"
                                        id="ipt_time"
                                        onChange={this.handleSeletBox.bind(this, 'selTime')}
                                    >
                                        {
                                            this.state.time.map((item, idx) => {
                                                return (
                                                    <option value={item.textVal} selected={item.isSelect}>{item.textVal}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <p className="mb25">* 커피차는 2시간 단위로 운영합니다.</p>
                                <h2 className="info_tit">
                                    <label htmlFor="ipt_place">장소</label>
                                </h2>
                                <div className="input_wrap mb5">
                                    <input
                                        type="text"
                                        id="ipt_place"
                                        name="place"
                                        value={event.place}
                                        onChange={this.handleChange}
                                        className="input_sm"/>
                                </div>
                                <p className="mb25">* 운동장, 정문 앞, 후문 앞 등 커피차가 2시간 가량 머물 수 있는 공간을 적어주세요.</p>
                            </div>
                        }

                        <div className="acco_notice_list">
                            <div className="acco_notice_cont mt10">
                                <span className="acco_notice_tit info_tit pb10">개인정보 수집 및 이용동의</span>
                                <ul className="policy">
                                    <li>- 이용목적 : 경품 발송</li>
                                    <li>- 수집하는 개인정보 : 성명, 학교명, 학교 주소, 연락처</li>
                                    <li>- 개인정보 보유 및 이용기간 : 2021년 5월 30일까지<br />(이용목적 달성 시 즉시 파기)</li>
                                    <li>- 수집하는 개인정보의 처리위탁 : 자료 발송을 위해 개인정보(이름/주소/연락처)를 배송업체에 취급 위탁<br />(㈜다우기술 사업자등록번호 : 220-81-02810)</li>
                                </ul>
                                <p className="comt mt10">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                            </div>
                            <div className="checkbox_circle_box mt20">
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
