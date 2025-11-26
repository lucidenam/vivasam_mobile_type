import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import {initializeGtag} from "store/modules/gtag";
import {
	Privacy_viva_1,
	Privacy_viva_2,
	Privacy_viva_3,
	Privacy_viva_4,
	Privacy_viva_5,
	Privacy_viva_6,
	Privacy_viva_7,
	Privacy_viva_8,
	Privacy_viva_9,
	Privacy_viva_10,
	Privacy_viva_11,
	Privacy_viva_12,
	Privacy_viva_13,
	Privacy_viva_14,
	Privacy_tsc_1,
	Privacy_tsc_2,
	Privacy_tsc_3,
	Privacy_tsc_4,
	Privacy_tsc_5,
	Privacy_tsc_6,
	Privacy_tsc_7,
	Privacy_tsc_8,
	Privacy_tsc_9,
	Privacy_tsc_10,
	Privacy_tsc_11,
	Privacy_tsc_12,
	Privacy_tsc_13,
	Privacy_tsc_14,
	Privacy_tsc_15,
	Privacy_tsc_16,
	Total_privacy_ver1,
	Total_privacy_ver2,
	Total_privacy_ver3,
	Total_privacy_ver4,
	Total_privacy_ver5,
	Total_privacy_ver6,
} from "./index";


class TermsPrivacyPopupHistory extends Component {
	componentDidMount() {
		initializeGtag();
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-HRYH9929GX', {
			'page_path': '/termOfService',
			'page_title': '개인정보 처리방침｜비바샘'
		});
	}
	render() {
		const {activeTermItem} = this.props;
		let container;

		switch (activeTermItem) {
			case 'privacy_ver1_1':
				container = <Privacy_viva_1/>;
				break;
			case 'privacy_ver1_2':
				container = <Privacy_viva_2/>;
				break;
			case 'privacy_ver1_3':
				container = <Privacy_viva_3/>;
				break;
			case 'privacy_ver1_4':
				container = <Privacy_viva_4/>;
				break;
			case 'privacy_ver1_5':
				container = <Privacy_viva_5/>;
				break;
			case 'privacy_ver1_6':
				container = <Privacy_viva_6/>;
				break;
			case 'privacy_ver1_7':
				container = <Privacy_viva_7/>;
				break;
			case 'privacy_ver1_8':
				container = <Privacy_viva_8/>;
				break;
			case 'privacy_ver1_9':
				container = <Privacy_viva_9/>;
				break;
			case 'privacy_ver1_10':
				container = <Privacy_viva_10/>;
				break;
			case 'privacy_ver1_11':
				container = <Privacy_viva_11/>;
				break;
			case 'privacy_ver1_12':
				container = <Privacy_viva_12/>;
				break;
			case 'privacy_ver1_13':
				container = <Privacy_viva_13/>;
				break;
			case 'privacy_ver1_14':
				container = <Privacy_viva_14/>;
				break;
			case 'privacy_ver2_1':
				container = <Privacy_tsc_1/>;
				break;
			case 'privacy_ver2_2':
				container = <Privacy_tsc_2/>;
				break;
			case 'privacy_ver2_3':
				container = <Privacy_tsc_3/>;
				break;
			case 'privacy_ver2_4':
				container = <Privacy_tsc_4/>;
				break;
			case 'privacy_ver2_5':
				container = <Privacy_tsc_5/>;
				break;
			case 'privacy_ver2_6':
				container = <Privacy_tsc_6/>;
				break;
			case 'privacy_ver2_7':
				container = <Privacy_tsc_7/>;
				break;
			case 'privacy_ver2_8':
				container = <Privacy_tsc_8/>;
				break;
			case 'privacy_ver2_9':
				container = <Privacy_tsc_9/>;
				break;
			case 'privacy_ver2_10':
				container = <Privacy_tsc_10/>;
				break;
			case 'privacy_ver2_11':
				container = <Privacy_tsc_11/>;
				break;
			case 'privacy_ver2_12':
				container = <Privacy_tsc_12/>;
				break;
			case 'privacy_ver2_13':
				container = <Privacy_tsc_13/>;
				break;
			case 'privacy_ver2_14':
				container = <Privacy_tsc_14/>;
				break;
			case 'privacy_ver2_15':
				container = <Privacy_tsc_15/>;
				break;
			case 'privacy_ver2_16':
				container = <Privacy_tsc_16/>;
				break;
			case 'total_privacy_ver1':
				container = <Total_privacy_ver1/>;
				break;
			case 'total_privacy_ver2':
				container = <Total_privacy_ver2/>;
				break
			case 'total_privacy_ver3':
				container = <Total_privacy_ver3/>;
				break;
			case 'total_privacy_ver4':
				container = <Total_privacy_ver4/>;
				break;
			case 'total_privacy_ver5':
				container = <Total_privacy_ver5/>;
				break;
			case 'total_privacy_ver6':
				container = <Total_privacy_ver6/>;
				break;
		}

		return (
				<section id="pop_content">
					<div className="popup_content privacyDetails">
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
)(withRouter(TermsPrivacyPopupHistory));
