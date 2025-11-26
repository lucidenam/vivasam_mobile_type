import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import TestComponent from 'components/common/TestComponent';
import TestComponent2 from 'components/common/TestComponent2';

class TestPage extends Component{
    render () {
        // 음악 34, 음미체실 56
        const name = this.props.match.params.name;
        let container;
        switch (name) {
            case 'test1':
                container = <TestComponent/>;
                break;
            default:
                container = <TestComponent2 textbookCd={name}/>;
        }
        return (
            <PageTemplate title='테스트 화면'>
                {container}
            </PageTemplate>
        )
    }
}

export default withRouter(TestPage);
