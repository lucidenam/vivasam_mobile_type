import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';

class ConversionPopup extends Component {
	closeButtonClick = () => {
		const {PopupActions} = this.props;
		PopupActions.closePopup();
	}

	render() {

		return (
				<div className="conversion_popup">
					<div className="popup_wrap">
						<button className="closeBtn"></button>
						<img src="/images/member/conversion_txt.png"
								 alt="지금 통합회원으로 전환하세요"/>
						<Link to='/conversion/main'><img src="/images/member/conversion_btn.png"
																						 alt="통합회원 전환하기"/></Link>
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
)(withRouter(ConversionPopup));
