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
        eventInfo:'',
        phoneCheckMessage: '',
        phoneCheckClassName: '',
        telephoneCheck: false,
        /* 해당 이벤트에 추가 */
        isSetMemberCount : '', // 참가 신청 인원
        step1 : '', // step1
        step2 : '', // step2
        step3 : '', // step3
        step2Length : 0,   // step2 길이
        step3Length : 0    // step3 길이
    };

    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        // 응답 문항이 제대로 넘어오지 않거나, EventId를 실수로 Null로 날릴경우 이전 화면으로.
        if((eventAnswer.eventAnswerContent.Q1 == null) && (eventId == null)){
            common.error("응답 문항이 제대로 작성되지 않으셨습니다.");
            history.push('/saemteo/event/view/250');
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
            let {memberId, name, schName, schZipCd, schAddr, cellphone } = response.data.memberInfo;
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

    // 내용 입력
    // 댓글 수정 시 길이 연동 및 이벤트 내용 수정
    setApplyContent1 = (e) => {
        if(e.target.value.length > 20){
            common.info("20자 이내로 입력해 주세요.");
        }else{
            this.setState({
                step1: e.target.value
            });
        }
    };

    setApplyContent2 = (e) => {
        if(e.target.value.length > 300){
            common.info("300자 이내로 입력해 주세요.");
        }else{
            this.setState({
                step2Length: e.target.value.length,
                step2: e.target.value
            });
        }

    };

    setApplyContent3 = (e) => {
        if(e.target.value.length > 200) {
            common.info("200자 이내로 입력해 주세요.");
        }else{
            this.setState({
                step3Length: e.target.value.length,
                step3: e.target.value
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
            obj.message = '학교명를 입력해주세요.';
        }else if(event.cellphone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        } else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(this.state.step1 === ""){
            obj.message = "'역사 속 인물' 을 입력해주세요.";
        }else if(this.state.step2 === ""){
            obj.message = "'인물이 남긴 명언, 또는 작품 속 글귀' 를 입력해주세요.";
        }else if(this.state.step3 === ""){
            obj.message = "'추천 이유' 를 입력해주세요.";
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

        try { // 응답 제출
            event.eventAnswerDesc = event.userName + '|INFO|' +event.schName + '|INFO|' +event.cellphone;
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
                event.eventAnswerDesc = this.state.step1 + '|STEP|' +this.state.step2 + '|STEP|' +this.state.step3;
                event.eventAnswerSeq = 2;
                response = await SaemteoActions.setEventJoinAnswerAddInsert({...event});
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

    // Option 날짜 선택 ( 수령 희망일 )
    selectDate = () => {
        let indents = [];
        for (let i = 1; i < 31; i++) {
            indents.push(<option value={i}>{i}일</option>);
        }
        return indents;
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
                        <h3 className="ta_c">선생님과 함께 만드는 역사의 힘</h3>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <div className="vivasamter_applyDtl">
                        <h2 className="info_tit">
                            <label htmlFor="ipt_name">참여자 정보</label>
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
                        <div className="input_wrap mt5">
                            <input
                                type="text"
                                placeholder="학교명을 입력하세요"
                                name="schName"
                                onChange={this.handleChange}
                                value={event.schName}
                                className="input_sm type2"
                                />
                            {
                                /* <button
                                    className="input_in_btn btn_gray"
                                    onClick={this.openPopupSchool}
                                >학교검색
                                </button> */
                            }
                        </div>
                        <div className="input_wrap mt5">
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
	                    	
	                    <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyContent">STEP 1. 추천하고 싶은 <em className="alert_em">역사 속 인물</em>을 꼽아주세요.</label>
	                    </h2>
                        <div className="input_wrap">
                            <input
                                type="text"
                                maxLength="20"
                                name="step1"
                                value={this.state.step1}
                                onChange={this.setApplyContent1}
                                className="input_sm type2" />
                        </div>

                        <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyContent2">STEP 2. <em className="alert_em">인물이 남긴 명언, 또는 작품 속 글귀</em>를 적어주세요.<br /><span className="txt_dsc">(한국사, 세계사 속 인물의 명언 및 문학 작품 중 일부 구절도 가능합니다.)</span></label>
                        </h2>
	                    <div className="input_wrap">
	                        <textarea
	                            name="applyContent2"
	                            id="applyContent2"
	                            cols="1"
	                            rows="10"
	                            maxLength="300"
	                            value={this.state.step2}
	                            onChange={this.setApplyContent2}
	                            placeholder="300자 까지 입력하실 수 있습니다."
	                            className="textarea">
	                        </textarea>
	                        <div className="count_wrap mb25">
	                            <p className="count">(<span>{this.state.step2Length}</span>/300)</p>
	                        </div>
	                    </div>

                        <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyContent3">STEP 3. 위인, 또는 작품의 <em className="alert_em">추천이유</em>를 알려주세요.</label>
                        </h2>
                        <div className="input_wrap">
	                        <textarea
                                name="applyContent3"
                                id="applyContent3"
                                cols="1"
                                rows="10"
                                maxLength="200"
                                value={this.state.step3}
                                onChange={this.setApplyContent3}
                                placeholder="200자 까지 입력하실 수 있습니다."
                                className="textarea">
	                        </textarea>
                            <div className="count_wrap mb25">
                                <p className="count">(<span>{this.state.step3Length}</span>/200)</p>
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
