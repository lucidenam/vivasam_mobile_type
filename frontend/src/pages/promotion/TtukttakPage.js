import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import Ttukttak from 'containers/promotion/Ttukttak';

class TtukttakPage extends Component {
	render() {
		const container = <Ttukttak/>;

		return (
			<PageTemplate title={'뚝딱학습지 안내'} submenuKey={'TTUKTTAK'} isHeaderHidden={true}>
				{container}
			</PageTemplate>
		);
	}
}
export default withRouter(TtukttakPage);
