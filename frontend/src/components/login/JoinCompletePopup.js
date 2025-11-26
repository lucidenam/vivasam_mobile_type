import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';

class JoinCompletePopup extends Component {
	closeButtonClick = () => {
		const {PopupActions} = this.props;
		PopupActions.closePopup();
	}

	render() {

		return (
				<div className="join_complete_popup">
					<div className="popup_wrap">
						<div className="txt_box">
							<h4>환영합니다!</h4>
							<p>비바샘 통합회원 가입이 완료되었습니다. <br/>로그인 후 하나의 아이디로 <br/>비바샘의 다양한 서비스를 이용해 보세요.</p>
						</div>
						<Link className="btn" to='/login'>로그인 하기<i></i></Link>
					</div>
				</div>
		);
	}
}

export default connect(
	null,
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch)
	})
)(withRouter(JoinCompletePopup));
