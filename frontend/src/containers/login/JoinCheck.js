import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as common from 'lib/common';
import {debounce} from 'lodash';
import {initializeGtag} from "../../store/modules/gtag";

// 회원 가입 프로세스 개선으로 인한 삭제 페이지 - 2023/04/21
class JoinCheck extends Component {

    state = {
        telephoneCheck: false
    }

    constructor(props) {
      super(props);
      // Debounce
      this.nextButtonClick = debounce(this.nextButtonClick, 300);

      this.userName = React.createRef();
      this.email = React.createRef();
      this.emailDomain = React.createRef();
      this.otherDomain = React.createRef();
      this.cellphone = React.createRef();
    }
    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/join/check',
            'page_title': '회원가입 - 가입여부 확인｜비바샘'
        });
        const { type, agree, history } = this.props;
        console.log(type);
        console.log(agree);

        if(!type.isSelected) {
            history.replace('/join/select');
        }
        if ((!type.ssoMember && (!agree.service || !agree.privacy))
            || (type.ssoMember && (!agree.special || !agree.service || !agree.privacy || !agree.tschService || !agree.tschPrivacy ))) {
            // 기존에 tschThirdParty (JoinAgree Props 변수중 하나) 라는 항목이 존재했었고 해당 기준으로 체크를 했었는데
            // 이후에 새롭게 동의약관 Rule 이 변경되면서 사용을 안하게 되었는데 기존에 인력중 해당 부분을 놓친것 같음
            history.replace('/join/agree');
        }
    }

    handleChange = (e) => {
        const { check,JoinActions } = this.props;
        if(e.target.name === 'emailDomain'){
            if(e.target.value === 'otherDomain'){
                check.isOtherDomain = true
            }else{
                check.isOtherDomain = false
            }
        }
        check[e.target.name] = e.target.value;
        JoinActions.pushValues({type:"check", object:check});
    }

    nextButtonClickSafe = (e) => {
        this.nextButtonClick(e.target);
    }

    nextButtonClick = async (target) => {
        const { telephoneCheck } = this.state;
        const { check, info, history, JoinActions, BaseActions } = this.props;
        target.disabled = true;
        try {
            let reg_name = /[\uac00-\ud7a3]{2,4}/;
            if(!check.userName){
                common.error("성명을 입력해주세요.");
                target.disabled = false;
                this.refs.userName.focus();
                return false;
            }else if(!reg_name.test(check.userName)) {
                common.error("올바른 성명 형식이 아닙니다.");
                target.disabled = false;
                this.refs.userName.focus();
                return false;
            }
            if(!check.email){
                common.error("이메일 주소를 입력해주세요.");
                target.disabled = false;
                this.refs.email.focus();
                return false;
            }
            if(!check.emailDomain){
                common.error("이메일을 선택해주세요.");
                target.disabled = false;
                this.refs.emailDomain.focus();
                return false;
            }
            let email = check.email+check.emailDomain;
            if(check.isOtherDomain) {
                if(!check.otherDomain){
                    common.error("이메일을 입력해주세요.");
                    target.disabled = false;
                    this.refs.otherDomain.focus();
                    return false;
                }
                email = check.email+"@"+check.otherDomain;
            }
            let reg_email=/^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
            if(!email){
                common.error("이메일을 입력해주세요.");
                target.disabled = false;
                this.refs.email.focus();
                return false;
            } else if(!reg_email.test(email)) {
                common.error("올바른 이메일 형태가 아닙니다.");
                target.disabled = false;
                this.refs.email.focus();
                return false;
            }
            if(!check.cellphone){
                common.error("휴대전화번호를 입력해주세요.");
                target.disabled = false;
                this.refs.cellphone.focus();
                return false;
            } else if(!this.checkPhoneNum(check.cellphone)){
                common.error("올바른 휴대전화번호 형식이 아닙니다.");
                target.disabled = false;
                this.refs.cellphone.focus();
                return false;
            }

            // let code  = await JoinActions.checkUser(check.userName, email);
            let code  = await JoinActions.checkSsoUser(check.userName, email, check.cellphone);

            if(code.data.isExist > 0){
                // common.error("기존 가입이력이 있거나 동일한 이메일주소가 사용되고 있습니다.\n문의 : 선생님 전용 고객센터 1544-7714");
                common.error("이미 비바샘 회원으로 가입되어 있습니다. \n아래 아이디로 로그인해주세요.\n" + code.data.memberId + "\n문의 : 선생님 전용 고객센터 1544-7714");
                target.disabled = false;
            }else{
                // info.userName = check.userName;
                info.email = email;
                info.telephone = check.cellphone;
                JoinActions.pushValues({type:"info", object:info});
                BaseActions.openLoading();
                // history.push('/join/info');
                history.push('/join/verify');
            }
        } catch (e) {
            target.disabled = false;
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }


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
    }
    checkPhoneNum = (value) => {
        if(value === '' || value.length === 0){
            return false;
        }else if(value.indexOf("01") !== 0){
            return false;
        }else if(value.length < 12 || value.length > 13){
            return false;
        }
        return true;
    }



    render() {
        const { check } = this.props;
        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">가입 여부 확인</h2>
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>2</span>
                        <span className="step_num">3</span>
                        <span className="step_num">4</span>
                        <span className="step_num">5</span>
                    </div>
                </div>
                <section className="join">
                    <div className="join_use">
                        <div className="join_info">
                            <div className="info_txt_top">
	                            회원가입 확인을 위한 정보를 정확하게 입력해 주세요.<br/>
	                            입력하신 정보는 회원가입 여부를 확인하는 데만 사용되며, 별도로 저장되지 않습니다.
                            </div>

                            <h2 className="info_tit mt25"><label htmlFor="ipt_name">성명</label></h2>
                            <input type="text" 
                                placeholder="성명을 입력하세요" 
                                className="input_sm" 
                                id="ipt_name"
                                ref="userName"
                                name="userName"
                                onChange={this.handleChange}
                                value={check.userName} />
                            <h2 className="info_tit mt25"><label htmlFor="check_email">이메일</label></h2>
                            <div className="input_wrap">
                                <input
                                    type="text"
                                    placeholder="이메일 주소를 입력하세요"
                                    className="input_sm input_fix_wrap"
                                    id="check_email"
                                    ref="email"
                                    name="email"
                                    autoCapitalize="none"
                                    onChange={this.handleChange}
                                    value={check.email} />
                                <span className="input_fix_txt">@</span>
                            </div>
                            <div className="selectbox select_sm mt5">
                                <select name="emailDomain" ref="emailDomain" id="email_select" value={check.emailDomain} onChange={this.handleChange}>
                                    <option value="">선택</option>
                                    <option value="otherDomain">직접 입력</option>
                                    <option value="@gmail.com">gmail.com</option>
                                    <option value="@daum.net">daum.net</option>
                                    <option value="@hanmail.net">hanmail.net</option>
                                    <option value="@naver.com">naver.com</option>
                                    <option value="@nate.com">nate.com</option>
                                </select>
                            </div>
                            <input
                                type="email"
                                placeholder="예) domain.com"
                                className="input_sm ico_at mt5"
                                id="check_domain"
                                ref="otherDomain"
                                name="otherDomain"
                                autoCapitalize="none"
                                onChange={this.handleChange}
                                value={check.otherDomain}
                                style={{display:check.isOtherDomain ? 'block' : 'none'}} />
                                
                            <h2 className="info_tit mt25"><label htmlFor="ipt_phone">휴대전화번호</label></h2>
                            <input type="tel" 
                                placeholder="‘-’은 빼고 입력해 주세요" 
                                className="input_sm" 
                                id="ipt_phone"  
                                ref="cellphone"
                                name="cellphone"
                                maxLength="13"
                                value={check.cellphone}
                                onChange={this.phonecheck} />
                        </div>
                        <button onClick={this.nextButtonClickSafe} className="btn_full_on">다음</button>
                    </div>
                </section>
            </Fragment>
        );
    }
}

export default connect(
  (state) => ({
    type : state.join.get('type').toJS(),
    agree : state.join.get('agree').toJS(),
    check : state.join.get('check').toJS(),
    info : state.join.get('info').toJS()
  }),
  (dispatch) => ({
    JoinActions: bindActionCreators(joinActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(JoinCheck));
