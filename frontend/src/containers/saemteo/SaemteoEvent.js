import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as api from 'lib/api';
import SaemteoBannerList from 'containers/saemteo/SaemteoBannerList';
import RenderLoading from 'components/common/RenderLoading';
import {callTrackingTag, isProd} from "../../lib/TargetingUtils";
import {initializeGtag} from "../../store/modules/gtag";
class SaemteoEvent extends Component {

    state = {
        eventList:'',
        noList:''
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/saemteo/event',
            'page_title': '이벤트｜비바샘'
        });
        this.getEventList();
        //타겟팅게이츠 스크립트
        if(isProd()) {
            callTrackingTag('PurchaseComplete');
        }
    }

    shouldComponentUpdate(nextProps, nextStage) {
        return (nextStage !== this.state);
    }

    getEventList = async() => {
        const response = await api.eventList();
        if(response.data.code && response.data.code === "0"){
            this.setState({
                eventList: response.data.bannerList
            });
        } else if(response.data.code && response.data.code === "1"){
            this.setState({
                noList: <div className="nodata_page">
                            <div className="nodata_content nodata_type2">
                                <p>진행 중인 이벤트가 없습니다.</p>
                            </div>
                        </div>
            });
        }
    }

    handleClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        history.push('/saemteo/event/view/'+e.target.closest('a').name);
    }

    render() {
        const {eventList, noList} = this.state;
        if (eventList === '' && noList === '') return <RenderLoading loadingType={"3"}/>;
        return (
            <section className="vivasamter">
                <h2 className="blind">비바샘터</h2>
                <div className="guideline" ></div>
                <div className="vivasam_wrap">
                    { eventList !== '' ? <SaemteoBannerList handleEventClick={this.handleClick} bannerList={eventList}/> : ''}
                    { noList !== '' ? noList : ''}
                </div>
            </section>
        );
    }
}

export default (withRouter(SaemteoEvent));
