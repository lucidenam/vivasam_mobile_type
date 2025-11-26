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
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';
import './Event.css';
import * as joinActions from 'store/modules/join';
import FindAddress from 'containers/login/FindAddress';

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
        step1 : '', // step1
        step2 : '', // step2
        step1Length : 0,  // step1 길이
        step2Length : 0,  // step2 길이
        myGrade : '', // 담당학년
        mainSubject : '', // 담당과목
        career : '', // 교사경력
        visangTbYN : '', // 비상교과서 채택여부
        eventAgree : '', // 개인정보 동의여부
        subSubject : 'N', // 비교과
        TAB : '', // 학급 ( E : 초등 / M  : 중등 / H : 고등 )
        arrApplyContent: [false, false, false],
        arrApplyContentNm: ['초등교과', '중고등교과', '비교과콘텐츠'],
        applySubject: '',
        arrMyGrade: [false,false,false,false,false,false]
    };

    componentDidMount(){
        const { eventId } = this.props;
        this.getEventInfo(eventId);
    }

    getEventInfo = async(eventId) => {
        const { history, event, SaemteoActions } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0"){
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId, name, schName, cellphone, mainSubject, myGrade, schZipCd, schAddr} = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.addressDetail = schName;
            event.agree = false;
            event.userInfo = 'Y';
            event.cellphone = cellphone;
            event.agree1 = false;
            event.agree2 = false;
            event.inputType = '개인정보 불러오기';
            // 개인정보 불러올때 핸드폰 번호 검사
            this.phonecheckStart(event.cellphone);
            SaemteoActions.pushValues({type:"event", object:event});

            let arrMyGrade = [false,false,false,false,false,false];
            if(myGrade != ''){
                arrMyGrade[myGrade-1] = true;
            }
            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                mainSubject : mainSubject,
                arrMyGrade: arrMyGrade
            });

            const response2 = await api.eventMemberSchoolInfo({...event});
            this.setState({
                TAB : response2.data.TAB
            });

        } else if(response.data.code && response.data.code === "3"){
            common.info("이미 참여하셨습니다.");
            history.replace(history.location.pathname.replace('apply','view'));
        } else {
            history.push('/saemteo/index');
        }
    };

    handleChange = (e) => {
        const { event, SaemteoActions } = this.props;
        if(e.target.name === 'agree1'){
            event[e.target.name] = e.target.checked;
        }else{
            event[e.target.name] = e.target.value;
        }
        SaemteoActions.pushValues({type:"event", object:event});
    };

    handleUserInfo = (e) => {
        const { eventId, event, SaemteoActions } = this.props;
        if(e.target.value === 'Y'){
            this.setState({arrApplyContent: [false, false, false]})
            this.getEventInfo(eventId);
        }else{

            event.inputType = '직접입력';
            event.schName = '';
            event.schZipCd = '';
            event.schAddr = '';
            event.addressDetail = '';
            this.setState({
                initialSchName: '',
                mainSubject : '' ,
                TAB: '',
                arrMyGrade: [false,false,false,false,false,false],
                arrApplyContent: [false, false, false]
            });
            SaemteoActions.pushValues({type:"event", object:event});
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

    setApplyContent = (index, e) => {
        let arrApplyContent = this.state.arrApplyContent;
        arrApplyContent[index] = !arrApplyContent[index];
        this.setState({arrApplyContent: arrApplyContent});
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

    /* 담당학년 작업 */
    setMyGrade = (index, e) => {
        let arrMyGrade = this.state.arrMyGrade;
        arrMyGrade[index] = !arrMyGrade[index]
        this.setState({
            arrMyGrade : arrMyGrade
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
        }else if(this.state.TAB === ''){
            obj.message = '학교급을 입력해주세요.';
        }else if(event.schZipCd === "" || event.schAddr === ""){
            obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
        }else if(event.addressDetail === ""){
            obj.message = '학교주소를 입력해주세요.';
        }else if(event.cellphone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        }else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(this.state.career === ""){
            obj.message = "선생님의 경력 년 수를 입력해 주세요.";
        }else if(this.state.visangTbYN === ""){
            obj.message = "비상교과서 채택여부를 선택해 주세요.";
        }else if(this.state.step1 === ""){
            obj.message = "지원동기를 입력해주세요.";
        }else if(this.state.step2 === ""){
            obj.message = "개인 활동 내역을 입력해주세요.";
        }else if(event.agree1 === false){
            obj.message = "필수 동의 선택 후 이벤트 신청을 완료해주세요.";
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
        const { event, history, SaemteoActions, eventAnswer, eventId } = this.props;
        let obj = this.validateInfo();
        if(!obj.result){
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        try {
            let mainSubject = this.state.mainSubject;
            if(this.state.TAB === 'E') {
                mainSubject = '';
            }
            if(this.state.TAB != 'E' && mainSubject === '') {
                common.info('내교과를 선택해 주세요.');
                target.disabled = false;
                return false;
            }
            // 담당학년 구분
            let myGrade = '';
            let arrMyGrade = this.state.arrMyGrade;
            let notSelMyGrade = true;
            for(let i=0; i<arrMyGrade.length; i++){
                if(arrMyGrade[i]){
                    notSelMyGrade = false;
                    if(myGrade === ''){
                        myGrade = (i+1);
                    }else{
                        myGrade += ','+(i+1);
                    }
                }
            }
            if(notSelMyGrade){
                common.info('담당 학년을 선택해 주세요.');
                target.disabled = false;
                return false;
            }
            event.eventAnswerDesc  =  event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schZipCd + '/' +event.schAddr + ' ' +event.addressDetail + "/담당 학년 : " +  myGrade + "/내 교과 : ";
            // 과목별 구분
            if(mainSubject == "SC100"){
                event.eventAnswerDesc  += "국어";
            }else if(mainSubject == "SC101"){
                event.eventAnswerDesc  += "영어";
            }else if(mainSubject == "SC102"){
                event.eventAnswerDesc  += "수학";
            }else if(mainSubject == "SC103"){
                event.eventAnswerDesc  += "사회";
            }else if(mainSubject == "SC106"){
                event.eventAnswerDesc  += "역사";
            }else if(mainSubject == "SC107"){
                event.eventAnswerDesc  += "도덕";
            }else if(mainSubject == "SC104"){
                event.eventAnswerDesc  += "과학";
            }else if(mainSubject == "SC105"){
                event.eventAnswerDesc  += "한문";
            }else if(mainSubject == "SC110"){
                event.eventAnswerDesc  += "기술·가정";
            }else if(mainSubject == "SC114"){
                event.eventAnswerDesc  += "정보";
            }else if(mainSubject == "SC108"){
                event.eventAnswerDesc  += "음악";
            }else if(mainSubject == "SC109"){
                event.eventAnswerDesc  += "미술";
            }else if(mainSubject == "SC111"){
                event.eventAnswerDesc  += "체육";
            }else if(mainSubject == "SC112"){
                event.eventAnswerDesc  += "실과";
            }else if(mainSubject == "SC113"){
                event.eventAnswerDesc  += "진로와 직업";
            }else if(mainSubject == "SC199"){
                event.eventAnswerDesc  += "기타";
            }

            event.eventAnswerDesc  +=  "/교사 경력 : " + this.state.career + "/교과서 채택 여부 : " + this.state.visangTbYN;
            // 지원분야
            let arrApplyContent = this.state.arrApplyContent;
            let arrApplyContentNm = this.state.arrApplyContentNm;
            let applySubject = this.state.applySubject;
            if(!arrApplyContent[0] && !arrApplyContent[1] && !arrApplyContent[2]){
                common.info('모니터링단 지원 분야를 선택해 주세요.');
                target.disabled = false;
                return false;
            }
            if(arrApplyContent[0] && applySubject === ''){
                common.info('초등 교과 지원 과목을 선택해 주세요.');
                target.disabled = false;
                return false;
            }
            let applyContentNm = '';
            for(let i=0; i<arrApplyContent.length; i++){
                if(arrApplyContent[i]){
                    if(applyContentNm === ''){
                        if(i===0){
                            applyContentNm = arrApplyContentNm[i]+'-'+applySubject;
                        }else{
                            applyContentNm += arrApplyContentNm[i]
                        }
                    }else{
                        applyContentNm += ','+arrApplyContentNm[i]
                    }
                }
            }
            event.eventAnswerDesc  += "/지원 분야 : " + applyContentNm

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

    // 비교과 설정
    setSubSubject  = (e) => {
        this.setState({
            subSubject : e.target.value
        });
    };

    //신청
    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions , eventAnswer, eventId } = this.props;

        try {
            BaseActions.openLoading();
            event.eventId = eventId;
            event.eventAnswerDesc2 = this.state.step1+'^||^'+this.state.step2;
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 참여하셨습니다.");
            }else if(response.data.code === '0'){
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

    selectSchTab = async (e) => {
        this.setState({
            TAB: e.target.value,
            arrMyGrade: [false,false,false,false,false,false],
            arrApplyContent: [false, false, false]
        });
    }

    setApplySubject = async (e) => {
        this.setState({applySubject: e.target.value});
    }

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
                        <h3>비바샘 모니터링단 8기 모집</h3>
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
                            <label htmlFor="ipt_school">재직 학교</label>
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
                                    <label htmlFor="userInfoY">정보 불러오기</label>
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
                        <div className="combo_box type1 mb10" style={{ display: event.userInfo === 'N' ? 'block' : 'none' }}>
                            <div className="selectbox select_sm">
                                <select name="schoolField" id="ipt_school_field" onChange={this.selectSchTab}>
                                    <option value="" selected={this.state.TAB === ''} disabled hidden>학교급을 선택해주세요</option>
                                    <option value="E" selected={this.state.TAB === 'E'}>초등학교</option>
                                    <option value="M" selected={this.state.TAB === 'M'}>중학교</option>
                                    <option value="H" selected={this.state.TAB === 'H'}>고등학교</option>
                                </select>
                            </div>
                        </div>
                        <div className="input_wrap mb25">
                            <input
                                type="text"
                                placeholder="학교명을 입력하세요"
                                id="ipt_school"
                                name="schName"
                                onChange={this.handleChange}
                                value={event.schName}
                                className="input_sm"
                            />
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
                                            checked={this.state.arrMyGrade[0]}
                                            onChange={this.setMyGrade.bind(this, 0)} />
                                        <label htmlFor="g01">1학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g02"
                                            name="grade"
                                            value="2"
                                            checked={this.state.arrMyGrade[1]}
                                            onChange={this.setMyGrade.bind(this, 1)}/>
                                        <label htmlFor="g02">2학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g03"
                                            name="grade"
                                            value="3"
                                            checked={this.state.arrMyGrade[2]}
                                            onChange={this.setMyGrade.bind(this, 2)}/>
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
                                            checked={this.state.arrMyGrade[0]}
                                            onChange={this.setMyGrade.bind(this, 0)} />
                                        <label htmlFor="g01">1학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g02"
                                            name="grade"
                                            value="2"
                                            checked={this.state.arrMyGrade[1]}
                                            onChange={this.setMyGrade.bind(this, 1)}/>
                                        <label htmlFor="g02">2학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g03"
                                            name="grade"
                                            value="3"
                                            checked={this.state.arrMyGrade[2]}
                                            onChange={this.setMyGrade.bind(this, 2)}/>
                                        <label htmlFor="g03">3학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g04"
                                            name="grade"
                                            value="4"
                                            checked={this.state.arrMyGrade[3]}
                                            onChange={this.setMyGrade.bind(this, 3)} />
                                        <label htmlFor="g04">4학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g05"
                                            name="grade"
                                            value="5"
                                            checked={this.state.arrMyGrade[4]}
                                            onChange={this.setMyGrade.bind(this, 4)}/>
                                        <label htmlFor="g05">5학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{width:'33%'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g06"
                                            name="grade"
                                            value="6"
                                            checked={this.state.arrMyGrade[5]}
                                            onChange={this.setMyGrade.bind(this, 5)}/>
                                        <label htmlFor="g06">6학년</label>
                                    </li>
                                </ul>
                            </div>
                        }
                        {
                            (this.state.TAB != 'E') &&  /* 중등 , 고등 */
                            <h2 className="info_tit mt25">
                                <label htmlFor="ipt_subject">내 교과</label>
                            </h2>
                        }
                        { /* 부분 렌더링 예시 */
                            (this.state.TAB != 'E') &&  /* 중등 , 고등 */
                            <div className="combo_box type1 mb25">
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
                            </div>
                        }

                        <h2 className="info_tit mt25">
                            <label htmlFor="ipt_career">교사 경력</label>
                        </h2>
                        <div className="combo_box dual">
                            <div className="input_wrap">
                                <input
                                    onChange={this.setCareer}
                                    type="number"
                                    id="ipt_career"
                                    name="career"
                                    maxLength="2"
                                    value={this.state.career}
                                    className="input_sm" />
                                <span className="label_txt">년</span>
                            </div>
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
                        <h2 className="info_tit mt25">
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
                        <h2 className="info_tit mt25">
                            <label htmlFor="applyContent">지원 분야</label>
                        </h2>
                        <div className="input_wrap mb15">
                            <ul className="subject_field_list mb15">
                                <li>
                                    <input
                                        id="subjectField01"
                                        type="checkbox"
                                        className="checkbox"
                                        name="subjectField"
                                        checked={this.state.arrApplyContent[0]}
                                        onChange={this.setApplyContent.bind(this, 0)}
                                        disabled={this.state.TAB != 'E'}
                                        />
                                    <label htmlFor="subjectField01"><span>초등 교과</span> -</label>
                                    <ul>
                                        <li>
                                            <input
                                                id="subjectE04"
                                                type="radio"
                                                className="checkbox_circle"
                                                name="subjectE"
                                                disabled={this.state.arrApplyContent[0] === false}
                                                checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '국어':false}
                                                value={'국어'}
                                                onChange={this.setApplySubject}
                                            />
                                            <label htmlFor="subjectE04">국어</label>
                                        </li>
                                        <li>
                                            <input
                                            id="subjectE01"
                                            type="radio"
                                            className="checkbox_circle"
                                            name="subjectE"
                                            disabled={this.state.arrApplyContent[0] === false}
                                            checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '수학':false}
                                            value={'수학'}
                                            onChange={this.setApplySubject}
                                            />
                                            <label htmlFor="subjectE01">수학</label>
                                        </li>
                                        <li>
                                            <input
                                            id="subjectE02"
                                            type="radio"
                                            className="checkbox_circle"
                                            name="subjectE"
                                            disabled={this.state.arrApplyContent[0] === false}
                                            checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '사회':false}
                                            value={'사회'}
                                            onChange={this.setApplySubject}
                                            />
                                            <label htmlFor="subjectE02">사회</label>
                                        </li>
                                        <li>
                                            <input
                                            id="subjectE03"
                                            type="radio"
                                            className="checkbox_circle"
                                            name="subjectE"
                                            disabled={this.state.arrApplyContent[0] === false}
                                            checked={this.state.arrApplyContent[0] === true ? this.state.applySubject === '과학':false}
                                            value={'과학'}
                                            onChange={this.setApplySubject}
                                            />
                                            <label htmlFor="subjectE03">과학</label>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <input
                                        id="subjectField02"
                                        type="checkbox"
                                        className="checkbox"
                                        name="subjectField"
                                        checked={this.state.arrApplyContent[1]}
                                        onChange={this.setApplyContent.bind(this, 1)}
                                        disabled={this.state.TAB === 'E'}
                                        />
                                    <label htmlFor="subjectField02"><span>중 · 고등 교과</span> - 전과목</label>
                                </li>
                                <li>
                                    <input
                                        id="subjectField03"
                                        type="checkbox"
                                        className="checkbox"
                                        name="subjectField"
                                        checked={this.state.arrApplyContent[2]}
                                        onChange={this.setApplyContent.bind(this, 2)}
                                        />
                                    <label htmlFor="subjectField03"><span>비교과 콘텐츠</span> - 수업 혁신, 진로/진학, 체험활동</label>
                                </li>
                            </ul>
                            <span className="pointColor">* 초·중·고 교과와 비교과 콘텐츠를 중복 지원할 수 있습니다.</span>
                        </div>
                        <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyContent1">지원 동기 (200자 이내)</label>
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
                                className="textarea"></textarea>
                            <div className="count_wrap mb25">
                                <p className="count">(<span>{this.state.step1Length}</span>/200)</p>
                            </div>
                        </div>
                        <h2 className="info_tit mt25 txt_ls">
                            <label htmlFor="applyContent2">개인 활동 내역 (500자 이내)</label>
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
                                className="textarea"></textarea>
                            <div className="count_wrap mb25">
                                <p className="count">(<span>{this.state.step2Length}</span>/500)</p>
                            </div>
                        </div>
                        <div className="acco_notice_list">
                            <div className="acco_notice_cont mt10">
                                <span className="acco_notice_tit info_tit pb10">개인정보 수집 및 이용동의</span>
                                <ul className="policy">
                                    <li>- 이용목적 : 이벤트 참여 확인</li>
                                    <li>- 수집하는 개인정보 : 성명, 학교명, 학교 주소, 연락처</li>
                                    <li>- 개인정보 보유 및 이용기간 : 2021년 03월 31일까지 <br/>(이용목적 달성 시 즉시 파기)</li>
                                    <li>- 수집하는 개인정보의 취급위탁 : 개인정보(이름/주소/연락처)를 배송업체에 취급 위탁<br />(㈜한진 사업자등록번호:201-81-02823)</li>
                                </ul>
                                <p className="comt mt10">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.</p>
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
                                        본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                            <div className="form_info_list mt20">
                                <ul>
                                    <li>위 항목을 모두 입력하셔야 지원이 가능합니다.</li>
                                    <li>개인정보가 불분명한 경우 선발 명단에서 제외될 수 있습니다. 개인정보는 꼭 확인해주세요.</li>
                                    <li>작성하신 내용은 지원 후 수정/삭제가 불가합니다.</li>
                                </ul>
                            </div>
                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on2 mt20">신청 완료</button>
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
        JoinActions: bindActionCreators(joinActions, dispatch),
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
