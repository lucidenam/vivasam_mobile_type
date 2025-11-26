import React, {Component, createRef} from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withRouter, Link} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import Slider from "react-slick";
import './Vivaclass2025.css';
import QuickPinchZoom, {make3dTransformValue} from 'react-quick-pinch-zoom'

class Vivaclass2025 extends Component{
    constructor(props) { //초기화
        super(props);
        this.state = {
            isTabActiveArr: [true,false,false,false,false,false],
            sectionsTop:[],
            pop1:false,
            pop2:false,
            pop3:false,
            pop4:false,
            pop5:false,
            imgIdx:0
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    setAnkerClass = (idx) => {
        let $li = document.querySelectorAll('.ankerList li');
        let scLeft = $li[idx].offsetLeft;
        let arr = [];

        for(let i = 0; i < this.state.isTabActiveArr.length; i++){
            arr.push(i === idx)
        }

        document.querySelector('.ankerList').scrollLeft = scLeft;

        this.setState({
            isTabActiveArr:arr,
        });
    }

    setSectionsTop = () => {
        let sections = document.querySelectorAll('.section');
        let arr = [];
        sections.forEach(el => {
            arr.push(el.offsetTop);
        });
        this.setState({
            sectionsTop: arr,
        });
    }

    handleAnkerScroll = (e, $el) => {
        let elOffTop = document.querySelector($el).offsetTop;
        elOffTop = elOffTop - document.querySelector('.ankerWrap').offsetHeight - document.querySelector('header').offsetHeight;

        window.scrollTo({
            top: elOffTop,
            behavior: 'smooth'
        });
    }

    handleScroll = () => {
        const { sectionsTop } = this.state
        let $sectionEle = document.querySelectorAll('.ani');
        let curScroll = window.scrollY;
        let calcTop = document.querySelector('.ankerWrap').offsetHeight + document.querySelector('header').offsetHeight;

        $sectionEle.forEach($el => {
            let elOffTop = $el.getBoundingClientRect().top + curScroll;
            if (curScroll > elOffTop - (window.innerHeight / 3 * 2)) {
                $el.classList.add('animate');
            }
        });

        this.setSectionsTop();

        for(let i = 0; i < sectionsTop.length-1; i++){
            if(curScroll+calcTop < sectionsTop[0]){
                this.setAnkerClass(0)
                break;
            }
            if(curScroll+calcTop >= sectionsTop[i] - window.innerHeight/3 && curScroll+calcTop < sectionsTop[i+1] - window.innerHeight/3){
                this.setAnkerClass(i)
                break;
            }else{
                this.setAnkerClass(sectionsTop.length-1);
            }
        }
    }
    openDetailPopup = (popIdx, idx) => {
        const { pop1, pop2, pop3, pop4, pop5 } = this.state

        let isPop1 = popIdx === 0
        let isPop2 = popIdx === 1
        let isPop3 = popIdx === 2
        let isPop4 = popIdx === 3
        let isPop5 = popIdx === 4

        this.setState({
            pop1: isPop1,
            pop2: isPop2,
            pop3: isPop3,
            pop4: isPop4,
            pop5: isPop5,
            imgIdx: idx
        });
        document.querySelector('body').style.overflow = 'hidden';
    }

    closeDetailPop = () => {
        this.setState({
            pop1: false,
            pop2: false,
            pop3: false,
            pop4: false,
            pop5: false,
        });
        document.querySelector('body').style.overflow = 'auto';
    }

    render() {
        const { isTabActiveArr, pop1, pop2, pop3, pop4, pop5, imgIdx } = this.state;

        const settings1 = {
            className: 'arrSwiper',
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            cssEase: 'linear',
            arrows: true
        };

        const settings2 = {
            className: 'fadeSwiper',
            fade: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 4000,
            cssEase: 'linear',
            draggable:false,
            arrows: false,
        };

        return(
          <section className="vivaIntroWrap vivaIntro2025">
              <div className="titleWrap">
                  <img src="/images/saemteo/vivaintro/2025/title.png" alt="2025년 신학기 준비 비바클래스 하나로 끝!"/>
              </div>
              <div className="ankerWrap">
                  <ul className="ankerList">
                      <li className={isTabActiveArr[0] ? 'on' : ''}>
                          <button type="button" onClick={() => this.handleAnkerScroll(window.event, '#section1')}><span>클래스 개설<br/>10초면 OK</span></button>
                      </li>
                      <li className={isTabActiveArr[1] ? 'on' : ''}>
                          <button type="button" onClick={() => this.handleAnkerScroll(window.event, '#section2')}><span>스마트 교수자료<br/>바로 활용</span></button>
                      </li>
                      <li className={isTabActiveArr[2] ? 'on' : ''}>
                          <button type="button" onClick={() => this.handleAnkerScroll(window.event, '#section3')}><span>간편한<br/>수업 준비</span></button>
                      </li>
                      <li className={isTabActiveArr[3] ? 'on' : ''}>
                          <button type="button" onClick={() => this.handleAnkerScroll(window.event, '#section4')}><span>편리한<br/>수업 도구</span></button>
                      </li>
                      <li className={isTabActiveArr[4] ? 'on' : ''}>
                          <button type="button" onClick={() => this.handleAnkerScroll(window.event, '#section5')}><span>수업 결과를<br/>한눈에</span></button>
                      </li>
                      <li className={isTabActiveArr[5] ? 'on' : ''}>
                          <button type="button" onClick={() => this.handleAnkerScroll(window.event, '#section6')}><span>COMING<br/>SOON</span></button>
                      </li>
                  </ul>
              </div>
              <div id="section1" className="section section1">
                  <h2 className="page-tit">클래스 개설부터 참여까지, <br/>10초면 OK!</h2>
                  <p className="page-disc">
                      신학기, 클래스 개설부터 학생 참여까지<br/>
                      시간과 절차가 부담스러우셨죠?
                  </p>
                  <p className="page-disc">
                      비바클래스에서는 빠르게 클래스를 개설하고<br/>
                      학생 회원가입 없이, <strong>닉네임만 입력하면 빠르게<br/>
                      클래스에 참여</strong>할 수 있습니다.
                  </p>

                  <Slider {...settings1}>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(0, 0)}>
                              <img src="/images/saemteo/vivaintro/2025/sec1_img1.png" alt="클래스 개설부터 참여까지, 10초면 OK!"/>
                          </div>
                          <span className="badge">선생님</span>
                          <h4>닉네임 간편 입장 클래스 개설</h4>
                          <p>
                              QR코드 또는 URL로 학생들이 바로 접속하고,<br/>
                              학습 활동 데이터도 1년간 보존 가능!
                          </p>
                          <p className="t">
                              기존처럼 학습 활동 데이터 영구 보존을 원하시는 경우,<br/>
                              ‘비바클래스 회원으로 가입하여 시작하기’로<br/>
                              클래스를 개설해주세요.
                          </p>
                      </div>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(0, 1)}>
                              <img src="/images/saemteo/vivaintro/2025/sec1_img2.png" alt="클래스 개설부터 참여까지, 10초면 OK!"/>
                          </div>
                          <span className="badge ty2">학생</span>
                          <h4>회원가입 없이, 바로 참여</h4>
                          <p>
                              복잡한 절차 없이 닉네임과 인증번호만 입력하면<br/>
                              우리반 클래스 참여 완료!
                          </p>
                      </div>
                  </Slider>

              </div>
              <div id="section2" className="section section2">
                  <h2 className="page-tit">스마트 교수자료를 <br/>바로 수업에 활용!</h2>
                  <p className="page-disc">수업 준비 시간이 부족하시나요?</p>
                  <p className="page-disc">
                      비바클래스에서는 <strong>스마트 교수자료를 손쉽게 <br/>
                      ‘우리반 수업’에서 바로 활용</strong>할 수 있어, <br/>
                      수업 준비가 한결 수월해집니다.
                  </p>
                  <div className="fadeSwiper swiper">
                      <div className="swiper-wrapper">
                          <div className="swiper-slide">
                              <div className="thumb" onClick={() => this.openDetailPopup(1, 0)}>
                                  <img src="/images/saemteo/vivaintro/2025/sec2_img1.png" alt="간편한 수업준비"/>
                                  <div className="rect ty2 aniBling pos1"></div>
                                  <div className="rect ty2 aniBling pos2"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div id="section3" className="section section3">
                  <h2 className="page-tit">비바샘 자료로 <br/>빠르게 수업 준비 끝!</h2>
                  <p className="page-disc">
                      수업 자료, 이제는비바샘 자료실에서<br/>
                      다운로드하실필요 없어요.
                  </p>
                  <p className="page-disc">
                      비바샘에서 <strong>원하는 자료</strong>를 선택하면<br/>
                      손쉽게 <strong>비바클래스 수업으로 활용</strong>할 수 있습니다.
                  </p>
                  <Slider {...settings2}>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(2, 0)}>
                              <img src="/images/saemteo/vivaintro/2025/sec3_img1.png" alt="간편한 수업준비"/>
                              <div className="rect aniBling pos3"></div>
                          </div>
                      </div>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(2, 1)}>
                              <img src="/images/saemteo/vivaintro/2025/sec3_img2.png" alt="간편한 수업준비"/>
                              <div className="rect aniBling pos4"></div>
                          </div>
                      </div>
                  </Slider>
              </div>
              <div id="section4" className="section section4">
                  <h2 className="page-tit">편리한 수업을 만드는 <br/>강력한 도구들</h2>
                  <p className="page-disc">
                      학생들이 자료를 제대로 보고 있는지<br/>
                      걱정되지 않으셨나요?<br/>
                      필요한 수업 도구를 번거롭게 찾아 헤매셨나요?
                  </p>
                  <p className="page-disc">
                      비바클래스에서는 <strong>학생들이 수업 흐름을<br/>
                      놓치지 않도록 도와주고 다양한 수업 도구</strong>를<br/>
                      한 화면에서 동시에 활용할 수 있습니다.<br/>
                      복잡한 준비와 진행 없이 <strong>깔끔하고 효율적인<br/>
                      수업</strong>을 경험해보세요.
                  </p>
                  <Slider {...settings1}>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(3, 0)}>
                              <img src="/images/saemteo/vivaintro/2025/sec4_img1.png" alt="편리한 수업 도구"/>
                          </div>
                      </div>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(3, 1)}>
                              <img src="/images/saemteo/vivaintro/2025/sec4_img2.png" alt="편리한 수업 도구"/>
                          </div>
                      </div>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(3, 2)}>
                              <img src="/images/saemteo/vivaintro/2025/sec4_img3.png" alt="편리한 수업 도구"/>
                              <div className="rect ty2 aniBling pos5"></div>
                          </div>
                      </div>
                  </Slider>
              </div>
              <div id="section5" className="section section5">
                  <h2 className="page-tit">수업 결과도 한눈에, <br/>효율적으로 관리!</h2>
                  <p className="page-disc">
                      수업 후 학생들의 참여와 기록 관리,<br/>
                      어렵고 번거로우셨죠?
                  </p>
                  <p className="page-disc">
                      <strong>수업했던 시간과 참여 학생, 입장 시간</strong>까지 <br/>
                      한눈에 확인할 수 있어요.<br/>
                      작성한 수업 기록과 데이터는 언제든지<br/>
                      ‘우리반 수업’에서 조회 가능합니다.
                  </p>
                  <Slider {...settings1}>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(4, 0)}>
                              <img src="/images/saemteo/vivaintro/2025/sec5_img1.png" alt="수업 결과를 한눈에"/>
                              <div className="rect ty2 aniBling pos6"></div>
                          </div>
                      </div>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(4, 1)}>
                              <img src="/images/saemteo/vivaintro/2025/sec5_img2.png" alt="수업 결과를 한눈에"/>
                          </div>
                      </div>
                      <div className="swiper-slide">
                          <div className="thumb" onClick={() => this.openDetailPopup(4, 2)}>
                              <img src="/images/saemteo/vivaintro/2025/sec5_img3.png" alt="수업 결과를 한눈에"/>
                          </div>
                      </div>
                  </Slider>
              </div>
              <div id="section6" className="section section6">
                  <div className="coming-soon-tit">
                      <div className="badge"><span className="blind">COMING SOON</span></div>
                      <p>2024년 '비바샘이 간다'를 통해<br/> 요청하셨던</p>
                  </div>
                  <h2 className="page-tit">
                      선생님들의 바람을 담아,<br/>
                      새로운 기능들이<br/>
                      곧 찾아옵니다!
                  </h2>
                  <ul className="img-list">
                      <li className="ani"><img src="/images/saemteo/vivaintro/2025/sec6_img1.png" alt="COMING SOON"/></li>
                      <li className="ani"><img src="/images/saemteo/vivaintro/2025/sec6_img2.png" alt="COMING SOON"/></li>
                      <li className="ani"><img src="/images/saemteo/vivaintro/2025/sec6_img3.png" alt="COMING SOON"/></li>
                      {/*<li className="ani"><img src="/images/saemteo/vivaintro/2025/sec6_img4.png" alt="COMING SOON"/></li>*/}
                  </ul>
                  <h5>
                      점점 더 똑똑해지고,<br/>
                      편리해지는 비바클래스를<br/>
                      기대해 주세요!
                  </h5>
                  <a href="https://vivaclass.vivasam.com/" target="_blank" className="btn_vivaclass"><span className="blind">비바클래스 바로가기</span></a>
              </div>

              {pop1 && <DetailPopup idx={imgIdx} closeDetailPop={this.closeDetailPop}>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec1_img1.png"}/>
                  </div>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec1_img2.png"}/>
                  </div>
              </DetailPopup>}

              {pop2 && <DetailPopup idx={imgIdx} closeDetailPop={this.closeDetailPop}>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec2_img1.png"}/>
                  </div>
              </DetailPopup>}

              {pop3 && <DetailPopup idx={imgIdx} closeDetailPop={this.closeDetailPop}>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec3_img1.png"}/>
                  </div>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec3_img2.png"}/>
                  </div>
              </DetailPopup>}

              {pop4 && <DetailPopup idx={imgIdx} closeDetailPop={this.closeDetailPop}>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec4_img1.png"}/>
                  </div>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec4_img2.png"}/>
                  </div>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec4_img3.png"}/>
                  </div>
              </DetailPopup>}

              {pop5 && <DetailPopup idx={imgIdx} closeDetailPop={this.closeDetailPop}>
                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec5_img1.png"}/>
                  </div>

                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec5_img2.png"}/>
                  </div>

                  <div className="thumb">
                      <Slide url={"/images/saemteo/vivaintro/2025/sec5_img3.png"}/>
                  </div>
              </DetailPopup>}
          </section>
        );
    };
}

