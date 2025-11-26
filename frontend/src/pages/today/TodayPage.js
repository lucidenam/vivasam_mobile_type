import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import { Season1Done } from 'containers/today'

class TodayPage extends Component{
    render () {
        const subTabName = this.props.match.params.name;
        let container;
        switch (subTabName) {
            case 'Season1Done':
                container = <Season1Done/>;
                break;
            default :
                container = <Season1Done/>;
        }
        return (
            <PageTemplate title='오늘 뭐하지 시즌1'>
                {container}
            </PageTemplate>
        )
    }
}

export default withRouter(TodayPage);
