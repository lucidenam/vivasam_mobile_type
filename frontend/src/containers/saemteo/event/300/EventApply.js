import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import FindAddress from 'containers/login/FindAddress';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';

class EventApply extends Component {

    constructor(props) {
        super(props);
        // Debounce
        this.applyButtonClick = debounce(this.applyButtonClick, 300);
    }

    state = {
        initialSchName:'',
        initialSchZipCd:'',
        initialSchAddr:'',
        eventInfo:'',
        step : '',
        stepLength : 0,
    };

    componentDidMount(){
        const {eventId , history } = this.props;
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventId == null) || (typeof eventId == "undefined")){
            common.error("응답 문항이 제대로 작성되지 않으셨습니다.");
            history.push('/saemteo/event/view/295');
        }else{
            this.getEventInfo(eventId);
        }
    }

    getEventInfo = async(eventId) => {
        const { history, event, SaemteoActions } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0"){
            let eventInfo = response.data.eventList[0];
            event.eventId = eventInfo.eventId;
            let {memberId, name, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.agree = false;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.userInfo = 'Y';
            event.cellphone = cellphone;
            SaemteoActions.pushValues({type:"event", object:event});
            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr
            });
        }
    };

    setApplyContent = (e) => {
        if(e.target.value.length > 100){
            common.info("100자 이내로 입력해 주세요.");
        }else{
            this.setState({
                stepLength: e.target.value.length,
                step: e.target.value
            });
        }
    };

    handleChange = (e) => {
        const { event, SaemteoActions } = this.props;
        if(e.target.name === 'agree'){
            event[e.target.name] = e.target.checked;
        }else{
            event[e.target.name] = e.target.value;
        }
        SaemteoActions.pushValues({type:"event", object:event});
    };

    //값 입력 확인
    validateInfo = () => {
        const { event } = this.props;
        let obj = { result : false , message : ''};
        if(!event.agree){
            obj.message = '이벤트 참여를 위해 개인정보 수집에 동의해주세요.';
        }else if(this.state.step === ""){
            obj.message = "답변을 입력해주세요.";
        }else {
            obj.result = true;
        }
        return obj;
    };

    applyButtonClickSafe = (e) => {
        this.applyButtonClick(e.target);
    };

    applyButtonClick = (target) => {
        target.disabled = true;
        const { event, SaemteoActions } = this.props;
        let obj = this.validateInfo();
        if(!obj.result){
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        try {
            event.eventAnswerDesc = this.state.step;
            SaemteoActions.pushValues({type:"event", object:event});
            this.insertApplyForm();
        } catch (e) {
            console.log(e);
        }
    };

    handleClose = async() => {
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/event/view/295');
    };
    //신청
    //신청이 잘못된 경우 다시 못들어오게 해야되므로 이전 페이지로 Return
    insertApplyForm = async () => {
        const { event, history, SaemteoActions, PopupActions, BaseActions } = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertEventApply({...event});
            if(response.data.code === '1'){
                common.error("이미 신청하셨습니다.");
            }else if(response.data.code === '0'){
                PopupActions.openPopup({title:"신청완료", componet:<EventApplyResult eventId={'295'} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
            }else{
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    render() {
        const {eventInfo} = this.state;
        if (eventInfo === '') return <RenderLoading/>;
        const {event} = this.props;
        const { phoneCheckMessage, phoneCheckClassName } = this.state;
        return (
            <section className="vivasamter">
                <h2 className="blind">
                    비바샘터 신청하기
                </h2>
                <div className="applyDtl_top">
                    <div className="applyDtl_cell">
                        <h3>역사, 말을 걸다</h3>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <div className="vivasamter_applyDtl">

                        <div className="txt_event">제가 살고 있는 지금도 역사가 되겠지요? <br/>나중에 제 아이들이 배울 역사 교과서에는 2000년대가 어떻게 기록될까요?
                            2000년대에 역사적으로 가장 의미 있는 사건을 뽑아주세요!
                        </div>

                        <h2 className="info_tit txt_ls">
                            <label for="applyContent2" className="bl">답변</label>
                        </h2>

                        <div className="input_wrap">
							<textarea
                                name="applyContent2"
                                id="applyContent2"
                                cols="1"
                                rows="10"
                                maxLength="500"
                                value={this.state.step}
                                onChange={this.setApplyContent}
                                placeholder="100자 까지 입력하실 수 있습니다."
                                className="textarea">
							</textarea>
                            <div className="count_wrap mb25">
                                <p className="count">(<span>{this.state.stepLength}</span>/100)</p>
                            </div>
                        </div>

                        <div className="acco_notice_list">
                            <a href="#" className="acco_notice_link active">
                                <span className="acco_notice_tit info_tit pb0">
                                    개인정보 수집 및 이용동의
                                </span>
                            </a>
                            <div className="acco_notice_cont mt10">
                                <ul className="policy">
                                    <li>- 이용목적 : 경품 발송</li>
                                    <li>- 수집하는 개인정보 : 성명, 연락처</li>
                                    <li>- 개인정보 보유 및 이용기간 : 이용목적 달성 시 즉시 파기</li>
                                    <li>- 수집하는 개인정보의 취급위탁 : 이벤트 경품발송을 위해 개인정보(연락처)를 배송업체에 취급 위탁 <br/>(㈜다우기술-사업자:220-81-02810)</li>
                                </ul>
                                <p>선생님께서는 개인정보의 수집 및 이용, 취급 위탁에 대한 동의를 거부할 수 있습니다. 단, 동의를 거부할 경우 신청이 불가합니다.
                                </p>
                            </div>
                            <div className="checkbox_circle_box mt10">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    onChange={this.handleChange}
                                    checked={event.agree}
                                    className="checkbox_circle checkbox_circle_rel"
                                    id="join_agree01" />
                                <label
                                    htmlFor="join_agree01"
                                    className="checkbox_circle_simple">
                                    <strong className="checkbox_circle_tit">
                                        본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.
                                    </strong>
                                </label>
                            </div>
                        </div>
                        <button
                            onClick={this.applyButtonClickSafe}
                            className="btn_full_on mt35">신청하기</button>
                    </div>
                </div>
            </section>

        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
