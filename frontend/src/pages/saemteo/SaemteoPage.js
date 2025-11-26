import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import MainHeaderPageTemplate from 'components/page/MainHeaderPageTemplate';
import {SaemteoEvent, SaemteoIndex, SaemteoProgram, SaemteoSeminar, SaemteoSurvey, BeaverSam} from 'containers/saemteo';
import {SubTabMenuContainer, TabMenuContainer} from 'containers/menu';
import NotFoundPage from 'pages/NotFoundPage';
import Sticky from 'react-sticky-el';
import SaemteoVivasamGoView from "../../containers/saemteo/vivasamGo/SaemteoVivasamGoView";
import ViverSam from "../../containers/saemteo/viversam/ViverSam";

class SaemteoPage extends Component{
    render () {
        const subTabName = this.props.match.params.name;

        console.log("subTabName", subTabName)
        let container;
        let isTapHidden = false;
        switch (subTabName) {
        case 'index':
            container = <SaemteoIndex/>;
            break;
        case 'event':
            container = <SaemteoEvent/>;
            break;
        case 'program':
            container = <SaemteoProgram/>;
            break;
        case 'seminar':
            container = <SaemteoSeminar/>;
            break;
        case 'survey':
            container = <SaemteoSurvey/>;
            break;
        case 'go':
            container = <SaemteoVivasamGoView/>;
            break;
        case 'viversam':
            isTapHidden = true;
            container = <ViverSam/>;
            break;
        default :
            container = <NotFoundPage/>;
        }
        if (isTapHidden) {
            return (
                <MainHeaderPageTemplate>
                    {container}
                </MainHeaderPageTemplate>
            )
        } else {
            return (
                <MainHeaderPageTemplate>
                    <TabMenuContainer tabName='saemteo'/>
                    <Sticky>
                        <SubTabMenuContainer tabName='saemteo' subTabName={subTabName}/>
                    </Sticky>
                    {container}
                </MainHeaderPageTemplate>
            )
        }
    }
}

export default withRouter(SaemteoPage);
