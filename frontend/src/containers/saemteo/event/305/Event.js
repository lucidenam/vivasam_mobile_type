import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            eventApplyCheck : 1,
            eventAmount1: 1,
            eventAmount2: 1
        };
        this.eventCheckAmount();
    }

    // 이벤트 수량 검사 ( 이벤트 수량 마감시 작업 불가능 )
    eventCheckAmount = async() => {
        const { eventAnswer, eventId , SaemteoActions} = this.props;
        const params1 = {};
        params1.eventId = eventId; // 이벤트 ID
        try {
            // 국어 독서 기본
            params1.seq = 3;
            params1.eventType = 3;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                await this.setState({eventAmount1: 0});
            }
        }catch(e){await this.setState({eventAmount1: 0});}

        try {
            // 국어 문학 기본
            params1.seq = 4;
            params1.eventType = 4;
            let response1 = await SaemteoActions.chkEventJoinQntCnt({...params1});
            let response2 = await api.eventCheckLimitAmount({...params1});
            let chkQntCnt = response2.data.eventTotCnt - response1.data.qntCnt;
            if (chkQntCnt <= 0) { // 해당된 수량만큼 제한
                await this.setState({eventAmount2: 0});
            }
        }catch(e){await this.setState({eventAmount2: 0});}

        if(this.state.eventAmount1 == 0 && this.state.eventAmount2 == 0){
            await this.setState({eventApplyCheck: 0});
        }
    };


    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick, loginInfo } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck == 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            try {
                this.eventCheckAmount();
                if(this.state.eventApplyCheck === 0){
                    common.error("수활북 신청 수량이 마감되었습니다.");
                }else{
                    event.eventId = eventId; // 이벤트 ID
                    const response = await api.eventInfo(eventId);
                    if(response.data.code === '3'){
                        common.error("이미 신청하셨습니다.");
                    }else if(response.data.code === '0'){
                        handleClick(eventId);
                    }else{
                        common.error("신청이 정상적으로 처리되지 못하였습니다.");
                    }
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    render () {
        return (
            <section className="event200710">
                <div className="cont">
                    <h1><img src="images/events/2020/event200710/img.jpg" alt="수·활·북 신청 이벤트"/></h1>
                    <div className="blind">
                        <h1>중학교 역사 ①/② 수·활·북을 보내드립니다</h1>
                            역사 수업에 바로 활용하는 워크북!<br/>
                            다양한 수업 자료와 활동지, 역사 특화 자료로 선생님의 역사 수업을 더욱 풍성하게 만들어 보세요.<br/><br/>

                        신청 기간 │ 2020년 7월 20일 ~ 8월 7일<br/>
                        * 선착순으로 조기 마감될 수 있습니다.<br/>
                        * 7월 31일부터 순차적으로 발송됩니다.

                        <dl>
                            <dt>역사 선생님을 위한
                                수업에 바로 활용하는 워크북</dt>
                            <dd>차시별 개념 정리, 평가 문제를 수록합니다.</dd>
                            <dd>교과서 내 활동 과제 해결과 과정 평가를 위한 활동지를 제공합니다.</dd>
                            <dd>수업용 백지도 및 연표 등 역사 특화 자료를 담았습니다.</dd>

                            <dd>* 역사 수활북 PDF는 교과서 자료실에서 무료로 다운로드 받으실 수 있습니다.
                            </dd>
                        </dl>
                        <ul>
                            <li>백지도</li>
                            <li>수행 평가 활동지</li>
                            <li>활동책</li>
                        </ul>
                    </div>

                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}>
                        <span>신청하기</span>
                    </button>
                    <dl className="blind">
                        <dt>신청 시 유의사항</dt>
                        <dd>① 정확하지 않은 주소로 인해 반송된 자료집은 재발송되지 않습니다.
                            학교 번지수 및 수령처를 정확히 기재해 주세요.</dd>
                        <dd>
                            ② 배송에 필요한 정보는 서비스 업체에 공유됩니다.
                            (성명, 주소, 휴대전화번호 등 / ㈜한진 – 사업자등록번호 : 201-81-02823)
                        </dd>
                    </dl>


                </div>
            </section>
        )
    }
}



export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;
