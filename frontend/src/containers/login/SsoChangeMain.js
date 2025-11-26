import React, { Component,Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as ConversionActions from 'store/modules/conversion';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as common from 'lib/common';
import * as api from 'lib/api';
import {initializeGtag} from "../../store/modules/gtag";

class SsoChangeMain extends Component {

    constructor(props) {
        super(props);
    }

    state = {
        vivaBenefitVisible : false,
        tschBenefitVisible : false
    }

    componentDidMount(){
        this._isMounted = true;
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/conversion/main',
            'page_title': '회원통합｜비바샘'
        });

        const {logged, loginInfo, history, ConversionActions} = this.props;
        if(!logged) {
            history.replace('/login');
        } else if(loginInfo.ssoMemberYN == 'Y') {
            history.replace('/');
        }

        //redux값 초기화
        ConversionActions.defaultStore();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    next = () => {
        const {history} = this.props;
        history.push('/conversion/agree');
    }

    handleVivaBenefit = (e) =>  {
        e.preventDefault();
        this.setState({
            vivaBenefitVisible : true
        });
        window.scrollTo(0, this.refs.integHeader.getBoundingClientRect().height);
    }

    handleTschBenefit = (e) =>  {
        e.preventDefault();
        this.setState({
            tschBenefitVisible : true
        });
        window.scrollTo(0, this.refs.integHeader.getBoundingClientRect().height);
    }

    handleCloseBenefit = (e) => {
        e.preventDefault();
        this.setState({
            vivaBenefitVisible : false,
            tschBenefitVisible : false
        });
        console.log(this.refs.btnPopIntegrated.getBoundingClientRect());
        window.scrollTo(0, this.refs.btnPopIntegrated.getBoundingClientRect().top);
    }

    handleChangeAgree = (e) => {
        const { event,ConversionActions } = this.props;
        event['agree'] = e.target.checked;
        ConversionActions.pushValues({type:'event', object:event});
    }

    goConversion = async (e) => {
        e.preventDefault();
        localStorage.removeItem("checkAuthIpinYn");

        // 본인 임시인증 비교 추가
        const response = await api.checkAuthIPIN();
        if(response.data.IPIN_CHECK === 'NotAllowAuth'){
            // common.info('본인인증을 받으신 후 통합회원으로 전환하실 수 있습니다.\n선생님 전용 고객센터 1544-7714');
            localStorage.setItem("checkAuthIpinYn", "Y");
            this.props.history.push("/conversion/agree");
        }else{
            localStorage.setItem("checkAuthIpinYn", "N");
            this.props.history.push("/conversion/agree");
        }
    };

    render() {
        const { event } = this.props;
        return (
            <Fragment>

                <header ref="integHeader" className="header_integrated">
                    <div className="inner">
                        <h1 className="blind">비상교육 선생님 통합회원</h1>
                        <span className="blind">비바샘 X 티스쿨원격교육연수원</span>
                    </div>
                </header>
                <section className="integrated_cont">
                    <img src="../images/member/benefit.png" alt="비상교육 선생님 통합회원 전환" />
                    <div className="blind">
                        <dl>
                            <dt>비바샘</dt>
                            <dd>
                                <ul>
                                    <li>30만 개의 과목별 수업 자료</li>
                                    <li>국내 최대 규모의 문제은행</li>
                                    <li>현장맞춤형 창의융합/수업혁신 자료</li>
                                    <li>비상교육 네트워크 자료 (교재/이러닝/입시)</li>
                                </ul>
                            </dd>
                            <dt>티스쿨원격교육원수원</dt>
                            <dd>
                                <ul>
                                    <li>차별화된 선생님 맞춤형 원격연수</li>
                                    <li>전국 17개 시 도 교육청 연수 실시</li>
                                    <li>신규 선생님 전원 무료 수강권</li>
                                    <li>가입 포인트 1,000점 + 누적 포인트 현금화</li>
                                </ul>
                            </dd>
                        </dl>
                        <ul>
                            <li>선생님 전용 연수/문화행사</li>
                            <li>선생님 전용 이벤트/캠페인</li>
                            <li>맞춤형 메일 서비스 (교육청/과목/테마별)</li>
                            <li>선생님 전용 고객센터</li>
                        </ul>
                    </div>

                    <div id="btnPopIntegrated" ref="btnPopIntegrated" className="btn_service">
                        <a href="#" onClick={this.handleVivaBenefit} className="btn_service_v"><span>비바샘 서비스 <br />자세히 보기</span></a>
                        <a href="#" onClick={this.handleTschBenefit} className="btn_service_t"><span>비바샘 연수원 서비스 <br />자세히 보기</span></a>
                    </div>

                    <div className="btn_join">
                        <a href="#" onClick={this.goConversion} ><img src="../images/member/btn_join2.png" alt="통합회원 전환하기" /></a>
                    </div>

                    <div className="info_box_dash">
                        <ul>
                            <li>지금, 선생님 통합회원으로 전환하시면 비바샘 + 비바샘 원격교육연수 서비스를 <strong className="marker">1개의 ID로 동시에 이용하실 수 있습니다.</strong></li>
                            <li>비바샘 원격교육연수원에서 지급되는 포인트는 해당 사이트에서만 사용하실 수 있습니다. (비바샘에서 포인트 사용 불가)</li>
                            <li>초·중·고 학교 선생님, EPKI/GPKI 인증서를 갖고 계신 경우 비바샘 정회원 서비스를 이용하실 수 있습니다. <br />선생님 인증이 어려운 경우, 비바샘 자료 이용이 일부 제한됩니다.</li>
                        </ul>
                    </div>

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
                </section>

            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.conversion.get('event').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        ConversionActions: bindActionCreators(ConversionActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SsoChangeMain));
