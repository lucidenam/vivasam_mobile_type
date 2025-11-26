import React, { Component,Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {initializeGtag} from "../../store/modules/gtag";

class VerificationError extends Component {

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
            'page_path': '/verification/fail',
            'page_title': '본인 인증｜비바샘'
        });
    }

    render() {
        return (
            <Fragment>
                <div>
                    <div id="pop_wrap">
                        <div id="pop_header" className="pop_header">
                            <h1 className="header_tit">본인 인증 실패</h1>
                            <div className="btnClose">
                                <a href="#" className="btn_close"><span className="blind">팝업 닫기</span></a>
                            </div>
                        </div>
                        <section id="pop_content">

                            <div className="teacher_certify renew07">
                                <div className="info_txt_top">
                                    <span>이미 비바샘 통합회원으로 가입되어 있습니다.</span><br/>
                                    아래의 아이디로 로그인 해주세요.
                                </div>
                                <div className="certify_result">
                                    <span className="lb_txt">비바샘 아이디</span>
                                    <strong className="user_id">chiang</strong>
                                </div>
                                <div className="mt15">
                                    <a href="" className="btn_round_on">로그인</a>
                                </div>
                                {/*<p className="find_validate_txt mt15">현재 아이디를 사용할 수 없으므로 <br />자동으로 로그아웃 됩니다.</p>*/}
                            </div>

                            {/*<div className="guideline"></div>
                            <div className="join_info">
                                <span className="icon_noti_type3 txt_marker">아이디 사용 불가 안내</span>
                                현재 로그인하신 <em className="txt_marker">pero</em> 아이디는 사용이불가하니, 안전한 개인정보 관리를 위해 탈퇴하실 것을 권장해 드립니다. 탈퇴는 PC 웹 사이트에서 가능합니다.
                                <div className="btn_right">
                                    <a href="#" className="txt_marker">PC 웹에서 탈퇴하기</a>
                                </div>
                            </div>*/}
                            <div className="guideline"></div>
                            <div className="guide_box">
                                <h2 className="guide_box_tit">본인 인증 및 아이디 사용 관련 문의</h2>
                                <span className="guide_box_num">1544-7714</span><em className="txt_marker">(09:00~18:00)</em>
                                <a href="tel:1544-7714" className="ico_tel"><span className="blind">전화걸기</span></a>
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
        agree : state.join.get('agree').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        JoinActions: bindActionCreators(joinActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(VerificationError));
