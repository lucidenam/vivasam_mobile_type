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
import { PlayState, Timeline, Tween } from 'react-gsap';

class Event extends Component{

    state = {
        popState: false,
        videoPlay: false,
        isOneOpen: true
    }

    componentDidMount = async() => {
        let today = new Date();
        let chkStartDate = new Date(2021, 3, 17, 0);

        let isOneOpen = true;
        if(today.getTime() >= chkStartDate.getTime()){
            isOneOpen = false;
        }
        this.setState({isOneOpen: isOneOpen});
    }


    onPop = () => {
        const { popState } = this.state;
        
        this.setState({
            popState: !popState
        });
    }

    onVideo = () => {
        const { videoPlay } = this.state;

        this.setState({
            videoPlay: !videoPlay,
        })
        this.refs.vidRef.play();
    }

    render () {
        const { popState, isOneOpen } = this.state;

        return (
			<section className="event210319">
                <div className="evtBannerWrap">
                    <button type="button" className={`btnBannerPop ${ popState ? 'on' : ''}`} onClick={ this.onPop }><img src="/images/events/2021/event210319/btn_banner.jpg" alt="초등 비바샘 100일간의 동행에 함께하세요!" /></button>
                    <div className="evtBannerPop" style={{ display: popState ? 'block' : 'none' }}>
                        <div className="dimed"></div>
                        <div className="evtBannerCont">
                            <div className="ani">
                                <img src="/images/events/2021/event210319/ani/bg_pop.png" alt="" className="bg" />
                                {/* 3월 1탄 오픈 */}
                                {   isOneOpen &&
                                    <div className="march">
                                        <img src="/images/events/2021/event210319/ani/march_on.png" alt=""
                                             className="on"/>
                                        <Timeline
                                            repeat={-1}
                                            playState={!popState ? PlayState.stop : PlayState.play}
                                        >
                                            <Timeline
                                                target={
                                                    <img src="/images/events/2021/event210319/ani/march_leaf.png" alt=""
                                                         className="leaf01"/>
                                                }
                                                playState={!popState ? PlayState.stop : PlayState.play}
                                            >
                                                <Tween from={{x: 0, y: 0, rotation: '0'}}
                                                       to={{x: '3.5vw', y: '5vw', rotation: '-20'}} duration={.9}
                                                       ease='power1.inOut'/>
                                                <Tween to={{x: '2.5vw', y: '6vw', rotation: '-10'}} duration={1.1}
                                                       ease='power1.inOut'/>
                                                <Tween to={{x: '6vw', y: '10.5vw', rotation: '0'}} duration={1}
                                                       ease='power1.inOut'/>
                                                <Tween to={{x: '4vw', y: '14vw', rotation: '-10'}} duration={1.1}
                                                       ease='power1.inOut'/>
                                            </Timeline>
                                            <Timeline
                                                target={
                                                    <img src="/images/events/2021/event210319/ani/march_leaf.png" alt=""
                                                         className="leaf02"/>
                                                }
                                                playState={!popState ? PlayState.stop : PlayState.play}
                                            >
                                                <Tween from={{x: 0, y: 0}} to={{x: '3.5vw', y: '4.5vw'}} delay={.1}
                                                       duration={1} ease='power1.inOut'/>
                                                <Tween to={{x: '2vw', y: '5.5vw'}} duration={1.1} ease='power1.inOut'/>
                                                <Tween to={{x: '6vw', y: '10.5vw'}} duration={1.1} ease='power1.inOut'/>
                                                <Tween to={{x: '3vw', y: '12.5vw'}} duration={1.1} ease='power1.inOut'/>
                                            </Timeline>
                                            <Timeline
                                                target={
                                                    <img src="/images/events/2021/event210319/ani/march_leaf.png" alt=""
                                                         className="leaf03"/>
                                                }
                                                playState={!popState ? PlayState.stop : PlayState.play}
                                            >
                                                <Tween from={{x: 0, y: 0, rotation: '0'}}
                                                       to={{x: '3.5vw', y: '4.5vw', rotation: '-20'}} delay={.2}
                                                       duration={.9} ease='power1.inOut'/>
                                                <Tween to={{x: '2.5vw', y: '5.5vw', rotation: '0'}} duration={1.1}
                                                       ease='power1.inOut'/>
                                                <Tween to={{x: '6vw', y: '8.5vw', rotation: '-20'}} duration={1}
                                                       ease='power1.inOut'/>
                                            </Timeline>
                                            <Timeline
                                                target={
                                                    <img src="/images/events/2021/event210319/ani/march_leaf.png" alt=""
                                                         className="leaf04"/>
                                                }
                                                playState={!popState ? PlayState.stop : PlayState.play}
                                            >
                                                <Tween from={{x: 0, y: 0, rotation: '0'}}
                                                       to={{x: '3.5vw', y: '4.5vw', rotation: '-20'}} delay={.3}
                                                       duration={.9} ease='power1.inOut'/>
                                                <Tween to={{x: '2.5vw', y: '5.5vw', rotation: '0'}} duration={1.1}
                                                       ease='power1.inOut'/>
                                                <Tween to={{x: '6vw', y: '10.5vw', rotation: '-20'}} duration={1}
                                                       ease='power1.inOut'/>
                                            </Timeline>
                                            <Timeline
                                                target={
                                                    <img src="/images/events/2021/event210319/ani/march_leaf.png" alt=""
                                                         className="leaf05"/>
                                                }
                                                playState={!popState ? PlayState.stop : PlayState.play}
                                            >
                                                <Tween from={{x: 0, y: 0, rotation: '0'}}
                                                       to={{x: '3.5vw', y: '4.5vw', rotation: '-20'}} delay={.2}
                                                       duration={.9} ease='power1.inOut'/>
                                                <Tween to={{x: '2.5vw', y: '5.5vw', rotation: '-10'}} duration={1.1}
                                                       ease='power1.inOut'/>
                                                <Tween to={{x: '7vw', y: '10.5vw', rotation: '-20'}} duration={.9}
                                                       ease='power1.inOut'/>
                                                <Tween to={{x: '5vw', y: '12vw', rotation: '-10'}} duration={1.1}
                                                       ease='power1.inOut'/>
                                            </Timeline>
                                        </Timeline>
                                    </div>
                                }
                                {/* 3월 1탄 종료 */}
                                {   isOneOpen == false &&
                                    <div className="march off">
                                        <div className="infoBallon">
                                            <strong className="tit"><span className="blind">3월 동행 1탄</span></strong>
                                            <p className="txt">초등 비바샘,<br/>16번째 선생님은 누구?</p>
                                        </div>
                                        <span className="tip">초등 전문가<br/>선생님을<br/>영상으로<br/>만나보세요.</span>
                                    </div>
                                }
                                {/* 3월 1탄 오픈&종료 공통 */}
                                <span className="roadOn"></span>
                                
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
                    <h1><img src="/images/events/2021/event210319/img01.jpg" alt="초등 비바샘, 100일 간의 동행 1탄. 초등 비바샘의 16번째 선생님은?" /></h1>
                    <p className="blind">
                        6월에 오픈 예정인 초등 비바샘에는<br />15가지 주제별 초등 전문가 선생님과 함께 만든<br />수업 혁신, 창의적 체험활동 채널이 탑재됩니다.<br /><br />
                        <strong>나만의 방식으로 주제별 수업을 하고 계신 선생님,<br />초등 비바샘의 16번째 채널의 주인공이 되어보세요!</strong>
                    </p>
                </div>

                <div className="evtCont02">
                    <div className="evtTit">
                        <h2><span className="blind">초등 비바샘의 전문가 선생님을 미리 만나보세요</span></h2>
                    </div>
                    <div className="evtCont">
                        <div id="tabWrap">
                            {/* [DEV] 2차 영상 오픈 시 노출 */}
                            <div className="btnTabWrap">
                                <button type="button" className="btnTab01 on"><span className="blind">첫 번째 이야기</span></button>
                                {/* <button type="button" className="btnTab02"><span className="blind">두 번째 이야기</span></button> */}
                            </div>
                            <div className="tabContWrap">
                                <div className="tabCont on">
                                    <div className="videoWrap">
                                        <video width="100%" height="100%" poster="/images/events/2021/event210319/video_thumb.jpg" ref="vidRef" controls={ this.state.videoPlay }>
                                            <source src={ 'https://dn.vivasam.com/mov/elevivasam/MO/Teaser1.mp4' } type="video/mp4"/>
                                        </video>
                                        <button type="button" className="btnPlay" style={{ display : this.state.videoPlay === false ? 'inline-block' : 'none' }} onClick={ this.onVideo }>
                                            <span className="blind">재생</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evtCont03">
                    <h2><img src="/images/events/2021/event210319/img02.jpg" alt="모집안내" /></h2>
                    <div className="blind">
                        <ul>
                            <li>
                                <span>모집 기간</span>
                                <div>2021.03.19 ~ 04.09</div>
                            </li>
                            <li>
                                <span>결과 발표</span>
                                <div>2021.04.30</div>
                            </li>
                            <li>
                                <span>참여 대상</span>
                                <div>비바샘 초등 회원</div>
                            </li>
                            <li>
                                <span>모집 내용</span>
                                <div>
                                    초등학교 수업에서 활용할 수 있는 분야별 수업자료
                                    <ul>
                                        <li>전체 수업 계획안 1p 혹은 수업 연구 자료 중 택1</li>
                                        <li>여러 분야의 수업 자료 응모 가능</li>
                                        <li>개인 혹은 그룹 지원 가능</li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                        <ul>
                            <li>주제수업상: 초등 비바샘에 선생님의 수업 채널이 오픈됩니다! * 수업 자료 제공에 대한 세부적인 협의는 별도로 진행됩니다.</li>
                            <li>응원상: 참여해주신 선생님 30분께 스타벅스 커피 + 케익 세트를 드립니다.</li>
                        </ul>
                        <div>
                            <strong>유의사항</strong>
                            <ul>
                                <li>- 제출하신 자료는 반환되지 않습니다.</li>
                                <li>- 주제 수업상에 당첨되신 선생님께는 개별 연락을 드리며, 초등 비바샘 내 콘텐츠 탑재를 위해 별도의 협의가 진행됩니다.</li>
                            </ul>
                        </div>
                        <span>※ 본 공모전은 비바샘 PC 웹페이지에서 응모 가능합니다.</span>
                    </div>
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
