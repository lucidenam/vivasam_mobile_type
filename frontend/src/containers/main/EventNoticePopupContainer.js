import React, {Component, Fragment} from 'react';
import {Cookies} from 'react-cookie';
import moment from "moment";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as baseActions from "../../store/modules/base";
import {withRouter} from "react-router-dom";
import * as common from "../../lib/common";
import * as api from "../../lib/api";

const cookies = new Cookies();

class EventNoticePopupContainer extends Component {
    state = {
        loading : true,
        visible : false,
        isEventApply: false,    	// 신청여부
    };

    constructor(props) {
        super(props);
    }

    componentDidMount = async() => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

        this._isMounted = true;
        const popDataAsk = cookies.get("2024popDataAsk");
        if(!popDataAsk) {
            this.setState({
                visible: true,
            });

            return false;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    // 기 신청 여부 체크
    eventApplyCheck = async() => {
        const { logged} = this.props;

        const eventId = '553';
        if (logged) {
            const response = await api.chkEventJoin({eventId});
            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    handleCloseEventNotice = (e) =>  {
        e.preventDefault();

        this.setState({
            visible: false
        });

        if(this.refs.todayClose.checked) {
            cookies.set("2024popDataAsk", true, {
                expires: moment().add(365, 'days').toDate()
            });
        }
    };

    goApplyPage = () => {
        const {loginInfo, history, BaseActions} = this.props;
        const { isEventApply} = this.state;

        // 교사 인증
        if (loginInfo.certifyCheck === 'N') {
            BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return;
        }
        // 준회원일 경우 신청 안됨.
        if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return;
        }
        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return;
        }


        history.push('/saemteo/event/apply/553');
    }

    render() {
        
        const {loading} = this.state;

        return (
            <Fragment>
                {loading && (
                    <Fragment>
                        {/* <!-- 신학기 패키지 수령확인 --> */}
                        <div id="popEventBn" ref="ssoPopEventBn" style={{display: this.state.visible ? 'block' : 'none'}} className="pop_main_210330">
                            <div className="layer_event_mask"></div>
                            <div className="mainPopCont">
                                <strong className="contTit"><span className="blind">비상교과서를 사용하시는 선생님, 신학기 연구용 자료 받으셨나요?</span></strong>
                                <div className="contTxtWrap">
                                    <p className="contTxt"><strong className="pointTxt">연구용 자료(교사용 교과서 포함)</strong>가<br/>학교에 도착하지 않았다면 &lt;신청하기&gt;에<br/><strong className="pointTxt">학교/과목(교과서명)/연락처</strong>를 남겨주세요.</p>
                                    <div className="btnWrap">
                                        <a onClick={this.goApplyPage} className="btnLink">신청하기</a>
                                    </div>
                                    <span className="subTxt"><sub>*</sub> 재직 학교 인근의 <em>비상교육 지사</em>를 통해<br/>받으시도록 처리해드립니다.</span>
                                </div>
                                <div className="systemCheckFoot">
                                    <div className="control">
                                        <input type="checkbox" ref="todayClose" id="todayClose02" onClick={this.handleCloseEventNotice}/><label htmlFor="todayClose02">다시 보지 않기</label>
                                        <a href="#"
                                            onClick={this.handleCloseEventNotice} className="btnClose"><span className="blind">닫기</span></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <!-- 신학기 패키지 수령확인 --> */}
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

export default  connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        isApp: state.base.get('isApp'),
        myClassInfo: state.myclass.get('myClassInfo'),
        isFirst: state.base.get('isFirst')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(EventNoticePopupContainer));
