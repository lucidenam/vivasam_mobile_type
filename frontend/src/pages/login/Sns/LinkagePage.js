import React, {Component} from 'react';
import PageTemplate from 'components/page/PageTemplate';
import SnsLinkage from './SnsLinkage';
import NotFoundPage from 'pages/NotFoundPage';

class VerificationPage extends Component {
	render() {
		let isHidden = false;
		let titleText = 'SNS 계정 연동';
		let clazz = '';
		let container;
		switch (this.props.match.params.name) {
			case 'link':
				container = <SnsLinkage/>;
				break;
			default :
				container = <NotFoundPage/>;
		}

		return (
			<PageTemplate title={titleText} isPushHidden={true} isSearchMenu={true} isHidden={true}>
				{container}
			</PageTemplate>
		)
	}
}

export default VerificationPage;
