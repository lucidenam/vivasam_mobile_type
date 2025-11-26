import React, { Component } from 'react';
import moment from 'moment';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {TeacherCertify} from 'containers/login';

class AuthRenew extends Component {
    handleOpenCertifyPopup= () => {
        const { PopupActions, loginInfo, logged} = this.props;
        console.log(loginInfo);
        //PopupActions.openPopup({title:"비바샘 교사 인증(서류)", componet:<TeacherCertify userId={loginInfo.memberId} />});
        if (logged) {
            window.location.hash = '/login/require';
            window.viewerClose();
        } else {
            window.location.hash = '/';
            window.viewerClose();
        }
    }


    render() {
        const { valEndDate } = this.props;

        let endDays = 30;
        let isEndDay = false;

        if(valEndDate) {
            endDays = Math.ceil(( moment(valEndDate, "YYYY-MM-DD") - moment() ) / 1000 / 60 / 60 / 24 );
        }
        
        if(endDays < 1) isEndDay = true;

        return (
            <section className="login">
                <h2 className="blind">인증갱신안내</h2>

                <div className="login_auto">
                    <strong className="login_auto_tit ico_symbol2">교사용 인증갱신이 필요합니다.</strong>
                    {isEndDay &&
                        <p className="login_auto_ment"><em className="marker">인증 유효기간 만료일</em> 입니다.</p>
                    }
                    {!isEndDay &&
                        <p className="login_auto_ment"><em className="marker">인증 유효기간 만료 {endDays}일전</em> 상태입니다.</p>
                    }

                    <p className="mb10">비바샘은 교사인증을 통해 이용하실 수 있으므로<br/>서류인증을 통해 인증을 완료하신 후 다시 로그인을 해주세요.</p>
                    <p className="mb40">EPKI/GPKI 인증서를 가지고 계신 선생님께서는<br/>PC웹사이트에서 인증 가능합니다.</p>

                    <a
                        onClick={this.handleOpenCertifyPopup}
                        className="btn_round_on"
                    >비바샘 재인증하기</a>
                </div>

                <div className="guideline"></div>

                <div className="guide_box">
                    <h2 className="guide_box_tit">선생님 전용 고객센터</h2>
                    <span className="guide_box_tel">1544-7714(평일 09:00~18:00)</span>
                    <a href="tel:1544-7714" className="ico_tel"><span className="blind">전화걸기</span></a>
                </div>

            </section>
        );
    }
}

export default connect(
    (state) => ({
        valEndDate: state.base.get('valEndDate'),
        loginInfo: state.base.get('loginInfo').toJS(),
        logged: state.base.get("logged"),
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(AuthRenew);
