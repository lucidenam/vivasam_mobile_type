import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import Wechall from 'containers/promotion/Wechall';

class WechallPage extends Component {
	render() {
		const container = <Wechall/>;

		return (
			<PageTemplate title={'위챌 안내'} submenuKey={'WECHALL'} isHeaderHidden={true}>
				{container}
			</PageTemplate>
		);
	}
}
export default withRouter(WechallPage);
