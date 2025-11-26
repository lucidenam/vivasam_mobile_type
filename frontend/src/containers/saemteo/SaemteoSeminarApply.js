import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import RenderLoading from 'components/common/RenderLoading';

class AddCheckbox extends Component {
    render(){
        const {apply, addCheckboxText, handleChange} = this.props;

        return (
            <div className="checkbox_circle_box mt10">
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
                    <strong className="checkbox_circle_tit">
                        <span dangerouslySetInnerHTML={{__html: addCheckboxText}}></span>
                    </strong>
                </label>
            </div>
        )
    }
}


class SaemteoSeminarApply extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
    }

    state = {
        seminarInfo:'',
        phoneCheckMessage: '',
        phoneCheckClassName: '',
        telephoneCheck: false
    }

    componentDidMount(){
        const {seminarId} = this.props;
        this.getSeminarInfo(seminarId);
    }

    getSeminarInfo = async(seminarId) => {
        const { history, apply, SaemteoActions } = this.props;
        const response = await api.seminarInfo(seminarId);
        if(response.data.code && response.data.code === "0"){
            let seminarInfo = response.data.programList[0];
            this.setState({
                seminarInfo: seminarInfo
            });
            apply.cultureActId = seminarInfo.cultureActId;
            apply.addCheckboxYn = seminarInfo.addCheckboxYn;
            let {memberId, name, email, cellphone} = response.data.memberInfo;
            apply.memberId = memberId;
            apply.userName = name;
            apply.withPeopleNumber = '';
            apply.agree = false;
            apply.addAgree = false;
            if(cellphone){
                apply.cellphone = cellphone;
                this.setState({
                    telephoneCheck:true
                })
            }
            if(email){
                let s = email.split("@");
                apply.email = s[0];
                let REGEXP_DOMAIN = /^(?:gmail.com|daum.net|hanmail.net|naver.com|nate.com)$/;
                if(s[1]){
                    if(REGEXP_DOMAIN.test(s[1])){
                        apply.emailDomain = "@"+s[1]
                    }else{
                        apply.emailDomain = "otherDomain"
                        apply.otherDomain = s[1];
                        apply.isOtherDomain = true;
                    }
                }
            }
            SaemteoActions.pushValues({type:"apply", object:apply});
        } else if(response.data.code && response.data.code === "3"){
            common.info("이미 신청하셨습니다.");
            history.goBack();
        } else {
            history.push('/saemteo/index');
        }
    }

    handleChange = (e) => {
        const { apply, SaemteoActions } = this.props;

        if(e.target.name === 'agree' || e.target.name === 'addAgree'){
            apply[e.target.name] = e.target.checked;
        }else{
            if(e.target.name === 'emailDomain'){
                if(e.target.value === 'otherDomain'){
                    apply.isOtherDomain = true
                }else{
                    apply.isOtherDomain = false
                }
            }
            apply[e.target.name] = e.target.value;
        }


        SaemteoActions.pushValues({type:"apply", object:apply});
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

    //값 입력 확인
    validateInfo = () => {
        const { apply } = this.props;
        const { telephoneCheck } = this.state;
        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        let obj = { result : false , message : ''}
        if(!apply.userName){
            obj.message = '성명을 입력해주세요.';
        }else if(!reg_name.test(apply.userName)) {
            obj.message = '올바른 성명 형식이 아닙니다.';
        }else if(!apply.emailDomain){
            obj.message = '이메일을 선택해주세요.';
        }else if(apply.telephone === ""){
            obj.message = '휴대전화번호를 입력해주세요.';
        } else if(!telephoneCheck){
            obj.message = '휴대전화번호 입력이 유효하지 않습니다.';
        }else if(!apply.withPeopleNumber){
            obj.message = '동반인원을 입력해주세요.';
        }else if(apply.withPeopleNumber>2){
            obj.message = '동반 인원은 최대 2명까지 신청 가능합니다.';
        }else if(!apply.agree){
            obj.message = '특강 참여를 위해서 개인정보 수집 및 이용 동의가 필요합니다.';
        }else if(apply.addCheckboxYn === 'Y' && !apply.addAgree){
            obj.message = '특강 참여를 위해서 개인정보 수집 및 이용 동의가 필요합니다.';
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
        const { apply,history,SaemteoActions } = this.props;
        let obj = this.validateInfo();
        if(!obj.result){
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        try {
            let email = apply.email+apply.emailDomain;
            if(apply.isOtherDomain) {
                email = apply.email+"@"+apply.otherDomain;
            }
            let reg_email=/^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
            if(!email){
                common.error("이메일을 입력해주세요.");
                target.disabled = false;
                return false;
            } else if(!reg_email.test(email)) {
                common.error("올바른 이메일 형태가 아닙니다.");
                target.disabled = false;
                return false;
            }
            apply.email = email;
            SaemteoActions.pushValues({type:"apply", object:apply});
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    }

    //신청
    insertApplyForm = async () => {
        const { apply, history, SaemteoActions, BaseActions } = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertApply({...apply});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
                common.info("신청해주셔서 감사합니다. \n당첨자 발표는 비바샘 공지사항을 참고해 주세요.");
                history.push('/saemteo/seminar');
            } else if(response.data.code && response.data.code === "4"){
                common.error("기존 가입이력이 있거나 동일한 이메일주소가 사용되고 있습니다.\n문의 : 선생님 전용 고객센터 1544-7714");
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
    }

    render() {
        const {seminarInfo} = this.state;
        if (seminarInfo === '') return <RenderLoading/>;
        const {apply} = this.props;
        const { phoneCheckMessage, phoneCheckClassName } = this.state;
        let addCheckbox;
        if (seminarInfo.addCheckboxYn === 'Y'){
            addCheckbox = <AddCheckbox apply={apply} handleChange={this.handleChange} addCheckboxText={seminarInfo.addCheckboxText} />
        }
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell">
                        <span dangerouslySetInnerHTML={{__html: seminarInfo.mobileApplyContents}}></span>
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
                                value={apply.userName}
                                className="input_sm" />
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
                                className="input_sm input_fix_wrap" />
                            <span className="input_fix_txt">@</span>
                        </div>
                        <div className="input_wrap mb25">
                            <div className="selectbox select_sm mt5">
                                <select name="emailDomain" id="email_select" value={apply.emailDomain} onChange={this.handleChange}>
                                    <option value="">선택</option>
                                    <option value="otherDomain">직접입력</option>
                                    <option value="@gmail.com">gmail.com</option>
                                    <option value="@daum.net">daum.net</option>
                                    <option value="@hanmail.net">hanmail.net</option>
                                    <option value="@naver.com">naver.com</option>
                                    <option value="@nate.com">nate.com</option>
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
                              style={{display:apply.isOtherDomain ? 'block' : 'none'}}
                              id="check_domain" />
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
                                className="input_sm mb5" />
                            <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                        </div>
                        <h2 className="info_tit">
                            <label htmlFor="ipt_person">동반인원</label>
                        </h2>
                        <div className="input_wrap mb25">
                            <input
                                type="tel"
                                pattern="[0-9]*"
                                id="ipt_person"
                                name="withPeopleNumber"
                                onChange={this.handleChange}
                                value={apply.withPeopleNumber}
                                max={2}
                                maxLength={1}
                                className="input_sm input_fix_wrap" />
                            <span className="input_fix_txt">명</span>
                        </div>


                        <h2 className="info_tit">
                            <label htmlFor="ipt_person">신청 날짜</label>
                        </h2>
                        <div className="input_wrap mb25">
                            <ul className="join_ipt_chk ">
                                <li className="join_chk_list" style={{width:'45%'}}>
                                    <input type="radio"
                                        className="checkbox_circle"
                                        name="apply_date"
                                        ref="visangTbYN"
                                        id="apply_date01"
                                        value=""
                                        onChange={this.handleChange} />
                                    <label htmlFor="apply_date01">2020.6.27(토)</label>
                                </li>
                                <li className="join_chk_list" style={{width:'45%'}}>
                                    <input type="radio"
                                        className="checkbox_circle"
                                        name="apply_date"
                                        id="apply_date02"
                                        value=""
                                        onChange={this.handleChange}  />
                                    <label htmlFor="apply_date02">2020.7.4(토)</label>
                                </li>
                            </ul>
                        </div>





                        <div className="acco_notice_list">
                            <a className="acco_notice_link active">
                                <span className="acco_notice_tit info_tit pb0">
                                    개인정보 수집 및 이용동의
                                </span>
                            </a>
                            <div className="acco_notice_cont mt10">
                                <span dangerouslySetInnerHTML={{__html: seminarInfo.mobileTerm}}></span>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.handleChange}
                                    checked={apply.agree}
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
                            {addCheckbox}
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
        apply : state.saemteo.get('apply').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SaemteoSeminarApply));