class Slide extends Component {
    constructor(props) {
        super(props);
    }
    onUpdate = ({ x, y, scale }) => {
        const img = this.imgRef;
        if (img && img.complete) {
            const value = make3dTransformValue({ x, y, scale });
            img.style.setProperty("transform", value);
            img.style.opacity = 1;
        } else if (img) {
            const value = make3dTransformValue({ x: 0, y: 0, scale: 1 });
            img.style.setProperty("transform", value);
            img.style.opacity = 0;
        }
    };

    render(){
        return (
          <QuickPinchZoom
            onUpdate={this.onUpdate}
            draggableUnZoomed={false}
            shouldInterceptWheel={() => false}
          >
              <img
                className="zoom-image product-image"
                src={this.props.url}
                alt="zoomed-item"
                ref={(ref) => this.imgRef = ref}
              />
          </QuickPinchZoom>
        );
    }
}

class DetailPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSlide: this.props.idx+1,
        };
    }

    handleAfterChange = (index) => {
        this.setState({ currentSlide: index + 1 });
    };

    render() {
        const { children, closeDetailPop, idx } = this.props;
        const totalSlides = children.length;

        const sliderSettings = {
            className: 'detailSwiper',
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            initialSlide:idx,
            cssEase: 'linear',
            afterChange: this.handleAfterChange,
            customPaging: () => <div style={{ display: "none" }} />,
            appendDots: () => (
              <div className="detail-pop__cnt">
                  <span className="cur">{this.state.currentSlide}</span> / <span>{totalSlides}</span>
              </div>
            ),
        };

        return (
          <div className="imgDetailPop">
              <div className="detail-pop-header">
                  <button type="button" className="detail-pop-close" onClick={closeDetailPop}></button>
              </div>
              <div className="detail-pop-content">
                  <Slider {...sliderSettings} ref={(ref) => this.slider = ref}>{children}</Slider>
                  <div className="detail-pop-footer"></div>
              </div>
          </div>
        );
    }
}

export default connect(
  (state) => ({
      logged: state.base.get('logged'),
      loginInfo: state.base.get('loginInfo').toJS()
  }),
  (dispatch) => ({
      PopupActions: bindActionCreators(popupActions, dispatch),
      BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(Vivaclass2025));