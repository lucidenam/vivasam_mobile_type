import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import * as common from 'lib/common';
import * as api from 'lib/api';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from 'redux';
import {FindIdPopup} from 'components/login';
import {isEmpty, trim} from 'lodash';
import {initializeGtag} from "../../store/modules/gtag";
import Sticky from 'react-sticky-el';

class FindId extends Component {
    state = {
        memberName: '',
        // memberEmail: '',
        emailId: '',
        emailDomain: '',
        cellPhone: '',
        isOtherDomain: false,
        otherDomain: '',
        isValid: true,
        certifyMethod: 'P',
    }

    componentDidMount = () => {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/find/id',
            'page_title': '아이디 찾기｜비바샘'
        });
    }

    handleChange = (e) => {
        let {isOtherDomain} = this.state;
        if (e.target.name === 'emailDomain') {
            if (e.target.value === 'otherDomain') {
                isOtherDomain = true
            } else {
                isOtherDomain = false
            }
        }

        this.setState({
            [e.target.name]: e.target.value,
            isValid: true,
            isOtherDomain
        })
    }

    //핸드폰번호 체크
    phonecheck = (e) => {
        e.target.value = common.autoHypenPhone(e.target.value);
        this.handleChange(e);
    }

    handleTabClick = (certifyMethod) => {

        this.setState({
            certifyMethod,
            emailId: '',
            emailDomain: '',
            cellPhone: ''
        });
    }

    handleFindId = async (e) => {
        const { PopupActions, BaseActions } = this.props;
        this.setState({
            isValid: true
        })
        const {memberName, emailId, emailDomain, isOtherDomain, otherDomain, certifyMethod} = this.state;
        let memberEmail = '';
        let {cellPhone} = this.state;

        let reg_name = /[\uac00-\ud7a3]{2,4}/;
        if(!reg_name.test(memberName)) {
            common.error("올바른 성명 형식이 아닙니다.");
            return false;
        }

        if (certifyMethod === 'E') {
            memberEmail = emailId + (isOtherDomain ? "@" + otherDomain : emailDomain);
            const regExpEmail = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
            if (!regExpEmail.test(memberEmail)) {
                common.error("올바른 이메일 형식이 아닙니다.");
                return false;
            }
            cellPhone = '';
        } else {
            if (isEmpty(trim(cellPhone))) {
                common.error("휴대전화번호를 입력해주세요.");
                return false;
            }

            var regExpPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
            if (!regExpPhone.test(cellPhone)) {
                common.error("올바른 휴대전화번호 형식이 아닙니다.");
                return false;
            }
            cellPhone = cellPhone.trim().replace(/[^0-9]/g, '');
            memberEmail = '';
        }

        try {
            BaseActions.openLoading({loadingType:"1"});
            const response = await api.findId(memberName, certifyMethod, certifyMethod == "E" ? memberEmail : cellPhone);

            if(response.data != '') {
                if (response.data.code == 'success') {
                    alert(response.data.msg);
                    return ;
                }
            }

            PopupActions.openPopup({title:"아이디 안내", componet:<FindIdPopup memberId={response.data.memberId}/>, closeButtonHidden: true});
        }catch(e) {
            console.log(e);
            if(e.response.data && e.response.data.code === '2001') {
                this.setState({
                    isValid: false
                });
            }else {
                //다른 메세지를 노출해야할지 결정, 일단 기본메세지
                this.setState({
                    isValid: false
                });
            }
        }finally {
            BaseActions.closeLoading();
        }
    }

    render() {
        const {isValid, certifyMethod} = this.state;
        const certifyName = certifyMethod === 'E' ? '이메일' : '휴대전화번호';
        return (
           <div>
               <Sticky className={'tab_wrap'}>
                   {/*비밀번호 찾기와 동일*/}
                   <ul className="tab tab-col2">
                       <li className={'tab_item ta_r' + (certifyMethod === 'P' ? ' active' : '')}>
                           <a
                               onClick={() => {
                                   this.handleTabClick('P');
                               }}
                               className="tab_link"
                           >
                               <span>휴대전화번호 인증</span>
                               {certifyMethod === 'P' ? (<span className="blind">현재페이지</span>) : ''}
                           </a>
                       </li>
                       <li className={'tab_item ta_l' + (certifyMethod === 'E' ? ' active' : '')}>
                           <a
                               onClick={() => {
                                   this.handleTabClick('E');
                               }}
                               className="tab_link"
                           >
                               <span>이메일 인증</span>
                               {certifyMethod === 'E' ? (<span className="blind">현재페이지</span>) : ''}
                           </a>
                       </li>
                   </ul>
               </Sticky>

               <section className="login renew">
                   <h2 className="blind">아이디 찾기</h2>
                   <div className="find_id">
                       <div className="find_info">

                           <h2 className="info_tit ">성명</h2>
                           <input
                               type="text"
                               name="memberName"
                               placeholder="성명을 입력하세요"
                               onChange={this.handleChange}
                               value={this.state.memberName}
                               className=""
                               autoCapitalize="off"
                           />

                           <h2 className="info_tit">{certifyName}</h2>
                           {
                               certifyMethod === 'E' ? (
                                   <Fragment>
                                       <div className="input_wrap mb5">
                                           <input
                                               type="email"
                                               name="emailId"
                                               placeholder="이메일 주소를 입력하세요"
                                               onChange={this.handleChange}
                                               value={this.state.emailId}
                                               className="ico_at mb5"
                                           />
                                           <span className="input_fix_txt">@</span>
                                       </div>
                                       <div className={"mb20"}>
                                           <div className="selectbox">
                                               <select name="emailDomain" id="email_select"
                                                       value={this.state.emailDomain}
                                                       onChange={this.handleChange}>
                                                   <option value="">선택</option>
                                                   <option value="otherDomain">직접입력</option>
                                                   <option value="@gmail.com">gmail.com</option>
                                                   <option value="@daum.net">daum.net</option>
                                                   <option value="@hanmail.net">hanmail.net</option>
                                                   <option value="@naver.com">naver.com</option>
                                                   <option value="@nate.com">nate.com</option>
                                               </select>
                                           </div>
                                           {
                                               this.state.isOtherDomain && (
                                                   <input
                                                       type="email"
                                                       name="otherDomain"
                                                       placeholder="예) domain.com"
                                                       autoCapitalize="none"
                                                       className="input_sm ico_at mt10"
                                                       onChange={this.handleChange}
                                                       id="check_domain"
                                                   />
                                               )
                                           }
                                       </div>
                                   </Fragment>
                               ) : (
                                   <input
                                       type="tel"
                                       name="cellPhone"
                                       placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
                                       onChange={this.phonecheck}
                                       value={this.state.cellPhone}
                                       maxLength="13"
                                       className="ico_at mb20"
                                   />
                               )
                           }

                           <div>
                               <a
                                   onClick={this.handleFindId}
                                   className="btn_full_on"
                               >아이디 찾기</a>
                           </div>

                           <div className="find_validate" hidden={isValid}>
                               <p className="find_validate_txt">일치하는 아이디가 없습니다.<br/>다시 확인해 주세요</p>
                           </div>
                       </div>
                       <div className="guideline"></div>
                       <div className="guide_box">
                           <p className="guide_box_tel">
                               회원정보가 기억나지 않으실 경우,<br/>
                               선생님 전용 고객센터 <em className="guide_box_marker">1544-7714</em>로 연락 주시면
                               본인 확인 후 안내해 드리고 있습니다.
                           </p>
                           <a
                               href="tel:1544-7714"
                               className="ico_tel"
                           ><span className="blind">전화걸기</span></a>
                       </div>
                       <div className="guideline"></div>

                   </div>
               </section>
           </div>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
  )(withRouter(FindId));
