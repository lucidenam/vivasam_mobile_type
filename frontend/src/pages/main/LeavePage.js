import React, {Component} from "react";
import PageTemplate from "../../components/page/PageTemplate";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import LeaveContainer from "../../containers/main/LeaveContainer";
import LeaveCompleteContainer from "../../containers/main/LeaveCompleteContainer";

class LeavePage extends Component {
    componentDidMount() {
        const {logged, history} = this.props;
        if (!logged) {
            history.replace("/");
        }
    }

    render() {
        const submenuKey = this.props.match.params.name;
        let container;

        switch (submenuKey) {
            case 'complete':
                container = <LeaveCompleteContainer/>;
                break;
            default:
                container = <LeaveContainer/>;
                break;
        }

        return (
            <PageTemplate title="회원탈퇴" isHidden={true}>
                {container}
            </PageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged')
    }),
    null
)(withRouter(LeavePage));