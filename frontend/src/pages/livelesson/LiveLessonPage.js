import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { MainHeaderPageTemplate } from 'components/page';
import {TabMenuContainer, SubTabMenuContainer} from 'containers/menu';
import { AidtNewCurriculumContainer, VisualThinkingContainer, MiddleClassAppraisalListContainer, ElementaryProcessAppraisalListContainer, ClassLiveQuestionContainer, OnlineClassSurvivalSecretContainer, WhatTodayContainer, FastMusicLibraryContainer, MonthContainer } from 'containers/livelesson'
import LibraryListContainer from 'containers/library/LibraryListContainer';
import {NotFoundPage} from 'pages';
import { connect } from 'react-redux';
import Sticky from 'react-sticky-el';
import queryString from "query-string";

class LiveLessonPage extends Component{
    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps !== this.nextProps);
    }

    componentDidMount() {

    }

    render () {
        const { match, logged } = this.props;

        const subTabName = match.params.name;
        let container;
        switch (subTabName) {
            case 'aidtNewcurriculum':
                container = <AidtNewCurriculumContainer/>;
                break;
            case 'fastMusicLibrary':
                container = <FastMusicLibraryContainer/>;
                break;
            case 'visualThinking':
                container = <VisualThinkingContainer/>;
                break;
            case 'middleClassAppraisalList':
                container = <MiddleClassAppraisalListContainer/>;
                break;
            case 'classLiveQuestion':
                container = <ClassLiveQuestionContainer/>;
                break;
            case 'OnlineClassSurvivalSecret':
                container = <OnlineClassSurvivalSecretContainer/>;
                break;
            case 'library':
                container = <LibraryListContainer/>;
                break;
            case 'MonthContainer':
                if (queryString.parse(this.props.location.search).month && queryString.parse(this.props.location.search).day) {
					container = <MonthContainer month={queryString.parse(this.props.location.search).month}
												day={queryString.parse(this.props.location.search).day}/>;
					break;
				}
				container = <MonthContainer/>;
				break;
            default :
                container = <AidtNewCurriculumContainer/>;
        }
        
        return (
            <MainHeaderPageTemplate>
                <TabMenuContainer tabName='liveLesson'/>
                <Sticky>
                    <SubTabMenuContainer tabName='liveLesson' subTabName={subTabName}/>
                </Sticky>
                {container}
            </MainHeaderPageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    })
)(withRouter(LiveLessonPage));