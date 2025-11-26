import React, {Component} from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withRouter, Link} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import './Ttukttak.css';
import {onClickCallLinkingOpenUrl} from '../../lib/OpenLinkUtils';

class Ttukttak extends Component {
    constructor(props) { //초기화
        super(props);
    }

    componentDidMount() {
        document.querySelector('.ani:first-child').classList.add('animate');
        window.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        let $sectionEle = document.querySelectorAll('.ani');
        let curScroll =  window.scrollY;

        $sectionEle.forEach($el => {
            let elOffTop = $el.getBoundingClientRect().top + curScroll;
            if (curScroll > elOffTop - (window.innerHeight / 2)) {
                $el.classList.add('animate');
            } else if (curScroll + window.innerHeight === document.documentElement.scrollHeight) {
                document.querySelector('.linkWrap.ani').classList.add('animate');
            }
        });
    }

    handleLinkMove = $el => {
        let elOffTop = document.querySelector($el).offsetTop;
        elOffTop = elOffTop - (document.querySelector('.navWrap').offsetHeight + document.querySelector('.sticky').offsetHeight);
        window.scrollTo({
            top: elOffTop,
            behavior: 'smooth'
        });
    }

    render(){
        return(
            <section className="ttIntroWrap">
                <article className="section1 ani">
                    <img src="/images/saemteo/ttukttak/img_evt01.jpg" alt="" />
                    <div className="blind">
                        <h1>우리 모두를 위한 새로운 디지털 학습지 - 뚝딱학습지</h1>
                        <p>실물 학습지의 깊이 있는 학습 경험을 디지털로 쉽고 편리하게.<br /><strong>오늘 숙제는 마법처럼 뚝딱 내보세요.</strong></p>
                    </div>
                    <div className="btnWrap">
                        <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://ttukttak.vivasam.com/`)} target="_blank" className="btnPoint">
                            <img src="/images/saemteo/ttukttak/btn_point01.png" alt="뚝딱학습지 바로가기" />
                        </a>
                    </div>
                </article>

                <nav className="navWrap">
                    <ul className="nav">
                        <li><button type={"button"} className="linkCtrl" onClick={() => this.handleLinkMove('#evt01')}>뚝딱학습지란?</button></li>
                        <li><button type={"button"} className="linkCtrl" onClick={() => this.handleLinkMove('#evt02')}>뚝딱학습지<br />무엇이 좋을까요?</button></li>
                        <li><button type={"button"} className="linkCtrl" onClick={() => this.handleLinkMove('#evt03')}>2학기도<br />기대해주세요!</button></li>
                    </ul>
                </nav>
                <article id="evt01" className="section2 ani">
                    <img src="/images/saemteo/ttukttak/img_evt02.jpg" alt="" />
                    <div className="blind">
                        <h2>뚝딱학습지로 숙제를 뚝딱</h2>
                        <p>
                            <strong className="point">숙제 내기부터 채점, 피드백, 리포트까지 한 번에 뚝딱.</strong><br />
                            실물 학습지의 깊이 있는 학습 경험을 디지털의 편리함으로 업그레이드했어요.<br />
                            <strong>뚝딱학습지</strong>와 함께라면 학생들과의 수업이 새로워질 거예요.
                        </p>
                    </div>
                </article>
                <article id="evt02" className="section3">
                    <h2 className="blind">뚝딱학습지 무엇이 좋을까요?</h2>
                    <div className="listItem ani">
                        <img src="/images/saemteo/ttukttak/img_evt03.jpg" alt="" />
                        <div className="blind">
                            <span className="subTit">간 편 한  숙 제 내 기</span>
                            <h3>비바클래스 연동으로<br /><strong>숙제 내기도 뚝딱!</strong></h3>
                            <p>
                                우리 학생들과 함께 풀어보고 싶은<br />
                                학습지, 활동지를 비바클래스로 내보세요.
                            </p>
                            <p>
                                <strong>뚝딱학습지 & 비바클래스 연동</strong>으로<br />
                                원하는 반 · 학생에게<br />
                                편리하게 숙제를 낼 수 있어요.
                            </p>
                        </div>
                        <div className="btnWrap">
                            <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://mv.vivasam.com/#/vivaclass`)} target="_blank" className="btn">
                                <img src="/images/saemteo/ttukttak/btn.png" alt="비바클래스 알아보기" />
                            </a>
                        </div>
                    </div>
                    <div className="listItem ani">
                        <img src="/images/saemteo/ttukttak/img_evt04.jpg" alt="" />
                        <div className="blind">
                            <span className="subTit">우 리  수 업 에  알 맞 은  콘 텐 츠</span>
                            <h3><strong>비상교육이 만든</strong><br />2천여 개의<br />학습지·활동지</h3>
                            <p>
                                비상교과서를 충실히 담은<br />
                                양질의 학습지, 활동지를 준비했어요.
                            </p>
                            <p>
                                학교급, 단원/차시별로 우리 교실에<br />
                                딱 맞는 콘텐츠를 손쉽게 찾아보세요.
                            </p>
                            <span className="infoTxt">* 2024년 4월 19일 기준</span>
                        </div>
                    </div>
                    <div className="listItem ani">
                        <img src="/images/saemteo/ttukttak/img_evt05.jpg" alt="" />
                        <div className="blind">
                            <span className="subTit">실 시 간  소 통 하 는  교 실</span>
                            <h3><strong>자동 채점</strong>과<br /><strong>실시간 현황 확인</strong>으로<br />연결된 교실</h3>
                            <p>
                                대시보드를 통해 학생들의 숙제 현황을<br />
                                다양한 방법으로 조회할 수 있어요.
                            </p>
                            <p>
                                리포트를 통해서 우리 학생들과<br />
                                더 효과적으로 소통해보세요.
                            </p>
                        </div>
                    </div>
                </article>
                <article id="evt03" className="section4">
                    <div className="listItem ani">
                        <img src="/images/saemteo/ttukttak/img_evt06.jpg" alt="" />
                        <div className="blind">
                            <span className="subTit">직 접  만 드 는  디 지 털  학 습 지</span>
                            <h3>뚝딱학습지로<br /><strong>나만의 학습지</strong>를 뚝딱!</h3>
                            <p>
                                2024년 2학기부터 선생님께서 가진 파일로<br />
                                디지털 학습지를 뚝딱 만들 수 있어요.<br />
                                PDF, PPT, HWP 등 파일만 미리 준비해주세요.
                            </p>
                            <p>
                                언제 어디서든, 원할 때 간편하게,<br />
                                <strong>우리 학생들에게 꼭맞는 나만의 &lt;뚝딱학습지&gt;,</strong><br />
                                선생님들의 손으로 직접 디자인하는<br />
                                디지털 학습지 시대를 기대해주세요.
                            </p>
                        </div>
                    </div>
                    <div className="linkWrap ani">
                        <h2><img src="/images/saemteo/ttukttak/img_evt07.jpg" alt="지금 뚝딱학습지를 만나보세요!" /></h2>
                        <div className="btnWrap">
                            <a onClick={onClickCallLinkingOpenUrl.bind(this, `https://ttukttak.vivasam.com/`)} target="_blank" className="btnPoint">
                                <img src="/images/saemteo/ttukttak/btn_point02.png" alt="지금 시작하기" />
                            </a>
                        </div>
                    </div>
                </article>
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
)(withRouter(Ttukttak));