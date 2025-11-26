import React, { Component,Fragment } from 'react';
import SaemteoSurveyInfo from 'containers/saemteo/SaemteoSurveyInfo';
import RenderLoading from 'components/common/RenderLoading';

class SaemteoSurveyList extends Component {
    state = {
        surveyList: ''
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.surveyList!==prevState.surveyList){
            return {
                surveyList : nextProps.surveyList
            };
        } else {
            return null;
        }
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    render() {
        const {surveyList} = this.state;
        const {handelResult} = this.props;
        let container;
        if (surveyList) {
            container = <SaemteoSurveyInfo {...surveyList} handelResult={handelResult}/>
        }else{
            return <RenderLoading loadingType={"3"}/>;
        }
        return (
            <Fragment>
                {container}
            </Fragment>
        );
    }
}

export default SaemteoSurveyList;
