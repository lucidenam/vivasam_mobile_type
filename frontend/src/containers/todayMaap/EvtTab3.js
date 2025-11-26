import React, { Component } from 'react';

class EvtTab3 extends Component {
    render() {
        return (
            <div className="tabCont03">
                <ul className="infoList">
                    <li><strong>수업 현장에서 쉽게 활용할 수 있는 놀이</strong>로 구성되어 있어요.</li>
                    <li><strong>학생들의 몸과 마음을 건강하게</strong> 할 수 있는 활동이에요.</li>
                    <li><strong>공간, 시간, 인원 상관 없이 </strong>자유롭게 활용할 수 있어요.</li>
                </ul>
                <div className="gradeWrap">
                    <div className="gradeItem">
                        <span className="gradeTit">즐거운 체육 수업 3~4학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab03_textbook01.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(6) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(6) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                    <div className="gradeItem">
                        <span className="gradeTit">즐거운 체육 수업 5~6학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab03_textbook02.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(7) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(7) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EvtTab3;