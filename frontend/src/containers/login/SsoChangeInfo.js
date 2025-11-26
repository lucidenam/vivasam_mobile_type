import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import moment from 'moment';
import * as popupActions from 'store/modules/popup';
import * as ConversionActions from 'store/modules/conversion';
import * as baseActions from 'store/modules/base';
import * as common from 'lib/common';
import InfoText from 'components/login/InfoText';
import {initializeGtag} from "../../store/modules/gtag";
import FindSchool from "./FindSchool";
import {Cookies} from "react-cookie";
import {SESSION_LOGGED_KEY} from "../../constants";
import * as api from "../../lib/api";
import {isProd} from "../../lib/TargetingUtils";

const cookies = new Cookies();

class SsoChangeInfo extends Component {

    constructor(props) {
        super(props);
        this.Checkpassword = React.createRef();
        this.password = React.createRef();
    }

    state = {
        loading: true,
        duplacateIdCheck: false,
        duplacateEmailCheck: true,
        passwordRule: false,
        passwordMessage: '',
        passwordClassName: '',
        passwordCheckMessage: '',
        passwordCheckClassName: '',
        phoneCheckMessage: '',
        phoneCheckClassName: '',
        telephoneCheck: false,
        gradeVisible: false,
        gradeSubVisible: false,
        findOnclick: false, // true : 클릭 불가 상태 , false : 클릭 가능 상태
        joinComplete:false,
        telephone: '',
        authCode : '',
        randomNumber : '',
        msgText:'',
        min: moment().subtract(74, 'years').format("YYYY-MM-DD"),
        max: moment().subtract(24, 'years').format("YYYY-MM-DD"),


        // 교사 인증
        file: null,
        fileName: '[+]버튼을 눌러 파일을 첨부해주세요.',
        fileUrl: null,
        comment: '',
        certification: 4, // 교사인증 방식 ( 1:공직자메일, 2:서류인증, 0:나중에하기)
        validCertifyMail: false, // 공직자 메일인증 여부
        certifiNum: '',	// 인증코드
        uuidForCertifiNum: '',	// 인증uuid
        validCertifyFile: false, // 서류인증 여부
        eMailDomain: '',
        anotherEmailDomain: '',
        certifyConfirmMessage: '',
    }

    componentDidMount() {
        initializeGtag();
        function gtag() {
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/conversion/info',
            'page_title': '회원 정보 입력 | 통합전환｜비바샘'
        });
        const {logged, agree, check, history, ConversionActions} = this.props;

        //미로그인시 로그인페이지 이동
        if (!logged) {
            history.replace("/login");
            return;
        }

        //redux 값은 새로고침시 사라짐 / 처음부터 다시 입력하게 함
        if (!agree.thirdPrivacy) {
            history.replace('/conversion/agree');
        } else if (check.ssoId === "") {
            history.replace('/conversion/check');
        }

        this.props.info['newUserId'] = check.ssoId;
        this.props.info['tschUserId'] = check.tId;
        this.props.info['password'] = '';
        this.props.info['passwordCheck'] = '';
        ConversionActions.pushValues({type: 'info', object: this.props.info});

        this.memberInfo();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    memberInfo = async () => {
        const {ConversionActions, history} = this.props;
        try {
            const {school} = await ConversionActions.memberInfo();
            if (this._isMounted && this.props.info.ssoMember) {
                common.error('이미 통합회원으로 메인으로 이동합니다.');
                history.replace('/');
            }
            if (this._isMounted && this.props.info.telephone) {
                this.setState({
                    telephoneCheck: true
                })
            }
            if (this._isMounted && this.props.info.birthDay) {
                this.setState({
                    time: moment(this.props.info.birthDay, "YYYY-MM-DD").toDate()
                })
            }
            if (this._isMounted && this.props.info.userName) {
                this.setState({loading: false});
            }
        } catch (e) {
            console.log(e);
        } finally {
            this.setState({loading: false});
        }
    }

