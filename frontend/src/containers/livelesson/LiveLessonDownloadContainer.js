import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';

class LiveLessonDownloadContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    componentDidMount = () => {
        
    }

    componentWillUpdate = () => {
        
    }

    onCloseLayer = () => {
        const {PopupActions} = this.props;
        PopupActions.closePopup()
    }
    
    render () {
        const {activeDownload} = this.props;

        return (
            <section id="download_content">
                <div className="dim" id="dim"></div>
                <div className="popup" id="popup">
                    <div className="popup_tit">
                    저작권 안내
                    </div>
                    <div className="popup_content">
                        <p className="popup_content_ment">다운로드 하시는 자료는<br/>'학교 및 교육기관의 수업' 목적을 위해서만 한정하여 사용되도록 저작권법의 보호를 받고 있습니다.</p>
                        <p className="popup_content_ment2">수업 외의 목적으로<br/> 사용되지 않도록 주의 부탁드립니다.</p>
                        <div className="popup_alert_box mt25 mb30">
                            <span className="popup_content_ment4">모바일 데이터로 연결되어 있을 경우 데이터 사용료가 발생할 수 있습니다.</span>
                        </div>
                        <div className="popup_btn_box">
                            <a onClick={activeDownload} className="popup_btn_box_type3">확인</a>
                        </div>
                    </div>
                    <a onClick={this.onCloseLayer} className="btn_close2"><span className="blind">레이어 닫기</span></a>
                </div>
            </section>
        )
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(LiveLessonDownloadContainer));