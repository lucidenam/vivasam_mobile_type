import React, {Component} from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withRouter, Link} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import Slider from "react-slick";
import './Wechall.css';
import {onClickCallLinkingOpenUrl} from '../../lib/OpenLinkUtils';

class Wechall extends Component{
    constructor(props) { //초기화
        super(props);
        this.state = {
            videoPlay1: false,
            videoPlay2: false
        };
    }

    onTabClick = idx => {
        const $tabCtrl = document.querySelectorAll('.btnTabWrap > button');
        const $tabView = document.querySelectorAll('.tabContWrap .tabCont');

        $tabCtrl.forEach((button, i) => {
            button.classList.toggle('on', i === idx);
            $tabView[i].classList.toggle('on', i === idx);
        });

        ['vidRef1', 'vidRef2'].forEach(ref => {
            if (this.refs[ref]) {
                this.refs[ref].pause();
            }
        });
    }

    onVideoPlay = e => {
        const idx = parseInt(e.target.value);

        this.setState({
            [`videoPlay${idx}`]: !this.state[`videoPlay${idx}`],
        });
        this.refs[`vidRef${idx}`].play();
    }

    render() {
        //slick option 설정
        const settings1 = {
            className: 'innerSwiper',
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: false,
            arrows: false,
            dots: true
        };

        return(
            <section className="wechallWrap">
                <div className="section1">
                    <img src="/images/saemteo/wechall/img_evt01.png" alt=""/>
                    <div className="blind">
                        <span><strong>선생님</strong>도 <strong>학생</strong>도 모두 함께 <strong>챌린지해요!</strong></span>
                        <h1>We are Challengers 위챌 소개합니다</h1>
                        <div>
                            <span>위챌은요!</span>
                            <p>
                                숏폼 챌린지 애플리케이션입니다.다양한 AR 필터와 스티커를 활용하여, 챌린지 영상을 편집하고 업로드할 수 있습니다.<br />
                                위챌을 통해 선생님과 학생들이 소통하며 더 재미있게 수업하고 학습할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="section2">
                    <h2><img src="/images/saemteo/wechall/evt_subtit01.png" alt="위챌 소개 영상! 함께 볼까요?"/></h2>
                    <div id="tabWrap">
                        <div className="btnTabWrap">
                            <button type="button" className="btnTab01 on" onClick={() => this.onTabClick(0)}><span className="blind">선생님용</span></button>
                            <button type="button" className="btnTab02" onClick={() => this.onTabClick(1)}><span className="blind">학생용</span></button>
                        </div>
                        <div className="tabContWrap">
                            <div className="tabCont on">
                                <div className="videoWrap">
                                    <video width="100%" height="100%" poster="/images/saemteo/wechall/video_thumb_t.jpg" ref="vidRef1" controls={this.state.videoPlay1}>
                                        <source src={"https://dn.vivasam.com/vs/홍보영상/위챌/wechall_intro_mobile_teacher.mp4"} type="video/mp4"/>
                                    </video>
                                    <button type="button" className="btnPlay" style={{display : this.state.videoPlay1 === false ? 'inline-block' : 'none'}} onClick={this.onVideoPlay} value={1}>
                                        {/*<span className="blind">재생</span>*/}
                                        <span className="blind">재생</span>
                                    </button>
                                </div>
                            </div>
                            <div className="tabCont">
                                <div className="videoWrap">
                                    <video width="100%" height="100%" poster="/images/saemteo/wechall/video_thumb_s.jpg" ref="vidRef2" controls={this.state.videoPlay2}>
                                        <source src={"https://dn.vivasam.com/vs/홍보영상/위챌/wechall_intro_mobile_student.mp4"} type="video/mp4"/>
                                    </video>
                                    <button type="button" className="btnPlay" style={{display : this.state.videoPlay2 === false ? 'inline-block' : 'none'}} onClick={this.onVideoPlay} value={2}>
                                        <span className="blind">재생</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section3">
                    <img src="/images/saemteo/wechall/img_list01.png" alt=""/>
                    <div className="blind">
                        <h2>위챌 활용 방법! 함께 살펴볼까요?</h2>
                        <span>01. 나만의 챌린지를 간편하게 등록해 보세요!</span>
                        <p>학생들과 함께 즐기고 싶은 활동이나 과제를 챌린지로 등록해 보세요!</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list01_01.png" alt=""/>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list01_02.png" alt=""/>
                        </div>
                    </Slider>
                </div>
                <div className="section4">
                    <img src="/images/saemteo/wechall/img_list02.png" alt=""/>
                    <div className="blind">
                        <span>02. 편리한 편집 기능으로 손쉽게 챌린지를 만들어 보세요!</span>
                        <p>챌린지 영상에 알록달록 자막을 넣고, 영상에서 원하는 부분만 잘라내고!</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list02_01.png" alt=""/>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list02_02.png" alt=""/>
                        </div>
                    </Slider>
                </div>
                <div className="section5">
                    <img src="/images/saemteo/wechall/img_list03.png" alt=""/>
                    <div className="blind">
                        <span>03. 비바클래스 학생들만 참여할 수 있는 우리 반 챌린지를 열어보세요!</span>
                        <p>내 비바클래스 학생들만 참여할 수 있는 우리 반 챌린지를 운영할 수 있습니다.</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list03_01.png" alt=""/>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list03_02.png" alt=""/>
                        </div>
                    </Slider>
                </div>
                <div className="section6">
                    <img src="/images/saemteo/wechall/img_list04.png" alt=""/>
                    <div className="blind">
                        <span>04. 좋아요와 댓글로 학생들과 소통해 보세요!</span>
                        <p>열심히 참여한 학생 영상에 좋아요 버튼을 눌러 마음을 표현하세요!</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list04_01.png" alt=""/>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/wechall/list04_02.png" alt=""/>
                        </div>
                    </Slider>
                </div>
                <div className="section7">
                    <img src="/images/saemteo/wechall/img_download.png" alt=""/>
                    <div className="blind">
                        <h2>바로 지금! 위챌 챌린저가 되어 볼까요?</h2>
                        <p>위챌 다운로드하기</p>
                    </div>
                    <div className="btnWrap">
                        <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://play.google.com/store/apps/details?id=com.visang.wechall`)} target="_blank" className="btnLink" />
                        <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://apps.apple.com/kr/app/%EC%9C%84%EC%B1%8C-we-are-challengers/id6480443602`)} target="_blank" className="btnLink" />
                    </div>
                </div>
            </section>
        );
    };
};

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Wechall));