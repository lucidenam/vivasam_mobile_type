import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import PageTitleChangeTemplate from 'components/page/PageTitleChangeTemplate';
import SaemteoEventView from 'containers/saemteo/SaemteoEventView';
import SaemteoProgramView from 'containers/saemteo/SaemteoProgramView';
import SaemteoSeminarView from 'containers/saemteo/SaemteoSeminarView';
import RightButton from 'components/common/RightButton';
import SaemteoVivasamGoView from "../../containers/saemteo/vivasamGo/SaemteoVivasamGoView";

class SaemteoViewPage extends Component{

    render () {
        let rightMenu;
        let container;
        if(this.props.match.url.indexOf('event') > -1){
            container = <SaemteoEventView eventId={this.props.match.params.name} tabId={this.props.match.params.tab}/>;
        } else if(this.props.match.url.indexOf('program') > -1){
            container = <SaemteoProgramView programId={this.props.match.params.name}/>;
        } else if(this.props.match.url.indexOf('seminar') > -1){
            rightMenu = <RightButton title="신청" link={"/saemteo/seminar/apply/"+this.props.match.params.name}/>;
            container = <SaemteoSeminarView seminarId={this.props.match.params.name}/>
        } else if(this.props.match.url.indexOf('vivasam') > -1){
            container = <SaemteoVivasamGoView seminarId={this.props.match.params.name}/>
        }
        return (
            <PageTitleChangeTemplate rightMenu={rightMenu}>
                {container}
            </PageTitleChangeTemplate>
        )
    }
}

export default withRouter(SaemteoViewPage);
