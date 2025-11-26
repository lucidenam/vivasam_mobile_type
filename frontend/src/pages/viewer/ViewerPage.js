import React, {Component} from 'react';
import PageViewerTemplate from 'components/page/PageViewerTemplate';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';
import * as popupActions from 'store/modules/popup';
import * as api from 'lib/api';
import * as common from 'lib/common';
import ImageViewer from './ImageViewer'
import VideoViewer from './VideoViewer'
import DocumentViewer from './DocumentViewer'
import EtcViewer from './EtcViewer'
import HtmlViewer from './HtmlViewer'
import DownloadInfo from 'components/common/DownloadInfo';

class ViewerPage extends Component{

    constructor(props) {
      super(props);
      // Debounce
      this.handleAddFolder = debounce(this.handleAddFolder, 300);
    }

    handleAuth = async() => {
       
        const { logged, BaseActions, ViewerActions, target, loginInfo } = this.props;
        try {
            BaseActions.openLoading();
            if(!logged){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                window.location.hash = "/login";
                window.viewerClose();
                return false;
            }
           
            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증을 해 주세요. 지금 인증을 진행하시겠습니까?");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
           
            //visang 파일 제한
            var icon = common.getContentIcon(target.dataset.src);
            if(icon === "visang"){
                common.info(".visang 파일은 비바샘 PC 에서 사용 가능합니다.");
                window.viewerClose();
                return false;
            }

            //평가자료 준회원 제한 체크
            const response = await api.contentCheck(target.dataset.id,target.dataset.gubun);
            if(response.data.code && response.data.code === "1"){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714))");
                window.viewerClose();
                return false;
            }
            ViewerActions.pushValues({type:"auth", object:true});

            api.insertMaterialViewLog(target.dataset.id);

            return true;
        }catch(e) {
            console.log(e);
        }finally {
            BaseActions.closeLoading();
        }
    }

    handleDownload = (target) => {
        const { PopupActions, BaseActions, myClassInfo } = this.props;

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
        gtag('event', '다운로드', {
            'parameter': '뷰어'
        });
        PopupActions.openPopup({title:"교수자료 저작권 안내", componet:<DownloadInfo target={target} />});
    }

    handleAddFolder = async() => {
        const { target, BaseActions } = this.props;
        function gtag(){
            window.dataLayer.push(arguments);
        }
        try {
            gtag('event', '담기', {
                'parameter': '뷰어'
            });
            BaseActions.openLoading();
            const response = await api.addFolder(target.dataset.id,target.dataset.gubun);
            if(response.data.code && response.data.code === "0"){
                if(response.data.metaCode[0].code === "END"){
                    common.info("내 자료가 추가되었습니다.");
                }else if(response.data.metaCode[0].code === "DUPL"){
                    common.info("이미 나의 교실에 자료가 담겨져 있습니다.");
                }
            }else if(response.data.code && response.data.code === "2"){
                common.info("로그인 후 사용가능합니다.");
            } else {
                common.error("파일을 담기에 실패하였습니다.");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 100);//의도적 지연.
        }
    }

    handleApplyPoint = () => {
        const { target } = this.props;
        if(target && target.dataset.id && target.dataset.gubun){
            api.applyPointViewer(target.dataset.id,target.dataset.gubun);
        }
    }

    render () {
        const { title,visible,target,auth } = this.props;
        let icon;
        let container;
        if(!target){
            container = null;
        } else {
            switch (target.dataset.type) {
            case 'image':
                icon = 'img';
                container = <ImageViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint}/>
                break;
            case 'audio':
                icon = 'audio';
                container = <VideoViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint} type='audio'/>
                break;
            case 'video':
                icon = common.getContentIcon(target.dataset.src);
                if(icon === 'swf'){
                    container = <EtcViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint} type='swf'/>
                }else if(icon === 'pdf' || icon === 'hwp' || icon === 'ppt' || icon === 'xls'){
                    container = <DocumentViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint}/>
                }else if((target.dataset.siteurl != null && typeof target.dataset.siteurl != "undefined" && target.dataset.siteurl != '') && (target.dataset.siteurl.includes('.HTML') || target.dataset.siteurl.includes('.html'))){
                    icon = 'video';
                    container = <HtmlViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint} type={icon}/>
                } else{
                    container = <VideoViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint} type='video'/>
                }
                break;
            case 'document':
                icon = common.getContentIcon(target.dataset.src);
                container = <DocumentViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint}/>
                break;
            case 'smart':
                icon = common.getFileIconClass(target.dataset.type, target.dataset.src, target.dataset.gubun);
                container = <DocumentViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint}/>
                break;
            case 'etc':
                icon = common.getContentIcon(target.dataset.src);
                container = <EtcViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint} type={icon}/>
                break;
            case 'test':
                container = <HtmlViewer target={target} handleAuth={this.handleAuth} handleDownload={this.handleDownload} handleAddFolder={this.handleAddFolder} handleApplyPoint={this.handleApplyPoint} type={icon}/>
                break;
            default :
            }
        }
        return (
            <PageViewerTemplate title={title} icon={icon} visible={visible} auth={auth}
                                target={target}
                                handleAuth={this.handleAuth}
                                handleDownload={this.handleDownload}
                                handleAddFolder={this.handleAddFolder}
                                handleApplyPoint={this.handleApplyPoint}>
                {container}
            </PageViewerTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        title: state.viewer.get('title'),
        visible: state.viewer.get('visible'),
        target: state.viewer.get('target'),
        auth: state.viewer.get('auth'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(ViewerPage);
