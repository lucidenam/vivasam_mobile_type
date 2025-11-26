import React, {Component, Fragment} from 'react';
import { Cookies } from 'react-cookie';
import {Link, withRouter} from 'react-router-dom';
import * as popupActions from 'store/modules/popup';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import moment from 'moment';

const cookies = new Cookies();

class ServiceChkPopup extends Component {
    state = {
        loading : true,
        visible : false
    };

    componentDidMount() {
        this._isMounted = true;
        const popServiceChk = cookies.get("popServiceChk");
        if(!popServiceChk) {
            this.setState({
                visible: true,
            });

            return false;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleClosePopServiceChk = (e) =>  {
        e.preventDefault();

        this.setState({
            visible: false
        });

        if(this.refs.todayClose03.checked) {
            cookies.set("popServiceChk", true, {
                expires: moment().add(24, 'hours').toDate()
            });
        }
    };

    render() {

        const {loading} = this.state;
        return ( // 2021-06-22 서비스 점검 팝업
            <Fragment>
                {loading && (
                    <Fragment>
                        <section id="popServiceChk" style={{display: this.state.visible ? 'block' : 'none'}}>
                            <Link to="/cs/notice/989">
                                <img src="/images/main/pop_main_210622.png" alt="6월 30일 비바샘이 새롭게 오픈됩니다. 새로운 비바샘으로 찾아 뵙기 위해 29일 오후 2시부터 30일 오전 10시까지 비바샘이 잠시 문을 닫습니다. 비바샘 이용에 참고해 주시기 바랍니다." />
                                <div className="todayWrap">
                                    <input type="checkbox" id="todayClose03" ref="todayClose03" onClick={this.handleClosePopServiceChk}/><label for="todayClose03">오늘 하루 열지 않기</label>
                                    <button type="button" class="btnEvtPopClose" onClick={this.handleClosePopServiceChk}><span class="blind">닫기</span></button>
                                </div>
                            </Link>
                        </section>
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(ServiceChkPopup));