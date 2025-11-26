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

const VisualThinking = ({doDownload}) => {
    return (
        <div>
            <section className="live_teaching">
                <h2 className="blind">창체·수업연구</h2>
                <div className="live_teaching_top">
                    <p className="live_teaching_intro">'비주얼리터러시연구소'에서 비주얼싱킹 수업을 연구하는 <em>19명의 선생님들의 생생한 수업 지도 사례</em>와 노하우를 소개합니다.</p>
                </div>

                <div className="live_teaching_wrap">
                    <ul className="live_teaching_box">
                        <li className="live_teaching_list"><em className="live_marker">01부</em>시각적 사고와 소통​</li>
                        <li className="live_teaching_list"><em className="live_marker">02부</em>메타인지 훈련​</li>
                        <li className="live_teaching_list"><em className="live_marker">03부</em>비주얼싱킹 수업 사례</li>
                    </ul>

                    <div className="live_download">


                        <div className="live_download_list type2">
                            <h3 className="live_download_tit">중등편</h3>
                            <br/>
                            <div className="live_download_img">
                                <img src="images/common/livebook2.jpg" alt="" />
                            </div>
                            <button className="live_download_link" onClick={doDownload.bind(this, 'CN030-206224')}>자료집 다운로드</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VisualThinking;
