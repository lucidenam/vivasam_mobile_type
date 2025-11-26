import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as popupActions from 'store/modules/popup';
import * as ConversionActions from 'store/modules/conversion';
import * as baseActions from 'store/modules/base';
import * as common from 'lib/common';
import * as api from 'lib/api';
import FindSchool from 'containers/login/FindSchool';
import SubjectSelectContainer from 'containers/login/SubjectSelectContainer';
import {initializeGtag} from "../../store/modules/gtag";

class SsoChangeSchool extends Component {

    state = {
        gradeVisible: false,
        subjectVisible: true,
        subjectAddVisible: false,
        subjectCode: 'SC000',
        findOnclick : false // true : 클릭 불가 상태 , false : 클릭 가능 상태
    }

    constructor(props) {
        super(props);
        // Debounce
        this.nextButtonClick = debounce(this.nextButtonClick, 300);

        this.schoolName = React.createRef();
        this.grade = React.createRef();
        this.mainSubject = React.createRef();
        this.secondSubject = React.createRef();
        this.visangTbYN = React.createRef();
        this.expiryTermNum = React.createRef();
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/conversion/school',
            'page_title': '통합회원가입 - 학교검색｜비바샘'
        });
        const { logged, loginInfo, agree, info, school, history } = this.props;

        //미로그인시 로그인페이지 이동
        if (!logged) {
            history.replace("/login");
            return;
        } else if(loginInfo.ssoMemberYN === 'Y' || info.ssoMember === '1') {
            common.error('이미 통합회원으로 메인으로 이동합니다.');
            history.replace('/');
        }

        //redux 값은 새로고침시 사라짐 / 처음부터 다시 입력하게 함
        if (!agree.thirdPrivacy) {
            history.replace('/conversion/agree');
        } else if ( info.newUserId === "" || info.userId === "" || info.userName === "" || info.email === "" || info.telephone === "") {
            history.replace('/conversion/check');
        }

        if(school.secondSubject){
            this.setState({
                subjectAddVisible : true
            })
        }
        if(school.schoolGrade){
            this.setState({
                gradeVisible: school.schoolGrade !== 'E' ? false : true,
                subjectVisible: school.schoolGrade !== 'E' ? true : false,
            });
        }
    }

    openPopupSchool = () => {
        const { PopupActions } = this.props;
        PopupActions.openPopup({ title: "소속 검색", componet: <FindSchool handleSetSchool={this.handleSetSchool} /> });
    }

    handleSetSchool = async (obj) => {
        let { info, school, PopupActions, ConversionActions } = this.props;

        //학년, 내교과 hidden
        this.setState({
        gradeVisible: obj.schoolGrade !== 'E' ? false : true,
        subjectVisible: obj.schoolGrade !== 'E' ? true : false,
        subjectAddVisible: false,
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
        school = { ...school, ...obj }

        if (!school.isSelect) {
            //학교 생성 신청
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
            } else {
                kind_name = "고등";
            }

            if (fkbranchCode === "") {
                fkbranchName = "";
            } else {
                fkbranchName = ' > ' + fkbranchName;
            }
            if (requestedTerm === "별도 요청사항이 있으신 경우, 의견을 남겨 주세요.") {
                requestedTerm = "";
            } else {
                requestedTerm = '- 별도 요청사항  : ' + requestedTerm + '<br/>';
            }
            let qnaCd = 'QA011';
            let qnaTitle = schoolName + '_학교등록신청';
            let qnaContents = `학교등록 신청</br></br>- 학교급  : ${kind_name}<br/>- 학교명  : ${schoolName}<br/>- 학교지역  : ${fkareaName}${fkbranchName}<br/>${requestedTerm}- 학교변경 동의여부  : ${directly_agree}<br/>`;

            try {

                PopupActions.closePopup();
                /* 회원가입시에 한번에 등록할 수 있도록 수정
                    const response = await api.qnaInsert(memberId,qnaCd, schoolGrade,qnaTitle, qnaContents,"json");
                    if(response.data.code === "0000"){
                        PopupActions.closePopup();
                    }else{
                        common.error('신청이 정상적으로 처리되지 못했습니다.');
                    }
                */

            } catch (e) {
                common.error('신청이 정상적으로 처리되지 못했습니다.');
                console.log(e);
            }
        } else {
            PopupActions.closePopup();
        }
    }

    handleChange = (e) => {
        const { school, ConversionActions } = this.props;
        let myGrades = [];
        if (e.target.name === "grade") {
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

    handleClick = (e) => {
        const { school, ConversionActions } = this.props;
        const { subjectAddVisible } = this.state;

        this.setState({
            subjectAddVisible: !subjectAddVisible
        });
        ConversionActions.pushValues({ type: "school", object: school });
    }

    validateSchool = () => {
        const { school } = this.props;
        let obj = { result: false, message: '', focus: '' }
        if (school.schoolName === "" || school.schoolCode === "") {
            obj.message = '재직학교명은 필수 입력 항목입니다.';
            obj.focus = this.refs.schoolName;
        } else if (school.myGrade === "") {
            obj.message = '담당학년은 필수 선택 항목입니다.';
            obj.focus = this.refs.grade;
        } else if (school.schoolGrade !== "E" && school.mainSubject === "") {
            obj.message = '내 교과 설정(대표)은 필수입력항목입니다.';
            obj.focus = this.refs.mainSubject;
        } else if (school.visangTbYN.trim() == "") {
            obj.message = '비상교과서 채택여부는 필수 입력 항목입니다.';
            obj.focus = this.refs.visangTbYN;
        } else if (school.expiryTermNum === "") {
            obj.message = '개인정보 유효 기간을 설정해 주세요.';
            obj.focus = this.refs.expiryTermNum;
        } else {
            obj.result = true;
        }
        return obj;
    }

    conversionButtonClickSafe = (e) => {
        this.conversionButtonClick(e.target);
    }

    conversionButtonClick = async (target) => {
        //TODO 통합 전환 처리후 다음 화면으로 가야지.
        const { ConversionActions } = this.props;
        // const result = ConversionActions.insertSsoConversion();
    }


    //회원 전환 처리
    conversionForm = async () => {
        const { agree, check, info, school, history, ConversionActions, BaseActions, ipinInfo} = this.props;

        BaseActions.openLoading();
        try {
                //통합 회원 전환 성공
                // info['ssoMember'] = true;
                // ConversionActions.pushValues({type:'info', object:info});
                // history.push("/conversion/teacher");

            if(this.state.findOnclick === true) {
                // 더블클릭 방지
                // Api 호출이후 클릭 가능 상태로 만들어 놓아야 됨
                // IPIN_CI값 업데이트
                if (ipinInfo != null) {
                    if (ipinInfo.isIpin != '') {
                        const ipinCiResult = await api.updateIpinCi(ipinInfo.isIpin);
                        if (!ipinCiResult) {
                            common.error("회원정보 수정 반영중 오류가 발생하였습니다. 다시시도해주세요.");
                            return;
                        }
                    }
                }

                let code = await ConversionActions.inserSsoConversion({...agree, ...info, ...school});
                if (code.data === 1) {
                    common.error("아이디를 입력해주세요.");
                    this.setState({
                        findOnclick : false
                    });
                } else if (code.data === 2) {
                    common.error("이름을 입력해주세요.");
                    this.setState({
                        findOnclick : false
                    });
                } else if (code.data === 3) {
                    common.error("비밀번호를 입력해주세요.");
                    this.setState({
                        findOnclick : false
                    });
                } else if (code.data === 4) {
                    common.error("이미 사용중인 아이디 입니다.");
                    this.setState({
                        findOnclick : false
                    });
                } else if (code.data === '0000') {
                    if (window.__isApp) {
                        window.webViewBridge.send('getPushToken', '', function (res) { //Browser 에서는 동작하지 않습니다. WebView 에서만.
                            if (res.value) {
                                api.syncAppToken(res.value, info.userId);
                            }
                        }, function (err) {
                            //Do nothing.
                        });
                    }

                    //통합회원 전환 성공
                    info['ssoMember'] = true;
                    ConversionActions.pushValues({type: 'info', object: info});
                    this.setState({
                        findOnclick : false
                    });
                    history.push("/conversion/teacher");

                } else {
                    common.error("통합회원 전환이 정상적으로 처리되지 못하였습니다.");
                    this.setState({
                        findOnclick : false
                    });
                }
                return code.data;
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    convertAfterHomeSafe = (e) => {
        if(this.state.findOnclick === false) {
            this.setState({
                findOnclick : true
            });
            e.target.disabled = true;
            let obj = this.validateSchool();
            if (!obj.result) {
                common.error(obj.message);
                e.target.disabled = false;
                obj.focus.focus();
                return false;
            }

            this.convertAfterHome(e.target);
        }
    }

    convertAfterHome = async (target) => {
        if (window.confirm('전환하시겠습니까?')) {
            this.conversionForm();
        } else {
            // 전환 취소시 클릭 가능 상태
            this.setState({findOnclick: false});
        }
        target.disabled = false;
    }


    nextButtonClickSafe = (e) => {
        this.nextButtonClick(e.target);
    }

    nextButtonClick = async (target) => {
        const { history, BaseActions } = this.props;
        try {
            target.disabled = true;
            let obj = this.validateSchool();
            if (!obj.result) {
                common.error(obj.message);
                target.disabled = false;
                obj.focus.focus();
                return false;
            }
            BaseActions.openLoading();
            history.push('/conversion/teacher');
        } catch (e) {
            target.disabled = false;
            console.log(e);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    render() {
        const { school } = this.props;
        const { gradeVisible, subjectVisible, subjectAddVisible, subjectCode } = this.state;
        const ipinYn = localStorage.getItem("checkAuthIpinYn");

        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">회원정보 입력</h2>
                    {ipinYn == 'N' &&
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>3</span>
                        <span className="step_num">4</span>
                    </div>
                    }

                    {ipinYn == 'Y' &&
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num">3</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>4</span>
                        <span className="step_num">5</span>
                    </div>
                    }
                </div>
                <section className="join">
                    <div className="join_use">
                        <div className="join_info">
                            <h2 className="info_tit"><label htmlFor="ipt_school">재직학교명</label></h2>
                            <div className="input_wrap">
                                <input type="text"
                                    placeholder="학교검색을 선택하세요"
                                    className="input_sm"
                                    value={school.schoolName}
                                    ref="schoolName"
                                    readOnly />
                                <button
                                    className="input_in_btn btn_gray"
                                    onClick={this.openPopupSchool}>학교검색</button>
                            </div>
                            <h2 className="info_tit mt25">
                                <label htmlFor="g01">담당학년</label>
                            </h2>
                            <div className="input_wrap">
                                <ul className="join_ipt_chk">
                                    <li className="join_chk_list">
                                        <input type="checkbox" className="checkbox_circle"
                                                id="g01" name="grade" ref="grade"
                                                checked={school.grade.g01.checked}
                                                onChange={this.handleChange} />
                                        <label htmlFor="g01">1학년</label>
                                    </li>
                                    <li className="join_chk_list">
                                        <input
                                        type="checkbox"
                                        className="checkbox_circle"
                                        id="g02"
                                        name="grade"
                                        checked={school.grade.g02.checked}
                                        onChange={this.handleChange}
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
                                        onChange={this.handleChange}
                                        />
                                        <label htmlFor="g03">3학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{ display: gradeVisible ? 'block' : 'none' }}>
                                        <input
                                        type="checkbox"
                                        className="checkbox_circle"
                                        id="g04"
                                        name="grade"
                                        checked={school.grade.g04.checked}
                                        onChange={this.handleChange}
                                        />
                                        <label htmlFor="g04">4학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{ display: gradeVisible ? 'block' : 'none' }}>
                                        <input
                                        type="checkbox"
                                        className="checkbox_circle"
                                        id="g05"
                                        name="grade"
                                        checked={school.grade.g05.checked}
                                        onChange={this.handleChange}
                                        />
                                        <label htmlFor="g05">5학년</label>
                                    </li>
                                    <li className="join_chk_list" style={{ display: gradeVisible ? 'block' : 'none' }}>
                                        <input
                                        type="checkbox"
                                        className="checkbox_circle"
                                        id="g06"
                                        name="grade"
                                        checked={school.grade.g06.checked}
                                        onChange={this.handleChange}
                                        />
                                        <label htmlFor="g06">6학년</label>
                                    </li>
                                </ul>
                            </div>
                            <div style={{ display: subjectVisible ? 'block' : 'none' }}>
                                <h2 className="info_tit mt25">내 교과</h2>
                                <div className="input_wrap" ref="mainSubject">
                                    <SubjectSelectContainer name="mainSubject" value={school.mainSubject} code={subjectCode} handleChange={this.handleChange} />
                                </div>
                                <p className="mt5 c_gray">
                                    설정하신 대표교과를 기준으로 비바샘의 맞춤형 서비스가 제공됩니다. (2개 교과 선택 가능)
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
                                    <div ref="secondSubject" style={{ display: subjectAddVisible ? 'block' : 'none' }}>
                                        <SubjectSelectContainer name="secondSubject" value={school.secondSubject} code={subjectCode} handleChange={this.handleChange} />
                                    </div>
                                </div>
                            </div>
                            <h2 className="info_tit mt25">
                                <label htmlFor="ipt_choice">비상교과서 채택 여부</label>
                            </h2>

                            <div className="input_wrap">
                                <ul className="join_ipt_chk ">
                                    <li className="join_chk_list">
                                        <input
                                        type="radio"
                                        className="checkbox_circle"
                                        name="visangTbYN"
                                        ref="visangTbYN"
                                        id="select"
                                        value="Y"
                                        checked={school.visangTbYN === 'Y'}
                                        onChange={this.handleChange}
                                        />
                                        <label htmlFor="select">채택</label>
                                    </li>
                                    <li className="join_chk_list">
                                        <input
                                        type="radio"
                                        className="checkbox_circle"
                                        name="visangTbYN"
                                        id="noselect"
                                        value="N"
                                        checked={school.visangTbYN === 'N'}
                                        onChange={this.handleChange}
                                        />
                                        <label htmlFor="noselect">미채택</label>
                                    </li>
                                </ul>
                            </div>
                            <h2 className="info_tit mt25">개인정보 유효기간 설정</h2>
                            <div className="radio_rect join_radio_rect">
                                <span className="radio_rect_item">
                                <input type="radio"
                                       id="op05"
                                       name="expiryTermNum"
                                       value="1"
                                       checked={school.expiryTermNum === '1'}
                                       onChange={this.handleChange} />
                                <label htmlFor="op05">1년</label>
                                </span>
                                <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    id="op04"
                                    name="expiryTermNum"
                                    value="3"
                                    checked={school.expiryTermNum === '3'}
                                    onChange={this.handleChange} />
                                <label htmlFor="op04">3년</label>
                                </span>
                                <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    id="op03"
                                    name="expiryTermNum"
                                    value="5"
                                    checked={school.expiryTermNum === '5'}
                                    onChange={this.handleChange} />
                                <label htmlFor="op03">5년</label>
                                </span>
                                <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    id="op03"
                                    name="expiryTermNum"
                                    value="0"
                                    checked={school.expiryTermNum === '0'}
                                    onChange={this.handleChange} />
                                <label htmlFor="op03">회원탈퇴시</label>
                                </span>
                            </div>
                            <p className="mt15">
                                <strong className="bold">개인정보 유효기간제란?</strong><br />고객님의 개인정보 보호를 위해 일정 기간 로그인 기록이 없는 고객님의 개인정보를 삭제 또는 별도로 분리 저장하는 제도입니다. 개인정보 유효기간제 선택 시 해당 기간 동안 로그인하지 않으셔도 개인정보를 삭제 또는 별도 분리하지 않습니다.<br />
                                다만 별도 요청이 없을 경우 일정 기간 후에 휴면 회원으로 분리됩니다.
                            </p>
                            <p className="mt15 txt_caution">※ 개인정보 유효기간을 3년 이상으로 설정 시, 장기 미접속에 따른 휴면계정 및 자동 탈퇴를 방지할 수 있습니다.</p>
                        </div>
                        <button
                            onClick={this.convertAfterHomeSafe}
                            // onClick={this.nextButtonClickSafe}
                            className="btn_full_on">다음</button>
                    </div>
                </section>
            </Fragment>
    );
  }
}

export default connect(
  (state) => ({
    logged: state.base.get("logged"),
    loginInfo: state.base.get("loginInfo").toJS(),
    agree: state.conversion.get('agree').toJS(),
    check: state.conversion.get('check').toJS(),
    info: state.conversion.get('info').toJS(),
    school: state.conversion.get('school').toJS(),
    ipinInfo: state.join.get('info').toJS()
  }),
  (dispatch) => ({
    PopupActions: bindActionCreators(popupActions, dispatch),
    ConversionActions: bindActionCreators(ConversionActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(SsoChangeSchool));
