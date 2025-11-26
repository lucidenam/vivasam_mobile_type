import React, { Component } from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import { withRouter } from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import { bindActionCreators } from "redux";

class Event extends Component{

    state = {
        popState: false,
        isEventApply: false,
    }
    
    componentDidMount = async() => {
        const { BaseActions } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
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

    // UI
    onPop = () => {
        const { popState } = this.state;
        
        this.setState({
            popState: !popState
        });
    }

    render () {
        const { popState } = this.state;

        return (
			<section className="event210514">
                <div className="evtBannerWrap">
                    <button type="button" className={`btnBannerPop ${ popState ? 'on' : ''}`} onClick={ this.onPop }><img src="/images/events/2021/event210514/btn_banner.jpg" alt="초등 비바샘 100일간의 동행에 함께하세요!" /></button>
                    <div className="evtBannerPop" style={{ display: popState ? 'block' : 'none' }}>
                        <div className="dimed"></div>
                        <div className="evtBannerCont">
                            <div className="ani">
                                {/* bg 이미지 월마다 경로 변경됨 */}
                                <img src="/images/events/2021/event210514/bg_pop.png" alt="" className="bg" />
                                {/* 3월, 4월 (335, 343 참고) */}
                                {/* 5월 */}
                                <div className="may">
                                    <img src="/images/events/2021/event210319/ani/may_on.png" alt="5월 동행 3탄 우리동네 매력뿜뿜 챌린지" className="on" />
                                    <span className="tip">선생님<br />사진이<br />작가관에!</span>
                                </div>
                                <span className="roadOn"></span>
                                {/* 5월 */}
                                
                                {/* OPEN */}
                                <div className="open">
                                    <span className="openpop01"></span>
                                    <span className="openpop02"></span>
                                    <span className="openpop03"></span>
                                    <span className="openpop04"></span>
                                    <span className="openpop05"></span>
                                    <span className="openpop06"></span>
                                    <span className="openpop07"></span>
                                    <span className="openpop08"></span>
                                    <span className="openpop09"></span>
                                </div>
                                {/* OPEN */}
                            </div>
                            <div className="blind">
                                <strong>초등 비바샘 100일간의 동행</strong><p>초등 비바샘을 기다리며, 선생님과 즐거운 동행을 이어갑니다.</p>
                            </div>
                            <button type="button" className="btnEvtPopClose" onClick={ this.onPop }><span className="blind">팝업 닫기</span></button>
                        </div>
                    </div>
                </div>
                <div className="evtCont01">
                    <h1><img src="/images/events/2021/event210514/main_tit.png" alt="초등 비바샘, 100일 간의 동행 3탄. 비바샘 사진작가 공모전 우리동네 매력뿜뿜 챌린지" /></h1>
                    <p>선생님이 직접 찍은 우리동네 사진을 올려주세요!<br />수상하신 선생님의 작품은 6월에 오픈되는<br />초등 비바샘 사이트를 통해전국의 선생님들께 공유되며,<br /><strong>별도의 작가관</strong>도 만들어집니다.</p>
                    <ul>
						<li>
							<span className="labelTit"><em className="blind">응모 기간</em></span>
							<p>2021.05.14(금) ~ 05.31(월)</p>
						</li>
						<li>
							<span className="labelTit"><em className="blind">당첨자 발표</em></span>
							<p>2021.06.08(화)</p>
						</li>
					</ul>
                </div>
                <div className="evtCont02">
                    <div className="evtInfoWrap">
						<div className="infoItem">
                            <span className="labelTit"><em className="blind">출품 주제</em></span>
                            <div className="itemCont">
                                <p className="bulCircle">우리동네 의미 있는 그 곳</p>
                                <p className="bulCircle">수업에 다양하게 활용 가능한 주제의 사진</p>
                                <ul className="infoList">
                                    <li>관공서, 주요 상가/시장, 주요 역/정류장, 교량, 터널 등</li>
                                    <li>유물/유적지, 의미가 담긴 거리 모습</li>
                                    <li>산, 강, 하천 외 지형적 특성이 있는 자연 환경</li>
                                    <li>우리동네만의 축제, 특이한 시설물</li>
                                    <li>그밖에 우리동네에서 자주 만나는 친근한 풍경들</li>
                                </ul>
                            </div>
						</div>
						<div className="infoItem">
                            <span className="labelTit"><em className="blind">출품 방법</em></span>
                            <div className="itemCont">
                                <p>1개 지역 선택하여 + 사진 모음(ZIP) 파일을 올려주세요.</p>
                                <p className="icoChk">꼭 읽어주세요!</p>
                                <ul className="infoList">
                                    <li>선택한 지역의 <strong>여러 장소 + 여러 장</strong>의 사진을 응모하실 수 있습니다.</li>
                                    <li>응모 횟수에 제한이 없으므로, <strong>지역별로 나누어 응모</strong>하실 수 있습니다.</li>
                                    <li><strong>1MB 이상의 컬러 사진</strong>만 응모 가능하며, 1회당 용량 제한은<br />100MB입니다.</li>
                                    <li>이미지 이름 : <strong>지역 + 촬영 장소/내용 + 성명</strong><br />예시 : [강원] 강릉시_강릉 우체국_홍길동.jpeg</li>
                                    <li>저작권 및 초상권 문제가 있는 사진은 응모할 수 없습니다.</li>
                                </ul>
                            </div>
						</div>
						<div className="infoItem">
                            <span className="labelTit"><em className="blind">시상</em></span>
                            <div className="itemCont">
                                <p><strong>1등~입상작</strong> 중 사진을 선별하여, <strong>선생님의 이름으로</strong><br />초등 비바샘 사이트에 사진이 탑재됩니다.<br />1~3등 선생님은 별도의 <strong className="icoCamera">작가관</strong>이 만들어 집니다.</p>
                                <span className="infoTxt">수상자의 사진 출품비는 응모하신 사진 중 일부를 선별하여 지급해 드립니다.</span>
                                <span className="infoTxt">출품비를 지급한 사진만 초등 비바샘 사이트에 탑재됩니다.</span>
                            </div>
							<div className="evtGift">
								<ul class="blind">
									<li>
										<p>1등 1명. 포토프린터 +<br />선별된 사진 1장당 1만원</p>
									</li>
									<li>
										<p>2등 3명. 스마트폰 삼각대 겸 셀카봉 +<br />선별된 사진 1장당 1만원</p>
									</li>
									<li>
										<p>3등 20명. 스타벅스 커피 +<br />선별된 사진 1장당 1만원</p>
									</li>
									<li>
										<p>입상. 선별된 사진 1장당<br />1만원</p>
									</li>
								</ul>
							</div>
						</div>
					</div>
                    <p className="txt">※ 본 공모전은 비바샘 PC 웹페이지에서 응모 가능합니다.</p>
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
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
