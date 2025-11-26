import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "store/modules/gtag";
import {
	Access_viva_1,
	Access_viva_2,
	Access_viva_3,
	Access_viva_4,
	Access_viva_5,
	Access_viva_6,
	Access_tsc_1,
	Access_tsc_2,
	Access_tsc_3,
	Access_tsc_4,
	Access_tsc_5,
	Access_tsc_6,
	Access_sso_1,
	Access_sso_2,
	Access_sso_3,
	Access_sso_4,
	Access_sso_5,
	Access_sso_6,
	Access_sso_7,
} from "./index";


class TermsServicePopupHistory extends Component {
	componentDidMount() {
		initializeGtag();
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-HRYH9929GX', {
			'page_path': '/termOfService',
			'page_title': '서비스 이용약관｜비바샘'
		});
	}
	render() {
		const {activeTermItem} = this.props;
		let container;

		switch (activeTermItem) {
			case 'access_ver1_1':
				container = <Access_viva_1/>;
				break;
			case 'access_ver1_2':
				container = <Access_viva_2/>;
				break;
			case 'access_ver1_3':
				container = <Access_viva_3/>;
				break;
			case 'access_ver1_4':
				container = <Access_viva_4/>;
				break;
			case 'access_ver1_5':
				container = <Access_viva_5/>;
				break;
			case 'access_ver1_6':
				container = <Access_viva_6/>;
				break;
			case 'access_ver2_1':
				container = <Access_tsc_1/>;
				break;
			case 'access_ver2_2':
				container = <Access_tsc_2/>;
				break;
			case 'access_ver2_3':
				container = <Access_tsc_3/>;
				break;
			case 'access_ver2_4':
				container = <Access_tsc_4/>;
				break;
			case 'access_ver2_5':
				container = <Access_tsc_5/>;
				break;
			case 'access_ver2_6':
				container = <Access_tsc_6/>;
				break;
			case 'access_ver3_1':
				container = <Access_sso_1/>;
				break;
			case 'access_ver3_2':
				container = <Access_sso_2/>;
				break;
			case 'access_ver3_3':
				container = <Access_sso_3/>;
				break;
			case 'access_ver3_4':
				container = <Access_sso_4/>;
				break;
			case 'access_ver3_5':
				container = <Access_sso_5/>;
				break;
			case 'access_ver3_6':
				container = <Access_sso_6/>;
				break;
			case 'access_ver3_7':
				container = <Access_sso_7/>;
				break;
		}

		return (
				<section id="pop_content">
					<div className="popup_content termsDetails">
						<div className="terms_conts">
							<div className="access_txt">
								{container}
							</div>
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
)(withRouter(TermsServicePopupHistory));
