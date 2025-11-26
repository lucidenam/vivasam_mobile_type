import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';

class DownloadInfo extends Component {

    handleDownload = (e) => {
        e.preventDefault();
        const { PopupActions, target, BaseActions } = this.props;

        try {
            BaseActions.openLoading();

            //네트워크 체크
            api.hasDataNetworkPermission().then((hasPermission)=>{
                if (hasPermission === false) {
                    api.appAlert('데이터 네트워크 차단 상태입니다. 데이터 네트워크 설정을 확인해 주세요.\n(사용중인 데이터 요금제에 따라 데이터 통화료가 부과될 수 있습니다.)');
                    PopupActions.closePopup();
                    return;
                }                
            });

            this.handleGetFileInfoList();
            PopupActions.closePopup();

            const link = document.createElement('a');
            link.href = target.dataset.src;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 100);//의도적 지연.
        }
    }

    handleGetFileInfoList = async() => {
        const { target } = this.props;
        //이력 남기기 위해 url전달 받았지만 다시 불러옴
        await api.getFileInfoList({"0": "ID","1" :target.dataset.gubun+"-"+target.dataset.id});
    }

    handleClick = async(e) => {
        e.preventDefault();
        const { PopupActions, target, BaseActions } = this.props;
        try {
            BaseActions.openLoading();

            //네트워크 체크
            api.hasDataNetworkPermission().then((hasPermission)=>{
                if (hasPermission === false) {
                    api.appAlert('데이터 네트워크 차단 상태입니다. 데이터 네트워크 설정을 확인해 주세요.\n(사용중인 데이터 요금제에 따라 데이터 통화료가 부과될 수 있습니다.)');
                    PopupActions.closePopup();
                    return;
                }                
            });

            //이력 남기기 위해 url전달 받았지만 다시 불러옴
            const response = await api.getFileInfoList({"0": "ID","1" :target.dataset.gubun+"-"+target.dataset.id});
            if(response.data.length > 0) {
                const { result, cndyn, downyn, tnyn } = response.data[0];
                if(downyn === 'Y') {
                    // 웹뷰 url 전달
                    let url = result;
                    if(url.indexOf('http') === -1){
                        url = 'http://'+ url;
                    }
                    const link = document.createElement('a');
                    link.href = url;
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // blob url 웹뷰 처리 문의 (blob은 https 이슈있음)
                    // api.download(result, result.split('\\').pop().split('/').pop());
                    PopupActions.closePopup();
                }else {
                    common.error("다운로드 불가.");
                }
            }else {
                common.error("다운로드 데이터 없음.");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 100);//의도적 지연.
        }
    }

    render() {
        return (
            <section id="pop_content">
                <div className="popup_content" style={{paddingLeft: '32px', paddingRight: '32px'}}>
                    <p className="popup_content_ment" style={{fontSize: '14px'}}>
                        다운로드 하시는 자료는<br />'학교 및 교육기관의 수업' 목적을 위해서만 한정하여 사용되도록 저작권법의 보호를 받고 있습니다.
                    </p>
                    <p className="popup_content_ment2" style={{fontSize: '14px'}}>
                        수업 외의 목적으로<br /> 사용되지 않도록 주의 부탁드립니다.
                    </p>
                    <div className="popup_alert_box mt25 mb30">
                        <span className="popup_content_ment4">
                            모바일 데이터로 연결되어 있을 경우 데이터 사용료가 발생할 수 있습니다.
                        </span>
                    </div>
                    <div className="popup_btn_box">
                        <a
                            onClick={this.handleDownload}
                            className="popup_btn_box_type3">
                            확인
                        </a>
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(DownloadInfo);
