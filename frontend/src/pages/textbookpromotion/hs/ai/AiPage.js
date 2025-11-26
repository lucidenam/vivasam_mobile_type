import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import Slider from "react-slick";
import { Event, EventAllPopup } from 'components/main'
import './AiPage.css';

class AiPage extends Component{
    state = {
        tabArr: ['왜 미래 사회를 여는\n입문서인가?', '인공지능 기초\n특장점', '수업 지원\n자료'],
        onIdx: 0,
    }

    onTabClick = idx => {
        this.setState({
            onIdx: idx
        })
    }

    render () {
        const { tabArr, onIdx } = this.state;
        
        //slick option 설정
        const settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            className: 'event_list'
        };

        return (
            <PageTemplate title='비상교육 고등 인공지능 기초' className="dd">
                <div className="textBookPromotion promo210528">
                    <div className="evtTitWrap">
                        <h1><img src="/images/textbookpromotion/hs_ai/img01.png" alt="‘가장 슬림한 수학 교과서’ 비상교육 고등 기본 수학" /></h1>
                        <p>인공지능의 기초 개념부터<br />풍성한 실습, 심화 학습까지<br />어려운 인공지능을 쉽게 풀어낸<br />고등 인공지능 기초 교과서</p>
                        <a href="https://dn.vivasam.com/VS/EBOOK/고등인공지능기초MO/index.html" target="_blank" title="새창열림" className="btnPreview"><img src="/images/textbookpromotion/hs_ai/btn_preview.png" alt="특장점 미리보기" /></a>
                    </div>
                    <div className="evtTabWrap">
                        <div className="btnTabWrap">
                            {
                                tabArr.map( (item, idx) => {
                                    return (
                                        <button type="button" key={`btnTab${idx}`} className={`btnTab${idx === onIdx ? ' on' : ''}`} onClick={ () => this.onTabClick(idx) }>{ item }</button>
                                    )
                                })
                            }
                        </div>
                        <div className="tabContWrap">
                            <div className="evtTab1" style={{ display: onIdx == 0 ? 'block' : 'none' }}>
                                <h2 className="imgWrap"><img src="/images/textbookpromotion/hs_ai/evt01_01.png" alt="왜 미래 사회를 여는 입문서인가?" /></h2>
                                <ul className="introList">
                                    <li>
                                        <strong>전문가의 노하우를 쏙쏙!</strong>
                                        <p>인공지능 교육 전문가의 현장 맞춤형으로 쉽고 재밌게 구성!</p>
                                    </li>
                                    <li>
                                        <strong>기초부터 심화까지 원스톱!</strong>
                                        <p>개념 학습, 실습, 심화 보충 학습이 한번에!</p>
                                    </li>
                                    <li>
                                        <strong>재밌는 프로젝트 경험 제공</strong>
                                        <p>실생활 연계 프로젝트로 학생 흥미와 동기부여를 쭉쭉!</p>
                                    </li>
                                </ul>
                                <strong className="writerTit"><img src="/images/textbookpromotion/hs_ai/evt01_02.png" alt="인공지능 분야의 교육전문가가 모두 모였다! 고등 인공지능 기초 교과서 집필진" /></strong>
                                <ul className="writerList">
                                    <li>
                                        <span className="imgWrap"><img src="/images/textbookpromotion/hs_ai/writer01.png" alt="임희석(대표저자)" /></span>
                                        <div className="txtWrap">
                                            <strong>임희석(대표저자)</strong>
                                            <p>고려대학교 컴퓨터학과 교수</p>
                                            <p>고려대학교 Human-inspired AI 연구소장</p>
                                            <p>2015 개정 중학교, 고등학교 정보 교과서<br />(비상교육) 대표 저자</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span className="imgWrap"><img src="/images/textbookpromotion/hs_ai/writer02.png" alt="김형기" /></span>
                                        <div className="txtWrap">
                                            <strong>김형기</strong>
                                            <p>인하대학교 사범대학 부속중학교 교사</p>
                                            <p>EBS 인공지능 첫걸음 지도 강사</p>
                                            <p>2015 개정 중학교 정보 교과서 (비상교육) 집필</p>
                                            <p>중학교 인공지능과 미래 사회(서울교과서) 집필</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span className="imgWrap"><img src="/images/textbookpromotion/hs_ai/writer03.png" alt="김장환" /></span>
                                        <div className="txtWrap">
                                            <strong>김장환</strong>
                                            <p>함현고등학교 교사</p>
                                            <p>2015 개정 중학교 정보 교과서 (비상교육) 집필</p>
                                            <p>중학교 인공지능과 미래 사회 (서울교과서) 집필</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span className="imgWrap"><img src="/images/textbookpromotion/hs_ai/writer04.png" alt="조재춘" /></span>
                                        <div className="txtWrap">
                                            <strong>조재춘</strong>
                                            <p>한신대학교 컴퓨터공학부 교수</p>
                                            <p>한국컴퓨터교육학회 편집 부위원장 및 분과 위원장</p>
                                            <p>2015 개정 중학교 정보 교과서 (비상교육) 집필</p>
                                            <p>중학교 인공지능과 미래 사회 (서울교과서) 집필</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span className="imgWrap"><img src="/images/textbookpromotion/hs_ai/writer05.png" alt="서성원" /></span>
                                        <div className="txtWrap">
                                            <strong>서성원</strong>
                                            <p>마포고등학교 교사</p>
                                            <p>2015 개정 중학교 정보 교과서 (비상교육) 집필</p>
                                            <p>중학교 인공지능과 미래 사회 (서울교과서) 집필</p>
                                        </div>
                                    </li>
                                    <li>
                                        <span className="imgWrap"><img src="/images/textbookpromotion/hs_ai/writer06.png" alt="최정원" /></span>
                                        <div className="txtWrap">
                                            <strong>최정원</strong>
                                            <p>만월중학교 교사</p>
                                            <p>한국컴퓨터교육학회 이사</p>
                                            <p>알지오매스 기획자문위원(한국과학창의재단)</p>
                                            <p>중학교 인공지능과 미래 사회(서울교과서) 집필</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="evtTab2" style={{ display: onIdx == 1 ? 'block' : 'none' }}>
                                <Slider {...settings}>
                                    <div className="imgWrap"><img src="/images/textbookpromotion/hs_ai/swiper_cont01.png" alt="특장점1. 컴퓨팅 사고력을 키우는 창의/융합 프로젝트" /></div>
                                    <div className="imgWrap"><img src="/images/textbookpromotion/hs_ai/swiper_cont02.png" alt="특장점2. 실생활 사례로 쉽게 배우는 교과서" /></div>
                                    <div className="imgWrap"><img src="/images/textbookpromotion/hs_ai/swiper_cont03.png" alt="특장점3. 자기 주도 학습을 위한 '스스로' 코너" /></div>
                                    <div className="imgWrap"><img src="/images/textbookpromotion/hs_ai/swiper_cont04.png" alt="특장점4. 학습의 이해를 돕는 유형별 부록" /></div>
                                </Slider>
                            </div>
                            <div className="evtTab3" style={{ display: onIdx == 2 ? 'block' : 'none' }}>
                                <h2 className="imgWrap"><img src="/images/textbookpromotion/hs_ai/evt02_tit.png" alt="고등 인공지능 기초 수업 지원 자료" /></h2>
                                <div className="tblWrap">
                                    <table>
                                        <colgroup>
                                            <col style={{ width: '16.7%' }} />
                                            <col style={{ width: '22.3%' }} />
                                            <col style={{ width: '39.8%' }} />
                                            <col />
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th scope="col" colSpan="2">자료유형</th>
                                                <th scope="col">자료명</th>
                                                <th scope="col">자료 형식</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row" rowSpan="17">교과<br />자료</th>
                                                <th scope="row" rowSpan="5">공통 자료</th>
                                                <td>인공지능 기초 교육 과정</td>
                                                <td>PDF</td>
                                            </tr>
                                            <tr>
                                                <td>연간 지도안</td>
                                                <td>PDF</td>
                                            </tr>
                                            <tr>
                                                <td>지도서 총론</td>
                                                <td>PDF</td>
                                            </tr>
                                            <tr>
                                                <td>교과서 부록</td>
                                                <td>PDF</td>
                                            </tr>
                                            <tr>
                                                <td>프로그램 소스 파일</td>
                                                <td>ZIP</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" rowSpan="8">수업 자료</th>
                                                <td>교과서</td>
                                                <td>PDF, 한글</td>
                                            </tr>
                                            <tr>
                                                <td>교사용 교과서</td>
                                                <td>PDF</td>
                                            </tr>
                                            <tr>
                                                <td>지도서</td>
                                                <td>PDF</td>
                                            </tr>
                                            <tr>
                                                <td>수업 지도안</td>
                                                <td>한글</td>
                                            </tr>
                                            <tr>
                                                <td>수업 PPT</td>
                                                <td>PPT</td>
                                            </tr>
                                            <tr>
                                                <td>핵심 정리</td>
                                                <td>한글</td>
                                            </tr>
                                            <tr>
                                                <td>해 보기 활동지</td>
                                                <td>한글</td>
                                            </tr>
                                            <tr>
                                                <td>선택 활동 활동지</td>
                                                <td>한글</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" rowSpan="3">평가 자료</th>
                                                <td>중단원 평가</td>
                                                <td>한글</td>
                                            </tr>
                                            <tr>
                                                <td>대단원 평가</td>
                                                <td>한글</td>
                                            </tr>
                                            <tr>
                                                <td>시험 대비 평가</td>
                                                <td>한글</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">이미지 자료</th>
                                                <td>교과서 이미지</td>
                                                <td>JPG</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <ul className="linkList">
                                    <li><img src="/images/textbookpromotion/hs_ai/list_link01.png" alt="재학생 인터뷰로 만나는 생생한 정보 이야기 학과정보" /></li>
                                    <li><img src="/images/textbookpromotion/hs_ai/list_link02.png" alt="비상교육이 직접 제작한 200여 개 직업인 인터뷰 직업정보" /></li>
                                </ul>
                                <span>※ 학과 정보, 직업 정보는 PC 웹 페이지에서 확인해 주세요.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </PageTemplate>
        )
    }
}

export default withRouter(AiPage);
