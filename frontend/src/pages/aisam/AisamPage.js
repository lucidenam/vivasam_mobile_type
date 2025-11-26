import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import {AisamContainer}  from 'containers/aisam'

class AisamPage extends Component {
    render() {
        const container = <AisamContainer/>;

        return (
            <PageTemplate title={'AI 수업 체험관'} submenuKey={'AISAM'} isHeaderHidden={true}>
                {container}
            </PageTemplate>
        );
    }
}
export default withRouter(AisamPage);
