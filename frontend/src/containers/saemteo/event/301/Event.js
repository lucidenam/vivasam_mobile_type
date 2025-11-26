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
           eventApplyCheck : 1 // 0 : 신청 불가능 / 1 : 신청 가능
        };
        this.eventCheckAmount();
    }

    // 이벤트 수량 검사 ( 이벤트 수량 마감시 작업 불가능 )
    eventCheckAmount = async() => {
        const { event, eventId, SaemteoActions } = this.props;

    };


    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            try {
                this.eventCheckAmount();
                if(this.state.eventApplyCheck === 0){
                    common.error("향균 미니 포스터 신청 수량이 마감되었습니다.");
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
            <section className="event200601">
                <div className="cont">
                    <h1><img src="images/events/2020/event200601/img.jpg" alt="우리반 지킴이, 향균 미니 포스터를 보내드립니다."/></h1>
                    <div className="blind">
                        <h1>우리반 지킴이, 향균 미니 포스터를 보내드립니다.</h1>
                        <p>비상교육이 선생님과 학생들의 건강한 학교생활을 위해
                            특수 제작한 교실용 항균 미니 포스터를 보내드립니다.

                            학생들과 응원 메시지를 나누며,
                            교실을 건강하게 꾸며보세요.
                        </p>
                        <p>· 신청 기간 :  2020년 6월 5일(금) ~ 6월 14일(일) / 선착순 마감
                        </p>
                        <p>※ 포스터 1종에 최대 5매씩 신청 가능<br/>
                            ※ 6월 10일 부터 순차 발송
                        </p>
                        <ul>
                            <li>우리는 모두 친구!
                            </li>
                            <li>너의 꿈은 꼭 이루어질 거야!
                            </li>
                        </ul>
                        <dl>
                            <dt>우리 반 지킴이 항균 미니 포스터는?</dt>
                            <dd>- A3 사이즈(29.7cm x 42cm)</dd>
                            <dd>- 공기 정화, 탈취, 항균 기능이 있는 특수 원단으로 제작되었습니다.</dd>
                            <dd>- 일반 도화지보다 얇으며, 현수막과 같은 원단 재질입니다.</dd>
                            <dd>- 포스터를 손으로 터치하면 손에 있는 세균을 즉시 흡입하여 분해합니다.</dd>
                        </dl>
                    </div>
                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}>
                        <span>신청하기</span>
                    </button>
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
