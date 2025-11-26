import React, { Component } from 'react';

class SoobakcPopupContainer extends Component {
    render () {
        const {playViewer} = this.props;

        return (
            <section id="pop_content">
                <div className="popup_content">
                    <div className="alert_cont">
                        <p className="alert_txt">모바일 데이터로 연결되어 있을 경우 <br /> <em className="alert_em">데이터 사용료가 발생</em>할 수 있습니다. <br />와이파이로 이용할 것을 권장 드립니다.</p>
                    </div>
                    <div className="popup_btn_ox mt30">
                        <a onClick={playViewer} className="popup_btn_box_type3">확인</a>
                    </div>
                </div>
            </section>
        )
    }
}

export default SoobakcPopupContainer;
