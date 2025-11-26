import React, { Component,Fragment } from 'react';
import { Cookies } from 'react-cookie';
import moment from "moment";
import { Link } from 'react-router-dom';

const cookies = new Cookies();

class SsoEventContainer extends Component {
    state = {
        loading : true,
        visible : true
    };

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleClose = (e) =>  {
        e.preventDefault();

        this.setState({
            visible: false
        });

        if(this.refs.todayClose.checked) {
            cookies.set("stopSsoGuide", true, {
                expires: moment().add(365, 'days').toDate()
            });
        }
    }

    handleCloseForOnce = (e) =>  {
        e.preventDefault();

        this.setState({
            visible: false
        });

        cookies.set("stopSsoGuideForOnce", true, {
            expires: moment().add(1, 'days').toDate()
        });
    }

    render() {
        
        const {loading} = this.state;

        return (
            <Fragment>
                {loading && (
                    <Fragment>
                        <div id="popEventBn" ref="ssoPopEventBn" style={{display: this.state.visible ? 'block' : 'none'}} className="layer_event conversion_popup">
                            <div className="layer_content popup_wrap">
                                {/* <a href="#"
                                    onClick={this.goSsoConversion} ><img src="../images/member/pop_event.jpg" alt="비상교육 선생님 통합회원 전환 EVENT" /></a> */}
                                <img src="../images/member/conversion_txt.png"
                                     alt="지금 통합회원으로 전환하세요"/>
                                <Link to='/conversion/main'><img src="../images/member/conversion_btn.png" alt="통합회원 전환하기" /></Link>
                                {/*<div className="control">
                                    <input type="checkbox" ref="todayClose" id="todayClose" onClick={this.handleClose}/><label htmlFor="todayClose"><span className="blind">더 이상 보지 않기</span></label>
                                </div>*/}
                                <a href="#" className="btn_close"
                                    onClick={this.handleCloseForOnce}><span className="blind">닫기</span></a>
                            </div>

                            <div className="todayClose">
                                <input type="checkbox" ref="todayClose" id="todayClose" onClick={this.handleClose}/>
                                <label htmlFor="todayClose">
                                    <img src="../images/member/btn_dontsee.png"
                                         alt="더 이상 보지 않기"/>
                                </label>
                            </div>
                        </div>
            
                        <div ref="ssoPopEventMask" style={{display: this.state.visible ? 'block' : 'none'}} className="layer_event_mask conversion"></div>
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

export default SsoEventContainer;
