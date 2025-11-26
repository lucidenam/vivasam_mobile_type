import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as api from 'lib/api';

class PersonalIdentification extends Component {

    constructor(props) {
      super(props);
    }

    state = {
        sEncData : ''
    }
    
    componentDidMount() {
    }

    //핸드폰 인증
    handleCellVerification = async (e) => {

        const {type, agree, check, isJoin, memberId, verificationType, disabled} = this.props;
        const apiType = verificationType === 'SSO' ? 'NICE_SSO' : verificationType === 'SNS' ? 'NICE_SNS' : 'NICE';

        if(disabled) {
            alert('회원가입을 위해 필수 약관에 동의해 주세요.');
            return;
        }

        const response = await api.getNiceEncData({TYPE: apiType, ...type, ...agree, ...check, memberId: !isJoin ? memberId : ''});

        this.setState({
            sEncData: response.data.sEncData
        });
        document.form_chk.action = "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb";
        document.form_chk.submit();
    }


    //아이핀 인증
    handleIpinVerification = async (e) => {
        const {type, agree, check, isJoin, memberId, verificationType, disabled} = this.props;
        const apiType = verificationType === 'SSO' ? 'IPIN_SSO' : verificationType === 'SNS' ? 'IPIN_SNS' : 'IPIN';

        if(disabled) {
            alert('회원가입을 위해 필수 약관에 동의해 주세요.');
            return;
        }

        const response = await api.getNiceEncData({TYPE: apiType, ...type, ...agree, ...check, memberId: !isJoin ? memberId : ''});
        // alert("========== >>>>> TEST : response : " + response);
        this.setState({
            sEncData: response.data.sEncData
        });
        document.form_ipin.action = "https://cert.vno.co.kr/ipin.cb";
        document.form_ipin.submit();
        // }
    }

    render() {
        const {sEncData} = this.state;
        const {isJoin, disabled} = this.props;

        return (

            <Fragment>

                {/* <!-- CASE : 가입 여부 확인 후 기 가입이력 없을 경우 본인인증 페이지 --> */}
                <div className="join_info certification">
                    <h2>본인인증</h2>
                    {/* <!-- 신규 가입 본인인증시 문구 --> */}
                    {isJoin && (
                        <p className="sub_tit">회원가입을 위해 원하는 본인 인증 방법을 선택해 주세요.</p>
                    )}
                    {/* <!-- 로그인 회원 본인인증시 문구 --> */}
                    {!isJoin && (
                        <p className="sub_tit">회원전환을 위해 원하는 본인 인증 방법을 선택해 주세요.</p>
                    )}

                    <form name="form_chk" method="post">
                        <input type="hidden" name="m" value="checkplusSerivce"/>
                        <input type="hidden" name="EncodeData" value={sEncData}/>
                    </form>
                    <form name="form_ipin" method="post">
                        <input type="hidden" name="m" value="pubmain" />
                        <input type="hidden" name="enc_data" value={sEncData} />
                    </form>

                    <div className="btn_wrap">
                        <button onClick={this.handleCellVerification}><p>휴대폰으로<br /> 인증하기</p></button>
                        <button onClick={this.handleIpinVerification}><p>아이핀으로<br /> 인증하기</p></button>
                    </div>

                    <p className="info">
                        본인 인증 시 제공되는 정보는 해당 인증기관에서
                        직접 수집하며, 인증 이외의 용도로 이용되지 않습니다.
                    </p>

                    <div className="info_tell">
                        <h3 className="icon_noti_type3">본인 인증이 안되실 경우</h3>
                        <div className="tell_box">
                            <p>
                                인증기관에 선생님의 개인 정보가 등록되어 있지 않거나<br /> 또는 다른 이유로 실패할 수 있습니다. 본인 인증 실패<br /> 관련하여서는 인증기관에 문의해 주세요.
                            </p>
                            <div className="line_box top">
                                <p className="line_box_tit">나이스평가정보</p>
                                <a href="tel:1600-1522" className="ico_tel">
                                    <img src="../images/member/tell1.png" alt="나이스평가정보"/>
                                    <span className="blind">1600-1522</span>
                                </a>
                            </div>
                            <div className="line_box">
                                <p className="line_box_tit">비바샘 선생님 전용 고객센터</p>
                                <a href="tel:1544-7714" className="ico_tel">
                                    <img src="../images/member/tell2.png" alt="비바샘 선생님 전용 고객센터"/>
                                    <span className="blind">1544-7714</span>
                                </a>
                            </div>
                            <div className="line_box">
                                <p className="line_box_tit">비바샘 연수원 고객센터</p>
                                <a href="tel:1544-9044" className="ico_tel">
                                    <img src="../images/member/tell3.png" alt="비바샘 연수원 고객센터"/>
                                    <span className="blind">1544-9044</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        type: state.join.get('type').toJS(),
        agree: state.join.get('agree').toJS(),
        check: state.join.get('check').toJS()
    }),
    (dispatch) => ({
        JoinActions: bindActionCreators(joinActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(PersonalIdentification));
