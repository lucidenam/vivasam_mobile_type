import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import {TermsService, TermsPrivacy} from 'containers/terms';
import NotFoundPage from "./NotFoundPage";

class TermsPage extends Component {
	render() {
		const termsType = this.props.match.params.type;
		let container;
		let titleText;

		switch (termsType) {
			case 'service':
				container = <TermsService/>;
				titleText = "서비스 이용약관";
				break;
			case 'privacy':
				container = <TermsPrivacy/>;
				titleText = "개인정보 처리방침";
				break;
			default :
				container = <NotFoundPage/>;
		}

		return (
			<PageTemplate title={titleText} contentsAddClass={'pb0'} isPushHidden={true} isHidden={true}>
				{container}
			</PageTemplate>
		);
	}
}
export default withRouter(TermsPage);
