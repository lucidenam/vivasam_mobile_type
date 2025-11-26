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
        isAnotherEmailDomain : '', // ( 0 : 직접입력 X / 1 : 직접 입력 )
        applyContent : '',
        contentLength : 0,
        chkContents: [false, false, false, false]
    };

    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventId == null) ||  (typeof eventId == "undefined")){
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
        const { telephoneCheck, applyContent, chkContents } = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        let obj = { result : false , message : ''};
        if(!event.userName){
            obj.message = '성명을 입력해주세요.';
        }else if(!reg_name.test(event.userName)) {
            obj.message = '올바른 성명 형식이 아닙니다.';
        }else if((this.state.eMailDomain === "") || (this.state.anotherEmailDomain === "")){
            obj.message = '이메일 주소를 입력해주세요.';
        }else if(event.telephone === ""){
            obj.message = '연락처를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '연락처를 입력해주세요.';
        }else if(!event.agree1){
            obj.message = '필수 유의 사항 및 동의 사항에 체크해 주세요.';
        }else if(!event.agree2){
            obj.message = '필수 유의 사항 및 동의 사항에 체크해 주세요.';
        }else if(applyContent.trim() === ''){
            obj.message = '신청 사유를 입력해 주세요.';
        }else if(!chkContents[0] && !chkContents[1] && !chkContents[2] && !chkContents[3]){
            obj.message = '신청 회차 및 코스를 선택해 주세요.';
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
        try {
            let chkContents = this.state.chkContents;
            let strChkContent = '';
            for(let i=0; i<chkContents.length; i++){
                if(chkContents[i]){
                    strChkContent += (i+1)+',';
                }
            }

            let email = this.state.eMailDomain+'@'+this.state.anotherEmailDomain;

            event.eventAnswerDesc = email+'/' +event.cellphone + '/신청번호 : '+ strChkContent + '/신청사유 : ' +this.state.applyContent;
            SaemteoActions.pushValues({type:"event", object:event});
            // 신청 처리
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
        const { event, history, SaemteoActions, PopupActions, BaseActions , eventAnswer, eventId } = this.props;

        try {
            BaseActions.openLoading();
            event.eventId = eventId;
            event.eventAnswerDesc2 = this.state.applyContent;
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청 하셨습니다.");
            }else if(response.data.code === '0'){
                common.info("신청이 완료 되었습니다.\n당첨자는 12월 28일에 비바샘\n공지사항을 통해 발표합니다.");
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
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

    setApplyContent = (e) => {
        if(e.target.value.length > 200){
            //common.info("200자 이내로 입력해 주세요.");
        }else{
            this.setState({
                contentLength: e.target.value.length,
                applyContent: e.target.value
            });
        }
    };

    onChkContent = (e) => {
        let chkContents = this.state.chkContents;
        let val = e.target.value;
        let isChk = e.target.checked;

        if(isChk){
            if(val == '1'){
                if(chkContents[2]){
                    common.info('동일한 코스는 중복 신청 불가능 합니다.');
                    return false;
                }
            }else if(val == '2'){
                if(chkContents[3]){
                    common.info('동일한 코스는 중복 신청 불가능 합니다.');
                    return false;
                }
            }else if(val == '3'){
                if(chkContents[0]){
                    common.info('동일한 코스는 중복 신청 불가능 합니다.');
                    return false;
                }
            }else if(val == '4'){
                if(chkContents[1]){
                    common.info('동일한 코스는 중복 신청 불가능 합니다.');
                    return false;
                }
            }
            chkContents[val-1] = true;
            this.setState({chkContents: chkContents})
        }else{
            chkContents[val-1] = false;
            this.setState({chkContents: chkContents})
        }
    }

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
                    <div className="applyDtl_cell pick">
                        <h3>재우쌤과 함께하는 한양도성 순성 놀이</h3>
                        <p>당첨 시 관련 안내 연락을 받을 수 있는<br />휴대전화번호와 이메일 주소를 꼭 확인해 주세요.</p>
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
                                readOnly={true}
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
                        <div className="input_wrap mb15">
                            <input
                                type="tel"
                                placeholder="연락처를 입력하세요 (예 : 010-2345-6789)"
                                id="ipt_phone"
                                name="cellphone"
                                onChange={this.phonecheck}
                                value={event.cellphone}
                                maxLength="13"
                                className="input_sm mb5" />
                            <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                        </div>
                        <h2 className="info_tit">
                            신청 날짜
                        </h2>
                        <div className="tblWrap">
                            <table>
                                <colgroup>
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: 'auto' }} />
                                </colgroup>
                                <thead>
                                    <th scope="col">선택</th>
                                    <th scope="col">회차</th>
                                    <th scope="col">일정</th>
                                    <th scope="col">코스</th>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="checkbox_circle_box">
                                                <input
                                                    type="checkbox"
                                                    name="dateChk"
                                                    id="dateChk01"
                                                    checked={this.state.chkContents[0]}
                                                    onChange={this.onChkContent}
                                                    value={'1'}
                                                    className="checkbox_circle checkbox_circle_rel" />
                                                <label
                                                    htmlFor="dateChk01"
                                                    className="checkbox_circle_simple">
                                                </label>
                                            </div>
                                        </td>
                                        <td>1</td>
                                        <td>1. 14 (목) 10:00 ~ 14:00</td>
                                        <td className="ta_l"><em>남산 구간 – 흥인지문 구간 – 낙산 구간</em><br />숭례문 - 남산 - 흥인지문 - 낙산공원 - 혜화문</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="checkbox_circle_box">
                                                <input
                                                    type="checkbox"
                                                    name="dateChk"
                                                    id="dateChk02"
                                                    checked={this.state.chkContents[1]}
                                                    onChange={this.onChkContent}
                                                    value={'2'}
                                                    className="checkbox_circle checkbox_circle_rel" />
                                                <label
                                                    htmlFor="dateChk02"
                                                    className="checkbox_circle_simple">
                                                </label>
                                            </div>
                                        </td>
                                        <td>2</td>
                                        <td>1. 15 (금) 10:00 ~ 13:00</td>
                                        <td className="ta_l"><em>백악 구간</em><br />혜화문   숙정문   윤동주 문학관   서촌</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="checkbox_circle_box">
                                                <input
                                                    type="checkbox"
                                                    name="dateChk"
                                                    id="dateChk03"
                                                    checked={this.state.chkContents[2]}
                                                    onChange={this.onChkContent}
                                                    value={'3'}
                                                    className="checkbox_circle checkbox_circle_rel" />
                                                <label
                                                    htmlFor="dateChk03"
                                                    className="checkbox_circle_simple">
                                                </label>
                                            </div>
                                        </td>
                                        <td>3</td>
                                        <td>2. 4 (목) 10:00 ~ 14:00</td>
                                        <td className="ta_l"><em>남산 구간 – 흥인지문 구간 – 낙산 구간</em><br />숭례문 - 남산 - 흥인지문 - 낙산공원 - 혜화문</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="checkbox_circle_box">
                                                <input
                                                    type="checkbox"
                                                    name="dateChk"
                                                    id="dateChk04"
                                                    checked={this.state.chkContents[3]}
                                                    onChange={this.onChkContent}
                                                    value={'4'}
                                                    className="checkbox_circle checkbox_circle_rel" />
                                                <label
                                                    htmlFor="dateChk04"
                                                    className="checkbox_circle_simple">
                                                </label>
                                            </div>
                                        </td>
                                        <td>4</td>
                                        <td>2. 5 (금) 10:00 ~ 13:00</td>
                                        <td className="ta_l"><em>백악 구간</em><br />혜화문   숙정문   윤동주 문학관   서촌</td>
                                    </tr>
                                </tbody>
                            </table>
                            <span>* 각각 다른 코스로 최대 2회 신청 가능합니다.</span>
                        </div>
                        <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyTextarea">신청 사유</label>
                        </h2>
	                    <div className="input_wrap">
	                        <textarea
	                            name="applyTextarea"
	                            id="applyTextarea"
	                            cols="1"
	                            rows="10"
	                            maxLength="200"
                                value={this.state.applyContent}
                                onChange={this.setApplyContent}
	                            placeholder="신청 사유를 200자 이내로 남겨주세요."
	                            className="textarea">
	                        </textarea>
	                        <div className="count_wrap mb25">
	                            <p className="count"><span>{this.state.contentLength}</span>/200</p>
	                        </div>
	                    </div>
                        <div className="acco_notice_list pb20">
                            <div className="acco_notice_cont mt10">
                                <span className="acco_notice_tit info_tit pb10">
                                    ◆ 개인정보 수집 및 이용동의
                                </span>
                                <ul class="policy">
	                                <li>- 이용목적 : 재우쌤과 함께하는 한양도성 순성놀이 당첨자 연락 및 CS 문의 응대</li>
                                    <li>- 수집하는 개인정보 : 성명, 이메일, 연락처</li>
                                    <li>- 개인정보 보유 및 이용기간 : 2021년 2월 28일까지 <br/>(이용목적 달성 시 즉시 파기)</li>
                                </ul>
                                <p className="comt mt10">* 선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
                            </div>
                            <div className="checkbox_circle_box mt20">
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
                                        본인은 개인정보 수집 및 이용 내역을 확인하였으며,<br />이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <div className="acco_notice_list pb20">
                            <div className="acco_notice_cont mt10">
                                <ul class="policy">
	                                <li>- 한양도성 순성 놀이는 <strong>산행을 동반한 트래킹 활동</strong>입니다.<br />코스 상세보기에서 반드시 해당 구간을 확인해주세요.</li>
                                    <li>- 당일 <strong>날씨 및 노면 상황에 따라 코스가 변경</strong>될 수 있으며, <strong>활동 시간도 조율</strong>될 수 있습니다.</li>
                                    <li>- 코로나19로 사회적 거리 두기 단계가 격상될 시에는 행사가 취소될 수 있습니다.</li>
                                    <li>- 다른 선생님께 <strong>당첨 기회를 양도하실 수 없으며, 동반인 동행은 불가능</strong>합니다.</li>
                                    <li>- 한정된 인원으로 진행되므로 당일 참석 가능 여부를 꼭 확인해주세요.</li>
                                    <li>- 당첨 후에는 회차 변경이 불가능하며, 취소자가 생길 경우 추가 선정하여 개별 연락드립니다.</li>
                                </ul>
                            </div>
                            <div className="checkbox_circle_box mt20">
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
                                        유의사항 5가지를 모두 확인하였습니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on2 mt20">신청하기</button>
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
