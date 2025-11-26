import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import * as api from 'lib/api';
// import * as common from 'lib/common';
import SaemteoBannerList from 'containers/saemteo/SaemteoBannerList';
import RenderLoading from 'components/common/RenderLoading';
import {initializeGtag} from "../../store/modules/gtag";
// import {AsyncComponent} from "../../components/common";

class SaemteoProgram extends Component {

    state = {
        programList:'',
        noList:''
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/saemteo/program',
            'page_title': '교사문화 프로그램｜비바샘'
        });
        this.getProgramList();
    }

    shouldComponentUpdate(nextProps, nextStage) {
        return (nextStage !== this.state);
    }

    getProgramList = async() => {
        const response = await api.programList();
        if(response.data.code && response.data.code === "0"){
            this.setState({
                programList: response.data.bannerList
            });
        } else if(response.data.code && response.data.code === "1"){
            this.setState({
                noList: <div className="nodata_page">
                            <div className="nodata_content nodata_type1">
                                <p>진행 중인 교사문화 프로그램이 없습니다.</p>
                            </div>
                        </div>
            });
        }
    }

    handleClick = (e) => {
        e.preventDefault();
        const { history } = this.props;
        history.push('/saemteo/program/view/'+e.target.closest('a').name);
    }

    /* //이벤트화면을 이용한 교사문화 프로그램
    handleApplyClick = (eventId) => {
        const {history} = this.props;
        const {isApply} = this.state;
        if (isApply) {
            common.info("이미 신청하셨습니다.");
        } else {
            history.push('/saemteo/event/apply/' + eventId);
        }
    }
    */
    render() {
        const {programList, noList} = this.state;
        if (programList === '' && noList === '') return <RenderLoading loadingType={"3"}/>;

        /* //이벤트화면을 이용한 교사문화 프로그램
        let container = <AsyncComponent loader={() => import('containers/saemteo/event/' + '428' + '/Event')}
                                        eventId={428} handleClick={this.handleApplyClick}/>;
        */
        return (
            <section className="vivasamter">
                {/* 이벤트화면을 이용한 교사문화 프로그램 */}
                {/*{container}*/}

                <h2 className="blind">비바샘터</h2>
                <div className="guideline" ></div>
                <div className="vivasam_wrap">
                    { programList !== '' ? <SaemteoBannerList type="program" typeName="교사문화 프로그램" handleProgramClick={this.handleClick} bannerList={programList} /> : ''}
                    { noList !== '' ? noList : ''}
                </div>
            </section>
        );
    }
}

export default (withRouter(SaemteoProgram));
