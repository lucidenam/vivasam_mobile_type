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

        if(this.state.eventAmount1 == 0){
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
                if(this.state.eventApplyCheck == 0){
                    common.error("신청 가능한 수량이 모두 소진되었습니다.");
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
            <section className="event200716">
                <div className="cont">
                    <h1><img src="images/events/2020/event200716/img.jpg" alt="한눈에 보는 한국사·세계사 역사 연표 브로마이드"/></h1>
                    <div className="blind">
                        선생님과 함께 만드는 역사의 힘 7탄

                        <h4>한눈에 보는 한국사·세계사 역사 연표 브로마이드</h4>

                        초·중·고등학교 어디에나 활용할 수 있는 역사 연표를 보내드립니다.<br/>
                        기원전부터 현대에 이르기까지의 역사 흐름을 주요 사건과 이미지로 한눈에 파악할 수 있습니다.<br/>

                        2020년 7월 22일 ~ 8월 7일<br/>
                        * 7월 말부터 순차적 발송<br/>

                        선착순 마감<br/>

                        <h5>비상교육 역사 연표 브로마이드</h5>
                        <ul>
                            <li>기원전~현대까지 주요 사건을 이미지와 함께 한눈에!</li>
                            <li>한국사/세계사 교과서의 주요 내용을 한 장의 연표로 쏙쏙!</li>
                            <li>교실 수업에 딱 맞는 가독성 높은 사이즈와 디자인!</li>
                        </ul>
                    </div>

                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply}>
                        <span>신청하기</span>
                    </button>
                    <dl className="blind">
                        <dt>신청 시 유의사항</dt>
                        <dd>① 정확하지 않은 주소로 인해 반송된 물품은 재발송되지 않습니다.
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
