import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as api from 'lib/api';
import SurveyBanner from 'components/saemteo/SurveyBanner';

class PromoteContainer extends Component {

    state = {
        promoteInfo : null
    };

    getPromoteInfo = async () => {
        try {
            const response = await api.getPromoteInfo();
            if(this._isMounted){
                this.setState({
                    promoteInfo : response.data
                })
            }
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.getPromoteInfo();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleSurveyClick = (e) => {
        const {promoteInfo} = this.state;
        e.preventDefault();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '2025 개편', {
            'parameter': '메인',
            'parameter_value': '설문조사_' + promoteInfo.subject,
            'parameter_url': window.location.origin + "/#/saemteo/survey"
        });
        const { history } = this.props;
        history.push('/saemteo/survey');
    }

    render() {
        const {promoteInfo} = this.state;
        return promoteInfo && (
            <SurveyBanner handleClick={this.handleSurveyClick} surveyList={promoteInfo}/>
        );
    }
}

export default (withRouter(PromoteContainer));
