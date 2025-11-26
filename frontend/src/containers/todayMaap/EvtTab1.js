import React, { Component } from 'react';

class EvtTab1 extends Component {

    render() {
        return (
            <div className="tabCont01">
                <ul className="infoList">
                    <li><strong>0.5 ~ 1차시 분량의 가벼운 활동지</strong>로 구성되어 있어요.</li>
                    <li><strong>대중음악, 창작 국악 등 다양한 장르</strong>의 음악으로 감수성을 길러요.</li>
                    <li>리코더 연습에 활용할 수 있는 <strong>난이도별 악보를 수록</strong>했어요.</li>
                </ul>
                <div className="gradeWrap">
                    <div className="gradeItem">
                        <span className="gradeTit">신나는 음악 수업 3~4학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab01_textbook01.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(0) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(0) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                    <div className="gradeItem">
                        <span className="gradeTit">신나는 음악 수업 5~6학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab01_textbook02.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(1) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(1) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EvtTab1;