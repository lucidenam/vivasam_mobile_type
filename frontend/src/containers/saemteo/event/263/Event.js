import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            agreeCheck : 0, // 개인정보 체크
            eventApplyCheck : 0 // 0 : 신청 불가능 / 1 : 신청 가능
        };
        this.eventCheckAmount();
    }

    // 이벤트 수량 검사 ( 이벤트 수량 마감시 작업 불가능 )
    eventCheckAmount = async() => {
        const { event, eventId, SaemteoActions } = this.props;
        event.eventId = eventId; // 이벤트 ID
        let response = await SaemteoActions.googleSurveyCountCheck({...event});
        if(response.data.eventAnswerCount < 200){ // 해당된 수량만큼 제한
            this.setState({
                eventApplyCheck : 1
            });
        }
    };

    // 개인정보 선택
    updateAgreeCheckChange = () => {
        this.setState({
            agreeCheck:!this.state.agreeCheck
        });
    };

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{ // 로그인시
            if(this.state.agreeCheck == 0){
                common.info("개인정보 수집 및 이용에 동의해 주세요.");
                return;
            }else{
                this.getEventInfo(eventId);
            }
        }
    };

    getEventInfo = async(eventId) => {
        const { history, event, SaemteoActions } = this.props;
        const response = await api.eventInfo(eventId);
        if(response.data.code && response.data.code === "0"){
            event.eventId = eventId;
            let {memberId, name} = response.data.memberInfo;
            event.memberId = memberId;
            event.userName = name;
            // 해당 이벤트는 Amount 가 1개이므로 여기서 등록
            event.amount = 1;
            event.inputType = '구글설문참여';
            event.eventAnswerDesc = event.inputType + '/' +event.memberId + '/' +event.userName;
            SaemteoActions.pushValues({type:"event", object:event});
            try {
                this.insertApplyForm();
            } catch (e) {
                console.log(e);
            }
        }else {
            history.push('/saemteo/index');
        }
    };

    //신청
    insertApplyForm = async () => {
        const { event, SaemteoActions, BaseActions } = this.props;
        try {
            BaseActions.openLoading();
            let response = await SaemteoActions.insertGoogleEventApply({...event});
            if(response.data.code === '0'){
                if(!navigator.userAgent.match(/Android|Mobile|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/)){
                    window.open("https://forms.gle/7CTvrdNnsFgypo5f7", "_blank");
                }else{
                    window.location.href = "https://forms.gle/7CTvrdNnsFgypo5f7";
                }
            }else if(response.data.code === '4'){
                common.error("참여 인원이 마감되었습니다.");
            }else{
                common.error("참여가 정상적으로 처리되지 못하였습니다.");
            }
        } catch (e) {
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    render () {
        return (
			<section className="event191028">
				<h1><img src="/images/events/2019/event191028/img.jpg" alt="비상교육 초등 교수자료 개발을 위한 설문 (수업도구 조사)" /></h1>
				<div className="blind">
					<dl>
						<dt>설문 기간</dt>
						<dd>2019년 10월 28일(월) ~ 선착순 마감</dd>
						<dt>참여 대상</dt>
						<dd>초등학교 선생님</dd>
						<dt>참여 선물</dt>
						<dd>설문 참가자 전원(200명) / 스타벅스 카페라떼 캔커피 기프티콘</dd>
					</dl>
				</div>
				<div className="cont_top">
					<p>
						안녕하세요.<br />
						저희 비상교육에서는 수업 시간에 활용할 수 있는 다양한 디지털 <br />수업도구를 제공하고 있습니다.
						<br />
						이에 대한 개선안을 찾고자 선생님들께 설문을 실시하게 되었습니다.
					</p>
					<p>
						본 설문은 <em>수업용 차시별 플래시 자료와, 수업도우미(타이머, <br />발표도우미, 자리바꾸기), 퀴즈 툴 등의 수업 도구에 대한 선생님들의 <br />사용성</em>을 알아보는 조사로, 향후 비상교육에서 개발할 콘텐츠와 <br />서비스의 기초 자료가 될 것입니다.
					</p>	 
					<p>본 설문을 통해 보내주신 의견 하나하나 소중한 자료로 활용하고자 <br />하오니 잠시 시간을 내시어 설문에 참여해주시면 대단히 <br />감사하겠습니다. </p>
					<div className="noti">
						선생님의 응답은 통계적 목적 외의 다른 용도로 사용되지 않으며, <br />응답 내용과 관련된 개인적인 신상이나 의견은 외부로 유출되지 않습니다. 
					</div>
				</div>
				<dl className="agree_info">
					<dt>개인정보 수집 및 이용 동의</dt>
					<dd>
						<ul>
							<li>- 이용목적 : 설문결과 분석 및 경품 발송</li>
							<li>- 수집하는 개인정보 : 성명, 휴대전화번호, 학교, 담당 학년</li>
							<li>- 개인정보 보유 및 이용기간 : 이용목적 달성 시 즉시 파기</li>
							<li>- 수집하는 개인정보의 취급 위탁 : 경품 발송을 위해 휴대전화번호 <br />정보를 기프티콘 발송 업체에 취급 위탁 <br />(㈜다우기술-사업자:220-81-02810)</li>
						</ul>
					</dd>
				</dl>
				<p className="agree">
                    <input type="checkbox" id="infoCheck01" value="" className="checkbox"
                           checked={this.state.agreeCheck == 1}
                           onChange={this.updateAgreeCheckChange}/>
					<label for="infoCheck01"><span>본인은 개인정보 수집 및 이용 내역을 확인하였으며, 이에 동의합니다.</span></label>
				</p>

				<div className="btn_wrap">
					<button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}>참여하기</button>
				</div>

				<div className="info">
					<h2>유의사항</h2>
					<ul>
						<li>- 설문은 1인 1회만 참여 가능합니다.</li>
						<li>- 문의사항은 고객센터로 연락 주시기 바랍니다. <br />(선생님 전용 고객센터 : 1544-7714)</li>
						<li>- 연락처가 불명확하여 기프티콘이 반송된 경우 재발송하지 않습니다.<br />개인 정보를 정확히 입력해 주세요.</li>
					</ul>
				</div>
			</section>
        )
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
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
