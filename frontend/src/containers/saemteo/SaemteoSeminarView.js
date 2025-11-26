import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import * as common from 'lib/common';
import RenderLoading from 'components/common/RenderLoading';

class SaemteoProgramView extends Component {

    state = {
        seminarInfo:'',
        isApply:false
    }

    componentDidMount(){
        const {seminarId} = this.props;
        this.getSeminarInfo(seminarId);
    }

    getSeminarInfo = async(seminarId) => {
        const response = await api.seminarInfo(seminarId);
        if(response.data.code && (response.data.code === "0" || response.data.code === "2" || response.data.code === "3")){
            const { BaseActions } = this.props;
            BaseActions.pushValues({type:"title", object:response.data.programList[0].mobileTitle});
            this.setState({
                seminarInfo: response.data.programList[0]
            });
            if(response.data.code === "3"){
               //이미 신청완료
               this.setState({
                   isApply: true
               });
            }
        } else {
            const { history } = this.props;
            history.push('/saemteo/index');
        }
    }

    handleClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        const { isApply } = this.state;
        if (isApply){
            common.info("이미 신청하셨습니다.");
        }else{
            history.push('/saemteo/seminar/apply/'+e.target.name);
        }
    }

    render() {
        const {seminarInfo} = this.state;
        if (seminarInfo === '') return <RenderLoading/>;
        return (
            <section className="vivasamter">
                {/* 이벤트 이미지 영역 */}
                <div className="event_img">
                    <span dangerouslySetInnerHTML={{__html: seminarInfo.mobileContents}}></span>
                </div>
                {/* //이벤트 이미지 영역 */}
                <div className="vivasamter_applyDtl ">
                    <button
                        name={seminarInfo.cultureActId}
                        onClick={this.handleClick}
                        className="btn_full_on">신청하기</button>
                </div>
            </section>
        );
    }
}

export default connect(
  null,
  (dispatch) => ({
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(SaemteoProgramView));
