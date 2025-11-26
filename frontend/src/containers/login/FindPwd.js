import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import Sticky from 'react-sticky-el';
import * as api from 'lib/api';
import {findPwd, findPwdIpin} from 'lib/api';
import * as common from 'lib/common';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from 'redux';
import {FindPwdEmailPopup} from 'components/login';
import {isEmpty, trim} from 'lodash';
// IPIN
import queryString from 'query-string';
import FindPwdResetPwdPopup from "../../components/login/FindPwdResetPwdPopup";
import {initializeGtag} from "../../store/modules/gtag";

class FindPwd extends Component {
    state = {
        certifyMethod: 'P',
        memberName: '',
        memberId: '',
        emailId: '',
        emailDomain: '',
        cellPhone: '',
        isValid: true,
        isOtherDomain: false,
        otherDomain: '',
        sEncData : '',
        query : {},
        result : {},
        loading: true,
        uuidForCertifiNum: '',
        certifiNum: '',
    }

    componentDidMount = () => {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/find/pw',
            'page_title': '비밀번호 찾기｜비바샘'
        });

        const { location } = this.props;
        let query = queryString.parse(location.search);
        this.setState({
            query : query
        });

        if(!query.uuid || typeof query.uuid === 'undefined') {
            //this.props.history.go(-1);
        } else {
            this.getIdentificationData(query.uuid);
        }

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    //핸드폰번호 체크
    phonecheck = (e) => {
        e.target.value = common.autoHypenPhone(e.target.value);
        this.handleChange(e);
    }

    handleChange = (e) => {
        let { isOtherDomain } = this.state;
        if(e.target.name === 'emailDomain'){
            if(e.target.value === 'otherDomain'){
                isOtherDomain = true
            }else{
                isOtherDomain = false
            }
        }

        this.setState({
            [e.target.name]: e.target.value,
            isValid: true,
            isOtherDomain
        });
    }

    handleTabClick = (certifyMethod) => {
        this.setState({
            certifyMethod,
            emailId: '',
            emailDomain: '',
            cellPhone: ''
        });
    }

    handleFindPw = async (e) => {
        const { PopupActions, BaseActions } = this.props;
        const { certifyMethod, memberName, memberId, emailId, emailDomain, isOtherDomain, otherDomain } = this.state;
        let memberEmail = '';
        let { cellPhone }  = this.state;

        try {
            if(isEmpty(trim(memberName))) {
                common.error("성명을 입력해주세요.");
                return false;
            }

            const regExpName = /[\uac00-\ud7a3]{2,4}/;
            if(!regExpName.test(memberName)) {
                common.error("올바른 성명 형식이 아닙니다.");
                return false;
            }
            if ( !memberId || memberId.length < 4) {
                common.error("아이디를 입력해 주세요.");
                return false;
            }

            if(certifyMethod === 'E') {
                memberEmail = emailId+ (isOtherDomain ? "@"+otherDomain : emailDomain);
                const regExpEmail=/^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
                if(!regExpEmail.test(memberEmail)) {
                    common.error("올바른 이메일 형식이 아닙니다.");
                    return false;
                }
                cellPhone = '';
            }else {
                if(isEmpty(trim(cellPhone))) {
                    common.error("휴대전화번호를 입력해주세요.");
                    return false;
                }

                var regExpPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
                if(!regExpPhone.test(cellPhone)) {
                    common.error("올바른 휴대전화번호 형식이 아닙니다.");
                    return false;
                }
                cellPhone = cellPhone.trim().replace(/[^0-9]/g, '');
                memberEmail = '';
            }

            BaseActions.openLoading({loadingType:"2"});
            const response = await findPwd(memberName, memberId, memberEmail, cellPhone);

            if (response.data != '' && response.data.result == 0) {
                if (response.data.randomNumber && response.data.randomNumber.length > 0) {
                    alert('인증번호가 발송되었습니다.');
                } else {
                    alert('인증번호가 발송되었습니다.');
                }
            } else if(response.data.code == 'success') {
                alert(response.data.msg);
                return;
            } else {
                alert("죄송합니다.\n\n" + "현재 시스템 안정화 작업 중이며\n" + "빠른 작업으로 서비스 이용에 차질 없도록 하겠습니다.\n" + "감사합니다.");
                return;
            }

            if((response.data.memberEmail || response.data.cellPhone) && response.data.uuidForCertifiNum) {
                this.setState({
                    uuidForCertifiNum: response.data.uuidForCertifiNum
                });
            }else {
                this.setState({
                    isValid: false
                });
            }

        } catch (e) {
            console.log(e);

            if (e.response.data && e.response.data.code === '9001') {
                common.error(e.response.data.message);
                return;
            }

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

        } finally {
            BaseActions.closeLoading();
        }
    }

    //아이핀 인증
    handleIpinVerification = async(e) => {
        const { type, agree, check, memberId } = this.props;
        const response = await api.getNiceEncData({TYPE:'IPIN_FIND_PW', ...type, ...agree, ...check, memberId:memberId});

        this.setState({
            sEncData : response.data.sEncData
        });

        //TODO 현재는 팝업식으로 되어 있으나 팝업 오픈 소스를 주석으로 막으면 내부 창으로 열립니다. 어떻게 진행할지는 윤용훈 CP 님하고 결정하여서 처리 되어야 합니다.
        // window.open('', 'popupIPIN2', 'width=450, height=550, top=100, left=100,fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes,location=no, scrollbar=no');
        // document.form_ipin.target = "popupIPIN2";
        document.form_ipin.action = "https://cert.vno.co.kr/ipin.cb";
        document.form_ipin.submit();
    }

    getIdentificationData = async (uuid) => {
        const { PopupActions, BaseActions } = this.props;

        try {
            const result = await api.getIdentificationData(uuid);
            this.setState({result : result.data.result});

            var memberName, memberId, memberEmail, cellPhone, memberIpin;
            memberName = result.data.sName;
            memberId = result.data.existId;
            memberEmail = '';
            cellPhone = '';
            memberIpin = result.data.sCoInfo1;

            //TODO 인증정보 못불러온 경우 인증안내 화면으로 가야...
            console.log(this.props.check);

            if(this.state.result) {
                BaseActions.openLoading({loadingType:"2"});
                //alert("getIdentificationData data : " + memberName + " / " +memberId + " / " +memberEmail + " / " +cellPhone) + " / " + memberIpin;
                const response = await findPwdIpin(memberName, memberId, memberEmail, cellPhone, memberIpin);
                //alert("getIdentificationData response  : " + JSON.stringify(response));
                PopupActions.openPopup({title:"비밀번호 안내", componet:<FindPwdEmailPopup memberEmail={response.data.memberEmail}/>, closeButtonHidden: true});
            } else {
                this.handleTabClick('I');
                this.setState({isValid: false});
            }
            //window.scrollTo(0, 0);
        } catch(e) {
            console.log(e);
            BaseActions.closeLoading();
            this.handleTabClick('I');
            this.setState({isValid: false});
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 700);
        }

    }

    checkCertifiNum = async () => {
        const {PopupActions, BaseActions} = this.props;
        const {isValid, memberId, certifiNum, uuidForCertifiNum} = this.state;

        if(isValid && memberId !== '' && certifiNum !== ''  && certifiNum.length === 6 && uuidForCertifiNum !== '') {
            //서버에서 인증번호 확인
            const response = await api.checkCertifiNumResetPwd(certifiNum, uuidForCertifiNum, memberId);
            if(response.data.code === '0') {
                PopupActions.openPopup({
                    title: "비밀번호 찾기",
                    componet: <FindPwdResetPwdPopup  memberId={memberId} uuidForCertifiNum={uuidForCertifiNum} certifiNum={certifiNum}/>,
                    closeButtonHidden: true
                });
            } else if(response.data.code === '1') {
                common.error("인증번호를 확인해주세요.");
            } else if(response.data.code === '3') {
                common.error("인증번호가 일치하지 않습니다.");
            } else {
                common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
            }
        } else {
            common.error("인증번호를 확인해주세요.");
        }
    }


    render() {
        const { certifyMethod, isValid, sEncData } = this.state;
        const certifyName = certifyMethod === 'E' ? '이메일' : '휴대전화번호';
        return (
            <Fragment>
                <Sticky className={'tab_wrap'}>
                    <ul className="tab tab-col2">
                        <li className={'tab_item ta_r' + (certifyMethod === 'P' ? ' active' : '')}>
                            <a
                                onClick={() => {
                                    this.handleTabClick('P');
                                }}
                                className="tab_link"
                            >
                                <span>휴대전화번호 인증</span>
                                { certifyMethod === 'P' ? (<span className="blind">현재페이지</span>) : '' }
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
                                { certifyMethod === 'E' ? (<span className="blind">현재페이지</span>) : '' }
                            </a>
                        </li>
                    </ul>
                </Sticky>

                <section className="login renew">
                    <h2 className="blind">비밀번호 찾기</h2>
                    {
                        certifyMethod !== 'I' ? (
                            <div className="find_pw">
                                <div className="find_info">
                                    <p className="mb25">성명, 아이디와 함께 회원가입 시 등록하신 {certifyName}을 입력해 주세요. 입력하신 {certifyMethod === 'E' ? '이메일' : '번호'}로 임시 비밀번호가 발송됩니다.</p>

                                    <h2 className="info_tit">성명</h2>
                                    <input
                                        type="text"
                                        name="memberName"
                                        placeholder="성명을 입력하세요"
                                        onChange={this.handleChange}
                                        value={this.state.memberName}
                                        className=""
                                        autoCapitalize="off"
                                    />

                                    <h2 className="info_tit">아이디</h2>
                                    <input
                                        type="text"
                                        name="memberId"
                                        placeholder="아이디를 입력하세요"
                                        onChange={this.handleChange}
                                        value={this.state.memberId}
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

                                                <div className={"mb5"}>

                                                    <div className="selectbox">
                                                        <select name="emailDomain" id="email_select" value={this.state.emailDomain} onChange={this.handleChange}>
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
                                                className="ico_at mb5"
                                            />
                                        )
                                    }

                                    <div>
                                        <a
                                            onClick={this.handleFindPw}
                                            className="btn_full_on bc_gray"
                                        >인증번호 받기</a>
                                    </div>

                                    <div className="find_validate" hidden={isValid}>
                                        <p className="find_validate_txt">
                                            입력하신 정보와 일치하는 회원이 없습니다.<br/>다시 확인해 주세요
                                        </p>
                                    </div>

                                    <h2 className="info_tit">인증번호 입력</h2>
                                    <input
                                        type="number"
                                        name="certifiNum"
                                        placeholder="인증번호를 입력하세요"
                                        onChange={this.handleChange}
                                        value={this.state.certifiNum}
                                        maxLength="13"
                                        className="ico_at mb5"
                                    />

                                    <div>
                                        <a
                                            onClick={this.checkCertifiNum}
                                            className="btn_full_on"
                                        >확인</a>
                                    </div>

                                </div>

                                <div className="guideline"></div>

                                <div className="guide_box">
                                    <p className="guide_box_tel">회원정보가 기억나지 않으실 경우,<br/>
                                        선생님전용 고객센터 <em className="guide_box_marker">1544-7714</em>로 연락 주시면
                                        본인 확인 후 안내해 드리고 있습니다.</p>
                                    <a href="tel:1544-7714" className="ico_tel"><span className="blind">전화걸기</span></a>
                                </div>
                            </div>
                        ) : (
                            <div className="find_info">
                                <div className="find_validate mb25" hidden={isValid}>
                                    <p className="find_validate_txt">입력하신 정보와 일치하는 회원이 없습니다.<br/>다시 확인해 주세요</p>
                                </div>

                                <div>
                                    <form name="form_ipin" method="post">
                                        <input type="hidden" name="m" value="pubmain" />
                                        <input type="hidden" name="enc_data" value={sEncData} />
                                    </form>
                                    <a className="btn_round_on" onClick={this.handleIpinVerification}>아이핀 인증하기</a>
                                </div>
                            </div>
                        )
                    }
                </section>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        type : state.join.get('type').toJS(),
        agree : state.join.get('agree').toJS(),
        check : state.join.get('check').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
  )(withRouter(FindPwd));