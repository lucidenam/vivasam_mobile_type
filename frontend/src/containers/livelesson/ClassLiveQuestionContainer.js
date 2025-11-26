import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import { LiveLessonDownloadContainer } from 'containers/livelesson';
import { ClassLiveQuestion } from 'components/livelesson';
import * as common from 'lib/common';

class ClassLiveQuestionContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tooltipActive: false,
            downloadParam: '',
            downloadUrl1 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_초등_수업 4~6학년.pdf',
            downloadUrl2 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_초등_사회 5학년.pdf',
            downloadUrl3 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_중학_국어 1.pdf',
            downloadUrl4 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_중학_수학 1.pdf',
            downloadUrl5 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_중학_사회 ①.pdf',
            downloadUrl6 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_중학_도덕.pdf',
            downloadUrl7 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_중학_역사 ①.pdf',
            downloadUrl8 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_중학_과학 1.pdf',
            downloadUrl9 : 'https://dn.vivasam.com/VS/LIVECLASS/document/contents/[비상교육] 질문이 살아있는 수업_중학_진로와 직업.pdf',
        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    componentWillUnmount = () => {

    }

    doEbook = (linkUrl, e) => {
        const {logged, history, PopupActions, BaseActions } = this.props;

        if(!logged) {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        } else {
            const link = document.createElement('a');
            link.href = linkUrl;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    doDownload = (param, e) => {
        const {logged, history, PopupActions, BaseActions, myClassInfo, loginInfo } = this.props;
        if(!logged) {
            history.replace("/login");
        } else {
            // 교사 인증 여부
            if (loginInfo.certifyCheck === 'N') {
                common.info("교사 인증 후 이용 가능합니다.");
                window.location.hash = "/login/require";
                return false;
            }

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
                'parameter value': '질문이 살아있는 수업'
            });

            this.setState({
                downloadParam : param
            })

            PopupActions.openPopup({title:'자료집 다운로드', componet:<LiveLessonDownloadContainer activeDownload={this.activeDownload}/>});
        }
    }

    activeDownload = () => {
        const {PopupActions} = this.props;
        const {downloadParam, downloadUrl1, downloadUrl2, downloadUrl3 , downloadUrl4, downloadUrl5, downloadUrl6, downloadUrl7, downloadUrl8, downloadUrl9} = this.state;

        let downloadUrl = '';
        // 중학교 국어, 수학, 사회 , 도덕, 과학, 진로와 직업 다운로드
        if(downloadParam === 'CN030-264644') {
            downloadUrl = downloadUrl1;
        }else if(downloadParam === 'CN030-264643'){
            downloadUrl = downloadUrl2;
        }else if(downloadParam === 'CN030-264652'){
            downloadUrl = downloadUrl3;
        }else if(downloadParam === 'CN030-264655'){
            downloadUrl = downloadUrl4;
        }else if(downloadParam === 'CN030-264654'){
            downloadUrl = downloadUrl5;
        }else if(downloadParam === 'CN030-264653'){
            downloadUrl = downloadUrl6;
        }else if(downloadParam === 'CN030-264656'){
            downloadUrl = downloadUrl7;
        }else if(downloadParam === 'CN030-264651'){
            downloadUrl = downloadUrl8;
        }else if(downloadParam === 'CN030-264657'){
            downloadUrl = downloadUrl9;
        }else{
            downloadUrl = downloadUrl1;
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
        return <ClassLiveQuestion doDownload={this.doDownload} doEbook={this.doEbook}></ClassLiveQuestion>
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(ClassLiveQuestionContainer));
