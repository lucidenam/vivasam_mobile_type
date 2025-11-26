import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import * as common from 'lib/common';
import EventHandler from 'containers/saemteo/event/EventHandler';
import RenderLoading from 'components/common/RenderLoading';
import {initializeGtag} from "../../store/modules/gtag";


class SaemteoEventView extends Component {

    state = {
        eventInfo:'',
        isApply:false
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/saemteo/event/' + this.props.eventId,
            'page_title': '이벤트｜비바샘'
        });
        const {eventId} = this.props;
        this.getEventInfo(eventId);
    }

    getEventInfo = async(eventId) => {
        //const response = await api.eventInfoAll(eventId);
        const response = await api.eventInfo(eventId);
        const { BaseActions } = this.props;
        if(response.data.code && (response.data.code === "0" || response.data.code === "2" || response.data.code === "3")){
            const { BaseActions } = this.props;
            BaseActions.pushValues({type:"title", object:response.data.eventList[0].eventName});
            this.setState({
                eventInfo: response.data.eventList[0]
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
        // url 미사용
        // let url = "https://www.vivasam.com" + e.target.dataset.url;
        // var openNewWindow = window.open("about:blank");
        // openNewWindow.location.href = url;
        // 신청 페이지로 이동

        //이벤트 내에서 값을 검증해야 함으로 사용하지 않음
        //이벤트 입력값 검증이 필요 없는 경우는 기본 type을 만들어서 사용
        //this.handleApplyClick(e.target.name);
    }

    handleApplyClick = (eventId) => {
        const { history } = this.props;
        const { isApply } = this.state;
        if (isApply){
            common.info("이미 신청하셨습니다.");
        }else{
            history.push('/saemteo/event/apply/'+eventId);
        }
    }

    render() {
        const {eventInfo} = this.state;
        if (eventInfo === '') return <RenderLoading loadingType={"3"}/>;
        //이벤트 입력값 검증이 필요 없는 경우는 기본 type을 만들어서 사용
        let applyButton = null;
        let type = false;
        if(type){
            applyButton = (
                <div className="vivasamter_applyDtl ">
                    <a
                        href=""
                        name={eventInfo.eventId}
                        data-url={eventInfo.eventUrl}
                        onClick={this.handleClick}
                        className="btn_full_off">신청하기</a>
                </div>
            )
        }
        return (
            <section className="vivasamter">
                {/* 이벤트 영역 */}
                <EventHandler {...eventInfo} tabId={this.props.tabId} handleClick={this.handleApplyClick}/>
                {/* //이벤트 영역 */}
                {applyButton}
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SaemteoEventView));