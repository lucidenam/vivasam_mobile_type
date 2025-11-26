import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';

class LiveLessonPopupContainer extends Component {
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
        const {activeViewer} = this.props;
        return (
            <section id="pop_content">
                <div className="popup_content">
                    <div className="alert_cont">
                        <p className="alert_txt">모바일 데이터로 연결되어 있을 경우 <br /> <em className="alert_em">데이터 사용료가 발생</em>할 수 있습니다. <br />와이파이로 이용할 것을 권장 드립니다.</p>
                    </div>
                    <div className="popup_btn_ox mt30">
                        <a onClick={activeViewer} className="popup_btn_box_type3">확인</a>
                    </div>
                </div>
                <a onClick={this.onCloseLayer} className="btn_close2"><span className="blind">레이어 닫기</span></a>
            </section>
        )
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(LiveLessonPopupContainer));
