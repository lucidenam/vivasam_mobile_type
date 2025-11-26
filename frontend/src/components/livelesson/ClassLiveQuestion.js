import React from 'react';
import { Link } from 'react-router-dom';

const live_download = (param, e) => {
    var width   = 647;
    var height  = 450;

    var left    = (width)/2;
    var top    = (height)/2;
    var url = "https://www.vivasam.com/down/vivasamdown.do";

    var newWindow = window.open("/fountain_html/autoReload.html", "downloadwin", "left="+left+",top="+top+",width="+width+", height="+height+",scrollbars=no,toolbar=no,resizable=no,location=no");

    if (!newWindow) return false;

    var html = "";
    html += "<html><head></head><body><form id='formid' method='post' action='" + url +"'>";
    html += "<input type='hidden' name='files' value='ID,"+param + "'/>";
    html += "<input type='hidden' name='ufiles' value=''/>";

    html += "</form><script type='text/javascript'>document.getElementById(\"formid\").submit()</sc"+"ript></body></html>";

    newWindow.document.write(html);
    return newWindow;
}

const ClassLiveQuestion = ({doDownload, doEbook}) => {
    return (
        <div>
            <section className="live_teaching">
                <h2 className="blind">질문이 살아있는 수업</h2>
                <div className="live_teaching_top">
                    <p className="live_teaching_intro">『수업디자인연구소』에서 ‘질문 기반 수업 디자인’을 연구하는 현장 교사들의 <em>교과별 수업 실천 사례</em>를 소개합니다.</p>
                </div>

                <div className="live_question">
                    <ul className="live_question_info">
                        <li>
                            <div className="tit">우리나라 최초의 질문 기반 수업 자료집</div>
                            수업의 핵심 질문을 기반으로 세부적인 설명과 활동지를 제시하여 <em>질문 중심의 수업을 쉽게 준비</em>할 수 있습니다.
                        </li>
                        <li>
                            <div className="tit">다양한 수업 모형</div>
                            하브루타, 협동 학습, PBL, 토의 및 토론 등 다양한 교수·학습 모형을 활용한 활동을 제공하여 <em>선생님이 자신의 스타일에 맞는 자료</em>를 선택할 수 있습니다
                        </li>
                        <li>
                            <div className="tit">현장 교사들이 만든 실제 수업 사례</div>
                            현장 경험이 풍부한 선생님들이 실제 학교에서 적용한 성과를 담아 <em>다양한 과목 수업에 바로 활용할 수 있게</em> 하였습니다.
                        </li>
                    </ul>
                    <div className="live_question_down">
                        <div className="data_book mid">
                            <h3 className="tit"><strong>중학</strong><span>국어, 수학, 사회, 도덕, 역사, 과학, 진로와 직업</span></h3>
                            <ul>
                                <li>
                                    <img src="/images/contents/question/book_mid_ko.png" alt="중학 국어" />
                                        <ul className="btn_set">
                                            <li>
                                                <a onClick={doEbook.bind(this, 'https://dn.vivasam.com/VS/LIVECLASS/ebook/questclass_ms_kor1/index.html')}
                                                   className="btn_ebook">E-BOOK</a>
                                            </li>
                                            <li>
                                                <button type="button" className="btn_down" onClick={doDownload.bind(this, 'CN030-264652')}>다운로드</button>
                                            </li>
                                        </ul>
                                </li>
                                <li>
                                    <img src="/images/contents/question/book_mid_ma.png" alt="중학 수학" />
                                        <ul className="btn_set">
                                            <li>
                                                <a onClick={doEbook.bind(this, 'https://dn.vivasam.com/VS/LIVECLASS/ebook/questclass_ms_mat1/index.html')}
                                                   className="btn_ebook">E-BOOK</a>
                                            </li>
                                            <li>
                                                <button type="button" className="btn_down" onClick={doDownload.bind(this, 'CN030-264655')}>다운로드</button>
                                            </li>
                                        </ul>
                                </li>
                                <li>
                                    <img src="/images/contents/question/book_mid_so.png" alt="중학 사회" />
                                        <ul className="btn_set">
                                            <li>
                                                <a onClick={doEbook.bind(this, 'https://dn.vivasam.com/VS/LIVECLASS/ebook/questclass_ms_soc1/index.html')}
                                                   className="btn_ebook">E-BOOK</a>
                                            </li>
                                            <li>
                                                <button type="button" className="btn_down" onClick={doDownload.bind(this, 'CN030-264654')}>다운로드</button>
                                            </li>
                                        </ul>
                                </li>
                                <li>
                                    <img src="/images/contents/question/book_mid_mn.png" alt="중학 도덕" />
                                        <ul className="btn_set">
                                            <li>
                                                <a onClick={doEbook.bind(this, 'https://dn.vivasam.com/VS/LIVECLASS/ebook/questclass_ms_eth/index.html')}
                                                   className="btn_ebook">E-BOOK</a>
                                            </li>
                                            <li>
                                                <button type="button" className="btn_down" onClick={doDownload.bind(this, 'CN030-264653')}>다운로드</button>
                                            </li>
                                        </ul>
                                </li>
                                <li>
                                    <img src="/images/contents/question/book_mid_hs.png" alt="중학 역사" />
                                        <ul className="btn_set">
                                            <li>
                                                <a onClick={doEbook.bind(this, 'https://dn.vivasam.com/VS/LIVECLASS/ebook/questclass_ms_his/index.html')}
                                                   className="btn_ebook">E-BOOK</a>
                                            </li>
                                            <li>
                                                <button type="button" className="btn_down" onClick={doDownload.bind(this, 'CN030-264656')}>다운로드</button>
                                            </li>
                                        </ul>
                                </li>
                                <li>
                                    <img src="/images/contents/question/book_mid_sc.png" alt="중학 과학" />
                                        <ul className="btn_set">
                                            <li>
                                                <a onClick={doEbook.bind(this, 'https://dn.vivasam.com/VS/LIVECLASS/ebook/questclass_ms_scn1/index.html')}
                                                   className="btn_ebook">E-BOOK</a>
                                            </li>
                                            <li>
                                                <button type="button" className="btn_down" onClick={doDownload.bind(this, 'CN030-264651')}>다운로드</button>
                                            </li>
                                        </ul>
                                </li>
                                <li>
                                    <img src="/images/contents/question/book_mid_job.png" alt="중학 진로와 직업" />
                                        <ul className="btn_set">
                                            <li>
                                                <a onClick={doEbook.bind(this, 'https://dn.vivasam.com/VS/LIVECLASS/ebook/questclass_ms_job/index.html')}
                                                   className="btn_ebook">E-BOOK</a>
                                            </li>
                                            <li>
                                                <button type="button" className="btn_down" onClick={doDownload.bind(this, 'CN030-264657')}>다운로드</button>
                                            </li>
                                        </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ClassLiveQuestion;
