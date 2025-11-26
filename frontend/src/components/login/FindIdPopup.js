import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';

class FindIdPopup extends Component {
    handleGoPage = async(path) => {
        const { PopupActions, history} = this.props;
        await PopupActions.closePopup();
        history.push(path);
    }
    render() {
        const { memberId } = this.props;
        return (
            <section id="pop_content">
                <div className="popup_content">
                    <p className="popup_content_ment">회원님의 비바샘 아이디는 아래와 같습니다.</p>
                    <div className="popup_content_box">
                        <em className="popup_content_tit">아이디</em>
                        <span className="popup_content_info">{memberId}</span>
                    </div>
                    <div className="popup_btn_box">
                        <a
                            onClick={() => {
                                this.handleGoPage("/login");
                            }}
                            className="popup_btn_box_type1"
                        >로그인하기</a>
                        <a
                            onClick={() => {
                                this.handleGoPage("/find/pw");
                            }}
                            className="popup_btn_box_type2"
                        >비밀번호 찾기</a>
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
)(withRouter(FindIdPopup));
