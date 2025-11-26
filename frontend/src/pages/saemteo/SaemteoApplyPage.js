import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';
import PageTemplate from 'components/page/PageTemplate';
import SaemteoProgramApply from 'containers/saemteo/SaemteoProgramApply';
import SaemteoSeminarApply from 'containers/saemteo/SaemteoSeminarApply';
import AsyncComponent from 'components/common/AsyncComponent';
import SaemteoVivasamGoApply from "../../containers/saemteo/vivasamGo/SaemteoVivasamGoApply";


class SaemteoApplyPage extends Component{

    componentDidMount() {
        const {logged, history, BaseActions} = this.props;
        if(!logged) {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.replace("/login");
        }
    }

    render () {
        const {logged} = this.props;
        let container;
        if(!logged) {
            container = null;
        } else if(this.props.match.url.indexOf('event') > -1){
            container = <AsyncComponent loader={() => import('containers/saemteo/event/' + this.props.match.params.name + '/EventApply')} eventId={this.props.match.params.name}/>;
        } else if(this.props.match.url.indexOf('program') > -1){
            container = <SaemteoProgramApply programId={this.props.match.params.name}/>
        } else if(this.props.match.url.indexOf('seminar') > -1){
            container = <SaemteoSeminarApply seminarId={this.props.match.params.name}/>
        } else if(this.props.match.url.indexOf('vivasam') > -1){
            container = <SaemteoVivasamGoApply seminarId={this.props.match.params.name}/>
        }
        return (
            <PageTemplate title="신청하기">
                {container}
            </PageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SaemteoApplyPage));
