import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as api from 'lib/api';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import { AidtNewCurriculum } from 'components/livelesson';
import * as common from "../../lib/common";
import {LiveLessonDownloadContainer} from "./index";

class AidtNewCurriculumContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tooltipActive: false,
            downloadParam: '',
            downloadUrl1 : 'https://dn.vivasam.com/vs/aidt2022/중고등_AI 디지털 교과서_2022 개정 교육과정.pdf',
            tabCtrl: ['2022 개정 교육과정의 모든 것'],
            onIdx: 1,
        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    doEbook = (linkUrl, e) => {
        const {logged, history, PopupActions, BaseActions, loginInfo, myClassInfo } = this.props;

        if(!logged) {
            common.info("로그인이 필요한 서비스입니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        } else {

            // 교사 인증
            let isNotAuth = false;
            if (loginInfo.certifyCheck === 'N') {
                isNotAuth = true;
                if (window.confirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?')) {
                    BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                    window.location.hash = "/login/require";
                    window.viewerClose();
                }
            }
            if(isNotAuth){
                return;
            }

            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            const link = document.createElement('a');
            link.href = linkUrl;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    doDownload = (param, e) => {
        const {logged, history, PopupActions, BaseActions, myClassInf, loginInfo, myClassInfo } = this.props;
        if(!logged) {
            common.info("로그인이 필요한 서비스입니다.");
            history.replace("/login");
        } else {

            // 교사 인증
            let isNotAuth = false;
            if (loginInfo.certifyCheck === 'N') {
                isNotAuth = true;
                if (window.confirm('교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?')) {
                    BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                    window.location.hash = "/login/require";
                    window.viewerClose();
                }
            }
            if(isNotAuth){
                return;
            }

            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
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
                'parameter': 'AI디교 새 교육과정',
                'parameter value': 'AI디교 새 교육과정 안내'
            });

            this.setState({
                downloadParam : param
            })

            PopupActions.openPopup({title:'자료집 다운로드', componet:<LiveLessonDownloadContainer activeDownload={this.activeDownload}/>});
        }
    }

    activeDownload = () => {
        const {PopupActions} = this.props;
        const {downloadParam, downloadUrl1} = this.state;

        let downloadUrl = '';
        // 중학교 국어, 수학, 사회 , 도덕, 과학, 진로와 직업 다운로드
        if(downloadParam === 'CN030-443359') {
            downloadUrl = downloadUrl1;
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

    onClickTab = idx => {
        const {onIdx} = this.state

        this.setState({
            onIdx: idx
        })
    }

    render() {
        const {tabCtrl, onIdx} = this.state
        return <AidtNewCurriculum doDownload={this.doDownload} doEbook={this.doEbook} tabCtrl={tabCtrl} onIdx={onIdx} onClickTab={this.onClickTab}></AidtNewCurriculum>
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
)(withRouter(AidtNewCurriculumContainer));
