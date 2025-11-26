import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as conversionActions from 'store/modules/conversion';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from "../../lib/api";
import TermsSpecialPopup from 'components/login/TermsSpecialPopup';
import TermsServicePopup from 'components/login/TermsServicePopup';
import TermsPrivacyAgreePopup from 'components/login/TermsPrivacyAgreePopup';
import TermsMarketingPopup from 'components/login/TermsMarketingPopup';
import {initializeGtag} from "../../store/modules/gtag";
import PersonalIdentification from "../../components/login/PersonalIdentification";

class SsoChangeAgree extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.nextButtonClick = debounce(this.nextButtonClick, 300);

        this.all = React.createRef();
        // this.thirdPrivacy = React.createRef();
        this.thirdMarketing = React.createRef();
    }

    state = {
        checkGoNext: false,
        ipinYn:'',
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/conversion/agree',
            'page_title': '약관 동의 | 통합전환｜비바샘'
        });
        const { logged, loginInfo, agree, history, ConversionActions } = this.props;

        //미로그인시 로그인페이지 이동
        if( !logged ) {
            history.replace("/login");
            return;
        }
        this.checkPossibleGoNext();
        this.goConversion();


        agree['mTypeCd'] = loginInfo.mTypeCd;
        ConversionActions.pushValues({type: "agree", object: agree});
    }

    goConversion = async (e) => {
        localStorage.removeItem("checkAuthIpinYn");

        // 본인 임시인증 비교 추가
        const response = await api.checkAuthIPIN();

        if (response.data.IPIN_CHECK === 'NotAllowAuth') {
            // common.info('본인인증을 받으신 후 통합회원으로 전환하실 수 있습니다.\n선생님 전용 고객센터 1544-7714');
            localStorage.setItem("checkAuthIpinYn", "Y");
            this.props.history.push("/conversion/agree");
        } else {
            localStorage.setItem("checkAuthIpinYn", "N");
            this.props.history.push("/conversion/agree");
        }
        this.isIpinYn(localStorage.getItem("checkAuthIpinYn"))
    };

    handleChange = (e) => {
        const {agree, ConversionActions} = this.props;

        if (e.target.name === "all") {
            // 전체 클릭시
            for (let key in agree) {
                if (key === 'mTypeCd') {
                    continue;
                }
                agree[key] = e.target.checked;
            }
        } else if(e.target.name === "mTypeCd") {
            agree[e.target.name] = e.target.value;
        } else {
            // 부분 클릭시
            agree.all = false;
            agree[e.target.name] = e.target.checked;
        }

        ConversionActions.pushValues({type: "agree", object: agree});

        this.checkPossibleGoNext();
    }

    checkPossibleGoNext = () => {
        let checkNext = false;

        if (this.props.agree.all || (this.props.agree.tschPrivacy && this.props.agree.tschService )) {
            checkNext = true;
        }
        this.setState({checkGoNext: checkNext});
    }

    nextButtonClickSafe = (e) => {
        this.nextButtonClick(e.target);
    }

    nextButtonClick = (target) => {
        const {history, agree} = this.props;
        const ipinYn = localStorage.getItem("checkAuthIpinYn");

        if(!this.state.checkGoNext) {
            alert('통합회원 전환을 위해 필수 약관에 동의해 주세요.');
            return;
        }

        try {
            target.disabled = true;
            let checkFlag = false;

            if (agree.all || (agree.tschPrivacy && agree.tschService )) {
                    checkFlag = true;
            }

            if (checkFlag) {
                history.push('/conversion/check');
            } else {
                // common.error("위 필수 내용에 모두 동의 후 진행 가능합니다.");
                target.disabled = false;
                this.refs.all.focus();
            }
        } catch (e) {
            target.disabled = false;
            console.log(e);
        }
    }

    openPopupTerms = (e) => {
        e.preventDefault();
        const {PopupActions} = this.props;
        let container;
        let title;
        switch (e.target.name) {
            case 'special':
                container = <TermsSpecialPopup/>;
                title = '비상교육 선생님 통합회원 서비스 특별약관';
                break;
            case 'tschService':
                container = <TermsServicePopup/>;
                title = <Fragment>서비스 이용약관</Fragment>;
                break;
            case 'tschPrivacy':
                container = <TermsPrivacyAgreePopup/>;
                title = <Fragment>개인정보 수집 및 이용 동의</Fragment>;
                break;
            case 'thirdMarketing':
                container = <TermsMarketingPopup/>;
                title = <Fragment>교육청 위탁연수 정보 및 마케팅 정보 활용 동의</Fragment>;
                break;
            default:
                break;
        }
        PopupActions.openPopup({title: title, componet: container, wrapClassName:"auto_content"});
    }

    cancleButtonClick = (e) => {
        const {history, ConversionActions} = this.props;
        if (window.confirm('통합 전환 안내를 취소하고 비바샘 메인으로 이동합니다.')) {
            //redux값 초기화
            ConversionActions.defaultStore();
            history.push('/');
        }
    }

    isIpinYn = (data) => {
        this.setState({ipinYn: data});
    }

    render() {
        const {agree, loginInfo} = this.props;
        const { ipinYn } = this.state
        const ipinYn2 = localStorage.getItem("checkAuthIpinYn");
        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">약관 동의 및 본인인증</h2>
                    <div className="step_num_box">
                        <span className="step_num active"><span className="blind">현재페이지</span>1</span>
                        <span className="step_num">2</span>
                        <span className="step_num">3</span>
                    </div>
                </div>
                <section className="join renew07">
                    <div className="join_agree">
                        <div className="join_info">
                            <h2>회원 유형</h2>
                            <ul className="category_list">
                                <li>
                                    <input type="radio" name="mTypeCd" id="mTypeCd1" value="0"
                                           checked={agree.mTypeCd === '0'} onChange={this.handleChange} />
                                    <label htmlFor="mTypeCd1"><p>학교선생님</p></label>
                                </li>
                                <li>
                                    <input type="radio" name="mTypeCd" id="mTypeCd2" value="2"
                                           checked={agree.mTypeCd === '2'} onChange={this.handleChange} />
                                    <label htmlFor="mTypeCd2"><p>교육 대학생</p></label>
                                </li>
                                <li>
                                    <input type="radio" name="mTypeCd" id="mTypeCd3" value="1"
                                           checked={agree.mTypeCd === '1'} onChange={this.handleChange} />
                                    <label htmlFor="mTypeCd3"><p>교육전문직원<br /><span>(유치원/교육청)</span></p></label>
                                </li>
                                <li>
                                    <input type="radio" name="mTypeCd" id="mTypeCd4" value="3"
                                           checked={agree.mTypeCd === '3'} onChange={this.handleChange} />
                                    <label htmlFor="mTypeCd4"><p>일반</p></label>
                                </li>
                            </ul>
                        </div>
                        <div className="join_info agree">
                            <h2>약관동의</h2>
                            {/*<Fragment>*/}
                            {/*    <h3 className="join_check_title">통합회원 특별 약관</h3>*/}
                            {/*    <ul>*/}
                            {/*        <li className="join_check_list">*/}
                            {/*            <div className="join_check_box">*/}
                            {/*                <input type="checkbox" className="checkbox_circle"*/}
                            {/*                       id="special"*/}
                            {/*                       checked={agree.special}*/}
                            {/*                       onChange={this.handleChange}*/}
                            {/*                       ref="special"*/}
                            {/*                       name="special"/>*/}
                            {/*                <label htmlFor="special">*/}
                            {/*                    <strong className="join_check_tit">비상교육 선생님 통합회원 서비스 특별 약관 <span*/}
                            {/*                        className="marker">(필수)</span></strong>*/}
                            {/*                </label>*/}
                            {/*            </div>*/}
                            {/*            <a className="join_btn_arrow"*/}
                            {/*               name="special"*/}
                            {/*               onClick={this.openPopupTerms}>약관페이지 이동</a>*/}
                            {/*        </li>*/}
                            {/*    </ul>*/}
                            {/*</Fragment>*/}
                            <Fragment>
                                {/*<h3 className="join_check_title">비바샘 원격교육연수원</h3>*/}
                                <ul>
                                    <li className="join_check_list">
                                        <div className="join_check_box">
                                            <input type="checkbox" className="checkbox_circle"
                                                   id="tschService"
                                                   checked={agree.tschService}
                                                   onChange={this.handleChange}
                                                   ref="tschService"
                                                   name="tschService"/>
                                            <label htmlFor="tschService">
                                                <strong className="join_check_tit">서비스 이용약관 동의 <span
                                                    className="marker">(필수)</span></strong>
                                            </label>
                                        </div>
                                        <a className="join_btn_arrow"
                                           name="tschService"
                                           onClick={this.openPopupTerms}>약관페이지 이동</a>
                                    </li>
                                    <li className="join_check_list">
                                        <div className="join_check_box">
                                            <input type="checkbox" className="checkbox_circle"
                                                   id="tschPrivacy"
                                                   checked={agree.tschPrivacy}
                                                   onChange={this.handleChange}
                                                   ref="tschPrivacy"
                                                   name="tschPrivacy"/>
                                            <label htmlFor="tschPrivacy">
                                                <strong className="join_check_tit">개인정보 수집 및 이용 동의 <span
                                                    className="marker">(필수)</span></strong>
                                            </label>
                                        </div>
                                        <a className="join_btn_arrow"
                                           name="tschPrivacy"
                                           onClick={this.openPopupTerms}>약관페이지 이동</a>
                                    </li>
                                    <li className="join_check_list">
                                        <div className="join_check_box">
                                            <input type="checkbox" className="checkbox_circle"
                                                   id="thirdMarketing"
                                                   checked={agree.thirdMarketing}
                                                   onChange={this.handleChange}
                                                   ref="thirdMarketing"
                                                   name="thirdMarketing"/>
                                            <label htmlFor="thirdMarketing">
                                                <strong className="join_check_tit">교육청 위탁연수 정보 및 마케팅 활용 동의 <span
                                                    className="txt_note">(선택)</span></strong>
                                            </label>
                                        </div>
                                        <a className="join_btn_arrow"
                                           name="thirdMarketing"
                                           onClick={this.openPopupTerms}>약관페이지 이동</a>
                                    </li>
                                </ul>
                            </Fragment>
                            <ul>
                                <li className="join_check_list all">
                                    <div className="join_check_box">{/* <!-- 전체 동의 클래스 all 추가 --> */}
                                        <input type="checkbox" className="checkbox_circle"
                                               id="all"
                                               checked={agree.all}
                                               onChange={this.handleChange}
                                               ref="all"
                                               name="all"/>
                                        <label htmlFor="all">
                                            <strong className="join_check_tit">전체동의</strong>
                                            <span className="join_check_txt">(약관에 모두 동의합니다)</span>
                                        </label>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {ipinYn == 'Y' &&
                        <PersonalIdentification callback={this.update} isJoin={true} disabled={!this.state.checkGoNext} verificationType={'SSO'}/>
                        }
                        {ipinYn == 'N' &&
                        <div className="btn_half">
                            <button type="button"
                                    className="btn_square_gray"
                                    onClick={this.cancleButtonClick}>취소
                            </button>
                            <button type="button"
                                    className="btn_full_on" 
                                    onClick={this.nextButtonClickSafe}>다음
                            </button>
                        </div>
                        }
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
        event: state.conversion.get('event').toJS(),
        agree: state.conversion.get('agree').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        ConversionActions: bindActionCreators(conversionActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SsoChangeAgree));