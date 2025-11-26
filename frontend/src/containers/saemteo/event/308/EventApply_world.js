import React, { Component,Fragment } from 'react';
import './Event.css';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as SaemteoActions from 'store/modules/saemteo';
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
        phoneCheckMessage: '',
        phoneCheckClassName: '',
        telephoneCheck: false
    };

    componentDidMount(){
        const {eventId , eventAnswer , history } = this.props;
        // 응답 문항이 NULL이거나 undefined인 경우 이전페이지로 돌려야함
        if((eventAnswer.eventAnswerContent.Q1 == null) || (typeof eventAnswer.eventAnswerContent.Q1 == "undefined")
            || (eventId == null) ||  (typeof eventId == "undefined")){
            common.error("선택(입력)정보가 없습니다. 다시 선택(입력) 해주세요.");
            history.push('/saemteo/event/view/'+eventId);
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
            let {memberId, name, email, schName, schZipCd, schAddr} = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            event.agree = false;
            event.schName = schName;
            event.schZipCd = schZipCd;
            event.schAddr = schAddr;
            event.inputType = '개인정보 불러오기';
            event.userInfo = 'Y';
            event.cellphone = '';
            event.applyCnt = '';
            SaemteoActions.pushValues({type:"event", object:event});
            this.setState({
                eventInfo: eventInfo,
                initialSchName: schName,
                initialSchZipCd: schZipCd,
                initialSchAddr: schAddr
            });

        } else if(response.data.code && response.data.code === "3"){
            common.info("이미 신청하셨습니다.");
            history.replace(history.location.pathname.replace('apply','view'));
        } else {
            history.push('/saemteo/index');
        }
    };


    applyButtonClick = (target) => {
        target.disabled = true;
        const { event, history, SaemteoActions, eventAnswer, eventId } = this.props;
        let obj = this.validateInfo();
        if(!obj.result){
            common.error(obj.message);
            target.disabled = false;
            return false;
        }
        try {
            // 넘어갈때 오류가 생겼을 수 있으므로 다시 선택하게 요청
            if(eventAnswer.eventAnswerContent.Q1 == ""){
                common.info("선택(입력)정보가 없습니다. 다시 선택(입력) 해주세요.");
                history.push('/saemteo/event/view/'+eventId);
                return false;
            }

            if(event.applyCnt == 0 || event.applyCnt.trim() == ''){
                common.info("신청수량을 입력해주세요.");
                return false;
            }

            if(event.applyCnt > 30){
                common.info("신청수량은 최대 30권 입니다.");
                return false;
        }
            // 수량체크
            this.checkEventAmout();
        } catch (e) {
            console.log(e);
        }
    };
4

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
	                    <h3>오늘 뭐하지 시즌1</h3>
                    </div>
                </div>
                <div className="vivasamter_apply">
                    <button>PDF 다운로드</button>
                    <table id="simple-board">
                        <thead>
                            <th>순서</th>
                            <th>수업목록</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>
                                    우리를 행복하게 해주는 말<br></br>
                                    <span>정유화 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>
                                    북극곰 엉덩이 불끄기<br></br>
                                    <span>임혜선 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>
                                    신호등 토론으로 공정한 학급 만들기<br></br>
                                    <span>박은미 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>
                                    내가 지켜줄게, 지구야!<br></br>
                                    <span>최수연 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>
                                    나의 꿈으로 내가 만들어 가는 세상<br></br>
                                    <span>박혜수 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>
                                    내가 이름 지은 길을 걸으면 어떤 기분일까?<br></br>
                                    <span>박현진 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>
                                    불만을 감사로 바꾸면 세상이 바뀌어요<br></br>
                                    <span>이재현 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>
                                    북극곰과 함께 살 수 있는 방법은 없을까?<br></br>
                                    <span>김진원 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>
                                    두근두근 세계 여행 한마당<br></br>
                                    <span>임혜선 선생님</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(EventApply));
