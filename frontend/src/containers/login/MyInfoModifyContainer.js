import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import {isCommonWVAppsMv} from 'lib/common';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import * as myclassActions from 'store/modules/myclass';
import * as baseActions from 'store/modules/base';
import FindAddress from 'containers/login/FindAddress';
import FindSchool from 'containers/login/FindSchool';
import SubjectSelectContainer from 'containers/login/SubjectSelectContainer';
import moment from 'moment';
import {isAndroid, isIOS} from "react-device-detect";
import {ANDROID_VERSION_CURRENT, ES_APP_STORE_URL, IOS_OS_TARGET_VERSION, IOS_VERSION_CURRENT} from "../../constants";
import {checkVersionForUI} from '../../lib/VersionUtils';
import {initializeGtag} from "../../store/modules/gtag";
import {isProd} from "../../lib/TargetingUtils";

class MyInfoModifyContainer extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.updateButtonClick = debounce(this.updateButtonClick, 300);

        this.email = React.createRef();
        this.emailDomain = React.createRef();
        this.otherDomain = React.createRef();
        this.telephone = React.createRef();
        this.zipNo = React.createRef();
        this.addressDetail = React.createRef();
        this.lunar = React.createRef();
        this.birthDay = React.createRef();
        this.gender = React.createRef();
        this.schoolName = React.createRef();
        this.grade = React.createRef();
        this.mainSubject = React.createRef();
        this.secondSubject = React.createRef();
        this.visangTbYN = React.createRef();
        this.expiryTermNum = React.createRef();
        this.goConversion();
    }

    state = {
        phoneCheckMessage: '',
        phoneCheckClassName: '',
        telephoneCheck: false,
        gradeVisible: false, // 담당학년 4,5,6 학년 노출여부
        gradeSubVisible: false, // 담당학년 항목 노출여부
        subjectVisible: false, // 내교과 항목 노출여부
        subjectAddVisible: false, // 내교과 추가 버튼 스왑 기능
        subjectCode: 'SC000',
        min: moment().subtract(73, 'years').format("YYYY-MM-DD"),
        max: moment().format("YYYY-MM-DD"),
        duplicateEmailCheck: true,
        ipinCheck: false,
        isAppleLogin : false,
        snsList : {
            'NAVER': false,
            'KAKAO': false,
            'FACEBOOK': false,
            'GOOGLE': false,
            'WHALESPACE': false,
            'APPLE': false,
        },
        isShowWhale: false,
        snsLists: {},
        joinModifyInfoEventYn: 'N',
        telephone: '',
        authCode : '',
        randomNumber : '',
        certifiNum: '',	// 인증코드
        uuidForCertifiNum: '',	// 인증uuid
        msgText : '',
        duplicateTelephoneCheck: false,
        telInputcelphoneReadOnly : false,
        celphoneReadOnly : false,

    }

    componentDidMount = async () => {
        initializeGtag();
        function gtag() {
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/myInfo/modify',
            'page_title': '개인정보 수정｜비바샘'
        });
        this._isMounted = true;
        const {info, logged, history, JoinActions} = this.props;
        //로그인 정보 없을시 return
        if (!logged) {
            history.push('/');
        }
        if (!info.passwordModify) {
            history.replace('/myInfo');
        }
        const loginType = await api.getLoginType();
        if(loginType != null){
            await this.memberInfo(loginType.data);
            await this.setSnsMember();
            await this.setInitInfo();
            await this.checkJoinModifyInfoEvent(); // 개인정보 수정 이벤트 참여 체크 함수입니다. 2023-04-07 이후로 삭제가능
        }else{
            history.replace('/myInfo');
        }
        if (isIOS) {
            let target = this;
            // App 일때만
            if(isCommonWVAppsMv(window.navigator.userAgent.toLowerCase())) {
                window.webViewBridge.send('getVersion', '', function (res) {
                    // 설치버전이 크거나 같으면 무시
                    if (!common.isVersionUpdate(res.value, IOS_VERSION_CURRENT) && isIOS) {
                        window.webViewBridge.send('getOSVersion', null, (retVal) => {
                            if (retVal.value >= IOS_OS_TARGET_VERSION) {
                                target.setState({
                                    isAppleLogin: true
                                })
                            }
                        }, (err) => {
                        });
                    }
                });
            }
        }

        let target = this;
        // App 일때만
        if(isCommonWVAppsMv(window.navigator.userAgent.toLowerCase())) {
            // Check
            checkVersionForUI(() => {
                console.log("Call Not Show");
                target.setState({
                    isShowWhale: false
                })
            }, () => {
                console.log("Call Show");
                target.setState({
                    isShowWhale: true
                });
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setSnsMember = async () => {
        let snsList = this.state.snsList;

        let axiosResponse = await api.getModifySns();

        for (let type in snsList) {
            snsList[type] = false;
        }

        for (const sns of axiosResponse.data) {
            const type = sns.snsType;
            snsList[type] = true;
        }

        this.setState({
            snsList : snsList,
            snsLists : axiosResponse.data
        })
    }

    setInitInfo = async (loginType) => {
        const {info, school, agree, initInfo, initSchool, initAgree, initSnsList, JoinActions} = this.props;
        const {snsList} = this.state;

        for (let type in snsList) {
            initSnsList[type] = snsList[type];
        }

        JoinActions.pushValues({type: "initInfo", object: info});
        JoinActions.pushValues({type: "initSchool", object: school});
        JoinActions.pushValues({type: "initAgree", object: agree});
        JoinActions.pushValues({type: "initSnsList", object: initSnsList});
    }

    checkJoinModifyInfoEvent = async () => {
        const eventId = '440';
        const eventEndDate = new Date('2023/04/07 00:00:00');
        const nowDate = new Date();

        const response = await api.chkEventJoin({eventId});
        if (response.data.eventJoinYn === 'Y' && nowDate < eventEndDate) {
            this.setState({
                joinModifyInfoEventYn : 'Y'
            });
        }
    }

    memberInfo = async (loginType) => {
        const {JoinActions, info, history} = this.props;
        try {
            if (loginType === 'LOGIN') {
                const {school} = await JoinActions.memberInfoCheck(info.password);
            } else {
                const {school} = await JoinActions.memberInfoCheck(info.accessToken, info.apiId, info.idToken);
            }

            // JoinActions.memberInfoCheck 호출시 pw or accessToken 오류일 경우 사용자 정보를 전달하지 않음
            if (!this.props.info.userId) {
                history.replace('/myInfo');
            }

            if (this._isMounted && this.props.school.secondSubject) {
                this.setState({
                    subjectAddVisible: true
                })
            }
            if (this._isMounted && this.props.school.schoolGrade) {
                this.setState({
                    gradeVisible: this.props.school.schoolGrade !== 'E' ? false : true,
                    subjectVisible: this.props.school.schoolGrade !== 'M' && this.props.school.schoolGrade !== 'H' ? false : true,
                    gradeSubVisible: this.props.school.schoolGrade !== 'E' && this.props.school.schoolGrade !== 'M' && this.props.school.schoolGrade !== 'H' ? false : true,
                });
            }
            if (this._isMounted && this.props.info.telephone) {
                this.setState({
                    telephoneCheck: true,
                    telephone: this.props.info.telephone
                })
            }
            if (this._isMounted && this.props.info.birthDay) {
                this.setState({
                    time: moment(this.props.info.birthDay, "YYYY-MM-DD").toDate()
                })
            }
        } catch (e) {
            console.log(e);
        }
    }

    duplicateCelPhoneClick =  (e) => {
        const {telephone} = this.state;
        var regExpPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
        if (!regExpPhone.test(telephone)) {
            common.error("올바른 휴대전화번호 형식이 아닙니다.");
            return false;
        }
        this.sendSms(e);
    }

    sendSms = async (e) => {
        const { loginInfo } = this.props;
        const {telephone} = this.state;
        if (telephone == '') {
            alert('휴대전화번호를 입력해주세요.')
            return;
        }
        const response = await api.sendMsgSnsJoin(telephone, loginInfo.memberId);
        if (response.data.code == 'success') {
            this.setState({
                uuidForCertifiNum : response.data.uuidForCertifiNum,
                msgText : '인증번호를 발송했습니다.',
                telInputcelphoneReadOnly : true
            })
            // if(!isProd()) {
            // 	alert("인증번호 확인 :: " + response.data.msg);
            // }
        }
        else if (response.data.code == 'fail') {
            alert(response.data.msg);
        }
        else {
            alert('문자전송중 오류가 발생하였습니다. 다시한번 시도해주세요.');
        }
    }

    snsSleepWakeUp = async (e) => {
        const { JoinActions, info, loginInfo } = this.props;
        const { authCode, uuidForCertifiNum, telephone } = this.state;

        if (authCode == '') {
            alert('인증번호를 입력해 주세요.');
            return;
        }
        const response = await api.checkCertifySms(authCode, uuidForCertifiNum, telephone, loginInfo.memberId);

        if(response.data.code === '0') {
            alert('인증이 완료되었습니다.');
            this.setState({
                telInputcelphoneReadOnly: false,
                celphoneReadOnly : true,
                telephoneCheck : true,
                msgText : '',
            })

            info['telephone'] = telephone;
            JoinActions.pushValues({type: 'info', object: info});
        } else if(response.data.code === '1') {
            common.error("인증코드를 확인해주세요.");
        } else if(response.data.code === '3') {
            common.error("인증번호가 일치하지 않습니다. 인증번호를 다시 확인해 주세요.");
        } else {
            common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
        }
    }

    handleNumberChange = (e) => {
        const { value } = e.target
        const onlyNumber = value.replace(/[^0-9]/g, '')
        this.setState({
            [e.target.name]: onlyNumber
        })
    }

    handleCheckChange = (e) => {
        const {check, JoinActions} = this.props;
        if (e.target.name === 'emailDomain') {
            if (e.target.value === 'otherDomain') {
                check.isOtherDomain = true
            } else {
                check.isOtherDomain = false
            }
        }
        check[e.target.name] = e.target.value;
        JoinActions.pushValues({type: "check", object: check});
    }

    handleInfoChange = (e) => {
        const {info, JoinActions} = this.props;
        info[e.target.name] = e.target.value;
        JoinActions.pushValues({type: "info", object: info});
    }

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
        if (this._isMounted) {
            this.setState({
                phoneCheckClassName: clazz,
                phoneCheckMessage: text,
                telephoneCheck: checkFlag
            });
        }
        this.handleInfoChange(e);
    }

    checkPhoneNum = (value) => {
        if (value === '' || value.length === 0) {
            return false;
        } else if (value.indexOf("01") !== 0) {
            return false;
        } else if (value.length < 12 || value.length > 13) {
            return false;
        }
        return true;
    }

    //우편번호 검색 팝업
    openPopupAddress = () => {
        const {PopupActions} = this.props;
        PopupActions.openPopup({title: "우편번호 검색", componet: <FindAddress handleSetAddress={this.handleSetAddress}/>});
    }
    //도로명주소 입력 후 callback
    handleSetAddress = (zipNo, roadAddr) => {
        const {info, PopupActions, JoinActions} = this.props;
        info.zipNo = zipNo;
        info.address = roadAddr;
        JoinActions.pushValues({type: "info", object: info});
        PopupActions.closePopup();
    }

    openPopupSchool = (e) => {
        e.preventDefault;
        const {PopupActions} = this.props;
        PopupActions.openPopup({title: "소속 검색", componet: <FindSchool handleSetSchool={this.handleSetSchool}/>, wrapClassName:"auto_content"});
    }

    handleSetSchool = (obj) => {
        const {school, PopupActions, JoinActions} = this.props;
        //학년, 내교과 hidden
        if (this._isMounted) {
            this.setState({
                gradeVisible: obj.schoolGrade !== 'E' ? false : true,
                subjectVisible: obj.schoolGrade !== 'M' && obj.schoolGrade !== 'H' ? false : true,
                gradeSubVisible: obj.schoolGrade !== 'E' && obj.schoolGrade !== 'M' && obj.schoolGrade !== 'H' ? false : true,
                subjectAddVisible: obj.schoolGrade !== 'M' && obj.schoolGrade !== 'H' ? false : true,
            });
        }
        school.schoolName = obj.schoolName;
        //내교화 초기화
        school.mainSubject = '';
        school.secondSubject = '';
        school.schoolGrade = obj.schoolGrade;
        //담당 학년 초기화
        school.myGrade = '';
        for (var key in school.grade) {
            school.grade[key].checked = false;
        }
        JoinActions.pushValues({type: "school", object: {...school, ...obj}});
        PopupActions.closePopup();
    }

    handleChange = (e) => {
        const {school, info, JoinActions} = this.props;

        if (e.target.name === "grade") {
            let myGrades = [];

            school.grade[e.target.id].checked = e.target.checked;
            //school.myGrade setting
            for (var key in school.grade) {
                if (school.grade[key].checked) {
                    myGrades.push(school.grade[key].value);
                }
            }
            school.myGrade = myGrades.toString();
        } else if (e.target.name === "email") {
            this.setState({
                duplicateEmailCheck: false
            });
            this.handleInfoChange(e);
            return;
        } else if (e.target.name === "telephone") {
            let inputTelephone = common.autoHypenPhone(e.target.value);

            if(info.telephone == inputTelephone) {
                this.setState({
                    telephoneCheck: true,
                    telephone: info.telephone
                });
            } else {
                this.setState({
                    telephoneCheck: false,
                    telephone: inputTelephone
                });
            }
            return;
        } else {
            school[e.target.name] = e.target.value;
        }
        JoinActions.pushValues({type: "school", object: school});
    }

    handleClick = (e) => {
        const {school, JoinActions} = this.props;
        const {subjectAddVisible} = this.state;
        if (this._isMounted) {
            this.setState({
                subjectAddVisible: !subjectAddVisible
            });
        }
        if (subjectAddVisible) {
            school.secondSubject = '';
        }
        JoinActions.pushValues({type: "school", object: school});
    }

    handleAgreeChange = (e) => {
        const {agree, JoinActions} = this.props;
        agree[e.target.name] = e.target.checked;
        JoinActions.pushValues({type: "agree", object: agree});
    }

    //값 입력 확인
    validateInfo = () => {
        const {info} = this.props;
        const {telephoneCheck, passwordRule} = this.state;
        let obj = {result: false, message: '', focus: ''}
        if (info.telephone === "") {
            obj.message = '휴대전화번호를 입력해주세요.';
            obj.focus = this.refs.telephone;
        } else if (!telephoneCheck) {
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
            obj.focus = this.refs.telephone;
        } else {
            obj.result = true;
        }
        return obj;
    }

    validateSchool = () => {
        const {school, loginInfo, agree} = this.props;
        let obj = {result: false, message: ''}

        if ((agree.mTypeCd === "0" || agree.mTypeCd === "1" || agree.mTypeCd === "2") && (school.schoolName === "" || school.schoolCode === "")) {
            obj.message = '소속을 입력해주세요';
            obj.focus = this.refs.schoolName;
        } else if (agree.mTypeCd === "0" && this.state.gradeSubVisible && school.myGrade === "") {
            obj.message = '담당학년은 필수 선택 항목입니다.';
            obj.focus = this.refs.grade;
        } else if (agree.mTypeCd === "0" && this.state.subjectVisible && school.mainSubject === "") {
            obj.message = '내 교과 설정(대표)은 필수입력항목입니다.';
            obj.focus = this.refs.mainSubject;
        } else {
            obj.result = true;
        }
        return obj;
    }

    // 개인정보 수정확인
    changeInfoCheck = () => {
        const {info, school, agree, initInfo, initSchool, initAgree, initSnsList} = this.props;
        const {snsList} = this.state;
        let obj = {result: true, message: '개인정보를 수정해 주세요.'}

        if (initInfo.email !== info.email) {

        } else if (initInfo.telephone !== info.telephone) {

        } else if (initSchool.schoolName !== school.schoolName) {

        } else if (initSchool.myGrade !== school.myGrade) {

        } else if (initSchool.mainSubject !== school.mainSubject) {

        } else if (initSchool.secondSubject !== school.secondSubject) {

        } else if (initAgree.marketingSms !== agree.marketingSms) {

        } else if (initAgree.marketingEmail !== agree.marketingEmail) {

        } else if (initAgree.marketingTel !== agree.marketingTel) {

        } else if (initAgree.tschMarketingSms !== agree.tschMarketingSms) {

        } else if (initAgree.tschMarketingEmail !== agree.tschMarketingEmail) {

        } else if (initAgree.tschMarketingTel !== agree.tschMarketingTel) {

        } else if (initAgree.mTypeCd !== agree.mTypeCd) {

        } else if (snsList.NAVER !== initSnsList.NAVER
            || snsList.KAKAO !== initSnsList.KAKAO
            || snsList.FACEBOOK !== initSnsList.FACEBOOK
            || snsList.GOOGLE !== initSnsList.GOOGLE
            || snsList.WHALESPACE !== initSnsList.WHALESPACE
            || snsList.APPLE !== initSnsList.APPLE) {

        } else {
            obj.result = false;
        }
        return obj;
    }

    //회원정보수정
    updateForm = async () => {
        const {agree, check, info, school, history, JoinActions, BaseActions} = this.props;
        try {
            BaseActions.openLoading();
            let code = await JoinActions.updateMemberInfo({...agree, ...check, ...info, ...school});
            if (code.data === '0000') {
                //성공
                if(this.state.joinModifyInfoEventYn == 'Y') {
                    common.info('회원정보가 수정되어 이벤트 자동 응모가 완료되었습니다.​');
                } else {
                    common.info('개인정보가 변경 되었습니다.');
                }
                this.getMyClassInfo();
                history.push('/');
            } else {
                common.error("회원 정보 수정중 문제가 발생했습니다.\n\n문의 : 선생님 전용 고객센터 1544-7714");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 100);//의도적 지연.
        }
    }

    getMyClassInfo = async () => {
        const {MyclassActions} = this.props;

        try {
            await MyclassActions.myClassInfo();
        } catch (e) {
            console.log(e);
        }
    }

    updateButtonClickSafe = (e) => {
        this.updateButtonClick(e.target);
    }

    updateButtonClick = async (target) => {
        target.disabled = true;
        const {agree, check, info, school, history, JoinActions} = this.props;
        try {
            let reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
            if (info.email === "") {
                common.error('이메일을 입력해주세요.');
                target.disabled = false;
                this.refs.email.focus();
                return false;
            }
            if (!reg_email.test(info.email)) {
                common.error("정확한 이메일 주소를 입력해 주세요.");
                target.disabled = false;
                this.refs.email.focus();
                return false;
            }
            if (!this.state.duplicateEmailCheck || info.duplicateEmail) {
                await this.duplicateEmailClick();
                if(!this.state.duplicateEmailCheck) {
                    target.disabled = false;
                    this.refs.email.focus();
                    return false;
                }
            }
            if (!this.state.telephoneCheck) {
                common.error('휴대전화번호 인증을 해주세요.');
                target.disabled = false;
                this.refs.telephone.focus();
                return false;
            }
            JoinActions.pushValues({type: "info", object: info});

            let obj = this.validateInfo();
            if (!obj.result) {
                common.error(obj.message);
                target.disabled = false;
                obj.focus.focus();
                return false;
            }
            let obj2 = this.validateSchool();
            if (!obj2.result) {
                common.error(obj2.message);
                target.disabled = false;
                obj2.focus.focus();
                return false;
            }
            let obj3 = this.changeInfoCheck();
            if (!obj3.result) {
                common.error(obj3.message);
                target.disabled = false;
                return false;
            }

            if (!school.directlyAgree) {
                this.updateForm();
            } else {
                let schoolGrade = school.schoolGrade.concat('S');
                let schoolName = school.schoolName;
                let fkbranchCode = school.fkbranchCode;
                let fkareaName = school.fkareaName;
                let fkbranchName = school.fkbranchName;
                let directly_agree = school.directlyAgree === true ? "Y" : "N";
                let memberId = info.userId;
                let requestedTerm = school.requestedTerm;

                let kind_name = "";
                if (schoolGrade === "ES") {
                    kind_name = "초등";
                } else if (schoolGrade === "MS") {
                    kind_name = "중등";
                } else if (schoolGrade === "HS") {
                    kind_name = "고등";
                } else if (schoolGrade === "CS") {
                    kind_name = "대학";
                } else if (schoolGrade === "KS") {
                    kind_name = "유치원";
                } else if (schoolGrade === "OS") {
                    kind_name = "교육기관";
                }

                if (fkbranchCode === "") {
                    fkbranchName = "";
                } else {
                    fkbranchName = ' > ' + fkbranchName;
                }
                if (requestedTerm === "별도 요청사항이 있으신 경우, 의견을 남겨 주세요.") {
                    requestedTerm = "";
                } else {
                    requestedTerm = '- 별도 요청사항  : ' + requestedTerm + '\n';
                }
                let qnaCd = 'QA011';
                let qnaTitle = schoolName + '_학교등록신청';
                let qnaContents = `학교등록 신청\n\n- 학교급  : ${kind_name}\n- 학교명  : ${schoolName}\n- 학교지역  : ${fkareaName}${fkbranchName}\n${requestedTerm}- 학교변경 동의여부  : ${directly_agree}\n`;

                try {
                    const response = await api.qnaInsert(memberId, qnaCd, schoolGrade, qnaTitle, qnaContents, "json");
                    if (response.data.code === "0000") {
                        this.updateForm();
                    } else {
                        common.error('신청이 정상적으로 처리되지 못했습니다.');
                        target.disabled = false;
                    }
                } catch (e) {
                    common.error('신청이 정상적으로 처리되지 못했습니다.');
                    target.disabled = false;
                    console.log(e);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    //중복 이메일 체크
    duplicateEmailClick = async (e) => {
        const {info, JoinActions} = this.props;
        let reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
        if (!reg_email.test(info.email)) {
            common.error("정확한 이메일 주소를 입력해 주세요.");
            this.refs.email.focus();
            return false;
        }
        try {
            let {data} = await JoinActions.checkUserEmail(info.userId, info.email);
            if (this.props.info.duplicateEmail) {
                common.error('이미 사용중인 이메일입니다.');
                this.refs.email.focus();
                return false;
            } else {
                //common.info("사용할 수 있는 이메일입니다.");
                this.setState({
                    duplicateEmailCheck: true
                });
                return true;
            }
        } catch (e) {
            console.log(e);
        }
        return false;
    }


    goConversion = async () => {
        const {history} = this.props;
        const response = await api.checkAuthIPIN();
        if (response.data.IPIN_CHECK === 'NotAllowAuth') {
        } else {
            this.setState({
                ipinCheck: true
            })
        }
    };

    appleLogin = (mode, e) =>{
        if(e) e.preventDefault();
        const {isApp} = this.props;
        const type = 'APPLE';
        const infoCheck = false;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            this.checkPlatformVersion(object, false, mode);
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    naverLogin = (mode, e) =>{
        if(e) e.preventDefault();
        const {isApp} = this.props;
        const type = 'NAVER';
        const infoCheck = false;
        var object = {
            type,
            infoCheck
        };
        if (isApp) {
            this.checkPlatformVersion(object, true, mode);
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    kakaoLogin = (mode, e) =>{
        if(e) e.preventDefault();
        const {isApp} = this.props;
        const type = 'KAKAO';
        const infoCheck = false;
        var object = {
            type,
            infoCheck
        };
        if (isApp) {
            this.checkPlatformVersion(object, true, mode);
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    googleLogin = (mode, e) =>{
        if(e) e.preventDefault();
        const {isApp} = this.props;
        const type = 'GOOGLE';
        const infoCheck = false;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            this.checkPlatformVersion(object, true, mode);
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    whaleLogin = (mode, e) =>{
        if(e) e.preventDefault();
        const {isApp} = this.props;
        const type = 'WHALESPACE';
        const infoCheck = false;
        var object = {
            type,
            infoCheck
        };

        if (isApp) {
            this.checkPlatformVersion(object, true, mode);
        }
        else {
            this.goMsHsAppStoreOrPlayStore();
        }
    }

    /**
     * 함수 하나로 로직 결합
     * @param object type info check
     * @param isCommon ios / android 공용사용인가 true 아니면 즉 IOS 만 해당되는가
     */
    checkPlatformVersion = (object, isCommon, mode) => {
        try {
            // console.log("Object :: " + object +"/" + isCommon);
            const target = this;

            window.webViewBridge.send('getVersion', '', function (res) {
                if(isCommon) {
                    // 설치버전이 크거나 같으면 무시
                    if ((!common.isVersionUpdate(res.value, IOS_VERSION_CURRENT) && isIOS) || (!common.isVersionUpdate(res.value, ANDROID_VERSION_CURRENT) && isAndroid)) {
                        window.webViewBridge.send('snsLogin', object, (retVal) => {
                            target.afterEvent(retVal, mode);
                        }, (err) => {
                            alert("SNS 연결이 정상적으로 완료되지 않아 취소되었습니다.");
                        });
                    } else {
                        target.alertUpdateMsg();
                    }
                }else{
                    if (!common.isVersionUpdate(res.value, IOS_VERSION_CURRENT) && isIOS) {
                        window.webViewBridge.send('snsLogin', object, (retVal) => {
                            console.log("Res Value :: " + retVal);
                            target.afterEvent(retVal, mode);
                        }, (err) => {
                            alert("SNS 연결이 정상적으로 완료되지 않아 취소되었습니다.");
                        });
                    } else {
                        target.alertUpdateMsg();
                    }
                }
            }, function (err) {
                console.log(err);
            });
        } catch (e) {
            console.log(e)
        }
    }

    goMsHsAppStoreOrPlayStore = () => {
        if (isAndroid) {
            if (window.confirm("SNS 연결은 비바샘 앱에서만 이용 가능합니다. 앱으로 이동하시겠습니까?")) {
                document.location.href = ES_APP_STORE_URL.ANDROID_INTENT;
            }
        } else {
            var b = new Date();
            setTimeout(function () {
                if (new Date() - b < 2000) {
                    if(window.confirm('앱 설치후 이용이 가능합니다. 앱스토어로 이동하시겠습니까?')) {
                        window.location.href = ES_APP_STORE_URL.IOS;
                    }
                }
            }, 1500);
            document.location.href = "mevivasammobile://";
        }
    }

    afterEvent = async (retVal, mode) => {
        //세션 스토리지 삭제
        sessionStorage.removeItem('snsObject');
        const object = {
            type : retVal.type,
            infoCheck : retVal.infoCheck,
            accessToken : retVal.accesstoken,
            id : retVal.userId,
            idToken : retVal.idtoken,
            clientsecret : retVal.clientsecret,
            code : retVal.code
        }
        try {
            if(mode === 'link') {
                const response = await api.linkSns(object);
                alert("SNS 연동이 완료되었습니다.");
            } else if(mode === 'unlink') {
                const response = await api.unlinkSns(object);
                alert("SNS 연동 해제가 완료되었습니다.");
            } else {
                alert("SNS 연결이 정상적으로 완료되지 않아 취소되었습니다.");
            }
        }catch (e) {
            alert(e.response.data.message);
        }
        finally {
            setTimeout(()=>{
                this.setSnsMember();
            }, 200);//의도적 지연.
        }
    }

    alertUpdateMsg = () => {
        if (window.confirm('SNS 연동을 하시려면 업데이트가 필요합니다.\n\n지금 업데이트 하시겠습니까?')) {
            let data;
            if (isIOS) {
                data = {value: ES_APP_STORE_URL.IOS};
                return new Promise(function (resolve, reject) {
                    window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                        resolve(retVal);
                    }, (err) => {
                        reject(err);
                    });
                });
            } else if (isAndroid) {
                document.location.href = ES_APP_STORE_URL.ANDROID;
            }
        } else {
            // 취소를 누른 경우, 강제 업데이트 일경우는 앱 종료
        }
    }

    changeMemberTypeCode = (val) => {
        const {agree, school, JoinActions} = this.props;
        agree.mTypeCd = val;
        JoinActions.pushValues({type: "agree", object: agree});

        if(agree.mTypeCd == '0') {
            this.setState({
                subjectVisible: school.schoolGrade === 'E' ? false : true
            });
        } else {
            this.setState({
                subjectVisible: false
            });
        }
    }

    render() {
        const {agree, check, info, school, loginInfo} = this.props;
        const {
            phoneCheckMessage,
            phoneCheckClassName,
            gradeVisible,
            gradeSubVisible,
            subjectVisible,
            subjectAddVisible,
            subjectCode,
            authCode,
            celphoneReadOnly,
            telInputcelphoneReadOnly,
            telephone,
            telephoneCheck,
            snsList,
            snsLists,
            msgText
        } = this.state;
        const getSnsMappingInfo = () => {
            let addHtml = '';
            if (typeof snsLists[0] != 'undefined') {
                for (let i = 0; i < snsLists.length; i++) {
                    let target = snsList[i];
                    if (i != 0 && i != snsLists.length) {
                        addHtml += ', ';
                    }

                    let snsName = '';
                    if (snsLists[i].snsType == 'KAKAO') {
                        snsName = '카카오';
                    } else if (snsLists[i].snsType == 'NAVER') {
                        snsName = '네이버';
                    } else if (snsLists[i].snsType == 'GOOGLE') {
                        snsName = '구글';
                    } else if (snsLists[i].snsType == 'APPLE') {
                        snsName = '애플';
                    }
                    addHtml += snsName;
                }
            }
            else {
                addHtml = '연동한 소셜 계정이 없습니다.';
            }
            return addHtml;
        };
        return (
            <section className="persnal_info">
                <h2 className="blind">
                    회원정보 수정
                </h2>

                {/* <!-- 통합회원 전환 안내 --> */}
                {loginInfo.ssoMemberYN !== 'Y' && (
                    <div className="info_modify">
                        <Link to='/conversion/agree'><img src="../images/member/bnr_benefit2.png"
                                                         alt="비바샘 통합회원 전환하기"/></Link>
                    </div>
                )}
                {/* <!-- //통합회원 전환 안내 --> */}
                <div className="persnal_cont renew07">
                    <h2 className="info_tit">
                        <label htmlFor="ipt_name">이름</label>
                    </h2>
                    <input
                        type="text"
                        id="ipt_name"
                        autoCapitalize="none"
                        value={info.userName}
                        className="input_sm"
                        readOnly/>
                    <h2 className="info_tit mt20">
                        <label htmlFor="ipt_id">아이디</label>
                    </h2>
                    <input
                        type="text"
                        id="ipt_id"
                        value={info.userId}
                        className="input_sm"
                        readOnly/>
                    <h2 className="info_tit mt20">
                        <label htmlFor="ipt_email">이메일</label>
                    </h2>
                    <div className="input_wrap mb20">
                        <input type="text"
                               placeholder="이메일을 입력하세요."
                               id="ipt_email"
                               name="email"
                               ref="email"
                               value={info.email}
                               onChange={this.handleChange}
                               className="input_sm"/>
                        {/*<button
                            type="button"
                            onClick={this.duplicateEmailClick}
                            className="input_in_btn btn_gray">중복확인
                        </button>*/}
                    </div>
                    <h2 className="info_tit mt20">
                        <label htmlFor="ipt_phone">휴대전화번호</label>
                    </h2>
                    <div className="input_wrap mb5">
                        <input
                            type="tel"
                            placeholder="휴대전화번호 입력하세요."
                            id="ipt_phone"
                            ref="telephone"
                            name="telephone"
                            onChange={this.handleChange}
                            value={telephone}
                            maxLength="13"
                            className="input_sm"
                            readOnly={telInputcelphoneReadOnly}/>
                        {!telephoneCheck &&
                        <button
                            type="button"
                            className="input_in_btn btn_gray"
                            onClick={this.duplicateCelPhoneClick}
                            disabled={telInputcelphoneReadOnly}>인증번호 발송
                        </button>
                        }
                    </div>
                    <p>{msgText} </p>

                    {telInputcelphoneReadOnly &&
                    <Fragment>
                        <h2 className="info_tit mt20">
                            <label htmlFor="ipt_phone">인증번호</label>
                        </h2>
                        <div className="input_wrap mb5">
                            <input type="text"
                                   className=""
                                   maxLength={6}
                                   name="authCode"
                                   value={authCode}
                                   onChange={this.handleNumberChange}
                                   readOnly={celphoneReadOnly}/>
                            <button type="button"
                                    className="input_in_btn btn_gray"
                                    onClick={this.snsSleepWakeUp}>인증번호 확인
                            </button>
                        </div>
                    </Fragment>
                    }

                    {info.ssoMember == '1' && info.regDate >= '2023-09-24' &&
                        <Fragment>
                            <h2 className="info_tit mt20"><label htmlFor="ipt_belong">회원유형</label></h2>
                            <div className="input_wrap">
                                <div className="selectbox select_sm">
                                    <select name="memberTypeCode" value={agree.mTypeCd} onChange={(e) => this.changeMemberTypeCode(e.target.value)}>
                                        <option value="0">학교 선생님</option>
                                        <option value="2">교육 대학생</option>
                                        <option value="1">교육 전문직원</option>
                                        <option value="3">일반</option>
                                    </select>
                                </div>
                            </div>
                        </Fragment>
                    }

                    {agree.mTypeCd != '3' && agree.mTypeCd != '4' &&
                    <Fragment>
                        <h2 className="info_tit mt20"><label htmlFor="ipt_belong">소속</label></h2>
                        <div className="input_wrap">
                            <input
                                type="text"
                                placeholder="소속을 선택해 주세요"
                                className="input_sm bgfff"
                                value={school.schoolName}
                                ref="schoolName"
                                readOnly/>
                            <button
                                className="input_in_btn btn_gray"
                                onClick={this.openPopupSchool}>소속 검색
                            </button>
                        </div>
                    </Fragment>
                    }
                    {agree.mTypeCd == '0' &&
                    <Fragment>
                        <div style={{display: gradeSubVisible ? 'block' : 'none'}}>
                            <h2 className="info_tit mt20">
                                <label htmlFor="ipt_grade01">담당학년</label>
                            </h2>
                            <div className="input_wrap">
                                <ul className="join_ipt_chk">
                                    <li className="join_chk_list">
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g01"
                                            name="grade"
                                            ref="grade"
                                            checked={school.grade.g01.checked}
                                            onChange={this.handleChange}/>
                                        <label htmlFor="g01">1학년</label>
                                    </li>
                                    <li className="join_chk_list">
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g02"
                                            name="grade"
                                            checked={school.grade.g02.checked}
                                            onChange={this.handleChange}/>
                                        <label htmlFor="g02">2학년</label>
                                    </li>
                                    <li className="join_chk_list">
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g03"
                                            name="grade"
                                            checked={school.grade.g03.checked}
                                            onChange={this.handleChange}/>
                                        <label htmlFor="g03">3학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{display: gradeVisible ? 'block' : 'none'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g04"
                                            name="grade"
                                            checked={school.grade.g04.checked}
                                            onChange={this.handleChange}/>
                                        <label htmlFor="g04">4학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{display: gradeVisible ? 'block' : 'none'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g05"
                                            name="grade"
                                            checked={school.grade.g05.checked}
                                            onChange={this.handleChange}/>
                                        <label htmlFor="g05">5학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{display: gradeVisible ? 'block' : 'none'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g06"
                                            name="grade"
                                            checked={school.grade.g06.checked}
                                            onChange={this.handleChange}/>
                                        <label htmlFor="g06">6학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{display: gradeVisible ? 'block' : 'none'}}>
                                        <input
                                            type="checkbox"
                                            className="checkbox_circle"
                                            id="g07"
                                            name="grade"
                                            checked={school.grade.g07.checked}
                                            onChange={this.handleChange}/>
                                        <label htmlFor="g07">교과전담</label>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Fragment>
                    }

                    <div style={{display: agree.mTypeCd == '0' && subjectVisible ? 'block' : 'none'}}>
                        <h2 className="info_tit mt20">
                            내 교과
                        </h2>
                        <div className="input_wrap" ref="mainSubject">
                            <SubjectSelectContainer name="mainSubject" value={school.mainSubject} code={subjectCode} schoolGrade={school.schoolGrade}
                                                    handleChange={this.handleChange}/>
                        </div>
                        <p className="mt5 c_gray">
                            나의 교실에서 ‘내 교과서’를 설정하면 비바샘의 맞춤형 서비스가 제공됩니다.​
                        </p>
                        <div className="join_more_top">
                            <button
                                type="button"
                                onClick={this.handleClick}
                                className="btn join_more_btn">
                                <span>{subjectAddVisible ? '교과제거 -' : '교과추가 +'}</span>
                            </button>
                        </div>
                        <div className="join_info_more">
                            <div ref="secondSubject" style={{display: subjectAddVisible ? 'block' : 'none'}}>
                                <SubjectSelectContainer name="secondSubject" value={school.secondSubject}
                                                        code={subjectCode} schoolGrade={school.schoolGrade} handleChange={this.handleChange}/>
                            </div>
                        </div>
                    </div>
                    {/* <h2 className="info_tit mt25">
						<label htmlFor="ipt_choice">
							비상교과서 채택 여부
						</label>
					</h2>
					<div className="input_wrap">
						<ul className="join_ipt_chk ">
							<li className="join_chk_list">
								<input
									type="radio"
									className="checkbox_circle"
									id="ipt_select01"
									name="visangTbYN"
									ref="visangTbYN"
									value="Y"
									checked={school.visangTbYN === 'Y'}
									onChange={this.handleChange}/>
								<label htmlFor="ipt_select01">채택</label>
							</li>
							<li className="join_chk_list">
								<input
									type="radio"
									className="checkbox_circle"
									id="ipt_select02"
									name="visangTbYN"
									value="N"
									checked={school.visangTbYN === 'N'}
									onChange={this.handleChange}/>
								<label htmlFor="ipt_select02">미채택</label>
							</li>
						</ul>
					</div>*/}

                    {/*{info.ssoMember === '1' && (*/}
                    {/*	<Fragment>*/}
                    {/*		<h2 className="info_tit mt25">회원 통합 여부</h2>*/}
                    {/*		<div className="c_black">*/}
                    {/*			비상교육 선생님 통합회원*/}
                    {/*			<p className="mt5 c_gray">({info.ssoRegDate}에 통합 가입되셨습니다.)</p>*/}
                    {/*		</div>*/}
                    {/*	</Fragment>*/}
                    {/*)}*/}

                    <h2 className="info_tit mt20 dash_box_top">
                        <label htmlFor="ipt_choice">
                            마케팅 및 광고 활용 동의
                        </label>
                    </h2>
                    <div className="input_wrap mt10">
                        <p className="join_chk_label">비바샘 교수지원서비스</p>
                        <ul className="join_ipt_chk ">
                            <li className="join_chk_list">
                                <input
                                    type="checkbox"
                                    className="checkbox_circle"
                                    id="ipt_add01"
                                    name="marketingSms"
                                    checked={agree.marketingSms}
                                    onChange={this.handleAgreeChange}
                                />
                                <label htmlFor="ipt_add01">SMS</label>
                            </li>
                            <li className="join_chk_list">
                                <input
                                    type="checkbox"
                                    className="checkbox_circle"
                                    id="ipt_add02"
                                    name="marketingEmail"
                                    checked={agree.marketingEmail}
                                    onChange={this.handleAgreeChange}
                                />
                                <label htmlFor="ipt_add02">이메일</label>
                            </li>
                            <li className="join_chk_list">
                                <input
                                    type="checkbox"
                                    className="checkbox_circle"
                                    id="ipt_add03"
                                    name="marketingTel"
                                    checked={agree.marketingTel}
                                    onChange={this.handleAgreeChange}
                                />
                                <label htmlFor="ipt_add03">전화</label>
                            </li>
                        </ul>

                        {loginInfo.ssoMemberYN == 'Y' &&
                        <Fragment>
                            <p className="join_chk_label mt15">비바샘 원격교육연수원</p>
                            <ul className="join_ipt_chk ">
                                <li className="join_chk_list">
                                    <input
                                        type="checkbox"
                                        className="checkbox_circle"
                                        id="ipt2_add01"
                                        name="tschMarketingSms"
                                        checked={agree.tschMarketingSms}
                                        onChange={this.handleAgreeChange}
                                    />
                                    <label htmlFor="ipt2_add01">SMS</label>
                                </li>
                                <li className="join_chk_list">
                                    <input
                                        type="checkbox"
                                        className="checkbox_circle"
                                        id="ipt2_add02"
                                        name="tschMarketingEmail"
                                        checked={agree.tschMarketingEmail}
                                        onChange={this.handleAgreeChange}
                                    />
                                    <label htmlFor="ipt2_add02">이메일</label>
                                </li>
                                <li className="join_chk_list">
                                    <input
                                        type="checkbox"
                                        className="checkbox_circle"
                                        id="ipt2_add03"
                                        name="tschMarketingTel"
                                        checked={agree.tschMarketingTel}
                                        onChange={this.handleAgreeChange}
                                    />
                                    <label htmlFor="ipt2_add03">전화</label>
                                </li>
                            </ul>
                        </Fragment>
                        }
                    </div>
                    <p className="mt5 join_info_txt">
                        마케팅 정보 수신 동의 시 다양한 업데이트 안내 및 이벤트 정보를 받아보실 수 있습니다.
                    </p>

                    <h2 className="info_tit mt20">
                        SNS 연동
                    </h2>
                    { !this.state.isShowWhale &&
                    <div className="input_wrap mb5">
                        <input
                            type="text"
                            value={getSnsMappingInfo()}
                            className="input_sm"
                            readOnly/>
                    </div>
                    }
                    { this.state.isShowWhale &&
                    <ul className="modify_sns_link">
                        <li className={this.state.snsList.NAVER ? "linked" : ""}>
                            <p className="naver">
                                네이버
                            </p>
                            <div className="sns_btn_wrap">
                                <button type="button" className="btn_link"
                                        onClick={(e) => {
                                            this.naverLogin("link", e)
                                        }}>연결하기
                                </button>
                                <button type="button" className="btn_complete"
                                        onClick={(e) => {
                                            this.naverLogin("unlink", e)
                                        }}>연결완료
                                </button>
                            </div>
                        </li>
                        <li className={this.state.snsList.KAKAO ? "linked" : ""}>
                            <p className="kakao">
                                카카오
                            </p>
                            <div className="sns_btn_wrap">
                                <button type="button" className="btn_link"
                                        onClick={(e) => {
                                            this.kakaoLogin("link", e)
                                        }}>연결하기
                                </button>
                                <button type="button" className="btn_complete"
                                        onClick={(e) => {
                                            this.kakaoLogin("unlink", e)
                                        }}>연결완료
                                </button>
                            </div>
                        </li>
                        <li className={this.state.snsList.GOOGLE ? "linked" : ""}>
                            <p className="google">
                                구글
                            </p>
                            <div className="sns_btn_wrap">
                                <button type="button" className="btn_link"
                                        onClick={(e) => {
                                            this.googleLogin("link", e)
                                        }}>연결하기
                                </button>
                                <button type="button" className="btn_complete"
                                        onClick={(e) => {
                                            this.googleLogin("unlink", e)
                                        }}>연결완료
                                </button>
                            </div>
                        </li>
                        <li className={this.state.snsList.WHALESPACE ? "linked" : ""}>
                            <p className="whale">
                                웨일 스페이스
                            </p>
                            <div className="sns_btn_wrap">
                                <button type="button" className="btn_link"
                                        onClick={(e) => {
                                            this.whaleLogin("link", e)
                                        }}>연결하기
                                </button>
                                <button type="button" className="btn_complete"
                                        onClick={(e) => {
                                            this.whaleLogin("unlink", e)
                                        }}>연결완료
                                </button>
                            </div>
                        </li>
                        {this.state.isAppleLogin &&
                        <li className={this.state.snsList.APPLE ? "linked" : ""}>
                            <p className="apple">
                                애플
                            </p>
                            <div className="sns_btn_wrap">
                                <button type="button" className="btn_link" onClick={(e) => {
                                    this.appleLogin("link", e)
                                }}>연결하기
                                </button>
                                <button type="button" className="btn_complete" onClick={(e) => {
                                    this.appleLogin("unlink", e)
                                }}>연결완료
                                </button>
                            </div>
                        </li>
                        }
                    </ul>
                    }
                    {/*<h2 className="info_tit mt20">
						개인정보 유효기간 설정
					</h2>
					<div className="radio_rect join_radio_rect">
                        <span className="radio_rect_item">
                            <input
	                            type="radio"
	                            id="op05"
	                            name="expiryTermNum"
	                            value="1"
	                            checked={school.expiryTermNum === '1'}
	                            onChange={this.handleChange}
                            />
                            <label htmlFor="op05">1년</label>
                        </span>
						<span className="radio_rect_item">
                            <input
	                            type="radio"
	                            id="op04"
	                            name="expiryTermNum"
	                            value="3"
	                            checked={school.expiryTermNum === '3'}
	                            onChange={this.handleChange}
                            />
                            <label htmlFor="op04">3년</label>
                        </span>
						<span className="radio_rect_item">
                            <input
	                            type="radio"
	                            id="op03"
	                            name="expiryTermNum"
	                            value="5"
	                            checked={school.expiryTermNum === '5'}
	                            onChange={this.handleChange}
                            />
                            <label htmlFor="op03">5년</label>
                        </span>
						<span className="radio_rect_item">
                            <input
								type="radio"
								id="op03"
								name="expiryTermNum"
								value="0"
								checked={school.expiryTermNum === '0'}
								onChange={this.handleChange}
							/>
                            <label htmlFor="op03">회원탈퇴시</label>
                        </span>
					</div>
					<p className="mt15">
						<strong className="bold">개인정보 유효기간제란?</strong><br/>고객님의 개인정보 보호를 위해 일정 기간 로그인 기록이 없는 고객님의 개인정보를
						삭제 또는 별도로 분리 저장하는 제도입니다. 개인정보 유효기간제 선택 시 해당 기간 동안 로그인하지 않으셔도 개인정보를 삭제 또는 별도 분리하지 않습니다.<br/>
						다만 별도 요청이 없을 경우 일정 기간 후에 휴면 회원으로 분리됩니다.
					</p>
					<p className="mt15 txt_caution">※ 개인정보 유효기간을 3년 이상으로 설정 시, 장기 미접속에 따른 휴면계정 및 자동 탈퇴를 방지할 수 있습니다.</p>*/}
                </div>
                <div className="guideline"/>
                <div className="confirm_msg">
                    <p className="confirm_txt">
                        변경하신 회원정보를 저장하시겠습니까?
                    </p>
                </div>
                <button
                    onClick={this.updateButtonClickSafe}
                    className="btn_full_on">
                    개인정보 변경
                </button>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        agree: state.join.get('agree').toJS(),
        check: state.join.get('check').toJS(),
        isApp: state.base.get('isApp'),
        info: state.join.get('info').toJS(),
        school: state.join.get('school').toJS(),
        initInfo: state.join.get('initInfo').toJS(),
        initSchool: state.join.get('initSchool').toJS(),
        initAgree: state.join.get('initAgree').toJS(),
        initSnsList: state.join.get('initSnsList').toJS(),
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        JoinActions: bindActionCreators(joinActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(MyInfoModifyContainer));