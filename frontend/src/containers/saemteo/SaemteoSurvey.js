import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import SaemteoSurveyList from 'containers/saemteo/SaemteoSurveyList';
import SaemteoSurveyResult from 'containers/saemteo/SaemteoSurveyResult';
import RenderLoading from 'components/common/RenderLoading';

class SaemteoSurvey extends Component {

    state = {
        surveyList:'',
        noList:''
    }

    componentDidMount(){
        this.getSurveyList();
    }

    shouldComponentUpdate(nextProps, nextStage) {
        return (nextStage !== this.state);
    }

    getSurveyList = async() => {
        const response = await api.surveyList();
        if(response.data.code && response.data.code === "0"){
            this.setState({
                surveyList: response.data.surveyList
            });
        } else if(response.data.code && response.data.code === "1"){
            this.setState({
                noList: <div className="nodata_page">
                            <div className="nodata_content nodata_type4">
                                <p>진행 중인 설문조사가 없습니다.</p>
                            </div>
                        </div>
            });
        }
    }

    getSurveyResult = async(surveyId) => {
        const {logged, history, BaseActions, PopupActions} = this.props;


        if(surveyId === '131') {
        // if(surveyId === '117') {
            alert("해당 설문조사 결과는 비공개로 ​진행됩니다.");
            return null;
        }

        if(!logged) {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return null;
        }
        const response = await api.surveyResult(surveyId);
        if(response.data.code && response.data.code === "0"){
            PopupActions.openPopup({title:"설문조사 결과보기", componet:<SaemteoSurveyResult surveyId={surveyId} surveyList={response.data}/>});
        } else if(response.data.code && response.data.code === "1"){
            common.info("로그인 후 사용가능합니다.");
        }
    }

    render() {
        const {surveyList, noList} = this.state;
        if (surveyList === '' && noList === '') return <RenderLoading loadingType={"3"}/>;
        return (
            <section className="vivasamter">
                <h2 className="blind">비바샘터</h2>
                <div className="guideline" />
                    { surveyList !== '' ? <SaemteoSurveyList surveyList={surveyList} handelResult={this.getSurveyResult}/> : ''}
                    { noList !== '' ? noList : ''}
            </section>

        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(SaemteoSurvey));
