import React, { Component } from 'react';
import { MiddleClassAppraisalList } from 'components/livelesson';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import * as popupActions from 'store/modules/popup';
import { LiveLessonPopupContainer, LiveLessonDownloadContainer } from 'containers/livelesson';
import * as common from 'lib/common';
import * as baseActions from 'store/modules/base';

class MiddleClassAppraisalListContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tooltipActive: false,
            target: null,
            dataset: null,
            downloadParam: '',
            downloadUrl : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[%EB%B9%84%EC%83%81%EA%B5%90%EC%9C%A1]%20%EC%A4%91%EB%93%B1%20%EC%88%98%EC%97%85%20%ED%8F%89%EA%B0%80%20%ED%98%81%EC%8B%A0%20%EC%9E%90%EB%A3%8C%EC%A7%91.pdf'
        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    componentWillUnmount = () => {

    }

    goBack = () => {
        const { history } = this.props;
        history.goBack();
    }

    openLayer = (e) => {
        var targetNode = ReactDOM.findDOMNode(e.target);
        if("allMenu_back_help icon_help" === targetNode.className) {
            targetNode.className = "allMenu_back_help icon_help active";
        } else {
            targetNode.className = "allMenu_back_help icon_help";
        }

        if(this.state.tooltipActive) {
            this.setState({
                tooltipActive : false
            })
        } else {
            this.setState({
                tooltipActive : true
            })
        }
    }

    openViewer = (e) => {
        const { logged , history, PopupActions, location } = this.props;
        if(!logged) {
            history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
        } else {
            e.preventDefault();
            function gtag(){
                window.dataLayer.push(arguments);
            }
            gtag('event', '뷰어 실행', {
                'parameter': '살아있는 수업',
                'parameter value': '중등 수업 평가 혁신'
            });
            this.setState({
                target : e.target,
                dataset : e.target.dataset
            })
            PopupActions.openPopup({title:'데이터 사용안내', componet:<LiveLessonPopupContainer activeViewer={this.activeViewer}/>});
        }
    }

    activeViewer = () => {
        const {PopupActions, ViewerActions} = this.props;
        const {target, dataset} = this.state;
        PopupActions.closePopup();
        ViewerActions.openViewer({title:dataset.name, target:target});
    }

    doDownload = (param, e) => {
        const {logged, history, PopupActions, BaseActions, myClassInfo } = this.props;
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(!logged) {
            history.push('/login')
        } else {
            // 학교정보 입력하지 않은 회원 다운로드 시 개인정보 수정 화면으로 이동
            if(myClassInfo.schoolName == null || myClassInfo.schoolName == ''){
                common.info('자료 다운로드는 개인정보 입력 후 가능합니다.\n자료는 \'학교 및 교육기관의 수업 \'목적을 위해서만\n한정하여 사용되도록 저작권법의 보호를 받고\n있습니다.');
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                window.location.hash = "/myInfo";
                window.viewerClose();
                return;
            }
            gtag('event', '자료집 다운로드', {
                'parameter': '살아있는 수업',
                'parameter value': '중등 수업 평가 혁신'
            });
            this.setState({
                downloadParam : param
            })

            PopupActions.openPopup({title:'자료집 다운로드', componet:<LiveLessonDownloadContainer activeDownload={this.activeDownload}/>});
        }
    }

    activeDownload = () => {
        const {PopupActions, BaseActions} = this.props;
        const {downloadParam, downloadUrl} = this.state;

        PopupActions.closePopup();
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        const { tooltipActive } = this.state;
        return <MiddleClassAppraisalList tooltipActive={tooltipActive}
                                         goBack={this.goBack}
                                         openLayer={this.openLayer}
                                         openViewer={this.openViewer}
                                         doDownload={this.doDownload}></MiddleClassAppraisalList>
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(MiddleClassAppraisalListContainer));
//export default MiddleClassAppraisalListContainer;
