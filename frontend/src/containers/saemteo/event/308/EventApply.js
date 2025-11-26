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
                                    친구들과 칭찬 샤워할까?<br></br>
                                    <span>김희정 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>
                                    친구야, 너는 어떤 친구를 원하니?<br></br>
                                    <span>김희정 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>
                                    내가 좋아하는 과목으로 배움 지도를 만들자!<br></br>
                                    <span>김희정 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>
                                    친구가 되는 멋진 방법은 무엇일까?<br></br>
                                    <span>이범석 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>
                                    우리반 친구들과 책으로 인사하기<br></br>
                                    <span>서은석 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>
                                    너도 나도 손! 온라인으로 만나는 우리 반 친구<br></br>
                                    <span>김영미 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>
                                    우리 함께 꿈나무를 만들어 볼까요?<br></br>
                                    <span>곽현경 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>
                                    퀴즈로 만나는 우리 학교 우리 반 친구들<br></br>
                                    <span>이윤희 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>
                                    친구들과 인생 그래프 나누기<br></br>
                                    <span>이동규 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>
                                    사랑과 꿈으로 시작하는 너와 나<br></br>
                                    <span>한국화 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>11</td>
                                <td>
                                    새로운 친구들과 우리 반 대표 미덕 정하기<br></br>
                                    <span>윤승희 선생님</span>
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
