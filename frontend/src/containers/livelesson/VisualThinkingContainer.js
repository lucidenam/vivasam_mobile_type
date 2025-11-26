import React, { Component } from 'react';
import { VisualThinking } from 'components/livelesson';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';
import { LiveLessonDownloadContainer } from 'containers/livelesson';
import * as common from 'lib/common';
import * as baseActions from 'store/modules/base';

class VisualThinkingContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tooltipActive: false,
            downloadParam: '',
            downloadUrlES : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[%EB%B9%84%EC%83%81%EA%B5%90%EC%9C%A1]%20%EB%B9%84%EC%A3%BC%EC%96%BC%EC%8B%B1%ED%82%B9%20%EC%B4%88%EB%93%B1%ED%8E%B8%20%EC%9E%90%EB%A3%8C%EC%A7%91.pdf',
            downloadUrlMS : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[%EB%B9%84%EC%83%81%EA%B5%90%EC%9C%A1]%20%EB%B9%84%EC%A3%BC%EC%96%BC%EC%8B%B1%ED%82%B9%20%EC%A4%91%EB%93%B1%ED%8E%B8%20%EC%9E%90%EB%A3%8C%EC%A7%91.pdf',
        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    componentWillUnmount = () => {

    }

    doDownload = (param, e) => {
        const {logged, history, PopupActions, BaseActions, myClassInfo } = this.props;

        if(!logged) {
            history.replace("/login");
        } else {
            // 학교정보 입력하지 않은 회원 다운로드 시 개인정보 수정 화면으로 이동
            if(myClassInfo.schoolName == null || myClassInfo.schoolName == ''){
                common.info('자료 다운로드는 개인정보 입력 후 가능합니다.\n자료는 \'학교 및 교육기관의 수업 \'목적을 위해서만\n한정하여 사용되도록 저작권법의 보호를 받고\n있습니다.');
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                window.location.hash = "/myInfo";
                window.viewerClose();
                return;
            }

            function gtag(){
                window.dataLayer.push(arguments);
            }
            gtag('event', '자료집 다운로드', {
                'parameter': '살아있는 수업',
                'parameter value': '비주얼 싱킹'
            });

            this.setState({
                downloadParam : param
            })

            PopupActions.openPopup({title:'자료집 다운로드', componet:<LiveLessonDownloadContainer activeDownload={this.activeDownload}/>});
        }
    }

    activeDownload = () => {
        const {PopupActions, BaseActions} = this.props;
        const {downloadParam, downloadUrlES, downloadUrlMS} = this.state;

        let downloadUrl = '';
        if(downloadParam === 'CN030-206225') {
            downloadUrl = downloadUrlES;
        } else {
            downloadUrl = downloadUrlMS;
        }

        PopupActions.closePopup();
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        const {tooltipActive} = this.state;
        return <VisualThinking doDownload={this.doDownload}></VisualThinking>
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
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(VisualThinkingContainer));
