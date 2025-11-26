import React, {Component, Fragment} from 'react';
import { Cookies } from 'react-cookie';
import {Link, withRouter} from 'react-router-dom';
import * as popupActions from 'store/modules/popup';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import moment from 'moment';

class HighSchoolMathPopup extends Component {

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    closePop = async(e) => {
        const { PopupActions, handleClose } = this.props;
        e.preventDefault();
        if(this.refs.todayClose.checked) {
            const cookies = new Cookies();
            cookies.set("popHighSchoolEvt", true, {
                expires: moment().add(24, 'hours').toDate()
            });
            await PopupActions.closePopup();
            if(handleClose) {
                handleClose();
            }
        }
    }

    goEventPage = async(e)  => {
        const { PopupActions, handleClose } = this.props;
        e.preventDefault();
        await PopupActions.closePopup();
        if(handleClose) {
            handleClose();
        }
        this.props.history.push('/saemteo/event/view/321');
    }

    render() {

        return ( // 고등 기본 수학 이벤트 팝업
            <section id="popHighSchoolEvt">
                <strong className="tit">
                    <img src="/images/events/2020/event201207/pop_tit.png" alt="‘가장 슬림한 수학 교과서’ 비상교육 고등 기본 수학을 소개합니다." />
                </strong>
                <div className="popInner">
                    <ul className="evtInfoList">
                        <li><strong>학습 부담을 줄인</strong> 혁신적인 교과서</li>
                        <li><strong>중학교 수학 개념을 연계</strong>한 쉬운 교과서</li>
                        <li>친근한 삽화로 <strong>호기심을 높이는</strong>교과서</li>
                        <li>재밌는 활동지로 <strong>자기 주도 학습</strong>을 돕는 교과서</li>
                    </ul>
                    {/*
                        <span className="evtInfoTxt">* 고등학교 수학 선생님을 위한 <em>슬림 이벤트</em>가 진행 중입니다!</span>
                    */}
                    <div className="btnWrap">
                        <button onClick={this.goEventPage} ><img src="/images/events/2020/event201207/btn_pop_view.png" alt="자세히보기" /></button>
                    </div>
                    <div className="todayWrap">
                        <input type="checkbox" id="todayClose" ref="todayClose" onClick={this.closePop}/><label for="todayClose">오늘 하루 열지 않기</label>
                        {/* <button type="button" class="btnEvtPopClose" onClick={this.handleCloseEventHighSchool}><span class="blind">닫기</span></button> */}
                    </div>
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
)(withRouter(HighSchoolMathPopup));