import React, {Component} from 'react';
import { withRouter } from "react-router-dom";
import PageTemplate from "components/page/PageTemplate";
import { MyDataContainer } from "containers/mydata";
import { connect } from 'react-redux';
import * as myclassActions from 'store/modules/myclass';
import {bindActionCreators} from "redux";

class MyDataPage extends Component {

    componentDidMount() {
        const { logged, history, location } = this.props;
        if (!logged) {
            history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
        } else {
           this.getMyClassInfo;
        }
    }

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;

        try {
            await MyclassActions.myClassInfo();
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const { logged, match} = this.props;
        if(!logged) return false;

        return (
            <PageTemplate title={"내 자료"} disableSticky={true}>
                <MyDataContainer tab={match.params.name ? match.params.name : "material"}/>
            </PageTemplate>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(MyDataPage));
