import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as api from 'lib/api';
import * as common from 'lib/common';
import SaemteoBannerList from 'containers/saemteo/SaemteoBannerList';
import RenderLoading from 'components/common/RenderLoading';
import {initializeGtag} from "../../store/modules/gtag";

class SaemteoSeminar extends Component {

    state = {
        seminarList:'',
        noList:''
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/saemteo/seminar',
            'page_title': '오프라인 세미나｜비바샘'
        });
        this.getSeminarList();
    }

    shouldComponentUpdate(nextProps, nextStage) {
        return (nextStage !== this.state);
    }

    getSeminarList = async() => {
        const response = await api.seminarList();
        if(response.data.code && response.data.code === "0"){
            this.setState({
                seminarList: response.data.bannerList
            });
        } else if(response.data.code && response.data.code === "1"){
            this.setState({
                noList: <div className="nodata_page">
                            <div className="nodata_content nodata_type3">
                                <p>진행 중인 오프라인 세미나가 없습니다.</p>
                            </div>
                        </div>
            });
        }
    }

    handleClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        history.push('/saemteo/seminar/view/'+e.target.closest('a').name);
    }

    render() {
        const {seminarList, noList} = this.state;
        if (seminarList === '' && noList === '') return <RenderLoading loadingType={"3"}/>;
        return (
            <section className="vivasamter">
                <h2 className="blind">비바샘터</h2>
                <div className="guideline" ></div>
                <div className="vivasam_wrap">
                    { seminarList !== '' ? <SaemteoBannerList type="seminar" typeName="오프라인 세미나" handleSeminarClick={this.handleClick} bannerList={seminarList}/> : ''}
                    { noList !== '' ? noList : ''}
                </div>
            </section>
        );
    }
}

export default (withRouter(SaemteoSeminar));
