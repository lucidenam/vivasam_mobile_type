import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';

class NeedUpdateMemberInfoPopup2 extends Component {

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
            <section id="popSchoolInfoUpdate" className="popup1006">
                <div className="popInner">
                    <img src="/images/member/ico_popschoolinfo.png" className="memberIon" />
                    <img src="/images/member/tit_popschoolinfo.png" alt="선생님의 재직 학교를 입력해 주세요. 정보를 입력하시면 자료 다운로드를 하실 수 있습니다." />
                    <img src="/images/member/txt_popschoolinfo.png" alt="초,중,고 학교 선생님들께 제공되는 비바샘 교수지원 서비스 이용을 위해 회원정보를 확인하시고, 업데이트해 주세요." />

                    <a href="#" onClick={this.goUpdateInfo}>
                        <img src="/images/member/btn_popschoolinfo.png" alt="개인정보 수정" />
                    </a>
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
)(withRouter(NeedUpdateMemberInfoPopup2));
