import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as popupActions from 'store/modules/popup';
import * as ConversionActions from 'store/modules/conversion';
import * as baseActions from 'store/modules/base';
import * as api from 'lib/api';
import * as common from 'lib/common';
import {initializeGtag} from "../../store/modules/gtag";

class SsoChangeTeacher extends Component {

    constructor(props) {
        super(props);
        // Debounce
    }

    state = {
        file: null,
        fileName: '없음',
        fileUrl: null,
        userId: '',
        visible: false,
        vivaBenefitVisible : false,
        tschBenefitVisible : false
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/conversion/teacher',
            'page_title': '전환 완료 및 교사 인증 | 통합전환｜비바샘'
        });

    }

    nextButtonClickSafe = (e) => {
        window.location.hash = '/login/requireAdd';
        window.viewerClose();
    }

    handleVivaBenefit = (e) =>  {
        e.preventDefault();
        this.setState({
            vivaBenefitVisible : true
        });
    }

    handleTschBenefit = (e) =>  {
        e.preventDefault();
        this.setState({
            tschBenefitVisible : true
        });
    }

    handleCloseBenefit = (e) => {
        e.preventDefault();
        this.setState({
            vivaBenefitVisible : false,
            tschBenefitVisible : false
        });
    }

    closeButtonClick = () => {
        const {history} = this.props;
		history.push('/');
    }

    render() {
        const { info } = this.props;
        const ipinYn = localStorage.getItem("checkAuthIpinYn");

        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">
                        전환 완료 및 교사 인증
                    </h2>
                    {ipinYn == 'N' &&
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num">3</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>4</span>
                    </div>
                    }

                    {ipinYn == 'Y' &&
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num">3</span>
                        <span className="step_num">4</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>5</span>
                    </div>
                    }
                </div>
                <section className="join">
                    {info.validYN === 'N' && (
                        <div className="join_info">
                            <div className="c_black">
                                비상교육 선생님 통합회원 전환이 모두 완료되었습니다.<br/>비바샘 교수지원 서비스와 티스쿨 원격교육연수원 사이트를 한 개의 아이디로 편리하게 이용하실 수
                                있습니다.
                            </div>
                            <Fragment>
                                <div className="certify_document">
                                    <p className="txt_marker">학교 선생님이시라면, 비바샘 교수지원 서비스 이용을 위해 교사 인증을 추가로 해 주세요. </p>
                                    <p className="certify_txt">아래의 안내에 따라 서류인증을 완료하여 주세요.</p>
                                    <p className="c_gray_soft mb25">(PC에서 로그인을 하시면 EPKI/GPKI 인증을 진행하실 수 있습니다.)</p>
                                </div>

                                <div className="join_info">
                                    <a onClick={this.nextButtonClickSafe} className="btn_round_off mb10">서류 인증 하기</a>
                                    <a onClick={this.closeButtonClick} className="btn_round_off">서류 인증 나중에 하기<span
                                        className="c_gray_txt">(메인으로 이동)</span></a>
                                </div>
                            </Fragment>
                        </div>
                    )}
                    {info.validYN != 'N' && (
                        <Fragment>
                            <div className="join_info">
                                <div className="c_black">
                                    통합회원 전환이 모두 완료되었습니다. <br/>비바샘 교수학습지원 서비스와 원격교육연수원 서비스를 한 개의 아이디로 편리하게 이용하실 수 있습니다.
                                </div>
                            </div>
                        </Fragment>
                    )}
                    {/* <!-- 비바샘 혜택 레이어 팝업 --> */}
                    <div id="popIntegrated1" className="popIntegrated" style={{display: this.state.vivaBenefitVisible ? 'block' : 'none'}} >
                        <div className="layer_mask"></div>
                        <div className="layer_popup">
                            <img src="../images/member/pop_service_v.png" alt="비바샘 서비스" className="vivasam" />
                            <a href="#" onClick={this.handleCloseBenefit} className="btn_close"><span className="blind">닫기</span></a>
                        </div>
                    </div>
                    {/* <!-- // 비바샘 혜택 레이어 팝업 --> */}

                    {/* <!-- 티스쿨 혜택 레이어 팝업 --> */}
                    <div id="popIntegrated2" className="popIntegrated" style={{display: this.state.tschBenefitVisible ? 'block' : 'none'}} >
                        <div className="layer_mask"></div>
                        <div className="layer_popup">
                            <img src="../images/member/pop_service_t.png" alt="티스쿨 서비스" className="tschool" />
                            <a href="#" onClick={this.handleCloseBenefit} className="btn_close"><span className="blind">닫기</span></a>
                        </div>
                    </div>
                    {/* <!-- // 티스쿨 혜택 레이어 팝업 --> */}

                    <div className="join_info">
                        <Link to="/login" className="btn_round_on">통합회원 로그인</Link>
                    </div>

                </section>
            </Fragment>
        );
    }
}

export default connect(
  (state) => ({
    logged: state.base.get("logged"),
    agree: state.conversion.get('agree').toJS(),
    check: state.conversion.get('check').toJS(),
    info: state.conversion.get('info').toJS(),
    school: state.conversion.get('school').toJS(),
    isApp: state.base.get('isApp')
  }),
  (dispatch) => ({
    PopupActions: bindActionCreators(popupActions, dispatch),
    ConversionActions: bindActionCreators(ConversionActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(SsoChangeTeacher));
