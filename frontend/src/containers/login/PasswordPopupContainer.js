import React, {Component, Fragment} from 'react';
import $ from "jquery";
import moment from "moment";
import {Link} from "react-router-dom";


class PasswordPopupContainer extends Component {
    closePassPopup = (param) => {
        $('.pop_password').hide();
    }

    render() {
        return (
            <Fragment>
                <div className="pop_password">
                    <div className="mainPopCont">
                        <button className="btnPopClose" type="button" onClick={this.closePassPopup.bind(this)}><span className="blind">닫기</span></button>
                        <div className="txtBox">
                            <p>
                                입력하신 아이디 또는<br/>
                                비밀번호가 일치하지 않습니다.<br/>
                                다시 입력해 주세요.
                            </p>
                            <p className="subTxt">(남은 시도 횟수 : <span id="retLoginCnt"></span>회)</p>
                        </div>
                        <div className="btnBox">
                            <button type="button" onClick={this.closePassPopup.bind(this)} className="btn blue">다시 시도하기</button>
                            <Link
                                to="/find/pw"
                                className="btn gray">
                                아이디/비밀번호 찾기
                            </Link>
                        </div>
                    </div>
                    <div className="dimmed"></div>
                </div>
            </Fragment>
        );
    }
}

export default PasswordPopupContainer;
