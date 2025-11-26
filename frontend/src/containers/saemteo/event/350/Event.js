import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import * as myclassActions from 'store/modules/myclass';
import {bindActionCreators} from "redux";

const eventOptions = [
    {id:1, valTxt:'서울특별시', eventType: '3'},
    {id:2, valTxt:'인천광역시', eventType: '4'},
    {id:3, valTxt:'대전광역시', eventType: '5'},
    {id:4, valTxt:'대구광역시', eventType: '6'},
    {id:5, valTxt:'부산광역시', eventType: '7'},
    {id:6, valTxt:'울산광역시', eventType: '8'},
    {id:7, valTxt:'광주광역시', eventType: '9'},
    {id:8, valTxt:'제주특별자치도', eventType: '10'}
];

class Event extends Component{

    state = {
        isEventApply: false,    // 신청여부
        allAmountFull: true,       // 전체 경품 소진여부
        rdoAmountFull: [true, true, true, true, true, true, true, true],      // 경품 소진 여부
        rdoChecked: -1          // 선택된 경품 idx
    }
    
    componentDidMount = async() => {
        const { BaseActions, SaemteoActions } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
            await this.eventAmountCheck();
        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };
    
    eventApplyCheck = async() => {
        const { logged, eventId, event } = this.props;
        if(logged){
            event.eventId = eventId; // 이벤트 ID
            const response = await api.eventInfo(eventId);
            if(response.data.code === '3'){
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    eventAmountCheck = async() => {
        const { SaemteoActions, eventId} = this.props;
        let { allAmountFull } = this.state;
        let params1 = {};
        params1.eventId = eventId; // 이벤트 ID

        let rdoAmountFullArr = [];
        try {
            // 경품 신청가능 수량 조회
            const response = await SaemteoActions.chkEventRemainsQntCnt({...params1});
            const responseData = response.data;

            for (let i=3,size=10; i<=size; i++) {
                const isRdoAmountFull = responseData['qntCnt_'+i] <= 0;
                rdoAmountFullArr.push(isRdoAmountFull); //
                // 하나의 경품이라도 full이 아니면 전체경품 소진된것이 아니므로 나머지 경품중 신청가능
                if (!isRdoAmountFull) {
                    allAmountFull = false;
                }
            }

        } catch (e) {
            console.log(e);
            // 조회 실패시 모든 경품 신청불가하도록 신청수량 꽉참으로 표시
            for (let i=3,size=10; i<=size; i++) {
                rdoAmountFullArr.push(true); //
            }
        }

        this.setState({
            allAmountFull: allAmountFull,
            rdoAmountFull: rdoAmountFullArr
        });
    }

    eventApply = async () => {
        const { logged, history, BaseActions, SaemteoActions, event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
        const { allAmountFull, rdoChecked } = this.state;

        if(allAmountFull){
            common.info('준비한 선물이 모두 소진되었습니다.');
            return false;
        }

        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{

            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel !== 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다");
                    return false;
                }

                // 초등대상 이벤트 초등학교 선생님이 아닌경우 알럿
                let myClassInfo = await this.getMyClassInfo();
                let schoolLvlCd = myClassInfo.schoolLvlCd;
                if(schoolLvlCd !== 'ES') {
                    common.info("초등학교 선생님 대상 이벤트 입니다.");
                    return false;
                }

                if (rdoChecked < 0) {
                    common.info("신청하실 광역 지도 세트를 선택해주세요");
                    return;
                }

                const eventAnswer = {
                    eventAnswerDesc: eventOptions[rdoChecked].valTxt,
                    rdoChecked: eventOptions[rdoChecked].eventType
                };

                SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                handleClick(eventId);    // 신청정보 팝업으로 이동

            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    }

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;
        try {
            let result = await MyclassActions.myClassInfo();
            return result.data;
        } catch (e) {
            console.log(e);
        }
    }

    contentOnChange = (itemIdx) => {
        const { rdoAmountFull } = this.state;
        // 신청 가능할 경우만 체크상태 변경
        if (!rdoAmountFull[itemIdx]) {
            this.setState({
                rdoChecked: itemIdx
            })
        }
    }

    render () {
        const {rdoAmountFull, rdoChecked} = this.state;

        return (
			<section className="event210617">
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210617/img01.png" alt="초등학교 선생님을 위한 광역 지도 세트를 보내드립니다." /></h1>
                    <div className="blind">
                        <p>전국 광역 8종 중<br />원하는 지역을 선택하시면<br />지도 세트를 학교로 보내드립니다.</p>
                        <p>지역별 5매 한 세트 구성으로,<br />모둠 활동에도 유용하게 활용하실 수 있습니다.</p>
                        <span>지퍼 케이스에 담겨 보관이 용이합니다!</span>
                    </div>
                    <span className="period">신청기간<em>2021</em>년 <em>6</em>월 <em>17</em>일 ~ <em>29</em>일</span>
                    <div className="blind">
                        <span>비상교육 지사를 통해 순차적으로 발송됩니다.</span>
                        <span>선착순<br />마감</span>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="evtFormWrap">
                        <ul className="rdoList">
                            {
                                eventOptions.map( (item, idx) => {
                                    let imgUrl;
                                    if (rdoAmountFull[idx]) {
                                        imgUrl = '/images/events/2021/event210617/bg_rdo0' + (idx+1) + '_disabled.png';
                                    } else {
                                        imgUrl = '/images/events/2021/event210617/bg_rdo0' + (idx+1) + '.png';
                                    }
                                    return(
                                        <li key={`evtRdo${idx}`}>
                                            <input type="radio" name="rdo" id={`rdo${idx}`} value={ item.valTxt }  disabled={rdoAmountFull[idx]} checked={rdoChecked === idx} onChange={() => this.contentOnChange(idx)} />
                                            <label htmlFor={`rdo${idx}`}><img src={imgUrl} alt="" /><span>{ item.valTxt }</span></label>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <p>전국 도 단위 지도가 2021. 8월에 추가로 제작됩니다!</p>
                    </div>
                    <div className="btnWrap">
                        <button type="button" onClick={ this.eventApply } className="btnApply"><span className="blind">신청하기</span></button>
                    </div>
                </div>
                <div className="evtCont03">
                    <p className="subTit"><span className="blind">신청 시 유의사항</span></p>
                    <ul>
                        <li><strong>1인 1세트(지도5매)만</strong> 신청 가능합니다.</li>
                        <li><strong>선착순 신청</strong>으로, 수량 소진 시 조기 마감될 수 있습니다.<br />(비상교육 지사를 통해 순차 발송)</li>
                        <li>정확한 주소를 기입해주세요. (학교 주소, 수령처 포함 : ex. 교무실, 진로상담실, 행정실, 학년 반, 경비실 등)</li>
                        <li>주소 기재가 잘못되어 반송된 지도는 다시 발송해드리지 않습니다</li>
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
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(Event));