    handleChange = (e) => {
        const {info, agree, ConversionActions} = this.props;

        if(e.target.name === "mTypeCd") {
            agree[e.target.name] = e.target.value;
            ConversionActions.pushValues({type: "agree", object: agree});
        } else {
            info[e.target.name] = e.target.value;
            ConversionActions.pushValues({type: "info", object: info});

            if (e.target.name === "password") {
                this.checkpassword2(e.target.value);
                if (this.refs.Checkpassword.value) {
                    this.setPassWordCheckMessage(this.refs.Checkpassword.value);
                }
            } else if (e.target.name === "passwordCheck") {
                this.setPassWordCheckMessage(e.target.value);
            }
        }
    }

    setPassWordCheckMessage = (value) => {
        let clazz = 'point_red';
        let text = "입력하신 비밀번호와 일치하지 않습니다.";
        if (this.checkpassword()) {
            clazz = 'point_color_blue';
            text = "동일한 비밀번호 입니다.";
        } else if (value === "") {
            text = "";
        }
        this.setState({
            passwordCheckMessage: text,
            passwordCheckClassName: clazz
        });
    }

    //암호 규칙 확인
    checkpassword2 = (value) => {
        const {info} = this.props;

        let pass = value;
        let pattern1 = /[0-9]/;
        let pattern2 = /[a-zA-Z]/;
        let pattern3 = /[!@#$%^&*()?_~]/;
        let chk = 0;
        let text = '';
        let clazz = 'mt5 point_red';
        let ruleCheck = false;
        if (pass.search(/[0-9]/g) !== -1) chk++;
        if (pass.search(/[a-zA-Z]/ig) !== -1) chk++;
        if (pass.search(/[!@#$%^&*()?_~]/g) !== -1) chk++;
        if (pass === "") {
            clazz = ''
            text = "";
        } else if (pass.length < 8) {
            text = "최소 8자 이상 작성해주세요.";
        } else if (chk < 2) {
            text = "영문, 숫자 조합으로 10자 이상 혹은 특수문자 포함하여 \n" + "8자 이상으로 입력해주세요.";
        } else if (pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
            text = "8자 이상으로 입력해주세요.";
        } else if (pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
            text = "영문, 숫자 조합으로 10자 이상 혹은 특수문자 포함하여 \n" + "8자 이상으로 입력해주세요.";
        } else if (pass.indexOf(info.userId) > -1 && info.userId !== "") {
            text = "사용 가능한 비밀번호입니다.";
        } else {
            clazz = 'mt5 point_color_blue';
            text = "사용하실 수 있는 비밀번호 입니다.";
            ruleCheck = true;
        }
        this.setState({
            passwordClassName: clazz,
            passwordMessage: text,
            passwordRule: ruleCheck
        });
    }

    //동일 암호 확인
    checkpassword = () => {
        const {info} = this.props;
        if (info.password !== info.passwordCheck) {
            return false;
        }
        return true;
    }

    openPopupSchool = () => {
        const { PopupActions } = this.props;
        PopupActions.openPopup({ title: "소속 검색", componet: <FindSchool handleSetSchool={this.handleSetSchool} />, wrapClassName:"auto_content" });
    }

    handleSetSchool = async (obj) => {
        let { school, PopupActions, ConversionActions } = this.props;

        //학년, 내교과 hidden
        this.setState({
            gradeVisible: obj.schoolGrade !== 'E' ? false : true,
            subjectVisible: obj.schoolGrade !== 'E' ? true : false,
            subjectAddVisible: false,
            gradeSubVisible: obj.schoolGrade !== 'E' && obj.schoolGrade !== 'M' && obj.schoolGrade !== 'H' ? false : true,
        });
        //내교화 초기화
        school.mainSubject = '';
        school.secondSubject = '';
        //담당 학년 초기화
        school.myGrade = '';
        for (var key in school.grade) {
            school.grade[key].checked = false;
        }

        await ConversionActions.pushValues({ type: "school", object: { ...school, ...obj } });

        PopupActions.closePopup();
    }

    handleChangeSchool = (e) => {
        const {school, ConversionActions} = this.props;

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
        } else {
            school[e.target.name] = e.target.value;
        }

        ConversionActions.pushValues({ type: "school", object: school });
    }

    handlerCertification = (e) => {
        if(e.target.value == 1){
            this.setState({
                certification: 1
            });
        }else if(e.target.value == 2){
            this.setState({
                certification: 2
            });
        }else if(e.target.value == 0){
            this.setState({
                certification: 0
            });
        }
    }

    handleChangeCertifiNum = (e) => {

        this.setState({
            certifiNum: e.target.value
        });

    }

    // 인증코드 발송
    sendCertifyMail = async () => {
        const {eMailDomain, anotherEmailDomain} = this.state;
        const {loginInfo} = this.props;

        if(eMailDomain === "" || anotherEmailDomain === "") {
            common.error('메일 주소를 입력해 주세요.');
            return;
        }

        let memberValidateEmail = eMailDomain + "@" + anotherEmailDomain;
        let reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
        if (!reg_email.test(memberValidateEmail)) {
            common.error('정확한 이메일 주소를 입력해 주세요.');
            return;
        }

        const isEmailTest = !isProd();
        const response = await api.sendCertifyMail(memberValidateEmail, isEmailTest, loginInfo.memberId);
        let uuidForCertifiNum = '';

        if(response.data != '' && response.data.result == 0) {
            uuidForCertifiNum = response.data.uuidForCertifiNum

            //메일 테스트 코드. 개발에서는 메일발송 지원을 안하여 만든 검수용 코드입니다.
            if(isEmailTest) common.info('인증코드가 발송되었습니다. \n테스트용 인증 코드 : ' + response.data.certifiNum);
            else common.info('인증코드가 발송되었습니다.');
        } else if(response.data != '' && response.data.result == 1) {
            common.info('이미 교사인증받은 메일 주소입니다.');
            return;
        } else {
            common.error("처리 중 오류가 발생 하였습니다.");
            return;
        }

        this.setState({
            validCertifyMail: false,
            uuidForCertifiNum: uuidForCertifiNum,
        })

    }

    // 인증코드 인증하기
    checkCertifyMail = async () => {
        const {info, ConversionActions, loginInfo} = this.props;
        const {eMailDomain, anotherEmailDomain, certifiNum, uuidForCertifiNum} = this.state;

        if(certifiNum !== '' && certifiNum.length === 6 && uuidForCertifiNum !== '') {
            //서버에서 인증번호 확인
            let memberValidateEmail = eMailDomain + "@" + anotherEmailDomain;
            const response = await api.checkCertifyMail(certifiNum, uuidForCertifiNum, memberValidateEmail, loginInfo.memberId);
            if(response.data.code === '0') {
                this.setState({
                    certifyConfirmMessage: '인증 완료',
                    validCertifyMail: true,
                });
                info['memberValidateType'] = "1";
                info['memberValidateEmail'] = memberValidateEmail;
                ConversionActions.pushValues({type: "info", object: info});
            } else if(response.data.code === '1') {
                common.error("인증코드를 확인해주세요.");
            } else if(response.data.code === '3') {
                common.error("인증코드가 일치하지 않습니다.\n정확한 인증 코드를 다시 확인해 주세요.\n만약 어려움이 있으시다면, ‘나중에 하기’를 선택하셔서 가입 완료 후에 교사 인증을 진행하실 수 있습니다.");
            } else {
                common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
            }
        } else {
            common.error("인증코드를 확인해주세요.");
        }
    }

    handleFiles = (e) => {
        const {school} = this.props;
        const files = e.target.files;

        // if (school.schoolCode === "") {
        //     common.error("소속을 먼저 입력해주세요.");
        //     return false;
        // }

        if (school.schoolCode === 99999 || school.schoolCode === 99998 || school.schoolCode === 99997 || school.schoolCode === 99991 || school.schoolCode === 99992 || school.schoolCode === 99993) {
            common.error("소속 등록 신청이 완료되어야 서류 인증 신청이 가능합니다.");
            return false;
        }

        if (files && files.length > 0) {
            let fileLength = files.length;
            let fileName = files[0].name;
            let fileNameLen = fileName.length;
            let lastDot = fileName.lastIndexOf('.');
            let fileExt = fileName.substring(lastDot+1, fileNameLen).toLowerCase();
            let whiteList = ['jpg','png','jpeg','gif','pdf'];
            let checkExt = false;

            for(let i=0; i<whiteList.length; i++){
                if(whiteList[i].toLowerCase() === fileExt.toLowerCase()){
                    checkExt = true;
                    break;
                }
            }
            if(!checkExt) {
                common.error("파일 첨부는 jpg, gif, png, pdf 파일만 가능합니다.");
                return false;
            }

            if(fileLength > 3) {
                common.info("파일은 최대 3개까지만 등록됩니다.");
                return false;
            }

            if(fileLength > 1){
                fileName += ' 외 ' + (fileLength-1) + '개';
            }

            this.setState({
                file: files,
                fileName: files[0].name ? fileName : '없음',
                validCertifyFile: true,
            });

        }
    }

    setComment = (e) => {
        let comment = e.target.value;

        this.setState({
            comment: comment,
        });
    };

    setEmailDomain = (e) => {
        this.setState({
            eMailDomain: e.target.value.replaceAll(' ', ''),
            validCertifyMail: false,
        });
    };

    setAnotherEmailDomain = (e) => {
        if (e.target.name === 'emailDomain') {
            this.setState({
                anotherEmailDomain: e.target.value,
                validCertifyMail: false,
            })
        }
    };

    insertSsoConversionJoinClick = (e) => {
        e.preventDefault();
        const {info, school, agree} = this.props;
        const {file} = this.state;
        let clazz = 'point_red';
        let obj = {result: false, message: ''}
        this.checkpassword2(info.password);

        if (!info.password) {
            obj.message = '비밀번호를 입력해주세요.';
        } else if (!this.state.passwordRule) {
            obj.message = this.state.passwordMessage;
        } else if (!info.passwordCheck) {
            obj.message = '비밀번호 확인란에 입력해주세요.';
        } else if (info.password !== info.passwordCheck) {
            obj.message = '입력하신 비밀번호와 일치하지 않습니다.';
        } else if (!agree.mTypeCd) {
            obj.message = '회원 유형을 입력해주세요.';
        } else if ((agree.mTypeCd === "0" || agree.mTypeCd === "1" || agree.mTypeCd === "2") && (school.schoolName === "" || school.schoolCode === "")) {
            obj.message = '소속을 입력해주세요';
        } else if (agree.mTypeCd === "0" && this.state.gradeSubVisible && school.myGrade === "") {
            obj.message = '담당학년은 필수 선택 항목입니다.';
        } else if (info.validYN != 'Y' && (agree.mTypeCd == 0 || agree.mTypeCd == 2) && this.state.certification === 4) {
            obj.message = (agree.mTypeCd === "0" ? '서류' : '재학') + ' 인증을 선택해주세요.';
        } else if (this.state.certification === 1 && !this.state.validCertifyMail) {
            obj.message = '공직자 메일 인증을 완료해주세요.';
        } else if (this.state.certification === 2 && !this.state.validCertifyFile) {
            obj.message = '서류 인증을 완료해주세요.';
        } else if(file && file.length > 3){
            obj.message = '파일은 최대 3개까지만 등록됩니다.';
        } else {
            obj.result = true;
        }

        if (this._isMounted) {
            this.setState({
                resultMessage: obj.message,
                resultClassName: clazz
            });
        }

        if (obj.result) {
            this.insertSsoConversion();
        } else {
            common.error(obj.message);
        }
    }

    insertSsoConversion = async () => {
        const {info, school, agree, check, history, BaseActions, ConversionActions} = this.props;

        info['checkCase'] = check.checkCase;
        await ConversionActions.pushValues({ type: "info", object: { ...info} });

        try {
            sessionStorage.removeItem(SESSION_LOGGED_KEY);

            BaseActions.openLoading();

            //오프라인 프로모션 코드 심기
            let promtCd = cookies.get('promtCd');
            if (promtCd !== undefined) school.promtCd = promtCd;

            let code = await ConversionActions.inserSsoConversion({...agree, ...info, ...school});

            //통합회원 전환 성공
            if (code.data === '0000') {
                // 서류인증 파일
                if(this.state.certification === 2 && this.state.file) {
                    this.teacherCertifyUpload(info.userId);
                }

                if (window.__isApp) {
                    window.webViewBridge.send('getPushToken', '', function (res) { //Browser 에서는 동작하지 않습니다. WebView 에서만.
                        if (res.value) {
                            api.syncAppToken(res.value, info.userId);
                        }
                    }, function (err) {
                        //Do nothing.
                    });
                }

                //로그아웃처리
                BaseActions.logout();
                // SNS로그인 정보 삭제
                sessionStorage.removeItem('snsObject');

                setTimeout(() => {
                    history.push("/conversion/teacher");

                    ConversionActions.pushValues({type: 'info', object: info});
                    this.setState({
                        findOnclick: false
                    });
                }, 100);//의도적 지연.
            } else {
                sessionStorage.setItem(SESSION_LOGGED_KEY, 'true');

                if (code.data === 1) {
                    common.error("아이디를 입력해주세요.");
                    this.setState({
                        findOnclick: false
                    });
                } else if (code.data === 2) {
                    common.error("이름을 입력해주세요.");
                    this.setState({
                        findOnclick: false
                    });
                } else if (code.data === 3) {
                    common.error("비밀번호를 입력해주세요.");
                    this.setState({
                        findOnclick: false
                    });
                } else if (code.data === 4) {
                    common.error("이미 사용중인 아이디 입니다.");
                    this.setState({
                        findOnclick: false
                    });
                } else if (code.data == 5) {
                    common.error("이미 사용중인 이메일 입니다.");
                    this.setState({
                        findOnclick: false
                    });
                } else {
                    common.error("통합회원 전환이 정상적으로 처리되지 못하였습니다.");
                    this.setState({
                        findOnclick: false
                    });
                }
            }
            return code.data;
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 100);//의도적 지연.
        }
    }

    teacherCertifyUpload = async (userId) => {
        const {BaseActions} = this.props;
        const {file, comment} = this.state;
        // 파일체크
        const formData = new FormData();
        for(let i=0; i<file.length; i++){
            formData.append('uploadfile', file[i]);
            formData.append('filename', encodeURI(file[i].name));
        }
        formData.append('userId', userId);
        formData.append('content', encodeURI(comment.trim()));

        BaseActions.openLoading();
        try{
            const response = await api.teacherCertifyUpload(formData);
            //로딩이미지 고려
            if (response.data.code && response.data.code === "0") {
                return true;
            } else if (response.data.code && response.data.code === "1") {
                common.error(response.data.msg);
                return false;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const {agree, check, info, school} = this.props;
        const {
            passwordMessage,
            passwordCheckMessage,
            passwordClassName,
            passwordCheckClassName,
            gradeVisible,
            gradeSubVisible,
            certification,
            fileName,
            comment,
        } = this.state;

        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">회원 정보 입력</h2>
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>3</span>
                    </div>
                </div>
                <section className="join renew renew07">
                    <div className="join_use">
                        <div className="join_info">
                            <h2 className="info_tit">
                                <label htmlFor="ipt_name">이름</label>
                            </h2>
                            <div className="input_wrap mb25">
                                <input
                                    type="text"
                                    id="ipt_name"
                                    value={info.userName}
                                    className="input_sm"
                                    readOnly/>
                            </div>
                            <h2 className="info_tit"><label htmlFor="ipt_id">아이디</label></h2>
                            <div className="input_wrap">
                                <input
                                    type="text"
                                    id="ipt_id"
                                    value={check.ssoId}
                                    className="input_sm"
                                    readOnly/>
                            </div>
                            <h2 className="info_tit mt25">
                                <label htmlFor="ipt_pw">비밀번호</label>
                            </h2>
                            <div className="input_wrap mb5">
                                <input
                                    type="password"
                                    placeholder="영문+숫자 10자 이상/영문+숫자+특수문자 8자 이상"
                                    id="ipt_pw"
                                    name="password"
                                    ref="password"
                                    onChange={this.handleChange}
                                    value={info.password}
                                    className="input_sm"/>
                            </div>
                            <InfoText message={passwordMessage} className={passwordClassName}/>
                            <h2 className="info_tit mt25">
                                <label htmlFor="ipt_pw_certify">
                                    비밀번호 확인
                                </label>
                            </h2>
                            <div className="input_wrap">
                                <input
                                    type="password"
                                    placeholder="비밀번호를 입력하세요"
                                    id="ipt_pw_certify"
                                    name="passwordCheck"
                                    onChange={this.handleChange}
                                    value={info.passwordCheck}
                                    ref="Checkpassword"
                                    className="input_sm"/>
                            </div>
                            <InfoText message={passwordCheckMessage} className={passwordCheckClassName}/>

                            <h2 className="info_tit mt25">
                                <label htmlFor="ipt_email">이메일</label>
                            </h2>
                            <div className="input_wrap mb25 has_btn">
                                <input
                                    type="email"
                                    placeholder="이메일을 입력하세요."
                                    id="ipt_email"
                                    name="email"
                                    ref="email"
                                    onChange={this.handleChange}
                                    value={info.email}
                                    className="input_sm"/>
                                {/*<button type="button"
								        className="input_in_btn btn_gray"
								        onClick={this.duplicateEmailClick}>중복확인
								</button>*/}
                            </div>

                            {agree.mTypeCd != 3 && agree.mTypeCd != 4 &&
                            <Fragment>
                                <h2 className="info_tit mt25"><label htmlFor="ipt_belong">소속</label></h2>
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
                            {agree.mTypeCd == 0 &&
                            <Fragment>
                                <div style={{display: gradeSubVisible ? 'block' : 'none'}}>
                                    <h2 className="info_tit mt25">
                                        <label htmlFor="g01">담당학년</label>
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
                                                    onChange={this.handleChangeSchool}
                                                />
                                                <label htmlFor="g01">1학년</label>
                                            </li>
                                            <li className="join_chk_list">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox_circle"
                                                    id="g02"
                                                    name="grade"
                                                    checked={school.grade.g02.checked}
                                                    onChange={this.handleChangeSchool}
                                                />
                                                <label htmlFor="g02">2학년</label>
                                            </li>
                                            <li className="join_chk_list">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox_circle"
                                                    id="g03"
                                                    name="grade"
                                                    checked={school.grade.g03.checked}
                                                    onChange={this.handleChangeSchool}
                                                />
                                                <label htmlFor="g03">3학년</label>
                                            </li>
                                            <li className="join_chk_list"
                                                style={{display: gradeVisible ? 'block' : 'none'}}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox_circle"
                                                    id="g04"
                                                    name="grade"
                                                    checked={school.grade.g04.checked}
                                                    onChange={this.handleChangeSchool}
                                                />
                                                <label htmlFor="g04">4학년</label>
                                            </li>
                                            <li className="join_chk_list"
                                                style={{display: gradeVisible ? 'block' : 'none'}}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox_circle"
                                                    id="g05"
                                                    name="grade"
                                                    checked={school.grade.g05.checked}
                                                    onChange={this.handleChangeSchool}
                                                />
                                                <label htmlFor="g05">5학년</label>
                                            </li>
                                            <li className="join_chk_list"
                                                style={{display: gradeVisible ? 'block' : 'none'}}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox_circle"
                                                    id="g06"
                                                    name="grade"
                                                    checked={school.grade.g06.checked}
                                                    onChange={this.handleChangeSchool}
                                                />
                                                <label htmlFor="g06">6학년</label>
                                            </li>
                                            <li className="join_chk_list"
                                                style={{display: gradeVisible ? 'block' : 'none'}}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox_circle"
                                                    id="g07"
                                                    name="grade"
                                                    checked={school.grade.g07.checked}
                                                    onChange={this.handleChangeSchool}
                                                />
                                                <label htmlFor="g07">교과전담</label>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Fragment>
                            }

                            {/*	교사 인증 및 재학인증*/}
                            {info.validYN != 'Y' && (agree.mTypeCd == 0 || agree.mTypeCd == 2) ?
                                <Fragment>
                                    <h2 className="info_tit mt25">
                                        { agree.mTypeCd == 0 ? "교사 인증" : "재학 인증"}
                                    </h2>
                                    <div className="radio_rect join_radio_rect rect_blue">
                                        {agree.mTypeCd == 0 ?
                                            <span className="radio_rect_item">
												<input
                                                    type="radio"
                                                    id="tc1"
                                                    name="teacherCertification"
                                                    value="1"
                                                    ref="certification"
                                                    onChange={this.handlerCertification}
                                                />
												<label htmlFor="tc1">공직자 메일 인증</label>
											</span>
                                            : ""
                                        }
                                        <span className="radio_rect_item">
											<input
                                                type="radio"
                                                id="tc2"
                                                name="teacherCertification"
                                                value="2"
                                                onChange={this.handlerCertification}
                                            />
											<label htmlFor="tc2">서류 인증</label>
										</span>
                                        <span className="radio_rect_item">
											<input
                                                type="radio"
                                                id="tc3"
                                                name="teacherCertification"
                                                value="0"
                                                onChange={this.handlerCertification}
                                            />
											<label htmlFor="tc3">나중에 하기</label>
										</span>
                                    </div>
                                    <p className="point_color_blue txt_certification mt10">EPKI/GPKI 인증은 PC에서 가능합니다</p>
                                </Fragment>
                                :
                                ""
                            }

                            {/* 공직자 메일 인증*/}
                            { certification == 1 ?
                                <Fragment>

                                    <p className="mt20">
                                        공직자 메일로 발송한 인증코드를 입력 후 인증하실 수 있습니다.<br />
                                        인증용으로만 사용됩니다.
                                    </p>

                                    <div className="mail_area mt10">
                                        <div className="input_wrap multi_wrap email">
                                            <input
                                                type="text"
                                                name="email"
                                                ref="email"
                                                onChange={this.setEmailDomain}
                                                className="input_sm input_fix_wrap"
                                                value={this.state.eMailDomain}
                                                id="ipt_email"/>
                                            <span className="label_txt">@</span>
                                            <div className="selectbox select_sm">
                                                <select name="emailDomain" ref="emailDomain" id="ipt_email" className="" onChange={this.setAnotherEmailDomain}>
                                                    <option value="">선택</option>
                                                    <option value="korea.kr">korea.kr</option>
                                                    <option value="sen.go.kr">sen.go.kr</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button className='btn_full_on btn_full_gray btn_t_mid mt8 noPosition' onClick={this.sendCertifyMail}>인증코드 발송</button>
                                    </div>

                                    <div>
                                        <input type="number" name="certifiNum" placeholder="인증코드를 입력해주세요."
                                               onChange={this.handleChangeCertifiNum} value={this.state.certifiNum} maxLength="13" className="mt15"/>
                                        <button className="btn_full_on btn_full_red btn_t_mid mt8 noPosition" onClick={this.checkCertifyMail}>인증하기</button>
                                        <InfoText message={this.state.certifyConfirmMessage} class={"point_color_blue"}/>
                                    </div>
                                </Fragment>
                                :
                                ""
                            }

                            {/* 서류 인증 */}
                            { certification == 2 ?
                                <Fragment>

                                    <div className="fileUploadWrap mt20">
                                        <div className="fileWrap">
                                            {/* 첨부 서류 파일명 */}
                                            <input
                                                type="text"
                                                className="fileUpload"
                                                value={ fileName }
                                                readOnly
                                            />
                                            {/* 첨부 버튼 */}
                                            <div className="btnAdd"
                                                 ref={(div) => this.gallrayDiv = div}
                                                 onClick={(e) => {
                                                     if (this.gallrayDiv === e.target) {
                                                         this.gallaryRef.click();
                                                     }
                                                 }}
                                            >
                                                <input
                                                    multiple = "multiple"
                                                    type="file"
                                                    id="file_gallary"
                                                    name="file_gallary[]"
                                                    accept=".jpg, .gif, .png, .pdf"
                                                    onChange={this.handleFiles}
                                                    onClick={this.openPhoto}
                                                    ref={input => this.gallaryRef = input}
                                                    className="ipt_file"/>
                                                <label htmlFor="file_gallary">+</label>
                                            </div>
                                        </div>
                                        <div className="textareaWrap">
										<textarea
                                            id="applyContent"
                                            name="applyContent"
                                            value={comment}
                                            onChange={ this.setComment }
                                            maxLength="300"
                                            placeholder="서류 인증에 참고할 내용이 있다면 기입해 주세요."
                                        ></textarea>
                                        </div>

                                        {agree.mTypeCd == 0 ?
                                            <Fragment>
                                                <p className="fileUpload_txt mt10">교사인증 서류 기준을 확인해주세요.</p>

                                                <ul className="mt10">
                                                    <li>최근 6개월 이내 발급</li>
                                                    <li>학교장 직인 서류</li>
                                                    <li>재직기간 명시</li>
                                                </ul>

                                                <p className="info mt10">
                                                    서류 인증에는 1~2일정도 소요될 수 있습니다.<br />
                                                    (주말, 공휴일 제외)
                                                </p>
                                            </Fragment>
                                            :
                                            <Fragment>
                                                <p className="fileUpload_txt mt10">교육대학생 인증 서류 기준을 확인해 주세요.</p>

                                                <ul className="mt10">
                                                    <li>당해연도 발급한 재학증명서</li>
                                                </ul>

                                                <p className="info mt10">
                                                    서류 인증에는 1~2일정도 소요될 수 있습니다.<br />
                                                    (주말, 공휴일 제외)
                                                </p>
                                                <p className="info mt10">
                                                    교육대학생은 비바샘 일부 서비스 이용이 제한됩니다.
                                                </p>
                                            </Fragment>
                                        }
                                    </div>
                                </Fragment>
                                :
                                ""
                            }

                            <button
                                onClick={this.insertSsoConversionJoinClick}
                                className="btn_full_on mt25 noAbsolute">
                                통합회원 전환하기
                            </button>

                            <div className="info_tell">
                                <div className="tell_box type02">
                                    <div className="line_box">
                                        <p className="line_box_tit">비바샘 선생님 전용 고객센터</p>
                                        <a href="tel:1544-7714" className="ico_tel">
                                            <img src="../images/member/tell2.png" alt="비바샘 선생님 전용 고객센터"/>
                                            <span className="blind">1544-7714</span>
                                        </a>
                                    </div>
                                    <div className="line_box">
                                        <p className="line_box_tit">비바샘 연수원 고객센터</p>
                                        <a href="tel:1544-9044" className="ico_tel">
                                            <img src="../images/member/tell3.png" alt="비바샘 연수원 고객센터"/>
                                            <span className="blind">1544-9044</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get("logged"),
        loginInfo: state.base.get('loginInfo').toJS(),
        agree: state.conversion.get('agree').toJS(),
        check: state.conversion.get('check').toJS(),
        info: state.conversion.get('info').toJS(),
        school: state.conversion.get('school').toJS(),
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        ConversionActions: bindActionCreators(ConversionActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SsoChangeInfo));