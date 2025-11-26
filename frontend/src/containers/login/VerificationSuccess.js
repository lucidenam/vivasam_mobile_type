import React, { Component,Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateUserCiInfo } from 'lib/api';
import {initializeGtag} from "../../store/modules/gtag";

class VerificationSuccess extends Component {

    constructor(props) {
        super(props);
    }

    state = {
        EncodeData : null,
        param_r1 : null,
        param_r2 : null,
        param_r3 : null
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/verification/success',
            'page_title': '본인 인증｜비바샘'
        });
    }

    render() {
        return (
            <Fragment>
                <div>
                    <div id="pop_wrap">
                        <div id="pop_header" className="pop_header">
                            <h1 className="header_tit">본인 인증 완료</h1>
                            <div className="btnClose">
                                <a href="#" className="btn_close"><span className="blind">팝업 닫기</span></a>
                            </div>
                        </div>
                        <section id="pop_content">

                            <div className="teacher_certify">
                                <div className="info_txt_box center">
                                    <em className="txt_marker">abcdef1234</em> 아이디로 본인 인증이 완료되었습니다. 이제 비바샘 교수지원 서비스를 이용하실 수 있습니다.
                                </div>
                                <div className="mt30">
                                    <a href="#" className="btn_full_on">메인으로</a>
                                </div>
                            </div>
                            
                            <div className="guideline"></div>
                            <div className="join_info">
                                <div className="tit_info">비상교육 교사 통합 회원 전환 안내</div>
                                <div className="info_txt_box">
                                    지금, 교사 통합회원으로 전환하시면 티스쿨 원격교육연수원 서비스까지 동시에 이용하실 수 있으며, 이 외에도 다양한 혜택을 받으실 수 있습니다.
                                    <div className="btn_right">
                                        <a href="#" className="txt_marker">자세히 보기</a>
                                    </div>
                                </div>
                            </div>
                            
                        </section>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        agree : state.join.get('agree').toJS(),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        JoinActions: bindActionCreators(joinActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(VerificationSuccess));
