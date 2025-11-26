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
        /* 해당 이벤트에 추가 */
        isSetMemberCount : '', // 참가 신청 인원
        eventSetDate : '', // 0 : 날짜선택 / 1 : 미정
        eventMonth : '', // 선택월
        eventDate : '', // 선택날짜
        eventContents : '', // 이벤트 신청 내용 ( 꿈 명함 이유 )
        eventLength : 0 // 이벤트 신청 길이
    };

    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        // 응답 문항이 제대로 넘어오지 않거나, EventId를 실수로 Null로 날릴경우 이전 화면으로.
        if((eventAnswer.eventAnswerContent.Q1 == null) && (eventId == null)){
            common.error("응답 문항이 제대로 작성되지 않으셨습니다.");
            history.push('/saemteo/event/view/247');
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
            event.inputType = '개인정보 불러오기';
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

    /* 수령 희망일 선택 시작 */

    setEventDate  = (e) => {
        this.setState({
            eventSetDate : e.target.value
        });
        if(e.target.value === "1"){
            this.setEventMonthDayReset();
        }
    };

    setEventMonthDayReset = () => {
        this.setState({
            eventMonth : "",
            eventDate : ""
        })
    };

    // 월 설정
    setEventMonth = (e) => {
        this.setState({
            eventMonth : e.target.value
        });
    };

    // 날짜 설정
    setEventDay = (e) => {
        this.setState({
            eventDate : e.target.value
        });
    };


    /* 수령 희망일 선택 끝 */

    // 내용 입력
    // 댓글 수정 시 길이 연동 및 이벤트 내용 수정
    setApplyContent = (e) => {
        if(e.target.value.length > 200) common.info("200자 이내로 입력해 주세요.");
        this.setState({
            eventLength: e.target.value.length,
            eventContents: e.target.value
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
            obj.message = '배송지를 입력해주세요.';
        } else if(event.schZipCd === "" || event.schAddr === ""){
            obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
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
        }else if(this.state.isSetMemberCount === "" || this.state.isSetMemberCount === "0"){
            obj.message = '이벤트 참여 인원을 입력해 주세요.';
        }else if(this.state.eventSetDate === ""){
            obj.message = '간식 파티를 열고 싶은 날짜를 지정해 주세요.';
        }else if(this.state.eventSetDate === "0" && (this.state.eventMonth === "" || this.state.eventDate === "" )){
            obj.message = '간식 파티를 열고 싶은 날짜를 지정해 주세요.';
        }else if(this.state.eventSetDate === "0" && (this.state.eventMonth === "6" && parseInt(this.state.eventDate) < 24)){
            obj.message = '간식 파티는 6월 24일부터 7월 19일 평일 중 선택 가능합니다.';
        }else if(this.state.eventSetDate === "0" && (this.state.eventMonth === "7" && parseInt(this.state.eventDate) > 19)){
            obj.message = '간식 파티는 6월 24일부터 7월 19일 평일 중 선택 가능합니다.';
        }else {
            // 요일 지정 및 내용 검사
            let eventWeek = new Date();
            eventWeek.setMonth(parseInt(this.state.eventMonth) - 1);
            eventWeek.setDate(parseInt(this.state.eventDate));
            eventWeek = eventWeek.getDay();
            if(eventWeek.toString() === "0" || eventWeek.toString() === "6"){
                obj.message = '간식 파티는 6월 24일부터 7월 19일 평일 중 선택 가능합니다.';
            }else{
                if(this.state.eventContents === ""){
                    obj.message = '학생들에게 간식파티를 열어 주고 싶은 이유를 적어주세요.';
                }else{
                    obj.result = true;
                }
            }
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

        let receive = event.receive;
        if(event.receive === "교실"){
            receive = event.receiveGrade+'학년 ' + event.receiveClass+'반'
        }else if(event.receive === "기타"){
            receive = event.receiveEtc
        }
        // 날짜 설정
        let eventDate = "";
        if(this.state.eventSetDate === "1"){
            eventDate = "미정";
        }else{
            eventDate = this.state.eventMonth + "월" + this.state.eventDate + "일";
        }
        try { // 응답 제출
            event.eventAnswerDesc = event.inputType + '/' +event.schName + '/' +event.cellphone + '/' +event.schAddr  + '/수령처 : ' + receive + "/인원 : " + this.state.isSetMemberCount +  "/날짜 :" + eventDate + "/신청 이유 : " + this.state.eventContents;
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
                event.eventAnswerDesc = this.state.eventContents; // 질문 응답 ( 해당되는 JSON의 Key를 이용해 Value를 가져온다. )
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
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell">
                        <h3>우리 반 간식 파티</h3>
                        <p>비바샘이 특별한 추억을 만들어줄 달콤한 간식을 선물해 드립니다.</p>
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
                                placeholder="학교명을 입력하세요"
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
                        <h2 className="info_tit">
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
	                        <label htmlFor="">인원</label>
	                    </h2>
	                    <div className="input_wrap mb25">
                            <input
                                type="number"
                                name="personnel"
                                value={this.state.isSetMemberCount}
                                onChange={this.setMemberCount}
                                className="input_sm"/>
	                        <span className="input_fix_txt">명</span>
	                    </div>
                        <h2 className="info_tit">
	                        <label htmlFor="">수령 희망일</label>
	                    </h2>
                        <div className="input_wrap">
	                    	<ul className="sel_chk_wrap">
	                    		<li className="w75">
		                    		<input
			                        id="lb_sel_day1"
			                        type="radio"
			                        className="checkbox_circle"
			                        name="lb_sel_day"
			                        value="0"
                                    checked={this.state.eventSetDate === '0'}
			                        onChange={this.setEventDate}
			                        />
			                        <label htmlFor="lb_sel_day1"><span className="blind">날짜 선택</span></label>
			                        <div className="selectbox select_sm">
						                <select
					                        name="lb_sel_month"
					                        id="lb_sel_month"
                                            onChange={this.setEventMonth}
					                        >
					                        <option value=""  selected={this.state.eventMonth === ''}>월</option>
                                            <option value="6">6월</option>
                                            <option value="7">7월</option>
					                    </select>
					                </div>
					                <div className="selectbox select_sm">
					                    <select
					                        name="lb_sel_day"
					                        id="lb_sel_day"
                                            onChange={this.setEventDay}
					                        >
					                        <option value="" selected={this.state.eventDate === ''}>일</option>
                                            {this.selectDate()}
					                    </select>
					                </div>
	                    		</li>
	                    		<li className="w25">
		                    		<input
				                        id="lb_sel_day2"
				                        type="radio"
				                        className="checkbox_circle"
				                        name="lb_sel_day"
                                        value="1"
                                        checked={this.state.eventSetDate === '1'}
                                        onChange={this.setEventDate}
				                        />
				                    <label htmlFor="lb_sel_day2">미정</label>
	                    		</li>
	                    	</ul>
	                    </div>
	                    <p className="footnote">
		                    <em>
		                    	<strong>* 간식 파티를 열고 싶은 날짜를 지정해 주세요.</strong><br /> 
		                    	6월 24일부터 7월 19일까지 평일 중 선택 가능하며 <br />
		                    	선정되신 선생님께는 배송 일정 안내를 위해 개별 연락 드립니다.
	                    	</em>
	                    </p>
	                    	
	                    <h2 className="info_tit txt_ls">
	                        <label htmlFor="">학생들에게 간식파티를 열어 주고 싶은 이유를 적어주세요.</label>
	                    </h2>
	                    <div className="input_wrap">
	                        <textarea
	                            name="applyContent"
	                            id="applyContent"
	                            cols="1"
	                            rows="10"
	                            maxLength="200"
	                            value={this.state.eventContents}
	                            onChange={this.setApplyContent}
	                            placeholder="200자 까지 입력하실 수 있습니다."
	                            className="textarea">
	                        </textarea>
	                        <div className="count_wrap mb25">
	                            <p className="count">(<span>{this.state.eventLength}</span>/200)</p>
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
