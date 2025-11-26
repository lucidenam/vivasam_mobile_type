import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';

class WakeUpPopup extends Component {
    closeButtonClick = () => {
        const { PopupActions } = this.props;
        PopupActions.closePopup();
    }

    goMain = async() => {
        const { PopupActions, history} = this.props;
        await PopupActions.closePopup();
        history.push("/");
    }

    render() {
        const {sleepId} = this.props;

        return (
            <section id="pop_content">
                <div className="popup_content mt55">
                    <p className="popup_content_ment_tit"><em className="popup_marker2">{sleepId}</em> 아이디가 휴면상태에서 해제되어 비바샘을 정상적으로 이용하실 수 있습니다.</p>
                    <p className="popup_content_ment2 mb30">개인정보 보호를 위해 로그인 하신 후 변경된 개인정보 및 비밀번호 등을 수정해 주세요.</p>

                    <div className="popup_btn_box">
                        <a
                            onClick={this.closeButtonClick}
                            className="popup_btn_box_type1"
                        >로그인하기</a>
                        <a
                            onClick={this.goMain}
                            className="popup_btn_box_type2"
                        >메인으로</a>
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(WakeUpPopup));
