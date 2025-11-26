import React, {Component} from 'react';
import { marketingAgreeUpdate } from 'lib/api';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';
import { MarketingAgreeInfoPopup } from 'containers/login';

class MarketingAgreeConfirmPopup extends Component {

    handleAgree = async (isAgree) => {
        const { history, PopupActions, handleClose } = this.props;
        const response = await marketingAgreeUpdate(isAgree ? "Y" : "N");
        if(response.data === "SUCCESS") {
            console.debug("마케팅 동의 정보 저장 성공");
            await PopupActions.openPopup({title:"마케팅 및 광고 활용 동의", componet:<MarketingAgreeInfoPopup handleClose={handleClose}/>, templateClassName: 'float_box'});
        }else {
            console.error("마케팅 동의 정보 저장 실패");
        }
    }

    render() {
        return (
            <section id="pop_content">
                <div className="marketing">
                    <p className="marketing_guide1">비바샘에서는 선생님의 개인정보를 통해<br/>신규 자료/서비스 안내와 이벤트 및 프로모션 등을 안내해 드리고 있습니다.
                    </p>
                    <p className="marketing_guide2">정보 수신에 동의하실 경우 아래의 <strong className="popup_marker1">'동의합니다'에 체크해
                        주시면 앞으로 계속 비바샘 소식을 받아보실 수 있습니다.</strong></p>
                    <ul className="marketing_agree">
                        <li className="agree_item">
                            <strong className="marketing_title">목적</strong>
                            <p>신규 서비스 및 이벤트 홍보</p>
                            <em className="marketing_marker">(SMS, 이메일, 전화)</em>
                        </li>
                        <li className="agree_item">
                            <strong className="marketing_title">수집항목</strong>
                            <em className="marketing_marker">아이디, 성명, 이메일, 휴대전화번호</em>
                        </li>
                        <li className="agree_item">
                            <strong className="marketing_title">보유기간</strong>
                            <em className="marketing_marker">회원 탈퇴 후 파기</em>
                        </li>
                    </ul>

                    <p className="marketing_notice icon_noti">마케팅 및 광고 활용 동의(선택)을 거부할 권리가 있으며, 동의하지 않으신 경우 비바샘의 신규 서비스
                        홍보 및 안내를 보내드리지 않습니다.</p>

                    <div className="popup_btn_box">
                        <a onClick={() => { this.handleAgree(true); }} className="popup_btn_box_type1">동의합니다.</a>
                        <a onClick={() => { this.handleAgree(false); }} className="popup_btn_box_type2">동의하지 않습니다.</a>
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
)(withRouter(MarketingAgreeConfirmPopup));
