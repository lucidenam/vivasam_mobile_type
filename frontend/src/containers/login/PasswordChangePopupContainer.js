import React, {Component, Fragment} from 'react';
import $ from "jquery";
import moment from "moment";
import {Link} from "react-router-dom";


class PasswordChangePopupContainer extends Component {

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
                                비밀번호 오류로 <br/>
                                로그인이 제한되었습니다.
                            </p>
                            <p className="subTxt">
                                [임시 비밀번호 발급] 버튼을 눌러,<br/>
                                등록하신 휴대폰 번호로<br/>
                                임시 비밀번호를 받으실 수 있습니다.
                            </p>
                        </div>
                        <div className="btnBox">
                            <Link
                                to="/find/id"
                                className="btn blue">
                                아이디 찾기
                            </Link>
                            <Link
                                to="/find/tempPw"
                                className="btn gray">
                                임시 비밀번호 발급
                            </Link>
                        </div>
                    </div>
                    <div className="dimmed"></div>
                </div>
            </Fragment>
        );
    }
}

export default PasswordChangePopupContainer;
