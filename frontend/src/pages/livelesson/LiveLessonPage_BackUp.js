import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import RightIcon from 'components/common/RightIcon'
import TabMenuContainer from 'containers/menu/TabMenuContainer';
import { VisualThinkingContainer, MiddleClassAppraisalListContainer, ElementaryProcessAppraisalListContainer, ClassLiveQuestionContainer, OnlineClassSurvivalSecretContainer, WhatTodayContainer } from 'containers/livelesson'

function getDiv(props) {
    const tabName = props.match.params.name;
    let container;
    switch (tabName) {
        case 'visualThinking':
            container = <VisualThinkingContainer/>;
            break;
        case 'middleClassAppraisalList':
            container = <MiddleClassAppraisalListContainer/>;
            break;
        case 'elementaryProcessAppraisalList':
            container = <ElementaryProcessAppraisalListContainer/>;
            break;
        case 'classLiveQuestion':
            container = <ClassLiveQuestionContainer/>;
            break;
        case 'WhatToday':
            container = <WhatTodayContainer subTabName={tabName}/>;
            break;
        case 'WhatToday2':
            container = <WhatTodayContainer subTabName={tabName}/>;
            break;
        case 'WhatToday3':
            container = <WhatTodayContainer subTabName={tabName}/>;
            break;
        case 'WhatTodayMaap':
            container = <WhatTodayContainer subTabName={tabName}/>;
            break;
        case 'OnlineClassSurvivalSecret':
            container = <OnlineClassSurvivalSecretContainer/>;
            break;
        default :
            container = <VisualThinkingContainer/>;
    }
    return container;
}

class LiveLessonPage_BackUp extends Component{
    render () {
        let innerDiv = getDiv(this.props);
        let rightMenu = <RightIcon tooltipText='변화하는 교육 환경에 맞추어 행복한 학교,즐거운 수업을 만들어가는 열정적인 학교선생님들과 함께 비상교육이 살아있는 수업프로젝트를 시작합니다.'/>
        const tabName = this.props.match.params.name;
        return (
            <PageTemplate title="살아있는 수업" disableSticky={true} rightMenu={rightMenu}>
                <TabMenuContainer tabName={tabName}/>
                {innerDiv}
            </PageTemplate>
        )
    }
}

export default withRouter(LiveLessonPage_BackUp);