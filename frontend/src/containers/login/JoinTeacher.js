import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import {callTrackingTag, isProd} from "../../lib/TargetingUtils";
import {initializeGtag} from "../../store/modules/gtag";

class JoinTeacher extends Component {

    state = {
        file : null,
        fileName : '없음',
        fileUrl : null,
        visible : false,
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/join/teacher',
            'page_title': '가입 완료 및 교사 인증 | 회원가입｜비바샘'
        });
        const {history, info} = this.props;

        if (!info.userId || typeof info.userId === 'undefined') {
            history.go(-1);
        }

        //타겟팅게이츠 스크립트
        if(isProd()) {
            callTrackingTag('Join');
        }
    }

    closeButtonClick = () => {
        const {history} = this.props;
        history.push('/login');
    }

    render() {
        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">가입 완료 및 교사 인증</h2>
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num">2</span>
                        <span className="step_num">3</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>4</span>
                    </div>
                </div>
                <section className="join">
                    <div className="join_info">
                        <div className="c_black">
                            가입이 완료되었습니다.
                            {this.props.agree.thirdPrivacy === 'true' && (
                                <div>
                                    {/* <!-- 통합회원일 경우에만 노출 --> */}
                                    비바샘 교수지원 서비스와 티스쿨원격교육연수원 사이트를 한 개의 아이디로 편리하게 이용하실 수 있습니다.
                                    {/* <!-- //통합회원일 경우에만 노출 --> */}
                                </div>
                            )}
                        </div>
                        <div className="certify_document">
                            <p className="certify_txt">아래의 안내에 따라 서류인증을 완료하여 주세요.</p>
                            <p className="c_gray_soft mb25">(PC에서 로그인을 하시면 EPKI/GPKI 인증을 진행하실 수 있습니다.)</p>
                        </div>
                        <div className="tcWrap">
                            <div className="tcCont">
                                <ul className="tcSelList">
                                    <li>
                                        <span className="listTit">EPKI/GPKI 인증</span>
                                        <div className="listCont">
                                            <p>EPKI 또는 GPKI는 인증서로 인증 후<br />기간 연장 없이 바로 이용이 가능합니다.</p>
                                            <span className="c_o">* PC 비바샘에서 인증 가능합니다.</span>
                                        </div>
                                    </li>
                                    <li>
                                        <span className="listTit">서류 인증</span>
                                        <div className="listCont">
                                            <p>최근 6개월 이내 발급 및 학교 날인이 있는<br/>재직증명서로 교사인증 신청을 해주세요.</p>
                                            <div className="btnWrap">
                                                <Link to="/login/requireAdd" className="btnTc">서류 인증</Link>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <a onClick={this.closeButtonClick} className="btn_round_off">로그인</a>
                        </div>
                    </div>
                </section>
            </Fragment>
        );
    }
}

export default connect(
  (state) => ({
      agree : state.join.get('agree').toJS(),
      info: state.join.get('info').toJS(),
      isApp: state.base.get('isApp')
  }),
  (dispatch) => ({
      PopupActions: bindActionCreators(popupActions, dispatch),
      JoinActions: bindActionCreators(joinActions, dispatch),
      BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(JoinTeacher));
