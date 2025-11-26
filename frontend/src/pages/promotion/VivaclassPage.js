import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
// import {default as Vivaclass}  from 'containers/promotion/Vivaclass';
import Vivaclass from 'containers/promotion/Vivaclass';
import Vivaclass2025  from 'containers/promotion/Vivaclass2025'

class VivaclassPage extends Component {
	render() {
		const year = this.props.match.params.year;
		let container;
		switch (year) {
			case '2025':
				container = <Vivaclass2025/>;
				break;
			default :
				container = <Vivaclass/>;
		}

		return (
			<PageTemplate title={'비바클래스 안내'} submenuKey={'VIVACLASS'} isHeaderHidden={true}>
				{container}
			</PageTemplate>
		);
	}
}
export default withRouter(VivaclassPage);
