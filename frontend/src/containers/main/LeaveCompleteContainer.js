import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as api from "../../lib/api";

class LeaveCompleteContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            messageList: [],
            domId : "",
            domMessage : "",
            etcMessage : "",
        };
    }

    componentDidMount = async () => {
        await this.getLeaveMessageList();
    }

    getLeaveMessageList = async () => {
        const leaveMessageList = await api.leaveMessageList();

        this.setState({
            messageList: leaveMessageList.data,
        });
    }

    handleChange = (e) => {
        this.setState({
            domId : e.target.dataset.domid,
            domMessage : e.target.value
        });
    }

    handleEtcMessage = (e) => {
        this.setState({
            etcMessage : e.target.value
        })
    }

    leaveConfirm = async () => {
        const {domId, domMessage, etcMessage} = this.state;
        const{BaseActions, history} = this.props;
        let msg = "";

        if(domId==='') {
            alert("탈퇴 사유를 선택해 주세요.");
            return;
        }

        if(domId==='0' && etcMessage==='') {
            alert("기타 선택시 탈퇴 사유를 입력해 주세요.");
            return;
        }

        if(domId==='0') {
            msg = etcMessage;
        } else {
            msg = domMessage;
        }

        if (window.confirm("탈퇴하시겠습니까?")) {
            const result = await api.leave(domId, msg);

            if (result.data === true && result.status === 200) {
                alert("탈퇴가 완료되었습니다.");
                //로그아웃처리
                BaseActions.logout();
                // SNS로그인 정보 삭제
                sessionStorage.removeItem('snsObject');
                history.push("/");
            } else {
                alert("서버 오류입니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            }
        }
    }


    render() {
        const {messageList} = this.state;

        return (
            <Fragment>
                <section className="leave">
                    <div className="leave_wrap">
                        <div className="leave_check">
                            <h3>회원여부가 확인되었습니다.</h3>
                            <p>
                                그동안 비바샘 이용에 감사드리며, 아래의 탈퇴 사유를 선택해 주시면<br/>
                                회원탈퇴 처리가 완료됩니다.
                            </p>
                            <p>보내주신 의견을 바탕으로 보다 나은 서비스를 위해 노력하겠습니다.</p>
                        </div>

                        <div className="outReason">
                            <h2>탈퇴사유</h2>
                            <ul>
                                {
                                    messageList.map((data, index = 1) => {
                                        return (
                                            <li key={index}>
                                                <input type="radio"
                                                       id={"secedeCode_" + index}
                                                       data-domid={data.domId}
                                                       name="secedeCode"
                                                       value={data.domMessage}
                                                       onChange={this.handleChange}/>
                                                <label htmlFor={"secedeCode_" + index}>{data.domMessage}</label>
                                            </li>
                                        );
                                    })
                                }
                                <li>
                                    <input type="radio" id="secedeCode_5" data-domid="0" name="secedeCode" value={0}  onChange={this.handleChange}/>
                                    <label htmlFor="secedeCode_5">기타</label>
                                    <textarea onChange={this.handleEtcMessage}></textarea>
                                </li>
                            </ul>

                            <a
                                onClick={this.leaveConfirm}
                                className="btn_round_on">
                                탈퇴하기
                            </a>
                        </div>
                    </div>
                </section>
                <a href="" className="btn_top"/>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        isApp: state.base.get('isApp'),
        autoLogin: state.base.get('autoLogin'),
        loginInfo: state.base.get('loginInfo').toJS(),
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(LeaveCompleteContainer));