import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import {Cookies} from 'react-cookie';
import { ajaxPassNextUpdate } from 'lib/api';

class ChangePasswordInfo extends Component {

    cancelUpdate = () => {
        const {history} = this.props;
        history.push("/");
    };

    ajaxPassNextUpdate = async () => {
        const response = await ajaxPassNextUpdate();
        this.cancelUpdate();
    }

    render() {
        return (
            <section className="login">
                <h2 className="blind">비밀번호 변경 안내</h2>
                <div className="login_auto">
                    <strong className="login_auto_tit ico_symbol3 pb20"><em className="marker3">선생님, 비밀번호 변경으로 <br/>소중한
                        개인정보를 지켜주세요.</em></strong>

                    <p className="login_auto_ment mb30">장기간 동일한 비밀번호를 사용하실 경우 <br/>발생될 수 있는 피해를 방지하기 위해 <br/>6개월마다 안내해
                        드리고 있습니다. <br/>안전한 개인정보 보호를 위해 <br/>지금, 비밀번호를 변경해 주세요.</p>

                    <Link to="/myinfo/myinfoPwdChange" className="btn_round_on mb10">변경하기</Link>
                    <a onClick={this.ajaxPassNextUpdate} className="btn_round_gray">다음에 변경하기</a>
                </div>
            </section>
        );
    }
}

export default withRouter(ChangePasswordInfo);