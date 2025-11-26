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
                                    □△○ 찍기 놀이 할까?<br></br>
                                    <span>오득빈 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>
                                    덧셈과 뺄셈으로 나만의 작품을 만들자!<br></br>
                                    <span>오득빈 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>
                                    펜토미노 12조각을 밀고 돌리고 뒤집어라!<br></br>
                                    <span>최종희 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>
                                    실생활 수학 프로젝트<br></br>
                                    <span>이영배 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>
                                    구구단, 이제 노래와 게임으로 배우자!<br></br>
                                    <span>이영배 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>
                                    빅데이터로 우리 학교 환경 문제 해결하기<br></br>
                                    <span>김흥연 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>
                                    로봇 얼굴 맞추기 게임<br></br>
                                    <span>정유화 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>
                                    강당에서 찾은 수학 책상에서 찾은 수학<br></br>
                                    <span>박지웅 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>
                                    내가 만드는 택택 놀이<br></br>
                                    <span>박지웅 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>
                                    머리셈으로 수학과 친해져 볼까?<br></br>
                                    <span>박재연 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>11</td>
                                <td>
                                    소마큐브로 입체도형을 탐구해 볼까?<br></br>
                                    <span>이범석 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>12</td>
                                <td>
                                    짝짓기 게임으로 나눗셈과 친해지기<br></br>
                                    <span>신재훈 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>13</td>
                                <td>
                                    독가스가 퍼진 교실을 탈출할 수 있을까?<br></br>
                                    <span>유현규 선생님</span>
                                </td>
                            </tr>
                            <tr>
                                <td>14</td>
                                <td>
                                    속도와 밀도를 구하면 암호가 보인다!<br></br>
                                    <span>유현규 선생님</span>
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
