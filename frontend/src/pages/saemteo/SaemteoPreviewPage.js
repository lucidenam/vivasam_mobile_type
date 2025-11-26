import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import AsyncComponent from 'components/common/AsyncComponent';


class SaemteoPreviewPage extends Component{

    render() {
        let container = <AsyncComponent
            loader={() => import('containers/saemteo/event/' + this.props.match.params.name + '/' + this.props.match.params.type)}
            eventId={this.props.match.params.name}/>;

        return (
            <PageTemplate title="미리보기">
                {container}
            </PageTemplate>
        )
    }
}

export default (withRouter(SaemteoPreviewPage));
