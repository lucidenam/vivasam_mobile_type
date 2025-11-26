import React, {Component} from 'react';
import PageTemplate from 'components/page/PageTemplate';
import SnsJoinAgree from './SnsJoinAgree';
import SnsJoinVerification from './SnsJoinVerification';
import SnsJoinVerificationResult from './SnsJoinVerificationResult';
import SnsJoinInfo from './SnsJoinInfo';
import NotFoundPage from 'pages/NotFoundPage';
import SnsJoinTeacher from "./SnsJoinTeacher";
import {FooterCopyright} from "../../../components/page";

class SnsJoinPage extends Component {
	render() {
		let titleText = '회원가입';
		let container;
		let isHeaderHidden = false;
		let clazz = 'float_box hasFooter';
		switch (this.props.match.params.name) {
			case 'agree':
				container = <SnsJoinAgree/>;
				break;
			case 'verify':
				container = <SnsJoinVerification/>;
				break;
			case 'verifyResult':
				container = <SnsJoinVerificationResult/>;
				break;
			case 'info':
				container = <SnsJoinInfo/>;
				break;
			case 'teacher':
				container = <SnsJoinTeacher/>;
				break;
			default :
				container = <NotFoundPage/>;
		}
		return (
			<PageTemplate title={titleText} contentsAddClass={'contents-hidden'} isHeaderHidden={isHeaderHidden}
			              clazz={clazz} isHidden={true} isPushHidden={true}>
				<div className="hasFooterWrap">
					{container}
					<FooterCopyright handleLogin={this.handleLogin}/>
				</div>
			</PageTemplate>
		)
	}
}

export default SnsJoinPage;
