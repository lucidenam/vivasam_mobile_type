import React, { Component,Fragment } from 'react';
import { Cookies } from 'react-cookie';
import moment from "moment";
import { Link } from 'react-router-dom';

const cookies = new Cookies();

class TempNoticeContainer extends Component {
    state = {
        loading : true,
        visible : false
    };

    componentDidMount() {
        this._isMounted = true;
        const stopTempNotice = cookies.get("stopTempNotice");
        console.log(stopTempNotice);
        if(!stopTempNotice) {
            this.setState({
                visible: true,
            });

            return false;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleCloseTempNotice = (e) =>  {
        e.preventDefault();

        this.setState({
            visible: false
        });

        if(this.refs.todayClose.checked) {
            cookies.set("stopTempNotice", true, {
                expires: moment().add(24, 'hours').toDate()
            });
        }
    };

    render() {
        
        const {loading} = this.state;

        return (
            <Fragment>
                {loading && (
                    <Fragment>
                        {/* <!-- 메인팝업 --> */}
                        <div id="popEventBn" ref="ssoPopEventBn" style={{display: this.state.visible ? 'block' : 'none'}} className="layer_event pop_main_210226">
                            <div className="layer_content">
                                <img src="/images/main/pop_main_210226.jpg" alt="2021년 온라인 수업을 위한 비상교육 학습 자료 지원" />
                                <a href="/#/cs/notice/892" className="btn_link type1"><span className="blind">교과서 및 교수 학습 자료 저작물 이용 안내</span></a>
                                <ul className="btn_link list">
                                    <li className="sizeS"><a href="/#/cs/notice/1113"><span className="blind">중학 비상교과서 E-Book 바로가기</span></a></li>
                                    <li className="sizeS"><a href="https://www.vivasam.com//e-learning/index.do?gubun=MS&deviceMode=pc" target="_blank" title="새창열림"><span className="blind">중학 전과목 핵심 개념 영상 바로가기</span></a></li>
                                    <li className="sizeS"><a href="https://www.vivasam.com/ebook/mList.do?deviceMode=pc" target="_blank" title="새창열림"><span className="blind">중학 평가문제집 E-Book 바로가기</span></a></li>
                                    <li><a href="/#/cs/notice/1113"><span className="blind">고등 비상교과서 E-Book 바로가기</span></a></li>
                                    <li><a href="https://dn.vivasam.com/smart/ebook/event_popup_0404.html?deviceMode=pc&pageSize=12" target="_blank" title="새창열림"><span className="blind">고등 과목별 교재 E-Book 바로가기</span></a></li>
                                </ul>
                                <div className="control">
                                    <input type="checkbox" ref="todayClose" id="todayClose" onClick={this.handleCloseTempNotice}/><label htmlFor="todayClose">오늘 하루 보지 않기</label>
                                    <a href="#"
                                        onClick={this.handleCloseTempNotice} className="btn_today_close">닫기</a>
                                </div>
                                <a href="#" className="btn_close"
                                    onClick={this.handleCloseTempNotice}><span className="blind">닫기</span></a>
                            </div>
                        </div>
                        {/* <!-- 메인팝업 --> */}
                        <div ref="ssoPopEventMask" style={{display: this.state.visible ? 'block' : 'none'}} className="layer_event_mask"></div>
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

export default TempNoticeContainer;
