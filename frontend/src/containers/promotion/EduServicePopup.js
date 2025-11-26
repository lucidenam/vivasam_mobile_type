import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from 'redux';
import * as api from 'lib/api';
import $ from "jquery";

class EduServicePopup extends Component {
	constructor(props) {
		console.log(props)
		super(props);
	}

	onCloseLayer = () => {
		const {PopupActions} = this.props;
		PopupActions.closePopup();
	}

	serviceNotificationApply = async () => {
		if(!$("#serviceAgree").prop("checked")) {
			alert('개인정보수집 및 이용에 대해 동의해주세요.');
			return false;
		}

		const response = await api.serviceNotificationApply();
		alert(response.data.msg);
		this.onCloseLayer();
	}
	render() {
		return (
			<section id="pop_content">
				<div className="popup_content">
					<div className="serviceInfoPop">
						<p className="serviceTxt">
							선생님의 휴대폰으로 오픈 안내 알림이 발송됩니다.<br />
							이를 위해 아래의 개인정보 수집에 동의해 주세요.
						</p>
						<ul className="serviceList">
							<li><strong><span>신청 항목</span> : 비바클래스</strong></li>
							<li><strong><span>수집 항목</span> : 휴대전화번호</strong></li>
							<li><strong><span>개인정보 수집목적</span> : 신규 서비스 오픈 안내</strong></li>
							<li><strong><span>개인정보의 보유 및 이용 기간</span> : 6개월까지</strong></li>
						</ul>
						<div className="agreeWrap">
							<input type="checkbox" name="display" id="serviceAgree" value="Y" /><label htmlFor="serviceAgree">개인정보수집 및 이용에 대해 동의합니다.</label>
						</div>
						<div className="btn_half">
							<button type="button" className="btn_square_gray" onClick={this.onCloseLayer}>취소</button>
							<button type="button" className="btn_full_on" onClick={this.serviceNotificationApply}>확인</button>
						</div>
					</div>
				</div>
				<a onClick={this.onCloseLayer} className="btn_close2"><span className="blind">레이어 닫기</span></a>
			</section>
		);
	}
}

export default connect(
	(state) => ({
		logged: state.base.get('logged'),
		loginInfo: state.base.get('loginInfo').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(EduServicePopup));