import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';
import { getMarketingAgreeList } from 'lib/api';
import { marketingAgreeUpdateThree } from 'lib/api';
import { MarketingAgreeInfoPopup } from 'containers/login';

class MarketingAgreeSelectPopup extends Component {
    state = {
        marketingEmailYn: false,
        marketingSmsYn: false,
        marketingTelYn: false
    }

    checkOnChange = (e) => {
        let targetVal = e.target.value;
        if(targetVal === 'email'){
            this.setState({marketingEmailYn: !this.state.marketingEmailYn});
        }else if(targetVal === 'sms'){
            this.setState({marketingSmsYn: !this.state.marketingSmsYn});
        }else if(targetVal === 'tel'){
            this.setState({marketingTelYn: !this.state.marketingTelYn});
        }
    }

    handleAgree = async (e) => {
        const { PopupActions, handleClose } = this.props;
        let params = {};
        params.marketingEmailYn = this.state.marketingEmailYn ? 'Y':'N';
        params.marketingSmsYn = this.state.marketingSmsYn ? 'Y':'N';
        params.marketingTelYn = this.state.marketingTelYn ? 'Y':'N';
        const response = await marketingAgreeUpdateThree(params);
        if(response.data === "SUCCESS") {
            console.debug("마케팅 동의 정보 저장 성공");
            function gtag(){
                window.dataLayer.push(arguments);
            }
            gtag('event', '전체', {
                'parameter': '회원순도관리',
                'parameter value': '마케팅활용동의미설정',
                'value': 1
            });
            await PopupActions.openPopup({title:"마케팅 및 광고 활용 동의", componet:<MarketingAgreeInfoPopup handleClose={handleClose}/>, templateClassName: 'float_box'});
        }else {
            console.error("마케팅 동의 정보 저장 실패");
        }
    }

    render() {
        return (
            <section id="popMarketAgree">
                <div className="popInner">
                    <strong className="tit"><img src="/images/member/tit_popmarketagree.png" alt="마케팅 및 광고 활용 동의를 선택하세요." /></strong>
                    <p className="txt"><img src="/images/member/txt_popmarketagree.png" alt="최신의 이벤트 소식이나 유용한 교수 자료 업데이트 시 안내받으실 수 있습니다." /></p>
                    <div className="marketSelWrap">
                        <span className="marketChk"><input type="checkbox" name="marketChk" id="marketChk01" value="sms" checked={this.state.marketingSmsYn} onChange={this.checkOnChange}/><label for="marketChk01"><img src="/images/member/chk_popmarketagree01.png" alt="sms(문자)" /></label></span>
                        <span className="marketChk"><input type="checkbox" name="marketChk" id="marketChk02" value="email" checked={this.state.marketingEmailYn} onChange={this.checkOnChange}/><label for="marketChk02"><img src="/images/member/chk_popmarketagree02.png" alt="이메일" /></label></span>
                        <span className="marketChk"><input type="checkbox" name="marketChk" id="marketChk03" value="tel" checked={this.state.marketingTelYn} onChange={this.checkOnChange}/><label for="marketChk03"><img src="/images/member/chk_popmarketagree03.png" alt="전화" /></label></span>
                    </div>
                    <button type="button" className="btnMarketSave" onClick={this.handleAgree}><span className="blind">저장하기</span></button>
                </div>
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(MarketingAgreeSelectPopup));