import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';

class FindPwdPhonePopup extends Component {
    handleGoPage = async(path) => {
        const { PopupActions, history} = this.props;
        await PopupActions.closePopup();
        history.push(path);
    }

    render() {
        return (
            <section id="pop_content">
                <div className="popup_content">
                    <p className="popup_content_ment3 mb30">
                        회원님의 휴대전화번호로 임시 비밀번호가<br/>발송되었습니다.
                    </p>

                    <div className="popup_btn_box">
                        <a
                            onClick={() => {
                                this.handleGoPage("/login");
                            }}
                            className="popup_btn_box_type3"
                        >로그인하기</a>
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
)(withRouter(FindPwdPhonePopup));
