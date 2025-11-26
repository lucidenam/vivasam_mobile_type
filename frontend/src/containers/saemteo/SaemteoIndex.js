import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import * as api from 'lib/api';
import SurveyBanner from 'components/saemteo/SurveyBanner';
import SaemteoBannerList from 'containers/saemteo/SaemteoBannerList';
import RecommandEduBannerList from 'containers/saemteo/RecommandEduBannerList';
import RenderLoading from 'components/common/RenderLoading';

class SaemteoIndex extends Component {

    state = {
        bannerList:'',
        sectionStyle: {display: 'block'}
    }

    componentDidMount(){
        this.getBannerList();
    }

    shouldComponentUpdate(nextProps, nextStage) {
        return (nextStage !== this.state);
    }

    getBannerList = async() => {
        const response = await api.saemteoBannerList();
        const result = response.data.bannerList;

        if (result.code === "0" && Array.isArray(result.bannerList)) {
            const filtered = result.bannerList.filter(item => {
                return item.id !== '115' ;
            });

            this.setState({
                bannerList: {
                    ...result,
                    bannerList: filtered
                }
            });
        }

        const response2 = await api.recommandEduBannerList();
        if(response2.data.bannerList===undefined) {
            this.setState({
                sectionStyle: {display: 'none'}
            });
        }
    }

    handleProgramClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        history.push('/saemteo/program/view/'+e.target.closest('a').name);
    }

    handleSeminarClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        history.push('/saemteo/seminar/view/'+e.target.closest('a').name);
    }
    handleEventClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        history.push('/saemteo/event/view/'+e.target.closest('a').name);
    }

    handleSurveyClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        history.push('/saemteo/survey');
    }

    render() {
        const {bannerList, sectionStyle} = this.state;
        if (bannerList === '') return <RenderLoading loadingType={"3"}/>;
        return (
            <section className="vivasamter">
                <h2 className="blind">비바샘터</h2>
                <div className="guideline" />
                <div className="vivasam_wrap">
                    <SaemteoBannerList handleEventClick={this.handleEventClick} handleProgramClick={this.handleProgramClick} handleSeminarClick={this.handleSeminarClick} bannerList={bannerList.bannerList}/>
                    {
                        /*
                        <SaemteoBannerList type="event" typeName="이벤트" handleClick={this.handleEventClick} bannerList={bannerList.eventList}/>
                        <SaemteoBannerList type="program" typeName="교사문화 프로그램" handleClick={this.handleProgramClick} bannerList={bannerList.programList}/>
                        <SaemteoBannerList type="seminar" typeName="오프라인 세미나" handleClick={this.handleSeminarClick} bannerList={bannerList.seminarList}/>
                        */
                    }
            <div className="guideline" />
            <SurveyBanner handleClick={this.handleSurveyClick} surveyList={bannerList.surveyList}/>
            <div className="guideline" />
            <div className="section" style={sectionStyle}>
                <h2 className="title">
                    추천 수업 자료
                </h2>
                <RecommandEduBannerList/>
            </div>
        </div>
    </section>
);
}
}

export default (withRouter(SaemteoIndex));
