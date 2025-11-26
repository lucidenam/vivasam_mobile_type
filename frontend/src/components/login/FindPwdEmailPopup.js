import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';

class FindPwdEmailPopup extends Component {
    handleGoPage = async(path) => {
        const { PopupActions, history} = this.props;
        await PopupActions.closePopup();
        history.push(path);
    }

    render() {
        const { memberEmail } = this.props;
        return (
            <section id="pop_content">
                <div className="popup_content">
                    <p className="popup_content_ment">
                        회원님의 이메일로 임시 비밀번호가 발송되었습니다.
                    </p>
                    <p className="popup_content_ment2">
                        임시 비밀번호로 로그인하신 후에는<br/>정보보안을 위해 반드시 비밀번호를<br/>변경해 주시기 바랍니다.
                    </p>

                    <div className="popup_content_box">
                        <em className="popup_content_tit">
                            임시 비밀번호 발송 이메일
                        </em>
                        <span className="popup_content_info">
                            {memberEmail}
                        </span>
                    </div>

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
)(withRouter(FindPwdEmailPopup));
