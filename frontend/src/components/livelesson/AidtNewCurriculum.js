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

const AidtNewCurriculum = ({doDownload, doEbook, tabCtrl, onIdx, onClickTab}) => {
    return (
        <section className="live_teaching live_aidt">
            <div className="live_teaching_top">
                <p className="live_teaching_intro">
                    <span>2022 개정 교육과정 완벽 대비!</span><br/>
                    새 교육과정의 핵심을 콕콕 짚은 자료집을 만나 보세요.
                </p>
            </div>
            <div className="guideline"/>
            <div className="live_teaching_wrap">
                <div className="live_download">
                    <div className="txt">
                        <ul className="list_dot">
                            {/*<li><span>AI 디지털교과서</span>가 무엇인지, 어떤 교과가 언제부터 현장에 적용되는지 소개합니다.</li>*/}
                            <li><span>2022 개정 교육과정의 주요 변화</span>를 학교급별, 교과별로 친절하게 안내합니다.</li>
                            <li><span>초등 자율 시간과 진로 연계 교육, 중고등 고교 학점제</span>에 대해서도 살펴보실 수 있습니다.</li>
                        </ul>
                        <div className="btn_wrap">
                            {/*<button onClick={doEbook.bind(this, 'https://dn.vivasam.com/vs/aidt2022/0531%20%EC%A4%91%EA%B3%A0%EB%93%B1_22%EA%B0%9C%EC%A0%95%EA%B5%90%EC%9C%A1%EA%B3%BC%EC%A0%95_AI%EB%94%94%EC%A7%80%ED%84%B8%20%EA%B5%90%EA%B3%BC%EC%84%9C/index.html')}
                                    className="live_download_link btn_ebook">
                                E-book<span/>
                            </button>*/}
                            <button onClick={doDownload.bind(this, 'CN030-264652')} className="live_download_link btn_down">
                                자료집 다운로드<span/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="tabWrap">
                   {/* <div className="btnTabWrap">
                        {
                            tabCtrl.map((item, idx) => {
                                return (
                                    <button
                                        type="button"
                                        className={`btnTab${onIdx === idx ? ' on' : ''}`}
                                        key={`btnTab${idx}`}
                                        onClick={() => onClickTab(idx)}
                                    >{ item }</button>
                                )
                            })
                        }
                    </div>*/}
                    <div className="tabContWrap">
                        {/*<div className={`tabCont${onIdx === 0 ? ' on' : ''}`}>
                            <div className="introWrap">
                                <span className="tit">AI 디지털교과서의 모든 것</span>
                                <p>
                                    <strong>AI 디지털교과서는 2022 개정 교육과정부터 처음 도입되는 소프트웨어 형태의 교과서</strong>입니다.<br />
                                    AI 디지털교과서란 무엇이고, 언제부터 어떤 교과에 적용될까요?<br />
                                    정의와 적용 일정, 핵심 서비스는 물론, 자주 묻는 질문과 도움 자료까지!<br />
                                    <strong>AI 디지털교과서의 모든 것</strong>을 알려 드립니다.
                                </p>
                            </div>
                            <div className="infoWrap">
                                <span className="tit">AI 디지털교과서의 정의</span>
                                <p>
                                    AI 디지털교과서는 인공지능을 포함한 지능 정보 기술을 활용하여,
                                    다양한 학습 자료, 학습 지원 기능 등을<br />
                                    탑재한 소프트웨어 형태의 교과서입니다.<br />
                                    학생 개인의 능력과 수준에 맞는 다양한 맞춤형 학습 기회를 지원합니다.
                                </p>
                            </div>
                            <div className="imgWrap">
                                <div className="imgItem">
                                    <img src="/images/tr/aidt/img_tab1_1.png" alt="" />
                                    <p className="icoBul">AI 디지털교과서란 무엇인지 알 수 있습니다.</p>
                                </div>
                                <div className="imgItem">
                                    <img src="/images/tr/aidt/img_tab1_2.png" alt="" />
                                    <p className="icoBul">AI 디지털교과서가 개발되는 교과와 현장 적용 일정을 확인할 수 있습니다.</p>
                                </div>
                                <div className="imgItem">
                                    <img src="/images/tr/aidt/img_tab1_3.png" alt="" />
                                    <p className="icoBul">AI 디지털교과서의 특성과 핵심 서비스를 살펴볼 수 있습니다.</p>
                                </div>
                            </div>
                        </div>*/}
                        <div className={`tabCont mt0${onIdx === 1 ? ' on' : ''}`}>
                            <div className="introWrap">
                                <span className="tit">2022 개정 교육과정의 모든 것</span>
                                <p>
                                    <strong>2022 개정 교육과정</strong>은 2022년 12월 발표되어, 2024년부터 현장에 순차적으로 적용되고 있습니다.<br />
                                    2015 개정 교육과정과 <strong>어떻게 달라졌을까요?</strong><br />
                                    학교급별·교과별 주요 변화는 물론, 고교 학점제 운영 방안까지!<br />
                                    <strong>2022 개정 교육과정의 모든 것</strong>을 알려 드립니다.
                                </p>
                            </div>
                            <div className="infoWrap pd0">
                                <span className="tit">2022 개정 교육과정 적용 시기</span>
                                <p><img src="/images/tr/aidt/img_tab2_1.png" alt="" /></p>
                            </div>
                            <div className="imgWrap">
                                <div className="imgItem">
                                    <img src="/images/tr/aidt/img_tab2_2.png" alt="" />
                                    <p className="icoBul">이전 교육과정과 새 교육과정을 한눈에 비교할 수 있습니다.</p>
                                </div>
                                <div className="imgItem">
                                    <img src="/images/tr/aidt/img_tab2_3.png" alt="" />
                                    <p className="icoBul">중·고등학교 전체 교육과정이 어떻게 바뀌는지 살펴볼 수 있습니다.</p>
                                </div>
                                <div className="imgItem">
                                    <img src="/images/tr/aidt/img_tab2_4.png" alt="" />
                                    <p className="icoBul">중·고등학교 ‘국어/사회/역사/도덕/수학/과학/기술·가정/정보/체육/음악/미술/영어/한문/진로와 직업/교양’ 교과가 어떻게 바뀌는지 알 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AidtNewCurriculum;
