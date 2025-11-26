import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PageTemplate from 'components/page/PageTemplate';
import SettingContainer from 'containers/main/SettingContainer';

class SettingPage extends Component{

    componentDidMount() {
        const {logged, history} = this.props;
        if(!logged) {
            history.replace("/");
        }
    }

    render () {
        return (
            <PageTemplate title='설정' isHidden={true}>
                <SettingContainer/>
            </PageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged')
    }),
    null
)(withRouter(SettingPage));
