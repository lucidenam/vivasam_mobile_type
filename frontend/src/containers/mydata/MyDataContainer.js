import React, {Component, Fragment} from 'react';
import {MyDownloadData, MyPutData} from "containers/mydata";
import Sticky from "react-sticky-el";
import {DOWNLOAD_IMAGE_PATH, DOWNLOAD_IMAGE_PATH_22} from "../../constants";
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {withRouter} from "react-router-dom";
import * as viewerActions from 'store/modules/viewer';
import {getContentInfo} from 'lib/api';
import MyMaterialViewList from "../../components/educourse/MyMaterialViewList";
import * as myclassActions from 'store/modules/myclass';
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

class MyDataContainer extends Component {
    state = {
        activeTab: ''
    }

    handleTabClick = (activeTab) => {
        function gtag(){
            window.dataLayer.push(arguments);
        }

        if (activeTab === 'put') {
            gtag('event', '2024 모바일', {
                'parameter': '내자료',
                'parameter value' : '담은 자료'
            });
        } else if (activeTab === 'download') {
            gtag('event', '2024 모바일', {
                'parameter': '내자료',
                'parameter value' : '다운로드 자료'
            });
        }
        this.setState({
            activeTab
        });
    }

    handleViewer = async (id,gubun,title) => {
        const { ViewerActions } = this.props;
        try {
            const response = await getContentInfo(id);
            let { contentId, contentGubun, filePath, saveFileName, fileType, subject, summary, copyrightName,mdValue, siteUrl } = response.data;
            let type;
            if(fileType === 'FT201' || fileType === 'FT204'){
                type = 'video';
            }else if(fileType === 'FT202'){
                type = 'audio';
            }else if(fileType === 'FT203'){
                type = 'image';
            }else if(saveFileName && (saveFileName.includes('.zip') || saveFileName.includes('.ZIP'))){
                type = 'etc';
            }else if(fileType === 'FT205' ){
                type = 'document';
            }else if(gubun === 'CN070' || contentGubun === 'CN070'){
                type = 'smart';
                contentId = id;
                contentGubun = gubun;
                subject = title;
            }else{
                type = 'etc';
            }
            //vbook 1이면 외부 URL로 튕김
            let vbook = siteUrl && siteUrl.includes('vbook') ? 1 : 0;

            const target = {
                dataset: {
                    type: type,
                    src: (mdValue === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22) + filePath + saveFileName,
                    name: subject,
                    id: contentId,
                    gubun: contentGubun,
                    summary: summary,
                    sourcename: copyrightName,
                    vbook: vbook,
                    siteurl: siteUrl
                }
            };

            // vbook 콘텐츠라면 외부 브라우저로 열기
            // if (target.dataset.vbook === 1) {
            //     onClickCallLinkingOpenUrl(this.generateRedirectUrl(target.dataset.siteurl));
            //     return;
            // }

            ViewerActions.openViewer({title:target.dataset.name, target:target});
        }catch(e) {
            console.log(e);
        }
    }

    generateRedirectUrl = (siteUrl) => {
        let url = new URL(siteUrl, window.location.origin);

        // skin 파라미터 없으면 추가
        if (!url.searchParams.has('skin')) {
            url.searchParams.append('skin', 'vivasam_t_01');
        }
        // token 파라미터 없으면 추가
        if (!url.searchParams.has('token')) {
            url.searchParams.append('token', localStorage.getItem('exSsToken'));
        }

        return url.toString();
    }

    getMyMaterialViewList  = async () => {
        const { MyclassActions } = this.props;
        try {
            await MyclassActions.myMaterialViews();
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        const { tab,logged } = this.props;
        this.setState({
            activeTab: tab
        });

        if (logged) {
            this.getMyMaterialViewList();
        }
    }

    render() {
        const { activeTab} = this.state;
        const { myMaterialViews } = this.props;

        let container;
        if (activeTab === 'put') {
            container = <MyPutData handleViewer={this.handleViewer}/>;
        } else if(activeTab === 'download') {
            container = <MyDownloadData handleViewer={this.handleViewer}/>;
        } else if(activeTab === 'material') {
            container = <MyMaterialViewList myMaterialViews={myMaterialViews} handleViewer={this.handleViewer} />
        }

        return (
            <Fragment>
                <div className="guideline new251"></div>
                <Sticky className={'tab_wrap tabType02'}>
                    <ul className="tab tabMulti">
                        <li className={"tab_item" + (activeTab === 'material' ? " active" : "")}>
                            <a onClick={() => {this.handleTabClick('material');}} className="tab_link">
                                <span>최근 본 자료</span>
                            </a>
                        </li>
                        <li className={"tab_item" + (activeTab === 'put' ? " active" : "")}>
                            <a onClick={() => {
                                   this.handleTabClick('put');
                               }}
                               className="tab_link"
                            >
                                <span>담은 자료</span>
                                <span className="blind">현재페이지</span>
                            </a>
                        </li>
                        <li className={"tab_item" + (activeTab === 'download' ? " active" : "")}>
                            <a onClick={() => {
                                   this.handleTabClick('download');
                               }}
                               className="tab_link"
                            >
                                <span>다운로드 자료</span>
                            </a>
                        </li>
                    </ul>
                </Sticky>
                {container}
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        myClassInfo: state.myclass.get('myClassInfo'),
        myMaterialViews: state.myclass.get('myMaterialViews'),
    }),
    (dispatch) => ({
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch),
    })
)(withRouter(MyDataContainer));
