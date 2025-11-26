import React, {Component} from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withRouter, Link} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import Slider from "react-slick";
import EduServicePopup from './EduServicePopup';
import './Vivaclass.css';
import * as common from 'lib/common';
import {onClickCallLinkingOpenUrl} from '../../lib/OpenLinkUtils';

class Vivaclass extends Component{
    constructor(props) { //초기화
        super(props);
        this.state = {
            videoPlay: false,
            activeSlide: null
        };
    }

    onVideoPlay = () => {
        const { videoPlay } = this.state;

        this.setState({
            videoPlay: !videoPlay,
        })
        this.refs.vidRef.play();
    }

    handleClick = (idx) => {
        this.setState({ activeSlide: idx });
    }

    handleOpenPop = (e) => {
        const {logged, loginInfo, history, BaseActions, PopupActions} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인이 필요한 서비스입니다.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return;
        } else {
            // 교사 인증
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사인증이 필요한 서비스입니다.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            PopupActions.openPopup({title: '신규 서비스 알림 신청하기', componet: <EduServicePopup/>});
        }
	}

    handleAlert = (e) => {
        alert('PC에서 이용해보실 수 있어요!');
    }

    render() {
        //slick option 설정
        const settings1 = {
            fade: true,
            className: 'listSwiper',
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 4000,
            cssEase: 'linear',
            arrows: true
        };

        const settings2 = {
            className: 'funcSwiper',
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            variableWidth: true,
            autoplay: true,
            autoplaySpeed: 4000,
            cssEase: 'linear',
            arrows: false,
        };

        return(
            <section className="vivaIntroWrap">
                <div className="section1">
                    <img src="/images/saemteo/vivaintro/250212/sec1_tit.png" alt=""/>
                    <img src="/images/saemteo/vivaintro/img_evt01_viversam.gif" alt="" className="viversam"/>
                    <div className="blind">
                        <span>소통과 배움의 시작, 우리반 모두 오늘도 VIVA!</span>
                        <h1><strong>비바클래스</strong></h1>
                        <p><strong>수업은 더욱 풍요롭게, 학습 흥미도 자연스레 Up</strong><br/>비바샘 선생님의 1등 수업지원 파트너, <br/>비바클래스와 함께 해요.</p>
                    </div>
                </div>

                <div className="section2-0">
                    <img src="/images/saemteo/vivaintro/240905/sec2_tit.png" alt=""/>
                    <div className="blind">
                        <h2>초성으로 알아보는 비바클래스를 소개합니다!</h2>
                    </div>
                    <div className="videoWrap">
                        <video width="100%" height="100%" ref="vidRef" controls={this.state.videoPlay}>
                            <source src={'https://dn.vivasam.com/vs/홍보영상/비바클래스/vivaclass_intro_pc.mp4'}
                                    type="video/mp4"/>
                        </video>
                        <button type="button" className="btnPlay"
                                style={{display: this.state.videoPlay === false ? 'inline-block' : 'none'}}
                                onClick={this.onVideoPlay}>
                            <span className="blind">재생</span>
                        </button>
                    </div>
                </div>

                <div className="section2">
                    <img src="/images/saemteo/vivaintro/img_evt02.jpg" alt=""/>
                    <div className="blind">
                        <h2>단 10초면 클래스 개설 완료!</h2>
                        <p>선생님께서는 오로지 수업 준비에만 집중하실 수 있도록<br/>나머지는 비바클래스에서 모~두 준비해드릴게요.</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/list1_1_on.png" alt="학생 계정 자동으로 만들어 드려요!"/>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/250212/list1_2_on.png" alt="회원 가입? 닉네임으로 간편하게!"/>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/list1_3_on.png" alt="클래스 만들기 한 번이면 돼요!"/>
                        </div>
                    </Slider>
                    <div className="btnWrap">
                        <button type="button" className="btnClassApply" onClick={this.handleAlert}>
                            <img src="/images/saemteo/vivaintro/btn_class_apply.png" alt="10초만에 클래스 만들기"/>
                        </button>
                    </div>
                </div>
                <div className="section6">
                    <img src="/images/saemteo/vivaintro/250212/sec6_tit.png" alt=""/>
                    <div className="blind">
                        <h2>우리반 수업, 비바클래스에서 한 번에</h2>
                        <p>앞서 소개해드린 비바샘의 다양한 자료를<br/>선생님의 수업에 맞춰 재구성은 물론, 학생과 실시간 소통하며 수업할 수 있어요.</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/250212/sec6_list1.png" alt="복잡했던 수업 준비, 비바클래스에서 해결해요"/>
                            <a href="javascript:void(0)" target="_blank" onClick={() => {
                                onClickCallLinkingOpenUrl("https://www.notion.so/vivaclass/1f44442e673b81ac8455ed6c877662f2");
                            }}  className="btnAlert"></a>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/250212/sec6_list2.png"
                                 alt="수업 시 사용 가능한 스마트 편의 기능도 있어요"/>
                            <a href="javascript:void(0)" target="_blank" onClick={() => {
                                onClickCallLinkingOpenUrl("https://www.notion.so/vivaclass/2034442e673b810095b2f752e2d343b6");
                            }} className="btnAlert"></a>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/250212/sec6_list3.png" alt="수업이 끝나면 자동으로 결과를남겨드려요"/>
                            <a href="javascript:void(0)" target="_blank" onClick={() => {
                                onClickCallLinkingOpenUrl("https://www.notion.so/vivaclass/2034442e673b8106a631c0631594c484");
                            }} className="btnAlert"></a>
                        </div>

                    </Slider>
                </div>

                <div className="section3">
                    <img src="/images/saemteo/vivaintro/240905/sec3_tit.png" alt=""/>
                    <div className="blind">
                    <h2>꼭 필요한 게시판도 준비해드렸어요.</h2>
                        <p>선생님과 학급 친구들의 원활한 수업과 소통을 위해<br/>꼭 필요한 5가지 게시판 기능이 준비되어있어요.</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec3_item1.png" alt="모두가 알아야하는 건 공지로 등록해보세요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec3_item2.png" alt="숙제 발행과 관리가 더 편해졌어요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec3_item3.png" alt="우리반 온라인 평가, 스마트하게 관리하세요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec3_item4.png" alt="와글와글 이야기 나눠요 자유게시판에서 다같이"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec3_item5.png" alt="다양한 주제의 의견, 투표를 통해 나눠보세요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec3_item6.png" alt="우리반 재미난 추억, 앨범게시판이 지켜드려요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                    </Slider>
                </div>

                <div className="section4">
                    <img src="/images/saemteo/vivaintro/240905/sec4_tit.png" alt=""/>
                    <div className="blind">
                        <h2>언제나 선생님 편! 학급 운영 도우미</h2>
                        <p>오직 선생님의 입장에서 고민한 기능들을 담았어요.<br/>더 이상의 학급 및 수업 운영 부담은 No, 비바클래스에게 맡겨만 주세요.</p>
                    </div>
                    <Slider {...settings1}>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec4_item1.png" alt="동일 학급의 클래스라면 누구나!"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec4_item2.png" alt="담임이라면 부담임 지정이 가능해요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec4_item3.png" alt="우리반 대표 한마디 급훈도 걸어보세요!"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec4_item4.png" alt="학급 현황? 대시보드! 편리하게 확인해요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec4_item5.png"
                                 alt="공유할 자료? 내 파일함! 언제든지 꺼내 쓰세요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                        <div className="slide">
                            <img src="/images/saemteo/vivaintro/240905/sec4_item6.png"
                                 alt="수업 연구? 교사 클래스! 비바샘 선생님들과 함께 해요"/>
                            <button type="button" className="btnAlert" onClick={this.handleAlert}></button>
                        </div>
                    </Slider>
                </div>

                <div className="section5">
                    <img src="/images/saemteo/vivaintro/240905/sec5_tit.png" alt=""/>
                    <div className="blind">
                        <h2>비바샘 자료로 수업 준비 끝!</h2>
                        <p>초등, 중학, 고등 맞춤형 자료가 한가득! <br/>다양한 학년별 수업에 활용하실 수 있도록 준비해 드렸어요</p>
                        <h3>교과 자료</h3>
                        <p>초등은 차시창의 다양한 수업 자료를 클래스로 공유하실 수 있어요. <br/>중고등은 새롭게 준비된 22개정 스마트 교과서와 PPT를 25년 2월부터 <br/>수업에
                            활용하실 수 있어요.</p>
                    </div>
                    {/* 2024-09-05 */}
                    <Slider {...settings2}>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/textbook/list?eduClsCode=2022&textbookCd=106518&term=108002`)}
                                   target="_blank" className="btnLink">
                                    <img src="/images/saemteo/vivaintro/240905/sec5_item1.png" alt="초등"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/visangTextbook/2022/list?slv=MS`)}
                                   target="_blank" className="btnLink">
                                    <img src="/images/saemteo/vivaintro/240905/sec5_item2.png" alt="중등"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/visangTextbook/2022/list?slv=HS`)}
                                   target="_blank" className="btnLink">
                                    <img src="/images/saemteo/vivaintro/240905/sec5_item3.png" alt="고등"/>
                                </a>
                            </div>
                        </div>
                    </Slider>

                    <img src="/images/saemteo/vivaintro/250212/sec5_txt.png" alt=""/>
                    <div className="blind">
                        <h3>에듀테크 테마관</h3>
                        <p>에듀테크 수업 맛집, 비바샘 테마관으로 수업이 더욱 즐거워집니다. <br/>지금 바로 비바샘 에듀테크 테마관의 콘텐츠를 경험해 보세요!</p>
                    </div>

                    <Slider {...settings2}>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/themeplace/mathArcade/main`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="new"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/250212/ico_theme00.png" alt="수학 놀이터"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/themeplace/measureEvaluate/literacy/main`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="new"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/240905/ico_theme01.png" alt="문해력 어휘지수"/>
                                </a>
                            </div>
                        </div>

                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/themeplace/realisticExp/society/main`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="new"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/240905/ico_theme03.png" alt="실감형 사회관"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/themeplace/keywordHistory/main`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="new"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/240905/ico_theme04.png" alt="키키무 역사관"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/themeplace/realisticExp/science/main`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="new"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/240905/ico_theme05.png" alt="실감형 과학관"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/themeplace/intelliLab/main`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="new"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/240905/ico_theme06.png" alt="지능형 과학실험실"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://v.vivasam.com/themeplace/gallery/main.do`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="data"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/240905/ico_theme07.png" alt="비바샘 미술관"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://e.vivasam.com/themeplace/textbookMusicLibrary/main`)}
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="data"></span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/240905/ico_theme08.png" alt="비바샘 음악관"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a href="javascript:void(0);"
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="open">2.26</span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/250212/ico_theme09.png" alt="수학 디지털 교구 2.0"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a href="javascript:void(0);"
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="open">2.26</span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/250212/ico_theme10.png" alt="수학 마을"/>
                                </a>
                            </div>
                        </div>
                        <div className="slide">
                            <div className="card">
                                <a href="javascript:void(0);"
                                   target="_blank" className="btnLink">
                                    <div className="badge">
                                        <span className="open">3.17</span>
                                    </div>
                                    <img src="/images/saemteo/vivaintro/250212/ico_theme11.png" alt="생생한 교실"/>
                                </a>
                            </div>
                        </div>
                    </Slider>
                    {/* 2024-03-25 */}
                    {/*<Slider {...settings2}>
                <div className="card labelNew">
                  <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://ttukttak.vivasam.com/#p=1&amp;st=1&amp;b=1&amp;m=1&amp;v=ES&amp;va=`)} target="_blank" className="btnLink">
                    <img src="/images/saemteo/vivaintro/img_card01.png" alt="뚝딱 학습지 오픈! - 과목별 학습지를 만들어 클래스레서 숙제로 낼 수 있어요"/>
                  </a>
                </div>
                <div className="card labelNew">
                  <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://mv.vivasam.com/#/wechall/`)} target="_blank" className="btnLink">
                    <img src="/images/saemteo/vivaintro/img_card02.png" alt="위챌 오픈! - 다양한 활동을 챌린지로 만들어 AR필터와 함께 아이들과 즐겨보세요!"/>
                  </a>
                </div>
                <div className="card labelNew">
                  <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://vivaclass.vivasam.com/ourclass/survey/write?classSeq=74`)} target="_blank" className="btnLink">
                  <img src="/images/saemteo/vivaintro/img_card03.png" alt="투표게시판 - 익명 참여도 문제없어요 다양한 주제의 의견을 나눠보세요"/>
                  </a>
                </div>
                <div className="card labelNew">
                  <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://vivaclass.vivasam.com/ourclass/album/write?classSeq=74`)} target="_blank" className="btnLink">
                  <img src="/images/saemteo/vivaintro/img_card04.png" alt="앨범게시판 - 잊지 못할 소중한 순간들 앨범에 두고두고 간직할 수 있어요"/>
                  </a>
                </div>
                <div className="card">
                  <img src="/images/saemteo/vivaintro/img_card05.png" alt="오늘의 수업 - 비바샘의 수업 자료를 활용해 선생님만의 수업을 꾸릴 수 있어요"/>
                </div>
                <div className="card">
                  <img src="/images/saemteo/vivaintro/img_card06.png" alt="대시보드 - 클래스 활동 기록과 데이터를 한 눈에 볼 수 있어요"/>
                </div>
                <div className="card">
                  <img src="/images/saemteo/vivaintro/img_card07.png" alt="시간표 - 우리반 시간표를 설정해두고 학생들과 함께 볼 수 있어요"/>
                </div>
                <div className="card labelNew">
                  <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://vivaclass.vivasam.com/ourclass/album/write?classSeq=74`)} target="_blank" className="btnLink">
                    <img src="/images/saemteo/vivaintro/img_card08.png" alt="선생님 초대 - 선생님들만의 클래스 공간! 비바클래스에서 만들 수 있어요"/>
                  </a>
                </div>
                <div className="card labelNew">
                  <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://vivaclass.vivasam.com/mydesk/mydata`)} target="_blank" className="btnLink">
                    <img src="/images/saemteo/vivaintro/img_card09.png" alt="자료함 - 담은 자료 기능이 새롭게 추가되었어요"/>
                  </a>
                </div>
                <div className="card">
                  <img src="/images/saemteo/vivaintro/img_card10.png" alt="내 파일함 - 클래스 활동하며 저장하고 싶은 자료는 파일함으로 쏙!"/>
                </div>
                <div className="card labelNew">
                  <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://vivaclass.vivasam.com/ourclass/homework/write?classSeq=3448`)} target="_blank" className="btnLink">
                    <img src="/images/saemteo/vivaintro/img_card11.png" alt="숙제 - 평가를 공개할 수 있는 기능이 새롭게 추가되었어요"/>
                  </a>
                </div>
                <div className="card labelNew">
                  <img src="/images/saemteo/vivaintro/img_card12.png" alt="댓글 - 비밀글 작성 기능과 이모티콘이 추가되었어요"/>
                </div>
              </Slider>
              <div className="btnWrap">
                <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://vivaclass.vivasam.com/`)} target="_blank" className="btnLink">
                  <img src="/images/saemteo/vivaintro/btn_link_vivaclass.png" alt="비바클래스 바로가기"/>
                </a>
              </div>*/}
                    {/* 2024-02-26
                        <Slider {...settings2}>
                            <div className={`card ${this.state.activeSlide === 0 ? 'flip' : ''}`} onClick={() => this.handleClick(0)}>
                                <div className="front"><img src="/images/saemteo/vivaintro/card01.png" alt="아이들의 학급 기록 - 누가기록" /></div>
                                <div className="back"><img src="/images/saemteo/vivaintro/img_card_back01.gif" alt="" /></div>
                            </div>
                            <div className={`card ${this.state.activeSlide === 1 ? 'flip' : ''}`} onClick={() => this.handleClick(1)}>
                                <div className="front"><img src="/images/saemteo/vivaintro/card02.png" alt="우리반 소식 공유 - 공지게시판" /></div>
                                <div className="back"><img src="/images/saemteo/vivaintro/img_card_back02.gif" alt="" /></div>
                            </div>

                            <div className={`card ${this.state.activeSlide === 2 ? 'flip' : ''}`} onClick={() => this.handleClick(2)}>
                                <div className="front"><img src="/images/saemteo/vivaintro/card03.png" alt="자유로운 이야기 나눔 - 자유게시판" /></div>
                                <div className="back"><img src="/images/saemteo/vivaintro/img_card_back03.gif" alt="" /></div>
                            </div>
                            <div className="card soon">
                                <div className="front"><img src="/images/saemteo/vivaintro/card04.png" alt="의견이 궁금할 땐 - 투표게시판" /></div>
                                <div className="back"></div>
                            </div>
                            <div className="card soon">
                                <div className="front"><img src="/images/saemteo/vivaintro/card05.png" alt="특별한 추억을 기록 - 앨범게시판" /></div>
                                <div className="back"></div>
                            </div>
                            <div className="card soon">
                                <div className="front"><img src="/images/saemteo/vivaintro/card06.png" alt="우리반 현황을 한 눈에 - 대시보드" /></div>
                                <div className="back"></div>
                            </div>
                            <div className="card soon">
                                <div className="front"><img src="/images/saemteo/vivaintro/card07.png" alt="자료 관리도 편하게 - 내 자료" /></div>
                                <div className="back"></div>
                            </div>
                        </Slider>
              <div className="surveyWrap">
                <img src="/images/saemteo/vivaintro/img_survey.jpg" alt="" />
                <div className="blind">
                  <p>비바클래스의 <strong>어떤 부분이 제일 기대</strong>되시나요?</p>
                  <p>앞서 소개해드린 기능들 중에서 어떤 점이 가장 기대되시는지<br />비바샘 설문조사에서 투표와 함께 기대평을 작성해주세요.</p>
                </div>
                            <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://mv.vivasam.com/#/saemteo/survey`)} target="_blank" className="btnSurvey">
                                <img src="/images/saemteo/vivaintro/btn_survey.png" alt="설문 참여하기" />
                            </a>
              </div>
              <div className="alarmWrap">
                <img src="/images/saemteo/vivaintro/img_alarm.jpg" alt="" />
                <div className="blind">
                  <span>비바클래스의 오픈 소식을 바로 알고 싶으시다구요?</span>
                  <p>알림 신청을 통해 누구보다 빠르게 전달해드릴게요</p>
                </div>
                <button type="button" className="btnAlarm" onClick={this.handleOpenPop}><img src="/images/saemteo/vivaintro/btn_alarm.png" alt="알림 신청하기" /></button>
              </div>
              */}
                </div>
                <div className="section_bnr">
                    <a href="https://www.vivasam.com/aiSam/info" className="btn_link" target="_blank"></a>
                    <img src="/images/saemteo/vivaintro/250212/footer_bnr.png" alt="비바샘 AI 수업 체험관"/>
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
)(withRouter(Vivaclass));