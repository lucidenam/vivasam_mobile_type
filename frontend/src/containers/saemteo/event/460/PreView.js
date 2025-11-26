import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {Cookies} from "react-cookie";
import * as common from "../../../../lib/common";
const cookies = new Cookies();

class TermsMarketingPopup extends Component {

	state = {
		termVersion: '',
		imgUrl: ''
	}

	componentDidMount() {
		const {text} = this.props;
		const {imgUrl} = this.state;
		this.setState({
			imgUrl : '' + text
		})
	}

	handleChange = (e) => {
		var children = Array.from(document.getElementsByClassName('access_txt')[0].children);
		children.forEach(obj => {
			obj.classList.add('hide');
			if (obj.className.includes(e.target.value)) {
				obj.classList.remove('hide');
			}
		});

		const {termVersion} = this.state;
		this.setState({
			termVersion: e.target.value
		})
	}

	render() {
		const {termVersion, imgUrl} = this.state;
		return (
			<section id="pop_content">
				<div className="popup_content_etc">
					<img src={"/images/events/2023/event230823/viewImg" + imgUrl + ".png" } alt="체인지 메이커 브로마이드 배포 이벤트"/>
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
)(withRouter(TermsMarketingPopup));
