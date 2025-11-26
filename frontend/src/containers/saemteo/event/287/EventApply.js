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
        amount: 1,
        /* 이메일 부분 추가 */
        eMailDomain : '', // Email Domain ( email ID )
        anotherEmailDomain : '', // Email Back Domain ( gmail.com / naver.com ... )
        isAnotherEmailDomain : '' // ( 0 : 직접입력 X / 1 : 직접 입력 )
    };

    componentDidMount(){
        const {eventId , history } = this.props;
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventId == null) || (typeof eventId == "undefined")){
            common.error("응답 문항이 제대로 작성되지 않으셨습니다.");
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
            let {memberId, name, email, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.agree = false;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.inputType = '개인정보 불러오기';
            event.userInfo = 'Y';
            event.cellphone = cellphone;
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

    // 수량 입력
    setApplyContent1 = (e) => {
        if(e.target.value != '' && e.target.value == '0'){
            common.info("최소 1권 이상 신청해 주세요.");
            this.setState({
                amount: 1
            });
        } else if(e.target.value > 30){
            common.info("30권 까지만 신청 가능합니다.");
            this.setState({
                amount: 30
            });
        }else{
            this.setState({
                amount: e.target.value
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
        }else if(event.cellphone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(this.state.amount == ""){
            obj.message = "스터디플래너 수량을 입력해주세요.";
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

    applyButtonClick = async(target) => {
        target.disabled = true;
        const { event, eventId, SaemteoActions } = this.props;
        let obj = this.validateInfo();
        event.eventId = eventId; // 이벤트 ID
        event.eventType = "1"; // 수량 제한시 Type 변경
        let response = await SaemteoActions.chkEventJoinQntCnt({...event});
        let response2 = await api.eventCheckLimitAmount({...event});
        let chkQntCnt = response2.data.eventTotCnt - response.data.qntCnt;
        if(chkQntCnt < this.state.amount){ // 해당된 수량만큼 제한
            common.error("신청가능 잔여 수량은 "+chkQntCnt+"권 입니다.");
            target.disabled = false;
            return false;
        }
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
            event.amount = this.state.amount;
            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + '/' +event.addressDetail + '/수령처 : ' + receive + '/수량 : '
                + event.amount;
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
            let response = await SaemteoActions.insertAmountEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
                history.goBack();
                //response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
            }else if(response.data.code === '0'){
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
            }else if(response.data.code === '4'){
                common.error("스터디 플래너 준비된 수량이 마감되었습니다.");
                history.goBack();
            }else{
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
                history.goBack();
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
                        <h3>2020 스터디 플래너 신청하기</h3>
                        <p>학생 스스로 채워갈 수 있는 2020년 스터디 플래너를 학교로 보내드립니다.</p>
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
                                className="input_sm mb5"
                                value={event.cellphone} />
                            <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
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
                            <label htmlFor="ipt_receive">수량</label>
                        </h2>
                        <div className="input_wrap mb25">
                            <input
                                type="number"
                                id="ipt_quantity"
                                name="amount"
                                value={this.state.amount}
                                onChange={this.setApplyContent1}
                                maxLength="2"
                                className="input_sm"/>
                        </div>

                        <div className="acco_notice_list">
                            <a href="#" className="acco_notice_link active">
                                <span className="acco_notice_tit info_tit pb0">
                                    개인정보 수집 및 이용동의
                                </span>
                            </a>
                            <div className="acco_notice_cont mt10">
                                <ul className="policy">
                                    <li>- 이용목적 : 2020 스터디 플래너 경품 배송 및 고객문의 응대</li>
                                    <li>- 수집하는 개인정보 : 성명, 휴대전화번호, 이메일, 재직 정보 등</li>
                                    <li>- 개인정보 보유 및 이용기간 : 경품 배송 종료 시까지 (이용목적 달성 시 즉시 파기)</li>
                                </ul>
                                <p className="comt mt10">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
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
