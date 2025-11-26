import React, {Component, Fragment} from 'react';
import $ from "jquery";
import {Cookies} from "react-cookie";
import moment from "moment";


class EduCoursePopupContainer extends Component {

    closeEduPopup = (textbookCd,param) => {
        const cookies = new Cookies();
        $('.pop_textbook22').hide();
        cookies.set("educoursePopup_"+textbookCd, true, {
            expires: moment().add(3650, 'months').toDate()
        });
    }

    render() {
        const cookies = new Cookies();
        const {textbookCd} = this.props;
        if (cookies.get("educoursePopup_"+textbookCd)){
            return null;
        }
        if (1 === 1) {
            return null;
        } else {
            if(textbookCd === '106473' || textbookCd === '106470' ||  textbookCd === '106480' || textbookCd === '106472') {
                return (
                    <Fragment>
                        <div className="pop_textbook22">
                            <div className="mainPopCont">
                                <div className="contTxt">
                                    <button className="btn_close" onClick={this.closeEduPopup.bind(this,textbookCd)}></button>
                                    <p>추가 자료는 <span>2025년 7월</span>에<br/>오픈될 예정입니다.</p>
                                    <div className="btnWrap">
                                        <button className="btn_enter" onClick={this.closeEduPopup.bind(this,textbookCd)}>확인</button>
                                    </div>
                                </div>
                            </div>
                            <div className="dimmed"></div>
                        </div>
                    </Fragment>
                );
            } else if(textbookCd === '106474') {
                return (
                    <Fragment>
                        <div className="pop_textbook22">
                            <div className="mainPopCont">
                                <div className="contTxt">
                                    <button className="btn_close" onClick={this.closeEduPopup.bind(this,textbookCd)}></button>
                                    <p>단원별 자료는 <span>2025년 7월</span>부터<br/>순차적으로 탑재될 예정입니다.</p>
                                    <div className="btnWrap">
                                        <button className="btn_enter" onClick={this.closeEduPopup.bind(this,textbookCd)}>확인</button>
                                    </div>
                                </div>
                            </div>
                            <div className="dimmed"></div>
                        </div>
                    </Fragment>
                );
            } else if (textbookCd === '106471') {
                return (
                    <Fragment>
                        <div className="pop_textbook22">
                            <div className="mainPopCont">
                                <div className="contTxt">
                                    <button className="btn_close" onClick={this.closeEduPopup.bind(this,textbookCd)}></button>
                                    <p>지도서, 교사용 교과서는 <span>2025년 7월</span>에 탑재될 예정입니다.
                                        <em>* 단원별 자료는 2025년 12월부터<br/> 순차적으로 탑재될 예정입니다.</em>
                                    </p>
                                    <div className="btnWrap">
                                        <button className="btn_enter" onClick={this.closeEduPopup.bind(this,textbookCd)}>확인</button>
                                    </div>
                                </div>
                            </div>
                            <div className="dimmed"></div>
                        </div>
                    </Fragment>
                );
            } else if (textbookCd === '106475') {
                return (
                    <Fragment>
                        <div className="pop_textbook22">
                            <div className="mainPopCont">
                                <div className="contTxt">
                                    <button className="btn_close" onClick={this.closeEduPopup.bind(this,textbookCd)}></button>
                                    <p>지도서, 교사용 교과서, 수활북은<br/><span>2025년 5월</span>에 오픈될 예정입니다.<br/>
                                        <em>* 추가 자료는 2025년 7월에<br/> 오픈될 예정입니다.</em>
                                    </p>
                                    <div className="btnWrap">
                                        <button className="btn_enter" onClick={this.closeEduPopup.bind(this,textbookCd)}>확인</button>
                                    </div>
                                </div>
                            </div>
                            <div className="dimmed"></div>
                        </div>
                    </Fragment>
                );
            } else if (textbookCd === '106426') {
                return (
                    <Fragment>
                        <div className="pop_textbook22">
                            <div className="mainPopCont">
                                <div className="contTxt">
                                    <button className="btn_close" onClick={this.closeEduPopup.bind(this,textbookCd)}></button>
                                    <p>추가 자료는 <span>2025년 6월</span>에<br/>오픈될 예정입니다.</p>
                                    <div className="btnWrap">
                                        <button className="btn_enter" onClick={this.closeEduPopup.bind(this,textbookCd)}>확인</button>
                                    </div>
                                </div>
                            </div>
                            <div className="dimmed"></div>
                        </div>
                    </Fragment>
                );
            } else if (textbookCd === '106462' || textbookCd === '106464') {
                return (
                    <Fragment>
                        <div className="pop_textbook22">
                            <div className="mainPopCont">
                                <div className="contTxt">
                                    <button className="btn_close" onClick={this.closeEduPopup.bind(this,textbookCd)}></button>
                                    <p>추가 자료는 <span>2025년 4월 24일</span>에<br/>오픈될 예정입니다.</p>
                                    <div className="btnWrap">
                                        <button className="btn_enter" onClick={this.closeEduPopup.bind(this,textbookCd)}>확인</button>
                                    </div>
                                </div>
                            </div>
                            <div className="dimmed"></div>
                        </div>
                    </Fragment>
                );
            } else if (textbookCd === '106465' || textbookCd === '106466' || textbookCd === '106467') {
                return (
                    <Fragment>
                        <div className="pop_textbook22">
                            <div className="mainPopCont">
                                <div className="contTxt">
                                    <button className="btn_close" onClick={this.closeEduPopup.bind(this,textbookCd)}></button>
                                    <p>추가 자료는 <span>2025년 5월 말</span>에<br/>오픈될 예정입니다.</p>
                                    <div className="btnWrap">
                                        <button className="btn_enter" onClick={this.closeEduPopup.bind(this,textbookCd)}>확인</button>
                                    </div>
                                </div>
                            </div>
                            <div className="dimmed"></div>
                        </div>
                    </Fragment>
                );
            } else {
                return null;
            }
        }
    }
}

export default EduCoursePopupContainer;
