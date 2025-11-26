import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as api from 'lib/api';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import {initializeGtag} from "store/modules/gtag";
import {validateResultCodeHash} from "../../lib/StringUtils";
import PwdSecurityText from 'components/login/PwdSecurityText';

class MyInfoPasswordContainer extends Component {
    state = {
        resultMessage: '',
        resultClassName: '',
        oldPasswordMessage: '',
        oldPasswordClassName: '',
        passwordRule: false,
        passwordMessage: '',
        passwordClassName: '',
        passwordCheckMessage: '',
        passwordCheckClassName: '',
        joinModifyInfoEventYn: 'N',
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/myInfo/password',
            'page_title': '비밀번호 변경｜비바샘'
        });
        this._isMounted = true;
        const { info, logged, history,JoinActions } = this.props;
        //로그인 정보 없을시 return
        if(!logged){
            history.push('/');
        }
        //패스워드 재입력하게함
        info.oldPassword = '';
        info.password = '';
        info.passwordCheck = '';
        JoinActions.pushValues({type:"info", object:info});

        this.checkJoinModifyInfoEvent(); // 개인정보 수정 이벤트 참여 체크 함수입니다. 2023-04-07 이후로 삭제가능
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    constructor(props) {
        super(props);
        this.Checkpassword = React.createRef();
        this.NewPassword = React.createRef();
    }


    handleChange = (e) => {
        const { info, JoinActions } = this.props;
        info[e.target.name] = e.target.value;
        JoinActions.pushValues({type:"info", object:info});

        if(e.target.name === "oldPassword") {
            if(this.refs.NewPassword.value){
//                this.checkpassword2(this.refs.NewPassword.value);
            }
        } else if(e.target.name === "password") {
            this.checkPasswordNotice(e.target.value);
//            this.checkpassword2(e.target.value);
            if(this.refs.Checkpassword.value){
//                this.setPassWordCheckMessage(this.refs.Checkpassword.value);
            }
        } else if(e.target.name === "passwordCheck") {
//            this.setPassWordCheckMessage(e.target.value);
        }
    }

    setPassWordCheckMessage = (value) => {
        let clazz = 'point_red';
        let text = "비밀번호가 일치하지 않습니다. 다시 입력해 주세요.";
        if(this.checkpassword()){
            clazz = 'point_color_blue';
            text = "동일한 비밀번호 입니다.";
        }else if(value === ""){
            text = "";
        }
        if(this._isMounted){
            this.setState({
                passwordCheckMessage: text,
                passwordCheckClassName: clazz
            });
        }
    }

    //암호 규칙 확인
    checkpassword2 = (value) => {
        const { info,loginInfo } = this.props;
        let pass = value;
        let pattern1 = /[0-9]/;
    	let pattern2 = /[a-zA-Z]/;
    	let pattern3 = /[!@#$%^&*()?_~]/;

        function consChr(newPwd) {
            let chrStr = [...newPwd].map(v => v.charCodeAt());
            let preStr = 0;
            let chr = 0;

            chrStr.forEach(s => {
                if (Math.abs(preStr - s) == 1) {
                    chr++;
                }
                preStr = s;
            });
            return chr > 2;
        }

        function keyboardCheck(newPwd) {
            let keyboard = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

            for (let i = 0; i < newPwd.length-2; i++) {
                const sliceValue = newPwd.substring(i, i + 3);
                // 모든 조건을 한번씩 순회
                if (keyboard.some((code) => code.includes(sliceValue))) {
                    return true;
                }
            }
            // 모든 조건을 넘겼을 때
            return false;
        }

        let same = /(.)\1+/;
        let cons = consChr(pass);
        let keyCheck = keyboardCheck(pass);
        let chk = 0;
        let text = '';
        let clazz = 'point_red';
        let ruleCheck= false;
        if(pass.search(/[0-9]/g) !== -1 ) chk ++;
        if(pass.search(/[a-zA-Z]/ig)  !== -1 ) chk ++;
        if(pass.search(/[!@#$%^&*()?_~]/g)  !== -1  ) chk ++;

        if(pass === "" ){
            clazz = ''
            text = "";
        } else if(pass.length < 8 ){
            text = "최소 8자리 이상으로 입력해주세요.";
        } else if(chk < 2){
            text = "비밀번호는 숫자, 영문, 특수문자를 두가지이상 혼용하여야 합니다.";
        } else if(pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
            text = "영문+숫자+특수문자인 경우 8자리 이상으로 구성하여야 합니다.";
        } else if(pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
            text = "영문+숫자인 경우 10자리 이상으로 구성하여야 합니다.";
        } else if (pass.indexOf(loginInfo.memberId) > -1 && loginInfo.memberId !== "") {
            text = "비밀번호는 아이디를 포함할 수 없습니다.";
        } else if (info.oldPassword === info.password) {
            text = "이전 비밀번호와 같습니다.";
        } else if (same.test(pass) || cons || keyCheck) {
            text = "사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요.";
        } else {
            clazz = 'point_color_blue';
            text = "사용하실 수 있는 비밀번호 입니다.";
            ruleCheck= true;
        }
        let obj = {
          passwordClassName: clazz,
          passwordMessage: text,
          passwordRule: ruleCheck
        }
        if(this._isMounted){
            this.setState(obj);
        }
        return obj;
    }

    checkPwdAlert = (value) => {
        const { info,loginInfo } = this.props;
        let pass = value;
        let pattern1 = /[0-9]/;
        let pattern2 = /[a-zA-Z]/;
        let pattern3 = /[!@#$%^&*()?_~]/;

        function consChr(newPwd) {
            let chrStr = [...newPwd].map(v => v.charCodeAt());
            let preStr = 0;
            let chr = 0;

            chrStr.forEach(s => {
                if (Math.abs(preStr - s) == 1) {
                    chr++;
                }
                preStr = s;
            });
            return chr > 2;
        }

        function keyboardCheck(newPwd) {
            let keyboard = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

            for (let i = 0; i < newPwd.length-2; i++) {
                const sliceValue = newPwd.substring(i, i + 3);
                // 모든 조건을 한번씩 순회
                if (keyboard.some((code) => code.includes(sliceValue))) {
                    return true;
                }
            }
            // 모든 조건을 넘겼을 때
            return false;
        }

        let same = /(.)\1+/;
        let cons = consChr(pass);
        let keyCheck = keyboardCheck(pass);
        let chk = 0;
        let text = '';
        let ruleCheck= false;
        if(pass.search(/[0-9]/g) !== -1 ) chk ++;
        if(pass.search(/[a-zA-Z]/ig)  !== -1 ) chk ++;
        if(pass.search(/[!@#$%^&*()?_~]/g)  !== -1  ) chk ++;

        if (info.oldPassword === '') {
            text = '현재 비밀번호를 입력해주세요.';
        } else if (info.password === '') {
            text = '새 비밀번호를 입력해주세요.';
        } else if (info.passwordCheck === '') {
            text = '새 비밀번호 확인란에 입력해주세요.';
        } else if (info.password !== info.passwordCheck) {
            text = '입력하신 비밀번호와 일치하지 않습니다.';
        } else if(pass.length < 8 ){
            text = "최소 8자리 이상으로 입력해주세요.";
        } else if(chk < 2){
            text = "비밀번호는 숫자, 영문, 특수문자를 두가지이상 혼용하여야 합니다.";
        } else if(pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
            text = "영문+숫자+특수문자인 경우 8자리 이상으로 구성하여야 합니다.";
        } else if(pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
            text = "영문+숫자인 경우 10자리 이상으로 구성하여야 합니다.";
        } else if (pass.indexOf(loginInfo.memberId) > -1 && loginInfo.memberId !== "") {
            text = "비밀번호는 아이디를 포함할 수 없습니다.";
        } else if (info.oldPassword === info.password) {
            text = "이전 비밀번호와 같습니다.";
        } else if (same.test(pass) || cons || keyCheck) {
            text = "사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요.";
        } else {
            text = "사용하실 수 있는 비밀번호 입니다.";
            ruleCheck= true;
        }
        if (!ruleCheck) {
            alert(text);
        }
        return ruleCheck;
    }

    //동일 암호 확인
    checkpassword = () => {
        const { info } = this.props;
        if(info.password !== info.passwordCheck) {
            return false;
        }
        return true;
    }

    // 비밀번호 유효성 말풍선
    checkPasswordNotice = (value) => {
        const { info,loginInfo } = this.props;
        let eng_num = /^(?=.*[a-zA-Z])(?=.*[0-9]).{10,}$/;
        let eng_num_special = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~@#$!%*?&])[a-zA-Z\d~@#$!%*?&]{8,}$/;
        let pass = value;
        let pattern1 = /[0-9]/;
        let pattern2 = /[a-zA-Z]/;
        let pattern3 = /[!@#$%^&*()?_~]/;
        function consChr(newPwd) {
            let chrStr = [...newPwd].map(v => v.charCodeAt());
            let preStr = 0;
            let chr = 0;

            chrStr.forEach(s => {
                if (Math.abs(preStr - s) == 1) {
                    chr++;
                }
                preStr = s;
            });
            return chr > 2;
        }

        function keyboardCheck(newPwd) {
            let keyboard = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

            for (let i = 0; i < newPwd.length-2; i++) {
                const sliceValue = newPwd.substring(i, i + 3);
                // 모든 조건을 한번씩 순회
                if (keyboard.some((code) => code.includes(sliceValue))) {
                    return true;
                }
            }
            // 모든 조건을 넘겼을 때
            return false;
        }

        let same = /(.)\1+/;
        let cons = consChr(pass);
        let keyCheck = keyboardCheck(pass);
        let chk = 0;
        let ruleCheck= false;
        if(pass.search(/[0-9]/g) !== -1 ) chk ++;
        if(pass.search(/[a-zA-Z]/ig)  !== -1 ) chk ++;
        if(pass.search(/[!@#$%^&*()?_~]/g)  !== -1  ) chk ++;

        let text;

        if(pass.length < 8 ) {
            text = '';
        } else if(chk < 2){
            text = '';
        } else if(pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
            text = '';
        } else if(pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
            text = '';
        } else if (pass.indexOf(loginInfo.memberId) > -1 && loginInfo.memberId !== "") {
            text = '';
        } else if (info.oldPassword === info.password) {
            text = '';
        } else if (same.test(pass) || cons || keyCheck) {
            text = '';
        } else {
            if (eng_num_special.test(value)) {
                text = '안전';
            } else if (eng_num.test(value)) {
                text = '보통';
            } else {
                text = '';
            }
        }

        let obj = {
            passwordMessage: text
        }
        if(this._isMounted){
            this.setState(obj);
        }
        return obj;
    }

    handleClick = async(e) => {
        e.preventDefault();
        const { info, history } = this.props;
        // let checkOldPassword2 = this.checkpassword2(info.oldPassword);

        let result = this.checkPwdAlert(info.password);
        if (result) {
            this.changePassword();
        } else {
            return false;
        }
    }

    changePassword = async() => {
        const { info, history, loginInfo, BaseActions } = this.props;
        try {
            let message='';
            let clazz = 'point_red';
            let isValid = false;
            BaseActions.openLoading();
            const checkResponse = await api.checkPasswordDetail(loginInfo.memberId, info.oldPassword, info.password);
            if (checkResponse.data.code === '4') {
                message = '사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요';
            } else if (checkResponse.data.code === '5') {
                message = '이전에 사용한 비밀번호는 사용할 수 없습니다.';
            } else if (!validateResultCodeHash(checkResponse.data.code, checkResponse.data.hash)) {
                message = '유효하지 않은 입력입니다. 다시 시도해 주세요.'
            } else if (checkResponse.data.code !== '0') {
                message = '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.'
            } else {
                isValid = true;
            }

            if (!isValid) {
                alert(message);
                return;
            }

            const response = await api.changePassword(loginInfo.memberId, info.oldPassword, info.password);
            if(response.data.code && response.data.code === "0"){
                if (this.state.joinModifyInfoEventYn == 'Y') {
                    if (window.confirm('회원정보가 수정되어 이벤트 자동 응모가 완료되었습니다.​')) {
                        history.push('/')
                    }
                } else {
                    if (window.confirm('변경되었습니다. 비바샘 메인 페이지로 이동합니다.')) {
                        history.push('/');
                    }
                }
            } else if(response.data.code && (response.data.code === "1" || response.data.code === "2") ){
                message = '입력값을 다시 확인해주세요.'
                alert(message);
                return;
            } else if(response.data.code && response.data.code === "3"){
                message = '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.'
                alert(message);
                return;
            } else if (response.data.code && response.data.code === "4") {
                message = '사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요.'
                alert(message);
                return;
            } else if (response.data.code && response.data.code === "5") {
                message = '사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요.'
                alert(message);
                return;
            }
            if(this._isMounted){
                this.setState({
                  resultMessage: message,
                  resultClassName: clazz
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 100);//의도적 지연.
        }
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


    render() {
        const { info } = this.props;
        const { resultMessage, oldPasswordMessage, passwordMessage, passwordCheckMessage, resultClassName, oldPasswordClassName, passwordClassName, passwordCheckClassName } = this.state;
        return (
            <section className="persnal_info">
                <h2 className="blind">
                    회원정보 수정
                </h2>
                <div className="guideline" />
                <div className="persnal_cont">
                    <p className="dft_txt">
                        현재 사용중인 비밀번호를 입력한 후 <em className="alert_em">새로 사용할 비밀번호</em>를 입력해 주세요.
                    </p>
                    <h2 className="info_tit mt30">
                        <label htmlFor="ipt_password">
                            현재 비밀번호
                        </label>
                    </h2>
                    <input
                        type="password"
                        placeholder="현재 비밀번호를 입력하세요"
                        className="input_sm mb5"
                        name="oldPassword"
                        onChange={this.handleChange}
                        value={info.oldPassword}
                        id="ipt_password" />
                    <InfoText message={oldPasswordMessage} className={oldPasswordClassName}/>
                    <h2 className="info_tit mt30">
                        <label htmlFor="ipt_password_new">
                            새 비밀번호
                        </label>
                    </h2>
                    <input
                        type="password"
                        placeholder="새 비밀번호를 입력하세요"
                        className="input_sm mb5"
                        name="password"
                        onChange={this.handleChange}
                        value={info.password}
                        ref="NewPassword"
                        id="ipt_password_new" />
                    <PwdSecurityText type={passwordMessage}/>
                    <h2 className="info_tit mt30">
                        <label htmlFor="ipt_password_new2">
                            새 비밀번호 확인
                        </label>
                    </h2>
                    <input
                        type="password"
                        placeholder="새 비밀번호를 입력하세요"
                        className="input_sm mb5"
                        name="passwordCheck"
                        onChange={this.handleChange}
                        value={info.passwordCheck}
                        ref="Checkpassword"
                        id="ipt_password_new2" />
                    {/*<InfoText message={passwordCheckMessage} className={passwordCheckClassName} />*/}
                    <a
                        href="#"
                        onClick={this.handleClick}
                        className="btn_round_on btn_round_big mt30">
                        비밀번호 변경
                    </a>
                    <div className="find_validate">
                        {/*<InfoText message={resultMessage} className={resultClassName}/>*/}
                    </div>
                </div>
                <div className="guideline" />
                <div className="join_info">
                    <div className="acco_notice_list">
                        <span className="icon_noti">
                            비밀번호 안내
                        </span>
                        <p className="notice_txt">
                            1. 비밀번호는&nbsp;영문, 숫자, 특수문자 조합 시 8자 이상 또는 영문, 숫자 조합 시 10자 이상으로 만드실 수 있습니다. 특히, 특수문자와 조합할 경우 비밀번호안전도가 더 높습니다.
                        </p>
                        <p className="notice_txt">
                            2.생년월일, 전화번호 등 개인정보와 관련된 숫자 및 연속문자 등 보안수준이 낮은 비밀번호는 권장하지 않습니다.
                        </p>
                        <p className="notice_txt">
                            3.안전한 개인정보 보호를 위해 비밀번호는 3개월마다 주기적으로 변경해주세요.
                        </p>
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
        info : state.join.get('info').toJS()
    }),
    (dispatch) => ({
        JoinActions: bindActionCreators(joinActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(MyInfoPasswordContainer));
