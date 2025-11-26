import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';

class NeedUpdateMemberInfoPopup extends Component {
    goUpdateInfo = async(e) => {
        e.preventDefault();
        const { PopupActions, handleClose } = this.props;
        await PopupActions.closePopup();
        if(handleClose) {
            handleClose();
        }
        this.props.history.push('/myInfo');
    }


    render() {
        return (
            <section id="pop_content">
                <div className="login_auto">
                    <strong className="login_auto_tit ico_symbol4">비바샘 서비스 이용을 위해<br/>
                        아직 입력하지 않은 <em className="marker2">회원정보</em>를<br/>업데이트해 주세요
                    </strong>

                    {/* <!-- 2019-08-16 문구 수정 --> */}
                    <p className="mb30 infoText">비바샘은 학교 선생님을 위한 <br/>비상교과서 교수지원 서비스로 <br/>교사인증 및 정확한 회원정보가 필요합니다.<br/>업데이트하지 않으실 경우 <br/>비바샘 서비스 이용이 제한됩니다.</p>

                    {/* <!-- 2019-08-16 버튼 명 수정 --> */}
                    <a href="#" onClick={this.goUpdateInfo} className="btn_round_on mb10">회원정보 수정</a>
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
)(withRouter(NeedUpdateMemberInfoPopup));
