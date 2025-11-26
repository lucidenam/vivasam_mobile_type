import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import RenderLoading from 'components/common/RenderLoading';
import FindAddress from 'containers/login/FindAddress';
import EventFindSchool from "containers/saemteo/EventFindSchool";

class AddCheckbox extends Component {
    render() {
        const {apply, addCheckboxText, handleChange} = this.props;

        return (
            <div className="checkbox_circle_box mt10 pdside20">
                <input
                    type="checkbox"
                    name="addAgree"
                    onChange={handleChange}
                    checked={apply.addAgree}
                    className="checkbox_circle checkbox_circle_rel"
                    id="join_agree02" />
                <label
                    htmlFor="join_agree02"
                    className="checkbox_circle_simple">
                    <strong className="checkbox_circle_tit c_o" dangerouslySetInnerHTML={{__html: addCheckboxText}}></strong>
                </label>
            </div>
        )
    }
}

class SaemteoProgramApply extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
        this.withPeopleNumberRef = React.createRef();

        this.state = {
            programInfo: '',
            phoneCheckMessage: '',
            phoneCheckClassName: '',
            telephoneCheck: false,
            initialSchName: '',
            initialSchZipCd: '',
            initialSchAddr: '',
            userCellphone: '',
            companyYn: "N",
            eventContents: '', // 이벤트 신청 내용 ( 꿈 명함 이유 )
            eventLength: 0 // 이벤트 신청 길이
        }
    }
    componentDidMount() {
        const {programId, loginInfo, history} = this.props;

        const params = new URLSearchParams(this.props.location.search);
        const loc = params.get('loc');

        this.setState({
            loc : loc
        });

        // 준회원일 경우 신청 안됨.
        if(loginInfo.mLevel != 'AU300'){
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            history.push('/saemteo/program/view/'+programId);
            return;
        }

        if((programId == null) || (typeof programId == "undefined")){
            history.push('/saemteo/program');
        }else {
            this.getProgramInfo(programId);
        }
    }

    getProgramInfo = async (programId) => {
        const {history, apply, SaemteoActions} = this.props;
        const response = await api.programInfo(programId);
        if (response.data.code && response.data.code === "0") {
            let programInfo = response.data.programList[0];
            this.setState({
                programInfo: programInfo
            });
            apply.cultureActId = programInfo.cultureActId;
            apply.addCheckboxYn = programInfo.addCheckboxYn;
            let {memberId, name, schCode, schName, schZipCd, schAddr, cellphone, email} = response.data.memberInfo;
            apply.memberId = memberId;
            apply.userName = name;
            apply.withPeopleNumber = '0';
            apply.agree01 = false;
            apply.agree02 = false;
            apply.online = '0';
            apply.offline = '0';

            apply.schName = schName;
            apply.schZipCd = schZipCd;
            apply.schAddr = schAddr;
            apply.addressDetail = schName;
            apply.inputType = '정보 불러오기';
            apply.userInfo = 'Y';
            apply.cellphone = cellphone;
            apply.receive = '교실';

            this.setState({
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr,
                userCellphone: cellphone
            });

            // 학교코드가 99999, 99998, 99997일 경우 학교가 설정되지 않은 것으로 간주하여 정보불러오기에서 사용하는 정보를 공백처리한다.
            if (!schCode || schCode === 99999 || schCode === 99998 || schCode === 99997) {
                apply.schName = '';
                apply.schZipCd = '';
                apply.schAddr = '';
            }

            if (cellphone) {
                apply.cellphone = cellphone;
                this.setState({
                    telephoneCheck: true
                })
            }
            if (email) {
                let s = email.split("@");
                apply.email = s[0];
                let REGEXP_DOMAIN = /^(?:gmail.com|daum.net|hanmail.net|naver.com|nate.com|korea.kr|sen.go.kr)$/;
                if (s[1]) {
                    if (REGEXP_DOMAIN.test(s[1])) {
                        apply.emailDomain = "@" + s[1]
                    } else {
                        apply.emailDomain = "otherDomain"
                        apply.otherDomain = s[1];
                        apply.isOtherDomain = true;
                    }
                }
            }
            SaemteoActions.pushValues({type: "apply", object: apply});
        } else if (response.data.code && response.data.code === "3") {
            common.info("이미 신청되었습니다.");
            history.replace(history.location.pathname.replace('apply', 'view'));
        } else {
            history.push('/saemteo/index');
        }
    }

    handleChange = (e) => {
        const {apply, SaemteoActions} = this.props;
        if (e.target.name === 'agree01' || e.target.name === 'agree02' || e.target.name === 'addAgree2' || e.target.name === 'agree01' || e.target.name === 'agree02') {
            apply[e.target.name] = e.target.checked;
        } else if (e.target.name === 'online' || e.target.name === 'offline') {
            apply[e.target.name] = e.target.checked ? '1' : '0';
        } else {
            if (e.target.name === 'emailDomain') {
                if (e.target.value === 'otherDomain') {
                    apply.isOtherDomain = true
                } else {
                    apply.isOtherDomain = false
                }
            }
            apply[e.target.name] = e.target.value;
        }
        SaemteoActions.pushValues({type: "apply", object: apply});
    }

    handleUserInfo = (e) => {
        const {apply, SaemteoActions} = this.props;
        const {initialSchName, initialSchZipCd, initialSchAddr, userCellphone} = this.state;

        if (e.target.value === 'Y') {
            apply.inputType = '정보 불러오기';
            apply.schName = initialSchName;
            apply.schZipCd = initialSchZipCd;
            apply.schAddr = initialSchAddr;
            apply.addressDetail = initialSchName;
        } else {
            apply.inputType = '직접입력';
            apply.schName = '';
            apply.schZipCd = '';
            apply.schAddr = '';
            apply.addressDetail = '';
        }

        apply.cellphone = userCellphone;
        SaemteoActions.pushValues({type: "apply", object: apply});
        this.handleChange(e);
        // this.phoneCheckByUserInfoCellphone(apply.cellphone);
    };

    //핸드폰번호 체크
    phonecheck = (e) => {
        e.target.value = common.autoHypenPhone(e.target.value);
        let tel = e.target.value;
        let text = '';
        let checkFlag = false;
        let clazz = 'point_red';
        if (tel === '') {
            text = "";
        } else if (!this.checkPhoneNum(tel)) {
            text = "휴대폰 번호가 유효하지 않습니다.";
        } else {
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
    }
    checkPhoneNum = (value) => {
        if (value === '' || value.length === 0) {
            return false;
        } else if (value.indexOf("01") !== 0) {
            return false;
        } else if (value.length !== 13) {
            return false;
        }
        return true;
    }

    //값 입력 확인
    validateInfo = () => {
        const {apply} = this.props;
        const {telephoneCheck} = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        let obj = {result: false, message: ''}
        if (!apply.userName) {
            obj.message = '성명을 입력해주세요.';
        } else if (!reg_name.test(apply.userName)) {
            obj.message = '올바른 성명 형식이 아닙니다.';
        } else if (apply.email === "") {
            obj.message = '이메일을 입력해 주세요.';
        } else if (!apply.emailDomain) {
            obj.message = '이메일을 입력해 주세요.';
        } else if (apply.telephone === "") {
            obj.message = '휴대전화번호를 입력해 주세요.';
        } else if (!telephoneCheck) {
            obj.message = '휴대전화번호를 입력해 주세요.';
        }/* else if (!apply.schName) {
			obj.message = '재직 학교를 입력해주세요.';
		} else if (apply.schZipCd === "" || apply.schAddr === "") {
			obj.message = '우편 번호를 검색해서 주소를 입력해주세요.';
		} else if (apply.addressDetail === "") {
			obj.message = '학교주소를 입력해주세요.';
		} else if (!apply.addressDetail) {
			obj.message = '학교주소를 입력해주세요.';
		} else if (apply.receive === "교실" && (!apply.receiveGrade || !apply.receiveClass)) {
			obj.message = '학년 반을 입력해주세요.';
		} else if (apply.receive === "기타" && !apply.receiveEtc) {
			obj.message = '수령처를 입력해주세요.';
		}*/
        else if (!this.state.companyYn) {
            obj.message = '동반 선생님 유무를 선택해 주세요.';
        } else if (this.state.companyYn === 'Y' && (!apply.withPeopleNumber || apply.withPeopleNumber <= 0)) {
            obj.message = "동반 선생님 인원을 입력하시거나, 없을 경우 없음에 체크해 주세요.";
        } else if (this.state.companyYn === 'Y' && apply.withPeopleNumber > 1) {
            obj.message = "동반 선생님은 최대 1명입니다.";
        }
        /*else if (this.state.eventContents === "") { // 내용 미입력
            obj.message = '신청 사연을 입력해 주세요.';
        }*/
        else if (!apply.agree01 || !apply.agree02) {
            obj.message = '필수 유의 사항 및 동의 사항에 체크해 주세요.';
        } else {
            obj.result = true;
        }
        return obj;
    }

    applyButtonClickSafe = (e) => {
        this.applyButtonClick(e.target);
    }

    applyButtonClick = (target) => {
        target.disabled = true;
        const {apply, history, SaemteoActions} = this.props;
        const {loc} = this.state;

        let obj = this.validateInfo();
        if (!obj.result) {
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        try {
            let email = apply.email + apply.emailDomain;
            if (apply.isOtherDomain) {
                email = apply.email + "@" + apply.otherDomain;
            }
            let reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
            if (!email) {
                common.error("이메일을 입력해주세요.");
                target.disabled = false;
                return false;
            } else if (!reg_email.test(email)) {
                common.error("올바른 이메일 형태가 아닙니다.");
                target.disabled = false;
                return false;
            }

            let receive = apply.receive;
            if (apply.receive === "기타") {
                receive += ': '+apply.receiveEtc;
            } else if (apply.receive === "교실") {
                receive += ': '+apply.receiveGrade + '학년 ' + apply.receiveClass + '반';
            }

            if (this.state.companyYn === "N" || apply.withPeopleNumber === "") {
                apply.withPeopleNumber = "0";
            }

            apply.eventAnswerDesc = loc; // 이벤트 내용1 에 저장

            apply.questionCtnt = email + '/' + apply.cellphone +'/' + this.state.eventContents/* + '/' + apply.inputType + '/' + apply.schName + '/'
				+ apply.schZipCd + '/' + apply.schAddr +' '+ apply.addressDetail + '/' + receive*/;

            SaemteoActions.pushValues({type: "apply", object: apply});
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    }

    //신청
    insertApplyForm = async () => {
        const {apply, history, SaemteoActions, BaseActions} = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertApply({...apply});
            if (response.data.code === '1') {
                common.error("이미 신청하셨습니다.");
            } else if (response.data.code === '0') {
                common.info("신청해주셔서 감사합니다. \n당첨자 발표는 비바샘 공지사항을 참고해 주세요.");
                history.push('/saemteo/program');
            } else if (response.data.code && response.data.code === "4") {
                common.error("기존 가입이력이 있거나 동일한 이메일주소가 사용되고 있습니다.\n문의 : 선생님 전용 고객센터 1544-7714");
            } else {
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }
    //우편번호 검색 팝업
    openPopupAddress = () => {
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:"우편번호 검색", componet:<FindAddress handleSetAddress={this.handleSetAddress}/>});
    }
    //도로명주소 입력 후 callback
    handleSetAddress = (zipNo, roadAddr) => {
        const { apply, PopupActions, SaemteoActions } = this.props;
        // 입력값 적용
        apply.inputType = '직접입력';
        apply.userInfo = 'N';
        apply.schZipCd = zipNo;
        apply.schAddr = roadAddr;
        SaemteoActions.pushValues({type:"apply", object:apply});
        PopupActions.closePopup();
    }
    // 학교검색
    openPopupSchool = (e) => {
        e.preventDefault;
        const { PopupActions } = this.props;
        PopupActions.openPopup({title:"학교 검색", componet:<EventFindSchool handleSetSchool={this.handleSetSchool}/>});
    }
    // 학교검색 선택후 callback
    handleSetSchool = (obj) => {
        const { apply, SaemteoActions, PopupActions } = this.props;
        const { schoolName, schoolCode, zip, addr } = obj;

        apply.schCode = schoolCode;
        apply.schName = schoolName;
        apply.schZipCd = zip;
        apply.schAddr = addr;
        apply.addressDetail = schoolName;
        SaemteoActions.pushValues({type:"apply", object:apply});
        PopupActions.closePopup();
    }

    // 키 입력시 숫자만 입력
    inputOnlyNumber = (e) => {
        this.checkMaxLength(e);
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
        this.checkMaxNumber(e);
    }

    // maxLength 강제 적용
    checkMaxLength = (e) => {
        if (e.target.value.length > e.target.maxLength) {
            e.target.value = e.target.value.slice(0, e.target.maxLength);
        }
    }

    // 0~10까지만 입력하도록 함
    checkMaxNumber = (e) => {
        if (e.target.value > 1) {
            e.target.value = 1;
            common.info("동반 선생님은 최대 1명입니다.");
        } else if (e.target.value > 0) {
            e.target.value = parseInt(e.target.value);
        } else if (e.target.value === '00') {
            e.target.value = 0;
        }
    }

    handleClickCompanyYn = (e) => {
        const { apply, SaemteoActions } = this.props;
        const companyYn = e.target.value;

        // 동행이 없을 경우 동행자를 0으로 설정
        if (companyYn === 'N') {
            // 신청정보 객체입력값 변경
            apply['withPeopleNumber'] = "0";
            SaemteoActions.pushValues({type: "apply", object: apply});
            // dom 값 변경
            this.withPeopleNumberRef.current.value = "0";
        } else {
            apply['withPeopleNumber'] = '';
            this.withPeopleNumberRef.current.value = '';
        }

        this.setState({
            companyYn: companyYn
        });
    }

    render() {
        const {programInfo} = this.state;
        if (programInfo === '') return <RenderLoading/>;
        const {apply} = this.props;
        const {phoneCheckMessage, phoneCheckClassName, loc} = this.state;
        let addCheckbox;
        if (programInfo.addCheckboxYn === 'Y') {
            addCheckbox = <AddCheckbox apply={apply} handleChange={this.handleChange}
                                       addCheckboxText={programInfo.addCheckboxText}/>
        }
        return (
            <section className="vivasamter program_apply_wrap program56">
                <h2 className="blind">
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell ta_c pick">
                        {/*<h3><strong>56차 교사문화 프로그램  {loc === "글라스 아트 벽시계 만들기" ? "글라스 아트 벽시계 만들기" : "감정관리 미러 페인팅"} 신청하기</strong></h3>*/}
                        <h3><strong>63차 교사문화 프로그램 신청하기</strong></h3>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <div className="top_notice">
                        <p>당첨 시 관련 안내 연락을 받을 수 있는 휴대전화번호와<br />이메일 이메일 주소를 꼭 확인해 주세요.</p>
                    </div>
                    <div className="vivasamter_applyDtl pdside0">
                        <div className="pdside20 pb25">
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
                                    value={apply.userName}
                                    className="input_sm"
                                    readOnly/>
                            </div>
                            <h2 className="info_tit">
                                <label htmlFor="ipt_email">이메일</label>
                            </h2>
                            <div className="input_wrap">
                                <input
                                    type="text"
                                    autoCapitalize="none"
                                    placeholder="이메일 주소 입력하세요"
                                    id="ipt_email"
                                    name="email"
                                    onChange={this.handleChange}
                                    value={apply.email}
                                    className="input_sm input_fix_wrap"/>
                                <span className="input_fix_txt">@</span>
                            </div>
                            <div className="input_wrap mb25">
                                <div className="selectbox select_sm mt5">
                                    <select name="emailDomain" id="email_select" value={apply.emailDomain}
                                            onChange={this.handleChange}>
                                        <option value="">선택</option>
                                        <option value="otherDomain">직접입력</option>
                                        <option value="@gmail.com">gmail.com</option>
                                        <option value="@daum.net">daum.net</option>
                                        <option value="@hanmail.net">hanmail.net</option>
                                        <option value="@naver.com">naver.com</option>
                                        <option value="@nate.com">nate.com</option>
                                        <option value="@korea.kr">korea.kr</option>
                                        <option value="@sen.go.kr">sen.go.kr</option>
                                    </select>
                                </div>
                                <input
                                    type="email"
                                    name="otherDomain"
                                    placeholder="예) domain.com"
                                    autoCapitalize="none"
                                    className="input_sm ico_at mt5"
                                    onChange={this.handleChange}
                                    value={apply.otherDomain}
                                    style={{display: apply.isOtherDomain ? 'block' : 'none'}}
                                    id="check_domain"/>
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
                                    value={apply.cellphone}
                                    maxLength="13"
                                    className="input_sm mb5"/>
                                <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                            </div>
                            <div className="info_tit chk_tit">
                                <h2>
                                    <label htmlFor="ipt_teacher">동반 선생님</label>
                                </h2>
                                <ul className="join_ipt_chk">
                                    <li className="join_chk_list" style={{width: '45%'}}>
                                        <input
                                            type="radio"
                                            name="companyYn"
                                            id="companyYnY"
                                            className="checkbox_circle"
                                            value="Y"
                                            onClick={this.handleClickCompanyYn}/>
                                        <label htmlFor="companyYnY">있음</label>
                                    </li>
                                    <li className="join_chk_list">
                                        <input
                                            type="radio"
                                            name="companyYn"
                                            id="companyYnN"
                                            className="checkbox_circle"
                                            checked={this.state.companyYn == 'N'}
                                            value="N"
                                            onClick={this.handleClickCompanyYn}/>
                                        <label htmlFor="companyYnN">없음</label>
                                    </li>
                                </ul>
                            </div>
                            <div className="info_tit chk_tit">
                                <h2>
                                    <label htmlFor="ipt_teacher_num">동반 선생님 수</label>
                                </h2>
                                <div className="join_ipt_chk">
                                    <input
                                        ref={this.withPeopleNumberRef}
                                        type="number"
                                        id="ipt_teacher_num"
                                        name="withPeopleNumber"
                                        maxLength="2"
                                        onInput={this.inputOnlyNumber}
                                        onChange={this.handleChange}
                                        readOnly={this.state.companyYn !== 'Y'}
                                        defaultValue={0}
                                        className="input_sm"
                                        style={this.state.companyYn !== 'Y' ? {
                                            width: '45%',
                                            background: '#f7f7f7',
                                            color: '#999'
                                        } : {width: '45%'}}/>
                                    <span className="label_txt"> 명</span>
                                </div>
                                <p className="evtForm_labelTxt mt10">* 동반자 선생님 신청은 최대 1명까지 가능합니다.</p>
                                <p className="evtForm_labelTxt">* <span className="point01">선생님 대상으로 하는 프로그램으로 선생님만 동반 참여</span>하실
                                    수 있습니다.</p>
                            </div>
                            {/*<h2 className={"info_tit textareaTit"}>*/}
                            {/*    <label htmlFor="ipt_textarea">신청사연 (200자 이내)</label>*/}
                            {/*</h2>*/}
                            {/*<div className="input_wrap textareaWrap">*/}
                            {/*	<textarea*/}
                            {/*        name="applyContent"*/}
                            {/*        id="ipt_textarea"*/}
                            {/*        cols="1"*/}
                            {/*        rows="10"*/}
                            {/*        maxLength="501"*/}
                            {/*        value={this.state.eventContents}*/}
                            {/*        onChange={this.setApplyContent}*/}
                            {/*        className="ipt_textarea">*/}
                            {/*	</textarea>*/}
                            {/*    <div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/200</p></div>*/}
                            {/*</div>*/}
                            {/*<h2 className="info_tit">
                                <label htmlFor="ipt_school_name">재직학교</label>
                            </h2>
                            <div className="input_wrap mb10">
                                <ul className="join_ipt_chk">
                                    <li className="join_chk_list half">
                                        <input
                                            id="userInfoY"
                                            type="radio"
                                            className="checkbox_circle"
                                            name="userInfo"
                                            value="Y"
                                            checked={apply.userInfo === 'Y'}
                                            onChange={this.handleUserInfo}
                                        />
                                        <label htmlFor="userInfoY">정보 불러오기</label>
                                    </li>
                                    <li className="join_chk_list half">
                                        <input
                                            id="userInfoN"
                                            type="radio"
                                            className="checkbox_circle"
                                            name="userInfo"
                                            value="N"
                                            checked={apply.userInfo === 'N'}
                                            onChange={this.handleUserInfo}
                                        />
                                        <label htmlFor="userInfoN">직접입력</label>
                                    </li>
                                </ul>
                            </div>
                            <div className={apply.userInfo === 'Y' ? 'input_wrap school mb10' : 'input_wrap school mb25'}>
                                <input
                                    type="text"
                                    placeholder="예) 비바샘 고등학교"
                                    id="ipt_school_name"
                                    name="schName"
                                    onChange={this.handleChange}
                                    value={apply.schName}
                                    className="input_sm"
                                    readOnly={apply.userInfo === 'Y'}
                                />
                                {
                                    apply.userInfo === 'Y' ?
                                        <button
                                            className="input_in_btn btn_gray"
                                            onClick={this.openPopupSchool}>
                                            학교검색
                                        </button> : ''
                                }
                            </div>
                            {apply.userInfo == 'Y' && <p className="bulTxt mb15 mt10 ml10">* 학교 검색에서 찾으시는 학교가 없을 경우,<br/><span className="ml8">직접 입력을 통해 재직학교와 주소를 입력해 주세요.</span></p>}
                            <h2 className="info_tit">
                                <label htmlFor="ipt_address">학교주소</label>
                            </h2>
                            <div className="input_wrap">
                                <input
                                    type="text"
                                    placeholder="우편번호"
                                    value={apply.schZipCd}
                                    className="input_sm"
                                    readOnly/>
                                {  부분 렌더링 예시
                                    (apply.userInfo === 'N') &&  // 직접입력
                                    <button
                                        type="button"
                                        className="input_in_btn btn_gray"
                                        onClick={this.openPopupAddress}
                                    > 우편번호 검색
                                    </button>
                                }
                            </div>
                            <div className="input_wrap mt5" style={{display: apply.schAddr !== '' ? 'block' : 'none'}}>
                                <input
                                    type="text"
                                    placeholder="주소 입력"
                                    id="ipt_address"
                                    value={apply.schAddr}
                                    className="input_sm"
                                    readOnly/>
                            </div>
                            <div className="input_wrap mt5 mb25">
                                <input
                                    type="text"
                                    placeholder="상세 주소 입력"
                                    id="ipt_detail_address"
                                    name="addressDetail"
                                    onChange={this.handleChange}
                                    value={apply.addressDetail}
                                    className="input_sm"/>
                            </div>
                            <h2 className="info_tit">
                                <label htmlFor="ipt_receive">수령처</label>
                            </h2>
                            <div className={'combo_box ' + (apply.receive === '교실'? 'type2' : (apply.receive === '기타' ? 'type3' : 'type1'))}>
                                <div className="selectbox select_sm">
                                    <select name="receive" id="ipt_receive" onChange={this.handleChange}>
                                        <option value="교실">교실</option>
                                        <option value="교무실">교무실</option>
                                        <option value="행정실">행정실</option>
                                        <option value="택배실">택배실</option>
                                        <option value="진로상담실">진로상담실</option>
                                        <option value="경비실">경비실</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                <div className={'input_wrap receiveEtc ' + (apply.receive === '기타' ?  '' : 'hide')}>
                                    <input
                                        type="text"
                                        autoCapitalize="none"
                                        name="receiveEtc"
                                        onChange={this.handleChange}
                                        className="input_sm"/>
                                </div>
                                <div className={(apply.receive === '교실' ? '' : 'hide')}>
                                    <div className='input_wrap receiveGradeClass'>
                                        <input
                                            type="number"
                                            name="receiveGrade"
                                            maxLength="2"
                                            onInput={this.checkMaxLength}
                                            onChange={this.handleChange}
                                            className="input_sm"/>
                                        <span className="label_txt">학년</span>
                                        <input
                                            type="number"
                                            name="receiveClass"
                                            maxLength="2"
                                            onInput={this.checkMaxLength}
                                            onChange={this.handleChange}
                                            className="input_sm"/>
                                        <span className="label_txt">반</span>
                                    </div>
                                </div>
                            </div>*/}
                        </div>
                        <div className="acco_notice_list pdside20">
                            <div className="acco_notice_cont">
                                <span className="privacyTit">
                              개인정보 수집 및 이용동의
                            </span>
                                <ul className="privacyList">
                                    <li>이용목적 : 교사문화프로그램 당첨자 연락 및 CS 문의 응대</li>
                                    <li>수집하는 개인정보 : 성명, 휴대전화번호, 이메일 주소</li>
                                    <li>개인정보 보유 및 이용기간 : <span className="point01">2025년 12월 31일까지</span><br/>
                                        (이용목적 달성 시 즉시 파기)
                                    </li>
                                </ul>
                                <br/>
                                <div className="privacyTxt">선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다.<br/>단, 동의를
                                    거부할 경우 교사문화 프로그램 신청이 불가합니다.
                                </div>
                            </div>
                        </div>
                        <div className="checkbox_circle_box mt25 pdside20">
                            <input
                                type="checkbox"
                                name="agree01"
                                onChange={this.handleChange}
                                checked={apply.agree01}
                                className="checkbox_circle checkbox_circle_rel"
                                id="join_agree01"/>
                            <label
                                htmlFor="join_agree01"
                                className="checkbox_circle_simple">
                                <strong className="checkbox_circle_tit">
                                    본인은 개인정보 수집 및 이용에 동의합니다.
                                </strong>
                            </label>
                        </div>
                        <div className="checkbox_circle_box mt10 pdside20">
                            <input
                                type="checkbox"
                                name="agree02"
                                onChange={this.handleChange}
                                checked={apply.agree02}
                                className="checkbox_circle checkbox_circle_rel"
                                id="join_agree02"/>
                            <label
                                htmlFor="join_agree02"
                                className="checkbox_circle_simple">
                                {/*
                                {loc === "광주" ?
                                    <strong className="checkbox_circle_tit">
                                        <span className="c_o">특강 일정 및 장소(8월 10일 토요일 10시~12시/김대중컨벤션센터)</span>를 확인하였습니다.
                                    </strong>			:
                                    <strong className="checkbox_circle_tit">
                                        <span className="c_o">특강 일정 및 장소(8월 10일 토요일 10시~12시/창원축구센터 2층 중세미나실)</span>를 확인하였습니다.
                                    </strong>
                                }
                                */}
                                <strong className="checkbox_circle_tit">
                                    프로그램 일정 및 장소
                                    <span className="c_o">(11월 22일 토요일 오전 10시~낮 12시/과천시 비바룸)</span>를
                                    확인하였습니다.
                                </strong>
                            </label>
                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on mt35">신청하기
                        </button>
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        apply: state.saemteo.get('apply').toJS(),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SaemteoProgramApply));
